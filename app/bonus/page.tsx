'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import {
  Award, Flame, Zap, Info, Trophy, Trash2, 
  ShieldCheck, ChevronDown, X, Target, Goal, ArrowUpToLine, ArrowDownToLine
} from 'lucide-react';

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
  algeria: 'dz', 'arabia saudita': 'sa', argentina: 'ar', australia: 'au', austria: 'at',
  belgio: 'be', 'bosnia ed erzegovina': 'ba', 'bosnia': 'ba', 'brasile': 'br', canada: 'ca', 'capo verde': 'cv',
  colombia: 'co', 'corea sud': 'kr', "costa avorio": 'ci', croazia: 'hr', 'curacao': 'cw',
  ecuador: 'ec', egitto: 'eg', francia: 'fr', germania: 'de', ghana: 'gh', giappone: 'jp',
  giordania: 'jo', haiti: 'ht', inghilterra: 'gb-eng', iran: 'ir', iraq: 'iq', marocco: 'ma',
  messico: 'mx', norvegia: 'no', 'n. zelanda': 'nz', olanda: 'nl', panama: 'pa', paraguay: 'py',
  portogallo: 'pt', qatar: 'qa', 'rep. ceca': 'cz', 'r.d. congo': 'cd',
  scozia: 'gb-sct', senegal: 'sn', spagna: 'es', 'usa': 'us',
  sudafrica: 'za', svezia: 'se', svizzera: 'ch', tunisia: 'tn', turchia: 'tr', 
  uruguay: 'uy', uzbekistan: 'uz',
};

const getFlag = (team: string) => {
    const code = flagMap[team?.toLowerCase().trim()];
    return code ? `https://flagcdn.com/w40/${code}.png` : null;
};

export default function BonusPage() {
  const [formData, setFormData] = useState<any>({
    total_red_cards: '', top_scorer: '', high_scoring_match: '', total_penalties: '',
    total_own_goals: '', highest_scoring_group: '', lowest_scoring_group: '',
    mvp_world_cup: '', best_goalkeeper: '',
  });
  
  const [availableMatches, setAvailableMatches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeBonusField, setActiveBonusField] = useState<string | null>(null);

  const isExpired = new Date() > LOCK_TIME;

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const [bonusRes, matchesRes] = await Promise.all([
            supabase.from('user_bonus_answers').select('*').eq('user_id', user.id).maybeSingle(),
            supabase.from('matches').select('home_team, away_team').order('id', { ascending: true }),
        ]);

        if (matchesRes.data) {
            const validMatches = matchesRes.data.filter((m) => m.home_team && m.away_team && !m.home_team.includes('TBD')).map((m) => `${m.home_team} - ${m.away_team}`);
            setAvailableMatches(validMatches);
        }

        if (bonusRes.data) {
          setFormData({
            total_red_cards: bonusRes.data.total_red_cards ?? '',
            top_scorer: bonusRes.data.top_scorer || '',
            high_scoring_match: bonusRes.data.high_scoring_match || '',
            total_penalties: bonusRes.data.total_penalties ?? '',
            total_own_goals: bonusRes.data.total_own_goals ?? '',
            highest_scoring_group: bonusRes.data.highest_scoring_group || '',
            lowest_scoring_group: bonusRes.data.lowest_scoring_group || '',
            mvp_world_cup: bonusRes.data.mvp_world_cup || '',
            best_goalkeeper: bonusRes.data.best_goalkeeper || '',
          });
        }
      } catch (err) { console.error(err); } finally { setFetching(false); }
    }
    loadData();
  }, []);

  const saveBonus = async (e: React.FormEvent) => {
    e.preventDefault();
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
    if (error) toast.error('Errore: ' + error.message);
    else toast.success('Pronostici bonus salvati! 🍀');
    setLoading(false);
  };

  const handleGroupSelect = (groupName: string) => {
    if (activeBonusField) {
      const isCurrentlySelected = formData[activeBonusField] === groupName;
      setFormData((prev: any) => ({ ...prev, [activeBonusField]: isCurrentlySelected ? '' : groupName }));
      setActiveBonusField(null);
    }
  };

  if (fetching) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-yellow-500 font-black animate-pulse uppercase italic">Analizzando le quote...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 pb-48 font-sans">
      <header className="mb-10 pt-4 text-center flex flex-col items-center">
        <h1 className="text-4xl font-black text-yellow-500 uppercase italic tracking-tighter">Bonus</h1>
      </header>

      <form onSubmit={saveBonus} className="max-w-md mx-auto space-y-6 text-left">
        <div className={`space-y-4 ${isExpired ? 'opacity-50 pointer-events-none' : ''}`}>
          
          {/* Domande Input Testo */}
          {[ {id: 'mvp_world_cup', label: 'MVP Mondiale', icon: Trophy}, {id: 'top_scorer', label: 'Capocannoniere', icon: Award}, {id: 'best_goalkeeper', label: 'Miglior Portiere', icon: ShieldCheck}].map(field => (
             <div key={field.id} className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
               <label><span className="text-[10px] font-black text-yellow-500 uppercase mb-4 tracking-wider flex items-center gap-2"><field.icon size={14} /> {field.label}</span>
               <input type="text" value={formData[field.id]} className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 outline-none focus:border-yellow-500 font-black text-lg uppercase" onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })} /></label>
             </div>
          ))}

          {/* Selezione Gironi */}
          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
             <label className="text-[10px] font-black text-yellow-500 uppercase mb-4 tracking-wider flex items-center gap-2"><ArrowUpToLine size={14} /> Girone con più gol</label>
             <button type="button" onClick={() => setActiveBonusField('highest_scoring_group')} className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 text-left font-black text-lg uppercase text-white flex justify-between items-center">
                {formData.highest_scoring_group || 'Seleziona'} <ChevronDown size={16} />
             </button>
          </div>

          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
             <label className="text-[10px] font-black text-yellow-500 uppercase mb-4 tracking-wider flex items-center gap-2"><ArrowDownToLine size={14} /> Girone con meno gol</label>
             <button type="button" onClick={() => setActiveBonusField('lowest_scoring_group')} className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 text-left font-black text-lg uppercase text-white flex justify-between items-center">
                {formData.lowest_scoring_group || 'Seleziona'} <ChevronDown size={16} />
             </button>
          </div>

          {/* Match più gol */}
          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
             <label className="text-[10px] font-black text-yellow-500 uppercase mb-4 tracking-wider flex items-center gap-2"><Flame size={14} /> Partita con più gol</label>
             <select value={formData.high_scoring_match} className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 outline-none font-black text-sm uppercase" onChange={(e) => setFormData({ ...formData, high_scoring_match: e.target.value })}>
                <option value="">Seleziona Partita...</option>
                {availableMatches.map((m) => <option key={m} value={m}>{m}</option>)}
             </select>
          </div>

          {/* Numerici */}
          {[ {id: 'total_own_goals', label: 'Totale Autogol', icon: Target}, {id: 'total_penalties', label: 'Totale Rigori', icon: Goal}, {id: 'total_red_cards', label: 'Totale Rossi', icon: Zap}].map(field => (
            <div key={field.id} className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
              <label><span className="text-[10px] font-black text-yellow-500 uppercase mb-4 tracking-wider flex items-center gap-2"><field.icon size={14} /> {field.label}</span>
              <input type="number" value={formData[field.id]} className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 font-black text-xl text-yellow-500" onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })} /></label>
            </div>
          ))}
        </div>

        <button type="submit" className="w-full bg-yellow-500 text-slate-950 font-black py-5 rounded-2xl uppercase text-xs tracking-widest shadow-2xl">Salva Bonus</button>
      </form>

      {/* MODAL BOTTOM SHEET */}
      {activeBonusField && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-0 pb-0">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setActiveBonusField(null)}></div>
          <div className="relative w-full max-w-xl bg-slate-900 border-t-2 border-yellow-500/40 rounded-t-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-7 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-yellow-500 text-lg font-black uppercase italic">Scegli Girone</h3>
              <button onClick={() => setActiveBonusField(null)} className="p-3 bg-slate-800 rounded-full text-white"><X size={20}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {TOURNAMENT_GROUPS.map((group) => {
                 const isSelected = formData[activeBonusField] === group.name;
                 return (
                    <button key={group.name} onClick={() => handleGroupSelect(group.name)} className={`w-full p-4 rounded-2xl border-2 flex flex-col gap-3 ${isSelected ? 'bg-yellow-500/10 border-yellow-500' : 'bg-slate-950 border-slate-800'}`}>
                        <div className="flex justify-between w-full items-center">
                            <span className={`font-black uppercase text-sm ${isSelected ? 'text-yellow-500' : 'text-white'}`}>{group.name}</span>
                            {isSelected && <div className="bg-rose-500 rounded-full w-6 h-6 flex items-center justify-center text-white"><X size={14}/></div>}
                        </div>
                        <div className="flex gap-2">
                            {group.teams.map(team => <img key={team} src={getFlag(team)!} className="w-8 h-5 rounded object-cover shadow-sm border border-slate-800" alt={team} />)}
                        </div>
                    </button>
                 );
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}