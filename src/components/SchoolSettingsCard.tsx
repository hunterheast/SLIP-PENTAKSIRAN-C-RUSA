import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  BookOpen,
  Sliders,
  CheckCircle2,
  Upload,
  Trash2,
  Plus,
  X,
  Lock,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  Eye,
  Settings,
} from 'lucide-react';
import { GradeScale, SchoolSettings, SubjectInfo } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { compressImage } from '../utils/imageCompressor';

interface SchoolSettingsCardProps {
  settings: SchoolSettings;
  setSettings: React.Dispatch<React.SetStateAction<SchoolSettings>>;
  gradeScale: GradeScale;
  setGradeScale: React.Dispatch<React.SetStateAction<GradeScale>>;
  subjects: SubjectInfo[];
  setSubjects: React.Dispatch<React.SetStateAction<SubjectInfo[]>>;
  onOpenManageSubjects: () => void;
  onSaveNotice?: (updatedSettings?: SchoolSettings) => void;
}

export const SchoolSettingsCard: React.FC<SchoolSettingsCardProps> = ({
  settings,
  setSettings,
  gradeScale,
  setGradeScale,
  subjects,
  setSubjects,
  onOpenManageSubjects,
  onSaveNotice,
}) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'subjects' | 'grades' | 'security'>('general');
  const [subjectToDelete, setSubjectToDelete] = useState<SubjectInfo | null>(null);
  const [logoNotice, setLogoNotice] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMessage, setPassMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setLogoError('Sila pilih fail imej yang berukuran kurang daripada 5MB.');
      setTimeout(() => setLogoError(null), 4000);
      return;
    }
    setLogoError(null);

    try {
      const compressed = await compressImage(file, 280, 0.85);
      const updated = { ...settings, schoolLogo: compressed };
      setSettings(updated);
      setLogoNotice('Logo sekolah berjaya dimuat naik!');
      setTimeout(() => setLogoNotice(null), 3000);
      if (onSaveNotice) onSaveNotice(updated);
    } catch (e) {
      console.warn('Failed to compress logo, reading as data URL:', e);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        const updated = { ...settings, schoolLogo: result };
        setSettings(updated);
        setLogoNotice('Logo sekolah berjaya dimuat naik!');
        setTimeout(() => setLogoNotice(null), 3000);
        if (onSaveNotice) onSaveNotice(updated);
      };
      reader.readAsDataURL(file);
    } finally {
      event.target.value = '';
    }
  };

  const removeLogo = () => {
    const updated = { ...settings, schoolLogo: '' };
    setSettings(updated);
    setLogoNotice('Logo sekolah berjaya dipadam.');
    setTimeout(() => setLogoNotice(null), 3000);
    if (onSaveNotice) onSaveNotice(updated);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || newPass.trim().length < 4) {
      setPassMessage({ text: 'Kata laluan baharu mestilah sekurang-kurangnya 4 aksara.', type: 'error' });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMessage({ text: 'Kata laluan baharu dan pengesahan tidak sepadan.', type: 'error' });
      return;
    }

    setIsChangingPass(true);
    setPassMessage(null);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPassMessage({ text: 'Kata laluan guru berjaya ditukar!', type: 'success' });
        setCurrentPass('');
        setNewPass('');
        setConfirmPass('');
      } else {
        setPassMessage({ text: data.error || 'Gagal menukar kata laluan. Semak kata laluan semasa.', type: 'error' });
      }
    } catch {
      setPassMessage({ text: 'Ralat sambungan pelayan.', type: 'error' });
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Top Main Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
              Tetapan Maklumat Sekolah &amp; Peperiksaan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Urus identiti sekolah, mata pelajaran, skala gred, dan kawalan paparan slip rasmi.
            </p>
          </div>
        </div>

        {/* Structured Sub-Navigation Tabs */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl self-start md:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveSettingsTab('general')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSettingsTab === 'general'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Profil &amp; Ujian</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSettingsTab('subjects')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSettingsTab === 'subjects'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Mata Pelajaran ({subjects.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSettingsTab('grades')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSettingsTab === 'grades'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Skala Gred (A-F)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSettingsTab('security')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSettingsTab === 'security'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Paparan &amp; Kata Laluan</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PROFIL SEKOLAH & PEPERIKSAAN */}
      {activeSettingsTab === 'general' && (
        <div className="p-5 sm:p-6 space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {/* School Logo Box */}
            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-2xl bg-slate-50/70 transition">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Lambang / Logo Sekolah
              </span>
              <div className="w-24 h-24 mb-3 flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden p-2">
                {settings.schoolLogo ? (
                  <img
                    src={settings.schoolLogo}
                    alt="Logo Sekolah"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-2">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Tiada Logo</span>
                    <span className="text-[9px] text-slate-400">Guna Lambang Lalai</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-center">
                <label className="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer transition flex items-center gap-1.5 shadow-2xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{settings.schoolLogo ? 'Tukar Logo' : 'Muat Naik Logo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
                {Boolean(settings.schoolLogo) && (
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="px-2.5 py-1.5 text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="Padam logo sekolah dan buang daripada slip keputusan"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Padam Logo</span>
                  </button>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-2 text-center font-medium">
                PNG telus / JPG (Kekal tanpa background hitam)
              </span>
              {logoNotice && (
                <p className="text-[11px] text-emerald-700 font-bold mt-1 text-center bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {logoNotice}
                </p>
              )}
              {logoError && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1 text-center">{logoError}</p>
              )}
            </div>

            {/* School Info & Exam Inputs */}
            <div className="md:col-span-3 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Nama &amp; Alamat Sekolah
                </label>
                <textarea
                  rows={2}
                  value={settings.schoolName}
                  onChange={(e) => setSettings((prev) => ({ ...prev, schoolName: e.target.value }))}
                  placeholder="SEKOLAH KEBANGSAAN SI-RUSA&#10;PERSIARAN PAHLAWAN, 71050 PORT DICKSON, NEGERI SEMBILAN"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-800"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  *Boleh tekan Enter untuk memisahkan nama sekolah dan alamat pada baris baharu di atas slip cetakan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Tajuk Ujian / Pentaksiran
                  </label>
                  <input
                    type="text"
                    value={settings.examTitle}
                    onChange={(e) => setSettings((prev) => ({ ...prev, examTitle: e.target.value }))}
                    placeholder="SLIP KEPUTUSAN PENTAKSIRAN TAHUN 3"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Sesi Persekolahan / Tahun
                  </label>
                  <input
                    type="text"
                    value={settings.sessionYear}
                    onChange={(e) => setSettings((prev) => ({ ...prev, sessionYear: e.target.value }))}
                    placeholder="SESI 2026/2027"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MATA PELAJARAN */}
      {activeSettingsTab === 'subjects' && (
        <div className="p-5 sm:p-6 space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Senarai Mata Pelajaran Peperiksaan</h3>
              <p className="text-xs text-slate-500">
                Setiap subjek ini dipaparkan sebagai lajur markah dan dicetak pada slip keputusan murid.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenManageSubjects}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah / Susun Subjek</span>
            </button>
          </div>

          {/* Subject Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjects.map((sub, idx) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-xl transition shadow-2xs group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-800 block truncate">
                      {sub.name}
                    </span>
                    <span className="font-mono font-bold text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                      {sub.code}
                    </span>
                  </div>
                </div>

                {subjects.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSubjectToDelete(sub)}
                    className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                    title={`Buang subjek ${sub.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SKALA GRED */}
      {activeSettingsTab === 'grades' && (
        <div className="p-5 sm:p-6 space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tetapan Skala Gred Boleh Disunting</h3>
              <p className="text-xs text-slate-500">
                Masukkan markah minima (Minimum Score) bagi setiap gred. Julat markah dikira secara automatik.
              </p>
            </div>
            <span className="text-[11px] text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg font-bold border border-indigo-100 self-start sm:self-auto">
              Skala Piawai Sekolah Rendah Malaysia
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Gred A */}
            <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 text-center shadow-xs">
              <span className="font-bold text-emerald-800 text-sm block mb-1">Gred A</span>
              <span className="text-[10px] font-semibold text-emerald-600 block mb-2">Cemerlang</span>
              <div className="flex items-center justify-center gap-1 text-xs">
                <span className="text-slate-600 font-semibold">Min:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeScale.aMin}
                  onChange={(e) =>
                    setGradeScale((prev) => ({ ...prev, aMin: Number(e.target.value) }))
                  }
                  className="w-14 text-center border border-emerald-300 rounded-lg py-1 font-bold text-emerald-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <span className="text-[10px] text-emerald-700 block mt-2 font-mono font-bold bg-white/70 py-0.5 rounded">
                {gradeScale.aMin} - 100
              </span>
            </div>

            {/* Gred B */}
            <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200 text-center shadow-xs">
              <span className="font-bold text-blue-800 text-sm block mb-1">Gred B</span>
              <span className="text-[10px] font-semibold text-blue-600 block mb-2">Kepujian</span>
              <div className="flex items-center justify-center gap-1 text-xs">
                <span className="text-slate-600 font-semibold">Min:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeScale.bMin}
                  onChange={(e) =>
                    setGradeScale((prev) => ({ ...prev, bMin: Number(e.target.value) }))
                  }
                  className="w-14 text-center border border-blue-300 rounded-lg py-1 font-bold text-blue-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <span className="text-[10px] text-blue-700 block mt-2 font-mono font-bold bg-white/70 py-0.5 rounded">
                {gradeScale.bMin} - {gradeScale.aMin - 1}
              </span>
            </div>

            {/* Gred C */}
            <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 text-center shadow-xs">
              <span className="font-bold text-amber-800 text-sm block mb-1">Gred C</span>
              <span className="text-[10px] font-semibold text-amber-600 block mb-2">Baik</span>
              <div className="flex items-center justify-center gap-1 text-xs">
                <span className="text-slate-600 font-semibold">Min:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeScale.cMin}
                  onChange={(e) =>
                    setGradeScale((prev) => ({ ...prev, cMin: Number(e.target.value) }))
                  }
                  className="w-14 text-center border border-amber-300 rounded-lg py-1 font-bold text-amber-900 bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <span className="text-[10px] text-amber-700 block mt-2 font-mono font-bold bg-white/70 py-0.5 rounded">
                {gradeScale.cMin} - {gradeScale.bMin - 1}
              </span>
            </div>

            {/* Gred D */}
            <div className="bg-orange-50/80 p-3.5 rounded-xl border border-orange-200 text-center shadow-xs">
              <span className="font-bold text-orange-800 text-sm block mb-1">Gred D</span>
              <span className="text-[10px] font-semibold text-orange-600 block mb-2">Memuaskan</span>
              <div className="flex items-center justify-center gap-1 text-xs">
                <span className="text-slate-600 font-semibold">Min:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeScale.dMin}
                  onChange={(e) =>
                    setGradeScale((prev) => ({ ...prev, dMin: Number(e.target.value) }))
                  }
                  className="w-14 text-center border border-orange-300 rounded-lg py-1 font-bold text-orange-900 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <span className="text-[10px] text-orange-700 block mt-2 font-mono font-bold bg-white/70 py-0.5 rounded">
                {gradeScale.dMin} - {gradeScale.cMin - 1}
              </span>
            </div>

            {/* Gred E */}
            <div className="bg-rose-50/80 p-3.5 rounded-xl border border-rose-200 text-center shadow-xs">
              <span className="font-bold text-rose-800 text-sm block mb-1">Gred E</span>
              <span className="text-[10px] font-semibold text-rose-600 block mb-2">Mencapai Minima</span>
              <div className="flex items-center justify-center gap-1 text-xs">
                <span className="text-slate-600 font-semibold">Min:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeScale.eMin}
                  onChange={(e) =>
                    setGradeScale((prev) => ({ ...prev, eMin: Number(e.target.value) }))
                  }
                  className="w-14 text-center border border-rose-300 rounded-lg py-1 font-bold text-rose-900 bg-white focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
              <span className="text-[10px] text-rose-700 block mt-2 font-mono font-bold bg-white/70 py-0.5 rounded">
                {gradeScale.eMin} - {gradeScale.dMin - 1}
              </span>
            </div>

            {/* Gred F */}
            <div className="bg-purple-50/80 p-3.5 rounded-xl border border-purple-200 text-center shadow-xs">
              <span className="font-bold text-purple-900 text-sm block mb-1">Gred F</span>
              <span className="text-[10px] font-semibold text-purple-600 block mb-2">Belum Menguasai</span>
              <div className="flex items-center justify-center gap-1 text-xs">
                <span className="text-slate-600 font-semibold">Min:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeScale.fMin ?? 0}
                  onChange={(e) =>
                    setGradeScale((prev) => ({ ...prev, fMin: Number(e.target.value) }))
                  }
                  className="w-14 text-center border border-purple-300 rounded-lg py-1 font-bold text-purple-900 bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <span className="text-[10px] text-purple-700 block mt-2 font-mono font-bold bg-white/70 py-0.5 rounded">
                {gradeScale.fMin ?? 0} - {(gradeScale.eMin || 20) - 1}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PAPARAN & KESELAMATAN GURU */}
      {activeSettingsTab === 'security' && (
        <div className="p-5 sm:p-6 space-y-6 animate-in fade-in duration-150">
          {/* Section: Display Toggles */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Pilihan Kolum &amp; Paparan Pada Slip</h3>
            <p className="text-xs text-slate-500 mb-3">
              Tandakan maklumat yang anda ingin sertakan di bahagian analisis prestasi murid dalam slip.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 transition">
                <input
                  type="checkbox"
                  checked={settings.showClassRank}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, showClassRank: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Kedudukan Dalam Kelas</span>
                  <span className="text-[10px] text-slate-500">Contoh: No. 1 daripada 30</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 transition">
                <input
                  type="checkbox"
                  checked={settings.showOverallRank}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, showOverallRank: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Kedudukan Keseluruhan</span>
                  <span className="text-[10px] text-slate-500">Kedudukan merentas semua kelas</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-300 transition">
                <input
                  type="checkbox"
                  checked={settings.showGPC}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, showGPC: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Gred Purata (GPC)</span>
                  <span className="text-[10px] text-slate-500">Purata nilai gred murid (1.0 - 5.0)</span>
                </div>
              </label>
            </div>
          </div>

          {/* Section: Teacher Passcode Management */}
          <div className="pt-5 border-t border-slate-100">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-1">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Tukar Kata Laluan Guru (Admin Passcode)</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Kata laluan ini melindungi akses pentadbir daripada diakses oleh ibubapa atau pihak umum.
              </p>

              <form onSubmit={handleChangePassword} className="space-y-3.5 bg-slate-50/80 p-4 border border-slate-200 rounded-2xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Laluan Semasa</label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    placeholder="Masukkan kata laluan sekarang (cth: guru123)"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Laluan Baharu</label>
                    <input
                      type="password"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Minima 4 aksara"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sahkan Kata Laluan</label>
                    <input
                      type="password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Ulang kata laluan baharu"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                    />
                  </div>
                </div>

                {passMessage && (
                  <div
                    className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                      passMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {passMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{passMessage.text}</span>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isChangingPass}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isChangingPass ? 'Menyimpan...' : 'Kemaskini Kata Laluan'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Subject Deletion */}
      {subjectToDelete && (
        <ConfirmModal
          isOpen={!!subjectToDelete}
          title="Buang Mata Pelajaran"
          message={`Adakah anda pasti ingin membuang subjek "${subjectToDelete.name} (${subjectToDelete.code})"? Kolum markah ini akan dikeluarkan daripada jadual dan slip.`}
          confirmText="Ya, Buang Subjek"
          confirmVariant="danger"
          onConfirm={() => {
            setSubjects((prev) => prev.filter((s) => s.id !== subjectToDelete.id));
            setSubjectToDelete(null);
          }}
          onCancel={() => setSubjectToDelete(null)}
        />
      )}
    </div>
  );
};
