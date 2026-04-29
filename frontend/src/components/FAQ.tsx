import React, { useState } from 'react';

const FAQ_ITEMS = [
  {
    q: 'Czy mogę zarezerwować wizytę u Dr Nowak?',
    a: 'Dr Nowak przyjmuje głównie stałych Pacjentów i jej grafik jest zarezerwowany z wyprzedzeniem. Nowe pacjentki mogą się do niej dostać przez listę oczekujących — gdy zwolni się termin, osoby z listy dostają powiadomienie SMS.',
  },
  {
    q: 'Czy na tej samej wizycie mogę wykonać zabieg?',
    a: 'Tak. Pierwsza wizyta to konsultacja połączona z zabiegiem. Lekarz oceni Twoją skórę, zaproponuje plan leczenia i jeśli jest to możliwe, od razu wykona odpowiedni zabieg.',
  },
  {
    q: 'Czy wizyta musi być opłacona zadatkiem?',
    a: 'Tak, rezerwacja wymaga zadatku 200 zł, który zostanie odliczony od kosztu wizyty. Zadatek nie podlega zwrotowi, ale wizytę możesz przełożyć do dwóch razy, najpóźniej 24 godziny przed terminem.',
  },
  {
    q: 'Byłam już kiedyś w klinice u Dr Nowak. Jak się zapisać?',
    a: 'Jeśli jesteś stałą pacjentką Dr Nowak (byłaś u niej na wizycie nawet dawno temu), wystarczy kliknąć przycisk "Prywatny Kalendarz Dr Nowak" powyżej. Po weryfikacji numeru telefonu SMS-em zobaczysz jej kalendarz.',
  },
  {
    q: 'Czy mogę zapisać się telefonicznie?',
    a: 'Tak, w razie pytań lub problemów z rezerwacją online zadzwoń na +48 000 000 000. Zachęcamy jednak do rezerwacji online — to szybsze, masz pełen podgląd dostępnych terminów i łatwiej możesz opłacić zadatek.',
  },
  {
    q: 'Jaka jest szansa, że dostanę się z listy rezerwowej do Dr Nowak?',
    a: 'Nie jesteśmy w stanie tego przewidzieć. Terminy zwalniają się sporadycznie — czasem kilka razy w miesiącu, czasem rzadziej. Konkurencja na liście bywa duża, więc kluczowa jest szybka reakcja na SMS.',
  },
  {
    q: 'Dlaczego Dr Nowak nie prowadzi publicznego grafiku?',
    a: 'Dr Nowak opiekuje się dużą grupą stałych Pacjentów i zachowuje wolne sloty na potrzeby kontynuacji ich leczenia. Dlatego jej grafik nie jest publicznie dostępny.',
  },
  {
    q: 'Czy terminy, które widzę na stronie są aktualne?',
    a: 'Tak, kalendarz jest zawsze aktualny — aktualizuje się w czasie rzeczywistym. Jeśli nie widzisz interesującego Cię terminu, oznacza to, że jest już zajęty.',
  },
  {
    q: 'Przyjeżdżam do Polski za kilka miesięcy, ale nie widzę żadnych dostępnych terminów. Dlaczego?',
    a: 'Nasz grafik otwieramy z wyprzedzeniem dwóch miesięcy — wynika to z tego, że lekarki mają planowane wyjazdy szkoleniowe, więc dalsze terminy nie są jeszcze ustalone.',
  },
  {
    q: 'Czy jeśli zapiszę się do innego lekarza, to będę później mogła przejść do Dr Nowak?',
    a: 'Dla dobra naszych Pacjentów zależy nam, by współpracowali z jedną lekarką. Jeśli chcesz koniecznie trafić do Dr Nowak, lepiej zapisać się na listę oczekujących i poczekać na termin.',
  },
  {
    q: 'W jakie dni przyjmują lekarze?',
    a: 'Klinika jest czynna 7 dni w tygodniu (także w soboty i niedziele). Dokładne terminy sprawdzisz w kalendarzu rezerwacji.',
  },
  {
    q: 'Czy klinika jest otwarta w weekendy?',
    a: 'Tak, klinika jest czynna w soboty i niedziele. Dbamy o pacjentki, które przyjeżdżają do nas z daleka i potrzebują terminów poza standardowymi godzinami pracy.',
  },
  {
    q: 'Zrobiłam rezerwację, ale nie opłaciłam zadatku. Co robić?',
    a: 'Skontaktuj się jak najszybciej z recepcją pod numerem +48 000 000 000. Nieopłacona rezerwacja jest ważna przez godzinę — po tym czasie zostaje automatycznie anulowana.',
  },
  {
    q: 'Czy mogę zapisać się na listę oczekujących do Dr Nowak i jednocześnie zarezerwować wizytę u innego lekarza?',
    a: 'Tak. Jeśli w międzyczasie zwolni się termin u Dr Nowak i zdążysz zarezerwować wizytę z listy oczekujących, skontaktujemy się z Tobą i pomożemy przełożyć lub anulować rezerwację u innej lekarki.',
  },
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const half = Math.ceil(FAQ_ITEMS.length / 2);
  const leftItems = FAQ_ITEMS.slice(0, half);
  const rightItems = FAQ_ITEMS.slice(half);

  const renderFaqColumn = (items: typeof FAQ_ITEMS, offset: number) => (
    <div className="flex flex-col">
      {items.map((item, idx) => {
        const actualIndex = idx + offset;
        const isOpen = openIndex === actualIndex;
        return (
          <div key={actualIndex} className="border-b border-slate-200/60 group">
            <button
              onClick={() => setOpenIndex(isOpen ? null : actualIndex)}
              className="w-full text-left py-5 flex justify-between items-center focus:outline-none"
            >
              <span className={`font-medium pr-6 transition-colors duration-300 ${isOpen ? 'text-brand-dark' : 'text-slate-700 group-hover:text-brand-dark'}`}>
                {item.q}
              </span>
              <span className={`text-slate-400 text-2xl font-light transition-transform duration-500 ease-out ${isOpen ? 'rotate-45 text-champagne' : ''}`}>
                +
              </span>
            </button>
            <div 
              className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-60 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <p className="text-slate-500 text-sm leading-relaxed font-light pr-8">
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <section className="py-24 px-4 bg-white border-t border-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-brand-dark mb-6">Najczęściej zadawane pytania</h2>
          <p className="text-slate-500 font-light max-w-xl mx-auto text-lg">
            Przygotowaliśmy odpowiedzi na pytania, które najczęściej pojawiają się przed pierwszą wizytą w naszej klinice.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-0 items-start">
          {renderFaqColumn(leftItems, 0)}
          {renderFaqColumn(rightItems, half)}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
