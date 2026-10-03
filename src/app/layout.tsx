import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter_Tight, Newsreader } from 'next/font/google';
import { TSE_URL } from '@/lib/candidates';
import './globals.css';

const sans = Inter_Tight({ variable: '--font-sans', subsets: ['latin'] });
const serif = Newsreader({ variable: '--font-serif', subsets: ['latin'], style: ['normal', 'italic'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://lula-bolsonaro.vercel.app'),
  title: 'Lula × Flávio — o que dizem os planos de governo',
  description:
    'Pergunte qualquer tema e veja lado a lado o que os planos de governo de Lula e Flávio Bolsonaro, registrados no TSE, dizem — com a página citada.',
  openGraph: {
    title: 'Lula × Flávio — o que dizem os planos de governo',
    description: 'Economia, segurança, PCC, pena de morte, programas sociais: respostas lado a lado, com página citada.',
    locale: 'pt_BR',
    type: 'website',
    siteName: 'Lula × Flávio',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <header className="site-header">
          <Link href="/" className="brand">
            <span className="brand-lula">Lula</span>
            <span className="brand-x">×</span>
            <span className="brand-flavio">Flávio</span>
          </Link>
          <nav>
            <Link href="/#temas">Temas</Link>
            <Link href="/fontes">Fontes</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>
            Projeto independente, sem vínculo com candidatos, partidos ou com o TSE. As respostas resumem apenas os planos
            de governo oficiais e podem conter erros — confira sempre a página citada no{' '}
            <a href={TSE_URL} target="_blank" rel="noreferrer">
              documento registrado no TSE
            </a>
            .
          </p>
        </footer>
      </body>
    </html>
  );
}
