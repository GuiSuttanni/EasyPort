import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
