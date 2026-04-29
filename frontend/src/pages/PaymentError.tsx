import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/Button';

const PaymentError: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');
  const isRaceCondition = reason === 'race_condition';

  // ── Race condition scenario — slot taken, refund in progress ──────────────
  if (isRaceCondition) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 animate-fade-in-up">
        <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-brand-dark text-white p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
            <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20">
              <span className="text-3xl text-amber-500 mb-1">!</span>
            </div>
            <h1 className="text-3xl font-serif text-amber-500 mb-2">Termin zajęty</h1>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">Zwrot 200 PLN w toku</p>
          </div>

          <div className="p-8">
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 mb-6">
              <p className="text-[10px] uppercase tracking-widest text-brand-dark font-bold mb-2">Co się stało?</p>
              <p className="text-xs text-slate-600 font-light leading-relaxed">
                Termin został zajęty przez inną pacjentkę w trakcie przetwarzania Twojej
                płatności. Zwrot zadatku zostanie zaksięgowany automatycznie w ciągu{' '}
                <span className="font-medium text-brand-dark">1–3 dni roboczych</span>.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8">
              <p className="text-[10px] uppercase tracking-widest text-brand-dark font-bold mb-2">
                Ochrona systemu
              </p>
              <p className="text-xs text-slate-600 font-light leading-relaxed">
                System wykrył próbę podwójnej rezerwacji na ten sam termin. Twoja płatność
                nie została zablokowana i wraca na Twoje konto.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <Button fullWidth onClick={() => navigate('/new-patient')} className="text-sm tracking-wide">
                Wybierz inny termin
              </Button>
              <Button fullWidth variant="outline" onClick={() => navigate('/')} className="text-sm tracking-wide">
                Wróć do strony głównej
              </Button>
            </div>

            <p className="text-[10px] text-center text-slate-400 mt-6 uppercase tracking-widest font-medium">
              Pytania? <a href="tel:+48000000000" className="text-champagne hover:underline">+48 000 000 000</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Generic payment error ─────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-brand-dark text-white p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
          <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-serif text-red-500 mb-2">Płatność nieudana</h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">Rezerwacja niepotwierdzona</p>
        </div>

        <div className="p-8">
          <div className="bg-red-50/50 border border-red-100 rounded-2xl p-5 mb-8 text-sm">
            <p className="text-[10px] uppercase tracking-widest text-brand-dark font-bold mb-2">Co się stało?</p>
            <p className="text-xs text-slate-600 font-light leading-relaxed">
              Transakcja nie powiodła się lub została przerwana. Twój termin nie został zarezerwowany, a żadne środki nie zostały pobrane.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <Button fullWidth onClick={() => navigate('/new-patient')} className="text-sm tracking-wide">
              Spróbuj ponownie
            </Button>
            <Button fullWidth variant="outline" onClick={() => navigate('/')} className="text-sm tracking-wide">
              Wróć do strony głównej
            </Button>
          </div>

          <p className="text-[10px] text-center text-slate-400 mt-6 uppercase tracking-widest font-medium">
            Potrzebujesz pomocy? <a href="tel:+48000000000" className="text-champagne hover:underline">+48 000 000 000</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentError;
