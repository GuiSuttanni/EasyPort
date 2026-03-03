import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import axios from 'axios';
import { Catalog, Project, Category } from '@/types';
import { PublicCatalogClient } from './PublicCatalogClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCatalog(slug: string): Promise<Catalog | null> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/catalog/public/${slug}`,
      { timeout: 8000 }
    );
    return res.data.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCatalog(slug);
  if (!catalog) return { title: 'Catalogo nao encontrado' };
  return {
    title: `${catalog.name} | Catalogo Digital`,
    description: catalog.description ?? `Conheça os trabalhos e serviços de ${catalog.name}`,
    openGraph: {
      title: catalog.name,
      description: catalog.description ?? '',
      images: catalog.coverUrl ? [catalog.coverUrl] : [],
      type: 'website',
    },
  };
}

export default async function PublicCatalogPage({ params }: PageProps) {
  const { slug } = await params;
  const catalog = await getCatalog(slug);
  if (!catalog) notFound();
  return <PublicCatalogClient catalog={catalog} />;
}
