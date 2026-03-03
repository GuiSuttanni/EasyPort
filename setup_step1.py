import os, json

BASE = r'c:\Teste\Catalogo'

def wf(rel_path, content):
    full_path = os.path.join(BASE, *rel_path.split('/'))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print(f'  Criado: {rel_path}')

print('Iniciando setup...')

# apps/api/package.json
wf('apps/api/package.json', json.dumps({
  "name": "api",
  "version": "1.0.0",
  "private": True,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "type-check": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "@fastify/cors": "^9.0.1",
    "@fastify/helmet": "^11.1.1",
    "@fastify/jwt": "^8.0.1",
    "@fastify/multipart": "^8.3.0",
    "@fastify/rate-limit": "^9.1.0",
    "@prisma/client": "^5.15.0",
    "bcryptjs": "^2.4.3",
    "cloudinary": "^2.3.1",
    "dayjs": "^1.11.11",
    "fastify": "^4.28.1",
    "fastify-plugin": "^4.5.1",
    "uuid": "^10.0.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20.14.0",
    "@types/uuid": "^10.0.0",
    "prisma": "^5.15.0",
    "tsx": "^4.15.7",
    "typescript": "^5.4.5"
  }
}, indent=2))

print('package.json da API criado!')
