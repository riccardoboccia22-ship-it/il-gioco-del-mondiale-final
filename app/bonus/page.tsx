'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { WORLD_CUP_PLAYERS, WORLD_CUP_GOALKEEPERS } from '@/lib/players';
import {
  Award, Flame, Zap, Trophy, Trash2, 
  ShieldCheck, ChevronDown, X, Target, Goal, ArrowUpToLine, ArrowDownToLine,
  Search, Shield, User, BarChart3, CheckCircle2, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const LOCK_TIME = new Date('2026-06-11T20:00:00+02:00');

const TOURNAMENT_GROUPS = [
  { name: 'Gruppo A', teams: ['Messico', 'Sudafrica', 'Corea Sud', 'Rep. Ceca'] },
  { name: 'Gruppo B', teams: ['Canada', 'Svizzera', 'Qatar', 'Bosnia'] },
  { name: 'Gruppo C', teams: ['Brasile', 'Marocco', 'Haiti', 'Scozia'] },
  { name: 'Gruppo D', teams: ['USA', 'Australia', 'Paraguay', 'Turchia'] },
  { name: 'Gruppo E', teams: ['Germania', "Costa Avorio", 'Ecuador', 'Curacao'] },
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
  belgio: 'be', 'bosnia ed erzegovina': 'ba', 'bosnia erzegovina': 'ba', 'bosnia': 'ba',
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

const getFlag = (team: string) => {
    if (!team) return null;
    const code = flagMap[team.toLowerCase().trim()];
    return code ? `https://flagcdn.com/w40/${code}.png` : null;
};

const formatTeamName = (teamName: string) => {
  if (!teamName) return '';
  const lowerName = teamName.toLowerCase().trim();
  if (lowerName === 'repubblica democratica del congo') return 'R.D. Congo';
  if (lowerName === 'bosnia ed erzegovina') return 'Bosnia';
  if (lowerName === 'repubblica ceca') return 'Rep. Ceca';
  if (lowerName === 'arabia saudita') return 'Arabia S.';
  if (lowerName === 'corea del sud') return 'Corea Sud';
  if (lowerName === 'stati uniti') return 'USA';
  if (lowerName === 'nuova zelanda') return 'N. Zelanda';
  if (lowerName === "costa d'avorio") return 'Costa Avorio';
  if (teamName.length > 12) return teamName.substring(0, 10) + '.';
  return teamName;
};

// FUNZIONE DI SUPPORTO PER RIMUOVERE ACCENTI E DIERESI
const cleanString = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

const AutocompleteInput = ({ 
  value, 
  onChange, 
  placeholder, 
  suggestions 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholder: string; 
  suggestions: {name: string, country: string}[] 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchTerm = cleanString(value);

  // Filtra ignorando completamente maiuscole ed accenti sia sul nome che sulla nazione
  const filteredSuggestions = suggestions.filter(s => {
    return cleanString(s.name).includes(searchTerm) || cleanString(s.country).includes(searchTerm);
  }).filter(s => cleanString(s.name) !== searchTerm);

  const hasExactMatch = suggestions.some(s => cleanString(s.name) === searchTerm);
  const matchingPlayer = suggestions.find(s => cleanString(s.name) === searchTerm);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center">
        {matchingPlayer ? (
          <img 
            src={getFlag(matchingPlayer.country)!} 
            className="absolute left-4 w-6 h-4 rounded-[2px] object-cover border border-slate-700 pointer-events-none" 
            alt=""
          />
        ) : (
          <User size={16} className="absolute left-4 text-slate-600 pointer-events-none" />
        )}
        <input 
          type="text" 
          placeholder={placeholder} 
          value={value} 
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }} 
          onFocus={() => setIsOpen(true)}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pl-12 outline-none focus:border-yellow-500 font-black text-sm sm:text-base uppercase transition-all text-white placeholder:text-slate-700" 
        />
      </div>
      
      {isOpen && value.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((suggestion, index) => {
              const flag = getFlag(suggestion.country);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onChange(suggestion.name);
                    setIsOpen(false);
                  }}
                  className="w-full text-left p-3 flex items-center gap-3 hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0"
                >
                  {flag ? <img src={flag} className="w-6 h-4 rounded-[2px] object-cover shadow-sm border border-slate-700 shrink-0" alt="" /> : <Shield size={16} className="text-slate-600"/>}
                  <div className="flex flex-col">
                     <span className="text-xs font-black uppercase text-slate-200">{suggestion.name}</span>
                     <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">{suggestion.country}</span>
                  </div>
                </button>
              )
            })
          ) : (
            !hasExactMatch && (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full p-4 flex items-center gap-3 hover:bg-slate-800 transition-colors text-left"
              >
                <User size={16} className="text-slate-500 shrink-0"/>
                <span className="text-xs font-black uppercase text-slate-400">Scommetti su "{value}"</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};


export default function BonusPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<any>({
    total_red_cards: '', top_scorer: '', high_scoring_match: '', total_penalties: '',
    total_own_goals: '', highest_scoring_group: '', lowest_scoring_group: '',
    mvp_world_cup: '', best_goalkeeper: '',
  });
  
  const [initialData, setInitialData] = useState<any>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [availableMatches, setAvailableMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // TABS e MODALS
  const [activeTab, setActiveTab] = useState<'GIOCATORI' | 'SQUADRE' | 'STATISTICHE'>('GIOCATORI');
  const [activeBonusField, setActiveBonusField] = useState<string | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchSearch, setMatchSearch] = useState('');
  
  // STATI PORTIERI
  const [showGkModal, setShowGkModal] = useState(false);
  const [gkSearch, setGkSearch] = useState('');

  const isExpired = new Date() > LOCK_TIME;

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/'); return; }

        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        if (!profile || !profile.full_name) {
          router.push('/setup-profilo');
          return;
        }

        const [bonusRes, matchesRes] = await Promise.all([
            supabase.from('user_bonus_answers').select('*').eq('user_id', user.id).maybeSingle(),
            supabase.from('matches').select('id, home_team, away_team').order('id', { ascending: true }),
        ]);

        if (matchesRes.data) {
            const validMatches = matchesRes.data.filter((m) => m.home_team && m.away_team && !m.home_team.includes('TBD')).map((m) => ({
              id: m.id,
              rawStr: `${m.home_team} - ${m.away_team}`,
              home: m.home_team,
              away: m.away_team
            }));
            setAvailableMatches(validMatches);
        }

        if (bonusRes.data) {
          const loadedData = {
            total_red_cards: bonusRes.data.total_red_cards ?? '',
            top_scorer: bonusRes.data.top_scorer || '',
            high_scoring_match: bonusRes.data.high_scoring_match || '',
            total_penalties: bonusRes.data.total_penalties ?? '',
            total_own_goals: bonusRes.data.total_own_goals ?? '',
            highest_scoring_group: bonusRes.data.highest_scoring_group || '',
            lowest_scoring_group: bonusRes.data.lowest_scoring_group || '',
            mvp_world_cup: bonusRes.data.mvp_world_cup || '',
            best_goalkeeper: bonusRes.data.best_goalkeeper || '',
          };
          setFormData(loadedData);
          setInitialData(loadedData);
        } else {
          setInitialData(formData);
        }
      } catch (err) { console.error(err); } finally { setFetching(false); }
    }
    loadData();
  }, [router]);

  useEffect(() => {
    if (fetching) return;
    const isChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
    setHasUnsavedChanges(isChanged);
  }, [formData, initialData, fetching]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isExpired) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, isExpired]);

  const saveBonus = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isExpired) return toast.error('Tempo scaduto!');
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Effettua il login'); setLoading(false); return; }

    const payload = {
      user_id: user.id,
      total_red_cards: formData.total_red_cards !== '' ? parseInt(formData.total_red_cards) : null,
      top_scorer: formData.top_scorer.trim(),
      high_scoring_match: formData.high_scoring_match,
      total_penalties: formData.total_penalties !== '' ? parseInt(formData.total_penalties) : null,
      total_own_goals: formData.total_own_goals !== '' ? parseInt(formData.total_own_goals) : null,
      highest_scoring_group: formData.highest_scoring_group,
      lowest_scoring_group: formData.lowest_scoring_group,
      mvp_world_cup: formData.mvp_world_cup.trim(),
      best_goalkeeper: formData.best_goalkeeper.trim(),
    };

    const { error } = await supabase.from('user_bonus_answers').upsert(payload, { onConflict: 'user_id' });
    if (error) {
      toast.error('Errore: ' + error.message);
    } else {
      setInitialData(formData);
      setHasUnsavedChanges(false);
      toast.success('Pronostici bonus salvati! 🍀');
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#eab308', '#3b82f6', '#ef4444', '#22c55e', '#ffffff'],
        disableForReducedMotion: true
      });
    }
    setLoading(false);
  };

  const handleGroupSelect = (groupName: string) => {
    if (activeBonusField) {
      const isCurrentlySelected = formData[activeBonusField] === groupName;
      setFormData((prev: any) => ({ ...prev, [activeBonusField]: isCurrentlySelected ? '' : groupName }));
      setActiveBonusField(null);
    }
  };

  const handleMatchSelect = (matchString: string) => {
    const isCurrentlySelected = formData.high_scoring_match === matchString;
    setFormData((prev: any) => ({ ...prev, high_scoring_match: isCurrentlySelected ? '' : matchString }));
    setShowMatchModal(false);
  };

  const clearForm = () => {
    if (window.confirm("Sei sicuro di voler resettare tutti i tuoi bonus? Non verrà salvato finché non premi il tasto Salva.")) {
      setFormData({
        total_red_cards: '', top_scorer: '', high_scoring_match: '', total_penalties: '',
        total_own_goals: '', highest_scoring_group: '', lowest_scoring_group: '',
        mvp_world_cup: '', best_goalkeeper: '',
      });
    }
  };

  const calculateProgress = () => {
    let count = 0;
    Object.values(formData).forEach(val => {
      if (val !== null && val !== '') count++;
    });
    return count;
  };

  const completedCount = calculateProgress();
  const progressPct = Math.round((completedCount / 9) * 100);

  if (fetching) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4"><div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div><div className="text-yellow-500 font-black animate-pulse uppercase tracking-widest text-xs">Apertura Quote...</div></div>;

  return (
    <main className="min-h-[100dvh] bg-slate-950 text-white font-sans flex flex-col">
      
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md pt-6 pb-2 border-b border-slate-900 shadow-xl">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-between items-end mb-4">
            <h1 className="text-3xl font-black text-yellow-500 uppercase italic tracking-tighter">Bonus</h1>
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">{completedCount}/9 Completati</span>
               <div className="w-24 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className={`h-full transition-all duration-500 ${progressPct === 100 ? 'bg-emerald-500' : 'bg-yellow-500'}`} style={{ width: `${progressPct}%` }}></div>
               </div>
            </div>
          </div>

          <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
            {[
              { id: 'GIOCATORI', icon: <User size={14} /> },
              { id: 'SQUADRE', icon: <Shield size={14} /> },
              { id: 'STATISTICHE', icon: <BarChart3 size={14} /> },
            ].map((tab: any) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? 'bg-yellow-500 text-slate-950 shadow-lg'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                {tab.icon} {tab.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-32">
        <form id="bonusForm" onSubmit={saveBonus} className="max-w-md mx-auto space-y-5 text-left pb-10">
          
          <div className={`space-y-4 ${isExpired ? 'opacity-60 pointer-events-none' : ''}`}>
            
            {/* TABS 1: GIOCATORI */}
            {activeTab === 'GIOCATORI' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                {[ 
                  {id: 'mvp_world_cup', label: 'MVP Mondiale - 10 pt', icon: Trophy, placeholder: "Cerca Giocatore o Squadra"}, 
                  {id: 'top_scorer', label: 'Capocannoniere - 10 pt', icon: Award, placeholder: "Cerca Giocatore o Squadra"}
                ].map(field => (
                   <div key={field.id} className={`bg-slate-900 p-5 rounded-[2rem] border transition-all ${formData[field.id] ? 'border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.05)]' : 'border-slate-800'}`}>
                     <label>
                       <span className="text-[10px] sm:text-xs font-black text-yellow-500 uppercase mb-3 tracking-wider flex items-center gap-2"><field.icon size={16} /> {field.label}</span>
                       <AutocompleteInput 
                         value={formData[field.id]} 
                         onChange={(val) => setFormData({ ...formData, [field.id]: val })} 
                         placeholder={field.placeholder} 
                         suggestions={[...WORLD_CUP_PLAYERS, ...WORLD_CUP_GOALKEEPERS]} 
                       />
                     </label>
                   </div>
                ))}

                {/* MODALITÀ PORTIERI (Con filtro accenti integrato nella ricerca) */}
                <div className={`bg-slate-900 p-5 rounded-[2rem] border transition-all ${formData.best_goalkeeper ? 'border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.05)]' : 'border-slate-800'}`}>
                   <label className="text-[10px] sm:text-xs font-black text-yellow-500 uppercase mb-3 tracking-wider flex items-center gap-2"><ShieldCheck size={16} /> Miglior Portiere - 10 pt</label>
                   <button type="button" onClick={() => setShowGkModal(true)} className={`w-full bg-slate-950 border rounded-2xl p-4 text-left font-black text-sm sm:text-base uppercase flex justify-between items-center transition-all hover:border-yellow-500 ${formData.best_goalkeeper ? 'border-yellow-500 text-white' : 'border-slate-800 text-slate-500'}`}>
                      {formData.best_goalkeeper ? (
                         <div className="flex items-center gap-3 truncate pr-2">
                             {WORLD_CUP_GOALKEEPERS.find(g => cleanString(g.name) === cleanString(formData.best_goalkeeper)) ? (
                                 <img src={getFlag(WORLD_CUP_GOALKEEPERS.find(g => cleanString(g.name) === cleanString(formData.best_goalkeeper))!.country)!} className="w-6 h-4 rounded-[2px] object-cover shadow-sm border border-slate-700 shrink-0" alt=""/>
                             ) : (
                                 <Shield size={16} className="text-slate-500 shrink-0"/>
                             )}
                             <span className="truncate">{formData.best_goalkeeper}</span>
                         </div>
                      ) : (
                         <span>Scegli Portiere...</span>
                      )}
                      <Search size={18} className={`shrink-0 ${formData.best_goalkeeper ? 'text-yellow-500' : 'text-slate-600'}`} />
                   </button>
                </div>

              </div>
            )}

            {/* TABS 2: SQUADRE */}
            {activeTab === 'SQUADRE' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                
                <div className={`bg-slate-900 p-5 rounded-[2rem] border transition-all ${formData.highest_scoring_group ? 'border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.05)]' : 'border-slate-800'}`}>
                   <label className="text-[10px] sm:text-xs font-black text-yellow-500 uppercase mb-3 tracking-wider flex items-center gap-2"><ArrowUpToLine size={16} /> Girone con più gol - 5 pt</label>
                   <button type="button" onClick={() => setActiveBonusField('highest_scoring_group')} className={`w-full bg-slate-950 border rounded-2xl p-4 text-left font-black text-sm sm:text-base uppercase flex justify-between items-center transition-all hover:border-yellow-500 ${formData.highest_scoring_group ? 'border-yellow-500 text-white' : 'border-slate-800 text-slate-500'}`}>
                      {formData.highest_scoring_group || 'Scegli il Girone...'} <ChevronDown size={18} className={formData.highest_scoring_group ? 'text-yellow-500' : 'text-slate-600'} />
                   </button>
                </div>

                <div className={`bg-slate-900 p-5 rounded-[2rem] border transition-all ${formData.lowest_scoring_group ? 'border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.05)]' : 'border-slate-800'}`}>
                   <label className="text-[10px] sm:text-xs font-black text-yellow-500 uppercase mb-3 tracking-wider flex items-center gap-2"><ArrowDownToLine size={16} /> Girone con meno gol - 5 pt</label>
                   <button type="button" onClick={() => setActiveBonusField('lowest_scoring_group')} className={`w-full bg-slate-950 border rounded-2xl p-4 text-left font-black text-sm sm:text-base uppercase flex justify-between items-center transition-all hover:border-yellow-500 ${formData.lowest_scoring_group ? 'border-yellow-500 text-white' : 'border-slate-800 text-slate-500'}`}>
                      {formData.lowest_scoring_group || 'Scegli il Girone...'} <ChevronDown size={18} className={formData.lowest_scoring_group ? 'text-yellow-500' : 'text-slate-600'} />
                   </button>
                </div>

                <div className={`bg-slate-900 p-5 rounded-[2rem] border transition-all ${formData.high_scoring_match ? 'border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.05)]' : 'border-slate-800'}`}>
                   <label className="text-[10px] sm:text-xs font-black text-yellow-500 uppercase mb-3 tracking-wider flex items-center gap-2"><Flame size={16} /> Partita con più gol - 5 pt</label>
                   <button type="button" onClick={() => setShowMatchModal(true)} className={`w-full bg-slate-950 border rounded-2xl p-4 text-left font-black text-sm sm:text-base uppercase flex justify-between items-center transition-all hover:border-yellow-500 ${formData.high_scoring_match ? 'border-yellow-500 text-white' : 'border-slate-800 text-slate-500'}`}>
                      {formData.high_scoring_match ? (
                         <div className="flex items-center gap-2 truncate pr-2 w-[90%]">
                             {getFlag(formData.high_scoring_match.split(' - ')[0]) && <img src={getFlag(formData.high_scoring_match.split(' - ')[0])!} className="w-5 h-3.5 rounded-[2px] object-cover border border-slate-700 shrink-0" alt=""/>}
                             <span className="truncate">{formatTeamName(formData.high_scoring_match.split(' - ')[0])} - {formatTeamName(formData.high_scoring_match.split(' - ')[1])}</span>
                             {getFlag(formData.high_scoring_match.split(' - ')[1]) && <img src={getFlag(formData.high_scoring_match.split(' - ')[1])!} className="w-5 h-3.5 rounded-[2px] object-cover border border-slate-700 shrink-0" alt=""/>}
                         </div>
                      ) : (
                         <span>Scegli la Partita...</span>
                      )}
                      <Search size={18} className={`shrink-0 ${formData.high_scoring_match ? 'text-yellow-500' : 'text-slate-600'}`} />
                   </button>
                </div>
              </div>
            )}

            {/* TABS 3: STATISTICHE (Numerici) */}
            {activeTab === 'STATISTICHE' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                {[ 
                  {id: 'total_own_goals', label: 'Totale Autogol - 3 pt', icon: Target}, 
                  {id: 'total_penalties', label: 'Totale Rigori - 3 pt', icon: Goal}, 
                  {id: 'total_red_cards', label: 'Totale Rossi - 3 pt', icon: Zap}
                ].map(field => (
                  <div key={field.id} className={`bg-slate-900 p-5 rounded-[2rem] border transition-all ${formData[field.id] ? 'border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.05)]' : 'border-slate-800'}`}>
                    <label>
                      <span className="text-[10px] sm:text-xs font-black text-yellow-500 uppercase mb-3 tracking-wider flex items-center gap-2"><field.icon size={16} /> {field.label}</span>
                      <input type="number" placeholder="Digita un numero" value={formData[field.id]} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-black text-xl text-yellow-500 transition-all focus:border-yellow-500 outline-none placeholder:text-slate-800" onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })} />
                    </label>
                  </div>
                ))}
              </div>
            )}

          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={clearForm} disabled={isExpired || completedCount === 0} className="p-5 bg-slate-900 border border-slate-800 text-rose-500 rounded-[2rem] hover:bg-rose-500/10 hover:border-rose-500/30 transition-all disabled:opacity-50 disabled:pointer-events-none">
              <Trash2 size={20} />
            </button>
            <button type="button" onClick={() => saveBonus()} disabled={loading || isExpired} className={`flex-1 font-black py-5 rounded-[2rem] uppercase tracking-widest transition-all text-sm flex items-center justify-center gap-2 ${hasUnsavedChanges ? 'bg-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse' : 'bg-yellow-500 text-slate-950 shadow-xl'} disabled:opacity-50 disabled:pointer-events-none`}>
                {loading ? <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div> : hasUnsavedChanges ? <><CheckCircle2 size={18}/> Salva Modifiche</> : 'Pronostici Salvati'}
            </button>
          </div>
          
          {hasUnsavedChanges && !isExpired && (
             <p className="text-center text-[10px] font-black text-rose-400 uppercase tracking-widest animate-pulse mt-2 flex items-center justify-center gap-1.5"><AlertCircle size={12}/> Modifiche non salvate</p>
          )}

        </form>
      </div>

      {/* MODAL PORTIERI */}
      {showGkModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-0 pb-0">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setShowGkModal(false)}></div>
          <div className="relative w-full max-w-md bg-slate-900 border-t-2 border-yellow-500/40 rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
            <div className="p-6 bg-slate-950/80 border-b border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-yellow-500 text-lg font-black uppercase italic tracking-tight flex items-center gap-2"><ShieldCheck size={18}/> Miglior Portiere</h3>
                <button onClick={() => setShowGkModal(false)} className="p-2 bg-slate-800 rounded-full text-white active:scale-90 transition-all"><X size={18}/></button>
              </div>
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                 <input type="text" placeholder="Cerca portiere o nazione..." className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs font-black uppercase text-white outline-none focus:border-yellow-500 transition-colors placeholder:text-slate-600" value={gkSearch} onChange={e => setGkSearch(e.target.value)} />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar pb-10">
              {gkSearch.trim() !== '' && !WORLD_CUP_GOALKEEPERS.some(g => cleanString(g.name).includes(cleanString(gkSearch)) || cleanString(g.country).includes(cleanString(gkSearch))) && (
                  <button type="button" onClick={() => { setFormData({...formData, best_goalkeeper: gkSearch.trim()}); setShowGkModal(false); }} className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/50 hover:bg-slate-800 flex items-center gap-3 transition-all active:scale-95 mb-2">
                      <User size={16} className="text-slate-500 shrink-0"/>
                      <span className="font-black text-xs uppercase text-slate-300 truncate">Scommetti su "{gkSearch}"</span>
                  </button>
              )}

              {WORLD_CUP_GOALKEEPERS.filter(g => cleanString(g.name).includes(cleanString(gkSearch)) || cleanString(g.country).includes(cleanString(gkSearch))).map((gk) => {
                 const isSelected = cleanString(formData.best_goalkeeper) === cleanString(gk.name);
                 const flag = getFlag(gk.country);
                 return (
                    <button key={`${gk.country}-${gk.name}`} onClick={() => { setFormData({...formData, best_goalkeeper: gk.name}); setShowGkModal(false); }} className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all active:scale-95 ${isSelected ? 'bg-yellow-500/10 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.15)]' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                        <div className="flex items-center gap-3 truncate">
                            {flag ? <img src={flag} className="w-6 h-4 shrink-0 rounded-[3px] shadow border border-slate-800 object-cover" alt="" /> : <Shield size={16} className="text-slate-600 shrink-0"/>}
                            <div className="flex flex-col items-start truncate">
                               <span className={`font-black uppercase text-xs tracking-tight truncate ${isSelected ? 'text-yellow-500' : 'text-white'}`}>{gk.name}</span>
                               <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider truncate">{gk.country}</span>
                            </div>
                        </div>
                        {isSelected && <div className="bg-rose-500 rounded-full w-5 h-5 shrink-0 flex items-center justify-center text-white"><X size={12}/></div>}
                    </button>
                 );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL GIRONI */}
      {activeBonusField && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-0 pb-0">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setActiveBonusField(null)}></div>
          <div className="relative w-full max-w-md bg-slate-900 border-t-2 border-yellow-500/40 rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
            <div className="p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-yellow-500 text-lg font-black uppercase italic tracking-tight">Scegli Girone</h3>
              <button onClick={() => setActiveBonusField(null)} className="p-2 bg-slate-800 rounded-full text-white active:scale-90 transition-all"><X size={18}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar pb-10">
              {TOURNAMENT_GROUPS.map((group) => {
                 const isSelected = formData[activeBonusField] === group.name;
                 return (
                    <button key={group.name} onClick={() => handleGroupSelect(group.name)} className={`w-full p-4 rounded-[1.5rem] border-2 flex flex-col gap-3 transition-all active:scale-95 ${isSelected ? 'bg-yellow-500/10 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.15)]' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                        <div className="flex justify-between w-full items-center">
                            <span className={`font-black uppercase text-sm ${isSelected ? 'text-yellow-500' : 'text-white'}`}>{group.name}</span>
                            {isSelected && <div className="bg-rose-500 rounded-full w-5 h-5 flex items-center justify-center text-white"><X size={12}/></div>}
                        </div>
                        <div className="flex gap-2">
                            {group.teams.map(team => <img key={team} src={getFlag(team)!} className="w-8 h-5 rounded-[4px] object-cover shadow-sm border border-slate-800" alt={team} />)}
                        </div>
                    </button>
                 );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL MATCH (Ricerca e Selezione) */}
      {showMatchModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-0 pb-0">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setShowMatchModal(false)}></div>
          <div className="relative w-full max-w-md bg-slate-900 border-t-2 border-yellow-500/40 rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
            <div className="p-6 bg-slate-950/80 border-b border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-yellow-500 text-lg font-black uppercase italic tracking-tight flex items-center gap-2"><Flame size={18}/> Partita con più gol</h3>
                <button onClick={() => setShowMatchModal(false)} className="p-2 bg-slate-800 rounded-full text-white active:scale-90 transition-all"><X size={18}/></button>
              </div>
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                 <input type="text" placeholder="Cerca squadra..." className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs font-black uppercase text-white outline-none focus:border-yellow-500 transition-colors placeholder:text-slate-600" value={matchSearch} onChange={e => setMatchSearch(e.target.value)} />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar pb-10">
              {availableMatches.filter(m => m.rawStr.toLowerCase().includes(matchSearch.toLowerCase())).map((m) => {
                 const isSelected = formData.high_scoring_match === m.rawStr;
                 const hFlag = getFlag(m.home);
                 const aFlag = getFlag(m.away);
                 return (
                    <button key={m.id} onClick={() => handleMatchSelect(m.rawStr)} className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all active:scale-95 ${isSelected ? 'bg-yellow-500/10 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.15)]' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                        
                        <div className="flex-1 flex items-center justify-between min-w-0 pr-4">
                             <div className="flex items-center gap-2 sm:gap-3 w-[45%] min-w-0">
                                 {hFlag ? <img src={hFlag} className="w-6 h-4 shrink-0 rounded-[3px] shadow border border-slate-800 object-cover" alt="" /> : <Shield size={16} className="text-slate-600 shrink-0"/>}
                                 <span className={`font-black uppercase text-[10px] sm:text-xs tracking-tight truncate text-left ${isSelected ? 'text-yellow-500' : 'text-white'}`}>{formatTeamName(m.home)}</span>
                             </div>
                             <span className="text-slate-600 font-black px-1 shrink-0">-</span>
                             <div className="flex items-center gap-2 sm:gap-3 w-[45%] justify-end min-w-0">
                                 <span className={`font-black uppercase text-[10px] sm:text-xs tracking-tight truncate text-right ${isSelected ? 'text-yellow-500' : 'text-white'}`}>{formatTeamName(m.away)}</span>
                                 {aFlag ? <img src={aFlag} className="w-6 h-4 shrink-0 rounded-[3px] shadow border border-slate-800 object-cover" alt="" /> : <Shield size={16} className="text-slate-600 shrink-0"/>}
                             </div>
                        </div>

                        <div className="w-5 shrink-0 flex justify-end">
                            {isSelected && <div className="bg-rose-500 rounded-full w-5 h-5 flex items-center justify-center text-white"><X size={12}/></div>}
                        </div>
                    </button>
                 );
              })}
              {availableMatches.filter(m => m.rawStr.toLowerCase().includes(matchSearch.toLowerCase())).length === 0 && (
                 <p className="text-center text-slate-600 text-xs font-black uppercase mt-6">Nessuna partita trovata</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}