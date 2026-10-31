export type SubjectKey = string;

export interface SubjectInfo {
  id: string;
  name: string;
  code: string;
  key?: string; // backward compat
}

export const DEFAULT_SUBJECTS: SubjectInfo[] = [
  { id: 'bm', name: 'Bahasa Melayu', code: 'BM' },
  { id: 'bi', name: 'Bahasa Inggeris', code: 'BI' },
  { id: 'mt', name: 'Matematik', code: 'MT' },
  { id: 'sn', name: 'Sains', code: 'SN' },
  { id: 'sej', name: 'Sejarah', code: 'SEJ' },
];

export const MALAYSIAN_SUBJECT_PRESETS: { id: string; name: string; code: string }[] = [
  { id: 'pi', name: 'Pendidikan Islam', code: 'PI' },
  { id: 'ba', name: 'Bahasa Arab', code: 'BA' },
  { id: 'pm', name: 'Pendidikan Moral', code: 'PM' },
  { id: 'rbt', name: 'Reka Bentuk & Teknologi', code: 'RBT' },
  { id: 'psv', name: 'Pendidikan Seni Visual', code: 'PSV' },
  { id: 'pjk', name: 'Pendidikan Jasmani & Kesihatan', code: 'PJK' },
  { id: 'mz', name: 'Pendidikan Muzik', code: 'MZ' },
  { id: 'bc', name: 'Bahasa Cina', code: 'BC' },
  { id: 'bt', name: 'Bahasa Tamil', code: 'BT' },
];

// For backward compatibility with existing imports
export const SUBJECTS: SubjectInfo[] = DEFAULT_SUBJECTS;

export interface StudentRow {
  id: string;
  name: string;
  className: string;
  mykid: string;
  gender: 'LELAKI' | 'PEREMPUAN' | string;
  scores?: Record<string, number | 'TH' | ''>;
  bm?: number | 'TH' | '';
  bi?: number | 'TH' | '';
  mt?: number | 'TH' | '';
  sn?: number | 'TH' | '';
  sej?: number | 'TH' | '';
  [key: string]: any;
  teacherName: string;
  notes: string;
  resultOverride?: 'LULUS' | 'GAGAL' | '';
}

export interface GradeScale {
  aMin: number;
  bMin: number;
  cMin: number;
  dMin: number;
  eMin: number;
  fMin: number;
}

export interface ProcessedSubjectResult {
  id: string;
  name: string;
  code: string;
  score: number | 'TH';
  grade: string;
}

export interface ProcessedStudent {
  id: string;
  name: string;
  className: string;
  mykid: string;
  gender: string;
  scores: Record<string, number | 'TH'>;
  grades: Record<string, string>;
  subjectResults: ProcessedSubjectResult[];
  bm?: number | 'TH';
  bi?: number | 'TH';
  mt?: number | 'TH';
  sn?: number | 'TH';
  sej?: number | 'TH';
  bmGrade?: string;
  biGrade?: string;
  mtGrade?: string;
  snGrade?: string;
  sejGrade?: string;
  teacherName: string;
  notes: string;
  subjectCount: number;
  total: number;
  avg: number;
  gpc: string;
  gredSummary: string;
  isPass: boolean;
  resultStatus: 'LULUS' | 'GAGAL';
  classRank: number;
  classTotalCount: number;
  overallRank: number;
  totalStudentsOverall: number;
}

export interface SchoolSettings {
  schoolName: string;
  examTitle: string;
  schoolLogo: string;
  sessionYear: string;
  showClassRank: boolean;
  showOverallRank: boolean;
  showGPC: boolean;
  passingGradeThreshold: 'D' | 'E';
}

export interface SubjectStats {
  id: string;
  key?: string; // backward compat
  name: string;
  code: string;
  totalStudents: number;
  attendedStudents: number;
  thCount: number;
  grades: {
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
    F: number;
    TH: number;
  };
  passCount: number;
  passPercent: number;
  avgScore: number;
  gpmp: number; // Gred Purata Mata Pelajaran
}

export interface ClassStats {
  className: string;
  studentCount: number;
  avgScore: number;
  passCount: number;
  passPercent: number;
  gpcAvg: number;
  topStudent: {
    name: string;
    avg: number;
  } | null;
}

