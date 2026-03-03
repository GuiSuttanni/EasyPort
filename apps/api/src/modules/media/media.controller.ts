import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

export async function uploadMediaHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Querystring: { projectId?: string; caption?: string } }>,
  reply: FastifyReply
) {
  const { userId } = request.user as { userId: string };
  const catalog = await this.prisma.catalog.findUnique({ where: { userId } });
  if (!catalog) return reply.status(404).send({ success: false, error: 'Catálogo não encontrado.' });

  const { projectId, caption } = request.query;

  if (projectId) {
    const project = await this.prisma.project.findFirst({ where: { id: projectId, catalogId: catalog.id } });
    if (!project) return reply.status(404).send({ success: false, error: 'Projeto não encontrado.' });
  }

  const parts = request.parts();
  const uploadedMedia: any[] = [];

  for await (const part of parts) {
    if (part.type !== 'file') continue;

    const isVideo = part.mimetype.startsWith('video/');
    const folder = `catalogo/${catalog.slug}/${isVideo ? 'videos' : 'images'}`;

    const lastMedia = await this.prisma.media.findFirst({
      where: { catalogId: catalog.id, projectId: projectId || null },
      orderBy: { order: 'desc' },
    });

    const cloudResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: isVideo ? 'video' : 'image',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      pipeline(part.file as unknown as Readable, uploadStream).catch(reject);
    });

    const media = await this.prisma.media.create({
      data: {
        url: cloudResult.secure_url,
        publicId: cloudResult.public_id,
        type: isVideo ? 'VIDEO' : 'IMAGE',
        caption: caption || null,
        width: cloudResult.width || null,
        height: cloudResult.height || null,
        duration: cloudResult.duration || null,
        order: (lastMedia?.order ?? -1) + 1,
        catalogId: catalog.id,
        projectId: projectId || null,
      },
    });
    uploadedMedia.push(media);
  }

  return reply.status(201).send({ success: true, data: uploadedMedia });
}

export async function deleteMediaHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { userId } = request.user as { userId: string };
  const { id } = request.params;
  const catalog = await this.prisma.catalog.findUnique({ where: { userId } });
  if (!catalog) return reply.status(404).send({ success: false, error: 'Catálogo não encontrado.' });

  const media = await this.prisma.media.findFirst({ where: { id, catalogId: catalog.id } });
  if (!media) return reply.status(404).send({ success: false, error: 'Mídia não encontrada.' });

  await this.cloudinary.uploader.destroy(media.publicId, {
    resource_type: media.type === 'VIDEO' ? 'video' : 'image',
  });

  await this.prisma.media.delete({ where: { id } });
  return reply.status(204).send();
}

export async function reorderMediaHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Body: { items: Array<{ id: string; order: number }> } }>,
  reply: FastifyReply
) {
  const { userId } = request.user as { userId: string };
  const catalog = await this.prisma.catalog.findUnique({ where: { userId } });
  if (!catalog) return reply.status(404).send({ success: false, error: 'Catálogo não encontrado.' });

  await this.prisma.$transaction(
    request.body.items.map(({ id, order }) =>
      this.prisma.media.update({ where: { id, catalogId: catalog.id }, data: { order } })
    )
  );
  return reply.send({ success: true, message: 'Ordem das mídias atualizada.' });
}

export async function updateMediaCaptionHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Params: { id: string }; Body: { caption: string } }>,
  reply: FastifyReply
) {
  const { userId } = request.user as { userId: string };
  const { id } = request.params;
  const catalog = await this.prisma.catalog.findUnique({ where: { userId } });
  if (!catalog) return reply.status(404).send({ success: false, error: 'Catálogo não encontrado.' });

  const media = await this.prisma.media.findFirst({ where: { id, catalogId: catalog.id } });
  if (!media) return reply.status(404).send({ success: false, error: 'Mídia não encontrada.' });

  const updated = await this.prisma.media.update({
    where: { id },
    data: { caption: request.body.caption },
  });
  return reply.send({ success: true, data: updated });
}

export async function getMediaHandler(
  this: FastifyInstance,
  request: FastifyRequest<{ Querystring: { projectId?: string } }>,
  reply: FastifyReply
) {
  const { userId } = request.user as { userId: string };
  const catalog = await this.prisma.catalog.findUnique({ where: { userId } });
  if (!catalog) return reply.status(404).send({ success: false, error: 'Catálogo não encontrado.' });

  const where: any = { catalogId: catalog.id };
  if (request.query.projectId) {
    where.projectId = request.query.projectId;
  }

  const media = await this.prisma.media.findMany({
    where,
    orderBy: { order: 'asc' },
  });
  return reply.send({ success: true, data: media });
}
