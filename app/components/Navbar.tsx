'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Trophy, Star, ListOrdered, Users, Gamepad2 } from 'lucide-react';

const WORLD_CUP_START_DATE = new Date('2025-06-11T21:00:00+02:00');

export default function Navbar() {
  const pathname = usePathname();
  const isExpired = new Date() > WORLD_CUP_START_DATE;

  // Ripristinati i nomi originali
  const navItems = [
    { name: 'Profilo', path: '/profile', icon: <User size={20} strokeWidth={2.5} /> },
    { name: 'Fase Gironi', path: '/matches', icon: <Gamepad2 size={20} strokeWidth={2.5} /> },
    { name: 'Fase Finale', path: '/bracket', icon: <Trophy size={20} strokeWidth={2.5} /> },
    { name: 'Bonus', path: '/bonus', icon: <Star size={20} strokeWidth={2.5} /> },
    { name: 'Classifica', path: '/leaderboard', icon: <ListOrdered size={20} strokeWidth={2.5} /> },
    ...(isExpired ? [{ name: 'Globale', path: '/tutti-i-pronostici', icon: <Users size={20} strokeWidth={2.5} /> }] : []),
  ];

  if (pathname === '/' || pathname === '/login' || pathname === '/admin') return null;

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-slate-950/95 backdrop-blur-md border-t border-slate-900 pb-safe-area shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <Link 
              key={item.path} 
              href={item.path}
              // Altezza totale rigida: h-12
              className="relative flex flex-col items-center justify-between h-12 group transition-all"
              style={{ width: `${100 / navItems.length}%` }}
            >
              
              {/* SCATOLA ICONA: Altezza fissa (h-6). Non si muoverà MAI */}
              <div className="flex items-end justify-center h-6 w-full">
                <div className={`transition-all duration-300 ${isActive ? 'text-yellow-500 scale-110 -translate-y-1' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  {item.icon}
                </div>
              </div>
              
              {/* SCATOLA TESTO: Altezza fissa (h-6). Accetta due righe senza sballare l'icona sopra */}
              <div className="flex items-center justify-center h-6 w-full px-0.5">
                <span className={`text-[7px] sm:text-[8px] font-black uppercase text-center leading-[1.1] tracking-wider transition-colors ${isActive ? 'text-yellow-500' : 'text-slate-600 group-hover:text-slate-400'}`}>
                  {item.name}
                </span>
              </div>

              {/* Indicatore attivo a puntino in basso */}
              {isActive && (
                <div className="absolute -bottom-1.5 w-1.5 h-1.5 bg-yellow-500 rounded-full shadow-[0_0_6px_rgba(234,179,8,0.8)]"></div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}