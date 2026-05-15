'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { User, Trophy, Star, ListOrdered, Users, Gamepad2, Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const navItems = [
    { label: 'Profilo', icon: <User size={20} strokeWidth={2.5} />, path: '/profile' },
    { label: 'Fase Gironi', icon: <Gamepad2 size={20} strokeWidth={2.5} />, path: '/matches' },
    { label: 'Fase Finale', icon: <Trophy size={20} strokeWidth={2.5} />, path: '/bracket' },
    { label: 'Bonus', icon: <Star size={20} strokeWidth={2.5} />, path: '/bonus' },
    { label: 'Classifica', icon: <ListOrdered size={20} strokeWidth={2.5} />, path: '/leaderboard' },
    { label: 'Globale', icon: <Users size={20} strokeWidth={2.5} />, path: '/tutti-i-pronostici' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-between relative overflow-hidden">
      
      {/* Sfondo Sfumato di Design */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 opacity-70"></div>

      {/* --- CONTENUTO PRINCIPALE (CENTRATO) --- */}
      <div className="flex-1 flex flex-col items-center justify-center gap-10 w-full max-w-sm px-6 z-10 pt-16 pb-24 animate-in fade-in zoom-in-95 duration-700">
        
        {/* LOGO ICONICO (A TUTTO CERCHIO) */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56">
          <div className="absolute inset-0 bg-yellow-500 rounded-full blur-[30px] opacity-20 animate-pulse"></div>
          
          <div className="relative w-full h-full rounded-full shadow-2xl overflow-hidden group hover:shadow-[0_0_40px_rgba(234,179,8,0.4)] transition-all duration-300">
            <img 
              src="/icon-512x512.png"
              alt="Mundialito 2026" 
              className="w-full h-full object-cover z-10 group-hover:scale-105 transition-transform duration-500" 
            />
          </div>
        </div>

        {/* TITOLO ELEGANTE E UNICO */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tight text-white mb-2 leading-none">
            Mundialito
          </h1>
          <h2 className="text-4xl sm:text-5xl font-black text-yellow-500 tracking-tighter leading-none mb-3">
            2026
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic opacity-80">
            La Convocazione Ufficiale
          </p>
        </div>

        {/* PULSANTI D'AZIONE DINAMICI */}
        <div className="w-full pt-2 min-h-[160px] flex flex-col justify-center">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
            </div>
          ) : user ? (
            // UTENTE LOGGATO: Vede i tasti per entrare nel vivo del gioco
            <div className="space-y-4 w-full">
              <button 
                onClick={() => router.push('/matches')}
                className="w-full py-5 bg-yellow-500 text-slate-950 font-black rounded-3xl uppercase tracking-widest text-xs shadow-xl shadow-yellow-500/10 hover:bg-yellow-400 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Vai ai Pronostici ⚽
              </button>
              
              <button 
                onClick={() => router.push('/profile')}
                className="w-full py-5 bg-slate-900 border-2 border-slate-800 text-white font-black rounded-3xl uppercase tracking-widest text-xs hover:border-slate-700 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                Il Mio Profilo
              </button>
            </div>
          ) : (
            // UTENTE NON LOGGATO: Due scelte chiare per evitare errori
            <div className="space-y-3 w-full flex flex-col items-center">
              <button 
                onClick={() => router.push('/login?mode=register')}
                className="w-full py-5 bg-yellow-500 text-slate-950 font-black rounded-3xl uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:bg-yellow-400 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Nuovo Giocatore? Iscriviti 🏆
              </button>
              
              <button 
                onClick={() => router.push('/login?mode=login')}
                className="w-full py-5 bg-slate-900 border-2 border-slate-800 text-white font-black rounded-3xl uppercase tracking-widest text-xs hover:border-slate-700 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                Hai già un account? Accedi
              </button>
              
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center mt-2 opacity-60">
                Un account è richiesto per giocare
              </p>
            </div>
          )}
        </div>

        {/* Info Extra */}
        <div className="text-center pt-2 opacity-40">
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Organizzato da Ricky</span>
        </div>
      </div>

      {/* --- NAVBAR INFERIORE --- */}
      <nav className="fixed bottom-0 left-0 w-full z-20 bg-slate-950/90 backdrop-blur-md border-t border-slate-900 pb-safe-area shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        <div className="max-w-md mx-auto flex items-center justify-around py-2 px-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.path)}
                className="relative flex flex-col items-center justify-between h-12 group transition-all"
                style={{ width: `${100 / navItems.length}%` }}
              >
                <div className="flex items-end justify-center h-6 w-full">
                  <div className={`transition-all duration-300 ${isActive ? 'text-yellow-500 scale-110 -translate-y-1' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {item.icon}
                  </div>
                </div>
                
                <div className="flex items-center justify-center h-6 w-full px-0.5">
                  <span className={`text-[7px] sm:text-[8px] font-black uppercase text-center leading-[1.1] tracking-wider transition-colors ${isActive ? 'text-yellow-500' : 'text-slate-600 group-hover:text-slate-400'}`}>
                    {item.label}
                  </span>
                </div>

                {isActive && (
                  <div className="absolute -bottom-1.5 w-1.5 h-1.5 bg-yellow-500 rounded-full shadow-[0_0_6px_rgba(234,179,8,0.8)]"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}