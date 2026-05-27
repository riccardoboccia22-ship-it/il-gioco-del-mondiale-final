'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  Trophy, Users, Zap, Search, Trash2, ChevronDown, ChevronUp,
  BarChart3, RefreshCw, Star, X, MessageCircle, ArrowLeft,
  User, ListOrdered, Gamepad2
} from 'lucide-react';

const ADMIN_EMAIL = 'ricky@mondiale.it';
const WORLD_CUP_START_DATE = new Date('2025-06-11T21:00:00+02:00');

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
  if (lowerName === 'repubblica democratica del congo') return 'R.D. Congo';
  if (lowerName === 'bosnia ed erzegovina' || lowerName === 'bosnia erzegovina') return 'Bosnia';
  if (lowerName === 'repubblica ceca') return 'Rep. Ceca';
  if (lowerName === 'arabia saudita') return 'Arabia S.';
  if (lowerName === 'corea del sud') return 'Corea Sud';
  if (lowerName === 'stati uniti' || lowerName === 'usa') return 'USA';
  if (lowerName === 'nuova zelanda') return 'N. Zelanda';
  if (lowerName === "costa d'avorio") return 'Costa Avorio';
  if (teamName.length > 12) return teamName.substring(0, 10) + '.';
  return teamName;
};

const formatMatchName = (matchString: string) => {
  if (!matchString) return '';
  let formatted = matchString;
  formatted = formatted.replace(/Repubblica Democratica del Congo/gi, 'R.D. Congo');
  formatted = formatted.replace(/Repubblica Ceca/gi, 'Rep. Ceca');
  formatted = formatted.replace(/Bosnia ed Erzegovina|Bosnia Erzegovina/gi, 'Bosnia');
  formatted = formatted.replace(/Stati Uniti|USA/gi, 'USA');
  formatted = formatted.replace(/Arabia Saudita/gi, 'Arabia S.');
  formatted = formatted.replace(/Nuova Zelanda/gi, 'N. Zelanda');
  formatted = formatted.replace(/Corea del Sud/gi, 'Corea Sud');
  formatted = formatted.replace(/Costa d'Avorio/gi, 'Costa Avorio');
  return formatted;
};

export default function AdminPage() {
  const router = useRouter(); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [openSection, setOpenSection] = useState({ iscrizioni: false, risultati: false, tabellone: false, bonus: false, statistiche: false });
  const [matches, setMatches] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [officialBracket, setOfficialBracket] = useState<any[]>([]);
  const [allUserBonuses, setAllUserBonuses] = useState<any[]>([]);
  const [allBrackets, setAllBrackets] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [bonusData, setBonusData] = useState({ red: '', top: '', high: '', penalties: '', own_goals: '', high_group: '', low_group: '', mvp_world_cup: '', best_goalkeeper: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedMatches, setGroupedMatches] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) { setIsAdmin(true); fetchData(); }
      setLoading(false);
    }
    init();
  }, []);

  async function fetchData() {
    const [mRes, bRes, pRes, obRes, ubRes, brRes, predRes] = await Promise.all([
      supabase.from('matches').select('*').order('id', { ascending: true }),
      supabase.from('official_bonuses').select('*').eq('id', '00000000-0000-0000-0000-000000000000').maybeSingle(),
      supabase.from('profiles').select('*').order('username', { ascending: true }),
      supabase.from('official_bracket').select('*').order('id', { ascending: true }),
      supabase.from('user_bonus_answers').select('*'),
      supabase.from('brackets').select('*'),
      supabase.from('predictions').select('*')
    ]);
    
    const fetchedMatches = mRes.data || [];
    setMatches(fetchedMatches); 
    setProfiles(pRes.data || []); 
    setOfficialBracket(obRes.data || []); 
    setAllUserBonuses(ubRes.data || []);
    setAllBrackets(brRes.data || []);
    setPredictions(predRes.data || []);
    
    const tempGroups: Record<string, string[]> = {};
    fetchedMatches.forEach((m) => {
        if (!m.home_team || !m.away_team || m.home_team.includes('TBD')) return;
        const fullMatchString = `${m.home_team} - ${m.away_team}`;
        const formattedHomeTeam = formatMatchName(m.home_team);
        const groupObj = TOURNAMENT_GROUPS.find(g => 
            g.teams.some(t => t.toLowerCase() === formattedHomeTeam.toLowerCase())
        );
        const groupName = groupObj ? groupObj.name : 'Altri Match';
        if (!tempGroups[groupName]) tempGroups[groupName] = [];
        tempGroups[groupName].push(fullMatchString);
    });
    setGroupedMatches(tempGroups);

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

      const finishedMatchesCount = allMatches?.length || 0;
      const maxGroupPoints = finishedMatchesCount * 10;
      
      let maxBracketPoints = 0;
      offBracket?.forEach(ob => {
         const uS = normalizeStage(ob.stage);
         maxBracketPoints += STAGES.find(s => s.id === uS)?.pts || 0;
      });

      let maxBonusPoints = 0;
      if (offBonuses) {
         if (offBonuses.top_scorer) maxBonusPoints += 10;
         if (offBonuses.mvp_world_cup) maxBonusPoints += 10;
         if (offBonuses.best_goalkeeper) maxBonusPoints += 10;
         if (offBonuses.high_scoring_match) maxBonusPoints += 5;
         if (offBonuses.highest_scoring_group) maxBonusPoints += 5;
         if (offBonuses.lowest_scoring_group) maxBonusPoints += 5;
         if (offBonuses.total_red_cards != null) maxBonusPoints += 3;
         if (offBonuses.total_penalties != null) maxBonusPoints += 3;
         if (offBonuses.total_own_goals != null) maxBonusPoints += 3;
      }
      
      const totalMaxPoints = maxGroupPoints + maxBracketPoints + maxBonusPoints;

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
        
        const userTotalPoints = pG + pB + pBon;
        const efficiency = totalMaxPoints > 0 ? Math.round((userTotalPoints / totalMaxPoints) * 100) : 0;

        return { 
          ...profile, 
          points: userTotalPoints, 
          points_groups: pG, 
          points_bracket: pB, 
          points_bonus: pBon, 
          exact_matches: pEx, 
          pts_winner: sW, pts_f: sF, pts_sf: sSF, pts_qf: sQF, pts_r16: sR16, pts_r32: sR32,
          previous_ranking: profile.ranking,
          performance_pct: efficiency
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
      const payload = { id: '00000000-0000-0000-0000-000000000000', total_red_cards: null, total_penalties: null, total_own_goals: null, top_scorer: null, mvp_world_cup: null, best_goalkeeper: null, high_scoring_match: null, highest_scoring_group: null, lowest_scoring_group: null };
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

  const getWinnerStats = () => {
    const winners = allBrackets.filter(b => b.stage === 'WINNER');
    const total = winners.length;
    if (total === 0) return [];
    const counts: any = {};
    winners.forEach(w => { counts[w.team_name] = (counts[w.team_name] || 0) + 1; });
    return Object.entries(counts).sort((a: any, b: any) => b[1] - a[1]).map(([name, count]) => ({ name, pct: Math.round((Number(count) / total) * 100) }));
  };

  // --- SEZIONE RICHIESTA: ACCCOPPIAMENTO UTENTE -> VINCITORE SCELTO ---
  const getWinnerChoicesByUser = () => {
    const winners = allBrackets.filter(b => b.stage === 'WINNER');
    return winners.map(w => {
      const p = profiles.find(prof => prof.id === w.user_id);
      return {
        username: p ? p.username : 'Anonimo',
        team: w.team_name
      };
    }).sort((a, b) => a.username.localeCompare(b.username));
  };

  const getTopExactMatches = () => {
    return [...profiles]
      .filter(p => p.exact_matches > 0)
      .sort((a, b) => (b.exact_matches || 0) - (a.exact_matches || 0));
  };

  const getUserExactMatches = (userId: string) => {
    const uPreds = predictions.filter(p => p.user_id === userId);
    const exacts: any[] = [];
    uPreds.forEach(pred => {
      const m = matches.find(m => m.id === pred.match_id && m.is_finished);
      if (m) {
        const ph = Number(pred.home_score), pa = Number(pred.away_score);
        const mh = Number(m.home_score_final), ma = Number(m.away_score_final);
        if (ph === mh && pa === ma) {
          exacts.push(m);
        }
      }
    });
    return exacts;
  };

  const getBonusDetails = (k: string) => {
    const choices: Record<string, { originalName: string; count: number; users: string[] }> = {};
    allUserBonuses.forEach(b => {
      if (b[k]) {
        const raw = b[k].trim();
        const key = raw.toLowerCase();
        const p = profiles.find(prof => prof.id === b.user_id);
        const username = p ? p.username : 'Anonimo';
        if (!choices[key]) {
          choices[key] = { originalName: raw, count: 0, users: [] };
        }
        choices[key].count += 1;
        if (!choices[key].users.includes(username)) {
          choices[key].users.push(username);
        }
      }
    });
    return Object.values(choices).sort((a, b) => b.count - a.count);
  };

  const copyClassificaReport = () => {
    const sorted = [...profiles].sort((a, b) => (parseInt(a.ranking || '999') - parseInt(b.ranking || '999')));
    let text = `🏆 *CLASSIFICA MONDIALE 2026* 🏆\n\n`;
    sorted.slice(0, 10).forEach((p, i) => {
        let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⚽';
        const exactStr = p.exact_matches > 0 ? ` [🎯 ${p.exact_matches} esatt${p.exact_matches === 1 ? 'o' : 'i'}]` : '';
        text += `${medal} *${p.ranking}. ${p.username}* - ${p.points} pt${exactStr}\n`;
    });
    text += `\n👉 Guarda la classifica completa:\nwww.iltuopronostico.it`;

    navigator.clipboard.writeText(text);
    toast.success('Classifica copiata per WhatsApp! 📱', { icon: '💬' });
  };

  const copyBonusReport = () => {
    const winners = getWinnerStats();
    let text = `📊 *STATISTICHE & SENTIMENTO DEL GRUPPO* 📊\n\n`;
    text += `👑 *Vincitore più gettonato:* ${winners[0]?.name || 'Nessuno'} (${winners[0]?.pct || 0}%)\n`;
    
    const fields = [
      { l: '✨ MVP', k: 'mvp_world_cup' },
      { l: '⚽ Capocannoniere', k: 'top_scorer' },
      { l: '🧤 Miglior Portiere', k: 'best_goalkeeper' },
      { l: '🔥 Match più Gol', k: 'high_scoring_match' },
      { l: '📈 Girone più Gol', k: 'highest_scoring_group' },
      { l: '📉 Girone meno Gol', k: 'lowest_scoring_group' }
    ];
    
    fields.forEach(f => {
      const details = getBonusDetails(f.k);
      if (details.length > 0) {
        text += `${f.l}: ${formatMatchName(details[0].originalName)} (${details[0].count} voti)\n`;
      }
    });

    text += `\n👉 Entra nell'app per vedere i pronostici di tutti:\nwww.iltuopronostico.it`;

    navigator.clipboard.writeText(text);
    toast.success('Statistiche copiate per WhatsApp! 📱', { icon: '💬' });
  };

  const copyCecchiniReport = () => {
    let text = `🎯 *REPORT CECCHINI (RISULTATI ESATTI)* 🎯\n`;
    const matchesWithExact = matches.filter(m => m.is_finished).map(m => {
       const exactUsers = profiles.filter(p => {
          const uPred = predictions.find(pred => pred.user_id === p.id && pred.match_id === m.id);
          if(!uPred) return false;
          return Number(uPred.home_score) === Number(m.home_score_final) && Number(uPred.away_score) === Number(m.away_score_final);
       }).map(p => p.username);
       return { ...m, exactUsers, group: TOURNAMENT_GROUPS.find(g => g.teams.some(t => t.toLowerCase() === formatMatchName(m.home_team).toLowerCase()))?.name || 'Fase Finale' };
    }).filter(m => m.exactUsers.length > 0);

    if(matchesWithExact.length === 0) {
       text += `\nAncora nessun risultato esatto!\n`;
    } else {
       const grouped: any = {};
       matchesWithExact.forEach(m => {
          if(!grouped[m.group]) grouped[m.group] = [];
          grouped[m.group].push(m);
       });
       
       const sortedGroups = Object.keys(grouped).sort((a, b) => {
          if(a.includes('Gruppo') && b.includes('Gruppo')) return a.localeCompare(b);
          if(a.includes('Gruppo')) return -1;
          return 1;
       });

       sortedGroups.forEach(g => {
          text += `\n*${g}*\n`;
          grouped[g].forEach((m: any) => {
             text += `⚽ ${formatTeamName(m.home_team)} ${m.home_score_final}-${m.away_score_final} ${formatTeamName(m.away_team)}\n`;
             text += `   👉 ${m.exactUsers.join(', ')}\n`;
          });
       });
    }

    text += `\n👉 Entra nell'app per vedere i pronostici di tutti:\nwww.iltuopronostico.it`;

    navigator.clipboard.writeText(text);
    toast.success('Report Cecchini copiato! 🎯', { icon: '🎯' });
  };

  const isExpired = new Date() > WORLD_CUP_START_DATE;
  const navItems = [
    { name: 'Profilo', path: '/profile', icon: <User size={20} strokeWidth={2.5} /> },
    { name: 'Fase Gironi', path: '/matches', icon: <Gamepad2 size={20} strokeWidth={2.5} /> },
    { name: 'Fase Finale', path: '/bracket', icon: <Trophy size={20} strokeWidth={2.5} /> },
    { name: 'Bonus', path: '/bonus', icon: <Star size={20} strokeWidth={2.5} /> },
    { name: 'Classifica', path: '/leaderboard', icon: <ListOrdered size={20} strokeWidth={2.5} /> },
    ...(isExpired ? [{ name: 'Globale', path: '/tutti-i-pronostici', icon: <Users size={20} strokeWidth={2.5} /> }] : []),
  ];

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-yellow-500 font-black animate-pulse">CARICAMENTO...</div>;
  if (!isAdmin) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-rose-500 font-black">ACCESSO NEGATO</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-40 font-sans overflow-x-hidden relative">
      <button onClick={() => router.push('/profile')} className="absolute top-6 left-4 text-slate-500 hover:text-yellow-500 transition-colors flex items-center gap-1.5 font-black uppercase text-[10px] tracking-widest z-10">
        <ArrowLeft size={16} /> Indietro
      </button>

      <header className="flex flex-col items-center mb-8 pt-4 gap-4 mt-8 sm:mt-4">
        <h1 className="text-4xl font-black text-yellow-500 italic uppercase tracking-tighter leading-none">Control Tower</h1>
        
        <div className="flex flex-wrap items-center justify-center gap-2 px-2">
          <div className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-full border border-slate-800 shadow-xl overflow-x-auto max-w-full">
            <button onClick={copyClassificaReport} className="flex items-center gap-1.5 px-3 py-2 text-[10px] sm:text-xs font-black uppercase text-emerald-500 hover:bg-emerald-500/10 transition-colors rounded-full whitespace-nowrap">
              <MessageCircle size={14} /> Classifica
            </button>
            <div className="w-px h-5 bg-slate-800"></div>
            <button onClick={copyBonusReport} className="flex items-center gap-1.5 px-3 py-2 text-[10px] sm:text-xs font-black uppercase text-purple-500 hover:bg-purple-500/10 transition-colors rounded-full whitespace-nowrap">
              <MessageCircle size={14} /> Statistiche
            </button>
            <div className="w-px h-5 bg-slate-800"></div>
            <button onClick={copyCecchiniReport} className="flex items-center gap-1.5 px-3 py-2 text-[10px] sm:text-xs font-black uppercase text-orange-500 hover:bg-orange-500/10 transition-colors rounded-full whitespace-nowrap">
              <MessageCircle size={14} /> Cecchini
            </button>
            <div className="w-px h-5 bg-slate-800"></div>
            <button onClick={() => syncLeaderboard(true)} disabled={syncing} className={`flex items-center gap-1.5 px-3 py-2 text-[10px] sm:text-xs font-black uppercase text-blue-500 hover:bg-blue-500/10 transition-colors rounded-full whitespace-nowrap ${syncing ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Sync
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto space-y-5">
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
                    <p className="font-black text-xs uppercase truncate italic">
                      {p.username}
                      {p.full_name ? (
                        <span className="text-slate-400 font-bold not-italic lowercase text-[11px] ml-1">
                          ({p.full_name})
                        </span>
                      ) : (
                        <span className="text-rose-500 font-bold not-italic lowercase text-[10px] ml-1">
                          (Nessun Nome)
                        </span>
                      )}
                      <span className="text-yellow-500 ml-2">#{p.ranking || '--'}</span>
                    </p>
                    <p className="text-[8px] text-slate-500 mt-1">{p.points || 0} PT ({p.points_groups}G+{p.points_bracket}B) - Esatti: {p.exact_matches || 0}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 self-center">
                    <div className="relative"><select value={p.payment_method || (p.is_paid ? 'Pagato' : '')} onChange={(e) => updatePaymentMethod(p.id, e.target.value)} className={`px-3 py-2 pr-6 rounded-xl text-[9px] font-black uppercase transition-all outline-none appearance-none cursor-pointer text-center ${p.is_paid || p.payment_method ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-rose-500 border border-rose-500/30'}`}><option value="">NON PAGATO</option><option value="Pagato" hidden>PAGATO ✓</option><option value="Satispay">SATISPAY</option><option value="PayPal">PAYPAL</option><option value="Contanti">CONTANTI</option><option value="Bonifico">BONIFICO</option></select><ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${p.is_paid || p.payment_method ? 'text-slate-950' : 'text-rose-500'}`} /></div>
                    <button onClick={() => deleteUser(p.id, p.username)} className="p-2 text-rose-500 bg-rose-500/10 rounded-xl"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-2xl">
          <button onClick={() => setOpenSection({ ...openSection, risultati: !openSection.risultati })} className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30">
            <div className="flex items-center gap-3"><Zap className="text-yellow-500" size={24} /><h2 className="text-lg font-black uppercase italic tracking-tight">Risultati Gironi</h2></div>
            {openSection.risultati ? <ChevronUp /> : <ChevronDown />}
          </button>
          {openSection.risultati && (
            <div className="p-4 space-y-6 bg-slate-950/30">
              <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} /><input type="text" placeholder="CERCA SQUADRA..." className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-xs font-black uppercase outline-none focus:border-yellow-500" onChange={e => setSearchTerm(e.target.value)} /></div>
              <div className="grid gap-4">
                {matches.filter(m => m.home_team.toLowerCase().includes(searchTerm.toLowerCase()) || m.away_team.toLowerCase().includes(searchTerm.toLowerCase())).map(m => {
                  const hasR = m.is_finished && m.home_score_final !== null;
                  return (
                    <div key={m.id} className={`bg-slate-900 p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border transition-all ${hasR ? 'border-emerald-500/40 shadow-xl' : 'border-slate-800 shadow-md'}`}>
                      <div className="flex justify-between items-center mb-3 border-b border-slate-800/50 pb-2"><span className="text-[9px] font-black text-slate-500 uppercase italic">Match #{m.id}</span>{hasR && <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Risultato Finale</span>}</div>
                      <div className="flex items-center justify-between gap-1 sm:gap-2 mb-4">
                        <div className="w-[30%] flex flex-col items-center gap-1.5"><img src={`https://flagcdn.com/w40/${flagMap[m.home_team?.toLowerCase().trim()] || 'un'}.png`} className="w-8 h-5 object-cover rounded shadow border border-slate-800" alt="" /><span className="text-[9px] sm:text-[10px] font-black uppercase text-center w-full italic text-white">{formatTeamName(m.home_team)}</span></div>
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 px-1"><input id={`h-${m.id}`} type="number" defaultValue={m.home_score_final ?? ''} onChange={(e) => { if (e.target.value !== '') document.getElementById(`a-${m.id}`)?.focus(); }} className="w-10 h-10 bg-slate-950 rounded-xl text-center font-black text-yellow-500 border border-slate-700 outline-none focus:border-yellow-500" /><span className="text-slate-700 font-black">-</span><input id={`a-${m.id}`} type="number" defaultValue={m.away_score_final ?? ''} className="w-10 h-10 bg-slate-950 rounded-xl text-center font-black text-yellow-500 border border-slate-700 outline-none focus:border-yellow-500" /></div>
                        <div className="w-[30%] flex flex-col items-center gap-1.5"><img src={`https://flagcdn.com/w40/${flagMap[m.away_team?.toLowerCase().trim()] || 'un'}.png`} className="w-8 h-5 object-cover rounded shadow border border-slate-800" alt="" /><span className="text-[9px] sm:text-[10px] font-black uppercase text-center w-full italic text-white">{formatTeamName(m.away_team)}</span></div>
                      </div>
                      <button onClick={() => updateScore(m.id)} className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all ${hasR ? 'bg-emerald-600 text-white' : 'bg-yellow-500 text-slate-950'}`}>{hasR ? 'Aggiorna' : 'Conferma'}</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-2xl">
          <button onClick={() => setOpenSection({ ...openSection, tabellone: !openSection.tabellone })} className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30">
            <div className="flex items-center gap-3"><Trophy className="text-blue-500" size={24} /><h2 className="text-lg font-black uppercase italic tracking-tight">Fase Finale</h2></div>
            {openSection.tabellone ? <ChevronUp /> : <ChevronDown />}
          </button>
          {openSection.tabellone && (
            <div className="p-5 space-y-5 bg-slate-950/30">
              <div className="space-y-3"><select id="q_team" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black text-xs text-white uppercase outline-none focus:border-blue-500 appearance-none"><option value="">SQUADRA...</option>{TEAMS_2026.map(t => (<option key={t} value={t}>{t}</option>))}</select><select id="q_stage" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black text-xs text-white uppercase outline-none focus:border-blue-500 appearance-none">{STAGES.map(s => (<option key={s.id} value={s.id}>{s.label}</option>))}</select></div>
              <button onClick={saveQualif} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">CONFERMA</button>
              <div className="space-y-4 pt-4">{STAGES.map(stg => { const items = officialBracket.filter(o => normalizeStage(o.stage) === stg.id); if (items.length === 0) return null; return (<div key={stg.id} className="bg-slate-900 border border-slate-800/50 p-4 rounded-3xl"><h3 className="text-[10px] font-black text-blue-500 uppercase mb-3 border-b border-slate-800/50 pb-2 tracking-[0.2em]">{stg.label}</h3><div className="flex flex-wrap gap-2">{items.map(o => (<div key={o.id} className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3"><span className="text-[10px] font-black uppercase italic text-white">{o.team_name}</span><button onClick={() => deleteQualif(o.id)} className="text-rose-500 p-1"><X size={14} /></button></div>))}</div></div>); })}</div>
            </div>
          )}
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-2xl">
          <button onClick={() => setOpenSection({ ...openSection, bonus: !openSection.bonus })} className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30">
            <div className="flex items-center gap-3"><Star className="text-purple-500" size={24} /><h2 className="text-lg font-black uppercase italic tracking-tight">Bonus Ufficiali</h2></div>
            {openSection.bonus ? <ChevronUp /> : <ChevronDown />}
          </button>
          {openSection.bonus && (
            <div className="p-5 bg-slate-950/30">
              <form onSubmit={saveBonuses} className="space-y-5">
                <div className="grid grid-cols-1 gap-4">
                  <input value={bonusData.mvp_world_cup} onChange={e => setBonusData({ ...bonusData, mvp_world_cup: e.target.value })} placeholder="MVP MONDIALE" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black uppercase text-purple-400 text-xs outline-none focus:border-purple-500" />
                  <input value={bonusData.top} onChange={e => setBonusData({ ...bonusData, top: e.target.value })} placeholder="CAPOCANNONIERE" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black uppercase text-purple-400 text-xs outline-none focus:border-purple-500" />
                  <input value={bonusData.best_goalkeeper} onChange={e => setBonusData({ ...bonusData, best_goalkeeper: e.target.value })} placeholder="MIGLIOR PORTIERE" className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black uppercase text-purple-400 text-xs outline-none focus:border-purple-500" />
                  <select value={bonusData.high} onChange={e => setBonusData({ ...bonusData, high: e.target.value })} className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black uppercase text-blue-400 text-xs outline-none appearance-none"><option value="">MATCH PIÙ GOL...</option>{Object.entries(groupedMatches).map(([g, m]) => (<optgroup key={g} label={g} className="bg-slate-900">{m.map(match => <option key={match} value={match}>{formatMatchName(match)}</option>)}</optgroup>))}</select>
                  <div className="grid grid-cols-2 gap-3"><select value={bonusData.high_group} onChange={e => setBonusData({ ...bonusData, high_group: e.target.value })} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black uppercase text-blue-400 text-xs outline-none"><option value="">GIRONE PIÙ GOL...</option>{GROUPS.map(g => (<option key={g} value={g}>{g}</option>))}</select><select value={bonusData.low_group} onChange={e => setBonusData({ ...bonusData, low_group: e.target.value })} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black uppercase text-blue-400 text-xs outline-none"><option value="">GIRONE MENO GOL...</option>{GROUPS.map(g => (<option key={g} value={g}>{g}</option>))}</select></div>
                  <div className="grid grid-cols-3 gap-3"><input value={bonusData.own_goals} onChange={e => setBonusData({...bonusData, own_goals: e.target.value})} type="number" placeholder="AUTOGOL" className="bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black text-emerald-400 text-xs text-center" /><input value={bonusData.penalties} onChange={e => setBonusData({...bonusData, penalties: e.target.value})} type="number" placeholder="RIGORI" className="bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black text-emerald-400 text-xs text-center" /><input value={bonusData.red} onChange={e => setBonusData({...bonusData, red: e.target.value})} type="number" placeholder="ROSSI" className="bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black text-emerald-400 text-xs text-center" /></div>
                </div>
                <div className="flex gap-4 pt-4"><button type="button" onClick={resetBonuses} className="p-5 bg-slate-900 border border-rose-500/30 text-rose-500 rounded-2xl"><Trash2 size={20} /></button><button type="submit" className="flex-1 bg-purple-600 py-5 rounded-2xl font-black uppercase text-xs tracking-widest italic shadow-xl">SALVA BONUS</button></div>
              </form>
            </div>
          )}
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-xl">
          <button onClick={() => setOpenSection({ ...openSection, statistiche: !openSection.statistiche })} className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30">
            <div className="flex items-center gap-3"><BarChart3 className="text-cyan-500" size={24} /><h2 className="text-lg font-black uppercase italic tracking-tight">Statistiche Globali</h2></div>
            {openSection.statistiche ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {openSection.statistiche && (
            <div className="p-5 bg-slate-950/50 space-y-6">
              
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-4 border-b border-slate-800/50 pb-1 italic">Vincitore del Mondiale (Sentiment)</p>
                <div className="space-y-2">
                  {getWinnerStats().slice(0,5).map(w => (
                    <div key={w.name} className="flex justify-between items-center text-[10px] font-black uppercase italic"><span className="text-white">{w.name}</span><span className="text-cyan-500">{w.pct}%</span></div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md"><p className="text-[8px] font-black text-slate-500 uppercase mb-1">Rossi Avg</p><p className="text-xl font-black text-cyan-400">{getAverage('total_red_cards')}</p></div>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md"><p className="text-[8px] font-black text-slate-500 uppercase mb-1">Rigori Avg</p><p className="text-xl font-black text-cyan-400">{getAverage('total_penalties')}</p></div>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md"><p className="text-[8px] font-black text-slate-500 uppercase mb-1">Autogol Avg</p><p className="text-xl font-black text-cyan-400">{getAverage('total_own_goals')}</p></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* --- SCHEDA DETTAGLIATA: UTENTE -> SCELTA VINCITORE --- */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col max-h-60">
                  <p className="text-[9px] font-black text-yellow-500 uppercase mb-3 border-b border-slate-800/50 pb-1 italic shrink-0">Scelte Vincitore (Per Utente)</p>
                  <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                    {getWinnerChoicesByUser().length > 0 ? getWinnerChoicesByUser().map((item, idx) => {
                      const flagCode = flagMap[item.team?.toLowerCase().trim()];
                      return (
                        <div key={`${item.username}-${idx}`} className="flex justify-between items-center border-b border-slate-800/30 pb-2 last:border-0 last:pb-0">
                          <span className="text-[10px] font-black uppercase italic text-white truncate pr-2">{item.username}</span>
                          <div className="flex items-center gap-1.5 shrink-0 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 shadow-sm">
                            {flagCode ? (
                              <img src={`https://flagcdn.com/w20/${flagCode}.png`} className="w-4 h-2.5 object-cover rounded-sm" alt="" />
                            ) : (
                              <div className="w-4 h-2.5 bg-slate-800 rounded-sm"></div>
                            )}
                            <span className="text-[9px] font-black uppercase italic text-yellow-500">{formatTeamName(item.team)}</span>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="text-[10px] font-black uppercase italic text-slate-600">Nessun tabellone compilato</div>
                    )}
                  </div>
                </div>

                {/* --- BLOCCO CECCHINI (RISULTATI ESATTI) --- */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col max-h-60">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-3 border-b border-slate-800/50 pb-1 italic shrink-0">Cecchini (Ris. Esatti)</p>
                  <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                    {getTopExactMatches().length > 0 ? getTopExactMatches().map(p => {
                      const exactsList = getUserExactMatches(p.id);
                      return (
                        <div key={p.username} className="flex flex-col border-b border-slate-800/30 pb-2.5 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase italic mb-1">
                            <span className="truncate pr-2 text-white">{p.username}</span>
                            <span className="text-emerald-500 font-mono shrink-0">{p.exact_matches || 0} presi</span>
                          </div>
                          
                          {exactsList.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {exactsList.map((m: any) => (
                                <div key={m.id} className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[8px] text-slate-300 shadow-sm">
                                  <img src={`https://flagcdn.com/w20/${flagMap[m.home_team?.toLowerCase().trim()] || 'un'}.png`} className="w-3 h-2 object-cover rounded-sm" alt="" />
                                  <span className="uppercase font-black">{formatTeamName(m.home_team)}</span>
                                  <span className="text-emerald-400 font-black">{m.home_score_final}-{m.away_score_final}</span>
                                  <span className="uppercase font-black">{formatTeamName(m.away_team)}</span>
                                  <img src={`https://flagcdn.com/w20/${flagMap[m.away_team?.toLowerCase().trim()] || 'un'}.png`} className="w-3 h-2 object-cover rounded-sm" alt="" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }) : (
                      <div className="text-[10px] font-black uppercase italic text-slate-600">Nessun risultato</div>
                    )}
                  </div>
                </div>

                {/* --- SEZIONE ALTRI BONUS CON LOGICA DETTAGLIATA --- */}
                {[ { label: 'MVP Mondiale', key: 'mvp_world_cup' }, { label: 'Capocannoniere', key: 'top_scorer' }, { label: 'Miglior Portiere', key: 'best_goalkeeper' }, { label: 'Match + Gol', key: 'high_scoring_match' } ].map((s) => {
                  const details = getBonusDetails(s.key);
                  return (
                    <div key={s.key} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col max-h-60">
                      <p className="text-[9px] font-black text-slate-500 uppercase mb-3 border-b border-slate-800/50 pb-1 italic shrink-0">{s.label}</p>
                      <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                        {details.length > 0 ? details.map((item: any) => (
                          <div key={item.originalName} className="flex flex-col border-b border-slate-800/30 pb-2.5 last:border-0 last:pb-0">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase italic mb-1">
                              <span className="truncate pr-2 text-white">{formatMatchName(item.originalName)}</span>
                              <span className="text-cyan-500 font-mono shrink-0">{item.count} {item.count === 1 ? 'voto' : 'voti'}</span>
                            </div>
                            <p className="text-[8px] text-slate-500 tracking-tight font-medium leading-tight">
                              Scelto da: <span className="text-slate-400 font-semibold">{item.users.join(', ')}</span>
                            </p>
                          </div>
                        )) : (
                          <div className="text-[10px] font-black uppercase italic text-slate-600">Nessun voto inserito</div>
                        )}
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
          )}
        </section>
      </div>

      <nav className="fixed bottom-0 left-0 w-full z-50 bg-slate-950/95 backdrop-blur-md border-t border-slate-900 pb-safe-area shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-md mx-auto flex items-center justify-around py-2 px-1">
          {navItems.map((item) => (
            <button 
              key={item.path} 
              onClick={() => router.push(item.path)}
              className="relative flex flex-col items-center justify-between h-12 group transition-all"
              style={{ width: `${100 / navItems.length}%` }}
            >
              <div className="flex items-end justify-center h-6 w-full">
                <div className="text-slate-500 group-hover:text-slate-300 transition-all duration-300">
                  {item.icon}
                </div>
              </div>
              <div className="flex items-center justify-center h-6 w-full px-0.5">
                <span className="text-[7px] sm:text-[8px] font-black uppercase text-center leading-[1.1] tracking-wider text-slate-600 group-hover:text-slate-400 transition-colors">
                  {item.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
}