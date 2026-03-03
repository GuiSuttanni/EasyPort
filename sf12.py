import os
BASE = r'c:\Teste\Catalogo'
def wf(rel, content):
    p = os.path.join(BASE, *rel.split('/'))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8', newline='\n').write(content)
    print(f'  OK: {rel}')

wf('apps/web/src/components/catalog/HeroSection.tsx', """'use client';

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
""")

wf('apps/web/src/components/catalog/ProjectCard.tsx', """'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Images, Star } from 'lucide-react';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const cover = project.media?.[0];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className="group bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover cursor-pointer transition-shadow duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {cover ? (
          <Image
            src={cover.url}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Images size={40} className="text-gray-300" />
          </div>
        )}
        {project.isFeatured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-accent-500 text-white text-xs font-semibold rounded-full">
            <Star size={10} fill="white" />
            Destaque
          </div>
        )}
        {project.media && project.media.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 text-white text-xs rounded-full">
            <Images size={10} />
            {project.media.length}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-bold text-gray-900 text-lg leading-tight group-hover:text-primary-600 transition-colors">
          {project.title}
        </h3>
        {project.category && (
          <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
            {project.category.name}
          </span>
        )}
        {project.description && (
          <p className="text-gray-500 text-sm mt-2 line-clamp-2 leading-relaxed">{project.description}</p>
        )}
      </div>
    </motion.div>
  );
}
""")

wf('apps/web/src/components/catalog/MediaGallery.tsx', """'use client';

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
  onClose: () => void;
}

export function MediaGallery({ media, title, initialIndex = 0, onClose }: MediaGalleryProps) {
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
""")

wf('apps/web/src/components/catalog/ContactSection.tsx', """'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle, Instagram, Facebook, Globe, ExternalLink } from 'lucide-react';
import { Catalog } from '@/types';
import { formatWhatsAppUrl, formatInstagramUrl, formatFacebookUrl } from '@/lib/utils';

interface ContactSectionProps {
  catalog: Catalog;
}

export function ContactSection({ catalog }: ContactSectionProps) {
  const hasContact = catalog.whatsapp || catalog.phone || catalog.email || catalog.address;
  const hasSocials = catalog.instagram || catalog.facebook || catalog.website;

  if (!hasContact && !hasSocials) return null;

  return (
    <section className="py-16 px-6 md:px-12 bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">Entre em contato</h2>
          <p className="text-white/50 text-base mb-10">Estamos prontos para atender você</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* WhatsApp - destaque */}
          {catalog.whatsapp && (
            <motion.a
              href={formatWhatsAppUrl(catalog.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-4 p-5 bg-green-500 rounded-3xl group"
            >
              <div className="p-3 bg-white/20 rounded-2xl">
                <MessageCircle size={28} className="text-white" />
              </div>
              <div>
                <p className="text-white/80 text-xs uppercase tracking-wider mb-0.5">WhatsApp</p>
                <p className="text-white font-display font-bold text-xl">{catalog.whatsapp}</p>
              </div>
              <ExternalLink size={18} className="text-white/50 ml-auto group-hover:text-white transition-colors" />
            </motion.a>
          )}

          {/* Contatos secundários */}
          <div className="space-y-3">
            {catalog.phone && !catalog.whatsapp && (
              <a href={`tel:${catalog.phone}`} className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors group">
                <Phone size={20} className="text-primary-400" />
                <span className="text-white/80 group-hover:text-white transition-colors">{catalog.phone}</span>
              </a>
            )}
            {catalog.email && (
              <a href={`mailto:${catalog.email}`} className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors group">
                <Mail size={20} className="text-primary-400" />
                <span className="text-white/80 group-hover:text-white transition-colors">{catalog.email}</span>
              </a>
            )}
            {catalog.address && (
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl">
                <MapPin size={20} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/60 text-sm leading-relaxed">{catalog.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Redes sociais */}
        {hasSocials && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-3 mt-8 pt-8 border-t border-white/10"
          >
            {catalog.instagram && (
              <a href={formatInstagramUrl(catalog.instagram)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white text-sm font-medium hover:opacity-90 transition-opacity">
                <Instagram size={16} /> Instagram
              </a>
            )}
            {catalog.facebook && (
              <a href={formatFacebookUrl(catalog.facebook)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 rounded-2xl text-white text-sm font-medium hover:opacity-90 transition-opacity">
                <Facebook size={16} /> Facebook
              </a>
            )}
            {catalog.website && (
              <a href={catalog.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-2xl text-white text-sm font-medium hover:bg-white/20 transition-colors">
                <Globe size={16} /> Website
              </a>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
""")

print('=== Catalog components criados ===')
