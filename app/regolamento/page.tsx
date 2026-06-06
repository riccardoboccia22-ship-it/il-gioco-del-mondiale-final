'use client';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Star, 
  AlertCircle, 
  Clock, 
  Scale,
  ArrowLeft,
  Gift,
  Medal,
  LayoutGrid
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegolamentoPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 pb-32 font-sans relative">
      
      {/* PULSANTE INDIETRO */}
      <button 
        onClick={() => router.back()} 
        className="absolute top-6 left-4 text-slate-500 hover:text-yellow-500 transition-colors flex items-center gap-1.5 font-black uppercase text-[10px] tracking-widest z-10"
      >
        <ArrowLeft size={16} /> Indietro
      </button>

      <header className="text-center mb-10 pt-6">
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-500/10 p-4 rounded-full border border-yellow-500/20 mt-6 sm:mt-0">
            <BookOpen size={40} className="text-yellow-500" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-yellow-500 uppercase italic tracking-tighter">
          Regolamento
        </h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">
          Le regole ufficiali del torneo
        </p>
      </header>

      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* 0. SCADENZE */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-rose-500"></div>
          <div className="flex items-center gap-3 mb-6">
            <Clock className="text-rose-500" size={24} />
            <h2 className="text-xl font-black uppercase italic tracking-tight">Scadenze e Limiti</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            Tutti i pronostici (Gironi, Tabellone e Bonus) devono essere salvati tassativamente prima del calcio d'inizio della prima partita (<strong>11 Giugno 2026 alle ore 21:00</strong>).
          </p>
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex gap-3 items-start">
            <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={16} />
            <p className="text-xs text-rose-200 font-medium leading-relaxed">
              Allo scoccare dell'orario limite, il sistema bloccherà automaticamente tutti i salvataggi. Le quote di partecipazione devono essere saldate all'Admin per validare l'iscrizione.
            </p>
          </div>
        </section>

        {/* 1. GIRONI */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
          <div className="flex items-center gap-3 mb-6">
            <Target className="text-emerald-500" size={24} />
            <h2 className="text-xl font-black uppercase italic tracking-tight">1. Fase a Gironi</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Ogni partita indovinata assegna punti in base alla precisione. I punti <strong>non si sommano</strong>, si prende il punteggio più alto ottenuto per match.
          </p>
          
          <div className="space-y-3">
            <div className="bg-slate-950 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="font-black text-emerald-400 uppercase text-xs mb-1">Risultato Esatto</h3>
                <p className="text-[10px] text-slate-500">Es. Pronostico 2-1 | Risultato 2-1</p>
              </div>
              <span className="text-xl font-black text-emerald-500 italic">+10 PT</span>
            </div>

            <div className="bg-slate-950 border border-yellow-500/30 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="font-black text-yellow-500 uppercase text-xs mb-1">Segno + 1 Gol</h3>
                <p className="text-[10px] text-slate-500">Azzecchi chi vince e i gol di una squadra.</p>
              </div>
              <span className="text-xl font-black text-yellow-500 italic">+6 PT</span>
            </div>

            <div className="bg-slate-950 border border-amber-600/30 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="font-black text-amber-500 uppercase text-xs mb-1">Solo Segno (1 X 2)</h3>
                <p className="text-[10px] text-slate-500">Indovini solo chi vince (o il pareggio).</p>
              </div>
              <span className="text-xl font-black text-amber-500 italic">+4 PT</span>
            </div>

            <div className="bg-slate-950 border border-slate-700 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-400 uppercase text-xs mb-1">Solo 1 Gol</h3>
                <p className="text-[10px] text-slate-500">Sbagli segno, ma prendi i gol di una squadra.</p>
              </div>
              <span className="text-xl font-black text-slate-400 italic">+2 PT</span>
            </div>
          </div>
        </section>

        {/* 2. TABELLONE */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="text-blue-500" size={24} />
            <h2 className="text-xl font-black uppercase italic tracking-tight">2. Tabellone Finale</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Riceverai punti per <strong>ogni squadra</strong> che raggiunge effettivamente la fase che hai pronosticato, a prescindere dal suo percorso reale.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { l: 'Sedicesimi', pt: 2 },
              { l: 'Ottavi', pt: 4 },
              { l: 'Quarti', pt: 6 },
              { l: 'Semifinali', pt: 8 },
              { l: 'Finaliste', pt: 10 },
              { l: 'Campione', pt: 20 },
            ].map(stage => (
              <div key={stage.l} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stage.l}</p>
                <p className="text-lg font-black text-blue-400 italic">+{stage.pt} PT</p>
                <p className="text-[8px] text-slate-600 mt-1">per squadra</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. BONUS */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-purple-500"></div>
          <div className="flex items-center gap-3 mb-6">
            <Star className="text-purple-500" size={24} />
            <h2 className="text-xl font-black uppercase italic tracking-tight">3. Domande Bonus</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Rispondi alle 9 domande secche per accumulare fino a 54 punti extra.
          </p>

          <div className="space-y-2">
            <div className="flex justify-between items-center bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <span className="font-black text-xs uppercase text-slate-300">MVP / Capocannoniere / Portiere</span>
              <span className="font-black text-purple-400">+10 PT</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <span className="font-black text-xs uppercase text-slate-300">Match/Gironi Gol + o -</span>
              <span className="font-black text-purple-400">+5 PT</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <span className="font-black text-xs uppercase text-slate-300">Totale Rossi / Rigori / Autogol</span>
              <span className="font-black text-purple-400">+3 PT</span>
            </div>
          </div>
        </section>

        {/* 4. PREMI E CATEGORIE */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-amber-400"></div>
          <div className="flex items-center gap-3 mb-6">
            <Gift className="text-amber-400" size={24} />
            <h2 className="text-xl font-black uppercase italic tracking-tight">4. Premi e Categorie</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Il montepremi verrà diviso su ben 10 piazzamenti. Nessun giocatore può accumulare più di un premio (Regola Anti-Ingordigia).
          </p>

          <div className="space-y-4">
            {/* GRUPPO 1: PODIO */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <h3 className="font-black text-yellow-500 uppercase text-xs mb-3 flex items-center gap-2">
                <Medal size={16} /> Podio Generale
              </h3>
              <ul className="space-y-2 text-[11px] text-slate-300 font-medium">
                <li>🥇 <strong>1° Classificato:</strong> Campione assoluto del torneo.</li>
                <li>🥈 <strong>2° Classificato:</strong> Vice-campione.</li>
                <li>🥉 <strong>3° Classificato:</strong> Terzo gradino del podio.</li>
                <li>🪵 <strong>4° Classificato:</strong> Premio "Medaglia di Legno".</li>
                <li>🎖️ <strong>5° Classificato:</strong> Ultimo premio di consolazione.</li>
              </ul>
            </div>

            {/* GRUPPO 2: FASI */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <h3 className="font-black text-blue-400 uppercase text-xs mb-3 flex items-center gap-2">
                <LayoutGrid size={16} /> Premi per Fase
              </h3>
              <ul className="space-y-3 text-[11px] text-slate-300 font-medium">
                <li>🏟️ <strong>Il Re dei Gironi:</strong> Miglior punteggio calcolato unicamente sulle 72 partite dei gironi.</li>
                <li>⚡ <strong>Il Mago dei Playoff:</strong> Miglior punteggio calcolato unicamente dal tabellone (ottavi-finale).</li>
                <li>🔮 <strong>L'Oracolo dei Bonus:</strong> Miglior punteggio ottenuto unicamente con le 9 risposte bonus.</li>
              </ul>
            </div>

            {/* GRUPPO 3: SPECIALITÀ */}
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl">
              <h3 className="font-black text-emerald-400 uppercase text-xs mb-3 flex items-center gap-2">
                <Target size={16} /> Premi di Specialità
              </h3>
              <ul className="space-y-3 text-[11px] text-slate-300 font-medium">
                <li>🎯 <strong>Il Cecchino:</strong> Chi indovina più "Risultati Esatti" (+10 pt) nella fase a gironi.</li>
                <li>🧊 <strong>Zero Assoluto:</strong> Premio goliardico a chi chiude i gironi con ZERO risultati esatti. In caso di parità, vince chi è più in basso in classifica generale.</li>
              </ul>
            </div>

            {/* Regola Anti-Ingordigia */}
            <div className="bg-rose-950/20 border border-rose-900/30 p-4 rounded-xl mt-4 text-center">
              <h4 className="text-[10px] font-black uppercase text-rose-500 tracking-widest mb-1">⚠️ Regola Anti-Ingordigia e Gerarchia</h4>
              <p className="text-[10px] text-rose-200/80 leading-relaxed italic mb-2">
                Nessun giocatore può vincere più di un premio. Se un giocatore si qualifica per due o più premi, gli verrà assegnato quello di <strong>maggior valore/prestigio</strong>, e l'altro premio scivolerà automaticamente al giocatore successivo in classifica.
              </p>
              <p className="text-[10px] text-rose-200/80 leading-relaxed font-bold uppercase tracking-wider">
                Gerarchia: Podio Generale (Top 5) ➔ Premi per Fase ➔ Premi di Specialità ➔ Zero Assoluto.
              </p>
            </div>
          </div>
        </section>

        {/* 5. SPAREGGI */}
        <section className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-orange-500"></div>
          <div className="flex items-center gap-3 mb-6">
            <Scale className="text-orange-500" size={24} />
            <h2 className="text-xl font-black uppercase italic tracking-tight">5. Criteri di Spareggio</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            In caso di parità punti, la posizione in classifica viene determinata seguendo questo ordine di priorità:
          </p>

          <div className="space-y-3">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-black text-orange-500 shrink-0 border border-slate-700 text-xs">1</div>
              <div>
                <h3 className="font-black text-slate-200 uppercase text-[10px] tracking-wider">Risultati Esatti (Gironi)</h3>
                <p className="text-[9px] text-slate-500 mt-1 italic">Chi ha indovinato più punteggi perfetti da +10 PT.</p>
              </div>
            </div>
            
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-black text-orange-500 shrink-0 border border-slate-700 text-xs">2</div>
              <div>
                <h3 className="font-black text-slate-200 uppercase text-[10px] tracking-wider">Punti Bonus Totali</h3>
                <p className="text-[9px] text-slate-500 mt-1 italic">Maggior punteggio ottenuto nelle domande bonus.</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-black text-orange-500 shrink-0 border border-slate-700 text-xs">3</div>
              <div>
                <h3 className="font-black text-slate-200 uppercase text-[10px] tracking-wider">Qualità del Tabellone</h3>
                <p className="text-[9px] text-slate-500 mt-1 italic">Punti fatti nelle fasi più avanzate (Campione Mondiale → Finale → SF ecc).</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-black text-orange-500 shrink-0 border border-slate-700 text-xs">4</div>
              <div>
                <h3 className="font-black text-slate-200 uppercase text-[10px] tracking-wider">Ex aequo</h3>
                <p className="text-[9px] text-slate-500 mt-1 italic">Se persiste la parità assoluta, il premio viene diviso in parti uguali.</p>
              </div>
            </div>
          </div>
        </section>

      </div>

      <div className="text-center mt-12 mb-8">
        <Link href="/profile" className="inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 border border-slate-800 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95">
          Torna al Profilo
        </Link>
      </div>
    </main>
  );
}