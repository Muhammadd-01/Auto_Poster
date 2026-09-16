import React from 'react';
import { LogOut, ShieldAlert, X } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName = 'Creator',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white border border-orange-100/90 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-6 shadow-2xl shadow-orange-950/20 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Thematic top accent gradient glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br from-orange-400/20 to-amber-300/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-700 hover:bg-orange-50 rounded-xl transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header & Thematic Icon */}
        <div className="flex items-start space-x-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-600 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-600/30 flex-shrink-0 p-3.5">
            <LogOut className="w-6 h-6" />
          </div>
          
          <div className="space-y-1 pt-0.5">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-black uppercase tracking-wider">
              <ShieldAlert className="w-3 h-3 text-orange-600" />
              <span>Confirm Sign Out</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
              Ready to leave, {userName.split(' ')[0]}?
            </h3>
          </div>
        </div>

        {/* Body Text */}
        <div className="space-y-3 bg-orange-50/50 rounded-2xl p-4 border border-orange-100/80 text-xs">
          <p className="text-gray-700 leading-relaxed font-medium">
            Are you sure you want to end your current session?
          </p>
          <div className="flex items-center space-x-2 text-[11px] text-orange-800 font-semibold bg-white p-2.5 rounded-xl border border-orange-200/60">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping flex-shrink-0" />
            <span>Scheduled posts will continue publishing uninterrupted via the background daemon.</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-all active:scale-95 text-center"
          >
            Stay Signed In
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-lg shadow-orange-600/25 active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Yes, Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
