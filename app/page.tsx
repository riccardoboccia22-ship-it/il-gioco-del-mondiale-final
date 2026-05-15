'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation'; // <-- Aggiunto usePathname
import Image from 'next/image';
import { LayoutGrid, Users, Trophy, Star, ClipboardList, Target, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname(); // <-- Inizializzato
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const navItems = [
    { label: 'PROFILO', icon: <Target size={20} />, path: '/profile' },
    { label: 'FASE GIRONI', icon: <LayoutGrid size={20} />, path: '/matches' },
    { label: 'FASE FINALE', icon: <Trophy size={20} />, path: '/bracket' },
    { label: 'BONUS', icon: <Star size={20} />, path: '/bonus' },
    { label: 'CLASSIFICA', icon: <ClipboardList size={20} />, path: '/leaderboard' },
    { label: 'GLOBALE', icon: <Users size={20} />, path: '/tutti-i-pronostici' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-between relative overflow-hidden">
      
      {/* Sfondo Sfumato di Design */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 opacity-70"></div>

      {/* --- CONTENUTO PRINCIPALE (CENTRATO) --- */}
      <div className="flex-1 flex flex-col items-center justify-center gap-12 w-full max-w-sm px-6 z-10 pt-16 pb-24 animate-in fade-in zoom-in-95 duration-700">
        
        {/* LOGO ICONICO (SENZA SCRITTA CIRCOLARE) */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56">
          <div className="absolute inset-0 bg-yellow-500 rounded-full blur-[30px] opacity-20 animate-pulse"></div>
          
          <div className="relative w-full h-full bg-slate-900 rounded-full border-4 border-slate-800 p-6 flex items-center justify-center shadow-2xl overflow-hidden group hover:border-yellow-500/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 opacity-60"></div>
            
            {/* Coppa del Mondo Dorata - Pulita e Protagonista */}
            <img 
              src="https://foktuevxfscdpsshscno.supabase.co/storage/v1/object/public/public_assets/coppa_mondo_pulita.png"
              alt="World Cup Trophy" 
              className="w-3/4 h-auto object-contain drop-shadow-[0_10px_20px_rgba(234,179,8,0.3)] z-10 group-hover:scale-105 transition-transform duration-300" 
            />
          </div>
        </div>

        {/* TITOLO ELEGANTE E UNICO (Coordinato con la Navbar) */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tight text-white mb-2 leading-none">
            Il Gioco del Mondiale
          </h1>
          <h2 className="text-4xl sm:text-5xl font-black text-yellow-500 tracking-tighter leading-none mb-3">
            2026
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic opacity-80">
            La Convocazione Ufficiale
          </p>
        </div>

        {/* PULSANTI D'AZIONE PRINCIPALI */}
        <div className="w-full space-y-4 pt-4">
          <button 
            onClick={() => router.push(user ? '/matches' : '/profile')}
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

        {/* Info Extra o Link Rapido */}
        <div className="text-center pt-6 opacity-40">
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Organizzato da Ricky</span>
        </div>
      </div>

      {/* --- NAVBAR INFERIORE (IDENTICA ALL'ORIGINALE) --- */}
      <nav className="fixed bottom-0 left-0 w-full z-20 bg-slate-950/90 backdrop-blur-md border-t border-slate-900 pb-safe-area shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        <div className="max-w-2xl mx-auto flex items-center justify-around py-3 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.path; // <-- CORRETTO QUI
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center gap-1.5 p-2 transition-all active:scale-95 group"
              >
                <div className={`transition-colors ${isActive ? 'text-yellow-500' : 'text-slate-500 group-hover:text-slate-200'}`}>
                  {item.icon}
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-yellow-500' : 'text-slate-600 group-hover:text-slate-300'}`}>
                  {item.label}
                </span>
                {isActive && (
                    <div className="absolute -top-[1px] w-6 h-0.5 bg-yellow-500 rounded-full blur-[1px]"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}