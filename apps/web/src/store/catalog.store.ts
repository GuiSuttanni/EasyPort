import { create } from 'zustand';
import type { Catalog } from '@/types';

interface CatalogState {
  catalog: Catalog | null;
  setCatalog: (catalog: Catalog) => void;
  clearCatalog: () => void;
}

export const useCatalogStore = create<CatalogState>()((set) => ({
  catalog: null,
  setCatalog: (catalog) => set({ catalog }),
  clearCatalog: () => set({ catalog: null }),
}));
