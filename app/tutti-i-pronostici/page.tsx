'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Trophy,
  Star,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Flame,
  Award,
  Zap,
  Target,
  Shield,
  Goal,
  ArrowDownToLine,
  ArrowUpToLine,
  ShieldCheck,
} from 'lucide-react';

const STAGE_POINTS: { [key: string]: number } = {
  R32: 2,
  R16: 4,
  QF: 6,
  SF: 8,
  F: 10,
  WINNER: 20,
};
const STAGE_CAPACITY: { [key: string]: number } = {
  R32: 32,
  R16: 16,
  QF: 8,
  SF: 4,
  F: 2,
  WINNER: 1,
};

const flagMap: { [key: string]: string } = {
  algeria: 'dz',
  'arabia saudita': 'sa',
  argentina: 'ar',
  australia: 'au',
  austria: 'at',
  belgio: 'be',
  'bosnia ed erzegovina': 'ba',
  'bosnia erzegovina': 'ba',
  brasile: 'br',
  canada: 'ca',
  'capo verde': 'cv',
  colombia: 'co',
  'corea del sud': 'kr',
  "costa d'avorio": 'ci',
  croazia: 'hr',
  curaçao: 'cw',
  curacao: 'cw',
  ecuador: 'ec',
  egitto: 'eg',
  francia: 'fr',
  germania: 'de',
  ghana: 'gh',
  giappone: 'jp',
  giordania: 'jo',
  haiti: 'ht',
  inghilterra: 'gb-eng',
  iran: 'ir',
  iraq: 'iq',
  marocco: 'ma',
  messico: 'mx',
  norvegia: 'no',
  'nuova zelanda': 'nz',
  olanda: 'nl',
  panama: 'pa',
  paraguay: 'py',
  portogallo: 'pt',
  qatar: 'qa',
  'repubblica ceca': 'cz',
  'repubblica democratica del congo': 'cd',
  congo: 'cd',
  scozia: 'gb-sct',
  senegal: 'sn',
  spagna: 'es',
  'stati uniti': 'us',
  usa: 'us',
  sudafrica: 'za',
  svezia: 'se',
  svizzera: 'ch',
  tunisia: 'tn',
  turchia: 'tr',
  uruguay: 'uy',
  uzbekistan: 'uz',
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

const formatTeamName = (name: string) => {
  if (!name) return '';
  if (name.trim().toLowerCase() === 'repubblica democratica del congo')
    return 'R. D. Congo';
  return name;
};

export default function TuttiPronosticiPage() {
  const [activeTab, setActiveTab] = useState<'GIRONI' | 'BRACKET' | 'BONUS'>(
    'GIRONI'
  );
  const [data, setData] = useState<any>({
    profiles: [],
    matches: [],
    predictions: [],
    brackets: [],
    userBonuses: [],
    officialBonus: null,
    officialResults: [],
  });
  const [loading, setLoading] = useState(true);
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null);
  const [expandedBracketUser, setExpandedBracketUser] = useState<string | null>(
    null
  );
  const [expandedBonusUser, setExpandedBonusUser] = useState<string | null>(
    null
  );

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [p, m, pr, br, off, offBo, usrBo] = await Promise.all([
          supabase.from('profiles').select('*').order('username'),
          supabase.from('matches').select('*').order('id'),
          supabase.from('predictions').select('*'),
          supabase.from('brackets').select('*'),
          supabase.from('official_bracket').select('*'),
          supabase
            .from('official_bonuses')
            .select('*')
            .eq('id', '00000000-0000-0000-0000-000000000000')
            .maybeSingle(),
          supabase.from('user_bonus_answers').select('*'),
        ]);
        setData({
          profiles: p.data || [],
          matches: m.data || [],
          predictions: pr.data || [],
          brackets: br.data || [],
          officialResults: off.data || [],
          officialBonus: offBo.data || null,
          userBonuses: usrBo.data || [],
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getFlagUrl = (team: string) => {
    const code = flagMap[team?.toLowerCase().trim()];
    return code ? `https://flagcdn.com/w40/${code}.png` : null;
  };

  const getMatchResultInfo = (pred: any, match: any) => {
    if (!pred || match.home_score_final === null || !match.is_finished)
      return { pts: 0, color: 'text-slate-600', label: '' };
    const ph = Number(pred.home_score);
    const pa = Number(pred.away_score);
    const mh = Number(match.home_score_final);
    const ma = Number(match.away_score_final);
    const pRes = ph > pa ? '1' : ph < pa ? '2' : 'X';
    const mRes = mh > ma ? '1' : mh < ma ? '2' : 'X';
    if (ph === mh && pa === ma)
      return { pts: 10, color: 'text-emerald-400', label: 'ESATTO' };
    if (pRes === mRes && (ph === mh || pa === ma))
      return { pts: 6, color: 'text-yellow-500', label: 'SEGNO+GOL' };
    if (pRes === mRes)
      return { pts: 4, color: 'text-amber-600', label: 'SEGNO' };
    if (ph === mh || pa === ma)
      return { pts: 2, color: 'text-slate-400', label: 'GOL' };
    return { pts: 0, color: 'text-rose-500', label: 'ZERO' };
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-yellow-500 font-black animate-pulse uppercase">
        Sincronizzazione Mondiale...
      </div>
    );

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-32 font-sans">
      <header className="text-center mb-8 pt-4">
        <h1 className="text-4xl font-black text-yellow-500 uppercase italic">
          Pronostici Globali
        </h1>
        <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800 mt-6 max-w-sm mx-auto">
          {[
            { id: 'GIRONI', icon: <LayoutGrid size={14} /> },
            { id: 'BRACKET', icon: <Trophy size={14} /> },
            { id: 'BONUS', icon: <Star size={14} /> },
          ].map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black ${
                activeTab === tab.id
                  ? 'bg-yellow-500 text-slate-950 shadow-lg'
                  : 'text-slate-500'
              }`}
            >
              {tab.icon} {tab.id}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* --- GIRONI --- */}
        {activeTab === 'GIRONI' &&
          data.matches.map((match: any) => {
            const homeFlag = getFlagUrl(match.home_team);
            const awayFlag = getFlagUrl(match.away_team);
            const isExpanded = expandedMatch === match.id;
            const isFinished =
              match.is_finished &&
              match.home_score_final !== null &&
              match.away_score_final !== null;

            return (
              <div
                key={match.id}
                className={`bg-slate-900/40 border rounded-[2rem] overflow-hidden ${
                  isExpanded ? 'border-yellow-500/30' : 'border-slate-800'
                }`}
              >
                <button
                  onClick={() => setExpandedMatch(isExpanded ? null : match.id)}
                  className="w-full p-4 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 hover:bg-slate-800/30 transition-all"
                >
                  <div className="w-full sm:w-auto flex justify-between items-center sm:block text-left">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
                      #{match.id}
                    </span>
                    {isFinished && (
                      <span className="text-[8px] text-emerald-400 font-black uppercase italic bg-emerald-500/10 px-2 py-0.5 rounded-full sm:hidden">
                        FINITA
                      </span>
                    )}
                  </div>

                  <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-4 w-full">
                    <div className="flex flex-1 items-center justify-end gap-1.5 sm:gap-2 text-right min-w-0">
                      <span className="font-black uppercase italic text-[9px] sm:text-xs tracking-tight truncate">
                        {formatTeamName(match.home_team)}
                      </span>
                      {homeFlag ? (
                        <img
                          src={homeFlag}
                          className="w-5 sm:w-6 h-auto rounded-sm shadow-md flex-shrink-0"
                          alt=""
                        />
                      ) : (
                        <div className="w-5 sm:w-6 h-3.5 sm:h-4 bg-slate-800 rounded-sm flex items-center justify-center flex-shrink-0">
                          <Shield size={10} className="text-slate-600" />
                        </div>
                      )}
                    </div>

                    <div className="w-12 sm:w-14 shrink-0 text-center bg-slate-950 py-1 sm:py-1.5 rounded-lg font-black text-yellow-500 border border-slate-800 text-[10px] sm:text-sm">
                      {isFinished
                        ? `${match.home_score_final}-${match.away_score_final}`
                        : 'VS'}
                    </div>

                    <div className="flex flex-1 items-center justify-start gap-1.5 sm:gap-2 text-left min-w-0">
                      {awayFlag ? (
                        <img
                          src={awayFlag}
                          className="w-5 sm:w-6 h-auto rounded-sm shadow-md flex-shrink-0"
                          alt=""
                        />
                      ) : (
                        <div className="w-5 sm:w-6 h-3.5 sm:h-4 bg-slate-800 rounded-sm flex items-center justify-center flex-shrink-0">
                          <Shield size={10} className="text-slate-600" />
                        </div>
                      )}
                      <span className="font-black uppercase italic text-[9px] sm:text-xs tracking-tight truncate">
                        {formatTeamName(match.away_team)}
                      </span>
                    </div>
                  </div>

                  <div className="hidden sm:flex w-16 justify-end">
                    {isFinished && (
                      <span className="text-[8px] text-emerald-400 font-black uppercase italic bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        FINITA
                      </span>
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="bg-slate-950/60 p-4 space-y-2 border-t border-slate-800">
                    {data.profiles.map((user: any) => {
                      const pred = data.predictions.find(
                        (p: any) =>
                          p.match_id === match.id && p.user_id === user.id
                      );
                      const info = getMatchResultInfo(pred, match);
                      return (
                        <div
                          key={user.id}
                          className={`flex justify-between items-center px-4 py-2 bg-slate-900/30 rounded-xl border ${
                            info.pts > 0
                              ? 'border-emerald-500/20'
                              : 'border-slate-800/50'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase italic">
                            {user.username}
                          </span>
                          <div className="flex items-center gap-4">
                            <span
                              className={`font-black text-lg italic ${info.color}`}
                            >
                              {pred
                                ? `${pred.home_score} - ${pred.away_score}`
                                : '--'}
                            </span>
                            {isFinished && (
                              <span
                                className={`w-8 text-right font-black italic text-xs ${info.color}`}
                              >
                                {info.pts > 0 ? `+${info.pts}` : '0'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

        {/* --- BRACKET --- */}
        {activeTab === 'BRACKET' &&
          data.profiles.map((user: any) => {
            const userPicks = data.brackets.filter(
              (b: any) => b.user_id === user.id
            );
            const isExpanded = expandedBracketUser === user.id;

            let userBracketTotal = 0;
            userPicks.forEach((p: any) => {
              const uStg = normalizeStage(p.stage);
              const isCorrect = data.officialResults.some(
                (off: any) =>
                  normalizeStage(off.stage) === uStg &&
                  off.team_name?.trim().toLowerCase() ===
                    p.team_name?.trim().toLowerCase()
              );
              if (isCorrect) userBracketTotal += STAGE_POINTS[uStg] || 0;
            });

            return (
              <div
                key={user.id}
                className={`bg-slate-900/40 border rounded-[2.5rem] overflow-hidden transition-all shadow-xl ${
                  isExpanded ? 'border-blue-500/30' : 'border-slate-800'
                }`}
              >
                <button
                  onClick={() =>
                    setExpandedBracketUser(isExpanded ? null : user.id)
                  }
                  className="w-full p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-black uppercase italic text-sm">
                      {user.username}
                    </span>
                    <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                      {userBracketTotal} PT
                    </span>
                  </div>
                  <ChevronDown
                    className={`transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div className="p-6 bg-slate-950/60 space-y-4 border-t border-slate-800">
                    {[
                      { id: 'R32', label: 'SEDICESIMI' },
                      { id: 'R16', label: 'OTTAVI' },
                      { id: 'QF', label: 'QUARTI DI FINALE' },
                      { id: 'SF', label: 'SEMIFINALE' },
                      { id: 'F', label: 'FINALE' },
                      { id: 'WINNER', label: 'CAMPIONE' },
                    ].map((stg) => (
                      <div key={stg.id}>
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">
                          {stg.label}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {userPicks
                            .filter(
                              (p: any) => normalizeStage(p.stage) === stg.id
                            )
                            .map((p: any) => {
                              const officialTeamsInStage =
                                data.officialResults.filter(
                                  (off: any) =>
                                    normalizeStage(off.stage) === stg.id
                                );
                              const isCorrect = officialTeamsInStage.some(
                                (off: any) =>
                                  off.team_name?.trim().toLowerCase() ===
                                  p.team_name?.trim().toLowerCase()
                              );

                              const isStageFull =
                                officialTeamsInStage.length >=
                                (STAGE_CAPACITY[stg.id] || 99);
                              const isWrong = isStageFull && !isCorrect;

                              return (
                                <span
                                  key={p.id}
                                  className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase flex items-center gap-2 transition-all ${
                                    isCorrect
                                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                      : isWrong
                                      ? 'bg-rose-500/10 border-rose-950 text-rose-800 opacity-50'
                                      : 'bg-slate-900 border-slate-800 text-slate-400'
                                  }`}
                                >
                                  {getFlagUrl(p.team_name) ? (
                                    <img
                                      src={getFlagUrl(p.team_name)!}
                                      className="w-4 h-auto rounded-sm"
                                      alt=""
                                    />
                                  ) : (
                                    <Shield size={10} />
                                  )}
                                  {formatTeamName(p.team_name)}
                                  {isCorrect && (
                                    <span className="ml-1 text-[8px]">
                                      + {STAGE_POINTS[stg.id]}
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

        {/* --- BONUS CON NUOVO ORDINE --- */}
        {activeTab === 'BONUS' &&
          data.profiles.map((user: any) => {
            const b = data.userBonuses.find(
              (bonus: any) => bonus.user_id === user.id
            );
            const off = data.officialBonus;
            const isExpanded = expandedBonusUser === user.id;

            const checks = {
              red:
                off?.total_red_cards != null &&
                String(b?.total_red_cards) === String(off.total_red_cards),
              top:
                !!off?.top_scorer &&
                b?.top_scorer?.toLowerCase().trim() ===
                  off.top_scorer.toLowerCase().trim(),
              mvp:
                !!off?.mvp_world_cup &&
                b?.mvp_world_cup?.toLowerCase().trim() ===
                  off.mvp_world_cup.toLowerCase().trim(),
              gk:
                !!off?.best_goalkeeper &&
                b?.best_goalkeeper?.toLowerCase().trim() ===
                  off.best_goalkeeper.toLowerCase().trim(),
              pen:
                off?.total_penalties != null &&
                String(b?.total_penalties) === String(off.total_penalties),
              own:
                off?.total_own_goals != null &&
                String(b?.total_own_goals) === String(off.total_own_goals),
              high:
                !!off?.high_scoring_match &&
                b?.high_scoring_match?.toLowerCase().trim() ===
                  off.high_scoring_match.toLowerCase().trim(),
              hg:
                !!off?.highest_scoring_group &&
                b?.highest_scoring_group?.toLowerCase().trim() ===
                  off.highest_scoring_group.toLowerCase().trim(),
              lg:
                !!off?.lowest_scoring_group &&
                b?.lowest_scoring_group?.toLowerCase().trim() ===
                  off.lowest_scoring_group.toLowerCase().trim(),
            };

            return (
              <div
                key={user.id}
                className={`bg-slate-900/40 border rounded-[2.5rem] overflow-hidden ${
                  isExpanded ? 'border-purple-500/30' : 'border-slate-800'
                }`}
              >
                <button
                  onClick={() =>
                    setExpandedBonusUser(isExpanded ? null : user.id)
                  }
                  className="w-full p-6 flex items-center justify-between"
                >
                  <span className="font-black uppercase italic text-sm">
                    {user.username}
                  </span>
                  <ChevronDown
                    className={`transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isExpanded && (
                  <div className="p-6 bg-slate-950/60 space-y-2 border-t border-slate-800">
                    {[
                      {
                        id: 'MVP',
                        val: b?.mvp_world_cup,
                        ok: checks.mvp,
                        pts: 10,
                        icon: <Trophy size={12} />,
                      },
                      {
                        id: 'Capocannoniere',
                        val: b?.top_scorer,
                        ok: checks.top,
                        pts: 10,
                        icon: <Award size={12} />,
                      },
                      {
                        id: 'Miglior Portiere',
                        val: b?.best_goalkeeper,
                        ok: checks.gk,
                        pts: 10,
                        icon: <ShieldCheck size={12} />,
                      },
                      {
                        id: 'Match Top Gol',
                        val: b?.high_scoring_match,
                        ok: checks.high,
                        pts: 5,
                        icon: <Flame size={12} />,
                      },
                      {
                        id: 'Girone +',
                        val: b?.highest_scoring_group,
                        ok: checks.hg,
                        pts: 5,
                        icon: <ArrowUpToLine size={12} />,
                      },
                      {
                        id: 'Girone -',
                        val: b?.lowest_scoring_group,
                        ok: checks.lg,
                        pts: 5,
                        icon: <ArrowDownToLine size={12} />,
                      },
                      {
                        id: 'Autogol',
                        val: b?.total_own_goals,
                        ok: checks.own,
                        pts: 3,
                        icon: <Target size={12} />,
                      },
                      {
                        id: 'Rigori',
                        val: b?.total_penalties,
                        ok: checks.pen,
                        pts: 3,
                        icon: <Goal size={12} />,
                      },
                      {
                        id: 'Rossi',
                        val: b?.total_red_cards,
                        ok: checks.red,
                        pts: 3,
                        icon: <Zap size={12} />,
                      },
                    ].map((bonus) => (
                      <div
                        key={bonus.id}
                        className={`flex justify-between items-center p-3 rounded-xl border ${
                          bonus.ok
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {bonus.icon}{' '}
                          <span className="text-[9px] font-black uppercase">
                            {bonus.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase truncate max-w-[120px] text-right">
                            {bonus.val || '--'}
                          </span>
                          {bonus.ok && (
                            <span className="text-[8px] font-black text-emerald-400">
                              +{bonus.pts}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </main>
  );
}