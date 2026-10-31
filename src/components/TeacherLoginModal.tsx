import React, { useState } from 'react';
import { Lock, Eye, EyeOff, KeyRound, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface TeacherLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const TeacherLoginModal: React.FC<TeacherLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Sila masukkan kata laluan guru.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('guru_auth_token', data.token || 'logged_in');
        onLoginSuccess();
        onClose();
        setPassword('');
      } else {
        setError(data.error || 'Kata laluan tidak tepat. Sila cuba lagi.');
      }
    } catch {
      // Offline fallback: check default password
      if (password.trim() === 'guru123') {
        sessionStorage.setItem('guru_auth_token', 'logged_in_offline');
        onLoginSuccess();
        onClose();
        setPassword('');
      } else {
        setError('Kata laluan salah. (Kata laluan lalai: guru123)');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-indigo-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600/80 rounded-xl">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Akses Pentadbir Guru</h3>
              <p className="text-xs text-indigo-200">Log masuk untuk mengurus markah &amp; tetapan</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-indigo-200 hover:text-white rounded-lg p-1 hover:bg-indigo-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 space-y-1">
              <p className="font-semibold">Kawasan Khas Guru &amp; Pentadbir</p>
              <p className="text-indigo-700">
                Bahagian ini dikhaskan untuk guru menyunting markah, mengubah subjek, dan mengemaskini tetapan sekolah.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Kata Laluan Guru (Admin Passcode)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Masukkan kata laluan guru..."
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <span>*Kata laluan lalai sistem:</span>
              <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold">guru123</code>
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Mengesahkan...' : 'Log Masuk Sebagai Guru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
