'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Save, Globe, Phone, Instagram, Eye, Loader2, ImagePlus } from 'lucide-react';
import { useGetMyCatalog, useUpdateCatalog, useUploadCatalogImage } from '@/hooks/useCatalog';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import Image from 'next/image';

const catalogSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().max(2000).optional(),
  story: z.string().max(5000).optional(),
  phone: z.string().max(20).optional(),
  whatsapp: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().max(300).optional(),
  instagram: z.string().max(100).optional(),
  facebook: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal('')),
});

type CatalogForm = z.infer<typeof catalogSchema>;

export default function CatalogoPage() {
  const { data: catalog, isLoading } = useGetMyCatalog();
  const updateCatalog = useUpdateCatalog();
  const catalogStore = useAuthStore((s) => s.catalog);
  const [isPublished, setIsPublished] = useState(false);
  const uploadImage = useUploadCatalogImage();
  const coverRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<CatalogForm>({
    resolver: zodResolver(catalogSchema),
    defaultValues: {
      name: '',
      description: '',
      story: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      instagram: '',
      facebook: '',
      website: '',
    },
  });

  useEffect(() => {
    if (catalog) {
      reset({
        name: catalog.name || '',
        description: catalog.description || '',
        story: catalog.story || '',
        phone: catalog.phone || '',
        whatsapp: catalog.whatsapp || '',
        email: catalog.email || '',
        address: catalog.address || '',
        instagram: catalog.instagram || '',
        facebook: catalog.facebook || '',
        website: catalog.website || '',
      });
      setIsPublished(catalog.isPublished ?? false);
    }
  }, [catalog, reset]);

  const handleTogglePublish = () => {
    const next = !isPublished;
    setIsPublished(next);
    updateCatalog.mutate({ isPublished: next } as any);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage.mutate(file);
    e.target.value = '';
  };

  const onSubmit = (values: CatalogForm) => {
    const data = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === '' ? null : v])
    );
    updateCatalog.mutate(data as any);
  };

  const sections = [
    {
      title: 'Informações Básicas',
      fields: [
        { name: 'name', label: 'Nome do estabelecimento *', placeholder: 'Ex: Marcenaria Silva', type: 'text' },
        { name: 'description', label: 'Descrição curta', placeholder: 'Descreva seus serviços em poucas palavras...', type: 'textarea', rows: 3 },
        { name: 'story', label: 'Nossa história', placeholder: 'Conte a história do seu negócio, valores, missão...', type: 'textarea', rows: 6 },
      ],
    },
    {
      title: 'Contato',
      icon: <Phone size={18} />,
      fields: [
        { name: 'phone', label: 'Telefone', placeholder: '(11) 99999-9999', type: 'text' },
        { name: 'whatsapp', label: 'WhatsApp', placeholder: '(11) 99999-9999', type: 'text' },
        { name: 'email', label: 'E-mail de contato', placeholder: 'contato@seunegocio.com', type: 'email' },
        { name: 'address', label: 'Endereço', placeholder: 'Rua das Flores, 123 - São Paulo, SP', type: 'text' },
      ],
    },
    {
      title: 'Redes Sociais',
      icon: <Instagram size={18} />,
      fields: [
        { name: 'instagram', label: 'Instagram', placeholder: '@seuperfil ou URL completa', type: 'text' },
        { name: 'facebook', label: 'Facebook', placeholder: 'facebook.com/seuperfil', type: 'text' },
        { name: 'website', label: 'Website', placeholder: 'https://seunegocio.com.br', type: 'text' },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-48 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Meu Catálogo</h1>
          <p className="text-gray-500 mt-1 text-sm">Personalize as informações do seu negócio</p>
        </div>
        {catalogStore?.slug && (
          <Link
            href={`/c/${catalogStore.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-100 transition-all"
          >
            <Eye size={16} />
            Pré-visualizar
          </Link>
        )}
      </div>

      {/* Toggle de publicação */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center justify-between p-5 rounded-2xl border mb-6 ${
          isPublished
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}
      >
        <div>
          <p className={`font-semibold text-sm ${isPublished ? 'text-green-800' : 'text-yellow-800'}`}>
            {isPublished ? '✓ Catálogo publicado' : '⚠ Catálogo não publicado'}
          </p>
          <p className={`text-xs mt-0.5 ${isPublished ? 'text-green-600' : 'text-yellow-600'}`}>
            {isPublished
              ? 'Seu catálogo está visível publicamente'
              : 'Publique para que clientes possam acessar seu catálogo'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleTogglePublish}
          disabled={updateCatalog.isPending}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none disabled:opacity-60 ${
            isPublished ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          {updateCatalog.isPending ? (
            <Loader2 size={14} className="absolute inset-0 m-auto text-white animate-spin" />
          ) : (
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                isPublished ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          )}
        </button>
      </motion.div>

      {/* Aparência — Logo + Capa */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden"
      >
        {/* Foto de capa */}
        <div className="relative h-36 sm:h-48 bg-gradient-to-br from-primary-900 via-primary-700 to-accent-600 group">
          {catalog?.coverUrl && (
            <Image src={catalog.coverUrl} alt="Capa" fill className="object-cover" />
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
            <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <button
              type="button"
              onClick={() => coverRef.current?.click()}
              disabled={uploadImage.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 text-white text-sm font-medium rounded-xl backdrop-blur-sm border border-white/20 transition-all disabled:opacity-60"
            >
              {uploadImage.isPending
                ? <Loader2 size={15} className="animate-spin" />
                : <ImagePlus size={15} />}
              {catalog?.coverUrl ? 'Trocar foto de capa' : 'Adicionar foto de capa'}
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          <p className="text-xs text-gray-400">Esta imagem será exibida como plano de fundo do seu catálogo público.</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {sections.map(({ title, fields }) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <h2 className="text-base font-semibold text-gray-900 mb-5">{title}</h2>
            <div className="space-y-4">
              {fields.map(({ name, label, placeholder, type, rows }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  {type === 'textarea' ? (
                    <textarea
                      {...register(name as keyof CatalogForm)}
                      placeholder={placeholder}
                      rows={rows}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    />
                  ) : (
                    <input
                      {...register(name as keyof CatalogForm)}
                      type={type}
                      placeholder={placeholder}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  )}
                  {errors[name as keyof CatalogForm] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[name as keyof CatalogForm]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <div className="sticky bottom-4">
          <button
            type="submit"
            disabled={updateCatalog.isPending || !isDirty}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            {updateCatalog.isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} />
                Salvar alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
