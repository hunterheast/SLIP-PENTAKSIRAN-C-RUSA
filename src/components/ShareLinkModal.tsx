import React, { useState } from 'react';
import { Share2, Copy, Check, Users, ShieldCheck, Globe, Link as LinkIcon, X } from 'lucide-react';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentCount: number;
  schoolName: string;
}

export const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  onClose,
  studentCount,
  schoolName,
}) => {
  const [copiedGeneral, setCopiedGeneral] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedGeneral(true);
    setTimeout(() => setCopiedGeneral(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/80 rounded-xl">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Kongsi Pautan Sistem</h3>
              <p className="text-xs text-emerald-100">Pautan aktif &amp; disegerak ke pelayan</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-emerald-100 hover:text-white rounded-lg p-1 hover:bg-emerald-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
            <Globe className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 space-y-1">
              <p className="font-bold">Pangkalan Data Google Cloud Firestore Aktif</p>
              <p className="text-emerald-800 leading-relaxed">
                Segala maklumat sekolah dan {studentCount} rekod murid kini disimpan secara langsung dalam <b>Google Cloud Firestore</b>. Sebarang kemas kini yang dibuat oleh guru akan disegerak secara masa nyata (real-time) dan dapat dilihat serta-merta oleh sesiapa sahaja yang membuka pautan ini dari mana-mana peranti!
              </p>
            </div>
          </div>

          {/* Section: Ibubapa View */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">
                  Pautan Awam (Ibubapa &amp; Murid)
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Paparan Slip Sahaja
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Ibubapa hanya boleh mencari nama anak dan melihat / memuat turun slip keputusan tanpa kebenaran menyunting markah.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 truncate">
                {currentUrl}
              </div>
              <button
                type="button"
                onClick={() => handleCopy(currentUrl)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
              >
                {copiedGeneral ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedGeneral ? 'Disalin!' : 'Salin Pautan'}</span>
              </button>
            </div>
          </div>

          {/* Section: Guru Access Notice */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-800">
                Akses Rakan Guru &amp; Pentadbir
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Jika anda berkongsi pautan dengan guru lain, mereka boleh menekan butang <b>"Log Masuk Guru"</b> di bahagian atas dan memasukkan kata laluan guru untuk bersama-sama menyunting data.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
