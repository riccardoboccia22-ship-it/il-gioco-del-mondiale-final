'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { WORLD_CUP_PLAYERS, WORLD_CUP_GOALKEEPERS } from '@/lib/players';
import {
  Trophy, Star, LayoutGrid, ChevronDown, ChevronUp, Flame, CalendarDays,
  Award, Zap, Target, Shield, Goal, ArrowDownToLine, ArrowUpToLine, ShieldCheck, Lock, Activity, Search, Users, GitMerge, List, CheckCircle2, X
} from 'lucide-react';

const WORLD_CUP_START_DATE = new Date('2026-06-11T21:00:00+02:00');

// Punteggi assegnati per ogni fase
const STAGE_POINTS: { [key: string]: number } = { R32: 2, R16: 4, QF: 6, SF: 8, F: 10, WINNER: 20 };
const STAGE_CAPACITY: { [key: string]: number } = { R32: 32, R16: 16, QF: 8, SF: 4, F: 2, WINNER: 1 };
const STAGE_LABELS: Record<string, string> = { R32: 'Sedicesimi', R16: 'Ottavi', QF: 'Quarti', SF: 'Semifinali', F: 'Finale', WINNER: 'Campione' };

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

type BracketStageType = 'R32' | 'R16' | 'QF' | 'SF' | 'F' | 'WINNER';
type BracketMatch = { dbString: string, label: string }[];

const BRACKET_ROUNDS: { id: BracketStageType, title: string }[] = [
  { id: 'R32', title: 'SEDICESIMI' },
  { id: 'R16', title: 'OTTAVI' },
  { id: 'QF', title: 'QUARTI' },
  { id: 'SF', title: 'SEMIFINALI' },
  { id: 'F', title: 'FINALE' },
  { id: 'WINNER', title: 'CAMPIONE' }
];

const BRACKET_MATCHES: Record<Exclude<BracketStageType, 'WINNER'>, BracketMatch[]> = {
  R32: [
    [ { dbString: 'R32_SEDICESIMI_1E', label: '1° Gruppo E' }, { dbString: 'R32_SEDICESIMI_3M1', label: '3° Migliore' } ],
    [ { dbString: 'R32_SEDICESIMI_1I', label: '1° Gruppo I' }, { dbString: 'R32_SEDICESIMI_3M2', label: '3° Migliore' } ],
    [ { dbString: 'R32_SEDICESIMI_2A', label: '2° Gruppo A' }, { dbString: 'R32_SEDICESIMI_2B', label: '2° Gruppo B' } ],
    [ { dbString: 'R32_SEDICESIMI_1F', label: '1° Gruppo F' }, { dbString: 'R32_SEDICESIMI_2C', label: '2° Gruppo C' } ],
    [ { dbString: 'R32_SEDICESIMI_2K', label: '2° Gruppo K' }, { dbString: 'R32_SEDICESIMI_2L', label: '2° Gruppo L' } ],
    [ { dbString: 'R32_SEDICESIMI_1H', label: '1° Gruppo H' }, { dbString: 'R32_SEDICESIMI_2J', label: '2° Gruppo J' } ],
    [ { dbString: 'R32_SEDICESIMI_1D', label: '1° Gruppo D' }, { dbString: 'R32_SEDICESIMI_3M5', label: '3° Migliore' } ],
    [ { dbString: 'R32_SEDICESIMI_1G', label: '1° Gruppo G' }, { dbString: 'R32_SEDICESIMI_3M6', label: '3° Migliore' } ],
    [ { dbString: 'R32_SEDICESIMI_1C', label: '1° Gruppo C' }, { dbString: 'R32_SEDICESIMI_2F', label: '2° Gruppo F' } ],
    [ { dbString: 'R32_SEDICESIMI_2E', label: '2° Gruppo E' }, { dbString: 'R32_SEDICESIMI_2I', label: '2° Gruppo I' } ],
    [ { dbString: 'R32_SEDICESIMI_1A', label: '1° Gruppo A' }, { dbString: 'R32_SEDICESIMI_3M3', label: '3° Migliore' } ],
    [ { dbString: 'R32_SEDICESIMI_1L', label: '1° Gruppo L' }, { dbString: 'R32_SEDICESIMI_3M4', label: '3° Migliore' } ],
    [ { dbString: 'R32_SEDICESIMI_1J', label: '1° Gruppo J' }, { dbString: 'R32_SEDICESIMI_2H', label: '2° Gruppo H' } ],
    [ { dbString: 'R32_SEDICESIMI_2D', label: '2° Gruppo D' }, { dbString: 'R32_SEDICESIMI_2G', label: '2° Gruppo G' } ],
    [ { dbString: 'R32_SEDICESIMI_1B', label: '1° Gruppo B' }, { dbString: 'R32_SEDICESIMI_3M7', label: '3° Migliore' } ],
    [ { dbString: 'R32_SEDICESIMI_1K', label: '1° Gruppo K' }, { dbString: 'R32_SEDICESIMI_3M8', label: '3° Migliore' } ],
  ],
  R16: Array.from({length: 8}, (_, i) => [ { dbString: `R16_OTTAVI_V${(i*2)+1}`, label: `Vinc. Sedicesimi ${(i*2)+1}` }, { dbString: `R16_OTTAVI_V${(i*2)+2}`, label: `Vinc. Sedicesimi ${(i*2)+2}` } ]),
  QF: Array.from({length: 4}, (_, i) => [ { dbString: `QF_QUARTI_V${(i*2)+1}`, label: `Vinc. Ottavi ${(i*2)+1}` }, { dbString: `QF_QUARTI_V${(i*2)+2}`, label: `Vinc. Ottavi ${(i*2)+2}` } ]),
  SF: Array.from({length: 2}, (_, i) => [ { dbString: `SF_SEMIFINALI_V${(i*2)+1}`, label: `Vinc. Quarti ${(i*2)+1}` }, { dbString: `SF_SEMIFINALI_V${(i*2)+2}`, label: `Vinc. Quarti ${(i*2)+2}` } ]),
  F: [ [ { dbString: 'F_FINALE_1', label: 'Finalista 1' }, { dbString: 'F_FINALE_2', label: 'Finalista 2' } ] ]
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

const fetchAllRecords = async (table: string, orderCol1?: string, orderCol2?: string, orderCol3?: string) => {
  let result: any[] = [];
  let start = 0;
  const limit = 1000;
  while (true) {
    let query = supabase.from(table).select('*');
    if (orderCol1) query = query.order(orderCol1, { ascending: true });
    if (orderCol2) query = query.order(orderCol2, { ascending: true });
    if (orderCol3) query = query.order(orderCol3, { ascending: true });
    
    const { data, error } = await query.range(start, start + limit - 1);
    if (error || !data || data.length === 0) break;
    result.push(...data);
    if (data.length < limit) break;
    start += limit;
  }
  return result;
};

export default function TuttiPronosticiPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'GIRONI' | 'BRACKET' | 'BONUS' | 'STATS'>('BRACKET');
  const [gironiViewMode, setGironiViewMode] = useState<'CHRONO' | 'GROUP'>('CHRONO');
  const [bracketViewMode, setBracketViewMode] = useState<'TREE' | 'LIST'>('TREE');
  
  const [searchQuery, setSearchQuery] = useState('');

  const [data, setData] = useState<any>({
    currentUserUsername: '', profiles: [], matches: [], predictionsMap: {}, bracketMap: {}, bonusMap: {}, officialBonus: null, officialResults: [],
  });
  const [loading, setLoading] = useState(true);
  
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [expandedBonus, setExpandedBonus] = useState<string | null>(null);
  const [openDays, setOpenDays] = useState<{ [key: string]: boolean }>({});
  
  const [selectedNode, setSelectedNode] = useState<{team: string, users: any[], stage: string} | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState(''); 
  
  const [bracketScale, setBracketScale] = useState(1);
  const bracketContainerRef = useRef<HTMLDivElement>(null);

  const isStarted = new Date().getTime() > WORLD_CUP_START_DATE.getTime();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/'); return; }

        const { data: profile } = await supabase.from('profiles').select('full_name, username, id').eq('id', user.id).single();
        if (!profile || !profile.full_name) { router.push('/setup-profilo'); return; }

        const pData = await fetchAllRecords('profiles', 'id');
        const mData = await fetchAllRecords('matches', 'match_date');
        const obData = await fetchAllRecords('official_bracket', 'id');
        const ubData = await fetchAllRecords('user_bonus_answers', 'user_id');
        
        const prData = await fetchAllRecords('predictions', 'user_id', 'match_id');
        const brData = await fetchAllRecords('brackets', 'user_id', 'stage', 'team_name');

        const { data: offBo } = await supabase.from('official_bonuses').select('*').eq('id', '00000000-0000-0000-0000-000000000000').maybeSingle();

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
        ubData.forEach(b => bMap[b.user_id] = b);

        setData({
          currentUserUsername: profile.username,
          profiles: pData || [], matches: mData || [], predictionsMap: predMap,
          bracketMap: brackMap, officialResults: obData || [], officialBonus: offBo || null, bonusMap: bMap,
        });

        setOpenDays({});

      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchData();
  }, [router]);

  useEffect(() => {
    const handleResize = () => {
      if (activeTab === 'BRACKET' && bracketViewMode === 'TREE') {
        const screenWidth = window.innerWidth;
        const targetWidth = 1350; 
        
        if (screenWidth < targetWidth) {
          setBracketScale((screenWidth - 8) / targetWidth); 
        } else {
          setBracketScale(1);
        }
      }
    };
    
    if (!loading && activeTab === 'BRACKET') {
        handleResize();
        window.addEventListener('resize', handleResize);
    }
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab, bracketViewMode, loading]);

  const toggleDay = (dayName: string) => {
    setOpenDays((prev) => ({ ...prev, [dayName]: !prev[dayName] }));
  };

  const groupedByDay = useMemo(() => {
    const groupsMap: { [key: string]: { dateVal: number, matches: any[] } } = {};
    data.matches.forEach((m: any) => {
      let dayName = "Data da definire";
      let dVal = 0;
      if (m.match_date) {
        const d = new Date(m.match_date);
        dVal = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const dateStr = d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
        dayName = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
      }
      
      if (!groupsMap[dayName]) {
        groupsMap[dayName] = { dateVal: dVal, matches: [] };
      }
      groupsMap[dayName].matches.push(m);
    });

    return Object.entries(groupsMap)
      .map(([dayName, info]) => ({ dayName, dateVal: info.dateVal, matchesArray: info.matches }))
      .sort((a, b) => a.dateVal - b.dateVal);
  }, [data.matches]);

  const getFlagUrl = (team: string) => {
    const code = flagMap[team?.toLowerCase().trim()];
    return code ? `https://flagcdn.com/w40/${code}.png` : null;
  };

  const getMatchResultInfo = (pred: any, match: any) => {
    if (!pred || match.home_score_final === null || !match.is_finished) return { pts: 0, color: 'text-slate-500', bg: 'bg-slate-900 border-slate-800' };
      
    const ph = Number(pred.home_score), pa = Number(pred.away_score);
    const mh = Number(match.home_score_final), ma = Number(match.away_score_final);
    const pRes = ph > pa ? '1' : pa > ph ? '2' : 'X';
    const mRes = mh > ma ? '1' : ma > mh ? '2' : 'X';
    
    if (ph === mh && pa === ma) return { pts: 10, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_20px_rgba(52,211,153,0.2)]' };
    if (pRes === mRes && (ph === mh || pa === ma)) return { pts: 6, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/40' };
    if (pRes === mRes) return { pts: 4, color: 'text-amber-500', bg: 'bg-amber-600/10 border-amber-600/40' };
    if (ph === mh || pa === ma) return { pts: 2, color: 'text-slate-300', bg: 'bg-slate-800/50 border-slate-700' };
    return { pts: 0, color: 'text-rose-500', bg: 'bg-rose-950/20 border-rose-900/30 opacity-70' };
  };

  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return data.profiles;
    const q = searchQuery.toLowerCase();
    return data.profiles.filter((p: any) =>
      p.username?.toLowerCase().includes(q) ||
      p.full_name?.toLowerCase().includes(q)
    );
  }, [data.profiles, searchQuery]);

  const getAggregatedMatchPicks = (matchId: number) => {
    const agg: Record<string, { users: any[], predObj: any }> = {};
    filteredProfiles.forEach((p: any) => {
      const pred = data.predictionsMap[matchId]?.[p.id];
      const resKey = (pred && pred.home_score !== null && pred.away_score !== null) ? `${pred.home_score} - ${pred.away_score}` : 'Nessun pronostico';
      if (!agg[resKey]) agg[resKey] = { users: [], predObj: pred };
      agg[resKey].users.push(p);
    });
    return Object.entries(agg).sort((a, b) => b[1].users.length - a[1].users.length);
  };

  const getAggregatedBracketPicks = (stageId: string) => {
    const agg: Record<string, Set<any>> = {}; 
    filteredProfiles.forEach((p: any) => {
      const picks = (data.bracketMap[p.id] || []).filter((b: any) => normalizeStage(b.stage) === stageId);
      
      const uniqueTeams = new Set<string>();
      picks.forEach((pick: any) => {
         const cleanTeamName = cleanString(pick.team_name);
         if(cleanTeamName) uniqueTeams.add(cleanTeamName);
      });

      uniqueTeams.forEach(cleanTeamName => {
        const teamForDisplay = formatTeamName(cleanTeamName);
        if (teamForDisplay) {
            if (!agg[teamForDisplay]) agg[teamForDisplay] = new Set();
            agg[teamForDisplay].add(p);
        }
      });
    });
    
    return Object.entries(agg)
       .map(([team, usersSet]) => [team, Array.from(usersSet)])
       .sort((a: any, b: any) => b[1].length - a[1].length);
  };

  const getAggregatedBonusPicks = (bonusKey: string, isNumeric: boolean = false) => {
    const agg: Record<string, any[]> = {};
    filteredProfiles.forEach((p: any) => {
      let val = data.bonusMap[p.id]?.[bonusKey];
      val = val !== null && val !== undefined && val !== '' ? String(val).trim() : 'Nessuna Scelta';
      if (!agg[val]) agg[val] = [];
      agg[val].push(p);
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

  const splitArrayInHalf = (arr: any[]) => {
     const mid = Math.ceil(arr.length / 2);
     return [arr.slice(0, mid), arr.slice(mid)];
  };

  const getWinnerStats = () => {
    const filteredUserIds = new Set(filteredProfiles.map((p: any) => p.id));
    const allBrackets = (Object.values(data.bracketMap).flat() as any[]).filter(b => filteredUserIds.has(b.user_id));
    const winners = allBrackets.filter(b => b.stage === 'WINNER' && b.team_name);
    const total = winners.length;
    if (total === 0) return [];
    
    const counts: any = {};
    winners.forEach(w => {
      const t = formatTeamName(w.team_name);
      if (!counts[t]) counts[t] = { count: 0, users: new Set() };
      counts[t].count += 1;
      
      const p = filteredProfiles.find((prof: any) => prof.id === w.user_id);
      if (p && p.username) counts[t].users.add(p);
    });
    
    return Object.entries(counts)
      .map(([team, info]: any) => ({ 
        team, count: info.count, pct: Math.round((info.count / total) * 100), users: Array.from(info.users)
      }))
      .sort((a, b) => b.count - a.count || a.team.localeCompare(b.team));
  };

  const getAnomalies = () => {
    const allTeams = [...TOP_TEAMS, ...MID_TEAMS, ...LOW_TEAMS, ...SUPER_LOW_TEAMS];
    let anomalies: { user: any, type: string, team: string, msg: string, phase: string, phaseWeight: number }[] = [];

    filteredProfiles.forEach((p: any) => {
      if (!p || !p.id || !p.username) return;

      const uBrackets = data.bracketMap[p.id] || [];
      if (uBrackets.length === 0) return;
      
      const r32 = new Set(uBrackets.filter((b: any) => normalizeStage(b.stage) === 'R32').map((b: any) => cleanString(b.team_name)));
      const r16 = new Set(uBrackets.filter((b: any) => normalizeStage(b.stage) === 'R16').map((b: any) => cleanString(b.team_name)));
      const qf = new Set(uBrackets.filter((b: any) => normalizeStage(b.stage) === 'QF').map((b: any) => cleanString(b.team_name)));
      
      const hasR32 = r32.size > 31;
      const hasR16 = r16.size > 15;
      const hasQF = qf.size > 7;

      allTeams.forEach(t => {
          const teamF = cleanString(t);
          const originalTeam = formatTeamName(t);
          
          const inR32 = r32.has(teamF);
          const inR16 = r16.has(teamF);
          const inQF = qf.has(teamF);
          
          const inSF = uBrackets.some((b: any) => ['SF', 'F', 'WINNER'].includes(normalizeStage(b.stage)) && cleanString(b.team_name) === teamF);
          const inF = uBrackets.some((b: any) => ['F', 'WINNER'].includes(normalizeStage(b.stage)) && cleanString(b.team_name) === teamF);
          const inWinner = uBrackets.some((b: any) => normalizeStage(b.stage) === 'WINNER' && cleanString(b.team_name) === teamF);

          if (TOP_TEAMS.includes(t)) {
              if (hasR32 && !inR32) anomalies.push({ user: p, type: 'FLOP', team: originalTeam, msg: 'Fuori ai Gironi 📉', phase: 'Gironi', phaseWeight: 1 });
              else if (hasR16 && inR32 && !inR16) anomalies.push({ user: p, type: 'FLOP', team: originalTeam, msg: 'Fuori ai Sedicesimi 😱', phase: 'Sedicesimi', phaseWeight: 2 });
              else if (hasQF && inR16 && !inQF) anomalies.push({ user: p, type: 'FLOP', team: originalTeam, msg: 'Fuori agli Ottavi 😱', phase: 'Ottavi di finale', phaseWeight: 3 });
          }
          if (MID_TEAMS.includes(t)) {
              if (hasR32 && !inR32) anomalies.push({ user: p, type: 'FLOP', team: originalTeam, msg: 'Fuori ai Gironi 📉', phase: 'Gironi', phaseWeight: 1 });
          }
          if (LOW_TEAMS.includes(t)) {
              if (inWinner) anomalies.push({ user: p, type: 'FAVOLA', team: originalTeam, msg: 'Campione del Mondo! 🏆🦄', phase: 'Campione', phaseWeight: 7 });
              else if (inF) anomalies.push({ user: p, type: 'FAVOLA', team: originalTeam, msg: 'In Finale! 🤯', phase: 'Finale', phaseWeight: 6 });
              else if (inSF) anomalies.push({ user: p, type: 'FAVOLA', team: originalTeam, msg: 'In Semifinale! 🚀', phase: 'Semifinale', phaseWeight: 5 });
              else if (inQF) anomalies.push({ user: p, type: 'FAVOLA', team: originalTeam, msg: 'Raggiunge i Quarti! 🍷', phase: 'Quarti di finale', phaseWeight: 4 });
          }
          if (SUPER_LOW_TEAMS.includes(t)) {
              if (teamF === 'curacao' || teamF === 'r.d. congo' || teamF === 'bosnia') return;
              if (inWinner) anomalies.push({ user: p, type: 'FAVOLA', team: originalTeam, msg: 'Campione del Mondo! 🏆🦄', phase: 'Campione', phaseWeight: 7 });
              else if (inF) anomalies.push({ user: p, type: 'FAVOLA', team: originalTeam, msg: 'In Finale! 🤯', phase: 'Finale', phaseWeight: 6 });
              else if (inSF) anomalies.push({ user: p, type: 'FAVOLA', team: originalTeam, msg: 'In Semifinale! 🚀', phase: 'Semifinale', phaseWeight: 5 });
              else if (inQF) anomalies.push({ user: p, type: 'FAVOLA', team: originalTeam, msg: 'Raggiunge i Quarti! 🍷', phase: 'Quarti di finale', phaseWeight: 4 });
              else if (inR16) anomalies.push({ user: p, type: 'FAVOLA', team: originalTeam, msg: 'Arriva agli Ottavi! 🍿', phase: 'Ottavi di finale', phaseWeight: 3 });
              else if (inR32) anomalies.push({ user: p, type: 'FAVOLA', team: originalTeam, msg: 'Supera i Gironi! 🎉', phase: 'Sedicesimi', phaseWeight: 2 });
          }
      });
    });

    const groupedObj = anomalies.reduce((acc, ano) => {
      const key = `${ano.phaseWeight || 0}-${ano.type}-${ano.team}-${ano.msg}`;
      if (!acc[key]) acc[key] = { ...ano, users: new Set([JSON.stringify(ano.user)]) };
      else acc[key].users.add(JSON.stringify(ano.user));
      return acc;
    }, {} as any);
    
    return Object.values(groupedObj).map((o: any) => ({ ...o, users: Array.from(o.users).map((u:any) => JSON.parse(u)) })).sort((a: any, b: any) => a.phaseWeight - b.phaseWeight || a.type.localeCompare(b.type) || a.team.localeCompare(b.team));
  };

  const topCecchini = filteredProfiles.filter((p: any) => (p.exact_matches || 0) > 0).sort((a: any, b: any) => b.exact_matches - a.exact_matches);

  const getOfficialTeamForSlot = (dbString: string) => {
     const off = data.officialResults.find((o: any) => o.stage === dbString);
     return off ? formatTeamName(off.team_name) : null;
  };

  const getUsersWhoPickedTeam = (stage: string, teamName: string) => {
     const cleanName = cleanString(teamName);
     return filteredProfiles.filter((p: any) => {
        const uBrackets = data.bracketMap[p.id] || [];
        return uBrackets.some((b: any) => normalizeStage(b.stage) === stage && cleanString(b.team_name) === cleanName);
     });
  };

  const handleNodeClick = (team: string, users: any[], stage: string) => {
      setSelectedNode({ team, users, stage });
      setModalSearchQuery(''); 
  };

  const renderSlot = (pool: { dbString: string, label: string }, stage: string, isTop: boolean) => {
    const offTeam = getOfficialTeamForSlot(pool.dbString);
    let correctUsers: any[] = [];
    if (offTeam) {
       correctUsers = getUsersWhoPickedTeam(stage, offTeam);
    }

    return (
      <div className={`p-2 flex flex-col justify-center min-h-[85px] relative ${isTop ? 'border-b-2 border-slate-800/80' : ''}`}>
         {/* Squadra Ufficiale */}
         <div className="flex flex-col items-center justify-center gap-1.5 mb-2 px-1 w-full">
           {offTeam ? (
             <>
               <div className="relative">
                 {getFlagUrl(offTeam) ? <img src={getFlagUrl(offTeam)!} className="w-8 h-5 object-cover rounded shadow-md border border-slate-700 shrink-0" alt="" /> : <Shield size={20} className="text-slate-500 shrink-0"/>}
                 <CheckCircle2 size={12} className="text-emerald-400 absolute -bottom-1.5 -right-2 bg-slate-900 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
               </div>
               <span className="text-[10px] sm:text-[11px] font-black uppercase text-emerald-400 text-center leading-tight tracking-tight w-full drop-shadow-md whitespace-normal break-words line-clamp-2 mt-1">
                 {offTeam}
               </span>
             </>
           ) : (
             <>
               <div className="w-8 h-5 bg-slate-800/50 rounded border border-slate-700/50 shrink-0 shadow-inner"></div>
               <span className="text-[8px] font-bold uppercase text-slate-500 italic text-center leading-tight tracking-widest whitespace-normal break-words w-full mt-1">
                 {pool.label}
               </span>
             </>
           )}
         </div>

         {/* Pulsante Utenti */}
         <div className="w-full px-1">
           {offTeam ? (
             correctUsers.length > 0 ? (
               <button onClick={() => handleNodeClick(offTeam, correctUsers, stage)} className="group relative flex items-center justify-center gap-1.5 py-1 px-1 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-yellow-500 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all duration-300 w-full overflow-hidden active:scale-95">
                  <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Users size={10} className="text-slate-400 group-hover:text-yellow-400 transition-colors shrink-0 z-10"/>
                  <span className="text-[8px] font-black uppercase text-slate-300 group-hover:text-yellow-400 transition-colors z-10 tracking-wider">
                    {correctUsers.length} <span className="hidden sm:inline">scelte</span>
                  </span>
               </button>
             ) : (
               <div className="text-[7px] text-slate-500 italic uppercase font-black text-center w-full bg-slate-950/80 py-1.5 rounded-lg border border-slate-800/80">
                 Nessuno l&apos;ha presa
               </div>
             )
           ) : (
             <div className="text-[7px] text-slate-600 italic uppercase font-black text-center w-full bg-slate-950/50 py-1.5 rounded-lg border border-slate-800/50">
               In attesa
             </div>
           )}
         </div>
      </div>
    )
  };

  const renderMatchBlock = (match: { dbString: string, label: string }[], stageId: string, mIdx: number) => (
    <div key={mIdx} className="w-full bg-slate-900/80 backdrop-blur-md border-2 border-slate-700/80 rounded-2xl shadow-xl flex flex-col z-10 transition-all duration-300 hover:border-blue-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] hover:-translate-y-0.5">
       {match[0] && renderSlot(match[0], stageId, match[1] !== undefined)}
       {match[1] && renderSlot(match[1], stageId, false)}
    </div>
  );

  const leftStages = [
    { id: 'R32', title: 'SEDICESIMI', matches: (BRACKET_MATCHES.R32 || []).slice(0, 8) },
    { id: 'R16', title: 'OTTAVI', matches: (BRACKET_MATCHES.R16 || []).slice(0, 4) },
    { id: 'QF', title: 'QUARTI', matches: (BRACKET_MATCHES.QF || []).slice(0, 2) },
    { id: 'SF', title: 'SEMIFINALI', matches: (BRACKET_MATCHES.SF || []).slice(0, 1) },
  ];

  const rightStages = [
    { id: 'SF', title: 'SEMIFINALI', matches: (BRACKET_MATCHES.SF || []).slice(1, 2) },
    { id: 'QF', title: 'QUARTI', matches: (BRACKET_MATCHES.QF || []).slice(2, 4) },
    { id: 'R16', title: 'OTTAVI', matches: (BRACKET_MATCHES.R16 || []).slice(4, 8) },
    { id: 'R32', title: 'SEDICESIMI', matches: (BRACKET_MATCHES.R32 || []).slice(8, 16) },
  ];

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
            {isFinished && <span className="text-[8px] text-emerald-400 font-black uppercase italic bg-emerald-500/10 px-2 py-0.5 rounded-full sm:hidden">FINITA</span>}
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
            {isFinished && <span className="text-[8px] text-emerald-400 font-black uppercase italic bg-emerald-500/10 px-2 py-0.5 rounded-full">FINITA</span>}
          </div>
        </button>

        {isExpanded && (
          <div className="bg-slate-950/80 p-4 space-y-3 border-t border-slate-800/50">
            {getAggregatedMatchPicks(match.id).map(([resKey, group]: any, idx) => {
              const info = getMatchResultInfo(group.predObj, match);
              const isUnset = resKey === 'Nessun pronostico';
              const isMe = group.users.some((u: any) => u.username === data.currentUserUsername);
              
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
                  <div className="flex flex-wrap gap-2 pt-1">
                     {group.users.map((u: any, i: number) => (
                       <div key={i} className={`flex flex-col ${u.username === data.currentUserUsername ? 'text-yellow-500' : 'text-slate-400'}`}>
                         <span className="text-[11px] font-bold uppercase leading-none">{u.username}{(group.users.length - 1) > i ? ',' : ''}</span>
                         {u.full_name && <span className="text-[8.5px] sm:text-[9.5px] text-slate-500 font-bold uppercase tracking-wider leading-tight whitespace-normal break-words line-clamp-2 mt-0.5">{u.full_name}</span>}
                       </div>
                     ))}
                  </div>
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
          {"I risultati aggregati saranno sbloccati al fischio d'inizio del Mondiale."}
          <br/><br/><span className="text-yellow-500">11 Giugno 2026 ore 21:00</span>
        </p>
      </main>
  );

  const filteredModalUsers = selectedNode?.users.filter((u: any) => 
     u.username?.toLowerCase().includes(modalSearchQuery.toLowerCase()) || 
     u.full_name?.toLowerCase().includes(modalSearchQuery.toLowerCase())
  ) || [];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-32 font-sans overflow-x-hidden">
      <header className="text-center mb-8 pt-4">
        <h1 className="text-4xl font-black text-yellow-500 uppercase italic">Scouting Globale</h1>
        
        {/* BARRA DI RICERCA */}
        <div className="relative max-w-sm mx-auto mt-6 px-4 sm:px-0">
          <Search className="absolute left-8 sm:left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Cerca utente o nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-10 pr-4 text-xs font-black uppercase text-white placeholder-slate-600 outline-none focus:border-yellow-500 transition-colors shadow-inner"
          />
        </div>

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

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* --- 1. GIRONI --- */}
        {activeTab === 'GIRONI' && (
          <div className="space-y-6 max-w-2xl mx-auto">
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

             {gironiViewMode === 'CHRONO' && groupedByDay.map(({ dayName, matchesArray }) => {
               const isOpen = openDays[dayName];

               return (
                 <div 
                   key={dayName} 
                   className={`bg-slate-900/40 border-2 rounded-[2.5rem] overflow-hidden transition-all duration-300 ${isOpen ? 'bg-slate-900/80 shadow-2xl border-yellow-500/20' : 'border-slate-800'}`}
                 >
                   <button onClick={() => toggleDay(dayName)} className="w-full p-5 sm:p-6 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${isOpen ? 'bg-yellow-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                         <CalendarDays size={18} />
                       </div>
                       <div className="flex flex-col items-start">
                         <h2 className="font-black text-base sm:text-lg uppercase italic text-white tracking-tight text-left">{dayName}</h2>
                       </div>
                     </div>
                     <div className="flex items-center gap-3">
                       <span className="text-[10px] font-black text-slate-500 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 hidden sm:block">{matchesArray.length} Match</span>
                       <div className="p-2 sm:p-3">
                         {isOpen ? <ChevronUp className="text-yellow-500" /> : <ChevronDown className="text-slate-600" />}
                       </div>
                     </div>
                   </button>

                   {isOpen && (
                     <div className="p-4 pt-0 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                       {matchesArray.map((m: any) => renderMatchCard(m))}
                     </div>
                   )}
                 </div>
               );
             })}

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

        {/* --- 2. BRACKET DOPPIA VISTA --- */}
        {activeTab === 'BRACKET' && (
          <div className="space-y-6">
             <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 mb-6 max-w-sm mx-auto">
                <button
                  onClick={() => setBracketViewMode('TREE')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all ${
                    bracketViewMode === 'TREE' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  <GitMerge size={16} /> Tabellone
                </button>
                <button
                  onClick={() => setBracketViewMode('LIST')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all ${
                    bracketViewMode === 'LIST' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  <List size={16} /> Liste
                </button>
             </div>

             {/* VISTA 1: ALBERO CON SCALING PERFETTO */}
             {bracketViewMode === 'TREE' && (
               <div className="animate-in fade-in duration-500 bg-slate-900/40 sm:border border-slate-800 sm:rounded-[2rem] shadow-2xl py-6 overflow-hidden -mx-4 sm:mx-0 relative">
                 
                 <div className="text-center mb-6 px-4">
                    <h2 className="text-2xl font-black text-blue-400 italic tracking-tight uppercase">Tabellone Reale</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 leading-relaxed">
                      Il colpo d&apos;occhio su tutti i pronostici! ⚽
                    </p>
                 </div>

                 <div className="w-full flex justify-center overflow-hidden px-1" style={{ height: `${1000 * bracketScale}px` }}>
                    <div 
                      style={{ 
                        transform: `scale(${bracketScale})`, 
                        transformOrigin: 'top center', 
                        width: '1350px', 
                        height: '1000px' 
                      }} 
                      className="flex flex-row items-stretch justify-center gap-4 pt-4"
                    >
                       
                       {/* LATO SINISTRO */}
                       <div className="flex gap-4 h-full">
                         {leftStages.map(stage => (
                           <div key={`left-${stage.id}`} className="flex flex-col w-[130px] shrink-0 h-full">
                             <div className="h-14 flex flex-col items-center justify-center shrink-0 mb-2">
                                <h3 className="text-[10px] font-black uppercase text-blue-400 tracking-widest bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-500/30 shadow-md text-center leading-tight">
                                  {stage.title} <br/><span className="text-[8px] opacity-70 block mt-0.5">(+{STAGE_POINTS[stage.id]} PT)</span>
                                </h3>
                             </div>
                             <div className="flex-1 flex flex-col justify-around gap-2 pb-2">
                               {stage.matches.map((m, i) => renderMatchBlock(m as any, stage.id, i))}
                             </div>
                           </div>
                         ))}
                       </div>

                       {/* COLONNA CENTRALE (FINALE E VINCITORE) */}
                       <div className="flex flex-col items-center w-[160px] shrink-0 h-full gap-10 pt-16">
                          {/* CAMPIONE */}
                          <div className="w-full flex flex-col items-center">
                            <div className="bg-gradient-to-b from-yellow-900/40 to-slate-950 border-2 border-yellow-500/50 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.15)] w-full flex flex-col overflow-hidden transition-all hover:border-yellow-400 hover:-translate-y-0.5">
                              <div className="bg-yellow-500/10 py-1.5 flex flex-col items-center border-b border-yellow-500/30">
                                <Trophy size={18} className="text-yellow-500 drop-shadow-md mb-0.5" />
                                <span className="text-[8px] font-black uppercase text-yellow-500 tracking-[0.2em]">Campione <span className="opacity-70 ml-1">(+{STAGE_POINTS.WINNER} PT)</span></span>
                              </div>
                              {renderSlot({ dbString: 'WINNER', label: 'Vincitore' }, 'WINNER', false)}
                            </div>
                          </div>

                          {/* FINALE */}
                          <div className="w-full flex flex-col items-center">
                            <div className="text-center mb-2 z-10">
                               <h3 className="text-[10px] font-black uppercase text-blue-400 tracking-widest bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-500/30 shadow-md text-center leading-tight">
                                 FINALE <br/><span className="opacity-70 text-[8px] mt-0.5 block">(+{STAGE_POINTS.F} PT)</span>
                               </h3>
                            </div>
                            <div className="w-full bg-slate-900/80 backdrop-blur-md border-2 border-slate-700/80 rounded-xl overflow-hidden shadow-xl flex flex-col transition-all duration-300 hover:border-blue-500 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] hover:-translate-y-0.5">
                               {(BRACKET_MATCHES.F && BRACKET_MATCHES.F[0] && BRACKET_MATCHES.F[0][0]) ? renderSlot(BRACKET_MATCHES.F[0][0], 'F', true) : null}
                               <div className="h-px w-full bg-slate-800"></div>
                               {(BRACKET_MATCHES.F && BRACKET_MATCHES.F[0] && BRACKET_MATCHES.F[0][1]) ? renderSlot(BRACKET_MATCHES.F[0][1], 'F', false) : null}
                            </div>
                          </div>
                       </div>

                       {/* LATO DESTRO */}
                       <div className="flex gap-4 h-full">
                         {rightStages.map(stage => (
                           <div key={`right-${stage.id}`} className="flex flex-col w-[130px] shrink-0 h-full">
                             <div className="h-14 flex flex-col items-center justify-center shrink-0 mb-2">
                                <h3 className="text-[10px] font-black uppercase text-blue-400 tracking-widest bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-500/30 shadow-md text-center leading-tight">
                                  {stage.title} <br/><span className="opacity-70 text-[8px] mt-0.5 block">(+{STAGE_POINTS[stage.id]} PT)</span>
                                </h3>
                             </div>
                             <div className="flex-1 flex flex-col justify-around gap-2 pb-2">
                               {stage.matches.map((m, i) => renderMatchBlock(m as any, stage.id, i))}
                             </div>
                           </div>
                         ))}
                       </div>

                    </div>
                 </div>
               </div>
             )}

             {/* VISTA 2: LISTE (ACCORDION) */}
             {bracketViewMode === 'LIST' && (
               <div className="max-w-2xl mx-auto space-y-6">
                 {BRACKET_ROUNDS.map((stg) => {
                    const isExpanded = expandedStage === stg.id;
                    const officialTeamsInStage = data.officialResults.filter((off: any) => normalizeStage(off.stage) === stg.id);
                    
                    const expectedCapacity = STAGE_CAPACITY[stg.id] || 99;
                    let isStageFull = false;
                    if (officialTeamsInStage.length >= expectedCapacity) {
                       isStageFull = true;
                    }

                    const aggregatedPicks = getAggregatedBracketPicks(stg.id).map(([team, users]: any) => {
                       const isCorrect = officialTeamsInStage.some((off: any) => cleanString(off.team_name) === cleanString(team));
                       const isWrong = isStageFull && !isCorrect;
                       return { team, users, isCorrect, isWrong };
                    });

                    aggregatedPicks.sort((a, b) => {
                       if (a.isCorrect && !b.isCorrect) return -1;
                       if (!a.isCorrect && b.isCorrect) return 1;
                       if (a.isWrong && !b.isWrong) return 1; 
                       if (!a.isWrong && b.isWrong) return -1;
                       return b.users.length - a.users.length;
                    });

                    return (
                      <div key={stg.id} className={`bg-slate-900/40 border rounded-[2rem] overflow-hidden transition-all shadow-xl ${isExpanded ? 'border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-slate-800'}`}>
                        <button onClick={() => setExpandedStage(isExpanded ? null : stg.id)} className="w-full p-6 flex items-center justify-between hover:bg-slate-800/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-blue-500/10 text-blue-500 border border-blue-500/20">
                              <Trophy size={18} />
                            </div>
                            <span className="font-black uppercase italic text-sm text-left">{stg.title} <span className="opacity-70 ml-1 text-[10px]">(+{STAGE_POINTS[stg.id]} PT)</span></span>
                          </div>
                          <ChevronDown className={`transition-transform ${isExpanded ? 'rotate-180 text-blue-500' : 'text-slate-500'}`} />
                        </button>
                        
                        {isExpanded && (
                          <div className="p-5 bg-slate-950/80 space-y-3 border-t border-slate-800/50">
                            {aggregatedPicks.map(({ team, users, isCorrect, isWrong }: any, idx) => {
                              const isMe = users.some((u: any) => u.username === data.currentUserUsername);
                              const flag = getFlagUrl(team);

                              return (
                                <div key={idx} className={`flex flex-col p-4 rounded-2xl border transition-all relative overflow-hidden ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/50' : isWrong ? 'bg-rose-950/20 border-rose-900/30 opacity-60' : 'bg-slate-900 border-slate-800'} ${isMe ? 'ring-1 ring-yellow-500/50' : ''}`}>
                                  
                                  {isMe && (
                                     <div className="absolute top-0 right-0 bg-yellow-500 text-slate-950 text-[8px] font-black uppercase px-2 py-1 rounded-bl-lg z-10">La tua scelta</div>
                                  )}

                                  <div className="flex justify-between items-center mb-2 border-b border-slate-800/50 pb-2 mt-1">
                                     <div className="flex items-center gap-3">
                                       {flag ? <img src={flag} className={`w-6 h-4 rounded-sm object-cover border border-slate-700 ${isWrong ? 'grayscale opacity-50 border-rose-500/50' : ''}`} alt=""/> : <Shield size={16} className={isWrong ? "text-rose-500/50" : "text-slate-500"}/>}
                                       <span className={`text-sm font-black uppercase italic tracking-tight whitespace-normal break-words line-clamp-2 ${isCorrect ? 'text-emerald-400' : isWrong ? 'text-rose-400 line-through decoration-rose-500/50' : 'text-white'}`}>{team}</span>
                                       {isCorrect && <span className="text-[9px] font-black bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded-md ml-1 flex items-center gap-0.5 shadow-[0_0_10px_rgba(16,185,129,0.5)]">🎯 +{STAGE_POINTS[stg.id]} PT</span>}
                                       {isWrong && <span className="text-[8px] font-black bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded-md ml-1 uppercase">Eliminata ❌</span>}
                                     </div>
                                     <div className="flex items-center gap-1.5 text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shadow-inner">
                                        <Users size={12} /> <span className="text-[10px] font-black">{users.length}</span>
                                     </div>
                                  </div>
                                  <div className="flex flex-wrap gap-2 pt-1">
                                     {users.map((u: any, i: number) => (
                                       <div key={i} className={`flex flex-col ${u.username === data.currentUserUsername ? 'text-yellow-500' : 'text-slate-400'}`}>
                                         <span className="text-[11px] font-bold uppercase leading-none">{u.username}{(users.length - 1) > i ? ',' : ''}</span>
                                         {u.full_name && <span className="text-[8.5px] sm:text-[9.5px] text-slate-500 font-bold uppercase tracking-wider leading-tight whitespace-normal break-words line-clamp-2 mt-0.5">{u.full_name}</span>}
                                       </div>
                                     ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                 })}
               </div>
             )}
          </div>
        )}

        {/* --- 3. BONUS (ACCORDION SENZA LUCCHETTI) --- */}
        {activeTab === 'BONUS' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            {[
              { id: 'mvp_world_cup', label: 'MVP Mondiale', icon: <Trophy size={16}/>, pts: 10, type: 'PLAYER', phase: 'FINAL' },
              { id: 'top_scorer', label: 'Capocannoniere', icon: <Award size={16}/>, pts: 10, type: 'PLAYER', phase: 'FINAL' },
              { id: 'best_goalkeeper', label: 'Miglior Portiere', icon: <ShieldCheck size={16}/>, pts: 10, type: 'PLAYER', phase: 'FINAL' },
              { id: 'high_scoring_match', label: 'Match + Gol', icon: <Flame size={16}/>, pts: 5, type: 'MATCH', phase: 'GROUPS' },
              { id: 'highest_scoring_group', label: 'Girone + Gol', icon: <ArrowUpToLine size={16}/>, pts: 5, type: 'GROUP', phase: 'GROUPS' },
              { id: 'lowest_scoring_group', label: 'Girone - Gol', icon: <ArrowDownToLine size={16}/>, pts: 5, type: 'GROUP', phase: 'GROUPS' },
              { id: 'total_own_goals', label: 'Totale Autogol', icon: <Target size={16}/>, pts: 3, type: 'NUMBER', phase: 'FINAL' },
              { id: 'total_penalties', label: 'Totale Rigori', icon: <Goal size={16}/>, pts: 3, type: 'NUMBER', phase: 'FINAL' },
              { id: 'total_red_cards', label: 'Totale Rossi', icon: <Zap size={16}/>, pts: 3, type: 'NUMBER', phase: 'FINAL' },
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
                      <span className="font-black uppercase italic text-sm text-left text-white">{bonus.label} <span className="opacity-70 ml-1 text-[10px]">(+{bonus.pts} PT)</span></span>
                    </div>
                    <ChevronDown className={`transition-transform ${isExpanded ? 'rotate-180 text-purple-500' : 'text-slate-500'}`} />
                  </button>
                  
                  {isExpanded && (
                    <div className="p-5 bg-slate-950/80 space-y-3 border-t border-slate-800/50">
                        {offVal && (
                           <div className="mb-4 bg-purple-950/30 border border-purple-500/30 p-3 rounded-xl flex flex-col items-center justify-center text-center shadow-inner">
                              <span className="text-[9px] text-purple-400 font-black uppercase tracking-widest mb-1">Dato Ufficiale</span>
                              <span className="text-white font-black uppercase italic">{offVal} {bonus.type === 'NUMBER' && 'Nel Torneo'}</span>
                           </div>
                        )}
                        {getAggregatedBonusPicks(bonus.id, bonus.type === 'NUMBER').map(([ans, users]: any, idx) => {
                          const isUnset = ans === 'Nessuna Scelta';
                          
                          let isMathematicallyWrong = false;
                          let isCorrect = false;

                          if (!isUnset && offVal != null && offVal !== 'TBD' && String(offVal).trim() !== '') {
                             if (bonus.type === 'NUMBER') {
                                const numOff = Number(offVal);
                                const numAns = Number(ans);
                                if (numAns === numOff) {
                                   isCorrect = true;
                                } else if (numOff > numAns) {
                                   isMathematicallyWrong = true;
                                }
                             } else {
                                if (cleanString(String(ans)) === cleanString(String(offVal))) {
                                   isCorrect = true;
                                }
                             }
                          }
                          
                          const isWrong = offVal != null && offVal !== 'TBD' && String(offVal).trim() !== '' && !isCorrect && !isUnset;
                          
                          const isMe = users.some((u: any) => u.username === data.currentUserUsername);

                          let flagElement = null;
                          if (!isUnset) {
                            if (bonus.type === 'PLAYER') {
                              const allPlayers = [...(WORLD_CUP_PLAYERS || []), ...(WORLD_CUP_GOALKEEPERS || [])];
                              const player = allPlayers.find(p => cleanString(p.name) === cleanString(ans));
                              const f = player ? getFlagUrl(player.country) : null;
                              flagElement = f ? <img src={f} className={`w-5 h-3.5 object-cover rounded-[2px] border border-slate-700 shrink-0 ${isWrong ? 'grayscale opacity-60' : ''}`} alt=""/> : <Shield size={14} className="text-slate-600 shrink-0"/>;
                            } 
                            else if (bonus.type === 'MATCH' && ans.includes('-')) {
                              const [t1, t2] = splitArrayInHalf(ans.split(/\s*-\s*/));
                              const f1 = getFlagUrl(t1[0]);
                              const f2 = getFlagUrl(t2[0]);
                              flagElement = (
                                <div className={`flex items-center gap-1 shrink-0 ${isWrong ? 'grayscale opacity-60' : ''}`}>
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
                                  <div className={`flex items-center gap-0.5 shrink-0 ${isWrong ? 'grayscale opacity-60' : ''}`}>
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
                                ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                                : isUnset 
                                  ? 'bg-slate-900/30 border-slate-800/50 opacity-60' 
                                  : (isWrong || isMathematicallyWrong)
                                    ? 'bg-rose-950/10 border-rose-950/40 opacity-70'
                                    : 'bg-slate-900 border-slate-800'
                            } ${isMe && !isUnset ? 'ring-1 ring-yellow-500/50' : ''}`}>
                              
                              {isMe && !isUnset && (
                                 <div className="absolute top-0 right-0 bg-yellow-500 text-slate-950 text-[8px] font-black uppercase px-2 py-1 rounded-bl-lg z-10">La tua scelta</div>
                              )}

                              <div className="flex justify-between items-center mb-2 border-b border-slate-800/50 pb-2 mt-1">
                                 <div className="flex items-center gap-2.5 min-w-0">
                                   {flagElement}
                                   <span className={`text-[11px] font-black uppercase italic tracking-tight truncate ${
                                     isCorrect 
                                       ? 'text-emerald-400' 
                                       : isUnset 
                                         ? 'text-slate-500' 
                                         : (isWrong || isMathematicallyWrong)
                                           ? 'text-rose-400 line-through decoration-rose-500/50'
                                           : 'text-white'
                                   }`}>{ans}</span>
                                   
                                   {isCorrect && <span className="text-[9px] font-black bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded-md ml-1 flex items-center gap-0.5 shadow-[0_0_10px_rgba(16,185,129,0.5)] whitespace-nowrap">🎯 +{bonus.pts} PT</span>}
                                   {(isWrong || isMathematicallyWrong) && <span className="text-[8px] font-black bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded-md ml-1 tracking-wider uppercase whitespace-nowrap">Sbagliato ❌</span>}
                                   {offVal !== 'TBD' && !offVal && !isUnset && <span className="text-[8px] font-black bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md ml-1 tracking-wider uppercase whitespace-nowrap border border-slate-700">IN ATTESA ⏳</span>}
                                 </div>
                                 <div className="flex items-center gap-1.5 text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shadow-inner shrink-0 ml-2">
                                    <Users size={12} /> <span className="text-[10px] font-black">{users.length}</span>
                                 </div>
                              </div>
                              <div className="flex flex-wrap gap-2 pt-1">
                                 {users.map((u: any, i: number) => (
                                   <div key={i} className={`flex flex-col ${u.username === data.currentUserUsername ? 'text-yellow-500' : 'text-slate-400'}`}>
                                     <span className="text-[11px] font-bold uppercase leading-none">{u.username}{(users.length - 1) > i ? ',' : ''}</span>
                                     {u.full_name && <span className="text-[8.5px] sm:text-[9.5px] text-slate-500 font-bold uppercase tracking-wider leading-tight whitespace-normal break-words line-clamp-2 mt-0.5">{u.full_name}</span>}
                                   </div>
                                 ))}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* --- 4. STATS --- */}
        {activeTab === 'STATS' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
            
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-5 shadow-2xl">
              <h2 className="text-sm font-black text-yellow-500 uppercase italic tracking-tight mb-4 flex items-center gap-2 border-b border-slate-800/50 pb-2">
                <Trophy size={16} /> Scelte Campione del Mondo
              </h2>
              <div className="space-y-3">
                {(() => {
                  const winnerStats = getWinnerStats();
                  if (winnerStats.length === 0) return <p className="text-xs text-slate-500 font-bold uppercase italic text-center py-4">Nessun dato disponibile</p>;
                  
                  return winnerStats.map((w: any) => {
                    const isMe = w.users.some((u: any) => u.username === data.currentUserUsername);
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
                         <div className="flex flex-wrap gap-2 pt-1">
                            {w.users.map((u: any, i: number) => (
                               <div key={i} className={`flex flex-col ${u.username === data.currentUserUsername ? 'text-yellow-500' : 'text-slate-400'}`}>
                                 <span className="text-[10px] font-bold uppercase leading-none">{u.username}{(w.users.length - 1) > i ? ',' : ''}</span>
                                 {u.full_name && <span className="text-[8.5px] sm:text-[9.5px] text-slate-500 font-bold uppercase tracking-wider leading-tight whitespace-normal break-words line-clamp-2 mt-0.5">{u.full_name}</span>}
                               </div>
                            ))}
                         </div>
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
                    <div className="flex flex-col">
                       <span className={`text-xs font-black uppercase italic truncate pr-2 ${p.username === data.currentUserUsername ? 'text-emerald-400' : 'text-white'}`}>{p.username} {p.username === data.currentUserUsername && '(TU)'}</span>
                       {p.full_name && <span className="text-[8.5px] sm:text-[9.5px] text-slate-500 font-bold uppercase tracking-wider leading-tight whitespace-normal break-words line-clamp-2 mt-0.5">{p.full_name}</span>}
                    </div>
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
                          const isMeReal = usersArray.some((u: any) => u.username === data.currentUserUsername);

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
                                 <div className="flex flex-wrap gap-2 pt-1 items-center">
                                    <span className="text-slate-500 mr-1 uppercase font-black text-[8px] tracking-widest">Colpevoli:</span> 
                                    {usersArray.map((u: any, index: number) => (
                                       <div key={index} className={`flex flex-col ${u.username === data.currentUserUsername ? 'text-yellow-500' : 'text-slate-400'}`}>
                                         <span className="text-[10px] font-bold uppercase leading-none">{u.username}{(usersArray.length - 1) > index ? ',' : ''}</span>
                                         {u.full_name && <span className="text-[8.5px] sm:text-[9.5px] text-slate-500 font-bold uppercase tracking-wider leading-tight whitespace-normal break-words line-clamp-2 mt-0.5">{u.full_name}</span>}
                                       </div>
                                    ))}
                                 </div>
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

      {/* --- MODAL DETTAGLIO UTENTI NEL TABELLONE --- */}
      {selectedNode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative">
            
            <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 p-2 bg-slate-950 rounded-full text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors">
              <X size={18} strokeWidth={3} />
            </button>

            <div className="flex flex-col items-start mb-4 border-b border-slate-800/50 pb-4 pr-8">
              <div className="flex items-center gap-3 mb-2">
                 {getFlagUrl(selectedNode.team) ? <img src={getFlagUrl(selectedNode.team)!} className="w-8 h-5 object-cover rounded shadow-md border border-slate-700" alt=""/> : <Shield size={20} className="text-slate-500"/>}
                 <h3 className="text-xl font-black text-white uppercase italic tracking-tight leading-none">{selectedNode.team}</h3>
              </div>
              <span className="text-[9px] text-blue-400 font-black uppercase tracking-widest bg-blue-950/30 px-2 py-1 rounded-md border border-blue-500/20">
                Fase: {STAGE_LABELS[selectedNode.stage]}
              </span>
            </div>

            {/* BARRA DI RICERCA NEL MODAL */}
            <div className="mb-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input
                type="text"
                placeholder="Cerca utente..."
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-[10px] font-black uppercase text-white placeholder-slate-600 outline-none focus:border-yellow-500 transition-colors shadow-inner"
              />
            </div>
            
            <div className="flex items-center gap-2 mb-3">
               <Users size={14} className="text-slate-500" />
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                 {filteredModalUsers.length} Scelt{filteredModalUsers.length === 1 ? 'a' : 'e'}:
               </p>
            </div>
            
            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {filteredModalUsers.map((u: any, i: number) => (
                <div key={i} className={`flex flex-col p-3 rounded-xl border transition-colors ${u.username === data.currentUserUsername ? 'bg-yellow-500/10 border-yellow-500/30 ring-1 ring-yellow-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}>
                  <span className={`text-sm font-black uppercase italic ${u.username === data.currentUserUsername ? 'text-yellow-500' : 'text-white'}`}>{u.username}</span>
                  {u.full_name && <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{u.full_name}</span>}
                </div>
              ))}
              
              {filteredModalUsers.length === 0 && (
                <p className="text-[10px] font-black uppercase text-slate-500 text-center py-4">Nessun utente trovato</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}