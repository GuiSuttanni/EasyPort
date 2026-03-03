import type { Metadata } from 'next';
import { Inter, Bricolage_Grotesque } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Catalogo Online - Vitrine Digital para Seu Negócio',
    template: '%s | Catalogo Online',
  },
  description: 'Crie sua vitrine digital profissional. Mostre seus trabalhos, projetos e serviços de forma elegante e moderna.',
  keywords: ['catálogo online', 'vitrine digital', 'portfólio', 'prestador de serviços'],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Catalogo Online',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${bricolage.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
