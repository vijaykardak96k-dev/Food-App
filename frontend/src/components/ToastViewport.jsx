import { Link } from 'react-router-dom';
import { Check, Info, X } from 'lucide-react';

const ICONS = { success: Check, error: X, info: Info };

export default function ToastViewport({ toasts, onClose }) {
  return (
    <div className="toast-viewport" aria-live="polite">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || Info;
        return (
          <div key={t.id} className={`toast toast-${t.type}`} role="status">
            <span className="toast-icon"><Icon size={16} strokeWidth={2.5} /></span>
            <span className="toast-message">{t.message}</span>
            {t.action && <Link to={t.action.to} className="toast-action" onClick={() => onClose(t.id)}>{t.action.label}</Link>}
            <button type="button" className="toast-close" onClick={() => onClose(t.id)} aria-label="Dismiss"><X size={16} /></button>
          </div>
        );
      })}
    </div>
  );
}
