'use client';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { WORLD_CUP_PLAYERS, WORLD_CUP_GOALKEEPERS } from '@/lib/players';
import {
  Trophy, Users, Zap, Search, Trash2, ChevronDown, ChevronUp,
  BarChart3, RefreshCw, Star, X, MessageCircle, ArrowLeft,
  User, ListOrdered, Gamepad2, Key, CheckCircle, AlertTriangle, Plus, Minus, Award, Megaphone, Shield, Download
} from 'lucide-react';

const ADMIN_EMAIL = 'ricky@mondiale.it';
const WORLD_CUP_START_DATE = new Date('2026-06-11T21:00:00+02:00');

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
  algeria: 'dz', 'arabia saudita': 'sa', 'arabia s.': 'sa', argentina: 'ar', australia: 'au', austria: 'at',
  belgio: 'be', 'bosnia ed erzegovina': 'ba', 'bosnia erzegovina': 'ba', bosnia: 'ba',
  brasile: 'br', canada: 'ca', 'capo verde': 'cv', colombia: 'co', 'corea del sud': 'kr', 'corea sud': 'kr', 
  "costa d'avorio": 'ci', 'costa avorio': 'ci', 'c. avorio': 'ci', croazia: 'hr', curaçao: 'cw', curacao: 'cw',
  ecuador: 'ec', egitto: 'eg', francia: 'fr', germania: 'de', ghana: 'gh', giappone: 'jp', 
  giordania: 'jo', haiti: 'ht', inghilterra: 'gb-eng', iran: 'ir', iraq: 'iq', marocco: 'ma', 
  messico: 'mx', norvegia: 'no', 'nuova zelanda': 'nz', 'n. zelanda': 'nz', olanda: 'nl', panama: 'pa', paraguay: 'py',
  portogallo: 'pt', qatar: 'qa', 'repubblica ceca': 'cz', 'rep. ceca': 'cz', 'repubblica democratica del congo': 'cd', 'r.d. congo': 'cd', congo: 'cd',
  scozia: 'gb-sct', senegal: 'sn', spagna: 'es', 'stati uniti': 'us', usa: 'us',
  sudafrica: 'za', svezia: 'se', svizzera: 'ch', tunisia: 'tn', turchia: 'tr', 
  uruguay: 'uy', uzbekistan: 'uz',
};

const flagEmojiMap: { [key: string]: string } = {
  algeria: '🇩🇿', 'arabia saudita': '🇸🇦', 'arabia s.': '🇸🇦', argentina: '🇦🇷', australia: '🇦🇺', austria: '🇦🇹',
  belgio: '🇧🇪', 'bosnia ed erzegovina': '🇧🇦', 'bosnia erzegovina': '🇧🇦', bosnia: '🇧🇦',
  brasile: '🇧🇷', canada: '🇨🇦', 'capo verde': '🇨🇻', colombia: '🇨🇴', 'corea del sud': '🇰🇷', 'corea sud': '🇰🇷', 
  "costa d'avorio": '🇨🇮', 'costa avorio': '🇨🇮', 'c. avorio': '🇨🇮', croazia: '🇭🇷', curaçao: '🇨🇼', curacao: '🇨🇼',
  ecuador: '🇪🇨', egitto: '🇪🇬', francia: '🇫🇷', germania: '🇩🇪', ghana: '🇬🇭', giappone: '🇯🇵', 
  giordania: '🇯🇴', haiti: '🇭🇹', inghilterra: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', iran: '🇮🇷', iraq: '🇮🇶', marocco: '🇲🇦', 
  messico: '🇲🇽', norvegia: '🇳🇴', 'nuova zelanda': '🇳🇿', 'n. zelanda': '🇳🇿', olanda: '🇳🇱', panama: '🇵🇦', paraguay: '🇵🇾',
  portogallo: '🇵🇹', qatar: '🇶🇦', 'repubblica ceca': '🇨🇿', 'rep. ceca': '🇨🇿', 'repubblica democratica del congo': '🇨🇩', 'r.d. congo': '🇨🇩', congo: '🇨🇩',
  scozia: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', senegal: '🇸🇳', spagna: '🇪🇸', 'stati uniti': '🇺🇸', usa: '🇺🇸',
  sudafrica: '🇿🇦', svezia: '🇸🇪', svizzera: '🇨🇭', tunisia: '🇹🇳', turchia: '🇹🇷', 
  uruguay: '🇺🇾', uzbekistan: '🇺🇿',
};

const getFlag = (team: string) => {
    if (!team) return null;
    const code = flagMap[team.toLowerCase().trim()];
    return code ? `https://flagcdn.com/w40/${code}.png` : null;
};

const getEmoji = (team: string) => {
    if (!team) return '';
    return flagEmojiMap[team.toLowerCase().trim()] || '';
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

const cleanString = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

const AutocompleteInput = ({ 
  value, 
  onChange, 
  placeholder, 
  suggestions,
  onSelectCustom
}: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholder: string; 
  suggestions: {name: string, country: string}[];
  onSelectCustom?: (item: {name: string, country: string}) => void;
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
                    if (onSelectCustom) onSelectCustom(suggestion);
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
                <span className="text-xs font-black uppercase text-slate-400">Usa custom: "{value}"</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

const fetchAllRecords = async (table: string) => {
  let result: any[] = [];
  let start = 0;
  const limit = 1000;
  while (true) {
    const { data, error } = await supabase.from(table).select('*').range(start, start + limit - 1);
    if (error || !data || data.length === 0) break;
    result.push(...data);
    if (data.length < limit) break;
    start += limit;
  }
  return result;
};

export default function AdminPage() {
  const router = useRouter(); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [openSection, setOpenSection] = useState({ annuncio: false, iscrizioni: false, risultati: false, tabellone: false, bonus: false, statistiche: true, marcatori: false });
  const [matches, setMatches] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [officialBracket, setOfficialBracket] = useState<any[]>([]);
  const [allUserBonuses, setAllUserBonuses] = useState<any[]>([]);
  const [allBrackets, setAllBrackets] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [topScorers, setTopScorers] = useState<any[]>([]);
  
  const [announcement, setAnnouncement] = useState('');
  const [newScorerName, setNewScorerName] = useState('');
  const [newScorerTeam, setNewScorerTeam] = useState('');

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
    const [mRes, bRes, obRes, scorersRes, settingsRes] = await Promise.all([
      supabase.from('matches').select('*').order('id', { ascending: true }),
      supabase.from('official_bonuses').select('*').eq('id', '00000000-0000-0000-0000-000000000000').maybeSingle(),
      supabase.from('official_bracket').select('*').order('id', { ascending: true }),
      supabase.from('top_scorers').select('*').order('goals', { ascending: false }),
      supabase.from('app_settings').select('*').eq('id', 1).maybeSingle()
    ]);
    
    const pData = await fetchAllRecords('profiles');
    const ubData = await fetchAllRecords('user_bonus_answers');
    const brData = await fetchAllRecords('brackets');
    const predData = await fetchAllRecords('predictions');

    const fetchedMatches = mRes.data || [];
    setMatches(fetchedMatches); 
    setProfiles(pData || []); 
    setOfficialBracket(obRes.data || []); 
    setAllUserBonuses(ubData || []);
    setAllBrackets(brData || []);
    setPredictions(predData || []);
    setTopScorers(scorersRes.data || []);
    
    if (settingsRes.data) {
      setAnnouncement(settingsRes.data.announcement || '');
    }

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

  const saveAnnouncement = async (text: string) => {
    const { error } = await supabase.from('app_settings').upsert({ id: 1, announcement: text });
    if (error) toast.error('Errore durante il salvataggio');
    else toast.success(text === '' ? 'Annuncio rimosso!' : 'Annuncio pubblicato!');
  };

  const addScorer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScorerName.trim() || !newScorerTeam) return toast.error('Compila tutti i campi');
    const { data, error } = await supabase.from('top_scorers').insert([{ name: newScorerName.trim(), team_code: newScorerTeam, goals: 1 }]).select();
    if (error) {
      toast.error('Errore');
    } else if (data) {
      setTopScorers([...topScorers, data[0]].sort((a,b) => b.goals - a.goals));
      setNewScorerName('');
      setNewScorerTeam('');
      toast.success('Marcatore Aggiunto!');
    }
  };

  const updateScorerGoals = async (id: number, currentGoals: number, change: number) => {
    const newGoals = currentGoals + change;
    if (newGoals < 0) return;
    const { error } = await supabase.from('top_scorers').update({ goals: newGoals }).eq('id', id);
    if (!error) {
      setTopScorers(topScorers.map(s => s.id === id ? { ...s, goals: newGoals } : s).sort((a,b) => b.goals - a.goals));
    }
  };

  const deleteScorer = async (id: number) => {
    if(window.confirm('Rimuovere questo marcatore?')) {
      await supabase.from('top_scorers').delete().eq('id', id);
      setTopScorers(topScorers.filter(s => s.id !== id));
    }
  };

  const syncLeaderboard = async (isManual = true) => {
    if (isManual && !window.confirm('Ricalcolare punti e spareggi per tutti?')) return;
    setSyncing(true);
    const syncToast = !isManual ? toast.loading('Calcolo Classifica...') : null;
    try {
      const [{ data: allMatches }, { data: offBonuses }, { data: offBracket }] = await Promise.all([
        supabase.from('matches').select('*').eq('is_finished', true),
        supabase.from('official_bonuses').select('*').maybeSingle(),
        supabase.from('official_bracket').select('*'), 
      ]);
      
      const profs = await fetchAllRecords('profiles');
      const allPreds = await fetchAllRecords('predictions');
      const userBrackets = await fetchAllRecords('brackets');
      const userBonuses = await fetchAllRecords('user_bonus_answers');

      if (!profs || profs.length === 0) return;

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
          Object.entries(bMap).forEach(([k, pts]: any) => { 
            if (offBonuses[k] != null && ub[k] != null && cleanString(String(offBonuses[k])) === cleanString(String(ub[k]))) pBon += pts; 
          });
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
        // MODIFICA ALGORITMO: Invertito ordine fasi tabellone (dai Sedicesimi a salire)
        if (b.pts_r32 !== a.pts_r32) return b.pts_r32 - a.pts_r32;
        if (b.pts_r16 !== a.pts_r16) return b.pts_r16 - a.pts_r16; 
        if (b.pts_qf !== a.pts_qf) return b.pts_qf - a.pts_qf;
        if (b.pts_sf !== a.pts_sf) return b.pts_sf - a.pts_sf; 
        if (b.pts_f !== a.pts_f) return b.pts_f - a.pts_f; 
        if (b.pts_winner !== a.pts_winner) return b.pts_winner - a.pts_winner;
        return (a.username || '').localeCompare(b.username || '');
      });

      const ranked = sorted.map((u, i) => ({ ...u, ranking: (i + 1).toString() }));
      
      for (const p of ranked) {
        await supabase.from('profiles').upsert(p, { onConflict: 'id' });
      }
      
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

  const deleteQualif = async (id: any) => { 
    await supabase.from('official_bracket').delete().eq('id', id); 
    await syncLeaderboard(false); 
  };
  
  const updatePaymentMethod = async (uId: string, method: string) => {
    const isPaid = method !== ''; 
    setProfiles(prevProfiles => prevProfiles.map(p => p.id === uId ? { ...p, is_paid: isPaid, payment_method: method } : p));
    const { error } = await supabase.from('profiles').update({ is_paid: isPaid, payment_method: method }).eq('id', uId);
    if (error) { toast.error('Errore'); fetchData(); } else { toast.success('Metodo aggiornato!'); }
  };

  const deleteUser = async (uId: string, name: string) => { 
    if (window.confirm(`Eliminare ${name}?`)) { 
      await supabase.from('predictions').delete().eq('user_id', uId); 
      await supabase.from('brackets').delete().eq('user_id', uId); 
      await supabase.from('user_bonus_answers').delete().eq('user_id', uId); 
      await supabase.from('profiles').delete().eq('id', uId); 
      fetchData(); 
      await syncLeaderboard(false); 
    } 
  };
  
  const handleResetPassword = async (uId: string, username: string) => {
    const newPassword = prompt(`Inserisci una nuova password temporanea per ${username} (min 6 caratteri):`);
    
    if (!newPassword) return; 
    
    if (newPassword.length < 6) {
      toast.error('La password deve avere almeno 6 caratteri');
      return;
    }

    const toastId = toast.loading('Resettando la password...');
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uId, newPassword })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success(`Password di ${username} aggiornata!`, { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  const getWinnerStats = () => {
    const winners = allBrackets.filter(b => b.stage === 'WINNER' && b.team_name);
    const total = winners.length;
    if (total === 0) return [];
    const counts: any = {};
    winners.forEach(w => { 
      const t = formatTeamName(w.team_name);
      counts[t] = (counts[t] || 0) + 1; 
    });
    return Object.entries(counts).sort((a: any, b: any) => b[1] - a[1]).map(([name, count]) => ({ name, count, pct: Math.round((Number(count) / total) * 100) }));
  };

  const getBonusDetails = (k: string) => {
    const choices: Record<string, { originalName: string; count: number; users: string[] }> = {};
    allUserBonuses.forEach(b => {
      if (b[k]) {
        const raw = String(b[k]).trim();
        const key = cleanString(raw);
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

  const getCompletionStats = () => {
    return profiles.map(p => {
      const uPreds = predictions.filter(pred => 
        pred.user_id === p.id && 
        pred.home_score !== null && String(pred.home_score).trim() !== '' &&
        pred.away_score !== null && String(pred.away_score).trim() !== ''
      ).length;
      
      const uBracks = allBrackets.filter(b => b.user_id === p.id && b.team_name && b.team_name.trim() !== '').length;
      
      let uBonus = 0;
      const bRow = allUserBonuses.find(b => b.user_id === p.id);
      if (bRow) {
        const fields = ['total_red_cards', 'top_scorer', 'high_scoring_match', 'total_penalties', 'total_own_goals', 'highest_scoring_group', 'lowest_scoring_group', 'mvp_world_cup', 'best_goalkeeper'];
        fields.forEach(f => {
          if (bRow[f] !== null && bRow[f] !== undefined && String(bRow[f]).trim() !== '') uBonus++;
        });
      }
      
      const maxBracks = 63;
      const totalCompleted = uPreds + uBracks + uBonus;
      const totalMax = 72 + maxBracks + 9;
      
      const pct = Math.min(100, Math.round((totalCompleted / totalMax) * 100)) || 0;
      
      return { ...p, uPreds, uBracks, uBonus, pct, maxBracks };
    }).sort((a, b) => b.pct - a.pct || (a.username || '').localeCompare(b.username || ''));
  };

  const copyClassificaReport = () => {
    const sorted = [...profiles].sort((a, b) => (parseInt(a.ranking || '999') - parseInt(b.ranking || '999')));
    let text = `🏆 *CLASSIFICA MONDIALE 2026* 🏆\n\n`;
    sorted.forEach((p, i) => {
        let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⚽';
        const exactStr = p.exact_matches > 0 ? ` [🎯 ${p.exact_matches} esatt${p.exact_matches === 1 ? 'o' : 'i'}]` : '';
        text += `${medal} *${p.ranking}. ${p.username}* - ${p.points} pt${exactStr}\n`;
    });
    text += `\n👉 Guarda la classifica completa:\nwww.iltuopronostico.it`;

    navigator.clipboard.writeText(text);
    toast.success('Classifica copiata per WhatsApp! 📱', { icon: '💬' });
  };

  const copyCompletionReport = () => {
    const stats = getCompletionStats();
    let text = `📋 *STATO COMPLETAMENTO PRONOSTICI* 📋\n\n`;

    stats.forEach(u => {
      const girIcon = u.uPreds === 72 ? '✅' : u.uPreds > 0 ? '⚠️' : '❌';
      const tabIcon = u.uBracks >= u.maxBracks ? '✅' : u.uBracks > 0 ? '⚠️' : '❌';
      const bonIcon = u.uBonus === 9 ? '✅' : u.uBonus > 0 ? '⚠️' : '❌';

      text += `👤 *${u.username}* (${u.pct}%)\n`;
      text += `Gir: ${u.uPreds}/72 ${girIcon} | Tab: ${u.uBracks}/${u.maxBracks} ${tabIcon} | Bon: ${u.uBonus}/9 ${bonIcon}\n\n`;
    });

    text += `👉 Entra per completare: www.iltuopronostico.it`;
    navigator.clipboard.writeText(text);
    toast.success('Stato completamento copiato! 📋', { icon: '📋' });
  };

  const copyWinnerReport = () => {
    const winners = getWinnerStats();
    let text = `🏆 *CHI VINCERÀ IL MONDIALE?* 🏆\n(Le scelte del gruppo)\n\n`;
    winners.forEach(w => {
      text += `${getEmoji(w.name)} *${w.name}:* ${w.pct}% (${w.count} voti)\n`;
    });
    text += `\n👉 Scopri chi ha votato chi:\nwww.iltuopronostico.it`;
    navigator.clipboard.writeText(text);
    toast.success('Statistiche Vincitore copiate! 🏆', { icon: '💬' });
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
              text += `⚽ ${getEmoji(m.home_team)} ${formatTeamName(m.home_team)} ${m.home_score_final}-${m.away_score_final} ${formatTeamName(m.away_team)} ${getEmoji(m.away_team)}\n`;
              text += `   👉 ${m.exactUsers.join(', ')}\n`;
          });
       });
    }

    text += `\n👉 Entra nell'app per vedere i pronostici di tutti:\nwww.iltuopronostico.it`;

    navigator.clipboard.writeText(text);
    toast.success('Report Cecchini copiato! 🎯', { icon: '🎯' });
  };

  const copyBonusReport = () => {
    let text = `📊 *LE PREVISIONI BONUS DEL GRUPPO* 📊\n\n`;
    
    const fields = [
      { l: '✨ MVP MONDIALE', k: 'mvp_world_cup', type: 'PLAYER' },
      { l: '⚽ CAPOCANNONIERE', k: 'top_scorer', type: 'PLAYER' },
      { l: '🧤 MIGLIOR PORTIERE', k: 'best_goalkeeper', type: 'PLAYER' },
      { l: '🔥 MATCH CON PIÙ GOL', k: 'high_scoring_match', type: 'MATCH' },
      { l: '📈 GIRONE CON PIÙ GOL', k: 'highest_scoring_group', type: 'GROUP' },
      { l: '📉 GIRONE CON MENO GOL', k: 'lowest_scoring_group', type: 'GROUP' }
    ];
    
    fields.forEach(f => {
      const details = getBonusDetails(f.k);
      if (details.length > 0) {
        text += `*${f.l}:*\n`;
        details.forEach(d => {
           let emj = '';
           let displayName = formatMatchName(d.originalName);

           if (f.type === 'PLAYER') {
               const allPlayers = [...WORLD_CUP_PLAYERS, ...WORLD_CUP_GOALKEEPERS];
               const player = allPlayers.find(p => cleanString(p.name) === cleanString(d.originalName));
               if (player) emj = `${getEmoji(player.country)} `;
           } 
           else if (f.type === 'MATCH' && d.originalName.includes('-')) {
               const [t1, t2] = d.originalName.split(/\s*-\s*/);
               emj = `${getEmoji(t1)} ${getEmoji(t2)} `;
               displayName = `${formatTeamName(t1)} - ${formatTeamName(t2)}`;
           } 
           else if (f.type === 'GROUP') {
               const group = TOURNAMENT_GROUPS.find(g => cleanString(g.name) === cleanString(d.originalName));
               if (group) {
                   emj = group.teams.map(t => getEmoji(t)).join('') + ' ';
               }
           }

           text += `- ${emj}*${displayName}* (${d.count} voti)\n`;
        });
        text += `\n`;
      }
    });

    text += `👉 Entra nell'app per vedere i dettagli:\nwww.iltuopronostico.it`;

    navigator.clipboard.writeText(text);
    toast.success('Statistiche Bonus copiate! 📊', { icon: '💬' });
  };

  const exportClassificaCSV = () => {
    const sortedProfiles = [...profiles].sort((a, b) => (parseInt(a.ranking || '999') - parseInt(b.ranking || '999')));
    
    const headers = ["Username", "Nome Completo", "Punti Totali", "Stato Pagamento", "Metodo Di Pagamento"];
    const matchHeaders = matches.map(m => `Match ${m.id} (${formatTeamName(m.home_team)}-${formatTeamName(m.away_team)})`);
    const bracketHeaders = ["Sedicesimi", "Ottavi", "Quarti", "Semifinali", "Finaliste", "Vincitore"];
    const bonusHeaders = ["MVP", "Capocannoniere", "Miglior Portiere", "Match + Gol", "Girone + Gol", "Girone - Gol", "Autogol", "Rigori", "Rossi"];

    const allHeaders = [...headers, ...matchHeaders, ...bracketHeaders, ...bonusHeaders];
    let csvContent = allHeaders.map(h => `"${String(h).replace(/"/g, '""')}"`).join(';') + "\n";

    sortedProfiles.forEach(p => {
      const uPreds = predictions.filter(pr => pr.user_id === p.id);
      const uBrackets = allBrackets.filter(b => b.user_id === p.id);
      const uBonuses = allUserBonuses.find(b => b.user_id === p.id) || {};

      const matchData = matches.map(m => {
        const pred = uPreds.find(pr => pr.match_id === m.id);
        return pred && pred.home_score !== null ? `${pred.home_score}-${pred.away_score}` : '';
      });

      const getStageTeams = (stage: string) => uBrackets.filter(b => normalizeStage(b.stage) === stage).map(b => b.team_name).join(', ');
      const bracketData = [
        getStageTeams('R32'),
        getStageTeams('R16'),
        getStageTeams('QF'),
        getStageTeams('SF'),
        getStageTeams('F'),
        getStageTeams('WINNER')
      ];

      const bonusData = [
        uBonuses.mvp_world_cup || '',
        uBonuses.top_scorer || '',
        uBonuses.best_goalkeeper || '',
        uBonuses.high_scoring_match || '',
        uBonuses.highest_scoring_group || '',
        uBonuses.lowest_scoring_group || '',
        uBonuses.total_own_goals ?? '',
        uBonuses.total_penalties ?? '',
        uBonuses.total_red_cards ?? ''
      ];

      const row = [
        p.username || '',
        p.full_name || '',
        p.points || 0,
        p.is_paid ? 'PAGATO' : 'DA PAGARE',
        p.payment_method || '--',
        ...matchData,
        ...bracketData,
        ...bonusData
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(';');

      csvContent += row + "\n";
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `backup_completo_mondiale_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Super Backup scaricato con successo! 📊');
  };

  const navItems = [
    { name: 'Profilo', path: '/profile', icon: <User size={20} strokeWidth={2.5} /> },
    { name: 'Fase Gironi', path: '/matches', icon: <Gamepad2 size={20} strokeWidth={2.5} /> },
    { name: 'Fase Finale', path: '/bracket', icon: <Trophy size={20} strokeWidth={2.5} /> },
    { name: 'Bonus', path: '/bonus', icon: <Star size={20} strokeWidth={2.5} /> },
    { name: 'Classifica', path: '/leaderboard', icon: <ListOrdered size={20} strokeWidth={2.5} /> },
    { name: 'Globale', path: '/tutti-i-pronostici', icon: <Users size={20} strokeWidth={2.5} /> }, 
  ];

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-yellow-500 font-black animate-pulse">CARICAMENTO...</div>;
  if (!isAdmin) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-rose-500 font-black">ACCESSO NEGATO</div>;

  const totalUsers = profiles.length;
  const paidUsers = profiles.filter(p => p.is_paid).length;
  const unpaidUsers = totalUsers - paidUsers;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-40 font-sans overflow-x-hidden relative">
      <button onClick={() => router.push('/profile')} className="absolute top-6 left-4 text-slate-500 hover:text-yellow-500 transition-colors flex items-center gap-1.5 font-black uppercase text-[10px] tracking-widest z-10">
        <ArrowLeft size={16} /> Indietro
      </button>

      <header className="flex flex-col items-center mb-8 pt-4 mt-8 sm:mt-4">
        <h1 className="text-4xl font-black text-yellow-500 italic uppercase tracking-tighter leading-none mb-6">Control Tower</h1>
        
        <div className="w-full max-w-2xl bg-slate-900/80 p-4 rounded-3xl border border-slate-800 shadow-xl">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={copyClassificaReport} className="w-full flex items-center justify-center gap-1.5 px-3 py-3 text-[10px] sm:text-xs font-black uppercase text-emerald-500 bg-slate-950 border border-slate-800 hover:bg-emerald-500/10 transition-colors rounded-xl">
              <MessageCircle size={14} /> Classifica
            </button>
            <button onClick={copyCompletionReport} className="w-full flex items-center justify-center gap-1.5 px-3 py-3 text-[10px] sm:text-xs font-black uppercase text-yellow-500 bg-slate-950 border border-slate-800 hover:bg-yellow-500/10 transition-colors rounded-xl">
              <MessageCircle size={14} /> Stato
            </button>
            <button onClick={copyWinnerReport} className="w-full flex items-center justify-center gap-1.5 px-3 py-3 text-[10px] sm:text-xs font-black uppercase text-blue-400 bg-slate-950 border border-slate-800 hover:bg-blue-400/10 transition-colors rounded-xl">
              <MessageCircle size={14} /> Vincitore
            </button>
            <button onClick={copyCecchiniReport} className="w-full flex items-center justify-center gap-1.5 px-3 py-3 text-[10px] sm:text-xs font-black uppercase text-rose-400 bg-slate-950 border border-slate-800 hover:bg-rose-400/10 transition-colors rounded-xl">
              <MessageCircle size={14} /> Cecchini
            </button>
            <button onClick={copyBonusReport} className="w-full flex items-center justify-center gap-1.5 px-3 py-3 text-[10px] sm:text-xs font-black uppercase text-purple-400 bg-slate-950 border border-slate-800 hover:bg-purple-400/10 transition-colors rounded-xl">
              <MessageCircle size={14} /> Dati Bonus
            </button>
            <button onClick={exportClassificaCSV} className="w-full flex items-center justify-center gap-1.5 px-3 py-3 text-[10px] sm:text-xs font-black uppercase text-cyan-400 bg-slate-950 border border-slate-800 hover:bg-cyan-400/10 transition-colors rounded-xl">
              <Download size={14} /> Excel
            </button>
            <div className="col-span-2">
                <button onClick={() => syncLeaderboard(true)} disabled={syncing} className={`w-full flex items-center justify-center gap-1.5 px-3 py-3 text-[10px] sm:text-xs font-black uppercase text-blue-500 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-colors rounded-xl ${syncing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> Ricalcola
                </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto space-y-5">

        <section className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-2xl">
          <button onClick={() => setOpenSection({ ...openSection, annuncio: !openSection.annuncio })} className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30">
            <div className="flex items-center gap-3"><Megaphone className="text-blue-500" size={24} /><h2 className="text-lg font-black uppercase italic tracking-tight">Annuncio Globale</h2></div>
            {openSection.annuncio ? <ChevronUp /> : <ChevronDown />}
          </button>
          {openSection.annuncio && (
            <div className="p-5 bg-slate-950/30">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">Questo messaggio apparirà in cima al Profilo di tutti i giocatori.</p>
              <textarea
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Es: LIVE: Stasera Brasile-Francia! Controllate i vostri risultati..."
                className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl font-bold text-sm text-white outline-none focus:border-blue-500 min-h-[100px] custom-scrollbar"
              />
              <div className="flex gap-4 pt-4">
                <button onClick={() => { setAnnouncement(''); saveAnnouncement(''); }} className="p-5 bg-slate-900 border border-slate-700 text-slate-500 hover:text-rose-500 rounded-2xl transition-colors"><Trash2 size={20} /></button>
                <button onClick={() => saveAnnouncement(announcement)} className="flex-1 bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black uppercase text-xs tracking-widest italic shadow-xl transition-all">Pubblica Annuncio</button>
              </div>
            </div>
          )}
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-2xl">
          <button onClick={() => setOpenSection({ ...openSection, marcatori: !openSection.marcatori })} className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30">
            <div className="flex items-center gap-3"><Award className="text-cyan-500" size={24} /><h2 className="text-lg font-black uppercase italic tracking-tight">Top Marcatori Live</h2></div>
            {openSection.marcatori ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {openSection.marcatori && (
            <div className="p-5 bg-slate-950/30 space-y-6">
              
              <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                <AutocompleteInput 
                  value={newScorerName} 
                  onChange={(val) => setNewScorerName(val)} 
                  placeholder="Nome (es. K. Mbappé)" 
                  suggestions={[...WORLD_CUP_PLAYERS, ...WORLD_CUP_GOALKEEPERS]} 
                  onSelectCustom={(item) => {
                    const code = flagMap[item.country.toLowerCase().trim()];
                    if (code) setNewScorerTeam(code);
                  }}
                />
                <div className="flex w-full sm:w-auto gap-3 shrink-0">
                  <select 
                    value={newScorerTeam} 
                    onChange={(e) => setNewScorerTeam(e.target.value)}
                    className="flex-1 sm:w-40 bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black text-xs text-white uppercase outline-none focus:border-cyan-500 appearance-none text-center"
                  >
                    <option value="">Nazione...</option>
                    {Object.entries(flagMap)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([country, code]) => (
                        <option key={code + country} value={code}>{country}</option>
                    ))}
                  </select>
                  <button onClick={(e) => addScorer(e)} className="bg-cyan-600 hover:bg-cyan-500 p-4 rounded-2xl text-white transition-all shadow-lg active:scale-95 shrink-0">
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {topScorers.length === 0 && (
                   <p className="text-center text-slate-600 font-black text-xs uppercase py-4">Nessun marcatore inserito</p>
                )}
                {topScorers.map(scorer => (
                  <div key={scorer.id} className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3">
                      <img src={`https://flagcdn.com/w40/${scorer.team_code}.png`} alt="" className="w-6 h-auto rounded-sm" />
                      <span className="font-black text-sm uppercase text-slate-200">{scorer.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-slate-950 rounded-xl border border-slate-800 p-1">
                        <button onClick={() => updateScorerGoals(scorer.id, scorer.goals, -1)} className="p-2 text-slate-500 hover:text-rose-500 transition-colors"><Minus size={14}/></button>
                        <span className="w-6 text-center font-black text-cyan-400">{scorer.goals}</span>
                        <button onClick={() => updateScorerGoals(scorer.id, scorer.goals, 1)} className="p-2 text-slate-500 hover:text-emerald-500 transition-colors"><Plus size={14}/></button>
                      </div>
                      <button onClick={() => deleteScorer(scorer.id)} className="p-3 text-rose-500 bg-rose-500/10 hover:bg-rose-500 hover:text-white rounded-xl transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-2xl">
          <button onClick={() => setOpenSection({ ...openSection, iscrizioni: !openSection.iscrizioni })} className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30">
            <div className="flex items-center gap-3">
              <Users className="text-emerald-500" size={24} />
              <h2 className="text-lg font-black uppercase italic tracking-tight">
                Iscrizioni ({totalUsers})
              </h2>
            </div>
            {openSection.iscrizioni ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {openSection.iscrizioni && (
            <div className="bg-slate-950/50 flex flex-col">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                 <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                    <span className="text-emerald-400">💰 Pagati: {paidUsers}</span>
                    <span className="text-orange-400">⏳ Da Pagare: {unpaidUsers}</span>
                 </div>
              </div>
              <div className="divide-y divide-slate-800/50">
                {[...profiles].sort((a, b) => (a.is_paid === b.is_paid ? 0 : a.is_paid ? 1 : -1)).map(p => (
                  <div key={p.id} className="p-4 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex items-start gap-2">
                      <div className="mt-1">
                        {p.is_paid ? (
                          <span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]" title="Quota pagata">💰</span>
                        ) : (
                          <span className="text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded text-[10px]" title="Da pagare">⏳</span>
                        )}
                      </div>
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
                    </div>
                    
                    <div className="flex gap-2 shrink-0 self-center">
                      <div className="relative">
                        <select 
                          value={p.payment_method || (p.is_paid ? 'Pagato' : '')} 
                          onChange={(e) => updatePaymentMethod(p.id, e.target.value)} 
                          className={`px-3 py-2 pr-6 rounded-xl text-[9px] font-black uppercase transition-all outline-none appearance-none cursor-pointer text-center ${p.is_paid || p.payment_method ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-900 text-orange-500 border border-orange-500/30 hover:bg-orange-500/10'}`}
                        >
                          <option value="">⏳ NON PAGATO</option>
                          <option value="Pagato" hidden>💰 PAGATO ✓</option>
                          <option value="Satispay">SATISPAY</option>
                          <option value="PayPal">PAYPAL</option>
                          <option value="Contanti">CONTANTI</option>
                          <option value="Bonifico">BONIFICO</option>
                        </select>
                        <ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${p.is_paid || p.payment_method ? 'text-slate-950' : 'text-orange-500'}`} />
                      </div>
                      <button 
                        onClick={() => handleResetPassword(p.id, p.username)} 
                        className="p-2 text-blue-500 bg-blue-500/10 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                        title="Resetta Password"
                      >
                        <Key size={16} />
                      </button>
                      <button onClick={() => deleteUser(p.id, p.username)} className="p-2 text-rose-500 bg-rose-500/10 rounded-xl hover:bg-rose-500 hover:text-white transition-all" title="Elimina Utente">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest px-1">Mvp del Mondiale</span>
                    <AutocompleteInput value={bonusData.mvp_world_cup} onChange={val => setBonusData({ ...bonusData, mvp_world_cup: val })} placeholder="MVP MONDIALE" suggestions={[...WORLD_CUP_PLAYERS, ...WORLD_CUP_GOALKEEPERS]} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest px-1">Capocannoniere</span>
                    <AutocompleteInput value={bonusData.top} onChange={val => setBonusData({ ...bonusData, top: val })} placeholder="CAPOCANNONIERE" suggestions={[...WORLD_CUP_PLAYERS, ...WORLD_CUP_GOALKEEPERS]} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest px-1">Miglior Portiere</span>
                    <AutocompleteInput value={bonusData.best_goalkeeper} onChange={val => setBonusData({ ...bonusData, best_goalkeeper: val })} placeholder="MIGLIOR PORTIERE" suggestions={WORLD_CUP_GOALKEEPERS} />
                  </div>

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
              
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col">
                <p className="text-[9px] font-black text-yellow-500 uppercase mb-3 border-b border-slate-800/50 pb-1 italic shrink-0 flex items-center gap-1.5">
                  <CheckCircle size={12}/> Completamento Pronostici
                </p>
                <div className="space-y-3 overflow-y-auto max-h-80 pr-2 custom-scrollbar">
                  {getCompletionStats().map(u => (
                    <div key={u.id} className="flex flex-col border-b border-slate-800/30 pb-2.5 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase italic mb-1">
                        <span className="truncate pr-2 text-white">{u.username}</span>
                        <div className="flex items-center gap-1">
                          {u.pct < 100 && <AlertTriangle size={10} className="text-rose-500 animate-pulse"/>}
                          <span className={u.pct === 100 ? 'text-emerald-400' : 'text-yellow-500'}>{u.pct}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 mb-2 overflow-hidden border border-slate-800">
                        <div className={`h-full rounded-full transition-all ${u.pct === 100 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-gradient-to-r from-yellow-600 to-yellow-400'}`} style={{ width: `${u.pct}%` }}></div>
                      </div>
                      <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest px-1">
                        <span title="Fase a Gironi">Gir: <span className={u.uPreds === 72 ? 'text-emerald-400' : 'text-slate-300'}>{u.uPreds}/72</span></span>
                        <span title="Fase Finale (Tabellone)">FF: <span className={u.uBracks >= u.maxBracks ? 'text-emerald-400' : 'text-slate-300'}>{u.uBracks}/{u.maxBracks}</span></span>
                        <span title="Domande Bonus">Bon: <span className={u.uBonus === 9 ? 'text-emerald-400' : 'text-slate-300'}>{u.uBonus}/9</span></span>
                      </div>
                    </div>
                  ))}
                </div>
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