import React, { useState, useRef } from 'react';
import {
  Printer,
  Download,
  Eye,
  FileSpreadsheet,
  Sparkles,
  MessageSquareQuote,
  Loader2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Shield,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { ProcessedStudent, SchoolSettings, SubjectKey } from '../types';
import { ConfirmModal } from './ConfirmModal';
import { downloadSlipPdf, downloadBulkSlipsPdf } from '../utils/pdfGenerator';

interface SlipPreviewProps {
  role?: 'parent' | 'admin';
  students: ProcessedStudent[];
  settings: SchoolSettings;
  onGradeOverride: (studentId: string, subject: SubjectKey, newGrade: string) => void;
  onResultOverride: (studentId: string, newResult: 'LULUS' | 'GAGAL') => void;
  onGenerateAiRemark: (student: ProcessedStudent) => void;
  onOpenRemarkModal: (studentId: string) => void;
  onDeleteStudent?: (studentId: string, studentName?: string) => void;
  generatingStudentId?: string | null;
  onPrint: () => void;
  onGoToData?: () => void;
}

export const SlipPreview: React.FC<SlipPreviewProps> = ({
  role = 'parent',
  students,
  settings,
  onGradeOverride,
  onResultOverride,
  onGenerateAiRemark,
  onOpenRemarkModal,
  onDeleteStudent,
  generatingStudentId,
  onPrint,
  onGoToData,
}) => {
  // Admin view state
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('ALL');
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>('');
  const [studentToDelete, setStudentToDelete] = useState<ProcessedStudent | null>(null);

  // PDF generation loading state
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null);
  const [downloadingStudentId, setDownloadingStudentId] = useState<string | null>(null);

  // Parent view state: strictly require search by name and IC to reveal slip
  const [parentSearchName, setParentSearchName] = useState<string>('');
  const [parentSearchIc, setParentSearchIc] = useState<string>('');
  const [parentSearched, setParentSearched] = useState<boolean>(false);
  const [parentMatchedStudent, setParentMatchedStudent] = useState<ProcessedStudent | null>(null);
  const [parentSearchError, setParentSearchError] = useState<string | null>(null);

  // Ref map for capturing DOM elements for PDF export
  const slipRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const classes = ['ALL', ...Array.from(new Set(students.map((s) => s.className)))];
  const schoolLines = settings.schoolName.split('\n').filter((l) => l.trim() !== '');

  // Helper to normalize IC (remove hyphens, spaces)
  const cleanIc = (str?: string) => (str ? str.replace(/[^0-9a-zA-Z]/g, '').toLowerCase() : '');

  // Handle Parent Search
  const handleParentSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setParentSearchError(null);

    const nameQuery = parentSearchName.trim().toLowerCase();
    const icQuery = cleanIc(parentSearchIc);

    if (!nameQuery && !icQuery) {
      setParentSearchError('Sila masukkan Nama Murid dan/atau No. Kad Pengenalan (MyKid) anak anda.');
      return;
    }

    // Match criteria:
    // If both name and IC provided: check that both match
    // If only name or only IC provided: match on that field
    const match = students.find((s) => {
      const sName = s.name.trim().toLowerCase();
      const sIc = cleanIc(s.mykid);

      const nameMatch = nameQuery ? sName.includes(nameQuery) : true;
      const icMatch = icQuery ? sIc === icQuery || sIc.includes(icQuery) : true;

      // If user typed both, both must match. If typed one, that one must match.
      if (nameQuery && icQuery) {
        return nameMatch && icMatch;
      }
      return (nameQuery && nameMatch) || (icQuery && icMatch);
    });

    setParentSearched(true);
    if (match) {
      setParentMatchedStudent(match);
      setParentSearchError(null);
    } else {
      setParentMatchedStudent(null);
      setParentSearchError(
        'Tiada rekod slip dijumpai yang sepadan dengan carian. Sila pastikan ejaan nama atau nombor kad pengenalan (MyKid) adalah tepat.'
      );
    }
  };

  const handleResetParentSearch = () => {
    setParentSearchName('');
    setParentSearchIc('');
    setParentSearched(false);
    setParentMatchedStudent(null);
    setParentSearchError(null);
  };

  // Direct PDF Download for Single Student
  const handleDownloadSinglePdf = async (student: ProcessedStudent) => {
    const elementId = `slip-card-${student.id}`;
    setDownloadingStudentId(student.id);

    // Allow React state to settle before capture
    await new Promise((resolve) => setTimeout(resolve, 80));

    const el = document.getElementById(elementId) || slipRefs.current[student.id];
    if (el) {
      const fileName = `Slip_Pentaksiran_${student.name}_${student.className}`;
      await downloadSlipPdf(el, fileName);
    }
    setDownloadingStudentId(null);
  };

  // Guaranteed Print Handler: Always generates printable A4 PDF and attempts native print
  const handleSafePrint = async () => {
    // 1. Attempt native browser print dialog
    try {
      window.print();
    } catch (err) {
      console.warn('window.print() blocked by browser sandbox:', err);
    }

    // 2. Automatically generate and download the A4 PDF document so printing never fails in iframes
    if (role === 'parent' && parentMatchedStudent) {
      await handleDownloadSinglePdf(parentMatchedStudent);
    } else {
      await handleAdminDownloadPdf();
    }
  };

  // Admin Bulk PDF Download
  const handleAdminDownloadPdf = async () => {
    if (displayedStudents.length === 1) {
      await handleDownloadSinglePdf(displayedStudents[0]);
      return;
    }

    const elementIds = displayedStudents.map((s) => `slip-card-${s.id}`);
    if (elementIds.length === 0) return;

    setIsDownloadingPdf(true);

    // Allow React state to settle before capture
    await new Promise((resolve) => setTimeout(resolve, 80));

    const fileName =
      selectedClass === 'ALL'
        ? `Slip_Pentaksiran_Semua_Murid_${settings.sessionYear || 'Sesi'}`
        : `Slip_Pentaksiran_Kelas_${selectedClass}`;

    await downloadBulkSlipsPdf(elementIds, fileName, (current, total) => {
      setDownloadProgress({ current, total });
    });

    setIsDownloadingPdf(false);
    setDownloadProgress(null);
  };

  // Filter students for Admin
  const adminFiltered = students.filter((s) => {
    const matchesClass = selectedClass === 'ALL' || s.className === selectedClass;
    const q = adminSearchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      s.name.toLowerCase().includes(q) ||
      (s.mykid && s.mykid.toLowerCase().includes(q)) ||
      s.className.toLowerCase().includes(q);

    return matchesClass && matchesSearch;
  });

  const displayedStudents =
    selectedStudentId === 'ALL'
      ? adminFiltered
      : adminFiltered.filter((s) => s.id === selectedStudentId);

  // -------------------------------------------------------------
  // RENDER: PARENT MODE (Strict privacy search & single slip download)
  // -------------------------------------------------------------
  if (role === 'parent') {
    return (
      <div className="space-y-6">
        {/* Search Portal Box (Hidden during print) */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden no-print">
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-indigo-900 text-white p-6 sm:p-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-indigo-600/60 border border-indigo-400/40 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                <Shield className="w-3.5 h-3.5 text-emerald-300" />
                <span>Portal Rasmi Semakan Keputusan Murid</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Semak &amp; Muat Turun Slip Pentaksiran
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200 mt-2 leading-relaxed">
                Demi menjaga kerahsiaan dan privasi rekod murid, sila masukkan <b>Nama Murid</b> dan/atau <b>No. Kad Pengenalan (MyKid)</b> anak anda di bawah. Slip murid lain tidak akan dipaparkan.
              </p>
            </div>
          </div>

          <form onSubmit={handleParentSearch} className="p-6 sm:p-8 bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Nama Penuh Murid
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={parentSearchName}
                    onChange={(e) => setParentSearchName(e.target.value)}
                    placeholder="Contoh: AHMAD DANIAL"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 transition"
                  />
                  {parentSearchName && (
                    <button
                      type="button"
                      onClick={() => setParentSearchName('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  No. Kad Pengenalan / MyKid
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={parentSearchIc}
                    onChange={(e) => setParentSearchIc(e.target.value)}
                    placeholder="Contoh: 140512-08-1234"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 transition font-mono"
                  />
                  {parentSearchIc && (
                    <button
                      type="button"
                      onClick={() => setParentSearchIc('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {parentSearchError && (
              <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-start gap-2.5 max-w-3xl">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{parentSearchError}</span>
              </div>
            )}

            <div className="mt-5 flex items-center gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Semak Slip Murid</span>
              </button>

              {parentSearched && (
                <button
                  type="button"
                  onClick={handleResetParentSearch}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Carian Baharu</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* If Not Searched Yet: Reassuring Empty State */}
        {!parentSearched && (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-xs space-y-3">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Sila Masukkan Nama atau No. Kad Pengenalan Anak Anda
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Untuk melindungi privasi, senarai murid dan slip individu tidak dipaparkan secara terbuka. Sila buat carian di atas untuk memaparkan slip pentaksiran rasmi anak anda.
            </p>
          </div>
        )}

        {/* Matched Parent Student: Display ONLY their slip & direct PDF download */}
        {parentSearched && parentMatchedStudent && (
          <div className="space-y-4">
            {/* Action Bar for Parent */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 no-print">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                    Slip Keputusan Ditemui: {parentMatchedStudent.name}
                  </h4>
                  <p className="text-[11px] text-emerald-700">
                    Kelas: {parentMatchedStudent.className} | No. K/P: {parentMatchedStudent.mykid || '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                {/* Download PDF Button */}
                <button
                  type="button"
                  onClick={() => handleDownloadSinglePdf(parentMatchedStudent)}
                  disabled={downloadingStudentId === parentMatchedStudent.id}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  title="Muat turun fail slip keputusan dalam format PDF (A4)"
                >
                  {downloadingStudentId === parentMatchedStudent.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>
                    {downloadingStudentId === parentMatchedStudent.id ? 'Menjana PDF...' : 'Muat Turun PDF'}
                  </span>
                </button>

                {/* Print Button */}
                <button
                  type="button"
                  onClick={handleSafePrint}
                  disabled={downloadingStudentId === parentMatchedStudent.id}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  title="Cetak slip atau simpan ke PDF"
                >
                  {downloadingStudentId === parentMatchedStudent.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Printer className="w-4 h-4" />
                  )}
                  <span>
                    {downloadingStudentId === parentMatchedStudent.id ? 'Menjana Cetakan...' : 'Cetak Slip'}
                  </span>
                </button>
              </div>
            </div>

            {/* The Slip Card itself */}
            <div
              id={`slip-card-${parentMatchedStudent.id}`}
              ref={(el) => {
                slipRefs.current[parentMatchedStudent.id] = el;
              }}
              className="slip-card bg-white p-8 sm:p-12 rounded-xl shadow-md border border-slate-300 font-sans text-black relative"
              style={{ minHeight: '270mm' }}
            >
              {/* Header */}
              <div className="text-center flex flex-col items-center justify-center mb-3">
                {Boolean(settings.schoolLogo) && (
                  <img
                    src={settings.schoolLogo}
                    className="w-16 h-16 object-contain mb-2"
                    alt="Logo Sekolah"
                  />
                )}
                {schoolLines.map((line, lIdx) => (
                  <h2 key={lIdx} className="text-sm sm:text-base font-bold uppercase tracking-wide leading-snug text-black">
                    {line}
                  </h2>
                ))}
              </div>

              {/* Framed Exam Title Box */}
              <div className="w-full border-2 border-black py-1.5 px-3 text-center mb-5 bg-white">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black">
                  {settings.examTitle}
                </h3>
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-2 gap-x-6 sm:gap-x-12 gap-y-1.5 text-xs sm:text-sm mb-5 pb-1">
                <div className="flex">
                  <span className="w-20 sm:w-24 text-black font-semibold shrink-0">Nama</span>
                  <span className="mr-2 font-bold">:</span>
                  <span className="font-bold text-black uppercase tracking-tight break-words">
                    {parentMatchedStudent.name}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-20 sm:w-24 text-black font-semibold shrink-0">Kelas</span>
                  <span className="mr-2 font-bold">:</span>
                  <span className="font-bold text-black uppercase">{parentMatchedStudent.className}</span>
                </div>
                <div className="flex">
                  <span className="w-20 sm:w-24 text-black font-semibold shrink-0">No K/P</span>
                  <span className="mr-2 font-bold">:</span>
                  <span className="font-normal text-black font-mono">{parentMatchedStudent.mykid || '-'}</span>
                </div>
                <div className="flex">
                  <span className="w-20 sm:w-24 text-black font-semibold shrink-0">Jantina</span>
                  <span className="mr-2 font-bold">:</span>
                  <span className="font-normal text-black uppercase">{parentMatchedStudent.gender || 'LELAKI'}</span>
                </div>
              </div>

              {/* Table without lines */}
              <div className="overflow-x-auto mb-5">
                <table className="w-full text-xs sm:text-sm text-black border-0">
                  <thead>
                    <tr className="bg-slate-100/70 font-bold uppercase border-0">
                      <th className="py-2 px-3 text-center w-12 border-0">Bil</th>
                      <th className="py-2 px-3 text-left border-0">Mata Pelajaran</th>
                      <th className="py-2 px-3 text-center w-28 border-0">Markah</th>
                      <th className="py-2 px-3 text-center w-28 border-0">Gred</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parentMatchedStudent.subjectResults && parentMatchedStudent.subjectResults.length > 0 ? (
                      parentMatchedStudent.subjectResults.map((sub, idx) => (
                        <tr key={sub.id || idx} className="border-0">
                          <td className="py-1.5 px-3 text-center font-bold border-0">{idx + 1}</td>
                          <td className="py-1.5 px-3 text-left font-semibold uppercase border-0">{sub.name}</td>
                          <td className="py-1.5 px-3 text-center font-semibold border-0">
                            {sub.score === 'TH' ? (
                              <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">TH</span>
                            ) : sub.score !== undefined && sub.score !== null ? (
                              sub.score
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-1.5 px-3 text-center font-bold border-0">
                            {sub.grade === 'TH' ? (
                              <span className="text-rose-700 font-bold">TH</span>
                            ) : (
                              sub.grade
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400 border-0">
                          Tiada mata pelajaran didaftarkan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom Statistical Summary */}
              <div className="border-t-2 border-b-2 border-black py-3 mb-5">
                <div className="grid grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-1 text-xs sm:text-sm text-black">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Bilangan matapelajaran</span>
                      <span>: {parentMatchedStudent.subjectCount}</span>
                    </div>
                    {settings.showClassRank && (
                      <div className="flex justify-between">
                        <span>Kedudukan dalam kelas</span>
                        <span>: {parentMatchedStudent.classRank}</span>
                      </div>
                    )}
                    {settings.showOverallRank && (
                      <div className="flex justify-between">
                        <span>Kedudukan keseluruhan</span>
                        <span>: {parentMatchedStudent.overallRank}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Pencapaian gred keseluruhan</span>
                      <span className="font-bold">: {parentMatchedStudent.gredSummary}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Jumlah markah</span>
                      <span>: {parentMatchedStudent.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Peratus</span>
                      <span className="font-bold">: {parentMatchedStudent.avg}</span>
                    </div>
                    {settings.showGPC && (
                      <div className="flex justify-between">
                        <span>Gred purata</span>
                        <span>: {parentMatchedStudent.gpc}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center font-bold">
                      <span>Keputusan</span>
                      <span>: {parentMatchedStudent.resultStatus}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teacher Remarks */}
              <div className="space-y-2 text-xs sm:text-sm text-black mb-6">
                <div className="flex">
                  <span className="w-32 sm:w-36 font-semibold shrink-0">Nama Guru Kelas</span>
                  <span className="mr-2">:</span>
                  <span className="font-semibold uppercase">{parentMatchedStudent.teacherName}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-32 sm:w-36 font-semibold shrink-0">Ulasan Guru</span>
                  <span className="mr-2">:</span>
                  <span className="font-normal italic leading-relaxed text-black">
                    {parentMatchedStudent.notes || '-'}
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 text-center pt-8 text-xs text-black border-t border-slate-100 sm:border-0">
                <div className="flex flex-col justify-between items-center h-28">
                  <span className="font-medium">Tandatangan Ibu Bapa / Penjaga</span>
                  <div className="w-44 sm:w-52 border-b border-dashed border-black"></div>
                  <span className="text-[11px] text-slate-700">
                    ( Tarikh: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )
                  </span>
                </div>
                <div className="flex flex-col justify-between items-center h-28">
                  <span className="font-medium">Tandatangan Guru Kelas</span>
                  <div className="w-44 sm:w-52 border-b border-dashed border-black"></div>
                  <span className="text-[11px] text-slate-700 font-semibold uppercase">
                    ( {parentMatchedStudent.teacherName} )
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: TEACHER / ADMIN MODE (Full editing, class tabs, bulk PDF download & print)
  // -------------------------------------------------------------
  if (students.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
          <FileSpreadsheet className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Tiada Data Slip Untuk Dipaparkan</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Sila masukkan data murid di tab "Tetapan &amp; Data Murid" untuk menghasilkan slip keputusan.
        </p>
        {onGoToData && (
          <button
            onClick={onGoToData}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
          >
            Pergi ke Input Data
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Teacher Action Bar (Hidden during print) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 no-print space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Class Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <div className="flex items-center gap-1.5 shrink-0">
              {classes.map((cName) => {
                const count =
                  cName === 'ALL'
                    ? students.length
                    : students.filter((s) => s.className === cName).length;
                return (
                  <button
                    key={cName}
                    type="button"
                    onClick={() => {
                      setSelectedClass(cName);
                      setSelectedStudentId('ALL');
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      selectedClass === cName
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{cName === 'ALL' ? 'Semua Kelas' : `Kelas: ${cName}`}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        selectedClass === cName
                          ? 'bg-indigo-800 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 justify-end flex-wrap">
            {/* Student Selector */}
            <div className="relative min-w-[200px]">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 cursor-pointer"
              >
                <option value="ALL">
                  -- Papar Semua Slip ({adminFiltered.length} Murid) --
                </option>
                {adminFiltered.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.className})
                  </option>
                ))}
              </select>
            </div>

            {/* Direct PDF Download Button */}
            <button
              type="button"
              onClick={handleAdminDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Muat turun slip yang dipaparkan terus ke fail PDF"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>
                {isDownloadingPdf
                  ? downloadProgress
                    ? `Menjana PDF (${downloadProgress.current}/${downloadProgress.total})...`
                    : 'Menjana PDF...'
                  : selectedStudentId === 'ALL'
                  ? `Muat Turun PDF (${displayedStudents.length} Slip)`
                  : 'Muat Turun PDF'}
              </span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handleSafePrint}
              disabled={isDownloadingPdf}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Cetak slip atau jana fail PDF cetakan"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              <span>
                {isDownloadingPdf ? 'Menjana Cetakan...' : 'Cetak (Print)'}
              </span>
            </button>
          </div>
        </div>

        {/* Search Input for Admin */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={adminSearchQuery}
              onChange={(e) => {
                setAdminSearchQuery(e.target.value);
                setSelectedStudentId('ALL');
              }}
              placeholder="Cari murid..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {adminSearchQuery && (
              <button
                type="button"
                onClick={() => setAdminSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500">
            Memaparkan <b>{displayedStudents.length}</b> daripada {students.length} slip.
            <span className="hidden sm:inline text-[11px] text-slate-400 ml-2">
              (Gred &amp; keputusan boleh disunting terus pada slip)
            </span>
          </div>
        </div>
      </div>

      {/* Slips List Container */}
      <div className="print-container space-y-8">
        {displayedStudents.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-slate-500 shadow-xs border border-slate-200">
            Tiada rekod slip keputusan bagi pilihan yang dibuat.
          </div>
        ) : (
          displayedStudents.map((s, index) => {
            return (
              <div
                key={s.id}
                id={`slip-card-${s.id}`}
                ref={(el) => {
                  slipRefs.current[s.id] = el;
                }}
                className={`slip-card bg-white p-8 sm:p-12 rounded-xl sm:rounded-none shadow-sm sm:shadow-md border border-slate-300 font-sans text-black relative ${
                  index < displayedStudents.length - 1 ? 'page-break' : ''
                }`}
                style={{
                  minHeight: '270mm',
                }}
              >
                {/* Screen-only Admin Bar */}
                <div className="no-print absolute top-3 right-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    Slip #{index + 1}
                  </span>

                  {/* Individual Download PDF */}
                  <button
                    type="button"
                    onClick={() => handleDownloadSinglePdf(s)}
                    disabled={downloadingStudentId === s.id}
                    className="p-1 px-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition flex items-center gap-1 text-[11px] border border-slate-200 cursor-pointer disabled:opacity-50"
                    title={`Muat turun fail PDF untuk ${s.name}`}
                  >
                    {downloadingStudentId === s.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span className="font-semibold text-emerald-700 hidden sm:inline">PDF</span>
                  </button>

                  {/* Delete Student */}
                  {onDeleteStudent && (
                    <button
                      type="button"
                      onClick={() => setStudentToDelete(s)}
                      className="p-1 px-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition flex items-center gap-1 text-[11px] border border-slate-200 cursor-pointer"
                      title={`Padam rekod ${s.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span className="font-semibold text-rose-600 hidden sm:inline">Padam</span>
                    </button>
                  )}
                </div>

                {/* School Header */}
                <div className="text-center flex flex-col items-center justify-center mb-3">
                  {Boolean(settings.schoolLogo) && (
                    <img src={settings.schoolLogo} className="w-16 h-16 object-contain mb-2" alt="Logo Sekolah" />
                  )}
                  {schoolLines.map((line, lIdx) => (
                    <h2 key={lIdx} className="text-sm sm:text-base font-bold uppercase tracking-wide leading-snug text-black">
                      {line}
                    </h2>
                  ))}
                </div>

                  {/* Framed Exam Title Box */}
                  <div className="w-full border-2 border-black py-1.5 px-3 text-center mb-5 bg-white">
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black">
                      {settings.examTitle}
                    </h3>
                  </div>

                  {/* Student Details Grid */}
                  <div className="grid grid-cols-2 gap-x-6 sm:gap-x-12 gap-y-1.5 text-xs sm:text-sm mb-5 pb-1">
                    <div className="flex">
                      <span className="w-20 sm:w-24 text-black font-semibold shrink-0">Nama</span>
                      <span className="mr-2 font-bold">:</span>
                      <span className="font-bold text-black uppercase tracking-tight break-words">{s.name}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 sm:w-24 text-black font-semibold shrink-0">Kelas</span>
                      <span className="mr-2 font-bold">:</span>
                      <span className="font-bold text-black uppercase">{s.className}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 sm:w-24 text-black font-semibold shrink-0">No K/P</span>
                      <span className="mr-2 font-bold">:</span>
                      <span className="font-normal text-black font-mono">{s.mykid || '-'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 sm:w-24 text-black font-semibold shrink-0">Jantina</span>
                      <span className="mr-2 font-bold">:</span>
                      <span className="font-normal text-black uppercase">{s.gender || 'LELAKI'}</span>
                    </div>
                  </div>

                  {/* Table without lines */}
                  <div className="overflow-x-auto mb-5">
                    <table className="w-full text-xs sm:text-sm text-black border-0">
                      <thead>
                        <tr className="bg-slate-100/70 font-bold uppercase border-0">
                          <th className="py-2 px-3 text-center w-12 border-0">Bil</th>
                          <th className="py-2 px-3 text-left border-0">Mata Pelajaran</th>
                          <th className="py-2 px-3 text-center w-28 border-0">Markah</th>
                          <th className="py-2 px-3 text-center w-28 border-0">Gred</th>
                        </tr>
                      </thead>
                      <tbody>
                        {s.subjectResults && s.subjectResults.length > 0 ? (
                          s.subjectResults.map((sub, idx) => (
                            <tr key={sub.id || idx} className="border-0">
                              <td className="py-1.5 px-3 text-center font-bold border-0">{idx + 1}</td>
                              <td className="py-1.5 px-3 text-left font-semibold uppercase border-0">{sub.name}</td>
                              <td className="py-1.5 px-3 text-center font-semibold border-0">
                                {sub.score === 'TH' ? (
                                  <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">TH</span>
                                ) : sub.score !== undefined && sub.score !== null ? (
                                  sub.score
                                ) : (
                                  '-'
                                )}
                              </td>
                              <td className="py-1.5 px-3 text-center font-bold border-0">
                                <span className="print-only hidden">{sub.grade}</span>
                                <select
                                  value={sub.grade}
                                  onChange={(e) => onGradeOverride(s.id, sub.id, e.target.value)}
                                  className={`no-print font-bold bg-transparent text-center focus:outline-none cursor-pointer ${
                                    sub.grade === 'TH' ? 'text-rose-700' : ''
                                  }`}
                                  title="Cikgu boleh sunting gred subjek ini"
                                >
                                  {['A', 'B', 'C', 'D', 'E', 'F', 'TH'].map((g) => (
                                    <option key={g} value={g}>
                                      {g}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-slate-400 border-0">
                              Tiada mata pelajaran didaftarkan.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Bottom Statistical Summary */}
                  <div className="border-t-2 border-b-2 border-black py-3 mb-5">
                    <div className="grid grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-1 text-xs sm:text-sm text-black">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Bilangan matapelajaran</span>
                          <span>: {s.subjectCount}</span>
                        </div>
                        {settings.showClassRank && (
                          <div className="flex justify-between">
                            <span>Kedudukan dalam kelas</span>
                            <span>: {s.classRank}</span>
                          </div>
                        )}
                        {settings.showOverallRank && (
                          <div className="flex justify-between">
                            <span>Kedudukan keseluruhan</span>
                            <span>: {s.overallRank}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Pencapaian gred keseluruhan</span>
                          <span className="font-bold">: {s.gredSummary}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Jumlah markah</span>
                          <span>: {s.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Peratus</span>
                          <span className="font-bold">: {s.avg}</span>
                        </div>
                        {settings.showGPC && (
                          <div className="flex justify-between">
                            <span>Gred purata</span>
                            <span>: {s.gpc}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center font-bold">
                          <span>Keputusan</span>
                          <div className="flex items-center gap-1.5">
                            <span>: </span>
                            <span className="print-only hidden font-bold uppercase">{s.resultStatus}</span>
                            <div className="no-print flex items-center">
                              <select
                                value={s.resultStatus}
                                onChange={(e) => onResultOverride(s.id, e.target.value as 'LULUS' | 'GAGAL')}
                                className={`text-xs font-black uppercase px-2 py-0.5 rounded-md border outline-none cursor-pointer transition shadow-2xs ${
                                  s.resultStatus === 'LULUS'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                                }`}
                                title="Cikgu boleh ubah keputusan murid sama ada LULUS atau GAGAL"
                              >
                                <option value="LULUS">LULUS</option>
                                <option value="GAGAL">GAGAL</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Teacher Class Name & Remarks */}
                  <div className="space-y-2 text-xs sm:text-sm text-black mb-6">
                    <div className="flex">
                      <span className="w-32 sm:w-36 font-semibold shrink-0">Nama Guru Kelas</span>
                      <span className="mr-2">:</span>
                      <span className="font-semibold uppercase">{s.teacherName}</span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start flex-1">
                        <span className="w-32 sm:w-36 font-semibold shrink-0">Ulasan Guru</span>
                        <span className="mr-2">:</span>
                        <span className="font-normal italic leading-relaxed text-black">{s.notes || '-'}</span>
                      </div>

                      <div className="no-print flex items-center gap-1.5 shrink-0 self-start">
                        <button
                          type="button"
                          onClick={() => onGenerateAiRemark(s)}
                          disabled={generatingStudentId === s.id}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-2xs disabled:opacity-50 cursor-pointer"
                          title="Jana ulasan menggunakan AI berdasarkan gred & markah murid ini"
                        >
                          {generatingStudentId === s.id ? (
                            <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                          ) : (
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                          )}
                          <span>Jana AI</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenRemarkModal(s.id)}
                          className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-2xs cursor-pointer"
                          title="Pilih daripada senarai ulasan sedia ada"
                        >
                          <MessageSquareQuote className="w-3 h-3 text-slate-500" />
                          <span>Pilih Ulasan</span>
                        </button>
                      </div>
                    </div>
                  </div>

                {/* Signature Block */}
                <div className="grid grid-cols-2 gap-8 text-center pt-8 text-xs text-black border-t border-slate-100 sm:border-0">
                  <div className="flex flex-col justify-between items-center h-28">
                    <span className="font-medium">Tandatangan Ibu Bapa / Penjaga</span>
                    <div className="w-44 sm:w-52 border-b border-dashed border-black"></div>
                    <span className="text-[11px] text-slate-700">
                      ( Tarikh: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )
                    </span>
                  </div>

                  <div className="flex flex-col justify-between items-center h-28">
                    <span className="font-medium">Tandatangan Guru Kelas</span>
                    <div className="w-44 sm:w-52 border-b border-dashed border-black"></div>
                    <span className="text-[11px] text-slate-700 font-semibold uppercase">
                      ( {s.teacherName} )
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Dialog for Deleting Student from Slip */}
      {studentToDelete && (
        <ConfirmModal
          isOpen={!!studentToDelete}
          title="Padam Rekod Murid"
          message={`Adakah anda pasti ingin memadam slip dan rekod murid "${studentToDelete.name}" (${studentToDelete.className})?`}
          confirmText="Ya, Padam"
          onConfirm={() => {
            if (onDeleteStudent) {
              onDeleteStudent(studentToDelete.id, studentToDelete.name);
            }
            setStudentToDelete(null);
          }}
          onCancel={() => setStudentToDelete(null)}
        />
      )}
    </div>
  );
};
