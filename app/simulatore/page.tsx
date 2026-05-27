'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Loader2, Calculator, ArrowLeft, Trophy, Wand2 } from 'lucide-react';

const WORLD_CUP_START_DATE = new Date('2026-06-11T21:00:00+02:00');

const TOURNAMENT_GROUPS = [
  { name: 'Gruppo A', teams: ['Messico', 'Sudafrica', 'Corea del Sud', 'Repubblica Ceca'] },
  { name: 'Gruppo B', teams: ['Canada', 'Svizzera', 'Qatar', 'Bosnia Erzegovina'] }, 
  { name: 'Gruppo C', teams: ['Brasile', 'Marocco', 'Haiti', 'Scozia'] },
  { name: 'Gruppo D', teams: ['Usa', 'Australia', 'Paraguay', 'Turchia'] }, 
  { name: 'Gruppo E', teams: ['Germania', "Costa d'avorio", 'Ecuador', 'Curacao'] }, 
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
  if (name === "stati uniti" || name === "usa") return 'USA';
  if (name.length > 12) return teamName.substring(0, 10) + '.';
  return teamName;
};

type TeamStats = {
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

export default function StandingsPage() {
  const [loading, setLoading] = useState(true);
  const [standings, setStandings] = useState<Record<string, TeamStats[]>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  const router = useRouter();
  const isExpired = new Date() > WORLD_CUP_START_DATE;

  useEffect(() => {
    calculateStandings();
  }, []);

  async function calculateStandings() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; }
      setUserId(user.id);

      const [matchesRes, predsRes] = await Promise.all([
        supabase.from('matches').select('*'),
        supabase.from('predictions').select('*').eq('user_id', user.id)
      ]);

      const matches = matchesRes.data || [];
      const predictions = predsRes.data || [];

      const calcStandings: Record<string, TeamStats[]> = {};
      
      TOURNAMENT_GROUPS.forEach(group => {
        calcStandings[group.name] = group.teams.map(team => ({
          name: team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0
        }));
      });

      predictions.forEach(pred => {
        if (pred.home_score === null || pred.away_score === null) return;
        
        const match = matches.find(m => String(m.id) === String(pred.match_id));
        if (!match) return;

        const homeTeam = match.home_team.trim().toLowerCase();
        const awayTeam = match.away_team.trim().toLowerCase();
        
        const group = TOURNAMENT_GROUPS.find(g => g.teams.some(t => t.trim().toLowerCase() === homeTeam));
        
        if (!group) return;

        const hStats = calcStandings[group.name].find(t => t.name.trim().toLowerCase() === homeTeam);
        const aStats = calcStandings[group.name].find(t => t.name.trim().toLowerCase() === awayTeam);

        if (hStats && aStats) {
          const hGoal = Number(pred.home_score);
          const aGoal = Number(pred.away_score);

          hStats.played += 1;
          aStats.played += 1;
          hStats.gf += hGoal;
          hStats.ga += aGoal;
          aStats.gf += aGoal;
          aStats.ga += hGoal;
          hStats.gd = hStats.gf - hStats.ga;
          aStats.gd = aStats.gf - aStats.ga;

          if (hGoal > aGoal) {
            hStats.won += 1; hStats.points += 3;
            aStats.lost += 1;
          } else if (hGoal < aGoal) {
            aStats.won += 1; aStats.points += 3;
            hStats.lost += 1;
          } else {
            hStats.drawn += 1; hStats.points += 1;
            aStats.drawn += 1; aStats.points += 1;
          }
        }
      });

      Object.keys(calcStandings).forEach(groupName => {
        calcStandings[groupName].sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.gd !== a.gd) return b.gd - a.gd;
          if (b.gf !== a.gf) return b.gf - a.gf;
          return a.name.localeCompare(b.name);
        });
      });

      setStandings(calcStandings);
    } catch (error) {
      toast.error('Errore nel calcolo delle classifiche');
    } finally {
      setLoading(false);
    }
  }

  const generateBracket = async () => {
    if (isExpired || !userId) return;
    
    const hasPlayed = Object.values(standings).some(group => group.some(t => t.played > 0));
    if (!hasPlayed) {
        toast.error("Non hai ancora inserito nessun pronostico nei gironi!");
        return;
    }

    if (!window.confirm('Verranno importate le 32 squadre qualificate nel tuo Tabellone Finale, sovrascrivendo i Sedicesimi attuali. Vuoi procedere?')) return;

    setIsImporting(true);
    const toastId = toast.loading('Generazione Tabellone...', { icon: '🪄' });

    try {
      let qualifiedTeams: string[] = [];
      let thirdPlaces: any[] = [];

      Object.keys(standings).forEach(groupName => {
        const groupTeams = standings[groupName];
        if(groupTeams.length >= 2) {
          qualifiedTeams.push(groupTeams[0].name, groupTeams[1].name);
        }
        if(groupTeams.length >= 3) {
          thirdPlaces.push(groupTeams[2]);
        }
      });

      thirdPlaces.sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name));
      const bestThirds = thirdPlaces.slice(0, 8).map(t => t.name);

      const all32Teams = [...qualifiedTeams, ...bestThirds];

      // --- TRADUTTORE NOMI PER IL TABELLONE ---
      const normalizeForBracket = (teamName: string) => {
        const lower = teamName.toLowerCase().trim();
        if (lower === 'usa') return 'Stati Uniti';
        if (lower === 'curacao') return 'Curaçao';
        if (lower === 'bosnia erzegovina') return 'Bosnia ed Erzegovina';
        return teamName;
      };

      await supabase.from('brackets').delete().eq('user_id', userId);

      const rows = all32Teams.map(t => ({
        user_id: userId,
        stage: 'R32',
        team_name: normalizeForBracket(t) // Applichiamo il traduttore qui!
      }));

      const { error } = await supabase.from('brackets').insert(rows);
      if (error) throw error;

      toast.success('Tabellone Generato! 🎉', { id: toastId });
      router.push('/bracket');
      
    } catch (error) {
      toast.error('Errore durante la generazione.', { id: toastId });
    } finally {
      setIsImporting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="w-16 h-16 text-yellow-500 animate-spin mb-4" />
      <p className="text-yellow-500 font-black uppercase text-sm animate-pulse tracking-widest">Calcolo Simulazione...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-32 font-sans relative">
      
      <button 
        onClick={() => router.back()} 
        className="absolute top-6 left-4 text-slate-500 hover:text-yellow-500 transition-colors flex items-center gap-1.5 font-black uppercase text-[10px] tracking-widest z-10"
      >
        <ArrowLeft size={16} /> Indietro
      </button>

      <header className="text-center mb-8 pt-8 flex flex-col items-center">
        <div className="bg-blue-500/10 p-4 rounded-full border border-blue-500/20 mb-4 mt-4 sm:mt-0">
          <Calculator size={32} className="text-blue-500" />
        </div>
        <h1 className="text-4xl font-black text-blue-500 uppercase italic tracking-tighter leading-none">Classifiche Live</h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3 max-w-xs leading-relaxed">
          Proiezioni basate sui tuoi pronostici attuali
        </p>

        {!isExpired && (
            <button 
              onClick={generateBracket}
              disabled={isImporting}
              className="mt-6 inline-flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 text-purple-400 px-6 py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all hover:bg-purple-600/30 active:scale-95 shadow-lg"
            >
              <Wand2 size={16} className={isImporting ? "animate-pulse" : ""} /> Genera Tabellone
            </button>
        )}
      </header>

      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-center items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500"></div> Qualificate (Prime 2)</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500"></div> Spareggio (Migliori Terze)</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(standings).map(([groupName, teams]) => (
            <div key={groupName} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              
              <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
                <h2 className="font-black text-white uppercase tracking-widest flex items-center gap-2 text-sm italic">
                  <Trophy size={14} className="text-blue-500" /> {groupName}
                </h2>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                      <th className="p-3 pl-4">Squadra</th>
                      <th className="p-3 text-center">PT</th>
                      <th className="p-3 text-center">G</th>
                      <th className="p-3 text-center">V</th>
                      <th className="p-3 text-center">N</th>
                      <th className="p-3 text-center">P</th>
                      <th className="p-3 text-center">DR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((team, index) => {
                      const flagCode = flagMap[team.name.toLowerCase().trim()];
                      
                      let rowStyle = "";
                      let rankStyle = "text-slate-500";
                      
                      if (index < 2) {
                        rowStyle = "bg-emerald-500/5 border-l-2 border-emerald-500";
                        rankStyle = "text-emerald-500";
                      } else if (index === 2) {
                        rowStyle = "bg-yellow-500/5 border-l-2 border-yellow-500";
                        rankStyle = "text-yellow-500";
                      } else {
                        rowStyle = "border-l-2 border-transparent";
                      }

                      return (
                        <tr key={team.name} className={`border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors ${rowStyle}`}>
                          <td className="p-3 pl-4 flex items-center gap-2 sm:gap-3">
                            <span className={`text-[10px] font-black w-3 text-center ${rankStyle}`}>{index + 1}</span>
                            {flagCode ? (
                              <img src={`https://flagcdn.com/w40/${flagCode}.png`} className="w-5 h-3.5 sm:w-6 sm:h-4 object-cover rounded shadow-sm" alt="" />
                            ) : (
                              <div className="w-5 h-3.5 sm:w-6 sm:h-4 bg-slate-800 rounded"></div>
                            )}
                            <span className="text-[10px] sm:text-[11px] font-black text-white uppercase italic whitespace-nowrap">{formatTeamName(team.name)}</span>
                          </td>
                          <td className="p-3 text-center font-black text-blue-400 text-xs">{team.points}</td>
                          <td className="p-3 text-center text-slate-400 text-[10px]">{team.played}</td>
                          <td className="p-3 text-center text-emerald-400 text-[10px]">{team.won}</td>
                          <td className="p-3 text-center text-slate-400 text-[10px]">{team.drawn}</td>
                          <td className="p-3 text-center text-rose-400 text-[10px]">{team.lost}</td>
                          <td className="p-3 text-center text-slate-300 font-bold text-[10px]">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}