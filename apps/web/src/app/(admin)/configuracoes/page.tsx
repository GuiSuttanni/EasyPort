'use client';

import { useAuthStore } from '@/store/auth.store';
import { useUpdateCatalog } from '@/hooks/useCatalog';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ExternalLink } from 'lucide-react';
import { getPublicCatalogUrl } from '@/lib/utils';
import Link from 'next/link';

export default function ConfiguracoesPage() {
  const catalog = useAuthStore((s) => s.catalog);
  const user = useAuthStore((s) => s.user);
  const updateCatalog = useUpdateCatalog();

  const publicUrl = catalog ? getPublicCatalogUrl(catalog.slug) : '';

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-gray-900 mb-6">Configurações</h1>

      <div className="space-y-4">
        {/* Info da conta */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <h2 className="font-semibold text-gray-900 mb-4">Dados da conta</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Nome</p>
              <p className="text-gray-900 mt-0.5">{user?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">E-mail</p>
              <p className="text-gray-900 mt-0.5">{user?.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Publicação */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <h2 className="font-semibold text-gray-900 mb-4">Publicação do catálogo</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">
                {catalog?.isPublished ? 'Catálogo público' : 'Catálogo oculto'}
              </p>
              <p className="text-sm text-gray-400 mt-0.5">
                {catalog?.isPublished
                  ? 'Seu catálogo está visível para qualquer pessoa com o link'
                  : 'Somente você consegue visualizar seu catálogo'}
              </p>
            </div>
            <button
              onClick={() => updateCatalog.mutate({ isPublished: !catalog?.isPublished })}
              disabled={updateCatalog.isPending}
              className={`relative w-12 h-6 rounded-full transition-all ${
                catalog?.isPublished ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  catalog?.isPublished ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {catalog?.slug && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-2">Link do catálogo</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-gray-50 rounded-lg px-3 py-2 text-gray-600 truncate">
                  {publicUrl}
                </code>
                <Link href={publicUrl} target="_blank"
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                  <ExternalLink size={16} />
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
