'use client';

import { useAuthStore } from '@/store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

const PAGE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/catalogo': 'Meu Catálogo',
  '/projetos': 'Projetos',
  '/midia': 'Mídias',
  '/categorias': 'Categorias',
  '/configuracoes': 'Configurações',
};

export function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const pageLabel = PAGE_LABELS[pathname] ?? 'Painel';

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Espaço para o botão menu mobile (fixed) */}
        <div className="lg:hidden w-10 flex-shrink-0" />

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="hidden sm:block text-xs text-gray-400 font-medium">Painel</span>
          <ChevronRight size={12} className="hidden sm:block text-gray-300 flex-shrink-0" />
          <span className="text-sm font-semibold text-gray-800 truncate">{pageLabel}</span>
        </div>

        {/* Usuário + logout */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={15} className="text-primary-600" />
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
              {user?.name?.split(' ')[0]}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Sair da conta"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
