'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Images, Star } from 'lucide-react';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
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
