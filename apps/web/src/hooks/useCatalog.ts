import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, uploadApi } from '@/lib/api';
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

export function useUploadCatalogImage() {
  const queryClient = useQueryClient();
  const updateCatalogStore = useAuthStore((s) => s.updateCatalog);

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('files', file);
      const { data } = await uploadApi.post<{ success: boolean; data: { url: string; catalog: Catalog } }>(
        `/catalog/image`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return data.data!;
    },
    onSuccess: ({ catalog }) => {
      queryClient.setQueryData(CATALOG_QUERY_KEY, catalog);
      updateCatalogStore(catalog);
      toast.success('Foto de capa atualizada!');
    },
    onError: () => toast.error('Erro ao enviar imagem.'),
  });
}
