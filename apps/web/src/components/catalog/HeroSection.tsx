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
    <section ref={ref} className="relative h-[90vh] min-h-[600px] overflow-hidden">
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
        className="relative z-10 h-full flex flex-col justify-end pb-16 px-6 md:px-12 max-w-5xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex items-end gap-6"
        >
          {catalog.logoUrl && (
            <div className="relative w-20 h-20 md:w-28 md:h-28 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-white/20 shadow-card">
              <Image src={catalog.logoUrl} alt="Logo" fill className="object-cover" />
            </div>
          )}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/60 text-sm uppercase tracking-widest mb-1"
            >
              Catálogo Digital
            </motion.p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight">
              {catalog.name}
            </h1>
            {catalog.address && (
              <p className="flex items-center gap-1.5 text-white/60 text-sm mt-2">
                <MapPin size={14} />
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
            className="text-white/70 text-base md:text-lg mt-5 max-w-2xl leading-relaxed"
          >
            {catalog.description}
          </motion.p>
        )}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
      >
        <div className="w-1 h-2 bg-white/50 rounded-full" />
      </motion.div>
    </section>
  );
}
