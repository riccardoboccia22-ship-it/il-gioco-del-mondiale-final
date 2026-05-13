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

      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      if (data) {
        // Ordiniamo basandoci sulla colonna "ranking". 
        // I nuovi utenti (null) finiscono in fondo (999).
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

  // FIX: Gestione dei nuovi utenti (NaN o null)
  const getRankIcon = (rankValue: any) => {
    const rank = parseInt(rankValue);

    if (!rankValue || isNaN(rank)) {
      return (
        <span className="text-slate-700 text-[10px] font-black italic">
          --
        </span>
      );
    }

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

    if (!previous || isNaN(previous) || isNaN(current) || current === previous) {
      return <Minus className="text-slate-700" size={14} strokeWidth={3} />;
    }
    
    if (current < previous) {
      return <ChevronUp className="text-emerald-500" size={16} strokeWidth={3} />;
    }
    
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
            <div className="w-6 sm:w-8 text-center">Gironi</div>
            <div className="w-6 sm:w-8 text-center">FF</div>
            <div className="w-6 sm:w-8 text-center">Bonus</div>
            <div className="w-10 sm:w-12 text-center text-yellow-500 border-b border-yellow-500/20">
              Tot
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {leaderboard.map((player) => {
            // FIX: Calcolo sicuro del rank per gestire lo stile (glow giallo)
            const rankValue = parseInt(player.ranking);
            const currentRank = isNaN(rankValue) ? null : rankValue;
            
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
                  
                  {/* POSIZIONE E TREND */}
                  <div className="w-10 sm:w-14 flex items-center justify-between shrink-0 bg-slate-950/50 p-1.5 rounded-xl border border-slate-800/50">
                    <div className="flex-1 flex justify-center">
                      {getRankIcon(player.ranking)}
                    </div>
                    <div className="flex-1 flex justify-center">
                      {getTrendIcon(player.ranking, player.previous_ranking)}
                    </div>
                  </div>

                  {/* NOME GIOCATORE */}
                  <div className="flex flex-col min-w-0 flex-1 justify-center">
                    <p className="font-black uppercase italic text-xs sm:text-sm md:text-base tracking-tight leading-none truncate w-full">
                      {player.username}
                    </p>
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