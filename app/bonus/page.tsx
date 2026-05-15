'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import {
  Award,
  Flame,
  Zap,
  Info,
  Goal,
  ArrowDownToLine,
  ArrowUpToLine,
  Trophy,
  Target,
  Map,
  Trash2,
  ShieldCheck,
} from 'lucide-react';

const LOCK_TIME = new Date('2026-06-11T20:00:00+02:00');

// Array dettagliato con nomi accorciati per non "spaccare" la grafica su mobile
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

export default function BonusPage() {
  const [formData, setFormData] = useState({
    total_red_cards: '',
    top_scorer: '',
    high_scoring_match: '',
    total_penalties: '',
    total_own_goals: '',
    highest_scoring_group: '',
    lowest_scoring_group: '',
    mvp_world_cup: '',
    best_goalkeeper: '',
  });
  const [availableMatches, setAvailableMatches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

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
          const validMatches = matchesRes.data
            .filter((m) => m.home_team && m.away_team && !m.home_team.includes('TBD'))
            .map((m) => `${m.home_team} - ${m.away_team}`);
          setAvailableMatches(validMatches);
        }

        if (bonusRes.data) {
          setFormData({
            total_red_cards: bonusRes.data.total_red_cards != null ? bonusRes.data.total_red_cards.toString() : '',
            top_scorer: bonusRes.data.top_scorer || '',
            high_scoring_match: bonusRes.data.high_scoring_match || '',
            total_penalties: bonusRes.data.total_penalties != null ? bonusRes.data.total_penalties.toString() : '',
            total_own_goals: bonusRes.data.total_own_goals != null ? bonusRes.data.total_own_goals.toString() : '',
            highest_scoring_group: bonusRes.data.highest_scoring_group || '',
            lowest_scoring_group: bonusRes.data.lowest_scoring_group || '',
            mvp_world_cup: bonusRes.data.mvp_world_cup || '',
            best_goalkeeper: bonusRes.data.best_goalkeeper || '',
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    }
    loadData();
  }, []);

  const resetBonus = async () => {
    if (isExpired) return;
    if (window.confirm('Sei sicuro di voler svuotare e cancellare tutti i bonus?')) {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Utente non trovato');
        const { error } = await supabase.from('user_bonus_answers').delete().eq('user_id', user.id);
        if (error) throw error;

        setFormData({
          total_red_cards: '', top_scorer: '', high_scoring_match: '', total_penalties: '',
          total_own_goals: '', highest_scoring_group: '', lowest_scoring_group: '',
          mvp_world_cup: '', best_goalkeeper: '',
        });
        toast.success('Bonus azzerati e salvati!', { icon: '🧹' });
      } catch (error: any) {
        toast.error("Errore durante l'azzeramento");
      } finally {
        setLoading(false);
      }
    }
  };

  const saveBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) return toast.error('Tempo scaduto!');
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Effettua il login');
      setLoading(false);
      return;
    }

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

  if (fetching) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-yellow-500 font-black animate-pulse uppercase italic">Analizzando le quote...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 pb-48 font-sans text-center">
      <header className="mb-10 pt-4 flex flex-col items-center">
        <h1 className="text-4xl font-black text-yellow-500 uppercase italic tracking-tighter">Bonus</h1>
        <div className="mt-4 inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl mb-4 shadow-lg shadow-yellow-500/5">
          <Info size={14} className="text-yellow-500" />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">9 Domande = MAX 54 Punti</p>
        </div>
        <Link href="/groups" className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-blue-600/30 active:scale-95 shadow-lg">
          <Map size={14} /> Consulta i Gironi Ufficiali
        </Link>
      </header>

      <form onSubmit={saveBonus} className="max-w-md mx-auto space-y-6 text-left">
        <div className={`space-y-4 ${isExpired ? 'opacity-50 pointer-events-none' : ''}`}>
          
          {/* 1. MVP Mondiale */}
          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <label>
              <span className="flex items-center justify-between text-[10px] font-black text-yellow-500 uppercase mb-4 tracking-wider">
                <span className="flex items-center gap-2"><Trophy size={14} /> MVP Mondiale</span>
                <span className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-md">10 PT</span>
              </span>
              <input type="text" value={formData.mvp_world_cup} placeholder="Inserisci Nome" className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 outline-none focus:border-yellow-500 transition-all font-black text-lg uppercase placeholder:text-slate-800" onChange={(e) => setFormData({ ...formData, mvp_world_cup: e.target.value })} />
            </label>
          </div>

          {/* 2. Capocannoniere */}
          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <label>
              <span className="flex items-center justify-between text-[10px] font-black text-yellow-500 uppercase mb-4 tracking-wider">
                <span className="flex items-center gap-2"><Award size={14} /> Capocannoniere</span>
                <span className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-md">10 PT</span>
              </span>
              <input type="text" value={formData.top_scorer} placeholder="Inserisci Nome" className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 outline-none focus:border-yellow-500 transition-all font-black text-lg uppercase placeholder:text-slate-800" onChange={(e) => setFormData({ ...formData, top_scorer: e.target.value })} />
            </label>
          </div>

          {/* 3. MIGLIOR PORTIERE */}
          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <label>
              <span className="flex items-center justify-between text-[10px] font-black text-yellow-500 uppercase mb-4 tracking-wider">
                <span className="flex items-center gap-2"><ShieldCheck size={14} /> Miglior Portiere</span>
                <span className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-md">10 PT</span>
              </span>
              <input type="text" value={formData.best_goalkeeper} placeholder="Inserisci Nome" className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 outline-none focus:border-yellow-500 transition-all font-black text-lg uppercase placeholder:text-slate-800" onChange={(e) => setFormData({ ...formData, best_goalkeeper: e.target.value })} />
            </label>
          </div>

          {/* 4. Match con più gol */}
          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <label>
              <span className="flex items-center justify-between text-[10px] font-black text-yellow-500 uppercase mb-4 tracking-wider">
                <span className="flex items-center gap-2"><Flame size={14} /> Partita con più gol Fase a Gironi</span>
                <span className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-md">5 PT</span>
              </span>
              <select value={formData.high_scoring_match} className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 outline-none focus:border-yellow-500 transition-all font-black text-sm uppercase appearance-none" onChange={(e) => setFormData({ ...formData, high_scoring_match: e.target.value })}>
                <option value="">Scegli Partita...</option>
                {availableMatches.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </label>
          </div>

          {/* 5. Girone più gol */}
          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <label>
              <span className="flex items-center justify-between text-[10px] font-black text-yellow-500 uppercase mb-4 tracking-wider">
                <span className="flex items-center gap-2"><ArrowUpToLine size={14} /> Girone con più gol</span>
                <span className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-md">5 PT</span>
              </span>
              <select value={formData.highest_scoring_group} className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 outline-none focus:border-yellow-500 transition-all font-black text-xs sm:text-sm uppercase appearance-none" onChange={(e) => setFormData({ ...formData, highest_scoring_group: e.target.value })}>
                <option value="">Scegli Girone...</option>
                {TOURNAMENT_GROUPS.map((g) => (
                  <option key={g.name} value={g.name}>{g.name} ({g.teams.join(', ')})</option>
                ))}
              </select>
            </label>
          </div>

          {/* 6. Girone meno gol */}
          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <label>
              <span className="flex items-center justify-between text-[10px] font-black text-yellow-500 uppercase mb-4 tracking-wider">
                <span className="flex items-center gap-2"><ArrowDownToLine size={14} /> Girone con meno gol</span>
                <span className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-md">5 PT</span>
              </span>
              <select value={formData.lowest_scoring_group} className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 outline-none focus:border-yellow-500 transition-all font-black text-xs sm:text-sm uppercase appearance-none" onChange={(e) => setFormData({ ...formData, lowest_scoring_group: e.target.value })}>
                <option value="">Scegli Girone...</option>
                {TOURNAMENT_GROUPS.map((g) => (
                  <option key={g.name} value={g.name}>{g.name} ({g.teams.join(', ')})</option>
                ))}
              </select>
            </label>
          </div>

          {/* 7. Totale Autogol */}
          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <label>
              <span className="flex items-center justify-between text-[10px] font-black text-yellow-500 uppercase mb-4 tracking-wider">
                <span className="flex items-center gap-2"><Target size={14} /> Totale Autogol</span>
                <span className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-md">3 PT</span>
              </span>
              <input type="number" value={formData.total_own_goals} placeholder="Inserisci numero" className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 outline-none focus:border-yellow-500 transition-all font-black text-xl text-yellow-500 placeholder:text-slate-800" onChange={(e) => setFormData({ ...formData, total_own_goals: e.target.value })} />
            </label>
          </div>

          {/* 8. Totale Rigori */}
          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <label>
              <span className="flex items-center justify-between text-[10px] font-black text-yellow-500 uppercase mb-4 tracking-wider">
                <span className="flex items-center gap-2"><Goal size={14} /> Totale Rigori 90' e 120'</span>
                <span className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-md">3 PT</span>
              </span>
              <input type="number" value={formData.total_penalties} placeholder="Inserisci un numero" className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 outline-none focus:border-yellow-500 transition-all font-black text-xl text-yellow-500 placeholder:text-slate-800" onChange={(e) => setFormData({ ...formData, total_penalties: e.target.value })} />
            </label>
          </div>

          {/* 9. Totale Espulsioni */}
          <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <label>
              <span className="flex items-center justify-between text-[10px] font-black text-yellow-500 uppercase mb-4 tracking-wider">
                <span className="flex items-center gap-2"><Zap size={14} /> Totale Cartellini Rossi</span>
                <span className="bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-md">3 PT</span>
              </span>
              <input type="number" value={formData.total_red_cards} placeholder="Inserisci numero" className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 outline-none focus:border-yellow-500 transition-all font-black text-xl text-yellow-500 placeholder:text-slate-800" onChange={(e) => setFormData({ ...formData, total_red_cards: e.target.value })} />
            </label>
          </div>

        </div>

        {!isExpired && (
          <div className="fixed bottom-24 left-0 right-0 p-4 sm:p-6 flex justify-center items-center gap-2 sm:gap-3 z-50 pointer-events-none">
            <button type="button" onClick={resetBonus} disabled={loading} className="pointer-events-auto flex items-center justify-center p-4 sm:p-5 bg-slate-900 border-2 border-slate-800 rounded-xl sm:rounded-2xl text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all active:scale-95 shadow-xl">
              <Trash2 size={18} />
            </button>
            <button disabled={loading} type="submit" className="pointer-events-auto max-w-[240px] sm:max-w-xs w-full bg-yellow-500 text-slate-950 font-black py-4 sm:py-5 rounded-xl sm:rounded-2xl uppercase text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-2 sm:gap-3 italic active:scale-95">
              {loading ? 'Salvataggio...' : 'Conferma Bonus'}
              {!loading && <Zap size={16} fill="currentColor" />}
            </button>
          </div>
        )}
      </form>
    </main>
  );
}