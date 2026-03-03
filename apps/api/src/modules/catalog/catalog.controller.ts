import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { UpdateCatalogInput } from './catalog.schema';
import { generateUniqueSlug } from '../../utils/slug';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

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

async function uploadCatalogImage(
  fastify: FastifyInstance,
  userId: string,
  field: 'logoUrl' | 'coverUrl',
  folder: string,
  reply: FastifyReply,
  request: FastifyRequest
) {
  const catalog = await fastify.prisma.catalog.findUnique({ where: { userId } });
  if (!catalog) return reply.status(404).send({ success: false, error: 'Catálogo não encontrado.' });

  const parts = request.parts();
  let uploadedUrl: string | null = null;

  for await (const part of parts) {
    if (part.type !== 'file') continue;
    const cloudResult = await new Promise<any>((resolve, reject) => {
      const stream = (fastify.cloudinary as any).uploader.upload_stream(
        { folder: `catalogo/${catalog.slug}/${folder}`, resource_type: 'image', quality: 'auto', fetch_format: 'auto' },
        (err: any, result: any) => { if (err) reject(err); else resolve(result); }
      );
      pipeline(part.file as unknown as Readable, stream).catch(reject);
    });
    uploadedUrl = cloudResult.secure_url;
    break; // Só um arquivo
  }

  if (!uploadedUrl) return reply.status(400).send({ success: false, error: 'Nenhum arquivo enviado.' });

  const updated = await fastify.prisma.catalog.update({
    where: { userId },
    data: { [field]: uploadedUrl },
  });

  return reply.send({ success: true, data: { url: uploadedUrl, catalog: updated } });
}

export async function uploadImageHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { userId } = request.user as { userId: string };
  return uploadCatalogImage(this, userId, 'coverUrl', 'cover', reply, request);
}
