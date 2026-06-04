'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, X, ShieldCheck, Trash2, Map, Info, Trophy, BarChart3, Search } from 'lucide-react';
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
  { name: 'Gruppo A', teams: ['Messico', 'Sudafrica', 'Corea del Sud', 'Repubblica Ceca'] },
  { name: 'Gruppo B', teams: ['Canada', 'Svizzera', 'Qatar', 'Bosnia ed Erzegovina'] }, 
  { name: 'Gruppo C', teams: ['Brasile', 'Marocco', 'Haiti', 'Scozia'] },
  { name: 'Gruppo D', teams: ['Stati Uniti', 'Australia', 'Paraguay', 'Turchia'] }, 
  { name: 'Gruppo E', teams: ['Germania', "Costa d'avorio", 'Ecuador', 'Curaçao'] }, 
  { name: 'Gruppo F', teams: ['Olanda', 'Svezia', 'Giappone', 'Tunisia'] },
  { name: 'Gruppo G', teams: ['Belgio', 'Iran', 'Egitto', 'Nuova Zelanda'] },
  { name: 'Gruppo H', teams: ['Spagna', 'Uruguay', 'Arabia Saudita', 'Capo Verde'] },
  { name: 'Gruppo I', teams: ['Francia', 'Senegal', 'Norvegia', 'Iraq'] },
  { name: 'Gruppo J', teams: ['Argentina', 'Austria', 'Algeria', 'Giordania'] },
  { name: 'Gruppo K', teams: ['Portogallo', 'Colombia', 'Uzbekistan', 'Repubblica Democratica del Congo'] },
  { name: 'Gruppo L', teams: ['Inghilterra', 'Croazia', 'Ghana', 'Panama'] },
];

const flagMap: { [key: string]: string } = {
  algeria: 'dz', 'arabia saudita': 'sa', argentina: 'ar', australia: 'au', austria: 'at',
  belgio: 'be', 'bosnia ed erzegovina': 'ba', 'bosnia erzegovina': 'ba', brasile: 'br', canada: 'ca', 'capo verde': 'cv',
  colombia: 'co', 'corea del sud': 'kr', "costa d'avorio": 'ci', croazia: 'hr', curaçao: 'cw',
  ecuador: 'ec', egitto: 'eg', francia: 'fr', germania: 'de', ghana: 'gh', giappone: 'jp',
  giordania: 'jo', haiti: 'ht', inghilterra: 'gb-eng', iran: 'ir', iraq: 'iq', marocco: 'ma',
  messico: 'mx', norvegia: 'no', 'nuova zelanda': 'nz', olanda: 'nl', panama: 'pa', paraguay: 'py',
  portogallo: 'pt', qatar: 'qa', 'repubblica ceca': 'cz', 'repubblica democratica del congo': 'cd',
  scozia: 'gb-sct', senegal: 'sn', spagna: 'es', 'stati uniti': 'us', usa: 'us', sudafrica: 'za',
  svezia: 'se', svizzera: 'ch', tunisia: 'tn', turchia: 'tr', uruguay: 'uy', uzbekistan: 'uz',
};

const formatTeamName = (name: string) => {
  if (!name) return '';
  const n = name.trim().toLowerCase();
  if (n === 'repubblica democratica del congo') return 'R.D. Congo';
  if (n === 'stati uniti') return 'USA';
  if (n === 'bosnia ed erzegovina' || n === 'bosnia erzegovina') return 'Bosnia';
  if (n === 'nuova zelanda') return 'N. Zelanda';
  if (n === 'arabia saudita') return 'Arabia S.';
  if (n === 'repubblica ceca') return 'Rep. Ceca';
  if (n === "costa d'avorio") return 'C. Avorio';
  if (n === 'corea del sud') return 'Corea Sud';
  return name;
};

export default function BracketPage() {
  const router = useRouter(); 
  const [selections, setSelections] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [activeCell, setActiveCell] = useState<any>(null);
  const [teamSearch, setTeamSearch] = useState(''); 
  const selectedTeamRef = useRef<any>(null);

  const isExpired = new Date() > WORLD_CUP_START_DATE;

  useEffect(() => {
    loadSavedBracket();
  }, []);

  useEffect(() => {
    if (activeCell) {
      const timer = setTimeout(() => {
        if (selectedTeamRef.current) {
          selectedTeamRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
      return () => clearTimeout(timer);
    } else {
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

  const getFlag = (team: string) => {
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
    if (window.confirm('Sei sicuro di voler svuotare tutto il tabellone?')) {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Utente non trovato');
        await supabase.from('brackets').delete().eq('user_id', user.id);
        setSelections({});
        toast.success('Tabellone azzerato!', { icon: '🧹' });
      } catch (error) { toast.error("Errore reset"); } finally { setLoading(false); }
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
      if (rows.length === 0) { toast.error('Seleziona almeno una squadra!'); setLoading(false); return; }
      await supabase.from('brackets').delete().eq('user_id', user.id);
      const { error } = await supabase.from('brackets').insert(rows);
      if (error) throw error;
      
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

  const getAlreadySelectedInStage = (stageId: string, currentIndex: number) => {
    return Object.entries(selections)
      .filter(([key, value]) => key.startsWith(`${stageId}-`) && key !== `${stageId}-${currentIndex}`)
      .map(([_, value]) => value);
  };

  if (fetching) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-yellow-500 font-black animate-pulse italic uppercase text-sm">Disegno Tabellone...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-48 font-sans">
      <header className="text-center mb-10 pt-4 flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl font-black text-yellow-500 uppercase italic tracking-tighter leading-none">Fase Finale</h1>
        <p className="text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] mt-3 italic">
          {isExpired ? '🔒 Pronostici Conclusi' : 'Dalla fase a eliminazione al Titolo'}
        </p>
        
        <div className="flex gap-2 mt-6">
          <Link href="/groups" className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-400 px-5 py-3.5 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 active:scale-95 shadow-lg">
            <Map size={16} /> Gironi
          </Link>
          <Link href="/simulatore" className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 px-5 py-3.5 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all hover:bg-blue-600/30 active:scale-95 shadow-lg">
            <BarChart3 size={16} /> Simulatore
          </Link>
        </div>
      </header>

      <div className={`max-w-4xl mx-auto space-y-12 ${isExpired ? 'opacity-70 pointer-events-none' : ''}`}>
        {STAGES.map((stage) => (
          <section key={stage.id} className="relative">
            <div className="flex flex-col mb-6">
              <div className="flex items-center gap-3 px-2">
                <span className="bg-yellow-500 text-slate-950 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded italic flex items-center gap-1 shrink-0">
                  {stage.pts} PT
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight shrink-0">{stage.label}</h2>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-800 to-transparent"></div>
              </div>
              {stage.id === 'R32' && (
                <div className="mt-3 mx-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-start sm:items-center gap-3 text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-tight">
                  <Info size={20} className="text-blue-500 shrink-0" />
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p>L'ordine non conta: seleziona le 32 squadre che supereranno la fase a gironi.</p>
                    <p>Si qualificano le <span className="text-white">prime 2</span> e le <span className="text-white">8 migliori terze</span>.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 auto-rows-fr">
              {Array.from({ length: stage.count }).map((_, i) => {
                const currentSelection = selections[`${stage.id}-${i}`];
                const cellNumber = i + 1;
                
                return (
                  <div key={i} className="relative h-full">
                    <button
                      disabled={isExpired}
                      onClick={() => setActiveCell({stageId: stage.id, index: i})}
                      className={`w-full h-full bg-slate-900 border-2 rounded-2xl py-3 pl-2 pr-10 sm:p-4 sm:pr-14 flex items-center gap-1.5 sm:gap-3 transition-all text-left
                        ${currentSelection ? 'border-yellow-500/50 text-yellow-500 shadow-xl shadow-yellow-500/5' : 'border-slate-800 text-slate-600'}`}
                    >
                      <span className={`text-[9px] sm:text-[11px] font-black w-3 sm:w-4 text-center shrink-0 ${currentSelection ? 'text-yellow-600/50' : 'text-slate-700'}`}>
                        {cellNumber}
                      </span>

                      <div className="shrink-0 flex items-center justify-center">
                        {currentSelection ? (
                          <img src={getFlag(currentSelection)!} className="w-5 sm:w-8 h-auto rounded-sm shadow-sm" alt="" />
                        ) : (
                          <ShieldCheck className="text-slate-800 w-4 h-4 sm:w-6 sm:h-6" />
                        )}
                      </div>
                      
                      <span className="text-[10px] sm:text-[13px] font-black uppercase leading-[1.15] sm:leading-tight flex-1 break-words">
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
                    
                    {!currentSelection && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-800 pointer-events-none">
                        <ChevronDown size={14} className="sm:w-5 sm:h-5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {activeCell && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center px-0 sm:px-4 pb-0">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setActiveCell(null)}></div>
          
          {/* h-[85dvh] garantisce che il modale non superi l'85% dell'altezza DINAMICA (che si rimpicciolisce quando si apre la tastiera) */}
          <div className="relative w-full max-w-xl bg-slate-900 border-t-2 sm:border-2 border-yellow-500/40 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col h-[85dvh] sm:h-auto sm:max-h-[80dvh] animate-in slide-in-from-bottom duration-300">
            
            {/* shrink-0 impedisce che l'intestazione venga compressa, resta fissa in alto */}
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

            {/* flex-1 overflow-y-auto permette a questo div di prendere tutto lo spazio rimasto sotto e creare lo scroll */}
            <div className="flex-1 overflow-y-auto p-5 space-y-8 bg-slate-900 custom-scrollbar pb-24 overscroll-contain">
                {TOURNAMENT_GROUPS.map((group) => {
                  
                  const filteredTeams = group.teams.filter(t => 
                    t.toLowerCase().includes(teamSearch.toLowerCase()) || 
                    formatTeamName(t).toLowerCase().includes(teamSearch.toLowerCase())
                  );

                  if (filteredTeams.length === 0) return null;

                  const alreadySelectedByOthers = getAlreadySelectedInStage(activeCell.stageId, activeCell.index);
                  const currentCellSelection = selections[`${activeCell.stageId}-${activeCell.index}`];
                  
                  return (
                    <div key={group.name} className="space-y-4">
                      <div className="flex items-center gap-3 px-2">
                        <Trophy size={16} className="text-yellow-500" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{group.name}</span>
                        <div className="flex-1 h-px bg-slate-800/50"></div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filteredTeams.map((t) => {
                          const isPickedByOther = alreadySelectedByOthers.includes(t);
                          const isCurrentSelection = currentCellSelection === t;
                          
                          const teamStageIds = Object.entries(selections)
                            .filter(([key, val]) => val === t)
                            .map(([key]) => key.split('-')[0]);

                          const uniqueStages = Array.from(new Set(teamStageIds)).sort((a, b) => 
                            STAGES.findIndex(s => s.id === a) - STAGES.findIndex(s => s.id === b)
                          );

                          const stageLabels = uniqueStages.map(sId => {
                            if (sId === 'R32') return '16°';
                            if (sId === 'R16') return '8°';
                            if (sId === 'QF') return '4°';
                            if (sId === 'SF') return 'SF';
                            if (sId === 'F') return 'FIN';
                            if (sId === 'WINNER') return '🏆';
                            return sId;
                          });
                          
                          let buttonStyle = "bg-slate-950 border-slate-800 active:border-yellow-500 active:bg-slate-900 shadow-md";
                          if (isCurrentSelection) {
                            buttonStyle = "bg-yellow-500/10 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.15)]";
                          } else if (isPickedByOther) {
                            buttonStyle = "opacity-40 border-dashed border-slate-700 grayscale hover:opacity-100 hover:grayscale-0 transition-all";
                          }

                          return (
                            <button
                              key={t}
                              ref={isCurrentSelection ? selectedTeamRef : null}
                              onClick={() => {
                                if (isCurrentSelection) {
                                  handleSelect(activeCell.stageId, activeCell.index, '');
                                } else if (isPickedByOther) {
                                  const previousEntry = Object.entries(selections).find(([k, v]) => v === t && k.startsWith(`${activeCell.stageId}-`));
                                  if (previousEntry) {
                                    const [prevKey] = previousEntry;
                                    setSelections((prev: any) => ({ ...prev, [prevKey]: '' }));
                                    toast.dismiss();
                                    toast.success(`${formatTeamName(t)} liberata!`, { icon: '🔓', duration: 1500 });
                                  }
                                } else {
                                  handleSelect(activeCell.stageId, activeCell.index, t);
                                }
                              }}
                              className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all text-left relative overflow-hidden active:scale-95 ${buttonStyle}`}
                            >
                              <div className="flex items-center gap-3 w-full">
                                <img src={getFlag(t)!} className="w-9 h-auto rounded shadow-lg border border-slate-800 shrink-0" alt="" />
                                
                                <div className="flex flex-col items-start gap-1 w-full">
                                  <span className={`text-[12px] sm:text-[13px] font-black uppercase italic tracking-tight leading-none ${isCurrentSelection ? 'text-yellow-500' : 'text-white'}`}>
                                    {formatTeamName(t)}
                                  </span>
                                  
                                  {stageLabels.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                      {stageLabels.map(lbl => (
                                        <span key={lbl} className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm tracking-widest ${isCurrentSelection ? 'bg-yellow-500/20 text-yellow-600' : 'bg-slate-800 text-slate-400'}`}>
                                          {lbl}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {isCurrentSelection && (
                                <div className="flex items-center justify-center bg-rose-500 rounded-full w-6 h-6 shadow-md text-white shrink-0 absolute right-3">
                                  <X size={14} strokeWidth={4} />
                                </div>
                              )}
                              
                              {isPickedByOther && (
                                <div className="flex items-center justify-center bg-slate-700 rounded-full w-6 h-6 shadow-md text-slate-300 shrink-0 absolute right-3" title="Rimuovi da altra cella per liberarla">
                                  <Trash2 size={12} strokeWidth={2} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                
                {TOURNAMENT_GROUPS.every(group => 
                   group.teams.filter(t => t.toLowerCase().includes(teamSearch.toLowerCase()) || formatTeamName(t).toLowerCase().includes(teamSearch.toLowerCase())).length === 0
                ) && (
                  <p className="text-center text-slate-500 font-black uppercase text-xs pt-10 pb-10">Nessuna squadra trovata</p>
                )}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-24 left-0 right-0 p-6 flex justify-center items-center gap-3 z-50 pointer-events-none">
        {!isExpired && (
          <button onClick={resetBracket} disabled={loading} className="pointer-events-auto p-6 bg-slate-900 border-2 border-slate-800 rounded-2xl text-rose-500 active:bg-rose-500 active:text-white transition-all shadow-2xl"><Trash2 size={24} /></button>
        )}
        <button onClick={saveBracket} disabled={loading || isExpired} className={`max-w-xs w-full py-6 rounded-2xl font-black uppercase text-sm italic flex items-center justify-center gap-3 transition-all tracking-widest shadow-2xl pointer-events-auto ${isExpired ? 'bg-slate-900 text-slate-700 border border-slate-800' : 'bg-yellow-500 text-slate-950 active:scale-95 shadow-yellow-500/40'}`}>
          {loading ? 'Salvataggio...' : isExpired ? 'Pronostici Chiusi' : 'Salva Tabellone 🏆'}
        </button>
      </div>
    </main>
  );
}