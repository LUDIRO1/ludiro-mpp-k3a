import React, { useState, useEffect } from 'react';
import { CrewMember, Vessel } from '../types/shipping.ts';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';
import { 
  Users, Plus, Search, Filter, Edit, Trash2, Ship, ShieldCheck, 
  Phone, AlertCircle, X, Check, Award, Contact2, Crown, Sparkles
} from 'lucide-react';

interface CrewManagerProps {
  crew: CrewMember[];
  vessels: Vessel[];
  onRefresh: () => Promise<void>;
  isCreateOpen?: boolean;
  setIsCreateOpen?: (open: boolean) => void;
}

export const CrewManager: React.FC<CrewManagerProps> = ({
  crew,
  vessels,
  onRefresh,
  isCreateOpen = false,
  setIsCreateOpen
}) => {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [localModalOpen, setLocalModalOpen] = useState(false);
  const [editingCrew, setEditingCrew] = useState<CrewMember | null>(null);
  const [deletingCrew, setDeletingCrew] = useState<CrewMember | null>(null);

  useEffect(() => {
    if (isCreateOpen) {
      handleOpenCreate();
      if (setIsCreateOpen) setIsCreateOpen(false);
    }
  }, [isCreateOpen, setIsCreateOpen]);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    seamanBookNo: '',
    role: 'Able Seaman' as CrewMember['role'],
    vesselId: vessels[0]?.id || '',
    certification: 'BST / STCW' as CrewMember['certification'],
    nationality: 'Indonesia',
    status: 'Siap Tugas' as CrewMember['status'],
    contractEnd: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    phone: '+62 812-3456-7890',
    emergencyContact: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      errors.fullName = 'Nama lengkap perwira/pelaut wajib diisi minimal 3 karakter.';
    }
    if (!formData.seamanBookNo.trim() || formData.seamanBookNo.trim().length < 4) {
      errors.seamanBookNo = 'Nomor Buku Pelaut (Seaman Book) wajib diisi valid.';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Nomor telepon / kontak wajib diisi.';
    }
    if (!formData.emergencyContact.trim()) {
      errors.emergencyContact = 'Kontak darurat keluarga pelaut wajib diisi.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreate = () => {
    setEditingCrew(null);
    setFormData({
      fullName: '',
      seamanBookNo: `B-${Math.floor(100000 + Math.random() * 900000)}-JKT`,
      role: 'Chief Officer (Mualim I)',
      vesselId: vessels[0]?.id || '',
      certification: 'ANT II',
      nationality: 'Indonesia',
      status: 'Aktif Berlayar',
      contractEnd: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      phone: '+62 813-9988-7766',
      emergencyContact: 'Istri - 0812-3344-5566'
    });
    setFormErrors({});
    setLocalModalOpen(true);
  };

  const handleOpenEdit = (member: CrewMember) => {
    setEditingCrew(member);
    setFormData({
      fullName: member.fullName,
      seamanBookNo: member.seamanBookNo,
      role: member.role,
      vesselId: member.vesselId,
      certification: member.certification,
      nationality: member.nationality,
      status: member.status,
      contractEnd: member.contractEnd,
      phone: member.phone,
      emergencyContact: member.emergencyContact
    });
    setFormErrors({});
    setLocalModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('error', 'Validasi Gagal', 'Harap lengkapi formulir pendaftaran kru.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCrew) {
        await api.updateCrew(editingCrew.id, formData);
        showToast('success', 'Kru Diperbarui', `Data pelaut ${formData.fullName} berhasil diperbarui di database online.`);
      } else {
        await api.createCrew(formData);
        showToast('success', 'Kru Didaftarkan', `Pelaut ${formData.fullName} berhasil didaftarkan ke sistem JAVARA LINES.`);
      }
      setLocalModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      showToast('error', 'Gagal Menyimpan Kru', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCrew) return;
    setIsSubmitting(true);
    try {
      await api.deleteCrew(deletingCrew.id);
      showToast('success', 'Kru Dihapus', `Data pelaut ${deletingCrew.fullName} telah dihapus dari database online.`);
      setDeletingCrew(null);
      await onRefresh();
    } catch (err: any) {
      showToast('error', 'Gagal Menghapus', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCrew = crew.filter(c => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.seamanBookNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || c.role.includes(roleFilter);
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Controls */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama perwira, buku pelaut, kapal..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="ALL">Semua Status Penugasan</option>
            <option value="Aktif Berlayar">Aktif Berlayar</option>
            <option value="Siap Tugas">Siap Tugas (Standby)</option>
            <option value="Cuti Darat">Cuti Darat</option>
          </select>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Registrasi Awak Kapal</span>
          </button>

        </div>
      </div>

      {/* Crew Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCrew.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Tidak ada awak kapal yang sesuai kriteria</h3>
            <p className="text-xs text-slate-400 mt-1">Gunakan tombol di atas untuk mendaftarkan perwira baru.</p>
          </div>
        ) : (
          filteredCrew.map(member => {
            const statusConfig = {
              'Aktif Berlayar': 'bg-emerald-50 text-emerald-700 border-emerald-200',
              'Siap Tugas': 'bg-blue-50 text-blue-700 border-blue-200',
              'Cuti Darat': 'bg-amber-50 text-amber-700 border-amber-200'
            }[member.status];

            return (
              <div
                key={member.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-md shadow-amber-500/20 shrink-0">
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-amber-300 text-sm">
                          {member.fullName.split(' ').map(w => w[0]).slice(0, 2).join('')}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900 leading-snug">
                          {member.fullName}
                        </h4>
                        <span className="text-xs font-bold text-amber-700 block">
                          {member.role}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig}`}>
                      {member.status}
                    </span>
                  </div>

                  {/* Body Specs */}
                  <div className="mt-4 space-y-2.5 text-xs border-t border-slate-100 pt-3 text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Buku Pelaut:</span>
                      <span className="font-mono font-bold text-slate-900">{member.seamanBookNo}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Sertifikasi:</span>
                      <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md text-[11px] border border-amber-200/50">
                        {member.certification}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Penugasan Kapal:</span>
                      <span className="font-bold text-slate-900 flex items-center gap-1 truncate max-w-[170px]" title={member.vesselName}>
                        <Ship className="w-3.5 h-3.5 text-blue-600" />
                        {member.vesselName}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Akhir Kontrak:</span>
                      <span className="text-slate-800 font-bold">{member.contractEnd}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Telepon:</span>
                      <span className="font-mono text-slate-800 font-bold">{member.phone}</span>
                    </div>

                    <div className="pt-2 text-[11px] text-slate-500 truncate border-t border-slate-100">
                      <span className="text-slate-400 font-medium">Darurat:</span> {member.emergencyContact}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(member)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 transition-colors cursor-pointer"
                    title="Edit Kru"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingCrew(member)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                    title="Hapus Kru"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT CREW MODAL */}
      {localModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-[2rem] max-w-xl w-full border border-amber-500/30 shadow-2xl overflow-hidden my-8">
            
            <div className="p-6 bg-gradient-to-r from-slate-950 to-blue-950 text-white flex items-center justify-between border-b border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 p-0.5">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-300">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black">
                    {editingCrew ? 'Perbarui Data Awak Kapal' : 'Registrasi Awak Kapal / Perwira Baru'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Data buku pelaut dan sertifikasi keahlian pelaut (STCW Convention).
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
                    Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Contoh: Bambang Eko Santoso, S.ST.Pel"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {formErrors.fullName && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Buku Pelaut (Seaman Book) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.seamanBookNo}
                    onChange={(e) => setFormData({ ...formData, seamanBookNo: e.target.value })}
                    placeholder="Contoh: B-098234-JKT"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {formErrors.seamanBookNo && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.seamanBookNo}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pangkat / Jabatan Kapal
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="Nakhoda (Master)">Nakhoda (Master)</option>
                    <option value="Chief Officer (Mualim I)">Chief Officer (Mualim I)</option>
                    <option value="Second Officer (Mualim II)">Second Officer (Mualim II)</option>
                    <option value="Chief Engineer (KKM)">Chief Engineer (KKM)</option>
                    <option value="Second Engineer">Second Engineer</option>
                    <option value="Bosun (Kelasi)">Bosun (Kelasi)</option>
                    <option value="Able Seaman">Able Seaman</option>
                    <option value="Oiler / Juru Minyak">Oiler / Juru Minyak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Penugasan Kapal
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
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sertifikasi STCW
                  </label>
                  <select
                    value={formData.certification}
                    onChange={(e) => setFormData({ ...formData, certification: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="ANT I">ANT I (Master Mariner)</option>
                    <option value="ANT II">ANT II (Chief Mate)</option>
                    <option value="ANT III">ANT III (Officer)</option>
                    <option value="ATT I">ATT I (Chief Engineer)</option>
                    <option value="ATT II">ATT II (2nd Engineer)</option>
                    <option value="ATT III">ATT III (Engineer)</option>
                    <option value="BST / STCW">BST / STCW (Rating)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Tugas
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="Aktif Berlayar">Aktif Berlayar</option>
                    <option value="Siap Tugas">Siap Tugas</option>
                    <option value="Cuti Darat">Cuti Darat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Akhir Kontrak
                  </label>
                  <input
                    type="date"
                    value={formData.contractEnd}
                    onChange={(e) => setFormData({ ...formData, contractEnd: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Telepon Pelaut <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+62 812-xxxx-xxxx"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {formErrors.phone && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kontak Darurat Keluarga <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="Contoh: Ibu Ratna (Istri) - 0813-xxxx-xxxx"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {formErrors.emergencyContact && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.emergencyContact}</p>
                  )}
                </div>
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
                      <span>{editingCrew ? 'Simpan Perubahan' : 'Daftarkan Pelaut'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingCrew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center">
              Konfirmasi Hapus Awak Kapal
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus data pelaut <strong className="text-slate-900 font-semibold">{deletingCrew.fullName}</strong> ({deletingCrew.seamanBookNo}) dari database online?
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingCrew(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Batalkan
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus Data'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
