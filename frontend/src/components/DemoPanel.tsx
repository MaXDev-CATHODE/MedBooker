import React, { useEffect, useRef, useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface DemoEvent {
  id: number;
  category: 'sms' | 'payment' | 'calendly' | 'mailerlite' | 'info' | 'warning';
  message: string;
  timestamp: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  sms:        '[SMS]',
  payment:    '[PLN]',
  calendly:   '[CAL]',
  mailerlite: '[ML]',
  info:       '[i]',
  warning:    '[!]',
};

const CATEGORY_COLORS: Record<string, string> = {
  sms:        'text-blue-600',
  payment:    'text-green-600',
  calendly:   'text-purple-600',
  mailerlite: 'text-orange-500',
  info:       'text-gray-500',
  warning:    'text-red-600',
};

const MAX_EVENTS = 50;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '--:--:--';
  }
}

// ── DemoPanel Component ───────────────────────────────────────────────────────

const DemoPanel: React.FC = () => {
  const [events, setEvents] = useState<DemoEvent[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Check if ?demo=true is in the URL
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('demo') === 'true') {
      setIsDemoMode(true);
    }
  }, []);

  useEffect(() => {
    if (!isDemoMode) return;

    let mounted = true;

    const connect = () => {
      if (!mounted) return;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const es = new EventSource(`${apiUrl}/api/demo/events`);
      esRef.current = es;

      es.onopen = () => {
        if (mounted) setConnected(true);
      };

      es.onmessage = (e: MessageEvent) => {
        if (!mounted) return;
        try {
          const event: DemoEvent = JSON.parse(e.data);
          setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS));
        } catch {
          // Ignore malformed events
        }
      };

      es.onerror = () => {
        if (!mounted) return;
        setConnected(false);
        es.close();
        // Auto-reconnect after 3 seconds
        retryTimeoutRef.current = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      mounted = false;
      esRef.current?.close();
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [isDemoMode]);

  if (!isDemoMode) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 font-mono text-xs">
      {/* Panel container */}
      <div className="bg-gray-900 text-gray-100 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">

        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-800 transition-colors select-none"
          onClick={() => setCollapsed((c) => !c)}
        >
          <div className="flex items-center gap-2">
            {/* Live indicator */}
            {connected ? (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
            ) : (
              <span className="h-2.5 w-2.5 rounded-full bg-gray-500" />
            )}
            <span className="font-bold text-xs tracking-wide">
              {connected ? 'LIVE — Demo Mode' : 'Łączenie...'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">{events.length}</span>
            <span className="text-gray-400">{collapsed ? '▲' : '▼'}</span>
          </div>
        </div>

        {/* Event list */}
        {!collapsed && (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-1.5 bg-gray-800 border-t border-gray-700">
              <span className="text-gray-400 text-xs">Zdarzenia systemowe</span>
              <button
                onClick={() => setEvents([])}
                className="text-gray-400 hover:text-gray-200 text-xs transition-colors"
              >
                Wyczyść
              </button>
            </div>

            {/* Events */}
            <div className="max-h-64 overflow-y-auto">
              {events.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500 text-xs">
                  {connected ? 'Oczekiwanie na zdarzenia...' : 'Łączenie z backendem...'}
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className={`
                      px-4 py-2 border-b border-gray-800 hover:bg-gray-800 transition-colors
                      ${event.category === 'warning' ? 'bg-red-950/40' : ''}
                    `}
                  >
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 mt-0.5">
                        {CATEGORY_ICONS[event.category] || '•'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`leading-snug break-words ${CATEGORY_COLORS[event.category] || 'text-gray-300'}`}>
                          {event.message}
                        </p>
                        <p className="text-gray-600 mt-0.5">{formatTime(event.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DemoPanel;
