import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { StoreInitializer } from '@/components/layout/store-initializer';
import { Toaster } from '@/components/ui/sonner';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Apertum — Plateforme de recherche en santé numérique',
  description: 'Maquette fonctionnelle de la plateforme Apertum',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${plusJakartaSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex font-sans">
        <StoreInitializer>
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-7xl p-8">{children}</div>
          </main>
          <Toaster />
        </StoreInitializer>
      </body>
    </html>
  );
}
