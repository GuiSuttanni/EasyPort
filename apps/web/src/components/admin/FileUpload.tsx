'use client';

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
