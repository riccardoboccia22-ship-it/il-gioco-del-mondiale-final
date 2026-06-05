'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Trophy, Star, LayoutGrid, ChevronDown, ChevronUp, Flame,
  Award, Zap, Target, Shield, Goal, ArrowDownToLine, ArrowUpToLine, ShieldCheck, Lock, Activity, Search
} from 'lucide-react';

const WORLD_CUP_START_DATE = new Date('2026-06-11T21:00:00+02:00');

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

const STAGE_POINTS: { [key: string]: number } = { R32: 2, R16: 4, QF: 6, SF: 8, F: 10, WINNER: 20 };
const STAGE_CAPACITY: { [key: string]: number } = { R32: 32, R16: 16, QF: 8, SF: 4, F: 2, WINNER: 1 };

const flagMap: { [key: string]: string } = {
  algeria: 'dz', 'arabia saudita': 'sa', 'arabia s.': 'sa', argentina: 'ar', australia: 'au', austria: 'at',
  belgio: 'be', 'bosnia ed erzegovina': 'ba', 'bosnia erzegovina': 'ba', bosnia: 'ba',
  brasile: 'br', canada: 'ca', 'capo verde': 'cv', colombia: 'co', 'corea del sud': 'kr', 'corea sud': 'kr', 
  "costa d'avorio": 'ci', 'costa avorio': 'ci', 'c. avorio': 'ci', croazia: 'hr', curaçao: 'cw', curacao: 'cw',
  ecuador: 'ec', egitto: 'eg', francia: 'fr', germania: 'de', ghana: 'gh', giappone: 'jp', 
  giordania: 'jo', haiti: 'ht', inghilterra: 'gb-eng', iran: 'ir', iraq: 'iq', marocco: 'ma', 
  messico: 'mx', norvegia: 'no', 'nuova zelanda': 'nz', 'n. zelanda': 'nz', olanda: 'nl', panama: 'pa', paraguay: 'py',
  portogallo: 'pt', qatar: 'qa', 'repubblica ceca': 'cz', 'rep. ceca': 'cz', 'repubblica democratica del congo': 'cd', 'r.d. congo': 'cd', congo: 'cd',
  scozia: 'gb-sct', senegal: 'sn', spagna: 'es', 'stati uniti': 'us', usa: 'us',
  sudafrica: 'za', svezia: 'se', svizzera: 'ch', tunisia: 'tn', turchia: 'tr', 
  uruguay: 'uy', uzbekistan: 'uz',
};

const TEAMS_2026 = [
  'Algeria', 'Arabia Saudita', 'Argentina', 'Australia', 'Austria', 'Belgio',
  'Bosnia ed Erzegovina', 'Brasile', 'Canada', 'Capo Verde', 'Colombia',
  'Corea del Sud', "Costa d'avorio", 'Croazia', 'Curaçao', 'Ecuador', 'Egitto',
  'Francia', 'Germania', 'Ghana', 'Giappone', 'Giordania', 'Haiti', 'Inghilterra',
  'Iran', 'Iraq', 'Marocco', 'Messico', 'Norvegia', 'Nuova Zelanda', 'Olanda',
  'Panama', 'Paraguay', 'Portogallo', 'Qatar', 'Repubblica Ceca',
  'Repubblica Democratica del Congo', 'Scozia', 'Senegal', 'Spagna',
  'Stati Uniti', 'Sudafrica', 'Svezia', 'Svizzera', 'Tunisia', 'Turchia',
  'Uruguay', 'Uzbekistan'
];

const TOP_TEAMS = ['Argentina', 'Belgio', 'Brasile', 'Francia', 'Germania', 'Inghilterra', 'Olanda', 'Portogallo', 'Spagna'];
const MID_TEAMS = ['Austria', 'Colombia', "Costa d'Avorio", 'Croazia', 'Egitto', 'Giappone', 'Marocco', 'Messico', 'Norvegia', 'Senegal', 'Svizzera', 'Turchia', 'Uruguay', 'USA', 'Stati Uniti'];
const LOW_TEAMS = ['Algeria', 'Australia', 'Canada', 'Corea del Sud', 'Ecuador', 'Iran', 'Iraq', 'Nuova Zelanda', 'Panama', 'Paraguay', 'Repubblica Ceca', 'Scozia', 'Svezia', 'Sudafrica', 'Tunisia'];
const SUPER_LOW_TEAMS = ['Arabia Saudita', 'Bosnia ed Erzegovina', 'Bosnia', 'Capo Verde', 'Repubblica Democratica del Congo', 'R.D. Congo', 'Curaçao', 'Curacao', 'Congo', 'Ghana', 'Giordania', 'Haiti', 'Qatar', 'Uzbekistan'];


const normalizeStage = (s: string) => {
  const u = s?.toUpperCase().trim() || '';
  if (u.includes('SEDICESIM') || u === 'R32') return 'R32';
  if (u.includes('OTTAV') || u === 'R16') return 'R16';
  if (u.includes('QUART') || u === 'QF') return 'QF';
  if (u.includes('SEMIFINAL') || u === 'SF') return 'SF';
  if (u.includes('VINCITOR') || u === 'WINNER') return 'WINNER';
  if (u.includes('FINAL') || u === 'F') return 'F';
  return u;
};

const formatTeamName = (name: string) => {
  if (!name) return '';
  const n = name.trim().toLowerCase();
  if (n === 'repubblica democratica del congo' || n === 'r.d. congo' || n === 'congo') return 'R. D. Congo';
  if (n === 'stati uniti' || n === 'usa') return 'USA';
  if (n === 'bosnia ed erzegovina' || n === 'bosnia erzegovina' || n === 'bosnia') return 'Bosnia';
  if (n === 'nuova zelanda' || n === 'n. zelanda') return 'N. Zelanda';
  if (n === 'arabia saudita' || n === 'arabia s.') return 'Arabia S.';
  if (n === 'repubblica ceca' || n === 'rep. ceca') return 'Rep. Ceca';
  if (n === "costa d'avorio" || n === 'c. avorio') return 'C. Avorio';
  if (n === 'corea del sud' || n === 'corea sud') return 'Corea Sud';
  return name;
};

export default function TuttiPronosticiPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'GIRONI' | 'BRACKET' | 'BONUS' | 'STATS'>('GIRONI');
  const [data, setData] = useState<any>({
    profiles: [],
    matches: [],
    predictionsMap: {}, 
    bracketMap: {},     
    bonusMap: {},       
    officialBonus: null,
    officialResults: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null);
  const [expandedBracketUser, setExpandedBracketUser] = useState<string | null>(null);
  const [expandedBonusUser, setExpandedBonusUser] = useState<string | null>(null);

  const isStarted = new Date() > WORLD_CUP_START_DATE;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/'); return; }

        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        if (!profile || !profile.full_name) {
          router.push('/setup-profilo');
          return;
        }

        const [p, m, pr, br, off, offBo, usrBo] = await Promise.all([
          supabase.from('profiles').select('*').order('username'),
          supabase.from('matches').select('*').order('id'),
          supabase.from('predictions').select('*'),
          supabase.from('brackets').select('*'),
          supabase.from('official_bracket').select('*'),
          supabase.from('official_bonuses').select('*').eq('id', '00000000-0000-0000-0000-000000000000').maybeSingle(),
          supabase.from('user_bonus_answers').select('*'),
        ]);

        const predMap: any = {};
        pr.data?.forEach(pred => {
          if (!predMap[pred.match_id]) predMap[pred.match_id] = {};
          predMap[pred.match_id][pred.user_id] = pred;
        });

        const brackMap: any = {};
        br.data?.forEach(b => {
          if (!brackMap[b.user_id]) brackMap[b.user_id] = [];
          brackMap[b.user_id].push(b);
        });

        const bMap: any = {};
        usrBo.data?.forEach(b => bMap[b.user_id] = b);

        setData({
          profiles: p.data || [],
          matches: m.data || [],
          predictionsMap: predMap,
          bracketMap: brackMap,
          officialResults: off.data || [],
          officialBonus: offBo.data || null,
          bonusMap: bMap,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  const getFlagUrl = (team: string) => {
    const code = flagMap[team?.toLowerCase().trim()];
    return code ? `https://flagcdn.com/w40/${code}.png` : null;
  };

  const getMatchResultInfo = (pred: any, match: any) => {
    if (!pred || match.home_score_final === null || !match.is_finished)
      return { pts: 0, color: 'text-slate-600', label: '' };
      
    const ph = Number(pred.home_score), pa = Number(pred.away_score);
    const mh = Number(match.home_score_final), ma = Number(match.away_score_final);
    const pRes = ph > pa ? '1' : ph < pa ? '2' : 'X';
    const mRes = mh > ma ? '1' : mh < ma ? '2' : 'X';
    
    if (ph === mh && pa === ma) return { pts: 10, color: 'text-emerald-400', label: 'ESATTO' };
    if (pRes === mRes && (ph === mh || pa === ma)) return { pts: 6, color: 'text-yellow-500', label: 'SEGNO+GOL' };
    if (pRes === mRes) return { pts: 4, color: 'text-amber-600', label: 'SEGNO' };
    if (ph === mh || pa === ma) return { pts: 2, color: 'text-slate-400', label: 'GOL' };
    return { pts: 0, color: 'text-rose-500', label: 'ZERO' };
  };

  // ----- FUNZIONI PER IL TAB STATS -----
  const getTopExactMatches = () => {
    return [...data.profiles]
      .filter((p: any) => p.exact_matches > 0)
      .sort((a, b) => (b.exact_matches || 0) - (a.exact_matches || 0));
  };

  const getWinnerStats = () => {
    const allBrackets = Object.values(data.bracketMap).flat() as any[];
    const winners = allBrackets.filter(b => b.stage === 'WINNER' && b.team_name);
    const total = winners.length;
    if (total === 0) return [];
    
    const counts: any = {};
    winners.forEach(w => {
      const t = formatTeamName(w.team_name);
      if (!counts[t]) counts[t] = { count: 0, users: [] };
      counts[t].count += 1;
      
      const p = data.profiles.find((prof: any) => prof.id === w.user_id);
      if (p) counts[t].users.push(p.username);
    });
    
    return Object.entries(counts)
      .map(([team, info]: any) => ({ 
        team, 
        count: info.count, 
        pct: Math.round((info.count / total) * 100),
        users: info.users
      }))
      .sort((a, b) => b.count - a.count || a.team.localeCompare(b.team));
  };

  const getAnomalies = () => {
    const allTeams = [...TOP_TEAMS, ...MID_TEAMS, ...LOW_TEAMS, ...SUPER_LOW_TEAMS];
    let anomalies: { user: string, type: string, team: string, msg: string, phase: string, phaseWeight: number }[] = [];

    data.profiles.forEach((p: any) => {
      const uBrackets = data.bracketMap[p.id] || [];
      if (uBrackets.length === 0) return;

      const r32 = uBrackets.filter((b: any) => b.stage === 'R32').map((b: any) => formatTeamName(b.team_name).toLowerCase());
      const r16 = uBrackets.filter((b: any) => b.stage === 'R16').map((b: any) => formatTeamName(b.team_name).toLowerCase());
      const qf = uBrackets.filter((b: any) => b.stage === 'QF').map((b: any) => formatTeamName(b.team_name).toLowerCase());
      const sf = uBrackets.filter((b: any) => ['SF', 'F', 'WINNER'].includes(b.stage)).map((b: any) => formatTeamName(b.team_name).toLowerCase());

      const hasR32 = r32.length >= 32;
      const hasQF = qf.length >= 8;

      allTeams.forEach(t => {
          const teamF = formatTeamName(t).toLowerCase();
          const originalTeam = formatTeamName(t);

          const inR32 = r32.includes(teamF);
          const inR16 = r16.includes(teamF);
          const inQF = qf.includes(teamF);
          const inSF = sf.includes(teamF);

          if (TOP_TEAMS.includes(t)) {
              if (hasR32 && !inR32) anomalies.push({ user: p.username, type: 'FLOP', team: originalTeam, msg: 'Fuori ai Gironi 📉', phase: 'FASE A GIRONI', phaseWeight: 1 });
              else if (hasQF && !inQF) anomalies.push({ user: p.username, type: 'FLOP', team: originalTeam, msg: 'Fuori prima dei Quarti 😱', phase: 'SEDICESIMI / OTTAVI', phaseWeight: 2 });
          }

          if (MID_TEAMS.includes(t)) {
              if (t === 'Stati Uniti') return; 
              if (hasR32 && !inR32) anomalies.push({ user: p.username, type: 'FLOP', team: originalTeam, msg: 'Fuori ai Gironi 📉', phase: 'FASE A GIRONI', phaseWeight: 1 });
          }

          if (SUPER_LOW_TEAMS.includes(t)) {
              if (t === 'Curacao' || t === 'Congo' || t === 'Bosnia') return;
              if (inSF) anomalies.push({ user: p.username, type: 'FAVOLA', team: originalTeam, msg: 'In Semifinale o oltre! 🏆🦄', phase: 'SEMIFINALI / FINALI', phaseWeight: 4 });
              else if (inQF) anomalies.push({ user: p.username, type: 'FAVOLA', team: originalTeam, msg: 'Raggiunge i Quarti! 🚀', phase: 'QUARTI DI FINALE', phaseWeight: 3 });
              else if (inR16) anomalies.push({ user: p.username, type: 'FAVOLA', team: originalTeam, msg: 'Arriva agli Ottavi! 🤯', phase: 'SEDICESIMI / OTTAVI', phaseWeight: 2 });
              else if (inR32) anomalies.push({ user: p.username, type: 'FAVOLA', team: originalTeam, msg: 'Supera i Gironi! 🍷', phase: 'FASE A GIRONI', phaseWeight: 1 });
          }

          if (LOW_TEAMS.includes(t)) {
              if (inSF) anomalies.push({ user: p.username, type: 'FAVOLA', team: originalTeam, msg: 'In Semifinale o oltre! 🏆🦄', phase: 'SEMIFINALI / FINALI', phaseWeight: 4 });
              else if (inQF) anomalies.push({ user: p.username, type: 'FAVOLA', team: originalTeam, msg: 'Raggiunge i Quarti! 🚀', phase: 'QUARTI DI FINALE', phaseWeight: 3 });
          }
      });
    });

    const groupedAnomaliesObj = anomalies.reduce((acc, ano) => {
      const key = `${ano.phaseWeight}-${ano.type}-${ano.team}-${ano.msg}`;
      if (!acc[key]) {
        acc[key] = { phase: ano.phase, phaseWeight: ano.phaseWeight, type: ano.type, team: ano.team, msg: ano.msg, users: [ano.user] };
      } else {
        acc[key].users.push(ano.user);
      }
      return acc;
    }, {} as Record<string, { phase: string, phaseWeight: number, type: string, team: string, msg: string, users: string[] }>);
    
    return Object.values(groupedAnomaliesObj).sort((a, b) => {
      if (a.phaseWeight !== b.phaseWeight) return a.phaseWeight - b.phaseWeight;
      if (a.type !== b.type) return a.type.localeCompare(b.type); 
      return a.team.localeCompare(b.team);
    });
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-yellow-500 font-black animate-pulse uppercase tracking-widest text-xs">
          Decrittazione Pronostici...
        </div>
      </div>
    );

  if (!isStarted) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center text-center pb-32">
        <div className="bg-slate-900 p-8 rounded-full mb-6 border border-slate-800 shadow-[0_0_40px_rgba(234,179,8,0.1)]">
           <Lock size={48} className="text-yellow-500" />
        </div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-white">Pronostici Segreti</h1>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest max-w-xs leading-relaxed">
          La visione dei pronostici altrui sarà sbloccata solo al fischio d'inizio del Mondiale.
          <br/><br/>
          <span className="text-yellow-500">11 Giugno 2026 ore 21:00</span>
        </p>
      </main>
    );
  }

  const anomaliesList = activeTab === 'STATS' ? getAnomalies() : [];
  const uiPhases = activeTab === 'STATS' ? anomaliesList.map(a => a.phase).filter((val, idx, arr) => arr.indexOf(val) === idx) : [];
  const topCecchini = activeTab === 'STATS' ? getTopExactMatches() : [];
  const winnerStats = activeTab === 'STATS' ? getWinnerStats() : [];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-32 font-sans">
      <header className="text-center mb-8 pt-4">
        <h1 className="text-4xl font-black text-yellow-500 uppercase italic">
          Scouting Globale
        </h1>
        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800 mt-6 max-w-[400px] mx-auto overflow-x-auto custom-scrollbar">
          {[
            { id: 'GIRONI', icon: <LayoutGrid size={14} /> },
            { id: 'BRACKET', icon: <Trophy size={14} /> },
            { id: 'BONUS', icon: <Star size={14} /> },
            { id: 'STATS', icon: <Activity size={14} /> },
          ].map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl text-[10px] font-black transition-all whitespace-nowrap min-w-max ${
                activeTab === tab.id
                  ? 'bg-yellow-500 text-slate-950 shadow-lg'
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              {tab.icon} {tab.id}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-2xl mx-auto space-y-4">
        
        {/* --- GIRONI --- */}
        {activeTab === 'GIRONI' &&
          data.matches.map((match: any) => {
            const homeFlag = getFlagUrl(match.home_team);
            const awayFlag = getFlagUrl(match.away_team);
            const isExpanded = expandedMatch === match.id;
            const isFinished = match.is_finished && match.home_score_final !== null;

            return (
              <div
                key={match.id}
                className={`bg-slate-900/40 border rounded-[2rem] overflow-hidden transition-all ${
                  isExpanded ? 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'border-slate-800'
                }`}
              >
                <button
                  onClick={() => setExpandedMatch(isExpanded ? null : match.id)}
                  className="w-full p-5 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 hover:bg-slate-800/30 transition-all"
                >
                  <div className="w-full sm:w-auto flex justify-between items-center sm:block text-left">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
                      #{match.id}
                    </span>
                    {isFinished && (
                      <span className="text-[8px] text-emerald-400 font-black uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full sm:hidden">
                        FINITA
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-center gap-2 sm:gap-4 w-full">
                    <div className="flex flex-1 items-center justify-end gap-2 text-right min-w-0">
                      <span className="font-black uppercase italic text-[10px] sm:text-xs tracking-tight truncate">
                        {formatTeamName(match.home_team)}
                      </span>
                      {homeFlag ? <img src={homeFlag} className="w-6 sm:w-7 h-auto rounded-sm shadow-md" alt="" /> : <Shield size={16} className="text-slate-600" />}
                    </div>

                    <div className="w-14 sm:w-16 shrink-0 text-center bg-slate-950 py-1.5 rounded-xl font-black text-yellow-500 border border-slate-800 text-xs sm:text-base shadow-inner">
                      {isFinished ? `${match.home_score_final}-${match.away_score_final}` : 'VS'}
                    </div>

                    <div className="flex flex-1 items-center justify-start gap-2 text-left min-w-0">
                      {awayFlag ? <img src={awayFlag} className="w-6 sm:w-7 h-auto rounded-sm shadow-md" alt="" /> : <Shield size={16} className="text-slate-600" />}
                      <span className="font-black uppercase italic text-[10px] sm:text-xs tracking-tight truncate">
                        {formatTeamName(match.away_team)}
                      </span>
                    </div>
                  </div>

                  <div className="hidden sm:flex w-16 justify-end">
                    {isFinished && <span className="text-[8px] text-emerald-400 font-black uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full">FINITA</span>}
                  </div>
                </button>

                {isExpanded && (
                  <div className="bg-slate-950/80 p-4 space-y-2 border-t border-slate-800/50 max-h-96 overflow-y-auto custom-scrollbar">
                    {data.profiles.map((user: any) => {
                      const pred = data.predictionsMap[match.id]?.[user.id];
                      const info = getMatchResultInfo(pred, match);
                      const userAvatar = AVATARS.find(a => a.id === user.avatar_id) || AVATARS[0];

                      return (
                        <div key={user.id} className={`flex justify-between items-center px-4 py-2.5 bg-slate-900/50 rounded-2xl border transition-all ${info.pts > 0 ? 'border-emerald-500/20' : 'border-slate-800/50'}`}>
                          <div className="flex items-center gap-3 min-w-0">
                            
                            <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] shadow-inner bg-gradient-to-br overflow-hidden ${userAvatar.color}`}>
                              {userAvatar.flagCode ? (
                                 <img src={`https://flagcdn.com/w80/${userAvatar.flagCode}.png`} alt={userAvatar.name} className="w-full h-full object-cover" />
                              ) : (
                                 <span>{userAvatar.emoji}</span>
                              )}
                            </div>

                            <span className="text-[10px] font-black uppercase italic truncate max-w-[100px] sm:max-w-[150px]">
                              {user.username}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {isFinished && info.pts === 10 && (
                              <span className="animate-bounce" title="Risultato Esatto!">🎯</span>
                            )}
                            <span className={`font-black text-lg italic tracking-tighter ${info.color}`}>
                              {pred ? `${pred.home_score} - ${pred.away_score}` : '--'}
                            </span>
                            {isFinished && (
                              <span className={`min-w-[2rem] text-center font-black italic text-xs bg-slate-950 px-2 py-1 rounded-lg ${info.color} ${info.pts === 10 ? 'shadow-[0_0_10px_rgba(52,211,153,0.3)]' : ''}`}>
                                {info.pts > 0 ? `+${info.pts}` : '0'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

        {/* --- BRACKET --- */}
        {activeTab === 'BRACKET' &&
          data.profiles.map((user: any) => {
            const userPicks = data.bracketMap[user.id] || [];
            const isExpanded = expandedBracketUser === user.id;
            const userAvatar = AVATARS.find(a => a.id === user.avatar_id) || AVATARS[0];

            let userBracketTotal = 0;
            userPicks.forEach((p: any) => {
              const uStg = normalizeStage(p.stage);
              const isCorrect = data.officialResults.some(
                (off: any) => normalizeStage(off.stage) === uStg && off.team_name?.trim().toLowerCase() === p.team_name?.trim().toLowerCase()
              );
              if (isCorrect) userBracketTotal += STAGE_POINTS[uStg] || 0;
            });

            return (
              <div key={user.id} className={`bg-slate-900/40 border rounded-[2.5rem] overflow-hidden transition-all shadow-xl ${isExpanded ? 'border-blue-500/30' : 'border-slate-800'}`}>
                <button onClick={() => setExpandedBracketUser(isExpanded ? null : user.id)} className="w-full p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    
                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-lg shadow-inner bg-gradient-to-br overflow-hidden ${userAvatar.color}`}>
                      {userAvatar.flagCode ? (
                         <img src={`https://flagcdn.com/w80/${userAvatar.flagCode}.png`} alt={userAvatar.name} className="w-full h-full object-cover" />
                      ) : (
                         <span>{userAvatar.emoji}</span>
                      )}
                    </div>

                    <div className="text-left flex flex-col">
                      <span className="font-black uppercase italic text-sm">{user.username}</span>
                      <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 w-max mt-1">
                        {userBracketTotal} PT
                      </span>
                    </div>
                  </div>
                  <ChevronDown className={`transition-transform ${isExpanded ? 'rotate-180 text-blue-500' : 'text-slate-500'}`} />
                </button>
                
                {isExpanded && (
                  <div className="p-6 bg-slate-950/60 space-y-4 border-t border-slate-800">
                    {[{ id: 'R32', label: 'SEDICESIMI' }, { id: 'R16', label: 'OTTAVI' }, { id: 'QF', label: 'QUARTI' }, { id: 'SF', label: 'SEMIFINALE' }, { id: 'F', label: 'FINALE' }, { id: 'WINNER', label: 'CAMPIONE' }].map((stg) => (
                      <div key={stg.id}>
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">{stg.label}</p>
                        <div className="flex flex-wrap gap-2">
                          {userPicks.filter((p: any) => normalizeStage(p.stage) === stg.id).map((p: any) => {
                              const officialTeamsInStage = data.officialResults.filter((off: any) => normalizeStage(off.stage) === stg.id);
                              const isCorrect = officialTeamsInStage.some((off: any) => off.team_name?.trim().toLowerCase() === p.team_name?.trim().toLowerCase());
                              const isStageFull = officialTeamsInStage.length >= (STAGE_CAPACITY[stg.id] || 99);
                              const isWrong = isStageFull && !isCorrect;

                              return (
                                <span key={p.id} className={`px-3 py-1.5 rounded-xl border text-[9px] sm:text-[10px] font-black uppercase flex items-center gap-2 transition-all ${isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : isWrong ? 'bg-rose-500/10 border-rose-950 text-rose-800 opacity-50' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                                  {getFlagUrl(p.team_name) ? <img src={getFlagUrl(p.team_name)!} className="w-4 h-auto rounded-sm" alt="" /> : <Shield size={10} />}
                                  {formatTeamName(p.team_name)}
                                  {isCorrect && <span className="ml-1 text-[8px] bg-slate-950/50 px-1.5 py-0.5 rounded-md">+{STAGE_POINTS[stg.id]}</span>}
                                </span>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

        {/* --- BONUS --- */}
        {activeTab === 'BONUS' &&
          data.profiles.map((user: any) => {
            const b = data.bonusMap[user.id];
            const off = data.officialBonus;
            const isExpanded = expandedBonusUser === user.id;
            const userAvatar = AVATARS.find(a => a.id === user.avatar_id) || AVATARS[0];

            const checks = {
              red: off?.total_red_cards != null && String(b?.total_red_cards) === String(off.total_red_cards),
              top: !!off?.top_scorer && b?.top_scorer?.toLowerCase().trim() === off.top_scorer.toLowerCase().trim(),
              mvp: !!off?.mvp_world_cup && b?.mvp_world_cup?.toLowerCase().trim() === off.mvp_world_cup.toLowerCase().trim(),
              gk: !!off?.best_goalkeeper && b?.best_goalkeeper?.toLowerCase().trim() === off.best_goalkeeper.toLowerCase().trim(),
              pen: off?.total_penalties != null && String(b?.total_penalties) === String(off.total_penalties),
              own: off?.total_own_goals != null && String(b?.total_own_goals) === String(off.total_own_goals),
              high: !!off?.high_scoring_match && b?.high_scoring_match?.toLowerCase().trim() === off.high_scoring_match.toLowerCase().trim(),
              hg: !!off?.highest_scoring_group && b?.highest_scoring_group?.toLowerCase().trim() === off.highest_scoring_group.toLowerCase().trim(),
              lg: !!off?.lowest_scoring_group && b?.lowest_scoring_group?.toLowerCase().trim() === off.lowest_scoring_group.toLowerCase().trim(),
            };

            return (
              <div key={user.id} className={`bg-slate-900/40 border rounded-[2.5rem] overflow-hidden ${isExpanded ? 'border-purple-500/30' : 'border-slate-800'}`}>
                <button onClick={() => setExpandedBonusUser(isExpanded ? null : user.id)} className="w-full p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    
                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-lg shadow-inner bg-gradient-to-br overflow-hidden ${userAvatar.color}`}>
                      {userAvatar.flagCode ? (
                         <img src={`https://flagcdn.com/w80/${userAvatar.flagCode}.png`} alt={userAvatar.name} className="w-full h-full object-cover" />
                      ) : (
                         <span>{userAvatar.emoji}</span>
                      )}
                    </div>

                    <span className="font-black uppercase italic text-sm">{user.username}</span>
                  </div>
                  <ChevronDown className={`transition-transform ${isExpanded ? 'rotate-180 text-purple-500' : 'text-slate-500'}`} />
                </button>
                
                {isExpanded && (
                  <div className="p-5 bg-slate-950/60 space-y-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { id: 'MVP', val: b?.mvp_world_cup, ok: checks.mvp, pts: 10, icon: <Trophy size={12} /> },
                      { id: 'Capocannoniere', val: b?.top_scorer, ok: checks.top, pts: 10, icon: <Award size={12} /> },
                      { id: 'Miglior Portiere', val: b?.best_goalkeeper, ok: checks.gk, pts: 10, icon: <ShieldCheck size={12} /> },
                      { id: 'Match Top Gol', val: b?.high_scoring_match, ok: checks.high, pts: 5, icon: <Flame size={12} /> },
                      { id: 'Girone +', val: b?.highest_scoring_group, ok: checks.hg, pts: 5, icon: <ArrowUpToLine size={12} /> },
                      { id: 'Girone -', val: b?.lowest_scoring_group, ok: checks.lg, pts: 5, icon: <ArrowDownToLine size={12} /> },
                      { id: 'Autogol', val: b?.total_own_goals, ok: checks.own, pts: 3, icon: <Target size={12} /> },
                      { id: 'Rigori', val: b?.total_penalties, ok: checks.pen, pts: 3, icon: <Goal size={12} /> },
                      { id: 'Rossi', val: b?.total_red_cards, ok: checks.red, pts: 3, icon: <Zap size={12} /> },
                    ].map((bonus) => (
                      <div key={bonus.id} className={`flex justify-between items-center p-3 rounded-2xl border ${bonus.ok ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                        <div className="flex items-center gap-2 shrink-0">
                          {bonus.icon} <span className="text-[9px] font-black uppercase tracking-wider">{bonus.id}</span>
                        </div>
                        <div className="flex items-center gap-2 overflow-hidden pl-2">
                          <span className="text-[10px] font-black uppercase text-right italic break-all line-clamp-1">
                            {bonus.val || '--'}
                          </span>
                          {bonus.ok && <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">+{bonus.pts}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

        {/* --- NUOVO TAB STATISTICHE --- */}
        {activeTab === 'STATS' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 shadow-2xl">
              <h2 className="text-sm font-black text-yellow-500 uppercase italic tracking-tight mb-4 flex items-center gap-2 border-b border-slate-800/50 pb-2">
                <Trophy size={16} /> Scelte Vincitore
              </h2>
              <div className="space-y-3">
                {winnerStats.length > 0 ? winnerStats.map((w: any) => (
                  <div key={w.team} className="flex flex-col border-b border-slate-800/50 pb-3 last:border-0 last:pb-0">
                     <div className="flex justify-between items-center text-xs font-black uppercase italic mb-1.5">
                       <div className="flex items-center gap-2">
                          {getFlagUrl(w.team) ? <img src={getFlagUrl(w.team)!} className="w-5 h-auto rounded-sm border border-slate-700" alt="" /> : <Shield size={14} className="text-slate-600"/>}
                          <span className="text-white">{w.team}</span>
                       </div>
                       <span className="text-cyan-500">{w.pct}% <span className="text-[9px] text-slate-500 ml-1">({w.count} voti)</span></span>
                     </div>
                     <p className="text-[9px] text-slate-400 leading-tight">
                        <span className="text-slate-600">Scelto da:</span> {w.users.join(', ')}
                     </p>
                  </div>
                )) : (
                  <p className="text-xs text-slate-500 font-bold uppercase italic text-center py-4">Nessun dato disponibile</p>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 shadow-2xl">
              <h2 className="text-sm font-black text-emerald-500 uppercase italic tracking-tight mb-4 flex items-center gap-2 border-b border-slate-800/50 pb-2">
                <Target size={16} /> Cecchini (Risultati Esatti)
              </h2>
              <div className="space-y-2">
                {topCecchini.length > 0 ? topCecchini.map((p: any) => (
                  <div key={p.id} className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-xs font-black uppercase italic text-white truncate pr-2">{p.username}</span>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 shadow-inner shrink-0">
                      {p.exact_matches} presi
                    </span>
                  </div>
                )) : (
                  <p className="text-xs text-slate-500 font-bold uppercase italic text-center py-4">Ancora nessun cecchino</p>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 shadow-2xl">
              <h2 className="text-sm font-black text-rose-500 uppercase italic tracking-tight mb-4 flex items-center gap-2 border-b border-slate-800/50 pb-2">
                <Search size={16} /> Radar Anomalie 🕵️‍♂️
              </h2>
              <div className="space-y-5">
                {uiPhases.length > 0 ? uiPhases.map((phase) => {
                  const phaseAnos = anomaliesList.filter(a => a.phase === phase);
                  return (
                    <div key={phase} className="space-y-3">
                      <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 w-max shadow-inner">{phase}</h4>
                      {phaseAnos.map((ano, i) => {
                        const isFlop = ano.type === 'FLOP';
                        return (
                          <div key={i} className={`flex flex-col p-3 rounded-2xl border ${isFlop ? 'bg-rose-950/20 border-rose-900/30' : 'bg-indigo-950/20 border-indigo-900/30'}`}>
                            <div className="flex justify-between items-start mb-2">
                               <div className="flex items-center gap-2">
                                  <span className="text-lg">{isFlop ? '📉' : '🦄'}</span>
                                  <div className="flex flex-col">
                                    <span className="text-[11px] font-black uppercase italic text-white">{ano.team}</span>
                                    <span className={`text-[9px] font-black uppercase tracking-wider ${isFlop ? 'text-rose-400' : 'text-indigo-400'}`}>{ano.msg}</span>
                                  </div>
                               </div>
                            </div>
                            <div className="pt-2 border-t border-slate-800/50">
                               <p className="text-[10px] text-slate-300 font-bold leading-relaxed">
                                  <span className="text-slate-500 mr-1 uppercase text-[8px] tracking-widest">Colpevoli:</span> 
                                  {ano.users.join(', ')}
                               </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                }) : (
                  <p className="text-xs text-slate-500 font-bold uppercase italic text-center py-4">Nessuna anomalia rilevata! Tutti noiosi... 😴</p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}