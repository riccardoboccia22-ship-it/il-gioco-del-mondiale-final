'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';
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

// Funzione robusta per accorciare i nomi lunghi
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

// Normalizzazione estrema per far matchare Supabase con l'array
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
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Recupera i risultati reali delle partite dal DB
  useEffect(() => {
    const fetchMatches = async () => {
      const { data, error } = await supabase.from('matches').select('*');
      if (data && !error) {
        setMatches(data);
      }
      setLoading(false);
    };
    fetchMatches();
  }, []);

  // Calcola Classifiche in tempo reale in base alle partite terminate
  const standings = useMemo(() => {
    const stdMap: Record<string, any[]> = {};

    // Inizializza tutti a zero
    tournamentGroups.forEach(group => {
      stdMap[group.name] = group.teams.map(team => ({
        name: team,
        played: 0, won: 0, draw: 0, lost: 0,
        gf: 0, ga: 0, gd: 0, pts: 0
      }));
    });

    // Se ci sono partite, somma i punti
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

    // Ordina le squadre in ogni girone
    Object.keys(stdMap).forEach(groupName => {
      stdMap[groupName].sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts; // 1. Punti
        if (b.gd !== a.gd) return b.gd - a.gd;     // 2. Differenza Reti
        if (b.gf !== a.gf) return b.gf - a.gf;     // 3. Gol Fatti
        return a.name.localeCompare(b.name);       // 4. Alfabetico
      });
    });

    return stdMap;
  }, [matches]);

  const getFlagCode = (team: string) => {
    return flagMap[team?.toLowerCase().trim()];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-4" />
        <p className="text-yellow-500 font-black uppercase text-sm tracking-widest animate-pulse">Caricamento Gironi...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-32 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Tasto Torna Indietro */}
        <div className="mt-4 mb-2 flex justify-start">
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
          >
            <ArrowLeft size={16} /> Torna Indietro
          </button>
        </div>

        {/* Intestazione */}
        <header className="text-center mb-10 mt-4 relative">
          <h1 className="text-4xl sm:text-5xl font-black text-yellow-500 mb-2 uppercase tracking-tighter italic drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            I Gironi
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
            Classifiche Ufficiali World Cup 2026
          </p>
        </header>

        {/* Griglia dei Gironi */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tournamentGroups.map((group) => (
            <div 
              key={group.name} 
              className="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl hover:border-yellow-500/30 transition-all group"
            >
              {/* Nome del Girone */}
              <div className="bg-slate-800/40 p-4 border-b border-slate-800/50 text-center">
                <h2 className="text-xl font-black text-white group-hover:text-yellow-500 transition-colors italic tracking-tight">
                  {group.name}
                </h2>
              </div>
              
              {/* Tabella Classifica */}
              <div className="p-3 sm:p-4 overflow-x-auto">
                <table className="w-full min-w-[280px] text-left border-collapse">
                  <thead>
                    <tr className="text-[8px] sm:text-[9px] uppercase tracking-widest text-slate-500 border-b border-slate-800">
                      <th className="pb-2 font-black pl-2">Squadra</th>
                      <th className="pb-2 font-black text-center w-6" title="Giocate">G</th>
                      <th className="pb-2 font-black text-center w-6" title="Vinte">V</th>
                      <th className="pb-2 font-black text-center w-6" title="Pareggiate">N</th>
                      <th className="pb-2 font-black text-center w-6" title="Perse">P</th>
                      <th className="pb-2 font-black text-center w-6" title="Gol Fatti">GF</th>
                      <th className="pb-2 font-black text-center w-6" title="Gol Subiti">GS</th>
                      <th className="pb-2 font-black text-center w-6" title="Differenza Reti">DR</th>
                      <th className="pb-2 font-black text-center w-8 text-yellow-500 text-[10px]" title="Punti">PT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings[group.name]?.map((teamData, index) => {
                      const flagCode = getFlagCode(teamData.name);
                      // In un mondiale a 48 squadre le prime 2 si qualificano, più le 8 migliori terze. 
                      // Per ora evidenziamo le prime due in verde.
                      const isTopTwo = index < 2; 
                      
                      return (
                        <tr key={teamData.name} className="border-b border-slate-800/20 hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 pl-2 flex items-center gap-2">
                            <span className={`w-3 flex justify-center text-[10px] font-black ${isTopTwo ? 'text-emerald-500' : 'text-slate-600'}`}>
                              {index + 1}
                            </span>
                            <div className="w-6 h-4 bg-slate-800 rounded-[2px] overflow-hidden shrink-0 shadow-sm relative border border-slate-700/50 flex items-center justify-center">
                              {flagCode ? (
                                <img src={`https://flagcdn.com/w40/${flagCode}.png`} alt={teamData.name} className="w-full h-full object-cover" />
                              ) : (
                                <Shield size={10} className="text-slate-500" />
                              )}
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
                          <td className="py-2.5 text-center text-[10px] text-slate-400 font-medium">
                            {teamData.gd > 0 ? `+${teamData.gd}` : teamData.gd}
                          </td>
                          <td className="py-2.5 text-center text-[11px] sm:text-xs font-black text-yellow-500">
                            {teamData.pts}
                          </td>
                        </tr>
                      )
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