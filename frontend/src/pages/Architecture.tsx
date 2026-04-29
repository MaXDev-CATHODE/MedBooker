import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Types ──────────────────────────────────────────────────────────────────────

interface TooltipData {
  title: string;
  body: string;
  tech?: string;
  why?: string;
}

// ── Tooltip component ─────────────────────────────────────────────────────────

const Tooltip: React.FC<{ data: TooltipData; onClose: () => void }> = ({ data, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-100"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-serif text-xl text-brand-dark">{data.title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors ml-4 flex-shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p className="text-slate-600 text-sm leading-relaxed mb-4">{data.body}</p>
      {data.tech && (
        <div className="bg-slate-900 rounded-xl p-3 mb-3">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1 font-semibold">Stack</p>
          <p className="text-green-400 font-mono text-xs">{data.tech}</p>
        </div>
      )}
      {data.why && (
        <div className="bg-champagne/10 border border-champagne/30 rounded-xl p-3">
          <p className="text-[10px] uppercase tracking-widest text-brand-dark mb-1 font-semibold">Dlaczego tak</p>
          <p className="text-slate-600 text-xs leading-relaxed">{data.why}</p>
        </div>
      )}
    </div>
  </div>
);

// ── Node component ────────────────────────────────────────────────────────────

interface NodeProps {
  label: string;
  sublabel?: string;
  icon: string;
  color: 'navy' | 'champagne' | 'green' | 'orange' | 'purple' | 'red' | 'slate';
  onClick: () => void;
  pulse?: boolean;
  badge?: string;
}

const COLOR_MAP: Record<string, string> = {
  navy:     'bg-brand-dark text-white border-brand-dark',
  champagne:'bg-champagne/20 text-brand-dark border-champagne',
  green:    'bg-emerald-50 text-emerald-800 border-emerald-300',
  orange:   'bg-orange-50 text-orange-800 border-orange-300',
  purple:   'bg-purple-50 text-purple-800 border-purple-300',
  red:      'bg-red-50 text-red-800 border-red-300',
  slate:    'bg-slate-50 text-slate-700 border-slate-300',
};

const Node: React.FC<NodeProps> = ({ label, sublabel, icon, color, onClick, pulse, badge }) => (
  <button
    onClick={onClick}
    className={`
      relative flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border-2 cursor-pointer
      hover:scale-105 hover:shadow-lg transition-all duration-300 text-center min-w-[100px]
      ${COLOR_MAP[color]}
      ${pulse ? 'animate-pulse' : ''}
    `}
  >
    {badge && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
        {badge}
      </span>
    )}
    <span className="text-2xl">{icon}</span>
    <span className="font-semibold text-xs leading-tight">{label}</span>
    {sublabel && <span className="text-[10px] opacity-70 leading-tight">{sublabel}</span>}
  </button>
);

// ── Arrow component ───────────────────────────────────────────────────────────

const Arrow: React.FC<{ label?: string; vertical?: boolean; dashed?: boolean }> = ({
  label,
  vertical = false,
  dashed = false,
}) => (
  <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} items-center gap-1 flex-shrink-0`}>
    {vertical ? (
      <>
        <div className={`w-px h-6 ${dashed ? 'border-l-2 border-dashed border-slate-300' : 'bg-slate-300'}`} />
        {label && <span className="text-[9px] text-slate-400 uppercase tracking-widest font-medium px-2 text-center">{label}</span>}
        <div className="text-slate-400 text-sm">↓</div>
      </>
    ) : (
      <>
        {label && <span className="text-[9px] text-slate-400 uppercase tracking-widest font-medium">{label}</span>}
        <div className="text-slate-400 text-sm">→</div>
      </>
    )}
  </div>
);

// ── Section header ────────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ number: string; title: string; subtitle: string }> = ({
  number, title, subtitle,
}) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="w-10 h-10 rounded-full bg-brand-dark text-champagne flex items-center justify-center font-serif text-lg flex-shrink-0 shadow-md">
      {number}
    </div>
    <div>
      <h2 className="font-serif text-xl text-brand-dark">{title}</h2>
      <p className="text-slate-500 text-sm font-light mt-0.5">{subtitle}</p>
    </div>
  </div>
);

// ── Tooltips data ─────────────────────────────────────────────────────────────

const TOOLTIPS: Record<string, TooltipData> = {
  frontend: {
    title: 'Własny Frontend (React)',
    body: 'Pacjentka nigdy nie widzi Calendly. Cały UX jest po polsku, w kolorach marki, bez żadnych iframe\'ów. Pełna kontrola nad każdym ekranem.',
    tech: 'React + TypeScript + Tailwind CSS\nHosting: Vercel / GitHub Pages',
    why: 'Calendly widget ma mieszankę PL/EN której nie da się zmienić. Własny front rozwiązuje to raz na zawsze i daje pełną kontrolę nad filtrowaniem lekarzy, prefill danych i blokowaniem pól.',
  },
  otp: {
    title: 'Bramka SMS-OTP',
    body: 'Pacjentka podaje numer telefonu → dostaje 6-cyfrowy kod SMS → po weryfikacji system sprawdza czy numer jest w bazie stałych pacjentek właścicielki kliniki.',
    tech: 'SMSAPI.pl — polski routing\nOTP expiry: 10 minut\nMax 3 próby, potem blokada 15 min',
    why: 'SMSAPI.pl zamiast Twilio: 2x tańszy na polskich numerach, routing przez polskie bramki = brak opóźnień. Przy OTP każda sekunda ma znaczenie.',
  },
  token: {
    title: 'Jednorazowy Token Sesji',
    body: 'Po weryfikacji OTP backend generuje UUID token ważny 30 minut, jednorazowego użytku. Link do kalendarza właścicielki bez tokenu zwraca 401. Token nie pojawia się w URL — jest przechowywany w pamięci aplikacji.',
    tech: 'UUID v4 token\nTTL: 30 minut\nused: false → true po pierwszym użyciu',
    why: 'Token jednorazowy rozwiązuje problem kopiowania i udostępniania linku do kalendarza właścicielki — bez CSS hacków. Link bez ważnego tokenu po prostu nie działa.',
  },
  patientDb: {
    title: 'Baza Stałych Pacjentek',
    body: 'Auto-generowana z Calendly API przez filtrowanie po event type = "Wizyta u właścicielki". Samoaktualizująca się — każda nowa wizyta automatycznie dodaje pacjentkę do bazy.',
    tech: 'PostgreSQL\nGET /scheduled_events?event_type=wizyta-owner\nSync: webhook event.created',
    why: 'Nie trzeba ręcznie zarządzać bazą. Calendly jest źródłem prawdy — kto był u właścicielki, ten jest w bazie. Zero pracy administracyjnej.',
  },
  calendlyApi: {
    title: 'Calendly Scheduling API',
    body: 'Calendly uruchomił Scheduling API w październiku 2025. Endpoint POST /scheduled_events/invitees pozwala tworzyć rezerwacje programistycznie — bez widgetów, bez iframe, bez przekierowań.',
    tech: 'POST /scheduled_events/invitees\nGET /event_types/:uuid/available_times\nAuth: OAuth2 lub Personal Access Token',
    why: 'Calendly obsługuje backend: zaproszenia kalendarzowe, powiadomienia email, workflow. My obsługujemy frontend i płatności. Najlepszy podział odpowiedzialności.',
  },
  pendingReservation: {
    title: 'Pending Reservation + TTL',
    body: 'Po wyborze slotu — natychmiast tworzymy rezerwację ze statusem "pending" i TTL 60 minut. Slot jest zablokowany dla innych użytkowników. Jeśli płatność nie przejdzie w ciągu godziny — slot automatycznie się zwalnia.',
    tech: 'PostgreSQL: status = pending\nexpiresAt = NOW() + 60 min\nCron: co 5 min czyści expired',
    why: 'To rozwiązuje problem "zarezerwowana ale nieopłacona". Slot jest zablokowany tylko na czas płatności. Bez tego dwie osoby mogłyby płacić za ten sam termin jednocześnie.',
  },
  tpay: {
    title: 'Tpay — Bramka Płatnicza',
    body: 'Pacjentka jest przekierowywana do Tpay. Po płatności Tpay wysyła webhook POST do naszego backendu z potwierdzeniem. Dopiero po otrzymaniu webhooka tworzymy rezerwację w Calendly.',
    tech: 'Redirect flow: pacjentka → Tpay → webhook\nWebhook: POST /api/reservations/confirm\nRefund API: auto-zwrot jeśli slot zniknął',
    why: 'Płatność PRZED wpisem do Calendly — to jest kluczowa kolejność. Odwrotna kolejność (Calendly → Tpay) powoduje problem "zarezerwowana ale nieopłacona".',
  },
  mutex: {
    title: 'Mutex na Race Condition',
    body: 'Jeśli dwie osoby zapłacą za ten sam slot w tym samym czasie — mutex zapewnia że tylko jedna rezerwacja zostanie potwierdzona. Druga dostaje auto-refund i SMS z propozycją następnego wolnego terminu.',
    tech: 'Node.js async mutex (confirmLock)\nAtomic read-check-write\nAuto-refund: Tpay Refund API',
    why: 'Node.js jest single-threaded ale async I/O pozwala na interleaving requestów. Bez mutexa dwa równoczesne webhooki mogłyby oba przejść walidację przed zapisem. Mutex to eliminuje.',
  },
  smsConfirm: {
    title: 'SMS Potwierdzenie',
    body: 'Po potwierdzeniu płatności — natychmiast wysyłamy SMS z detalami wizyty: lekarz, data, godzina, informacja o zadatku.',
    tech: 'SMSAPI.pl\nTreść: "Wizyta potwierdzona! Dr X, DD.MM.YYYY o HH:MM. Zadatek 200 PLN opłacony."',
    why: 'SMS jest szybszy niż email i bardziej niezawodny jako potwierdzenie. Pacjentka ma potwierdzenie w telefonie zanim zamknie przeglądarkę.',
  },
  waitlistBroadcast: {
    title: 'Waitlist Broadcast',
    body: 'Gdy pacjentka odwoła wizytę — webhook event.canceled triggeruje broadcast SMS + email do WSZYSTKICH osób na liście jednocześnie. Kto pierwszy zarezerwuje i opłaci zadatek — dostaje termin.',
    tech: 'Calendly webhook: event.canceled\nSMSAPI.pl: bulk send\nMailerLite: email broadcast\nRace condition: mutex jak wyżej',
    why: 'Broadcast do wszystkich naraz zamiast kolejki — model "kto pierwszy ten lepszy". Mutex na potwierdzeniu zapewnia że tylko jedna osoba dostanie termin mimo równoczesnych kliknięć.',
  },
  mailerlite: {
    title: 'MailerLite — Listy Rezerwowe',
    body: 'Dwa segmenty: Waitlist_Owner i Waitlist_Doctors. Każda osoba która zapisze się na listę dostaje natychmiast email potwierdzający z instrukcją jak się wypisać (RODO).',
    tech: 'MailerLite API v2\nSegmenty: Waitlist_Owner, Waitlist_Doctors\nDouble opt-in: nie wymagany (SMS jako weryfikacja)',
    why: 'MailerLite obsługuje emaile, SMSAPI obsługuje SMSy. Nie mieszamy — każde narzędzie robi to co robi najlepiej. Make.com jest opcjonalny do automatyzacji triggerów.',
  },
  wordpress: {
    title: 'Hosting / Deployment',
    body: 'Frontend jest deploy-owany jako statyczna SPA na GitHub Pages / Vercel. Backend jako Node.js app na Render.com (free tier). Oba podejścia wspierają custom domains.',
    tech: 'Frontend: Vite → static build → GitHub Pages\nBackend: Node.js → Render.com\nCORS: env-based origin whitelist',
    why: 'Zero kosztu na darmowych tierach. GitHub Actions automatyzują deployment frontendu. Render auto-deploy z repo.',
  },
};

// ── Main component ────────────────────────────────────────────────────────────

/** Interactive architecture diagram — click any node for technical details */
const Architecture: React.FC = () => {
  const navigate = useNavigate();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const show = (key: string) => setActiveTooltip(key);
  const hide = () => setActiveTooltip(null);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 pt-10 pb-6 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <button
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-[var(--color-champagne)] transition-colors text-xs flex items-center gap-2 mb-8 uppercase tracking-widest font-medium"
          >
            <span>←</span> Powrót do demo
          </button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[var(--color-champagne)] text-xs uppercase tracking-widest font-semibold mb-2">
                Dokumentacja techniczna
              </p>
              <h1 className="text-4xl font-serif text-brand-dark mb-2">Architektura systemu</h1>
              <p className="text-slate-500 font-light text-sm max-w-xl">
                Interaktywny schemat wszystkich komponentów. Kliknij dowolny węzeł żeby zobaczyć szczegóły techniczne, uzasadnienie wyboru i stack.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-xs text-emerald-700 font-medium flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Wszystkie komponenty zaimplementowane w demo
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        {/* ── FLOW 1: Ekran 2B — SMS-OTP ── */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
          <SectionHeader
            number="2B"
            title="Stała Pacjentka — SMS-OTP"
            subtitle="Bramka weryfikacyjna chroniąca prywatny kalendarz właścicielki"
          />

          {/* Flow diagram */}
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center gap-2 min-w-max">
              <Node label="Pacjentka" sublabel="podaje telefon" icon="[P]" color="slate" onClick={() => show('frontend')} />
              <Arrow label="numer" />
              <Node label="SMS-OTP" sublabel="SMSAPI.pl" icon="[SMS]" color="champagne" onClick={() => show('otp')} />
              <Arrow label="kod 6-cyfr" />
              <Node label="Weryfikacja" sublabel="baza pacjentek" icon="[DB]" color="slate" onClick={() => show('patientDb')} />
              <Arrow label="token" />
              <Node label="Token sesji" sublabel="jednorazowy" icon="[KEY]" color="navy" onClick={() => show('token')} badge="NEW" />
              <Arrow label="odblokowanie" />
              <Node label="Kalendarz Owner" sublabel="Calendly API" icon="[CAL]" color="purple" onClick={() => show('calendlyApi')} />
            </div>
          </div>

          {/* Key insight */}
          <div className="mt-6 bg-slate-900 rounded-xl p-4 text-xs font-mono">
            <p className="text-slate-400 mb-1">// Jak działa ochrona kalendarza właścicielki przed nieautoryzowanym dostępem</p>
            <p className="text-green-400">GET /api/calendar/owner<span className="text-yellow-300">?token=</span><span className="text-blue-300">{'<uuid-jednorazowy>'}</span></p>
            <p className="text-slate-500 mt-1">// Bez tokenu → 401. Token wygasa po 30 min lub po pierwszym użyciu.</p>
            <p className="text-slate-500">// Pacjentka nie widzi URL Calendly. Nigdy.</p>
          </div>
        </div>

        {/* ── FLOW 2: Ekran 2A — Zapłać → Zarezerwuj ── */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
          <SectionHeader
            number="2A"
            title="Pierwsza Wizyta — Flow Zapłać → Zarezerwuj"
            subtitle="Kolejność operacji eliminująca problem 'zarezerwowana ale nieopłacona'"
          />

          {/* Vertical flow */}
          <div className="flex flex-col items-center gap-0 max-w-sm mx-auto">
            <Node label="Wybór slotu" sublabel="filtrowanie lekarzy" icon="[CAL]" color="slate" onClick={() => show('frontend')} />
            <Arrow vertical label="natychmiast" />
            <Node label="Pending Reservation" sublabel="TTL: 60 minut" icon="[TTL]" color="champagne" onClick={() => show('pendingReservation')} badge="TTL" />
            <Arrow vertical label="redirect" />
            <Node label="Tpay" sublabel="zadatek 200 PLN" icon="[PLN]" color="green" onClick={() => show('tpay')} />
            <Arrow vertical label="webhook POST" />
            <Node label="Mutex" sublabel="race condition guard" icon="[MX]" color="navy" onClick={() => show('mutex')} />
            <div className="flex gap-8 mt-2">
              <div className="flex flex-col items-center gap-2">
                <Arrow vertical />
                <Node label="Calendly API" sublabel="POST invitee" icon="[CAL]" color="purple" onClick={() => show('calendlyApi')} />
                <Arrow vertical />
                <Node label="SMS OK" sublabel="potwierdzenie" icon="[SMS]" color="green" onClick={() => show('smsConfirm')} />
              </div>
              <div className="flex flex-col items-center gap-2">
                <Arrow vertical dashed />
                <Node label="Auto-refund" sublabel="slot zajęty" icon="[REF]" color="red" onClick={() => show('mutex')} />
                <Arrow vertical dashed />
                <Node label="SMS ERR" sublabel="propozycja terminu" icon="[SMS]" color="red" onClick={() => show('smsConfirm')} />
              </div>
            </div>
          </div>

          {/* Key insight */}
          <div className="mt-8 bg-slate-900 rounded-xl p-4 text-xs font-mono">
            <p className="text-slate-400 mb-1">// Kluczowa kolejność operacji eliminująca podwójne rezerwacje</p>
            <p className="text-green-400">1. slot.status = <span className="text-yellow-300">'pending'</span> → blokuje slot dla innych</p>
            <p className="text-green-400">2. webhook.paid → <span className="text-blue-300">withConfirmLock()</span> → Calendly POST</p>
            <p className="text-green-400">3. TTL expired → slot.status = <span className="text-red-400">'expired'</span> → slot wolny ponownie</p>
            <p className="text-slate-500 mt-1">// Auto-cancel bez żadnej akcji ze strony recepcji.</p>
          </div>
        </div>

        {/* ── FLOW 3: Waitlist Broadcast ── */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
          <SectionHeader
            number="WL"
            title="Waitlist Broadcast — Kto Pierwszy Ten Lepszy"
            subtitle="Automatyczne powiadomienie przy odwołaniu wizyty"
          />

          <div className="overflow-x-auto pb-2">
            <div className="flex items-center gap-2 min-w-max">
              <Node label="Odwołanie wizyty" sublabel="Calendly" icon="[X]" color="red" onClick={() => show('waitlistBroadcast')} />
              <Arrow label="webhook" />
              <Node label="event.canceled" sublabel="trigger" icon="[EV]" color="slate" onClick={() => show('waitlistBroadcast')} />
              <Arrow label="broadcast" />
              <Node label="SMS do wszystkich" sublabel="SMSAPI.pl" icon="[SMS]" color="champagne" onClick={() => show('waitlistBroadcast')} />
              <Node label="Email do wszystkich" sublabel="MailerLite" icon="[ML]" color="orange" onClick={() => show('mailerlite')} />
              <Arrow label="pierwsza płatność" />
              <Node label="Mutex" sublabel="jeden wygrywa" icon="[MX]" color="navy" onClick={() => show('mutex')} />
            </div>
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
            <p className="font-semibold mb-1">Ważna kwestia do uzgodnienia</p>
            <p className="font-light leading-relaxed">
              Broadcast do 50+ osób naraz → wiele osób klika jednocześnie → mutex obsługuje wszystkich poza pierwszym komunikatem "termin zajęty".
              Do ustalenia: model "kto pierwszy ten lepszy" z natychmiastowym komunikatem dla pozostałych,
              czy system kolejkowy (powiadomienia wysyłane po kolei)?
            </p>
          </div>
        </div>

        {/* ── Stack overview ── */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
          <SectionHeader
            number="∑"
            title="Stack i Integracje"
            subtitle="Kliknij komponent żeby zobaczyć uzasadnienie wyboru"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: 'frontend',    label: 'React Frontend',    sublabel: 'własny UX, 100% PL',  icon: '[FE]',  color: 'navy'      as const },
              { key: 'calendlyApi', label: 'Calendly API',      sublabel: 'backend rezerwacji',  icon: '[CAL]', color: 'purple'    as const },
              { key: 'tpay',        label: 'Tpay',              sublabel: 'płatności',           icon: '[PLN]', color: 'green'     as const },
              { key: 'otp',         label: 'SMSAPI.pl',         sublabel: 'OTP + broadcast',     icon: '[SMS]', color: 'champagne' as const },
              { key: 'mailerlite',  label: 'MailerLite',        sublabel: 'listy rezerwowe',     icon: '[ML]',  color: 'orange'    as const },
              { key: 'wordpress',   label: 'Hosting',           sublabel: 'Vercel + Render',     icon: '[WP]',  color: 'slate'     as const },
            ].map(({ key, label, sublabel, icon, color }) => (
              <Node
                key={key}
                label={label}
                sublabel={sublabel}
                icon={icon}
                color={color}
                onClick={() => show(key)}
              />
            ))}
          </div>
        </div>

        {/* ── Poza zakresem ── */}
        <div className="bg-slate-100 rounded-[2rem] border border-slate-200 p-8">
          <h2 className="font-serif text-xl text-slate-600 mb-4">Świadomie poza zakresem</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              ['Panel administracyjny', 'Calendly dashboard daje wystarczający wgląd'],
              ['Integracja z CRM', 'CRM zostaje oddzielnie — II etap'],
              ['Obsługa anulowań/przełożeń', 'Recepcja robi to bezpośrednio w Calendly'],
              ['Szablony maili do pacjentek', 'Calendly wysyła je automatycznie'],
              ['Migracja danych historycznych', 'Baza auto-generuje się z Calendly API'],
              ['Panel logów / statystyki', 'II etap po wdrożeniu'],
            ].map(([title, reason]) => (
              <div key={title} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-100">
                <span className="text-slate-300 text-lg flex-shrink-0 font-mono">—</span>
                <div>
                  <p className="text-sm font-medium text-slate-500">{title}</p>
                  <p className="text-xs text-slate-400 font-light mt-0.5">{reason}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4 font-light">
            Świadome ograniczenie zakresu pozwala dowieźć w 3 tygodnie. Każda z tych pozycji to naturalny II etap.
          </p>
        </div>

      </div>

      {/* Tooltip overlay */}
      {activeTooltip && TOOLTIPS[activeTooltip] && (
        <Tooltip data={TOOLTIPS[activeTooltip]} onClose={hide} />
      )}
    </div>
  );
};

export default Architecture;
