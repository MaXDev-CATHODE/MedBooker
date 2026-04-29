import type { Toast } from '../context/ToastContext';
import { useToastContext } from '../context/ToastContext';

/**
 * Hook for showing toast notifications from any component.
 * Must be used inside <ToastProvider>.
 */
export function useToast() {
  const { dispatch } = useToastContext();

  const showToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);

    // Add toast with visible=true
    dispatch({ type: 'ADD', toast: { id, type, message, visible: true } });

    // Auto-dismiss: hide after 4000ms (triggers exit animation)
    setTimeout(() => dispatch({ type: 'HIDE', id }), 4000);

    // Remove from DOM after animation completes (300ms after hide)
    setTimeout(() => dispatch({ type: 'REMOVE', id }), 4300);
  };

  return { showToast };
}
