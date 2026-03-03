import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  businessName: z.string().min(2),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateCatalogSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  story: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  isPublished: z.boolean().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
});

export const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  isFeatured: z.boolean().optional(),
  categoryId: z.string().optional(),
});

export const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string(), order: z.number() })),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateCatalogInput = z.infer<typeof updateCatalogSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
