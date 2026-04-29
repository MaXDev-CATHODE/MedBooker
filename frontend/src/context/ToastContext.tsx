import React, { createContext, useContext, useReducer } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  visible: boolean; // false = exit animation playing
}

type Action =
  | { type: 'ADD'; toast: Toast }
  | { type: 'HIDE'; id: string }
  | { type: 'REMOVE'; id: string };

interface ToastContextValue {
  toasts: Toast[];
  dispatch: React.Dispatch<Action>;
}

// ── Reducer ───────────────────────────────────────────────────────────────────

function toastReducer(state: Toast[], action: Action): Toast[] {
  switch (action.type) {
    case 'ADD':
      return [...state, action.toast];
    case 'HIDE':
      return state.map((t) => (t.id === action.id ? { ...t, visible: false } : t));
    case 'REMOVE':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

export const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  return (
    <ToastContext.Provider value={{ toasts, dispatch }}>
      {children}
    </ToastContext.Provider>
  );
};

/** Internal hook — use useToast() from hooks/useToast.ts instead */
export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
