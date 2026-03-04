# 💍 App de Gestão de Casamento

Um lindo aplicativo de gestão de casamento com estética de carta de convite, desenvolvido com React, FastAPI e MongoDB.

## 🎨 Características

### Interface Pública (Convidados)
- **Convite Digital Elegante**: Landing page com estética de carta de casamento
- **Formulário RSVP Multi-Step**: 
  - Passo 1: Informações pessoais (nome, email, telefone)
  - Passo 2: Adicionar acompanhantes (com nome e idade)
  - Passo 3: Mensagem opcional para o casal
- **Lista de Presentes**: Convidados podem escolher presentes para presentear
- **Vaquinhas**: Sistema de crowdfunding para objetivos específicos (ex: "Vaquinha para o Sofá")
- **Doações via PIX**: QR Code e chave PIX para doações gerais

### Painel Administrativo (Noivos)
- **Dashboard de Convidados**: Visualização de todos os convidados confirmados
- **Gestão de Presentes**: Adicionar, editar e deletar itens da lista de presentes
- **Gestão de Vaquinhas**: Criar e gerenciar múltiplas vaquinhas com metas e progresso
- **Configurações do Casamento**: Gerenciar data, horário, local, mensagem e informações de PIX

## 🚀 Acesso

### Para Convidados
Acesse: `https://casamento-presentes-1.preview.emergentagent.com`

### Para Administradores (Noivos)
1. Acesse: `https://casamento-presentes-1.preview.emergentagent.com/admin`
2. Credenciais padrão:
   - **ID**: `noivos2024`
   - **Senha**: `casamento123`

⚠️ **IMPORTANTE**: Altere essas credenciais nas variáveis de ambiente em `/app/backend/.env`:
```env
ADMIN_ID="seu_id_personalizado"
ADMIN_PASSWORD="sua_senha_segura"
```

## 📱 Como Usar

### Para os Noivos (Admin)

1. **Primeiro Acesso**:
   - Acesse o painel admin
   - Vá em "Configurações"
   - Preencha as informações do casamento (data, local, mensagem)
   - Configure a chave PIX para doações gerais

2. **Adicionar Presentes**:
   - Vá em "Presentes"
   - Clique em "Adicionar Presente"
   - Preencha nome, descrição, preço e URL da imagem
   - Os presentes aparecerão automaticamente para os convidados

3. **Criar Vaquinhas**:
   - Vá em "Vaquinhas"
   - Clique em "Nova Vaquinha"
   - Defina título, descrição, meta e informações de PIX
   - Acompanhe o progresso de cada vaquinha

4. **Ver Convidados**:
   - Vá em "Convidados"
   - Veja todos que confirmaram presença
   - Visualize acompanhantes e mensagens deixadas

### Para os Convidados

1. **Confirmar Presença**:
   - Acesse o link do convite
   - Clique em "Confirmar Presença"
   - Preencha seus dados
   - Adicione acompanhantes se necessário
   - Deixe uma mensagem carinhosa (opcional)

2. **Escolher Presentes**:
   - Após confirmar presença, você verá a lista de presentes
   - Clique em "Presentear" no item desejado
   - O presente ficará marcado como escolhido

3. **Contribuir com Vaquinhas**:
   - Acesse a aba "Vaquinhas"
   - Veja as diferentes campanhas
   - Use o PIX/QR Code para fazer sua contribuição

## 🎨 Design

O app utiliza uma paleta de cores inspirada em convites de casamento:
- **Azul Royal Pastel**: `#5D7B93`
- **Dourado**: `#C5A065`
- **Verde Sage**: `#8F9E8B`
- **Tons Creme**: `#FDFCF8`, `#F7F5F0`

**Tipografia**:
- Títulos: Cormorant Garamond (elegante e serif)
- Texto: Lato (clean e legível)
- Acentos: Great Vibes (script cursivo)

## 🔧 Tecnologias

- **Frontend**: React 19, Tailwind CSS, Framer Motion, Shadcn/UI
- **Backend**: FastAPI, Motor (MongoDB async), JWT Authentication
- **Database**: MongoDB
- **Deployment**: Emergent Platform

## 📊 Estrutura de Dados

### Convidado (Guest)
```json
{
  "id": "uuid",
  "name": "Nome Completo",
  "email": "email@exemplo.com",
  "phone": "(00) 00000-0000",
  "companions": [
    { "name": "Acompanhante", "age": 25 }
  ],
  "message": "Mensagem para o casal",
  "confirmed": true
}
```

### Presente (Gift)
```json
{
  "id": "uuid",
  "name": "Nome do Presente",
  "description": "Descrição",
  "imageUrl": "https://...",
  "price": "R$ 150,00",
  "isTaken": false,
  "takenBy": "guest_id",
  "takenByName": "Nome do Convidado"
}
```

### Vaquinha (Vaquinha)
```json
{
  "id": "uuid",
  "title": "Vaquinha para o Sofá",
  "description": "Ajude a gente...",
  "goal": 5000.00,
  "currentAmount": 0.00,
  "pixKey": "chave@pix.com",
  "qrCodeUrl": "https://..."
}
```

## 🔐 Segurança

- Autenticação JWT para rotas administrativas
- Proteção de rotas sensíveis
- Validação de dados com Pydantic
- CORS configurado adequadamente

## 📝 Notas Importantes

1. **QR Codes PIX**: Você pode gerar QR Codes estáticos pelo app do seu banco e adicionar a URL da imagem
2. **Imagens de Presentes**: Use URLs de imagens hospedadas (Imgur, Google Drive, etc.)
3. **Backup**: Todos os dados ficam salvos no MongoDB - faça backups regulares
4. **Personalização**: Você pode personalizar cores e fontes em `/app/frontend/tailwind.config.js`

## 🎉 Próximas Melhorias Sugeridas

- Envio automático de lembretes por email
- Exportar lista de convidados em Excel/CSV
- Galeria de fotos do casal
- Contador regressivo para o casamento
- Integração com Google Calendar para convidados
- Sistema de comentários e depoimentos

## 💝 Aproveite seu grande dia!

Este app foi criado com muito carinho para tornar a gestão do seu casamento mais fácil e elegante. Desejamos todo o sucesso e felicidade! 💍✨
