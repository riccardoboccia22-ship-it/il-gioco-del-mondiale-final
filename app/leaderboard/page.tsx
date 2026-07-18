'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { WORLD_CUP_PLAYERS, WORLD_CUP_GOALKEEPERS } from '@/lib/players';
import { 
  Trophy, 
  Medal, 
  Crown, 
  ChevronUp, 
  ChevronDown, 
  Minus,
  Loader2,
  Target,
  X,
  Gamepad2,
  Star,
  Shield,
  Search,
  Lock,
  Award,
  Coins
} from 'lucide-react';

const FINALE_REVEAL_DATE = new Date('2026-07-18T23:00:00+02:00'); // Data e ora sblocco visualizzazione pronostici

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

const STAGE_POINTS: Record<string, number> = { R32: 2, R16: 4, QF: 6, SF: 8, F: 10, WINNER: 20 };
const STAGE_CAPACITY: Record<string, number> = { R32: 32, R16: 16, QF: 8, SF: 4, F: 2, WINNER: 1 };
const STAGE_LABELS: Record<string, string> = { R32: 'Sedicesimi', R16: 'Ottavi', QF: 'Quarti', SF: 'Semifinale', F: 'Finalista', WINNER: 'Campione' };

const BRACKET_LINKS = [
  { stage1: ['R32_SEDICESIMI_1E', 'R32_SEDICESIMI_3M1'], winner: 'R16_OTTAVI_V1' },
  { stage1: ['R32_SEDICESIMI_1I', 'R32_SEDICESIMI_3M2'], winner: 'R16_OTTAVI_V2' },
  { stage1: ['R32_SEDICESIMI_2A', 'R32_SEDICESIMI_2B'], winner: 'R16_OTTAVI_V3' },
  { stage1: ['R32_SEDICESIMI_1F', 'R32_SEDICESIMI_2C'], winner: 'R16_OTTAVI_V4' },
  { stage1: ['R32_SEDICESIMI_2K', 'R32_SEDICESIMI_2L'], winner: 'R16_OTTAVI_V5' },
  { stage1: ['R32_SEDICESIMI_1H', 'R32_SEDICESIMI_2J'], winner: 'R16_OTTAVI_V6' },
  { stage1: ['R32_SEDICESIMI_1D', 'R32_SEDICESIMI_3M5'], winner: 'R16_OTTAVI_V7' },
  { stage1: ['R32_SEDICESIMI_1G', 'R32_SEDICESIMI_3M6'], winner: 'R16_OTTAVI_V8' },
  { stage1: ['R32_SEDICESIMI_1C', 'R32_SEDICESIMI_2F'], winner: 'R16_OTTAVI_V9' },
  { stage1: ['R32_SEDICESIMI_2E', 'R32_SEDICESIMI_2I'], winner: 'R16_OTTAVI_V10' },
  { stage1: ['R32_SEDICESIMI_1A', 'R32_SEDICESIMI_3M3'], winner: 'R16_OTTAVI_V11' },
  { stage1: ['R32_SEDICESIMI_1L', 'R32_SEDICESIMI_3M4'], winner: 'R16_OTTAVI_V12' },
  { stage1: ['R32_SEDICESIMI_1J', 'R32_SEDICESIMI_2H'], winner: 'R16_OTTAVI_V13' },
  { stage1: ['R32_SEDICESIMI_2D', 'R32_SEDICESIMI_2G'], winner: 'R16_OTTAVI_V14' },
  { stage1: ['R32_SEDICESIMI_1B', 'R32_SEDICESIMI_3M7'], winner: 'R16_OTTAVI_V15' },
  { stage1: ['R32_SEDICESIMI_1K', 'R32_SEDICESIMI_3M8'], winner: 'R16_OTTAVI_V16' },
  { stage1: ['R16_OTTAVI_V1', 'R16_OTTAVI_V2'], winner: 'QF_QUARTI_V1' },
  { stage1: ['R16_OTTAVI_V3', 'R16_OTTAVI_V4'], winner: 'QF_QUARTI_V2' },
  { stage1: ['R16_OTTAVI_V5', 'R16_OTTAVI_V6'], winner: 'QF_QUARTI_V3' },
  { stage1: ['R16_OTTAVI_V7', 'R16_OTTAVI_V8'], winner: 'QF_QUARTI_V4' },
  { stage1: ['R16_OTTAVI_V9', 'R16_OTTAVI_V10'], winner: 'QF_QUARTI_V5' },
  { stage1: ['R16_OTTAVI_V11', 'R16_OTTAVI_V12'], winner: 'QF_QUARTI_V6' },
  { stage1: ['R16_OTTAVI_V13', 'R16_OTTAVI_V14'], winner: 'QF_QUARTI_V7' },
  { stage1: ['R16_OTTAVI_V15', 'R16_OTTAVI_V16'], winner: 'QF_QUARTI_V8' },
  { stage1: ['QF_QUARTI_V1', 'QF_QUARTI_V2'], winner: 'SF_SEMIFINALI_V1' },
  { stage1: ['QF_QUARTI_V3', 'QF_QUARTI_V4'], winner: 'SF_SEMIFINALI_V2' },
  { stage1: ['QF_QUARTI_V5', 'QF_QUARTI_V6'], winner: 'SF_SEMIFINALI_V3' },
  { stage1: ['QF_QUARTI_V7', 'QF_QUARTI_V8'], winner: 'SF_SEMIFINALI_V4' },
  { stage1: ['SF_SEMIFINALI_V1', 'SF_SEMIFINALI_V2'], winner: 'F_FINALE_1' },
  { stage1: ['SF_SEMIFINALI_V3', 'SF_SEMIFINALI_V4'], winner: 'F_FINALE_2' },
  { stage1: ['F_FINALE_1', 'F_FINALE_2'], winner: 'WINNER_VINCITORE_1' }
];

const normalizeStage = (s: string) => {
  const u = s?.toUpperCase().trim() || '';
  if (u.includes('SEDICESIM') || u === 'R32') return 'R32';
  if (u.includes('OTTAV') || u === 'R16') return 'R16';
  if (u.includes('QUART') || u === 'QF') return 'QF';
  if (u.includes('SEMIFINAL') || u === 'SF') return 'SF';
  if (u.includes('VINCITOR') || u.includes('CAMPIONE') || u === 'WINNER') return 'WINNER';
  if (u.includes('FINAL') || u === 'F') return 'F';
  return u;
};

const formatMatchName = (matchString: string) => {
  if (!matchString) return '';
  let formatted = matchString;
  formatted = formatted.replace(/Repubblica Democratica del Congo/gi, 'R.D. Congo');
  formatted = formatted.replace(/Repubblica Ceca/gi, 'Rep. Ceca');
  formatted = formatted.replace(/Bosnia ed Erzegovina|Bosnia Erzegovina/gi, 'Bosnia');
  formatted = formatted.replace(/Stati Uniti|USA/gi, 'USA');
  formatted = formatted.replace(/Arabia Saudita/gi, 'Arabia S.');
  formatted = formatted.replace(/Nuova Zelanda/gi, 'N. Zelanda');
  formatted = formatted.replace(/Corea del Sud|Corea Sud/gi, 'Corea Sud');
  formatted = formatted.replace(/Costa d'Avorio|Costa Avorio/gi, 'Costa Avorio');
  return formatted;
};

const cleanString = (str: string) => {
  if (!str) return '';
  return formatMatchName(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

const flagMap: { [key: string]: string } = {
  'messico': 'mx', 'sudafrica': 'za', 'corea sud': 'kr', 'rep. ceca': 'cz',
  'canada': 'ca', 'svizzera': 'ch', 'qatar': 'qa', 'bosnia': 'ba',
  'brasile': 'br', 'marocco': 'ma', 'haiti': 'ht', 'scozia': 'gb-sct',
  'usa': 'us', 'australia': 'au', 'paraguay': 'py', 'turchia': 'tr',
  'germania': 'de', 'costa avorio': 'ci', 'ecuador': 'ec', 'curacao': 'cw',
  'olanda': 'nl', 'svezia': 'se', 'giappone': 'jp', 'tunisia': 'tn',
  'belgio': 'be', 'iran': 'ir', 'egitto': 'eg', 'n. zelanda': 'nz',
  'spagna': 'es', 'uruguay': 'uy', 'arabia s.': 'sa', 'capo verde': 'cv',
  'francia': 'fr', 'senegal': 'sn', 'norvegia': 'no', 'iraq': 'iq',
  'argentina': 'ar', 'austria': 'at', 'algeria': 'dz', 'giordania': 'jo',
  'portogallo': 'pt', 'colombia': 'co', 'uzbekistan': 'uz', 'r.d. congo': 'cd',
  'inghilterra': 'gb-eng', 'croazia': 'hr', 'ghana': 'gh', 'panama': 'pa'
};

const getTeamFlagCode = (teamName: string) => {
  if (!teamName) return null;
  const formattedName = formatMatchName(teamName).toLowerCase();
  return flagMap[formattedName] || null;
};

const getEliminatedTeams = (officialBracketData: any[]) => {
  const eliminated = new Set<string>();
  const slotMap: Record<string, string> = {};
  
  officialBracketData.forEach(ob => {
     if (ob.team_name) slotMap[ob.stage] = cleanString(ob.team_name);
  });

  const r32Teams = officialBracketData.filter(ob => normalizeStage(ob.stage) === 'R32' && ob.team_name).map(ob => cleanString(ob.team_name));
  if (r32Teams.length === 32) {
     TOURNAMENT_GROUPS.forEach(g => g.teams.forEach(t => {
        const cleanT = cleanString(t);
        if (!r32Teams.includes(cleanT)) eliminated.add(cleanT);
     }));
  }

  BRACKET_LINKS.forEach(link => {
     const winnerTeam = slotMap[link.winner];
     if (winnerTeam) {
        const t1 = slotMap[link.stage1[0]];
        const t2 = slotMap[link.stage1[1]];
        if (t1 && t1 !== winnerTeam) eliminated.add(t1);
        if (t2 && t2 !== winnerTeam) eliminated.add(t2);
     }
  });

  return eliminated;
};

type AvatarDef = {
  id: string;
  name: string;
  emoji?: string;
  color: string;
  flagCode?: string;
};

const AVATARS: AvatarDef[] = [
  { id: 'trainer', name: 'Il Mister', emoji: '🧢', color: 'from-blue-600 to-blue-400' },
  { id: 'wizard', name: 'Il Mago', emoji: '🪄', color: 'from-purple-600 to-purple-400' },
  { id: 'bomber', name: 'Il Bomber', emoji: '⚽', color: 'from-rose-600 to-rose-400' },
  { id: 'legend', name: 'Pallone d\'Oro', emoji: '🏆', color: 'from-yellow-600 to-yellow-400' },
  { id: 'ninja', name: 'Ninja', emoji: '🥷', color: 'from-zinc-800 to-zinc-600' },
  { id: 'clown', name: 'Clown', emoji: '🤡', color: 'from-red-500 to-sky-500' },
  { id: 'pirate', name: 'Pirati', emoji: '💀', color: 'from-zinc-900 to-zinc-700' },
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
  { id: 'moose', name: 'Alce', emoji: '𫎟', color: 'from-amber-700 to-stone-600' },
  { id: 'beer', name: 'Birra', emoji: '🍺', color: 'from-yellow-400 to-amber-500' },
  { id: 'mate', name: 'Mate', emoji: '🧉', color: 'from-green-700 to-emerald-500' },
  { id: 'cocktail', name: 'Cocktail', emoji: '🍹', color: 'from-rose-400 to-orange-400' },
  { id: 'banana', name: 'Banana', emoji: '🍌', color: 'from-yellow-300 to-yellow-500' },
  { id: 'carrot', name: 'Carota', emoji: '🥕', color: 'from-orange-400 to-orange-600' },
  { id: 'pepper', name: 'Peperoncino', emoji: '🌶️', color: 'from-red-500 to-red-700' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕', color: 'from-red-400 to-amber-400' },
  { id: 'corn', name: 'Pannocchia', emoji: '🌽', color: 'from-yellow-300 to-green-500' },
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
  { id: 'alien', name: 'Alieno', emoji: '👽', color: 'from-green-400 to-lime-600' },
  { id: 'ghost', name: 'Fantasma', emoji: '👻', color: 'from-slate-100 to-slate-300' },
  { id: 'robot', name: 'Robot', emoji: '🤖', color: 'from-zinc-400 to-slate-500' },
  { id: 'pumpkin', name: 'Zucca', emoji: '🎃', color: 'from-orange-500 to-orange-700' },
  { id: 'brain', name: 'Cervello', emoji: '🧠', color: 'from-pink-300 to-rose-400' },
  { id: 'zombie', name: 'Zombie', emoji: '🧟‍♂️', color: 'from-teal-600 to-green-800' },
  { id: 'genie', name: 'Genio', emoji: '🧞‍♂️', color: 'from-blue-500 to-indigo-600' },
  { id: 'ufo', name: 'UFO', emoji: '🛸', color: 'from-indigo-500 to-purple-700' },
  { id: 'f1', name: 'Formula 1', emoji: '🏎️', color: 'from-red-600 to-red-400' },
  { id: 'moto', name: 'Moto', emoji: '🏍️', color: 'from-orange-500 to-amber-400' },
  { id: 'scooter', name: 'Scooter', emoji: '🛵', color: 'from-sky-500 to-blue-300' },
  { id: 'train', name: 'Treno', emoji: '🚂', color: 'from-zinc-700 to-slate-500' },
  { id: 'roller', name: 'Roller', emoji: '🎢', color: 'from-indigo-600 to-purple-500' },
  { id: 'missile', name: 'Missile', emoji: '🚀', color: 'from-slate-200 to-orange-400' },
  { id: 'paragliding', name: 'Parapendio', emoji: '🪂', color: 'from-rose-500 to-orange-400' },
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
  
  const [viewMode, setViewMode] = useState<'GENERAL' | 'FINALE'>('GENERAL');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [finaleLeaderboard, setFinaleLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [isFinaleVisible, setIsFinaleVisible] = useState(false);

  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const [playerPredictions, setPlayerPredictions] = useState<any[]>([]);
  const [playerBrackets, setPlayerBrackets] = useState<any[]>([]);
  const [playerBonuses, setPlayerBonuses] = useState<any[]>([]);
  const [playerFinale, setPlayerFinale] = useState<any[]>([]);
  const [officialFinale, setOfficialFinale] = useState<any>(null); // Nuovo stato per risultati live
  
  const [detailTab, setDetailTab] = useState<'MATCHES' | 'BRACKET' | 'BONUS' | 'FINALE'>('MATCHES');

 // STATO PER I GRUPPI DELLA FINALE (Fisarmonica)
 const [expandedFinaleGroups, setExpandedFinaleGroups] = useState<Record<string, boolean>>({
  '🏆 FINALISSIMA': false,
  '🥉 3°/4° POSTO': false
});

  const [officialBracket, setOfficialBracket] = useState<any[]>([]);
  const [officialBonuses, setOfficialBonuses] = useState<any>(null);
  
  const [isFinaleActive, setIsFinaleActive] = useState(false);
  const [eliminatedTeams, setEliminatedTeams] = useState<Set<string>>(new Set());

  useEffect(() => {
    setIsFinaleVisible(new Date() >= FINALE_REVEAL_DATE);
    fetchLeaderboard();

    const channel = supabase
      .channel('leaderboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => { fetchLeaderboard(false); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  async function fetchLeaderboard(showLoader = true) {
    try {
      if (showLoader) setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }

      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      if (!profile || !profile.full_name) { router.push('/setup-profilo'); return; }

      // Aggiunto fetching dei risultati live della finale (utente admin: tutti zeri)
      const [profRes, offBracketRes, offBonusRes, finaleRes, settingsRes, officialFinaleRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('official_bracket').select('*'),
        supabase.from('official_bonuses').select('*').eq('id', '00000000-0000-0000-0000-000000000000').maybeSingle(),
        supabase.from('final_match_predictions').select('user_id, total_points'),
        supabase.from('app_settings').select('is_finale_active').eq('id', 1).maybeSingle(),
        supabase.from('final_match_predictions').select('*').eq('user_id', '00000000-0000-0000-0000-000000000000').maybeSingle()
      ]);

      if (profRes.error) throw profRes.error;

      if (settingsRes.data) {
        setIsFinaleActive(settingsRes.data.is_finale_active);
      }

      if (officialFinaleRes.data) {
        setOfficialFinale(officialFinaleRes.data);
      }

      if (profRes.data) {
        const sorted = [...profRes.data].sort((a, b) => {
          const rankA = a.ranking ?? 9999;
          const rankB = b.ranking ?? 9999;
          if (rankA === 9999 && rankB === 9999) return (b.points || 0) - (a.points || 0);
          return rankA - rankB;
        });
        setLeaderboard(sorted);
        
        if (finaleRes.data) {
          const finaleBoard = finaleRes.data.map(fin => {
            const p = profRes.data.find(profile => profile.id === fin.user_id);
            if (!p) return null;
            return { ...p, finale_points: fin.total_points || 0 };
          }).filter(p => p !== null).sort((a: any, b: any) => b.finale_points - a.finale_points);
          
          setFinaleLeaderboard(finaleBoard);
        }
      }

      const offBracketData = offBracketRes.data || [];
      setOfficialBracket(offBracketData);
      setOfficialBonuses(offBonusRes.data || null);
      
      setEliminatedTeams(getEliminatedTeams(offBracketData));

    } catch (err) {
      console.error("Sync Error:", err);
      toast.error('Errore di sincronizzazione db.');
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  const calculateMatchPoints = (predHome: any, predAway: any, realHome: any, realAway: any) => {
    if (predHome === null || predAway === null || realHome === null || realAway === null) return 0;
    const pH = Number(predHome), pA = Number(predAway), rH = Number(realHome), rA = Number(realAway);
    if (pH === rH && pA === rA) return 10;
    const pS = pH > pA ? '1' : pH < pA ? '2' : 'X', rS = rH > rA ? '1' : rH < rA ? '2' : 'X';
    const sMatch = pS === rS, gMatch = pH === rH || pA === rA;
    if (sMatch && gMatch) return 6;
    if (sMatch && !gMatch) return 4;
    if (!sMatch && gMatch) return 2;
    return 0;
  };

  const handlePlayerClick = async (player: any, defaultTab: 'MATCHES' | 'BRACKET' | 'BONUS' | 'FINALE' = 'MATCHES') => {
    setSelectedPlayer(player);
    setDetailTab(defaultTab); 
    setShowDetailsModal(true);
    setLoadingDetails(true);

    try {
      const { data: preds } = await supabase.from('predictions').select('*').eq('user_id', player.id);
      let combinedMatches: any[] = [];
      
      if (preds && preds.length > 0) {
        const matchIds = preds.map(p => p.match_id).filter(Boolean);
        if (matchIds.length > 0) {
          const { data: matches } = await supabase.from('matches').select('*').in('id', matchIds).eq('is_finished', true);
          combinedMatches = preds.map(pred => {
            const mData = matches?.find(m => m.id === pred.match_id);
            if (!mData) return null; 
            const pts = calculateMatchPoints(pred.home_score, pred.away_score, mData.home_score_final, mData.away_score_final);
            return { home_score: pred.home_score, away_score: pred.away_score, points: pts, matches: mData };
          }).filter(item => item !== null).sort((a: any, b: any) => {
            const dateA = a.matches.match_date || a.matches.id;
            const dateB = b.matches.match_date || b.matches.id;
            return dateA < dateB ? -1 : 1;
          });
        }
      }
      setPlayerPredictions(combinedMatches);

      const { data: bData } = await supabase.from('brackets').select('*').eq('user_id', player.id);
      const processedBrackets: any[] = [];
      const seenBrackets = new Set(); 
      
      bData?.forEach(b => {
         const uS = normalizeStage(b.stage);
         const cleanT = cleanString(b.team_name);
         const uniqueKey = `${uS}-${cleanT}`;
         if (!cleanT) return;
         
         const officialTeamsInStage = officialBracket.filter(ob => normalizeStage(ob.stage) === uS);
         const isCorrect = officialTeamsInStage.some(ob => cleanString(ob.team_name) === cleanT);
         const isEliminated = eliminatedTeams.has(cleanT);
         const isStageFull = officialTeamsInStage.length >= (STAGE_CAPACITY[uS] || 99);
         
         if (!seenBrackets.has(uniqueKey)) {
            seenBrackets.add(uniqueKey);
            const pts = STAGE_POINTS[uS] || 0;
            if (isCorrect) {
               processedBrackets.push({ team: b.team_name, stageLabel: STAGE_LABELS[uS], points: pts, status: 'CORRECT', stageValue: pts });
            } else if (isEliminated || isStageFull) {
               processedBrackets.push({ team: b.team_name, stageLabel: STAGE_LABELS[uS], points: 0, status: 'WRONG', stageValue: pts });
            } else {
               processedBrackets.push({ team: b.team_name, stageLabel: STAGE_LABELS[uS], points: 0, status: 'PENDING', stageValue: pts });
            }
         }
      });
      
      setPlayerBrackets(processedBrackets.sort((a,b) => {
         if (b.stageValue !== a.stageValue) return b.stageValue - a.stageValue;
         if (a.status !== b.status) {
           if (a.status === 'CORRECT') return -1;
           if (b.status === 'CORRECT') return 1;
           if (a.status === 'WRONG') return 1;
           if (b.status === 'WRONG') return -1;
         }
         return 0;
      }));

      const { data: uBonus } = await supabase.from('user_bonus_answers').select('*').eq('user_id', player.id).maybeSingle();
      const processedBonuses: any[] = [];
      
      const isGroupsClosed = !!(officialBonuses && (
        (officialBonuses.high_scoring_match && officialBonuses.high_scoring_match !== 'TBD' && officialBonuses.high_scoring_match.trim() !== '') ||
        (officialBonuses.highest_scoring_group && officialBonuses.highest_scoring_group !== 'TBD' && officialBonuses.highest_scoring_group.trim() !== '') ||
        (officialBonuses.lowest_scoring_group && officialBonuses.lowest_scoring_group !== 'TBD' && officialBonuses.lowest_scoring_group.trim() !== '')
      ));

      const isTournamentFinished = !!(officialBonuses && (
        (officialBonuses.mvp_world_cup && officialBonuses.mvp_world_cup !== 'TBD' && officialBonuses.mvp_world_cup.trim() !== '') ||
        (officialBonuses.top_scorer && officialBonuses.top_scorer !== 'TBD' && officialBonuses.top_scorer.trim() !== '') ||
        (officialBonuses.best_goalkeeper && officialBonuses.best_goalkeeper !== 'TBD' && officialBonuses.best_goalkeeper.trim() !== '')
      ));

      if (uBonus) {
         const processBonus = (key: string, pts: number, label: string, isEvaluated: boolean) => {
            const uVal = uBonus[key] != null ? String(uBonus[key]).trim() : '';
            if (!uVal) return;
            
            let status = 'PENDING';
            let earnedPts = 0;
            const offVal = officialBonuses ? officialBonuses[key] : null;
            
            if (isEvaluated && offVal != null && offVal !== 'TBD' && String(offVal).trim() !== '') {
               const offValues = String(offVal).split(',').map(v => cleanString(v));
               if (offValues.includes(cleanString(uVal))) {
                   status = 'CORRECT';
                   earnedPts = pts;
               } else {
                   status = 'WRONG';
               }
            }
            processedBonuses.push({ answer: uVal, points: earnedPts, label, status, maxPts: pts, sortOrder: pts });
         };
         
         processBonus('mvp_world_cup', 10, 'MVP Mondiale', isTournamentFinished);
         processBonus('top_scorer', 10, 'Capocannoniere', isTournamentFinished);
         processBonus('best_goalkeeper', 10, 'Miglior Portiere', isTournamentFinished);
         processBonus('high_scoring_match', 5, 'Match + Gol', isGroupsClosed);
         processBonus('highest_scoring_group', 5, 'Girone + Gol', isGroupsClosed);
         processBonus('lowest_scoring_group', 5, 'Girone - Gol', isGroupsClosed);
         processBonus('total_own_goals', 3, 'Totale Autogol', isTournamentFinished);
         processBonus('total_penalties', 3, 'Totale Rigori', isTournamentFinished);
         processBonus('total_red_cards', 3, 'Totale Rossi', isTournamentFinished);
      }
      setPlayerBonuses(processedBonuses.sort((a,b) => {
          if (b.status !== a.status) {
             if (a.status === 'CORRECT') return -1;
             if (b.status === 'CORRECT') return 1;
          }
          return b.sortOrder - a.sortOrder;
      }));

      // --- LOGICA DI CONFRONTO E ASSEGNAZIONE LIVE DEI PUNTI PER LA FINALE ---
      const { data: finaleData } = await supabase.from('final_match_predictions').select('*').eq('user_id', player.id).maybeSingle();
      const processedFinale: any[] = [];
      
      if (finaleData) {
        const o = officialFinale || {}; // Risultati ufficiali inseriti dall'admin (es. in diretta)

        const addFin = (matchLabel: string, label: string, userVal: any, maxPts: number, earnedPts: number, isEvaluated: boolean) => {
          if (userVal === null || userVal === undefined || userVal === '') return;
          let status = 'PENDING';
          if (isEvaluated) {
             status = earnedPts > 0 ? 'CORRECT' : 'WRONG';
          }
          processedFinale.push({
            matchLabel, label, answer: String(userVal), points: earnedPts, status, maxPts
          });
        };

        // --- DOMENICA (F12) ---
        const l12 = '🏆 FINALISSIMA';

        // Risultato Esatto & Modalità
        if (finaleData.home_score != null && finaleData.away_score != null) {
          const isEval = o.home_score != null && o.home_score !== '' && o.away_score != null && o.away_score !== '';
          const isCorrect = isEval && Number(finaleData.home_score) === Number(o.home_score) && Number(finaleData.away_score) === Number(o.away_score);
          addFin(l12, 'Risultato Esatto', `${finaleData.home_score} - ${finaleData.away_score}`, 30, isCorrect ? 30 : 0, isEval);
          
          const methodCorrect = isEval && finaleData.ending_method === o.ending_method;
          addFin(l12, 'Esito e Modalità', finaleData.ending_method === 'REGULAR' ? 'Nei 90\'' : finaleData.ending_method === 'OVERTIME' ? 'Supplementari' : 'Rigori', 10, methodCorrect ? 10 : 0, isEval);
        }
        
        // MVP
        if (finaleData.f12_mvp) {
          const isEval = !!o.f12_mvp;
          const isCorrect = isEval && cleanString(finaleData.f12_mvp) === cleanString(o.f12_mvp);
          addFin(l12, 'MVP (FIFA)', finaleData.f12_mvp, 12, isCorrect ? 12 : 0, isEval);
        }
        
        // Esatto 1° Tempo
        if (finaleData.f12_ht_home_score != null && finaleData.f12_ht_away_score != null) {
          const isEval = o.f12_ht_home_score != null && o.f12_ht_home_score !== '' && o.f12_ht_away_score != null && o.f12_ht_away_score !== '';
          const isCorrect = isEval && Number(finaleData.f12_ht_home_score) === Number(o.f12_ht_home_score) && Number(finaleData.f12_ht_away_score) === Number(o.f12_ht_away_score);
          addFin(l12, 'Esatto 1° Tempo', `${finaleData.f12_ht_home_score} - ${finaleData.f12_ht_away_score}`, 10, isCorrect ? 10 : 0, isEval);
        }

        // Esatto 2° Tempo
        if (finaleData.f12_2nd_home_score != null && finaleData.f12_2nd_away_score != null) {
          const isEval = o.f12_2nd_home_score != null && o.f12_2nd_home_score !== '' && o.f12_2nd_away_score != null && o.f12_2nd_away_score !== '';
          const isCorrect = isEval && Number(finaleData.f12_2nd_home_score) === Number(o.f12_2nd_home_score) && Number(finaleData.f12_2nd_away_score) === Number(o.f12_2nd_away_score);
          addFin(l12, 'Esatto 2° Tempo', `${finaleData.f12_2nd_home_score} - ${finaleData.f12_2nd_away_score}`, 10, isCorrect ? 10 : 0, isEval);
        }

        // Squadra 1° Gol
        if (finaleData.f12_first_to_score) {
          const isEval = !!o.f12_first_to_score;
          const isCorrect = isEval && cleanString(finaleData.f12_first_to_score) === cleanString(o.f12_first_to_score);
          addFin(l12, 'Squadra 1° Gol', finaleData.f12_first_to_score, 5, isCorrect ? 5 : 0, isEval);
        }

        // Marcatore
        if (finaleData.f12_scorer) {
          const isEval = !!o.f12_scorer;
          const isCorrect = isEval && cleanString(finaleData.f12_scorer) === cleanString(o.f12_scorer);
          addFin(l12, 'Marcatore', finaleData.f12_scorer, 11, isCorrect ? 11 : 0, isEval);
        }

        // Minuto 1° Gol
        if (finaleData.first_goal_minute != null) {
          const isEval = o.first_goal_minute != null && o.first_goal_minute !== '';
          const isCorrect = isEval && Number(finaleData.first_goal_minute) === Number(o.first_goal_minute);
          addFin(l12, 'Minuto 1° Gol', finaleData.first_goal_minute, 10, isCorrect ? 10 : 0, isEval);
        }

        // Falli Fischiati
        if (finaleData.f12_fouls != null) {
          const isEval = o.f12_fouls != null && o.f12_fouls !== '';
          const isCorrect = isEval && Number(finaleData.f12_fouls) === Number(o.f12_fouls);
          addFin(l12, 'Falli Fischiati', finaleData.f12_fouls, 6, isCorrect ? 6 : 0, isEval);
        }
        
        // Cartellini Gialli
        if (finaleData.f12_yellow_cards != null) {
          const isEval = o.f12_yellow_cards != null && o.f12_yellow_cards !== '';
          const isCorrect = isEval && Number(finaleData.f12_yellow_cards) === Number(o.f12_yellow_cards);
          addFin(l12, '🟨 Cartellini Gialli', finaleData.f12_yellow_cards, 3, isCorrect ? 3 : 0, isEval);
        }
        
        // Cartellini Rossi
        if (finaleData.f12_red_cards != null) {
          const isEval = o.f12_red_cards != null && o.f12_red_cards !== '';
          const isCorrect = isEval && Number(finaleData.f12_red_cards) === Number(o.f12_red_cards);
          addFin(l12, '🟥 Cartellini Rossi', finaleData.f12_red_cards, 3, isCorrect ? 3 : 0, isEval);
        }
        
        // Rigori
        if (finaleData.f12_penalties != null) {
          const isEval = o.f12_penalties != null && o.f12_penalties !== '';
          const isCorrect = isEval && Number(finaleData.f12_penalties) === Number(o.f12_penalties);
          addFin(l12, '🥅 Rigori Fischiati', finaleData.f12_penalties, 1, isCorrect ? 1 : 0, isEval);
        }

        // --- SABATO (F34) ---
        const l34 = '🥉 3°/4° POSTO';
        
        // Risultato Esatto (Display Invertito away - home)
        if (finaleData.f34_home_score != null && finaleData.f34_away_score != null) {
          const isEval = o.f34_home_score != null && o.f34_away_score != null && o.f34_home_score !== '' && o.f34_away_score !== '';
          const isCorrect = isEval && Number(finaleData.f34_home_score) === Number(o.f34_home_score) && Number(finaleData.f34_away_score) === Number(o.f34_away_score);
          addFin(l34, 'Risultato Esatto', `${finaleData.f34_away_score} - ${finaleData.f34_home_score}`, 30, isCorrect ? 30 : 0, isEval);
          
          const methodCorrect = isEval && finaleData.f34_ending_method === o.f34_ending_method;
          addFin(l34, 'Esito e Modalità', finaleData.f34_ending_method === 'REGULAR' ? 'Nei 90\'' : finaleData.f34_ending_method === 'OVERTIME' ? 'Supplementari' : 'Rigori', 10, methodCorrect ? 10 : 0, isEval);
        }
        
        // MVP
        if (finaleData.f34_mvp) {
          const isEval = !!o.f34_mvp;
          const isCorrect = isEval && cleanString(finaleData.f34_mvp) === cleanString(o.f34_mvp);
          addFin(l34, 'MVP (FIFA)', finaleData.f34_mvp, 12, isCorrect ? 12 : 0, isEval);
        }
        
        // Esatto 1° Tempo (Invertito away - home)
        if (finaleData.f34_ht_home_score != null && finaleData.f34_ht_away_score != null) {
          const isEval = o.f34_ht_home_score != null && o.f34_ht_away_score != null && o.f34_ht_home_score !== '' && o.f34_ht_away_score !== '';
          const isCorrect = isEval && Number(finaleData.f34_ht_home_score) === Number(o.f34_ht_home_score) && Number(finaleData.f34_ht_away_score) === Number(o.f34_ht_away_score);
          addFin(l34, 'Esatto 1° Tempo', `${finaleData.f34_ht_away_score} - ${finaleData.f34_ht_home_score}`, 10, isCorrect ? 10 : 0, isEval);
        }
        
        // Esatto 2° Tempo (Invertito away - home)
        if (finaleData.f34_2nd_home_score != null && finaleData.f34_2nd_away_score != null) {
          const isEval = o.f34_2nd_home_score != null && o.f34_2nd_away_score != null && o.f34_2nd_home_score !== '' && o.f34_2nd_away_score !== '';
          const isCorrect = isEval && Number(finaleData.f34_2nd_home_score) === Number(o.f34_2nd_home_score) && Number(finaleData.f34_2nd_away_score) === Number(o.f34_2nd_away_score);
          addFin(l34, 'Esatto 2° Tempo', `${finaleData.f34_2nd_away_score} - ${finaleData.f34_2nd_home_score}`, 10, isCorrect ? 10 : 0, isEval);
        }

        // Squadra 1° Gol
        if (finaleData.f34_first_to_score) {
          const isEval = !!o.f34_first_to_score;
          const isCorrect = isEval && cleanString(finaleData.f34_first_to_score) === cleanString(o.f34_first_to_score);
          addFin(l34, 'Squadra 1° Gol', finaleData.f34_first_to_score, 5, isCorrect ? 5 : 0, isEval);
        }

        // Marcatore
        if (finaleData.f34_scorer) {
          const isEval = !!o.f34_scorer;
          const isCorrect = isEval && cleanString(finaleData.f34_scorer) === cleanString(o.f34_scorer);
          addFin(l34, 'Marcatore', finaleData.f34_scorer, 11, isCorrect ? 11 : 0, isEval);
        }

        // Minuto 1° Gol
        if (finaleData.f34_first_goal_minute != null) {
          const isEval = o.f34_first_goal_minute != null && o.f34_first_goal_minute !== '';
          const isCorrect = isEval && Number(finaleData.f34_first_goal_minute) === Number(o.f34_first_goal_minute);
          addFin(l34, 'Minuto 1° Gol', finaleData.f34_first_goal_minute, 10, isCorrect ? 10 : 0, isEval);
        }

        // Falli Fischiati
        if (finaleData.f34_fouls != null) {
          const isEval = o.f34_fouls != null && o.f34_fouls !== '';
          const isCorrect = isEval && Number(finaleData.f34_fouls) === Number(o.f34_fouls);
          addFin(l34, 'Falli Fischiati', finaleData.f34_fouls, 6, isCorrect ? 6 : 0, isEval);
        }
        
        // Cartellini Gialli
        if (finaleData.f34_yellow_cards != null) {
          const isEval = o.f34_yellow_cards != null && o.f34_yellow_cards !== '';
          const isCorrect = isEval && Number(finaleData.f34_yellow_cards) === Number(o.f34_yellow_cards);
          addFin(l34, '🟨 Cartellini Gialli', finaleData.f34_yellow_cards, 3, isCorrect ? 3 : 0, isEval);
        }
        
        // Cartellini Rossi
        if (finaleData.f34_red_cards != null) {
          const isEval = o.f34_red_cards != null && o.f34_red_cards !== '';
          const isCorrect = isEval && Number(finaleData.f34_red_cards) === Number(o.f34_red_cards);
          addFin(l34, '🟥 Cartellini Rossi', finaleData.f34_red_cards, 3, isCorrect ? 3 : 0, isEval);
        }
        
        // Rigori
        if (finaleData.f34_penalties != null) {
          const isEval = o.f34_penalties != null && o.f34_penalties !== '';
          const isCorrect = isEval && Number(finaleData.f34_penalties) === Number(o.f34_penalties);
          addFin(l34, '🥅 Rigori Fischiati', finaleData.f34_penalties, 1, isCorrect ? 1 : 0, isEval);
        }
      }
      setPlayerFinale(processedFinale);

    } catch (error) {
      console.error(error);
      toast.error('Errore nel caricare i dettagli.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const toggleFinaleGroup = (label: string) => {
    setExpandedFinaleGroups(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const getRankIcon = (rankValue: any) => {
    const rank = Number(rankValue);
    if (!rankValue || isNaN(rank)) return <span className="text-slate-700 text-[10px] font-black italic">--</span>;
    if (rank === 1) return <Crown className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" size={20} />;
    if (rank === 2) return <Medal className="text-slate-300" size={20} />;
    if (rank === 3) return <Medal className="text-amber-700" size={20} />;
    return <span className="text-slate-500 text-[10px] font-black italic">#{rank}</span>;
  };

  const getTrendIcon = (currentRankStr: any, previousRankStr: any) => {
    const current = Number(currentRankStr);
    const previous = Number(previousRankStr);
    if (!previous || isNaN(previous) || isNaN(current) || current === previous) return <Minus className="text-slate-700" size={14} strokeWidth={3} />;
    if (current < previous) return <ChevronUp className="text-emerald-500" size={16} strokeWidth={3} />;
    return <ChevronDown className="text-rose-500" size={16} strokeWidth={3} />;
  };

  const renderBonusAnswer = (answer: string, label: string, status: string) => {
    if (!answer) return null;
    const isWrong = status === 'WRONG';
    const textClass = `text-[11px] font-black uppercase italic truncate ${isWrong ? 'text-rose-500 line-through' : 'text-white'}`;
    
    if (label === 'Match + Gol' && answer.includes('-')) {
      const [t1, t2] = answer.split('-').map(s => s.trim());
      const f1 = getTeamFlagCode(t1);
      const f2 = getTeamFlagCode(t2);
      return (
        <div className={`flex items-center gap-1.5 mt-0.5 ${isWrong ? 'grayscale opacity-60' : ''}`}>
          {f1 && <img src={`https://flagcdn.com/w20/${f1}.png`} className="w-3.5 h-2.5 object-cover rounded-[2px]" alt=""/>}
          <span className={`${textClass} max-w-[85px] leading-none`}>{t1}</span>
          <span className="text-slate-500 text-[9px] leading-none">-</span>
          <span className={`${textClass} max-w-[85px] leading-none`}>{t2}</span>
          {f2 && <img src={`https://flagcdn.com/w20/${f2}.png`} className="w-3.5 h-2.5 object-cover rounded-[2px]" alt=""/>}
        </div>
      );
    }
    
    if (label.includes('Girone')) {
      const groupInfo = TOURNAMENT_GROUPS.find(g => g.name.toLowerCase() === answer.toLowerCase());
      return (
        <div className={`flex items-center gap-2 mt-0.5 ${isWrong ? 'grayscale opacity-60' : ''}`}>
          <span className={`${textClass} leading-none`}>{answer}</span>
          {groupInfo && (
            <div className="flex gap-1 ml-1">
              {groupInfo.teams.map(t => {
                const f = getTeamFlagCode(t);
                return f ? <img key={t} src={`https://flagcdn.com/w20/${f}.png`} className="w-3.5 h-2.5 object-cover rounded-[2px] shadow-sm" alt=""/> : null;
              })}
            </div>
          )}
        </div>
      );
    }

    if (['MVP Mondiale', 'Capocannoniere', 'Miglior Portiere'].includes(label)) {
      const allPlayers = [...(WORLD_CUP_PLAYERS || []), ...(WORLD_CUP_GOALKEEPERS || [])];
      const playerInfo = allPlayers.find(p => cleanString(p.name) === cleanString(answer));
      const playerFlagCode = playerInfo ? getTeamFlagCode(playerInfo.country) : null;
      
      return (
        <div className={`flex items-center gap-2 mt-0.5 ${isWrong ? 'grayscale opacity-60' : ''}`}>
          <span className={`${textClass} leading-none`}>{answer}</span>
          {playerFlagCode && (
            <img src={`https://flagcdn.com/w20/${playerFlagCode}.png`} className="w-3.5 h-2.5 object-cover rounded-[2px] shadow-sm" alt=""/>
          )}
        </div>
      );
    }
    
    return <span className={`${textClass} block mt-0.5 leading-none`}>{answer}</span>;
  };

  const filteredLeaderboard = leaderboard.filter(player => {
    const query = searchQuery.toLowerCase();
    return (player.username?.toLowerCase().includes(query)) || (player.full_name?.toLowerCase().includes(query));
  });

  const filteredFinaleLeaderboard = finaleLeaderboard.filter(player => {
    const query = searchQuery.toLowerCase();
    return (player.username?.toLowerCase().includes(query)) || (player.full_name?.toLowerCase().includes(query));
  });

  if (loading)
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-16 h-16 text-yellow-500 animate-spin" />
        <p className="text-yellow-500 font-black uppercase text-lg animate-pulse tracking-widest">Sincronizzazione Classifica...</p>
      </main>
    );

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-32 font-sans">
      <header className="text-center mb-10 mt-6">
        <h1 className="text-5xl font-black text-yellow-500 uppercase italic tracking-tighter drop-shadow-md">Classifica</h1>
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-2 flex items-center justify-center gap-2">
          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
          Live World Cup Rankings
        </p>
      </header>

      <div className="max-w-4xl mx-auto">
        
        {/* === SWITCHER CLASSIFICHE === */}
        {isFinaleActive && (
          <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl mb-8 shadow-inner animate-in fade-in duration-500">
            <button 
              onClick={() => setViewMode('GENERAL')}
              className={`flex-1 py-3 px-2 rounded-xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all ${viewMode === 'GENERAL' ? 'bg-slate-800 text-yellow-500 shadow-md border border-yellow-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Trophy size={16} /> <span>Mondiale</span>
            </button>
            <button 
              onClick={() => setViewMode('FINALE')}
              className={`flex-1 py-3 px-2 rounded-xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all ${viewMode === 'FINALE' ? 'bg-gradient-to-r from-yellow-600 to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Coins size={16} /> <span>MINI-GAME FINALE</span>
            </button>
          </div>
        )}

        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-slate-500" size={18} />
          </div>
          <input
            type="text"
            placeholder="Cerca giocatore o nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-black uppercase text-white placeholder-slate-600 outline-none focus:border-yellow-500 transition-colors shadow-inner"
          />
        </div>

        {/* === VISTA CLASSIFICA GENERALE === */}
        {viewMode === 'GENERAL' && (
          <>
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
              {filteredLeaderboard.map((player) => {
                const currentRank = Number(player.ranking);
                const isPodium = currentRank === 1;
                const currentAvatar = AVATARS.find(a => a.id === player.avatar_id) || AVATARS[0];
                
                return (
                  <div key={player.id} onClick={() => handlePlayerClick(player, 'MATCHES')} className={`flex items-center p-4 sm:p-5 rounded-[2rem] border cursor-pointer active:scale-[0.98] transition-all duration-300 ${isPodium ? 'bg-gradient-to-r from-yellow-500/10 to-slate-900/40 border-yellow-500/40 shadow-2xl shadow-yellow-500/5 hover:scale-[1.02]' : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/80 hover:border-slate-700'}`}>
                    <div className="flex-1 flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-12 sm:w-14 flex items-center justify-between shrink-0 bg-slate-950/80 p-2 rounded-xl border border-slate-800/80 shadow-inner">
                        <div className="flex-1 flex justify-center">{getRankIcon(player.ranking)}</div>
                        <div className="flex-1 flex justify-center">{getTrendIcon(player.ranking, player.previous_ranking)}</div>
                      </div>
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-1">
                        <div className={`w-8 sm:w-10 h-8 sm:h-10 shrink-0 rounded-full flex items-center justify-center text-lg sm:text-xl shadow-inner overflow-hidden bg-gradient-to-br ${currentAvatar.color} border border-slate-800`} title={currentAvatar.name}>
                          {currentAvatar.flagCode ? <img src={`https://flagcdn.com/w80/${currentAvatar.flagCode}.png`} alt={currentAvatar.name} className="w-full h-full object-cover" /> : <span className="drop-shadow-md">{currentAvatar.emoji}</span>}
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                          <p className={`font-black uppercase italic text-xs sm:text-sm md:text-base tracking-tight leading-none truncate w-full ${isPodium ? 'text-yellow-400' : 'text-slate-200'}`}>{player.username}</p>
                          {player.full_name && (
                            <p className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-bold uppercase tracking-wider leading-tight whitespace-normal break-words line-clamp-2 mt-0.5">
                              {player.full_name}
                            </p>
                          )}
                          {(player.exact_matches || 0) > 0 && <p className="text-[9px] font-bold text-slate-500 mt-1 flex items-center gap-1"><Target size={10} className="text-emerald-500" /> {player.exact_matches} esatt{player.exact_matches === 1 ? 'o' : 'i'}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-6 md:gap-10 shrink-0 ml-2">
                      <div className="w-6 sm:w-8 text-center text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-500">{player.points_groups || 0}</div>
                      <div className="w-6 sm:w-8 text-center text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-500">{player.points_bracket || 0}</div>
                      <div className={`w-6 sm:w-8 text-center text-[9px] sm:text-[10px] md:text-xs font-bold ${(player.points_bonus || 0) > 0 ? 'text-purple-400' : 'text-slate-500'}`}>{player.points_bonus || 0}</div>
                      <div className={`w-10 sm:w-12 text-center font-black italic text-lg sm:text-xl md:text-3xl ${isPodium ? 'text-yellow-500' : 'text-white'}`}>{player.points || 0}</div>
                    </div>
                  </div>
                );
              })}

              {filteredLeaderboard.length === 0 && (
                <div className="text-center py-12"><Trophy className="mx-auto w-12 h-12 text-slate-800 mb-3" /><p className="text-slate-500 text-xs font-black uppercase tracking-widest">Nessun giocatore trovato</p></div>
              )}
            </div>
          </>
        )}

        {/* === VISTA CLASSIFICA LA FINALE (SUPER JACKPOT) === */}
        {viewMode === 'FINALE' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex px-4 sm:px-6 mb-4 text-[8px] sm:text-[9px] font-black text-slate-600 uppercase tracking-widest italic border-b border-slate-800/50 pb-2">
              {/* Padding allineato per fare spazio alle medaglie */}
              <div className="flex-1 pl-14 sm:pl-16">Giocatore a Jackpot</div>
              <div className="w-16 sm:w-20 text-right text-yellow-500 pr-2">Punti Jkpt</div>
            </div>

            <div className="space-y-3">
              {filteredFinaleLeaderboard.map((player, idx) => {
                const currentAvatar = AVATARS.find(a => a.id === player.avatar_id) || AVATARS[0];
                const isLeader = idx === 0;
                const currentRank = idx + 1; // Calcola la posizione in tempo reale
                
                return (
                  <div key={player.id} onClick={() => handlePlayerClick(player, 'FINALE')} className={`flex items-center p-4 sm:p-5 rounded-[2rem] border cursor-pointer active:scale-[0.98] transition-all duration-300 ${isLeader ? 'bg-gradient-to-r from-amber-500/10 to-slate-900/40 border-amber-500/40 shadow-2xl shadow-amber-500/5 hover:scale-[1.02]' : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/80 hover:border-slate-700'}`}>
                    <div className="flex-1 flex items-center gap-3 sm:gap-4 min-w-0">
                      
                      {/* BOX POSIZIONE AGGIUNTO */}
                      <div className="w-12 sm:w-14 flex items-center justify-center shrink-0 bg-slate-950/80 p-2 rounded-xl border border-slate-800/80 shadow-inner">
                        {getRankIcon(currentRank)}
                      </div>

                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-1">
                        <div className={`w-10 sm:w-12 h-10 sm:h-12 shrink-0 rounded-full flex items-center justify-center text-xl sm:text-2xl shadow-inner overflow-hidden bg-gradient-to-br ${currentAvatar.color} border border-slate-800`} title={currentAvatar.name}>
                          {currentAvatar.flagCode ? <img src={`https://flagcdn.com/w80/${currentAvatar.flagCode}.png`} alt={currentAvatar.name} className="w-full h-full object-cover" /> : <span className="drop-shadow-md">{currentAvatar.emoji}</span>}
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                          <p className={`font-black uppercase italic text-sm sm:text-base tracking-tight leading-none truncate w-full ${isLeader ? 'text-amber-400' : 'text-slate-200'}`}>{player.username}</p>
                          {player.full_name && (
                            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-tight whitespace-normal break-words line-clamp-2 mt-1">
                              {player.full_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center shrink-0 ml-2 border-l border-slate-800/50 pl-4 sm:pl-6">
                      <div className={`w-16 sm:w-20 text-right font-black italic text-2xl sm:text-3xl ${isLeader ? 'text-amber-500 drop-shadow' : 'text-white'}`}>{player.finale_points}</div>
                    </div>
                  </div>
                );
              })}

              {filteredFinaleLeaderboard.length === 0 && (
                <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800/50">
                  <Award className="mx-auto w-12 h-12 text-slate-700 mb-3" />
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Nessun pronostico per la Finale</p>
                  <p className="text-[10px] text-slate-600 mt-2 font-medium">I giocatori appariranno qui appena salveranno le loro schedine.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* --- MODALE DETTAGLIO PUNTI UTENTE A SCOMPARTIMENTI --- */}
      {showDetailsModal && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 pb-24 sm:pb-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col h-[75vh] max-h-[640px] overflow-hidden">
            
            <div className="flex justify-between items-center mb-4 border-b border-slate-800/50 pb-4 shrink-0">
              <div>
                <h3 className="text-yellow-500 font-black uppercase italic tracking-tighter text-lg truncate pr-2">
                  {selectedPlayer.username}
                </h3>
                {selectedPlayer.full_name && (
                   <p className="text-[10px] text-slate-300 uppercase tracking-wider font-bold leading-tight line-clamp-2 break-words mt-0.5">{selectedPlayer.full_name}</p>
                )}
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Dettaglio Punti Riscossi</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="bg-slate-950 p-2 rounded-full text-slate-500 hover:text-rose-500 transition-colors shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* BARRA DEI MINI-TAB */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 mb-4 shrink-0">
              <button onClick={() => setDetailTab('MATCHES')} className={`flex-1 py-2 rounded-lg font-black text-[8px] sm:text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${detailTab === 'MATCHES' ? 'bg-slate-800 text-yellow-500 shadow-md' : 'text-slate-500 hover:text-white'}`}>
                <Gamepad2 size={12}/> Partite
              </button>
              <button onClick={() => setDetailTab('BRACKET')} className={`flex-1 py-2 rounded-lg font-black text-[8px] sm:text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${detailTab === 'BRACKET' ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400 shadow-md' : 'text-slate-500 hover:text-white'}`}>
                <Trophy size={12}/> Tabellone
              </button>
              <button onClick={() => setDetailTab('BONUS')} className={`flex-1 py-2 rounded-lg font-black text-[8px] sm:text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${detailTab === 'BONUS' ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400 shadow-md' : 'text-slate-500 hover:text-white'}`}>
                <Star size={12}/> Bonus
              </button>
              
              {isFinaleActive && (
                <button onClick={() => setDetailTab('FINALE')} className={`flex-1 py-2 rounded-lg font-black text-[8px] sm:text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${detailTab === 'FINALE' ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400 shadow-md' : 'text-slate-500 hover:text-white'}`}>
                  {isFinaleVisible ? <Award size={12}/> : <Lock size={12}/>} La Finale
                </button>
              )}
            </div>

            <div className="overflow-y-auto pr-1 custom-scrollbar flex-1 min-h-0 space-y-2">
              {loadingDetails ? (
                 <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 text-yellow-500 animate-spin" /></div>
              ) : (
                 <>
                   {/* TAB PARTITE GIRONI */}
                   {detailTab === 'MATCHES' && (
                     playerPredictions.length === 0 ? (
                       <p className="text-center text-slate-600 text-[10px] font-black uppercase pt-8 tracking-widest">Nessun pronostico inserito</p>
                     ) : (
                       playerPredictions.map((pred, idx) => {
                          const isPerfectMatch = pred.points === 10;
                          const isZeroPoints = pred.points === 0;
                          
                          return (
                            <div key={idx} className={`bg-slate-950 border rounded-xl p-3 flex flex-col gap-2 transition-colors ${isPerfectMatch ? 'border-emerald-500/30' : isZeroPoints ? 'border-slate-800/50 opacity-60' : 'border-slate-800'}`}>
                               <div className="flex justify-between items-center text-xs font-black uppercase text-slate-300">
                                  <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                                     <span className="truncate text-right">{formatMatchName(pred.matches.home_team)}</span>
                                     {getTeamFlagCode(pred.matches.home_team) && <img src={`https://flagcdn.com/w20/${getTeamFlagCode(pred.matches.home_team)}.png`} className="w-4 h-3 object-cover rounded-sm shadow-sm shrink-0" alt="" />}
                                  </div>
                                  <span className="px-2.5 py-0.5 text-white bg-slate-800 border border-slate-700 rounded mx-2 shadow-inner shrink-0">{pred.matches.home_score_final} - {pred.matches.away_score_final}</span>
                                  <div className="flex items-center gap-2 flex-1 justify-start min-w-0">
                                     {getTeamFlagCode(pred.matches.away_team) && <img src={`https://flagcdn.com/w20/${getTeamFlagCode(pred.matches.away_team)}.png`} className="w-4 h-3 object-cover rounded-sm shadow-sm shrink-0" alt="" />}
                                     <span className="truncate text-left">{formatMatchName(pred.matches.away_team)}</span>
                                  </div>
                               </div>
                               <div className={`flex justify-between items-center rounded-lg p-2 border ${isPerfectMatch ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-slate-900/50 border-slate-800/50'}`}>
                                  <div className="flex flex-col">
                                     <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Pronostico</span>
                                     <span className={`text-[11px] font-bold ${isPerfectMatch ? 'text-emerald-400' : isZeroPoints ? 'text-slate-500 line-through decoration-rose-500/50' : 'text-slate-300'}`}>{pred.home_score} - {pred.away_score}</span>
                                  </div>
                                  <div className="flex flex-col items-end">
                                     <span className={`text-[8px] uppercase font-black tracking-widest ${isPerfectMatch ? 'text-emerald-500/70' : 'text-yellow-500/70'}`}>Punti</span>
                                     <span className={`text-xs font-black ${isPerfectMatch ? 'text-emerald-500' : isZeroPoints ? 'text-slate-600' : 'text-yellow-500'}`}>+{pred.points}</span>
                                  </div>
                               </div>
                            </div>
                          );
                       })
                     )
                   )}

                   {/* TAB TABELLONE FASE FINALE */}
                   {detailTab === 'BRACKET' && (
                     playerBrackets.length === 0 ? (
                       <p className="text-center text-slate-600 text-[10px] font-black uppercase pt-8 tracking-widest">Nessun pronostico inserito</p>
                     ) : (
                       playerBrackets.map((br, idx) => {
                         const isCorrect = br.status === 'CORRECT';
                         const isWrong = br.status === 'WRONG';
                         
                         return (
                           <div key={idx} className={`border rounded-xl p-3 flex justify-between items-center transition-colors ${
                              isCorrect ? 'bg-blue-950/20 border-blue-500/30' : 
                              isWrong ? 'bg-rose-950/10 border-rose-900/50' : 
                              'bg-slate-900/30 border-slate-800/50'
                           }`}>
                              <div className="flex items-center gap-3">
                                 {getTeamFlagCode(br.team) ? (
                                   <img src={`https://flagcdn.com/w40/${getTeamFlagCode(br.team)}.png`} className={`w-5 h-auto rounded-sm object-cover shadow-sm ${isWrong && 'grayscale opacity-50 border border-rose-500/50'}`} alt=""/>
                                 ) : (
                                   <Shield size={16} className={isCorrect ? "text-blue-500" : isWrong ? "text-rose-500/50" : "text-slate-600"} />
                                 )}
                                 <div className="flex flex-col">
                                   <span className={`text-[11px] font-black uppercase ${isCorrect ? 'text-white' : isWrong ? 'text-rose-500 line-through' : 'text-slate-300'}`}>{br.team}</span>
                                   <span className={`text-[8px] font-bold uppercase tracking-widest ${isCorrect ? 'text-blue-400' : isWrong ? 'text-rose-500/70' : 'text-slate-500'}`}>{br.stageLabel}</span>
                                 </div>
                              </div>
                              <div className="flex flex-col items-end shrink-0 ml-2">
                                <span className={`text-xs font-black px-2 py-1 rounded-lg border ${
                                   isCorrect ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' : 
                                   isWrong ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' : 
                                   'text-slate-400 bg-slate-800/50 border-slate-700/50'
                                }`}>
                                  {isCorrect ? `+${br.points} PT` : isWrong ? 'Eliminata ❌' : 'In attesa'}
                                </span>
                              </div>
                           </div>
                         );
                       })
                     )
                   )}

                   {/* TAB BONUS CORRETTA */}
                   {detailTab === 'BONUS' && (
                     <div className="flex flex-col h-full">
                       {playerBonuses.length === 0 ? (
                         <p className="text-center text-slate-600 text-[10px] font-black uppercase pt-8 tracking-widest">Nessun pronostico inserito 🥲</p>
                       ) : (
                         playerBonuses.map((bo, idx) => {
                           const isCorrect = bo.status === 'CORRECT';
                           const isWrong = bo.status === 'WRONG';
                           return (
                             <div key={idx} className={`border rounded-xl p-3 flex justify-between items-center mb-2 transition-colors ${
                               isCorrect ? 'bg-emerald-950/20 border-emerald-900/30' :
                               isWrong ? 'bg-rose-950/10 border-rose-900/30 opacity-70' :
                               'bg-slate-900/30 border-slate-800/50'
                             }`}>
                                <div className="flex flex-col min-w-0">
                                   <span className={`text-[8px] font-bold uppercase tracking-widest ${isCorrect ? 'text-emerald-400' : isWrong ? 'text-rose-400/70' : 'text-slate-500'}`}>{bo.label}</span>
                                   {renderBonusAnswer(bo.answer, bo.label, bo.status)}
                                </div>
                                <div className="flex flex-col items-end shrink-0 ml-2">
                                  <span className={`text-xs font-black px-2 py-1 rounded-lg border ${
                                    isCorrect ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                                    isWrong ? 'text-rose-400/60 bg-rose-500/5 border-rose-500/10' : 
                                    'text-slate-500 bg-slate-800/50 border-slate-700/50'
                                  }`}>
                                    {isCorrect ? `+${bo.points} PT` : isWrong ? '0 PT' : 'In attesa'}
                                  </span>
                                </div>
                             </div>
                           );
                         })
                       )}
                     </div>
                   )}

                   {/* TAB LA FINALE CON FISARMONICA (RISULTATI LIVE IN VERDE) */}
                   {detailTab === 'FINALE' && (
                     <div className="flex flex-col h-full">
                       {!isFinaleVisible ? (
                         <div className="text-center py-10 opacity-70 flex flex-col items-center justify-center h-full">
                            <Lock className="mx-auto w-10 h-10 text-amber-500 mb-3" />
                            <p className="text-amber-500 font-black uppercase tracking-widest text-sm mb-1">Pronostici Nascosti</p>
                            <p className="text-slate-500 text-[10px] font-medium max-w-[250px] mx-auto leading-relaxed">
                              Per non dare vantaggi, le schedine de LA FINALE saranno sbloccate e visibili a tutti solo Sabato 18 Luglio alle ore 23:00 (fischio d'inizio).
                            </p>
                         </div>
                       ) : playerFinale.length === 0 ? (
                         <div className="text-center py-10 opacity-70 flex flex-col items-center justify-center h-full">
                            <Award className="mx-auto w-10 h-10 text-slate-700 mb-2" />
                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Nessun pronostico salvato</p>
                         </div>
                       ) : (
                         <div className="space-y-4 pb-4">
                           {Object.entries(
                             playerFinale.reduce<Record<string, any[]>>((acc, curr) => {
                               if (!acc[curr.matchLabel]) acc[curr.matchLabel] = [];
                               acc[curr.matchLabel].push(curr);
                               return acc;
                             }, {})
                           ).map(([groupLabel, items], gIdx) => {
                             const matchItems = items as any[];
                             return (
                             <div key={gIdx} className="bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden">
                               <button 
                                 onClick={() => toggleFinaleGroup(groupLabel)}
                                 className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                               >
                                 <div className="flex items-center gap-2">
                                   {groupLabel.includes('🏆') ? <Trophy className="text-yellow-500" size={16}/> : <Medal className="text-amber-500" size={16}/>}
                                   <span className={`text-[11px] font-black uppercase tracking-widest ${groupLabel.includes('🏆') ? 'text-yellow-500' : 'text-amber-500'}`}>
                                     {groupLabel}
                                   </span>
                                 </div>
                                 {expandedFinaleGroups[groupLabel] ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
                               </button>
                               
                               {expandedFinaleGroups[groupLabel] && (
                                 <div className="p-3 pt-0 space-y-2 bg-slate-900/20">
                                   {matchItems.map((fin, idx) => {
                                     const isCorrect = fin.status === 'CORRECT';
                                     const isWrong = fin.status === 'WRONG';
                                     return (
                                       <div key={idx} className={`border rounded-xl p-3 flex justify-between items-center transition-colors ${
                                         isCorrect ? 'bg-emerald-950/20 border-emerald-500/40' :
                                         isWrong ? 'bg-rose-950/10 border-rose-900/30 opacity-70' :
                                         'bg-slate-900/50 border-slate-800/80'
                                       }`}>
                                          <div className="flex flex-col min-w-0">
                                             <span className={`text-[9px] font-bold uppercase tracking-widest ${isCorrect ? 'text-emerald-400' : isWrong ? 'text-rose-400/70' : 'text-slate-300'}`}>{fin.label}</span>
                                             <span className={`text-[11px] font-black uppercase italic truncate mt-0.5 ${isWrong ? 'text-rose-500 line-through' : 'text-white'}`}>{fin.answer}</span>
                                          </div>
                                          <div className="flex flex-col items-end shrink-0 ml-2">
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${
                                              isCorrect ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                                              isWrong ? 'text-rose-400/60 bg-rose-500/5 border-rose-500/10' : 
                                              'text-slate-500 bg-slate-800/80 border-slate-700'
                                            }`}>
                                              {isCorrect ? `+${fin.points} PT` : isWrong ? '0 PT' : `Max ${fin.maxPts} PT`}
                                            </span>
                                          </div>
                                       </div>
                                     );
                                   })}
                                 </div>
                               )}
                             </div>
                           )
                           })}
                         </div>
                       )}
                     </div>
                   )}
                 </>
              )}
            </div>
            
          </div>
        </div>
      )}
    </main>
  );
}