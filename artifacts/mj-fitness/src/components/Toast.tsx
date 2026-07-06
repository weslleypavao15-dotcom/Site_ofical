import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

type ToastProps = {
  message: string;
  type: ToastType;
  id: number;
};

export const showToast = (message: string, type: ToastType = 'info') => {
  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
};

const styles: Record<ToastType, { container: string; icon: React.ReactNode }> = {
  success: {
    container: 'bg-green-700 text-white',
    icon: <CheckCircle size={18} className="shrink-0" />,
  },
  error: {
    container: 'bg-red-700 text-white',
    icon: <XCircle size={18} className="shrink-0" />,
  },
  info: {
    container: 'bg-gray-900 text-white',
    icon: <Info size={18} className="shrink-0" />,
  },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const { message, type } = (e as CustomEvent).detail as { message: string; type: ToastType };
      const id = Date.now();
      setToasts((prev) => [...prev, { message, type, id }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const { container, icon } = styles[toast.type];
        // role="alert" anuncia erros imediatamente (aria-live assertive implícito)
        // role="status" anuncia sucessos/infos de forma não-intrusiva (aria-live polite implícito)
        const role = toast.type === 'error' ? 'alert' : 'status';
        return (
          <div
            key={toast.id}
            role={role}
            aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
            className={`${container} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 text-sm font-medium animate-in slide-in-from-bottom-4 fade-in duration-300`}
          >
            {icon}
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
