import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { 
  Ship, Anchor, ShieldCheck, Lock, User as UserIcon, ArrowRight, 
  Compass, Sparkles, Zap, Globe, CheckCircle2, Crown, Waves
} from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { login, demoLogin, isLoading } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalUsername = username.trim() || 'Admin Javara';
    const finalPassword = password || '123';

    try {
      await login(finalUsername, finalPassword);
      showToast('success', 'Selamat Datang di JAVARA LINES!', `Berhasil masuk sebagai ${finalUsername}. Sistem terhubung online.`);
    } catch {
      showToast('info', 'Masuk ke Sistem', 'Selamat datang di JAVARA LINES!');
    }
  };

  const handleQuickDemo = async (role: 'admin' | 'armada' | 'logistik') => {
    try {
      await demoLogin(role);
      const roleName = {
        admin: 'Super Admin (Direktur Operasi)',
        armada: 'Fleet Manager (Manajer Armada)',
        logistik: 'Logistics Officer (Divisi Kargo)'
      }[role];
      showToast('success', 'Akses VIP Diberikan', `Masuk sebagai ${roleName} - JAVARA LINES`);
    } catch {
      showToast('info', 'Masuk ke Sistem', 'Selamat datang di JAVARA LINES!');
    }
  };

  return (
    <div className="min-h-screen bg-[#06101E] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans relative overflow-hidden selection:bg-amber-400 selection:text-slate-950">
      
      {/* Background Luxury Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-20 pointer-events-none" />

      {/* Main Luxury Container Card */}
      <div className="w-full max-w-5xl bg-slate-900/90 rounded-[2.5rem] shadow-2xl shadow-black/80 border border-amber-500/30 overflow-hidden grid grid-cols-1 lg:grid-cols-12 backdrop-blur-xl relative z-10">
        
        {/* Left Executive Brand Showcase */}
        <div className="lg:col-span-6 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8 sm:p-12 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-amber-500/20">
          
          <Compass className="absolute -right-10 -bottom-10 w-64 h-64 text-white/[0.03] pointer-events-none rotate-12" />

          <div>
            {/* Top Brand Insignia */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-0.5 shadow-xl shadow-amber-500/25">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-300">
                  <Ship className="w-8 h-8 drop-shadow-[0_2px_10px_rgba(245,158,11,0.6)]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    JAVARA LINES
                  </span>
                  <Crown className="w-5 h-5 text-amber-400 shrink-0" />
                </div>
                <span className="text-[11px] font-bold tracking-widest uppercase text-amber-300/90 block">
                  Royal Maritime Shipping & Logistics ERP
                </span>
              </div>
            </div>

            <p className="mt-5 text-slate-300 text-sm leading-relaxed">
              Sistem manajemen pelayaran eksekutif kelas utama. Mengelola pergerakan armada kapal komersial, manifest kargo, dan perwira kapal secara <strong>online tersinkronisasi real-time</strong>.
            </p>

            {/* Online Connected Banner */}
            <div className="mt-5 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 shadow-inner">
              <div className="relative shrink-0 flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute opacity-80" />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="leading-snug">
                <strong className="text-white block font-bold">Terhubung Online Real-Time</strong>
                <span className="text-emerald-300/80">Semua orang yang mengakses aplikasi ini berbagi data terpusat secara langsung.</span>
              </div>
            </div>

            {/* 1-Click VIP Demo Accounts */}
            <div className="mt-8">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Pilih Profil Akses Cepat (1-Klik Masuk Langsung):</span>
              </div>

              <div className="space-y-3">
                {/* VIP Demo 1: Super Admin */}
                <div 
                  onClick={() => handleQuickDemo('admin')}
                  className="group p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-amber-500/25 hover:border-amber-400/60 cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:shadow-amber-500/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shrink-0">
                      <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-amber-300 text-xs">
                        HW
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                          Capt. Hendra Wicaksono
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
                          Super Admin
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Direktur Operasi Maritim JAVARA LINES</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="shrink-0 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-extrabold shadow-md group-hover:brightness-110 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Masuk <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* VIP Demo 2: Fleet Manager */}
                <div 
                  onClick={() => handleQuickDemo('armada')}
                  className="group p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-blue-400/60 cursor-pointer transition-all duration-200 hover:scale-[1.01] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 p-0.5 shrink-0">
                      <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-cyan-300 text-xs">
                        DS
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          Ir. Dewi Sartika, M.T
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/20 text-cyan-300 font-bold border border-blue-400/30">
                          Fleet Manager
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Manajer Armada & Teknis Kapal</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="shrink-0 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-950 text-xs font-extrabold shadow-md group-hover:brightness-110 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Masuk <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* VIP Demo 3: Logistics Officer */}
                <div 
                  onClick={() => handleQuickDemo('logistik')}
                  className="group p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-emerald-400/60 cursor-pointer transition-all duration-200 hover:scale-[1.01] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shrink-0">
                      <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-emerald-300 text-xs">
                        RR
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                          Rizky Ramadhan, S.Log
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                          Logistics Officer
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">Petugas Kargo & Bill of Lading</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="shrink-0 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 text-xs font-extrabold shadow-md group-hover:brightness-110 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Masuk <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Sertifikasi ISM Code IMO</span>
            </span>
            <span>PT JAVARA LINES TBK</span>
          </div>

        </div>

        {/* Right Form: Effortless & Easy Free Login */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-white text-slate-900">
          <div className="max-w-md w-full mx-auto">
            
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300/50 text-xs font-bold mb-3">
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span>Akses Masuk Bebas & Fleksibel</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Portal JAVARA LINES
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
                Anda <strong>bebas memasukkan nama pengguna dan kata sandi apa saja</strong>, atau langsung klik tombol masuk untuk mengakses seluruh fitur manajemen.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Nama Pengguna / Username (Bebas)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ketik nama Anda (contoh: Yoga, Admin, Nakhoda...)"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Kata Sandi (Bebas)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-amber-600 hover:text-amber-800 font-semibold cursor-pointer"
                  >
                    {showPassword ? 'Sembunyikan' : 'Perlihatkan'}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5 text-amber-600" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ketik sandi apa saja"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-sm placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-xs font-mono"
                  />
                </div>
              </div>

              {/* Freedom Guarantee Box */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50/50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Akses Langsung:</strong> Tekan tombol emas di bawah untuk masuk ke dashboard tanpa batasan kredensial.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-4 px-5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-slate-950 font-black rounded-2xl text-sm sm:text-base shadow-xl shadow-amber-500/30 hover:shadow-amber-500/40 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    <span>Mempersiapkan Akses Eksekutif...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke JAVARA LINES</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500 font-medium">
                PT JAVARA LINES TBK • Sistem Operasional Maritim Terhubung Online
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
