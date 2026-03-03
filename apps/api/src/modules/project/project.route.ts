import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth.middleware';
import {
  getProjectsHandler,
  createProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
  reorderProjectsHandler,
} from './project.controller';

export async function projectRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', { handler: getProjectsHandler.bind(fastify) });
  fastify.post('/', { handler: createProjectHandler.bind(fastify) });
  fastify.put('/reorder', { handler: reorderProjectsHandler.bind(fastify) });
  fastify.put('/:id', { handler: updateProjectHandler.bind(fastify) });
  fastify.delete('/:id', { handler: deleteProjectHandler.bind(fastify) });
}
