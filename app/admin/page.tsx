'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { WORLD_CUP_PLAYERS, WORLD_CUP_GOALKEEPERS } from '@/lib/players';
import {
  Trophy, Users, Zap, Search, Trash2, ChevronDown, ChevronUp,
  BarChart3, RefreshCw, Star, X, MessageCircle, ArrowLeft,
  User, CheckCircle, AlertTriangle, Plus, Minus, Award, Megaphone, 
  Shield, Download, Gift, Activity, Key, Gamepad2, ListOrdered, Flag, CalendarDays, Coins, Medal
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

const BRACKET_SLOTS: Record<string, { dbString: string, label: string }[]> = {
  R32: [
    { dbString: 'R32_SEDICESIMI_1A', label: '1° Gruppo A' }, { dbString: 'R32_SEDICESIMI_3M1', label: '3° Migliore (Slot 1)' },
    { dbString: 'R32_SEDICESIMI_2B', label: '2° Gruppo B' }, { dbString: 'R32_SEDICESIMI_2C', label: '2° Gruppo C' },
    { dbString: 'R32_SEDICESIMI_1D', label: '1° Gruppo D' }, { dbString: 'R32_SEDICESIMI_3M2', label: '3° Migliore (Slot 2)' },
    { dbString: 'R32_SEDICESIMI_1F', label: '1° Gruppo F' }, { dbString: 'R32_SEDICESIMI_2H', label: '2° Gruppo H' },
    { dbString: 'R32_SEDICESIMI_1E', label: '1° Gruppo E' }, { dbString: 'R32_SEDICESIMI_3M3', label: '3° Migliore (Slot 3)' },
    { dbString: 'R32_SEDICESIMI_2A', label: '2° Gruppo A' }, { dbString: 'R32_SEDICESIMI_2G', label: '2° Gruppo G' },
    { dbString: 'R32_SEDICESIMI_1I', label: '1° Gruppo I' }, { dbString: 'R32_SEDICESIMI_3M4', label: '3° Migliore (Slot 4)' },
    { dbString: 'R32_SEDICESIMI_2D', label: '2° Gruppo D' }, { dbString: 'R32_SEDICESIMI_2F', label: '2° Gruppo F' },
    { dbString: 'R32_SEDICESIMI_1B', label: '1° Gruppo B' }, { dbString: 'R32_SEDICESIMI_3M5', label: '3° Migliore (Slot 5)' },
    { dbString: 'R32_SEDICESIMI_2K', label: '2° Gruppo K' }, { dbString: 'R32_SEDICESIMI_2L', label: '2° Gruppo L' },
    { dbString: 'R32_SEDICESIMI_1C', label: '1° Gruppo C' }, { dbString: 'R32_SEDICESIMI_3M6', label: '3° Migliore (Slot 6)' },
    { dbString: 'R32_SEDICESIMI_1J', label: '1° Gruppo J' }, { dbString: 'R32_SEDICESIMI_2I', label: '2° Gruppo I' },
    { dbString: 'R32_SEDICESIMI_1G', label: '1° Gruppo G' }, { dbString: 'R32_SEDICESIMI_3M7', label: '3° Migliore (Slot 7)' },
    { dbString: 'R32_SEDICESIMI_2E', label: '2° Gruppo E' }, { dbString: 'R32_SEDICESIMI_2J', label: '2° Gruppo J' },
    { dbString: 'R32_SEDICESIMI_1H', label: '1° Gruppo H' }, { dbString: 'R32_SEDICESIMI_3M8', label: '3° Migliore (Slot 8)' },
    { dbString: 'R32_SEDICESIMI_1K', label: '1° Gruppo K' }, { dbString: 'R32_SEDICESIMI_1L', label: '1° Gruppo L' },
  ],
  R16: Array.from({length: 16}, (_, i) => ({ dbString: `R16_OTTAVI_V${i+1}`, label: `Vincitrice Sedicesimi ${i+1}` })),
  QF: Array.from({length: 8}, (_, i) => ({ dbString: `QF_QUARTI_V${i+1}`, label: `Vincitrice Ottavi ${i+1}` })),
  SF: Array.from({length: 4}, (_, i) => ({ dbString: `SF_SEMIFINALI_V${i+1}`, label: `Vincitrice Quarti ${i+1}` })),
  F: [ { dbString: 'F_FINALE_1', label: 'Finalista 1' }, { dbString: 'F_FINALE_2', label: 'Finalista 2' } ],
  WINNER: [ { dbString: 'WINNER_VINCITORE_1', label: 'Campione del Mondo' } ]
};

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

const FLAG_MAP: Record<string, string> = {
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

const FLAG_EMOJI_MAP: Record<string, string> = {
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

const COUNTRY_OPTIONS = [
  { name: 'Algeria', code: 'dz' }, { name: 'Arabia Saudita', code: 'sa' }, { name: 'Argentina', code: 'ar' }, { name: 'Australia', code: 'au' },
  { name: 'Austria', code: 'at' }, { name: 'Belgio', code: 'be' }, { name: 'Bosnia', code: 'ba' }, { name: 'Brasile', code: 'br' },
  { name: 'Canada', code: 'ca' }, { name: 'Capo Verde', code: 'cv' }, { name: 'Colombia', code: 'co' }, { name: 'Corea del Sud', code: 'kr' },
  { name: "Costa d'Avorio", code: 'ci' }, { name: 'Croazia', code: 'hr' }, { name: 'Curaçao', code: 'cw' }, { name: 'Ecuador', code: 'ec' },
  { name: 'Egitto', code: 'eg' }, { name: 'Francia', code: 'fr' }, { name: 'Germania', code: 'de' }, { name: 'Ghana', code: 'gh' },
  { name: 'Giappone', code: 'jp' }, { name: 'Giordania', code: 'jo' }, { name: 'Haiti', code: 'ht' }, { name: 'Inghilterra', code: 'gb-eng' },
  { name: 'Iran', code: 'ir' }, { name: 'Iraq', code: 'iq' }, { name: 'Marocco', code: 'ma' }, { name: 'Messico', code: 'mx' },
  { name: 'Norvegia', code: 'no' }, { name: 'Nuova Zelanda', code: 'nz' }, { name: 'Olanda', code: 'nl' }, { name: 'Panama', code: 'pa' },
  { name: 'Paraguay', code: 'py' }, { name: 'Portogallo', code: 'pt' }, { name: 'Qatar', code: 'qa' }, { name: 'Rep. Ceca', code: 'cz' },
  { name: 'R.D. Congo', code: 'cd' }, { name: 'Scozia', code: 'gb-sct' }, { name: 'Senegal', code: 'sn' }, { name: 'Spagna', code: 'es' },
  { name: 'Stati Uniti', code: 'us' }, { name: 'Sudafrica', code: 'za' }, { name: 'Svezia', code: 'se' }, { name: 'Svizzera', code: 'ch' },
  { name: 'Tunisia', code: 'tn' }, { name: 'Turchia', code: 'tr' }, { name: 'Uruguay', code: 'uy' }, { name: 'Uzbekistan', code: 'uz' }
].sort((a, b) => a.name.localeCompare(b.name));

const getFlagCode = (team: string) => {
  if (!team) return '';
  let t = team.toLowerCase().trim();
  if (t === 'corea sud') t = 'corea del sud';
  if (t === 'rep. ceca') t = 'repubblica ceca';
  if (t === 'n. zelanda') t = 'nuova zelanda';
  if (t === 'arabia s.') t = 'arabia saudita';
  if (t === 'r.d. congo') t = 'repubblica democratica del congo';
  if (t === 'curacao') t = 'curaçao';
  if (t === 'costa avorio') t = "costa d'avorio";
  if (t === 'usa') t = 'stati uniti';
  if (t === 'bosnia') t = 'bosnia ed erzegovina';
  return FLAG_MAP[t] || '';
};

const getFlag = (team: string) => {
    const code = getFlagCode(team);
    return code ? `https://flagcdn.com/w40/${code}.png` : null;
};

const getEmoji = (team: string) => {
    if (!team) return '';
    return FLAG_EMOJI_MAP[team.toLowerCase().trim()] || '';
};

const normalizeStage = (s: string) => {
  const u = s?.toUpperCase().trim() || '';
  if (u.includes('SEDICESIM') || u.includes('R32')) return 'R32';
  if (u.includes('OTTAV') || u.includes('R16')) return 'R16';
  if (u.includes('QUART') || u.includes('QF')) return 'QF';
  if (u.includes('SEMIFINAL') || u.includes('SF')) return 'SF';
  if (u.includes('VINCITOR') || u.includes('CAMPIONE') || u.includes('WINNER')) return 'WINNER';
  if (u.includes('FINAL') || u === 'F' || u.startsWith('F_')) return 'F';
  return u;
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
  formatted = formatted.replace(/Corea del Sud|Corea Sud/gi, 'Corea Sud');
  formatted = formatted.replace(/Costa d'Avorio|Costa Avorio/gi, 'Costa Avorio');
  return formatted;
};

const formatTeamName = formatMatchName;

const cleanString = (str: string) => {
  if (!str) return '';
  return formatMatchName(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
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
      
      {isOpen && value && value.length > 0 && (
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

const fetchAllRecords = async (table: string, orderCol1?: string, orderCol2?: string, orderCol3?: string) => {
  let result: any[] = [];
  let start = 0;
  const limit = 1000;
  while (true) {
    let query = supabase.from(table).select('*');
    if (orderCol1) query = query.order(orderCol1, { ascending: true });
    if (orderCol2) query = query.order(orderCol2, { ascending: true });
    if (orderCol3) query = query.order(orderCol3, { ascending: true });
    
    const { data, error } = await query.range(start, start + limit - 1);
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
  
  const [openSection, setOpenSection] = useState({ annuncio: false, iscrizioni: false, risultati: false, tabellone: false, liveStats: false, bonus: false, statistiche: false, marcatori: false, laFinale: false });
  
  const [matches, setMatches] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [officialBracket, setOfficialBracket] = useState<any[]>([]);
  const [allUserBonuses, setAllUserBonuses] = useState<any[]>([]);
  const [allBrackets, setAllBrackets] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [topScorers, setTopScorers] = useState<any[]>([]);
  const [userFinalePredictions, setUserFinalePredictions] = useState<any[]>([]);
  
  const [announcement, setAnnouncement] = useState('');
  const [isFinaleActive, setIsFinaleActive] = useState(false);
  const [activeFinaleAdminTab, setActiveFinaleAdminTab] = useState<'SUNDAY' | 'SATURDAY'>('SUNDAY');
  
  const [newScorerName, setNewScorerName] = useState('');
  const [newScorerTeam, setNewScorerTeam] = useState('');

  const [qTeam, setQTeam] = useState('');
  const [qStage, setQStage] = useState('R32');
  const [qSlot, setQSlot] = useState(BRACKET_SLOTS['R32'][0].dbString);

  const [bonusData, setBonusData] = useState({ red: '', top: '', penalties: '', own_goals: '', mvp_world_cup: '', best_goalkeeper: '', high: '', high_group: '', low_group: '' });
  
  // STATI REALI INPUT SEZIONE "LA FINALE" (Senza "Squadra Campione")
  const [finaleResultData, setFinaleResultData] = useState({
    // DOMENICA
    home_score: '', away_score: '', ending_method: 'REGULAR', f12_mvp: '',
    f12_ht_home_score: '', f12_ht_away_score: '', f12_2nd_home_score: '', f12_2nd_away_score: '',
    f12_first_to_score: '', f12_scorer: '', first_goal_minute: '', f12_fouls: '',
    f12_yellow_cards: '', f12_red_cards: '', f12_penalties: '',
    
    // SABATO
    f34_home_score: '', f34_away_score: '', f34_ending_method: 'REGULAR', f34_mvp: '',
    f34_ht_home_score: '', f34_ht_away_score: '', f34_2nd_home_score: '', f34_2nd_away_score: '',
    f34_first_to_score: '', f34_scorer: '', f34_first_goal_minute: '', f34_fouls: '',
    f34_yellow_cards: '', f34_red_cards: '', f34_penalties: ''
  });
  const [finaleReportText, setFinaleReportText] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [groupedMatches, setGroupedMatches] = useState<Record<string, string[]>>({});
  const [todayKey, setTodayKey] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) { setIsAdmin(true); fetchData(); }
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (openSection.risultati && todayKey) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`admin-day-${todayKey}`);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [openSection.risultati, todayKey]);

  async function fetchData() {
    const [mRes, bRes, obRes, scorersRes, settingsRes] = await Promise.all([
      supabase.from('matches').select('*').order('id', { ascending: true }),
      supabase.from('official_bonuses').select('*').eq('id', '00000000-0000-0000-0000-000000000000').maybeSingle(),
      supabase.from('official_bracket').select('*').order('id', { ascending: true }),
      supabase.from('top_scorers').select('*').order('goals', { ascending: false }),
      supabase.from('app_settings').select('*').eq('id', 1).maybeSingle()
    ]);
    
    const pData = await fetchAllRecords('profiles', 'id');
    const ubData = await fetchAllRecords('user_bonus_answers', 'user_id');
    const brData = await fetchAllRecords('brackets', 'user_id', 'stage', 'team_name');
    const predData = await fetchAllRecords('predictions', 'user_id', 'match_id');
    const fPredictions = await fetchAllRecords('final_match_predictions', 'user_id');

    const fetchedMatches = mRes.data || [];
    setMatches(fetchedMatches); 
    setProfiles(pData || []); 
    setOfficialBracket(obRes.data || []); 
    setAllUserBonuses(ubData || []);
    setAllBrackets(brData || []);
    setPredictions(predData || []);
    setTopScorers(scorersRes.data || []);
    setUserFinalePredictions(fPredictions || []);
    
    if (settingsRes.data) {
      setAnnouncement(settingsRes.data.announcement || '');
      setIsFinaleActive(settingsRes.data.is_finale_active || false);
    }

    // Caricamento Dati Ufficiali della finale dal record master (se salvato)
    const officialFinaleRow = fPredictions?.find(f => f.user_id === '00000000-0000-0000-0000-000000000000');
    if (officialFinaleRow) {
      setFinaleResultData({
        home_score: officialFinaleRow.home_score?.toString() || '',
        away_score: officialFinaleRow.away_score?.toString() || '',
        ending_method: officialFinaleRow.ending_method || 'REGULAR',
        f12_mvp: officialFinaleRow.f12_mvp || '',
        f12_ht_home_score: officialFinaleRow.f12_ht_home_score?.toString() || '',
        f12_ht_away_score: officialFinaleRow.f12_ht_away_score?.toString() || '',
        f12_2nd_home_score: officialFinaleRow.f12_2nd_home_score?.toString() || '',
        f12_2nd_away_score: officialFinaleRow.f12_2nd_away_score?.toString() || '',
        f12_first_to_score: officialFinaleRow.f12_first_to_score || '',
        f12_scorer: officialFinaleRow.f12_scorer || '',
        first_goal_minute: officialFinaleRow.first_goal_minute?.toString() || '',
        f12_fouls: officialFinaleRow.f12_fouls?.toString() || '',
        f12_yellow_cards: officialFinaleRow.f12_yellow_cards?.toString() || '',
        f12_red_cards: officialFinaleRow.f12_red_cards?.toString() || '',
        f12_penalties: officialFinaleRow.f12_penalties?.toString() || '',

        f34_home_score: officialFinaleRow.f34_home_score?.toString() || '',
        f34_away_score: officialFinaleRow.f34_away_score?.toString() || '',
        f34_ending_method: officialFinaleRow.f34_ending_method || 'REGULAR',
        f34_mvp: officialFinaleRow.f34_mvp || '',
        f34_ht_home_score: officialFinaleRow.f34_ht_home_score?.toString() || '',
        f34_ht_away_score: officialFinaleRow.f34_ht_away_score?.toString() || '',
        f34_2nd_home_score: officialFinaleRow.f34_2nd_home_score?.toString() || '',
        f34_2nd_away_score: officialFinaleRow.f34_2nd_away_score?.toString() || '',
        f34_first_to_score: officialFinaleRow.f34_first_to_score || '',
        f34_scorer: officialFinaleRow.f34_scorer || '',
        f34_first_goal_minute: officialFinaleRow.f34_first_goal_minute?.toString() || '',
        f34_fouls: officialFinaleRow.f34_fouls?.toString() || '',
        f34_yellow_cards: officialFinaleRow.f34_yellow_cards?.toString() || '',
        f34_red_cards: officialFinaleRow.f34_red_cards?.toString() || '',
        f34_penalties: officialFinaleRow.f34_penalties?.toString() || ''
      });
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
    
    const today = new Date();
    let foundTodayKey: string | null = null;
    fetchedMatches.forEach((m: any) => {
      if (m.match_date) {
        const d = new Date(m.match_date);
        if (
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        ) {
          const dateStr = d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
          foundTodayKey = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
        }
      }
    });
    if (foundTodayKey) setTodayKey(foundTodayKey);

    if (bRes.data) {
      setBonusData({
        red: bRes.data.total_red_cards?.toString() || '', 
        top: bRes.data.top_scorer || '', 
        penalties: bRes.data.total_penalties?.toString() || '', 
        own_goals: bRes.data.total_own_goals?.toString() || '',
        mvp_world_cup: bRes.data.mvp_world_cup || '', 
        best_goalkeeper: bRes.data.best_goalkeeper || '',
        high: bRes.data.high_scoring_match || '',
        high_group: bRes.data.highest_scoring_group || '',
        low_group: bRes.data.lowest_scoring_group || ''
      });
    }
  }

  const groupedMatchesByDay = useMemo(() => {
    const processed = matches
      .map(m => {
        const homeFormatted = formatMatchName(m.home_team);
        const groupObj = TOURNAMENT_GROUPS.find(g => g.teams.some(t => t.toLowerCase() === homeFormatted.toLowerCase()));
        return { ...m, groupName: groupObj ? groupObj.name : 'Z - Altri' };
      })
      .filter(m =>
        (m.home_team || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.away_team || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.groupName.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const groupsMap: { [key: string]: { dateVal: number, matches: any[] } } = {};
    processed.forEach(m => {
      let dayName = "Data da definire";
      let dVal = 0;
      if (m.match_date) {
        const d = new Date(m.match_date);
        dVal = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const dateStr = d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
        dayName = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
      } else if (m.id) {
        dVal = m.id;
      }

      if (!groupsMap[dayName]) {
        groupsMap[dayName] = { dateVal: dVal, matches: [] };
      }
      groupsMap[dayName].matches.push(m);
    });

    return Object.entries(groupsMap)
      .map(([dayName, info]) => {
         const sortedMatches = info.matches.sort((a, b) => a.id - b.id);
         return { dayName, dateVal: info.dateVal, matchesArray: sortedMatches };
      })
      .sort((a, b) => a.dateVal - b.dateVal);
  }, [matches, searchTerm]);

  const saveAnnouncement = async (text: string) => {
    const { error } = await supabase
      .from('app_settings')
      .update({ announcement: text })
      .eq('id', 1);

    if (error) toast.error('Errore durante il salvataggio');
    else toast.success(text === '' ? 'Annuncio rimosso!' : 'Annuncio pubblicato!');
  };

  const toggleFinaleStatus = async () => {
    const currentStatus = isFinaleActive;
    const newStatus = !currentStatus;
    setIsFinaleActive(newStatus);
    
    const { error } = await supabase
      .from('app_settings')
      .update({ is_finale_active: newStatus })
      .eq('id', 1);

    if (error) {
      toast.error('Errore durante il cambio stato');
      setIsFinaleActive(currentStatus);
    } else {
      toast.success(newStatus ? 'Fase "LA FINALE" Attivata! Schedina sbloccata per gli utenti.' : 'Fase "LA FINALE" Disattivata.');
    }
  };

  // FUNZIONE CHIRURGICA: Calcola lo score del singolo match basandosi sui pesi scelti
  const scoreSingleMatch = (p: any, o: any, isSunday: boolean) => {
    let pts = 0;
    
    const pHome = isSunday ? p.home_score : p.f34_home_score;
    const pAway = isSunday ? p.away_score : p.f34_away_score;
    const oHome = isSunday ? o.home_score : o.f34_home_score;
    const oAway = isSunday ? o.away_score : o.f34_away_score;

    const pMethod = isSunday ? p.ending_method : p.f34_ending_method;
    const oMethod = isSunday ? o.ending_method : o.f34_ending_method;

    const pMvp = isSunday ? p.f12_mvp : p.f34_mvp;
    const oMvp = isSunday ? o.f12_mvp : o.f34_mvp;

    const pHtH = isSunday ? p.f12_ht_home_score : p.f34_ht_home_score;
    const pHtA = isSunday ? p.f12_ht_away_score : p.f34_ht_away_score;
    const oHtH = isSunday ? o.f12_ht_home_score : o.f34_ht_home_score;
    const oHtA = isSunday ? o.f12_ht_away_score : o.f34_ht_away_score;

    const p2ndH = isSunday ? p.f12_2nd_home_score : p.f34_2nd_home_score;
    const p2ndA = isSunday ? p.f12_2nd_away_score : p.f34_2nd_away_score;
    const o2ndH = isSunday ? o.f12_2nd_home_score : o.f34_2nd_home_score;
    const o2ndA = isSunday ? o.f12_2nd_away_score : o.f34_2nd_away_score;

    const pFirst = isSunday ? p.f12_first_to_score : p.f34_first_to_score;
    const oFirst = isSunday ? o.f12_first_to_score : o.f34_first_to_score;

    const pScorer = isSunday ? p.f12_scorer : p.f34_scorer;
    const oScorer = isSunday ? o.f12_scorer : o.f34_scorer;

    const pMin = isSunday ? p.first_goal_minute : p.f34_first_goal_minute;
    const oMin = isSunday ? o.first_goal_minute : o.f34_first_goal_minute;

    const pFouls = isSunday ? p.f12_fouls : p.f34_fouls;
    const oFouls = isSunday ? o.f12_fouls : o.f34_fouls;

    const pYel = isSunday ? p.f12_yellow_cards : p.f34_yellow_cards;
    const oYel = isSunday ? o.f12_yellow_cards : o.f34_yellow_cards;

    const pRed = isSunday ? p.f12_red_cards : p.f34_red_cards;
    const oRed = isSunday ? o.f12_red_cards : o.f34_red_cards;

    const pPen = isSunday ? p.f12_penalties : p.f34_penalties;
    const oPen = isSunday ? o.f12_penalties : o.f34_penalties;

    if (pHome !== null && pAway !== null && oHome !== null && oAway !== null) {
      if (parseInt(pHome) === parseInt(oHome) && parseInt(pAway) === parseInt(oAway)) pts += 30;
    }
    if (pMethod && oMethod && pMethod === oMethod) pts += 10;
    if (pMvp && oMvp && cleanString(pMvp) === cleanString(oMvp)) pts += 12;
    if (pHtH !== null && pHtA !== null && oHtH !== null && oHtA !== null) {
      if (parseInt(pHtH) === parseInt(oHtH) && parseInt(pHtA) === parseInt(oHtA)) pts += 10;
    }
    if (p2ndH !== null && p2ndA !== null && o2ndH !== null && o2ndA !== null) {
      if (parseInt(p2ndH) === parseInt(o2ndH) && parseInt(p2ndA) === parseInt(o2ndA)) pts += 10;
    }
    if (pFirst && oFirst && cleanString(pFirst) === cleanString(oFirst)) pts += 5;
    if (pScorer && oScorer && cleanString(pScorer) === cleanString(oScorer)) pts += 11;
    if (pMin !== null && oMin !== null && parseInt(pMin) === parseInt(oMin)) pts += 10;
    if (pFouls !== null && oFouls !== null && parseInt(pFouls) === parseInt(oFouls)) pts += 6;
    if (pYel !== null && oYel !== null && parseInt(pYel) === parseInt(oYel)) pts += 3;
    if (pRed !== null && oRed !== null && parseInt(pRed) === parseInt(oRed)) pts += 3;
    if (pPen !== null && oPen !== null && parseInt(pPen) === parseInt(oPen)) pts += 1;

    return pts;
  };

  const handleSaveAndCalculateFinale = async () => {
    if (finaleResultData.home_score === '' || finaleResultData.away_score === '' || finaleResultData.f34_home_score === '') {
      return toast.error('Inserisci almeno i Risultati Esatti finali di Sabato e Domenica per procedere!');
    }

    const toastId = toast.loading('Salvataggio dati reali e ricalcolo classifiche Jackpot...');
    try {
      const parseNum = (val: string) => val === '' ? null : parseInt(val);

      const officialPayload = {
        user_id: '00000000-0000-0000-0000-000000000000',
        home_score: parseNum(finaleResultData.home_score),
        away_score: parseNum(finaleResultData.away_score),
        ending_method: finaleResultData.ending_method,
        f12_mvp: finaleResultData.f12_mvp || null,
        f12_ht_home_score: parseNum(finaleResultData.f12_ht_home_score),
        f12_ht_away_score: parseNum(finaleResultData.f12_ht_away_score),
        f12_2nd_home_score: parseNum(finaleResultData.f12_2nd_home_score),
        f12_2nd_away_score: parseNum(finaleResultData.f12_2nd_away_score),
        f12_first_to_score: finaleResultData.f12_first_to_score || null,
        f12_scorer: finaleResultData.f12_scorer || null,
        first_goal_minute: parseNum(finaleResultData.first_goal_minute),
        f12_fouls: parseNum(finaleResultData.f12_fouls),
        f12_yellow_cards: parseNum(finaleResultData.f12_yellow_cards),
        f12_red_cards: parseNum(finaleResultData.f12_red_cards),
        f12_penalties: parseNum(finaleResultData.f12_penalties),

        f34_home_score: parseNum(finaleResultData.f34_home_score),
        f34_away_score: parseNum(finaleResultData.f34_away_score),
        f34_ending_method: finaleResultData.f34_ending_method,
        f34_mvp: finaleResultData.f34_mvp || null,
        f34_ht_home_score: parseNum(finaleResultData.f34_ht_home_score),
        f34_ht_away_score: parseNum(finaleResultData.f34_ht_away_score),
        f34_2nd_home_score: parseNum(finaleResultData.f34_2nd_home_score),
        f34_2nd_away_score: parseNum(finaleResultData.f34_2nd_away_score),
        f34_first_to_score: finaleResultData.f34_first_to_score || null,
        f34_scorer: finaleResultData.f34_scorer || null,
        f34_first_goal_minute: parseNum(finaleResultData.f34_first_goal_minute),
        f34_fouls: parseNum(finaleResultData.f34_fouls),
        f34_yellow_cards: parseNum(finaleResultData.f34_yellow_cards),
        f34_red_cards: parseNum(finaleResultData.f34_red_cards),
        f34_penalties: parseNum(finaleResultData.f34_penalties),
        total_points: 0
      };

      const { error: masterErr } = await supabase.from('final_match_predictions').upsert(officialPayload, { onConflict: 'user_id' });
      if (masterErr) throw masterErr;

      const { data: allUsersPredictions } = await supabase.from('final_match_predictions').select('*').not('user_id', 'eq', '00000000-0000-0000-0000-000000000000');
      
      let logsReport = `📊 *RELAZIONE DI CALCOLO PUNTI JACKPOT INDIPENDENTE* 📊\n\n`;

      if (allUsersPredictions && allUsersPredictions.length > 0) {
        for (const pred of allUsersPredictions) {
          let sundayPoints = scoreSingleMatch(pred, officialPayload, true);
          let saturdayPoints = scoreSingleMatch(pred, officialPayload, false);

          const computedTotal = sundayPoints + saturdayPoints;
          await supabase.from('final_match_predictions').update({ total_points: computedTotal }).eq('user_id', pred.user_id);

          const prof = profiles.find(p => p.id === pred.user_id);
          logsReport += `- *${prof ? prof.username : 'ID ' + pred.user_id.substring(0,6)}*: ${computedTotal} PT Totali (Sabato: ${saturdayPoints} pt | Domenica: ${sundayPoints} pt)\n`;
        }
      } else {
        logsReport += `⚠️ Nessuna schedina inserita dagli utenti fino a questo momento.`;
      }

      setFinaleReportText(logsReport);
      toast.success('Risultati salvati e Classifica Super Jackpot ricalcolata!', { id: toastId });
      fetchData();
    } catch(e: any) {
      toast.error('Errore durante l\'aggiornamento: ' + e.message, { id: toastId });
    }
  };

  const addScorer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScorerName.trim() || !newScorerTeam) return toast.error('Compila tutti i campi');
    
    const cleanName = newScorerName.trim();
    const existingScorer = topScorers.find(s => s.name.toLowerCase() === cleanName.toLowerCase());

    if (existingScorer) {
      await updateScorerGoals(existingScorer.id, existingScorer.goals, 1);
      setNewScorerName('');
      setNewScorerTeam('');
      toast.success('Giocatore già in lista, aggiunto +1 gol!');
      return;
    }

    const { data, error } = await supabase.from('top_scorers').insert([{ name: cleanName, team_code: newScorerTeam, goals: 1 }]).select();
    if (error) {
      toast.error('Errore durante l\'aggiunta');
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

  const closeGroupStage = async () => {
    if (!window.confirm('Vuoi calcolare e assegnare i punti per i Gironi e Match con più/meno gol?')) return;
    const toastId = toast.loading('Calcolo bonus gironi...');
    
    try {
        let maxMatchGoals = -1;
        let topMatches: string[] = [];
        const gGoals: Record<string, number> = {};
        GROUPS.forEach(g => gGoals[g] = 0);

        matches?.forEach(m => {
            if (!m.is_finished) return;
            const goals = (m.home_score_final || 0) + (m.away_score_final || 0);
            
            if (goals > maxMatchGoals) { 
                maxMatchGoals = goals; 
                topMatches = [`${m.home_team} - ${m.away_team}`]; 
            } else if (goals === maxMatchGoals && goals >= 0) { 
                topMatches.push(`${m.home_team} - ${m.away_team}`); 
            }

            const homeFormatted = formatMatchName(m.home_team).toLowerCase();
            const groupObj = TOURNAMENT_GROUPS.find(gr => gr.teams.some(t => t.toLowerCase() === homeFormatted));
            if (groupObj) { gGoals[groupObj.name] += goals; }
        });

        let maxGroupGoals = -1;
        let minGroupGoals = 999;
        let topGroups: string[] = [];
        let bottomGroups: string[] = [];

        if (matches && matches.length > 0) {
            Object.entries(gGoals).forEach(([g, goals]) => {
                if (goals > 0 || matches.some(m => m.is_finished)) {
                  if (goals > maxGroupGoals) { maxGroupGoals = goals; topGroups = [g]; }
                  else if (goals === maxGroupGoals) { topGroups.push(g); }

                  if (goals < minGroupGoals) { minGroupGoals = goals; bottomGroups = [g]; }
                  else if (goals === minGroupGoals) { bottomGroups.push(g); }
                }
            });
        }

        const computedHighMatch = topMatches.length > 0 ? topMatches.join(', ') : null;
        const computedHighGroup = topGroups.length > 0 ? topGroups.join(', ') : null;
        const computedLowGroup = bottomGroups.length > 0 ? bottomGroups.join(', ') : null;

        await supabase.from('official_bonuses').update({
            high_scoring_match: computedHighMatch,
            highest_scoring_group: computedHighGroup,
            lowest_scoring_group: computedLowGroup
        }).eq('id', '00000000-0000-0000-0000-000000000000');

        toast.success('Bonus Gironi salvati! Ricalcolo...', { id: toastId });
        await syncLeaderboard(false);
    } catch (err: any) {
        toast.error('Errore: ' + err.message, { id: toastId });
    }
  };

  const syncLeaderboard = async (isManual = true) => {
    if (isManual && !window.confirm('Ricalcolare punti e spareggi per tutti?')) return;
    setSyncing(true);
    const syncToast = !isManual ? toast.loading('Sincronizzazione Classifica Generale...') : null;
    
    try {
      const [{ data: allMatches }, { data: offBonuses }, { data: offBracket }] = await Promise.all([
        supabase.from('matches').select('*').eq('is_finished', true),
        supabase.from('official_bonuses').select('*').maybeSingle(),
        supabase.from('official_bracket').select('*'), 
      ]);
      
      const profs = await fetchAllRecords('profiles', 'id');
      const allPreds = await fetchAllRecords('predictions', 'user_id', 'match_id');
      const userBrackets = await fetchAllRecords('brackets', 'user_id', 'stage', 'team_name');
      const userBonuses = await fetchAllRecords('user_bonus_answers', 'user_id');

      if (!profs || profs.length === 0) return;

      const finishedMatchesCount = allMatches?.length || 0;
      const maxGroupPoints = finishedMatchesCount * 10;
      
      let maxBracketPoints = 0;
      offBracket?.forEach(ob => {
         const uS = normalizeStage(ob.stage);
         maxBracketPoints += STAGES.find(s => s.id === uS)?.pts || 0;
      });

      const isGroupsClosed = offBonuses && offBonuses.high_scoring_match && offBonuses.high_scoring_match !== 'TBD' && offBonuses.high_scoring_match.trim() !== '';
      const isTournamentClosed = offBonuses && offBonuses.mvp_world_cup && offBonuses.mvp_world_cup !== 'TBD' && offBonuses.mvp_world_cup.trim() !== '';

      let maxBonusPoints = 0;
      if (offBonuses) {
         if (isGroupsClosed) maxBonusPoints += 15;
         if (isTournamentClosed) maxBonusPoints += 39;
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
            
            const sMatch = pR === mR;
            const gMatch = ph === mh || pa === ma;

            if (ph === mh && pa === ma) { pG += 10; pEx += 1; }
            else if (sMatch && gMatch) pG += 6;
            else if (sMatch && !gMatch) pG += 4;
            else if (!sMatch && gMatch) pG += 2;
          }
        });

        const uBrackets = userBrackets?.filter(b => b.user_id === profile.id) || [];
        const seenBracketMatches = new Set();
        
        uBrackets.forEach(ub => {
          const uS = normalizeStage(ub.stage);
          const cleanT = cleanString(ub.team_name);
          const uniqueKey = `${uS}-${cleanT}`;

          if (offBracket?.some(ob => normalizeStage(ob.stage) === uS && cleanString(ob.team_name) === cleanT)) {
            if (!seenBracketMatches.has(uniqueKey)) {
              seenBracketMatches.add(uniqueKey);
              const pts = STAGES.find(s => s.id === uS)?.pts || 0;
              pB += pts;
              if (uS === 'WINNER') sW += pts; else if (uS === 'F') sF += pts; else if (uS === 'SF') sSF += pts; else if (uS === 'QF') sQF += pts; else if (uS === 'R16') sR16 += pts; else if (uS === 'R32') sR32 += pts;
            }
          }
        });

        const ub = userBonuses?.find(b => b.user_id === profile.id);
        if (ub && offBonuses) {
          const bMap: any = {};
          if (isGroupsClosed) {
              bMap.high_scoring_match = 5;
              bMap.highest_scoring_group = 5;
              bMap.lowest_scoring_group = 5;
          }
          if (isTournamentClosed) {
              bMap.top_scorer = 10;
              bMap.mvp_world_cup = 10;
              bMap.best_goalkeeper = 10;
              bMap.total_red_cards = 3;
              bMap.total_penalties = 3;
              bMap.total_own_goals = 3;
          }

          Object.entries(bMap).forEach(([k, pts]: any) => { 
            if (offBonuses[k] != null && String(offBonuses[k]).trim() !== '' && String(offBonuses[k]).trim() !== 'TBD' && ub[k] != null && String(ub[k]).trim() !== '') {
              const offValues = String(offBonuses[k]).split(',').map(v => cleanString(v));
              const uVal = cleanString(String(ub[k]));
              if (offValues.includes(uVal)) pBon += pts; 
            }
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
        if (b.pts_r32 !== a.pts_r32) return b.pts_r32 - a.pts_r32;
        if (b.pts_r16 !== a.pts_r16) return b.pts_r16 - a.pts_r16; 
        if (b.pts_qf !== a.pts_qf) return b.pts_qf - a.pts_qf;
        if (b.pts_sf !== a.pts_sf) return b.pts_sf - a.pts_sf; 
        if (b.pts_f !== a.pts_f) return b.pts_f - a.pts_f; 
        if (b.pts_winner !== a.pts_winner) return b.pts_winner - a.pts_winner;
        return (a.username || '').localeCompare(b.username || ' ');
      });

      const ranked = sorted.map((u, i) => ({ ...u, ranking: (i + 1).toString() }));
      for (const p of ranked) {
        await supabase.from('profiles').upsert(p, { onConflict: 'id' });
      }
      
      if (syncToast) toast.dismiss(syncToast);
      toast.success(isManual ? 'Punti ricalcolati per la Classifica Generale!' : 'Classifica Generale sincronizzata! 🏆');
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

  const getFullBonusPayload = () => ({
      id: '00000000-0000-0000-0000-000000000000', 
      total_red_cards: bonusData.red ? parseInt(bonusData.red) : null, 
      total_penalties: bonusData.penalties ? parseInt(bonusData.penalties) : null, 
      total_own_goals: bonusData.own_goals ? parseInt(bonusData.own_goals) : null, 
      top_scorer: bonusData.top.trim() || null, 
      mvp_world_cup: bonusData.mvp_world_cup.trim() || null, 
      best_goalkeeper: bonusData.best_goalkeeper.trim() || null
  });

  const saveLiveStats = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('official_bonuses').upsert(getFullBonusPayload(), { onConflict: 'id' });
    if (!error) toast.success('Statistiche aggiornate sulla Dashboard!');
  };

  const saveEndTournamentBonuses = async () => {
    if (!bonusData.mvp_world_cup) {
       toast.error('Per chiudere il torneo devi inserire almeno l\'MVP!');
       return;
    }
    if (window.confirm('Chiudere il Mondiale e assegnare tutti i punti per MVP, Capocannoniere, Portiere, Rossi, Rigori e Autogol?')) {
       const toastId = toast.loading('Salvataggio e ricalcolo in corso...');
       const { error } = await supabase.from('official_bonuses').upsert(getFullBonusPayload(), { onConflict: 'id' });
       if (!error) {
           await syncLeaderboard(false);
           toast.success('Torneo Chiuso! Punti assegnati!', { id: toastId });
       } else {
           toast.error('Errore: ' + error.message, { id: toastId });
       }
    }
  };

  const resetBonuses = async () => { 
    if (window.confirm('Svuotare TUTTI i bonus e le statistiche ufficiali? I punteggi verranno ricalcolati.')) { 
      const payload = { id: '00000000-0000-0000-0000-000000000000', total_red_cards: null, total_penalties: null, total_own_goals: null, top_scorer: null, mvp_world_cup: null, best_goalkeeper: null, high_scoring_match: null, highest_scoring_group: null, lowest_scoring_group: null };
      const { error } = await supabase.from('official_bonuses').upsert(payload, { onConflict: 'id' }); 
      if (!error) {
        toast.success('Tutto azzerato con successo!');
        setBonusData({ red: '', top: '', penalties: '', own_goals: '', mvp_world_cup: '', best_goalkeeper: '', high: '', high_group: '', low_group: '' }); 
        await syncLeaderboard(false); 
      } else {
        toast.error('Errore durante il reset: ' + error.message);
      }
    } 
  };

  const saveQualif = async () => {
    if (qTeam && qStage && qSlot) { 
      const existing = officialBracket.find(ob => ob.stage === qSlot);
      if (existing) {
         toast.error('Questo slot è già occupato! Rimuovi prima la squadra attuale.');
         return;
      }
      
      const { error } = await supabase.from('official_bracket').insert([{ stage: qSlot, team_name: qTeam }]); 
      if (!error) { 
        toast.success('Tabellone aggiornato!'); 
        await syncLeaderboard(false); 
      } else {
        toast.error('Errore nel salvataggio');
      }
    } else {
      toast.error('Seleziona Squadra, Fase e Slot!');
    }
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

  const deleteUser = async (uId: string, name: string) => { if (window.confirm(`Eliminare ${name}?`)) { await supabase.from('predictions').delete().eq('user_id', uId); await supabase.from('brackets').delete().eq('user_id', uId); await supabase.from('user_bonus_answers').delete().eq('user_id', uId); await supabase.from('profiles').delete().eq('id', uId); fetchData(); await syncLeaderboard(false); } };
  
  const handleResetPassword = async (uId: string, username: string) => {
    const newPassword = prompt(`Inserisci una nuova password temporanea per ${username} (min 6 caratteri):`);
    if (!newPassword) return; 
    if (newPassword.length < 6) { toast.error('La password deve avere almeno 6 caratteri'); return; }
    const toastId = toast.loading('Resettando la password...');
    try {
      const res = await fetch('/api/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uId, newPassword }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success(`Password di ${username} aggiornata!`, { id: toastId });
    } catch (err: any) { toast.error(err.message, { id: toastId }); }
  };

  const getWinnerStats = () => {
    const winners = allBrackets.filter(b => normalizeStage(b.stage) === 'WINNER' && b.team_name);
    const total = winners.length;
    if (total === 0) return [];
    const counts: any = {};
    winners.forEach(w => { 
      const t = formatTeamName(w.team_name);
      counts[t] = (counts[t] || 0) + 1; 
    });
    return Object.entries(counts).sort((a: any, b: any) => b[1] - a[1]).map(([name, count]) => ({ name, count, pct: Math.round((Number(count) / total) * 100) }));
  };

  const getAverage = (k: string) => { 
    const v = allUserBonuses.filter(b => b[k] != null && String(b[k]).trim() !== '').map(b => Number(b[k])).filter(n => !isNaN(n)); 
    if (!v.length) return '0';
    return (v.reduce((a, b) => a + b, 0) / v.length).toLocaleString('it-IT', { maximumFractionDigits: 1 }); 
  };

  const getTopPicks = (k: string) => { 
    const counts: any = {}; 
    allUserBonuses.forEach(b => { 
      if (b[k]) { 
        const v = b[k].trim().toUpperCase(); 
        counts[v] = (counts[v] || 0) + 1; 
      } 
    }); 
    return Object.entries(counts).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3); 
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
        pred.user_id === p.id && pred.home_score !== null && String(pred.home_score).trim() !== '' && pred.away_score !== null && String(pred.away_score).trim() !== ''
      ).length;
      const uBracks = allBrackets.filter(b => b.user_id === p.id && b.team_name && b.team_name.trim() !== '').length;
      let uBonus = 0;
      const bRow = allUserBonuses.find(b => b.user_id === p.id);
      if (bRow) {
        ['total_red_cards', 'top_scorer', 'high_scoring_match', 'total_penalties', 'total_own_goals', 'highest_scoring_group', 'lowest_scoring_group', 'mvp_world_cup', 'best_goalkeeper'].forEach(f => {
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

  const copyPrizesReport = () => {
    const sorted = [...profiles].sort((a, b) => parseInt(a.ranking || '999') - parseInt(b.ranking || '999'));
    let awardedUserIds = new Set();
    const results: any = {};

    const assignPrize = (key: string, sortFn: (a: any, b: any) => number, filterFn?: (u: any) => boolean) => {
      let eligible = sorted.filter(u => !awardedUserIds.has(u.id));
      if (filterFn) eligible = eligible.filter(filterFn);
      if (eligible.length === 0) return;
      const specificSorted = [...eligible].sort(sortFn);
      const winner = specificSorted[0];
      if (winner) {
        awardedUserIds.add(winner.id);
        results[key] = winner;
      }
    };

    const genSort = (a: any, b: any) => parseInt(a.ranking || '999') - parseInt(b.ranking || '999');
    const girSort = (a: any, b: any) => {
      if (b.points_groups !== a.points_groups) return (b.points_groups || 0) - (a.points_groups || 0);
      if (a.ranking !== b.ranking) return parseInt(a.ranking || '999') - parseInt(b.ranking || '999'); 
      return (b.points_bracket || 0) - (a.points_bracket || 0); 
    };
    const brackSort = (a: any, b: any) => {
      if (b.points_bracket !== a.points_bracket) return (b.points_bracket || 0) - (a.points_bracket || 0);
      if (a.ranking !== b.ranking) return parseInt(a.ranking || '999') - parseInt(b.ranking || '999'); 
      return (b.points_groups || 0) - (a.points_groups || 0); 
    };
    const bonusSort = (a: any, b: any) => {
      if (b.points_bonus !== a.points_bonus) return (b.points_bonus || 0) - (a.points_bonus || 0);
      if (a.ranking !== b.ranking) return parseInt(a.ranking || '999') - parseInt(b.ranking || '999'); 
      return (b.points_groups || 0) - (a.points_groups || 0); 
    };
    const cecchSort = (a: any, b: any) => {
      if (b.exact_matches !== a.exact_matches) return (b.exact_matches || 0) - (a.exact_matches || 0);
      return parseInt(a.ranking || '999') - parseInt(b.ranking || '999'); 
    };
    const zeroSort = (a: any, b: any) => {
      if (a.ranking !== b.ranking) return parseInt(b.ranking || '999') - parseInt(a.ranking || '999');
      return (a.points_bracket || 0) - (b.points_bracket || 0);
    };

    assignPrize('gen1', genSort); assignPrize('gen2', genSort); assignPrize('gen3', genSort); assignPrize('gen4', genSort); assignPrize('gen5', genSort); 
    assignPrize('gir', girSort); assignPrize('playoff', brackSort); assignPrize('bonus', bonusSort); assignPrize('cecchino', cecchSort); 
    assignPrize('gen6', genSort); assignPrize('gen7', genSort); assignPrize('gen8', genSort); 
    assignPrize('zero', zeroSort, (u) => u.exact_matches === 0 || u.exact_matches === null); 

    let report = `🏆 *VINCITORI PREMI MONDIALE 2026* 🏆\n\n`;
    report += `👑 *CLASSIFICA GENERALE*\n`;
    report += `1° Premio: *${results.gen1?.username || 'N/D'}*\n2° Premio: *${results.gen2?.username || 'N/D'}*\n3° Premio: *${results.gen3?.username || 'N/D'}*\n`;
    report += `4° Premio: *${results.gen4?.username || 'N/D'}*\n5° Premio: *${results.gen5?.username || 'N/D'}*\n6° Premio: *${results.gen6?.username || 'N/D'}*\n`;
    report += `7° Premio: *${results.gen7?.username || 'N/D'}*\n8° Premio: *${results.gen8?.username || 'N/D'}*\n`;
    report += `\n📊 *PREMI PER FASE*\n🏟️ Re dei Gironi: *${results.gir?.username || 'N/D'}*\n⚡ Mago dei Playoff: *${results.playoff?.username || 'N/D'}*\n🔮 Oracolo dei Bonus: *${results.bonus?.username || 'N/D'}*\n`;
    report += `\n🎯 *SPECIALITÀ E GOLIARDICI*\n🎯 Il Cecchino: *${results.cecchino?.username || 'N/D'}*\n👁️ Il Veggente: *(Verifica Manuale Jackpot)*\n🧊 Zero Assoluto: *${results.zero?.username || 'N/D'}*\n`;

    navigator.clipboard.writeText(report);
    toast.success('Report Premi Ottimizzato e Copiato! 🏆', { icon: '🎁' });
  };

  const copyClassificaReport = () => {
    const sorted = [...profiles].sort((a, b) => (parseInt(a.ranking || '999') - parseInt(b.ranking || '999')));
    let text = `🏆 *CLASSIFICA MONDIALE 2026* 🏆\n\n`;
    sorted.forEach((p, i) => {
        let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⚽';
        text += `${medal} *${p.ranking}. ${p.username}* - ${p.points} pt\n`;
    });
    navigator.clipboard.writeText(text);
    toast.success('Classifica copiata per WhatsApp! 📱', { icon: '💬' });
  };

  const copyCompletionReport = () => {
    const stats = getCompletionStats();
    let text = `📋 *STATO COMPLETAMENTO PRONOSTICI* 📋\n\n`;
    stats.forEach(u => {
      text += `👤 *${u.username}* (${u.pct}%) ${u.pct === 100 ? '✅' : '❌'}\n`;
    });
    navigator.clipboard.writeText(text);
    toast.success('Stato completamento copiato! 📋', { icon: '📋' });
  };

  const copyWinnerReport = () => {
    const winners = getWinnerStats();
    let text = `🏆 *CHI VINCERÀ IL MONDIALE?* 🏆\n\n`;
    winners.forEach(w => { text += `${getEmoji(w.name)} *${w.name}:* ${w.pct}% (${w.count} voti)\n`; });
    navigator.clipboard.writeText(text);
    toast.success('Statistiche Vincitore copiate! 🏆', { icon: '💬' });
  };

  const copyCecchiniReport = () => {
    const userStats = profiles.map(p => {
      const exactMatches: string[] = [];
      const uPreds = predictions.filter(pred => pred.user_id === p.id);
      uPreds.forEach(pred => {
        const m = matches.find(match => match.id === pred.match_id && match.is_finished);
        if (m && m.home_score_final !== null && m.away_score_final !== null) {
          if (Number(pred.home_score) === Number(m.home_score_final) && Number(pred.away_score) === Number(m.away_score_final)) {
            exactMatches.push(`${getEmoji(m.home_team)} ${formatTeamName(m.home_team)} ${m.home_score_final}-${m.away_score_final} ${formatTeamName(m.away_team)} ${getEmoji(m.away_team)}`);
          }
        }
      });
      return { username: p.username, count: exactMatches.length, matches: exactMatches };
    }).sort((a, b) => b.count - a.count);

    let text = `🎯 *CLASSIFICA CECCHINI* 🎯\n\n`;
    userStats.forEach((u, i) => {
        let medal = u.count === 0 ? '🧊' : i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
        text += `${medal} *${u.username}*: ${u.count} esatti\n`;
    });
    navigator.clipboard.writeText(text);
    toast.success('Classifica Cecchini copiata! 🎯', { icon: '🎯' });
  };

  const copyBonusReport = () => {
    let text = `📊 *LE PREVISIONI BONUS DEL GRUPPO* 📊\n\n`;
    const fields = [
      { l: '✨ MVP MONDIALE', k: 'mvp_world_cup', type: 'PLAYER' },
      { l: '⚽ CAPOCANNONIERE', k: 'top_scorer', type: 'PLAYER' },
      { l: '🧤 MIGLIOR PORTIERE', k: 'best_goalkeeper', type: 'PLAYER' }
    ];
    fields.forEach(f => {
      const details = getBonusDetails(f.k);
      if (details.length > 0) {
        text += `*${f.l}:*\n`;
        details.forEach(d => { text += `- *${formatMatchName(d.originalName)}* (${d.count} voti)\n`; });
        text += `\n`;
      }
    });
    navigator.clipboard.writeText(text);
    toast.success('Statistiche Bonus copiate! 📊', { icon: '💬' });
  };

  const exportClassificaCSV = () => {
    const sortedProfiles = [...profiles].sort((a, b) => (parseInt(a.ranking || '999') - parseInt(b.ranking || '999')));
    const headers = ["Username", "Nome Completo", "Punti Totali", "Stato Pagamento", "Metodo Di Pagamento"];
    let csvContent = headers.map(h => `"${h}"`).join(';') + "\n";
    sortedProfiles.forEach(p => {
      const row = [p.username || '', p.full_name || '', p.points || 0, p.is_paid ? 'PAGATO' : 'DA PAGARE', p.payment_method || '--'].map(val => `"${val}"`).join(';');
      csvContent += row + "\n";
    });
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `classifica_mondiale_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Backup CSV Scaricato!');
  };

  const copyWhatsAppReport = () => {
    if (profiles.length === 0) return toast.error('Nessuno in classifica!');
    const sorted = [...profiles].sort((a, b) => (parseInt(a.ranking || '999') - parseInt(b.ranking || '999')));
    let text = `🏆 *CLASSIFICA MONDIALE 2026 - IN TEMPO REALE* 🏆\n\n`;
    sorted.slice(0, 10).forEach((p, i) => {
      let medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⚽';
      text += `${medal} *${p.ranking}. ${p.username}* - ${p.points} pt\n`;
    });
    navigator.clipboard.writeText(text);
    toast.success('Bollettino copiato! Incollalo su WhatsApp 📱', { icon: '💬' });
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
  const paymentGroups = [
    { label: '⏳ DA PAGARE', users: profiles.filter(p => !p.is_paid), color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: '💙 SATISPAY', users: profiles.filter(p => p.is_paid && p.payment_method === 'Satispay'), color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: '🔵 PAYPAL', users: profiles.filter(p => p.is_paid && p.payment_method === 'PayPal'), color: 'text-sky-500', bg: 'bg-sky-500/10' },
    { label: '💵 CONTANTI', users: profiles.filter(p => p.is_paid && p.payment_method === 'Contanti'), color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: '🏦 BONIFICO', users: profiles.filter(p => p.is_paid && p.payment_method === 'Bonifico'), color: 'text-indigo-400', bg: 'bg-indigo-500/10' }
  ].filter(g => g.users.length > 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-40 font-sans overflow-x-hidden relative">
      <button onClick={() => router.push('/profile')} className="absolute top-6 left-4 text-slate-500 hover:text-yellow-500 transition-colors flex items-center gap-1.5 font-black uppercase text-[10px] tracking-widest z-10">
        <ArrowLeft size={16} /> Indietro
      </button>

      <header className="flex flex-col items-center mb-8 pt-4 mt-8 sm:mt-4 relative">
        <h1 className="text-4xl font-black text-yellow-500 italic uppercase tracking-tighter leading-none mb-6">Control Tower</h1>
        
        {/* BOTTONI WHATSAPP E RICALCOLO RIPRISTINATI */}
        <div className="absolute right-2 top-0 flex items-center gap-2">
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

        <div className="w-full max-w-2xl bg-slate-900/80 p-4 rounded-3xl border border-slate-800 shadow-xl grid grid-cols-2 gap-3">
            <button onClick={copyClassificaReport} className="flex items-center justify-center gap-1.5 px-3 py-3 text-[10px] sm:text-xs font-black bg-slate-950 border border-slate-800 hover:bg-emerald-500/10 rounded-xl text-emerald-500"><MessageCircle size={14} /> Classifica</button>
            <button onClick={copyPrizesReport} className="flex items-center justify-center gap-1.5 px-3 py-3 text-[10px] sm:text-xs font-black bg-slate-950 border border-yellow-500/30 hover:bg-yellow-500/10 rounded-xl text-yellow-500"><Gift size={14} /> Premi</button>
            <button onClick={copyCompletionReport} className="flex items-center justify-center gap-1.5 px-3 py-3 text-[10px] sm:text-xs font-black bg-slate-950 border border-slate-800 hover:bg-slate-800/50 rounded-xl text-slate-400"><MessageCircle size={14} /> Stato</button>
            <button onClick={copyWinnerReport} className="flex items-center justify-center gap-1.5 px-3 py-3 text-[10px] sm:text-xs font-black bg-slate-950 border border-slate-800 hover:bg-blue-400/10 rounded-xl text-blue-400"><MessageCircle size={14} /> Vincitore</button>
            <button onClick={copyCecchiniReport} className="flex items-center justify-center gap-1.5 px-3 py-3 text-[10px] sm:text-xs font-black bg-slate-950 border border-slate-800 hover:bg-rose-400/10 rounded-xl text-rose-400"><MessageCircle size={14} /> Cecchini</button>
            <button onClick={copyBonusReport} className="flex items-center justify-center gap-1.5 px-3 py-3 text-[10px] sm:text-xs font-black bg-slate-950 border border-slate-800 hover:bg-purple-400/10 rounded-xl text-purple-400"><MessageCircle size={14} /> Dati Bonus</button>
            <button onClick={exportClassificaCSV} className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-3 text-[10px] sm:text-xs font-black bg-slate-950 border border-slate-800 hover:bg-cyan-400/10 rounded-xl text-cyan-400"><Download size={14} /> Excel Backup Completo</button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto space-y-5">
        
        {/* ----- SEZIONE: LA FINALE (SUPER JACKPOT ESTESO) ----- */}
        <section className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-2xl border-l-4 border-l-yellow-500">
          <button onClick={() => setOpenSection({ ...openSection, laFinale: !openSection.laFinale })} className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30">
            <div className="flex items-center gap-3"><Trophy className="text-yellow-500" size={24} /><h2 className="text-lg font-black uppercase italic tracking-tight">LA FINALE — MINI GAME</h2></div>
            {openSection.laFinale ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {openSection.laFinale && (
            <div className="p-5 bg-slate-950/30 space-y-6">
              
              {/* INTERRUTTORE POPUP */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between shadow-inner">
                <div className="flex flex-col pr-4">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-200">Stato Finestre di Gioco</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase mt-1">Sblocca o blocca la compilazione per gli utenti</span>
                </div>
                <button type="button" onClick={toggleFinaleStatus} className={`px-4 py-2.5 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all shrink-0 border ${isFinaleActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-md' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                  {isFinaleActive ? '✓ ATTIVA (POP-UP ON)' : '❌ DISATTIVATA'}
                </button>
              </div>

              {/* NAVIGAZIONE SUB-TAB PARTITE ADMIN */}
              <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button type="button" onClick={() => setActiveFinaleAdminTab('SUNDAY')} className={`flex-1 py-2 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeFinaleAdminTab === 'SUNDAY' ? 'bg-yellow-500 text-slate-950 shadow-md' : 'text-slate-500 hover:text-white'}`}>
                  <Trophy size={14}/> 🏆 Finalissima (Domenica)
                </button>
                <button type="button" onClick={() => setActiveFinaleAdminTab('SATURDAY')} className={`flex-1 py-2 rounded-lg font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeFinaleAdminTab === 'SATURDAY' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}>
                  <Medal size={14}/> 🥉 3°/4° Posto (Sabato)
                </button>
              </div>

              {/* FORM IMPUTAZIONI DATI REALI */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col gap-4 shadow-inner">
                
                {activeFinaleAdminTab === 'SUNDAY' ? (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <h4 className="text-[10px] text-yellow-500 font-black uppercase tracking-widest text-center border-b border-slate-800 pb-2">Inserimento Reale: Finalissima 1°/2° Posto</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Gol Casa Finali</span>
                        <input value={finaleResultData.home_score} onChange={e => setFinaleResultData({...finaleResultData, home_score: e.target.value})} type="number" placeholder="0" className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-black text-white text-center outline-none" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Gol Ospiti Finali</span>
                        <input value={finaleResultData.away_score} onChange={e => setFinaleResultData({...finaleResultData, away_score: e.target.value})} type="number" placeholder="0" className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-black text-white text-center outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {['REGULAR', 'OVERTIME', 'PENALTIES'].map(m => (
                        <button key={m} type="button" onClick={() => setFinaleResultData({ ...finaleResultData, ending_method: m })} className={`py-2 text-[9px] font-black uppercase rounded-lg border ${finaleResultData.ending_method === m ? 'bg-yellow-500 text-slate-950 border-yellow-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'}`}>{m === 'REGULAR' ? '90\'' : m === 'OVERTIME' ? 'Suppl.' : 'Rigori'}</button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Esatto 1° Tempo (Es. 1-0)</span>
                        <div className="flex gap-1"><input value={finaleResultData.f12_ht_home_score} onChange={e => setFinaleResultData({...finaleResultData, f12_ht_home_score: e.target.value})} type="number" placeholder="0" className="w-1/2 bg-slate-950 border border-slate-800 p-2 rounded-xl text-center font-black" /><input value={finaleResultData.f12_ht_away_score} onChange={e => setFinaleResultData({...finaleResultData, f12_ht_away_score: e.target.value})} type="number" placeholder="0" className="w-1/2 bg-slate-950 border border-slate-800 p-2 rounded-xl text-center font-black" /></div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Esatto 2° Tempo (Es. 0-1)</span>
                        <div className="flex gap-1"><input value={finaleResultData.f12_2nd_home_score} onChange={e => setFinaleResultData({...finaleResultData, f12_2nd_home_score: e.target.value})} type="number" placeholder="0" className="w-1/2 bg-slate-950 border border-slate-800 p-2 rounded-xl text-center font-black" /><input value={finaleResultData.f12_2nd_away_score} onChange={e => setFinaleResultData({...finaleResultData, f12_2nd_away_score: e.target.value})} type="number" placeholder="0" className="w-1/2 bg-slate-950 border border-slate-800 p-2 rounded-xl text-center font-black" /></div>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-slate-800/60">
                      <input value={finaleResultData.f12_mvp} onChange={e => setFinaleResultData({...finaleResultData, f12_mvp: e.target.value})} type="text" placeholder="MVP FIFA UFFICIALE" className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-black uppercase text-center focus:border-yellow-500 outline-none" />
                      <div className="grid grid-cols-2 gap-2">
                        <input value={finaleResultData.f12_first_to_score} onChange={e => setFinaleResultData({...finaleResultData, f12_first_to_score: e.target.value})} type="text" placeholder="SQUADRA 1° GOL" className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-black uppercase text-center outline-none" />
                        <input value={finaleResultData.f12_scorer} onChange={e => setFinaleResultData({...finaleResultData, f12_scorer: e.target.value})} type="text" placeholder="MARCATORE MATCH" className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-black uppercase text-center outline-none" />
                      </div>
                      <input value={finaleResultData.first_goal_minute} onChange={e => setFinaleResultData({...finaleResultData, first_goal_minute: e.target.value})} type="number" placeholder="MINUTO 1° GOL (TIE-BREAKER)" className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-black text-center focus:border-yellow-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800/60 text-center text-[8px] font-black text-slate-400">
                      <div><span>Falli</span><input value={finaleResultData.f12_fouls} onChange={e => setFinaleResultData({...finaleResultData, f12_fouls: e.target.value})} type="number" placeholder="20" className="w-full bg-slate-950 p-2 mt-1 rounded-lg font-black text-center text-white" /></div>
                      <div><span>🟨 Gialli</span><input value={finaleResultData.f12_yellow_cards} onChange={e => setFinaleResultData({...finaleResultData, f12_yellow_cards: e.target.value})} type="number" placeholder="4" className="w-full bg-slate-950 p-2 mt-1 rounded-lg font-black text-center text-white" /></div>
                      <div><span>🟥 Rossi</span><input value={finaleResultData.f12_red_cards} onChange={e => setFinaleResultData({...finaleResultData, f12_red_cards: e.target.value})} type="number" placeholder="0" className="w-full bg-slate-950 p-2 mt-1 rounded-lg font-black text-center text-white" /></div>
                      <div><span>🥅 Rigori</span><input value={finaleResultData.f12_penalties} onChange={e => setFinaleResultData({...finaleResultData, f12_penalties: e.target.value})} type="number" placeholder="0" className="w-full bg-slate-950 p-2 mt-1 rounded-lg font-black text-center text-white" /></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <h4 className="text-[10px] text-amber-500 font-black uppercase tracking-widest text-center border-b border-slate-800 pb-2">Inserimento Reale: Finale 3°/4° Posto</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Gol Casa Finali</span>
                        <input value={finaleResultData.f34_home_score} onChange={e => setFinaleResultData({...finaleResultData, f34_home_score: e.target.value})} type="number" placeholder="0" className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-black text-white text-center outline-none" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Gol Ospiti Finali</span>
                        <input value={finaleResultData.f34_away_score} onChange={e => setFinaleResultData({...finaleResultData, f34_away_score: e.target.value})} type="number" placeholder="0" className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-black text-white text-center outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {['REGULAR', 'OVERTIME', 'PENALTIES'].map(m => (
                        <button key={m} type="button" onClick={() => setFinaleResultData({ ...finaleResultData, f34_ending_method: m })} className={`py-2 text-[9px] font-black uppercase rounded-lg border ${finaleResultData.f34_ending_method === m ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-950 text-slate-400 border-slate-800'}`}>{m === 'REGULAR' ? '90\'' : m === 'OVERTIME' ? 'Suppl.' : 'Rigori'}</button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Esatto 1° Tempo</span>
                        <div className="flex gap-1"><input value={finaleResultData.f34_ht_home_score} onChange={e => setFinaleResultData({...finaleResultData, f34_ht_home_score: e.target.value})} type="number" placeholder="0" className="w-1/2 bg-slate-950 border border-slate-800 p-2 rounded-xl text-center font-black" /><input value={finaleResultData.f34_ht_away_score} onChange={e => setFinaleResultData({...finaleResultData, f34_ht_away_score: e.target.value})} type="number" placeholder="0" className="w-1/2 bg-slate-950 border border-slate-800 p-2 rounded-xl text-center font-black" /></div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase">Esatto 2° Tempo</span>
                        <div className="flex gap-1"><input value={finaleResultData.f34_2nd_home_score} onChange={e => setFinaleResultData({...finaleResultData, f34_2nd_home_score: e.target.value})} type="number" placeholder="0" className="w-1/2 bg-slate-950 border border-slate-800 p-2 rounded-xl text-center font-black" /><input value={finaleResultData.f34_2nd_away_score} onChange={e => setFinaleResultData({...finaleResultData, f34_2nd_away_score: e.target.value})} type="number" placeholder="0" className="w-1/2 bg-slate-950 border border-slate-800 p-2 rounded-xl text-center font-black" /></div>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-slate-800/60">
                      <input value={finaleResultData.f34_mvp} onChange={e => setFinaleResultData({...finaleResultData, f34_mvp: e.target.value})} type="text" placeholder="MVP FIFA UFFICIALE" className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-black uppercase text-center focus:border-amber-500 outline-none" />
                      <div className="grid grid-cols-2 gap-2">
                        <input value={finaleResultData.f34_first_to_score} onChange={e => setFinaleResultData({...finaleResultData, f34_first_to_score: e.target.value})} type="text" placeholder="SQUADRA 1° GOL" className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-black uppercase text-center outline-none" />
                        <input value={finaleResultData.f34_scorer} onChange={e => setFinaleResultData({...finaleResultData, f34_scorer: e.target.value})} type="text" placeholder="MARCATORE MATCH" className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-black uppercase text-center outline-none" />
                      </div>
                      <input value={finaleResultData.f34_first_goal_minute} onChange={e => setFinaleResultData({...finaleResultData, f34_first_goal_minute: e.target.value})} type="number" placeholder="MINUTO 1° GOL" className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-black text-center focus:border-amber-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-800/60 text-center text-[8px] font-black text-slate-400">
                      <div><span>Falli</span><input value={finaleResultData.f34_fouls} onChange={e => setFinaleResultData({...finaleResultData, f34_fouls: e.target.value})} type="number" placeholder="18" className="w-full bg-slate-950 p-2 mt-1 rounded-lg font-black text-center text-white" /></div>
                      <div><span>🟨 Gialli</span><input value={finaleResultData.f34_yellow_cards} onChange={e => setFinaleResultData({...finaleResultData, f34_yellow_cards: e.target.value})} type="number" placeholder="3" className="w-full bg-slate-950 p-2 mt-1 rounded-lg font-black text-center text-white" /></div>
                      <div><span>🟥 Rossi</span><input value={finaleResultData.f34_red_cards} onChange={e => setFinaleResultData({...finaleResultData, f34_red_cards: e.target.value})} type="number" placeholder="0" className="w-full bg-slate-950 p-2 mt-1 rounded-lg font-black text-center text-white" /></div>
                      <div><span>🥅 Rigori</span><input value={finaleResultData.f34_penalties} onChange={e => setFinaleResultData({...finaleResultData, f34_penalties: e.target.value})} type="number" placeholder="0" className="w-full bg-slate-950 p-2 mt-1 rounded-lg font-black text-center text-white" /></div>
                    </div>
                  </div>
                )}

                <button type="button" onClick={handleSaveAndCalculateFinale} className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 py-4.5 mt-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95">
                  <Coins size={16}/> 🏆 Salva Risultati Ufficiali & Calcola Jackpot
                </button>
              </div>

              {/* BLOCCO DISPACCIO LOGS CALCOLATI */}
              {finaleReportText && (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col gap-3 shadow-md animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Log Ricalcolo Punti Erogati</span>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto custom-scrollbar bg-slate-950 p-3 rounded-xl border border-slate-800/60 shadow-inner">
                    {finaleReportText}
                  </pre>
                </div>
              )}

            </div>
          )}
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-2xl">
          <button onClick={() => setOpenSection({ ...openSection, annuncio: !openSection.annuncio })} className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30">
            <div className="flex items-center gap-3"><Megaphone className="text-blue-500" size={24} /><h2 className="text-lg font-black uppercase italic tracking-tight">Annuncio Globale</h2></div>
            {openSection.annuncio ? <ChevronUp /> : <ChevronDown />}
          </button>
          {openSection.annuncio && (
            <div className="p-5 bg-slate-950/30">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">Questo messaggio apparirà in cima al Profilo di tutti i giocatori.</p>
              <textarea value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="Es: LIVE: Stasera Brasile-Francia! Controllate i vostri risultati..." className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl font-bold text-sm text-white outline-none focus:border-blue-500 min-h-[100px] custom-scrollbar" />
              <div className="flex gap-4 pt-4">
                <button onClick={() => { setAnnouncement(''); saveAnnouncement(''); }} className="p-5 bg-slate-900 border border-slate-700 text-slate-500 hover:text-rose-500 rounded-2xl transition-colors"><Trash2 size={20} /></button>
                <button onClick={() => saveAnnouncement(announcement)} className="flex-1 bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black uppercase text-xs tracking-widest italic shadow-xl transition-all">Pubblica Annuncio</button>
              </div>
            </div>
          )}
        </section>

        {/* ----- SEZIONE 1: STATISTICHE LIVE ----- */}
        <section className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-2xl border-l-4 border-l-emerald-500">
          <button onClick={() => setOpenSection({ ...openSection, liveStats: !openSection.liveStats })} className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30">
            <div className="flex items-center gap-3"><Activity className="text-emerald-500" size={24} /><h2 className="text-lg font-black uppercase italic tracking-tight">Statistiche Live Dashboard</h2></div>
            {openSection.liveStats ? <ChevronUp /> : <ChevronDown />}
          </button>
          {openSection.liveStats && (
            <div className="p-5 bg-slate-950/30">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Questi dati aggiornano la Dashboard di tutti gli utenti, ma <strong className="text-rose-500">NON</strong> influenzeranno la classifica finché non chiuderai il Mondiale.</p>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest text-center">Autogol</span>
                    <input value={bonusData.own_goals} onChange={e => setBonusData({...bonusData, own_goals: e.target.value})} type="number" placeholder="0" className="bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black text-white text-xl text-center focus:border-emerald-500 outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest text-center">Rigori</span>
                    <input value={bonusData.penalties} onChange={e => setBonusData({...bonusData, penalties: e.target.value})} type="number" placeholder="0" className="bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black text-white text-xl text-center focus:border-emerald-500 outline-none" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest text-center">Rossi</span>
                    <input value={bonusData.red} onChange={e => setBonusData({...bonusData, red: e.target.value})} type="number" placeholder="0" className="bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black text-white text-xl text-center focus:border-emerald-500 outline-none" />
                  </div>
                </div>
                <button type="button" onClick={saveLiveStats} className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 mt-2 rounded-2xl font-black uppercase text-xs tracking-widest italic shadow-xl transition-all">SALVA E MOSTRA SULLA DASHBOARD</button>
              </form>
            </div>
          )}
        </section>

        {/* ----- SEZIONE 2: BONUS FINALI E CHIUSURA FASI ----- */}
        <section className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-2xl border-l-4 border-l-purple-500">
          <button onClick={() => setOpenSection({ ...openSection, bonus: !openSection.bonus })} className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30">
            <div className="flex items-center gap-3"><Star className="text-purple-500" size={24} /><h2 className="text-lg font-black uppercase italic tracking-tight">Bonus Finali (Punti)</h2></div>
            {openSection.bonus ? <ChevronUp /> : <ChevronDown />}
          </button>
          {openSection.bonus && (
            <div className="p-5 bg-slate-950/30">
              <div className="mb-8 p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
                 <h3 className="text-sm font-black text-yellow-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Flag size={16}/> Chiusura Gironi</h3>
                 <p className="text-[10px] text-slate-400 mb-4 leading-relaxed font-bold">Clicca qui per auto-calcolare il <strong className="text-white">Match con più gol</strong> e i <strong className="text-white">Gironi con più/meno gol</strong> in base ai risultati salvati. <strong className="text-emerald-400">Assegnerà immediatamente i punti</strong> in classifica generale.</p>
                 <button type="button" onClick={closeGroupStage} className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl transition-all">🏁 Calcola Bonus Gironi</button>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  <h3 className="text-sm font-black text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2 border-t border-slate-800/50 pt-6"><Trophy size={16}/> Chiusura Mondiale</h3>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest px-1">MVP Mondiale (Interruttore Finale)</span>
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
                  <div className="flex gap-3 pt-6 mt-4 border-t border-slate-800/50">
                    <button type="button" onClick={resetBonuses} className="p-4 bg-slate-900 border border-rose-500/30 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all" title="Azzera tutto"><Trash2 size={20} /></button>
                    <button type="button" onClick={saveEndTournamentBonuses} className="flex-1 bg-purple-600 hover:bg-purple-500 py-4 rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-widest shadow-xl transition-all">🏆 CHIUDI MONDIALE E ASSEGNA TUTTO</button>
                  </div>
              </form>
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
                <AutocompleteInput value={newScorerName} onChange={(val) => setNewScorerName(val)} placeholder="Nome (es. K. Mbappé)" suggestions={[...WORLD_CUP_PLAYERS, ...WORLD_CUP_GOALKEEPERS]} onSelectCustom={(item) => { const code = getFlagCode(item.country); if (code) setNewScorerTeam(code); }} />
                <div className="flex w-full sm:w-auto gap-3 shrink-0">
                  <select value={newScorerTeam} onChange={(e) => setNewScorerTeam(e.target.value)} className="flex-1 sm:w-40 bg-slate-900 border border-slate-800 p-4 rounded-2xl font-black text-xs text-white uppercase outline-none focus:border-cyan-500 text-center">{COUNTRY_OPTIONS.map(c => (<option key={c.code + c.name} value={c.code}>{c.name.toUpperCase()}</option>))}</select>
                  <button onClick={(e) => addScorer(e)} className="bg-cyan-600 hover:bg-cyan-500 p-4 rounded-2xl text-white transition-all shadow-lg shrink-0"><Plus size={20} /></button>
                </div>
              </div>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {topScorers.map(scorer => (
                  <div key={scorer.id} className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-3"><img src={`https://flagcdn.com/w40/${scorer.team_code}.png`} alt="" className="w-6 h-auto rounded-sm" /><span className="font-black text-sm uppercase text-slate-200">{scorer.name}</span></div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-slate-950 rounded-xl border border-slate-800 p-1"><button onClick={() => updateScorerGoals(scorer.id, scorer.goals, -1)} className="p-2 text-slate-500 hover:text-rose-500"><Minus size={14}/></button><span className="w-6 text-center font-black text-cyan-400">{scorer.goals}</span><button onClick={() => updateScorerGoals(scorer.id, scorer.goals, 1)} className="p-2 text-slate-500 hover:text-emerald-500"><Plus size={14}/></button></div>
                      <button onClick={() => deleteScorer(scorer.id)} className="p-3 text-rose-500 bg-rose-500/10 hover:bg-rose-500 rounded-xl"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* SEZIONE: ISCRIZIONI E QUOTE */}
        <section className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-2xl">
          <button onClick={() => setOpenSection({ ...openSection, iscrizioni: !openSection.iscrizioni })} className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30">
            <div className="flex items-center gap-3"><Users className="text-emerald-500" size={24} /><h2 className="text-lg font-black uppercase italic tracking-tight">Iscrizioni ({totalUsers})</h2></div>
            {openSection.iscrizioni ? <ChevronUp /> : <ChevronDown />}
          </button>
          {openSection.iscrizioni && (
            <div className="bg-slate-950/50 flex flex-col divide-y divide-slate-800/50">
              {paymentGroups.map((group) => (
                <div key={group.label} className="p-4 space-y-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${group.color}`}>{group.label} ({group.users.length})</span>
                  {group.users.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <p className="font-black text-xs uppercase italic text-white">{p.username} <span className="text-slate-400 font-bold not-italic font-sans text-[10px]">({p.full_name || 'Nessun Nome'})</span></p>
                      <select value={p.payment_method || ''} onChange={(e) => updatePaymentMethod(p.id, e.target.value)} className="bg-slate-900 p-2 rounded-lg text-[10px] font-black text-orange-500 border border-slate-700">
                        <option value="">⏳ DA PAGARE</option>
                        <option value="Satispay">SATISPAY</option><option value="PayPal">PAYPAL</option><option value="Contanti">CONTANTI</option><option value="Bonifico">BONIFICO</option>
                      </select>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ----- SEZIONE RISULTATI GIRONI ----- */}
        <section className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-2xl">
          <button onClick={() => setOpenSection({ ...openSection, risultati: !openSection.risultati })} className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30">
            <div className="flex items-center gap-3"><Zap className="text-yellow-500" size={24} /><h2 className="text-lg font-black uppercase italic tracking-tight">Risultati Gironi</h2></div>
            {openSection.risultati ? <ChevronUp /> : <ChevronDown />}
          </button>
          {openSection.risultati && (
            <div className="p-4 space-y-4 bg-slate-950/30">
              {groupedMatchesByDay.map(({ dayName, matchesArray }) => (
                <div key={dayName} id={`admin-day-${dayName}`} className="space-y-3 p-4 bg-slate-900/30 rounded-[2rem] border border-slate-800">
                  <h3 className="font-black text-slate-400 uppercase italic text-xs mb-2 pl-2">{dayName}</h3>
                  {matchesArray.map(m => (
                    <div key={m.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                      <span className="text-[10px] uppercase font-black text-slate-400 w-1/4 truncate">{formatTeamName(m.home_team)}</span>
                      <div className="flex items-center gap-2"><input id={`h-${m.id}`} type="number" defaultValue={m.home_score_final ?? ''} className="w-10 h-10 bg-slate-900 text-center font-black rounded-lg text-yellow-400" /><span>-</span><input id={`a-${m.id}`} type="number" defaultValue={m.away_score_final ?? ''} className="w-10 h-10 bg-slate-900 text-center font-black rounded-lg text-yellow-400" /></div>
                      <span className="text-[10px] uppercase font-black text-slate-400 w-1/4 text-right truncate">{formatTeamName(m.away_team)}</span>
                      <button onClick={() => updateScore(m.id)} className="bg-yellow-500 text-slate-950 px-3 py-2 font-black uppercase text-[10px] rounded-lg">Salva</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ----- SEZIONE INSERIMENTO TABELLONE UFFICIALE ----- */}
        <section className="bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden shadow-2xl border-l-4 border-l-blue-500">
          <button onClick={() => setOpenSection({ ...openSection, tabellone: !openSection.tabellone })} className="w-full p-5 flex items-center justify-between hover:bg-slate-800/30">
            <div className="flex items-center gap-3"><Trophy className="text-blue-500" size={24} /><h2 className="text-lg font-black uppercase italic tracking-tight">fase finale</h2></div>
            {openSection.tabellone ? <ChevronUp /> : <ChevronDown />}
          </button>
          {openSection.tabellone && (
            <div className="p-5 space-y-4 bg-slate-950/30">
              <div className="bg-blue-950/20 border border-blue-900/30 p-4 rounded-2xl flex flex-col gap-3">
                 <select value={qTeam} onChange={e => setQTeam(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-3.5 rounded-xl font-black text-xs text-white uppercase"><option value="">1. SCEGLI SQUADRA...</option>{TEAMS_2026.map(t => (<option key={t} value={t}>{t}</option>))}</select>
                 <select value={qStage} onChange={e => { setQStage(e.target.value); setQSlot(BRACKET_SLOTS[e.target.value][0].dbString); }} className="w-full bg-slate-900 border border-slate-800 p-3.5 rounded-xl font-black text-xs text-white uppercase">{STAGES.map(s => (<option key={s.id} value={s.id}>{s.label}</option>))}</select>
                 <select value={qSlot} onChange={e => setQSlot(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-3.5 rounded-xl font-black text-xs text-white uppercase text-center">{BRACKET_SLOTS[qStage].map(slot => (<option key={slot.dbString} value={slot.dbString}>{slot.label}</option>))}</select>
                 <button onClick={saveQualif} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-black uppercase text-xs tracking-widest">INSERISCI NEL TABELLONE MONDIALE</button>
              </div>
              <div className="space-y-3">
                 {STAGES.map(stg => { 
                    const items = officialBracket.filter(o => normalizeStage(o.stage) === stg.id); 
                    if (items.length === 0) return null; 
                    return (
                      <div key={stg.id} className="bg-slate-900 p-3 rounded-xl">
                         <span className="text-[9px] font-black text-blue-400 block mb-2">{stg.label}</span>
                         {items.map(o => (<div key={o.id} className="flex justify-between items-center text-xs p-2 bg-slate-950 rounded mb-1"><span>{o.team_name}</span><button onClick={() => deleteQualif(o.id)} className="text-rose-500"><Trash2 size={14}/></button></div>))}
                      </div>
                    ); 
                 })}
              </div>
            </div>
          )}
        </section>

      </div>

      {/* FOOTER BAR */}
      <nav className="fixed bottom-0 left-0 w-full z-50 bg-slate-950/95 backdrop-blur-md border-t border-slate-900 pb-safe-area shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-around py-2 px-1">
          {navItems.map((item) => (
            <button key={item.path} onClick={() => router.push(item.path)} className="relative flex flex-col items-center justify-between h-12 group transition-all" style={{ width: `${100 / navItems.length}%` }}>
              <div className="flex items-end justify-center h-6 w-full"><div className="text-slate-500 group-hover:text-slate-300">{item.icon}</div></div>
              <div className="flex items-center justify-center h-6 w-full px-0.5"><span className="text-[7px] sm:text-[8px] font-black uppercase text-slate-600 group-hover:text-slate-400">{item.name}</span></div>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}