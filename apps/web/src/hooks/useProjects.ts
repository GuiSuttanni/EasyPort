import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
