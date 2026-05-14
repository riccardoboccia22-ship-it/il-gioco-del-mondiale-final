'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Shield, ChevronDown, ChevronUp, Clock, Eraser, Loader2, CheckCircle2 } from 'lucide-react';

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

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState<any>({});
  
  // Stati per l'autosalvataggio UI
  const [savingMatches, setSavingMatches] = useState<{ [key: number]: boolean }>({});
  const [savedMatches, setSavedMatches] = useState<{ [key: number]: boolean }>({});
  
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({ 'Gruppo A': true });
  const [userId, setUserId] = useState<string | null>(null);

  const saveTimeouts = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const router = useRouter();
  const isExpired = new Date() > WORLD_CUP_START_DATE;

  useEffect(() => {
    fetchData();
    return () => {
      Object.values(saveTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
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
        predsRes.data.forEach((p) => {
          predMap[p.match_id] = { home: p.home_score.toString(), away: p.away_score.toString() };
        });
        setPredictions(predMap);
      }
    } catch (error) {
      toast.error('Errore di connessione. Ricarica la pagina.');
    } finally {
      setLoading(false);
    }
  }

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const getFlagCode = (team: string) => flagMap[team?.toLowerCase().trim()];

  const formatTeamName = (teamName: string) => {
    if (!teamName) return '';
    const lower = teamName.toLowerCase().trim();
    if (lower === 'repubblica democratica del congo') return 'R. D. Congo';
    if (lower === 'bosnia ed erzegovina' || lower === 'bosnia erzegovina') return 'Bosnia';
    return teamName;
  };

  const saveSinglePrediction = async (matchId: number, homeVal: string, awayVal: string) => {
    if (!userId || isExpired) return;
    
    setSavingMatches(prev => ({ ...prev, [matchId]: true }));
    setSavedMatches(prev => ({ ...prev, [matchId]: false }));

    try {
      const { error } = await supabase.from('predictions').upsert({
        user_id: userId,
        match_id: matchId,
        home_score: parseInt(homeVal),
        away_score: parseInt(awayVal)
      }, { onConflict: 'user_id, match_id' });

      if (error) throw error;

      setSavedMatches(prev => ({ ...prev, [matchId]: true }));
      setTimeout(() => {
        setSavedMatches(prev => ({ ...prev, [matchId]: false }));
      }, 3000);

    } catch (error) {
      toast.error('Errore durante il salvataggio automatico.');
    } finally {
      setSavingMatches(prev => ({ ...prev, [matchId]: false }));
    }
  };

  const handleInputChange = (matchId: number, team: 'home' | 'away', value: string) => {
    if (isExpired) return;
    
    // Solo numeri, max 2 cifre
    const cleanValue = value.replace(/[^0-9]/g, '').slice(0, 2); 
    const updatedMatch = { ...predictions[matchId], [team]: cleanValue };
    
    setPredictions((prev: any) => ({ ...prev, [matchId]: updatedMatch }));

    if (team === 'home' && cleanValue !== '') {
      const nextInput = document.getElementById(`away-input-${matchId}`);
      if (nextInput) nextInput.focus();
    }

    if (saveTimeouts.current[matchId]) clearTimeout(saveTimeouts.current[matchId]);

    // Se entrambi i campi hanno un valore, partono 800ms prima di salvare su Supabase
    if (updatedMatch.home !== '' && updatedMatch.away !== '' && updatedMatch.home !== undefined && updatedMatch.away !== undefined) {
      saveTimeouts.current[matchId] = setTimeout(() => {
        saveSinglePrediction(matchId, updatedMatch.home, updatedMatch.away);
      }, 800);
    }
  };

  const resetGroup = async (e: React.MouseEvent, groupMatchesArray: any[]) => {
    e.stopPropagation();
    if (isExpired) return;

    if (window.confirm('Vuoi svuotare e azzerare i pronostici inseriti per questo girone?')) {
      try {
        if (!userId) throw new Error('Utente non trovato');
        const matchIds = groupMatchesArray.map((m) => m.id);

        const { error } = await supabase
          .from('predictions')
          .delete()
          .eq('user_id', userId)
          .in('match_id', matchIds);

        if (error) throw error;

        const newPredictions = { ...predictions };
        matchIds.forEach((id) => { delete newPredictions[id]; });
        setPredictions(newPredictions);
        toast.success('Girone azzerato!', { icon: '🧹' });
      } catch (err: any) {
        toast.error("Errore durante l'azzeramento");
      }
    }
  };

  const groupMatches = () => {
    const grouped: { [key: string]: any[] } = {};
    tournamentGroups.forEach(g => { grouped[g.name] = []; });
    matches.forEach(m => {
      const group = tournamentGroups.find(g => g.teams.some(t => t.toLowerCase() === m.home_team.toLowerCase() || t.toLowerCase() === m.away_team.toLowerCase()));
      if (group) grouped[group.name].push(m);
    });
    return grouped;
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
      <Loader2 className="w-16 h-16 text-yellow-500 animate-spin" />
      <p className="text-yellow-500 font-black uppercase text-lg animate-pulse tracking-widest">Preparazione Campo...</p>
    </div>
  );

  const groupedMatches = groupMatches();

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-32 font-sans">
      <div className="max-w-2xl mx-auto">
        <header className="mb-10 pt-4 text-center">
          <h1 className="text-5xl font-black text-yellow-500 mb-3 uppercase italic tracking-tighter drop-shadow-md">
            I Gironi
          </h1>
          <div className="inline-flex items-center gap-2 bg-slate-900 border-2 border-slate-800 px-6 py-3 rounded-2xl shadow-lg">
            {isExpired ? <Shield size={18} className="text-rose-500" /> : <Clock size={18} className="text-emerald-500" />}
            <p className="text-xs font-black uppercase tracking-widest text-slate-300">
              {isExpired ? 'Fase Chiusa' : 'Salvataggio Automatico Attivo'}
            </p>
          </div>
        </header>

        <div className="space-y-6">
          {Object.entries(groupedMatches).map(([groupName, groupMatchesArray]) => {
            if (groupMatchesArray.length === 0) return null;
            const isOpen = openGroups[groupName];
            const groupFlags = tournamentGroups.find(g => g.name === groupName)?.teams.map(getFlagCode).filter(Boolean) || [];

            return (
              <div key={groupName} className={`bg-slate-900 border-2 rounded-[2rem] overflow-hidden transition-all duration-300 shadow-xl ${isOpen ? 'border-yellow-500/50 shadow-yellow-500/10' : 'border-slate-800'}`}>
                
                <button onClick={() => toggleGroup(groupName)} className="w-full p-6 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 border-2 ${isOpen ? 'bg-yellow-500 text-slate-950 border-yellow-400' : 'bg-slate-950 border-slate-700 text-slate-400'}`}>
                      {groupName.split(' ')[1]}
                    </div>
                    <div className="text-left">
                      <h2 className="font-black text-xl uppercase italic text-white tracking-tight leading-none mb-2">{groupName}</h2>
                      <div className="flex gap-2">
                        {groupFlags.map((code, i) => <img key={i} src={`https://flagcdn.com/w40/${code}.png`} className="w-8 h-5 object-cover rounded shadow border border-slate-700" alt="" />)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-3">
                    {!isExpired && isOpen && (
                      <div onClick={(e) => resetGroup(e, groupMatchesArray)} className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-rose-500 hover:border-rose-500/50 transition-all active:scale-95">
                        <Eraser size={14} />
                      </div>
                    )}
                    <div className="p-3 bg-slate-950 rounded-full border border-slate-800">
                      {isOpen ? <ChevronUp size={24} className="text-yellow-500" /> : <ChevronDown size={24} className="text-slate-500" />}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="p-4 sm:p-6 bg-slate-950/50 space-y-4 border-t-2 border-slate-800/50">
                    {groupMatchesArray.map((match) => {
                      const hFlag = getFlagCode(match.home_team);
                      const aFlag = getFlagCode(match.away_team);
                      const isMatchSaving = savingMatches[match.id];
                      const isMatchSaved = savedMatches[match.id];

                      return (
                        <div key={match.id} className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 shadow-lg relative">
                          
                          <div className="flex justify-between items-center mb-4 border-b border-slate-800/50 pb-3">
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                              {new Date(match.match_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div className="flex items-center gap-2">
                               {isMatchSaving && <Loader2 size={14} className="text-yellow-500 animate-spin" />}
                               {isMatchSaved && !isMatchSaving && <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 uppercase tracking-widest animate-in fade-in"><CheckCircle2 size={14} /> Salvato</span>}
                               <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-2">M #{match.id}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 flex flex-col items-center gap-2">
                              {hFlag ? <img src={`https://flagcdn.com/w80/${hFlag}.png`} className="w-12 h-8 sm:w-16 sm:h-10 object-cover rounded-md shadow-md" alt="" /> : <Shield className="w-8 h-8 text-slate-700" />}
                              <span className="font-black text-xs sm:text-sm uppercase text-slate-200 text-center leading-tight truncate w-full">{formatTeamName(match.home_team)}</span>
                            </div>

                            <div className={`flex items-center gap-2 p-2 sm:p-3 rounded-2xl border-2 shadow-inner transition-colors ${isMatchSaved ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-slate-950 border-slate-800'}`}>
                              <input
                                type="tel"
                                value={predictions[match.id]?.home ?? ''}
                                disabled={isExpired}
                                placeholder="-"
                                className="w-14 h-16 sm:w-16 sm:h-16 bg-slate-800 border-2 border-slate-700 rounded-xl text-center font-black text-yellow-500 text-3xl focus:border-yellow-500 focus:bg-slate-900 outline-none transition-all disabled:opacity-50"
                                onChange={(e) => handleInputChange(match.id, 'home', e.target.value)}
                              />
                              <span className="text-slate-600 font-black text-xl">:</span>
                              <input
                                id={`away-input-${match.id}`}
                                type="tel"
                                value={predictions[match.id]?.away ?? ''}
                                disabled={isExpired}
                                placeholder="-"
                                className="w-14 h-16 sm:w-16 sm:h-16 bg-slate-800 border-2 border-slate-700 rounded-xl text-center font-black text-yellow-500 text-3xl focus:border-yellow-500 focus:bg-slate-900 outline-none transition-all disabled:opacity-50"
                                onChange={(e) => handleInputChange(match.id, 'away', e.target.value)}
                              />
                            </div>

                            <div className="flex-1 flex flex-col items-center gap-2">
                              {aFlag ? <img src={`https://flagcdn.com/w80/${aFlag}.png`} className="w-12 h-8 sm:w-16 sm:h-10 object-cover rounded-md shadow-md" alt="" /> : <Shield className="w-8 h-8 text-slate-700" />}
                              <span className="font-black text-xs sm:text-sm uppercase text-slate-200 text-center leading-tight truncate w-full">{formatTeamName(match.away_team)}</span>
                            </div>
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
      </div>
    </main>
  );
}