import os
BASE = r'c:\Teste\Catalogo'
def wf(rel, content):
    p = os.path.join(BASE, *rel.split('/'))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8', newline='\n').write(content)
    print(f'  OK: {rel}')

wf('apps/web/src/app/(admin)/categorias/page.tsx', """'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Pencil, Tag, Loader2 } from 'lucide-react';
import { useGetCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { Category } from '@/types';
import { toast } from 'sonner';

export default function CategoriasPage() {
  const { data: categories, isLoading } = useGetCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createCategory.mutateAsync({ name: newName.trim() });
    setNewName('');
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;
    await updateCategory.mutateAsync({ id, name: editingName.trim() });
    setEditingId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remover a categoria "${name}"? Os projetos associados perderão esta categoria.`)) return;
    await deleteCategory.mutateAsync(id);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">Categorias</h1>
        <p className="text-gray-500 mt-1 text-sm">Organize seus projetos por tipo de serviço</p>
      </div>

      {/* Formulário nova categoria */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Nova Categoria</h2>
        <div className="flex gap-3">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="Ex: Marcenaria, Elétrica, Pintura..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          <button
            onClick={handleCreate}
            disabled={!newName.trim() || createCategory.isPending}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-medium rounded-xl transition-all"
          >
            {createCategory.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Adicionar
          </button>
        </div>
      </div>

      {/* Lista de categorias */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : !categories?.length ? (
          <div className="p-12 text-center">
            <Tag size={40} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">Nenhuma categoria ainda</p>
            <p className="text-gray-300 text-sm mt-1">Crie sua primeira categoria acima</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            <AnimatePresence>
              {categories.map((cat: Category) => (
                <motion.li
                  key={cat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Tag size={16} className="text-primary-600" />
                  </div>

                  {editingId === cat.id ? (
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdate(cat.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                      className="flex-1 px-3 py-1.5 rounded-lg border border-primary-300 bg-primary-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{cat.name}</p>
                      {cat._count && (
                        <p className="text-xs text-gray-400">{cat._count.projects} projeto(s)</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    {editingId === cat.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(cat.id)}
                          className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-all"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 text-gray-500 text-sm rounded-lg hover:bg-gray-100 transition-all"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          disabled={deleteCategory.isPending}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
""")

wf('apps/web/src/app/(admin)/configuracoes/page.tsx', """'use client';

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
""")

print('=== Admin pages restantes criados ===')
