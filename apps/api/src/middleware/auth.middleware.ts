import { FastifyRequest, FastifyReply } from 'fastify';

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
