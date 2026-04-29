import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getReservation } from '../api/client';
import Button from '../components/Button';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<any>(null);

  const reservationId = searchParams.get('reservationId');

  useEffect(() => {
    if (reservationId) {
      getReservation(reservationId).then(setReservation).catch(() => {});
    }
  }, [reservationId]);

  function formatDatePL(dateStr: string, time: string): string {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ` ${time}`;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
        {/* Success header */}
        <div className="bg-brand-dark text-white p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[6px] bg-champagne"></div>
          <div className="w-16 h-16 mx-auto bg-champagne/10 rounded-full flex items-center justify-center mb-6 border border-champagne/20">
            <svg className="w-8 h-8 text-champagne" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-serif text-champagne mb-3">Rezerwacja potwierdzona</h1>
          <p className="text-champagne/70 text-[10px] uppercase tracking-widest font-semibold">Płatność zakończona sukcesem</p>
        </div>

        <div className="px-8 pb-10 pt-8">
          {reservation && (
            <>
              {/* Hero Amount */}
              <div className="text-center mb-8">
                <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-2">Opłacono zadatek</p>
                <div className="flex items-start justify-center gap-1.5">
                  <span className="text-6xl font-light text-brand-dark tracking-tight leading-none">200</span>
                  <span className="text-xl font-medium text-slate-400 mt-1">PLN</span>
                </div>
              </div>

              {/* Details Box */}
              <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-4 mb-8">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 pt-0.5">Lekarz</span>
                  <span className="font-medium text-brand-dark text-sm text-right leading-snug">{reservation.doctorName}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 pt-0.5">Pacjentka</span>
                  <span className="font-medium text-brand-dark text-sm text-right leading-snug">
                    {reservation.patient?.firstName} {reservation.patient?.lastName}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 pt-0.5">Termin</span>
                  <span className="font-medium text-brand-dark text-sm text-right leading-snug">{formatDatePL(reservation.date, reservation.time)}</span>
                </div>
              </div>
            </>
          )}

          <div className="bg-champagne/5 border border-champagne/20 rounded-2xl p-5 mb-8">
            <p className="text-[10px] uppercase tracking-widest text-brand-dark font-bold mb-3">Co dalej?</p>
            <ul className="space-y-2 text-xs text-slate-600 font-light leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-champagne mt-0.5">—</span>
                Potwierdzenie wysłane SMS-em i emailem
              </li>
              <li className="flex items-start gap-2">
                <span className="text-champagne mt-0.5">—</span>
                Zaproszenie do kalendarza wysłane przez system
              </li>
              <li className="flex items-start gap-2">
                <span className="text-champagne mt-0.5">—</span>
                Możliwość przełożenia wizyty (min. 24h przed)
              </li>
            </ul>
          </div>

          <Button fullWidth variant="outline" onClick={() => navigate('/')}>
            Wróć do strony głównej
          </Button>

          <p className="text-[10px] text-center text-slate-400 mt-6 uppercase tracking-widest font-medium">
            Pytania? <a href="tel:+48000000000" className="text-champagne hover:underline">+48 000 000 000</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
