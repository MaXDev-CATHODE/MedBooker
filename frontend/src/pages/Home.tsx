import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FAQ from '../components/FAQ';
import WaitlistForm from '../components/WaitlistForm';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Hero Section ── */}
      <section className="relative bg-gradient-to-b from-brand-pale to-slate-50">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            
            {/* Text content */}
            <div className="order-2 md:order-1">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-brand-dark leading-tight mb-6">
                Zarezerwuj wizytę w Klinice Estelle
              </h1>
              <p className="text-slate-600 mb-6 leading-relaxed text-lg font-light">
                Witaj! Ze względu na ogromne zainteresowanie, osobiście opiekuję się wąską grupą stałych Pacjentów.
                Zależy mi jednak na najwyższej jakości, dlatego zbudowałam zespół wybitnych specjalistów pracujących 
                według moich autorskich procedur. Wybierz lekarza z mojego zespołu – gwarantuję Ci tę samą jakość i filozofię.
              </p>
              <p className="text-slate-500 mb-8 leading-relaxed font-light">
                A jeśli jesteś już w gronie moich stałych Pacjentek, zweryfikuj się poniżej.
              </p>

              {/* Navigation buttons */}
              <div className="space-y-6">
                {/* Main CTA - Solid Navy */}
                <button
                  onClick={() => navigate('/new-patient')}
                  className="w-full bg-brand-dark text-white py-4 px-6 rounded-xl text-left flex items-center justify-between group shadow-lg shadow-brand-dark/10 hover:bg-black hover:shadow-2xl hover:shadow-brand-dark/20 hover:-translate-y-1 transition-all duration-500 ease-out"
                >
                  <div>
                    <div className="text-lg font-medium">Nowy Pacjent – Pierwsza Wizyta</div>
                    <div className="text-slate-300 text-sm font-light mt-1">Konsultacja i rozpoczęcie planu leczenia z Zespołem</div>
                  </div>
                  <span className="text-2xl opacity-70 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500 ease-out">→</span>
                </button>

                <div className="pt-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] mb-4 pl-2">
                    Strefa Stałego Pacjenta
                  </p>
                  
                  <div className="space-y-3">
                    {/* VIP Button 1 - Ghost/Champagne */}
                    <button
                      onClick={() => navigate('/owner-patient')}
                      className="w-full bg-transparent border border-champagne/40 text-brand-dark py-4 px-6 rounded-xl text-left flex items-center justify-between group hover:border-champagne hover:bg-champagne/5 hover:shadow-lg hover:shadow-champagne/10 hover:-translate-y-1 transition-all duration-500 ease-out"
                    >
                      <div>
                        <div className="text-lg font-medium text-brand-dark">Prywatny Kalendarz Dr Nowak</div>
                        <div className="text-slate-500 text-sm font-light mt-1 group-hover:text-brand-dark/70 transition-colors duration-500">Ekskluzywny dostęp dla dotychczasowych Pacjentek</div>
                      </div>
                      <span className="text-xl text-champagne opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500 ease-out">→</span>
                    </button>

                    {/* VIP Button 2 - Ghost/Slate */}
                    <button
                      onClick={() => navigate('/team-patient')}
                      className="w-full bg-transparent border border-slate-200 text-brand-dark py-4 px-6 rounded-xl text-left flex items-center justify-between group hover:border-slate-300 hover:bg-slate-50 hover:shadow-md hover:-translate-y-1 transition-all duration-500 ease-out"
                    >
                      <div>
                        <div className="text-lg font-medium text-brand-dark">Kontynuacja Leczenia</div>
                        <div className="text-slate-500 text-sm font-light mt-1 group-hover:text-brand-dark/70 transition-colors duration-500">Umów wizytę u swojego lekarza prowadzącego</div>
                      </div>
                      <span className="text-xl text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500 ease-out">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Video placeholder */}
            <div className="order-1 md:order-2 relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5] flex items-center justify-center group cursor-pointer border border-champagne/20">
              <div className="absolute inset-0 bg-champagne blur-3xl opacity-20 transform scale-110"></div>
              
              <img 
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1920" 
                alt="Wnętrze kliniki medycyny estetycznej" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/30 transition-colors duration-500"></div>
              
              <div className="relative z-10 w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)] group-hover:shadow-[0_0_50px_var(--color-champagne)] group-hover:scale-110 transition-all duration-500">
                <svg className="w-8 h-8 text-slate-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                className="absolute top-6 right-6 bg-black/40 hover:bg-black/60 text-white px-4 py-2 rounded-xl text-xs font-medium backdrop-blur-md flex items-center gap-2 border border-white/20 transition-all z-20"
              >
                {isMuted ? 'Włącz dźwięk' : 'Wycisz'}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── Waitlist CTA ── */}
      <section className="bg-white border-b border-gray-100 py-6 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-600 text-sm">
            Chcesz dostać się do Dr Nowak?{' '}
            <button
              onClick={() => setShowWaitlistModal(true)}
              className="text-brand font-semibold underline hover:no-underline"
            >
              Zapisz się na listę oczekujących →
            </button>
          </p>
        </div>
      </section>

      {/* ── Architecture link (for technical audience) ── */}
      <section className="bg-slate-900 py-4 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <p className="text-slate-400 text-xs font-mono">
              Demo systemu rezerwacji — wszystkie integracje symulowane
            </p>
          </div>
          <Link
            to="/architecture"
            className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-[var(--color-champagne)] transition-colors uppercase tracking-widest flex-shrink-0"
          >
            Architektura systemu →
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FAQ />

      {/* ── Footer ── */}
      <footer className="bg-brand-dark text-slate-300/80 py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          
          <div className="md:col-span-5 pr-0 md:pr-12">
            <h3 className="text-slate-100/90 font-serif text-2xl mb-6 tracking-wide">Klinika Estelle</h3>
            <p className="text-sm leading-relaxed mb-6 font-light">
              Nowoczesna medycyna estetyczna i opieka na najwyższym poziomie. Zespół specjalistów pod kierownictwem Dr Aleksandry Nowak. 
              Dbamy o to, aby każda wizyta przebiegała w atmosferze pełnego profesjonalizmu i luksusu.
            </p>
          </div>
          
          <div className="md:col-span-4">
            <h3 className="text-slate-100/90 font-serif text-xl mb-6 tracking-wide">Kontakt</h3>
            <ul className="space-y-4 text-sm font-light">
              <li className="flex flex-col">
                <span className="text-champagne/90 text-[11px] uppercase tracking-[0.15em] font-medium mb-1">Adres</span>
                <span className="text-slate-300/90">ul. Przykładowa 12/3, Warszawa</span>
              </li>
              <li className="flex flex-col">
                <span className="text-champagne/90 text-[11px] uppercase tracking-[0.15em] font-medium mb-1">Recepcja</span>
                <span className="text-slate-300/90">+48 000 000 000</span>
              </li>
              <li className="flex flex-col">
                <span className="text-champagne/90 text-[11px] uppercase tracking-[0.15em] font-medium mb-1">Godziny otwarcia</span>
                <span className="text-slate-300/90">Czynne 7 dni w tygodniu</span>
              </li>
            </ul>
          </div>
          
          <div className="md:col-span-3">
            <h3 className="text-slate-100/90 font-serif text-xl mb-6 tracking-wide">Informacje</h3>
            <ul className="space-y-3 text-sm font-light">
              <li><a href="#" className="hover:text-champagne transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-champagne transition-colors">Regulamin rezerwacji wizyt</a></li>
              <li><a href="#" className="hover:text-champagne transition-colors">Polityka Prywatności (RODO)</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/5 text-[11px] font-light text-slate-500/80 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Klinika Estelle. Wszelkie prawa zastrzeżone.</p>
          <div className="space-x-6">
            <a href="#" className="hover:text-champagne transition-colors">Polityka Cookies</a>
            <a href="#" className="hover:text-champagne transition-colors">Ochrona Danych</a>
          </div>
        </div>
      </footer>

      {/* ── Waitlist Modal ── */}
      {showWaitlistModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full max-h-[90dvh] overflow-y-auto relative">
            <div className="p-8 pb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-champagne text-xs uppercase tracking-widest font-semibold mb-2">Powiadomienia SMS</p>
                  <h2 className="text-3xl font-serif text-brand-dark pr-4">Lista oczekujących</h2>
                </div>
                <button onClick={() => setShowWaitlistModal(false)} className="text-slate-400 hover:text-champagne transition-colors p-2 -mt-2 -mr-2">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-8 pt-0">
              <WaitlistForm type="owner" onClose={() => setShowWaitlistModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
