import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOTP, verifyOTP, getOwnerCalendar } from '../api/client';
import type { Slot, Patient } from '../api/client';
import { useToast } from '../hooks/useToast';
import SlotCalendar from '../components/SlotCalendar';
import ReservationModal from '../components/ReservationModal';
import Button from '../components/Button';
import OtpInput from '../components/OtpInput';
import LoadingSpinner from '../components/LoadingSpinner';

type Step = 'phone' | 'code' | 'calendar';

/** SMS-OTP gated access to clinic owner's private calendar */
const OwnerPatient: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\s/g, '');
    if (!/^\+48\d{9}$/.test(cleanPhone)) {
      setError('Nieprawidłowy numer telefonu. Format: +48XXXXXXXXX');
      return;
    }

    setLoading(true);
    try {
      const result = await sendOTP(cleanPhone);
      setDemoCode(result.demoCode);
      showToast('info', `Kod demo: ${result.demoCode} | ${cleanPhone}`);
      setStep('code');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Błąd wysyłania kodu. Spróbuj ponownie.';
      setError(msg);
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────

  const handleVerifyOTP = async (e?: React.FormEvent, directCode?: string) => {
    if (e) e.preventDefault();
    const finalCode = directCode || code;
    setError('');

    if (!/^\d{6}$/.test(finalCode)) {
      setError('Kod musi mieć dokładnie 6 cyfr.');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOTP(phone.replace(/\s/g, ''), finalCode);
      setPatient(result.patient);

      // Fetch clinic owner's private calendar
      const calendarData = await getOwnerCalendar(result.token);
      setSlots(calendarData.slots);
      showToast('success', 'Weryfikacja zakończona pomyślnie');
      setStep('calendar');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Błąd weryfikacji. Spróbuj ponownie.';
      setError(msg);
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`min-h-screen transition-colors duration-700 ease-out bg-slate-50`}>
      {/* Header */}
      <div className={`pt-10 pb-6 bg-white border-b border-slate-100 shadow-sm`}>
        <div className="max-w-5xl mx-auto px-4">
          <button onClick={() => navigate('/')} className={`transition-colors text-sm flex items-center gap-2 mb-8 uppercase tracking-widest font-medium text-slate-500 hover:text-champagne`}>
            <span>←</span> Powrót
          </button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-serif mb-2 text-brand-dark">
                Prywatny Kalendarz Dr Nowak
              </h1>
              <p className="font-light text-slate-500 text-sm">
                {step === 'phone' && 'Ekskluzywny dostęp dla stałych Pacjentek'}
                {step === 'code' && 'Weryfikacja dwuetapowa'}
                {step === 'calendar' && `Witaj, ${patient?.firstName}! Wybierz dogodny termin.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* ── Step 1: Phone ── */}
        {step === 'phone' && (
          <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 animate-fade-in-up">
            <p className="text-slate-600 font-light leading-relaxed mb-8 text-sm text-center">
              Podaj numer telefonu, którym rezerwowałaś wizyty u Dr Nowak.
              Wyślemy Ci kod autoryzacyjny SMS, aby odblokować Twój prywatny grafik.
            </p>

            <form onSubmit={handleSendOTP} className="space-y-8">
              <div className="relative">
                <label className="text-brand-dark text-xs uppercase tracking-[0.2em] font-bold block mb-2 text-center">Numer telefonu</label>
                <input
                  type="tel"
                  placeholder="+48 600 100 200"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-slate-200 text-brand-dark text-2xl font-light text-center focus:ring-0 focus:border-champagne px-0 py-3 transition-colors placeholder:text-slate-300 outline-none"
                  required
                />
                <p className="text-slate-400 text-[10px] mt-2 font-medium uppercase tracking-widest text-center">Format: +48 XXX XXX XXX</p>
                {error && <p className="text-red-500 text-xs mt-3 text-center">{error}</p>}
              </div>

              <label className="flex items-start gap-4 text-xs text-slate-500 font-light group cursor-pointer bg-slate-50 p-4 rounded-xl border border-slate-100">
                <input type="checkbox" required className="mt-0.5 bg-white border border-slate-300 rounded text-champagne focus:ring-champagne focus:ring-offset-0 cursor-pointer transition-colors group-hover:border-champagne" />
                <span className="group-hover:text-slate-600 transition-colors leading-relaxed">
                  Akceptuję regulamin oraz <a href="#" className="text-champagne hover:underline">politykę prywatności</a>
                  , i wyrażam zgodę na wysłanie kodu SMS.
                </span>
              </label>

              <Button type="submit" fullWidth disabled={loading} className="py-4 text-sm tracking-wide">
                {loading ? 'Przetwarzanie...' : 'Wyślij kod SMS'}
              </Button>
            </form>
          </div>
        )}

        {/* ── Step 2: OTP Code ── */}
        {step === 'code' && (
          <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 animate-fade-in-up">
            <p className="text-slate-600 font-light leading-relaxed mb-6 text-sm text-center">
              Wysłaliśmy bezpieczny kod SMS na numer <br/><span className="text-brand-dark font-medium">{phone}</span>.
            </p>
            
            {/* DEMO: show code */}
            {demoCode && (
              <div className="mb-8 bg-champagne/10 border border-champagne/30 rounded-xl p-4 text-center">
                <p className="text-brand-dark text-[10px] tracking-widest uppercase mb-1 font-bold">Tryb Demo — Twój kod SMS</p>
                <p className="text-brand-dark text-4xl font-serif tracking-widest">{demoCode}</p>
              </div>
            )}

            <form onSubmit={(e) => handleVerifyOTP(e)} className="space-y-8 flex flex-col items-center">
              <div className="w-full">
                <label className="text-brand-dark text-xs uppercase tracking-[0.2em] font-bold block mb-4 text-center">Wpisz kod</label>
                
                <OtpInput 
                  length={6} 
                  error={!!error}
                  onComplete={(c) => {
                    setCode(c);
                    if (c.length === 6) handleVerifyOTP(undefined, c);
                  }} 
                />
                
                {error && <p className="text-red-500 text-xs mt-4 text-center">{error}</p>}
              </div>

              <div className="w-full space-y-4 pt-2">
                <Button type="submit" fullWidth disabled={loading || code.length !== 6} className="py-4 text-sm tracking-wide">
                  {loading ? 'Weryfikacja...' : 'Autoryzuj dostęp'}
                </Button>
                <button type="button" onClick={() => { setStep('phone'); setCode(''); setError(''); }} className="w-full text-slate-400 hover:text-champagne text-xs transition-colors uppercase tracking-widest font-medium py-2">
                  Popraw numer telefonu
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Step 3: Calendar ── */}
        {step === 'calendar' && patient && (
          <div className="animate-fade-in-up">
            <div className="border-b border-slate-100 pb-8 mb-8 flex items-center gap-6">
              <div className="w-16 h-16 bg-brand-dark rounded-full flex items-center justify-center text-champagne font-serif text-2xl shadow-lg">
                {patient.firstName.charAt(0)}
              </div>
              <div>
                <p className="font-serif text-2xl text-brand-dark">{patient.firstName} {patient.lastName}</p>
                <p className="text-sm text-slate-500 font-light mt-1">Status: <span className="text-brand-dark font-medium">Stały Pacjent</span></p>
              </div>
            </div>

            {loading ? (
              <LoadingSpinner message="Przygotowywanie kalendarza..." />
            ) : (
              <SlotCalendar slots={slots} onSelectSlot={setSelectedSlot} />
            )}

            <div className="mt-12 text-center py-8 border-t border-slate-100">
              <p className="text-slate-500 font-light text-sm">
                Potrzebujesz wsparcia z rezerwacją?{' '}
                <a href="tel:+48000000000" className="text-brand-dark font-medium hover:text-champagne transition-colors">
                  +48 000 000 000
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reservation modal */}
      {selectedSlot && patient && (
        <ReservationModal
          slot={selectedSlot}
          prefillPatient={patient}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
};

export default OwnerPatient;
