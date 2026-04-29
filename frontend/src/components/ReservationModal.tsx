import React, { useState } from 'react';
import type { Slot } from '../api/client';
import { createReservation } from '../api/client';
import { useToast } from '../hooks/useToast';
import Button from './Button';
import Input from './Input';

interface ReservationModalProps {
  slot: Slot;
  prefillPatient?: { firstName: string; lastName: string; email: string };
  onClose: () => void;
}

function formatDatePL(dateStr: string, time: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) + ` o ${time}`;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ slot, prefillPatient, onClose }) => {
  const [form, setForm] = useState({
    firstName: prefillPatient?.firstName || '',
    lastName: prefillPatient?.lastName || '',
    email: prefillPatient?.email || '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const isPrefilled = !!prefillPatient;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Imię jest wymagane';
    if (!form.lastName.trim()) e.lastName = 'Nazwisko jest wymagane';
    if (!form.email.trim()) e.email = 'Email jest wymagany';
    if (!form.phone.trim()) e.phone = 'Telefon jest wymagany';
    return e;
  };

  const handleReserve = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const result = await createReservation({
        slotId: slot.id,
        doctorId: slot.doctorId,
        doctorName: slot.doctorName,
        date: slot.date,
        time: slot.time,
        patient: form,
      });

      // Redirect to mock Tpay payment page
      window.location.href = result.paymentUrl;
    } catch (err: any) {
      if (err.response?.status === 409) {
        // Slot was confirmed by another user between slot selection and payment
        showToast('error', 'Slot zajety — wybierz inny termin');
        onClose();
        return;
      }
      const msg = err.response?.data?.error || 'Błąd tworzenia rezerwacji.';
      showToast('error', msg);
      setErrors({ general: msg });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full max-h-[90dvh] overflow-y-auto relative">
        {/* Header */}
        <div className="p-8 pb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-champagne text-xs uppercase tracking-widest font-semibold mb-2">Krok 1 z 2 — Twoje dane</p>
              <h2 className="text-3xl font-serif text-brand-dark">Potwierdzenie rezerwacji</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-champagne transition-colors p-2 -mt-2 -mr-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Slot summary */}
        <div className="bg-champagne/5 border border-champagne/20 p-5 mx-8 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-dark rounded-full flex items-center justify-center text-champagne font-serif text-lg shadow-md">
              {slot.doctorName.split(' ').pop()?.charAt(0)}
            </div>
            <div>
              <p className="font-serif text-lg text-brand-dark">{slot.doctorName}</p>
              <p className="text-sm text-slate-500 font-light capitalize">{formatDatePL(slot.date, slot.time)}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-champagne/20 flex justify-between items-center">
            <span className="text-xs uppercase tracking-widest text-slate-500 font-medium">Zadatek (odliczany)</span>
            <span className="font-serif text-xl text-brand-dark">200 PLN</span>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Input
              label="Imię"
              value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
              disabled={isPrefilled}
              error={errors.firstName}
              required
            />
            <Input
              label="Nazwisko"
              value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
              disabled={isPrefilled}
              error={errors.lastName}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            disabled={isPrefilled}
            error={errors.email}
            required
          />
          <Input
            label="Telefon"
            type="tel"
            placeholder="+48 600 100 200"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            error={errors.phone}
            required
          />

          {isPrefilled && (
            <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl p-4 font-light leading-relaxed">
              <span className="font-medium text-slate-700">Dane zweryfikowane</span><br/>
              Twoje dane zostały wypełnione automatycznie po weryfikacji SMS. W celu ich zmiany skontaktuj się z recepcją.
            </p>
          )}

          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium">
              {errors.general}
            </div>
          )}

          <div className="pt-4">
            <Button fullWidth size="lg" loading={loading} onClick={handleReserve} className="text-sm tracking-wide">
              Zarezerwuj i opłać zadatek
            </Button>
            <p className="text-xs text-center text-slate-400 mt-4 uppercase tracking-widest font-medium">
              Bezpieczna bramka płatnicza Tpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
