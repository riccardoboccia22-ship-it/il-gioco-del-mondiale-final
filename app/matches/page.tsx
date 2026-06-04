'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Shield, ChevronDown, ChevronUp, Clock, Eraser, Loader2, CheckCircle2, ListFilter, BarChart3, CalendarDays, LayoutGrid } from 'lucide-react';
import confetti from 'canvas-confetti';

const WORLD_CUP_START_DATE = new Date('2026-06-11T21:00:00+02:00');

const flagMap: { [key: string]: string } = {
  algeria: 'dz', 'arabia saudita': 'sa', argentina: 'ar', australia: 'au', austria: 'at',
  belgio: 'be', 'bosnia ed erzegovina': 'ba', 'bosnia erzegovina': 'ba',
  brasile: 'br', canada: 'ca', 'capo verde': 'cv', colombia: 'co', 'corea del sud': 'kr', 
  "costa d'avorio": 'ci', croazia: 'hr', curaçao: 'cw', curacao: 'cw',
  ecuador: 'ec', egitto: 'eg', francia: 'fr', germania: 'de', ghana: 'gh', giappone: 'jp', 
  giordania: 'jo', haiti: 'ht', inghilterra: 'gb-eng', iran: 'ir', iraq: 'iq', marocco: 'ma', 
  messico: 'mx', norvegia: 'no', 'nuova zelanda': 'nz', olanda: 'nl', panama: 'pa', paraguay: 'py',
  portogallo: 'pt', qatar: 'qa', 'repubblica ceca': 'cz', 'repubblica democratica del congo': 'cd',
  scozia: 'gb-sct', senegal: 'sn', spagna: 'es', 'stati uniti': 'us', usa: 'us',
  sudafrica: 'za', svezia: 'se', svizzera: 'ch', tunisia: 'tn', turchia: 'tr', 
  uruguay: 'uy', uzbekistan: 'uz',
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

type FilterType = 'ALL' | 'TODO' | 'DONE';
type ViewMode = 'GROUP' | 'CHRONO';

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<any>({});
  const [savingMatches, setSavingMatches] = useState<{ [key: number]: boolean }>({});
  const [savedMatches, setSavedMatches] = useState<{ [key: number]: boolean }>({});
  
  // STATI PER LE VISTE
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({});
  const [openDays, setOpenDays] = useState<{ [key: string]: boolean }>({});
  
  const [userId, setUserId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('GROUP');
  
  const saveTimeouts = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const hasCelebrated = useRef(false);
  
  const router = useRouter();
  const isExpired = new Date() > WORLD_CUP_START_DATE;

  useEffect(() => {
    fetchData();
    return () => { Object.values(saveTimeouts.current).forEach(clearTimeout); };
  }, [router]);

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

      setUserId(user.id);

      const [matchesRes, predsRes] = await Promise.all([
        supabase.from('matches').select('*').order('match_date', { ascending: true }),
        supabase.from('predictions').select('*').eq('user_id', user.id)
      ]);

      setMatches(matchesRes.data || []);
      if (predsRes.data) {
        const predMap: any = {};
        let filledCount = 0;
        predsRes.data.forEach((p) => {
          predMap[p.match_id] = { home: p.home_score.toString(), away: p.away_score.toString() };
          if (p.home_score !== null && p.away_score !== null) filledCount++;
        });
        setPredictions(predMap);
        
        if (filledCount >= 72) hasCelebrated.current = true;
      }
    } catch (error) {
      toast.error('Errore di connessione.');
    } finally {
      setLoading(false);
    }
  }

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const toggleDay = (dayString: string) => {
    setOpenDays(prev => ({ ...prev, [dayString]: !prev[dayString] }));
  };

  const getFlagCode = (team: string) => flagMap[team?.toLowerCase().trim()];

  const formatTeamName = (teamName: string) => {
    if (!teamName) return '';
    const name = teamName.toLowerCase().trim();
    if (name === 'repubblica democratica del congo') return 'R.D. Congo';
    if (name === 'repubblica ceca') return 'Rep. Ceca';
    if (name === 'corea del sud') return 'Corea Sud';
    if (name === 'arabia saudita') return 'Arabia S.';
    if (name === 'nuova zelanda') return 'N. Zelanda';
    if (name === 'bosnia ed erzegovina' || name === 'bosnia erzegovina') return 'Bosnia';
    if (name === "costa d'avorio") return 'C. Avorio';
    if (name === "stati uniti") return 'USA';
    if (name.length > 12) return teamName.substring(0, 10) + '.';
    return teamName;
  };

  const saveSinglePrediction = async (matchId: number, homeVal: string, awayVal: string) => {
    if (!userId || isExpired) return;
    setSavingMatches(prev => ({ ...prev, [matchId]: true }));
    try {
      const { error } = await supabase.from('predictions').upsert({
        user_id: userId, match_id: matchId,
        home_score: parseInt(homeVal), away_score: parseInt(awayVal)
      }, { onConflict: 'user_id, match_id' });
      if (error) throw error;
      
      setSavedMatches(prev => ({ ...prev, [matchId]: true }));
      setTimeout(() => setSavedMatches(prev => ({ ...prev, [matchId]: false })), 2500);

      setPredictions((currentPreds: any) => {
        const totalFilled = Object.values(currentPreds).filter((p: any) => p.home !== '' && p.away !== '' && p.home !== undefined && p.away !== undefined).length;
        if (totalFilled >= 72 && !hasCelebrated.current) {
          hasCelebrated.current = true;
          setTimeout(() => {
            confetti({
              particleCount: 200,
              spread: 100,
              origin: { y: 0.5 },
              colors: ['#eab308', '#3b82f6', '#ef4444', '#22c55e', '#ffffff'],
              disableForReducedMotion: true
            });
            toast.success('Gironi Completati al 100%! 🎉', { duration: 4000, icon: '🏆' });
          }, 500);
        }
        return currentPreds;
      });

    } catch (error) {
      toast.error('Errore salvataggio.');
    } finally {
      setSavingMatches(prev => ({ ...prev, [matchId]: false }));
    }
  };

  const handleInputChange = (matchId: number, team: 'home' | 'away', value: string) => {
    if (isExpired) return;
    const cleanValue = value.replace(/[^0-9]/g, '').slice(0, 2); 
    const updatedMatch = { ...predictions[matchId], [team]: cleanValue };
    setPredictions((prev: any) => ({ ...prev, [matchId]: updatedMatch }));

    // Auto-focus sulla casella away se compiliamo la home
    if (team === 'home' && cleanValue !== '') {
      setTimeout(() => {
        document.getElementById(`away-input-${matchId}`)?.focus();
      }, 10);
    }

    if (saveTimeouts.current[matchId]) clearTimeout(saveTimeouts.current[matchId]);
    if (updatedMatch.home !== '' && updatedMatch.away !== '' && updatedMatch.home !== undefined && updatedMatch.away !== undefined) {
      saveTimeouts.current[matchId] = setTimeout(() => {
        saveSinglePrediction(matchId, updatedMatch.home, updatedMatch.away);
      }, 800);
    }
  };

  const resetGroupOrDay = async (e: React.MouseEvent, matchArray: any[]) => {
    e.stopPropagation();
    if (isExpired) return;
    if (window.confirm('Azzera i pronostici visibili in questa sezione?')) {
      try {
        const matchIds = matchArray.map((m) => m.id);
        await supabase.from('predictions').delete().eq('user_id', userId).in('match_id', matchIds);
        const newPredictions = { ...predictions };
        matchIds.forEach((id) => { delete newPredictions[id]; });
        setPredictions(newPredictions);
        hasCelebrated.current = false;
        toast.success('Pronostici azzerati!');
      } catch (err) { toast.error("Errore reset"); }
    }
  };

  // --- LOGICA VISTA GIRONI ---
  const filteredGroups = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};
    tournamentGroups.forEach(g => { grouped[g.name] = []; });
    
    matches.forEach(m => {
      const group = tournamentGroups.find(g => g.teams.some(t => t.toLowerCase() === m.home_team.toLowerCase() || t.toLowerCase() === m.away_team.toLowerCase()));
      if (group) grouped[group.name].push(m);
    });

    const result: { [key: string]: any[] } = {};

    Object.entries(grouped).forEach(([groupName, groupMatchesArray]) => {
      if (groupMatchesArray.length === 0) return;
      const filteredMatches = groupMatchesArray.filter(m => {
        const pred = predictions[m.id];
        const isMatchComplete = pred && pred.home !== '' && pred.home !== undefined && pred.away !== '' && pred.away !== undefined;
        if (activeFilter === 'TODO') return !isMatchComplete;
        if (activeFilter === 'DONE') return isMatchComplete;
        return true;
      });
      if (filteredMatches.length > 0) result[groupName] = filteredMatches;
    });

    const resultKeys = Object.keys(result);
    if (activeFilter === 'TODO' && resultKeys.length === 1 && viewMode === 'GROUP') {
        setOpenGroups(prev => ({ ...prev, [resultKeys[0]]: true }));
    }

    return result;
  }, [matches, predictions, activeFilter, viewMode]);

  // --- LOGICA VISTA CRONOLOGICA ---
  const filteredChrono = useMemo(() => {
    const groupedByDay: { [key: string]: any[] } = {};
    
    matches.forEach(m => {
      const dayString = new Date(m.match_date).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
      const capitalizedDay = dayString.charAt(0).toUpperCase() + dayString.slice(1);
      
      if (!groupedByDay[capitalizedDay]) groupedByDay[capitalizedDay] = [];
      groupedByDay[capitalizedDay].push(m);
    });

    const result: { [key: string]: any[] } = {};

    Object.entries(groupedByDay).forEach(([dayName, dayMatchesArray]) => {
      const filteredMatches = dayMatchesArray.filter(m => {
        const pred = predictions[m.id];
        const isMatchComplete = pred && pred.home !== '' && pred.home !== undefined && pred.away !== '' && pred.away !== undefined;
        if (activeFilter === 'TODO') return !isMatchComplete;
        if (activeFilter === 'DONE') return isMatchComplete;
        return true;
      });
      if (filteredMatches.length > 0) result[dayName] = filteredMatches;
    });

    const resultKeys = Object.keys(result);
    if (activeFilter === 'TODO' && resultKeys.length > 0 && viewMode === 'CHRONO') {
        setOpenDays(prev => ({ ...prev, [resultKeys[0]]: true }));
    }

    return result;
  }, [matches, predictions, activeFilter, viewMode]);

  // FUNZIONE DI RENDER DEL SINGOLO MATCH (Risolve il problema del focus perso)
  const renderMatch = (match: any) => {
    const hFlag = getFlagCode(match.home_team);
    const aFlag = getFlagCode(match.away_team);
    const isSaving = savingMatches[match.id];
    const isSaved = savedMatches[match.id];

    return (
      <div key={match.id} className="bg-slate-900 border-2 border-slate-800/80 rounded-[1.5rem] p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="flex justify-between items-center mb-4 border-b border-slate-800/50 pb-3">
          <span className="text-[9px] sm:text-[10px] font-black uppercase text-slate-400 tracking-widest">{new Date(match.match_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
          <div className="flex items-center gap-2">
             {isSaving && <Loader2 size={12} className="text-yellow-500 animate-spin" />}
             {isSaved && <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-black text-emerald-400 uppercase"><CheckCircle2 size={12} /> Salvato</span>}
             <span className="text-[9px] sm:text-[10px] font-black uppercase text-slate-600 ml-2">M#{match.id}</span>
          </div>
        </div>

        <div className="flex items-center justify-between w-full">
          <div className="w-[30%] flex flex-col items-center gap-2">
            {hFlag ? <img src={`https://flagcdn.com/w40/${hFlag}.png`} className="w-10 h-7 sm:w-12 sm:h-8 object-cover rounded shadow-md border border-slate-800" alt="" /> : <Shield size={20} className="text-slate-800" />}
            <span className="font-black text-[10px] sm:text-xs uppercase text-slate-200 text-center leading-tight whitespace-normal break-words w-full italic">
              {formatTeamName(match.home_team)}
            </span>
          </div>

          <div className={`flex items-center gap-2 p-2 rounded-2xl border-2 transition-colors ${isSaved ? 'bg-emerald-950/30 border-emerald-900/60' : 'bg-slate-950 border-slate-800'}`}>
            <input
              type="tel"
              value={predictions[match.id]?.home ?? ''}
              disabled={isExpired}
              placeholder="-"
              className="w-12 h-14 sm:w-14 sm:h-16 bg-slate-800 border border-slate-700 rounded-xl text-center font-black text-yellow-500 text-2xl sm:text-3xl focus:border-yellow-500 focus:bg-slate-900 outline-none shadow-inner transition-all"
              onChange={(e) => handleInputChange(match.id, 'home', e.target.value)}
            />
            <span className="text-slate-600 font-black text-lg">:</span>
            <input
              id={`away-input-${match.id}`}
              type="tel"
              value={predictions[match.id]?.away ?? ''}
              disabled={isExpired}
              placeholder="-"
              className="w-12 h-14 sm:w-14 sm:h-16 bg-slate-800 border border-slate-700 rounded-xl text-center font-black text-yellow-500 text-2xl sm:text-3xl focus:border-yellow-500 focus:bg-slate-900 outline-none shadow-inner transition-all"
              onChange={(e) => handleInputChange(match.id, 'away', e.target.value)}
            />
          </div>

          <div className="w-[30%] flex flex-col items-center gap-2">
            {aFlag ? <img src={`https://flagcdn.com/w40/${aFlag}.png`} className="w-10 h-7 sm:w-12 sm:h-8 object-cover rounded shadow-md border border-slate-800" alt="" /> : <Shield size={20} className="text-slate-800" />}
            <span className="font-black text-[10px] sm:text-xs uppercase text-slate-200 text-center leading-tight whitespace-normal break-words w-full italic">
              {formatTeamName(match.away_team)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="w-16 h-16 text-yellow-500 animate-spin mb-4" />
      <p className="text-yellow-500 font-black uppercase text-lg animate-pulse">Preparazione Campo...</p>
    </div>
  );

  const hasNoContent = viewMode === 'GROUP' ? Object.keys(filteredGroups).length === 0 : Object.keys(filteredChrono).length === 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-3 pb-32 font-sans overflow-x-hidden">
      <div className="max-w-2xl mx-auto">
        
        <header className="mb-6 pt-4 text-center flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-black text-yellow-500 mb-3 uppercase italic tracking-tighter">I Gironi</h1>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl shadow-lg">
              {isExpired ? <Shield size={14} className="text-rose-500" /> : <Clock size={14} className="text-emerald-500" />}
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {isExpired ? 'Fase Chiusa' : 'Autosalvataggio'}
              </p>
            </div>
            
            <button 
              onClick={() => router.push('/simulatore')}
              className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-blue-600/30 active:scale-95 shadow-lg"
            >
              <BarChart3 size={14} /> Simulatore
            </button>
          </div>
        </header>

        {/* CONTROLLI: VISTA & FILTRI */}
        <div className="flex flex-col gap-3 mb-6 mx-auto">
          
          {/* Selettore Modalità di Visualizzazione */}
          <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setViewMode('GROUP')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all ${
                viewMode === 'GROUP' ? 'bg-slate-800 text-yellow-500 shadow-md' : 'text-slate-500 hover:text-white'
              }`}
            >
              <LayoutGrid size={16} /> Per Girone
            </button>
            <button
              onClick={() => setViewMode('CHRONO')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all ${
                viewMode === 'CHRONO' ? 'bg-slate-800 text-yellow-500 shadow-md' : 'text-slate-500 hover:text-white'
              }`}
            >
              <CalendarDays size={16} /> Calendario
            </button>
          </div>

          {/* Barra dei Filtri di stato */}
          <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
            {[
              { id: 'ALL', label: 'Tutti' },
              { id: 'TODO', label: 'Da Giocare' },
              { id: 'DONE', label: 'Completati' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as FilterType)}
                className={`flex-1 py-3.5 sm:py-4 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all ${
                  activeFilter === f.id
                    ? 'bg-yellow-500 text-slate-950 shadow-lg'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {hasNoContent && (
            <div className="text-center py-10 opacity-50">
                <ListFilter className="mx-auto mb-4" size={32} />
                <p className="text-xs font-black uppercase tracking-widest">Nessun match in questa categoria</p>
            </div>
        )}

        <div className="space-y-5">
          {/* RENDER VISTA GIRONI */}
          {viewMode === 'GROUP' && Object.entries(filteredGroups).map(([groupName, groupMatchesArray]) => {
            const isOpen = openGroups[groupName];
            const groupFlags = tournamentGroups.find(g => g.name === groupName)?.teams.map(getFlagCode).filter(Boolean) || [];

            const totalMatches = groupMatchesArray.length;
            let filledMatches = 0;
            groupMatchesArray.forEach(m => {
              const pred = predictions[m.id];
              if (pred && pred.home !== '' && pred.home !== undefined && pred.away !== '' && pred.away !== undefined) filledMatches++;
            });
            const isCompleted = filledMatches === totalMatches && activeFilter !== 'TODO';

            return (
              <div key={groupName} className={`bg-slate-900 border-2 rounded-[2rem] overflow-hidden transition-all duration-300 shadow-xl ${isOpen ? 'border-yellow-500/30' : isCompleted ? 'border-emerald-500/20' : 'border-slate-800'}`}>
                
                <button onClick={() => toggleGroup(groupName)} className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl shrink-0 border-2 ${isOpen ? 'bg-yellow-500 text-slate-950 border-yellow-400' : isCompleted ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' : 'bg-slate-950 border-slate-700 text-slate-400'}`}>
                      {groupName.split(' ')[1]}
                    </div>
                    <div className="text-left">
                      <h2 className="font-black text-lg sm:text-xl uppercase italic text-white leading-none mb-2 flex items-center gap-2">
                          {groupName}
                          {isCompleted && !isOpen && <CheckCircle2 size={16} className="text-emerald-500" />}
                      </h2>
                      <div className="flex gap-2">
                        {groupFlags.map((code, i) => <img key={i} src={`https://flagcdn.com/w40/${code}.png`} className="w-6 h-4 sm:w-7 sm:h-5 object-cover rounded-sm shadow border border-slate-800" alt="" />)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isExpired && isOpen && (
                      <div onClick={(e) => resetGroupOrDay(e, groupMatchesArray)} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-rose-500 transition-all"><Eraser size={16} /></div>
                    )}
                    <div className="p-3 bg-slate-950 rounded-full border border-slate-800">
                      {isOpen ? <ChevronUp size={20} className="text-yellow-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="p-3 sm:p-5 bg-slate-950/50 space-y-4 border-t border-slate-800/50">
                    {groupMatchesArray.map((match) => renderMatch(match))}
                  </div>
                )}
              </div>
            );
          })}

          {/* RENDER VISTA CRONOLOGICA */}
          {viewMode === 'CHRONO' && Object.entries(filteredChrono).map(([dayName, dayMatchesArray]) => {
            const isOpen = openDays[dayName];
            
            const totalMatches = dayMatchesArray.length;
            let filledMatches = 0;
            dayMatchesArray.forEach(m => {
              const pred = predictions[m.id];
              if (pred && pred.home !== '' && pred.home !== undefined && pred.away !== '' && pred.away !== undefined) filledMatches++;
            });
            const isCompleted = filledMatches === totalMatches && activeFilter !== 'TODO';

            return (
              <div key={dayName} className={`bg-slate-900 border-2 rounded-[2rem] overflow-hidden transition-all duration-300 shadow-xl ${isOpen ? 'border-yellow-500/30' : isCompleted ? 'border-emerald-500/20' : 'border-slate-800'}`}>
                
                <button onClick={() => toggleDay(dayName)} className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 ${isOpen ? 'bg-yellow-500 text-slate-950 border-yellow-400' : isCompleted ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' : 'bg-slate-950 border-slate-700 text-slate-400'}`}>
                      <CalendarDays size={24} />
                    </div>
                    <div className="text-left">
                      <h2 className="font-black text-sm sm:text-base uppercase italic text-white leading-tight flex items-center gap-2">
                          {dayName}
                      </h2>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1 mt-1">
                          {isCompleted && !isOpen ? <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12}/> {totalMatches} Match Completi</span> : `${totalMatches} Partite`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isExpired && isOpen && (
                      <div onClick={(e) => resetGroupOrDay(e, dayMatchesArray)} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-rose-500 transition-all"><Eraser size={16} /></div>
                    )}
                    <div className="p-3 bg-slate-950 rounded-full border border-slate-800">
                      {isOpen ? <ChevronUp size={20} className="text-yellow-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="p-3 sm:p-5 bg-slate-950/50 space-y-4 border-t border-slate-800/50">
                    {dayMatchesArray.map((match) => renderMatch(match))}
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </div>
    </main>
  );
}