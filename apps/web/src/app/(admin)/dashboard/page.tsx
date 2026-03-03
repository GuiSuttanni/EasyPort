'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FolderOpen, Image, Tag, ExternalLink, Copy, CheckCircle, Eye, EyeOff, TrendingUp } from 'lucide-react';
import { useGetDashboardStats, useUpdateCatalog } from '@/hooks/useCatalog';
import { getPublicCatalogUrl } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const { data: stats, isLoading } = useGetDashboardStats();
  const updateCatalog = useUpdateCatalog();
  const [copied, setCopied] = useState(false);

  const publicUrl = stats ? getPublicCatalogUrl(stats.catalogSlug) : '';

  const handleCopy = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePublish = () => {
    if (!stats) return;
    updateCatalog.mutate({ isPublished: !stats.isPublished });
  };

  const statsCards = stats
    ? [
        { label: 'Projetos', value: stats.projectCount, icon: FolderOpen, color: 'blue', href: '/projetos' },
        { label: 'Mídias', value: stats.mediaCount, icon: Image, color: 'purple', href: '/midia' },
        { label: 'Categorias', value: stats.categoryCount, icon: Tag, color: 'orange', href: '/categorias' },
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Header */}
        <motion.div variants={item}>
          <h1 className="text-2xl font-display font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Visão geral do seu catálogo</p>
        </motion.div>

        {/* Link público */}
        <motion.div variants={item} className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-primary-200 font-medium mb-1">Seu link público</p>
              <p className="text-lg font-bold truncate">{publicUrl || '...'}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleCopy}
                className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                title="Copiar link"
              >
                {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
              </button>
              {publicUrl && (
                <Link
                  href={publicUrl}
                  target="_blank"
                  className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
                  title="Abrir catálogo"
                >
                  <ExternalLink size={18} />
                </Link>
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${stats?.isPublished ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <span className="text-sm text-primary-100">
                {stats?.isPublished ? 'Publicado e visível' : 'Rascunho - não visível ao público'}
              </span>
            </div>
            <button
              onClick={togglePublish}
              disabled={updateCatalog.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
            >
              {stats?.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
              {stats?.isPublished ? 'Despublicar' : 'Publicar'}
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-28 rounded-2xl" />
              ))
            : statsCards.map(({ label, value, icon: Icon, color, href }) => (
                <motion.div key={label} variants={item}>
                  <Link href={href} className="block group">
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-100`}>
                          <Icon size={20} className={`text-${color}-600`} />
                        </div>
                        <TrendingUp size={16} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                      </div>
                      <p className="text-3xl font-display font-bold text-gray-900">{value}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>

        {/* Quick actions */}
        <motion.div variants={item}>
          <h2 className="text-lg font-display font-bold text-gray-900 mb-3">Ações rápidas</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Editar catálogo', href: '/catalogo', icon: '' },
              { label: 'Novo projeto', href: '/projetos', icon: '' },
              { label: 'Enviar fotos', href: '/midia', icon: '' },
              { label: 'Nova categoria', href: '/categorias', icon: '' },
            ].map(({ label, href, icon }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-card transition-all duration-200 group"
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-medium text-gray-600 text-center group-hover:text-primary-600 transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
