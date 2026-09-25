import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { OnlineStatus } from '../types/shipping.ts';
import { 
  Ship, LogOut, History, RefreshCw, Anchor, Box, Calendar, 
  Users, Globe, Sparkles, Wifi, Shield
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'vessels' | 'shipments' | 'schedules' | 'crew';
  setActiveTab: (tab: 'dashboard' | 'vessels' | 'shipments' | 'schedules' | 'crew') => void;
  onOpenAuditLogs: () => void;
  onResetDb: () => void;
  onlineStatus: OnlineStatus | null;
  isSyncing: boolean;
  onManualSync: () => void;
  counts: {
    vessels: number;
    shipments: number;
    schedules: number;
    crew: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuditLogs,
  onResetDb,
  onlineStatus,
  isSyncing,
  onManualSync,
  counts
}) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const handleLogout = async () => {
    await logout();
    showToast('info', 'Sesi Berakhir', 'Anda telah keluar dari Portal Eksekutif JAVARA LINES.');
  };

  const navItems = [
    { id: 'dashboard', label: 'Ringkasan Eksekutif', icon: Ship, count: null },
    { id: 'vessels', label: 'Armada Kapal', icon: Anchor, count: counts.vessels },
    { id: 'shipments', label: 'Manifest & Muatan', icon: Box, count: counts.shipments },
    { id: 'schedules', label: 'Jadwal Pelayaran', icon: Calendar, count: counts.schedules },
    { id: 'crew', label: 'Awak & Perwira', icon: Users, count: counts.crew }
  ] as const;

  return (
    <header className="bg-slate-950 text-white border-b border-amber-500/20 sticky top-0 z-30 shadow-2xl backdrop-blur-md">
      
      {/* Top Luxury Gold Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-300 via-yellow-400 to-amber-600 shadow-sm shadow-amber-400/30" />

      {/* Main Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Executive Brand Crest */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            {/* Gold Insignia Box */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-300">
                <Ship className="w-6 h-6 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  JAVARA LINES
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-400/40">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-400" /> Royal Fleet ERP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                PT Javara Lines Tbk • Sistem Operasional Maritim Terkoneksi Real-Time
              </p>
            </div>
          </div>

          {/* Right Action Controls: Online Radar, Live Sync, User, Audit */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Online Live Multi-User Status Pill */}
            <div 
              title="Aplikasi ini aktif online dan terhubung langsung ke database cloud server. Setiap perubahan tersinkronisasi otomatis kepada seluruh pengguna."
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-inner"
            >
              <div className="relative flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute opacity-75" />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase tracking-wider text-emerald-400/80 font-bold leading-none">
                  ONLINE REAL-TIME
                </span>
                <span className="text-[11px] text-slate-200 font-mono mt-0.5 leading-none">
                  {onlineStatus?.activeUsersCount || 1} Pengguna Terkoneksi
                </span>
              </div>
            </div>

            {/* Manual Sync Button */}
            <button
              onClick={onManualSync}
              title="Sinkronkan data dengan server sekarang"
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-400/30 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
              <span className="hidden xl:inline">{isSyncing ? 'Sinkron...' : 'Live Sync'}</span>
            </button>

            {/* Audit Log Button */}
            <button
              onClick={onOpenAuditLogs}
              title="Lihat Log Audit Transaksi Database"
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-amber-400/30 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <History className="w-4 h-4 text-slate-400" />
              <span className="hidden lg:inline">Audit Log</span>
            </button>

            {/* User Executive Badge & Logout */}
            {user && (
              <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-800">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-white tracking-wide leading-tight">
                    {user.fullName}
                  </div>
                  <div className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">
                    {user.role}
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-md shadow-amber-500/20">
                  <div className="w-full h-full bg-slate-900 rounded-[10px] text-amber-300 font-black text-xs flex items-center justify-center">
                    {user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Keluar dari Akun"
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-colors cursor-pointer"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Luxury Navigation Menu Tabs */}
      <div className="bg-slate-900/90 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2.5 scrollbar-none">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.02]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400/80'}`} />
                  <span>{item.label}</span>
                  {item.count !== null && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

    </header>
  );
};
