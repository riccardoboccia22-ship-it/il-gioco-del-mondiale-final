'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Trophy, Target, Users } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkUser();
  }, []);

  if (isLoggedIn === null) {
    return <main className="min-h-screen bg-slate-950"></main>;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Effetto luce di sfondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-3xl w-full text-center z-10 mt-4">
        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-4 drop-shadow-lg">
          IL GIOCO DEL MONDIALE <span className="text-yellow-500">2026</span>
        </h1>
        <p className="text-slate-400 mb-8 uppercase tracking-widest text-xs font-bold italic">
          Il gioco dei pronostici ufficiale
        </p>

        {/* GUIDA RAPIDA: Visibile solo ai non registrati */}
        {!isLoggedIn && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] p-6 mb-10 text-left backdrop-blur-sm shadow-xl max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-[10px] font-black uppercase text-slate-500 mb-5 tracking-widest border-b border-slate-800/50 pb-2">Come Funziona?</h2>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 flex items-center justify-center shrink-0 border border-yellow-500/20">
                  <Users size={18} className="text-yellow-500" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed"><strong className="text-white">Crea il tuo profilo</strong> in pochi secondi con email o Google.</p>
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
                <p className="text-xs text-slate-400 leading-relaxed"><strong className="text-white">Paga la quota</strong> e segui la classifica aggiornata in tempo reale!</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button 
            onClick={() => router.push(isLoggedIn ? '/matches' : '/login')}
            className="px-10 py-5 bg-yellow-500 text-slate-950 font-black rounded-2xl uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(234,179,8,0.15)]"
          >
            {isLoggedIn ? 'Vai ai Pronostici' : 'Iscriviti e Gioca'}
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