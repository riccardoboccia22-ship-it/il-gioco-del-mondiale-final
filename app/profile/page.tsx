'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { 
  BookOpen, X, Edit3, Shield, Map, Trophy, Award, ChevronDown, ChevronUp,
  ShieldCheck, Flame, ArrowUpToLine, ArrowDownToLine, Target, Goal, BarChart3, Search
} from 'lucide-react';

const GROUPS = ['Gruppo A', 'Gruppo B', 'Gruppo C', 'Gruppo D', 'Gruppo E', 'Gruppo F', 'Gruppo G', 'Gruppo H', 'Gruppo I', 'Gruppo J', 'Gruppo K', 'Gruppo L'];

const TOURNAMENT_GROUPS = [
  { name: 'Gruppo A', teams: ['Messico', 'Sudafrica', 'Corea Sud', 'Rep. Ceca'] },
  { name: 'Gruppo B', teams: ['Canada', 'Svizzera', 'Qatar', 'Bosnia'] },
  { name: 'Gruppo C', teams: ['Brasile', 'Marocco', 'Haiti', 'Scozia'] },
  { name: 'Gruppo D', teams: ['USA', 'Australia', 'Paraguay', 'Turchia'] },
  { name: 'Gruppo E', teams: ['Germania', "Costa Avorio", 'Ecuador', 'Curacao'] },
  { name: 'Gruppo F', teams: ['Olanda', 'Svezia', 'Giappone', 'Tunisia'] },
  { name: 'Gruppo G', teams: ['Belgio', 'Iran', 'Egitto', 'N. Zelanda'] },
  { name: 'Gruppo H', teams: ['Spagna', 'Uruguay', 'Arabia S.', 'Capo Verde'] },
  { name: 'Gruppo I', teams: ['Francia', 'Senegal', 'Norvegia', 'Iraq'] },
  { name: 'Gruppo J', teams: ['Argentina', 'Austria', 'Algeria', 'Giordania'] },
  { name: 'Gruppo K', teams: ['Portogallo', 'Colombia', 'Uzbekistan', 'R.D. Congo'] },
  { name: 'Gruppo L', teams: ['Inghilterra', 'Croazia', 'Ghana', 'Panama'] },
];

const formatMatchName = (matchString: string) => {
  if (!matchString) return '';
  let formatted = matchString;
  formatted = formatted.replace(/Repubblica Democratica del Congo/gi, 'R.D. Congo');
  formatted = formatted.replace(/Repubblica Ceca/gi, 'Rep. Ceca');
  formatted = formatted.replace(/Bosnia ed Erzegovina|Bosnia Erzegovina/gi, 'Bosnia');
  formatted = formatted.replace(/Stati Uniti|USA/gi, 'USA');
  formatted = formatted.replace(/Arabia Saudita/gi, 'Arabia S.');
  formatted = formatted.replace(/Nuova Zelanda/gi, 'N. Zelanda');
  formatted = formatted.replace(/Corea del Sud/gi, 'Corea Sud');
  formatted = formatted.replace(/Costa d'Avorio/gi, 'Costa Avorio');
  return formatted;
};

const AVATARS = [
  // --- PRO & CLASSICI ---
  { id: 'trainer', name: 'Il Mister', emoji: '🧢', color: 'from-blue-600 to-blue-400' },
  { id: 'wizard', name: 'Il Mago', emoji: '🪄', color: 'from-purple-600 to-purple-400' },
  { id: 'bomber', name: 'Il Bomber', emoji: '⚽', color: 'from-rose-600 to-rose-400' },
  { id: 'legend', name: 'Pallone d\'Oro', emoji: '🏆', color: 'from-yellow-600 to-yellow-400' },
  { id: 'ninja', name: 'Ninja', emoji: '🥷', color: 'from-zinc-800 to-zinc-600' },
  { id: 'clown', name: 'Clown', emoji: '🤡', color: 'from-red-500 to-sky-500' },
  { id: 'pirate', name: 'Pirati', emoji: '🏴\u200d☠️', color: 'from-zinc-900 to-zinc-700' },

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
  { id: 'scorpion', name: 'Scorpione', emoji: 'Scorpione', color: 'from-orange-700 to-red-800' },
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
  { id: 'moose', name: 'Alce', emoji: '𫎟', color: 'from-amber-700 to-stone-600' },

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

export default function ProfilePage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [officialBonuses, setOfficialBonuses] = useState<any>(null);
  const [userBonuses, setUserBonuses] = useState<any>(null);
  const [topScorers, setTopScorers] = useState<any[]>([]);
  const [scorerSearch, setScorerSearch] = useState('');
  
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  const [showScorersModal, setShowScorersModal] = useState(false);
  const [showFinalBonuses, setShowFinalBonuses] = useState(false);
  const [activeLiveTab, setActiveLiveTab] = useState<'scorers' | 'groups'>('scorers');

  const [liveStats, setLiveStats] = useState<{ groupGoals: Record<string, number> }>({ groupGoals: {} });

  const [stats, setStats] = useState({
    total: 0, groups: 0, bracket: 0, bonus: 0, rank: '--', isPaid: false,
  });
  
  const router = useRouter();
  const ADMIN_EMAIL = 'ricky@mondiale.it';

  useEffect(() => { checkUser(); }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (!profile) {
            const fallbackUsername = user.email ? user.email.split('@')[0] : 'Guerriero';
            await supabase.from('profiles').insert([{ id: user.id, username: fallbackUsername, points: 0, avatar_id: 'trainer' }]);
            profile = { username: fallbackUsername, points: 0, points_groups: 0, points_bracket: 0, points_bonus: 0, is_paid: false, avatar_id: 'trainer' };
        }

        if (!profile.full_name) {
          router.push('/setup-profilo');
          return;
        }

        setUserProfile({ ...user, username: profile.username, avatar_id: profile.avatar_id || 'trainer' });
        setStats({
          total: profile.points || 0, groups: profile.points_groups || 0, bracket: profile.points_bracket || 0,
          bonus: profile.points_bonus || 0, rank: profile.ranking || '--', isPaid: profile.is_paid || false,
        });

        const [userBonusRes, offBonusRes, matchesRes, scorersRes] = await Promise.all([
          supabase.from('user_bonus_answers').select('*').eq('user_id', user.id).maybeSingle(),
          supabase.from('official_bonuses').select('*').eq('id', '00000000-0000-0000-0000-000000000000').maybeSingle(),
          supabase.from('matches').select('*').eq('is_finished', true),
          supabase.from('top_scorers').select('*').order('goals', { ascending: false })
        ]);

        setUserBonuses(userBonusRes.data);
        setOfficialBonuses(offBonusRes.data);
        setTopScorers(scorersRes.data || []);

        const gGoals: Record<string, number> = {};
        GROUPS.forEach(g => gGoals[g] = 0);

        matchesRes.data?.forEach(m => {
            const goals = (m.home_score_final || 0) + (m.away_score_final || 0);
            const homeFormatted = formatMatchName(m.home_team).toLowerCase();
            const groupObj = TOURNAMENT_GROUPS.find(gr => gr.teams.some(t => t.toLowerCase() === homeFormatted));
            if (groupObj) {
                gGoals[groupObj.name] += goals;
            }
        });

        setLiveStats({ groupGoals: gGoals });
      }
    } catch (error) { 
      console.error("Errore check utente:", error); 
    } finally { 
      setIsPageLoading(false); 
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const safeUsernameForEmail = username.trim().toLowerCase().replace(/\s+/g, '');
    const fakeEmail = `${safeUsernameForEmail}@mondiale.it`;

    if (isRegistering) {
      const { data, error } = await supabase.auth.signUp({ email: fakeEmail, password: password });
      if (error) { toast.error('Errore: Username occupato o password corta'); } 
      else if (data.user) {
        await supabase.from('profiles').upsert([{ id: data.user.id, username: username.trim(), points: 0, is_paid: false, avatar_id: 'trainer' }]);
        toast.success('Registrazione completata!');
        window.location.reload();
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: fakeEmail, password: password });
      if (error) toast.error('Credenziali errate');
      else window.location.reload();
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const updateAvatar = async (newAvatarId: string) => {
    try {
      const { error } = await supabase.from('profiles').update({ avatar_id: newAvatarId }).eq('id', userProfile.id);
      if (error) throw error;
      setUserProfile({ ...userProfile, avatar_id: newAvatarId });
      setShowAvatarModal(false);
      toast.success('Avatar aggiornato!');
    } catch (error) { toast.error("Impossibile aggiornare l'avatar"); }
  };

  const checkIsAdmin = () => {
    if (!userProfile) return false;
    return userProfile.email?.toLowerCase() === ADMIN_EMAIL || userProfile.username?.toLowerCase() === 'ricky';
  };

  const copyPaymentInfo = () => {
    navigator.clipboard.writeText("Quota Mondiale 2026 - Contattare Ricky per saldo");
    toast.success("Info pagamento copiate!");
  };

  if (isPageLoading) return <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans"><div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div></main>;

  const currentAvatar = AVATARS.find(a => a.id === userProfile?.avatar_id) || AVATARS[0];

  const filteredScorers = topScorers.filter(scorer => 
    scorer.name.toLowerCase().includes(scorerSearch.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 pt-8 pb-32 flex flex-col items-center justify-start font-sans overflow-y-auto">
      <div className="w-full max-w-[26rem] sm:max-w-md">
        {userProfile ? (
          <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-500 w-full">
            
            {/* --- BLOCCO UTENTE --- */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-center shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-5 text-left">
                <button 
                  onClick={() => setShowAvatarModal(true)}
                  className="relative w-20 h-20 shrink-0 group"
                >
                  <div className={`w-full h-full bg-gradient-to-br ${currentAvatar.color} rounded-full flex items-center justify-center text-4xl border-2 border-slate-800 shadow-md group-hover:border-yellow-500 transition-all overflow-hidden`}>
                    {currentAvatar.flagCode ? (
                      <img 
                        src={`https://flagcdn.com/w80/${currentAvatar.flagCode}.png`} 
                        alt={currentAvatar.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="drop-shadow-md">{currentAvatar.emoji}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-sky-500 text-white p-2 rounded-full shadow-lg border-2 border-slate-900 group-hover:scale-110 transition-all z-10">
                    <Edit3 size={14} strokeWidth={3} />
                  </div>
                </button>
                
                <div>
                  <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{userProfile.username}</h1>
                  <div className="mt-2">
                    {stats.isPaid ? (
                      <span className="text-emerald-400 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1"><Shield size={12}/> Quota Ok</span>
                    ) : (
                      <button onClick={copyPaymentInfo} className="text-rose-500 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse hover:text-white transition-colors"><X size={12} strokeWidth={3}/> Quota Mancante</button>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={handleLogout} className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 hover:text-rose-500 transition-colors">
                Esci
              </button>
            </div>

            {/* --- PUNTEGGIO PRINCIPALE --- */}
            <div className="bg-yellow-500 p-6 rounded-3xl flex items-center justify-between shadow-md">
              <div>
                <p className="text-[11px] font-black text-slate-950 uppercase tracking-widest opacity-80 italic">Punti Totali</p>
                <p className="text-7xl font-black text-slate-950 tracking-tighter leading-none mt-1">{stats.total}</p>
              </div>
              <div className="text-right bg-slate-950/10 p-5 rounded-2xl">
                <p className="text-[10px] font-black text-slate-950/70 uppercase tracking-widest">Ranking</p>
                <p className="text-4xl font-black text-slate-950 leading-none">#{stats.rank}</p>
              </div>
            </div>

            {/* --- DETTAGLIO PUNTI --- */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Gironi', val: stats.groups },
                { label: 'Tabellone', val: stats.bracket },
                { label: 'Bonus', val: stats.bonus }
              ].map((s) => (
                <div key={s.label} className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center shadow-sm">
                  <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase italic leading-none mb-2">{s.label}</p>
                  <p className="text-2xl sm:text-3xl font-black text-white leading-none">{s.val}</p>
                </div>
              ))}
            </div>

            {/* ⚡ PANNELLO STATISTICHE LIVE TORNEO */}
            <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-md w-full animate-in fade-in duration-500 mt-4">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800/50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </div>
                  <h2 className="text-rose-500 text-xs font-black uppercase italic tracking-widest">
                    Statistiche Live Torneo
                  </h2>
                </div>
                <BarChart3 size={14} className="text-slate-500" />
              </div>

              {/* Contatori Flash */}
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                 {/* 🟥 CARTELLINO ROSSO CUSTOM (Tailwind HTML Card) */}
                 <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                   <div className="w-3 h-4 bg-rose-600 rounded-[2px] mx-auto mb-1.5 shadow-[0_0_10px_rgba(225,29,72,0.6)]"></div>
                   <p className="text-[9px] text-slate-500 uppercase font-black">Rossi</p>
                   <p className="text-xl font-black text-white">{officialBonuses?.total_red_cards || 0}</p>
                 </div>
                 <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                   <Goal size={14} className="text-blue-500 mx-auto mb-1" />
                   <p className="text-[9px] text-slate-500 uppercase font-black">Rigori</p>
                   <p className="text-xl font-black text-white">{officialBonuses?.total_penalties || 0}</p>
                 </div>
                 <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                   <Target size={14} className="text-rose-500 mx-auto mb-1" />
                   <p className="text-[9px] text-slate-500 uppercase font-black">Autogol</p>
                   <p className="text-xl font-black text-white">{officialBonuses?.total_own_goals || 0}</p>
                 </div>
              </div>

              {/* Selettori del Mini-Tab Inline */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 mb-3">
                <button 
                  onClick={() => setActiveLiveTab('scorers')}
                  className={`flex-1 py-2 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                    activeLiveTab === 'scorers' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm' : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <Award size={10}/> ⚽ Bomber
                </button>
                <button 
                  onClick={() => setActiveLiveTab('groups')}
                  className={`flex-1 py-2 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                    activeLiveTab === 'groups' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 shadow-sm' : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <BarChart3 size={10}/> 📊 Gol Gironi
                </button>
              </div>

              {/* Contenitore Fisso Inline con Scorrimento Interno Bloccato */}
              <div className="bg-slate-950/40 border border-slate-800/80 p-3 rounded-2xl h-36 max-h-36 overflow-y-auto pr-1 custom-scrollbar mb-4">
                {activeLiveTab === 'scorers' && (
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    {topScorers.length === 0 ? (
                      <p className="text-center text-slate-600 text-[10px] font-black uppercase pt-8 tracking-widest">Nessun marcatore inserito</p>
                    ) : (
                      topScorers.map((scorer, idx) => {
                        const rank = idx + 1;
                        const rankColor = rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-slate-400' : rank === 3 ? 'text-amber-600' : 'text-slate-500';
                        return (
                          <div key={scorer.id} className="flex justify-between items-center text-[11px] py-1 border-b border-slate-900/40 last:border-0">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <span className={`font-black w-3.5 text-center shrink-0 ${rankColor}`}>{rank}</span>
                              <img src={`https://flagcdn.com/w20/${scorer.team_code.toLowerCase()}.png`} className="w-4 h-3 object-cover rounded-sm shadow-sm shrink-0" alt="" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                              <span className="font-bold text-slate-300 truncate uppercase pr-1">{scorer.name}</span>
                            </div>
                            <span className="font-black text-cyan-400 bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10 shrink-0">{scorer.goals} Gol</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {activeLiveTab === 'groups' && (
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    {Object.entries(liveStats.groupGoals)
                      .sort((a, b) => b[1] - a[1])
                      .map(([groupName, goals], idx) => {
                        const rank = idx + 1;
                        const rankColor = rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-slate-400' : rank === 3 ? 'text-amber-600' : 'text-slate-500';
                        return (
                          <div key={groupName} className="flex justify-between items-center text-[11px] py-1 border-b border-slate-900/40 last:border-0">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <span className={`font-black w-3.5 text-center shrink-0 ${rankColor}`}>{rank}</span>
                              <span className="font-bold text-slate-300 truncate uppercase">{groupName}</span>
                            </div>
                            <span className="font-black text-yellow-500 bg-yellow-500/5 px-2 py-0.5 rounded border border-yellow-500/10 shrink-0">{goals} Gol</span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Accordion dei Pronostici Futuri di Fine Torneo */}
              <div className="border-t border-slate-800/80 pt-3">
                <button 
                  onClick={() => setShowFinalBonuses(!showFinalBonuses)}
                  className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between hover:bg-slate-900 hover:border-slate-700 transition-colors"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Trophy size={12} className="text-yellow-500"/> I Miei Pronostici di Fine Torneo
                  </span>
                  {showFinalBonuses ? <ChevronUp size={14} className="text-slate-500"/> : <ChevronDown size={14} className="text-slate-500"/>}
                </button>

                {showFinalBonuses && (
                  <div className="grid grid-cols-2 gap-2 mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {[
                      { key: 'mvp_world_cup', label: 'MVP', icon: <Trophy size={12}/> },
                      { key: 'top_scorer', label: 'Capocannoniere', icon: <Award size={12}/> },
                      { key: 'best_goalkeeper', label: 'Miglior Portiere', icon: <ShieldCheck size={12}/> },
                      { key: 'high_scoring_match', label: 'Match + Gol', icon: <Flame size={12}/> },
                      { key: 'highest_scoring_group', label: 'Girone + Gol', icon: <ArrowUpToLine size={12}/> },
                      { key: 'lowest_scoring_group', label: 'Girone - Gol', icon: <ArrowDownToLine size={12}/> },
                    ].map((s) => {
                      const myPick = userBonuses?.[s.key];
                      const offStat = officialBonuses?.[s.key];
                      const displayOff = offStat != null && String(offStat).trim() !== '' ? offStat : '--';
                      const isMatch = myPick && offStat && String(myPick).toLowerCase().trim() === String(offStat).toLowerCase().trim();

                      return (
                        <div key={s.key} className={`bg-slate-950 border p-2.5 rounded-2xl flex flex-col justify-between transition-colors ${isMatch ? 'border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.1)]' : 'border-slate-800/60'}`}>
                          <div className={`flex items-center gap-1 mb-2 ${isMatch ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {s.icon} <span className="text-[8px] font-black uppercase tracking-wider truncate">{s.label}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-center border-b border-slate-800/50 pb-1 gap-1">
                              <span className="text-[7px] text-slate-600 uppercase font-black shrink-0">Scelta</span>
                              <span className="text-[9px] text-slate-300 font-bold truncate text-right">{myPick || '--'}</span>
                            </div>
                            <div className="flex justify-between items-center pt-0.5 gap-1">
                              <span className="text-[7px] text-rose-500 uppercase font-black shrink-0">Reale</span>
                              <span className={`text-[10px] font-black truncate text-right ${isMatch ? 'text-emerald-400' : 'text-white'}`}>{displayOff}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Cerca Bomber Secondario */}
              <div className="mt-4 pt-3 border-t border-slate-800/50">
                <button onClick={() => setShowScorersModal(true)} className="w-full py-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-black rounded-xl uppercase tracking-widest text-[9px] sm:text-[10px] flex items-center justify-center gap-2 hover:bg-cyan-500/20 transition-all shadow-sm">
                   <Search size={14}/> Cerca Bomber Nel Dettaglio
                </button>
              </div>
            </div>

            {/* --- BOTTONI EXTRA --- */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => router.push('/groups')} className="py-4 bg-blue-600/10 border border-blue-500/30 text-blue-400 font-black rounded-2xl uppercase tracking-widest text-[11px] sm:text-xs hover:bg-blue-600/20 transition-all flex items-center justify-center gap-2 shadow-sm">
                <Map size={16} /> Gironi Ufficiali
              </button>
              <button onClick={() => router.push('/regolamento')} className="py-4 bg-slate-900 border border-slate-800 text-slate-300 font-black rounded-2xl uppercase tracking-widest text-[11px] sm:text-xs hover:border-slate-700 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm">
                <BookOpen size={16} /> Regolamento
              </button>
            </div>

            {checkIsAdmin() && (
              <Link href="/admin" className="w-full flex items-center justify-center py-4 bg-rose-600/10 text-rose-500 border border-rose-600/20 font-black rounded-2xl uppercase tracking-widest text-[11px] hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                ⚙️ Pannello Admin
              </Link>
            )}
            
          </div>
        ) : (
          /* --- DESIGN ACCESSO / REGISTRAZIONE --- */
          <div className="bg-slate-900 border border-slate-800 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl mt-10 w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-black text-yellow-500 uppercase italic">
                {isRegistering ? 'Iscriviti' : 'Entra'}
              </h1>
              <p className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">World Cup 2026 Access</p>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              <input type="text" placeholder="USERNAME" className="w-full p-4 sm:p-5 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-yellow-500 outline-none text-white font-black text-sm uppercase" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <input type="password" placeholder="PASSWORD" className="w-full p-4 sm:p-5 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-yellow-500 outline-none text-white font-black text-sm uppercase" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="submit" disabled={authLoading} className="w-full py-5 bg-yellow-500 text-slate-950 font-black rounded-2xl uppercase tracking-widest text-sm mt-4 active:scale-95 shadow-xl transition-all">
                {authLoading ? 'Accesso in corso...' : isRegistering ? 'Crea Account' : 'Inizia a Giocare'}
              </button>
            </form>
            <button onClick={() => setIsRegistering(!isRegistering)} className="w-full mt-6 sm:mt-8 text-[10px] font-black text-slate-500 hover:text-yellow-500 uppercase tracking-widest italic text-center transition-colors">
              {isRegistering ? 'Hai già un account? Accedi' : 'Nuovo giocatore? Registrati'}
            </button>
          </div>
        )}
      </div>

      {/* --- MODALE SELECT AVATAR --- */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md pb-24 sm:pb-4">
          <div className="bg-slate-900 border-t-2 sm:border-2 border-yellow-500/40 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-yellow-500 font-black uppercase italic tracking-tighter text-lg">Scegli Avatar</h3>
              <button onClick={() => setShowAvatarModal(false)} className="bg-slate-950 p-2 rounded-full text-slate-500 hover:text-rose-500 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => updateAvatar(avatar.id)}
                  className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all active:scale-90 overflow-hidden ${
                    userProfile?.avatar_id === avatar.id 
                      ? 'bg-yellow-500/20 border-yellow-500' 
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full mb-1.5 flex items-center justify-center text-2xl bg-gradient-to-br overflow-hidden ${avatar.color}`}>
                    {avatar.flagCode ? (
                       <img src={`https://flagcdn.com/w80/${avatar.flagCode}.png`} alt={avatar.name} className="w-full h-full object-cover" />
                    ) : (
                       <span>{avatar.emoji}</span>
                    )}
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-tighter text-center leading-tight ${userProfile?.avatar_id === avatar.id ? 'text-yellow-500' : 'text-slate-500'}`}>
                    {avatar.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- MODALE SEARCH TOP MARCATORI (BOTTOM SHEET DETTAGLIATO) --- */}
      {showScorersModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 pb-24 sm:pb-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col h-[65vh] max-h-[520px] overflow-hidden">
            
            <div className="flex justify-between items-center mb-4 border-b border-slate-800/50 pb-4 shrink-0">
              <div>
                <h3 className="text-cyan-400 font-black uppercase italic tracking-tighter text-lg">Cerca Giocatore</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Classifica Completa</p>
              </div>
              <button 
                onClick={() => { setShowScorersModal(false); setScorerSearch(''); }} 
                className="bg-slate-950 p-2 rounded-full text-slate-500 hover:text-rose-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative mb-4 shrink-0">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-600">
                <Search size={14} />
              </div>
              <input
                type="text"
                placeholder="DIGITA IL NOME..."
                value={scorerSearch}
                onChange={(e) => setScorerSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-cyan-400 outline-none text-white font-black text-xs uppercase tracking-wider placeholder:text-slate-600 transition-colors"
              />
            </div>
            
            <div className="space-y-1.5 overflow-y-auto pr-1 custom-scrollbar flex-1 min-h-0">
              {filteredScorers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    {topScorers.length === 0 ? 'Nessun marcatore inserito' : 'Nessun marcatore trovato'}
                  </p>
                </div>
              ) : (
                filteredScorers.map((scorer) => {
                  const realRank = topScorers.findIndex(s => s.id === scorer.id) + 1;
                  const isTop3 = realRank <= 3;
                  const rankColor = realRank === 1 ? 'text-yellow-500' : realRank === 2 ? 'text-slate-400' : realRank === 3 ? 'text-amber-600' : 'text-slate-600';

                  return (
                    <div 
                      key={scorer.id} 
                      className={`flex justify-between items-center py-2.5 px-3 bg-slate-950 border rounded-xl transition-colors ${
                        isTop3 ? 'border-cyan-500/20 bg-cyan-950/5' : 'border-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className={`font-black text-xs shrink-0 w-5 text-center ${rankColor}`}>
                          {realRank}
                        </span>
                        <img 
                          src={`https://flagcdn.com/w40/${scorer.team_code.toLowerCase()}.png`} 
                          alt="" 
                          className="w-5 h-3.5 object-cover rounded-sm shadow-sm shrink-0" 
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                        <span className="font-black text-xs uppercase text-slate-200 truncate pr-2">
                          {scorer.name}
                        </span>
                      </div>
                      <span className="font-black text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20 shrink-0">
                        {scorer.goals} <span className="text-[9px] text-cyan-500/80 font-bold uppercase ml-0.5">Gol</span>
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}