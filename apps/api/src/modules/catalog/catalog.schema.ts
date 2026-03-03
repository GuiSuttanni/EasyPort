import { z } from 'zod';

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
