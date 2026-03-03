import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

export async function getCategoriesHandler(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user as { userId: string };
  const catalog = await this.prisma.catalog.findUnique({ where: { userId } });
  if (!catalog) return reply.status(404).send({ success: false, error: 'Catálogo não encontrado.' });

  const categories = await this.prisma.category.findMany({
    where: { catalogId: catalog.id },
    orderBy: { order: 'asc' },
    include: { _count: { select: { projects: true } } },
  });
  return reply.send({ success: true, data: categories });
}

export async function createCategoryHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: { name: string; icon?: string } }>,
  reply: FastifyReply
) {
  const { userId } = request.user as { userId: string };
  const catalog = await this.prisma.catalog.findUnique({ where: { userId } });
  if (!catalog) return reply.status(404).send({ success: false, error: 'Catálogo não encontrado.' });

  const lastCategory = await this.prisma.category.findFirst({
    where: { catalogId: catalog.id },
    orderBy: { order: 'desc' },
  });

  const category = await this.prisma.category.create({
    data: {
      name: request.body.name,
      icon: request.body.icon,
      order: (lastCategory?.order ?? -1) + 1,
      catalogId: catalog.id,
    },
  });
  return reply.status(201).send({ success: true, data: category });
}

export async function updateCategoryHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: { id: string }; Body: { name?: string; icon?: string } }>,
  reply: FastifyReply
) {
  const { userId } = request.user as { userId: string };
  const { id } = request.params;
  const catalog = await this.prisma.catalog.findUnique({ where: { userId } });
  if (!catalog) return reply.status(404).send({ success: false, error: 'Catálogo não encontrado.' });

  const category = await this.prisma.category.findFirst({ where: { id, catalogId: catalog.id } });
  if (!category) return reply.status(404).send({ success: false, error: 'Categoria não encontrada.' });

  const updated = await this.prisma.category.update({
    where: { id },
    data: request.body,
  });
  return reply.send({ success: true, data: updated });
}

export async function deleteCategoryHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { userId } = request.user as { userId: string };
  const { id } = request.params;
  const catalog = await this.prisma.catalog.findUnique({ where: { userId } });
  if (!catalog) return reply.status(404).send({ success: false, error: 'Catálogo não encontrado.' });

  const category = await this.prisma.category.findFirst({ where: { id, catalogId: catalog.id } });
  if (!category) return reply.status(404).send({ success: false, error: 'Categoria não encontrada.' });

  await this.prisma.category.delete({ where: { id } });
  return reply.status(204).send();
}

export async function reorderCategoriesHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: { items: Array<{ id: string; order: number }> } }>,
  reply: FastifyReply
) {
  const { userId } = request.user as { userId: string };
  const catalog = await this.prisma.catalog.findUnique({ where: { userId } });
  if (!catalog) return reply.status(404).send({ success: false, error: 'Catálogo não encontrado.' });

  await this.prisma.$transaction(
    request.body.items.map(({ id, order }) =>
      this.prisma.category.update({ where: { id, catalogId: catalog.id }, data: { order } })
    )
  );
  return reply.send({ success: true, message: 'Ordem atualizada com sucesso.' });
}
