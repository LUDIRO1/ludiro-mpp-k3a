import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider, useToast } from './context/ToastContext.tsx';
import { LoginForm } from './components/LoginForm.tsx';
import { Navbar } from './components/Navbar.tsx';
import { DashboardStats } from './components/DashboardStats.tsx';
import { VesselsManager } from './components/VesselsManager.tsx';
import { ShipmentsManager } from './components/ShipmentsManager.tsx';
import { SchedulesManager } from './components/SchedulesManager.tsx';
import { CrewManager } from './components/CrewManager.tsx';
import { ActivityLogsModal } from './components/ActivityLogsModal.tsx';
import { ResetDbModal } from './components/ResetDbModal.tsx';
import { api } from './services/api.ts';
import { Vessel, Shipment, VoyageSchedule, CrewMember, DashboardStats as IDashboardStats, ActivityLog, OnlineStatus } from './types/shipping.ts';
import { Ship, Crown, Sparkles } from 'lucide-react';

function MainPortal() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'vessels' | 'shipments' | 'schedules' | 'crew'>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus | null>(null);

  // Core Database Collections
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [schedules, setSchedules] = useState<VoyageSchedule[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Modal open triggers
  const [isVesselCreateOpen, setIsVesselCreateOpen] = useState(false);
  const [isShipmentCreateOpen, setIsShipmentCreateOpen] = useState(false);
  const [isScheduleCreateOpen, setIsScheduleCreateOpen] = useState(false);
  const [isCrewCreateOpen, setIsCrewCreateOpen] = useState(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [isResetDbOpen, setIsResetDbOpen] = useState(false);

  // Fetch all persistent data from the backend database
  const refreshAllData = useCallback(async (showNotification = false) => {
    try {
      const [vesselsData, shipmentsData, schedulesData, crewData, statsData, logsData, statusData] = await Promise.all([
        api.getVessels(),
        api.getShipments(),
        api.getSchedules(),
        api.getCrew(),
        api.getDashboardStats(),
        api.getActivityLogs(),
        api.getOnlineStatus()
      ]);

      setVessels(vesselsData);
      setShipments(shipmentsData);
      setSchedules(schedulesData);
      setCrew(crewData);
      setStats(statsData);
      setActivityLogs(logsData);
      setOnlineStatus(statusData);

      if (showNotification) {
        showToast('success', 'Sinkronisasi Berhasil', 'Data terhubung online ke server Cloud Run.');
      }
    } catch (err: any) {
      console.error('Failed to fetch persistent data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Real-time auto-polling loop: keeps all online connected users in sync every 4 seconds!
  useEffect(() => {
    if (!user) return;

    // Initial fetch
    refreshAllData();

    // Auto-polling interval
    const interval = setInterval(() => {
      refreshAllData(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [user, refreshAllData]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await refreshAllData(true);
    setIsSyncing(false);
  };

  // If user is not authenticated, show royal executive login screen as default view
  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col">
      {/* Top Luxury Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
        onResetDb={() => setIsResetDbOpen(true)}
        onlineStatus={onlineStatus}
        isSyncing={isSyncing}
        onManualSync={handleManualSync}
        counts={{
          vessels: vessels.length,
          shipments: shipments.length,
          schedules: schedules.length,
          crew: crew.length
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 p-0.5 shadow-xl shadow-amber-500/20 animate-bounce">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-300">
                <Ship className="w-7 h-7" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-base font-extrabold text-slate-900">Menghubungkan ke Server JAVARA LINES Online...</p>
              <p className="text-xs text-slate-500 mt-0.5">Memuat sinkronisasi database persisten waktu nyata</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardStats
                stats={stats}
                vessels={vessels}
                shipments={shipments}
                onNavigateTab={setActiveTab}
                onOpenCreateVessel={() => {
                  setActiveTab('vessels');
                  setIsVesselCreateOpen(true);
                }}
                onOpenCreateShipment={() => {
                  setActiveTab('shipments');
                  setIsShipmentCreateOpen(true);
                }}
                onOpenCreateSchedule={() => {
                  setActiveTab('schedules');
                  setIsScheduleCreateOpen(true);
                }}
                onOpenCreateCrew={() => {
                  setActiveTab('crew');
                  setIsCrewCreateOpen(true);
                }}
                onManualSync={handleManualSync}
                isSyncing={isSyncing}
              />
            )}

            {activeTab === 'vessels' && (
              <VesselsManager
                vessels={vessels}
                onRefresh={refreshAllData}
                isCreateOpen={isVesselCreateOpen}
                setIsCreateOpen={setIsVesselCreateOpen}
              />
            )}

            {activeTab === 'shipments' && (
              <ShipmentsManager
                shipments={shipments}
                vessels={vessels}
                onRefresh={refreshAllData}
                isCreateOpen={isShipmentCreateOpen}
                setIsCreateOpen={setIsShipmentCreateOpen}
              />
            )}

            {activeTab === 'schedules' && (
              <SchedulesManager
                schedules={schedules}
                vessels={vessels}
                onRefresh={refreshAllData}
                isCreateOpen={isScheduleCreateOpen}
                setIsCreateOpen={setIsScheduleCreateOpen}
              />
            )}

            {activeTab === 'crew' && (
              <CrewManager
                crew={crew}
                vessels={vessels}
                onRefresh={refreshAllData}
                isCreateOpen={isCrewCreateOpen}
                setIsCreateOpen={setIsCrewCreateOpen}
              />
            )}
          </>
        )}
      </main>

      {/* Audit Logs Modal */}
      <ActivityLogsModal
        isOpen={isAuditLogsOpen}
        onClose={() => setIsAuditLogsOpen(false)}
        logs={activityLogs}
      />

      {/* Reset Database Modal */}
      <ResetDbModal
        isOpen={isResetDbOpen}
        onClose={() => setIsResetDbOpen(false)}
        onSuccess={refreshAllData}
      />

      {/* Luxury Royal Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-amber-500/20 py-7 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-amber-300 tracking-wider">JAVARA LINES</span>
            <span className="text-slate-600">|</span>
            <span>© 2026 PT JAVARA LINES TBK. Seluruh hak cipta dilindungi undang-undang pelayaran.</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Online Real-Time Synchronized
            </span>
            <span>•</span>
            <span>Standar IMO & ISM Code</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainPortal />
      </AuthProvider>
    </ToastProvider>
  );
}
