import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SiteProvider } from '@/components/site-context';

export const metadata: Metadata = {
  title: 'Min-shop | Marketplace nouvelle generation pour l\'Afrique',
  description: 'Plateforme marketplace moderne pour acheter et vendre facilement au Cameroun et en Afrique.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <SiteProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </SiteProvider>
      </body>
    </html>
  );
}
