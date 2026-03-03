import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth.middleware';
import {
  getMyCatalogHandler,
  updateMyCatalogHandler,
  getPublicCatalogHandler,
  getDashboardStatsHandler,
} from './catalog.controller';
import { updateCatalogSchema } from './catalog.schema';

export async function catalogRoutes(fastify: FastifyInstance) {
  fastify.get('/me', {
    preHandler: [authenticate],
    handler: getMyCatalogHandler.bind(fastify),
  });

  fastify.put('/me', {
    preHandler: [
      authenticate,
      async (request, reply) => {
        const result = updateCatalogSchema.safeParse(request.body);
        if (!result.success) {
          return reply.status(400).send({
            success: false,
            error: 'Dados inválidos',
            details: result.error.format(),
          });
        }
        request.body = result.data;
      },
    ],
    handler: updateMyCatalogHandler.bind(fastify),
  });

  fastify.get('/dashboard/stats', {
    preHandler: [authenticate],
    handler: getDashboardStatsHandler.bind(fastify),
  });

  // Rota pública - sem autenticação
  fastify.get('/public/:slug', {
    handler: getPublicCatalogHandler.bind(fastify),
  });
}
