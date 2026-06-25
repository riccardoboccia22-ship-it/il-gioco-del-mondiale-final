'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Shield, ArrowLeft, Loader2, Trophy, LayoutGrid } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Mappa bandiere unificata e robusta
const flagMap: { [key: string]: string } = {
  'algeria': 'dz', 'arabia saudita': 'sa', 'argentina': 'ar', 'australia': 'au', 'austria': 'at',
  'belgio': 'be', 'bosnia ed erzegovina': 'ba', 'bosnia erzegovina': 'ba',
  'brasile': 'br', 'canada': 'ca', 'capo verde': 'cv', 'colombia': 'co', 'corea del sud': 'kr', 
  'costa d\'avorio': 'ci', 'croazia': 'hr', 'curaçao': 'cw', 'curacao': 'cw',
  'ecuador': 'ec', 'egitto': 'eg', 'francia': 'fr', 'germania': 'de', 'ghana': 'gh', 'giappone': 'jp', 
  'giordania': 'jo', 'haiti': 'ht', 'inghilterra': 'gb-eng', 'iran': 'ir', 'iraq': 'iq', 'marocco': 'ma', 
  'messico': 'mx', 'norvegia': 'no', 'nuova zelanda': 'nz', 'olanda': 'nl', 'panama': 'pa', 'paraguay': 'py',
  'portogallo': 'pt', 'qatar': 'qa', 'repubblica ceca': 'cz', 
  'repubblica democratica del congo': 'cd', 'congo': 'cd',
  'scozia': 'gb-sct', 'senegal': 'sn', 'spagna': 'es', 'stati uniti': 'us', 'usa': 'us',
  'sudafrica': 'za', 'svezia': 'se', 'svizzera': 'ch', 'tunisia': 'tn', 'turchia': 'tr', 
  'uruguay': 'uy', 'uzbekistan': 'uz'
};

const tournamentGroups = [
  { name: 'Gruppo A', teams: ['Messico', 'Sudafrica', 'Corea del Sud', 'Repubblica Ceca'] },
  { name: 'Gruppo B', teams: ['Canada', 'Svizzera', 'Qatar', 'Bosnia Erzegovina'] },
  { name: 'Gruppo C', teams: ['Brasile', 'Marocco', 'Haiti', 'Scozia'] },
  { name: 'Gruppo D', teams: ['Usa', 'Australia', 'Paraguay', 'Turchia'] },
  { name: 'Gruppo E', teams: ['Germania', "Costa D'Avorio", 'Ecuador', 'Curacao'] },
  { name: 'Gruppo F', teams: ['Olanda', 'Svezia', 'Giappone', 'Tunisia'] },
  { name: 'Gruppo G', teams: ['Belgio', 'Iran', 'Egitto', 'Nuova Zelanda'] },
  { name: 'Gruppo H', teams: ['Spagna', 'Uruguay', 'Arabia Saudita', 'Capo Verde'] },
  { name: 'Gruppo I', teams: ['Francia', 'Senegal', 'Norvegia', 'Iraq'] },
  { name: 'Gruppo J', teams: ['Argentina', 'Austria', 'Algeria', 'Giordania'] },
  { name: 'Gruppo K', teams: ['Portogallo', 'Colombia', 'Uzbekistan', 'Repubblica Democratica del Congo'] },
  { name: 'Gruppo L', teams: ['Inghilterra', 'Croazia', 'Ghana', 'Panama'] },
];

const BRACKET_ROUNDS = [
  { id: 'R32', title: 'Sedicesimi', matches: 16 },
  { id: 'R16', title: 'Ottavi', matches: 8 },
  { id: 'QF', title: 'Quarti', matches: 4 },
  { id: 'SF', title: 'Semifinali', matches: 2 },
  { id: 'F', title: 'Finale', matches: 1 }
];

// FIX: ACCOPPIAMENTI R32 CORRETTI SECONDO IL REGOLAMENTO UFFICIALE FIFA 2026
// Ordinati visivamente per incastrarsi in modo perfetto in ottavi e quarti
const BRACKET_MATCHES: Record<string, { dbString: string, label: string }[][]> = {
  R32: [
    // --- PARTE ALTA DEL TABELLONE ---
    [ { dbString: 'R32_SEDICESIMI_1E', label: '1° Gruppo E' }, { dbString: 'R32_SEDICESIMI_3M1', label: '3° Migliore (Slot 1)' } ], // Match 74
    [ { dbString: 'R32_SEDICESIMI_1I', label: '1° Gruppo I' }, { dbString: 'R32_SEDICESIMI_3M2', label: '3° Migliore (Slot 2)' } ], // Match 77
    [ { dbString: 'R32_SEDICESIMI_2A', label: '2° Gruppo A' }, { dbString: 'R32_SEDICESIMI_2B', label: '2° Gruppo B' } ], // Match 73
    [ { dbString: 'R32_SEDICESIMI_1F', label: '1° Gruppo F' }, { dbString: 'R32_SEDICESIMI_2C', label: '2° Gruppo C' } ], // Match 75
    [ { dbString: 'R32_SEDICESIMI_2K', label: '2° Gruppo K' }, { dbString: 'R32_SEDICESIMI_2L', label: '2° Gruppo L' } ], // Match 83
    [ { dbString: 'R32_SEDICESIMI_1H', label: '1° Gruppo H' }, { dbString: 'R32_SEDICESIMI_2J', label: '2° Gruppo J' } ], // Match 84
    [ { dbString: 'R32_SEDICESIMI_1D', label: '1° Gruppo D' }, { dbString: 'R32_SEDICESIMI_3M5', label: '3° Migliore (Slot 5)' } ], // Match 81
    [ { dbString: 'R32_SEDICESIMI_1G', label: '1° Gruppo G' }, { dbString: 'R32_SEDICESIMI_3M6', label: '3° Migliore (Slot 6)' } ], // Match 82
    // --- PARTE BASSA DEL TABELLONE ---
    [ { dbString: 'R32_SEDICESIMI_1C', label: '1° Gruppo C' }, { dbString: 'R32_SEDICESIMI_2F', label: '2° Gruppo F' } ], // Match 76
    [ { dbString: 'R32_SEDICESIMI_2E', label: '2° Gruppo E' }, { dbString: 'R32_SEDICESIMI_2I', label: '2° Gruppo I' } ], // Match 78
    [ { dbString: 'R32_SEDICESIMI_1A', label: '1° Gruppo A' }, { dbString: 'R32_SEDICESIMI_3M3', label: '3° Migliore (Slot 3)' } ], // Match 79
    [ { dbString: 'R32_SEDICESIMI_1L', label: '1° Gruppo L' }, { dbString: 'R32_SEDICESIMI_3M4', label: '3° Migliore (Slot 4)' } ], // Match 80
    [ { dbString: 'R32_SEDICESIMI_1J', label: '1° Gruppo J' }, { dbString: 'R32_SEDICESIMI_2H', label: '2° Gruppo H' } ], // Match 86
    [ { dbString: 'R32_SEDICESIMI_2D', label: '2° Gruppo D' }, { dbString: 'R32_SEDICESIMI_2G', label: '2° Gruppo G' } ], // Match 88
    [ { dbString: 'R32_SEDICESIMI_1B', label: '1° Gruppo B' }, { dbString: 'R32_SEDICESIMI_3M7', label: '3° Migliore (Slot 7)' } ], // Match 85
    [ { dbString: 'R32_SEDICESIMI_1K', label: '1° Gruppo K' }, { dbString: 'R32_SEDICESIMI_3M8', label: '3° Migliore (Slot 8)' } ], // Match 87
  ],
  R16: [
    [ { dbString: 'R16_OTTAVI_V1', label: 'Vinc. Sedicesimi 1' }, { dbString: 'R16_OTTAVI_V2', label: 'Vinc. Sedicesimi 2' } ],
    [ { dbString: 'R16_OTTAVI_V3', label: 'Vinc. Sedicesimi 3' }, { dbString: 'R16_OTTAVI_V4', label: 'Vinc. Sedicesimi 4' } ],
    [ { dbString: 'R16_OTTAVI_V5', label: 'Vinc. Sedicesimi 5' }, { dbString: 'R16_OTTAVI_V6', label: 'Vinc. Sedicesimi 6' } ],
    [ { dbString: 'R16_OTTAVI_V7', label: 'Vinc. Sedicesimi 7' }, { dbString: 'R16_OTTAVI_V8', label: 'Vinc. Sedicesimi 8' } ],
    [ { dbString: 'R16_OTTAVI_V9', label: 'Vinc. Sedicesimi 9' }, { dbString: 'R16_OTTAVI_V10', label: 'Vinc. Sedicesimi 10' } ],
    [ { dbString: 'R16_OTTAVI_V11', label: 'Vinc. Sedicesimi 11' }, { dbString: 'R16_OTTAVI_V12', label: 'Vinc. Sedicesimi 12' } ],
    [ { dbString: 'R16_OTTAVI_V13', label: 'Vinc. Sedicesimi 13' }, { dbString: 'R16_OTTAVI_V14', label: 'Vinc. Sedicesimi 14' } ],
    [ { dbString: 'R16_OTTAVI_V15', label: 'Vinc. Sedicesimi 15' }, { dbString: 'R16_OTTAVI_V16', label: 'Vinc. Sedicesimi 16' } ]
  ],
  QF: [
    [ { dbString: 'QF_QUARTI_V1', label: 'Vinc. Ottavi 1' }, { dbString: 'QF_QUARTI_V2', label: 'Vinc. Ottavi 2' } ],
    [ { dbString: 'QF_QUARTI_V3', label: 'Vinc. Ottavi 3' }, { dbString: 'QF_QUARTI_V4', label: 'Vinc. Ottavi 4' } ],
    [ { dbString: 'QF_QUARTI_V5', label: 'Vinc. Ottavi 5' }, { dbString: 'QF_QUARTI_V6', label: 'Vinc. Ottavi 6' } ],
    [ { dbString: 'QF_QUARTI_V7', label: 'Vinc. Ottavi 7' }, { dbString: 'QF_QUARTI_V8', label: 'Vinc. Ottavi 8' } ]
  ],
  SF: [
    [ { dbString: 'SF_SEMIFINALI_V1', label: 'Vinc. Quarti 1' }, { dbString: 'SF_SEMIFINALI_V2', label: 'Vinc. Quarti 2' } ],
    [ { dbString: 'SF_SEMIFINALI_V3', label: 'Vinc. Quarti 3' }, { dbString: 'SF_SEMIFINALI_V4', label: 'Vinc. Quarti 4' } ]
  ],
  F: [
    [ { dbString: 'F_FINALE_1', label: 'Finalista 1' }, { dbString: 'F_FINALE_2', label: 'Finalista 2' } ]
  ]
};

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

const formatTeamName = (teamName: string) => {
  if (!teamName) return '';
  const lowerName = teamName.toLowerCase().trim();
  if (lowerName === 'repubblica democratica del congo' || lowerName === 'congo') return 'R.D. Congo';
  if (lowerName === 'bosnia ed erzegovina' || lowerName === 'bosnia erzegovina') return 'Bosnia';
  if (lowerName === 'repubblica ceca') return 'Rep. Ceca';
  if (lowerName === 'arabia saudita') return 'Arabia S.';
  if (lowerName === 'corea del sud') return 'Corea Sud';
  if (lowerName === 'stati uniti' || lowerName === 'usa') return 'USA';
  if (lowerName === 'nuova zelanda') return 'N. Zelanda';
  if (lowerName === "costa d'avorio" || lowerName === "costa d avorio") return 'Costa Avorio';
  if (teamName.length > 12) return teamName.substring(0, 10) + '.';
  return teamName;
};

const normalizeName = (name: string) => {
  let n = name.toLowerCase().trim();
  if (n === 'stati uniti') return 'usa';
  if (n === 'bosnia ed erzegovina') return 'bosnia erzegovina';
  if (n.includes('congo')) return 'repubblica democratica del congo';
  if (n === "costa d'avorio" || n === 'costa d avorio') return "costa d'avorio";
  if (n === 'curaçao') return 'curacao';
  return n;
};

export default function GroupsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'GIRONI' | 'BRACKET'>('GIRONI');
  
  const [matches, setMatches] = useState<any[]>([]);
  const [officialBracket, setOfficialBracket] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [matchesRes, bracketRes] = await Promise.all([
        supabase.from('matches').select('*'),
        supabase.from('official_bracket').select('*')
      ]);
      
      if (matchesRes.data) setMatches(matchesRes.data);
      if (bracketRes.data) setOfficialBracket(bracketRes.data);
      
      setLoading(false);
    };
    fetchData();
  }, []);

  const standings = useMemo(() => {
    const stdMap: Record<string, any[]> = {};

    tournamentGroups.forEach(group => {
      stdMap[group.name] = group.teams.map(team => ({
        name: team, played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0
      }));
    });

    matches.forEach(m => {
      if (!m.is_finished || m.home_score_final === null || m.away_score_final === null) return;

      const hName = normalizeName(m.home_team);
      const aName = normalizeName(m.away_team);

      const findTeamObj = (normalizedName: string) => {
        for (const gName in stdMap) {
          const t = stdMap[gName].find(x => normalizeName(x.name) === normalizedName);
          if (t) return t;
        }
        return null;
      };

      const homeObj = findTeamObj(hName);
      const awayObj = findTeamObj(aName);

      const hScore = Number(m.home_score_final);
      const aScore = Number(m.away_score_final);

      if (homeObj) {
        homeObj.played += 1;
        homeObj.gf += hScore;
        homeObj.ga += aScore;
        homeObj.gd = homeObj.gf - homeObj.ga;
        if (hScore > aScore) { homeObj.won += 1; homeObj.pts += 3; }
        else if (hScore === aScore) { homeObj.draw += 1; homeObj.pts += 1; }
        else { homeObj.lost += 1; }
      }

      if (awayObj) {
        awayObj.played += 1;
        awayObj.gf += aScore;
        awayObj.ga += hScore;
        awayObj.gd = awayObj.gf - awayObj.ga;
        if (aScore > hScore) { awayObj.won += 1; awayObj.pts += 3; }
        else if (aScore === hScore) { awayObj.draw += 1; awayObj.pts += 1; }
        else { awayObj.lost += 1; }
      }
    });

    Object.keys(stdMap).forEach(groupName => {
      stdMap[groupName].sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts; 
        if (b.gd !== a.gd) return b.gd - a.gd;     
        if (b.gf !== a.gf) return b.gf - a.gf;     
        return a.name.localeCompare(b.name);       
      });
    });

    return stdMap;
  }, [matches]);

  const bestThirds = useMemo(() => {
    const thirds: any[] = [];
    Object.keys(standings).forEach(groupName => {
      if (standings[groupName].length >= 3) {
        thirds.push({ ...standings[groupName][2], group: groupName });
      }
    });

    thirds.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.name.localeCompare(b.name);
    });

    return thirds;
  }, [standings]);

  const getFlagCode = (team: string) => {
    return flagMap[team?.toLowerCase().trim()];
  };

  const getTeamsForStage = (stageId: string) => {
    const pairs: {name: string | null, placeholder: string}[][] = [];
    const placeholders = BRACKET_MATCHES[stageId] || [];
    
    for (let i = 0; i < placeholders.length; i++) {
       const p1 = placeholders[i][0];
       const p2 = placeholders[i][1];
       
       const t1Obj = officialBracket.find(o => o.stage === p1.dbString);
       const t2Obj = officialBracket.find(o => o.stage === p2.dbString);
       
       pairs.push([
         { name: t1Obj?.team_name || null, placeholder: p1.label }, 
         { name: t2Obj?.team_name || null, placeholder: p2.label }
       ]);
    }
    return pairs;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-4" />
        <p className="text-yellow-500 font-black uppercase text-sm tracking-widest animate-pulse">Caricamento Torneo...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-32 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        <div className="mt-4 mb-2 flex justify-start">
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
          >
            <ArrowLeft size={16} /> Torna Indietro
          </button>
        </div>

        <header className="text-center mb-8 mt-4 relative">
          <h1 className="text-4xl sm:text-5xl font-black text-yellow-500 mb-2 uppercase tracking-tighter italic drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            World Cup Live
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
            Dati Ufficiali del Torneo
          </p>

          <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800 mt-6 max-w-[400px] mx-auto overflow-hidden">
            <button 
              onClick={() => setActiveTab('GIRONI')} 
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'GIRONI' ? 'bg-yellow-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-white'}`}
            >
              <LayoutGrid size={16} /> Gironi
            </button>
            <button 
              onClick={() => setActiveTab('BRACKET')} 
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'BRACKET' ? 'bg-blue-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-white'}`}
            >
              <Trophy size={16} /> Fase Finale
            </button>
          </div>
        </header>

        {/* --- SCHEDA GIRONI E CLASSIFICHE --- */}
        {activeTab === 'GIRONI' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tournamentGroups.map((group) => (
                <div key={group.name} className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl hover:border-yellow-500/30 transition-all group">
                  <div className="bg-slate-800/40 p-4 border-b border-slate-800/50 text-center">
                    <h2 className="text-xl font-black text-white group-hover:text-yellow-500 transition-colors italic tracking-tight">{group.name}</h2>
                  </div>
                  <div className="p-3 sm:p-4 overflow-x-auto">
                    <table className="w-full min-w-[280px] text-left border-collapse">
                      <thead>
                        <tr className="text-[8px] sm:text-[9px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
                          <th className="pb-2 font-black pl-2">Squadra</th>
                          <th className="pb-2 font-black text-center w-6">G</th>
                          <th className="pb-2 font-black text-center w-6">V</th>
                          <th className="pb-2 font-black text-center w-6">N</th>
                          <th className="pb-2 font-black text-center w-6">P</th>
                          <th className="pb-2 font-black text-center w-6">GF</th>
                          <th className="pb-2 font-black text-center w-6">GS</th>
                          <th className="pb-2 font-black text-center w-6">DR</th>
                          <th className="pb-2 font-black text-center w-8 text-yellow-500 text-[10px]">PT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings[group.name]?.map((teamData, index) => {
                          const flagCode = getFlagCode(teamData.name);
                          const isTopTwo = index < 2; 
                          
                          return (
                            <tr key={teamData.name} className="border-b border-slate-800/20 hover:bg-slate-800/40 transition-colors">
                              <td className="py-2.5 pl-2 flex items-center gap-2">
                                <span className={`w-3 flex justify-center text-[10px] font-black ${isTopTwo ? 'text-emerald-500' : 'text-slate-600'}`}>{index + 1}</span>
                                <div className="w-6 h-4 bg-slate-800 rounded-[2px] overflow-hidden shrink-0 shadow-sm relative border border-slate-700/50 flex items-center justify-center">
                                  {flagCode ? <img src={`https://flagcdn.com/w40/${flagCode}.png`} alt={teamData.name} className="w-full h-full object-cover" /> : <Shield size={10} className="text-slate-500" />}
                                </div>
                                <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-tight truncate w-full max-w-[80px] sm:max-w-[110px] ${isTopTwo ? 'text-white' : 'text-slate-300'}`}>
                                  {formatTeamName(teamData.name)}
                                </span>
                              </td>
                              <td className="py-2.5 text-center text-[10px] text-slate-400 font-medium">{teamData.played}</td>
                              <td className="py-2.5 text-center text-[10px] text-emerald-500/70 font-medium">{teamData.won}</td>
                              <td className="py-2.5 text-center text-[10px] text-slate-500 font-medium">{teamData.draw}</td>
                              <td className="py-2.5 text-center text-[10px] text-rose-500/70 font-medium">{teamData.lost}</td>
                              <td className="py-2.5 text-center text-[10px] text-slate-300 font-medium">{teamData.gf}</td>
                              <td className="py-2.5 text-center text-[10px] text-slate-300 font-medium">{teamData.ga}</td>
                              <td className="py-2.5 text-center text-[10px] text-slate-400 font-medium">{teamData.gd > 0 ? `+${teamData.gd}` : teamData.gd}</td>
                              <td className="py-2.5 text-center text-[11px] sm:text-xs font-black text-yellow-500">{teamData.pts}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* TABELLA MIGLIORI 8 TERZE */}
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl mt-12 mb-8">
               <div className="bg-slate-800/60 p-5 border-b border-slate-800 flex flex-col items-center justify-center">
                  <h2 className="text-2xl font-black text-emerald-400 italic tracking-tight uppercase text-center">Classifica Migliori Terze</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 text-center">Le prime 8 passano ai sedicesimi</p>
               </div>
               <div className="p-3 sm:p-5 overflow-x-auto">
                  <table className="w-full min-w-[300px] text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
                        <th className="pb-3 font-black pl-2">Squadra</th>
                        <th className="pb-3 font-black text-center">Girone</th>
                        <th className="pb-3 font-black text-center">GF</th>
                        <th className="pb-3 font-black text-center">DR</th>
                        <th className="pb-3 font-black text-center text-yellow-500">PT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bestThirds.map((teamData, index) => {
                        const flagCode = getFlagCode(teamData.name);
                        const isQualified = index < 8; 
                        
                        return (
                          <tr key={teamData.name} className={`border-b border-slate-800/30 transition-colors ${isQualified ? 'bg-emerald-950/10 hover:bg-emerald-900/20' : 'opacity-60 bg-slate-950 hover:bg-slate-900'}`}>
                            <td className="py-3 pl-2 flex items-center gap-3">
                              <span className={`w-4 text-center text-[10px] font-black ${isQualified ? 'text-emerald-500' : 'text-slate-600'}`}>{index + 1}</span>
                              <div className="w-6 h-4 bg-slate-800 rounded-[2px] overflow-hidden shrink-0 shadow-sm relative border border-slate-700/50 flex items-center justify-center">
                                {flagCode ? <img src={`https://flagcdn.com/w40/${flagCode}.png`} alt={teamData.name} className="w-full h-full object-cover" /> : <Shield size={10} className="text-slate-500" />}
                              </div>
                              <span className={`text-xs font-bold uppercase tracking-tight ${isQualified ? 'text-white' : 'text-slate-400 line-through decoration-rose-500/50'}`}>{formatTeamName(teamData.name)}</span>
                            </td>
                            <td className="py-3 text-center text-[10px] font-black text-slate-500 uppercase tracking-wider">{teamData.group.replace('Gruppo ', '')}</td>
                            <td className="py-3 text-center text-[11px] text-slate-300 font-medium">{teamData.gf}</td>
                            <td className="py-3 text-center text-[11px] text-slate-400 font-medium">{teamData.gd > 0 ? `+${teamData.gd}` : teamData.gd}</td>
                            <td className={`py-3 text-center text-sm font-black ${isQualified ? 'text-yellow-500' : 'text-slate-500'}`}>{teamData.pts}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>
        )}

        {/* --- SCHEDA BRACKET (FASE FINALE VISUALE) --- */}
        {activeTab === 'BRACKET' && (
          <div className="animate-in fade-in duration-500 w-full bg-slate-900/40 border border-slate-800 rounded-[2rem] shadow-2xl p-4 sm:p-6 overflow-hidden">
             <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-blue-400 italic tracking-tight uppercase">Tabellone Ufficiale</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 px-4 leading-relaxed">
                  Si compone in base agli inserimenti dell'Admin. <br className="sm:hidden" />Scorri verso destra per vedere la finale! 👉
                </p>
             </div>

             <div className="w-full overflow-x-auto custom-scrollbar pb-6 cursor-grab active:cursor-grabbing">
                <div className="flex flex-row items-stretch min-w-max gap-6 sm:gap-10 px-2 py-4 min-h-[500px]">
                  
                  {BRACKET_ROUNDS.map((round) => {
                    const pairs = getTeamsForStage(round.id);
                    return (
                      <div key={round.id} className="flex flex-col justify-around w-40 sm:w-48 shrink-0 relative pt-8">
                         
                         <div className="absolute top-0 left-0 w-full text-center">
                           <h3 className="text-[10px] sm:text-[11px] font-black uppercase text-blue-500 tracking-widest bg-slate-950/50 inline-block px-3 py-1 rounded-full border border-blue-500/20">{round.title}</h3>
                         </div>
                         
                         {pairs.map((pair, pIdx) => (
                            <div key={pIdx} className="relative z-10 flex flex-col bg-slate-950 border border-slate-700 rounded-xl overflow-hidden shadow-lg my-1.5 transition-colors hover:border-slate-500">
                               {/* Team 1 */}
                               <div className={`flex items-center gap-2.5 px-3 py-2.5 ${pair[0].name ? 'bg-slate-800/80' : 'bg-slate-900/40 opacity-70'}`}>
                                 {pair[0].name && getFlagCode(pair[0].name) ? <img src={`https://flagcdn.com/w20/${getFlagCode(pair[0].name)}.png`} className="w-4 h-3 object-cover rounded-[2px]" alt=""/> : <div className="w-4 h-3 bg-slate-800 rounded-[2px]"></div>}
                                 <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider truncate ${pair[0].name ? 'text-white' : 'text-slate-500'}`}>
                                   {pair[0].name ? formatTeamName(pair[0].name) : pair[0].placeholder}
                                 </span>
                               </div>
                               <div className="h-px w-full bg-slate-800"></div>
                               {/* Team 2 */}
                               <div className={`flex items-center gap-2.5 px-3 py-2.5 ${pair[1].name ? 'bg-slate-800/80' : 'bg-slate-900/40 opacity-70'}`}>
                                 {pair[1].name && getFlagCode(pair[1].name) ? <img src={`https://flagcdn.com/w20/${getFlagCode(pair[1].name)}.png`} className="w-4 h-3 object-cover rounded-[2px]" alt=""/> : <div className="w-4 h-3 bg-slate-800 rounded-[2px]"></div>}
                                 <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider truncate ${pair[1].name ? 'text-white' : 'text-slate-500'}`}>
                                   {pair[1].name ? formatTeamName(pair[1].name) : pair[1].placeholder}
                                 </span>
                               </div>
                            </div>
                         ))}
                      </div>
                    )
                  })}

                  {/* COLONNA VINCITORE */}
                  <div className="flex flex-col justify-center w-48 sm:w-56 shrink-0 relative ml-4">
                     <div className="flex flex-col items-center bg-gradient-to-br from-yellow-500/20 to-yellow-900/20 border border-yellow-500/50 rounded-[2rem] p-6 shadow-[0_0_30px_rgba(234,179,8,0.2)] text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
                        <Trophy size={40} className="text-yellow-500 mb-4 drop-shadow-md" />
                        <h3 className="text-[10px] font-black uppercase text-yellow-500/70 tracking-[0.2em] mb-4">Campione del Mondo</h3>
                        
                        {(() => {
                          const winner = officialBracket.find(o => normalizeStage(o.stage) === 'WINNER')?.team_name;
                          const flag = getFlagCode(winner || '');
                          return (
                            <div className="flex flex-col items-center gap-3 w-full">
                              {winner ? (
                                 <>
                                   {flag && <img src={`https://flagcdn.com/w80/${flag}.png`} className="w-14 h-10 object-cover rounded shadow-md border border-yellow-500/30" alt=""/>}
                                   <span className="text-xl font-black uppercase italic text-yellow-400 truncate w-full">{formatTeamName(winner)}</span>
                                 </>
                              ) : (
                                 <>
                                   <div className="w-14 h-10 bg-slate-900/50 rounded border border-slate-700/50"></div>
                                   <span className="text-base font-black uppercase text-slate-500 mt-1">TBD</span>
                                 </>
                              )}
                            </div>
                          )
                        })()}
                     </div>
                  </div>

                </div>
             </div>
          </div>
        )}

      </div>
    </main>
  );
}