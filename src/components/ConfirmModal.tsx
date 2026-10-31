import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Ya, Padam',
  cancelText = 'Batal',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scaleUp"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                confirmVariant === 'danger'
                  ? 'bg-rose-100 text-rose-600'
                  : confirmVariant === 'warning'
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-indigo-100 text-indigo-600'
              }`}
            >
              {confirmVariant === 'danger' ? (
                <Trash2 className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {message}
              </p>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
              }}
              className={`px-4 py-2 text-xs sm:text-sm font-bold text-white rounded-xl shadow-xs transition flex items-center gap-1.5 ${
                confirmVariant === 'danger'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : confirmVariant === 'warning'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {confirmVariant === 'danger' && <Trash2 className="w-3.5 h-3.5" />}
              <span>{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
