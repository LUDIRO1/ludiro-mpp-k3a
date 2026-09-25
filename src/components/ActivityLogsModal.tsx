import React from 'react';
import { ActivityLog } from '../types/shipping.ts';
import { History, X, Clock, User, Shield, CheckCircle, AlertCircle, Trash2, Edit, Plus } from 'lucide-react';

interface ActivityLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActivityLog[];
}

export const ActivityLogsModal: React.FC<ActivityLogsModalProps> = ({
  isOpen,
  onClose,
  logs
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-cyan-300 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Audit Log Aktivitas Database</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Catatan riwayat transaksi CRUD real-time tersimpan pada database persisten.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logs List */}
        <div className="p-6 overflow-y-auto space-y-3 divide-y divide-slate-100 flex-1">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Belum ada aktivitas tercatat di audit log.
            </div>
          ) : (
            logs.map(log => {
              const actionConfig = {
                CREATE: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Plus },
                UPDATE: { badge: 'bg-blue-50 text-blue-700 border-blue-200', icon: Edit },
                DELETE: { badge: 'bg-rose-50 text-rose-700 border-rose-200', icon: Trash2 },
                LOGIN: { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: User }
              }[log.action];

              const Icon = actionConfig?.icon || Clock;

              return (
                <div key={log.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${actionConfig?.badge || 'bg-slate-100'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.userName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${actionConfig?.badge}`}>
                          {log.action} • {log.entity}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed">{log.details}</p>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Menampilkan riwayat 100 aktivitas transaksi terbaru.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
