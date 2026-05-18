'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { User, Trophy, Star, ListOrdered, Users, Gamepad2, Loader2, AlertTriangle, CheckCircle2, Lock, Flame } from 'lucide-react';

const WORLD_CUP_START_DATE = new Date('2026-06-11T21:00:00+02:00');

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Stato per le notifiche personalizzate
  const [progress, setProgress] = useState<{ missingMatches: number, missingBracket: number, missingBonus: number } | null>(null);
  const [timeStatus, setTimeStatus] = useState<'normal' | 'soon' | 'started'>('normal');

  useEffect(() => {
    async function initAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Calcolo Data
      const now = new Date();
      const diffMs = WORLD_CUP_START_DATE.getTime() - now.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      
      if (diffDays <= 0) {
        setTimeStatus('started');
      } else if (diffDays > 0 && diffDays <= 30) { // Attivato a 30 giorni così si vede fin da ora!
        setTimeStatus('soon');
      }

      // Se l'utente è loggato, calcoliamo cosa gli manca
      if (user) {
        await fetchUserProgress(user.id);
      } else {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  async function fetchUserProgress(userId: string) {
    try {
      // 1. Controlliamo le 72 partite dei Gironi
      const { count: matchesCount } = await supabase
        .from('predictions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // 2. Controlliamo i 63 slot del Tabellone (32+16+8+4+2+1)
      const { count: bracketCount } = await supabase
        .from('brackets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // 3. Controlliamo i 9 Bonus
      const { data: bonusData } = await supabase
        .from('user_bonus_answers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      let filledBonuses = 0;
      if (bonusData) {
        const fields = ['mvp_world_cup', 'top_scorer', 'best_goalkeeper', 'high_scoring_match', 'highest_scoring_group', 'lowest_scoring_group', 'total_red_cards', 'total_penalties', 'total_own_goals'];
        fields.forEach(f => {
          if (bonusData[f] !== null && String(bonusData[f]).trim() !== '') filledBonuses++;
        });
      }

      setProgress({
        missingMatches: 72 - (matchesCount || 0),
        missingBracket: 63 - (bracketCount || 0),
        missingBonus: 9 - filledBonuses
      });

    } catch (error) {
      console.error("Errore recupero progressi:", error);
    } finally {
      setLoading(false);
    }
  }

  const navItems = [
    { label: 'Profilo', icon: <User size={20} strokeWidth={2.5} />, path: '/profile' },
    { label: 'Fase Gironi', icon: <Gamepad2 size={20} strokeWidth={2.5} />, path: '/matches' },
    { label: 'Fase Finale', icon: <Trophy size={20} strokeWidth={2.5} />, path: '/bracket' },
    { label: 'Bonus', icon: <Star size={20} strokeWidth={2.5} />, path: '/bonus' },
    { label: 'Classifica', icon: <ListOrdered size={20} strokeWidth={2.5} />, path: '/leaderboard' },
    { label: 'Globale', icon: <Users size={20} strokeWidth={2.5} />, path: '/tutti-i-pronostici' },
  ];

  const isAllCompleted = progress && progress.missingMatches === 0 && progress.missingBracket === 0 && progress.missingBonus === 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-between relative overflow-hidden overflow-y-auto">
      
      {/* Sfondo Sfumato di Design */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 opacity-70"></div>

      {/* --- CONTENUTO PRINCIPALE (CENTRATO) --- */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-sm px-6 z-10 pt-10 pb-28 animate-in fade-in zoom-in-95 duration-700">
        
        {/* LOGO ICONICO (A TUTTO CERCHIO) */}
        <div className="relative w-36 h-36 sm:w-48 sm:h-48 mt-4 shrink-0">
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
        <div className="text-center shrink-0">
          <h1 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tight text-white mb-1 leading-none">
            Mundialito
          </h1>
          <h2 className="text-4xl sm:text-5xl font-black text-yellow-500 tracking-tighter leading-none mb-2">
            2026
          </h2>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 italic opacity-80">
            La Convocazione Ufficiale
          </p>
        </div>

        {/* CENTRO NOTIFICHE (Visibile solo se loggato) */}
        {user && !loading && (
          <div className="w-full space-y-4 mt-2">
            
            <div className="space-y-2">
              {/* Notifica di Tempo */}
              {timeStatus === 'started' && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-2xl flex items-center gap-3 text-rose-500 shadow-lg">
                  <Lock size={18} className="shrink-0" />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-tight">Pronostici Chiusi. Il torneo è iniziato!</p>
                </div>
              )}
              {timeStatus === 'soon' && (
                <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-2xl flex items-center gap-3 text-orange-500 shadow-lg animate-pulse">
                  <Flame size={18} className="shrink-0" />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-tight">Meno di un mese all'inizio. Completa le schede!</p>
                </div>
              )}

              {/* Notifiche Personalizzate di Progresso */}
              {timeStatus !== 'started' && progress && (
                <div className="space-y-2">
                  {isAllCompleted ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl flex items-center gap-3 text-emerald-400 shadow-lg">
                      <CheckCircle2 size={18} className="shrink-0" />
                      <p className="text-[10px] font-black uppercase tracking-widest leading-tight">Sei pronto! Tutte le schede sono state compilate.</p>
                    </div>
                  ) : (
                    <>
                      {progress.missingMatches > 0 && (
                        <button onClick={() => router.push('/matches')} className="w-full text-left bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl flex items-center gap-3 text-amber-500 shadow-lg hover:bg-amber-500/20 transition-all active:scale-95">
                          <AlertTriangle size={16} className="shrink-0" />
                          <p className="text-[10px] font-black uppercase tracking-widest leading-tight flex-1 truncate">Mancano {progress.missingMatches} match nei Gironi</p>
                        </button>
                      )}
                      {progress.missingBracket > 0 && (
                        <button onClick={() => router.push('/bracket')} className="w-full text-left bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl flex items-center gap-3 text-amber-500 shadow-lg hover:bg-amber-500/20 transition-all active:scale-95">
                          <AlertTriangle size={16} className="shrink-0" />
                          <p className="text-[10px] font-black uppercase tracking-widest leading-tight flex-1 truncate">Mancano {progress.missingBracket} squadre nel Tabellone</p>
                        </button>
                      )}
                      {progress.missingBonus > 0 && (
                        <button onClick={() => router.push('/bonus')} className="w-full text-left bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl flex items-center gap-3 text-amber-500 shadow-lg hover:bg-amber-500/20 transition-all active:scale-95">
                          <AlertTriangle size={16} className="shrink-0" />
                          <p className="text-[10px] font-black uppercase tracking-widest leading-tight flex-1 truncate">Mancano {progress.missingBonus} risposte Bonus</p>
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PULSANTI D'AZIONE (Visibili SOLO per utente NON loggato) */}
        {!user && !loading && (
          <div className="w-full flex flex-col justify-center">
            <div className="space-y-3 w-full flex flex-col items-center mt-2">
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
            </div>
          </div>
        )}

        {/* Loader se sta ancora controllando l'utente */}
        {loading && (
          <div className="flex justify-center items-center py-4 mt-auto mb-auto">
            <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
          </div>
        )}

        {/* Info Extra */}
        <div className="text-center opacity-40 mt-auto">
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