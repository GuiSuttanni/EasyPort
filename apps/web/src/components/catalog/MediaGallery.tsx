'use client';

import { useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Video } from 'lucide-react';
import { Media } from '@/types';

interface MediaGalleryProps {
  media: Media[];
  title?: string;
  initialIndex?: number;
  onClose?: () => void;
}

export function MediaGallery({ media, title, initialIndex = 0, onClose = () => {} }: MediaGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex: initialIndex, loop: true });
  const [current, setCurrent] = useState(initialIndex);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
    setCurrent(emblaApi.selectedScrollSnap() - 1 < 0 ? media.length - 1 : emblaApi.selectedScrollSnap() - 1);
  }, [emblaApi, media.length]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
    setCurrent((emblaApi.selectedScrollSnap() + 1) % media.length);
  }, [emblaApi, media.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-50 flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/40" onClick={(e) => e.stopPropagation()}>
        {title && <p className="text-white font-display font-semibold text-lg">{title}</p>}
        <span className="text-white/40 text-sm ml-auto mr-4">{current + 1}/{media.length}</span>
        <button onClick={onClose} className="p-2 text-white/60 hover:text-white bg-white/10 rounded-xl">
          <X size={22} />
        </button>
      </div>

      {/* Carrossel */}
      <div className="flex-1 flex items-center relative" onClick={(e) => e.stopPropagation()}>
        <div ref={emblaRef} className="overflow-hidden w-full h-full">
          <div className="flex h-full">
            {media.map((item, i) => (
              <div key={item.id} className="flex-none w-full h-full flex items-center justify-center px-4">
                {item.type === 'IMAGE' ? (
                  <div className="relative max-h-full max-w-full w-full h-full">
                    <img
                      src={item.url}
                      alt={item.caption || ''}
                      className="max-h-[75vh] max-w-full object-contain mx-auto"
                    />
                  </div>
                ) : (
                  <video
                    src={item.url}
                    controls
                    className="max-h-[75vh] max-w-full rounded-2xl"
                    autoPlay={i === current}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navegação */}
        <button
          onClick={scrollPrev}
          className="absolute left-3 p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-sm transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-3 p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-sm transition-all"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="py-4 px-6 flex gap-2 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
        {media.map((item, i) => (
          <button
            key={item.id}
            onClick={() => { emblaApi?.scrollTo(i); setCurrent(i); }}
            className={`flex-none w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === current ? 'border-white' : 'border-transparent opacity-50 hover:opacity-80'}`}
          >
            {item.type === 'IMAGE' ? (
              <img src={item.url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <Video size={16} className="text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
