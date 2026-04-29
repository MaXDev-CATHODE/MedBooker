import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctors, getDoctorSlots } from '../api/client';
import type { Doctor, Slot } from '../api/client';
import SlotCalendar from '../components/SlotCalendar';
import ReservationModal from '../components/ReservationModal';
import LoadingSpinner from '../components/LoadingSpinner';


/** Returning patient flow — select your existing doctor and book a follow-up */
const TeamPatient: React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getDoctors()
      .then(setDoctors)
      .catch(() => setError('Błąd ładowania lekarzy.'))
      .finally(() => setLoadingDoctors(false));
  }, []);

  const handleSelectDoctor = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSlots([]);
    setLoadingSlots(true);
    try {
      const doctorSlots = await getDoctorSlots(doctor.id);
      setSlots(doctorSlots);
    } catch {
      setError('Błąd ładowania terminów.');
    } finally {
      setLoadingSlots(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 pt-10 pb-6">
        <div className="max-w-5xl mx-auto px-4">
          <button
            onClick={() => selectedDoctor ? setSelectedDoctor(null) : navigate('/')}
            className="text-slate-400 hover:text-champagne transition-colors text-sm flex items-center gap-2 mb-8 uppercase tracking-widest font-medium"
          >
            <span>←</span> {selectedDoctor ? 'Zmień lekarza' : 'Powrót'}
          </button>
          <div>
            <h1 className="text-4xl font-serif text-brand-dark mb-2">
              {selectedDoctor ? selectedDoctor.name : 'Kontynuacja Leczenia'}
            </h1>
            <p className="text-slate-500 font-light">
              {selectedDoctor ? 'Wybierz dostępny termin' : 'Wybierz swojego lekarza prowadzącego'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Doctor selection */}
        {!selectedDoctor && (
          <>
            {loadingDoctors ? (
              <LoadingSpinner message="Ładowanie lekarzy..." />
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    onClick={() => handleSelectDoctor(doctor)}
                    className="bg-white border border-slate-200/60 rounded-2xl p-6 text-left group transition-all duration-500 ease-out hover:border-champagne hover:shadow-2xl hover:shadow-champagne/5 hover:-translate-y-1 flex flex-col h-full"
                  >
                    <div className="flex gap-5 mb-4">
                      {/* Photo 3:4 */}
                      <div className="w-20 h-28 rounded-xl flex-shrink-0 overflow-hidden bg-slate-100 shadow-inner">
                        <img 
                          src={`https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=560&sig=${doctor.id}`} 
                          alt={doctor.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out grayscale-[20%]"
                        />
                      </div>
                      
                      <div className="flex-1 pt-1">
                        <p className="font-serif text-xl text-brand-dark group-hover:text-champagne transition-colors duration-300">{doctor.name.replace('Dr ', 'Dr ')}</p>
                        <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mt-1 mb-2">{doctor.specialization}</p>
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 min-h-[68px]">{doctor.bio}</p>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-5 border-t border-slate-100">
                      <div className="w-full flex items-center justify-between text-brand-dark font-medium text-sm transition-all duration-300">
                        <span className="group-hover:text-champagne transition-colors">Pokaż terminy</span>
                        <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 text-champagne transition-all duration-500 ease-out">→</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Doctor calendar */}
        {selectedDoctor && (
          <>
            {/* Doctor info */}
            <div className="border-b border-slate-100 pb-8 mb-8 flex items-center gap-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-serif text-2xl flex-shrink-0 shadow-lg"
                style={{ backgroundColor: selectedDoctor.color || '#0F172A' }}
              >
                {selectedDoctor.name.split(' ').pop()?.charAt(0)}
              </div>
              <div>
                <p className="font-serif text-2xl text-brand-dark">{selectedDoctor.name}</p>
                <p className="text-sm text-slate-500 font-light mt-1">{selectedDoctor.specialization}</p>
              </div>
            </div>

            {loadingSlots ? (
              <LoadingSpinner message="Ładowanie terminów..." />
            ) : (
              <SlotCalendar slots={slots} onSelectSlot={setSelectedSlot} />
            )}

            <div className="mt-12 text-center py-8 border-t border-slate-100">
              <p className="text-slate-500 font-light text-sm">
                Nie znalazłaś terminu do swojego lekarza?{' '}
                <a href="tel:+48000000000" className="text-brand-dark font-medium hover:text-champagne transition-colors">
                  +48 000 000 000
                </a>
              </p>
            </div>
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

export default TeamPatient;
