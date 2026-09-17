import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onClose,
  onConfirm,
  type = 'danger',
}) => {
  if (!isOpen) return null;

  const isDanger = type === 'danger';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white border border-gray-100/90 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-6 shadow-2xl shadow-black/20 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Thematic top accent gradient glow */}
        <div className={`absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br ${isDanger ? 'from-red-400/20 to-orange-300/10' : 'from-orange-400/20 to-amber-300/10'} rounded-full blur-2xl pointer-events-none`} />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header & Thematic Icon */}
        <div className="flex items-start space-x-4">
          <div className={`w-13 h-13 rounded-2xl bg-gradient-to-tr ${isDanger ? 'from-red-600 via-rose-600 to-red-500 shadow-red-600/30' : 'from-orange-600 via-amber-600 to-orange-500 shadow-orange-600/30'} text-white flex items-center justify-center shadow-lg flex-shrink-0 p-3.5`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          
          <div className="space-y-1 pt-0.5">
            <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
              {title}
            </h3>
          </div>
        </div>

        {/* Body Text */}
        <div className={`space-y-3 ${isDanger ? 'bg-red-50/50 border-red-100/80' : 'bg-orange-50/50 border-orange-100/80'} rounded-2xl p-4 border text-xs`}>
          <p className="text-gray-700 leading-relaxed font-medium whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-all active:scale-95 text-center"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${isDanger ? 'from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-600/25' : 'from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-orange-600/25'} shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2`}
          >
            <span>{confirmText}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
