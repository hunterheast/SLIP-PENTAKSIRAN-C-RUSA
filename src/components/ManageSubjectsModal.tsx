import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, X, AlertTriangle, Check, Sparkles } from 'lucide-react';
import { SubjectInfo, MALAYSIAN_SUBJECT_PRESETS } from '../types';

interface ManageSubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: SubjectInfo[];
  setSubjects: React.Dispatch<React.SetStateAction<SubjectInfo[]>>;
  onSubjectsUpdated?: (message: string) => void;
}

export const ManageSubjectsModal: React.FC<ManageSubjectsModalProps> = ({
  isOpen,
  onClose,
  subjects,
  setSubjects,
  onSubjectsUpdated,
}) => {
  const [customName, setCustomName] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [deletingSubject, setDeletingSubject] = useState<SubjectInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddPreset = (preset: { id: string; name: string; code: string }) => {
    setErrorMessage(null);
    // Check if code or name already exists
    const exists = subjects.some(
      (s) => s.code.toUpperCase() === preset.code.toUpperCase() || s.name.toLowerCase() === preset.name.toLowerCase()
    );
    if (exists) {
      setErrorMessage(`Mata pelajaran ${preset.name} (${preset.code}) sudah wujud dalam senarai.`);
      return;
    }

    const newSub: SubjectInfo = {
      id: preset.id || `sub_${Date.now()}`,
      name: preset.name,
      code: preset.code.toUpperCase(),
    };

    setSubjects((prev) => [...prev, newSub]);
    if (onSubjectsUpdated) {
      onSubjectsUpdated(`Mata pelajaran ${preset.name} (${preset.code}) berjaya ditambah!`);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const trimmedName = customName.trim();
    const trimmedCode = customCode.trim().toUpperCase() || trimmedName.slice(0, 3).toUpperCase();

    if (!trimmedName) {
      setErrorMessage('Sila masukkan nama mata pelajaran.');
      return;
    }

    const exists = subjects.some(
      (s) => s.code.toUpperCase() === trimmedCode || s.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
      setErrorMessage(`Mata pelajaran dengan nama atau kod '${trimmedCode}' sudah wujud.`);
      return;
    }

    const newId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newSub: SubjectInfo = {
      id: newId,
      name: trimmedName,
      code: trimmedCode,
    };

    setSubjects((prev) => [...prev, newSub]);
    setCustomName('');
    setCustomCode('');
    if (onSubjectsUpdated) {
      onSubjectsUpdated(`Mata pelajaran '${trimmedName}' (${trimmedCode}) berjaya ditambah!`);
    }
  };

  const confirmDeleteSubject = (sub: SubjectInfo) => {
    setErrorMessage(null);
    if (subjects.length <= 1) {
      setErrorMessage('Sistem memerlukan sekurang-kurangnya 1 mata pelajaran.');
      return;
    }
    setDeletingSubject(sub);
  };

  const executeDeleteSubject = () => {
    if (!deletingSubject) return;
    setSubjects((prev) => prev.filter((s) => s.id !== deletingSubject.id));
    const deletedName = deletingSubject.name;
    setDeletingSubject(null);
    if (onSubjectsUpdated) {
      onSubjectsUpdated(`Mata pelajaran '${deletedName}' telah dibuang.`);
    }
  };

  // Available presets that aren't added yet
  const availablePresets = MALAYSIAN_SUBJECT_PRESETS.filter(
    (preset) => !subjects.some((s) => s.code.toUpperCase() === preset.code.toUpperCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Pengurusan Mata Pelajaran (Subjek)</h3>
              <p className="text-xs text-slate-500">
                Tambah atau buang subjek peperiksaan mengikut keperluan sekolah anda.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Active Subjects List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Subjek Aktif ({subjects.length})</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Akan dipaparkan pada jadual, analisis &amp; slip keputusan
              </span>
            </div>

            <div className="space-y-2">
              {subjects.map((sub, index) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs font-bold text-slate-400">{index + 1}</span>
                    <span className="w-12 text-center font-black text-xs px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 tracking-wider">
                      {sub.code}
                    </span>
                    <span className="font-semibold text-xs sm:text-sm text-slate-800">{sub.name}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => confirmDeleteSubject(sub)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title={`Buang subjek ${sub.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Add Malaysian School Presets */}
          {availablePresets.length > 0 && (
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2.5">
              <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Pilihan Pantas (Subjek Popular Sekolah Rendah):
              </label>
              <div className="flex flex-wrap gap-2">
                {availablePresets.map((preset) => (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className="px-2.5 py-1.5 text-xs font-semibold bg-white text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg transition shadow-2xs flex items-center gap-1.5 group cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-110 transition" />
                    <span>{preset.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1 rounded">
                      {preset.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Subject Form */}
          <form onSubmit={handleAddCustom} className="p-4 border border-slate-200 rounded-xl bg-white space-y-3">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" />
              Tambah Subjek Tersuai:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Nama Subjek (cth: Bahasa Arab, Muzik)..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kod (cth: BA)"
                  value={customCode}
                  maxLength={5}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="w-20 px-2.5 py-2 text-xs text-center uppercase font-bold border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!customName.trim()}
                  className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition disabled:opacity-40 shadow-xs flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Perubahan subjek disimpan secara automatik ke dalam sistem.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition shadow-xs"
          >
            Selesai
          </button>
        </div>
      </div>

      {/* Confirmation Dialog for Deleting Subject */}
      {deletingSubject && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-rose-200 space-y-4 animate-scaleIn">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Buang Subjek Ini?</h4>
                <p className="text-xs text-slate-500 font-medium">
                  {deletingSubject.name} ({deletingSubject.code})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-rose-50 p-3 rounded-xl border border-rose-100">
              Perhatian: Membuang subjek ini akan mengeluarkan kolum markah subjek ini daripada jadual murid dan slip keputusan.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSubject(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeleteSubject}
                className="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Ya, Buang Subjek
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
