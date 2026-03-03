'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroSection } from '@/components/catalog/HeroSection';
import { ProjectCard } from '@/components/catalog/ProjectCard';
import { MediaGallery } from '@/components/catalog/MediaGallery';
import { ContactSection } from '@/components/catalog/ContactSection';
import { Catalog, Project, Category, Media } from '@/types';
import { BookOpen, Images } from 'lucide-react';

interface Props {
  catalog: Catalog;
}

export function PublicCatalogClient({ catalog }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const projectsSec = useRef<HTMLElement>(null);

  const categories: Category[] = catalog.categories ?? [];
  const allProjects: Project[] = catalog.projects ?? [];
  const featuredProjects = allProjects.filter((p) => p.isFeatured);
  const filteredProjects = activeCategory
    ? allProjects.filter((p) => p.categoryId === activeCategory)
    : allProjects;

  // Todas as midias do catalogo + associadas a projetos
  const allMedia: Media[] = [
    ...(catalog.media ?? []),
    ...allProjects.flatMap((p) => p.media ?? []),
  ];

  const stagger = {
    container: { hidden: {}, show: { transition: { staggerChildren: 0.1 } } },
    item: { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } },
  };

  return (
    <main className="bg-white min-h-screen">
      <HeroSection catalog={catalog} />

      {/* Sobre */}
      {catalog.story && (
        <section className="py-16 px-6 md:px-12 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-50 rounded-xl"><BookOpen size={20} className="text-primary-600" /></div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900">Nossa Historia</h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-base md:text-lg whitespace-pre-line max-w-3xl">
              {catalog.story}
            </p>
          </motion.div>
        </section>
      )}

      {/* Projetos em destaque */}
      {featuredProjects.length > 0 && (
        <section className="py-10 px-6 md:px-12 bg-gradient-to-b from-primary-50/50 to-white">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-1">Destaques</h2>
              <p className="text-gray-400 text-sm mb-8">Nossos melhores trabalhos</p>
            </motion.div>

            <motion.div
              variants={stagger.container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {featuredProjects.slice(0, 4).map((project) => (
                <motion.div key={project.id} variants={stagger.item}>
                  <ProjectCard project={project} onClick={() => { setSelectedProject(project); setGalleryIndex(0); }} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Todos os projetos */}
      {allProjects.length > 0 && (
        <section ref={projectsSec} className="py-16 px-6 md:px-12 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-1">Projetos</h2>
            <p className="text-gray-400 text-sm mb-6">Explore o nosso portfolio completo</p>

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                    !activeCategory ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                      activeCategory === cat.id ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeCategory ?? 'all'}
              variants={stagger.container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            >
              {filteredProjects.map((project) => (
                <motion.div key={project.id} variants={stagger.item} layout>
                  <ProjectCard project={project} onClick={() => { setSelectedProject(project); setGalleryIndex(0); }} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </section>
      )}

      {/* Galeria de midias soltas */}
      {(catalog.media ?? []).length > 0 && (
        <section className="py-16 px-6 md:px-12 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent-50 rounded-xl"><Images size={20} className="text-accent-600" /></div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900">Galeria</h2>
              </div>
            </motion.div>
            <motion.div
              variants={stagger.container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
            >
              {(catalog.media ?? []).map((item, i) => (
                <motion.button
                  key={item.id}
                  variants={stagger.item}
                  onClick={() => { setSelectedProject({ id: '__gallery__', title: 'Galeria', media: catalog.media ?? [], isFeatured: false, order: 0, catalogId: catalog.id } as unknown as Project); setGalleryIndex(i); }}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-gray-200 group"
                >
                  {item.type === 'IMAGE' ? (
                    <img src={item.url} alt={item.caption ?? ''} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-white/60 text-xs">Video</span>
                    </div>
                  )}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      <ContactSection catalog={catalog} />

      {/* Footer */}
      <footer className="bg-black py-6 px-6 text-center">
        <p className="text-white/20 text-xs">Vitrine digital criada com CatalogoDigital.app</p>
      </footer>

      {/* Lightbox de projeto */}
      <AnimatePresence>
        {selectedProject && selectedProject.media && selectedProject.media.length > 0 && (
          <MediaGallery
            media={selectedProject.media}
            title={selectedProject.id === '__gallery__' ? 'Galeria' : selectedProject.title}
            initialIndex={galleryIndex}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
