'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Trophy, 
  Medal, 
  Crown, 
  ChevronUp, 
  ChevronDown, 
  Minus 
} from 'lucide-react';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    try {
      setLoading(true);

      // Preleviamo i profili senza ordinarli per punti, perché l'ordine ufficiale (con gli spareggi) 
      // lo ha già calcolato il pannello Admin e lo ha salvato nella colonna "ranking".
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      if (data) {
        // Ordiniamo localmente i giocatori basandoci sulla colonna "ranking" dell'Admin
        const sorted = data.sort((a, b) => {
          const rankA = a.ranking ? parseInt(a.ranking) : 999;
          const rankB = b.ranking ? parseInt(b.ranking) : 999;
          return rankA - rankB;
        });
        
        setLeaderboard(sorted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const getRankIcon = (rankString: string | number) => {
    const rank = parseInt(rankString as string);
    if (rank === 1) return <Crown className="text-yellow-500" size={20} />;
    if (rank === 2) return <Medal className="text-slate-300" size={20} />;
    if (rank === 3) return <Medal className="text-amber-700" size={20} />;
    return (
      <span className="text-slate-500 text-[10px] font-black italic">
        #{rank}
      </span>
    );
  };

  const getTrendIcon = (currentRankStr: any, previousRankStr: any) => {
    const current = parseInt(currentRankStr);
    const previous = parseInt(previousRankStr);

    // Se non c'è una posizione precedente, o se non è un numero, o se la posizione è uguale
    if (!previous || isNaN(previous) || current === previous) {
      return <Minus className="text-slate-700" size={14} strokeWidth={3} />;
    }
    // Se la posizione attuale è un numero più piccolo (es. da 5° a 2°), è SALITO in classifica
    if (current < previous) {
      return <ChevronUp className="text-emerald-500" size={16} strokeWidth={3} />;
    }
    // Altrimenti è SCESO
    return <ChevronDown className="text-rose-500" size={16} strokeWidth={3} />;
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-yellow-500 font-black uppercase italic tracking-[0.2em] animate-pulse">
          Caricamento Classifica...
        </p>
      </div>
    );

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-32 font-sans">
      <header className="text-center mb-12 mt-6">
        <h1 className="text-5xl font-black text-yellow-500 uppercase italic tracking-tighter">
          Classifica
        </h1>
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-2">
          Live World Cup Rankings
        </p>
      </header>

      <div className="max-w-3xl mx-auto">
        <div className="flex px-4 sm:px-6 mb-4 text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-widest italic">
          <div className="flex-1 pl-12 sm:pl-16">Giocatore</div>
          <div className="flex gap-3 sm:gap-6 md:gap-10 pr-2">
            <div className="w-6 sm:w-8 text-center">
              <span className="sm:hidden">Gir</span>
              <span className="hidden sm:inline">Gironi</span>
            </div>
            <div className="w-6 sm:w-8 text-center">FF</div>
            <div className="w-6 sm:w-8 text-center">
              <span className="sm:hidden">Bon</span>
              <span className="hidden sm:inline">Bonus</span>
            </div>
            <div className="w-10 sm:w-12 text-center text-yellow-500 border-b border-yellow-500/20">
              Tot
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {leaderboard.map((player) => {
            const currentRank = parseInt(player.ranking);
            
            return (
              <div
                key={player.id}
                className={`flex items-center p-4 sm:p-5 rounded-[2rem] border transition-all ${
                  currentRank === 1
                    ? 'bg-yellow-500/10 border-yellow-500/40 shadow-2xl shadow-yellow-500/5 scale-[1.02]'
                    : 'bg-slate-900/40 border-slate-800/60'
                }`}
              >
                <div className="flex-1 flex items-center gap-3 sm:gap-4 min-w-0">
                  
                  {/* BLOCCO POSIZIONE E TREND */}
                  <div className="w-10 sm:w-14 flex items-center justify-between shrink-0 bg-slate-950/50 p-1.5 rounded-xl border border-slate-800/50">
                    <div className="flex-1 flex justify-center">
                      {getRankIcon(player.ranking)}
                    </div>
                    <div className="flex-1 flex justify-center">
                      {getTrendIcon(player.ranking, player.previous_ranking)}
                    </div>
                  </div>

                  {/* NOME GIOCATORE E QUOTA */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <p className="font-black uppercase italic text-xs sm:text-sm md:text-base tracking-tight leading-none mb-1 truncate w-full">
                      {player.username}
                    </p>
                    {player.is_paid ? (
                      <span className="text-[6px] sm:text-[7px] font-black text-emerald-500 uppercase tracking-widest">
                        Quota OK ✓
                      </span>
                    ) : (
                      <span className="text-[6px] sm:text-[7px] font-black text-rose-500 uppercase tracking-widest animate-pulse">
                        Manca Quota!
                      </span>
                    )}
                  </div>
                </div>

                {/* PUNTEGGI */}
                <div className="flex items-center gap-3 sm:gap-6 md:gap-10 shrink-0 ml-2">
                  <div className="w-6 sm:w-8 text-center text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-500">
                    {player.points_groups || 0}
                  </div>
                  <div className="w-6 sm:w-8 text-center text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-500">
                    {player.points_bracket || 0}
                  </div>
                  <div
                    className={`w-6 sm:w-8 text-center text-[9px] sm:text-[10px] md:text-xs font-bold ${
                      player.points_bonus > 0
                        ? 'text-emerald-500'
                        : 'text-slate-500'
                    }`}
                  >
                    {player.points_bonus || 0}
                  </div>
                  <div
                    className={`w-10 sm:w-12 text-center font-black italic text-lg sm:text-xl md:text-3xl ${
                      currentRank === 1 ? 'text-yellow-500' : 'text-white'
                    }`}
                  >
                    {player.points || 0}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}