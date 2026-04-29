import React from 'react';
import { useToastContext } from '../context/ToastContext';
import type { Toast } from '../context/ToastContext';

// ── Color map by toast type ────────────────────────────────────────────────────

const TOAST_STYLES: Record<Toast['type'], string> = {
  success: 'bg-green-600 text-white',
  error:   'bg-red-600 text-white',
  warning: 'bg-amber-600 text-white',
  info:    'bg-blue-600 text-white',
};

const TOAST_ICONS: Record<Toast['type'], string> = {
  success: 'OK',
  error:   'ERR',
  warning: '!',
  info:    'i',
};

// ── Single Toast component ─────────────────────────────────────────────────────

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  return (
    <div
      style={{
        transform: toast.visible ? 'translateX(0)' : 'translateX(110%)',
        opacity: toast.visible ? 1 : 0,
        transition: 'transform 300ms ease, opacity 300ms ease',
      }}
      className={`
        flex items-start gap-3 max-w-sm w-full px-4 py-3 rounded-xl shadow-lg mb-2
        ${TOAST_STYLES[toast.type]}
      `}
      role="alert"
    >
      <span className="text-lg flex-shrink-0 mt-0.5">{TOAST_ICONS[toast.type]}</span>
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 text-white/70 hover:text-white text-lg leading-none ml-1"
        aria-label="Zamknij"
      >
        ×
      </button>
    </div>
  );
};

// ── Toast Container ────────────────────────────────────────────────────────────

const ToastContainer: React.FC = () => {
  const { toasts, dispatch } = useToastContext();

  const handleClose = (id: string) => {
    // Trigger exit animation immediately
    dispatch({ type: 'HIDE', id });
    // Remove from DOM after animation
    setTimeout(() => dispatch({ type: 'REMOVE', id }), 300);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onClose={handleClose} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
