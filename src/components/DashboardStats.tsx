import React from 'react';
import { DashboardStats as IDashboardStats, Vessel, Shipment } from '../types/shipping.ts';
import { 
  Ship, Anchor, Box, Calendar, Users, TrendingUp, Navigation, 
  AlertCircle, Compass, ArrowUpRight, Clock, PlusCircle, Sparkles, 
  Crown, Globe, Fuel, FileText, CheckCircle2, ShieldCheck, Zap
} from 'lucide-react';

interface DashboardStatsProps {
  stats: IDashboardStats | null;
  vessels: Vessel[];
  shipments: Shipment[];
  onNavigateTab: (tab: 'vessels' | 'shipments' | 'schedules' | 'crew') => void;
  onOpenCreateVessel: () => void;
  onOpenCreateShipment: () => void;
  onOpenCreateSchedule: () => void;
  onOpenCreateCrew: () => void;
  onManualSync: () => void;
  isSyncing: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  vessels,
  shipments,
  onNavigateTab,
  onOpenCreateVessel,
  onOpenCreateShipment,
  onOpenCreateSchedule,
  onOpenCreateCrew,
  onManualSync,
  isSyncing
}) => {
  const formatIdr = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const sailingVessels = vessels.filter(v => v.status === 'Berlayar');
  const activeShipments = shipments.filter(s => s.status === 'Dalam Pelayaran' || s.status === 'Menunggu Muat');

  return (
    <div className="space-y-6 font-sans">
      
      {/* Luxury Royal Hero Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-amber-500/25 relative overflow-hidden">
        
        {/* Subtle decorative gold light sweep */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-0 bottom-0 w-96 h-full bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold mb-3 shadow-inner">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Pusat Kendali Operasi Maritim Eksekutif JAVARA LINES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Monitoring Pelayaran & Armada Mewah Terpadu
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Seluruh data kapal, manifest muatan kargo, jadwal pelayaran, dan awak kapal tersinkronisasi <strong>secara online</strong> kepada seluruh pengguna yang terhubung di sistem ini.
            </p>
          </div>

          {/* Quick Realtime Sync Status Badge */}
          <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Multi-User Online Live Sync Aktif</span>
            </div>
            <button
              onClick={onManualSync}
              className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
            >
              <span>{isSyncing ? 'Menyinkronkan Data...' : 'Tekan untuk Sinkronkan Sekarang'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Executive Action Hub (Intuitive 1-Click Access to All Features) */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-300 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Pusat Aksi Cepat Eksekutif (Akses Semua Fitur):</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Action 1: Add Vessel */}
            <button
              onClick={onOpenCreateVessel}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Daftarkan Kapal Baru</span>
            </button>

            {/* Action 2: Add Shipment */}
            <button
              onClick={onOpenCreateShipment}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Box className="w-4 h-4 text-amber-400" />
              <span>+ Terbitkan Manifest</span>
            </button>

            {/* Action 3: Add Schedule */}
            <button
              onClick={onOpenCreateSchedule}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>+ Jadwal Voyage Baru</span>
            </button>

            {/* Action 4: Add Crew */}
            <button
              onClick={onOpenCreateCrew}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>+ Tambah Awak Kapal</span>
            </button>
          </div>
        </div>

      </div>

      {/* Luxury KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Armada Kapal */}
        <div 
          onClick={() => onNavigateTab('vessels')}
          className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Armada Kapal</span>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-300">
                <Ship className="w-5 h-5" />
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">{stats?.totalVessels ?? vessels.length}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {stats?.sailingVessels ?? sailingVessels.length} Berlayar
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{stats?.berthedVessels ?? 0} Bersandar di Pelabuhan</span>
            <span className="text-amber-600 font-semibold">{stats?.maintenanceVessels ?? 0} Docking</span>
          </div>
        </div>

        {/* Card 2: Tonase & Muatan */}
        <div 
          onClick={() => onNavigateTab('shipments')}
          className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tonase Kargo</span>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-300">
                <Box className="w-5 h-5" />
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">
              {stats?.totalCargoWeightTons?.toLocaleString('id-ID') ?? 0}
            </span>
            <span className="text-xs font-semibold text-slate-600">Metric Tons</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{stats?.totalTeu ?? 0} TEU Kontainer</span>
            <span className="text-blue-700 font-bold">{stats?.activeShipments ?? 0} Manifest Aktif</span>
          </div>
        </div>

        {/* Card 3: Jadwal Pelayaran */}
        <div 
          onClick={() => onNavigateTab('schedules')}
          className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/10 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jadwal Voyage</span>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-300">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">{stats?.upcomingSchedules ?? 0}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Rute Terjadwal
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Jalur Interinsuler Utama</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
          </div>
        </div>

        {/* Card 4: Awak Kapal & Perwira */}
        <div 
          onClick={() => onNavigateTab('crew')}
          className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/10 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Awak & Perwira</span>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-400 p-0.5 shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-purple-300">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">{stats?.totalCrew ?? 0}</span>
            <span className="text-xs font-semibold text-slate-600">Personil</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-emerald-700 font-bold">{stats?.activeCrewCount ?? 0} Sedang di Laut</span>
            <span className="text-purple-700 font-semibold">STCW Certified</span>
          </div>
        </div>

      </div>

      {/* Two-Column Section: Active Sailing Vessels Radar & Priority Manifests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Active Sailing Fleet Radar */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  Radar Posisi Armada Berlayar (Live)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Monitoring kecepatan, bunker bahan bakar, nakhoda, dan perkiraan waktu tiba di pelabuhan.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('vessels')}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-amber-700 border border-slate-200 hover:border-amber-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              Semua Armada ({vessels.length}) <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {sailingVessels.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Tidak ada kapal yang sedang berlayar saat ini.
              </div>
            ) : (
              sailingVessels.map(vessel => (
                <div 
                  key={vessel.id}
                  className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/30 hover:to-amber-50/40 border border-slate-200/80 hover:border-amber-400/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-slate-900 text-sm group-hover:text-amber-700 transition-colors">
                        {vessel.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-800 border border-amber-300/40">
                        {vessel.imoNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>Master: <strong className="text-slate-900 font-bold">{vessel.captainName}</strong></span>
                      <span>•</span>
                      <span>Kecepatan: <strong className="text-blue-700 font-bold">{vessel.speedKnots} Knots</strong></span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span>Rute:</span>
                      <span className="font-medium text-slate-800">{vessel.currentPort}</span>
                      <span>→</span>
                      <span className="font-bold text-amber-800">{vessel.destinationPort}</span>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <div className="text-xs text-slate-500 font-medium">Kapasitas Bunker</div>
                    <div className="flex items-center sm:justify-end gap-2 mt-1">
                      <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${vessel.fuelLevelPercent > 40 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${vessel.fuelLevelPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-900">{vessel.fuelLevelPercent}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Urgent Cargo Manifests */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <Box className="w-5 h-5 text-amber-600" />
                <span>Manifest Kargo Prioritas</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kargo berstatus Dalam Pelayaran & Menunggu Muat.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('shipments')}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-amber-700 border border-slate-200 hover:border-amber-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              Semua Kargo ({shipments.length}) <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeShipments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Belum ada manifest muatan aktif.
              </div>
            ) : (
              activeShipments.slice(0, 4).map(shipment => (
                <div
                  key={shipment.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-amber-400/80 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-amber-700">{shipment.trackingNumber}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          shipment.status === 'Dalam Pelayaran' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {shipment.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{shipment.shipperName}</h4>
                      <p className="text-xs text-slate-500">Penerima: {shipment.consigneeName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900">{shipment.weightTons} Ton</span>
                      <p className="text-[11px] text-slate-500">{shipment.cargoType}</p>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                    <span>Kapal: <strong className="text-slate-900 font-bold">{shipment.vesselName}</strong></span>
                    <span className="font-extrabold text-emerald-700">{formatIdr(shipment.costTotalIdr)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
