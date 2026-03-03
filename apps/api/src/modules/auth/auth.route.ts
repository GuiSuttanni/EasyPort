import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth.middleware';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  getMeHandler,
} from './auth.controller';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schema';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'email', 'password', 'businessName'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          businessName: { type: 'string' },
        },
      },
    },
    preHandler: async (request, reply) => {
      const result = registerSchema.safeParse(request.body);
      if (!result.success) {
        return reply.status(400).send({
          success: false,
          error: 'Dados inválidos',
          details: result.error.format(),
        });
      }
      request.body = result.data;
    },
    handler: registerHandler.bind(fastify),
  });

  fastify.post('/login', {
    preHandler: async (request, reply) => {
      const result = loginSchema.safeParse(request.body);
      if (!result.success) {
        return reply.status(400).send({
          success: false,
          error: 'Dados inválidos',
          details: result.error.format(),
        });
      }
      request.body = result.data;
    },
    handler: loginHandler.bind(fastify),
  });

  fastify.post('/refresh', {
    handler: refreshHandler.bind(fastify),
  });

  fastify.get('/me', {
    preHandler: [authenticate],
    handler: getMeHandler.bind(fastify),
  });
}
