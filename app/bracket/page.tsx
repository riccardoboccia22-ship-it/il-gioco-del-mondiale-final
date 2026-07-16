'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ChevronDown, X, ShieldCheck, Trash2, Map, Info, Trophy, BarChart3, Search, Zap, CheckCircle2, Loader2, Medal, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

const WORLD_CUP_START_DATE = new Date('2026-06-11T21:00:00+02:00');
const FINALE_START_DATE = new Date('2026-07-18T23:00:00+02:00'); // Orario d'inizio della finale 3°/4° posto di Sabato

// LISTE CONVOCATI UFFICIALI ORDINATE PER RUOLO (P, D, C, A)
const PLAYERS_SPAGNA = [
  'David Raya', 'Unai Simón', 'Joan García', 
  'Marc Pubill', 'Alejandro Grimaldo', 'Eric García', 'Marcos Llorente', 'Pedro Porro', 'Aymeric Laporte', 'Pau Cubarsí', 'Marc Cucurella', 
  'Pedri', 'Fabián Ruiz', 'Martin Zubimendi', 'Gavi', 'Rodri', 'Álex Baena', 'Mikel Merino', 
  'Mikel Oyarzabal', 'Dani Olmo', 'Nico Williams', 'Yéremy Pino', 'Ferran Torres', 'Borja Iglesias', 'Víctor Muñoz', 'Lamine Yamal'
];

const PLAYERS_ARGENTINA = [
  'Emiliano Martínez', 'Gerónimo Rulli', 'Juan Musso', 
  'Gonzalo Montiel', 'Nahuel Molina', 'Cristian Romero', 'Lisandro Martínez', 'Nicolás Otamendi', 'Facundo Medina', 'Nicolás Tagliafico', 'Marcos Senesi', 
  'Rodrigo De Paul', 'Leandro Paredes', 'Alexis Mac Allister', 'Enzo Fernández', 'Giovani Lo Celso', 'Exequiel Palacios', 'Valentín Barco', 'Nicolás González', 
  'Lionel Messi', 'Lautaro Martínez', 'Julián Álvarez', 'Thiago Almada', 'Giuliano Simeone', 'Nico Paz', 'José Manuel López'
];

const PLAYERS_INGHILTERRA = [
  'Jordan Pickford', 'Dean Henderson', 'James Trafford', 
  'John Stones', 'Marc Guéhi', 'Ezri Konsa', 'Dan Burn', 'Reece James', 'Djed Spence', 'Jarell Quansah', "Nico O'Reilly", 
  'Declan Rice', 'Jude Bellingham', 'Kobbie Mainoo', 'Jordan Henderson', 'Conor Gallagher', 'Morgan Rogers', 'Eberechi Eze', 'Elliot Anderson', 
  'Harry Kane', 'Bukayo Saka', 'Marcus Rashford', 'Anthony Gordon', 'Ollie Watkins', 'Noni Madueke', 'Ivan Toney'
];

const PLAYERS_FRANCIA = [
  'Mike Maignan', 'Brice Samba', 'Robin Risser', 
  'Malo Gusto', 'Lucas Digne', 'Dayot Upamecano', 'Jules Koundé', 'Ibrahima Konaté', 'William Saliba', 'Théo Hernandez', 'Lucas Hernandez', 'Maxence Lacroix', 
  "N'Golo Kanté", 'Aurélien Tchouaméni', 'Adrien Rabiot', 'Warren Zaïre-Emery', 'Manu Koné', 'Rayan Cherki', 'Maghnes Akliouche', 
  'Ousmane Dembélé', 'Marcus Thuram', 'Kylian Mbappé', 'Michael Olise', 'Désiré Doué', 'Jean-Philippe Mateta', 'Bradley Barcola'
];

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

const STAGES = [
  { id: 'R32', label: 'Sedicesimi', count: 32, pts: 2 },
  { id: 'R16', label: 'Ottavi', count: 16, pts: 4 },
  { id: 'QF', label: 'Quarti', count: 8, pts: 6 },
  { id: 'SF', label: 'Semifinali', count: 4, pts: 8 },
  { id: 'F', label: 'Finale', count: 2, pts: 10 },
  { id: 'WINNER', label: 'Vincitore Mondiale', count: 1, pts: 20 },
];

const TOURNAMENT_GROUPS = [
  { name: 'Gruppo A', teams: ['Messico', 'Sudafrica', 'Corea Sud', 'Rep. Ceca'] },
  { name: 'Gruppo B', teams: ['Canada', 'Svizzera', 'Qatar', 'Bosnia'] }, 
  { name: 'Gruppo C', teams: ['Brasile', 'Marocco', 'Haiti', 'Scozia'] },
  { name: 'Gruppo D', teams: ['USA', 'Australia', 'Paraguay', 'Turchia'] }, 
  { name: 'Gruppo E', teams: ['Germania', 'C. Avorio', 'Ecuador', 'Curacao'] }, 
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
  belgio: 'be', 'bosnia ed erzegovina': 'ba', 'bosnia erzegovina': 'ba', bosnia: 'ba',
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

const formatTeamName = (name: string) => {
  if (!name) return '';
  const n = name.trim().toLowerCase();
  if (n === 'repubblica democratica del congo' || n === 'r.d. congo' || n === 'congo' || n === 'rd congo') return 'R.D. Congo';
  if (n === 'stati uniti' || n === 'usa') return 'USA';
  if (n === 'bosnia ed erzegovina' || n === 'bosnia erzegovina' || n === 'bosnia') return 'Bosnia';
  if (n === 'nuova zelanda' || n === 'n. zelanda') return 'N. Zelanda';
  if (n === 'arabia saudita' || n === 'arabia s.') return 'Arabia S.';
  if (n === 'repubblica ceca' || n === 'rep. ceca') return 'Rep. Ceca';
  if (n === "costa d'avorio" || n === 'costa avorio' || n === 'c. avorio') return 'C. Avorio';
  if (n === 'corea del sud' || n === 'corea sud') return 'Corea Sud';
  if (n === 'curaçao' || n === 'curacao') return 'Curacao';
  return name;
};

const normalizeStage = (s: string) => {
  const u = s?.toUpperCase().trim() || '';
  if (u.includes('SEDICESIM') || u === 'R32') return 'R32';
  if (u.includes('OTTAV') || u === 'R16') return 'R16';
  if (u.includes('QUART') || u === 'QF') return 'QF';
  if (u.includes('SEMIFINAL') || u === 'SF') return 'SF';
  if (u.includes('VINCITOR') || u === 'WINNER') return 'WINNER';
  if (u.includes('FINAL') || u === 'F') return 'F';
  return u;
};

const cleanString = (str: string) => {
  if (!str) return '';
  return formatTeamName(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

export default function BracketPage() {
  const router = useRouter(); 
  const [userId, setUserId] = useState<string | null>(null);
  const [selections, setSelections] = useState<any>({});
  const [officialBracket, setOfficialBracket] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [activeCell, setActiveCell] = useState<any>(null);
  const [teamSearch, setTeamSearch] = useState(''); 

  // STATI EVENTO "LA FINALE"
  const [isFinaleActive, setIsFinaleActive] = useState(false);
  const [isFinalePopupOpen, setIsFinalePopupOpen] = useState(false);
  const [activeFinaleTab, setActiveFinaleTab] = useState<'SATURDAY' | 'SUNDAY'>('SUNDAY');
  const [hasPlayedFinale, setHasPlayedFinale] = useState(false);
  const [isSavingFinale, setIsSavingFinale] = useState(false);
  
  const [finalePrediction, setFinalePrediction] = useState({
    // DOMENICA: FINALE 1° e 2° POSTO (Spagna - Argentina)
    home_score: '',
    away_score: '',
    ending_method: 'REGULAR',
    f12_mvp: '',
    f12_ht_home_score: '',
    f12_ht_away_score: '',
    f12_2nd_home_score: '',
    f12_2nd_away_score: '',
    f12_first_to_score: '',
    f12_scorer: '',
    first_goal_minute: '',
    f12_fouls: '',
    f12_yellow_cards: '',
    f12_red_cards: '',
    f12_penalties: '',
    
    // SABATO: FINALE 3° e 4° POSTO (Invertito visivamente: Francia - Inghilterra)
    f34_home_score: '',
    f34_away_score: '',
    f34_ending_method: 'REGULAR',
    f34_mvp: '',
    f34_ht_home_score: '',
    f34_ht_away_score: '',
    f34_2nd_home_score: '',
    f34_2nd_away_score: '',
    f34_first_to_score: '',
    f34_scorer: '',
    f34_first_goal_minute: '',
    f34_fouls: '',
    f34_yellow_cards: '',
    f34_red_cards: '',
    f34_penalties: ''
  });

  const isExpired = new Date() > WORLD_CUP_START_DATE;
  const isFinaleExpired = new Date() > FINALE_START_DATE;

  useEffect(() => {
    loadSavedBracket();
  }, []);

  useEffect(() => {
    if (!activeCell) {
      setTeamSearch(''); 
    }
  }, [activeCell]);

  async function loadSavedBracket() {
    try {
      setFetching(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/'); return; } 
      setUserId(user.id);

      const [profileRes, bracketRes, offBracketRes, settingsRes, finaleRes] = await Promise.all([
         supabase.from('profiles').select('full_name').eq('id', user.id).single(),
         supabase.from('brackets').select('stage, team_name').eq('user_id', user.id),
         supabase.from('official_bracket').select('*'),
         supabase.from('app_settings').select('is_finale_active').eq('id', 1).maybeSingle(),
         supabase.from('final_match_predictions').select('*').eq('user_id', user.id).maybeSingle()
      ]);

      if (!profileRes.data || !profileRes.data.full_name) {
        router.push('/setup-profilo');
        return;
      }

      if (bracketRes.data) {
        const saved: any = {};
        const stageCounts: any = {};
        bracketRes.data.forEach((row) => {
          const count = stageCounts[row.stage] || 0;
          saved[`${row.stage}-${count}`] = row.team_name;
          stageCounts[row.stage] = count + 1;
        });
        setSelections(saved);
      }

      if (offBracketRes.data) {
          setOfficialBracket(offBracketRes.data);
      }

      if (settingsRes.data) {
        setIsFinaleActive(settingsRes.data.is_finale_active);
      }
      
      if (finaleRes.data) {
        setFinalePrediction({
          home_score: finaleRes.data.home_score?.toString() || '',
          away_score: finaleRes.data.away_score?.toString() || '',
          ending_method: finaleRes.data.ending_method || 'REGULAR',
          f12_mvp: finaleRes.data.f12_mvp || '',
          f12_ht_home_score: finaleRes.data.f12_ht_home_score?.toString() || '',
          f12_ht_away_score: finaleRes.data.f12_ht_away_score?.toString() || '',
          f12_2nd_home_score: finaleRes.data.f12_2nd_home_score?.toString() || '',
          f12_2nd_away_score: finaleRes.data.f12_2nd_away_score?.toString() || '',
          f12_first_to_score: finaleRes.data.f12_first_to_score || '',
          f12_scorer: finaleRes.data.f12_scorer || '',
          first_goal_minute: finaleRes.data.first_goal_minute?.toString() || '',
          f12_fouls: finaleRes.data.f12_fouls?.toString() || '',
          f12_yellow_cards: finaleRes.data.f12_yellow_cards?.toString() || '',
          f12_red_cards: finaleRes.data.f12_red_cards?.toString() || '',
          f12_penalties: finaleRes.data.f12_penalties?.toString() || '',

          f34_home_score: finaleRes.data.f34_home_score?.toString() || '',
          f34_away_score: finaleRes.data.f34_away_score?.toString() || '',
          f34_ending_method: finaleRes.data.f34_ending_method || 'REGULAR',
          f34_mvp: finaleRes.data.f34_mvp || '',
          f34_ht_home_score: finaleRes.data.f34_ht_home_score?.toString() || '',
          f34_ht_away_score: finaleRes.data.f34_ht_away_score?.toString() || '',
          f34_2nd_home_score: finaleRes.data.f34_2nd_home_score?.toString() || '',
          f34_2nd_away_score: finaleRes.data.f34_2nd_away_score?.toString() || '',
          f34_first_to_score: finaleRes.data.f34_first_to_score || '',
          f34_scorer: finaleRes.data.f34_scorer || '',
          f34_first_goal_minute: finaleRes.data.f34_first_goal_minute?.toString() || '',
          f34_fouls: finaleRes.data.f34_fouls?.toString() || '',
          f34_yellow_cards: finaleRes.data.f34_yellow_cards?.toString() || '',
          f34_red_cards: finaleRes.data.f34_red_cards?.toString() || '',
          f34_penalties: finaleRes.data.f34_penalties?.toString() || ''
        });
        setHasPlayedFinale(true);
      } else if (settingsRes.data?.is_finale_active && !isFinaleExpired) {
        setTimeout(() => setIsFinalePopupOpen(true), 1200);
      }

    } catch (err) { toast.error('Errore caricamento'); } finally { setFetching(false); }
  }

  const handleSaveFinale = async () => {
    if (!userId || isFinaleExpired) return;
    
    if (
      finalePrediction.home_score === '' || 
      finalePrediction.away_score === '' || 
      finalePrediction.f34_home_score === '' || 
      finalePrediction.f34_away_score === ''
    ) {
      toast.error('Inserisci almeno i Risultati Esatti di entrambe le finali!');
      return;
    }
    
    setIsSavingFinale(true);
    try {
      const parseNum = (val: string) => {
        if (val === '' || val === null || val === undefined) return null;
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? null : parsed;
      };

      const team1 = selections['F-0'] || 'Spagna';
      const team2 = selections['F-1'] || 'Argentina';
      const hScore = parseNum(finalePrediction.home_score) ?? 0;
      const aScore = parseNum(finalePrediction.away_score) ?? 0;
      const calculatedChampion = hScore >= aScore ? team1 : team2;

      const payload = {
        user_id: userId,
        champion_team: calculatedChampion, 
        home_score: parseNum(finalePrediction.home_score),
        away_score: parseNum(finalePrediction.away_score),
        ending_method: finalePrediction.ending_method,
        f12_mvp: finalePrediction.f12_mvp || null,
        f12_ht_home_score: parseNum(finalePrediction.f12_ht_home_score),
        f12_ht_away_score: parseNum(finalePrediction.f12_ht_away_score),
        f12_2nd_home_score: parseNum(finalePrediction.f12_2nd_home_score),
        f12_2nd_away_score: parseNum(finalePrediction.f12_2nd_away_score),
        f12_first_to_score: finalePrediction.f12_first_to_score || null,
        f12_scorer: finalePrediction.f12_scorer || null,
        first_goal_minute: parseNum(finalePrediction.first_goal_minute) ?? 0, 
        f12_fouls: parseNum(finalePrediction.f12_fouls),
        f12_yellow_cards: parseNum(finalePrediction.f12_yellow_cards),
        f12_red_cards: parseNum(finalePrediction.f12_red_cards),
        f12_penalties: parseNum(finalePrediction.f12_penalties),

        f34_home_score: parseNum(finalePrediction.f34_home_score),
        f34_away_score: parseNum(finalePrediction.f34_away_score),
        f34_ending_method: finalePrediction.f34_ending_method,
        f34_mvp: finalePrediction.f34_mvp || null,
        f34_ht_home_score: parseNum(finalePrediction.f34_ht_home_score),
        f34_ht_away_score: parseNum(finalePrediction.f34_ht_away_score),
        f34_2nd_home_score: parseNum(finalePrediction.f34_2nd_home_score),
        f34_2nd_away_score: parseNum(finalePrediction.f34_2nd_away_score),
        f34_first_to_score: finalePrediction.f34_first_to_score || null,
        f34_scorer: finalePrediction.f34_scorer || null,
        f34_first_goal_minute: parseNum(finalePrediction.f34_first_goal_minute),
        f34_fouls: parseNum(finalePrediction.f34_fouls),
        f34_yellow_cards: parseNum(finalePrediction.f34_yellow_cards),
        f34_red_cards: parseNum(finalePrediction.f34_red_cards),
        f34_penalties: parseNum(finalePrediction.f34_penalties)
      };
      
      const { error } = await supabase.from('final_match_predictions').upsert(payload, { onConflict: 'user_id' });
      if (error) throw error;
      
      toast.success('Schedine de LA FINALE salvate con successo! 🏆');
      setHasPlayedFinale(true);
      setIsFinalePopupOpen(false);
      
      if (!hasPlayedFinale) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#eab308', '#ca8a04', '#ffffff']
        });
      }
    } catch(e: any) {
      console.error("Errore dettagliato database:", e);
      toast.error(`Errore nel database: ${e.message || e.details || 'Verifica la console'}`);
    } finally {
      setIsSavingFinale(false);
    }
  };

  const handleResetFinale = async () => {
    if (!userId || isFinaleExpired) return;
    if (window.confirm('Sei sicuro di voler svuotare il tuo pronostico de LA FINALE?')) {
      setIsSavingFinale(true);
      try {
        const { error } = await supabase.from('final_match_predictions').delete().eq('user_id', userId);
        if (error) throw error;
        
        setFinalePrediction({
          home_score: '', away_score: '', ending_method: 'REGULAR', f12_mvp: '',
          f12_ht_home_score: '', f12_ht_away_score: '', f12_2nd_home_score: '', f12_2nd_away_score: '',
          f12_first_to_score: '', f12_scorer: '', first_goal_minute: '', f12_fouls: '',
          f12_yellow_cards: '', f12_red_cards: '', f12_penalties: '',
          f34_home_score: '', f34_away_score: '', f34_ending_method: 'REGULAR', f34_mvp: '', 
          f34_ht_home_score: '', f34_ht_away_score: '', f34_2nd_home_score: '', f34_2nd_away_score: '',
          f34_first_to_score: '', f34_scorer: '', f34_first_goal_minute: '', f34_fouls: '',
          f34_yellow_cards: '', f34_red_cards: '', f34_penalties: ''
        });
        setHasPlayedFinale(false);
        setIsFinalePopupOpen(false);
        toast.success('Schedina svuotata!', { icon: '🧹' });
      } catch (e) {
        toast.error('Errore durante la rimozione.');
      } finally {
        setIsSavingFinale(false);
      }
    }
  };

  const getFileFlag = (team: string) => {
    const code = flagMap[team?.toLowerCase().trim()];
    return code ? `https://flagcdn.com/w40/${code}.png` : null;
  };

  const handleSelect = (stage: string, index: number, team: string) => {
    if (isExpired) return;
    setSelections((prev: any) => ({ ...prev, [`${stage}-${index}`]: team }));
    
    if (team === '') {
        toast.dismiss();
        toast.success("Squadra rimossa!", { icon: '🧹', duration: 1500 });
    }
    setActiveCell(null);
  };

  const resetBracket = async () => {
    if (isExpired) return;
    if (window.confirm('Sei sicuro di voler svuotare tutto il tabellone? (Le modifiche saranno effettive solo se premi "Conferma Scelte")')) {
      setSelections({});
      toast.success('Tabellone svuotato! Premi Conferma per salvare.', { icon: '🧹' });
    }
  };

  const saveBracket = async () => {
    if (isExpired) return toast.error('Le giocate sono chiuse!');
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utente non trovato');
      const rows = Object.entries(selections).filter(([_, t]) => t !== '' && t !== null).map(([k, t]) => ({
        user_id: user.id, stage: k.split('-')[0], team_name: t,
      }));
      
      await supabase.from('brackets').delete().eq('user_id', user.id);
      
      if (rows.length > 0) {
          const { error } = await supabase.from('brackets').insert(rows);
          if (error) throw error;
      }
      
      toast.success('Tabellone salvato! 🏆');
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#eab308', '#3b82f6', '#ef4444', '#22c55e', '#ffffff'],
        disableForReducedMotion: true
      });

    } catch (error: any) { toast.error(error.message); } finally { setLoading(false); }
  };

  const getPrevStageId = (currentId: string) => {
    const idx = STAGES.findIndex(s => s.id === currentId);
    return idx > 0 ? STAGES[idx - 1].id : null;
  };

  const getTeamsInStage = (stageId: string | null) => {
    if (!stageId) return [];
    return Object.entries(selections)
      .filter(([k, v]) => k.startsWith(`${stageId}-`) && v)
      .map(([k, v]) => v as string);
  };

  const renderTeamButton = (t: string, currentStageTeams: string[]) => {
    const isSelectedInStage = currentStageTeams.includes(t);
    const isCurrentCellTeam = selections[`${activeCell?.stageId}-${activeCell?.index}`] === t;
    const isDisabled = isSelectedInStage && !isCurrentCellTeam;

    const isOfficialForActiveStage = officialBracket.some(ob => normalizeStage(ob.stage) === activeCell?.stageId && cleanString(ob.team_name) === cleanString(t));

    const teamStages = Object.entries(selections)
       .filter(([k, v]) => v === t)
       .map(([k]) => k.split('-')[0]);
    
    const uniqueStages = Array.from(new Set(teamStages));
    const stageOrder = ['R32', 'R16', 'QF', 'SF', 'F', 'WINNER'];
    uniqueStages.sort((a, b) => stageOrder.indexOf(a) - stageOrder.indexOf(b));

    const stageLabels: Record<string, string> = { R32: '16°', R16: '8°', QF: '4°', SF: 'SF', F: 'F', WINNER: '🏆' };

    return (
      <button
        key={t}
        onClick={() => handleSelect(activeCell.stageId, activeCell.index, t)}
        disabled={isDisabled}
        className={`flex flex-col p-3 rounded-2xl border-2 transition-all group ${
          isCurrentCellTeam 
            ? 'bg-yellow-500/10 border-yellow-500 shadow-md' 
            : isDisabled
              ? 'bg-slate-950 border-slate-800 opacity-40 cursor-not-allowed'
              : isOfficialForActiveStage
                ? 'bg-emerald-950/20 border-emerald-500/40 active:border-emerald-400 hover:border-emerald-500/80 shadow-md'
                : 'bg-slate-950 border-slate-800 active:border-yellow-500 hover:border-slate-700 shadow-md'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src={getFileFlag(t)!} 
              className={`w-7 h-5 sm:w-9 sm:h-6 object-cover rounded shadow-lg border border-slate-800 transition-colors ${!isDisabled ? 'group-hover:border-slate-600' : ''}`} 
              alt="" 
            />
            <span className={`text-[11px] sm:text-[12px] font-black uppercase italic truncate ${isCurrentCellTeam ? 'text-yellow-500' : isOfficialForActiveStage ? 'text-emerald-400' : 'text-white'}`}>
              {formatTeamName(t)}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {isOfficialForActiveStage && !isCurrentCellTeam && (
              <span className="text-[8px] font-black bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-widest flex items-center gap-0.5 shrink-0">
                <CheckCircle2 size={10}/> Ufficiale
              </span>
            )}
            {isCurrentCellTeam && (
              <span className="text-[8px] font-black bg-yellow-500 text-slate-950 px-1.5 py-0.5 rounded uppercase tracking-widest flex items-center gap-0.5 shadow-sm shrink-0">
                <CheckCircle2 size={10}/> Tua Scelta
              </span>
            )}
            {isDisabled && (
              <span className="text-[8px] font-black bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-widest shrink-0">
                Già Scelta
              </span>
            )}
          </div>
        </div>
        
        {uniqueStages.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 pl-9 sm:pl-12 w-full justify-start">
            {uniqueStages.map(s => (
              <span key={s} className="bg-slate-800/80 border border-slate-700 text-slate-300 text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest shadow-sm">
                {stageLabels[s]}
              </span>
            ))}
          </div>
        )}
      </button>
    );
  };

  if (fetching) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4"><div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div><div className="text-yellow-500 font-black animate-pulse uppercase tracking-widest text-xs">Caricamento Tabellone...</div></div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-48 font-sans">
      
      {/* POP-UP MODALE "LA FINALE" */}
      {isFinalePopupOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-yellow-500/50 rounded-3xl w-full max-w-xl shadow-[0_0_60px_rgba(234,179,8,0.2)] relative flex flex-col max-h-[95vh] sm:max-h-[90vh]">
            
            {/* Pop-up Header */}
            <div className="bg-gradient-to-br from-yellow-600 to-yellow-500 p-5 text-center rounded-t-3xl relative shrink-0">
               <button onClick={() => setIsFinalePopupOpen(false)} className="absolute top-4 right-4 bg-black/20 p-2 rounded-full hover:bg-black/40 text-yellow-50 transition-colors"><X size={16}/></button>
               <Trophy size={40} className="mx-auto mb-2 text-yellow-100 drop-shadow" />
               <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">LA FINALE</h2>
               <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-yellow-900 mt-1.5 bg-yellow-400/60 inline-block px-3 py-0.5 rounded-full">Mini-Competizione a Schedina Doppia</p>
            </div>
            
            {/* Switcher Tab per le due partite */}
            <div className="flex bg-slate-950 p-1.5 border-b border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setActiveFinaleTab('SUNDAY')}
                className={`flex-1 py-3 px-2 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${activeFinaleTab === 'SUNDAY' ? 'bg-yellow-500 text-slate-950 shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
              >
                <Trophy size={16} className={activeFinaleTab === 'SUNDAY' ? 'text-slate-950' : 'text-yellow-500'} />
                <span>🇪🇸 SPAGNA - ARGENTINA 🇦🇷</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFinaleTab('SATURDAY')}
                className={`flex-1 py-3 px-2 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all ${activeFinaleTab === 'SATURDAY' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
              >
                <Medal size={16} className={activeFinaleTab === 'SATURDAY' ? 'text-white' : 'text-amber-500'} />
                <span>🇫🇷 FRANCIA - INGHILTERRA 🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
              </button>
            </div>
            
            {/* Pop-up Body Contenuto Scorrevole */}
            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              
              {/* === TAB 1: DOMENICA (FINALISSIMA - SPAGNA VS ARGENTINA) === */}
              {activeFinaleTab === 'SUNDAY' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  
                  {/* RISULTATO FINALE NEI 90/120 */}
                  <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                     <div className="flex justify-between items-center">
                        <label className="text-[11px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2">
                           <span className="bg-yellow-500 text-slate-950 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold">1</span>
                           Risultato Esatto Finale (Spagna - Argentina)
                        </label>
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded font-black">+30 PT</span>
                     </div>
                     <p className="text-[10px] text-slate-400 font-medium">Punteggio al termine dei 90' o 120' minuti (esclusi rigori).</p>
                     <div className="flex items-center gap-4 justify-center pt-1">
                        <input 
                          id="f12_home"
                          type="number" 
                          disabled={isFinaleExpired} 
                          value={finalePrediction.home_score} 
                          onChange={e => {
                            setFinalePrediction({...finalePrediction, home_score: e.target.value});
                            if(e.target.value !== '') document.getElementById('f12_away')?.focus();
                          }} 
                          className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-900 border border-slate-700 rounded-2xl text-center text-3xl font-black text-yellow-500 focus:border-yellow-500 outline-none shadow-inner" 
                        />
                        <span className="text-2xl font-black text-slate-600">-</span>
                        <input 
                          id="f12_away"
                          type="number" 
                          disabled={isFinaleExpired} 
                          value={finalePrediction.away_score} 
                          onChange={e => setFinalePrediction({...finalePrediction, away_score: e.target.value})} 
                          className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-900 border border-slate-700 rounded-2xl text-center text-3xl font-black text-yellow-500 focus:border-yellow-500 outline-none shadow-inner" 
                        />
                     </div>
                  </div>

                  {/* MODALITA DI FINE */}
                  <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                     <div className="flex justify-between items-center">
                        <label className="text-[11px] font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2">
                           <span className="bg-yellow-500 text-slate-950 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold">2</span>
                           Come finisce la partita?
                        </label>
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded font-black">+10 PT</span>
                     </div>
                     <div className="grid grid-cols-3 gap-2 pt-1">
                       {[
                          { id: 'REGULAR', label: 'Nei 90\'' },
                          { id: 'OVERTIME', label: 'Supplementari' },
                          { id: 'PENALTIES', label: 'Ai Rigori' }
                        ].map(method => (
                          <button
                            key={method.id} type="button" disabled={isFinaleExpired}
                            onClick={() => setFinalePrediction({ ...finalePrediction, ending_method: method.id })}
                            className={`py-3 px-1 text-[11px] font-black uppercase rounded-xl border transition-all ${finalePrediction.ending_method === method.id ? 'bg-yellow-500 text-slate-950 border-yellow-500 shadow-md' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}`}
                          >
                            {method.label}
                          </button>
                        ))}
                     </div>
                  </div>

                  {/* RISULTATI PARZIALI 1° E 2° TEMPO */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Esatto 1° Tempo</label>
                        <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-black">+10 PT</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <input 
                          id="f12_ht_home"
                          type="number" 
                          disabled={isFinaleExpired} 
                          value={finalePrediction.f12_ht_home_score} 
                          onChange={e => {
                            setFinalePrediction({...finalePrediction, f12_ht_home_score: e.target.value});
                            if(e.target.value !== '') document.getElementById('f12_ht_away')?.focus();
                          }} 
                          className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-xl text-center text-lg font-black text-white focus:border-yellow-500 outline-none" 
                        />
                        <span className="font-bold text-slate-600">-</span>
                        <input 
                          id="f12_ht_away"
                          type="number" 
                          disabled={isFinaleExpired} 
                          value={finalePrediction.f12_ht_away_score} 
                          onChange={e => setFinalePrediction({...finalePrediction, f12_ht_away_score: e.target.value})} 
                          className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-xl text-center text-lg font-black text-white focus:border-yellow-500 outline-none" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Esatto 2° Tempo</label>
                        <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-black">+10 PT</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <input 
                          id="f12_2nd_home"
                          type="number" 
                          disabled={isFinaleExpired} 
                          value={finalePrediction.f12_2nd_home_score} 
                          onChange={e => {
                            setFinalePrediction({...finalePrediction, f12_2nd_home_score: e.target.value});
                            if(e.target.value !== '') document.getElementById('f12_2nd_away')?.focus();
                          }} 
                          className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-xl text-center text-lg font-black text-white focus:border-yellow-500 outline-none" 
                        />
                        <span className="font-bold text-slate-600">-</span>
                        <input 
                          id="f12_2nd_away"
                          type="number" 
                          disabled={isFinaleExpired} 
                          value={finalePrediction.f12_2nd_away_score} 
                          onChange={e => setFinalePrediction({...finalePrediction, f12_2nd_away_score: e.target.value})} 
                          className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-xl text-center text-lg font-black text-white focus:border-yellow-500 outline-none" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* MENU A TENDINA: MARCATORI E MVP (DOMENICA) */}
                  <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-black text-yellow-500 uppercase tracking-widest">MVP (Miglior Giocatore Ufficiale FIFA)</label>
                        <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-black">+12 PT</span>
                      </div>
                      <select disabled={isFinaleExpired} value={finalePrediction.f12_mvp} onChange={e => setFinalePrediction({...finalePrediction, f12_mvp: e.target.value})} className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs font-black text-white outline-none focus:border-yellow-500 cursor-pointer">
                        <option value="" className="text-slate-500">-- Scegli MVP --</option>
                        <optgroup label="🇪🇸 Spagna" className="bg-slate-950 text-yellow-500 font-bold">
                          {PLAYERS_SPAGNA.map(p => <option key={`mvp-f12-${p}`} value={p} className="text-white font-medium">{p}</option>)}
                        </optgroup>
                        <optgroup label="🇦🇷 Argentina" className="bg-slate-950 text-sky-400 font-bold">
                          {PLAYERS_ARGENTINA.map(p => <option key={`mvp-f12-${p}`} value={p} className="text-white font-medium">{p}</option>)}
                        </optgroup>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-slate-300 uppercase">Squadra 1° Gol</label>
                          <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-black">+5 PT</span>
                        </div>
                        <select disabled={isFinaleExpired} value={finalePrediction.f12_first_to_score} onChange={e => setFinalePrediction({...finalePrediction, f12_first_to_score: e.target.value})} className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs font-black text-white outline-none focus:border-yellow-500 cursor-pointer">
                          <option value="">-- Scegli Squadra --</option>
                          <option value="Spagna">🇪🇸 Spagna</option>
                          <option value="Argentina">🇦🇷 Argentina</option>
                          <option value="Nessuno">❌ Nessun Gol (0-0)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-slate-300 uppercase">Marcatore 1° Gol</label>
                          <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-black">+11 PT</span>
                        </div>
                        <select disabled={isFinaleExpired} value={finalePrediction.f12_scorer} onChange={e => setFinalePrediction({...finalePrediction, f12_scorer: e.target.value})} className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs font-black text-white outline-none focus:border-yellow-500 cursor-pointer">
                          <option value="" className="text-slate-500">-- Scegli Marcatore --</option>
                          <option value="Nessuno" className="text-rose-400">❌ Nessuno / Solo Autogol</option>
                          <optgroup label="🇪🇸 Spagna" className="bg-slate-950 text-yellow-500 font-bold">
                            {PLAYERS_SPAGNA.map(p => <option key={`scr-f12-${p}`} value={p} className="text-white font-medium">{p}</option>)}
                          </optgroup>
                          <optgroup label="🇦🇷 Argentina" className="bg-slate-950 text-sky-400 font-bold">
                            {PLAYERS_ARGENTINA.map(p => <option key={`scr-f12-${p}`} value={p} className="text-white font-medium">{p}</option>)}
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-800/80">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-300 uppercase">Minuto 1° Gol </label>
                        <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-black">+10 PT</span>
                      </div>
                      <input type="number" disabled={isFinaleExpired} value={finalePrediction.first_goal_minute} onChange={e => setFinalePrediction({...finalePrediction, first_goal_minute: e.target.value})} className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs font-black text-white outline-none focus:border-yellow-500 text-center" />
                    </div>
                  </div>

                  {/* DISCIPLINARE E FALLI */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <label className="text-[11px] font-black text-yellow-500 uppercase tracking-widest block">Statistiche Disciplinari & Falli</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Falli Totali <span className="text-yellow-400">+6PT</span></span>
                        <input type="number" disabled={isFinaleExpired} value={finalePrediction.f12_fouls} onChange={e => setFinalePrediction({...finalePrediction, f12_fouls: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-1.5 rounded-lg text-xs font-black text-center text-white outline-none focus:border-yellow-500" />
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                        <span className="text-[9px] text-yellow-400 font-bold uppercase block mb-1">🟨 Gialli <span className="text-slate-400">+3PT</span></span>
                        <input type="number" disabled={isFinaleExpired} value={finalePrediction.f12_yellow_cards} onChange={e => setFinalePrediction({...finalePrediction, f12_yellow_cards: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-1.5 rounded-lg text-xs font-black text-center text-white outline-none focus:border-yellow-500" />
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                        <span className="text-[9px] text-rose-500 font-bold uppercase block mb-1">🟥 Rossi <span className="text-slate-400">+3PT</span></span>
                        <input type="number" disabled={isFinaleExpired} value={finalePrediction.f12_red_cards} onChange={e => setFinalePrediction({...finalePrediction, f12_red_cards: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-1.5 rounded-lg text-xs font-black text-center text-white outline-none focus:border-yellow-500" />
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                        <span className="text-[9px] text-blue-400 font-bold uppercase block mb-1">🥅 Rigori <span className="text-slate-400">+1PT</span></span>
                        <input type="number" disabled={isFinaleExpired} value={finalePrediction.f12_penalties} onChange={e => setFinalePrediction({...finalePrediction, f12_penalties: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-1.5 rounded-lg text-xs font-black text-center text-white outline-none focus:border-yellow-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 2: SABATO (FINALE 3°/4° POSTO - FRANCIA VS INGHILTERRA) === */}
              {activeFinaleTab === 'SATURDAY' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  
                  {/* RISULTATO FINALE NEI 90/120 - INVERTITO VISIVAMENTE */}
                  <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                     <div className="flex justify-between items-center">
                        <label className="text-[11px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                           <span className="bg-amber-500 text-slate-950 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold">1</span>
                           Risultato Esatto Finale (Francia - Inghilterra)
                        </label>
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-black">+30 PT</span>
                     </div>
                     <p className="text-[10px] text-slate-400 font-medium">Punteggio al termine dei 90' o 120' minuti (esclusi rigori).</p>
                     <div className="flex items-center gap-4 justify-center pt-1">
                        {/* INPUT 1 VISIVO: FRANCIA (salva su away_score per mantenere logica DB) */}
                        <input 
                          id="f34_fra"
                          type="number" 
                          disabled={isFinaleExpired} 
                          value={finalePrediction.f34_away_score} 
                          onChange={e => {
                            setFinalePrediction({...finalePrediction, f34_away_score: e.target.value});
                            if(e.target.value !== '') document.getElementById('f34_eng')?.focus();
                          }} 
                          className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-900 border border-slate-700 rounded-2xl text-center text-3xl font-black text-amber-500 focus:border-amber-500 outline-none shadow-inner" 
                        />
                        <span className="text-2xl font-black text-slate-600">-</span>
                        {/* INPUT 2 VISIVO: INGHILTERRA (salva su home_score per mantenere logica DB) */}
                        <input 
                          id="f34_eng"
                          type="number" 
                          disabled={isFinaleExpired} 
                          value={finalePrediction.f34_home_score} 
                          onChange={e => setFinalePrediction({...finalePrediction, f34_home_score: e.target.value})} 
                          className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-900 border border-slate-700 rounded-2xl text-center text-3xl font-black text-amber-500 focus:border-amber-500 outline-none shadow-inner" 
                        />
                     </div>
                  </div>

                  {/* MODALITA DI FINE */}
                  <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                     <div className="flex justify-between items-center">
                        <label className="text-[11px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                           <span className="bg-amber-500 text-slate-950 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold">2</span>
                           Come finisce la partita?
                        </label>
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-black">+10 PT</span>
                     </div>
                     <div className="grid grid-cols-3 gap-2 pt-1">
                       {[
                          { id: 'REGULAR', label: 'Nei 90\'' },
                          { id: 'OVERTIME', label: 'Supplementari' },
                          { id: 'PENALTIES', label: 'Ai Rigori' }
                        ].map(method => (
                          <button
                            key={method.id} type="button" disabled={isFinaleExpired}
                            onClick={() => setFinalePrediction({ ...finalePrediction, f34_ending_method: method.id })}
                            className={`py-3 px-1 text-[11px] font-black uppercase rounded-xl border transition-all ${finalePrediction.f34_ending_method === method.id ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}`}
                          >
                            {method.label}
                          </button>
                        ))}
                     </div>
                  </div>

                  {/* RISULTATI PARZIALI 1° E 2° TEMPO - INVERTITI VISIVAMENTE */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Esatto 1° Tempo</label>
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-black">+10 PT</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <input 
                          id="f34_ht_fra"
                          type="number" 
                          disabled={isFinaleExpired} 
                          value={finalePrediction.f34_ht_away_score} 
                          onChange={e => {
                            setFinalePrediction({...finalePrediction, f34_ht_away_score: e.target.value});
                            if(e.target.value !== '') document.getElementById('f34_ht_eng')?.focus();
                          }} 
                          className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-xl text-center text-lg font-black text-white focus:border-amber-500 outline-none" 
                        />
                        <span className="font-bold text-slate-600">-</span>
                        <input 
                          id="f34_ht_eng"
                          type="number" 
                          disabled={isFinaleExpired} 
                          value={finalePrediction.f34_ht_home_score} 
                          onChange={e => setFinalePrediction({...finalePrediction, f34_ht_home_score: e.target.value})} 
                          className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-xl text-center text-lg font-black text-white focus:border-amber-500 outline-none" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Esatto 2° Tempo</label>
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-black">+10 PT</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <input 
                          id="f34_2nd_fra"
                          type="number" 
                          disabled={isFinaleExpired} 
                          value={finalePrediction.f34_2nd_away_score} 
                          onChange={e => {
                            setFinalePrediction({...finalePrediction, f34_2nd_away_score: e.target.value});
                            if(e.target.value !== '') document.getElementById('f34_2nd_eng')?.focus();
                          }} 
                          className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-xl text-center text-lg font-black text-white focus:border-amber-500 outline-none" 
                        />
                        <span className="font-bold text-slate-600">-</span>
                        <input 
                          id="f34_2nd_eng"
                          type="number" 
                          disabled={isFinaleExpired} 
                          value={finalePrediction.f34_2nd_home_score} 
                          onChange={e => setFinalePrediction({...finalePrediction, f34_2nd_home_score: e.target.value})} 
                          className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-xl text-center text-lg font-black text-white focus:border-amber-500 outline-none" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* MENU A TENDINA: MARCATORI E MVP (SABATO) */}
                  <div className="space-y-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-black text-amber-500 uppercase tracking-widest">MVP (Miglior Giocatore Ufficiale FIFA)</label>
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-black">+12 PT</span>
                      </div>
                      <select disabled={isFinaleExpired} value={finalePrediction.f34_mvp} onChange={e => setFinalePrediction({...finalePrediction, f34_mvp: e.target.value})} className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs font-black text-white outline-none focus:border-amber-500 cursor-pointer">
                        <option value="" className="text-slate-500">-- Scegli MVP --</option>
                        <optgroup label="🇫🇷 Francia" className="bg-slate-950 text-blue-400 font-bold">
                          {PLAYERS_FRANCIA.map(p => <option key={`mvp-f34-${p}`} value={p} className="text-white font-medium">{p}</option>)}
                        </optgroup>
                        <optgroup label="🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inghilterra" className="bg-slate-950 text-white font-bold">
                          {PLAYERS_INGHILTERRA.map(p => <option key={`mvp-f34-${p}`} value={p} className="text-white font-medium">{p}</option>)}
                        </optgroup>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-slate-300 uppercase">Squadra 1° Gol</label>
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-black">+5 PT</span>
                        </div>
                        <select disabled={isFinaleExpired} value={finalePrediction.f34_first_to_score} onChange={e => setFinalePrediction({...finalePrediction, f34_first_to_score: e.target.value})} className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs font-black text-white outline-none focus:border-yellow-500 cursor-pointer">
                          <option value="">-- Scegli Squadra --</option>
                          <option value="Francia">🇫🇷 Francia</option>
                          <option value="Inghilterra">🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inghilterra</option>
                          <option value="Nessuno">❌ Nessun Gol (0-0)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-slate-300 uppercase">Marcatore 1° Gol</label>
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-black">+11 PT</span>
                        </div>
                        <select disabled={isFinaleExpired} value={finalePrediction.f34_scorer} onChange={e => setFinalePrediction({...finalePrediction, f34_scorer: e.target.value})} className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs font-black text-white outline-none focus:border-yellow-500 cursor-pointer">
                          <option value="" className="text-slate-500">-- Scegli Marcatore --</option>
                          <option value="Nessuno" className="text-rose-400">❌ Nessuno / Solo Autogol</option>
                          <optgroup label="🇫🇷 Francia" className="bg-slate-950 text-blue-400 font-bold">
                            {PLAYERS_FRANCIA.map(p => <option key={`scr-f34-${p}`} value={p} className="text-white font-medium">{p}</option>)}
                          </optgroup>
                          <optgroup label="🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inghilterra" className="bg-slate-950 text-white font-bold">
                            {PLAYERS_INGHILTERRA.map(p => <option key={`scr-f34-${p}`} value={p} className="text-white font-medium">{p}</option>)}
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-slate-800/80">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-300 uppercase">Minuto 1° Gol</label>
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-black">+10 PT</span>
                      </div>
                      <input type="number" disabled={isFinaleExpired} value={finalePrediction.f34_first_goal_minute} onChange={e => setFinalePrediction({...finalePrediction, f34_first_goal_minute: e.target.value})} className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs font-black text-white outline-none focus:border-yellow-500 text-center" />
                    </div>
                  </div>

                  {/* DISCIPLINARE E FALLI */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <label className="text-[11px] font-black text-amber-500 uppercase tracking-widest block">Statistiche Disciplinari & Falli</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Falli totali <span className="text-amber-400">+6PT</span></span>
                        <input type="number" disabled={isFinaleExpired} value={finalePrediction.f34_fouls} onChange={e => setFinalePrediction({...finalePrediction, f34_fouls: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-1.5 rounded-lg text-xs font-black text-center text-white outline-none focus:border-yellow-500" />
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                        <span className="text-[9px] text-yellow-400 font-bold uppercase block mb-1">🟨 Gialli <span className="text-slate-400">+3PT</span></span>
                        <input type="number" disabled={isFinaleExpired} value={finalePrediction.f34_yellow_cards} onChange={e => setFinalePrediction({...finalePrediction, f34_yellow_cards: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-1.5 rounded-lg text-xs font-black text-center text-white outline-none focus:border-yellow-500" />
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                        <span className="text-[9px] text-rose-500 font-bold uppercase block mb-1">🟥 Rossi <span className="text-slate-400">+3PT</span></span>
                        <input type="number" disabled={isFinaleExpired} value={finalePrediction.f34_red_cards} onChange={e => setFinalePrediction({...finalePrediction, f34_red_cards: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-1.5 rounded-lg text-xs font-black text-center text-white outline-none focus:border-yellow-500" />
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                        <span className="text-[9px] text-blue-400 font-bold uppercase block mb-1">🥅 Rigori <span className="text-slate-400">+1PT</span></span>
                        <input type="number" disabled={isFinaleExpired} value={finalePrediction.f34_penalties} onChange={e => setFinalePrediction({...finalePrediction, f34_penalties: e.target.value})} className="w-full bg-slate-950 border border-slate-700 p-1.5 rounded-lg text-xs font-black text-center text-white outline-none focus:border-yellow-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Pop-up Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0 rounded-b-3xl flex gap-3">
               {hasPlayedFinale && !isFinaleExpired && (
                 <button 
                    type="button"
                    disabled={isSavingFinale}
                    onClick={handleResetFinale}
                    className="p-4 bg-slate-950 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-lg shrink-0 disabled:opacity-50"
                    title="Svuota Schedina"
                 >
                    <Trash2 size={20} />
                 </button>
               )}
               <button 
                  type="button"
                  disabled={isSavingFinale || isFinaleExpired}
                  onClick={handleSaveFinale}
                  className="flex-1 py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  {isSavingFinale ? <Loader2 size={16} className="animate-spin" /> : isFinaleExpired ? 'Pronostici Chiusi' : 'Salva Tutte e 2 le Finali!'}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Resto del layout (Header e Bracket grid) inalterato */}
      <header className="text-center mb-6 pt-4 flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl font-black text-yellow-500 uppercase italic tracking-tighter leading-none">Fase Finale</h1>
        <p className="text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] mt-3 italic">
          {isExpired ? '🔒 Pronostici Conclusi' : 'Dalla fase a eliminazione al Titolo'}
        </p>
        <div className="flex gap-2 mt-6">
          <Link href="/matches" className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-400 px-5 py-3.5 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 active:scale-95 shadow-lg">
            <Map size={16} /> Gironi
          </Link>
          <Link href="/simulatore" className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 px-5 py-3.5 rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all hover:bg-blue-600/30 active:scale-95 shadow-lg">
            <BarChart3 size={16} /> Simulatore
          </Link>
        </div>
      </header>

      <div className={`max-w-4xl mx-auto space-y-12 ${isExpired ? 'opacity-90' : ''}`}>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-start gap-3 -mt-2 mb-6 shadow-lg">
          <Info className="text-yellow-500 shrink-0 mt-0.5" size={18} />
          <p className="text-[10px] sm:text-xs text-slate-400 font-medium leading-relaxed">
            <strong className="text-slate-200 font-black">L'ORDINE NON CONTA.</strong> Questa non è la griglia degli accoppiamenti esatti, ma solo la lista delle squadre che accederanno al turno. Ogni squadra qualificata ed indovinata riceverà i relativi punti.
          </p>
        </div>

        {isFinaleActive && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
             <button 
               onClick={() => setIsFinalePopupOpen(true)}
               className="w-full bg-gradient-to-br from-yellow-600 to-yellow-500 p-6 rounded-[2rem] shadow-[0_0_30px_rgba(234,179,8,0.15)] flex flex-col items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-95 border-2 border-yellow-400/50 relative overflow-hidden group"
             >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <Trophy size={48} className="text-yellow-100 drop-shadow-md" />
                <div className="text-center relative z-10">
                   <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase italic tracking-tighter leading-none mb-1.5 drop-shadow-sm">LA FINALE</h2>
                   <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-yellow-950 bg-white/20 inline-block px-3 py-1 rounded-full">
                     {hasPlayedFinale ? '✅ Modifica le 2 Schedine' : 'Clicca per Giocare!'}
                   </p>
                </div>
             </button>
          </div>
        )}

        {STAGES.map((stage) => {
          const officialTeamsInStage = officialBracket.filter(ob => normalizeStage(ob.stage) === stage.id);
          const isStageFull = officialTeamsInStage.length >= stage.count;

          return (
            <section key={stage.id} className="relative">
              <div className="flex flex-col mb-6">
                <div className="flex items-center gap-3 px-2">
                  <span className="bg-yellow-500 text-slate-950 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg italic flex items-center gap-1 shrink-0 shadow-lg shadow-yellow-500/20">
                    {stage.pts} PT
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight shrink-0">{stage.label}</h2>
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-800 to-transparent"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 auto-rows-fr">
                {Array.from({ length: stage.count }).map((_, i) => {
                  const currentSelection = selections[`${stage.id}-${i}`];
                  const cellNumber = i + 1;
                  
                  const isOfficial = currentSelection && officialTeamsInStage.some(ob => cleanString(ob.team_name) === cleanString(currentSelection));
                  const isWrong = currentSelection && isStageFull && !isOfficial;

                  let cellClass = 'border-slate-800 text-slate-600 hover:border-slate-700 bg-slate-900';
                  let numClass = 'text-slate-700';
                  let nameClass = 'text-slate-500';

                  if (currentSelection) {
                     if (isOfficial) {
                        cellClass = 'border-emerald-500/40 bg-emerald-950/20 shadow-xl shadow-emerald-500/5';
                        numClass = 'text-emerald-500/40';
                        nameClass = 'text-emerald-400';
                     } else if (isWrong) {
                        cellClass = 'border-rose-900/50 bg-rose-950/10 opacity-70';
                        numClass = 'text-rose-900/50';
                        nameClass = 'text-rose-500/60 line-through decoration-rose-500/50';
                     } else {
                        cellClass = 'border-yellow-500/40 bg-yellow-950/10 shadow-xl shadow-yellow-500/5 hover:border-yellow-500/60';
                        numClass = 'text-yellow-600/50';
                        nameClass = 'text-yellow-500';
                     }
                  }

                  return (
                    <div key={i} className="relative h-full">
                      <button
                        disabled={isExpired}
                        onClick={() => {
                          if (isExpired) return;
                          setActiveCell({stageId: stage.id, index: i});
                        }}
                        className={`w-full h-full border-2 rounded-2xl py-3 pl-2 pr-10 sm:p-4 sm:pr-14 flex items-center gap-1.5 sm:gap-3 transition-all text-left ${cellClass} ${isExpired ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span className={`text-[9px] sm:text-[11px] font-black w-3 sm:w-4 text-center shrink-0 ${numClass}`}>
                          {cellNumber}
                        </span>
                        <div className="shrink-0 flex items-center justify-center relative">
                          {currentSelection ? (
                            <>
                              <img src={getFileFlag(currentSelection)!} className={`w-5 sm:w-8 h-auto rounded-[3px] shadow-sm border object-cover ${isWrong ? 'border-rose-900/50 grayscale' : 'border-slate-800'}`} alt="" />
                              {isOfficial && (
                                <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 rounded-full border-2 border-emerald-950 shadow-sm">
                                  <CheckCircle2 size={10} className="text-slate-950" />
                                </div>
                              )}
                            </>
                          ) : (
                            <ShieldCheck className="text-slate-800 w-4 h-4 sm:w-6 sm:h-6" />
                          )}
                        </div>
                        <span className={`text-[10px] sm:text-[13px] font-black uppercase leading-[1.15] sm:leading-tight flex-1 truncate ${nameClass}`}>
                          {currentSelection ? formatTeamName(currentSelection) : 'Scegli'}
                        </span>
                      </button>
                      {currentSelection && !isExpired && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleSelect(stage.id, i, ''); }} 
                          className="absolute right-0 top-0 bottom-0 px-3 sm:px-4 text-rose-500 hover:text-rose-400 active:scale-90 transition-all z-20 flex items-center justify-center"
                        >
                          <X size={18} strokeWidth={3} className="sm:w-5 sm:h-5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {activeCell && !isExpired && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center px-0 sm:px-4 pb-0">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setActiveCell(null)}></div>
          <div className="relative w-full max-w-xl bg-slate-900 border-t-2 sm:border-2 border-yellow-500/40 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col h-[85dvh] sm:h-auto sm:max-h-[80dvh] animate-in slide-in-from-bottom duration-300 mx-auto">
            <div className="shrink-0 p-6 sm:p-7 bg-slate-950 border-b border-slate-800 flex flex-col gap-4 rounded-t-[2.5rem] sm:rounded-t-[2.3rem] z-20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-yellow-500 text-xl font-black uppercase italic tracking-tight">Seleziona Squadra</h3>
                  <p className="text-slate-500 text-xs font-black uppercase mt-1 tracking-widest">
                    {STAGES.find(s => s.id === activeCell.stageId)?.label} — POS. {activeCell.index + 1}
                  </p>
                </div>
                <button onClick={() => setActiveCell(null)} className="p-4 bg-slate-800 rounded-full text-white active:scale-90 transition-all shadow-lg"><X size={24} strokeWidth={3}/></button>
              </div>
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                 <input 
                   type="text" 
                   placeholder="Cerca squadra..." 
                   className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs font-black uppercase text-white outline-none focus:border-yellow-500 transition-colors placeholder:text-slate-600" 
                   value={teamSearch} 
                   onChange={e => setTeamSearch(e.target.value)} 
                 />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-8 bg-slate-900 custom-scrollbar pb-24 overscroll-contain">
                {(() => {
                  const prevStageId = getPrevStageId(activeCell.stageId);
                  const currentStageTeams = getTeamsInStage(activeCell.stageId);
                  const currentCellTeam = selections[`${activeCell.stageId}-${activeCell.index}`];
                  const isTeamDisabled = (t: string) => currentStageTeams.includes(t) && t !== currentCellTeam;
                  const matchSearch = (t: string) => t.toLowerCase().includes(teamSearch.toLowerCase()) || formatTeamName(t).toLowerCase().includes(teamSearch.toLowerCase());
                  const prevStageTeamsList = prevStageId ? getTeamsInStage(prevStageId) : [];
                  const filteredPrevTeams = prevStageTeamsList.filter(t => matchSearch(t));
                  
                  const prevGroups = TOURNAMENT_GROUPS.map(g => ({
                      name: g.name,
                      teams: g.teams.filter(t => filteredPrevTeams.includes(t))
                  })).filter(g => g.teams.length > 0);

                  const availableGroups = TOURNAMENT_GROUPS.map(g => ({
                    name: g.name,
                    teams: g.teams.filter(t => matchSearch(t))
                  })).filter(g => g.teams.length > 0);

                  return (
                    <>
                      {prevGroups.length > 0 && (
                         <div className="space-y-5 mb-10">
                            <div className="flex items-center gap-3 px-2">
                              <Zap size={16} className="text-emerald-500" />
                              <span className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">Qualificate dal turno precedente</span>
                              <div className="flex-1 h-px bg-emerald-500/30"></div>
                            </div>
                            <div className="space-y-6">
                                {prevGroups.map(group => {
                                    const sortedPrevTeams = [...group.teams].sort((a, b) => {
                                      const aDis = isTeamDisabled(a);
                                      const bDis = isTeamDisabled(b);
                                      if (aDis && !bDis) return 1;
                                      if (!aDis && bDis) return -1;
                                      return 0;
                                    });
                                    return (
                                       <div key={`prev-${group.name}`} className="space-y-3 pl-1">
                                          <div className="flex items-center gap-2 px-2">
                                             <Trophy size={12} className="text-emerald-500/50" />
                                             <span className="text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.2em]">{group.name}</span>
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                             {sortedPrevTeams.map(t => renderTeamButton(t, currentStageTeams))}
                                          </div>
                                       </div>
                                    )
                                })}
                            </div>
                         </div>
                      )}

                      <div className="space-y-8">
                        {availableGroups.map((group) => {
                          const sortedTeams = [...group.teams].sort((a, b) => {
                            const aDis = isTeamDisabled(a);
                            const bDis = isTeamDisabled(b);
                            if (aDis && !bDis) return 1;
                            if (!aDis && bDis) return -1;
                            return 0;
                          });
                          return (
                            <div key={group.name} className="space-y-4">
                              <div className="flex items-center gap-3 px-2">
                                <Trophy size={16} className="text-yellow-500/50" />
                                <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]"> {group.name}</span>
                                <div className="flex-1 h-px bg-slate-800/50"></div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {sortedTeams.map((t) => renderTeamButton(t, currentStageTeams))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-24 left-0 right-0 p-6 flex justify-center items-center gap-3 z-50 pointer-events-none">
        {!isExpired && (
          <button onClick={resetBracket} disabled={loading} className="pointer-events-auto p-6 bg-slate-900 border-2 border-slate-800 rounded-[2rem] text-rose-500 hover:bg-rose-500/10 active:bg-rose-500 active:text-white transition-all shadow-2xl"><Trash2 size={24} /></button>
        )}
        <button onClick={saveBracket} disabled={loading || isExpired} className={`max-w-xs w-full py-6 rounded-[2rem] font-black uppercase text-sm italic flex items-center justify-center gap-3 transition-all tracking-widest shadow-2xl pointer-events-auto ${isExpired ? 'bg-slate-900 text-slate-700 border border-slate-800' : 'bg-yellow-500 text-slate-950 active:scale-95 shadow-[0_0_30px_rgba(234,179,8,0.3)]'}`}>
          {loading ? <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div> : isExpired ? '🔒 Pronostici Chiusi' : 'Conferma Scelte'}
        </button>
      </div>
    </main>
  );
}