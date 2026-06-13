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
  Loader2,
  Target,
  X,
  Gamepad2,
  Star
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

const STAGE_POINTS: Record<string, number> = { R32: 2, R16: 4, QF: 6, SF: 8, F: 10, WINNER: 20 };
const STAGE_LABELS: Record<string, string> = { R32: 'Sedicesimi', R16: 'Ottavi', QF: 'Quarti', SF: 'Semifinale', F: 'Finalista', WINNER: 'Campione' };

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
  formatted = formatted.replace(/Corea del Sud/gi, 'Corea Sud');
  formatted = formatted.replace(/Costa d'Avorio/gi, 'Costa Avorio');
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

const AVATARS = [
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
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- STATI PER LA MODALE DETTAGLI PUNTI ---
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Scompartimenti Dati Utente
  const [playerPredictions, setPlayerPredictions] = useState<any[]>([]);
  const [playerBrackets, setPlayerBrackets] = useState<any[]>([]);
  const [playerBonuses, setPlayerBonuses] = useState<any[]>([]);
  
  // Tab Interno Modale
  const [detailTab, setDetailTab] = useState<'MATCHES' | 'BRACKET' | 'BONUS'>('MATCHES');

  // Variabili globali caricate una sola volta
  const [officialBracket, setOfficialBracket] = useState<any[]>([]);
  const [officialBonuses, setOfficialBonuses] = useState<any>(null);

  useEffect(() => {
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

      // Fetch leaderboard and official solutions for detail comparison
      const [profRes, offBracketRes, offBonusRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('official_bracket').select('*'),
        supabase.from('official_bonuses').select('*').eq('id', '00000000-0000-0000-0000-000000000000').maybeSingle()
      ]);

      if (profRes.error) throw profRes.error;

      if (profRes.data) {
        const sorted = profRes.data.sort((a, b) => {
          const rankA = a.ranking ?? 9999;
          const rankB = b.ranking ?? 9999;
          if (rankA === 9999 && rankB === 9999) return (b.points || 0) - (a.points || 0);
          return rankA - rankB;
        });
        setLeaderboard(sorted);
      }

      setOfficialBracket(offBracketRes.data || []);
      setOfficialBonuses(offBonusRes.data || null);

    } catch (err) {
      console.error("Sync Error:", err);
      toast.error('Errore di sincronizzazione db.');
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  // --- CALCOLATORE DI PUNTI A CASCATA (FASE A GIRONI) ---
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

  // --- FUNZIONE PER RECUPERARE TUTTI I DETTAGLI (PARTITE, TABELLONE E BONUS) ---
  const handlePlayerClick = async (player: any) => {
    setSelectedPlayer(player);
    setDetailTab('MATCHES'); // Reset tab
    setShowDetailsModal(true);
    setLoadingDetails(true);

    try {
      // 1. CARICAMENTO GIRONI (Partite)
      const { data: preds } = await supabase.from('predictions').select('*').eq('user_id', player.id);
      let combinedMatches: any[] = [];
      
      if (preds && preds.length > 0) {
        const matchIds = preds.map(p => p.match_id || p.match || p.id_match || p.id_partita).filter(Boolean);
        if (matchIds.length > 0) {
          const { data: matches } = await supabase.from('matches').select('*').in('id', matchIds).eq('is_finished', true);
          combinedMatches = preds.map(pred => {
            const mId = pred.match_id || pred.match || pred.id_match || pred.id_partita;
            const mData = matches?.find(m => m.id === mId);
            if (!mData) return null; 
            const pts = pred.points || pred.punti || calculateMatchPoints(pred.home_score, pred.away_score, mData.home_score_final, mData.away_score_final);
            return { home_score: pred.home_score, away_score: pred.away_score, points: pts, matches: mData };
          }).filter(item => item !== null && item.points > 0).sort((a: any, b: any) => {
            const dateA = a.matches.date || a.matches.match_date || a.matches.id;
            const dateB = b.matches.date || b.matches.match_date || b.matches.id;
            return dateA < dateB ? -1 : 1;
          });
        }
      }
      setPlayerPredictions(combinedMatches);

      // 2. CARICAMENTO TABELLONE (Fase Finale)
      const { data: bData } = await supabase.from('brackets').select('*').eq('user_id', player.id);
      const correctBrackets: any[] = [];
      bData?.forEach(b => {
         const uS = normalizeStage(b.stage);
         // È corretto se la scelta è presente nell'officialBracket per quella precisa fase
         const isCorrect = officialBracket.some(ob => normalizeStage(ob.stage) === uS && cleanString(ob.team_name) === cleanString(b.team_name));
         if (isCorrect) {
            const pts = STAGE_POINTS[uS] || 0;
            correctBrackets.push({ team: b.team_name, stageLabel: STAGE_LABELS[uS], points: pts });
         }
      });
      // Mostriamo prima le fasi che danno più punti (Campione > Finalista > ecc)
      setPlayerBrackets(correctBrackets.sort((a,b) => b.points - a.points));

      // 3. CARICAMENTO BONUS
      const { data: uBonus } = await supabase.from('user_bonus_answers').select('*').eq('user_id', player.id).maybeSingle();
      const correctBonuses: any[] = [];
      if (uBonus && officialBonuses) {
         const checkBonus = (key: string, pts: number, label: string) => {
            if (officialBonuses[key] != null && uBonus[key] != null && cleanString(String(officialBonuses[key])) === cleanString(String(uBonus[key]))) {
               correctBonuses.push({ answer: uBonus[key], points: pts, label });
            }
         };
         checkBonus('mvp_world_cup', 10, 'MVP Mondiale');
         checkBonus('top_scorer', 10, 'Capocannoniere');
         checkBonus('best_goalkeeper', 10, 'Miglior Portiere');
         checkBonus('high_scoring_match', 5, 'Match + Gol');
         checkBonus('highest_scoring_group', 5, 'Girone + Gol');
         checkBonus('lowest_scoring_group', 5, 'Girone - Gol');
         checkBonus('total_own_goals', 3, 'Totale Autogol');
         checkBonus('total_penalties', 3, 'Totale Rigori');
         checkBonus('total_red_cards', 3, 'Totale Rossi');
      }
      setPlayerBonuses(correctBonuses.sort((a,b) => b.points - a.points));

    } catch (error) {
      console.error(error);
      toast.error('Errore nel caricare i dettagli.');
    } finally {
      setLoadingDetails(false);
    }
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

  if (loading)
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-16 h-16 text-yellow-500 animate-spin" />
        <p className="text-yellow-500 font-black uppercase text-lg animate-pulse tracking-widest">Sincronizzazione Classifica...</p>
      </main>
    );

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-32 font-sans">
      <header className="text-center mb-12 mt-6">
        <h1 className="text-5xl font-black text-yellow-500 uppercase italic tracking-tighter drop-shadow-md">Classifica</h1>
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-2 flex items-center justify-center gap-2">
          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
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
              <div key={player.id} onClick={() => handlePlayerClick(player)} className={`flex items-center p-4 sm:p-5 rounded-[2rem] border cursor-pointer active:scale-[0.98] transition-all duration-300 ${isPodium ? 'bg-gradient-to-r from-yellow-500/10 to-slate-900/40 border-yellow-500/40 shadow-2xl shadow-yellow-500/5 hover:scale-[1.02]' : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/80 hover:border-slate-700'}`}>
                <div className="flex-1 flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-12 sm:w-14 flex items-center justify-between shrink-0 bg-slate-950/80 p-2 rounded-xl border border-slate-800/80 shadow-inner">
                    <div className="flex-1 flex justify-center">{getRankIcon(player.ranking)}</div>
                    <div className="flex-1 flex justify-center">{getTrendIcon(player.ranking, player.previous_ranking)}</div>
                  </div>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-8 sm:w-10 h-8 sm:h-10 shrink-0 rounded-full flex items-center justify-center text-lg sm:text-xl shadow-inner overflow-hidden bg-gradient-to-br ${currentAvatar.color} border border-slate-800`} title={currentAvatar.name}>
                      {currentAvatar.flagCode ? <img src={`https://flagcdn.com/w80/${currentAvatar.flagCode}.png`} alt={currentAvatar.name} className="w-full h-full object-cover" /> : <span className="drop-shadow-md">{currentAvatar.emoji}</span>}
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <p className={`font-black uppercase italic text-xs sm:text-sm md:text-base tracking-tight leading-none truncate w-full ${isPodium ? 'text-yellow-400' : 'text-slate-200'}`}>{player.username}</p>
                      {(player.exact_matches || 0) > 0 && <p className="text-[9px] font-bold text-slate-500 mt-1 flex items-center gap-1"><Target size={10} className="text-emerald-500" /> {player.exact_matches} esatt{player.exact_matches === 1 ? 'o' : 'i'}</p>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-6 md:gap-10 shrink-0 ml-2">
                  <div className="w-6 sm:w-8 text-center text-[10px] sm:text-xs font-bold text-slate-500">{player.points_groups || 0}</div>
                  <div className="w-6 sm:w-8 text-center text-[10px] sm:text-xs font-bold text-slate-500">{player.points_bracket || 0}</div>
                  <div className={`w-6 sm:w-8 text-center text-[10px] sm:text-xs font-bold ${(player.points_bonus || 0) > 0 ? 'text-purple-400' : 'text-slate-500'}`}>{player.points_bonus || 0}</div>
                  <div className={`w-10 sm:w-12 text-center font-black italic text-xl sm:text-2xl md:text-3xl ${isPodium ? 'text-yellow-500' : 'text-white'}`}>{player.points || 0}</div>
                </div>
              </div>
            );
          })}

          {leaderboard.length === 0 && !loading && (
            <div className="text-center py-12"><Trophy className="mx-auto w-12 h-12 text-slate-800 mb-3" /><p className="text-slate-500 text-xs font-black uppercase tracking-widest">Nessun giocatore in classifica</p></div>
          )}
        </div>
      </div>

      {/* --- MODALE DETTAGLIO PUNTI UTENTE A SCOMPARTIMENTI --- */}
      {showDetailsModal && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 pb-24 sm:pb-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col h-[70vh] max-h-[600px] overflow-hidden">
            
            <div className="flex justify-between items-center mb-4 border-b border-slate-800/50 pb-4 shrink-0">
              <div>
                <h3 className="text-yellow-500 font-black uppercase italic tracking-tighter text-lg truncate pr-2">
                  {selectedPlayer.username}
                </h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Dettaglio Punti Riscossi</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="bg-slate-950 p-2 rounded-full text-slate-500 hover:text-rose-500 transition-colors shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* BARRA DEI MINI-TAB */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 mb-4 shrink-0">
              <button onClick={() => setDetailTab('MATCHES')} className={`flex-1 py-2 rounded-lg font-black text-[9px] sm:text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${detailTab === 'MATCHES' ? 'bg-slate-800 text-yellow-500 shadow-md' : 'text-slate-500 hover:text-white'}`}>
                <Gamepad2 size={12}/> Partite
              </button>
              <button onClick={() => setDetailTab('BRACKET')} className={`flex-1 py-2 rounded-lg font-black text-[9px] sm:text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${detailTab === 'BRACKET' ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400 shadow-md' : 'text-slate-500 hover:text-white'}`}>
                <Trophy size={12}/> Tabellone
              </button>
              <button onClick={() => setDetailTab('BONUS')} className={`flex-1 py-2 rounded-lg font-black text-[9px] sm:text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${detailTab === 'BONUS' ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400 shadow-md' : 'text-slate-500 hover:text-white'}`}>
                <Star size={12}/> Bonus
              </button>
            </div>

            <div className="overflow-y-auto pr-1 custom-scrollbar flex-1 min-h-0 space-y-2">
              {loadingDetails ? (
                 <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 text-yellow-500 animate-spin" /></div>
              ) : (
                 <>
                   {/* TAB PARTITE GIRONI */}
                   {detailTab === 'MATCHES' && (
                     playerPredictions.length === 0 ? (
                       <p className="text-center text-slate-600 text-[10px] font-black uppercase pt-8 tracking-widest">Nessun punto registrato sui Gironi</p>
                     ) : (
                       playerPredictions.map((pred, idx) => {
                          const isPerfectMatch = pred.points === 10;
                          return (
                            <div key={idx} className={`bg-slate-950 border rounded-xl p-3 flex flex-col gap-2 transition-colors ${isPerfectMatch ? 'border-emerald-500/30' : 'border-slate-800'}`}>
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
                                     <span className={`text-[11px] font-bold ${isPerfectMatch ? 'text-emerald-400' : 'text-slate-300'}`}>{pred.home_score} - {pred.away_score}</span>
                                  </div>
                                  <div className="flex flex-col items-end">
                                     <span className={`text-[8px] uppercase font-black tracking-widest ${isPerfectMatch ? 'text-emerald-500/70' : 'text-yellow-500/70'}`}>Punti</span>
                                     <span className={`text-xs font-black ${isPerfectMatch ? 'text-emerald-500' : 'text-yellow-500'}`}>+{pred.points}</span>
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
                       <p className="text-center text-slate-600 text-[10px] font-black uppercase pt-8 tracking-widest">Nessun punto registrato sul Tabellone</p>
                     ) : (
                       playerBrackets.map((br, idx) => (
                         <div key={idx} className="bg-blue-950/10 border border-blue-900/30 rounded-xl p-3 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                               {getTeamFlagCode(br.team) ? <img src={`https://flagcdn.com/w40/${getTeamFlagCode(br.team)}.png`} className="w-5 h-auto rounded-sm object-cover shadow-sm" alt=""/> : <Shield size={16} className="text-blue-500/50" />}
                               <div className="flex flex-col">
                                 <span className="text-[11px] font-black uppercase text-white">{br.team}</span>
                                 <span className="text-[8px] font-bold uppercase text-blue-400 tracking-widest">{br.stageLabel}</span>
                               </div>
                            </div>
                            <span className="text-xs font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-lg">+{br.points} PT</span>
                         </div>
                       ))
                     )
                   )}

                   {/* TAB BONUS */}
                   {detailTab === 'BONUS' && (
                     playerBonuses.length === 0 ? (
                       <p className="text-center text-slate-600 text-[10px] font-black uppercase pt-8 tracking-widest">Nessun punto registrato sui Bonus</p>
                     ) : (
                       playerBonuses.map((bo, idx) => (
                         <div key={idx} className="bg-purple-950/10 border border-purple-900/30 rounded-xl p-3 flex justify-between items-center">
                            <div className="flex flex-col">
                               <span className="text-[11px] font-black uppercase text-white italic">{bo.answer}</span>
                               <span className="text-[8px] font-bold uppercase text-purple-400 tracking-widest">{bo.label}</span>
                            </div>
                            <span className="text-xs font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-lg">+{bo.points} PT</span>
                         </div>
                       ))
                     )
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