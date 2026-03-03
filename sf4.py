import os
BASE = r'c:\Teste\Catalogo'
def wf(rel, content):
    p = os.path.join(BASE, *rel.split('/'))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8', newline='\n').write(content)
    print(f'  OK: {rel}')

wf('apps/web/src/store/auth.store.ts', """import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Catalog } from '@/types';

interface AuthState {
  user: User | null;
  catalog: Catalog | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, catalog: Catalog, accessToken: string, refreshToken: string) => void;
  updateCatalog: (catalog: Catalog) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      catalog: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, catalog, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
        }
        set({ user, catalog, accessToken, refreshToken, isAuthenticated: true });
      },

      updateCatalog: (catalog) => set({ catalog }),

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        set({ user: null, catalog: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'catalogo-auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      partialize: (state) => ({
        user: state.user,
        catalog: state.catalog,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
""")

wf('apps/web/src/hooks/useCatalog.ts', """import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Catalog, DashboardStats } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

export const CATALOG_QUERY_KEY = ['catalog', 'me'];
export const STATS_QUERY_KEY = ['dashboard', 'stats'];

export function useGetMyCatalog() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: CATALOG_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Catalog }>('/catalog/me');
      return data.data!;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetDashboardStats() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: STATS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: DashboardStats }>('/catalog/dashboard/stats');
      return data.data!;
    },
    enabled: isAuthenticated,
  });
}

export function useUpdateCatalog() {
  const queryClient = useQueryClient();
  const updateCatalog = useAuthStore((s) => s.updateCatalog);

  return useMutation({
    mutationFn: async (body: Partial<Catalog>) => {
      const { data } = await api.put<{ success: boolean; data: Catalog }>('/catalog/me', body);
      return data.data!;
    },
    onSuccess: (updatedCatalog) => {
      queryClient.setQueryData(CATALOG_QUERY_KEY, updatedCatalog);
      queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
      updateCatalog(updatedCatalog);
      toast.success('Catálogo atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar catálogo. Tente novamente.');
    },
  });
}
""")

wf('apps/web/src/hooks/useMedia.ts', """import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadApi, api } from '@/lib/api';
import { Media } from '@/types';
import { toast } from 'sonner';

export const MEDIA_QUERY_KEY = (projectId?: string) =>
  projectId ? ['media', projectId] : ['media'];

interface UploadOptions {
  projectId?: string;
  caption?: string;
  onProgress?: (progress: number) => void;
}

export function useGetMedia(projectId?: string) {
  return useQuery({
    queryKey: MEDIA_QUERY_KEY(projectId),
    queryFn: async () => {
      const params = projectId ? { projectId } : {};
      const { data } = await api.get<{ success: boolean; data: Media[] }>('/media', { params });
      return data.data!;
    },
  });
}

export function useUploadMedia(options?: { projectId?: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ files, caption, onProgress }: { files: File[]; caption?: string; onProgress?: (p: number) => void }) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const params = new URLSearchParams();
      if (options?.projectId) params.set('projectId', options.projectId);
      if (caption) params.set('caption', caption);

      const { data } = await uploadApi.post<{ success: boolean; data: Media[] }>(
        `/media/upload?${params}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            if (e.total && onProgress) {
              onProgress(Math.round((e.loaded * 100) / e.total));
            }
          },
        }
      );
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_KEY(options?.projectId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      toast.success('Mídia(s) enviada(s) com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao enviar arquivo. Verifique o tamanho e tente novamente.');
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/media/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      toast.success('Mídia removida com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao remover mídia.');
    },
  });
}

export function useReorderMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: Array<{ id: string; order: number }>) => {
      await api.put('/media/reorder', { items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
}
""")

wf('apps/web/src/hooks/useCategories.ts', """import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Category } from '@/types';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';

export const CATEGORIES_QUERY_KEY = ['categories'];

export function useGetCategories() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Category[] }>('/categories');
      return data.data!;
    },
    enabled: isAuthenticated,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; icon?: string }) => {
      const { data } = await api.post<{ success: boolean; data: Category }>('/categories', body);
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success('Categoria criada!');
    },
    onError: () => toast.error('Erro ao criar categoria.'),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; name?: string; icon?: string }) => {
      const { data } = await api.put<{ success: boolean; data: Category }>(`/categories/${id}`, body);
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success('Categoria atualizada!');
    },
    onError: () => toast.error('Erro ao atualizar categoria.'),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      toast.success('Categoria removida!');
    },
    onError: () => toast.error('Erro ao remover categoria.'),
  });
}
""")

wf('apps/web/src/hooks/useProjects.ts', """import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Project } from '@/types';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';

export const PROJECTS_QUERY_KEY = ['projects'];

export function useGetProjects() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Project[] }>('/projects');
      return data.data!;
    },
    enabled: isAuthenticated,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { title: string; description?: string; categoryId?: string; isFeatured?: boolean }) => {
      const { data } = await api.post<{ success: boolean; data: Project }>('/projects', body);
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      toast.success('Projeto criado!');
    },
    onError: () => toast.error('Erro ao criar projeto.'),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; title?: string; description?: string; categoryId?: string; isFeatured?: boolean }) => {
      const { data } = await api.put<{ success: boolean; data: Project }>(`/projects/${id}`, body);
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      toast.success('Projeto atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar projeto.'),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/projects/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      toast.success('Projeto removido!');
    },
    onError: () => toast.error('Erro ao remover projeto.'),
  });
}
""")

print('=== Stores + Hooks criados ===')
