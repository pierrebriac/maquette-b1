import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { StoreInitializer } from '@/components/layout/store-initializer';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex">
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
