# Catalogo Digital

Sistema completo de catalogo online para prestadores de servico.

## Stack

- **Frontend**: Next.js 15 + React 19 + Tailwind CSS + Framer Motion
- **Backend**: Fastify v4 + TypeScript + Prisma + PostgreSQL
- **Storage**: Cloudinary (imagens e videos)
- **Auth**: JWT (access + refresh tokens)
- **Monorepo**: Turborepo

## Estrutura

```
catalogo/
 apps/
    api/          # Backend Fastify
    web/          # Frontend Next.js
 packages/
     shared/       # Tipos e schemas compartilhados
```

## Configuracao

### Requisitos

- Node.js >= 18
- PostgreSQL (ou conta Neon.tech)
- Conta Cloudinary
- npm >= 9

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variaveis de ambiente

**Backend** (`apps/api/.env`):
```
DATABASE_URL="postgresql://user:pass@host:5432/catalogo"
JWT_SECRET="seu-segredo-super-seguro-aqui"
JWT_REFRESH_SECRET="outro-segredo-para-refresh"
CLOUDINARY_CLOUD_NAME="seu_cloud"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="seu_api_secret"
PORT=3001
```

**Frontend** (`apps/web/.env.local`):
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Configurar banco de dados

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Rodar em desenvolvimento

```bash
# Na raiz do monorepo
npm run dev
```

Isso inicia simultaneamente:
- API em http://localhost:3001
- Frontend em http://localhost:3000

## Deploy

### API (Railway)

1. Conecte o repositorio no Railway
2. Configure as variaveis de ambiente
3. O Railway detectara automaticamente o Dockerfile ou usara o buildpack Node.js
4. Adicione o comando de start: `cd apps/api && npm start`

### Frontend (Vercel)

1. Importe o repositorio no Vercel
2. Configure `Root Directory` como `apps/web`
3. Adicione `NEXT_PUBLIC_API_URL` apontando para a URL da API no Railway

### Banco de dados (Neon)

1. Crie um projeto em neon.tech
2. Copie a Connection String
3. Use como `DATABASE_URL` no Railway

## Rotas da API

| Metodo | Rota | Auth | Descricao |
|--------|------|------|-----------|
| POST | /auth/register | - | Cadastro |
| POST | /auth/login | - | Login |
| POST | /auth/refresh | - | Renovar token |
| GET | /auth/me | JWT | Dados do usuario |
| GET | /catalog/me | JWT | Meu catalogo |
| PUT | /catalog/me | JWT | Editar catalogo |
| GET | /catalog/dashboard/stats | JWT | Estatisticas |
| GET | /catalog/public/:slug | - | Catalogo publico |
| GET | /categories | JWT | Listar categorias |
| POST | /categories | JWT | Criar categoria |
| PUT | /categories/:id | JWT | Editar categoria |
| DELETE | /categories/:id | JWT | Deletar categoria |
| GET | /projects | JWT | Listar projetos |
| POST | /projects | JWT | Criar projeto |
| PUT | /projects/:id | JWT | Editar projeto |
| DELETE | /projects/:id | JWT | Deletar projeto |
| GET | /media | JWT | Listar midias |
| POST | /media/upload | JWT | Enviar midia |
| DELETE | /media/:id | JWT | Deletar midia |

## Paginas

| URL | Descricao |
|-----|-----------|
| /login | Login do proprietario |
| /register | Cadastro |
| /dashboard | Painel principal |
| /catalogo | Editar informacoes |
| /projetos | Gerenciar projetos |
| /midia | Upload de fotos/videos |
| /categorias | Gerenciar categorias |
| /configuracoes | Configuracoes da conta |
| /c/:slug | **Vitrine publica** |
