'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, X, ShieldCheck, Trash2, Map, Info, Trophy, BarChart3, Search, Star, Zap, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const WORLD_CUP_START_DATE = new Date('2026-06-11T21:00:00+02:00');

const STAGES = [
  { id: 'R32', label: 'Sedicesimi', count: 32, pts: 2 },
  { id: 'R16', label: 'Ottavi', count: 16, pts: 4 },
  { id: 'QF', label: 'Quarti', count: 8, pts: 6 },
  { id: 'SF', label: 'Semifinali', count: 4, pts: 8 },
  { id: 'F', label: 'Finale', count: 2, pts: 10 },
  { id: 'WINNER', label: 'Vincitore Mondiale', count: 1, pts: 20 },
];

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
  brasile: 'br', canada: 'ca', 'capo verde': 'cv', colombia: 'co', 'corea sud': 'kr', 'corea del sud': 'kr', 
  "costa avorio": 'ci', "costa d'avorio": 'ci', croazia: 'hr', 'curacao': 'cw', 'curaçao': 'cw',
  ecuador: 'ec', egitto: 'eg', francia: 'fr', germania: 'de', ghana: 'gh', giappone: 'jp',
  giordania: 'jo', haiti: 'ht', inghilterra: 'gb-eng', iran: 'ir', iraq: 'iq', marocco: 'ma',
  messico: 'mx', norvegia: 'no', 'n. zelanda': 'nz', 'nuova zelanda': 'nz', olanda: 'nl', 
  panama: 'pa', paraguay: 'py', portogallo: 'pt', qatar: 'qa', 'rep. ceca': 'cz', 
  'repubblica ceca': 'cz', 'r.d. congo': 'cd', 'repubblica democratica del congo': 'cd',
  scozia: 'gb-sct', senegal: 'sn', spagna: 'es', 'usa': 'us', 'stati uniti': 'us',
  sudafrica: 'za', svezia: 'se', svizzera: 'ch', tunisia: 'tn', turchia: 'tr', 
  uruguay: 'uy', uzbekistan: 'uz',
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

export default function BracketPage() {
  const router = useRouter(); 
  const [selections, setSelections] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [activeCell, setActiveCell] = useState<any>(null);
  const [teamSearch, setTeamSearch] = useState(''); 

  const isExpired = new Date() > WORLD_CUP_START_DATE;

  useEffect(() => {
    loadSavedBracket();
  }, []);

  useEffect(() => {
    if (!activeCell) {
      setTeamSearch(''); 
    }
  }, [activeCell]);

  async function loadSavedBracket() {
    try {
      setFetching(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; } 

      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
      if (!profile || !profile.full_name) {
        router.push('/setup-profilo');
        return;
      }

      const { data, error } = await supabase.from('brackets').select('stage, team_name').eq('user_id', user.id);
      if (error) throw error;
      if (data) {
        const saved: any = {};
        const stageCounts: any = {};
        data.forEach((row) => {
          const count = stageCounts[row.stage] || 0;
          saved[`${row.stage}-${count}`] = row.team_name;
          stageCounts[row.stage] = count + 1;
        });
        setSelections(saved);
      }
    } catch (err) { toast.error('Errore caricamento'); } finally { setFetching(false); }
  }

  const getFileFlag = (team: string) => {
    const code = flagMap[team?.toLowerCase().trim()];
    return code ? `https://flagcdn.com/w40/${code}.png` : null;
  };

  const handleSelect = (stage: string, index: number, team: string) => {
    if (isExpired) return;
    setSelections((prev: any) => ({ ...prev, [`${stage}-${index}`]: team }));
    
    if (team === '') {
        toast.dismiss();
        toast.success("Squadra rimossa!", { icon: '🧹', duration: 1500 });
    }
    setActiveCell(null);
  };

  const resetBracket = async () => {
    if (isExpired) return;
    if (window.confirm('Sei sicuro di voler svuotare tutto il tabellone? (Le modifiche saranno effettive solo se premi "Conferma Scelte")')) {
      setSelections({});
      toast.success('Tabellone svuotato! Premi Conferma per salvare.', { icon: '🧹' });
    }
  };

  const saveBracket = async () => {
    if (isExpired) return toast.error('Le giocate sono chiuse!');
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utente non trovato');
      const rows = Object.entries(selections).filter(([_, t]) => t !== '' && t !== null).map(([k, t]) => ({
        user_id: user.id, stage: k.split('-')[0], team_name: t,
      }));
      
      await supabase.from('brackets').delete().eq('user_id', user.id);
      
      if (rows.length > 0) {
          const { error } = await supabase.from('brackets').insert(rows);
          if (error) throw error;
      }
      
      toast.success('Tabellone salvato! 🏆');
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#eab308', '#3b82f6', '#ef4444', '#22c55e', '#ffffff'],
        disableForReducedMotion: true
      });

    } catch (error: any) { toast.error(error.message); } finally { setLoading(false); }
  };

  const getPrevStageId = (currentId: string) => {
    const idx = STAGES.findIndex(s => s.id === currentId);
    return idx > 0 ? STAGES[idx - 1].id : null;
  };

  const getTeamsInStage = (stageId: string | null) => {
    if (!stageId) return [];
    return Object.entries(selections)
      .filter(([k, v]) => k.startsWith(`${stageId}-`) && v)
      .map(([k, v]) => v as string);
  };

  const renderTeamButton = (t: string, currentStageTeams: string[]) => {
    const isSelectedInStage = currentStageTeams.includes(t);
    const isCurrentCellTeam = selections[`${activeCell?.stageId}-${activeCell?.index}`] === t;
    const isDisabled = isSelectedInStage && !isCurrentCellTeam;

    const teamStages = Object.entries(selections)
       .filter(([k, v]) => v === t)
       .map(([k]) => k.split('-')[0]);
    
    const uniqueStages = Array.from(new Set(teamStages));
    const stageOrder = ['R32', 'R16', 'QF', 'SF', 'F', 'WINNER'];
    uniqueStages.sort((a, b) => stageOrder.indexOf(a) - stageOrder.indexOf(b));

    const stageLabels: Record<string, string> = { R32: '16°', R16: '8°', QF: '4°', SF: 'SF', F: 'F', WINNER: '🏆' };

    return (
      <button
        key={t}
        onClick={() => handleSelect(activeCell.stageId, activeCell.index, t)}
        disabled={isDisabled}
        className={`flex flex-col p-3 rounded-2xl border-2 transition-all group ${
          isCurrentCellTeam 
            ? 'bg-yellow-500/10 border-yellow-500 shadow-md' 
            : isDisabled
              ? 'bg-slate-950 border-slate-800 opacity-40 cursor-not-allowed'
              : 'bg-slate-950 border-slate-800 active:border-yellow-500 hover:border-slate-700 shadow-md'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src={getFileFlag(t)!} 
              className={`w-7 h-5 sm:w-9 sm:h-6 object-cover rounded shadow-lg border border-slate-800 transition-colors ${!isDisabled ? 'group-hover:border-slate-600' : ''}`} 
              alt="" 
            />
            <span className={`text-[11px] sm:text-[12px] font-black uppercase italic truncate ${isCurrentCellTeam ? 'text-yellow-500' : 'text-white'}`}>
              {formatTeamName(t)}
            </span>
          </div>
          
          {isCurrentCellTeam && (
            <span className="text-[8px] font-black bg-yellow-500 text-slate-950 px-1.5 py-0.5 rounded uppercase tracking-widest flex items-center gap-0.5 shadow-sm shrink-0">
              <CheckCircle2 size={10}/> Tua Scelta
            </span>
          )}
          {isDisabled && (
            <span className="text-[8px] font-black bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-widest shrink-0">
              Già Scelta
            </span>
          )}
        </div>
        
        {uniqueStages.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 pl-9 sm:pl-12 w-full justify-start">
            {uniqueStages.map(s => (
              <span key={s} className="bg-slate-800/80 border border-slate-700 text-slate-300 text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest shadow-sm">
                {stageLabels[s]}
              </span>
            ))}
          </div>
        )}
      </button>
    );
  };

  if (fetching) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4"><div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div><div className="text-yellow-500 font-black animate-pulse uppercase tracking-widest text-xs">Caricamento Tabellone...</div></div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-48 font-sans">
      <header className="text-center mb-6 pt-4 flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl font-black text-yellow-500 uppercase italic tracking-tighter leading-none">Fase Finale</h1>
        <p className="text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] mt-3 italic">
          {isExpired ? '🔒 Pronostici Conclusi' : 'Dalla fase a eliminazione al Titolo'}
        </p>
        <div className="flex gap-2 mt-6">
          <Link href="/matches" className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-400 px-5 py-3.5 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 active:scale-95 shadow-lg">
            <Map size={16} /> Gironi
          </Link>
          <Link href="/simulatore" className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 px-5 py-3.5 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all hover:bg-blue-600/30 active:scale-95 shadow-lg">
            <BarChart3 size={16} /> Simulatore
          </Link>
        </div>
      </header>

      <div className={`max-w-4xl mx-auto space-y-12 ${isExpired ? 'opacity-70 pointer-events-none' : ''}`}>
        
        {/* INFO BOX (Regole di Inserimento) */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-start gap-3 -mt-2 mb-10 shadow-lg">
          <Info className="text-yellow-500 shrink-0 mt-0.5" size={18} />
          <p className="text-[10px] sm:text-xs text-slate-400 font-medium leading-relaxed">
            <strong className="text-slate-200 font-black">L'ORDINE NON CONTA.</strong> Questa non è la griglia degli accoppiamenti esatti, ma solo la lista delle squadre che accederanno al turno. Ogni squadra qualificata ed indovinata riceverà i relativi punti.
          </p>
        </div>

        {STAGES.map((stage) => (
          <section key={stage.id} className="relative">
            <div className="flex flex-col mb-6">
              <div className="flex items-center gap-3 px-2">
                <span className="bg-yellow-500 text-slate-950 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg italic flex items-center gap-1 shrink-0 shadow-lg shadow-yellow-500/20">
                  {stage.pts} PT
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight shrink-0">{stage.label}</h2>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-800 to-transparent"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 auto-rows-fr">
              {Array.from({ length: stage.count }).map((_, i) => {
                const currentSelection = selections[`${stage.id}-${i}`];
                const cellNumber = i + 1;
                
                return (
                  <div key={i} className="relative h-full">
                    <button
                      disabled={isExpired}
                      onClick={() => {
                        if (isExpired) return;
                        setActiveCell({stageId: stage.id, index: i});
                      }}
                      className={`w-full h-full bg-slate-900 border-2 rounded-2xl py-3 pl-2 pr-10 sm:p-4 sm:pr-14 flex items-center gap-1.5 sm:gap-3 transition-all text-left
                        ${currentSelection ? 'border-yellow-500/50 text-yellow-500 shadow-xl shadow-yellow-500/5' : 'border-slate-800 text-slate-600 hover:border-slate-700'}
                        ${isExpired ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className={`text-[9px] sm:text-[11px] font-black w-3 sm:w-4 text-center shrink-0 ${currentSelection ? 'text-yellow-600/50' : 'text-slate-700'}`}>
                        {cellNumber}
                      </span>
                      <div className="shrink-0 flex items-center justify-center">
                        {currentSelection ? (
                          <img src={getFileFlag(currentSelection)!} className="w-5 sm:w-8 h-auto rounded-[3px] shadow-sm border border-slate-800 object-cover" alt="" />
                        ) : (
                          <ShieldCheck className="text-slate-800 w-4 h-4 sm:w-6 sm:h-6" />
                        )}
                      </div>
                      <span className="text-[10px] sm:text-[13px] font-black uppercase leading-[1.15] sm:leading-tight flex-1 truncate">
                        {currentSelection ? formatTeamName(currentSelection) : 'Scegli'}
                      </span>
                    </button>
                    {currentSelection && !isExpired && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleSelect(stage.id, i, ''); }} 
                        className="absolute right-0 top-0 bottom-0 px-3 sm:px-4 text-rose-500 hover:text-rose-400 active:scale-90 transition-all z-20 flex items-center justify-center"
                      >
                        <X size={18} strokeWidth={3} className="sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {activeCell && !isExpired && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center px-0 sm:px-4 pb-0">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setActiveCell(null)}></div>
          
          <div className="relative w-full max-w-xl bg-slate-900 border-t-2 sm:border-2 border-yellow-500/40 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col h-[85dvh] sm:h-auto sm:max-h-[80dvh] animate-in slide-in-from-bottom duration-300 mx-auto">
            <div className="shrink-0 p-6 sm:p-7 bg-slate-950 border-b border-slate-800 flex flex-col gap-4 rounded-t-[2.5rem] sm:rounded-t-[2.3rem] z-20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-yellow-500 text-xl font-black uppercase italic tracking-tight">Seleziona Squadra</h3>
                  <p className="text-slate-500 text-xs font-black uppercase mt-1 tracking-widest">
                    {STAGES.find(s => s.id === activeCell.stageId)?.label} — POS. {activeCell.index + 1}
                  </p>
                </div>
                <button onClick={() => setActiveCell(null)} className="p-4 bg-slate-800 rounded-full text-white active:scale-90 transition-all shadow-lg"><X size={24} strokeWidth={3}/></button>
              </div>
              
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                 <input 
                   type="text" 
                   placeholder="Cerca squadra..." 
                   className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs font-black uppercase text-white outline-none focus:border-yellow-500 transition-colors placeholder:text-slate-600" 
                   value={teamSearch} 
                   onChange={e => setTeamSearch(e.target.value)} 
                 />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-8 bg-slate-900 custom-scrollbar pb-24 overscroll-contain">
                
                {(() => {
                  const prevStageId = getPrevStageId(activeCell.stageId);
                  const currentStageTeams = getTeamsInStage(activeCell.stageId);
                  const currentCellTeam = selections[`${activeCell.stageId}-${activeCell.index}`];

                  const isTeamDisabled = (t: string) => currentStageTeams.includes(t) && t !== currentCellTeam;
                  const matchSearch = (t: string) => t.toLowerCase().includes(teamSearch.toLowerCase()) || formatTeamName(t).toLowerCase().includes(teamSearch.toLowerCase());

                  // 1. SQUADRE QUALIFICATE DAL TURNO PRECEDENTE
                  const prevStageTeamsList = prevStageId ? getTeamsInStage(prevStageId) : [];
                  const filteredPrevTeams = prevStageTeamsList.filter(t => matchSearch(t));
                  
                  const prevGroups = TOURNAMENT_GROUPS.map(g => ({
                      name: g.name,
                      teams: g.teams.filter(t => filteredPrevTeams.includes(t))
                  })).filter(g => g.teams.length > 0);

                  // 2. TUTTE LE SQUADRE (Gironi Nomi)
                  const availableGroups = TOURNAMENT_GROUPS.map(g => ({
                    name: g.name,
                    teams: g.teams.filter(t => matchSearch(t))
                  })).filter(g => g.teams.length > 0);

                  return (
                    <>
                      {/* 1. QUALIFICATE DAL TURNO PRECEDENTE (Divise per girone) */}
                      {prevGroups.length > 0 && (
                         <div className="space-y-5 mb-10">
                            <div className="flex items-center gap-3 px-2">
                              <Zap size={16} className="text-emerald-500" />
                              <span className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">Qualificate dal turno precedente</span>
                              <div className="flex-1 h-px bg-emerald-500/30"></div>
                            </div>
                            
                            <div className="space-y-6">
                                {prevGroups.map(group => {
                                    const sortedPrevTeams = [...group.teams].sort((a, b) => {
                                      const aDis = isTeamDisabled(a);
                                      const bDis = isTeamDisabled(b);
                                      if (aDis && !bDis) return 1;
                                      if (!aDis && bDis) return -1;
                                      return 0;
                                    });

                                    return (
                                       <div key={`prev-${group.name}`} className="space-y-3 pl-1">
                                          <div className="flex items-center gap-2 px-2">
                                             <Trophy size={12} className="text-emerald-500/50" />
                                             <span className="text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.2em]">{group.name}</span>
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                             {sortedPrevTeams.map(t => renderTeamButton(t, currentStageTeams))}
                                          </div>
                                       </div>
                                    )
                                })}
                            </div>
                         </div>
                      )}

                      {/* 2. TUTTI I GIRONI */}
                      <div className="space-y-8">
                        {availableGroups.map((group) => {
                          const sortedTeams = [...group.teams].sort((a, b) => {
                            const aDis = isTeamDisabled(a);
                            const bDis = isTeamDisabled(b);
                            if (aDis && !bDis) return 1;
                            if (!aDis && bDis) return -1;
                            return 0;
                          });

                          return (
                            <div key={group.name} className="space-y-4">
                              <div className="flex items-center gap-3 px-2">
                                <Trophy size={16} className="text-yellow-500/50" />
                                <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{group.name}</span>
                                <div className="flex-1 h-px bg-slate-800/50"></div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {sortedTeams.map((t) => renderTeamButton(t, currentStageTeams))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}

            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-24 left-0 right-0 p-6 flex justify-center items-center gap-3 z-50 pointer-events-none">
        {!isExpired && (
          <button onClick={resetBracket} disabled={loading} className="pointer-events-auto p-6 bg-slate-900 border-2 border-slate-800 rounded-[2rem] text-rose-500 hover:bg-rose-500/10 active:bg-rose-500 active:text-white transition-all shadow-2xl"><Trash2 size={24} /></button>
        )}
        <button onClick={saveBracket} disabled={loading || isExpired} className={`max-w-xs w-full py-6 rounded-[2rem] font-black uppercase text-sm italic flex items-center justify-center gap-3 transition-all tracking-widest shadow-2xl pointer-events-auto ${isExpired ? 'bg-slate-900 text-slate-700 border border-slate-800' : 'bg-yellow-500 text-slate-950 active:scale-95 shadow-[0_0_30px_rgba(234,179,8,0.3)]'}`}>
          {loading ? <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div> : isExpired ? '🔒 Pronostici Chiusi' : 'Conferma Scelte'}
        </button>
      </div>
    </main>
  );
}