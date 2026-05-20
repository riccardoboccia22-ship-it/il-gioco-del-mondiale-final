'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { BookOpen, Timer, X, Edit3, Shield, Map } from 'lucide-react';

const AVATARS = [
  { id: 'trainer', name: 'Il Mister', emoji: '🧢', color: 'from-blue-600 to-blue-400' },
  { id: 'wizard', name: 'Il Mago', emoji: '🪄', color: 'from-purple-600 to-purple-400' },
  { id: 'bomber', name: 'Il Bomber', emoji: '⚽', color: 'from-rose-600 to-rose-400' },
  { id: 'legend', name: 'Pallone d\'Oro', emoji: '🏆', color: 'from-yellow-600 to-yellow-400' },
  { id: 'ninja', name: 'Ninja', emoji: '🥷', color: 'from-zinc-800 to-zinc-600' },
  { id: 'clown', name: 'Clown', emoji: '🤡', color: 'from-red-500 to-sky-500' },
  { id: 'pirate', name: 'Pirati', emoji: '🏴‍☠️', color: 'from-zinc-900 to-zinc-700' },
  { id: 'shark', name: 'Squalo', emoji: '🦈', color: 'from-sky-700 to-blue-900' },
  { id: 'bull', name: 'Toro', emoji: '🐂', color: 'from-red-700 to-orange-600' },
  { id: 'wolf', name: 'Lupo', emoji: '🐺', color: 'from-slate-700 to-slate-500' },
  { id: 'pig', name: 'Maiale', emoji: '🐷', color: 'from-pink-400 to-pink-200' },
  { id: 'tiger', name: 'Tigre', emoji: '🐯', color: 'from-orange-500 to-yellow-500' },
  { id: 'mouse', name: 'Topo', emoji: '🐭', color: 'from-zinc-400 to-zinc-300' },
  { id: 'bat', name: 'Pipistrello', emoji: '🦇', color: 'from-indigo-900 to-slate-800' },
  { id: 'horse', name: 'Cavallo', emoji: '🐴', color: 'from-amber-700 to-amber-500' },
  { id: 'cheetah', name: 'Ghepardo', emoji: '🐆', color: 'from-yellow-500 to-amber-600' },
  { id: 'elephant', name: 'Elefante', emoji: '🐘', color: 'from-slate-400 to-slate-300' },
  { id: 'giraffe', name: 'Giraffa', emoji: '🦒', color: 'from-amber-400 to-orange-400' },
  { id: 'penguin', name: 'Pinguino', emoji: '🐧', color: 'from-cyan-100 to-blue-300' },
  { id: 'crocodile', name: 'Coccodrillo', emoji: '🐊', color: 'from-green-800 to-emerald-600' },
  { id: 'eagle', name: 'Aquila', emoji: '🦅', color: 'from-sky-700 to-blue-500' },
  { id: 'trex', name: 'T-Rex', emoji: '🦖', color: 'from-green-900 to-lime-700' },
  { id: 'dragon', name: 'Drago', emoji: '🐲', color: 'from-red-600 to-orange-600' },
  { id: 'turtle', name: 'Tartaruga', emoji: '🐢', color: 'from-emerald-600 to-green-500' },
  { id: 'fly', name: 'Mosca', emoji: '🪰', color: 'from-zinc-800 to-zinc-600' },
  { id: 'mosquito', name: 'Zanzara', emoji: '🦟', color: 'from-stone-600 to-stone-400' },
  { id: 'grasshopper', name: 'Cavalletta', emoji: '🦗', color: 'from-lime-600 to-green-500' },
  { id: 'beer', name: 'Birra', emoji: '🍺', color: 'from-yellow-400 to-amber-500' },
  { id: 'mate', name: 'Mate', emoji: '🧉', color: 'from-green-700 to-emerald-500' },
  { id: 'cocktail', name: 'Cocktail', emoji: '🍹', color: 'from-rose-400 to-orange-400' },
  { id: 'tree', name: 'Albero', emoji: '🌳', color: 'from-green-800 to-lime-600' },
  { id: 'palm', name: 'Palma', emoji: '🌴', color: 'from-yellow-600 to-emerald-500' },
  { id: 'ice', name: 'Ghiaccio', emoji: '🧊', color: 'from-cyan-300 to-blue-100' },
  { id: 'fire', name: 'Fiamma', emoji: '🔥', color: 'from-orange-600 to-red-600' },
  { id: 'wave', name: 'Onda', emoji: '🌊', color: 'from-blue-700 to-cyan-400' },
  { id: 'snowman', name: 'Snowman', emoji: '⛄', color: 'from-slate-100 to-slate-50' },
  { id: 'world', name: 'Mondo', emoji: '🌍', color: 'from-blue-500 to-green-400' },
  { id: 'mountain', name: 'Montagna', emoji: '⛰️', color: 'from-slate-500 to-stone-400' },
  { id: 'f1', name: 'Formula 1', emoji: '🏎️', color: 'from-red-600 to-red-400' },
  { id: 'moto', name: 'Moto', emoji: '🏍️', color: 'from-orange-500 to-amber-400' },
  { id: 'scooter', name: 'Scooter', emoji: '🛵', color: 'from-sky-500 to-blue-300' },
  { id: 'train', name: 'Treno', emoji: '🚂', color: 'from-zinc-700 to-slate-500' },
  { id: 'roller', name: 'Roller', emoji: '🎢', color: 'from-indigo-600 to-purple-500' },
  { id: 'missile', name: 'Missile', emoji: '🚀', color: 'from-slate-200 to-orange-400' },
  { id: 'paragliding', name: 'Parapendio', emoji: '🪂', color: 'from-rose-500 to-orange-400' },
  { id: 'diamond', name: 'Diamante', emoji: '💎', color: 'from-cyan-400 to-blue-500' },
  { id: 'boxing', name: 'Boxe', emoji: '🥊', color: 'from-red-600 to-red-400' },
  { id: 'bang', name: 'Bang', emoji: '💥', color: 'from-orange-500 to-yellow-400' },
  { id: 'anchor', name: 'Ancora', emoji: '⚓', color: 'from-slate-600 to-slate-400' },
  { id: 'knife', name: 'Coltello', emoji: '🔪', color: 'from-slate-400 to-slate-100' },
  { id: 'pool8', name: 'Palla 8', emoji: '🎱', color: 'from-zinc-900 to-zinc-700' },
  { id: 'joystick', name: 'Retro', emoji: '🕹️', color: 'from-rose-600 to-purple-700' },
  { id: 'gamepad', name: 'Pro', emoji: '🎮', color: 'from-slate-800 to-indigo-900' },
  { id: 'dice', name: 'Dado', emoji: '🎲', color: 'from-white to-slate-200' },
  { id: 'slot', name: 'Slot', emoji: '🎰', color: 'from-yellow-500 to-amber-600' },
];

export default function ProfilePage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    groups: 0,
    bracket: 0,
    bonus: 0,
    rank: '--',
    isPaid: false,
  });
  
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  
  const router = useRouter();
  const ADMIN_EMAIL = 'ricky@mondiale.it';

  useEffect(() => { checkUser(); }, []);

  useEffect(() => {
    const WORLD_CUP_START_DATE = new Date('2026-06-11T21:00:00+02:00').getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = WORLD_CUP_START_DATE - now;
      if (distance < 0) {
        clearInterval(timer);
        setIsExpired(true);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (!profile) {
            const fallbackUsername = user.email ? user.email.split('@')[0] : 'Guerriero';
            await supabase.from('profiles').insert([{ id: user.id, username: fallbackUsername, points: 0, avatar_id: 'trainer' }]);
            profile = { username: fallbackUsername, points: 0, points_groups: 0, points_bracket: 0, points_bonus: 0, is_paid: false, avatar_id: 'trainer' };
        }
        setUserProfile({ ...user, username: profile.username, avatar_id: profile.avatar_id || 'trainer' });
        setStats({
          total: profile.points || 0, groups: profile.points_groups || 0, bracket: profile.points_bracket || 0,
          bonus: profile.points_bonus || 0, rank: profile.ranking || '--', isPaid: profile.is_paid || false,
        });
      }
    } catch (error) { console.error("Errore check utente:", error); } finally { setIsPageLoading(false); }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const safeUsernameForEmail = username.trim().toLowerCase().replace(/\s+/g, '');
    const fakeEmail = `${safeUsernameForEmail}@mondiale.it`;

    if (isRegistering) {
      const { data, error } = await supabase.auth.signUp({ email: fakeEmail, password: password });
      if (error) { toast.error('Errore: Username occupato o password corta'); } 
      else if (data.user) {
        await supabase.from('profiles').upsert([{ id: data.user.id, username: username.trim(), points: 0, is_paid: false, avatar_id: 'trainer' }]);
        toast.success('Registrazione completata!');
        window.location.reload();
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: fakeEmail, password: password });
      if (error) toast.error('Credenziali errate');
      else window.location.reload();
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const updateAvatar = async (newAvatarId: string) => {
    try {
      const { error } = await supabase.from('profiles').update({ avatar_id: newAvatarId }).eq('id', userProfile.id);
      if (error) throw error;
      setUserProfile({ ...userProfile, avatar_id: newAvatarId });
      setShowAvatarModal(false);
      toast.success('Avatar aggiornato!');
    } catch (error) { toast.error("Impossibile aggiornare l'avatar"); }
  };

  const checkIsAdmin = () => {
    if (!userProfile) return false;
    return userProfile.email?.toLowerCase() === ADMIN_EMAIL || userProfile.username?.toLowerCase() === 'ricky';
  };

  const copyPaymentInfo = () => {
    navigator.clipboard.writeText("Quota Mondiale 2026 - Contattare Ricky per saldo");
    toast.success("Info pagamento copiate!");
  };

  if (isPageLoading) return <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans"><div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div></main>;

  const currentAvatar = AVATARS.find(a => a.id === userProfile?.avatar_id) || AVATARS[0];

  return (
    <main className="min-h-[100dvh] bg-slate-950 text-white px-4 pt-6 pb-20 flex flex-col items-center justify-start sm:justify-center font-sans overflow-y-auto sm:overflow-hidden">
      <div className="w-full max-w-[24rem] sm:max-w-md">
        {userProfile ? (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 w-full">
            
            {/* 1. CARD PROFILO SUPERIORE */}
            <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-3xl text-center shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-4 sm:gap-5 text-left">
                <button 
                  onClick={() => setShowAvatarModal(true)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${currentAvatar.color} rounded-full flex items-center justify-center text-3xl sm:text-4xl border-2 border-slate-800 shadow-md group hover:border-yellow-500 transition-all`}
                >
                  <span>{currentAvatar.emoji}</span>
                  <div className="absolute -bottom-1 -right-1 bg-sky-500 text-white p-1.5 rounded-full shadow-sm group-hover:scale-110 transition-all">
                    <Edit3 size={12} strokeWidth={3} className="sm:w-4 sm:h-4" />
                  </div>
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter leading-none">{userProfile.username}</h1>
                  <div className="mt-2">
                    {stats.isPaid ? (
                      <span className="text-emerald-400 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1"><Shield size={12}/> Quota Ok</span>
                    ) : (
                      <button onClick={copyPaymentInfo} className="text-rose-500 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1.5 animate-pulse hover:text-white transition-colors"><X size={12} strokeWidth={3}/> Quota Mancante</button>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={handleLogout} className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 hover:text-rose-500 transition-colors">
                Esci
              </button>
            </div>

            {/* 2. BOX PUNTEGGIO E RANKING */}
            <div className="bg-yellow-500 p-5 sm:p-6 rounded-3xl flex items-center justify-between shadow-md">
              <div>
                <p className="text-[10px] sm:text-xs font-black text-slate-950 uppercase tracking-widest opacity-80 italic">Punti Totali</p>
                <p className="text-6xl sm:text-7xl font-black text-slate-950 tracking-tighter leading-none mt-1">{stats.total}</p>
              </div>
              <div className="text-right bg-slate-950/10 p-4 rounded-2xl">
                <p className="text-[9px] sm:text-[11px] font-black text-slate-950/70 uppercase tracking-widest">Ranking</p>
                <p className="text-3xl sm:text-4xl font-black text-slate-950 leading-none">#{stats.rank}</p>
              </div>
            </div>

            {/* 3. GRIGLIA DETTAGLI */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Gironi', val: stats.groups },
                { label: 'Tabellone', val: stats.bracket },
                { label: 'Bonus', val: stats.bonus }
              ].map((s) => (
                <div key={s.label} className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-center shadow-sm">
                  <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase italic leading-none mb-2">{s.label}</p>
                  <p className="text-2xl sm:text-3xl font-black text-white leading-none">{s.val}</p>
                </div>
              ))}
            </div>

            {/* 4. COUNTDOWN BOX */}
            <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-3xl shadow-md relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 ${isExpired ? 'bg-rose-500' : 'bg-gradient-to-r from-yellow-600 to-yellow-400'}`}></div>
              
              {isExpired ? (
                <div className="text-center py-3 flex flex-col items-center">
                  <span className="bg-rose-500/20 text-rose-500 text-xs font-black px-4 py-1.5 rounded-full uppercase italic flex items-center gap-1.5 mb-2"><Timer size={14}/> Pronostici Chiusi</span>
                  <p className="text-sm sm:text-base font-black text-white uppercase italic">Il Mondiale è Iniziato!</p>
                </div>
              ) : (
                <div className="flex justify-between items-center px-1">
                  <div className="flex flex-col items-start justify-center pr-3 border-r border-slate-800">
                     <Timer size={18} className="text-yellow-500 mb-1.5" />
                     <p className="text-[10px] sm:text-xs font-black uppercase text-slate-500 leading-tight">Chiusura<br/>Pronostici</p>
                  </div>
                  <div className="flex gap-2 flex-1 justify-end">
                    {[
                      { label: 'GG', value: timeLeft.days },
                      { label: 'HH', value: timeLeft.hours },
                      { label: 'MM', value: timeLeft.minutes },
                      { label: 'SS', value: timeLeft.seconds },
                    ].map((t) => (
                      <div key={t.label} className="bg-slate-950 border border-slate-800 w-[3.5rem] sm:w-[4rem] py-2.5 sm:py-3 rounded-xl flex flex-col items-center justify-center">
                        <span className="text-xl sm:text-2xl font-black text-white leading-none">{t.value.toString().padStart(2, '0')}</span>
                        <span className="text-[8px] sm:text-[10px] font-black uppercase text-yellow-500 mt-1">{t.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 5. AZIONI RAPIDE */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => router.push('/groups')} className="py-4 sm:py-5 bg-blue-600/10 border border-blue-500/30 text-blue-400 font-black rounded-2xl uppercase tracking-widest text-[11px] sm:text-xs hover:bg-blue-600/20 transition-all flex items-center justify-center gap-2 shadow-sm">
                <Map size={16} /> Gironi Ufficiali
              </button>
              <button onClick={() => router.push('/regolamento')} className="py-4 sm:py-5 bg-slate-900 border border-slate-800 text-slate-300 font-black rounded-2xl uppercase tracking-widest text-[11px] sm:text-xs hover:border-slate-700 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm">
                <BookOpen size={16} /> Regolamento
              </button>
            </div>

            {checkIsAdmin() && (
              <Link href="/admin" className="w-full flex items-center justify-center py-4 bg-rose-600/10 text-rose-500 border border-rose-600/20 font-black rounded-2xl uppercase tracking-widest text-[11px] hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                ⚙️ Pannello Admin
              </Link>
            )}
            
          </div>
        ) : (
          /* FORM LOGIN INVARIATO */
          <div className="bg-slate-900 border border-slate-800 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl mt-10 w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-black text-yellow-500 uppercase italic">
                {isRegistering ? 'Iscriviti' : 'Entra'}
              </h1>
              <p className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">World Cup 2026 Access</p>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              <input type="text" placeholder="USERNAME" className="w-full p-4 sm:p-5 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-yellow-500 outline-none text-white font-black text-sm uppercase" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <input type="password" placeholder="PASSWORD" className="w-full p-4 sm:p-5 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-yellow-500 outline-none text-white font-black text-sm uppercase" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="submit" disabled={authLoading} className="w-full py-5 bg-yellow-500 text-slate-950 font-black rounded-2xl uppercase tracking-widest text-sm mt-4 active:scale-95 shadow-xl transition-all">
                {authLoading ? 'Accesso in corso...' : isRegistering ? 'Crea Account' : 'Inizia a Giocare'}
              </button>
            </form>
            <button onClick={() => setIsRegistering(!isRegistering)} className="w-full mt-6 sm:mt-8 text-[10px] font-black text-slate-500 hover:text-yellow-500 uppercase tracking-widest italic text-center transition-colors">
              {isRegistering ? 'Hai già un account? Accedi' : 'Nuovo giocatore? Registrati'}
            </button>
          </div>
        )}
      </div>

      {/* OVERLAY MODALE AVATAR */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-md pb-24 sm:pb-4">
          <div className="bg-slate-900 border-t-2 sm:border-2 border-yellow-500/40 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-yellow-500 font-black uppercase italic tracking-tighter text-lg">Scegli Avatar</h3>
              <button onClick={() => setShowAvatarModal(false)} className="bg-slate-950 p-2 rounded-full text-slate-500 hover:text-rose-500 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => updateAvatar(avatar.id)}
                  className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all active:scale-90 ${
                    userProfile?.avatar_id === avatar.id 
                      ? 'bg-yellow-500/20 border-yellow-500' 
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full mb-1.5 flex items-center justify-center text-2xl bg-gradient-to-br ${avatar.color}`}>
                    <span>{avatar.emoji}</span>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-tighter text-center leading-tight ${userProfile?.avatar_id === avatar.id ? 'text-yellow-500' : 'text-slate-500'}`}>
                    {avatar.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}