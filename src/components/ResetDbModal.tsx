import React, { useState } from 'react';
import { RefreshCw, X, AlertTriangle } from 'lucide-react';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

interface ResetDbModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export const ResetDbModal: React.FC<ResetDbModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { showToast } = useToast();
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const res = await api.resetDatabase();
      showToast('success', 'Database Direset', res.message);
      await onSuccess();
      onClose();
    } catch (err: any) {
      showToast('error', 'Gagal Reset DB', err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 text-center">
          Reset Database ke Data Bawaan?
        </h3>
        <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
          Semua perubahan CRUD pada armada kapal, manifest muatan, dan jadwal akan dikembalikan ke data resmi awal Samudera Raya Lines.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            disabled={isResetting}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Mereset Database...' : 'Ya, Reset Database'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
