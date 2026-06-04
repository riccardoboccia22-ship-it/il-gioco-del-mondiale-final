'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trophy, ArrowLeft, Loader2, Info } from 'lucide-react';
import Link from 'next/link';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Modifica: Di default mostriamo Iscriviti. Mostra Login solo se richiesto dall'URL.
  const isLoginMode = searchParams.get('mode') === 'login';
  const [isRegistering, setIsRegistering] = useState(!isLoginMode);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState('');

  // Controllo sessione all'avvio
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // BLOCCO DI CORTESIA: Controlla se ha già il nome
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', session.user.id).single();
        if (profile && !profile.full_name) {
          router.push('/setup-profilo');
        } else {
          router.push('/');
        }
      } else {
        setIsCheckingAuth(false);
      }
    };
    checkSession();
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Genera la finta email basata sull'username per Supabase
    const safeUsername = username.trim().toLowerCase().replace(/\s+/g, '');
    const fakeEmail = `${safeUsername}@mondiale.it`;

    if (isRegistering) {
      // LOGICA REGISTRAZIONE
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: fakeEmail,
        password: password,
      });

      if (signUpError) {
        setError('Username già occupato o password troppo corta.');
      } else if (data.user) {
        await supabase.from('profiles').insert([{
          id: data.user.id,
          username: username.trim(),
          points: 0,
          is_paid: false,
          avatar_id: 'trainer' // Assegniamo un avatar di default
        }]);
        // Nuova registrazione = Manca il full_name. Dritto al setup!
        router.push('/setup-profilo');
      }
    } else {
      // LOGICA ACCESSO
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: password,
      });

      if (signInError) {
        setError('Credenziali errate. Riprova.');
      } else {
        // Dopo il login, verifichiamo se ha inserito il nome reale in passato
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
          if (profile && !profile.full_name) {
            router.push('/setup-profilo');
          } else {
            router.push('/');
          }
        }
      }
    }
    setIsLoading(false);
  };

  // Spinner iniziale di controllo
  if (isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Pulsante Indietro */}
      <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-yellow-500 transition-colors mb-8 text-xs font-black uppercase tracking-widest pl-2">
        <ArrowLeft size={16} /> Torna alla Home
      </Link>

      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
            <Trophy size={28} className="text-yellow-500" />
          </div>
          <h1 className="text-3xl font-black uppercase italic text-white leading-none mb-2">
            {isRegistering ? 'Iscriviti' : 'Bentornato'}
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">
            {isRegistering ? 'Entra nel torneo' : 'Accedi per giocare'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="text" 
            placeholder="NICKNAME" 
            className="w-full p-4 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-yellow-500 outline-none text-white font-black text-xs uppercase transition-colors"
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="PASSWORD" 
            className="w-full p-4 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-yellow-500 outline-none text-white font-black text-xs uppercase transition-colors"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />

          {error && <p className="text-rose-500 text-[10px] font-black uppercase text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">{error}</p>}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-5 bg-yellow-500 text-slate-950 font-black rounded-3xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex justify-center items-center gap-2 mt-2 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isRegistering ? 'Crea Account 🏆' : 'Entra nel Gioco ⚽'}
          </button>
        </form>

        {/* AGGIUNTA: Messaggio recupero password solo se siamo in modalità Login */}
        {!isRegistering && (
          <div className="mt-6 flex flex-col items-center justify-center p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
            <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
              <Info size={12} className="text-yellow-500"/> Password Dimenticata?
            </span>
            <span className="text-[10px] text-center text-slate-500 font-bold">
              Contatta l'amministratore per farti reimpostare la password.
            </span>
          </div>
        )}

        <button 
          onClick={() => setIsRegistering(!isRegistering)} 
          className="w-full mt-6 text-[9px] font-black text-slate-500 hover:text-yellow-500 uppercase tracking-widest text-center transition-colors"
        >
          {isRegistering ? 'Hai già un account? Accedi' : 'Nuovo giocatore? Registrati'}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Sfondo Sfumato Coordinato con la Home */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 opacity-70"></div>
      
      <Suspense fallback={<Loader2 className="w-12 h-12 text-yellow-500 animate-spin z-10" />}>
        <AuthForm />
      </Suspense>
    </main>
  );
}