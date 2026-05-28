'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  Trophy, 
  Medal, 
  Crown, 
  ChevronUp, 
  ChevronDown, 
  Minus,
  Loader2
} from 'lucide-react';

const AVATARS = [
  // --- PRO & CLASSICI ---
  { id: 'trainer', name: 'Il Mister', emoji: '🧢', color: 'from-blue-600 to-blue-400' },
  { id: 'wizard', name: 'Il Mago', emoji: '🪄', color: 'from-purple-600 to-purple-400' },
  { id: 'bomber', name: 'Il Bomber', emoji: '⚽', color: 'from-rose-600 to-rose-400' },
  { id: 'legend', name: 'Pallone d\'Oro', emoji: '🏆', color: 'from-yellow-600 to-yellow-400' },
  { id: 'ninja', name: 'Ninja', emoji: '🥷', color: 'from-zinc-800 to-zinc-600' },
  { id: 'clown', name: 'Clown', emoji: '🤡', color: 'from-red-500 to-sky-500' },
  { id: 'pirate', name: 'Pirati', emoji: '🏴‍☠️', color: 'from-zinc-900 to-zinc-700' },

  // --- ANIMALI ---
  { id: 'shark', name: 'Squalo', emoji: '🦈', color: 'from-sky-700 to-blue-900' },
  { id: 'lion', name: 'Leone', emoji: '🦁', color: 'from-amber-500 to-orange-600' },
  { id: 'bull', name: 'Toro', emoji: '🐂', color: 'from-red-700 to-orange-600' },
  { id: 'wolf', name: 'Lupo', emoji: '🐺', color: 'from-slate-700 to-slate-500' },
  { id: 'pig', name: 'Maiale', emoji: '🐷', color: 'from-pink-400 to-pink-200' },
  { id: 'tiger', name: 'Tigre', emoji: '🐯', color: 'from-orange-500 to-yellow-500' },
  { id: 'mouse', name: 'Topo', emoji: '🐭', color: 'from-zinc-400 to-zinc-300' },
  { id: 'bat', name: 'Pipistrello', emoji: '🦇', color: 'from-indigo-900 to-slate-800' },
  { id: 'horse', name: 'Cavallo', emoji: '🐴', color: 'from-amber-700 to-amber-500' },
  { id: 'cheetah', name: 'Ghepardo', emoji: '🐆', color: 'from-yellow-500 to-amber-600' },
  { id: 'elephant', name: 'Elefante', emoji: '🐘', color: 'from-slate-400 to-slate-300' },
  { id: 'giraffe', name: 'Giraffa', emoji: '🦒', color: 'from-amber-400 to-orange-400' },
  { id: 'penguin', name: 'Pinguino', emoji: '🐧', color: 'from-cyan-100 to-blue-300' },
  { id: 'crocodile', name: 'Coccodrillo', emoji: '🐊', color: 'from-green-800 to-emerald-600' },
  { id: 'eagle', name: 'Aquila', emoji: '🦅', color: 'from-sky-700 to-blue-500' },
  { id: 'trex', name: 'T-Rex', emoji: '🦖', color: 'from-green-900 to-lime-700' },
  { id: 'dragon', name: 'Drago', emoji: '🐲', color: 'from-red-600 to-orange-600' },
  { id: 'turtle', name: 'Tartaruga', emoji: '🐢', color: 'from-emerald-600 to-green-500' },
  { id: 'fly', name: 'Mosca', emoji: '🪰', color: 'from-zinc-800 to-zinc-600' },
  { id: 'mosquito', name: 'Zanzara', emoji: '🦟', color: 'from-stone-600 to-stone-400' },
  { id: 'grasshopper', name: 'Cavalletta', emoji: '🦗', color: 'from-lime-600 to-green-500' },
  { id: 'monkey', name: 'Scimmia', emoji: '🐒', color: 'from-amber-600 to-yellow-800' },
  { id: 'owl', name: 'Gufo', emoji: '🦉', color: 'from-stone-600 to-stone-800' },
  { id: 'worm', name: 'Verme', emoji: '🪱', color: 'from-pink-500 to-rose-400' },
  { id: 'scorpion', name: 'Scorpione', emoji: '🦂', color: 'from-orange-700 to-red-800' },
  { id: 'zebra', name: 'Zebra', emoji: '🦓', color: 'from-zinc-200 to-zinc-500' },
  { id: 'mammoth', name: 'Mammut', emoji: '🦣', color: 'from-amber-800 to-stone-700' },
  { id: 'kangaroo', name: 'Canguro', emoji: '🦘', color: 'from-orange-400 to-amber-600' },
  { id: 'bison', name: 'Bisonte', emoji: '🦬', color: 'from-stone-700 to-stone-900' },
  { id: 'goat', name: 'GOAT', emoji: '🐐', color: 'from-slate-300 to-slate-500' },
  { id: 'horse_run', name: 'Purosangue', emoji: '🐎', color: 'from-amber-700 to-orange-800' },
  { id: 'cat', name: 'Gatto', emoji: '🐈', color: 'from-orange-300 to-orange-500' },
  { id: 'panda', name: 'Panda', emoji: '🐼', color: 'from-slate-800 to-slate-950' },
  { id: 'parrot', name: 'Pappagallo', emoji: '🦜', color: 'from-red-400 to-green-500' },
  { id: 'dodo', name: 'Dodo', emoji: '🦤', color: 'from-stone-500 to-stone-700' },
  { id: 'moose', name: 'Alce', emoji: '🫎', color: 'from-amber-700 to-stone-600' },

  // --- FOOD & DRINKS ---
  { id: 'beer', name: 'Birra', emoji: '🍺', color: 'from-yellow-400 to-amber-500' },
  { id: 'mate', name: 'Mate', emoji: '🧉', color: 'from-green-700 to-emerald-500' },
  { id: 'cocktail', name: 'Cocktail', emoji: '🍹', color: 'from-rose-400 to-orange-400' },
  { id: 'banana', name: 'Banana', emoji: '🍌', color: 'from-yellow-300 to-yellow-500' },
  { id: 'carrot', name: 'Carota', emoji: '🥕', color: 'from-orange-400 to-orange-600' },
  { id: 'pepper', name: 'Peperoncino', emoji: '🌶️', color: 'from-red-500 to-red-700' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', color: 'from-red-400 to-amber-400' },
  { id: 'corn', name: 'Pannocchia', emoji: '🌽', color: 'from-yellow-300 to-green-500' },

  // --- NATURA & MONDO ---
  { id: 'tree', name: 'Albero', emoji: '🌳', color: 'from-green-800 to-lime-600' },
  { id: 'palm', name: 'Palma', emoji: '🌴', color: 'from-yellow-600 to-emerald-500' },
  { id: 'ice', name: 'Ghiaccio', emoji: '🧊', color: 'from-cyan-300 to-blue-100' },
  { id: 'fire', name: 'Fiamma', emoji: '🔥', color: 'from-orange-600 to-red-600' },
  { id: 'wave', name: 'Onda', emoji: '🌊', color: 'from-blue-700 to-cyan-400' },
  { id: 'snowman', name: 'Snowman', emoji: '⛄', color: 'from-slate-100 to-slate-50' },
  { id: 'world', name: 'Mondo', emoji: '🌍', color: 'from-blue-500 to-green-400' },
  { id: 'mountain', name: 'Montagna', emoji: '⛰️', color: 'from-slate-500 to-stone-400' },
  { id: 'lightning', name: 'Fulmine', emoji: '⚡', color: 'from-yellow-400 to-amber-500' },
  { id: 'snow_mountain', name: 'Monte', emoji: '🏔️', color: 'from-sky-200 to-blue-400' },
  { id: 'comet', name: 'Cometa', emoji: '☄️', color: 'from-orange-400 to-red-600' },
  { id: 'wind', name: 'Vento', emoji: '🌬️', color: 'from-sky-200 to-blue-300' },
  { id: 'snowflake', name: 'Fiocco', emoji: '❄️', color: 'from-cyan-200 to-blue-400' },

  // --- FANTASY & SCI-FI ---
  { id: 'alien', name: 'Alieno', emoji: '👽', color: 'from-green-400 to-lime-600' },
  { id: 'ghost', name: 'Fantasma', emoji: '👻', color: 'from-slate-100 to-slate-300' },
  { id: 'robot', name: 'Robot', emoji: '🤖', color: 'from-zinc-400 to-slate-500' },
  { id: 'pumpkin', name: 'Zucca', emoji: '🎃', color: 'from-orange-500 to-orange-700' },
  { id: 'brain', name: 'Cervello', emoji: '🧠', color: 'from-pink-300 to-rose-400' },
  { id: 'zombie', name: 'Zombie', emoji: '🧟‍♂️', color: 'from-teal-600 to-green-800' },
  { id: 'genie', name: 'Genio', emoji: '🧞‍♂️', color: 'from-blue-500 to-indigo-600' },
  { id: 'ufo', name: 'UFO', emoji: '🛸', color: 'from-indigo-500 to-purple-700' },

  // --- MOTORI & VELOCITÀ ---
  { id: 'f1', name: 'Formula 1', emoji: '🏎️', color: 'from-red-600 to-red-400' },
  { id: 'moto', name: 'Moto', emoji: '🏍️', color: 'from-orange-500 to-amber-400' },
  { id: 'scooter', name: 'Scooter', emoji: '🛵', color: 'from-sky-500 to-blue-300' },
  { id: 'train', name: 'Treno', emoji: '🚂', color: 'from-zinc-700 to-slate-500' },
  { id: 'roller', name: 'Roller', emoji: '🎢', color: 'from-indigo-600 to-purple-500' },
  { id: 'missile', name: 'Missile', emoji: '🚀', color: 'from-slate-200 to-orange-400' },
  { id: 'paragliding', name: 'Parapendio', emoji: '🪂', color: 'from-rose-500 to-orange-400' },

  // --- OGGETTI & GAMING ---
  { id: 'diamond', name: 'Diamante', emoji: '💎', color: 'from-cyan-400 to-blue-500' },
  { id: 'boxing', name: 'Boxe', emoji: '🥊', color: 'from-red-600 to-red-400' },
  { id: 'bang', name: 'Bang', emoji: '💥', color: 'from-orange-500 to-yellow-400' },
  { id: 'anchor', name: 'Ancora', emoji: '⚓', color: 'from-slate-600 to-slate-400' },
  { id: 'knife', name: 'Coltello', emoji: '🔪', color: 'from-slate-400 to-slate-100' },
  { id: 'pool8', name: 'Palla 8', emoji: '🎱', color: 'from-zinc-900 to-zinc-700' },
  { id: 'joystick', name: 'Retro', emoji: '🕹️', color: 'from-rose-600 to-purple-700' },
  { id: 'gamepad', name: 'Pro', emoji: '🎮', color: 'from-slate-800 to-indigo-900' },
  { id: 'dice', name: 'Dado', emoji: '🎲', color: 'from-white to-slate-200' },
  { id: 'slot', name: 'Slot', emoji: '🎰', color: 'from-yellow-500 to-amber-600' },
  { id: 'bomb', name: 'Bomba', emoji: '💣', color: 'from-zinc-800 to-zinc-950' },
  { id: 'dynamite', name: 'Dinamite', emoji: '🧨', color: 'from-red-500 to-red-700' },
  { id: 'swords', name: 'Spade', emoji: '⚔️', color: 'from-slate-400 to-slate-600' },
  { id: 'dagger', name: 'Pugnale', emoji: '🗡️', color: 'from-zinc-400 to-zinc-600' },
  { id: 'shield', name: 'Scudo', emoji: '🛡️', color: 'from-amber-400 to-yellow-600' },
  { id: 'cigarette', name: 'Sigaretta', emoji: '🚬', color: 'from-stone-400 to-stone-600' },
  { id: 'broom', name: 'Scopa', emoji: '🧹', color: 'from-amber-600 to-yellow-700' },
  { id: 'disco', name: 'Disco', emoji: '🪩', color: 'from-fuchsia-300 to-purple-500' },
  { id: 'extinguisher', name: 'Estintore', emoji: '🧯', color: 'from-red-500 to-rose-700' },
  { id: 'magnet', name: 'Magnete', emoji: '🧲', color: 'from-red-500 to-zinc-400' },
  { id: 'tp', name: 'Carta Igienica', emoji: '🧻', color: 'from-slate-100 to-slate-300' },
  
  // --- COLORI PURI ---
  { id: 'white', name: 'Bianco', emoji: '⚪', color: 'from-slate-300 to-slate-100' },
  { id: 'black', name: 'Nero', emoji: '⚫', color: 'from-slate-900 to-slate-700' },
  { id: 'lightblue', name: 'Azzurro', emoji: '🩵', color: 'from-sky-500 to-sky-300' },
  { id: 'blue', name: 'Blu', emoji: '🔵', color: 'from-blue-600 to-blue-400' },
  { id: 'yellow', name: 'Giallo', emoji: '🟡', color: 'from-yellow-500 to-yellow-300' },
  { id: 'red', name: 'Rosso', emoji: '🔴', color: 'from-rose-600 to-rose-400' },
  { id: 'green', name: 'Verde', emoji: '🟢', color: 'from-emerald-600 to-emerald-400' },
  { id: 'purple', name: 'Viola', emoji: '🟣', color: 'from-purple-600 to-purple-400' },
  { id: 'orange', name: 'Arancione', emoji: '🟠', color: 'from-orange-500 to-orange-400' },
  { id: 'pink', name: 'Rosa', emoji: '🩷', color: 'from-pink-500 to-pink-300' },
  { id: 'brown', name: 'Marrone', emoji: '🟤', color: 'from-amber-800 to-amber-600' },

  // --- NAZIONALI MONDIALE 2026 ---
  { id: 'algeria', name: 'Algeria', flagCode: 'dz', color: 'from-green-600 to-green-500' },
  { id: 'arabia_saudita', name: 'Arabia Saudita', flagCode: 'sa', color: 'from-green-700 to-green-600' },
  { id: 'argentina', name: 'Argentina', flagCode: 'ar', color: 'from-sky-400 to-sky-200' },
  { id: 'australia', name: 'Australia', flagCode: 'au', color: 'from-yellow-500 to-yellow-400' },
  { id: 'austria', name: 'Austria', flagCode: 'at', color: 'from-red-600 to-red-500' },
  { id: 'belgio', name: 'Belgio', flagCode: 'be', color: 'from-red-600 to-red-500' },
  { id: 'bosnia', name: 'Bosnia Erzegovina', flagCode: 'ba', color: 'from-blue-700 to-blue-600' },
  { id: 'brasile', name: 'Brasile', flagCode: 'br', color: 'from-yellow-500 to-yellow-400' },
  { id: 'canada', name: 'Canada', flagCode: 'ca', color: 'from-red-600 to-red-500' },
  { id: 'capo_verde', name: 'Capo Verde', flagCode: 'cv', color: 'from-blue-700 to-blue-600' },
  { id: 'colombia', name: 'Colombia', flagCode: 'co', color: 'from-yellow-500 to-yellow-400' },
  { id: 'corea_sud', name: 'Corea del Sud', flagCode: 'kr', color: 'from-red-600 to-red-500' },
  { id: 'costa_avorio', name: "Costa d'Avorio", flagCode: 'ci', color: 'from-orange-500 to-orange-400' },
  { id: 'croazia', name: 'Croazia', flagCode: 'hr', color: 'from-red-600 to-slate-200' },
  { id: 'curacao', name: 'Curaçao', flagCode: 'cw', color: 'from-blue-600 to-blue-500' },
  { id: 'ecuador', name: 'Ecuador', flagCode: 'ec', color: 'from-yellow-500 to-yellow-400' },
  { id: 'egitto', name: 'Egitto', flagCode: 'eg', color: 'from-red-600 to-red-500' },
  { id: 'francia', name: 'Francia', flagCode: 'fr', color: 'from-blue-800 to-blue-700' },
  { id: 'germania', name: 'Germania', flagCode: 'de', color: 'from-slate-200 to-slate-100' },
  { id: 'ghana', name: 'Ghana', flagCode: 'gh', color: 'from-slate-200 to-slate-100' },
  { id: 'giappone', name: 'Giappone', flagCode: 'jp', color: 'from-blue-600 to-blue-500' },
  { id: 'giordania', name: 'Giordania', flagCode: 'jo', color: 'from-red-600 to-red-500' },
  { id: 'haiti', name: 'Haiti', flagCode: 'ht', color: 'from-blue-700 to-blue-600' },
  { id: 'inghilterra', name: 'Inghilterra', flagCode: 'gb-eng', color: 'from-slate-200 to-slate-100' },
  { id: 'iran', name: 'Iran', flagCode: 'ir', color: 'from-slate-200 to-slate-100' },
  { id: 'iraq', name: 'Iraq', flagCode: 'iq', color: 'from-green-600 to-green-500' },
  { id: 'marocco', name: 'Marocco', flagCode: 'ma', color: 'from-red-600 to-red-500' },
  { id: 'messico', name: 'Messico', flagCode: 'mx', color: 'from-green-600 to-green-500' },
  { id: 'norvegia', name: 'Norvegia', flagCode: 'no', color: 'from-red-600 to-red-500' },
  { id: 'nuova_zelanda', name: 'Nuova Zelanda', flagCode: 'nz', color: 'from-slate-200 to-slate-100' },
  { id: 'olanda', name: 'Olanda', flagCode: 'nl', color: 'from-orange-500 to-orange-400' },
  { id: 'panama', name: 'Panama', flagCode: 'pa', color: 'from-red-600 to-red-500' },
  { id: 'paraguay', name: 'Paraguay', flagCode: 'py', color: 'from-red-600 to-red-500' },
  { id: 'portogallo', name: 'Portogallo', flagCode: 'pt', color: 'from-red-600 to-red-500' },
  { id: 'qatar', name: 'Qatar', flagCode: 'qa', color: 'from-rose-800 to-rose-700' },
  { id: 'rep_ceca', name: 'Repubblica Ceca', flagCode: 'cz', color: 'from-red-600 to-red-500' },
  { id: 'rd_congo', name: 'R.D. Congo', flagCode: 'cd', color: 'from-sky-500 to-sky-400' },
  { id: 'scozia', name: 'Scozia', flagCode: 'gb-sct', color: 'from-blue-900 to-blue-800' },
  { id: 'senegal', name: 'Senegal', flagCode: 'sn', color: 'from-green-600 to-green-500' },
  { id: 'spagna', name: 'Spagna', flagCode: 'es', color: 'from-red-600 to-red-500' },
  { id: 'stati_uniti', name: 'Stati Uniti', flagCode: 'us', color: 'from-slate-200 to-slate-100' },
  { id: 'sudafrica', name: 'Sudafrica', flagCode: 'za', color: 'from-yellow-500 to-yellow-400' },
  { id: 'svezia', name: 'Svezia', flagCode: 'se', color: 'from-yellow-400 to-yellow-300' },
  { id: 'svizzera', name: 'Svizzera', flagCode: 'ch', color: 'from-red-600 to-red-500' },
  { id: 'tunisia', name: 'Tunisia', flagCode: 'tn', color: 'from-red-600 to-slate-100' },
  { id: 'turchia', name: 'Turchia', flagCode: 'tr', color: 'from-red-600 to-red-500' },
  { id: 'uruguay', name: 'Uruguay', flagCode: 'uy', color: 'from-sky-400 to-sky-300' },
  { id: 'uzbekistan', name: 'Uzbekistan', flagCode: 'uz', color: 'from-blue-600 to-blue-500' }
];

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();

    const channel = supabase
      .channel('leaderboard-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          fetchLeaderboard(false); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  async function fetchLeaderboard(showLoader = true) {
    try {
      if (showLoader) setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }

      // --- BLOCCO DI CORTESIA ---
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      if (!profile || !profile.full_name) {
        router.push('/setup-profilo');
        return;
      }
      // --------------------------

      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        throw error;
      }

      if (data) {
        const sorted = data.sort((a, b) => {
          const rankA = a.ranking ?? 9999;
          const rankB = b.ranking ?? 9999;
          
          if (rankA === 9999 && rankB === 9999) {
            return (b.points || 0) - (a.points || 0);
          }
          
          return rankA - rankB;
        });
        
        setLeaderboard(sorted);
      }
    } catch (err) {
      console.error("Sync Error:", err);
      toast.error('Errore di sincronizzazione db.');
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  const getRankIcon = (rankValue: any) => {
    const rank = Number(rankValue);

    if (!rankValue || isNaN(rank)) {
      return <span className="text-slate-700 text-[10px] font-black italic">--</span>;
    }

    if (rank === 1) return <Crown className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" size={20} />;
    if (rank === 2) return <Medal className="text-slate-300" size={20} />;
    if (rank === 3) return <Medal className="text-amber-700" size={20} />;
    
    return <span className="text-slate-500 text-[10px] font-black italic">#{rank}</span>;
  };

  const getTrendIcon = (currentRankStr: any, previousRankStr: any) => {
    const current = Number(currentRankStr);
    const previous = Number(previousRankStr);

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
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-16 h-16 text-yellow-500 animate-spin" />
        <p className="text-yellow-500 font-black uppercase text-lg animate-pulse tracking-widest">
          Sincronizzazione Classifica...
        </p>
      </main>
    );

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-32 font-sans">
      <header className="text-center mb-12 mt-6">
        <h1 className="text-5xl font-black text-yellow-500 uppercase italic tracking-tighter drop-shadow-md">
          Classifica
        </h1>
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-2 flex items-center justify-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live World Cup Rankings
        </p>
      </header>

      <div className="max-w-3xl mx-auto">
        <div className="flex px-4 sm:px-6 mb-4 text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-widest italic border-b border-slate-800/50 pb-2">
          <div className="flex-1 pl-14 sm:pl-16">Giocatore</div>
          <div className="flex gap-3 sm:gap-6 md:gap-10 pr-2">
            <div className="w-6 sm:w-8 text-center" title="Punti Gironi">Gir</div>
            <div className="w-6 sm:w-8 text-center" title="Punti Fase Finale">FF</div>
            <div className="w-6 sm:w-8 text-center" title="Punti Bonus">Bon</div>
            <div className="w-10 sm:w-12 text-center text-yellow-500">Tot</div>
          </div>
        </div>

        <div className="space-y-3">
          {leaderboard.map((player) => {
            const currentRank = Number(player.ranking);
            const isPodium = currentRank === 1;
            
            const currentAvatar = AVATARS.find(a => a.id === player.avatar_id) || AVATARS[0];
            
            return (
              <div
                key={player.id}
                className={`flex items-center p-4 sm:p-5 rounded-[2rem] border transition-all duration-500 ${
                  isPodium
                    ? 'bg-gradient-to-r from-yellow-500/10 to-slate-900/40 border-yellow-500/40 shadow-2xl shadow-yellow-500/5 scale-[1.02]'
                    : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex-1 flex items-center gap-3 sm:gap-4 min-w-0">
                  
                  <div className="w-12 sm:w-14 flex items-center justify-between shrink-0 bg-slate-950/80 p-2 rounded-xl border border-slate-800/80 shadow-inner">
                    <div className="flex-1 flex justify-center">
                      {getRankIcon(player.ranking)}
                    </div>
                    <div className="flex-1 flex justify-center">
                      {getTrendIcon(player.ranking, player.previous_ranking)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* AVATAR COLORATO IN CLASSIFICA CON SUPPORTO IMMAGINI */}
                    <div 
                      className={`w-8 sm:w-10 h-8 sm:h-10 shrink-0 rounded-full flex items-center justify-center text-lg sm:text-xl shadow-inner overflow-hidden bg-gradient-to-br ${currentAvatar.color} border border-slate-800`}
                      title={currentAvatar.name}
                    >
                      {currentAvatar.flagCode ? (
                        <img src={`https://flagcdn.com/w80/${currentAvatar.flagCode}.png`} alt={currentAvatar.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="drop-shadow-md">{currentAvatar.emoji}</span>
                      )}
                    </div>

                    <div className="flex flex-col justify-center min-w-0">
                      <p className={`font-black uppercase italic text-xs sm:text-sm md:text-base tracking-tight leading-none truncate w-full ${isPodium ? 'text-yellow-400' : 'text-slate-200'}`}>
                        {player.username}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-6 md:gap-10 shrink-0 ml-2">
                  <div className="w-6 sm:w-8 text-center text-[10px] sm:text-xs font-bold text-slate-500">
                    {player.points_groups || 0}
                  </div>
                  <div className="w-6 sm:w-8 text-center text-[10px] sm:text-xs font-bold text-slate-500">
                    {player.points_bracket || 0}
                  </div>
                  <div
                    className={`w-6 sm:w-8 text-center text-[10px] sm:text-xs font-bold ${
                      (player.points_bonus || 0) > 0 ? 'text-purple-400' : 'text-slate-500'
                    }`}
                  >
                    {player.points_bonus || 0}
                  </div>
                  <div
                    className={`w-10 sm:w-12 text-center font-black italic text-xl sm:text-2xl md:text-3xl ${
                      isPodium ? 'text-yellow-500' : 'text-white'
                    }`}
                  >
                    {player.points || 0}
                  </div>
                </div>
              </div>
            );
          })}

          {leaderboard.length === 0 && !loading && (
            <div className="text-center py-12">
              <Trophy className="mx-auto w-12 h-12 text-slate-800 mb-3" />
              <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Nessun giocatore in classifica</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}