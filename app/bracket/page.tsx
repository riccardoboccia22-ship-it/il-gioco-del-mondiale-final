'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { ChevronDown, X, ShieldCheck, Trash2, Map, Info, Trophy, Search } from 'lucide-react';

// CONFIGURAZIONE DATA INIZIO MONDIALE
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
  belgio: 'be', 'bosnia ed erzegovina': 'ba', brasile: 'br', canada: 'ca', 'capo verde': 'cv',
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
  if (name.trim().toLowerCase() === 'repubblica democratica del congo') return 'R. D. Congo';
  if (name.trim().toLowerCase() === 'stati uniti') return 'USA';
  if (name.trim().toLowerCase() === 'bosnia ed erzegovina') return 'Bosnia';
  return name;
};

export default function BracketPage() {
  const [selections, setSelections] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // STATO PER IL PANNELLO DI SELEZIONE
  const [activeCell, setActiveCell] = useState<{stageId: string, index: number} | null>(null);

  const isExpired = new Date() > WORLD_CUP_START_DATE;

  useEffect(() => {
    loadSavedBracket();
  }, []);

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
    setActiveCell(null); // Chiude il pannello dopo la selezione
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

  if (fetching) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-yellow-500 font-black animate-pulse italic uppercase">Disegno Tabellone...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-48 font-sans">
      <header className="text-center mb-10 pt-4 flex flex-col items-center">
        <h1 className="text-4xl font-black text-yellow-500 uppercase italic tracking-tighter">Fase Finale</h1>
        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] mt-2 italic">
          {isExpired ? '🔒 Pronostici Conclusi' : 'Dalla fase a eliminazione al Titolo'}
        </p>
        <Link href="/groups" className="mt-5 inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-blue-600/30 active:scale-95 shadow-lg">
          <Map size={14} /> Consulta i Gironi Ufficiali
        </Link>
      </header>

      <div className={`max-w-4xl mx-auto space-y-12 ${isExpired ? 'opacity-70 pointer-events-none' : ''}`}>
        {STAGES.map((stage) => (
          <section key={stage.id} className="relative">
            <div className="flex flex-col mb-6">
              <div className="flex items-center gap-3 px-2">
                <span className="bg-yellow-500 text-slate-950 text-[9px] font-black px-2 py-1 rounded italic flex items-center gap-1">
                  <ShieldCheck size={10} strokeWidth={3} /> {stage.pts} PT
                </span>
                <h2 className="text-lg font-black text-white uppercase italic tracking-tight">{stage.label}</h2>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-800 to-transparent"></div>
              </div>
              {stage.id === 'R32' && (
                <div className="mt-3 mx-2 bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex items-start sm:items-center gap-3 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase">
                  <Info size={16} className="text-blue-500 shrink-0" />
                  <p>Si qualificano le <span className="text-white">prime 2</span> e le <span className="text-white">8 migliori terze</span>.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              {Array.from({ length: stage.count }).map((_, i) => {
                const currentSelection = selections[`${stage.id}-${i}`];
                return (
                  <div key={i} className="relative">
                    {/* IL FINTO SELECT (BOTTONE) */}
                    <button
                      disabled={isExpired}
                      onClick={() => setActiveCell({stageId: stage.id, index: i})}
                      className={`w-full bg-slate-900 border-2 rounded-xl sm:rounded-2xl py-3.5 pl-10 pr-8 sm:p-4 sm:pl-12 text-[8px] sm:text-[11px] font-black uppercase transition-all text-left truncate flex items-center gap-2
                        ${currentSelection ? 'border-yellow-500/40 text-yellow-500 shadow-lg shadow-yellow-500/5' : 'border-slate-800 text-slate-600'}`}
                    >
                      <div className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2">
                        {currentSelection ? (
                          <img src={getFlag(currentSelection)!} className="w-5 sm:w-6 h-auto rounded-sm shadow-sm" alt="" />
                        ) : (
                          <ShieldCheck className="text-slate-700 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </div>
                      {currentSelection ? formatTeamName(currentSelection) : 'Scegli'}
                    </button>

                    {currentSelection && !isExpired && (
                      <button onClick={() => handleSelect(stage.id, i, '')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 bg-slate-800 rounded-md hover:bg-rose-500">
                        <X className="text-white w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </button>
                    )}
                    {!currentSelection && <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" />}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* --- CUSTOM BOTTOM SHEET (IL NUOVO MENU) --- */}
      {activeCell && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-0 sm:pb-10">
          {/* Backdrop scuro */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setActiveCell(null)}></div>
          
          {/* Il Pannello */}
          <div className="relative w-full max-w-lg bg-slate-900 border-t-2 border-x-2 border-yellow-500/30 rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
            
            {/* Header del Pannello */}
            <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-yellow-500 font-black uppercase italic tracking-tight">Seleziona Squadra</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase">{STAGES.find(s => s.id === activeCell.stageId)?.label} - Pos. {activeCell.index + 1}</p>
              </div>
              <button onClick={() => setActiveCell(null)} className="p-3 bg-slate-800 rounded-full text-slate-400"><X size={20}/></button>
            </div>

            {/* Lista Squadre (Scrollabile) */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-900">
              <div className="grid grid-cols-1 gap-6">
                {TOURNAMENT_GROUPS.map((group) => {
                  const alreadySelected = getAlreadySelectedInStage(activeCell.stageId, activeCell.index);
                  const availableTeams = group.teams.filter(t => !alreadySelected.includes(t));
                  if (availableTeams.length === 0) return null;

                  return (
                    <div key={group.name} className="space-y-3">
                      <div className="flex items-center gap-2 px-2">
                        <Trophy size={12} className="text-yellow-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{group.name}</span>
                        <div className="flex-1 h-px bg-slate-800"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {group.teams.map((t) => {
                          const isPicked = alreadySelected.includes(t);
                          return (
                            <button
                              key={t}
                              disabled={isPicked}
                              onClick={() => handleSelect(activeCell.stageId, activeCell.index, t)}
                              className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left
                                ${isPicked 
                                  ? 'opacity-20 border-transparent grayscale' 
                                  : 'bg-slate-950 border-slate-800 active:border-yellow-500 active:scale-95'}`}
                            >
                              <img src={getFlag(t)!} className="w-6 h-auto rounded shadow" alt="" />
                              <span className="text-[10px] font-black uppercase italic">{formatTeamName(t)}</span>
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
        </div>
      )}

      {/* FOOTER AZIONI */}
      <div className="fixed bottom-24 left-0 right-0 p-4 sm:p-6 flex justify-center items-center gap-2 sm:gap-3 z-50 pointer-events-none">
        {!isExpired && (
          <button onClick={resetBracket} disabled={loading} className="pointer-events-auto p-5 bg-slate-900 border-2 border-slate-800 rounded-2xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-xl"><Trash2 size={18} /></button>
        )}
        <button onClick={saveBracket} disabled={loading || isExpired} className={`max-w-xs w-full py-5 rounded-2xl font-black uppercase text-xs italic flex items-center justify-center gap-3 transition-all tracking-widest shadow-2xl pointer-events-auto ${isExpired ? 'bg-slate-900 text-slate-700 border border-slate-800' : 'bg-yellow-500 text-slate-950 hover:scale-105 shadow-yellow-500/30'}`}>
          {loading ? 'Salvataggio...' : isExpired ? 'Pronostici Chiusi' : 'Salva Tabellone 🏆'}
        </button>
      </div>
    </main>
  );
}