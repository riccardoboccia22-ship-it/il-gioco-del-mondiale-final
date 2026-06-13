'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { WORLD_CUP_PLAYERS, WORLD_CUP_GOALKEEPERS } from '@/lib/players';
import {
  Trophy, Star, LayoutGrid, ChevronDown, Flame, CalendarDays,
  Award, Zap, Target, Shield, Goal, ArrowDownToLine, ArrowUpToLine, ShieldCheck, Lock, Activity, Search, Users
} from 'lucide-react';

const WORLD_CUP_START_DATE = new Date('2026-06-11T21:00:00+02:00');

const STAGE_POINTS: { [key: string]: number } = { R32: 2, R16: 4, QF: 6, SF: 8, F: 10, WINNER: 20 };
const STAGE_CAPACITY: { [key: string]: number } = { R32: 32, R16: 16, QF: 8, SF: 4, F: 2, WINNER: 1 };

const TOURNAMENT_GROUPS = [
  { name: 'Gruppo A', teams: ['Messico', 'Sudafrica', 'Corea Sud', 'Rep. Ceca'] },
  { name: 'Gruppo B', teams: ['Canada', 'Svizzera', 'Qatar', 'Bosnia'] }, 
  { name: 'Gruppo C', teams: ['Brasile', 'Marocco', 'Haiti', 'Scozia'] },
  { name: 'Gruppo D', teams: ['USA', 'Australia', 'Paraguay', 'Turchia'] }, 
  { name: 'Gruppo E', teams: ['Germania', 'C. Avorio', 'Ecuador', 'Curacao'] }, 
  { name: 'Gruppo F', teams: ['Olanda', 'Svezia', 'Giappone', 'Tunisia'] },
  { name: 'Gruppo G', teams: ['Belgio', 'Iran', 'Egitto', 'N. Zelanda'] },
  { name: 'Gruppo H', teams: ['Spagna', 'Uruguay', 'Arabia S.', 'Capo Verde'] },
  { name: 'Gruppo I', teams: ['Francia', 'Senegal', 'Norvegia', 'Iraq'] },
  { name: 'Gruppo J', teams: ['Argentina', 'Austria', 'Algeria', 'Giordania'] },
  { name: 'Gruppo K', teams: ['Portogallo', 'Colombia', 'Uzbekistan', 'R.D. Congo'] },
  { name: 'Gruppo L', teams: ['Inghilterra', 'Croazia', 'Ghana', 'Panama'] },
];

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

const TOP_TEAMS = ['Argentina', 'Belgio', 'Brasile', 'Francia', 'Germania', 'Inghilterra', 'Olanda', 'Portogallo', 'Spagna'];
const MID_TEAMS = ['Austria', 'Colombia', 'C. Avorio', 'Croazia', 'Egitto', 'Giappone', 'Marocco', 'Messico', 'Norvegia', 'Senegal', 'Svizzera', 'Turchia', 'Uruguay', 'USA'];
const LOW_TEAMS = ['Algeria', 'Australia', 'Canada', 'Corea Sud', 'Ecuador', 'Iran', 'Iraq', 'N. Zelanda', 'Panama', 'Paraguay', 'Rep. Ceca', 'Scozia', 'Svezia', 'Sudafrica', 'Tunisia'];
const SUPER_LOW_TEAMS = ['Arabia S.', 'Bosnia', 'Capo Verde', 'R.D. Congo', 'Curacao', 'Ghana', 'Giordania', 'Haiti', 'Qatar', 'Uzbekistan'];

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
  if (n === 'repubblica democratica del congo' || n === 'r.d. congo' || n === 'congo' || n === 'rd congo') return 'R.D. Congo';
  if (n === 'stati uniti' || n === 'usa') return 'USA';
  if (n === 'bosnia ed erzegovina' || n === 'bosnia erzegovina' || n === 'bosnia') return 'Bosnia';
  if (n === 'nuova zelanda' || n === 'n. zelanda') return 'N. Zelanda';
  if (n === 'arabia saudita' || n === 'arabia s.') return 'Arabia S.';
  if (n === 'repubblica ceca' || n === 'rep. ceca') return 'Rep. Ceca';
  if (n === "costa d'avorio" || n === 'costa avorio' || n === 'c. avorio') return 'C. Avorio';
  if (n === 'corea del sud' || n === 'corea sud') return 'Corea Sud';
  if (n === 'curaçao' || n === 'curacao') return 'Curacao';
  return name;
};

const cleanString = (str: string) => {
  if (!str) return '';
  return formatTeamName(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

export default function TuttiPronosticiPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'GIRONI' | 'BRACKET' | 'BONUS' | 'STATS'>('GIRONI');
  const [gironiViewMode, setGironiViewMode] = useState<'CHRONO' | 'GROUP'>('CHRONO');

  const [data, setData] = useState<any>({
    currentUserUsername: '', profiles: [], matches: [], predictionsMap: {}, bracketMap: {}, bonusMap: {}, officialBonus: null, officialResults: [],
  });
  const [loading, setLoading] = useState(true);
  
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [expandedBonus, setExpandedBonus] = useState<string | null>(null);

  const isStarted = new Date() > WORLD_CUP_START_DATE;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/'); return; }

        const { data: profile } = await supabase.from('profiles').select('full_name, username').eq('id', user.id).single();
        if (!profile || !profile.full_name) { router.push('/setup-profilo'); return; }

        const fetchAll = async (table: string) => {
          let all: any[] = [];
          let from = 0;
          const step = 1000;
          while (true) {
            const { data, error } = await supabase.from(table).select('*').range(from, from + step - 1);
            if (error || !data) break;
            all.push(...data);
            if (data.length < step) break;
            from += step;
          }
          return all;
        };

        const [p, m, off, offBo, usrBo] = await Promise.all([
          supabase.from('profiles').select('*').order('username'),
          supabase.from('matches').select('*').order('match_date', { ascending: true }),
          supabase.from('official_bracket').select('*'),
          supabase.from('official_bonuses').select('*').eq('id', '00000000-0000-0000-0000-000000000000').maybeSingle(),
          supabase.from('user_bonus_answers').select('*'),
        ]);

        const prData = await fetchAll('predictions');
        const brData = await fetchAll('brackets');

        const predMap: any = {};
        prData.forEach(pred => {
          if (!predMap[pred.match_id]) predMap[pred.match_id] = {};
          predMap[pred.match_id][pred.user_id] = pred;
        });

        const brackMap: any = {};
        brData.forEach(b => {
          if (!brackMap[b.user_id]) brackMap[b.user_id] = [];
          brackMap[b.user_id].push(b);
        });

        const bMap: any = {};
        usrBo.data?.forEach(b => bMap[b.user_id] = b);

        setData({
          currentUserUsername: profile.username,
          profiles: p.data || [], matches: m.data || [], predictionsMap: predMap,
          bracketMap: brackMap, officialResults: off.data || [], officialBonus: offBo.data || null, bonusMap: bMap,
        });
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchData();
  }, [router]);

  const groupedByDay = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};
    data.matches.forEach((m: any) => {
      let dayName = "Data da definire";
      if (m.match_date) {
        const dateStr = new Date(m.match_date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
        dayName = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
      }
      if (!grouped[dayName]) grouped[dayName] = [];
      grouped[dayName].push(m);
    });
    return grouped;
  }, [data.matches]);

  const getFlagUrl = (team: string) => {
    const code = flagMap[team?.toLowerCase().trim()];
    return code ? `https://flagcdn.com/w40/${code}.png` : null;
  };

  const getMatchResultInfo = (pred: any, match: any) => {
    if (!pred || match.home_score_final === null || !match.is_finished) return { pts: 0, color: 'text-slate-500', bg: 'bg-slate-900 border-slate-800' };
      
    const ph = Number(pred.home_score), pa = Number(pred.away_score);
    const mh = Number(match.home_score_final), ma = Number(match.away_score_final);
    const pRes = ph > pa ? '1' : ph < pa ? '2' : 'X';
    const mRes = mh > ma ? '1' : mh < ma ? '2' : 'X';
    
    if (ph === mh && pa === ma) return { pts: 10, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_20px_rgba(52,211,153,0.2)]' };
    if (pRes === mRes && (ph === mh || pa === ma)) return { pts: 6, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/40' };
    if (pRes === mRes) return { pts: 4, color: 'text-amber-500', bg: 'bg-amber-600/10 border-amber-600/40' };
    if (ph === mh || pa === ma) return { pts: 2, color: 'text-slate-300', bg: 'bg-slate-800/50 border-slate-700' };
    return { pts: 0, color: 'text-rose-500', bg: 'bg-rose-950/20 border-rose-900/30 opacity-70' };
  };

  const getAggregatedMatchPicks = (matchId: number) => {
    const agg: Record<string, { users: string[], predObj: any }> = {};
    data.profiles.forEach((p: any) => {
      const pred = data.predictionsMap[matchId]?.[p.id];
      const resKey = (pred && pred.home_score !== null && pred.away_score !== null) ? `${pred.home_score} - ${pred.away_score}` : 'Nessun pronostico';
      if (!agg[resKey]) agg[resKey] = { users: [], predObj: pred };
      agg[resKey].users.push(p.username);
    });
    return Object.entries(agg).sort((a, b) => b[1].users.length - a[1].users.length);
  };

  const getAggregatedBracketPicks = (stageId: string) => {
    const agg: Record<string, string[]> = {};
    data.profiles.forEach((p: any) => {
      const picks = (data.bracketMap[p.id] || []).filter((b: any) => normalizeStage(b.stage) === stageId);
      picks.forEach((pick: any) => {
        const team = formatTeamName(pick.team_name);
        if (team) {
          if (!agg[team]) agg[team] = [];
          agg[team].push(p.username);
        }
      });
    });
    return Object.entries(agg).sort((a, b) => b[1].length - a[1].length);
  };

  const getAggregatedBonusPicks = (bonusKey: string, isNumeric: boolean = false) => {
    const agg: Record<string, string[]> = {};
    data.profiles.forEach((p: any) => {
      let val = data.bonusMap[p.id]?.[bonusKey];
      val = val !== null && val !== undefined && val !== '' ? String(val).trim() : 'Nessuna Scelta';
      if (!agg[val]) agg[val] = [];
      agg[val].push(p.username);
    });
    return Object.entries(agg).sort((a, b) => {
      if (a[0] === 'Nessuna Scelta') return 1;
      if (b[0] === 'Nessuna Scelta') return -1;
      if (isNumeric) {
        return Number(b[0]) - Number(a[0]);
      }
      return b[1].length - a[1].length;
    });
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
      if (p && p.username) counts[t].users.push(p.username);
    });
    
    return Object.entries(counts)
      .map(([team, info]: any) => ({ 
        team, count: info.count, pct: Math.round((info.count / total) * 100), users: info.users
      }))
      .sort((a, b) => b.count - a.count || a.team.localeCompare(b.team));
  };

  const getAnomalies = () => {
    const allTeams = [...TOP_TEAMS, ...MID_TEAMS, ...LOW_TEAMS, ...SUPER_LOW_TEAMS];
    let anomalies: { user: string, type: string, team: string, msg: string, phase: string, phaseWeight: number }[] = [];

    data.profiles.forEach((p: any) => {
      if (!p || !p.id || !p.username) return;

      const uBrackets = data.bracketMap[p.id] || [];
      if (uBrackets.length === 0) return;
      
      const r32 = uBrackets.filter((b: any) => b.stage === 'R32').map((b: any) => formatTeamName(b.team_name).toLowerCase());
      const r16 = uBrackets.filter((b: any) => b.stage === 'R16').map((b: any) => formatTeamName(b.team_name).toLowerCase());
      const qf = uBrackets.filter((b: any) => b.stage === 'QF').map((b: any) => formatTeamName(b.team_name).toLowerCase());
      
      const hasR32 = r32.length >= 32;
      const hasR16 = r16.length >= 16;
      const hasQF = qf.length >= 8;

      allTeams.forEach(t => {
          const teamF = formatTeamName(t).toLowerCase();
          const originalTeam = formatTeamName(t);
          
          const inR32 = r32.includes(teamF);
          const inR16 = r16.includes(teamF);
          const inQF = qf.includes(teamF);
          const inSF = uBrackets.filter((b: any) => ['SF', 'F', 'WINNER'].includes(b.stage)).map((b: any) => formatTeamName(b.team_name).toLowerCase()).includes(teamF);
          const inF = uBrackets.filter((b: any) => ['F', 'WINNER'].includes(b.stage)).map((b: any) => formatTeamName(b.team_name).toLowerCase()).includes(teamF);
          const inWinner = uBrackets.filter((b: any) => b.stage === 'WINNER').map((b: any) => formatTeamName(b.team_name).toLowerCase()).includes(teamF);

          if (TOP_TEAMS.includes(t)) {
              if (hasR32 && !inR32) anomalies.push({ user: p.username, type: 'FLOP', team: originalTeam, msg: 'Fuori ai Gironi 📉', phase: 'Gironi', phaseWeight: 1 });
              else if (hasR16 && inR32 && !inR16) anomalies.push({ user: p.username, type: 'FLOP', team: originalTeam, msg: 'Fuori ai Sedicesimi 😱', phase: 'Sedicesimi', phaseWeight: 2 });
              else if (hasQF && inR16 && !inQF) anomalies.push({ user: p.username, type: 'FLOP', team: originalTeam, msg: 'Fuori agli Ottavi 😱', phase: 'Ottavi di finale', phaseWeight: 3 });
          }
          if (MID_TEAMS.includes(t)) {
              if (hasR32 && !inR32) anomalies.push({ user: p.username, type: 'FLOP', team: originalTeam, msg: 'Fuori ai Gironi 📉', phase: 'Gironi', phaseWeight: 1 });
          }
          if (LOW_TEAMS.includes(t)) {
              if (inWinner) anomalies.push({ user: p.username, type: 'FAVOLA', team: originalTeam, msg: 'Campione del Mondo! 🏆🦄', phase: 'Campione', phaseWeight: 7 });
              else if (inF) anomalies.push({ user: p.username, type: 'FAVOLA', team: originalTeam, msg: 'In Finale! 🤯', phase: 'Finale', phaseWeight: 6 });
              else if (inSF) anomalies.push({ user: p.username, type: 'FAVOLA', team: originalTeam, msg: 'In Semifinale! 🚀', phase: 'Semifinale', phaseWeight: 5 });
              else if (inQF) anomalies.push({ user: p.username, type: 'FAVOLA', team: originalTeam, msg: 'Raggiunge i Quarti! 🍷', phase: 'Quarti di finale', phaseWeight: 4 });
          }
          if (SUPER_LOW_TEAMS.includes(t)) {
              if (teamF === 'curacao' || teamF === 'r.d. congo' || teamF === 'bosnia') return;
              if (inWinner) anomalies.push({ user: p.username, type: 'FAVOLA', team: originalTeam, msg: 'Campione del Mondo! 🏆🦄', phase: 'Campione', phaseWeight: 7 });
              else if (inF) anomalies.push({ user: p.username, type: 'FAVOLA', team: originalTeam, msg: 'In Finale! 🤯', phase: 'Finale', phaseWeight: 6 });
              else if (inSF) anomalies.push({ user: p.username, type: 'FAVOLA', team: originalTeam, msg: 'In Semifinale! 🚀', phase: 'Semifinale', phaseWeight: 5 });
              else if (inQF) anomalies.push({ user: p.username, type: 'FAVOLA', team: originalTeam, msg: 'Raggiunge i Quarti! 🍷', phase: 'Quarti di finale', phaseWeight: 4 });
              else if (inR16) anomalies.push({ user: p.username, type: 'FAVOLA', team: originalTeam, msg: 'Arriva agli Ottavi! 🍿', phase: 'Ottavi di finale', phaseWeight: 3 });
              else if (inR32) anomalies.push({ user: p.username, type: 'FAVOLA', team: originalTeam, msg: 'Supera i Gironi! 🎉', phase: 'Sedicesimi', phaseWeight: 2 });
          }
      });
    });

    const groupedObj = anomalies.reduce((acc, ano) => {
      const key = `${acc.phaseWeight || 0}-${ano.type}-${ano.team}-${ano.msg}`;
      if (!acc[key]) acc[key] = { ...ano, users: [ano.user] };
      else if (!acc[key].users.includes(ano.user)) acc[key].users.push(ano.user);
      return acc;
    }, {} as any);
    
    return Object.values(groupedObj).sort((a: any, b: any) => a.phaseWeight - b.phaseWeight || a.type.localeCompare(b.type) || a.team.localeCompare(b.team));
  };

  const topCecchini = (data.profiles || []).filter((p: any) => (p.exact_matches || 0) > 0).sort((a: any, b: any) => b.exact_matches - a.exact_matches);

  const renderMatchCard = (match: any) => {
    const hFlag = getFlagUrl(match.home_team);
    const aFlag = getFlagUrl(match.away_team);
    const isExpanded = expandedMatch === match.id;
    const isFinished = match.is_finished && match.home_score_final !== null;

    return (
      <div key={match.id} className={`bg-slate-900/40 border rounded-[2rem] overflow-hidden transition-all ${isExpanded ? 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'border-slate-800'}`}>
        <button onClick={() => setExpandedMatch(isExpanded ? null : match.id)} className="w-full p-5 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 hover:bg-slate-800/30 transition-all">
          <div className="w-full sm:w-auto flex justify-between items-center sm:block text-left">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
              {match.match_date ? new Date(match.match_date).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : `#${match.id}`}
            </span>
            {isFinished && <span className="text-[8px] text-emerald-400 font-black uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full sm:hidden">FINITA</span>}
          </div>

          <div className="flex-1 flex items-center justify-center gap-2 sm:gap-4 w-full">
            <div className="flex flex-1 items-center justify-end gap-2 text-right min-w-0">
              <span className="font-black uppercase italic text-[10px] sm:text-xs tracking-tight truncate">{formatTeamName(match.home_team)}</span>
              {hFlag ? <img src={hFlag} className="w-6 h-4 rounded-sm shadow-md object-cover" alt="" /> : <Shield size={16} className="text-slate-600" />}
            </div>
            <div className="w-14 sm:w-16 shrink-0 text-center bg-slate-950 py-1.5 rounded-xl font-black text-yellow-500 border border-slate-800 text-xs sm:text-base shadow-inner">
              {isFinished ? `${match.home_score_final}-${match.away_score_final}` : 'VS'}
            </div>
            <div className="flex flex-1 items-center justify-start gap-2 text-left min-w-0">
              {aFlag ? <img src={aFlag} className="w-6 h-4 rounded-sm shadow-md object-cover" alt="" /> : <Shield size={16} className="text-slate-600" />}
              <span className="font-black uppercase italic text-[10px] sm:text-xs tracking-tight truncate">{formatTeamName(match.away_team)}</span>
            </div>
          </div>
          <div className="hidden sm:flex w-16 justify-end">
            {isFinished && <span className="text-[8px] text-emerald-400 font-black uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full">FINITA</span>}
          </div>
        </button>

        {isExpanded && (
          <div className="bg-slate-950/80 p-4 space-y-3 border-t border-slate-800/50">
            {getAggregatedMatchPicks(match.id).map(([resKey, group]: any, idx) => {
              const info = getMatchResultInfo(group.predObj, match);
              const isUnset = resKey === 'Nessun pronostico';
              const isMe = group.users.includes(data.currentUserUsername);
              
              return (
                <div key={idx} className={`flex flex-col p-4 rounded-2xl border transition-all relative overflow-hidden ${isUnset ? 'bg-slate-900/50 border-slate-800/50 opacity-60' : info.bg} ${isMe && !isUnset ? 'ring-1 ring-yellow-500/50' : ''}`}>
                  
                  {isMe && !isUnset && (
                     <div className="absolute top-0 right-0 bg-yellow-500 text-slate-950 text-[8px] font-black uppercase px-2 py-1 rounded-bl-lg z-10">La tua scelta</div>
                  )}

                  <div className="flex justify-between items-start mb-2 border-b border-slate-800/30 pb-2 mt-1">
                     <div className="flex items-center gap-3">
                       <span className={`text-xl font-black italic tracking-tighter ${isUnset ? 'text-slate-500 text-sm' : info.color}`}>{resKey}</span>
                       {isFinished && !isUnset && info.pts > 0 && (
                         <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${info.pts === 10 ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-slate-800 text-white'}`}>
                            {info.pts === 10 && <span>🎯</span>} +{info.pts} PT
                         </span>
                       )}
                     </div>
                     <div className="flex items-center gap-1.5 text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shadow-inner">
                        <Users size={12} /> <span className="text-[10px] font-black">{group.users.length}</span>
                     </div>
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 leading-relaxed capitalize-first">
                     {group.users.map((u: string, i: number) => (
                       <span key={i} className={u === data.currentUserUsername ? 'text-yellow-500 font-bold' : ''}>
                         {u}{i < group.users.length - 1 ? ', ' : ''}
                       </span>
                     ))}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (loading) return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-yellow-500 font-black animate-pulse uppercase tracking-widest text-xs">Aggregazione Dati in corso...</div>
      </div>
  );

  if (!isStarted) return (
      <main className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center text-center pb-32">
        <div className="bg-slate-900 p-8 rounded-full mb-6 border border-slate-800 shadow-[0_0_40px_rgba(234,179,8,0.1)]">
           <Lock size={48} className="text-yellow-500" />
        </div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-white">Pronostici Segreti</h1>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest max-w-xs leading-relaxed">
          I risultati aggregati saranno sbloccati al fischio d'inizio del Mondiale.
          <br/><br/><span className="text-yellow-500">11 Giugno 2026 ore 21:00</span>
        </p>
      </main>
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-32 font-sans">
      <header className="text-center mb-8 pt-4">
        <h1 className="text-4xl font-black text-yellow-500 uppercase italic">Scouting Globale</h1>
        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800 mt-6 max-w-[400px] mx-auto overflow-x-auto custom-scrollbar">
          {[
            { id: 'GIRONI', icon: <LayoutGrid size={14} /> },
            { id: 'BRACKET', icon: <Trophy size={14} /> },
            { id: 'BONUS', icon: <Star size={14} /> },
            { id: 'STATS', icon: <Activity size={14} /> },
          ].map((tab: any) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl text-[10px] font-black transition-all whitespace-nowrap min-w-max ${activeTab === tab.id ? 'bg-yellow-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}>
              {tab.icon} {tab.id}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* --- 1. GIRONI --- */}
        {activeTab === 'GIRONI' && (
          <div className="space-y-6">
             <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 mb-6 mx-auto">
                <button
                  onClick={() => setGironiViewMode('CHRONO')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all ${
                    gironiViewMode === 'CHRONO' ? 'bg-slate-800 text-yellow-500 shadow-md' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  <CalendarDays size={16} /> Calendario
                </button>
                <button
                  onClick={() => setGironiViewMode('GROUP')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all ${
                    gironiViewMode === 'GROUP' ? 'bg-slate-800 text-yellow-500 shadow-md' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  <LayoutGrid size={16} /> Per Girone
                </button>
             </div>

             {gironiViewMode === 'CHRONO' && Object.entries(groupedByDay).map(([dayName, matchesArray]) => (
                <div key={dayName} className="space-y-3">
                  <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                    <CalendarDays size={16}/> {dayName}
                    <div className="flex-1 h-px bg-slate-800/50"></div>
                  </h2>
                  {matchesArray.map((m: any) => renderMatchCard(m))}
                </div>
             ))}

             {gironiViewMode === 'GROUP' && TOURNAMENT_GROUPS.map((group) => {
                const groupMatches = data.matches.filter((m: any) => 
                   group.teams.some(t => formatTeamName(t).toLowerCase() === formatTeamName(m.home_team).toLowerCase() || formatTeamName(t).toLowerCase() === formatTeamName(m.away_team).toLowerCase())
                );
                if (groupMatches.length === 0) return null;

                return (
                  <div key={group.name} className="space-y-3">
                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                      <LayoutGrid size={16}/> {group.name}
                      <div className="flex-1 h-px bg-slate-800/50"></div>
                    </h2>
                    {groupMatches.map((m: any) => renderMatchCard(m))}
                  </div>
                );
             })}
          </div>
        )}

        {/* --- 2. BRACKET --- */}
        {activeTab === 'BRACKET' &&
          [{ id: 'WINNER', label: 'CAMPIONE DEL MONDO' }, { id: 'F', label: 'FINALISTE' }, { id: 'SF', label: 'SEMIFINALISTE' }, { id: 'QF', label: 'QUARTI DI FINALE' }, { id: 'R16', label: 'OTTAVI DI FINALE' }, { id: 'R32', label: 'SEDICESIMI' }].map((stg) => {
            const isExpanded = expandedStage === stg.id;
            const officialTeamsInStage = data.officialResults.filter((off: any) => normalizeStage(off.stage) === stg.id);
            const isStageFull = officialTeamsInStage.length >= (STAGE_CAPACITY[stg.id] || 99);

            return (
              <div key={stg.id} className={`bg-slate-900/40 border rounded-[2rem] overflow-hidden transition-all shadow-xl ${isExpanded ? 'border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-slate-800'}`}>
                <button onClick={() => setExpandedStage(isExpanded ? null : stg.id)} className="w-full p-6 flex items-center justify-between hover:bg-slate-800/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      <Trophy size={18} />
                    </div>
                    <span className="font-black uppercase italic text-sm text-left">{stg.label}</span>
                  </div>
                  <ChevronDown className={`transition-transform ${isExpanded ? 'rotate-180 text-blue-500' : 'text-slate-500'}`} />
                </button>
                
                {isExpanded && (
                  <div className="p-5 bg-slate-950/80 space-y-3 border-t border-slate-800/50">
                    {getAggregatedBracketPicks(stg.id).map(([team, users]: any, idx) => {
                      const isCorrect = officialTeamsInStage.some((off: any) => formatTeamName(off.team_name).toLowerCase() === formatTeamName(team).toLowerCase());
                      const isWrong = isStageFull && !isCorrect;
                      const isMe = users.includes(data.currentUserUsername);
                      const flag = getFlagUrl(team);

                      return (
                        <div key={idx} className={`flex flex-col p-4 rounded-2xl border transition-all relative overflow-hidden ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/50' : isWrong ? 'bg-rose-950/20 border-rose-900/30 opacity-60' : 'bg-slate-900 border-slate-800'} ${isMe ? 'ring-1 ring-yellow-500/50' : ''}`}>
                          
                          {isMe && (
                             <div className="absolute top-0 right-0 bg-yellow-500 text-slate-950 text-[8px] font-black uppercase px-2 py-1 rounded-bl-lg z-10">La tua scelta</div>
                          )}

                          <div className="flex justify-between items-center mb-2 border-b border-slate-800/50 pb-2 mt-1">
                             <div className="flex items-center gap-3">
                               {flag ? <img src={flag} className="w-6 h-4 rounded-sm object-cover border border-slate-700" alt=""/> : <Shield size={16} className="text-slate-500"/>}
                               <span className={`text-sm font-black uppercase italic tracking-tight ${isCorrect ? 'text-emerald-400' : isWrong ? 'text-rose-400 line-through decoration-rose-500/50' : 'text-white'}`}>{team}</span>
                               {isCorrect && <span className="text-[9px] font-black bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded-md ml-1 flex items-center gap-0.5 shadow-[0_0_10px_rgba(16,185,129,0.5)]">🎯 +{STAGE_POINTS[stg.id]} PT</span>}
                             </div>
                             <div className="flex items-center gap-1.5 text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shadow-inner">
                                <Users size={12} /> <span className="text-[10px] font-black">{users.length}</span>
                             </div>
                          </div>
                          <p className="text-[11px] font-medium text-slate-400 leading-relaxed capitalize-first">
                             {users.map((u: string, i: number) => (
                               <span key={i} className={u === data.currentUserUsername ? 'text-yellow-500 font-bold' : ''}>
                                 {u}{i < users.length - 1 ? ', ' : ''}
                               </span>
                             ))}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

        {/* --- 3. BONUS --- */}
        {activeTab === 'BONUS' &&
          [
            { id: 'mvp_world_cup', label: 'MVP Mondiale', icon: <Trophy size={16}/>, pts: 10, type: 'PLAYER' },
            { id: 'top_scorer', label: 'Capocannoniere', icon: <Award size={16}/>, pts: 10, type: 'PLAYER' },
            { id: 'best_goalkeeper', label: 'Miglior Portiere', icon: <ShieldCheck size={16}/>, pts: 10, type: 'PLAYER' },
            { id: 'high_scoring_match', label: 'Match + Gol', icon: <Flame size={16}/>, pts: 5, type: 'MATCH' },
            { id: 'highest_scoring_group', label: 'Girone + Gol', icon: <ArrowUpToLine size={16}/>, pts: 5, type: 'GROUP' },
            { id: 'lowest_scoring_group', label: 'Girone - Gol', icon: <ArrowDownToLine size={16}/>, pts: 5, type: 'GROUP' },
            { id: 'total_own_goals', label: 'Totale Autogol', icon: <Target size={16}/>, pts: 3, type: 'NUMBER' },
            { id: 'total_penalties', label: 'Totale Rigori', icon: <Goal size={16}/>, pts: 3, type: 'NUMBER' },
            { id: 'total_red_cards', label: 'Totale Rossi', icon: <Zap size={16}/>, pts: 3, type: 'NUMBER' },
          ].map((bonus) => {
            const isExpanded = expandedBonus === bonus.id;
            const offVal = data.officialBonus?.[bonus.id];
            
            return (
              <div key={bonus.id} className={`bg-slate-900/40 border rounded-[2rem] overflow-hidden transition-all shadow-xl ${isExpanded ? 'border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'border-slate-800'}`}>
                <button onClick={() => setExpandedBonus(isExpanded ? null : bonus.id)} className="w-full p-6 flex items-center justify-between hover:bg-slate-800/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {bonus.icon}
                    </div>
                    <span className="font-black uppercase italic text-sm text-left">{bonus.label}</span>
                  </div>
                  <ChevronDown className={`transition-transform ${isExpanded ? 'rotate-180 text-purple-500' : 'text-slate-500'}`} />
                </button>
                
                {isExpanded && (
                  <div className="p-5 bg-slate-950/80 space-y-3 border-t border-slate-800/50">
                    {offVal && (
                       <div className="mb-4 bg-purple-950/30 border border-purple-500/30 p-3 rounded-xl flex flex-col items-center justify-center text-center">
                          <span className="text-[9px] text-purple-400 font-black uppercase tracking-widest mb-1">Dato Reale Live</span>
                          <span className="text-white font-black uppercase italic">{offVal} {bonus.type === 'NUMBER' && 'Nel Torneo'}</span>
                       </div>
                    )}
                    {getAggregatedBonusPicks(bonus.id, bonus.type === 'NUMBER').map(([ans, users]: any, idx) => {
                      const isUnset = ans === 'Nessuna Scelta';
                      
                      const isMathematicallyWrong = bonus.type === 'NUMBER' && offVal != null && !isUnset && Number(ans) < Number(offVal);
                      
                      const isCorrect = bonus.type !== 'NUMBER' && offVal && cleanString(String(ans)) === cleanString(String(offVal));
                      const isMe = users.includes(data.currentUserUsername);

                      let flagElement = null;
                      if (!isUnset) {
                        if (bonus.type === 'PLAYER') {
                          const allPlayers = [...WORLD_CUP_PLAYERS, ...WORLD_CUP_GOALKEEPERS];
                          const player = allPlayers.find(p => cleanString(p.name) === cleanString(ans));
                          const f = player ? getFlagUrl(player.country) : null;
                          flagElement = f ? <img src={f} className="w-5 h-3.5 object-cover rounded-[2px] border border-slate-700 shrink-0" alt=""/> : <Shield size={14} className="text-slate-600 shrink-0"/>;
                        } 
                        else if (bonus.type === 'MATCH' && ans.includes('-')) {
                          const [t1, t2] = ans.split(/\s*-\s*/);
                          const f1 = getFlagUrl(t1);
                          const f2 = getFlagUrl(t2);
                          flagElement = (
                            <div className="flex items-center gap-1 shrink-0">
                               {f1 ? <img src={f1} className="w-4 h-3 object-cover rounded-[2px] border border-slate-700" alt=""/> : <Shield size={12} className="text-slate-600"/>}
                               <span className="text-[8px] text-slate-500">-</span>
                               {f2 ? <img src={f2} className="w-4 h-3 object-cover rounded-[2px] border border-slate-700" alt=""/> : <Shield size={12} className="text-slate-600"/>}
                            </div>
                          );
                        } 
                        else if (bonus.type === 'GROUP') {
                          const group = TOURNAMENT_GROUPS.find(g => cleanString(g.name) === cleanString(ans));
                          if (group) {
                            flagElement = (
                              <div className="flex items-center gap-0.5 shrink-0">
                                 {group.teams.map((t, i) => {
                                    const f = getFlagUrl(t);
                                    return f ? <img key={i} src={f} className="w-3.5 h-2.5 object-cover rounded-[2px] border border-slate-700" alt=""/> : <Shield key={i} size={10} className="text-slate-600"/>;
                                 })}
                              </div>
                            );
                          }
                        }
                      }

                      return (
                        <div key={idx} className={`flex flex-col p-4 rounded-2xl border transition-all relative overflow-hidden ${
                          isCorrect 
                            ? 'bg-emerald-500/10 border-emerald-500/50' 
                            : isUnset 
                              ? 'bg-slate-900/30 border-slate-800/50 opacity-60' 
                              : isMathematicallyWrong
                                ? 'bg-rose-950/5 border-rose-950/20 text-slate-500 opacity-40 shadow-inner'
                                : 'bg-slate-900 border-slate-800'
                        } ${isMe && !isUnset ? 'ring-1 ring-yellow-500/50' : ''}`}>
                          
                          {isMe && !isUnset && (
                             <div className="absolute top-0 right-0 bg-yellow-500 text-slate-950 text-[8px] font-black uppercase px-2 py-1 rounded-bl-lg z-10">La tua scelta</div>
                          )}

                          <div className="flex justify-between items-center mb-2 border-b border-slate-800/50 pb-2 mt-1">
                             <div className="flex items-center gap-2.5">
                               {flagElement}
                               <span className={`text-sm font-black uppercase italic tracking-tight ${
                                 isCorrect 
                                   ? 'text-emerald-400' 
                                   : isUnset 
                                     ? 'text-slate-500' 
                                     : isMathematicallyWrong 
                                       ? 'text-slate-600 line-through decoration-rose-500/50'
                                       : 'text-white'
                               }`}>{ans}</span>
                               
                               {isCorrect && <span className="text-[9px] font-black bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded-md ml-1 flex items-center gap-0.5 shadow-[0_0_10px_rgba(16,185,129,0.5)]">🎯 +{bonus.pts} PT</span>}
                               {isMathematicallyWrong && <span className="text-[8px] font-black bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded-md ml-1 tracking-wider uppercase">Eliminato ❌</span>}
                             </div>
                             <div className="flex items-center gap-1.5 text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shadow-inner">
                                <Users size={12} /> <span className="text-[10px] font-black">{users.length}</span>
                             </div>
                          </div>
                          <p className={`text-[11px] font-medium leading-relaxed capitalize-first ${isMathematicallyWrong ? 'text-slate-600 font-normal line-through opacity-70' : 'text-slate-400'}`}>
                             {users.map((u: string, i: number) => (
                               <span key={i} className={u === data.currentUserUsername ? 'text-yellow-500 font-bold' : ''}>
                                 {u}{i < users.length - 1 ? ', ' : ''}
                               </span>
                             ))}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

        {/* --- 4. STATS --- */}
        {activeTab === 'STATS' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 shadow-2xl">
              <h2 className="text-sm font-black text-yellow-500 uppercase italic tracking-tight mb-4 flex items-center gap-2 border-b border-slate-800/50 pb-2">
                <Trophy size={16} /> Scelte Campione del Mondo
              </h2>
              <div className="space-y-3">
                {(() => {
                  const winnerStats = getWinnerStats();
                  if (winnerStats.length === 0) return <p className="text-xs text-slate-500 font-bold uppercase italic text-center py-4">Nessun dato disponibile</p>;
                  
                  return winnerStats.map((w: any) => {
                    const isMe = w.users.includes(data.currentUserUsername);
                    return (
                      <div key={w.team} className={`flex flex-col border-b border-slate-800/50 pb-3 last:border-0 last:pb-0 relative ${isMe ? 'bg-yellow-500/5 -mx-2 px-2 rounded-lg' : ''}`}>
                         {isMe && <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-yellow-500"></span>}
                         <div className="flex justify-between items-center text-xs font-black uppercase italic mb-1.5 mt-1">
                           <div className="flex items-center gap-2">
                              {getFlagUrl(w.team) ? <img src={getFlagUrl(w.team)!} className="w-5 h-auto rounded-sm border border-slate-700" alt="" /> : <Shield size={14} className="text-slate-600"/>}
                              <span className="text-white">{w.team}</span>
                           </div>
                           <span className="text-cyan-500">{w.pct}% <span className="text-[9px] text-slate-500 ml-1">({w.count} voti)</span></span>
                         </div>
                         <p className="text-[9px] text-slate-400 leading-tight">
                            <span className="text-slate-600">Scelto da: </span> 
                            {w.users.map((u: string, i: number) => (
                               <span key={i} className={u === data.currentUserUsername ? 'text-yellow-500 font-bold' : ''}>
                                 {u}{i < w.users.length - 1 ? ', ' : ''}
                               </span>
                             ))}
                         </p>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 shadow-2xl">
              <h2 className="text-sm font-black text-emerald-500 uppercase italic tracking-tight mb-4 flex items-center gap-2 border-b border-slate-800/50 pb-2">
                <Target size={16} /> Cecchini (Risultati Esatti)
              </h2>
              <div className="space-y-2">
                {topCecchini.length > 0 ? topCecchini.map((p: any) => (
                  <div key={p.id} className={`flex justify-between items-center p-3 rounded-xl border ${p.username === data.currentUserUsername ? 'bg-emerald-950/30 border-emerald-500/50 ring-1 ring-emerald-500' : 'bg-slate-950 border-slate-800'}`}>
                    <span className={`text-xs font-black uppercase italic truncate pr-2 ${p.username === data.currentUserUsername ? 'text-emerald-400' : 'text-white'}`}>{p.username} {p.username === data.currentUserUsername && '(TU)'}</span>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 shadow-inner shrink-0">
                      {p.exact_matches || 0} presi
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
                {(() => {
                  const anos = getAnomalies();
                  const uiPhases = anos.map((a:any) => a.phase).filter((v:any, i:any, a:any) => a.indexOf(v) === i);
                  
                  if(uiPhases.length === 0) return <p className="text-xs text-slate-500 font-bold uppercase italic text-center py-4">Nessuna anomalia rilevata! Tutti noiosi... 😴</p>;

                  return uiPhases.map((phase: string) => {
                    const phaseAnos = anos.filter((a:any) => a.phase === phase);
                    return (
                      <div key={phase} className="space-y-3">
                        <h4 className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 w-max shadow-inner">{phase}</h4>
                        {phaseAnos.map((ano: any, i: number) => {
                          const isFlop = ano.type === 'FLOP';
                          const usersArray = ano.users || [];
                          const isMeReal = usersArray.includes(data.currentUserUsername);

                          return (
                            <div key={i} className={`flex flex-col p-3 rounded-2xl border relative overflow-hidden ${isFlop ? 'bg-rose-950/20 border-rose-900/30' : 'bg-indigo-950/20 border-indigo-900/30'} ${isMeReal ? 'ring-1 ring-yellow-500/50' : ''}`}>
                              {isMeReal && (
                                 <div className="absolute top-0 right-0 bg-yellow-500 text-slate-950 text-[8px] font-black uppercase px-2 py-1 rounded-bl-lg">Coinvolto!</div>
                              )}
                              <div className="flex justify-between items-start mb-2 mt-1">
                                 <div className="flex items-center gap-2">
                                    <span className="text-lg">{isFlop ? '📉' : '🦄'}</span>
                                    <div className="flex flex-col">
                                      <span className="text-[11px] font-black uppercase italic text-white">{ano.team}</span>
                                      <span className={`text-[9px] font-black uppercase tracking-wider ${isFlop ? 'text-rose-400' : 'text-indigo-400'}`}>{ano.msg}</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="pt-2 border-t border-slate-800/50">
                                 <p className="text-[10px] text-slate-300 font-medium leading-relaxed">
                                    <span className="text-slate-500 mr-1 uppercase font-black text-[8px] tracking-widest">Colpevoli:</span> 
                                    {usersArray.map((u: string, index: number) => (
                                       <span key={index} className={u === data.currentUserUsername ? 'text-yellow-500 font-bold' : ''}>
                                         {u}{index < usersArray.length - 1 ? ', ' : ''}
                                       </span>
                                    ))}
                                 </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}