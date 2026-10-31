import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Table,
  Plus,
  Trash2,
  Sparkles,
  Upload,
  Download,
  Copy,
  FileSpreadsheet,
  Search,
  MessageSquareQuote,
  Check,
  AlertCircle,
  HelpCircle,
  Loader2,
  BookOpen,
  UserPlus,
  CheckSquare,
  Square,
  CheckCircle2,
} from 'lucide-react';
import { StudentRow, SubjectInfo } from '../types';
import { REMARKS_BANK, CATEGORIZED_REMARKS } from '../utils/gradeCalculations';
import { ConfirmModal } from './ConfirmModal';

interface SpreadsheetGridProps {
  students: StudentRow[];
  setStudents: React.Dispatch<React.SetStateAction<StudentRow[]>>;
  subjects: SubjectInfo[];
  setSubjects: React.Dispatch<React.SetStateAction<SubjectInfo[]>>;
  onOpenManageSubjects: () => void;
  onOpenBulkAddStudents: () => void;
  onProcess: () => void;
  onLoadSample: () => void;
  onClear: () => void;
  onShowGuide: () => void;
  onGenerateAiRemark: (student: StudentRow) => Promise<void>;
  onBulkGenerateAiRemarks: () => Promise<void>;
  generatingRowId?: string | null;
  isBulkGenerating?: boolean;
}

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  students,
  setStudents,
  subjects,
  setSubjects,
  onOpenManageSubjects,
  onOpenBulkAddStudents,
  onProcess,
  onLoadSample,
  onClear,
  onShowGuide,
  onGenerateAiRemark,
  onBulkGenerateAiRemarks,
  generatingRowId,
  isBulkGenerating,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [activeRemarkModalRowId, setActiveRemarkModalRowId] = useState<string | null>(null);
  const [remarkCategoryFilter, setRemarkCategoryFilter] = useState<string>('SEMUA');
  const [remarkSearchText, setRemarkSearchText] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const getSubjectScore = (s: StudentRow, subId: string) => {
    if (s.scores && s.scores[subId] !== undefined) {
      return s.scores[subId];
    }
    if (s[subId] !== undefined) {
      return s[subId];
    }
    return '';
  };

  const updateCell = (id: string, field: string, value: any) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;

        const isSubject = subjects.some((sub) => sub.id === field);
        if (isSubject || ['bm', 'bi', 'mt', 'sn', 'sej'].includes(field)) {
          const str = String(value ?? '').trim();
          let validVal: number | 'TH' | '';
          if (str.toUpperCase() === 'TH') {
            validVal = 'TH';
          } else if (str === '') {
            validVal = '';
          } else {
            const num = parseFloat(str);
            validVal = isNaN(num) ? '' : Math.min(100, Math.max(0, num));
          }

          return {
            ...s,
            [field]: validVal,
            scores: {
              ...(s.scores || {}),
              [field]: validVal,
            },
          };
        }
        return { ...s, [field]: value };
      })
    );
  };

  const addNewRow = () => {
    const newId = `student_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const defaultTeacher = students[students.length - 1]?.teacherName || 'PN. NORAINI BINTI HASNAN';
    const defaultClass = students[students.length - 1]?.className || '3 BESTARI';

    const newStudent: StudentRow = {
      id: newId,
      name: '',
      className: defaultClass,
      mykid: '',
      gender: 'LELAKI',
      scores: {},
      bm: '',
      bi: '',
      mt: '',
      sn: '',
      sej: '',
      teacherName: defaultTeacher,
      notes: '',
    };

    setStudents((prev) => [...prev, newStudent]);
    showStatus('Baris murid baharu ditambah.');
  };

  const removeRow = (id: string, name?: string) => {
    setConfirmState({
      isOpen: true,
      title: 'Padam Rekod Murid',
      message: `Adakah anda pasti ingin memadam rekod murid ${name ? `"${name}"` : 'ini'} daripada senarai?`,
      confirmText: 'Ya, Padam',
      onConfirm: () => {
        setStudents((prev) => prev.filter((s) => s.id !== id));
        setSelectedRowIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setConfirmState(null);
        showStatus(`Murid ${name ? `"${name}"` : ''} berjaya dipadam.`);
      },
    });
  };

  const duplicateRow = (student: StudentRow) => {
    const newId = `student_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setStudents((prev) => [
      ...prev,
      {
        ...student,
        id: newId,
        name: `${student.name} (Salinan)`,
        scores: { ...(student.scores || {}) },
      },
    ]);
    showStatus('Baris murid berjaya diduplikasi.');
  };

  // Multi-select actions
  const toggleSelectAll = (filteredList: StudentRow[]) => {
    if (selectedRowIds.size === filteredList.length && filteredList.length > 0) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(filteredList.map((s) => s.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteSelectedStudents = () => {
    if (selectedRowIds.size === 0) return;
    const count = selectedRowIds.size;
    setConfirmState({
      isOpen: true,
      title: 'Padam Murid Terpilih',
      message: `Adakah anda pasti ingin memadam ${count} orang murid yang dipilih daripada senarai? Tindakan ini tidak boleh diundur.`,
      confirmText: `Padam ${count} Murid`,
      onConfirm: () => {
        setStudents((prev) => prev.filter((s) => !selectedRowIds.has(s.id)));
        setSelectedRowIds(new Set());
        setConfirmState(null);
        showStatus(`Berjaya memadam ${count} orang murid terpilih.`);
      },
    });
  };

  // Remove Subject from Table Header
  const handleRemoveSubject = (sub: SubjectInfo) => {
    if (subjects.length <= 1) {
      showStatus('Sistem memerlukan sekurang-kurangnya 1 mata pelajaran.');
      return;
    }
    setConfirmState({
      isOpen: true,
      title: 'Buang Subjek',
      message: `Adakah anda pasti ingin membuang subjek "${sub.name} (${sub.code})"? Kolum markah ini akan dikeluarkan daripada jadual dan slip.`,
      confirmText: 'Buang Subjek',
      onConfirm: () => {
        setSubjects((prev) => prev.filter((s) => s.id !== sub.id));
        setConfirmState(null);
        showStatus(`Subjek ${sub.name} (${sub.code}) telah dibuang.`);
      },
    });
  };

  // Handle Multi-Cell Paste (from Excel / Google Sheets)
  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    startStudentId: string,
    startField: string
  ) => {
    const clipboardData = e.clipboardData.getData('text');
    if (!clipboardData || (!clipboardData.includes('\t') && !clipboardData.includes('\n'))) {
      return;
    }

    e.preventDefault();
    const rows = clipboardData
      .trim()
      .split(/\r\n|\n|\r/)
      .map((r) => r.split('\t'));

    if (rows.length === 0) return;

    // Build dynamic column order based on currently active subjects
    const columnOrder: string[] = [
      'name',
      'className',
      'mykid',
      'gender',
      ...subjects.map((s) => s.id),
      'teacherName',
      'notes',
      'resultOverride',
    ];

    const startColIndex = columnOrder.indexOf(startField);
    if (startColIndex === -1) return;

    const startIndex = students.findIndex((s) => s.id === startStudentId);
    if (startIndex === -1) return;

    setStudents((prev) => {
      const next = [...prev];

      rows.forEach((rowValues, rIdx) => {
        const targetIdx = startIndex + rIdx;

        let currentTarget: StudentRow;
        if (targetIdx < next.length) {
          currentTarget = { ...next[targetIdx], scores: { ...(next[targetIdx].scores || {}) } };
        } else {
          currentTarget = {
            id: `student_${Date.now()}_${targetIdx}_${Math.random().toString(36).substring(2, 6)}`,
            name: '',
            className: next[0]?.className || '3 BESTARI',
            mykid: '',
            gender: 'LELAKI',
            scores: {},
            teacherName: next[0]?.teacherName || 'PN. NORAINI BINTI HASNAN',
            notes: '',
          };
        }

        rowValues.forEach((val, cIdx) => {
          const colKey = columnOrder[startColIndex + cIdx];
          if (!colKey) return;

          const trimmed = val.trim();
          const isSubject = subjects.some((s) => s.id === colKey);

          if (isSubject || ['bm', 'bi', 'mt', 'sn', 'sej'].includes(colKey)) {
            const up = trimmed.toUpperCase();
            let validVal: number | 'TH' | '';
            if (up === 'TH' || trimmed.toLowerCase().includes('tidak hadir')) {
              validVal = 'TH';
            } else if (trimmed === '') {
              validVal = '';
            } else {
              const num = parseFloat(trimmed);
              validVal = isNaN(num) ? '' : Math.min(100, Math.max(0, num));
            }
            (currentTarget as any)[colKey] = validVal;
            currentTarget.scores = {
              ...(currentTarget.scores || {}),
              [colKey]: validVal,
            };
          } else if (colKey === 'gender') {
            const up = trimmed.toUpperCase();
            currentTarget.gender = up.startsWith('P') ? 'PEREMPUAN' : 'LELAKI';
          } else if (colKey === 'resultOverride') {
            const up = trimmed.toUpperCase();
            currentTarget.resultOverride = up.includes('GAGAL')
              ? 'GAGAL'
              : up.includes('LULUS')
              ? 'LULUS'
              : '';
          } else {
            (currentTarget as any)[colKey] = trimmed;
          }
        });

        next[targetIdx] = currentTarget;
      });

      return next;
    });

    showStatus(`Berjaya menampal ${rows.length} baris data dari papan keratan (clipboard)!`);
  };

  // Excel File Upload & Parse
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rawJson || rawJson.length === 0) {
          showStatus('Fail Excel kosong.');
          return;
        }

        const parsedRows: StudentRow[] = [];

        rawJson.forEach((row) => {
          if (!row || row.length === 0) return;

          const firstCell = String(row[0] || '').toLowerCase();
          if (
            firstCell.includes('nama') ||
            firstCell.includes('name') ||
            firstCell.includes('bil') ||
            firstCell.includes('#')
          ) {
            return;
          }

          let offset = 0;
          if (typeof row[0] === 'number' || (typeof row[0] === 'string' && /^\d+$/.test(row[0].trim()))) {
            offset = 1;
          }

          const name = String(row[offset] || '').trim();
          if (!name) return;

          const className = String(row[offset + 1] || '3 BESTARI').trim().toUpperCase();
          const mykid = String(row[offset + 2] || '').trim();
          const rawGender = String(row[offset + 3] || '').trim().toUpperCase();
          const gender = rawGender.startsWith('P') ? 'PEREMPUAN' : 'LELAKI';

          const scores: Record<string, number | 'TH' | ''> = {};
          subjects.forEach((sub, sIdx) => {
            const rawScore = row[offset + 4 + sIdx];
            const strVal = String(rawScore ?? '').trim().toUpperCase();
            if (strVal === 'TH' || strVal.includes('TIDAK HADIR')) {
              scores[sub.id] = 'TH';
            } else {
              const num = parseFloat(strVal);
              scores[sub.id] = !isNaN(num) ? Math.min(100, Math.max(0, num)) : '';
            }
          });

          const afterScoresIdx = offset + 4 + subjects.length;
          const teacherName = String(row[afterScoresIdx] || 'PN. NORAINI BINTI HASNAN').trim();
          const notes = String(row[afterScoresIdx + 1] || '').trim();

          parsedRows.push({
            id: `student_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name,
            className,
            mykid,
            gender,
            scores,
            teacherName,
            notes,
          });
        });

        if (parsedRows.length > 0) {
          setStudents(parsedRows);
          showStatus(`Berjaya memuat naik ${parsedRows.length} rekod murid daripada fail Excel!`);
        } else {
          showStatus('Tiada data murid yang sah dapat diekstrak. Sila gunakan templat piawai.');
        }
      } catch (err) {
        console.error('Failed to parse Excel:', err);
        showStatus('Gagal memproses fail Excel. Sila pastikan format fail betul.');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Download Sample Excel Template dynamically matching current subjects
  const downloadTemplate = () => {
    const wsData = [
      [
        'BIL',
        'NAMA MURID',
        'KELAS',
        'NO. K/P (MYKID)',
        'JANTINA',
        ...subjects.map((s) => s.code),
        'NAMA GURU KELAS',
        'ULASAN GURU',
      ],
      [
        1,
        'Ahmad Ammar Bin Zulkifli',
        '3 BESTARI',
        '140304085543',
        'LELAKI',
        ...subjects.map(() => 85),
        'PN. NORAINI BINTI HASNAN',
        'Pencapaian cemerlang.',
      ],
      [
        2,
        'Nur Aishah Binti Rosli',
        '3 BESTARI',
        '140712086654',
        'PEREMPUAN',
        ...subjects.map(() => 90),
        'PN. NORAINI BINTI HASNAN',
        'Prestasi amat baik.',
      ],
      [
        3,
        'Lim Wei Xiang',
        '3 CERDAS',
        '140405089912',
        'LELAKI',
        ...subjects.map(() => 80),
        'EN. RAZAK BIN HARUN',
        'Komited dan rajin.',
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DataMurid');
    XLSX.writeFile(wb, 'Templat_Markah_Sekolah_Rendah.xlsx');
  };

  // Filter students by search term
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.mykid.includes(searchTerm)
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
      {/* Header controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Table className="w-5 h-5 text-indigo-600" />
            Spreadsheet Input (Boleh Sunting Terus &amp; Tampal Dari Excel)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>Tambah atau buang murid dan subjek secara fleksibel. Tampal (<b>Ctrl + V</b>) dari fail Excel atau taip terus ke dalam sel.</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">
              Boleh taip nombor markah atau "TH" untuk murid Tidak Hadir
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onLoadSample}
            className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Muat Data Contoh
          </button>

          <label className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer transition flex items-center gap-1.5 shadow-2xs">
            <Upload className="w-3.5 h-3.5" />
            Muat Naik Excel (.xlsx)
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          <button
            type="button"
            onClick={downloadTemplate}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg transition flex items-center gap-1.5"
            title="Muat turun fail templat Excel kosong mengikut senarai subjek aktif"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Templat Excel
          </button>

          <button
            type="button"
            onClick={onShowGuide}
            className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition flex items-center gap-1"
            title="Buka panduan cara guna"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Panduan
          </button>
        </div>
      </div>

      {/* Grid Toolbar: Add Student, Bulk Add Names, Manage Subjects, Bulk AI, etc. */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Add Single Row */}
          <button
            type="button"
            onClick={addNewRow}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-emerald-50 hover:border-emerald-300 font-semibold rounded-lg text-slate-700 flex items-center gap-1.5 transition shadow-2xs"
            title="Tambah satu baris murid di bahagian bawah jadual"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tambah Murid</span>
          </button>

          {/* Bulk Add Student Names Modal */}
          <button
            type="button"
            onClick={onOpenBulkAddStudents}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-indigo-50 hover:border-indigo-300 font-semibold rounded-lg text-indigo-700 flex items-center gap-1.5 transition shadow-2xs"
            title="Tampal senarai nama murid secara pukal (cth: dari WhatsApp / kehadiran)"
          >
            <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
            <span>+ Tambah Murid Pukal</span>
          </button>

          {/* Manage Subjects Modal */}
          <button
            type="button"
            onClick={onOpenManageSubjects}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-purple-50 hover:border-purple-300 font-semibold rounded-lg text-purple-700 flex items-center gap-1.5 transition shadow-2xs"
            title="Tambah atau buang subjek peperiksaan (PI, BA, RBT, PSV, dll.)"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
            <span>Urus / Tambah Subjek ({subjects.length})</span>
          </button>

          {/* Bulk AI Remark Generator */}
          <button
            type="button"
            onClick={onBulkGenerateAiRemarks}
            disabled={isBulkGenerating || students.length === 0}
            className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg flex items-center gap-1.5 transition shadow-2xs disabled:opacity-50"
            title="Jana ulasan menggunakan AI untuk semua murid secara serentak"
          >
            {isBulkGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            )}
            <span>Jana Ulasan AI (Pukal)</span>
          </button>

          {/* Clear Table */}
          <button
            type="button"
            onClick={onClear}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 font-semibold rounded-lg text-slate-700 flex items-center gap-1 transition shadow-2xs"
            title="Padam semua data murid dalam jadual"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Kosongkan</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama / kelas / mykid..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
            />
          </div>
        </div>
      </div>

      {/* Multi-Selection Batch Actions Bar (Visible when rows are checked) */}
      {selectedRowIds.size > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs animate-fadeIn text-rose-950 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">
              <strong>{selectedRowIds.size}</strong> orang murid dipilih daripada senarai.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setSelectedRowIds(new Set())}
              className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-medium transition"
            >
              Batal Pilihan
            </button>
            <button
              type="button"
              onClick={deleteSelectedStudents}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Padam {selectedRowIds.size} Murid Terpilih</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Status Notification */}
      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Interactive Spreadsheet Table */}
      <div className="overflow-x-auto border border-slate-300 rounded-xl max-h-[520px] relative shadow-inner bg-slate-50/50">
        <table className="w-full border-collapse text-xs bg-white min-w-[1250px]">
          <thead className="bg-slate-100 text-slate-700 sticky top-0 z-20 shadow-xs font-semibold select-none">
            <tr>
              {/* Checkbox Select All */}
              <th className="w-9 p-2 border border-slate-300 text-center bg-slate-200">
                <button
                  type="button"
                  onClick={() => toggleSelectAll(filteredStudents)}
                  className="text-slate-600 hover:text-indigo-600 transition"
                  title={
                    selectedRowIds.size === filteredStudents.length && filteredStudents.length > 0
                      ? 'Nyahpilih semua murid'
                      : 'Pilih semua murid'
                  }
                >
                  {selectedRowIds.size === filteredStudents.length && filteredStudents.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </th>

              {/* Bil */}
              <th className="w-9 p-2 border border-slate-300 text-center bg-slate-200">#</th>

              {/* Core Student Info Columns */}
              <th className="p-2 border border-slate-300 text-left min-w-[190px]">NAMA MURID</th>
              <th className="p-2 border border-slate-300 text-left min-w-[105px]">KELAS</th>
              <th className="p-2 border border-slate-300 text-left min-w-[115px]">NO. K/P (MYKID)</th>
              <th className="p-2 border border-slate-300 text-center w-24">JANTINA</th>

              {/* Dynamic Subject Columns */}
              {subjects.map((sub) => (
                <th
                  key={sub.id}
                  className="p-2 border border-slate-300 text-center min-w-[70px] bg-indigo-50/80 text-indigo-950 font-bold relative group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>{sub.code}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(sub)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition p-0.5"
                      title={`Buang subjek ${sub.name} (${sub.code})`}
                    >
                      <Trash2 className="w-3 h-3 text-rose-500" />
                    </button>
                  </div>
                  <span className="block text-[9px] text-slate-400 font-normal truncate max-w-[65px] mx-auto">
                    {sub.name}
                  </span>
                </th>
              ))}

              {/* Add Subject Header Button */}
              <th className="p-1 border border-slate-300 text-center w-12 bg-indigo-50/40">
                <button
                  type="button"
                  onClick={onOpenManageSubjects}
                  className="px-2 py-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded transition flex items-center justify-center gap-0.5 w-full"
                  title="Tambah subjek baharu ke dalam jadual"
                >
                  <Plus className="w-3 h-3" />
                  <span>Subjek</span>
                </button>
              </th>

              <th className="p-2 border border-slate-300 text-left min-w-[150px]">NAMA GURU KELAS</th>
              <th className="p-2 border border-slate-300 text-left min-w-[200px]">ULASAN</th>
              <th
                className="p-2 border border-slate-300 text-center w-28 bg-emerald-50/70 text-emerald-950 font-bold"
                title="Cikgu boleh pilih sama ada LULUS, GAGAL, atau Auto"
              >
                KEPUTUSAN
              </th>
              <th className="w-16 p-2 border border-slate-300 text-center bg-slate-200">TINDAKAN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={10 + subjects.length} className="p-8 text-center text-slate-400 bg-white">
                  <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  Tiada rekod murid. Sila klik "Tambah Murid", "+ Tambah Murid Pukal", atau "Muat Data Contoh".
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, idx) => {
                const isSelected = selectedRowIds.has(student.id);
                return (
                  <tr
                    key={student.id}
                    className={`transition-colors group ${
                      isSelected ? 'bg-indigo-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Row Checkbox */}
                    <td className="p-2 border border-slate-200 text-center bg-slate-50/50">
                      <button
                        type="button"
                        onClick={() => toggleSelectRow(student.id)}
                        className="text-slate-400 hover:text-indigo-600 transition"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                        )}
                      </button>
                    </td>

                    {/* Index */}
                    <td className="p-2 border border-slate-200 text-center font-bold text-slate-400 bg-slate-50 select-none">
                      {idx + 1}
                    </td>

                    {/* Nama Murid */}
                    <td className="p-0 border border-slate-200">
                      <input
                        type="text"
                        value={student.name}
                        onChange={(e) => updateCell(student.id, 'name', e.target.value)}
                        onPaste={(e) => handlePaste(e, student.id, 'name')}
                        placeholder="Nama Penuh Murid"
                        className="w-full px-2.5 py-1.5 outline-none focus:bg-indigo-50/60 focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                      />
                    </td>

                    {/* Kelas */}
                    <td className="p-0 border border-slate-200">
                      <input
                        type="text"
                        value={student.className}
                        onChange={(e) => updateCell(student.id, 'className', e.target.value.toUpperCase())}
                        onPaste={(e) => handlePaste(e, student.id, 'className')}
                        placeholder="3 BESTARI"
                        className="w-full px-2 py-1.5 outline-none focus:bg-indigo-50/60 focus:ring-2 focus:ring-indigo-500 uppercase font-semibold text-slate-700"
                      />
                    </td>

                    {/* No K/P */}
                    <td className="p-0 border border-slate-200">
                      <input
                        type="text"
                        value={student.mykid}
                        onChange={(e) => updateCell(student.id, 'mykid', e.target.value)}
                        onPaste={(e) => handlePaste(e, student.id, 'mykid')}
                        placeholder="140101081234"
                        className="w-full px-2 py-1.5 outline-none focus:bg-indigo-50/60 focus:ring-2 focus:ring-indigo-500 text-slate-600 font-mono"
                      />
                    </td>

                    {/* Jantina */}
                    <td className="p-0 border border-slate-200">
                      <select
                        value={student.gender}
                        onChange={(e) => updateCell(student.id, 'gender', e.target.value)}
                        className="w-full px-1.5 py-1.5 outline-none bg-transparent focus:bg-indigo-50/60 focus:ring-2 focus:ring-indigo-500 text-center font-semibold text-slate-700 uppercase"
                      >
                        <option value="LELAKI">LELAKI</option>
                        <option value="PEREMPUAN">PEREMPUAN</option>
                      </select>
                    </td>

                    {/* Dynamic Subject Marks */}
                    {subjects.map((sub) => {
                      const scoreVal = getSubjectScore(student, sub.id);
                      const isTH = scoreVal === 'TH';
                      return (
                        <td
                          key={sub.id}
                          className={`p-0 border border-slate-200 transition-colors relative group/cell ${
                            isTH ? 'bg-rose-50/80' : 'bg-indigo-50/15'
                          }`}
                        >
                          <div className="relative flex items-center justify-center">
                            <input
                              type="text"
                              value={scoreVal}
                              onChange={(e) => updateCell(student.id, sub.id, e.target.value)}
                              onPaste={(e) => handlePaste(e, student.id, sub.id)}
                              placeholder="0 / TH"
                              className={`w-full px-2 py-1.5 text-center font-bold outline-none uppercase transition text-xs sm:text-sm ${
                                isTH
                                  ? 'text-rose-700 bg-rose-50 font-black'
                                  : 'text-slate-800 focus:bg-indigo-50/60 focus:ring-2 focus:ring-indigo-500'
                              }`}
                              title={`Markah ${sub.name} (Taip 0-100 atau TH untuk Tidak Hadir)`}
                            />
                            {/* Quick TH toggle button on hover or active */}
                            <button
                              type="button"
                              onClick={() => updateCell(student.id, sub.id, isTH ? '' : 'TH')}
                              className={`absolute right-1 text-[9px] px-1 py-0.5 rounded font-black transition cursor-pointer select-none ${
                                isTH
                                  ? 'bg-rose-200 text-rose-800 hover:bg-rose-300 shadow-2xs'
                                  : 'opacity-0 group-hover/cell:opacity-100 bg-slate-200/90 text-slate-600 hover:bg-rose-100 hover:text-rose-700'
                              }`}
                              title={isTH ? 'Batal TH' : 'Set murid ini Tidak Hadir (TH)'}
                            >
                              TH
                            </button>
                          </div>
                        </td>
                      );
                    })}

                    {/* Empty cell spacer matching "+ Subjek" header */}
                    <td className="p-0 border border-slate-200 bg-slate-50/40"></td>

                    {/* Nama Guru Kelas */}
                    <td className="p-0 border border-slate-200">
                      <input
                        type="text"
                        value={student.teacherName}
                        onChange={(e) => updateCell(student.id, 'teacherName', e.target.value)}
                        onPaste={(e) => handlePaste(e, student.id, 'teacherName')}
                        placeholder="PN. NORAINI BINTI HASNAN"
                        className="w-full px-2 py-1.5 outline-none focus:bg-indigo-50/60 focus:ring-2 focus:ring-indigo-500 text-slate-700 uppercase font-medium"
                      />
                    </td>

                    {/* Ulasan */}
                    <td className="p-0 border border-slate-200 relative">
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={student.notes}
                          onChange={(e) => updateCell(student.id, 'notes', e.target.value)}
                          onPaste={(e) => handlePaste(e, student.id, 'notes')}
                          placeholder="Ulasan guru kelas..."
                          className="w-full px-2 py-1.5 outline-none focus:bg-indigo-50/60 focus:ring-2 focus:ring-indigo-500 text-slate-600 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => onGenerateAiRemark(student)}
                          disabled={generatingRowId === student.id}
                          className="px-1.5 py-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition disabled:opacity-50"
                          title="Jana ulasan menggunakan AI bagi murid ini"
                        >
                          {generatingRowId === student.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveRemarkModalRowId(student.id)}
                          className="px-1.5 py-1 text-slate-400 hover:text-indigo-600 rounded transition"
                          title="Pilih ulasan daripada bank ulasan"
                        >
                          <MessageSquareQuote className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Keputusan (LULUS / GAGAL / Auto) */}
                    <td className="p-0 border border-slate-200 text-center">
                      <select
                        value={student.resultOverride || ''}
                        onChange={(e) => updateCell(student.id, 'resultOverride', e.target.value)}
                        className={`w-full px-1.5 py-1.5 text-center font-bold text-xs outline-none focus:bg-indigo-50/60 focus:ring-2 focus:ring-indigo-500 cursor-pointer uppercase ${
                          student.resultOverride === 'LULUS'
                            ? 'text-emerald-700 bg-emerald-50/70'
                            : student.resultOverride === 'GAGAL'
                            ? 'text-rose-700 bg-rose-50/70'
                            : 'text-slate-500'
                        }`}
                        title="Cikgu boleh pilih LULUS atau GAGAL (atau biarkan Auto mengikut markah)"
                      >
                        <option value="">Auto (Gred)</option>
                        <option value="LULUS">LULUS</option>
                        <option value="GAGAL">GAGAL</option>
                      </select>
                    </td>

                    {/* Actions: Duplicate / Delete */}
                    <td className="p-1 border border-slate-200 text-center bg-slate-50/50">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => duplicateRow(student)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded transition"
                          title="Salin baris murid ini"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRow(student.id, student.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                          title="Padam rekod murid ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Remarks Bank Modal */}
      {(() => {
        if (!activeRemarkModalRowId) return null;
        const modalStudent = students.find((s) => s.id === activeRemarkModalRowId);
        const categories = ['SEMUA', ...CATEGORIZED_REMARKS.map((c) => c.title)];
        const allRemarks = CATEGORIZED_REMARKS.flatMap((cat) =>
          cat.remarks.map((r) => ({
            category: cat.title,
            badge: cat.badge,
            badgeBg: cat.badgeBg,
            textColor: cat.textColor,
            remark: r,
          }))
        );

        const displayedRemarks = allRemarks.filter((item) => {
          const matchCat = remarkCategoryFilter === 'SEMUA' || item.category === remarkCategoryFilter;
          const matchSearch =
            remarkSearchText.trim() === '' ||
            item.remark.toLowerCase().includes(remarkSearchText.toLowerCase()) ||
            item.badge.toLowerCase().includes(remarkSearchText.toLowerCase());
          return matchCat && matchSearch;
        });

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <MessageSquareQuote className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Pilih Ulasan Guru</h3>
                    <p className="text-[11px] text-slate-500">
                      Untuk: <span className="font-semibold text-slate-700">{modalStudent?.name || 'Murid'}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRemarkModalRowId(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* AI Quick Generator Callout Box */}
              {modalStudent && (
                <div className="p-3 bg-linear-to-r from-indigo-50 to-purple-50 border border-indigo-200/80 rounded-xl flex items-center justify-between gap-3">
                  <div className="text-xs text-indigo-950">
                    <span className="font-bold block flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Penjana Ulasan AI Pintar
                    </span>
                    <span className="text-[11px] text-slate-600">
                      AI akan menganalisis gred &amp; markah murid ini dan menulis ulasan yang tepat &amp; membina.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (modalStudent) {
                        await onGenerateAiRemark(modalStudent);
                        setActiveRemarkModalRowId(null);
                      }
                    }}
                    disabled={generatingRowId === modalStudent?.id}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    {generatingRowId === modalStudent?.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Jana Sekarang</span>
                  </button>
                </div>
              )}

              {/* Search & Category Filter */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Cari kata kunci ulasan (cth: cemerlang, latihan, bimbingan)..."
                  value={remarkSearchText}
                  onChange={(e) => setRemarkSearchText(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
                />

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setRemarkCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                        remarkCategoryFilter === cat
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.replace('Pencapaian ', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remarks List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {displayedRemarks.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Tiada ulasan sepadan dengan carian.
                  </div>
                ) : (
                  displayedRemarks.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        updateCell(activeRemarkModalRowId, 'notes', item.remark);
                        setActiveRemarkModalRowId(null);
                      }}
                      className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-xs text-slate-700 transition flex flex-col gap-1.5 group cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.badgeBg} ${item.textColor}`}>
                          {item.badge}
                        </span>
                        <span className="text-[10px] text-indigo-600 opacity-0 group-hover:opacity-100 font-semibold transition">
                          Pilih Ulasan ini →
                        </span>
                      </div>
                      <span className="leading-relaxed text-slate-800">{item.remark}</span>
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  {displayedRemarks.length} pilihan ulasan sedia ada
                </span>
                <button
                  type="button"
                  onClick={() => setActiveRemarkModalRowId(null)}
                  className="px-4 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Bottom Processing Action Bar */}
      <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            {students.length > 0
              ? `${students.length} orang murid sedia untuk diproses dengan ${subjects.length} mata pelajaran.`
              : 'Sila masukkan sekurang-kurangnya satu murid untuk menjana slip.'}
          </span>
        </div>

        <button
          type="button"
          onClick={onProcess}
          className="w-full sm:w-auto px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          Proses &amp; Jana Slip Keputusan
        </button>
      </div>

      {/* In-App Confirmation Dialog */}
      {confirmState && (
        <ConfirmModal
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          confirmText={confirmState.confirmText}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}
    </div>
  );
};
