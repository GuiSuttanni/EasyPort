'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { Catalog } from '@/types';

interface HeroSectionProps {
  catalog: Catalog;
}

export function HeroSection({ catalog }: HeroSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-[70vh] sm:h-[80vh] md:h-[90vh] min-h-[500px] overflow-hidden">
      {/* Cover com parallax */}
      <motion.div style={{ y }} className="absolute inset-0">
        {catalog.coverUrl ? (
          <Image
            src={catalog.coverUrl}
            alt={catalog.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-700 to-accent-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/80" />
      </motion.div>

      {/* Conteudo */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full flex flex-col justify-end pb-10 sm:pb-16 px-5 sm:px-8 md:px-12 max-w-5xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex items-end gap-4 sm:gap-6"
        >
          <div className="min-w-0">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/60 text-xs sm:text-sm uppercase tracking-widest mb-1"
            >
              Catálogo Digital
            </motion.p>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold text-white leading-tight">
              {catalog.name}
            </h1>
            {catalog.address && (
              <p className="flex items-center gap-1.5 text-white/60 text-xs sm:text-sm mt-1.5">
                <MapPin size={13} />
                {catalog.address}
              </p>
            )}
          </div>
        </motion.div>

        {catalog.description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-white/70 text-sm sm:text-base md:text-lg mt-4 sm:mt-5 max-w-2xl leading-relaxed line-clamp-3 sm:line-clamp-none"
          >
            {catalog.description}
          </motion.p>
        )}
      </motion.div>

      {/* Scroll indicator - só desktop */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        className="hidden sm:flex absolute bottom-6 left-1/2 -translate-x-1/2 w-6 h-10 border-2 border-white/30 rounded-full justify-center pt-2"
      >
        <div className="w-1 h-2 bg-white/50 rounded-full" />
      </motion.div>
    </section>
  );
}
