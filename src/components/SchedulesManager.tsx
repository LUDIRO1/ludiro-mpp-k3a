import React, { useState, useEffect } from 'react';
import { VoyageSchedule, Vessel } from '../types/shipping.ts';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';
import { 
  Calendar, Plus, Search, Filter, Edit, Trash2, Ship, MapPin, 
  Clock, CheckCircle2, AlertTriangle, X, Check, ArrowRight, Anchor, Sparkles
} from 'lucide-react';

interface SchedulesManagerProps {
  schedules: VoyageSchedule[];
  vessels: Vessel[];
  onRefresh: () => Promise<void>;
  isCreateOpen?: boolean;
  setIsCreateOpen?: (open: boolean) => void;
}

export const SchedulesManager: React.FC<SchedulesManagerProps> = ({
  schedules,
  vessels,
  onRefresh,
  isCreateOpen = false,
  setIsCreateOpen
}) => {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [localModalOpen, setLocalModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<VoyageSchedule | null>(null);
  const [deletingSchedule, setDeletingSchedule] = useState<VoyageSchedule | null>(null);

  // Sync external open request
  useEffect(() => {
    if (isCreateOpen) {
      handleOpenCreate();
      if (setIsCreateOpen) setIsCreateOpen(false);
    }
  }, [isCreateOpen, setIsCreateOpen]);

  // Form
  const [formData, setFormData] = useState({
    voyageCode: '',
    vesselId: vessels[0]?.id || '',
    route: '',
    originPort: 'Pelabuhan Tanjung Priok, Jakarta',
    destinationPort: 'Pelabuhan Tanjung Perak, Surabaya',
    departureDate: new Date().toISOString().slice(0, 16),
    arrivalDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 16),
    berthNumber: 'Dermaga JICT 2B',
    status: 'Terjadwal' as VoyageSchedule['status'],
    bunkerPlanTon: 300,
    notes: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.voyageCode.trim() || formData.voyageCode.trim().length < 3) {
      errors.voyageCode = 'Kode Voyage wajib diisi minimal 3 karakter (contoh: VOY-JVR-JKT-SBY-09).';
    }
    if (!formData.vesselId) {
      errors.vesselId = 'Silakan pilih kapal armada untuk voyage ini.';
    }
    if (!formData.departureDate) {
      errors.departureDate = 'Jadwal waktu keberangkatan wajib diisi.';
    }
    if (!formData.arrivalDate) {
      errors.arrivalDate = 'Perkiraan waktu kedatangan wajib diisi.';
    }
    if (new Date(formData.arrivalDate) <= new Date(formData.departureDate)) {
      errors.arrivalDate = 'Waktu kedatangan harus lebih lambat dari waktu keberangkatan.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreate = () => {
    setEditingSchedule(null);
    setFormData({
      voyageCode: `VOY-JVR-${Date.now().toString().slice(-4)}`,
      vesselId: vessels[0]?.id || '',
      route: 'Tanjung Priok (JKT) -> Tanjung Perak (SBY)',
      originPort: 'Pelabuhan Tanjung Priok, Jakarta',
      destinationPort: 'Pelabuhan Tanjung Perak, Surabaya',
      departureDate: new Date().toISOString().slice(0, 16),
      arrivalDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 16),
      berthNumber: 'Dermaga Eksekutif 03',
      status: 'Terjadwal',
      bunkerPlanTon: 280,
      notes: ''
    });
    setFormErrors({});
    setLocalModalOpen(true);
  };

  const handleOpenEdit = (schedule: VoyageSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      voyageCode: schedule.voyageCode,
      vesselId: schedule.vesselId,
      route: schedule.route,
      originPort: schedule.originPort,
      destinationPort: schedule.destinationPort,
      departureDate: schedule.departureDate.slice(0, 16),
      arrivalDate: schedule.arrivalDate.slice(0, 16),
      berthNumber: schedule.berthNumber,
      status: schedule.status,
      bunkerPlanTon: schedule.bunkerPlanTon,
      notes: schedule.notes || ''
    });
    setFormErrors({});
    setLocalModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('error', 'Validasi Gagal', 'Harap periksa tanggal dan rute jadwal.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSchedule) {
        await api.updateSchedule(editingSchedule.id, formData);
        showToast('success', 'Jadwal Diperbarui', `Jadwal ${formData.voyageCode} berhasil disimpan ke database.`);
      } else {
        await api.createSchedule(formData);
        showToast('success', 'Jadwal Diterbitkan', `Jadwal voyage ${formData.voyageCode} berhasil dibuat secara online.`);
      }
      setLocalModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      showToast('error', 'Gagal Menyimpan Jadwal', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSchedule) return;
    setIsSubmitting(true);
    try {
      await api.deleteSchedule(deletingSchedule.id);
      showToast('success', 'Jadwal Dihapus', `Jadwal pelayaran ${deletingSchedule.voyageCode} telah dihapus.`);
      setDeletingSchedule(null);
      await onRefresh();
    } catch (err: any) {
      showToast('error', 'Gagal Menghapus', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSchedules = schedules.filter(s => {
    const matchesSearch =
      s.voyageCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.berthNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Action Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kode voyage, armada kapal, rute..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="ALL">Semua Status Jadwal</option>
            <option value="Terjadwal">Terjadwal</option>
            <option value="Aktif Berlayar">Aktif Berlayar</option>
            <option value="Selesai">Selesai</option>
            <option value="Tertunda Cuaca">Tertunda Cuaca</option>
          </select>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Terbitkan Jadwal Voyage</span>
          </button>
        </div>
      </div>

      {/* Schedules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSchedules.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Belum ada jadwal pelayaran</h3>
            <p className="text-xs text-slate-400 mt-1">Gunakan tombol di atas untuk menerbitkan jadwal baru.</p>
          </div>
        ) : (
          filteredSchedules.map(schedule => {
            const statusBadge = {
              'Terjadwal': 'bg-blue-50 text-blue-700 border-blue-200',
              'Aktif Berlayar': 'bg-emerald-50 text-emerald-700 border-emerald-200',
              'Selesai': 'bg-slate-100 text-slate-700 border-slate-200',
              'Tertunda Cuaca': 'bg-rose-50 text-rose-700 border-rose-200'
            }[schedule.status];

            return (
              <div
                key={schedule.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-amber-700 text-sm">
                          {schedule.voyageCode}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                          {schedule.status}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 mt-1 flex items-center gap-2">
                        <Ship className="w-4 h-4 text-blue-600" />
                        <span>{schedule.vesselName}</span>
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">Dermaga Sandar</span>
                      <span className="font-bold text-slate-800 text-xs bg-slate-100 px-2.5 py-1 rounded-lg">
                        {schedule.berthNumber}
                      </span>
                    </div>
                  </div>

                  {/* Route Visualizer */}
                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-bold text-slate-800">{schedule.originPort}</span>
                      <ArrowRight className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="font-bold text-amber-800">{schedule.destinationPort}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-200/60 text-[11px]">
                      <div>
                        <span className="text-slate-400 block font-medium">Waktu Keberangkatan (ETD):</span>
                        <strong className="text-slate-900 font-bold">
                          {new Date(schedule.departureDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Perkiraan Tiba (ETA):</span>
                        <strong className="text-amber-800 font-bold">
                          {new Date(schedule.arrivalDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {schedule.notes && (
                    <p className="mt-3 text-xs text-slate-600 italic bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60">
                      Catatan: {schedule.notes}
                    </p>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Bunker Plan: <strong className="text-slate-900 font-bold">{schedule.bunkerPlanTon} MT</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(schedule)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 transition-colors cursor-pointer"
                      title="Edit Jadwal"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingSchedule(schedule)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT SCHEDULE MODAL */}
      {localModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-[2rem] max-w-xl w-full border border-amber-500/30 shadow-2xl overflow-hidden my-8">
            
            <div className="p-6 bg-gradient-to-r from-slate-950 to-blue-950 text-white flex items-center justify-between border-b border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 p-0.5">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-300">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black">
                    {editingSchedule ? 'Edit Jadwal Pelayaran' : 'Terbitkan Jadwal Pelayaran Baru'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Tentukan rute pelayaran, kapal armada, dan alokasi dermaga sandar.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLocalModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kode Voyage Pelayaran <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.voyageCode}
                    onChange={(e) => setFormData({ ...formData, voyageCode: e.target.value })}
                    placeholder="Contoh: VOY-JVR-JKT-SBY-09"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {formErrors.voyageCode && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.voyageCode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Armada Kapal <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.vesselId}
                    onChange={(e) => setFormData({ ...formData, vesselId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    {vessels.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.vesselId && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.vesselId}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pelabuhan Asal Keberangkatan
                  </label>
                  <input
                    type="text"
                    value={formData.originPort}
                    onChange={(e) => setFormData({ ...formData, originPort: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pelabuhan Tujuan Kedatangan
                  </label>
                  <input
                    type="text"
                    value={formData.destinationPort}
                    onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Waktu Keberangkatan (ETD) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.departureDate}
                    onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {formErrors.departureDate && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.departureDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Perkiraan Tiba (ETA) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.arrivalDate}
                    onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {formErrors.arrivalDate && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.arrivalDate}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Dermaga
                  </label>
                  <input
                    type="text"
                    value={formData.berthNumber}
                    onChange={(e) => setFormData({ ...formData, berthNumber: e.target.value })}
                    placeholder="Contoh: Dermaga JICT 2B"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Jadwal
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="Terjadwal">Terjadwal</option>
                    <option value="Aktif Berlayar">Aktif Berlayar</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Tertunda Cuaca">Tertunda Cuaca</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bunker Plan (MT)
                  </label>
                  <input
                    type="number"
                    value={formData.bunkerPlanTon}
                    onChange={(e) => setFormData({ ...formData, bunkerPlanTon: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Pelayaran & Navigasi
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informasi cuaca, pasang surut, petunjuk alur dermaga..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setLocalModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs sm:text-sm font-black shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingSchedule ? 'Simpan Perubahan' : 'Terbitkan Jadwal'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center">
              Konfirmasi Hapus Jadwal Pelayaran
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus jadwal voyage <strong className="text-slate-900 font-semibold">{deletingSchedule.voyageCode}</strong> ({deletingSchedule.vesselName})?
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingSchedule(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Batalkan
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus Jadwal'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
