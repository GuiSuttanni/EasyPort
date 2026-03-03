import os
BASE = r'c:\Teste\Catalogo'
def wf(rel, content):
    p = os.path.join(BASE, *rel.split('/'))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8', newline='\n').write(content)
    print(f'  OK: {rel}')

wf('apps/web/src/types/index.ts', """export interface User {
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
""")

wf('apps/web/src/lib/utils.ts', """import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function formatWhatsAppUrl(whatsapp: string, message?: string): string {
  const cleaned = whatsapp.replace(/\\D/g, '');
  const number = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
  const msg = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${number}${msg ? `?text=${msg}` : ''}`;
}

export function formatInstagramUrl(handle: string): string {
  const cleaned = handle.replace('@', '');
  return `https://instagram.com/${cleaned}`;
}

export function formatFacebookUrl(handle: string): string {
  if (handle.startsWith('http')) return handle;
  return `https://facebook.com/${handle}`;
}

export function getPublicCatalogUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${base}/c/${slug}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}
""")

wf('apps/web/src/lib/api.ts', """import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - adiciona token de autenticação
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - refresh automático de token
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: string) => void; reject: (reason: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = typeof window !== 'undefined'
        ? localStorage.getItem('refresh_token')
        : null;

      if (!refreshToken) {
        if (typeof window !== 'undefined') {
          localStorage.clear();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = data.data;

        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', newRefreshToken);

        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const uploadApi = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 minutos para upload
});

uploadApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
""")

print('=== Types + lib criados ===')
