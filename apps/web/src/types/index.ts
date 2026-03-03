export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export type MediaType = 'IMAGE' | 'VIDEO';

export interface Media {
  id: string;
  url: string;
  publicId: string;
  type: MediaType;
  caption: string | null;
  order: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  projectId: string | null;
  catalogId: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  order: number;
  catalogId: string;
  createdAt: string;
  _count?: { projects: number };
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isFeatured: boolean;
  catalogId: string;
  categoryId: string | null;
  category: Category | null;
  media: Media[];
  createdAt: string;
  updatedAt: string;
}

export interface Catalog {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  story: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  isPublished: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
  projects: Project[];
  media: Media[];
}

export interface DashboardStats {
  catalogSlug: string;
  isPublished: boolean;
  projectCount: number;
  mediaCount: number;
  categoryCount: number;
  publicUrl: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export interface AuthResponse {
  user: User;
  catalog: Catalog;
  accessToken: string;
  refreshToken: string;
}
