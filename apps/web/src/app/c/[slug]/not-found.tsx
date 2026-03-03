import Link from 'next/link';

export default function CatalogNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-6">
      <h1 className="text-6xl font-display font-bold text-primary-400 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Catalogo nao encontrado</h2>
      <p className="text-white/40 text-sm mb-8 text-center">Este catalogo pode nao existir ou ainda nao ter sido publicado.</p>
      <Link href="/" className="px-6 py-3 bg-primary-600 rounded-2xl text-white font-medium hover:bg-primary-700 transition-colors">
        Voltar ao inicio
      </Link>
    </div>
  );
}
