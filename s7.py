import os
BASE = r'c:\Teste\Catalogo'
def wf(rel, content):
    p = os.path.join(BASE, *rel.split('/'))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8', newline='\n').write(content)
    print(f'  OK: {rel}')

wf('apps/api/src/modules/media/media.controller.ts', """import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
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
""")

wf('apps/api/src/modules/media/media.route.ts', """import { FastifyInstance } from 'fastify';
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
""")

print('=== Media module criado ===')
