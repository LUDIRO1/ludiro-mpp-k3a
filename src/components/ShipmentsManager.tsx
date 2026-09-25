import React, { useState } from 'react';
import { Shipment, Vessel } from '../types/shipping.ts';
import { api } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';
import { 
  Box, Plus, Search, Filter, Edit, Trash2, Ship, FileText, CheckCircle2, 
  Clock, AlertCircle, X, Check, Printer, DollarSign, ArrowRight, ArrowUpDown
} from 'lucide-react';

interface ShipmentsManagerProps {
  shipments: Shipment[];
  vessels: Vessel[];
  onRefresh: () => Promise<void>;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
}

export const ShipmentsManager: React.FC<ShipmentsManagerProps> = ({
  shipments,
  vessels,
  onRefresh,
  isCreateOpen,
  setIsCreateOpen
}) => {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [cargoTypeFilter, setCargoTypeFilter] = useState<string>('ALL');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [deletingShipment, setDeletingShipment] = useState<Shipment | null>(null);
  const [viewBillOfLading, setViewBillOfLading] = useState<Shipment | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    shipperName: '',
    consigneeName: '',
    vesselId: vessels[0]?.id || '',
    cargoType: 'Dry Container' as Shipment['cargoType'],
    containerCount: 20,
    weightTons: 500,
    originPort: 'Pelabuhan Tanjung Priok, Jakarta',
    destinationPort: 'Pelabuhan Tanjung Perak, Surabaya',
    etd: new Date().toISOString().split('T')[0],
    eta: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    status: 'Menunggu Muat' as Shipment['status'],
    paymentStatus: 'Lunas' as Shipment['paymentStatus'],
    costTotalIdr: 250000000,
    billOfLadingNo: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatIdr = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.shipperName.trim() || formData.shipperName.trim().length < 3) {
      errors.shipperName = 'Nama Pengirim (Shipper) wajib diisi minimal 3 karakter.';
    }
    if (!formData.consigneeName.trim() || formData.consigneeName.trim().length < 3) {
      errors.consigneeName = 'Nama Penerima (Consignee) wajib diisi minimal 3 karakter.';
    }
    if (!formData.vesselId) {
      errors.vesselId = 'Silakan pilih kapal armada pengangkut.';
    }
    if (!formData.weightTons || Number(formData.weightTons) <= 0) {
      errors.weightTons = 'Berat muatan kargo (Ton) harus bernilai lebih dari 0.';
    }
    if (!formData.originPort.trim()) {
      errors.originPort = 'Pelabuhan muat (POL) wajib ditentukan.';
    }
    if (!formData.destinationPort.trim()) {
      errors.destinationPort = 'Pelabuhan bongkar (POD) wajib ditentukan.';
    }
    if (formData.originPort.trim().toLowerCase() === formData.destinationPort.trim().toLowerCase()) {
      errors.destinationPort = 'Pelabuhan bongkar tidak boleh sama dengan pelabuhan muat.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreate = () => {
    setEditingShipment(null);
    setFormData({
      shipperName: '',
      consigneeName: '',
      vesselId: vessels[0]?.id || '',
      cargoType: 'Dry Container',
      containerCount: 25,
      weightTons: 625,
      originPort: 'Pelabuhan Tanjung Priok, Jakarta',
      destinationPort: 'Pelabuhan Belawan, Medan',
      etd: new Date().toISOString().split('T')[0],
      eta: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      status: 'Menunggu Muat',
      paymentStatus: 'Uang Muka (DP 50%)',
      costTotalIdr: 320000000,
      billOfLadingNo: `BL-${Date.now().toString().slice(-6)}`,
      notes: ''
    });
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (shipment: Shipment) => {
    setEditingShipment(shipment);
    setFormData({
      shipperName: shipment.shipperName,
      consigneeName: shipment.consigneeName,
      vesselId: shipment.vesselId,
      cargoType: shipment.cargoType,
      containerCount: shipment.containerCount,
      weightTons: shipment.weightTons,
      originPort: shipment.originPort,
      destinationPort: shipment.destinationPort,
      etd: shipment.etd.split('T')[0] || '',
      eta: shipment.eta.split('T')[0] || '',
      status: shipment.status,
      paymentStatus: shipment.paymentStatus,
      costTotalIdr: shipment.costTotalIdr,
      billOfLadingNo: shipment.billOfLadingNo,
      notes: shipment.notes || ''
    });
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('error', 'Validasi Gagal', 'Harap lengkapi semua kolom bertanda bintang.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingShipment) {
        await api.updateShipment(editingShipment.id, formData);
        showToast('success', 'Manifest Diperbarui', `Manifest kargo ${editingShipment.trackingNumber} berhasil disimpan.`);
      } else {
        await api.createShipment(formData);
        showToast('success', 'Manifest Diterbitkan', `Manifest kargo baru berhasil diterbitkan ke database.`);
      }
      setIsCreateOpen(false);
      await onRefresh();
    } catch (err: any) {
      showToast('error', 'Gagal Menyimpan Manifest', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingShipment) return;
    setIsSubmitting(true);
    try {
      await api.deleteShipment(deletingShipment.id);
      showToast('success', 'Manifest Dihapus', `Manifest ${deletingShipment.trackingNumber} telah dihapus.`);
      setDeletingShipment(null);
      await onRefresh();
    } catch (err: any) {
      showToast('error', 'Gagal Menghapus Manifest', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter
  const filteredShipments = shipments.filter(s => {
    const matchesSearch =
      s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.shipperName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.consigneeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.billOfLadingNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesCargo = cargoTypeFilter === 'ALL' || s.cargoType === cargoTypeFilter;
    return matchesSearch && matchesStatus && matchesCargo;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Action Bar */}
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
            placeholder="Cari No. Tracking, BL, Shipper, Kapal..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          />
        </div>

        {/* Filters and Add Button */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="ALL">Semua Status Kargo</option>
            <option value="Menunggu Muat">Menunggu Muat</option>
            <option value="Dalam Pelayaran">Dalam Pelayaran</option>
            <option value="Tiba di Pelabuhan">Tiba di Pelabuhan</option>
            <option value="Bongkar Selesai">Bongkar Selesai</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>

          {/* Cargo Type Filter */}
          <select
            value={cargoTypeFilter}
            onChange={(e) => setCargoTypeFilter(e.target.value)}
            className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="ALL">Semua Jenis Kargo</option>
            <option value="Dry Container">Dry Container</option>
            <option value="Reefer (Pendingin)">Reefer (Pendingin)</option>
            <option value="Curah Kering (Bulk)">Curah Kering (Bulk)</option>
            <option value="Cair (Liquid)">Cair (Liquid)</option>
            <option value="Alat Berat / Project">Alat Berat / Project</option>
          </select>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat Manifest Baru</span>
          </button>

        </div>
      </div>

      {/* Shipments Table List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Tracking & BL</th>
                <th className="py-3.5 px-4">Pengirim & Penerima</th>
                <th className="py-3.5 px-4">Kapal Pengangkut</th>
                <th className="py-3.5 px-4">Kargo & Tonase</th>
                <th className="py-3.5 px-4">Rute Pelabuhan</th>
                <th className="py-3.5 px-4">Status Manifest</th>
                <th className="py-3.5 px-4">Biaya & Pembayaran</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Box className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Belum ada manifest muatan kargo</p>
                  </td>
                </tr>
              ) : (
                filteredShipments.map(shipment => {
                  const statusStyles = {
                    'Menunggu Muat': 'bg-amber-50 text-amber-700 border-amber-200',
                    'Dalam Pelayaran': 'bg-blue-50 text-blue-700 border-blue-200',
                    'Tiba di Pelabuhan': 'bg-purple-50 text-purple-700 border-purple-200',
                    'Bongkar Selesai': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    'Dibatalkan': 'bg-rose-50 text-rose-700 border-rose-200'
                  }[shipment.status];

                  return (
                    <tr key={shipment.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Tracking */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-blue-600 text-xs sm:text-sm">
                          {shipment.trackingNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {shipment.billOfLadingNo}
                        </div>
                      </td>

                      {/* Shipper & Consignee */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="font-bold text-slate-900 truncate" title={shipment.shipperName}>
                          {shipment.shipperName}
                        </div>
                        <div className="text-xs text-slate-500 truncate" title={shipment.consigneeName}>
                          To: {shipment.consigneeName}
                        </div>
                      </td>

                      {/* Vessel */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <Ship className="w-3.5 h-3.5 text-blue-600" />
                          <span>{shipment.vesselName}</span>
                        </div>
                      </td>

                      {/* Cargo */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">
                          {shipment.weightTons.toLocaleString('id-ID')} Ton
                        </div>
                        <div className="text-xs text-slate-500">
                          {shipment.cargoType} {shipment.containerCount > 0 && `(${shipment.containerCount} TEU)`}
                        </div>
                      </td>

                      {/* Route */}
                      <td className="py-3.5 px-4 text-xs">
                        <div className="text-slate-700 font-medium truncate max-w-[170px]" title={shipment.originPort}>
                          {shipment.originPort.replace('Pelabuhan ', '')}
                        </div>
                        <div className="text-blue-600 font-medium truncate max-w-[170px]" title={shipment.destinationPort}>
                          ↓ {shipment.destinationPort.replace('Pelabuhan ', '')}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusStyles}`}>
                          {shipment.status}
                        </span>
                      </td>

                      {/* Payment & Cost */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {formatIdr(shipment.costTotalIdr)}
                        </div>
                        <div className={`text-[10px] font-semibold ${
                          shipment.paymentStatus === 'Lunas' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {shipment.paymentStatus}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewBillOfLading(shipment)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors"
                            title="Cetak Bill of Lading"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(shipment)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Edit Manifest"
                          >
                            <Edit className="w-3.5 h-3.5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => setDeletingShipment(shipment)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-rose-600 transition-colors"
                            title="Hapus Manifest"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT SHIPMENT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            
            <div className="p-6 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-amber-500/20">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 p-0.5 shadow-md shadow-amber-500/20">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-300">
                    <Box className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">
                    {editingShipment ? 'Edit Data Manifest Kargo' : 'Penerbitan Manifest Kargo Baru'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Pastikan informasi shipper, bobot muatan, dan kapal pengangkut akurat untuk penerbitan B/L.
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Shipper */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Pengirim (Shipper) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.shipperName}
                    onChange={(e) => setFormData({ ...formData, shipperName: e.target.value })}
                    placeholder="Contoh: PT Indofood Sukses Makmur Tbk"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm ${
                      formErrors.shipperName ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300 focus:bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-600`}
                  />
                  {formErrors.shipperName && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.shipperName}</p>
                  )}
                </div>

                {/* Consignee */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Penerima (Consignee) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.consigneeName}
                    onChange={(e) => setFormData({ ...formData, consigneeName: e.target.value })}
                    placeholder="Contoh: Eastern Logistics Corp Makassar"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm ${
                      formErrors.consigneeName ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300 focus:bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-600`}
                  />
                  {formErrors.consigneeName && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.consigneeName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vessel Select */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Armada Kapal Pengangkut <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.vesselId}
                    onChange={(e) => setFormData({ ...formData, vesselId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {vessels.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.imoNumber} - {v.status})
                      </option>
                    ))}
                  </select>
                  {formErrors.vesselId && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.vesselId}</p>
                  )}
                </div>

                {/* Cargo Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori Muatan (Cargo Type)
                  </label>
                  <select
                    value={formData.cargoType}
                    onChange={(e) => setFormData({ ...formData, cargoType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Dry Container">Dry Container</option>
                    <option value="Reefer (Pendingin)">Reefer (Pendingin)</option>
                    <option value="Curah Kering (Bulk)">Curah Kering (Bulk)</option>
                    <option value="Cair (Liquid)">Cair (Liquid)</option>
                    <option value="Alat Berat / Project">Alat Berat / Project</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Weight Tons */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bobot Muatan (Tonase) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.weightTons}
                    onChange={(e) => setFormData({ ...formData, weightTons: Number(e.target.value) })}
                    placeholder="Contoh: 1200"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {formErrors.weightTons && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.weightTons}</p>
                  )}
                </div>

                {/* Container Count */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah Kontainer (TEU)
                  </label>
                  <input
                    type="number"
                    value={formData.containerCount}
                    onChange={(e) => setFormData({ ...formData, containerCount: Number(e.target.value) })}
                    placeholder="0 jika bukan muatan kontainer"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Origin Port */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pelabuhan Muat (POL) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.originPort}
                    onChange={(e) => setFormData({ ...formData, originPort: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {formErrors.originPort && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.originPort}</p>
                  )}
                </div>

                {/* Destination Port */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pelabuhan Bongkar (POD) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.destinationPort}
                    onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  {formErrors.destinationPort && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.destinationPort}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Muatan
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Menunggu Muat">Menunggu Muat</option>
                    <option value="Dalam Pelayaran">Dalam Pelayaran</option>
                    <option value="Tiba di Pelabuhan">Tiba di Pelabuhan</option>
                    <option value="Bongkar Selesai">Bongkar Selesai</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>

                {/* Payment Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Pembayaran
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Lunas">Lunas</option>
                    <option value="Uang Muka (DP 50%)">Uang Muka (DP 50%)</option>
                    <option value="Belum Bayar">Belum Bayar</option>
                  </select>
                </div>

                {/* Cost IDR */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tarif Pengapalan (IDR)
                  </label>
                  <input
                    type="number"
                    value={formData.costTotalIdr}
                    onChange={(e) => setFormData({ ...formData, costTotalIdr: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Khusus Manifest (Instruksi Handling)
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Contoh: Kargo pendingin wajib -18C, lashing bertingkat..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

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
                      <span>{editingShipment ? 'Simpan Perubahan' : 'Terbitkan Manifest'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* BILL OF LADING MODAL (PRINT/PREVIEW) */}
      {viewBillOfLading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-300 shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => setViewBillOfLading(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Formal B/L Header */}
            <div className="border-b-2 border-slate-800 pb-4 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">
                  PT JAVARA LINES TBK
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  OCEAN BILL OF LADING
                </h3>
                <p className="text-xs text-slate-500">Non-Negotiable Cargo Delivery Manifest Document</p>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-500">Nomor B/L:</div>
                <div className="text-sm font-mono font-extrabold text-blue-700">{viewBillOfLading.billOfLadingNo}</div>
                <div className="text-[11px] font-mono text-slate-400">Track: {viewBillOfLading.trackingNumber}</div>
              </div>
            </div>

            {/* B/L Body */}
            <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 uppercase font-bold text-[10px] block">PENGIRIM (SHIPPER)</span>
                <strong className="text-slate-900 text-sm">{viewBillOfLading.shipperName}</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-400 uppercase font-bold text-[10px] block">PENERIMA (CONSIGNEE)</span>
                <strong className="text-slate-900 text-sm">{viewBillOfLading.consigneeName}</strong>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs py-3 border-b border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">KAPAL PENGANGKUT</span>
                <strong className="text-slate-800">{viewBillOfLading.vesselName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">PELABUHAN MUAT (POL)</span>
                <strong className="text-slate-800">{viewBillOfLading.originPort}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">PELABUHAN BONGKAR (POD)</span>
                <strong className="text-slate-800">{viewBillOfLading.destinationPort}</strong>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs py-3 border-b border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">DESKRIPSI KARGO</span>
                <strong className="text-slate-800">{viewBillOfLading.cargoType}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">BOBOT TONASE</span>
                <strong className="text-slate-800">{viewBillOfLading.weightTons} Metric Tons</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">BIAYA FREIGHT LOGISTIK</span>
                <strong className="text-emerald-700 font-bold">{formatIdr(viewBillOfLading.costTotalIdr)}</strong>
              </div>
            </div>

            {viewBillOfLading.notes && (
              <div className="mt-3 p-3 bg-amber-50 rounded-lg text-xs text-amber-900 border border-amber-200">
                <strong>Catatan Penanganan:</strong> {viewBillOfLading.notes}
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Terverifikasi secara digital oleh Database Operasional Maritim
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Manifest
                </button>
                <button
                  onClick={() => setViewBillOfLading(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center">
              Konfirmasi Hapus Manifest Kargo
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus manifest muatan <strong className="text-slate-900 font-semibold">{deletingShipment.trackingNumber}</strong> ({deletingShipment.shipperName})? Data akan dihapus permanen dari database.
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingShipment(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Batalkan
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus Manifest'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
