'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Megaphone } from 'lucide-react';

export default function LiveBanner() {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    async function fetchAnnouncement() {
      const { data } = await supabase.from('app_settings').select('announcement').eq('id', 1).maybeSingle();
      if (data) setAnnouncement(data.announcement || '');
    }
    
    fetchAnnouncement();
    const interval = setInterval(fetchAnnouncement, 60000); // Si aggiorna da solo ogni minuto!
    return () => clearInterval(interval);
  }, []);

  if (!announcement || announcement.trim() === '') return null;

  const isLive = announcement.trim().toUpperCase().startsWith('LIVE:');
  const displayText = isLive ? announcement.replace(/^LIVE:\s*/i, '') : announcement;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-3xl z-50 pointer-events-none">
      <div className={`p-[2px] rounded-full shadow-2xl animate-in slide-in-from-top-10 duration-500 ${isLive ? 'bg-gradient-to-r from-red-600 via-rose-500 to-red-600 shadow-[0_5px_20px_rgba(225,29,72,0.4)]' : 'bg-gradient-to-r from-blue-600 to-blue-400'}`}>
        <div className={`w-full rounded-[calc(9999px-2px)] p-2.5 flex items-center gap-3 overflow-hidden relative ${isLive ? 'bg-red-950' : 'bg-slate-950'}`}>
          
          <style dangerouslySetInnerHTML={{__html: `
            .ticker-container { width: 100%; overflow: hidden; white-space: nowrap; mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }
            .ticker-text { display: inline-block; padding-left: 100%; animation: ticker 15s linear infinite; }
            @keyframes ticker { 0% { transform: translate3d(0, 0, 0); } 100% { transform: translate3d(-100%, 0, 0); } }
          `}} />

          <div className={`relative z-10 shrink-0 flex items-center justify-center shadow-[5px_0_10px_rgba(2,6,23,0.8)] ${isLive ? 'h-6 sm:h-7 px-3 rounded-full bg-red-500/20 border border-red-500/30 gap-1.5' : 'w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-blue-500/20'}`}>
            {isLive ? (
              <>
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-red-500 tracking-wider">Live</span>
              </>
            ) : (
              <Megaphone size={12} className="text-blue-400 animate-pulse" />
            )}
          </div>
          
          <div className="ticker-container flex-1">
            <div className={`ticker-text text-[10px] sm:text-xs font-black uppercase tracking-widest ${isLive ? 'text-red-50' : 'text-slate-200'}`}>
              {displayText}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}