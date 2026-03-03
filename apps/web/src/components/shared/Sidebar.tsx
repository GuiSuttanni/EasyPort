'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookImage, FolderOpen, Image, Tag, Settings, ExternalLink, Briefcase, X, Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Meu Catálogo', href: '/catalogo', icon: BookImage },
  { label: 'Projetos', href: '/projetos', icon: FolderOpen },
  { label: 'Mídias', href: '/midia', icon: Image },
  { label: 'Categorias', href: '/categorias', icon: Tag },
  { label: 'Configurações', href: '/configuracoes', icon: Settings },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const catalog = useAuthStore((s) => s.catalog);

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Briefcase size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 font-medium">Painel Admin</p>
            <p className="text-sm font-bold text-gray-900 truncate">{catalog?.name || 'Meu Negócio'}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
              {label}
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {catalog?.slug && (
        <div className="p-4 border-t border-gray-100">
          <Link
            href={`/c/${catalog.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-accent-600 bg-accent-50 hover:bg-accent-100 transition-all"
          >
            <ExternalLink size={16} />
            Ver catálogo público
          </Link>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-card border border-gray-100"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} className="text-gray-600" />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-50"
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 shadow-sm z-30">
        <SidebarContent />
      </aside>
    </>
  );
}
