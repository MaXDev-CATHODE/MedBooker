import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import WaitlistForm from './WaitlistForm';

const SHOW_ON_ROUTES = ['/', '/new-patient'];
const SESSION_KEY = 'exitPopupDismissed';

// Minimum time on page before exit popup can trigger (ms)
const MIN_TIME_ON_PAGE = 5000;

const ExitPopup: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const mountTimeRef = useRef(Date.now());
  const triggeredRef = useRef(false);

  const shouldShow = SHOW_ON_ROUTES.includes(location.pathname);

  // Reset mount time when route changes
  useEffect(() => {
    mountTimeRef.current = Date.now();
    triggeredRef.current = false;
  }, [location.pathname]);

  useEffect(() => {
    if (!shouldShow) return;

    // Already dismissed in this session — don't attach listener
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when cursor exits through the TOP of the viewport
      if (e.clientY > 5) return;

      // Don't trigger if user hasn't been on page long enough
      if (Date.now() - mountTimeRef.current < MIN_TIME_ON_PAGE) return;

      // Only trigger once per page visit
      if (triggeredRef.current) return;
      triggeredRef.current = true;

      setVisible(true);
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [shouldShow, location.pathname]);

  const handleClose = () => {
    setVisible(false);
    // Remember dismissal for the entire browser session
    sessionStorage.setItem(SESSION_KEY, '1');
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full max-h-[90dvh] overflow-y-auto">
        {/* Header */}
        <div className="p-8 pb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[var(--color-champagne)] text-xs uppercase tracking-widest font-semibold mb-2">
                Powiadomienia SMS
              </p>
              <h2 className="text-3xl font-serif text-brand-dark pr-4">
                Lista oczekujących do Dr Nowak
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2 -mt-2 -mr-2 flex-shrink-0"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-slate-500 text-sm font-light mt-2 leading-relaxed">
            Powiadomimy Cię o dostępnym terminie
          </p>
        </div>

        <div className="p-8 pt-0">
          <WaitlistForm type="owner" onClose={handleClose} />
        </div>
      </div>
    </div>
  );
};

export default ExitPopup;
