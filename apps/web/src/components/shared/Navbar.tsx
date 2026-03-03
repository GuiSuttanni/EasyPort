'use client';

import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { api } from '@/lib/api';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex items-center justify-between">
        <div className="lg:hidden w-8" />
        <h2 className="text-sm font-medium text-gray-500">
          Painel de Controle
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={15} className="text-primary-600" />
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">
              {user?.name?.split(' ')[0]}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
