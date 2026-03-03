import os, sys
BASE = r'c:\Teste\Catalogo'
def wf(rel_path, content):
    full_path = os.path.join(BASE, *rel_path.replace('/',os.sep).split(os.sep))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print(f'  OK: {rel_path}')
print('=== BACKEND ===')
wf('apps/api/tsconfig.json', """{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
""")
wf('apps/api/.env.example', """# Banco de dados (Neon, Supabase ou local)
DATABASE_URL="postgresql://user:password@localhost:5432/catalogo_db?schema=public"

# JWT Secrets (gere com: openssl rand -base64 64)
JWT_ACCESS_SECRET="seu_access_secret_muito_seguro_aqui"
JWT_REFRESH_SECRET="seu_refresh_secret_muito_seguro_aqui"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Cloudinary (https://cloudinary.com)
CLOUDINARY_CLOUD_NAME="seu_cloud_name"
CLOUDINARY_API_KEY="sua_api_key"
CLOUDINARY_API_SECRET="seu_api_secret"

# Servidor
PORT=3001
NODE_ENV=development

# CORS - URL do frontend
CORS_ORIGIN="http://localhost:3000"
""")
print('tsconfig e .env criados')
