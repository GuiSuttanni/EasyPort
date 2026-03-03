import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth.middleware';
import {
  uploadMediaHandler,
  deleteMediaHandler,
  reorderMediaHandler,
  updateMediaCaptionHandler,
  getMediaHandler,
} from './media.controller';

export async function mediaRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', { handler: getMediaHandler.bind(fastify) });
  fastify.post('/upload', { handler: uploadMediaHandler.bind(fastify) });
  fastify.put('/reorder', { handler: reorderMediaHandler.bind(fastify) });
  fastify.put('/:id/caption', { handler: updateMediaCaptionHandler.bind(fastify) });
  fastify.delete('/:id', { handler: deleteMediaHandler.bind(fastify) });
}
