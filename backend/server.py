from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import mimetypes
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.hash import bcrypt
import qrcode
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
from io import BytesIO
import base64
import unicodedata
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)

mimetypes.init()
mimetypes.add_type('image/webp', '.webp')
mimetypes.add_type('image/png', '.png')
mimetypes.add_type('image/jpeg', '.jpg')
mimetypes.add_type('image/jpeg', '.jpeg')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

cloudinary.config(
    cloud_name=os.environ.get('CLOUDINARY_CLOUD_NAME'),
    api_key=os.environ.get('CLOUDINARY_API_KEY'),
    api_secret=os.environ.get('CLOUDINARY_API_SECRET')
)

JWT_SECRET = os.environ.get('JWT_SECRET', 'wedding-secret-key-2024')
JWT_ALGORITHM = 'HS256'

security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

def normalize(text: str) -> str:
    """Remove acentos e coloca em minúsculo para busca tolerante."""
    return ''.join(
        c for c in unicodedata.normalize('NFD', text.lower())
        if unicodedata.category(c) != 'Mn'
    )

@api_router.get("/uploads/{filename}")
async def serve_upload(filename: str):
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    mime_type, _ = mimetypes.guess_type(str(file_path))
    if mime_type is None:
        mime_type = 'application/octet-stream'
    return FileResponse(file_path, media_type=mime_type)

# ============ MODELS ============

class MembroGrupo(BaseModel):
    nome: str
    confirmado: bool = False

class GrupoFamiliarCreate(BaseModel):
    nomeGrupo: str
    membros: List[str]  # só os nomes

class GrupoFamiliar(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nomeGrupo: str
    membros: List[MembroGrupo] = []
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ConfirmarGrupoRequest(BaseModel):
    membrosConfirmados: List[str]  # nomes dos membros que vão comparecer
    mensagem: Optional[str] = None

class NaoEncontradoCreate(BaseModel):
    nomeDigitado: str

class NaoEncontrado(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nomeDigitado: str
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    resolvido: bool = False

class GuestCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    guestType: str
    companions: List[dict] = []

class Guest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    guestType: Optional[str] = "Amigo(a)"
    companions: List[dict] = []
    confirmed: bool = True
    selectedGifts: List[str] = []
    message: Optional[str] = None
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GiftCreate(BaseModel):
    name: str
    description: Optional[str] = None
    imageUrl: Optional[str] = None
    price: Optional[str] = None

class Gift(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    imageUrl: Optional[str] = None
    price: Optional[str] = None
    isTaken: bool = False
    takenBy: Optional[str] = None
    takenByName: Optional[str] = None
    claimType: Optional[str] = None

class VaquinhaCreate(BaseModel):
    title: str
    description: Optional[str] = None
    goal: float
    currentAmount: Optional[float] = 0.0
    pixKey: Optional[str] = None
    qrCodeUrl: Optional[str] = None

class Vaquinha(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    goal: float
    currentAmount: float = 0.0
    pixKey: Optional[str] = None
    qrCodeUrl: Optional[str] = None

class WeddingInfoUpdate(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    coupleMessage: Optional[str] = None
    pixKey: Optional[str] = None
    qrCodeUrl: Optional[str] = None

class WeddingInfo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "wedding-info"
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    coupleMessage: Optional[str] = None
    pixKey: Optional[str] = None
    qrCodeUrl: Optional[str] = None

class AdminLogin(BaseModel):
    adminId: str
    password: str

class AdminLoginResponse(BaseModel):
    token: str
    message: str

# ============ AUTH HELPERS ============

async def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

# ============ ADMIN AUTH ROUTES ============

@api_router.post("/admin/login", response_model=AdminLoginResponse)
async def admin_login(login_data: AdminLogin):
    admin_id = os.environ.get('ADMIN_ID', 'noivos2024')
    admin_password = os.environ.get('ADMIN_PASSWORD', 'casamento123')
    if login_data.adminId == admin_id and login_data.password == admin_password:
        token_data = {
            'adminId': login_data.adminId,
            'exp': datetime.now(timezone.utc) + timedelta(days=7)
        }
        token = jwt.encode(token_data, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return AdminLoginResponse(token=token, message="Login realizado com sucesso")
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")

# ============ GRUPOS FAMILIARES ROUTES ============

@api_router.get("/grupos", response_model=List[GrupoFamiliar])
async def get_grupos(admin: dict = Depends(verify_admin_token)):
    grupos = await db.grupos.find({}, {"_id": 0}).to_list(1000)
    for g in grupos:
        if isinstance(g.get('createdAt'), str):
            g['createdAt'] = datetime.fromisoformat(g['createdAt'])
    return grupos

@api_router.post("/grupos", response_model=GrupoFamiliar)
async def create_grupo(grupo_input: GrupoFamiliarCreate, admin: dict = Depends(verify_admin_token)):
    membros = [MembroGrupo(nome=n) for n in grupo_input.membros]
    grupo = GrupoFamiliar(nomeGrupo=grupo_input.nomeGrupo, membros=membros)
    doc = grupo.model_dump()
    doc['createdAt'] = doc['createdAt'].isoformat()
    await db.grupos.insert_one(doc)
    return grupo

@api_router.put("/grupos/{grupo_id}", response_model=GrupoFamiliar)
async def update_grupo(grupo_id: str, grupo_input: GrupoFamiliarCreate, admin: dict = Depends(verify_admin_token)):
    grupo = await db.grupos.find_one({"id": grupo_id}, {"_id": 0})
    if not grupo:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")
    # Preserva confirmações já existentes ao editar
    confirmados = {m['nome']: m['confirmado'] for m in grupo.get('membros', [])}
    novos_membros = [
        {"nome": n, "confirmado": confirmados.get(n, False)}
        for n in grupo_input.membros
    ]
    await db.grupos.update_one(
        {"id": grupo_id},
        {"$set": {"nomeGrupo": grupo_input.nomeGrupo, "membros": novos_membros}}
    )
    grupo_atualizado = await db.grupos.find_one({"id": grupo_id}, {"_id": 0})
    if isinstance(grupo_atualizado.get('createdAt'), str):
        grupo_atualizado['createdAt'] = datetime.fromisoformat(grupo_atualizado['createdAt'])
    return GrupoFamiliar(**grupo_atualizado)

@api_router.delete("/grupos/{grupo_id}")
async def delete_grupo(grupo_id: str, admin: dict = Depends(verify_admin_token)):
    result = await db.grupos.delete_one({"id": grupo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")
    return {"message": "Grupo deletado com sucesso"}

@api_router.get("/grupos/buscar")
async def buscar_grupo(nome: str):
    """Busca pública — sem auth. Retorna grupos que têm membro com nome parecido."""
    termo = normalize(nome)
    todos = await db.grupos.find({}, {"_id": 0}).to_list(1000)
    resultados = []
    for grupo in todos:
        for membro in grupo.get('membros', []):
            if termo in normalize(membro['nome']):
                if isinstance(grupo.get('createdAt'), str):
                    grupo['createdAt'] = datetime.fromisoformat(grupo['createdAt'])
                resultados.append(grupo)
                break
    return resultados

@api_router.post("/grupos/{grupo_id}/confirmar")
async def confirmar_grupo(grupo_id: str, body: ConfirmarGrupoRequest):
    """Confirma presença de membros específicos do grupo."""
    grupo = await db.grupos.find_one({"id": grupo_id}, {"_id": 0})
    if not grupo:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")
    nomes_confirmados = [normalize(n) for n in body.membrosConfirmados]
    novos_membros = []
    for m in grupo['membros']:
        confirmado = normalize(m['nome']) in nomes_confirmados
        novos_membros.append({"nome": m['nome'], "confirmado": confirmado or m.get('confirmado', False)})
    update_data = {"membros": novos_membros}
    if body.mensagem:
        update_data["mensagem"] = body.mensagem
    await db.grupos.update_one({"id": grupo_id}, {"$set": update_data})
    # Retorna os membros confirmados para o frontend usar na tela de agradecimento
    confirmados_nomes = [m['nome'] for m in novos_membros if m['confirmado']]
    return {
        "message": "Presença confirmada com sucesso!",
        "grupoId": grupo_id,
        "nomeGrupo": grupo['nomeGrupo'],
        "confirmados": confirmados_nomes
    }

@api_router.put("/grupos/{grupo_id}/confirmar")
async def atualizar_confirmacao(grupo_id: str, body: ConfirmarGrupoRequest):
    """Atualiza presença — substitui completamente quem está confirmado."""
    grupo = await db.grupos.find_one({"id": grupo_id}, {"_id": 0})
    if not grupo:
        raise HTTPException(status_code=404, detail="Grupo não encontrado")
    nomes_confirmados = [normalize(n) for n in body.membrosConfirmados]
    novos_membros = []
    for m in grupo['membros']:
        confirmado = normalize(m['nome']) in nomes_confirmados
        novos_membros.append({"nome": m['nome'], "confirmado": confirmado})
    update_data = {"membros": novos_membros}
    if body.mensagem:
        update_data["mensagem"] = body.mensagem
    await db.grupos.update_one({"id": grupo_id}, {"$set": update_data})
    confirmados_nomes = [m['nome'] for m in novos_membros if m['confirmado']]
    return {
        "message": "Presença atualizada com sucesso!",
        "grupoId": grupo_id,
        "nomeGrupo": grupo['nomeGrupo'],
        "confirmados": confirmados_nomes
    }

# ============ NOTIFICAÇÕES — NOME NÃO ENCONTRADO ============

@api_router.post("/grupos/nao-encontrado")
async def registrar_nao_encontrado(body: NaoEncontradoCreate):
    """Registra quando alguém busca um nome que não está na lista."""
    doc = NaoEncontrado(nomeDigitado=body.nomeDigitado)
    d = doc.model_dump()
    d['createdAt'] = d['createdAt'].isoformat()
    await db.nao_encontrados.insert_one(d)
    return {"message": "Registrado"}

@api_router.get("/admin/notificacoes")
async def get_notificacoes(admin: dict = Depends(verify_admin_token)):
    docs = await db.nao_encontrados.find({"resolvido": False}, {"_id": 0}).to_list(1000)
    for d in docs:
        if isinstance(d.get('createdAt'), str):
            d['createdAt'] = datetime.fromisoformat(d['createdAt'])
    return docs

@api_router.delete("/admin/notificacoes/{notif_id}")
async def resolver_notificacao(notif_id: str, admin: dict = Depends(verify_admin_token)):
    result = await db.nao_encontrados.update_one(
        {"id": notif_id},
        {"$set": {"resolvido": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notificação não encontrada")
    return {"message": "Notificação resolvida"}

# ============ GUEST ROUTES (legado — mantido para histórico) ============

@api_router.get("/guests", response_model=List[Guest])
async def get_guests(admin: dict = Depends(verify_admin_token)):
    guests = await db.guests.find({}, {"_id": 0}).to_list(1000)
    for guest in guests:
        if isinstance(guest.get('createdAt'), str):
            guest['createdAt'] = datetime.fromisoformat(guest['createdAt'])
    return guests

@api_router.delete("/guests/{guest_id}")
async def delete_guest(guest_id: str, admin: dict = Depends(verify_admin_token)):
    result = await db.guests.delete_one({"id": guest_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Convidado não encontrado")
    return {"message": "Convidado deletado com sucesso"}

# ============ GIFT ROUTES ============

@api_router.get("/gifts", response_model=List[Gift])
async def get_gifts():
    gifts = await db.gifts.find({}, {"_id": 0}).to_list(1000)
    return gifts

@api_router.post("/gifts", response_model=Gift)
async def create_gift(gift_input: GiftCreate, admin: dict = Depends(verify_admin_token)):
    gift_obj = Gift(**gift_input.model_dump())
    doc = gift_obj.model_dump()
    await db.gifts.insert_one(doc)
    return gift_obj

@api_router.put("/gifts/{gift_id}/claim")
async def claim_gift(gift_id: str, guest_id: str, guest_name: str, claim_type: str = "physical"):
    gift = await db.gifts.find_one({"id": gift_id}, {"_id": 0})
    if not gift:
        raise HTTPException(status_code=404, detail="Presente não encontrado")
    if gift.get('isTaken'):
        raise HTTPException(status_code=400, detail="Este presente já foi escolhido")
    await db.gifts.update_one(
        {"id": gift_id},
        {"$set": {"isTaken": True, "takenBy": guest_id, "takenByName": guest_name, "claimType": claim_type}}
    )
    return {"message": "Presente reservado com sucesso"}

@api_router.delete("/gifts/{gift_id}/claim")
async def unclaim_gift(gift_id: str, admin: dict = Depends(verify_admin_token)):
    result = await db.gifts.update_one(
        {"id": gift_id},
        {"$set": {"isTaken": False, "takenBy": None, "takenByName": None, "claimType": None}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Presente não encontrado")
    return {"message": "Presente liberado com sucesso"}

@api_router.put("/gifts/{gift_id}")
async def update_gift(gift_id: str, gift_input: GiftCreate, admin: dict = Depends(verify_admin_token)):
    result = await db.gifts.update_one(
        {"id": gift_id},
        {"$set": gift_input.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Presente não encontrado")
    return {"message": "Presente atualizado com sucesso"}

@api_router.delete("/gifts/{gift_id}")
async def delete_gift(gift_id: str, admin: dict = Depends(verify_admin_token)):
    result = await db.gifts.delete_one({"id": gift_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Presente não encontrado")
    return {"message": "Presente deletado com sucesso"}

# ============ VAQUINHA ROUTES ============

@api_router.get("/vaquinhas", response_model=List[Vaquinha])
async def get_vaquinhas():
    vaquinhas = await db.vaquinhas.find({}, {"_id": 0}).to_list(1000)
    return vaquinhas

@api_router.post("/vaquinhas", response_model=Vaquinha)
async def create_vaquinha(vaquinha_input: VaquinhaCreate, admin: dict = Depends(verify_admin_token)):
    vaquinha_obj = Vaquinha(**vaquinha_input.model_dump())
    doc = vaquinha_obj.model_dump()
    await db.vaquinhas.insert_one(doc)
    return vaquinha_obj

@api_router.put("/vaquinhas/{vaquinha_id}")
async def update_vaquinha(vaquinha_id: str, vaquinha_input: VaquinhaCreate, admin: dict = Depends(verify_admin_token)):
    result = await db.vaquinhas.update_one(
        {"id": vaquinha_id},
        {"$set": vaquinha_input.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vaquinha não encontrada")
    return {"message": "Vaquinha atualizada com sucesso"}

@api_router.delete("/vaquinhas/{vaquinha_id}")
async def delete_vaquinha(vaquinha_id: str, admin: dict = Depends(verify_admin_token)):
    result = await db.vaquinhas.delete_one({"id": vaquinha_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vaquinha não encontrada")
    return {"message": "Vaquinha deletada com sucesso"}

# ============ DONATION ROUTES ============

class DonationRequest(BaseModel):
    vaquinha_id: str
    amount: float
    donor_name: Optional[str] = "Anônimo"

@api_router.post("/vaquinhas/{vaquinha_id}/donate")
async def register_donation(vaquinha_id: str, donation: DonationRequest):
    vaquinha = await db.vaquinhas.find_one({"id": vaquinha_id}, {"_id": 0})
    if not vaquinha:
        raise HTTPException(status_code=404, detail="Vaquinha não encontrada")
    new_amount = vaquinha.get('currentAmount', 0) + donation.amount
    await db.vaquinhas.update_one(
        {"id": vaquinha_id},
        {"$set": {"currentAmount": new_amount}}
    )
    return {
        "message": "Doação registrada com sucesso!",
        "newTotal": new_amount,
        "percentage": (new_amount / vaquinha['goal']) * 100
    }

@api_router.post("/generate-pix-qr")
async def generate_pix_qr(pix_key: str, amount: float, name: str = "Casal"):
    try:
        pix_payload = f"PIX|{pix_key}|{amount:.2f}|{name}"
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(pix_payload)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return {"qrCodeBase64": f"data:image/png;base64,{img_str}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar QR Code: {str(e)}")

# ============ WEDDING INFO ROUTES ============

@api_router.get("/wedding-info", response_model=WeddingInfo)
async def get_wedding_info():
    info = await db.wedding_info.find_one({"id": "wedding-info"}, {"_id": 0})
    if not info:
        return WeddingInfo()
    return WeddingInfo(**info)

@api_router.put("/wedding-info", response_model=WeddingInfo)
async def update_wedding_info(info_input: WeddingInfoUpdate, admin: dict = Depends(verify_admin_token)):
    update_data = {k: v for k, v in info_input.model_dump().items() if v is not None}
    if update_data:
        await db.wedding_info.update_one(
            {"id": "wedding-info"},
            {"$set": update_data},
            upsert=True
        )
    updated_info = await db.wedding_info.find_one({"id": "wedding-info"}, {"_id": 0})
    return WeddingInfo(**updated_info)

# ============ IMAGE UPLOAD ROUTE ============

@api_router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), admin: dict = Depends(verify_admin_token)):
    try:
        contents = await file.read()
        result = cloudinary.uploader.upload(contents, folder="casamento")
        return {"url": result["secure_url"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload: {str(e)}")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()