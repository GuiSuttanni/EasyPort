import os
BASE = r'c:\Teste\Catalogo'
def wf(rel, content):
    p = os.path.join(BASE, *rel.split('/'))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8', newline='\n').write(content)
    print(f'  OK: {rel}')

wf('apps/api/prisma/schema.prisma', """// Prisma Schema - Catalogo Online
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  name         String
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  catalog      Catalog?

  @@map("users")
}

model Catalog {
  id          String    @id @default(uuid())
  slug        String    @unique
  name        String
  description String?   @db.Text
  story       String?   @db.Text
  phone       String?
  whatsapp    String?
  email       String?
  address     String?
  instagram   String?
  facebook    String?
  website     String?
  logoUrl     String?   @map("logo_url")
  coverUrl    String?   @map("cover_url")
  logoPublicId  String? @map("logo_public_id")
  coverPublicId String? @map("cover_public_id")
  isPublished Boolean   @default(false) @map("is_published")
  userId      String    @unique @map("user_id")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  categories  Category[]
  projects    Project[]
  media       Media[]

  @@map("catalogs")
}

model Category {
  id        String    @id @default(uuid())
  name      String
  icon      String?
  order     Int       @default(0)
  catalogId String    @map("catalog_id")
  createdAt DateTime  @default(now()) @map("created_at")

  catalog  Catalog   @relation(fields: [catalogId], references: [id], onDelete: Cascade)
  projects Project[]

  @@map("categories")
}

model Project {
  id          String   @id @default(uuid())
  title       String
  description String?  @db.Text
  order       Int      @default(0)
  isFeatured  Boolean  @default(false) @map("is_featured")
  catalogId   String   @map("catalog_id")
  categoryId  String?  @map("category_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  catalog  Catalog   @relation(fields: [catalogId], references: [id], onDelete: Cascade)
  category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  media    Media[]

  @@map("projects")
}

model Media {
  id        String    @id @default(uuid())
  url       String
  publicId  String    @map("public_id")
  type      MediaType @default(IMAGE)
  caption   String?
  order     Int       @default(0)
  width     Int?
  height    Int?
  duration  Float?
  projectId String?   @map("project_id")
  catalogId String    @map("catalog_id")
  createdAt DateTime  @default(now()) @map("created_at")

  project Project? @relation(fields: [projectId], references: [id], onDelete: SetNull)
  catalog Catalog  @relation(fields: [catalogId], references: [id], onDelete: Cascade)

  @@map("media")
}

enum MediaType {
  IMAGE
  VIDEO
}
""")
print('schema.prisma criado')
