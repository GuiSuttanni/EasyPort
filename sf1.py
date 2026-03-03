import os, json
BASE = r'c:\Teste\Catalogo'
def wf(rel, content):
    p = os.path.join(BASE, *rel.split('/'))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8', newline='\n').write(content)
    print(f'  OK: {rel}')

wf('apps/web/package.json', json.dumps({
  "name": "web",
  "version": "1.0.0",
  "private": True,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-query": "^5.51.1",
    "@tanstack/react-query-devtools": "^5.51.1",
    "zustand": "^4.5.4",
    "axios": "^1.7.2",
    "framer-motion": "^11.3.8",
    "react-hook-form": "^7.52.1",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.8",
    "react-dropzone": "^14.2.3",
    "embla-carousel-react": "^8.1.7",
    "embla-carousel-autoplay": "^8.1.7",
    "lucide-react": "^0.408.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.4.0",
    "class-variance-authority": "^0.7.0",
    "date-fns": "^3.6.0",
    "sonner": "^1.5.0",
    "next-themes": "^0.3.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-textarea": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.2"
  },
  "devDependencies": {
    "@types/node": "^20.14.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.4.5",
    "tailwindcss": "^3.4.6",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.39",
    "eslint": "^8",
    "eslint-config-next": "15.1.0",
    "prettier": "^3.3.0",
    "prettier-plugin-tailwindcss": "^0.6.5"
  }
}, indent=2))

wf('apps/web/tsconfig.json', """{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
""")

wf('apps/web/postcss.config.js', """module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
""")

wf('apps/web/.env.example', """# URL do backend API
NEXT_PUBLIC_API_URL=http://localhost:3001

# URL base do frontend (para geração de links públicos)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Cloudinary (para upload direto - opcional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu_cloud_name
""")

print('=== Frontend config criado ===')
