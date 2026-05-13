'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import {
  Trophy, Users, Zap, Search, Trash2, ChevronDown, ChevronUp,
  BarChart3, RefreshCw, Star, X, CheckCircle2, MessageCircle
} from 'lucide-react';

const ADMIN_EMAIL = 'ricky@mondiale.it';

const STAGES = [
  { id: 'R32', label: 'Sedicesimi (+2pt)', pts: 2 },
  { id: 'R16', label: 'Ottavi (+4pt)', pts: 4 },
  { id: 'QF', label: 'Quarti (+6pt)', pts: 6 },
  { id: 'SF', label: 'Semifinale (+8pt)', pts: 8 },
  { id: 'F', label: 'Finale (+10pt)', pts: 10 },
  { id: 'WINNER', label: 'Vincitore Mondiale (+20pt)', pts: 20 },
];

const GROUPS = ['Gruppo A', 'Gruppo B', 'Gruppo C', 'Gruppo D', 'Gruppo E', 'Gruppo F', 'Gruppo G', 'Gruppo H', 'Gruppo I', 'Gruppo J', 'Gruppo K', 'Gruppo L'];

const TEAMS_2026 = [
  'Algeria', 'Arabia Saudita', 'Argentina', 'Australia', 'Austria', 'Belgio',
  'Bosnia ed Erzegovina', 'Brasile', 'Canada', 'Capo Verde', 'Colombia',
  'Corea del Sud', "Costa d'avorio", 'Croazia', 'Curaçao', 'Ecuador', 'Egitto',
  'Francia', 'Germania', 'Ghana', 'Giappone', 'Giordania', 'Haiti', 'Inghilterra',
  'Iran', 'Iraq', 'Marocco', 'Messico', 'Norvegia', 'Nuova Zelanda', 'Olanda',
  'Panama', 'Paraguay', 'Portogallo', 'Qatar', 'Repubblica Ceca',
  'Repubblica Democratica del Congo', 'Scozia', 'Senegal', 'Spagna',
  'Stati Uniti', 'Sudafrica', 'Svezia', 'Svizzera', 'Tunisia', 'Turchia',
  'Uruguay', 'Uzbekistan',
].sort();

const flagMap: { [key: string]: string } = {
  algeria: 'dz', 'arabia saudita': 'sa', argentina: 'ar', australia: 'au', austria: 'at',
  belgio: 'be', 'bosnia ed erzegovina': 'ba', brasile: 'br', canada: 'ca', 'capo verde': 'cv', 
  colombia: 'co', 'corea del sud': 'kr', "costa d'avorio": 'ci', croazia: 'hr', 
  curaçao: 'cw', ecuador: 'ec', egitto: 'eg', francia: 'fr', germania: 'de', ghana: 'gh', 
  giappone: 'jp', giordania: 'jo', haiti: 'ht', inghilterra: 'gb-eng', iran: 'ir', iraq: 'iq',
  marocco: 'ma', messico: 'mx', norvegia: 'no', 'nuova zelanda': 'nz', olanda: 'nl',
  panama: 'pa', paraguay: 'py', portogallo: 'pt', qatar: 'qa', 'repubblica ceca': 'cz',
  'repubblica democratica del congo': 'cd', scozia: 'gb-sct', senegal: 'sn',
  spagna: 'es', 'stati uniti': 'us', sudafrica: 'za', svezia: 'se',
  svizzera: 'ch', tunisia: 'tn', turchia: 'tr', uruguay: 'uy', uzbekistan: 'uz',
};

const normalizeStage = (s: string) => {
  const u = s?.toUpperCase().trim() || '';
  if (u.includes('SEDICESIM') || u === 'R32') return 'R32';
  if (u.includes('OTTAV') || u === 'R16') return 'R16';
  if (u.includes('QUART') || u === 'QF') return 'QF';
  if (u.includes('SEMIFINAL') || u === 'SF') return 'SF';
  if (u.includes('VINCITOR') || u.includes('CAMPIONE') || u === 'WINNER') return 'WINNER';
  if (u.includes('FINAL') || u === 'F') return 'F';
  return u;
};

const formatTeamName = (teamName: string) => {
  if (!teamName) return '';
  const lowerName = teamName.toLowerCase().trim();
  if (lowerName === 'repubblica democratica del congo') return 'R. D. Congo';
  if (lowerName === 'bosnia ed erzegovina') return 'Bosnia';
  if (lowerName === 'bosnia erzegovina') return 'Bosnia';
  if (lowerName === 'repubblica ceca') return 'Rep. Ceca';
  if (lowerName === 'arabia saudita') return 'Arabia S.';
  if (lowerName === 'corea del sud') return 'Corea Sud';
  if (lowerName === 'stati uniti') return 'USA';
  if (lowerName === 'nuova zelanda') return 'N. Zelanda';
  return teamName;
};

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [openSection, setOpenSection] = useState({ iscrizioni: false, risultati: false, tabellone: false, bonus: false, statistiche: false });
  const [matches, setMatches] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [officialBracket, setOfficialBracket] = useState<any[]>([]);
  const [allUserBonuses, setAllUserBonuses] = useState<any[]>([]);
  const [bonusData, setBonusData] = useState({ red: '', top: '', high: '', penalties: '', own_goals: '', high_group: '', low_group: '', mvp_world_cup: '', best_goalkeeper: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) { setIsAdmin(true); fetchData(); }
      setLoading(false);
    }
    init();
  }, []);

  async function fetchData() {
    const [mRes, bRes, pRes, obRes, ubRes] = await Promise.all([
      supabase.from('matches').select('*').order('id', { ascending: true }),
      supabase.from('official_bonuses').select('*').eq('id', '00000000-0000-0000-0000-000000000000').maybeSingle(),
      supabase.from('profiles').select('*').order('username', { ascending: true }),
      supabase.from('official_bracket').select('*').order('id', { ascending: true }),
      supabase.from('user_bonus_answers').select('*'),
    ]);
    setMatches(mRes.data || []); setProfiles(pRes.data || []); setOfficialBracket(obRes.data || []); setAllUserBonuses(ubRes.data || []);
    if (bRes.data) {
      setBonusData({
        red: bRes.data.total_red_cards?.toString() || '', top: bRes.data.top_scorer || '', high: bRes.data.high_scoring_match || '',
        penalties: bRes.data.total_penalties?.toString() || '', own_goals: bRes.data.total_own_goals?.toString() || '',
        high_group: bRes.data.highest_scoring_group || '', low_group: bRes.data.lowest_scoring_group || '',
        mvp_world_cup: bRes.data.mvp_world_cup || '', best_goalkeeper: bRes.data.best_goalkeeper || '',
      });
    }
  }

  const syncLeaderboard = async (isManual = true) => {
    if (isManual && !window.confirm('Ricalcolare punti e spareggi per tutti?')) return;
    setSyncing(true);
    const syncToast = !isManual ? toast.loading('Calcolo Classifica...') : null;
    try {
      const [{ data: profs }, { data: allMatches }, { data: allPreds }, { data: offBonuses }, { data: userBonuses }, { data: offBracket }, { data: userBrackets }] = await Promise.all([
        supabase.from('profiles').select('*'), supabase.from('matches').select('*').eq('is_finished', true),
        supabase.from('predictions').select('*'), supabase.from('official_bonuses').select('*').maybeSingle(),
        supabase.from('user_bonus_answers').select('*'), supabase.from('official_bracket').select('*'), supabase.from('brackets').select('*'),
      ]);
      if (!profs) return;

      const updates = profs.map(profile => {
        let pG = 0, pB = 0, pBon = 0, pEx = 0;
        let sW = 0, sF = 0, sSF = 0, sQF = 0, sR16 = 0, sR32 = 0;

        const uPreds = allPreds?.filter(p => p.user_id === profile.id) || [];
        uPreds.forEach(pred => {
          const m = allMatches?.find(m => m.id === pred.match_id);
          if (m) {
            const ph = Number(pred.home_score), pa = Number(pred.away_score);
            const mh = Number(m.home_score_final), ma = Number(m.away_score_final);
            const pR = ph > pa ? '1' : ph < pa ? '2' : 'X', mR = mh > ma ? '1' : mh < ma ? '2' : 'X';
            if (ph === mh && pa === ma) { pG += 10; pEx += 1; }
            else if (pR === mR && (ph === mh || pa === ma)) pG += 6;
            else if (pR === mR) pG += 4;
            else if (ph === mh || pa === ma) pG += 2;
          }
        });

        const uBrackets = userBrackets?.filter(b => b.user_id === profile.id) || [];
        uBrackets.forEach(ub => {
          const uS = normalizeStage(ub.stage);
          if (offBracket?.some(ob => normalizeStage(ob.stage) === uS && ob.team_name.toLowerCase().trim() === ub.team_name.toLowerCase().trim())) {
            const pts = STAGES.find(s => s.id === uS)?.pts || 0;
            pB += pts;
            if (uS === 'WINNER') sW += pts; else if (uS === 'F') sF += pts; else if (uS === 'SF') sSF += pts; else if (uS === 'QF') sQF += pts; else if (uS === 'R16') sR16 += pts; else if (uS === 'R32') sR32 += pts;
          }
        });

        const ub = userBonuses?.find(b => b.user_id === profile.id);
        if (ub && offBonuses) {
          const bMap: any = { top_scorer: 10, mvp_world_cup: 10, best_goalkeeper: 10, high_scoring_match: 5, highest_scoring_group: 5, lowest_scoring_group: 5, total_red_cards: 3, total_penalties: 3, total_own_goals: 3 };
          Object.entries(bMap).forEach(([k, pts]: any) => { if (offBonuses[k] != null && String(offBonuses[k]).trim().toLowerCase() === String(ub[k]).trim().toLowerCase()) pBon += pts; });
        }
        
        return { 
          ...profile, 
          points: pG + pB + pBon, 
          points_groups: pG, 
          points_bracket: pB, 
          points_bonus: pBon, 
          exact_matches: pEx, 
          pts_winner: sW, pts_f: sF, pts_sf: sSF, pts_qf: sQF, pts_r16: sR16, pts_r32: sR32,
          previous_ranking: profile.ranking
        };
      });

      const sorted = [...updates].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points; 
        if (b.exact_matches !== a.exact_matches) return (b.exact_matches || 0) - (a.exact_matches || 0);
        if (b.points_bonus !== a.points_bonus) return b.points_bonus - a.points_bonus; 
        if (b.pts_winner !== a.pts_winner) return b.pts_winner - a.pts_winner;
        if (b.pts_f !== a.pts_f) return b.pts_f - a.pts_f; 
        if (b.pts_sf !== a.pts_sf) return b.pts_sf - a.pts_sf; 
        if (b.pts_qf !== a.pts_qf) return b.pts_qf - a.pts_qf;
        if (b.pts_r16 !== a.pts_r16) return b.pts_r16 - a.pts_r16; 
        if (b.pts_r32 !== a.pts_r32) return b.pts_r32 - a.pts_r32;
        return (a.username || '').localeCompare(b.username || '');
      });

      const ranked = sorted.map((u, i) => ({ ...u, ranking: (i + 1).toString() }));
      await supabase.from('profiles').upsert(ranked, { onConflict: 'id' });
      
      if (syncToast) toast.dismiss(syncToast);
      
      if (isManual) {
        toast.success('Punti ricalcolati forzatamente!');
      } else {
        toast.success('Classifica aggiornata in automatico! 🏆');
      }
      
      fetchData();
    } catch (err: any) { toast.error(err.message); } finally { setSyncing(false); }
  };

  const updateScore = async (id: number) => {
    const h = (document.getElementById(`h-${id}`) as HTMLInputElement).value;
    const a = (document.getElementById(`a-${id}`) as HTMLInputElement).value;
    const isFin = h !== '' && a !== '';
    const { error } = await supabase.from('matches').update({ home_score_final: isFin ? parseInt(h) : null, away_score_final: isFin ? parseInt(a) : null, is_finished: isFin }).eq('id', id);
    if (!error) { 
      toast.success('Risultato Match Salvato!'); 
      await syncLeaderboard(false); 
    }
  };

  const saveBonuses = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { id: '00000000-0000-0000-0000-000000000000', total_red_cards: bonusData.red ? parseInt(bonusData.red) : null, total_penalties: bonusData.penalties ? parseInt(bonusData.penalties) : null, total_own_goals: bonusData.own_goals ? parseInt(bonusData.own_goals) : null, top_scorer: bonusData.top.trim() || null, mvp_world_cup: bonusData.mvp_world_cup.trim() || null, best_goalkeeper: bonusData.best_goalkeeper.trim() || null, high_scoring_match: bonusData.high || null, highest_scoring_group: bonusData.high_group || null, lowest_scoring_group: bonusData.low_group || null };
    const { error } = await supabase.from('official_bonuses').upsert(payload, { onConflict: 'id' });
    if (!error) { toast.success('Bonus Ufficiali Salvati!'); await syncLeaderboard(false); }
  };

  const resetBonuses = async () => { 
    if (window.confirm('Svuotare TUTTI i bonus ufficiali? I punteggi verranno ricalcolati.')) { 
      const payload = {
        id: '00000000-0000-0000-0000-000000000000',
        total_red_cards: null,
        total_penalties: null,
        total_own_goals: null,
        top_scorer: null,
        mvp_world_cup: null,
        best_goalkeeper: null,
        high_scoring_match: null,
        highest_scoring_group: null,
        lowest_scoring_group: null
      };
      
      const { error } = await supabase.from('official_bonuses').upsert(payload, { onConflict: 'id' }); 
      
      if (!error) {
        toast.success('Bonus azzerati con successo!');
        setBonusData({ red: '', top: '', high: '', penalties: '', own_goals: '', high_group: '', low_group: '', mvp_world_cup: '', best_goalkeeper: '' }); 
        await syncLeaderboard(false); 
      } else {
        toast.error('Errore durante il reset: ' + error.message);
      }
    } 
  };

  const saveQualif = async () => {
    const t = (document.getElementById('q_team') as HTMLSelectElement).value, s = (document.getElementById('q_stage') as HTMLSelectElement).value;
    if (t && s) { const { error } = await supabase.from('official_bracket').insert([{ stage: s, team_name: t }]); if (!error) { toast.success('Tabellone aggiornato!'); await syncLeaderboard(false); } }
  };
  const deleteQualif = async (id: any) => { await supabase.from('official_bracket').delete().eq('id', id); await syncLeaderboard(false); };
  
  const updatePaymentMethod = async (uId: string, method: string) => {
    const isPaid = method !== ''; 
    setProfiles(prevProfiles => prevProfiles.map(p => p.id === uId ? { ...p, is_paid: isPaid, payment_method: method } : p));
    const { error } = await supabase.from('profiles').update({ is_paid: isPaid, payment_method: method }).eq('id', uId);
    if (error) { toast.error('Errore'); fetchData(); } else { toast.success('Metodo aggiornato!'); }
  };

  const deleteUser = async (uId: string, name: string) => { if (window.confirm(`Eliminare ${name}?`)) { await supabase.from('predictions').delete().eq('user_id', uId); await supabase.from('brackets').delete().eq('user_id', uId); await supabase.from('user_bonus_answers').delete().eq('user_id', uId); await supabase.from('profiles').delete().eq('id', uId); fetchData(); await syncLeaderboard(false); } };
  
  const getAverage = (k: string) => { 
    const v = allUserBonuses.filter(b => b[k] != null && String(b[k]).trim() !== '').map(b => Number(b[k])).filter(n => !isNaN(n)); 
    if (!v.length) return '0';
    return (v.reduce((a, b) => a + b, 0) / v.length).toLocaleString('it-IT', { maximumFractionDigits: 1 }); 
  };

  const getTopPicks = (k: string) => { const counts: any = {}; allUserBonuses.forEach(b => { if (b[k]) { const v = b[k].trim().toUpperCase(); counts[v] = (counts[v] || 0) + 1; } }); return Object.entries(counts).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3); };

  // LA NUOVA FUNZIONE MAGICA PER WHATSAPP
  const copyWhatsAppReport = () => {
    if (profiles.length === 0) return toast.error('Nessuno in classifica!');
    const sorted = [...profiles].sort((a, b) => (parseInt(a.ranking || '999') - parseInt(b.ranking || '999')));
    
    let text = `🏆 *CLASSIFICA MONDIALE 2026 - AGGIORNAMENTO* 🏆\n\n`;
    sorted.forEach((p, i) => {
      let medal = '⚽';
      if (i === 0) medal = '🥇';
      if (i === 1) medal = '🥈';
      if (i === 2) medal = '🥉';
      // Mostriamo solo la Top 10 per non intasare le chat
      if (i < 10) {
        text += `${medal} *${p.ranking}. ${p.username}* - ${p.points} pt\n`;
      }
    });

    if (sorted.length > 10) {
      text += `\n...e altri ${sorted.length - 10} giocatori!\n`;
    }

    text += `\n👉 Guarda la classifica completa: www.tuodominio.it/leaderboard`;

    navigator.clipboard.writeText(text);
    toast.success('Bollettino copiato! Incollalo su WhatsApp 📱', { icon: '💬' });
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-yellow-500 font-black animate-pulse">CARICAMENTO...</div>;
  if (!isAdmin) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-rose-500 font-black">ACCESSO NEGATO</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-40 font-sans overflow-x-hidden">
      
      <header className="text-center mb-8 pt-4 relative">
        <h1 className="text-4xl font-black text-yellow-500 italic uppercase tracking-tighter mb-2">Control Tower</h1>
        
        {/* I DUE PULSANTI IN ALTO A DESTRA */}
        <div className="absolute right-2 top-4 flex items-center gap-1">
          <button 
            onClick={copyWhatsAppReport} 
            className="p-2 text-slate-500 hover:text-emerald-400 transition-colors bg-slate-900 border border-slate-800 rounded-full shadow-lg"
            title="Copia Bollettino per WhatsApp"
          >
            <MessageCircle size={18} />
          </button>
          <button 
            onClick={() => syncLeaderboard(true)} 
            disabled={syncing} 
            className={`p-2 text-slate-500 hover:text-blue-400 transition-colors bg-slate-900 border border-slate-800 rounded-full shadow-lg ${syncing ? 'animate-spin text-blue-500' : ''}`}
            title="Forza Ricalcolo Classifica"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto space-y-5">
        
        {/* SEZIONE 1: ISCRIZIONI E QUOTE */}
        <section className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-2xl">
          <button onClick={() => setOpenSection({ ...openSection, iscrizioni: !openSection.iscrizioni })} className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30">
            <div className="flex items-center gap-3"><Users className="text-emerald-500" size={24} /><h2 className="text-lg font-black uppercase italic tracking-tight">Iscrizioni ({profiles.length})</h2></div>
            {openSection.iscrizioni ? <ChevronUp /> : <ChevronDown />}
          </button>
          {openSection.iscrizioni && (
            <div className="bg-slate-950/50 divide-y divide-slate-800/50">
              {profiles.map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-black text-xs uppercase truncate italic">{p.username} <span className="text-yellow-500">#{p.ranking || '--'}</span></p>
                    <p className="text-[8px] text-slate-500 mt-1">{p.points || 0} PT ({p.points_groups}G+{p.points_bracket}B) - Esatti: {p.exact_matches || 0}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    
                    <div className="relative">
                      <select
                        value={p.payment_method || (p.is_paid ? 'Pagato' : '')}
                        onChange={(e) => updatePaymentMethod(p.id, e.target.value)}
                        className={`px-3 py-2 pr-6 rounded-xl text-[9px] font-black uppercase transition-all outline-none appearance-none cursor-pointer text-center ${
                          p.is_paid || p.payment_method
                            ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                            : 'bg-slate-900 text-rose-500 border border-rose-500/30'
                        }`}
                      >
                        <option value="">NON PAGATO</option>
                        <option value="Pagato" hidden>PAGATO ✓</option> 
                        <option value="Satispay">SATISPAY</option>
                        <option value="PayPal">PAYPAL</option>
                        <option value="Contanti">CONTANTI</option>
                        <option value="Bonifico">BONIFICO</option>
                      </select>
                      <ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${p.is_paid || p.payment_method ? 'text-slate-950' : 'text-rose-500'}`} />
                    </div>

                    <button onClick={() => deleteUser(p.id, p.username)} className="p-2 text-rose-500 bg-rose-500/10 rounded-xl"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SEZIONE 2: RISULTATI GIRONI */}
        <section className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-2xl">
          <button onClick={() => setOpenSection({ ...openSection, risultati: !openSection.risultati })} className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30">
            <div className="flex items-center gap-3"><Zap className="text-yellow-500" size={24} /><h2 className="text-lg font-black uppercase italic tracking-tight">Risultati Gironi</h2></div>
            {openSection.risultati ? <ChevronUp /> : <ChevronDown />}
          </button>
          {openSection.risultati && (
            <div className="p-4 space-y-6 bg-slate-950/30">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <input type="text" placeholder="CERCA SQUADRA..." className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-xs font-black uppercase outline-none focus:border-yellow-500" onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="grid gap-4">
                {matches.filter(m => m.home_team.toLowerCase().includes(searchTerm.toLowerCase()) || m.away_team.toLowerCase().includes(searchTerm.toLowerCase())).map(m => {
                  const hasR = m.is_finished && m.home_score_final !== null;
                  return (
                    <div key={m.id} className={`bg-slate-900 p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border transition-all ${hasR ? 'border-emerald-500/40 shadow-xl' : 'border-slate-800 shadow-md'}`}>
                      <div className="flex justify-between items-center mb-3 border-b border-slate-800/50 pb-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase italic">Match #{m.id}</span>
                        {hasR && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Risultato Finale</span>}
                      </div>

                      <div className="flex items-center justify-between gap-1 sm:gap-2 mb-4">
                        <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                          <img src={`https://flagcdn.com/w40/${flagMap[m.home_team.toLowerCase()] || 'un'}.png`} className="w-7 h-5 sm:w-8 sm:h-5 object-cover rounded shadow-md" alt="" />
                          <span className="text-[9px] sm:text-[10px] font-black uppercase text-center truncate w-full italic text-white">{formatTeamName(m.home_team)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 px-1">
                          <input id={`h-${m.id}`} type="number" defaultValue={m.home_score_final ?? ''} onChange={(e) => { if (e.target.value !== '') document.getElementById(`a-${m.id}`)?.focus(); }} className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-950 rounded-xl text-center font-black text-yellow-500 border-2 border-slate-700 outline-none text-base sm:text-lg focus:border-yellow-500" />
                          <span className="text-slate-700 font-black text-xs sm:text-base">-</span>
                          <input id={`a-${m.id}`} type="number" defaultValue={m.away_score_final ?? ''} className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-950 rounded-xl text-center font-black text-yellow-500 border-2 border-slate-700 outline-none text-base sm:text-lg focus:border-yellow-500" />
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                          <img src={`https://flagcdn.com/w40/${flagMap[m.away_team.toLowerCase()] || 'un'}.png`} className="w-7 h-5 sm:w-8 sm:h-5 object-cover rounded shadow-md" alt="" />
                          <span className="text-[9px] sm:text-[10px] font-black uppercase text-center truncate w-full italic text-white">{formatTeamName(m.away_team)}</span>
                        </div>
                      </div>

                      <button onClick={() => updateScore(m.id)} className={`w-full py-3 sm:py-4 rounded-xl flex items-center justify-center gap-2 font-black uppercase text-[10px] sm:text-xs tracking-widest transition-all active:scale-95 ${hasR ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-yellow-500 text-slate-950 shadow-yellow-500/20'}`}>
                        <CheckCircle2 size={16} className="shrink-0" />
                        <span className="truncate">{hasR ? 'Aggiorna Risultato' : 'Conferma Risultato'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* SEZIONE 3: TABELLONE FINALE */}
        <section className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-2xl">
          <button onClick={() => setOpenSection({ ...openSection, tabellone: !openSection.tabellone })} className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30">
            <div className="flex items-center gap-3"><Trophy className="text-blue-500" size={24} /><h2 className="text-lg font-black uppercase italic tracking-tight">Fase Finale</h2></div>
            {openSection.tabellone ? <ChevronUp /> : <ChevronDown />}
          </button>
          {openSection.tabellone && (
            <div className="p-5 space-y-5 bg-slate-950/30">
              <div className="space-y-3">
                <select id="q_team" className="w-full bg-slate-900 border-2 border-slate-800 p-4 rounded-2xl font-black text-xs text-white uppercase outline-none focus:border-blue-500 appearance-none"><option value="">SELEZIONA SQUADRA...</option>{TEAMS_2026.map(t => (<option key={t} value={t}>{t}</option>))}</select>
                <select id="q_stage" className="w-full bg-slate-900 border-2 border-slate-800 p-4 rounded-2xl font-black text-xs text-white uppercase outline-none focus:border-blue-500 appearance-none">{STAGES.map(s => (<option key={s.id} value={s.id}>{s.label}</option>))}</select>
              </div>
              <button onClick={saveQualif} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-600/20 active:scale-95 transition-all">CONFERMA QUALIFICATA</button>
              
              <div className="space-y-4 pt-4">
                {STAGES.map(stg => {
                  const items = officialBracket.filter(o => normalizeStage(o.stage) === stg.id);
                  if (items.length === 0) return null;
                  return (
                    <div key={stg.id} className="bg-slate-900 border border-slate-800/50 p-4 rounded-3xl">
                      <h3 className="text-[10px] font-black text-blue-500 uppercase mb-3 border-b border-slate-800/50 pb-2 tracking-[0.2em]">{stg.label}</h3>
                      <div className="flex flex-wrap gap-2">
                        {items.map(o => (
                          <div key={o.id} className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase italic text-white">{o.team_name}</span>
                            <button onClick={() => deleteQualif(o.id)} className="text-rose-500 hover:bg-rose-500/10 p-1 rounded-lg transition-colors"><X size={14} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* SEZIONE 4: BONUS UFFICIALI */}
        <section className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-2xl">
          <button onClick={() => setOpenSection({ ...openSection, bonus: !openSection.bonus })} className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30">
            <div className="flex items-center gap-3"><Star className="text-purple-500" size={24} /><h2 className="text-lg font-black uppercase italic tracking-tight">Bonus Ufficiali</h2></div>
            {openSection.bonus ? <ChevronUp /> : <ChevronDown />}
          </button>
          {openSection.bonus && (
            <div className="p-5 bg-slate-950/30">
              <form onSubmit={saveBonuses} className="space-y-5">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1"><span className="text-[9px] font-black uppercase text-slate-500 ml-1">MVP Mondiale (10pt)</span><input value={bonusData.mvp_world_cup} onChange={e => setBonusData({ ...bonusData, mvp_world_cup: e.target.value })} className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black uppercase text-purple-400 text-xs outline-none focus:border-purple-500" /></div>
                  <div className="space-y-1"><span className="text-[9px] font-black uppercase text-slate-500 ml-1">Capocannoniere (10pt)</span><input value={bonusData.top} onChange={e => setBonusData({ ...bonusData, top: e.target.value })} className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black uppercase text-purple-400 text-xs outline-none focus:border-purple-500" /></div>
                  <div className="space-y-1"><span className="text-[9px] font-black uppercase text-slate-500 ml-1">Miglior Portiere (10pt)</span><input value={bonusData.best_goalkeeper} onChange={e => setBonusData({ ...bonusData, best_goalkeeper: e.target.value })} className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black uppercase text-purple-400 text-xs outline-none focus:border-purple-500" /></div>
                  
                  <div className="space-y-1"><span className="text-[9px] font-black uppercase text-slate-500 ml-1">Match con più gol (5pt)</span><select value={bonusData.high} onChange={e => setBonusData({ ...bonusData, high: e.target.value })} className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black uppercase text-blue-400 text-xs appearance-none"><option value="">SELEZIONA PARTITA...</option>{matches.filter(m => !m.home_team.includes('TBD')).map(m => (<option key={m.id} value={`${m.home_team} - ${m.away_team}`}>{m.home_team} - {m.away_team}</option>))}</select></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><span className="text-[9px] font-black uppercase text-slate-500 ml-1">Girone + Gol (5pt)</span><select value={bonusData.high_group} onChange={e => setBonusData({ ...bonusData, high_group: e.target.value })} className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black uppercase text-blue-400 text-xs appearance-none"><option value="">SELEZIONA...</option>{GROUPS.map(g => (<option key={g} value={g}>{g}</option>))}</select></div>
                    <div className="space-y-1"><span className="text-[9px] font-black uppercase text-slate-500 ml-1">Girone - Gol (5pt)</span><select value={bonusData.low_group} onChange={e => setBonusData({ ...bonusData, low_group: e.target.value })} className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black uppercase text-blue-400 text-xs appearance-none"><option value="">SELEZIONA...</option>{GROUPS.map(g => (<option key={g} value={g}>{g}</option>))}</select></div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1"><span className="text-[9px] font-black uppercase text-slate-500 ml-1">Autogol (3pt)</span><input value={bonusData.own_goals} onChange={e => setBonusData({...bonusData, own_goals: e.target.value})} type="number" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black text-emerald-400 text-xs" /></div>
                    <div className="space-y-1"><span className="text-[9px] font-black uppercase text-slate-500 ml-1">Rigori (3pt)</span><input value={bonusData.penalties} onChange={e => setBonusData({...bonusData, penalties: e.target.value})} type="number" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black text-emerald-400 text-xs" /></div>
                    <div className="space-y-1"><span className="text-[9px] font-black uppercase text-slate-500 ml-1">Rossi (3pt)</span><input value={bonusData.red} onChange={e => setBonusData({...bonusData, red: e.target.value})} type="number" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black text-emerald-400 text-xs" /></div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={resetBonuses} className="p-5 bg-slate-900 border border-rose-500/30 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={24} /></button>
                  <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-500 py-5 rounded-2xl font-black uppercase text-xs tracking-widest italic shadow-xl shadow-purple-600/20 active:scale-95 transition-all">SALVA BONUS UFFICIALI</button>
                </div>
              </form>
            </div>
          )}
        </section>

        {/* SEZIONE 5: STATISTICHE */}
        <section className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-xl">
          <button onClick={() => setOpenSection({ ...openSection, statistiche: !openSection.statistiche })} className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30">
            <div className="flex items-center gap-3"><BarChart3 className="text-cyan-500" size={24} /><h2 className="text-lg font-black uppercase italic tracking-tight">Statistiche Globali</h2></div>
            {openSection.statistiche ? <ChevronUp /> : <ChevronDown />}
          </button>
          {openSection.statistiche && (
            <div className="p-5 bg-slate-950/50 space-y-6">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md truncate">
                  <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Rossi Avg</p>
                  <p className="text-xl font-black text-cyan-400 truncate" title={getAverage('total_red_cards')}>{getAverage('total_red_cards')}</p>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md truncate">
                  <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Rigori Avg</p>
                  <p className="text-xl font-black text-cyan-400 truncate" title={getAverage('total_penalties')}>{getAverage('total_penalties')}</p>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md truncate">
                  <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Autogol Avg</p>
                  <p className="text-xl font-black text-cyan-400 truncate" title={getAverage('total_own_goals')}>{getAverage('total_own_goals')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                {[
                  { label: 'MVP Mondiale', key: 'mvp_world_cup' },
                  { label: 'Capocannoniere', key: 'top_scorer' },
                  { label: 'Miglior Portiere', key: 'best_goalkeeper' },
                  { label: 'Match con più Gol', key: 'high_scoring_match' },
                  { label: 'Girone con più Gol', key: 'highest_scoring_group' },
                  { label: 'Girone con meno Gol', key: 'lowest_scoring_group' },
                ].map((s) => (
                  <div key={s.key} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col">
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-3 border-b border-slate-800/50 pb-1 italic">{s.label}</p>
                    <div className="flex-1 flex flex-col justify-start">
                      {getTopPicks(s.key).map(([name, count]: any) => (
                        <div key={name} className="flex justify-between text-[10px] font-black uppercase italic mb-1.5">
                          <span className="truncate pr-2 text-white">{name}</span>
                          <span className="text-cyan-500 font-mono shrink-0">{count} voti</span>
                        </div>
                      ))}
                      {getTopPicks(s.key).length === 0 && (
                        <p className="text-[8px] text-slate-700 italic text-center py-2 uppercase mt-auto">Nessun voto registrato</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}