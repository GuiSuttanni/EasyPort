import { PrismaClient } from '@prisma/client';

export function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
}

export async function generateUniqueSlug(
  name: string,
  prisma: PrismaClient,
  excludeId?: string
): Promise<string> {
  const baseSlug = generateSlugFromName(name);
  let slug = baseSlug;
  let attempt = 0;

  while (true) {
    const existing = await prisma.catalog.findFirst({
      where: {
        slug,
        NOT: excludeId ? { id: excludeId } : undefined,
      },
    });

    if (!existing) return slug;

    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }
}
