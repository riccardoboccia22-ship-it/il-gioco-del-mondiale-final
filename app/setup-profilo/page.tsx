'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { UserCheck, ShieldAlert } from 'lucide-react';

export default function SetupProfiloPage() {
  const [realName, setRealName] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Sicurezza: se un utente non è nemmeno loggato, lo rispediamo alla home
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
      } else {
        // Se ha già il nome, lo mandiamo via da qui
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        if (profile?.full_name) {
          router.push('/profile');
        } else {
          setChecking(false);
        }
      }
    }
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!realName.trim() || realName.trim().length < 3) {
      return toast.error('Inserisci Nome e Cognome reali (minimo 3 caratteri)');
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utente non autenticato');

      const { error } = await supabase.from('profiles').update({
        full_name: realName.trim()
      }).eq('id', user.id);

      if (error) throw error;

      toast.success('Identità confermata! Buon Mondiale 🏆');
      
      // Forza il reindirizzamento alla dashboard profilo sbloccata
      router.push('/profile');
      // Piccolo hack per forzare il refresh dei componenti di layout se necessario
      setTimeout(() => window.location.href = '/profile', 100);
    } catch (error) {
      toast.error("Errore durante il salvataggio. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-slate-950 text-white px-4 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl text-center animate-in fade-in zoom-in-95 duration-300">
        
        <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-yellow-500/20">
          <ShieldAlert size={32} />
        </div>

        <h1 className="text-3xl font-black text-yellow-500 uppercase italic tracking-tighter leading-none mb-3">
          Ultimo Passo
        </h1>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wide leading-relaxed mb-8">
          Per attivare il tuo account e sbloccare la classifica, dobbiamo sapere chi sei nel mondo reale.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2 px-1">
              Nome e Cognome Reali
            </label>
            <input 
              type="text" 
              placeholder="es. Mario Rossi" 
              className="w-full p-4 bg-slate-950 border-2 border-slate-800 rounded-2xl focus:border-yellow-500 outline-none text-white font-black text-sm uppercase transition-all"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-yellow-500 text-slate-950 font-black rounded-2xl uppercase tracking-widest text-xs mt-4 active:scale-95 shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserCheck size={16} strokeWidth={3} />
            {loading ? 'Salvataggio...' : 'Conferma e Gioca'}
          </button>
        </form>

        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mt-6 italic">
          I profili con nomi falsi o inventati verranno eliminati dall'Admin.
        </p>
      </div>
    </main>
  );
}