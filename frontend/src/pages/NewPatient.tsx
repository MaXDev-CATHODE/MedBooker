import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllSlots, getDoctors } from '../api/client';
import type { Slot, Doctor } from '../api/client';
import SlotCalendar from '../components/SlotCalendar';
import ReservationModal from '../components/ReservationModal';
import WaitlistForm from '../components/WaitlistForm';
import LoadingSpinner from '../components/LoadingSpinner';

/** First-visit booking flow — browse team doctors and select a slot */
const NewPatient: React.FC = () => {
  const navigate = useNavigate();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getAllSlots(), getDoctors()])
      .then(([slotsData, doctorsData]) => {
        setSlots(slotsData);
        setDoctors(doctorsData);
        setSelectedDoctors(doctorsData.map(d => d.id));
      })
      .catch(() => setError('Błąd ładowania terminów. Spróbuj odświeżyć stronę.'))
      .finally(() => setLoading(false));
  }, []);

  const toggleDoctor = (doctorId: string) => {
    setSelectedDoctors(prev =>
      prev.includes(doctorId)
        ? prev.filter(id => id !== doctorId)
        : [...prev, doctorId]
    );
  };

  const filteredSlots = useMemo(
    () => slots.filter(s => selectedDoctors.includes(s.doctorId)),
    [slots, selectedDoctors]
  );

  const noSlotsIn30Days = slots.length === 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 pt-10 pb-6">
        <div className="max-w-5xl mx-auto px-4">
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-champagne transition-colors text-xs flex items-center gap-2 mb-8 uppercase tracking-widest font-medium">
            <span>←</span> Powrót
          </button>
          <div>
            <h1 className="text-4xl font-serif text-brand-dark mb-2">Pierwsza Wizyta</h1>
            <p className="text-slate-500 font-light">Konsultacja i rozpoczęcie planu leczenia z Zespołem</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading && <LoadingSpinner message="Ładowanie dostępnych terminów..." />}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {noSlotsIn30Days ? (
              /* No slots — show waitlist */
              <div className="max-w-lg mx-auto py-12">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-serif text-brand-dark mb-4">
                    Brak wolnych terminów
                  </h2>
                  <p className="text-slate-500 font-light leading-relaxed">
                    Obecnie wszystkie terminy na najbliższe 30 dni są zarezerwowane. Zapisz się na listę oczekujących, a powiadomimy Cię SMS-em, gdy tylko zwolni się miejsce.
                  </p>
                </div>
                <WaitlistForm type="doctors" />
              </div>
            ) : (
              <>
                {/* Doctor filter */}
                <div className="mb-12">
                  <p className="text-xs uppercase tracking-[0.15em] font-medium text-slate-400 mb-4 pl-1">Filtruj po lekarzu:</p>
                  <div className="flex flex-wrap gap-3">
                    {doctors.map(doctor => (
                      <label
                        key={doctor.id}
                        className={`
                          flex items-center justify-center px-6 py-3 rounded-xl border cursor-pointer text-sm transition-all duration-300 ease-out
                          ${selectedDoctors.includes(doctor.id)
                            ? 'border-brand-dark bg-brand-dark text-white shadow-md'
                            : 'border-slate-200 bg-transparent text-slate-600 hover:border-champagne hover:bg-champagne/5 hover:text-brand-dark hover:-translate-y-0.5'
                          }
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDoctors.includes(doctor.id)}
                          onChange={() => toggleDoctor(doctor.id)}
                          className="sr-only"
                        />
                        <span className="font-medium tracking-wide">{doctor.name.replace('Dr ', 'Dr ')}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs font-light text-slate-400 mt-4 pl-1">
                    Znaleziono <span className="font-medium text-brand-dark">{filteredSlots.length}</span> dostępnych terminów
                  </p>
                </div>

                {/* Calendar */}
                <SlotCalendar
                  slots={filteredSlots}
                  onSelectSlot={setSelectedSlot}
                />

                {/* CTA */}
                <div className="mt-12 text-center py-8 border-t border-slate-100">
                  <p className="text-slate-500 font-light text-sm">
                    Potrzebujesz pomocy z rezerwacją?{' '}
                    <a href="tel:+48000000000" className="text-brand-dark font-medium hover:text-champagne transition-colors">
                      +48 000 000 000
                    </a>
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Reservation modal */}
      {selectedSlot && (
        <ReservationModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
};

export default NewPatient;
