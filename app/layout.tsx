import './globals.css';
import type { Metadata } from 'next'; 
import { Inter } from 'next/font/google';
import Navbar from './components/Navbar'; 
import LiveBanner from './components/LiveBanner'; // <-- 1. IMPORTATO IL BANNER
import { Toaster } from 'react-hot-toast'; 
import OneSignalInit from './components/OneSignalInit'; // <-- AGGIUNTO L'IMPORT PER LE NOTIFICHE PUSH

const inter = Inter({ subsets: ['latin'] });

// Configurazione Metadati + PWA + Open Graph compatibile con Next.js 13
export const metadata: Metadata = {
  title: 'Il Gioco del Mondiale 2026!', 
  description: 'La Convocazione Ufficiale. Entra, fai i tuoi pronostici e sfida gli amici!',
  manifest: '/manifest.json',
  
  // Nelle versioni precedenti di Next.js vanno qui dentro:
  themeColor: '#eab308',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  
  // URL base del tuo dominio
  metadataBase: new URL('https://www.iltuopronostico.it'),
  
  // Impostazioni specifiche per iOS (iPhone)
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mundialito',
  },

  // Forza Safari a usare l'icona
  icons: {
    apple: '/icon-512x512.png',
  },

  // OPEN GRAPH: Anteprima per WhatsApp, Facebook, Telegram
  openGraph: {
    title: 'Il Gioco del Mondiale 2026 🏆',
    description: 'La Convocazione Ufficiale. Entra, fai i tuoi pronostici e sfida gli amici!',
    url: 'https://www.iltuopronostico.it',
    siteName: 'Mundialito 2026',
    images: [
      {
        url: 'https://www.iltuopronostico.it/logo.png', 
        width: 800,
        height: 800,
        alt: 'Logo Mondiale 2026',
      },
    ],
    locale: 'it_IT',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className={`${inter.className} bg-slate-950 text-white`}>
        
        {/* IL NOSTRO AGENTE SEGRETO PER LE NOTIFICHE (Non si vede, ma c'è) */}
        <OneSignalInit />

        {/* Configurazione dei messaggi a comparsa (Toast) */}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0f172a', // slate-950
              color: '#fff',
              border: '1px solid #1e293b', // slate-800
              fontSize: '11px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              borderRadius: '1rem',
              padding: '12px 24px',
            },
            success: {
              iconTheme: {
                primary: '#eab308', // yellow-500
                secondary: '#0f172a',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444', // red-500
                secondary: '#0f172a',
              },
            },
          }}
        />

        {/* 2. IL NOSTRO SMART BANNER INSERITO QUI (sarà visibile ovunque) */}
        <LiveBanner />

        {/* Container principale con padding bottom per la navbar */}
        {/* Aggiunto pt-14 per evitare che il banner copra i titoli delle pagine */}
        <div className="pb-24 pt-14">
          {children}
        </div>
        
        {/* La barra di navigazione fissa in fondo */}
        <Navbar />
      </body>
    </html>
  );
}