import os
BASE = r'c:\Teste\Catalogo'
def wf(rel, content):
    p = os.path.join(BASE, *rel.split('/'))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8', newline='\n').write(content)
    print(f'  OK: {rel}')

wf('apps/api/src/modules/catalog/catalog.schema.ts', """import { z } from 'zod';

export const updateCatalogSchema = z.object({
  name: z.string().min(2).max(150).optional(),
  description: z.string().max(2000).optional().nullable(),
  story: z.string().max(5000).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  whatsapp: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  instagram: z.string().max(100).optional().nullable(),
  facebook: z.string().max(100).optional().nullable(),
  website: z.string().url().optional().nullable(),
  isPublished: z.boolean().optional(),
});

export type UpdateCatalogInput = z.infer<typeof updateCatalogSchema>;
""")

wf('apps/api/src/modules/catalog/catalog.controller.ts', """import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
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
""")

wf('apps/api/src/modules/catalog/catalog.route.ts', """import { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/auth.middleware';
import {
  getMyCatalogHandler,
  updateMyCatalogHandler,
  getPublicCatalogHandler,
  getDashboardStatsHandler,
} from './catalog.controller';
import { updateCatalogSchema } from './catalog.schema';

export async function catalogRoutes(fastify: FastifyInstance) {
  fastify.get('/me', {
    preHandler: [authenticate],
    handler: getMyCatalogHandler.bind(fastify),
  });

  fastify.put('/me', {
    preHandler: [
      authenticate,
      async (request, reply) => {
        const result = updateCatalogSchema.safeParse(request.body);
        if (!result.success) {
          return reply.status(400).send({
            success: false,
            error: 'Dados inválidos',
            details: result.error.format(),
          });
        }
        request.body = result.data;
      },
    ],
    handler: updateMyCatalogHandler.bind(fastify),
  });

  fastify.get('/dashboard/stats', {
    preHandler: [authenticate],
    handler: getDashboardStatsHandler.bind(fastify),
  });

  // Rota pública - sem autenticação
  fastify.get('/public/:slug', {
    handler: getPublicCatalogHandler.bind(fastify),
  });
}
""")

print('=== Catalog module criado ===')
