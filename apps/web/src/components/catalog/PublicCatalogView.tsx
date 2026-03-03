"use client";
import { motion } from 'framer-motion';
import { HeroSection } from './HeroSection';
import { ProjectCard } from './ProjectCard';
import { MediaGallery } from './MediaGallery';
import { ContactSection } from './ContactSection';
import type { Catalog } from '@/types';

export function PublicCatalogView({ catalog }: { catalog: Catalog }) {
  const categories = catalog.categories || [];
  const projects = catalog.projects || [];
  const media = catalog.media || [];

  return (
    <main className="min-h-screen bg-white dark:bg-slate-900">
      <HeroSection catalog={catalog} />
      {catalog.story && (
        <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
          <div className="max-w-3xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-6">Nossa História</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{catalog.story}</p>
            </motion.div>
          </div>
        </section>
      )}
      {projects.length > 0 && (
        <section id="projetos" className="py-20 bg-slate-50 dark:bg-slate-800">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-3">Portfólio</h2>
              <p className="text-slate-500 dark:text-slate-400">Conheça nossos trabalhos</p>
            </motion.div>
            {categories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-10">
                {categories.map((cat) => (
                  <a key={cat.id} href={`#cat-${cat.id}`} className="px-4 py-1.5 rounded-full text-sm font-medium bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-brand-400 hover:text-brand-500 transition">
                    {cat.name}
                  </a>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
      <MediaGallery media={media} />
      <ContactSection catalog={catalog} />
      <footer className="bg-slate-900 text-center py-8">
        <p className="text-slate-500 text-sm">
          Criado com <span className="text-brand-400">Catálogo Online</span>  {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
}
