import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';

export async function getProjectsHandler(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const { userId } = request.user as { userId: string };
  const catalog = await this.prisma.catalog.findUnique({ where: { userId } });
  if (!catalog) return reply.status(404).send({ success: false, error: 'Catálogo não encontrado.' });

  const projects = await this.prisma.project.findMany({
    where: { catalogId: catalog.id },
    orderBy: { order: 'asc' },
    include: { category: true, media: { orderBy: { order: 'asc' } } },
  });
  return reply.send({ success: true, data: projects });
}

export async function createProjectHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: { title: string; description?: string; categoryId?: string; isFeatured?: boolean } }>,
  reply: FastifyReply
) {
  const { userId } = request.user as { userId: string };
  const catalog = await this.prisma.catalog.findUnique({ where: { userId } });
  if (!catalog) return reply.status(404).send({ success: false, error: 'Catálogo não encontrado.' });

  const lastProject = await this.prisma.project.findFirst({
    where: { catalogId: catalog.id },
    orderBy: { order: 'desc' },
  });

  const project = await this.prisma.project.create({
    data: {
      ...request.body,
      order: (lastProject?.order ?? -1) + 1,
      catalogId: catalog.id,
    },
    include: { category: true, media: true },
  });
  return reply.status(201).send({ success: true, data: project });
}

export async function updateProjectHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: { id: string }; Body: { title?: string; description?: string; categoryId?: string; isFeatured?: boolean } }>,
  reply: FastifyReply
) {
  const { userId } = request.user as { userId: string };
  const { id } = request.params;
  const catalog = await this.prisma.catalog.findUnique({ where: { userId } });
  if (!catalog) return reply.status(404).send({ success: false, error: 'Catálogo não encontrado.' });

  const project = await this.prisma.project.findFirst({ where: { id, catalogId: catalog.id } });
  if (!project) return reply.status(404).send({ success: false, error: 'Projeto não encontrado.' });

  const updated = await this.prisma.project.update({
    where: { id },
    data: request.body,
    include: { category: true, media: { orderBy: { order: 'asc' } } },
  });
  return reply.send({ success: true, data: updated });
}

export async function deleteProjectHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { userId } = request.user as { userId: string };
  const { id } = request.params;
  const catalog = await this.prisma.catalog.findUnique({ where: { userId } });
  if (!catalog) return reply.status(404).send({ success: false, error: 'Catálogo não encontrado.' });

  const project = await this.prisma.project.findFirst({ where: { id, catalogId: catalog.id } });
  if (!project) return reply.status(404).send({ success: false, error: 'Projeto não encontrado.' });

  // Deletar mídias do Cloudinary antes de deletar o projeto
  const medias = await this.prisma.media.findMany({ where: { projectId: id } });
  await Promise.all(medias.map(m => this.cloudinary.uploader.destroy(m.publicId, { resource_type: m.type === 'VIDEO' ? 'video' : 'image' })));

  await this.prisma.project.delete({ where: { id } });
  return reply.status(204).send();
}

export async function reorderProjectsHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: { items: Array<{ id: string; order: number }> } }>,
  reply: FastifyReply
) {
  const { userId } = request.user as { userId: string };
  const catalog = await this.prisma.catalog.findUnique({ where: { userId } });
  if (!catalog) return reply.status(404).send({ success: false, error: 'Catálogo não encontrado.' });

  await this.prisma.$transaction(
    request.body.items.map(({ id, order }) =>
      this.prisma.project.update({ where: { id, catalogId: catalog.id }, data: { order } })
    )
  );
  return reply.send({ success: true, message: 'Ordem atualizada.' });
}
