import os
BASE = r'c:\Teste\Catalogo'
def wf(rel, content):
    p = os.path.join(BASE, *rel.split('/'))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8', newline='\n').write(content)
    print(f'  OK: {rel}')

wf('apps/api/src/modules/auth/auth.schema.ts', """import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(100),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres').max(100),
  businessName: z.string().min(2, 'Nome do negócio deve ter ao menos 2 caracteres').max(150),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Token é obrigatório'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
""")

wf('apps/api/src/modules/auth/auth.controller.ts', """import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterInput, LoginInput, RefreshTokenInput } from './auth.schema';
import { generateUniqueSlug } from '../../utils/slug';

export async function registerHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: RegisterInput }>,
  reply: FastifyReply
) {
  const { name, email, password, businessName } = request.body;

  const existingUser = await this.prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return reply.status(409).send({
      success: false,
      error: 'Já existe uma conta com este e-mail.',
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const slug = await generateUniqueSlug(businessName, this.prisma);

  const user = await this.prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      catalog: {
        create: {
          slug,
          name: businessName,
          isPublished: false,
        },
      },
    },
    include: { catalog: true },
  });

  const accessToken = this.jwt.sign(
    { userId: user.id, email: user.email },
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, email: user.email, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return reply.status(201).send({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email },
      catalog: user.catalog,
      accessToken,
      refreshToken,
    },
  });
}

export async function loginHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply
) {
  const { email, password } = request.body;

  const user = await this.prisma.user.findUnique({
    where: { email },
    include: { catalog: true },
  });

  if (!user) {
    return reply.status(401).send({
      success: false,
      error: 'Credenciais inválidas.',
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return reply.status(401).send({
      success: false,
      error: 'Credenciais inválidas.',
    });
  }

  const accessToken = this.jwt.sign(
    { userId: user.id, email: user.email },
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, email: user.email, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return reply.send({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email },
      catalog: user.catalog,
      accessToken,
      refreshToken,
    },
  });
}

export async function refreshHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: RefreshTokenInput }>,
  reply: FastifyReply
) {
  const { refreshToken } = request.body;

  try {
    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh_secret'
    ) as { userId: string; email: string; type: string };

    if (payload.type !== 'refresh') {
      return reply.status(401).send({ success: false, error: 'Token inválido.' });
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return reply.status(401).send({ success: false, error: 'Usuário não encontrado.' });
    }

    const newAccessToken = this.jwt.sign(
      { userId: user.id, email: user.email },
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return reply.send({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch {
    return reply.status(401).send({ success: false, error: 'Token expirado ou inválido.' });
  }
}

export async function getMeHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { userId } = request.user as { userId: string };
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  if (!user) return reply.status(404).send({ success: false, error: 'Usuário não encontrado.' });
  return reply.send({ success: true, data: user });
}
""")

wf('apps/api/src/modules/auth/auth.route.ts', """import { FastifyInstance } from 'fastify';
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
""")

print('=== Auth module criado ===')
