import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const Icon = icons[toast.type] || Info;

  return (
    <div className={`toast toast-${toast.type}`}>
      <Icon size={18} />
      <span style={{ flex: 1, fontSize: 'var(--text-sm)' }}>{toast.message}</span>
      <button onClick={onDismiss} className="btn-icon btn-ghost" style={{ padding: '4px' }}>
        <X size={14} />
      </button>
    </div>
  );
}
