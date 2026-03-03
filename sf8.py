import os
BASE = r'c:\Teste\Catalogo'
def wf(rel, content):
    p = os.path.join(BASE, *rel.split('/'))
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8', newline='\n').write(content)
    print(f'  OK: {rel}')

wf('apps/web/src/app/(admin)/catalogo/page.tsx', """'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Save, Globe, Phone, Instagram, Facebook, MapPin, Mail, Eye } from 'lucide-react';
import { useGetMyCatalog, useUpdateCatalog } from '@/hooks/useCatalog';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

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
    }
  }, [catalog, reset]);

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
""")

print('=== Catalog page criado ===')
