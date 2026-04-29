import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import { useToast } from '../hooks/useToast';
import { joinWaitlistOwner, joinWaitlistDoctors } from '../api/client';
import CustomSelect from './CustomSelect';

interface WaitlistFormProps {
  type: 'owner' | 'doctors';
  onSuccess?: () => void;
  onClose?: () => void;
}

const WaitlistForm: React.FC<WaitlistFormProps> = ({ type, onSuccess, onClose }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    serviceInterest: '',
    preferredTime: '',
    newsletterConsent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showToast } = useToast();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Imię jest wymagane';
    if (!form.lastName.trim()) e.lastName = 'Nazwisko jest wymagane';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Podaj prawidłowy adres email';
    if (!form.phone.trim()) e.phone = 'Numer telefonu jest wymagany';
    if (!form.newsletterConsent) e.newsletterConsent = 'Zgoda jest wymagana';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      if (type === 'owner') {
        await joinWaitlistOwner(form);
      } else {
        await joinWaitlistDoctors(form);
      }
      showToast('success', 'Zapisano na listę rezerwową');
      setSubmitted(true);
      onSuccess?.();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Wystąpił błąd. Spróbuj ponownie.';
      showToast('error', msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
          <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-brand mb-2">Jesteś na liście!</h3>
        <p className="text-gray-600 mb-6">
          Dziękujemy, <strong>{form.firstName}</strong>. Powiadomimy Cię SMS-em i mailem,
          gdy tylko zwolni się termin{type === 'owner' ? ' u Dr Nowak' : ' u lekarzy'}.
        </p>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Zamknij
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type === 'owner' && (
        <div className="bg-champagne/5 border border-champagne/20 rounded-xl p-5 text-sm flex gap-4 mb-6">
          <svg className="w-5 h-5 text-champagne flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-serif text-brand-dark mb-2 text-base">Zanim się zapiszesz, pamiętaj:</p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-600 leading-relaxed">
              <li>Czas reakcji ma kluczowe znaczenie po otrzymaniu SMS.</li>
              <li>Powiadomienia przychodzą z krótkim wyprzedzeniem (1–2 dni).</li>
              <li>Zapisanie się na listę nie gwarantuje uzyskania terminu, ale daje pierwszeństwo.</li>
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Imię"
          placeholder="Anna"
          value={form.firstName}
          onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
          error={errors.firstName}
          required
        />
        <Input
          label="Nazwisko"
          placeholder="Kowalska"
          value={form.lastName}
          onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
          error={errors.lastName}
          required
        />
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="anna@example.com"
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 border-b border-slate-100">
        <div className="space-y-1">
          <label className="block text-xs uppercase tracking-widest font-semibold text-slate-400 mb-1">Zabieg (opcjonalnie)</label>
          <CustomSelect
            value={form.serviceInterest}
            onChange={val => setForm(f => ({ ...f, serviceInterest: val }))}
            options={[
              { value: 'konsultacja', label: 'Konsultacja' },
              { value: 'estetyczna', label: 'Medycyna Estetyczna' },
              { value: 'laser', label: 'Laseroterapia' },
              { value: 'inne', label: 'Inne / Nie wiem' },
            ]}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs uppercase tracking-widest font-semibold text-slate-400 mb-1">Pora (opcjonalnie)</label>
          <CustomSelect
            value={form.preferredTime}
            onChange={val => setForm(f => ({ ...f, preferredTime: val }))}
            options={[
              { value: 'rano', label: 'Tylko rano (do 12)' },
              { value: 'popoludnie', label: 'Popołudnia (po 15)' },
              { value: 'dowolna', label: 'Dowolna pora' },
            ]}
          />
        </div>
      </div>

      <label className="flex items-start gap-4 cursor-pointer group mt-6 mb-8">
        <input
          type="checkbox"
          checked={form.newsletterConsent}
          onChange={e => setForm(f => ({ ...f, newsletterConsent: e.target.checked }))}
          className="mt-1 w-4 h-4 text-champagne border-slate-300 rounded focus:ring-champagne focus:ring-offset-0 transition-colors cursor-pointer group-hover:border-champagne"
        />
        <span className="text-xs text-slate-500 font-light group-hover:text-slate-700 transition-colors">
          Wyrażam zgodę na otrzymywanie informacji o wolnych terminach i akceptuję{' '}
          <a href="#" className="text-champagne hover:underline font-medium">politykę prywatności</a>
        </span>
      </label>
      {errors.newsletterConsent && (
        <p className="text-xs text-red-500 font-medium -mt-6 mb-4">{errors.newsletterConsent}</p>
      )}

      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {errors.general}
        </div>
      )}

      <Button type="submit" fullWidth loading={loading} className="py-4 text-sm tracking-wide font-medium">
        Zapisuję się na listę rezerwową
      </Button>
    </form>
  );
};

export default WaitlistForm;
