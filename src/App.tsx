import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Header } from './components/Header';
import { SchoolSettingsCard } from './components/SchoolSettingsCard';
import { SpreadsheetGrid } from './components/SpreadsheetGrid';
import { SlipPreview } from './components/SlipPreview';
import { AnalyticsView } from './components/AnalyticsView';
import { TemplateGuideModal } from './components/TemplateGuideModal';
import { RemarkSelectorModal } from './components/RemarkSelectorModal';
import { ManageSubjectsModal } from './components/ManageSubjectsModal';
import { BulkAddStudentsModal } from './components/BulkAddStudentsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { TeacherLoginModal } from './components/TeacherLoginModal';
import { ShareLinkModal } from './components/ShareLinkModal';
import {
  StudentRow,
  ProcessedStudent,
  SchoolSettings,
  GradeScale,
  SubjectKey,
  SubjectInfo,
  DEFAULT_SUBJECTS,
} from './types';
import {
  DEFAULT_GRADE_SCALE,
  DEFAULT_SCHOOL_SETTINGS,
  SAMPLE_STUDENTS,
  processStudentRows,
  generateSmartRemark,
} from './utils/gradeCalculations';
import {
  subscribeToSchoolData,
  saveSchoolDataToFirestore,
  fetchSchoolDataOnce,
} from './firebase';
import { compressImage } from './utils/imageCompressor';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function App() {
  // Role State: 'parent' (Umum / Ibubapa) or 'admin' (Guru / Pentadbir)
  const [role, setRole] = useState<'parent' | 'admin'>(() => {
    try {
      if (typeof window !== 'undefined') {
        const token = sessionStorage.getItem('guru_auth_token');
        if (token) return 'admin';
      }
    } catch {
      // Fallback
    }
    return 'parent';
  });

  // LocalStorage-backed state with fallbacks
  const [students, setStudents] = useState<StudentRow[]>(() => {
    try {
      const saved = localStorage.getItem('slip_students_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load students from localStorage:', e);
    }
    return SAMPLE_STUDENTS;
  });

  const [settings, setSettings] = useState<SchoolSettings>(() => {
    try {
      const saved = localStorage.getItem('slip_school_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load settings from localStorage:', e);
    }
    return DEFAULT_SCHOOL_SETTINGS;
  });

  const [gradeScale, setGradeScale] = useState<GradeScale>(() => {
    try {
      const saved = localStorage.getItem('slip_grade_scale');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_GRADE_SCALE,
          ...parsed,
          fMin: parsed.fMin !== undefined ? parsed.fMin : 0,
        };
      }
    } catch (e) {
      console.error('Failed to load grade scale from localStorage:', e);
    }
    return DEFAULT_GRADE_SCALE;
  });

  const [gradeOverrides, setGradeOverrides] = useState<Record<string, Record<string, string>>>(
    () => {
      try {
        const saved = localStorage.getItem('slip_grade_overrides');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load overrides from localStorage:', e);
      }
      return {};
    }
  );

  const [resultOverrides, setResultOverrides] = useState<Record<string, 'LULUS' | 'GAGAL'>>(() => {
    try {
      const saved = localStorage.getItem('slip_result_overrides');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load result overrides from localStorage:', e);
    }
    return {};
  });

  const [subjects, setSubjects] = useState<SubjectInfo[]>(() => {
    try {
      const saved = localStorage.getItem('slip_subjects_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load subjects from localStorage:', e);
    }
    return DEFAULT_SUBJECTS;
  });

  const [activeTab, setActiveTab] = useState<'data' | 'slips' | 'analysis' | 'guide'>('slips');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [generatingStudentId, setGeneratingStudentId] = useState<string | null>(null);
  const [isBulkGenerating, setIsBulkGenerating] = useState<boolean>(false);
  const [activeRemarkStudent, setActiveRemarkStudent] = useState<StudentRow | ProcessedStudent | null>(null);
  const [isManageSubjectsOpen, setIsManageSubjectsOpen] = useState(false);
  const [isBulkAddStudentsOpen, setIsBulkAddStudentsOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isTeacherLoginOpen, setIsTeacherLoginOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Server persistence state
  const [isSavingToServer, setIsSavingToServer] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const isFirstRender = useRef(true);

  // Automatically compress oversized logo if carried over from a previous raw upload
  useEffect(() => {
    if (settings.schoolLogo && settings.schoolLogo.length > 40000) {
      compressImage(settings.schoolLogo, 280, 0.8).then((compactLogo) => {
        if (compactLogo && compactLogo.length < settings.schoolLogo.length) {
          setSettings((prev) => ({ ...prev, schoolLogo: compactLogo }));
        }
      });
    }
  }, [settings.schoolLogo]);

  // Real-time synchronization with Cloud Firestore
  useEffect(() => {
    let isSubscribed = true;

    // 1. Subscribe to real-time Cloud Firestore updates
    const unsubscribe = subscribeToSchoolData(
      (data) => {
        if (!isSubscribed || !data) return;

        if (Array.isArray(data.students) && data.students.length > 0) {
          setStudents(data.students);
        }
        if (data.settings && data.settings.schoolName) {
          setSettings(data.settings);
        }
        if (data.gradeScale) {
          setGradeScale(data.gradeScale);
        }
        if (data.gradeOverrides) {
          setGradeOverrides(data.gradeOverrides);
        }
        if (data.resultOverrides) {
          setResultOverrides(data.resultOverrides);
        }
        if (Array.isArray(data.subjects) && data.subjects.length > 0) {
          setSubjects(data.subjects);
        }
        if (data.updatedAt) {
          setLastSavedTime(
            new Date(data.updatedAt).toLocaleTimeString('ms-MY', {
              hour: '2-digit',
              minute: '2-digit',
            })
          );
        }
        setIsInitialLoading(false);
      },
      (error) => {
        console.warn('Real-time listener warning:', error);
      }
    );

    // 2. Initial check & seed if Firestore document is fresh
    fetchSchoolDataOnce().then(async (existing) => {
      if (!existing && isSubscribed) {
        try {
          await saveSchoolDataToFirestore({
            students,
            settings,
            gradeScale,
            gradeOverrides,
            resultOverrides,
            subjects,
          });
        } catch (e) {
          console.warn('Initial seeding error:', e);
        }
      }
      setIsInitialLoading(false);
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, []);

  // Save to Cloud Firestore helper
  const handleSaveToServer = async (manualToast = true, explicitSettings?: SchoolSettings) => {
    setIsSavingToServer(true);
    try {
      const currentSettings = explicitSettings || settings;
      const payload = {
        students,
        settings: currentSettings,
        gradeScale,
        gradeOverrides,
        resultOverrides,
        subjects,
      };

      // Primary: Save directly to Google Cloud Firestore (real-time & persistent across shared links)
      await saveSchoolDataToFirestore(payload);

      try {
        localStorage.setItem('slip_school_settings', JSON.stringify(currentSettings));
      } catch {}

      // Secondary: Backup to server storage
      try {
        await fetch('/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {
        // Non-blocking secondary backup
      }

      setLastSavedTime(
        new Date().toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
      );
      if (manualToast) {
        showToast('Data murid dan tetapan sekolah berjaya disimpan ke Cloud Firestore!');
      }
    } catch (err) {
      console.error('Save to Firestore error:', err);
      if (manualToast) {
        showToast('Gagal menyimpan data ke pangkalan data awan.');
      }
    } finally {
      setIsSavingToServer(false);
    }
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('slip_students_data', JSON.stringify(students));
    } catch (e) {
      console.error('Storage quota exceeded or unavailable:', e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem('slip_subjects_list', JSON.stringify(subjects));
    } catch (e) {
      console.error('Failed to save subjects:', e);
    }
  }, [subjects]);

  useEffect(() => {
    try {
      localStorage.setItem('slip_school_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('slip_grade_scale', JSON.stringify(gradeScale));
    } catch (e) {
      console.error('Failed to save grade scale:', e);
    }
  }, [gradeScale]);

  useEffect(() => {
    try {
      localStorage.setItem('slip_grade_overrides', JSON.stringify(gradeOverrides));
    } catch (e) {
      console.error('Failed to save grade overrides:', e);
    }
  }, [gradeOverrides]);

  useEffect(() => {
    try {
      localStorage.setItem('slip_result_overrides', JSON.stringify(resultOverrides));
    } catch (e) {
      console.error('Failed to save result overrides:', e);
    }
  }, [resultOverrides]);

  // Debounced auto-save to server when teacher makes changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (role !== 'admin') return;

    const timer = setTimeout(() => {
      handleSaveToServer(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [students, settings, gradeScale, gradeOverrides, resultOverrides, subjects, role]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Process students in real-time
  const processedStudents = useMemo(() => {
    return processStudentRows(students, subjects, gradeScale, gradeOverrides, resultOverrides);
  }, [students, subjects, gradeScale, gradeOverrides, resultOverrides]);

  const handleDeleteStudent = (studentId: string, studentName?: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setGradeOverrides((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
    setResultOverrides((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
    showToast(`Murid ${studentName ? `"${studentName}"` : ''} berjaya dipadam.`);
  };

  const handleBulkAddStudents = (newStudents: StudentRow[]) => {
    setStudents((prev) => [...prev, ...newStudents]);
    showToast(`Berjaya menambah ${newStudents.length} orang murid baharu!`);
  };

  const handleGradeOverride = (studentId: string, subject: SubjectKey, newGrade: string) => {
    setGradeOverrides((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subject]: newGrade,
      },
    }));
    showToast(`Gred ${subject.toUpperCase()} dikemaskini kepada ${newGrade}.`);
  };

  const handleResultOverride = (studentId: string, newResult: 'LULUS' | 'GAGAL') => {
    setResultOverrides((prev) => ({
      ...prev,
      [studentId]: newResult,
    }));
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, resultOverride: newResult } : s))
    );
    showToast(`Keputusan murid dikemaskini kepada: ${newResult}`);
  };

  // AI remark generation for single student
  const handleGenerateAiRemark = async (student: StudentRow | ProcessedStudent) => {
    setGeneratingStudentId(student.id);
    const proc = processedStudents.find((s) => s.id === student.id) || student;
    try {
      const res = await fetch('/api/generate-remark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student: proc }),
      });

      let generatedRemark = '';
      if (res.ok) {
        const data = await res.json();
        if (data.remark && typeof data.remark === 'string') {
          generatedRemark = data.remark.trim();
        }
      }

      // Offline / network fallback to intelligent rule-based generator
      if (!generatedRemark) {
        generatedRemark = generateSmartRemark(proc as any);
      }

      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, notes: generatedRemark } : s))
      );
      showToast(`✨ Ulasan AI berjaya dijana untuk ${student.name || 'murid'}!`);
    } catch {
      const fallbackRemark = generateSmartRemark(proc as any);
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, notes: fallbackRemark } : s))
      );
      showToast(`✨ Ulasan pintar berjaya dijana untuk ${student.name || 'murid'}!`);
    } finally {
      setGeneratingStudentId(null);
    }
  };

  // Bulk AI remark generation for all students
  const handleBulkGenerateAiRemarks = async () => {
    if (students.length === 0) return;
    setIsBulkGenerating(true);
    try {
      const res = await fetch('/api/generate-bulk-remarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: processedStudents }),
      });

      let remarksMap: Record<string, string> = {};
      if (res.ok) {
        const data = await res.json();
        if (data.remarks && typeof data.remarks === 'object') {
          remarksMap = data.remarks;
        }
      }

      setStudents((prev) =>
        prev.map((s) => {
          const proc = processedStudents.find((p) => p.id === s.id);
          const aiRemark = remarksMap[s.id] || (proc ? generateSmartRemark(proc) : s.notes);
          return {
            ...s,
            notes: aiRemark || s.notes,
          };
        })
      );
      showToast(`✨ Berjaya menjana ulasan AI untuk ${students.length} murid secara serentak!`);
    } catch {
      setStudents((prev) =>
        prev.map((s) => {
          const proc = processedStudents.find((p) => p.id === s.id);
          return {
            ...s,
            notes: proc ? generateSmartRemark(proc) : s.notes,
          };
        })
      );
      showToast(`✨ Ulasan pintar berjaya dijana untuk kesemua ${students.length} murid!`);
    } finally {
      setIsBulkGenerating(false);
    }
  };

  const handleSelectRemark = (remark: string) => {
    if (activeRemarkStudent) {
      setStudents((prev) =>
        prev.map((s) => (s.id === activeRemarkStudent.id ? { ...s, notes: remark } : s))
      );
      showToast('Ulasan guru telah dikemaskini.');
    }
  };

  const handlePrint = () => {
    setActiveTab('slips');
    showToast('Membuka bahagian slip. Sila klik butang Cetak atau Muat Turun PDF.');
    try {
      window.print();
    } catch (e) {
      // Handled inside iframe
    }
  };

  const handleExportAllExcel = () => {
    if (processedStudents.length === 0) {
      showToast('Tiada data murid untuk dieksport.');
      return;
    }

    const data = processedStudents.map((s, idx) => {
      const row: any = {
        'Bil / Ked': idx + 1,
        'Nama Murid': s.name,
        Kelas: s.className,
        'No. K/P': s.mykid,
        Jantina: s.gender,
      };

      if (s.subjectResults && s.subjectResults.length > 0) {
        s.subjectResults.forEach((sub) => {
          row[`${sub.name} (Markah)`] = sub.score;
          row[`${sub.name} (Gred)`] = sub.grade;
        });
      } else {
        subjects.forEach((sub) => {
          row[`${sub.name} (Markah)`] = s.scores?.[sub.id] ?? (s as any)[sub.id] ?? '';
          row[`${sub.name} (Gred)`] = s.grades?.[sub.id] ?? 'F';
        });
      }

      row['Jumlah Markah'] = s.total;
      row['Peratus (%)'] = s.avg;
      row['Gred Purata (GPC)'] = s.gpc;
      row['Pencapaian Gred'] = s.gredSummary;
      row['Kedudukan Kelas'] = s.classRank;
      row['Kedudukan Keseluruhan'] = s.overallRank;
      row['Keputusan'] = s.resultStatus;
      row['Nama Guru Kelas'] = s.teacherName;
      row['Ulasan Guru'] = s.notes;
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Keputusan_Penuh');
    XLSX.writeFile(wb, 'Keputusan_Pentaksiran_Sekolah_Rendah.xlsx');
    showToast('Fail Excel keputusan berjaya dimuat turun!');
  };

  const handleLoadSample = () => {
    setStudents(SAMPLE_STUDENTS);
    setGradeOverrides({});
    setResultOverrides({});
    showToast('Data contoh murid berjaya dimuatkan ke dalam sistem!');
  };

  const handleClearData = () => {
    setIsClearConfirmOpen(true);
  };

  const executeClearData = () => {
    setStudents([
      {
        id: `student_${Date.now()}`,
        name: '',
        className: '3 BESTARI',
        mykid: '',
        gender: 'LELAKI',
        scores: {},
        bm: '',
        bi: '',
        mt: '',
        sn: '',
        sej: '',
        teacherName: 'GURU KELAS',
        notes: '',
      },
    ]);
    setGradeOverrides({});
    setResultOverrides({});
    setIsClearConfirmOpen(false);
    showToast('Jadual data telah dikosongkan.');
  };

  const handleProcessData = () => {
    setActiveTab('slips');
    showToast(`Berjaya memproses ${processedStudents.length} rekod slip murid!`);
  };

  const handleTeacherLoginSuccess = () => {
    setRole('admin');
    setActiveTab('data');
    showToast('Log masuk guru berjaya! Semua fungsi pentadbir dibuka.');
  };

  const handleTeacherLogout = () => {
    sessionStorage.removeItem('guru_auth_token');
    setRole('parent');
    setActiveTab('slips');
    showToast('Sesi guru dikunci. Anda kini berada dalam Mod Paparan Umum (Ibubapa).');
  };

  const existingClasses = Array.from(new Set(students.map((s) => s.className).filter(Boolean)));
  if (existingClasses.length === 0) existingClasses.push('3 BESTARI');

  return (
    <div className="text-slate-800 min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Top Header with Role & Sync Status */}
      <Header
        role={role}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTeacherLogin={() => setIsTeacherLoginOpen(true)}
        onTeacherLogout={handleTeacherLogout}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onPrint={handlePrint}
        onExportExcel={handleExportAllExcel}
        onSaveToServer={() => handleSaveToServer(true)}
        isSavingToServer={isSavingToServer}
        lastSavedTime={lastSavedTime}
        studentCount={students.filter((s) => s.name.trim() !== '').length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: DATA INPUT & SETTINGS (Admin Guru Only) */}
        {role === 'admin' && activeTab === 'data' && (
          <div className="space-y-6">
            <SchoolSettingsCard
              settings={settings}
              setSettings={setSettings}
              gradeScale={gradeScale}
              setGradeScale={setGradeScale}
              subjects={subjects}
              setSubjects={setSubjects}
              onOpenManageSubjects={() => setIsManageSubjectsOpen(true)}
              onSaveNotice={(updated) => handleSaveToServer(false, updated)}
            />

            <SpreadsheetGrid
              students={students}
              setStudents={setStudents}
              subjects={subjects}
              setSubjects={setSubjects}
              onOpenManageSubjects={() => setIsManageSubjectsOpen(true)}
              onOpenBulkAddStudents={() => setIsBulkAddStudentsOpen(true)}
              onProcess={handleProcessData}
              onLoadSample={handleLoadSample}
              onClear={handleClearData}
              onShowGuide={() => setActiveTab('guide')}
              onGenerateAiRemark={handleGenerateAiRemark}
              onBulkGenerateAiRemarks={handleBulkGenerateAiRemarks}
              generatingRowId={generatingStudentId}
              isBulkGenerating={isBulkGenerating}
            />
          </div>
        )}

        {/* TAB 2: SLIP PREVIEW (Accessible to Both Ibubapa and Guru) */}
        {activeTab === 'slips' && (
          <SlipPreview
            role={role}
            students={processedStudents}
            settings={settings}
            onGradeOverride={handleGradeOverride}
            onResultOverride={handleResultOverride}
            onGenerateAiRemark={handleGenerateAiRemark}
            onOpenRemarkModal={(id) => {
              const s = processedStudents.find((p) => p.id === id);
              if (s) setActiveRemarkStudent(s);
            }}
            onDeleteStudent={role === 'admin' ? handleDeleteStudent : undefined}
            generatingStudentId={generatingStudentId}
            onPrint={handlePrint}
            onGoToData={role === 'admin' ? () => setActiveTab('data') : undefined}
          />
        )}

        {/* TAB 3: ANALYSIS (Admin Guru Only) */}
        {role === 'admin' && activeTab === 'analysis' && (
          <AnalyticsView
            students={processedStudents}
            settings={settings}
            subjects={subjects}
            onGoToData={() => setActiveTab('data')}
          />
        )}

        {/* TAB 4: TEMPLATE & GUIDE (Admin Guru Only) */}
        {role === 'admin' && activeTab === 'guide' && (
          <TemplateGuideModal
            onLoadSample={() => {
              handleLoadSample();
              setActiveTab('data');
            }}
            onGoToData={() => setActiveTab('data')}
          />
        )}
      </main>

      {/* Modal: Teacher Login Passcode */}
      <TeacherLoginModal
        isOpen={isTeacherLoginOpen}
        onClose={() => setIsTeacherLoginOpen(false)}
        onLoginSuccess={handleTeacherLoginSuccess}
      />

      {/* Modal: Share Link with Server Persistence Notice */}
      <ShareLinkModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        studentCount={students.filter((s) => s.name.trim() !== '').length}
        schoolName={settings.schoolName}
      />

      {/* Modal: Reusable Remark Selector & AI Generator */}
      <RemarkSelectorModal
        isOpen={!!activeRemarkStudent}
        onClose={() => setActiveRemarkStudent(null)}
        student={activeRemarkStudent}
        onSelectRemark={handleSelectRemark}
        onGenerateAiRemark={handleGenerateAiRemark}
        isGenerating={generatingStudentId === activeRemarkStudent?.id}
      />

      {/* Modal: Manage Subjects */}
      <ManageSubjectsModal
        isOpen={isManageSubjectsOpen}
        onClose={() => setIsManageSubjectsOpen(false)}
        subjects={subjects}
        setSubjects={setSubjects}
        onSubjectsUpdated={(msg) => showToast(msg)}
      />

      {/* Modal: Bulk Add Students */}
      <BulkAddStudentsModal
        isOpen={isBulkAddStudentsOpen}
        onClose={() => setIsBulkAddStudentsOpen(false)}
        existingClasses={existingClasses}
        defaultTeacherName={students[0]?.teacherName || 'GURU KELAS'}
        onAddStudents={handleBulkAddStudents}
      />

      {/* Modal: Confirm Clear All Data */}
      <ConfirmModal
        isOpen={isClearConfirmOpen}
        title="Kosongkan Semua Data Murid"
        message="Adakah anda pasti ingin mengosongkan semua data murid dalam jadual? Tindakan ini tidak boleh diundur."
        confirmText="Ya, Kosongkan"
        confirmVariant="danger"
        onConfirm={executeClearData}
        onCancel={() => setIsClearConfirmOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-medium animate-fadeIn border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer (Hidden on print) */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto no-print text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Penjana Slip Pentaksiran Sekolah Rendah. Format Rasmi Cetakan A4.</p>
          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span>Sesuai untuk PBD, Ujian Sumatif, UASA &amp; Peperiksaan Akhir Tahun</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
