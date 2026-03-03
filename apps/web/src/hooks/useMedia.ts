import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadApi, api } from '@/lib/api';
import { Media } from '@/types';
import { toast } from 'sonner';
import { PROJECTS_QUERY_KEY } from './useProjects';

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
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
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
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
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
