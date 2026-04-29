import React, { useState, useMemo } from 'react';
import type { Slot } from '../api/client';
import CustomSelect from './CustomSelect';

interface SlotCalendarProps {
  slots: Slot[];
  onSelectSlot: (slot: Slot) => void;
}

// Format date to Polish readable
function formatDatePL(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatDayShort(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' });
}

const SlotCalendar: React.FC<SlotCalendarProps> = ({ slots, onSelectSlot }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>('konsultacja');
  const [pageIndex, setPageIndex] = useState(0);
  const DATES_PER_PAGE = 3;

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const map: Record<string, Slot[]> = {};
    slots.forEach((slot) => {
      if (!map[slot.date]) map[slot.date] = [];
      map[slot.date].push(slot);
    });
    return map;
  }, [slots]);

  const dates = Object.keys(slotsByDate).sort();

  if (dates.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        Brak dostępnych terminów w ciągu 30 dni.
      </div>
    );
  }

  const maxPages = Math.ceil(dates.length / DATES_PER_PAGE);
  const currentDates = dates.slice(pageIndex * DATES_PER_PAGE, (pageIndex + 1) * DATES_PER_PAGE);

  const nextPage = () => {
    if (pageIndex < maxPages - 1) setPageIndex(pageIndex + 1);
  };

  const prevPage = () => {
    if (pageIndex > 0) setPageIndex(pageIndex - 1);
  };

  return (
    <div className="space-y-5">
      {/* Wybór Usługi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(15,23,42,0.03)] hover:shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-shadow">
        <div className="flex items-center w-full">
          <CustomSelect
            value={selectedService}
            onChange={setSelectedService}
            variant="ghost"
            icon={<svg className="w-5 h-5 text-champagne" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            options={[
              { value: 'konsultacja', label: 'Konsultacja z zabiegiem (60 min)' },
              { value: 'kontrola', label: 'Krótka kontrola (15 min)' },
              { value: 'laser', label: 'Laseroterapia (90 min)' },
              { value: 'wolumetria', label: 'Zabieg wolumetryczny (45 min)' }
            ]}
          />
        </div>
        <div className="text-xs uppercase tracking-widest text-slate-400 whitespace-nowrap px-1 font-medium">
          (Cena w kolejnym kroku)
        </div>
      </div>

      {/* Date selector with arrows instead of scrollbar */}
      <div className="flex items-center gap-2">
        <button 
          onClick={prevPage} 
          disabled={pageIndex === 0}
          className="p-2 rounded-xl border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-slate-50 hover:text-brand transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        
        <div className="flex-1 grid grid-cols-3 gap-2">
          {currentDates.map((date) => (
          <button
            key={date}
            onClick={() => setSelectedDate(date === selectedDate ? null : date)}
            className={`
              flex-shrink-0 px-4 py-3 rounded-xl border text-sm text-center min-w-[90px] transition-all duration-300 ease-out
              ${selectedDate === date
                ? 'border-brand-dark bg-brand-dark text-white shadow-lg shadow-brand-dark/10'
                : 'border-slate-200 bg-transparent text-slate-600 hover:border-champagne hover:bg-champagne/5 hover:text-brand-dark hover:-translate-y-0.5'
              }
            `}
          >
            <div className="capitalize font-semibold tracking-wide">{formatDayShort(date)}</div>
            <div className={`text-xs uppercase tracking-widest mt-1 font-medium ${selectedDate === date ? 'text-champagne' : 'text-slate-400'}`}>
              {slotsByDate[date].length} term.
            </div>
          </button>
        ))}
        </div>
        
        <button 
          onClick={nextPage} 
          disabled={pageIndex >= maxPages - 1}
          className="p-2 rounded-xl border border-slate-200 text-slate-400 disabled:opacity-30 hover:bg-slate-50 hover:text-brand transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Slots for selected date */}
      {selectedDate && (
        <div className="bg-champagne/5 border border-champagne/20 rounded-2xl p-5 animate-fade-in-up">
          <h3 className="font-serif text-brand-dark mb-4 capitalize text-lg">
            {formatDatePL(selectedDate)}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {slotsByDate[selectedDate].map((slot) => (
              <button
                key={slot.id}
                onClick={() => onSelectSlot(slot)}
                className="bg-white border border-slate-200 hover:border-champagne rounded-xl p-3 text-left group transition-all duration-300 hover:shadow-lg hover:shadow-champagne/10 hover:-translate-y-0.5"
              >
                <div className="text-xl font-serif tracking-wide text-brand-dark group-hover:text-champagne transition-colors">
                  {slot.time}
                </div>
                <div className="text-xs uppercase tracking-widest text-slate-400 mt-1 truncate font-medium">
                  {slot.doctorName.replace('Dr ', '')}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!selectedDate && (
        <p className="text-sm text-gray-500 text-center py-2">
          Kliknij w datę, aby zobaczyć dostępne godziny
        </p>
      )}
    </div>
  );
};

export default SlotCalendar;
