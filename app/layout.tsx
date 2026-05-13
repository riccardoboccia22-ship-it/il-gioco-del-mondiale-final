import './globals.css';
import type { Metadata, Viewport } from 'next'; 
import { Inter } from 'next/font/google';
import Navbar from './components/Navbar'; 
import { Toaster } from 'react-hot-toast'; 

const inter = Inter({ subsets: ['latin'] });

// Configurazioni per mobile: Viewport e Colori del tema separati (Best practice Next.js 14+)
export const viewport: Viewport = {
  themeColor: '#eab308',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Per evitare zoom indesiderati sui telefoni (fondamentale per la UX dei tuoi amici)
};

// Configurazione unica: Metadati + PWA + Open Graph (WhatsApp/Social)
export const metadata: Metadata = {
  title: 'Il Gioco del Mondiale 2026!', 
  description: 'La Convocazione Ufficiale. Entra, fai i tuoi pronostici e sfida gli amici!',
  manifest: '/manifest.json',
  
  // URL base del tuo dominio (sostituisci se il dominio reale è diverso)
  metadataBase: new URL('https://www.iltuopronostico.it'),
  
  // Impostazioni specifiche per iOS (iPhone)
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mundialito', // Il nome che apparirà sotto l'icona su iPhone
  },

  // Forza Safari a usare l'icona
  icons: {
    apple: '/icon-512x512.png',
  },

  // OPEN GRAPH: La magia per far apparire l'anteprima su WhatsApp, Facebook, Telegram
  openGraph: {
    title: 'Il Gioco del Mondiale 2026 🏆',
    description: 'La Convocazione Ufficiale. Entra, fai i tuoi pronostici e sfida gli amici!',
    url: 'https://www.iltuopronostico.it',
    siteName: 'Mundialito 2026',
    images: [
      {
        url: '/logo.png', // Assicurati che questo corrisponda al tuo file quadrato in /public
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

        {/* Container principale con padding bottom per la navbar */}
        <div className="pb-24">
          {children}
        </div>
        
        {/* La barra di navigazione fissa in fondo */}
        <Navbar />
      </body>
    </html>
  );
}