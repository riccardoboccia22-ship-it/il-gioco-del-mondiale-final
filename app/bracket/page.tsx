'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { ChevronDown, X, ShieldCheck, Trash2, Map, Info, Trophy, BarChart3 } from 'lucide-react';

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
  if (n === 'repubblica democratica del congo') return 'R. D. Congo';
  if (n === 'stati uniti') return 'USA';
  if (n === 'bosnia ed erzegovina') return 'Bosnia';
  if (n === 'nuova zelanda') return 'N. Zelanda';
  if (n === 'arabia saudita') return 'Arabia S.';
  if (n === 'repubblica ceca') return 'Rep. Ceca';
  return name;
};

export default function BracketPage() {
  const [selections, setSelections] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [activeCell, setActiveCell] = useState<any>(null);
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
    }
  }, [activeCell]);

  async function loadSavedBracket() {
    try {
      setFetching(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
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
        <h1 className="text-4xl font-black text-yellow-500 uppercase italic tracking-tighter leading-none">Fase Finale</h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 italic">
          {isExpired ? '🔒 Pronostici Conclusi' : 'Dalla fase a eliminazione al Titolo'}
        </p>
        
        {/* BOTTONI NAVIGAZIONE */}
        <div className="flex gap-2 mt-6">
          <Link href="/groups" className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-400 px-4 py-3 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 active:scale-95 shadow-lg">
            <Map size={14} /> Gironi
          </Link>
          <Link href="/simulatore" className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 px-4 py-3 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all hover:bg-blue-600/30 active:scale-95 shadow-lg">
            <BarChart3 size={14} /> Simulatore
          </Link>
        </div>
      </header>

      <div className={`max-w-4xl mx-auto space-y-12 ${isExpired ? 'opacity-70 pointer-events-none' : ''}`}>
        {STAGES.map((stage) => (
          <section key={stage.id} className="relative">
            <div className="flex flex-col mb-6">
              <div className="flex items-center gap-3 px-2">
                <span className="bg-yellow-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded italic flex items-center gap-1 shrink-0">
                  {stage.pts} PT
                </span>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tight shrink-0">{stage.label}</h2>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-800 to-transparent"></div>
              </div>
              {stage.id === 'R32' && (
                <div className="mt-3 mx-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex items-start sm:items-center gap-3 text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-tight">
                  <Info size={20} className="text-blue-500 shrink-0" />
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p>L'ordine non conta: seleziona le 32 squadre che supereranno la fase a gironi.</p>
                    <p>Si qualificano le prime 2 di ogni girone e le 8 migliori terze.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: stage.count }).map((_, i) => {
                const currentSelection = selections[`${stage.id}-${i}`];
                const cellNumber = i + 1; // Numero della cella
                
                return (
                  <div key={i} className="relative">
                    <button
                      disabled={isExpired}
                      onClick={() => setActiveCell({stageId: stage.id, index: i})}
                      // Padding robusto per proteggere il testo
                      className={`w-full bg-slate-900 border-2 rounded-2xl py-4 pl-16 pr-14 sm:p-5 sm:pl-20 sm:pr-16 text-[13px] sm:text-[14px] font-black uppercase transition-all text-left truncate flex items-center
                        ${currentSelection ? 'border-yellow-500/50 text-yellow-500 shadow-xl shadow-yellow-500/5' : 'border-slate-800 text-slate-600'}`}
                    >
                      {/* NUMERO DELLA CELLA */}
                      <span className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[10px] sm:text-[11px] font-black w-4 text-right ${currentSelection ? 'text-yellow-600/50' : 'text-slate-700'}`}>
                        {cellNumber}
                      </span>

                      {/* BANDIERA */}
                      <div className="absolute left-9 sm:left-11 top-1/2 -translate-y-1/2">
                        {currentSelection ? (
                          <img src={getFlag(currentSelection)!} className="w-6 sm:w-8 h-auto rounded shadow-sm" alt="" />
                        ) : (
                          <ShieldCheck className="text-slate-800 w-5 h-5" />
                        )}
                      </div>
                      
                      {/* TESTO TAGLIATO SE TROPPO LUNGO */}
                      <span className="truncate w-full">
                        {currentSelection ? formatTeamName(currentSelection) : 'Scegli'}
                      </span>
                    </button>

                    {/* BOTTONE X ESTERNO (sempre al sicuro dal testo) */}
                    {currentSelection && !isExpired && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleSelect(stage.id, i, ''); }} 
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 text-rose-500 hover:text-rose-400 active:scale-90 transition-all z-20"
                      >
                        <X size={22} strokeWidth={3} />
                      </button>
                    )}
                    
                    {!currentSelection && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-800 pointer-events-none">
                        <ChevronDown size={16} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* --- MENU MAGICO CON SBLOCCO RAPIDO SQUADRE --- */}
      {activeCell && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-0 pb-0 sm:pb-10">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setActiveCell(null)}></div>
          
          <div className="relative w-full max-w-xl bg-slate-900 border-t-2 border-yellow-500/40 rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
            
            <div className="p-7 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-yellow-500 text-xl font-black uppercase italic tracking-tight">Seleziona Squadra</h3>
                <p className="text-slate-500 text-xs font-black uppercase mt-1 tracking-widest">
                  {STAGES.find(s => s.id === activeCell.stageId)?.label} — POS. {activeCell.index + 1}
                </p>
              </div>
              <button onClick={() => setActiveCell(null)} className="p-4 bg-slate-800 rounded-full text-white active:scale-90 transition-all shadow-lg"><X size={24} strokeWidth={3}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-8 bg-slate-900 custom-scrollbar pb-20">
                {TOURNAMENT_GROUPS.map((group) => {
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
                        {group.teams.map((t) => {
                          const isPickedByOther = alreadySelectedByOthers.includes(t);
                          const isCurrentSelection = currentCellSelection === t;
                          
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
                              className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all text-left relative overflow-hidden active:scale-95 ${buttonStyle}`}
                            >
                              <div className="flex items-center gap-4">
                                <img src={getFlag(t)!} className="w-9 h-auto rounded shadow-lg border border-slate-800" alt="" />
                                <span className={`text-[13px] font-black uppercase italic tracking-tight ${isCurrentSelection ? 'text-yellow-500' : 'text-white'}`}>
                                  {formatTeamName(t)}
                                </span>
                              </div>

                              {isCurrentSelection && (
                                <div className="flex items-center justify-center bg-rose-500 rounded-full w-6 h-6 shadow-md text-white shrink-0">
                                  <X size={14} strokeWidth={4} />
                                </div>
                              )}
                              
                              {isPickedByOther && (
                                <div className="flex items-center justify-center bg-slate-700 rounded-full w-6 h-6 shadow-md text-slate-300 shrink-0" title="Rimuovi da altra cella per liberarla">
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
            </div>
          </div>
        </div>
      )}

      {/* FOOTER AZIONI */}
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