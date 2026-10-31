import React, { useState } from 'react';
import { UserPlus, Users, X, Check, AlertCircle } from 'lucide-react';
import { StudentRow } from '../types';

interface BulkAddStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingClasses: string[];
  defaultTeacherName: string;
  onAddStudents: (newStudents: StudentRow[]) => void;
}

export const BulkAddStudentsModal: React.FC<BulkAddStudentsModalProps> = ({
  isOpen,
  onClose,
  existingClasses,
  defaultTeacherName,
  onAddStudents,
}) => {
  const [namesText, setNamesText] = useState('');
  const [targetClass, setTargetClass] = useState(existingClasses[0] || '3 BESTARI');
  const [customClass, setCustomClass] = useState('');
  const [teacherName, setTeacherName] = useState(defaultTeacherName || 'GURU KELAS');
  const [errorText, setErrorText] = useState<string | null>(null);

  if (!isOpen) return null;

  // Parse lines, strip leading row numbers or bullets e.g. "1. Ahmad", "- Siti"
  const parsedNames = namesText
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[\d]+[\.\)\-\s]+/, '').replace(/^[\-\*\•]\s*/, '').trim())
    .filter((line) => line.length > 0);

  const finalClassName = targetClass === 'CUSTOM' ? customClass.trim().toUpperCase() || 'KELAS' : targetClass;

  const handleAdd = () => {
    if (parsedNames.length === 0) {
      setErrorText('Sila masukkan atau tampal sekurang-kurangnya satu nama murid.');
      return;
    }
    setErrorText(null);

    const newRows: StudentRow[] = parsedNames.map((name, idx) => {
      // Auto-detect gender from Malay naming convention
      const lower = name.toLowerCase();
      let gender: 'LELAKI' | 'PEREMPUAN' = 'LELAKI';
      if (lower.includes('binti') || lower.includes('bt') || lower.includes('a/p') || lower.includes('ap ')) {
        gender = 'PEREMPUAN';
      }

      return {
        id: `student_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        name,
        className: finalClassName,
        mykid: '',
        gender,
        bm: '',
        bi: '',
        mt: '',
        sn: '',
        sej: '',
        scores: {},
        teacherName: teacherName.trim().toUpperCase(),
        notes: '',
      };
    });

    onAddStudents(newRows);
    setNamesText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Tambah Nama Murid Secara Pukal</h3>
              <p className="text-xs text-slate-500">
                Tampal senarai nama murid dari WhatsApp, kehadiran, atau fail Excel.
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

        {/* Form Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {errorText && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Settings for newly added students */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pilih Kelas:</label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
              >
                {existingClasses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="CUSTOM">+ Kelas Baharu...</option>
              </select>

              {targetClass === 'CUSTOM' && (
                <input
                  type="text"
                  placeholder="Nama Kelas (cth: 3 GEMILANG)"
                  value={customClass}
                  onChange={(e) => setCustomClass(e.target.value)}
                  className="w-full mt-2 px-3 py-1.5 border border-indigo-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white uppercase font-bold"
                />
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Guru Kelas:</label>
              <input
                type="text"
                placeholder="PN. NORAINI BINTI HASNAN"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-medium uppercase"
              />
            </div>
          </div>

          {/* Textarea for pasting names */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Senarai Nama Murid (Satu Nama Setiap Baris):
              </label>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {parsedNames.length} nama dikesan
              </span>
            </div>
            <textarea
              rows={8}
              value={namesText}
              onChange={(e) => setNamesText(e.target.value)}
              placeholder="Contoh:&#10;1. Muhammad Harith Bin Yusof&#10;2. Nur Damia Binti Khairul&#10;3. Lim Wei Xiang&#10;4. Kavitha A/P Subramaniam&#10;5. Danish Rayyan Bin Azhar"
              className="w-full p-3 text-xs sm:text-sm font-sans border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white resize-y font-medium text-slate-800"
            />
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              Sistem akan membuang nombor (1., 2.) secara automatik dan mengesan jantina berasaskan 'bin' / 'binti'.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleAdd}
            disabled={parsedNames.length === 0}
            className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-md disabled:opacity-40 flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah {parsedNames.length} Murid ke Jadual</span>
          </button>
        </div>
      </div>
    </div>
  );
};
