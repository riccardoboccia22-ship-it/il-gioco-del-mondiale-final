'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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

  // Previene il "flash" dei bottoni prima che Supabase verifichi chi sei
  if (isLoggedIn === null) {
    return <main className="min-h-screen bg-slate-950"></main>;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Effetto luce di sfondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-3xl w-full text-center z-10">
        <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-6 drop-shadow-lg">
          IL GIOCO DEL MONDIALE <span className="text-yellow-500">2026</span>
        </h1>
        <p className="text-slate-400 mb-10 uppercase tracking-widest text-xs font-bold italic">
          Il gioco dei pronostici ufficiale
        </p>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button 
            onClick={() => router.push(isLoggedIn ? '/matches' : '/login')}
            className="px-10 py-5 bg-yellow-500 text-slate-950 font-black rounded-2xl uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(234,179,8,0.15)]"
          >
            {isLoggedIn ? 'Vai ai Pronostici' : 'Inizia a Giocare'}
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