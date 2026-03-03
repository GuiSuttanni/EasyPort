import os
BASE = r'c:\Teste\Catalogo'
def wf(rel, content):
    p = os.path.join(BASE, *rel.split('/'))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8', newline='\n').write(content)
    print(f'  OK: {rel}')

wf('apps/api/src/index.ts', """import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { prismaPlugin } from './plugins/prisma';
import { cloudinaryPlugin } from './plugins/cloudinary';
import { authRoutes } from './modules/auth/auth.route';
import { catalogRoutes } from './modules/catalog/catalog.route';
import { categoryRoutes } from './modules/category/category.route';
import { projectRoutes } from './modules/project/project.route';
import { mediaRoutes } from './modules/media/media.route';

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    transport: process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  },
});

async function buildApp() {
  // Plugins de segurança e middleware
  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  await app.register(jwt, {
    secret: process.env.JWT_ACCESS_SECRET || 'default_secret_change_in_production',
    sign: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' },
  });

  await app.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
      files: 10,
    },
  });

  // Plugins customizados
  await app.register(prismaPlugin);
  await app.register(cloudinaryPlugin);

  // Healthcheck
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }));

  // Rotas
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(catalogRoutes, { prefix: '/catalog' });
  await app.register(categoryRoutes, { prefix: '/categories' });
  await app.register(projectRoutes, { prefix: '/projects' });
  await app.register(mediaRoutes, { prefix: '/media' });

  // Handler de erro global
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);

    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: 'Dados inválidos',
        details: error.validation,
      });
    }

    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        success: false,
        error: error.message,
      });
    }

    return reply.status(500).send({
      success: false,
      error: process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor'
        : error.message,
    });
  });

  return app;
}

async function main() {
  try {
    const server = await buildApp();
    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

    await server.listen({ port, host });
    console.log(`Servidor rodando em http://${host}:${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
""")

wf('apps/api/src/plugins/prisma.ts', """import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export const prismaPlugin = fp(async (fastify: FastifyInstance) => {
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error'],
  });

  await prisma.$connect();

  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect();
  });

  fastify.log.info('Prisma conectado ao banco de dados');
});
""")

wf('apps/api/src/plugins/cloudinary.ts', """import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';
import { v2 as cloudinary } from 'cloudinary';

declare module 'fastify' {
  interface FastifyInstance {
    cloudinary: typeof cloudinary;
  }
}

export const cloudinaryPlugin = fp(async (fastify: FastifyInstance) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  fastify.decorate('cloudinary', cloudinary);
  fastify.log.info('Cloudinary configurado');
});
""")

wf('apps/api/src/middleware/auth.middleware.ts', """import { FastifyRequest, FastifyReply } from 'fastify';

export interface JWTPayload {
  userId: string;
  email: string;
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({
      success: false,
      error: 'Token inválido ou expirado. Faça login novamente.',
    });
  }
}
""")

wf('apps/api/src/utils/slug.ts', """import { PrismaClient } from '@prisma/client';

export function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .replace(/[^a-z0-9\\s-]/g, '')
    .trim()
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
}

export async function generateUniqueSlug(
  name: string,
  prisma: PrismaClient,
  excludeId?: string
): Promise<string> {
  const baseSlug = generateSlugFromName(name);
  let slug = baseSlug;
  let attempt = 0;

  while (true) {
    const existing = await prisma.catalog.findFirst({
      where: {
        slug,
        NOT: excludeId ? { id: excludeId } : undefined,
      },
    });

    if (!existing) return slug;

    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }
}
""")

print('=== Backend core criado ===')
