import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ToastViewport from '../components/ToastViewport.jsx';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const close = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback((type, message, options = {}) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((list) => [...list.slice(-2), { id, type, message, action: options.action }]);
    setTimeout(() => close(id), options.duration || 4000);
  }, [close]);

  const toast = useMemo(() => ({
    success: (message, options) => push('success', message, options),
    error: (message, options) => push('error', message, options),
    info: (message, options) => push('info', message, options),
  }), [push]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastViewport toasts={toasts} onClose={close} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
