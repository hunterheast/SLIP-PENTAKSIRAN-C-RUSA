import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Users,
  BookOpen,
  Trophy,
  Award,
  TrendingUp,
  BarChart2,
  PieChart,
  Table as TableIcon,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { ProcessedStudent, SchoolSettings, SubjectInfo, DEFAULT_SUBJECTS } from '../types';
import { computeClassStats, computeSubjectStats } from '../utils/gradeCalculations';

interface AnalyticsViewProps {
  students: ProcessedStudent[];
  settings: SchoolSettings;
  subjects?: SubjectInfo[];
  onGoToData: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  students,
  settings,
  subjects = DEFAULT_SUBJECTS,
  onGoToData,
}) => {
  const [subTab, setSubTab] = useState<'class' | 'subject'>('class');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');

  const classStats = computeClassStats(students);
  const subjectStats = computeSubjectStats(students, subjects);

  const classes = ['ALL', ...classStats.map((c) => c.className)];

  const filteredStudents =
    selectedClassFilter === 'ALL'
      ? [...students].sort((a, b) => b.avg - a.avg)
      : students.filter((s) => s.className === selectedClassFilter).sort((a, b) => b.avg - a.avg);

  // Overall School Statistics
  const totalStudents = students.length;
  const overallAverage =
    totalStudents > 0
      ? (students.reduce((acc, s) => acc + s.avg, 0) / totalStudents).toFixed(1)
      : '0.0';
  const overallPassCount = students.filter((s) => s.isPass).length;
  const overallPassRate =
    totalStudents > 0 ? ((overallPassCount / totalStudents) * 100).toFixed(1) : '0.0';

  // Export Class Ranking Table to Excel
  const exportClassExcel = () => {
    const data = filteredStudents.map((s, idx) => {
      const rowObj: any = {
        Kedudukan: idx + 1,
        'Nama Murid': s.name,
        Kelas: s.className,
        'No. K/P': s.mykid,
        Jantina: s.gender,
      };

      if (s.subjectResults && s.subjectResults.length > 0) {
        s.subjectResults.forEach((sub) => {
          rowObj[`${sub.name} (${sub.code})`] = `${sub.score} (${sub.grade})`;
        });
      } else {
        subjects.forEach((sub) => {
          const score = s.scores?.[sub.id] ?? (s as any)[sub.id] ?? 0;
          const grade = s.grades?.[sub.id] ?? 'F';
          rowObj[`${sub.name} (${sub.code})`] = `${score} (${grade})`;
        });
      }

      rowObj['Jumlah Markah'] = s.total;
      rowObj['Purata (%)'] = s.avg;
      rowObj['Gred Purata (GPC)'] = s.gpc;
      rowObj['Pencapaian Gred'] = s.gredSummary;
      rowObj['Keputusan'] = s.resultStatus;
      return rowObj;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Analisis_Kedudukan');
    XLSX.writeFile(
      wb,
      `Analisis_Kedudukan_${selectedClassFilter === 'ALL' ? 'Keseluruhan' : selectedClassFilter}.xlsx`
    );
  };

  // Export Subject Table to Excel
  const exportSubjectExcel = () => {
    const data = subjectStats.map((st) => ({
      'Mata Pelajaran': st.name,
      'Bil. Calon': st.totalStudents,
      'Tidak Hadir (TH)': st.thCount,
      'Gred A': st.grades.A,
      'Gred B': st.grades.B,
      'Gred C': st.grades.C,
      'Gred D': st.grades.D,
      'Gred E': st.grades.E,
      'Gred F': st.grades.F,
      'Bil. Lulus': st.passCount,
      '% Lulus': `${st.passPercent}%`,
      'Purata Markah (%)': `${st.avgScore}%`,
      GPMP: st.gpmp,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Analisis_Subjek');
    XLSX.writeFile(wb, 'Analisis_Mata_Pelajaran.xlsx');
  };

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
          <BarChart2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Tiada Data Untuk Dianalisis</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Sila masukkan data murid di tab "Input Data Pukal" untuk menjana analisis kelas, kedudukan murid dan taburan gred mengikut subjek.
        </p>
        <button
          onClick={onGoToData}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
        >
          Pergi ke Input Data
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3 no-print">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setSubTab('class')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-2 ${
              subTab === 'class'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Analisis Mengikut Kelas</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('subject')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-2 ${
              subTab === 'subject'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Analisis Mengikut Subjek</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {subTab === 'class' ? (
            <button
              onClick={exportClassExcel}
              className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Eksport Kedudukan Excel
            </button>
          ) : (
            <button
              onClick={exportSubjectExcel}
              className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Eksport Analisis Subjek
            </button>
          )}

          <button
            onClick={() => {
              try {
                window.print();
              } catch (e) {
                // Handled in iframe
              }
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Laporan
          </button>
        </div>
      </div>

      {/* OVERALL KPI CARDS (VISIBLE ON BOTH VIEWS) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase">
            Jumlah Calon Keseluruhan
          </span>
          <span className="text-2xl font-black text-indigo-700 mt-1 block">
            {totalStudents} <span className="text-xs font-normal text-slate-500">orang</span>
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase">
            Purata Markah Keseluruhan
          </span>
          <span className="text-2xl font-black text-indigo-700 mt-1 block">
            {overallAverage}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase">
            Peratus Lulus Keseluruhan
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {overallPassRate}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase">
            Bilangan Kelas Terlibat
          </span>
          <span className="text-2xl font-black text-slate-800 mt-1 block">
            {classStats.length} <span className="text-xs font-normal text-slate-500">kelas</span>
          </span>
        </div>
      </div>

      {/* SUB-TAB 1: ANALISIS MENGIKUT KELAS */}
      {subTab === 'class' && (
        <div className="space-y-6">
          {/* Class Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classStats.map((c) => (
              <div
                key={c.className}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-base">{c.className}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Murid Terbaik: <b className="text-indigo-900">{c.topStudent?.name || '-'}</b>
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                      {c.studentCount} Murid
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        Purata
                      </span>
                      <span className="text-base font-black text-indigo-700">{c.avgScore}%</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        % Lulus
                      </span>
                      <span className="text-base font-black text-emerald-600">
                        {c.passPercent}%
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        GPC
                      </span>
                      <span className="text-base font-black text-slate-700">{c.gpcAvg}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Bil. Lulus: <b className="text-emerald-700">{c.passCount}</b></span>
                  <span>Bil. Gagal: <b className="text-rose-700">{c.studentCount - c.passCount}</b></span>
                </div>
              </div>
            ))}
          </div>

          {/* Student Ranking Leaderboard Table */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Kedudukan & Rumusan Murid
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Pilih Kelas:</span>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => setSelectedClassFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="ALL">Semua Kelas ({students.length} Murid)</option>
                  {classStats.map((c) => (
                    <option key={c.className} value={c.className}>
                      Kelas: {c.className} ({c.studentCount} Murid)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[500px]">
              <table className="w-full text-left text-xs text-slate-700 border-collapse min-w-[950px]">
                <thead className="sticky top-0 bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-300 select-none shadow-2xs">
                  <tr>
                    <th className="p-3 text-center w-12 bg-slate-200/80">Ked.</th>
                    <th className="p-3 min-w-[180px]">Nama Murid</th>
                    <th className="p-3 w-28">Kelas</th>
                    {subjects.map((sub) => (
                      <th key={sub.id} className="p-3 text-center w-16 bg-slate-100">
                        {sub.code}
                      </th>
                    ))}
                    <th className="p-3 text-center w-24">Jumlah</th>
                    <th className="p-3 text-center w-24">Purata (%)</th>
                    <th className="p-3 text-center w-20">GPC</th>
                    <th className="p-3 text-center w-24">Pencapaian</th>
                    <th className="p-3 text-center w-24">Keputusan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s, idx) => {
                    const isTop3 = idx < 3;
                    return (
                      <tr
                        key={s.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          idx === 0
                            ? 'bg-amber-50/30'
                            : idx === 1
                            ? 'bg-slate-50/50'
                            : idx === 2
                            ? 'bg-orange-50/20'
                            : ''
                        }`}
                      >
                        <td className="p-3 text-center font-bold">
                          {isTop3 ? (
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                                idx === 0
                                  ? 'bg-amber-400 text-amber-950'
                                  : idx === 1
                                  ? 'bg-slate-300 text-slate-800'
                                  : 'bg-amber-600 text-white'
                              }`}
                            >
                              {idx + 1}
                            </span>
                          ) : (
                            <span className="text-slate-400">{idx + 1}</span>
                          )}
                        </td>
                        <td className="p-3 font-semibold text-slate-800 uppercase">
                          {s.name}
                        </td>
                        <td className="p-3 font-medium text-slate-600">{s.className}</td>
                        {subjects.map((sub) => {
                          const found = s.subjectResults?.find((r) => r.id === sub.id || r.code === sub.code);
                          const score = found ? found.score : (s.scores?.[sub.id] ?? (s as any)[sub.id] ?? 0);
                          const grade = found ? found.grade : (s.grades?.[sub.id] ?? 'F');
                          const isTH = score === 'TH' || grade === 'TH';
                          return (
                            <td key={sub.id} className="p-3 text-center font-medium">
                              {isTH ? (
                                <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[11px]">
                                  TH
                                </span>
                              ) : (
                                <>
                                  {score} <span className="text-[10px] text-slate-400 font-bold">({grade})</span>
                                </>
                              )}
                            </td>
                          );
                        })}
                        <td className="p-3 text-center font-bold text-slate-900">{s.total}</td>
                        <td className="p-3 text-center font-black text-indigo-700">
                          {s.avg}%
                        </td>
                        <td className="p-3 text-center font-medium text-slate-700">{s.gpc}</td>
                        <td className="p-3 text-center font-semibold text-slate-800">
                          {s.gredSummary}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              s.isPass
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {s.resultStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ANALISIS MENGIKUT SUBJEK */}
      {subTab === 'subject' && (
        <div className="space-y-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visual Grade Distribution Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-indigo-600" />
                  Taburan Gred Mengikut Subjek (A, B, C, D, E, F)
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Visual peratusan dan pecahan bilangan murid yang mendapat setiap gred.
                </p>

                {/* Stacked Percentage Bars per Subject */}
                <div className="space-y-4">
                  {subjectStats.map((st) => {
                    const total = st.totalStudents || 1;
                    const pA = (st.grades.A / total) * 100;
                    const pB = (st.grades.B / total) * 100;
                    const pC = (st.grades.C / total) * 100;
                    const pD = (st.grades.D / total) * 100;
                    const pE = (st.grades.E / total) * 100;
                    const pF = (st.grades.F / total) * 100;

                    return (
                      <div key={st.key} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">{st.name}</span>
                          <span className="text-[11px] text-slate-500">
                            {st.grades.A}A · {st.grades.B}B · {st.grades.C}C · {st.grades.D}D · {st.grades.E}E · {st.grades.F}F{st.thCount > 0 ? ` · ${st.thCount}TH` : ''}
                          </span>
                        </div>
                        <div className="w-full h-5 bg-slate-100 rounded-md overflow-hidden flex shadow-2xs">
                          {pA > 0 && (
                            <div
                              style={{ width: `${pA}%` }}
                              className="bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center transition-all"
                              title={`Gred A: ${st.grades.A} murid (${pA.toFixed(1)}%)`}
                            >
                              {pA > 8 ? `${st.grades.A}` : ''}
                            </div>
                          )}
                          {pB > 0 && (
                            <div
                              style={{ width: `${pB}%` }}
                              className="bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center transition-all"
                              title={`Gred B: ${st.grades.B} murid (${pB.toFixed(1)}%)`}
                            >
                              {pB > 8 ? `${st.grades.B}` : ''}
                            </div>
                          )}
                          {pC > 0 && (
                            <div
                              style={{ width: `${pC}%` }}
                              className="bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center transition-all"
                              title={`Gred C: ${st.grades.C} murid (${pC.toFixed(1)}%)`}
                            >
                              {pC > 8 ? `${st.grades.C}` : ''}
                            </div>
                          )}
                          {pD > 0 && (
                            <div
                              style={{ width: `${pD}%` }}
                              className="bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center transition-all"
                              title={`Gred D: ${st.grades.D} murid (${pD.toFixed(1)}%)`}
                            >
                              {pD > 8 ? `${st.grades.D}` : ''}
                            </div>
                          )}
                          {pE > 0 && (
                            <div
                              style={{ width: `${pE}%` }}
                              className="bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center transition-all"
                              title={`Gred E: ${st.grades.E} murid (${pE.toFixed(1)}%)`}
                            >
                              {pE > 8 ? `${st.grades.E}` : ''}
                            </div>
                          )}
                          {pF > 0 && (
                            <div
                              style={{ width: `${pF}%` }}
                              className="bg-purple-700 text-white text-[10px] font-bold flex items-center justify-center transition-all"
                              title={`Gred F: ${st.grades.F} murid (${pF.toFixed(1)}%)`}
                            >
                              {pF > 8 ? `${st.grades.F}` : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100 text-[11px] font-semibold mt-4 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500"></span> Gred A
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-500"></span> Gred B
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500"></span> Gred C
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-orange-500"></span> Gred D
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-500"></span> Gred E
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-purple-700"></span> Gred F
                </span>
              </div>
            </div>

            {/* Subject Average Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-600" />
                  Purata Markah (%) Mengikut Subjek
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Perbandingan pencapaian purata skor setiap mata pelajaran.
                </p>

                <div className="space-y-4 pt-1">
                  {subjectStats.map((st) => (
                    <div key={st.key} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700">{st.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-emerald-600">
                            {st.passPercent}% Lulus
                          </span>
                          <span className="font-extrabold text-indigo-700">{st.avgScore}%</span>
                        </div>
                      </div>
                      <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(st.avgScore, 100)}%` }}
                          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
                <span className="font-medium">Subjek Tertinggi:</span>
                <span className="font-bold">
                  {[...subjectStats].sort((a, b) => b.avgScore - a.avgScore)[0]?.name || '-'} (
                  {[...subjectStats].sort((a, b) => b.avgScore - a.avgScore)[0]?.avgScore || 0}%)
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Subject Analysis Table */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-indigo-600" />
              Jadual Analisis Pencapaian Mata Pelajaran (GPMP & Kelulusan)
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 border-collapse min-w-[750px]">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-3">Mata Pelajaran</th>
                    <th className="p-3 text-center">Bil. Calon</th>
                    <th className="p-3 text-center text-rose-700" title="Tidak Hadir">TH</th>
                    <th className="p-3 text-center text-emerald-700">A</th>
                    <th className="p-3 text-center text-blue-700">B</th>
                    <th className="p-3 text-center text-amber-700">C</th>
                    <th className="p-3 text-center text-orange-700">D</th>
                    <th className="p-3 text-center text-rose-700">E</th>
                    <th className="p-3 text-center text-purple-700">F</th>
                    <th className="p-3 text-center">Bil. Lulus</th>
                    <th className="p-3 text-center text-emerald-700">% Lulus</th>
                    <th className="p-3 text-center text-indigo-700">Purata (%)</th>
                    <th className="p-3 text-center">GPMP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjectStats.map((st) => (
                    <tr key={st.key} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-800">{st.name}</td>
                      <td className="p-3 text-center text-slate-600 font-semibold">
                        {st.totalStudents}
                      </td>
                      <td className="p-3 text-center font-bold text-rose-700">
                        {st.thCount > 0 ? (
                          <span className="bg-rose-50 px-1.5 py-0.5 rounded font-black">{st.thCount}</span>
                        ) : (
                          '0'
                        )}
                      </td>
                      <td className="p-3 text-center font-bold text-emerald-600">{st.grades.A}</td>
                      <td className="p-3 text-center font-bold text-blue-600">{st.grades.B}</td>
                      <td className="p-3 text-center font-bold text-amber-600">{st.grades.C}</td>
                      <td className="p-3 text-center font-bold text-orange-600">{st.grades.D}</td>
                      <td className="p-3 text-center font-bold text-rose-600">{st.grades.E}</td>
                      <td className="p-3 text-center font-bold text-purple-700">{st.grades.F}</td>
                      <td className="p-3 text-center font-bold text-slate-800">{st.passCount}</td>
                      <td className="p-3 text-center font-black text-emerald-600">
                        {st.passPercent}%
                      </td>
                      <td className="p-3 text-center font-black text-indigo-700">
                        {st.avgScore}%
                      </td>
                      <td className="p-3 text-center font-bold text-slate-700">{st.gpmp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
