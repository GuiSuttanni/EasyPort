import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { UpdateCatalogInput } from './catalog.schema';
import { generateUniqueSlug } from '../../utils/slug';

const CATALOG_INCLUDE = {
  categories: { orderBy: { order: 'asc' as const } },
  projects: {
    orderBy: { order: 'asc' as const },
    include: {
      category: true,
      media: { orderBy: { order: 'asc' as const } },
    },
  },
  media: {
    where: { projectId: null },
    orderBy: { order: 'asc' as const },
  },
};

export async function getMyCatalogHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { userId } = request.user as { userId: string };
  const catalog = await this.prisma.catalog.findUnique({
    where: { userId },
    include: CATALOG_INCLUDE,
  });
  if (!catalog) {
    return reply.status(404).send({ success: false, error: 'Catálogo não encontrado.' });
  }
  return reply.send({ success: true, data: catalog });
}

export async function updateMyCatalogHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: UpdateCatalogInput }>,
  reply: FastifyReply
) {
  const { userId } = request.user as { userId: string };
  const body = request.body;

  const catalog = await this.prisma.catalog.findUnique({ where: { userId } });
  if (!catalog) {
    return reply.status(404).send({ success: false, error: 'Catálogo não encontrado.' });
  }

  let slug = catalog.slug;
  if (body.name && body.name !== catalog.name) {
    slug = await generateUniqueSlug(body.name, this.prisma, catalog.id);
  }

  const updated = await this.prisma.catalog.update({
    where: { userId },
    data: { ...body, slug },
    include: CATALOG_INCLUDE,
  });

  return reply.send({ success: true, data: updated });
}

export async function getPublicCatalogHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: { slug: string } }>,
  reply: FastifyReply
) {
  const { slug } = request.params;
  const catalog = await this.prisma.catalog.findUnique({
    where: { slug, isPublished: true },
    include: CATALOG_INCLUDE,
  });
  if (!catalog) {
    return reply.status(404).send({
      success: false,
      error: 'Catálogo não encontrado ou não publicado.',
    });
  }
  return reply.send({ success: true, data: catalog });
}

export async function getDashboardStatsHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { userId } = request.user as { userId: string };
  const catalog = await this.prisma.catalog.findUnique({ where: { userId } });
  if (!catalog) {
    return reply.status(404).send({ success: false, error: 'Catálogo não encontrado.' });
  }

  const [projectCount, mediaCount, categoryCount] = await Promise.all([
    this.prisma.project.count({ where: { catalogId: catalog.id } }),
    this.prisma.media.count({ where: { catalogId: catalog.id } }),
    this.prisma.category.count({ where: { catalogId: catalog.id } }),
  ]);

  return reply.send({
    success: true,
    data: {
      catalogSlug: catalog.slug,
      isPublished: catalog.isPublished,
      projectCount,
      mediaCount,
      categoryCount,
      publicUrl: `/c/${catalog.slug}`,
    },
  });
}
