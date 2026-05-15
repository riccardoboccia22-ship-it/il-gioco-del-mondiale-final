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
  const [savingMatches, setSavingMatches] = useState<{ [key: number]: boolean }>({});
  const [savedMatches, setSavedMatches] = useState<{ [key: number]: boolean }>({});
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({ 'Gruppo A': true });
  const [userId, setUserId] = useState<string | null>(null);

  const saveTimeouts = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const router = useRouter();
  const isExpired = new Date() > WORLD_CUP_START_DATE;

  useEffect(() => {
    fetchData();
    return () => { Object.values(saveTimeouts.current).forEach(clearTimeout); };
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }
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
      toast.error('Errore di connessicatione.');
    } finally {
      setLoading(false);
    }
  }

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const getFlagCode = (team: string) => flagMap[team?.toLowerCase().trim()];

  // FUNZIONE DI FORMATTAZIONE POTENZIATA PER NOMI LUNGHI
  const formatTeamName = (teamName: string) => {
    if (!teamName) return '';
    const name = teamName.toLowerCase().trim();
    if (name === 'repubblica democratica del congo') return 'R.D. Congo';
    if (name === 'repubblica ceca') return 'Rep. Ceca';
    if (name === 'corea del sud') return 'Corea Sud';
    if (name === 'arabia saudita') return 'Arabia S.';
    if (name === 'nuova zelanda') return 'N. Zelanda';
    if (name === 'bosnia ed erzegovina' || name === 'bosnia erzegovina') return 'Bosnia';
    if (name === "costa d'avorio") return 'Costa Avorio';
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

    if (team === 'home' && cleanValue !== '') {
      document.getElementById(`away-input-${matchId}`)?.focus();
    }

    if (saveTimeouts.current[matchId]) clearTimeout(saveTimeouts.current[matchId]);
    if (updatedMatch.home !== '' && updatedMatch.away !== '' && updatedMatch.home !== undefined && updatedMatch.away !== undefined) {
      saveTimeouts.current[matchId] = setTimeout(() => {
        saveSinglePrediction(matchId, updatedMatch.home, updatedMatch.away);
      }, 800);
    }
  };

  const resetGroup = async (e: React.MouseEvent, groupMatchesArray: any[]) => {
    e.stopPropagation();
    if (isExpired) return;
    if (window.confirm('Azzera i pronostici del girone?')) {
      try {
        const matchIds = groupMatchesArray.map((m) => m.id);
        await supabase.from('predictions').delete().eq('user_id', userId).in('match_id', matchIds);
        const newPredictions = { ...predictions };
        matchIds.forEach((id) => { delete newPredictions[id]; });
        setPredictions(newPredictions);
        toast.success('Girone svuotato!');
      } catch (err) { toast.error("Errore reset"); }
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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="w-16 h-16 text-yellow-500 animate-spin mb-4" />
      <p className="text-yellow-500 font-black uppercase text-lg animate-pulse">Preparazione Campo...</p>
    </div>
  );

  const groupedMatches = groupMatches();

  return (
    <main className="min-h-screen bg-slate-950 text-white p-3 pb-32 font-sans overflow-x-hidden">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 pt-4 text-center">
          <h1 className="text-4xl font-black text-yellow-500 mb-3 uppercase italic tracking-tighter">I Gironi</h1>
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl shadow-lg">
            {isExpired ? <Shield size={14} className="text-rose-500" /> : <Clock size={14} className="text-emerald-500" />}
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {isExpired ? 'Fase Chiusa' : 'Autosalvataggio Attivo'}
            </p>
          </div>
        </header>

        <div className="space-y-5">
          {Object.entries(groupedMatches).map(([groupName, groupMatchesArray]) => {
            if (groupMatchesArray.length === 0) return null;
            const isOpen = openGroups[groupName];
            const groupFlags = tournamentGroups.find(g => g.name === groupName)?.teams.map(getFlagCode).filter(Boolean) || [];

            return (
              <div key={groupName} className={`bg-slate-900 border-2 rounded-[2rem] overflow-hidden transition-all duration-300 shadow-xl ${isOpen ? 'border-yellow-500/30' : 'border-slate-800'}`}>
                
                <button onClick={() => toggleGroup(groupName)} className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shrink-0 border ${isOpen ? 'bg-yellow-500 text-slate-950 border-yellow-400' : 'bg-slate-950 border-slate-700 text-slate-400'}`}>
                      {groupName.split(' ')[1]}
                    </div>
                    <div className="text-left">
                      <h2 className="font-black text-base uppercase italic text-white leading-none mb-1.5">{groupName}</h2>
                      <div className="flex gap-1.5">
                        {groupFlags.map((code, i) => <img key={i} src={`https://flagcdn.com/w40/${code}.png`} className="w-5 h-3.5 object-cover rounded shadow border border-slate-800" alt="" />)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isExpired && isOpen && (
                      <div onClick={(e) => resetGroup(e, groupMatchesArray)} className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-500 hover:text-rose-500 transition-all"><Eraser size={14} /></div>
                    )}
                    <div className="p-2 bg-slate-950 rounded-full border border-slate-800">
                      {isOpen ? <ChevronUp size={18} className="text-yellow-500" /> : <ChevronDown size={18} className="text-slate-500" />}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="p-3 sm:p-4 bg-slate-950/50 space-y-3 border-t border-slate-800/50">
                    {groupMatchesArray.map((match) => {
                      const hFlag = getFlagCode(match.home_team);
                      const aFlag = getFlagCode(match.away_team);
                      const isSaving = savingMatches[match.id];
                      const isSaved = savedMatches[match.id];

                      return (
                        <div key={match.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-md relative overflow-hidden">
                          <div className="flex justify-between items-center mb-3 border-b border-slate-800/30 pb-2">
                            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{new Date(match.match_date).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            <div className="flex items-center gap-1.5">
                               {isSaving && <Loader2 size={10} className="text-yellow-500 animate-spin" />}
                               {isSaved && <span className="flex items-center gap-1 text-[8px] font-black text-emerald-400 uppercase"><CheckCircle2 size={10} /> Ok</span>}
                               <span className="text-[8px] font-black uppercase text-slate-600 ml-1">M#{match.id}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between w-full">
                            {/* Squadra Casa (30%) */}
                            <div className="w-[32%] flex flex-col items-center gap-1.5">
                              {hFlag ? <img src={`https://flagcdn.com/w40/${hFlag}.png`} className="w-8 h-5.5 object-cover rounded shadow-sm border border-slate-800" alt="" /> : <Shield size={14} className="text-slate-800" />}
                              <span className="font-black text-[9px] uppercase text-slate-200 text-center leading-tight whitespace-normal break-words w-full italic">
                                {formatTeamName(match.home_team)}
                              </span>
                            </div>

                            {/* Punteggio (36%) */}
                            <div className={`flex items-center gap-1.5 p-1.5 rounded-xl border transition-colors ${isSaved ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-950 border-slate-800'}`}>
                              <input
                                type="tel"
                                value={predictions[match.id]?.home ?? ''}
                                disabled={isExpired}
                                placeholder="-"
                                className="w-10 h-11 bg-slate-800 border border-slate-700 rounded-lg text-center font-black text-yellow-500 text-xl focus:border-yellow-500 focus:bg-slate-900 outline-none"
                                onChange={(e) => handleInputChange(match.id, 'home', e.target.value)}
                              />
                              <span className="text-slate-700 font-black text-sm">:</span>
                              <input
                                id={`away-input-${match.id}`}
                                type="tel"
                                value={predictions[match.id]?.away ?? ''}
                                disabled={isExpired}
                                placeholder="-"
                                className="w-10 h-11 bg-slate-800 border border-slate-700 rounded-lg text-center font-black text-yellow-500 text-xl focus:border-yellow-500 focus:bg-slate-900 outline-none"
                                onChange={(e) => handleInputChange(match.id, 'away', e.target.value)}
                              />
                            </div>

                            {/* Squadra Trasferta (30%) */}
                            <div className="w-[32%] flex flex-col items-center gap-1.5">
                              {aFlag ? <img src={`https://flagcdn.com/w40/${aFlag}.png`} className="w-8 h-5.5 object-cover rounded shadow-sm border border-slate-800" alt="" /> : <Shield size={14} className="text-slate-800" />}
                              <span className="font-black text-[9px] uppercase text-slate-200 text-center leading-tight whitespace-normal break-words w-full italic">
                                {formatTeamName(match.away_team)}
                              </span>
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