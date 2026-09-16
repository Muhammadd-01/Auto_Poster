import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, duration: number = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => showToast('success', title, message), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast('error', title, message, 5000), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast('warning', title, message, 4500), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast('info', title, message), [showToast]);

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, removeToast, success, error, warning, info }}
    >
      {children}

      {/* Floating Custom Notification Alert Stack (Top Right) */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col space-y-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {toasts.map((toast) => {
          const config = {
            success: {
              icon: CheckCircle2,
              border: 'border-orange-500/30',
              bg: 'bg-white/95 backdrop-blur-md',
              iconBg: 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white',
              titleColor: 'text-gray-900',
              shadow: 'shadow-2xl shadow-orange-600/15',
              accentBar: 'bg-gradient-to-b from-orange-500 to-amber-500',
            },
            error: {
              icon: AlertCircle,
              border: 'border-red-300',
              bg: 'bg-white/95 backdrop-blur-md',
              iconBg: 'bg-red-500 text-white',
              titleColor: 'text-red-950',
              shadow: 'shadow-2xl shadow-red-600/15',
              accentBar: 'bg-red-500',
            },
            warning: {
              icon: AlertTriangle,
              border: 'border-amber-400',
              bg: 'bg-white/95 backdrop-blur-md',
              iconBg: 'bg-amber-500 text-white',
              titleColor: 'text-amber-950',
              shadow: 'shadow-2xl shadow-amber-600/15',
              accentBar: 'bg-amber-500',
            },
            info: {
              icon: Info,
              border: 'border-orange-200',
              bg: 'bg-white/95 backdrop-blur-md',
              iconBg: 'bg-orange-600 text-white',
              titleColor: 'text-gray-900',
              shadow: 'shadow-2xl shadow-orange-600/10',
              accentBar: 'bg-orange-500',
            },
          }[toast.type];

          const IconComponent = config.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto transform transition-all duration-300 ease-out translate-y-0 opacity-100 flex items-stretch rounded-2xl overflow-hidden border ${config.border} ${config.bg} ${config.shadow}`}
              role="alert"
            >
              {/* Left thematic accent bar */}
              <div className={`w-1.5 flex-shrink-0 ${config.accentBar}`} />

              <div className="p-4 flex items-start space-x-3.5 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${config.iconBg}`}>
                  <IconComponent className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0 pr-1">
                  <h4 className={`text-xs font-black tracking-tight ${config.titleColor}`}>
                    {toast.title}
                  </h4>
                  {toast.message && (
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed font-medium">
                      {toast.message}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Dismiss alert"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
