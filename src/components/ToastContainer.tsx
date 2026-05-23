import { useEffect, useRef } from 'react';
import type { Toast } from '../hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const TOAST_COLORS: Record<string, { bg: string; border: string; icon: string }> = {
  success: { bg: 'rgba(200,245,66,0.1)', border: 'rgba(200,245,66,0.3)', icon: '✓' },
  error: { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', icon: '✕' },
  info: { bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.3)', icon: 'ℹ' },
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      style={{
        position: 'fixed',
        top: '88px',
        right: '24px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const colors = TOAST_COLORS[toast.type] || TOAST_COLORS.info;

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      ref={ref}
      role="alert"
      style={{
        background: 'rgba(20,20,20,0.95)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        pointerEvents: 'auto',
        animation: 'toastSlideIn 0.3s ease-out',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          flexShrink: 0,
          color: colors.border.replace('0.3', '1'),
        }}
      >
        {colors.icon}
      </div>
      <p
        style={{
          fontSize: '13px',
          color: '#F5F5F0',
          lineHeight: 1.6,
          margin: 0,
          flex: 1,
        }}
      >
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border: 'none',
          color: '#888882',
          fontSize: '16px',
          cursor: 'pointer',
          padding: '0 4px',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
};
