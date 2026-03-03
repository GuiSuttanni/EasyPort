import os
BASE = r'c:\Teste\Catalogo'
def wf(rel, content):
    p = os.path.join(BASE, *rel.split('/'))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8', newline='\n').write(content)
    print(f'  OK: {rel}')

wf('apps/web/src/components/admin/FileUpload.tsx', """'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ImageIcon, Video, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (files: File[], onProgress: (p: number) => void) => Promise<void>;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  className?: string;
}

interface UploadingFile {
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
}

export function FileUpload({ onUpload, maxFiles = 10, className }: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: UploadingFile[] = acceptedFiles.map((file) => ({
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        progress: 0,
        status: 'pending',
      }));

      setUploadingFiles((prev) => [...prev, ...newFiles]);
      setIsUploading(true);

      setUploadingFiles((prev) =>
        prev.map((f) =>
          newFiles.find((nf) => nf.file === f.file) ? { ...f, status: 'uploading' } : f
        )
      );

      try {
        await onUpload(acceptedFiles, (progress) => {
          setUploadingFiles((prev) =>
            prev.map((f) =>
              newFiles.find((nf) => nf.file === f.file)
                ? { ...f, progress, status: progress === 100 ? 'done' : 'uploading' }
                : f
            )
          );
        });

        setTimeout(() => {
          setUploadingFiles((prev) => prev.filter((f) => !newFiles.find((nf) => nf.file === f.file)));
        }, 1500);
      } catch {
        setUploadingFiles((prev) =>
          prev.map((f) =>
            newFiles.find((nf) => nf.file === f.file) ? { ...f, status: 'error' } : f
          )
        );
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm'],
    },
    maxFiles,
    disabled: isUploading,
  });

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-primary-500 bg-primary-50 scale-[1.01]'
            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50',
          isUploading && 'opacity-60 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <Loader2 size={40} className="text-primary-500 animate-spin" />
          ) : (
            <Upload size={40} className={isDragActive ? 'text-primary-500' : 'text-gray-300'} />
          )}
          <div>
            <p className="font-semibold text-gray-600">
              {isDragActive ? 'Solte os arquivos aqui' : 'Arraste fotos e vídeos aqui'}
            </p>
            <p className="text-sm text-gray-400 mt-1">ou clique para selecionar</p>
            <p className="text-xs text-gray-300 mt-2">JPG, PNG, WEBP, MP4, MOV  Máx. 50MB por arquivo</p>
          </div>
        </div>
      </div>

      {/* Preview dos arquivos sendo enviados */}
      <AnimatePresence>
        {uploadingFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3"
          >
            {uploadingFiles.map(({ file, preview, progress, status }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group"
              >
                {preview ? (
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video size={24} className="text-gray-300" />
                  </div>
                )}
                
                {/* Overlay de progresso */}
                {status === 'uploading' && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                    <p className="text-white text-sm font-bold">{progress}%</p>
                    <div className="w-3/4 h-1 bg-white/20 rounded-full mt-1">
                      <div
                        className="h-full bg-white rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
                {status === 'done' && (
                  <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center">
                    <span className="text-white text-lg"></span>
                  </div>
                )}
                {status === 'error' && (
                  <div className="absolute inset-0 bg-red-500/40 flex items-center justify-center">
                    <X size={20} className="text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
""")

wf('apps/web/src/app/(admin)/midia/page.tsx', """'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Image as ImageIcon, Video, X } from 'lucide-react';
import { useGetMedia, useUploadMedia, useDeleteMedia } from '@/hooks/useMedia';
import { FileUpload } from '@/components/admin/FileUpload';
import { Media } from '@/types';
import Image from 'next/image';

export default function MidiaPage() {
  const { data: media, isLoading } = useGetMedia();
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();
  const [lightbox, setLightbox] = useState<Media | null>(null);

  const handleUpload = async (files: File[], onProgress: (p: number) => void) => {
    await uploadMedia.mutateAsync({ files, onProgress });
  };

  const handleDelete = async (item: Media) => {
    if (!confirm('Remover esta mídia permanentemente?')) return;
    await deleteMedia.mutateAsync(item.id);
  };

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

      {/* Galeria */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton aspect-square rounded-2xl" />
          ))}
        </div>
      ) : !media?.length ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <ImageIcon size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Nenhuma mídia ainda</p>
          <p className="text-gray-300 text-sm mt-1">Envie suas fotos e vídeos acima</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <AnimatePresence>
            {media.map((item: Media) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group cursor-pointer"
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
                    <Video size={32} className="text-white/80" />
                    <span className="absolute bottom-2 right-2 text-xs text-white/60 bg-black/40 px-1.5 py-0.5 rounded">
                      Vídeo
                    </span>
                  </div>
                )}

                {/* Overlay com ações */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                    className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{item.caption}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
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
""")

print('=== Midia page criado ===')
