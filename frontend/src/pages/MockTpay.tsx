import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmReservation } from '../api/client';
import { useToast } from '../hooks/useToast';
import Button from '../components/Button';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Format seconds as M:SS (no leading zero on minutes) */
function formatTTL(s: number): string {
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}



// ── Component ─────────────────────────────────────────────────────────────────

const MockTpay: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // URL params
  const reservationId = searchParams.get('reservationId') || '';
  const amount        = searchParams.get('amount') || '200';
  const doctor        = searchParams.get('doctor') || '';
  const date          = searchParams.get('date') || '';
  const time          = searchParams.get('time') || '';

  // TTL countdown (60s for demo = represents 60 min in real system)
  const [ttlSeconds, setTtlSeconds] = useState<number | null>(60);
  const [ttlExpired, setTtlExpired] = useState(false);

  // Payment processing
  const [paying, setPaying]                     = useState(false);
  const [paymentCountdown, setPaymentCountdown] = useState<number | null>(null);
  // Guard against double-click — synchronous unlike setState
  const payingRef = useRef(false);

  // Guard ref — prevents double-firing in React StrictMode (dev mode mounts twice)
  const ttlStartedRef = useRef(false);

  // ── Effect: notify demo panel on mount (TTL started) ──────────────────────
  useEffect(() => {
    if (ttlStartedRef.current) return;
    ttlStartedRef.current = true;

    fetch('http://localhost:3001/api/demo/ttl-start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotInfo: `${doctor} | ${date} ${time}` }),
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect: TTL countdown ─────────────────────────────────────────────────
  useEffect(() => {
    if (ttlSeconds === null) return;
    if (ttlSeconds <= 0) {
      setTtlExpired(true);
      setTimeout(() => navigate(-1), 3000);
      return;
    }
    const timer = setInterval(() => setTtlSeconds((s) => (s !== null ? s - 1 : null)), 1000);
    return () => clearInterval(timer);
  }, [ttlSeconds, navigate]);

  // ── Effect: payment processing countdown ─────────────────────────────────
  useEffect(() => {
    if (paymentCountdown === null) return;
    if (paymentCountdown === 0) {
      // Call backend — it automatically detects race condition
      confirmReservation(reservationId)
        .then((result) => {
          if (result.slotTaken) {
            // Race condition: slot was taken by another user
            showToast('error', 'Slot zajety — inicjujemy zwrot 200 PLN');
            navigate('/payment/error?reason=race_condition');
          } else {
            navigate(`/payment/success?reservationId=${reservationId}`);
          }
        })
        .catch(() => navigate('/payment/error'));
      return;
    }
    const timer = setTimeout(
      () => setPaymentCountdown((c) => (c !== null ? c - 1 : null)),
      1000
    );
    return () => clearTimeout(timer);
  }, [paymentCountdown, reservationId, navigate, showToast]);

  // ── Handler: pay button ───────────────────────────────────────────────────
  const handlePay = () => {
    if (payingRef.current) return; // guard against double-click
    payingRef.current = true;

    setTtlSeconds(null); // stop TTL countdown
    setPaying(true);

    // Start payment processing countdown after brief delay
    setTimeout(() => setPaymentCountdown(3), 3500);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 relative">
          {/* Header */}
          <div className="bg-brand-dark pt-12 pb-8 px-8 text-center relative z-10">
            <div className="absolute top-0 left-0 w-full h-[6px] bg-champagne"></div>
            <h1 className="text-5xl font-serif text-champagne mb-2">Płatność</h1>
            <p className="text-xs uppercase tracking-widest text-champagne/70 font-medium">Bramka weryfikacyjna</p>
          </div>

          <div className="px-8 pb-8 pt-8">
            {/* Simple Timer */}
            {!paying && (
              <div className="mb-4 text-center">
                {ttlExpired ? (
                  <p className="text-red-600 font-medium text-sm bg-red-50 py-2 rounded-lg">
                    Rezerwacja wygasła. Wybierz nowy termin.
                  </p>
                ) : (
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Czas na opłacenie: <span className="text-brand-dark font-bold ml-1">{ttlSeconds !== null ? formatTTL(ttlSeconds) : '--:--'}</span>
                  </p>
                )}
              </div>
            )}

            {/* Hero Amount */}
            <div className="text-center mb-8">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-1">Do zapłaty</p>
              <div className="flex items-start justify-center gap-1.5">
                <span className="text-6xl font-light text-brand-dark tracking-tight leading-none">{amount}</span>
                <span className="text-xl font-medium text-slate-400 mt-1">PLN</span>
              </div>
            </div>

            {/* Subtle Details Box */}
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-4 mb-8">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 pt-0.5">Odbiorca</span>
                <span className="font-medium text-brand-dark text-sm text-right leading-snug">Klinika Estelle</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 pt-0.5">Tytuł</span>
                <span className="font-medium text-brand-dark text-sm text-right w-2/3 leading-snug">Zadatek — {doctor}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 pt-0.5">Termin</span>
                <span className="font-medium text-brand-dark text-sm text-right">{date} {time}</span>
              </div>
            </div>

            {/* Payment method mock */}
            <div className="border border-slate-200 hover:border-champagne transition-colors rounded-2xl p-4 mb-8 flex items-center gap-4 cursor-pointer group">
              <div className="w-12 h-8 bg-brand-dark rounded-md flex items-center justify-center text-white text-[10px] font-bold tracking-wider">
                VISA
              </div>
              <div>
                <p className="text-sm font-medium text-brand-dark">Karta płatnicza</p>
                <p className="text-xs text-slate-400 mt-0.5">**** **** 1234</p>
              </div>
              <div className="ml-auto text-champagne opacity-50 group-hover:opacity-100 transition-opacity">
                <div className="w-5 h-5 rounded-full bg-champagne flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Pay button / processing states */}
            {!paying && !ttlExpired && (
              <button
                type="button"
                className="w-full bg-[#0F172A] text-white rounded-2xl py-4 text-[15px] font-medium tracking-wide shadow-md hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] transition-all duration-300"
                onClick={handlePay}
                disabled={payingRef.current}
              >
                Zapłać {amount} PLN
              </button>
            )}

            {paying && paymentCountdown === null && (
              <div className="text-center py-6">
                <div className="w-10 h-10 mx-auto mb-4 rounded-full border-2 border-slate-100 border-t-champagne animate-spin" />
                <p className="text-brand-dark font-serif text-lg">Weryfikacja płatności</p>
                <p className="text-slate-400 text-xs mt-1">Proszę czekać...</p>
              </div>
            )}

            {paymentCountdown !== null && (
              <div className="text-center py-6">
                <div className="w-10 h-10 mx-auto mb-4 rounded-full border-2 border-slate-100 border-t-emerald-500 animate-spin" />
                <p className="text-brand-dark font-serif text-lg">Przetwarzanie</p>
                <p className="text-slate-400 text-xs mt-1">Przekierowanie za {paymentCountdown}s</p>
              </div>
            )}

            {ttlExpired && (
              <Button type="button" variant="outline" fullWidth className="py-4 text-sm tracking-wide font-medium" onClick={() => navigate(-1)}>
                Wybierz nowy termin
              </Button>
            )}

            <div className="flex items-center justify-center gap-2 mt-8 text-[10px] uppercase tracking-widest text-slate-400 font-medium">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Szyfrowane połączenie SSL
            </div>
          </div>
        </div>

        {!paying && !ttlExpired && (
          <button
            onClick={() => navigate(-1)}
            className="w-full mt-6 text-xs uppercase tracking-widest font-medium text-slate-400 hover:text-brand-dark transition-colors"
          >
            ← Anuluj i wróć
          </button>
        )}
      </div>
    </div>
  );
};

export default MockTpay;
