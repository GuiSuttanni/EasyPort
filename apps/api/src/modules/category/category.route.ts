import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth.middleware';
import {
  getCategoriesHandler,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
  reorderCategoriesHandler,
} from './category.controller';

export async function categoryRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', { handler: getCategoriesHandler.bind(fastify) });
  fastify.post('/', { handler: createCategoryHandler.bind(fastify) });
  fastify.put('/reorder', { handler: reorderCategoriesHandler.bind(fastify) });
  fastify.put('/:id', { handler: updateCategoryHandler.bind(fastify) });
  fastify.delete('/:id', { handler: deleteCategoryHandler.bind(fastify) });
}
