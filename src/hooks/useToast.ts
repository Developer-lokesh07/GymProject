import { useState, useEffect, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

/**
 * Custom hook to manage toast notifications.
 * Returns the current toasts array and a function to show new toasts.
 */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}

/**
 * Auto-dismiss effect: removes a toast after the given duration.
 */
export function useAutoDismiss(
  toasts: Toast[],
  dismissToast: (id: string) => void,
  duration = 5000,
) {
  useEffect(() => {
    if (toasts.length === 0) return;
    const latest = toasts[toasts.length - 1];
    const timer = setTimeout(() => dismissToast(latest.id), duration);
    return () => clearTimeout(timer);
  }, [toasts, dismissToast, duration]);
}
