'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Trophy, Target, Users, Share, X } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [showPwaPrompt, setShowPwaPrompt] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkUser();

    // Rileva se l'utente sta già usando la PWA installata sulla Home
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (!isStandalone) {
      setTimeout(() => setShowPwaPrompt(true), 1500);
    }
  }, []);

  if (isLoggedIn === null) {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans">
         <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-6 pt-24 pb-24 relative overflow-x-hidden font-sans">
      
      {/* PWA INSTALL BANNER */}
      {showPwaPrompt && (
        <div className="absolute top-0 left-0 w-full bg-slate-900 border-b border-slate-800 p-3 sm:p-4 flex items-center justify-between z-50 animate-in slide-in-from-top duration-500 shadow-xl">
          <div className="flex items-center gap-3 sm:gap-4 text-slate-300">
             <div className="bg-yellow-500/20 p-2 rounded-xl border border-yellow-500/30 shrink-0">
               <Share size={16} className="text-yellow-500" />
             </div>
             <p className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest leading-tight">
               📱 Per una migliore esperienza, premi <strong className="text-white">Condividi</strong> e seleziona <strong className="text-white">"Aggiungi a Schermata Home"</strong>
             </p>
          </div>
          <button 
            onClick={() => setShowPwaPrompt(false)} 
            className="p-2 shrink-0 text-slate-500 hover:text-white bg-slate-800 rounded-lg ml-2"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Effetto luce di sfondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-3xl w-full text-center z-10">
        
        {/* NUOVO LOGO A SCHERMO INTERO NEL CERCHIO */}
        <div className="mx-auto w-48 h-48 sm:w-64 sm:h-64 mb-8 rounded-full overflow-hidden shadow-[0_0_60px_rgba(234,179,8,0.3)] animate-in zoom-in duration-700 relative bg-slate-900">
          <img 
            src="/logo.png" 
            alt="Logo Il Gioco del Mondiale" 
            className="w-full h-full object-cover scale-[1.25] origin-center"
          />
        </div>

        <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4 drop-shadow-lg">
          IL GIOCO DEL MONDIALE <span className="text-yellow-500">2026</span>
        </h1>
        <p className="text-slate-400 mb-10 uppercase tracking-widest text-xs font-bold italic">
          La Convocazione Ufficiale
        </p>

        {/* GUIDA RAPIDA */}
        {!isLoggedIn && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] p-6 mb-10 text-left backdrop-blur-sm shadow-xl max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-[10px] font-black uppercase text-slate-500 mb-5 tracking-widest border-b border-slate-800/50 pb-2">Come Funziona?</h2>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 flex items-center justify-center shrink-0 border border-yellow-500/20">
                  <Users size={18} className="text-yellow-500" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed"><strong className="text-white">Crea il tuo profilo</strong> in pochi secondi con il tuo nome da battaglia.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <Target size={18} className="text-emerald-500" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed"><strong className="text-white">Fai i tuoi pronostici</strong> su gironi, tabellone e bonus entro l'11 Giugno.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <Trophy size={18} className="text-blue-500" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed"><strong className="text-white">Sfida gli amici</strong> e segui la classifica aggiornata in tempo reale!</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button 
            onClick={() => router.push(isLoggedIn ? '/matches' : '/login?mode=register')}
            className="px-10 py-5 bg-yellow-500 text-slate-950 font-black rounded-2xl uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(234,179,8,0.15)] flex items-center justify-center gap-2"
          >
            {isLoggedIn ? 'Vai ai Pronostici ⚽' : 'Accetta la Sfida 🏆'}
          </button>
          
          <button 
            onClick={() => router.push(isLoggedIn ? '/profile' : '/login')}
            className="px-10 py-5 bg-slate-900 border border-slate-800 text-white font-black rounded-2xl uppercase text-xs tracking-widest hover:bg-slate-800 active:scale-95 transition-all"
          >
            {isLoggedIn ? 'Il mio Profilo' : 'Accedi'}
          </button>
        </div>
      </div>
    </main>
  );
}