import React from 'react';
import {
  GraduationCap,
  Database,
  FileText,
  BarChart3,
  Share2,
  Printer,
  Download,
  HelpCircle,
  Lock,
  Unlock,
  CloudCheck,
  CloudUpload,
  UserCheck,
  Users,
} from 'lucide-react';

interface HeaderProps {
  role: 'parent' | 'admin';
  activeTab: 'data' | 'slips' | 'analysis' | 'guide';
  setActiveTab: (tab: 'data' | 'slips' | 'analysis' | 'guide') => void;
  onOpenTeacherLogin: () => void;
  onTeacherLogout: () => void;
  onOpenShareModal: () => void;
  onPrint: () => void;
  onExportExcel: () => void;
  onSaveToServer?: () => void;
  isSavingToServer?: boolean;
  lastSavedTime?: string | null;
  studentCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  activeTab,
  setActiveTab,
  onOpenTeacherLogin,
  onTeacherLogout,
  onOpenShareModal,
  onPrint,
  onExportExcel,
  onSaveToServer,
  isSavingToServer,
  studentCount,
}) => {
  return (
    <header className="bg-indigo-700 text-white shadow-md no-print sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Notification / Role Ribbon */}
        <div className="py-1.5 border-b border-indigo-600/60 flex items-center justify-between text-xs text-indigo-100">
          <div className="flex items-center gap-2">
            {role === 'admin' ? (
              <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Mod Pentadbir Guru [Aktif]
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-indigo-800/80 text-indigo-200 border border-indigo-600 px-2.5 py-0.5 rounded-full font-medium">
                <Users className="w-3.5 h-3.5 text-indigo-300" />
                Mod Umum (Ibubapa &amp; Murid) — Paparan Slip Sahaja
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {role === 'admin' && onSaveToServer && (
              <button
                type="button"
                onClick={onSaveToServer}
                disabled={isSavingToServer}
                className="text-[11px] font-semibold text-indigo-100 hover:text-white flex items-center gap-1 transition disabled:opacity-50 cursor-pointer"
                title="Simpan semua data murid dan tetapan ke Cloud Firestore"
              >
                {isSavingToServer ? (
                  <>
                    <CloudUpload className="w-3.5 h-3.5 animate-bounce text-amber-300" />
                    <span>Menyimpan ke Cloud Firestore...</span>
                  </>
                ) : (
                  <>
                    <CloudCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Disegerak ke Cloud Firestore (Klik untuk Simpan)</span>
                  </>
                )}
              </button>
            )}

            {role === 'admin' ? (
              <button
                type="button"
                onClick={onTeacherLogout}
                className="text-[11px] font-bold text-rose-200 hover:text-white bg-rose-900/40 hover:bg-rose-900/60 px-2 py-0.5 rounded-md transition flex items-center gap-1"
                title="Kunci sesi guru dan kembali ke paparan umum ibubapa"
              >
                <Lock className="w-3 h-3" />
                <span>Kunci / Log Keluar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenTeacherLogin}
                className="text-[11px] font-bold text-amber-300 hover:text-white bg-indigo-800 hover:bg-indigo-600 px-2.5 py-0.5 rounded-md transition flex items-center gap-1 border border-indigo-500 shadow-2xs"
                title="Masukkan kata laluan untuk membuka mod guru"
              >
                <Lock className="w-3 h-3 text-amber-300" />
                <span>Log Masuk Guru (Admin)</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="h-16 flex items-center justify-between gap-2">
          {/* Branding */}
          <div
            className="flex items-center space-x-3 cursor-pointer shrink-0"
            onClick={() => setActiveTab('slips')}
          >
            <div className="p-2 bg-indigo-600 rounded-xl shadow-inner">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg leading-tight tracking-tight">
                Penjana Slip Keputusan
              </h1>
              <p className="text-xs text-indigo-200 hidden sm:block">
                Pentaksiran Sekolah Rendah (PBD / UASA)
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Filtered by Role) */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5 bg-indigo-800/60 p-1 rounded-xl">
            {/* Umum / Ibubapa only sees Paparan Slip */}
            {role === 'admin' ? (
              <>
                <button
                  onClick={() => setActiveTab('data')}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
                    activeTab === 'data'
                      ? 'bg-white text-indigo-900 shadow-sm font-semibold'
                      : 'text-indigo-100 hover:bg-indigo-600/70'
                  }`}
                  title="Tetapan sekolah dan jadual input markah"
                >
                  <Database className="w-4 h-4" />
                  <span className="hidden md:inline">Tetapan &amp; Data Murid</span>
                  <span className="md:hidden">Data</span>
                  {studentCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        activeTab === 'data' ? 'bg-indigo-100 text-indigo-800' : 'bg-indigo-900/60 text-white'
                      }`}
                    >
                      {studentCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('slips')}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
                    activeTab === 'slips'
                      ? 'bg-white text-indigo-900 shadow-sm font-semibold'
                      : 'text-indigo-100 hover:bg-indigo-600/70'
                  }`}
                  title="Paparan slip keputusan dan cetakan rasmi"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden md:inline">Paparan Slip</span>
                  <span className="md:hidden">Slip</span>
                </button>

                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
                    activeTab === 'analysis'
                      ? 'bg-white text-indigo-900 shadow-sm font-semibold'
                      : 'text-indigo-100 hover:bg-indigo-600/70'
                  }`}
                  title="Analisis keputusan mengikut kelas dan subjek"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden md:inline">Analisis Khas</span>
                  <span className="md:hidden">Analisis</span>
                </button>

                <button
                  onClick={() => setActiveTab('guide')}
                  className={`px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center space-x-1.5 ${
                    activeTab === 'guide'
                      ? 'bg-white text-indigo-900 shadow-sm font-semibold'
                      : 'text-indigo-100 hover:bg-indigo-600/70'
                  }`}
                  title="Panduan Format & Templat Excel"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="hidden lg:inline">Panduan</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-white bg-indigo-600/80 rounded-lg shadow-xs">
                <FileText className="w-4 h-4 text-emerald-300" />
                <span>Paparan Slip Murid (Akses Umum)</span>
              </div>
            )}
          </nav>

          {/* Action Shortcuts */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {role === 'admin' && studentCount > 0 && (
              <>
                <button
                  onClick={onPrint}
                  className="hidden sm:flex px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition shadow-sm items-center gap-1.5"
                  title="Cetak Slip ke PDF atau Pencetak"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Cetak PDF</span>
                </button>

                <button
                  onClick={onExportExcel}
                  className="hidden md:flex px-3 py-1.5 text-xs font-semibold bg-indigo-800/80 hover:bg-indigo-900 text-indigo-100 rounded-lg transition items-center gap-1.5 border border-indigo-600"
                  title="Eksport data keputusan ke fail Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Eksport Excel</span>
                </button>
              </>
            )}

            {/* Share Link Button */}
            <button
              onClick={onOpenShareModal}
              className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center space-x-1.5 shadow-sm cursor-pointer"
              title="Salin dan kongsi pautan ini dengan ibubapa atau rakan guru"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Kongsi Pautan</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
