import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Удалить',
  cancelText = 'Отмена',
  isDanger = true,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-[#383838] bg-[#1e1e1e] p-6 text-white shadow-2xl">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              isDanger ? 'bg-[#ef4444]/20 text-[#ef4444]' : 'bg-[#3ea6ff]/20 text-[#3ea6ff]'
            }`}
          >
            {isDanger ? <Trash2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
          </div>

          <div className="flex-1">
            <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
            <p className="text-xs text-[#aaaaaa] leading-relaxed mb-6">{message}</p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-[#cccccc] hover:bg-[#2e2e2e] hover:text-white transition-colors cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-lg cursor-pointer ${
                  isDanger
                    ? 'bg-[#ef4444] hover:bg-[#dc2626] text-white active:scale-95'
                    : 'bg-[#3ea6ff] hover:bg-[#2563eb] text-white active:scale-95'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#888888] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
