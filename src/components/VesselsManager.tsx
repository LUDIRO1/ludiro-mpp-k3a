import React, { useState } from 'react';
import { Vessel } from '../types/shipping.ts';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';
import { 
  Anchor, Plus, Search, Filter, Edit, Trash2, Ship, Gauge, Fuel, 
  MapPin, UserCheck, Calendar, ShieldCheck, AlertCircle, X, Check, Eye
} from 'lucide-react';

interface VesselsManagerProps {
  vessels: Vessel[];
  onRefresh: () => Promise<void>;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
}

export const VesselsManager: React.FC<VesselsManagerProps> = ({
  vessels,
  onRefresh,
  isCreateOpen,
  setIsCreateOpen
}) => {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [deletingVessel, setDeletingVessel] = useState<Vessel | null>(null);

  // Form State for Create / Edit
  const [formData, setFormData] = useState({
    name: '',
    imoNumber: '',
    callSign: '',
    vesselType: 'Container Ship' as Vessel['vesselType'],
    flag: 'Indonesia (ID)',
    dwt: 25000,
    teuCapacity: 1500,
    buildYear: 2020,
    status: 'Bersandar di Pelabuhan' as Vessel['status'],
    currentPort: 'Pelabuhan Tanjung Priok, Jakarta',
    destinationPort: 'Pelabuhan Tanjung Perak, Surabaya',
    captainName: '',
    speedKnots: 15.0,
    fuelLevelPercent: 85,
    estimatedArrival: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form strictly
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      errors.name = 'Nama kapal wajib diisi minimal 3 karakter.';
    }

    const imoRegex = /^IMO\s*\d{7}$/i;
    if (!formData.imoNumber.trim()) {
      errors.imoNumber = 'Nomor registrasi IMO wajib diisi.';
    } else if (!imoRegex.test(formData.imoNumber.trim())) {
      errors.imoNumber = 'Format IMO tidak valid! Wajib berformat "IMO 1234567" (7 digit angka resmi IMO).';
    }

    if (!formData.dwt || Number(formData.dwt) <= 0) {
      errors.dwt = 'Kapasitas DWT (Deadweight Tonnage) harus berupa angka positif lebih dari 0.';
    }

    if (!formData.captainName.trim() || formData.captainName.trim().length < 3) {
      errors.captainName = 'Nama Nakhoda (Master) wajib diisi minimal 3 karakter.';
    }

    if (!formData.currentPort.trim()) {
      errors.currentPort = 'Pelabuhan posisi saat ini wajib ditentukan.';
    }

    if (!formData.destinationPort.trim()) {
      errors.destinationPort = 'Pelabuhan tujuan pelayaran wajib ditentukan.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreate = () => {
    setEditingVessel(null);
    setFormData({
      name: '',
      imoNumber: '',
      callSign: 'YBDA-1',
      vesselType: 'Container Ship',
      flag: 'Indonesia (ID)',
      dwt: 28000,
      teuCapacity: 1800,
      buildYear: 2021,
      status: 'Bersandar di Pelabuhan',
      currentPort: 'Pelabuhan Tanjung Priok, Jakarta',
      destinationPort: 'Pelabuhan Belawan, Medan',
      captainName: 'Capt. ',
      speedKnots: 16.5,
      fuelLevelPercent: 85,
      estimatedArrival: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
    });
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (vessel: Vessel) => {
    setEditingVessel(vessel);
    setFormData({
      name: vessel.name,
      imoNumber: vessel.imoNumber,
      callSign: vessel.callSign,
      vesselType: vessel.vesselType,
      flag: vessel.flag,
      dwt: vessel.dwt,
      teuCapacity: vessel.teuCapacity || 0,
      buildYear: vessel.buildYear,
      status: vessel.status,
      currentPort: vessel.currentPort,
      destinationPort: vessel.destinationPort,
      captainName: vessel.captainName,
      speedKnots: vessel.speedKnots,
      fuelLevelPercent: vessel.fuelLevelPercent,
      estimatedArrival: vessel.estimatedArrival.split('T')[0] || ''
    });
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('error', 'Validasi Gagal', 'Harap periksa kolom yang ditandai merah.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingVessel) {
        await api.updateVessel(editingVessel.id, formData);
        showToast('success', 'Kapal Diperbarui', `Data kapal ${formData.name} berhasil disimpan ke database persisten.`);
      } else {
        await api.createVessel(formData);
        showToast('success', 'Kapal Ditambahkan', `Kapal ${formData.name} berhasil didaftarkan ke dalam armada.`);
      }
      setIsCreateOpen(false);
      await onRefresh();
    } catch (err: any) {
      showToast('error', 'Gagal Menyimpan', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingVessel) return;
    setIsSubmitting(true);
    try {
      await api.deleteVessel(deletingVessel.id);
      showToast('success', 'Kapal Dihapus', `Kapal ${deletingVessel.name} telah dikeluarkan dari database.`);
      setDeletingVessel(null);
      await onRefresh();
    } catch (err: any) {
      showToast('error', 'Gagal Menghapus', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter & Search logic
  const filteredVessels = vessels.filter(v => {
    const matchesSearch = 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.imoNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.captainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.currentPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.destinationPort.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Action Bar: Search, Filters, Create Button */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama kapal, IMO, nakhoda, pelabuhan..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          />
        </div>

        {/* Filters & Add Button */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="ALL">Semua Status Pelayaran</option>
              <option value="Berlayar">Berlayar (At Sea)</option>
              <option value="Bersandar di Pelabuhan">Bersandar di Pelabuhan</option>
              <option value="Siap Berangkat">Siap Berangkat</option>
              <option value="Pemeliharaan (Docking)">Pemeliharaan (Docking)</option>
            </select>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Daftarkan Kapal Baru</span>
          </button>

        </div>
      </div>

      {/* Vessels Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVessels.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200">
            <Ship className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Tidak ada data armada kapal ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau filter status.</p>
          </div>
        ) : (
          filteredVessels.map(vessel => {
            const statusConfig = {
              'Berlayar': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
              'Bersandar di Pelabuhan': { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
              'Siap Berangkat': { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
              'Pemeliharaan (Docking)': { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' }
            }[vessel.status];

            return (
              <div 
                key={vessel.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="p-5 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`} />
                            {vessel.status}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {vessel.imoNumber}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-2 group-hover:text-blue-600 transition-colors">
                          {vessel.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {vessel.vesselType} • {vessel.flag}
                        </p>
                      </div>

                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Ship className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Card Specs */}
                  <div className="p-5 space-y-3 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" /> Posisi Saat Ini:
                      </span>
                      <span className="font-semibold text-slate-800 text-right max-w-[180px] truncate" title={vessel.currentPort}>
                        {vessel.currentPort}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Anchor className="w-3.5 h-3.5 text-indigo-500" /> Pelabuhan Tujuan:
                      </span>
                      <span className="font-semibold text-blue-700 text-right max-w-[180px] truncate" title={vessel.destinationPort}>
                        {vessel.destinationPort}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-500" /> Nakhoda / Master:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {vessel.captainName}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Kapasitas DWT</span>
                        <span className="font-bold text-slate-800">{vessel.dwt.toLocaleString('id-ID')} MT</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Kecepatan</span>
                        <span className="font-bold text-blue-600">{vessel.speedKnots} Knots</span>
                      </div>
                    </div>

                    {/* Fuel Indicator Bar */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Fuel className="w-3 h-3 text-amber-500" /> Bahan Bakar Bunker:
                        </span>
                        <span className="font-bold text-slate-700">{vessel.fuelLevelPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            vessel.fuelLevelPercent > 40 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${vessel.fuelLevelPercent}%` }}
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Card Actions (CRUD Buttons) */}
                <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedVessel(vessel)}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 hover:border-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> Detail
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(vessel)}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                      title="Edit Data Kapal"
                    >
                      <Edit className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => setDeletingVessel(vessel)}
                      className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-300 text-xs font-semibold transition-colors cursor-pointer"
                      title="Hapus Kapal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT VESSEL MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-amber-500/20">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 p-0.5 shadow-md shadow-amber-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-300">
                    <Ship className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">
                    {editingVessel ? 'Edit Data Kapal Armada' : 'Registrasi Kapal Armada Baru'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Standar registrasi IMO dan sertifikasi kelaiklautan kapal JAVARA LINES.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ship Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Kapal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: MV Samudera Perkasa IX"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm ${
                      formErrors.name ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300 focus:bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-600`}
                  />
                  {formErrors.name && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* IMO Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor IMO (7 Digit) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.imoNumber}
                    onChange={(e) => setFormData({ ...formData, imoNumber: e.target.value })}
                    placeholder="Contoh: IMO 9382104"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono ${
                      formErrors.imoNumber ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300 focus:bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-600`}
                  />
                  {formErrors.imoNumber && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.imoNumber}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Vessel Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipe Kapal
                  </label>
                  <select
                    value={formData.vesselType}
                    onChange={(e) => setFormData({ ...formData, vesselType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Container Ship">Container Ship</option>
                    <option value="Bulk Carrier">Bulk Carrier</option>
                    <option value="Oil & Chemical Tanker">Oil & Chemical Tanker</option>
                    <option value="Ro-Ro Passenger">Ro-Ro Passenger</option>
                    <option value="Tug & Barge">Tug & Barge</option>
                  </select>
                </div>

                {/* DWT */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kapasitas DWT (Ton) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.dwt}
                    onChange={(e) => setFormData({ ...formData, dwt: Number(e.target.value) })}
                    placeholder="Contoh: 45000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {formErrors.dwt && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.dwt}</p>
                  )}
                </div>

                {/* TEU Capacity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kapasitas TEU Kontainer
                  </label>
                  <input
                    type="number"
                    value={formData.teuCapacity}
                    onChange={(e) => setFormData({ ...formData, teuCapacity: Number(e.target.value) })}
                    placeholder="Contoh: 3200"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Current Port */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Posisi / Pelabuhan Saat Ini <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.currentPort}
                    onChange={(e) => setFormData({ ...formData, currentPort: e.target.value })}
                    placeholder="Contoh: Pelabuhan Tanjung Priok, Jakarta"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {formErrors.currentPort && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.currentPort}</p>
                  )}
                </div>

                {/* Destination Port */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pelabuhan Tujuan (POD) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.destinationPort}
                    onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                    placeholder="Contoh: Pelabuhan Tanjung Perak, Surabaya"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {formErrors.destinationPort && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.destinationPort}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Captain Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Nakhoda (Master) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.captainName}
                    onChange={(e) => setFormData({ ...formData, captainName: e.target.value })}
                    placeholder="Contoh: Capt. Agus Supriyadi, M.Mar"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {formErrors.captainName && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.captainName}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Operasional
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Bersandar di Pelabuhan">Bersandar di Pelabuhan</option>
                    <option value="Berlayar">Berlayar</option>
                    <option value="Siap Berangkat">Siap Berangkat</option>
                    <option value="Pemeliharaan (Docking)">Pemeliharaan (Docking)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Speed Knots */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kecepatan (Knots)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.speedKnots}
                    onChange={(e) => setFormData({ ...formData, speedKnots: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Fuel Level */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bahan Bakar (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.fuelLevelPercent}
                    onChange={(e) => setFormData({ ...formData, fuelLevelPercent: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Build Year */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahun Pembuatan
                  </label>
                  <input
                    type="number"
                    value={formData.buildYear}
                    onChange={(e) => setFormData({ ...formData, buildYear: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Menyimpan ke DB...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingVessel ? 'Simpan Perubahan' : 'Registrasikan Kapal'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* VESSEL DETAIL DRAWER MODAL */}
      {selectedVessel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedVessel(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
                <Ship className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold text-blue-600">{selectedVessel.imoNumber}</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedVessel.name}</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Status Operasi:</span>
                <span className="font-bold text-blue-700">{selectedVessel.status}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Tipe Kapal:</span>
                <span className="font-semibold text-slate-800">{selectedVessel.vesselType}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Kapasitas Deadweight:</span>
                <span className="font-semibold text-slate-800">{selectedVessel.dwt.toLocaleString('id-ID')} Metric Ton</span>
              </div>
              {selectedVessel.teuCapacity ? (
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Kapasitas Kontainer:</span>
                  <span className="font-semibold text-slate-800">{selectedVessel.teuCapacity} TEU</span>
                </div>
              ) : null}
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Bendera / Registrasi:</span>
                <span className="font-semibold text-slate-800">{selectedVessel.flag} ({selectedVessel.callSign})</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Nakhoda (Master):</span>
                <span className="font-bold text-slate-900">{selectedVessel.captainName}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Posisi Saat Ini:</span>
                <span className="font-semibold text-slate-800">{selectedVessel.currentPort}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Pelabuhan Tujuan:</span>
                <span className="font-semibold text-blue-700">{selectedVessel.destinationPort}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Level Bunker BBM:</span>
                <span className="font-bold text-emerald-600">{selectedVessel.fuelLevelPercent}%</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedVessel(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingVessel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center">
              Konfirmasi Penghapusan Kapal
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong className="text-slate-900 font-semibold">{deletingVessel.name}</strong> ({deletingVessel.imoNumber}) dari database armada? Tindakan ini akan dicatat ke audit log sistem.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingVessel(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Batalkan
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus Kapal'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
