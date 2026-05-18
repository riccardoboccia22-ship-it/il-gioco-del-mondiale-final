'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Trophy, Star, LayoutGrid, ChevronDown, ChevronUp, Flame,
  Award, Zap, Target, Shield, Goal, ArrowDownToLine, ArrowUpToLine, ShieldCheck,
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

  // --- FOOD & DRINKS ---
  { id: 'beer', name: 'Birra', emoji: '🍺', color: 'from-yellow-400 to-amber-500' },
  { id: 'mate', name: 'Mate', emoji: '🧉', color: 'from-green-700 to-emerald-500' },
  { id: 'cocktail', name: 'Cocktail', emoji: '🍹', color: 'from-rose-400 to-orange-400' },

  // --- NATURA & MONDO ---
  { id: 'tree', name: 'Albero', emoji: '🌳', color: 'from-green-800 to-lime-600' },
  { id: 'palm', name: 'Palma', emoji: '🌴', color: 'from-yellow-600 to-emerald-500' },
  { id: 'ice', name: 'Ghiaccio', emoji: '🧊', color: 'from-cyan-300 to-blue-100' },
  { id: 'fire', name: 'Fiamma', emoji: '🔥', color: 'from-orange-600 to-red-600' },
  { id: 'wave', name: 'Onda', emoji: '🌊', color: 'from-blue-700 to-cyan-400' },
  { id: 'snowman', name: 'Snowman', emoji: '⛄', color: 'from-slate-100 to-slate-50' },
  { id: 'world', name: 'Mondo', emoji: '🌍', color: 'from-blue-500 to-green-400' },
  { id: 'mountain', name: 'Montagna', emoji: '⛰️', color: 'from-slate-500 to-stone-400' },

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
];

const STAGE_POINTS: { [key: string]: number } = { R32: 2, R16: 4, QF: 6, SF: 8, F: 10, WINNER: 20 };
const STAGE_CAPACITY: { [key: string]: number } = { R32: 32, R16: 16, QF: 8, SF: 4, F: 2, WINNER: 1 };

const flagMap: { [key: string]: string } = {
  algeria: 'dz', 'arabia saudita': 'sa', argentina: 'ar', australia: 'au', austria: 'at',
  belgio: 'be', 'bosnia ed erzegovina': 'ba', 'bosnia erzegovina': 'ba', brasile: 'br',
  canada: 'ca', 'capo verde': 'cv', colombia: 'co', 'corea del sud': 'kr', "costa d'avorio": 'ci',
  croazia: 'hr', curaçao: 'cw', curacao: 'cw', ecuador: 'ec', egitto: 'eg', francia: 'fr',
  germania: 'de', ghana: 'gh', giappone: 'jp', giordania: 'jo', haiti: 'ht', inghilterra: 'gb-eng',
  iran: 'ir', iraq: 'iq', marocco: 'ma', messico: 'mx', norvegia: 'no', 'nuova zelanda': 'nz',
  olanda: 'nl', panama: 'pa', paraguay: 'py', portogallo: 'pt', qatar: 'qa', 'repubblica ceca': 'cz',
  'repubblica democratica del congo': 'cd', congo: 'cd', scozia: 'gb-sct', senegal: 'sn',
  spagna: 'es', 'stati uniti': 'us', usa: 'us', sudafrica: 'za', svezia: 'se', svizzera: 'ch',
  tunisia: 'tn', turchia: 'tr', uruguay: 'uy', uzbekistan: 'uz',
};

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
  if (name.trim().toLowerCase() === 'repubblica democratica del congo') return 'R. D. Congo';
  return name;
};

export default function TuttiPronosticiPage() {
  const [activeTab, setActiveTab] = useState<'GIRONI' | 'BRACKET' | 'BONUS'>('GIRONI');
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

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
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
  }, []);

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

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-yellow-500 font-black animate-pulse uppercase tracking-widest text-xs">
          Decrittazione Pronostici...
        </div>
      </div>
    );

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-32 font-sans">
      <header className="text-center mb-8 pt-4">
        <h1 className="text-4xl font-black text-yellow-500 uppercase italic">
          Scouting Globale
        </h1>
        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800 mt-6 max-w-sm mx-auto">
          {[
            { id: 'GIRONI', icon: <LayoutGrid size={14} /> },
            { id: 'BRACKET', icon: <Trophy size={14} /> },
            { id: 'BONUS', icon: <Star size={14} /> },
          ].map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black transition-all ${
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
        
        {/* --- GIRONI (VELOCITÀ LUMINOSA) --- */}
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
                            <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] shadow-inner bg-gradient-to-br ${userAvatar.color}`}>
                              {userAvatar.emoji}
                            </div>
                            <span className="text-[10px] font-black uppercase italic truncate max-w-[100px] sm:max-w-[150px]">
                              {user.username}
                            </span>
                          </div>
                          
                          {/* EFFETTO WOW INSERITO QUI */}
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
                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-lg shadow-inner bg-gradient-to-br ${userAvatar.color}`}>
                      {userAvatar.emoji}
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
                    <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-lg shadow-inner bg-gradient-to-br ${userAvatar.color}`}>
                      {userAvatar.emoji}
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
      </div>
    </main>
  );
}