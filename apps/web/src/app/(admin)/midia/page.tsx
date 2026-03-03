'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Image as ImageIcon, Video, X, FolderOpen } from 'lucide-react';
import { useGetMedia, useUploadMedia, useDeleteMedia } from '@/hooks/useMedia';
import { useGetProjects } from '@/hooks/useProjects';
import { FileUpload } from '@/components/admin/FileUpload';
import { Media, Project } from '@/types';
import Image from 'next/image';

export default function MidiaPage() {
  const { data: standaloneMedia, isLoading } = useGetMedia();
  const { data: projects } = useGetProjects();
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();
  const [lightbox, setLightbox] = useState<Media | null>(null);

  // Separa mídias sem projeto das mídias de projetos
  const onlyStandalone = (standaloneMedia ?? []).filter((m: Media) => !m.projectId);
  const projectsWithMedia = (projects ?? []).filter((p: Project) => (p.media?.length ?? 0) > 0);

  const handleUpload = async (files: File[], onProgress: (p: number) => void) => {
    await uploadMedia.mutateAsync({ files, onProgress });
  };

  const handleDelete = async (item: Media) => {
    if (!confirm('Remover esta mídia permanentemente?')) return;
    await deleteMedia.mutateAsync(item.id);
  };

  const MediaGrid = ({ items }: { items: Media[] }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group cursor-pointer"
            onClick={() => setLightbox(item)}
          >
            {item.type === 'IMAGE' ? (
              <Image
                src={item.url}
                alt={item.caption || ''}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <Video size={28} className="text-white/80" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Mídias</h1>
        <p className="text-gray-500 mt-1 text-sm">Gerencie todas as fotos e vídeos do seu catálogo</p>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Enviar novas mídias</h2>
        <FileUpload onUpload={handleUpload} />
      </div>

      {/* Galeria agrupada */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton aspect-square rounded-xl" />
          ))}
        </div>
      ) : (onlyStandalone.length === 0 && projectsWithMedia.length === 0) ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <ImageIcon size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Nenhuma mídia ainda</p>
          <p className="text-gray-300 text-sm mt-1">Envie suas fotos e vídeos acima ou adicione imagens a um projeto</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Mídias de projetos */}
          {projectsWithMedia.map((project: Project) => (
            <div key={project.id}>
              <div className="flex items-center gap-2 mb-3">
                <FolderOpen size={16} className="text-primary-500" />
                <h2 className="text-sm font-semibold text-gray-700">{project.title}</h2>
                <span className="text-xs text-gray-400">({project.media?.length} foto{project.media?.length !== 1 ? 's' : ''})</span>
              </div>
              <MediaGrid items={project.media ?? []} />
            </div>
          ))}

          {/* Mídias gerais (sem projeto) */}
          {onlyStandalone.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon size={16} className="text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-700">Galeria geral</h2>
                <span className="text-xs text-gray-400">({onlyStandalone.length} arquivo{onlyStandalone.length !== 1 ? 's' : ''})</span>
              </div>
              <MediaGrid items={onlyStandalone} />
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 rounded-xl"
              onClick={() => setLightbox(null)}
            >
              <X size={24} />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-4xl max-h-[90vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              {lightbox.type === 'IMAGE' ? (
                <img src={lightbox.url} alt={lightbox.caption || ''} className="max-h-[90vh] max-w-full object-contain rounded-2xl" />
              ) : (
                <video src={lightbox.url} controls className="max-h-[90vh] max-w-full rounded-2xl" autoPlay />
              )}
              {lightbox.caption && (
                <p className="text-white/70 text-center text-sm mt-3">{lightbox.caption}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
