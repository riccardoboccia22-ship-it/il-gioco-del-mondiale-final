'use client';

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';
import { supabase } from '@/lib/supabase';

export default function OneSignalInit() {
  useEffect(() => {
    async function initPush() {
      try {
        // 1. Inizializza OneSignal con il TUO App ID
        await OneSignal.init({
          appId: "34f7019f-7b85-4680-8ca3-ca4e10eb3eb2", 
          allowLocalhostAsSecureOrigin: true, // Ti permette di testarlo dal PC
        });

        // 2. Chiede il permesso all'utente (fa comparire il popup nativo)
        await OneSignal.Slidedown.promptPush();

        // 3. Controlliamo se c'è un utente loggato su Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // 4. Collega il telefono a questo specifico utente!
          await OneSignal.login(session.user.id);
        }
      } catch (error) {
        console.error("Errore OneSignal:", error);
      }
    }

    initPush();
  }, []);

  return null; // È invisibile!
}