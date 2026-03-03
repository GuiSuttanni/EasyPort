'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Pencil, FolderOpen, Star, X, Loader2, ImagePlus, Image as ImageIcon } from 'lucide-react';
import { useGetProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects';
import { useGetCategories } from '@/hooks/useCategories';
import { useUploadMedia, useDeleteMedia } from '@/hooks/useMedia';
import { Project } from '@/types';
import Image from 'next/image';

interface ProjectFormData {
  title: string;
  description: string;
  categoryId: string;
  isFeatured: boolean;
}

export default function ProjetosPage() {
  const { data: projects, isLoading } = useGetProjects();
  const { data: categories } = useGetCategories();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectFormData>({ title: '', description: '', categoryId: '', isFeatured: false });
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadMedia = useUploadMedia({ projectId: activeProjectId ?? undefined });
  const deleteMedia = useDeleteMedia();

  const resetForm = () => {
    setForm({ title: '', description: '', categoryId: '', isFeatured: false });
    setEditingProject(null);
    setShowForm(false);
    setActiveProjectId(null);
    setUploadProgress(0);
  };

  const openEdit = (project: Project) => {
    setForm({
      title: project.title,
      description: project.description || '',
      categoryId: project.categoryId || '',
      isFeatured: project.isFeatured,
    });
    setEditingProject(project);
    setActiveProjectId(project.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const body = {
      title: form.title.trim(),
      description: form.description || undefined,
      categoryId: form.categoryId || undefined,
      isFeatured: form.isFeatured,
    };

    if (editingProject) {
      await updateProject.mutateAsync({ id: editingProject.id, ...body });
    } else {
      const created = await createProject.mutateAsync(body);
      setActiveProjectId(created.id);
      setEditingProject(created);
      return; // Fica no form para upload de imagens
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !activeProjectId) return;
    await uploadMedia.mutateAsync({
      files,
      onProgress: setUploadProgress,
    });
    setUploadProgress(0);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDeleteMedia = async (mediaId: string) => {
    await deleteMedia.mutateAsync(mediaId);
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Remover "${project.title}"? Todas as mídias do projeto também serão removidas.`)) return;
    await deleteProject.mutateAsync(project.id);
  };

  const isPending = createProject.isPending || updateProject.isPending;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Projetos</h1>
          <p className="text-gray-500 mt-1 text-sm">Organize seus trabalhos e portfólio</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={18} />
          Novo projeto
        </button>
      </div>

      {/* Formulário */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-primary-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">
                  {editingProject ? 'Editar projeto' : 'Novo projeto'}
                </h2>
                <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">                {/* Upload de imagens — aparece após criar o projeto */}
                {activeProjectId && (
                  <div className="rounded-xl border-2 border-dashed border-primary-200 bg-primary-50 p-4">
                    <p className="text-sm font-medium text-primary-700 mb-3 flex items-center gap-2">
                      <ImageIcon size={16} /> Fotos do projeto
                    </p>

                    {/* Thumbs das fotos já enviadas */}
                    {(() => {
                      const proj = projects?.find((p: Project) => p.id === activeProjectId);
                      const medias = proj?.media ?? [];
                      return medias.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {medias.map((m: any) => (
                            <div key={m.id} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                              <Image src={m.url} alt={m.caption || ''} fill className="object-cover" />
                              <button
                                type="button"
                                onClick={() => handleDeleteMedia(m.id)}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                              >
                                <Trash2 size={16} className="text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : null;
                    })()}

                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      disabled={uploadMedia.isPending}
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-primary-300 text-primary-700 rounded-xl text-sm font-medium hover:bg-primary-100 transition-all disabled:opacity-60"
                    >
                      {uploadMedia.isPending ? (
                        <><Loader2 size={15} className="animate-spin" /> Enviando {uploadProgress}%</>
                      ) : (
                        <><ImagePlus size={15} /> Adicionar fotos</>
                      )}
                    </button>
                  </div>
                )}                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Título *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Ex: Cozinha planejada - Casa Lima"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Descreva o projeto, materiais, cliente..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria</label>
                    <select
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    >
                      <option value="">Sem categoria</option>
                      {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3 mt-5">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={form.isFeatured}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded accent-primary-600"
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                      Destaque na vitrine
                    </label>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all"
                  >
                    {isPending ? <Loader2 size={18} className="animate-spin" /> : null}
                    {editingProject ? 'Salvar alterações' : 'Criar projeto e adicionar fotos'}
                  </button>
                  {activeProjectId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                    >
                      Concluir
                    </button>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de projetos */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : !projects?.length ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <FolderOpen size={48} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Nenhum projeto ainda</p>
          <p className="text-gray-300 text-sm mt-1">Crie seu primeiro projeto para organizar seus trabalhos</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <AnimatePresence>
            {projects.map((project: Project) => {
              const coverMedia = project.media?.[0];
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-card transition-all duration-300"
                >
                  <div className="h-32 bg-gray-100 relative overflow-hidden">
                    {coverMedia ? (
                      <Image
                        src={coverMedia.url}
                        alt={project.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FolderOpen size={32} className="text-gray-200" />
                      </div>
                    )}
                    {project.isFeatured && (
                      <div className="absolute top-2 right-2 bg-accent-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <Star size={10} />
                        Destaque
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{project.title}</h3>
                        {project.category && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-primary-50 text-primary-600 text-xs rounded-full font-medium">
                            {project.category.name}
                          </span>
                        )}
                        {project.description && (
                          <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">{project.description}</p>
                        )}
                        <p className="text-xs text-gray-300 mt-1">{project.media?.length || 0} foto(s)</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => openEdit(project)}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(project)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
