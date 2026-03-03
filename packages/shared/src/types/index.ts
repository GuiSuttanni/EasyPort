export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export type MediaType = 'IMAGE' | 'VIDEO';

export interface Media {
  id: string;
  url: string;
  publicId: string;
  type: MediaType;
  caption?: string;
  order: number;
  projectId?: string;
  catalogId: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  order: number;
  catalogId: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  order: number;
  isFeatured: boolean;
  catalogId: string;
  categoryId?: string;
  category?: Category;
  media?: Media[];
  createdAt: string;
}

export interface Catalog {
  id: string;
  slug: string;
  name: string;
  description?: string;
  story?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
  logoUrl?: string;
  coverUrl?: string;
  isPublished: boolean;
  userId: string;
  categories?: Category[];
  projects?: Project[];
  media?: Media[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}
