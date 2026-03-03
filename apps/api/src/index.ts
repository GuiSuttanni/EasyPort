import Fastify from 'fastify';
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
