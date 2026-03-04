from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.hash import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'wedding-secret-key-2024')
JWT_ALGORITHM = 'HS256'

security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class Companion(BaseModel):
    name: str
    age: Optional[int] = None
    relation: Optional[str] = None  # parente, filho(a), noivo(a), etc

class GuestCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    guestType: str  # "Amigo(a)" ou "Parente"
    companions: List[Companion] = []

class Guest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    guestType: Optional[str] = "Amigo(a)"  # Default para dados antigos
    companions: List[Companion] = []
    confirmed: bool = True
    selectedGifts: List[str] = []
    message: Optional[str] = None  # Manter para dados antigos
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

class VaquinhaCreate(BaseModel):
    title: str
    description: Optional[str] = None
    goal: float
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
    # Simple hardcoded admin check (can be improved with database)
    admin_id = os.environ.get('ADMIN_ID', 'noivos2024')
    admin_password = os.environ.get('ADMIN_PASSWORD', 'casamento123')
    
    if login_data.adminId == admin_id and login_data.password == admin_password:
        # Create JWT token
        token_data = {
            'adminId': login_data.adminId,
            'exp': datetime.now(timezone.utc) + timedelta(days=7)
        }
        token = jwt.encode(token_data, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return AdminLoginResponse(token=token, message="Login realizado com sucesso")
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")

# ============ GUEST ROUTES ============

@api_router.post("/guests", response_model=Guest)
async def create_guest(guest_input: GuestCreate):
    guest_dict = guest_input.model_dump()
    guest_obj = Guest(**guest_dict)
    
    doc = guest_obj.model_dump()
    doc['createdAt'] = doc['createdAt'].isoformat()
    
    await db.guests.insert_one(doc)
    return guest_obj

@api_router.get("/guests", response_model=List[Guest])
async def get_guests(admin: dict = Depends(verify_admin_token)):
    guests = await db.guests.find({}, {"_id": 0}).to_list(1000)
    
    for guest in guests:
        if isinstance(guest.get('createdAt'), str):
            guest['createdAt'] = datetime.fromisoformat(guest['createdAt'])
    
    return guests

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
async def claim_gift(gift_id: str, guest_id: str, guest_name: str):
    gift = await db.gifts.find_one({"id": gift_id}, {"_id": 0})
    if not gift:
        raise HTTPException(status_code=404, detail="Presente não encontrado")
    
    if gift.get('isTaken'):
        raise HTTPException(status_code=400, detail="Este presente já foi escolhido")
    
    await db.gifts.update_one(
        {"id": gift_id},
        {"$set": {"isTaken": True, "takenBy": guest_id, "takenByName": guest_name}}
    )
    
    return {"message": "Presente reservado com sucesso"}

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

# ============ WEDDING INFO ROUTES ============

@api_router.get("/wedding-info", response_model=WeddingInfo)
async def get_wedding_info():
    info = await db.wedding_info.find_one({"id": "wedding-info"}, {"_id": 0})
    if not info:
        # Return default empty info
        default_info = WeddingInfo()
        return default_info
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

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()