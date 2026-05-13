'use client';

import { useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trophy, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Controlla se l'utente arriva dal tasto "Accetta la Sfida"
  const isRegisterMode = searchParams.get('mode') === 'register';
  
  const [isRegistering, setIsRegistering] = useState(isRegisterMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
        setError('Errore: Username già occupato o password troppo corta.');
      } else if (data.user) {
        await supabase.from('profiles').insert([{
          id: data.user.id,
          username: username.trim(),
          points: 0,
          is_paid: false,
        }]);
        router.push('/profile');
      }
    } else {
      // LOGICA ACCESSO
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: password,
      });

      if (signInError) setError('Credenziali errate. Riprova.');
      else router.push('/profile');
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl relative">
      <Link href="/" className="absolute top-6 left-6 text-slate-500 hover:text-white">
        <ArrowLeft size={24} />
      </Link>

      <div className="text-center mb-8 mt-4">
        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
          <Trophy size={28} className="text-yellow-500" />
        </div>
        <h1 className="text-3xl font-black uppercase italic text-white">
          {isRegistering ? 'Iscriviti' : 'Bentornato'}
        </h1>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <input 
          type="text" 
          placeholder="USERNAME" 
          className="w-full p-4 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-yellow-500 outline-none text-white font-black text-xs uppercase"
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="PASSWORD" 
          className="w-full p-4 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-yellow-500 outline-none text-white font-black text-xs uppercase"
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />

        {error && <p className="text-rose-500 text-[10px] font-black uppercase text-center">{error}</p>}

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-5 bg-yellow-500 text-slate-950 font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
        >
          {isLoading ? 'Sincronizzazione...' : isRegistering ? 'Crea Account 🏆' : 'Entra nel Gioco ⚽'}
        </button>
      </form>

      <button 
        onClick={() => setIsRegistering(!isRegistering)} 
        className="w-full mt-8 text-[9px] font-black text-slate-500 hover:text-yellow-500 uppercase tracking-widest text-center"
      >
        {isRegistering ? 'Hai già un account? Accedi' : 'Nuovo giocatore? Registrati'}
      </button>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans">
      <Suspense fallback={<div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>}>
        <AuthForm />
      </Suspense>
    </main>
  );
}