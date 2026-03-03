import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
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
