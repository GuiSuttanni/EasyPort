import os
BASE = r'c:\Teste\Catalogo'
def wf(rel, content):
    p = os.path.join(BASE, *rel.split('/'))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8', newline='\n').write(content)
    print(f'  OK: {rel}')

wf('packages/shared/package.json', """{
  "name": "@catalogo/shared",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "typescript": "^5.4.5"
  }
}
""")

wf('packages/shared/tsconfig.json', """{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "outDir": "./dist"
  },
  "include": ["src"]
}
""")

wf('packages/shared/src/index.ts', """export * from './schemas';
export * from './types';
""")

wf('packages/shared/src/types.ts', """export type MediaType = 'IMAGE' | 'VIDEO';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Media {
  id: string;
  url: string;
  publicId: string;
  type: MediaType;
  caption?: string;
  order: number;
  width?: number;
  height?: number;
  duration?: number;
  projectId?: string;
  catalogId: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  order: number;
  catalogId: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  order: number;
  isFeatured: boolean;
  catalogId: string;
  categoryId?: string;
  category?: Category;
  media?: Media[];
}

export interface Catalog {
  id: string;
  slug: string;
  name: string;
  description?: string;
  story?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  logoUrl?: string;
  logoPulicId?: string;
  coverUrl?: string;
  coverPublicId?: string;
  isPublished: boolean;
  userId: string;
  categories?: Category[];
  projects?: Project[];
  media?: Media[];
}
""")

wf('packages/shared/src/schemas.ts', """import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  businessName: z.string().min(2),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateCatalogSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  story: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  address: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  facebook: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
  isPublished: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateCatalogInput = z.infer<typeof updateCatalogSchema>;
""")

wf('README.md', """# Catalogo Digital

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
""")

print('=== Shared package e README criados ===')
