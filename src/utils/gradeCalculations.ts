import {
  GradeScale,
  ProcessedStudent,
  StudentRow,
  SUBJECTS,
  SubjectStats,
  ClassStats,
  SubjectInfo,
  DEFAULT_SUBJECTS,
} from '../types';

export const DEFAULT_GRADE_SCALE: GradeScale = {
  aMin: 80,
  bMin: 65,
  cMin: 50,
  dMin: 40,
  eMin: 20,
  fMin: 0,
};

export const DEFAULT_SCHOOL_SETTINGS = {
  schoolName: 'SEKOLAH KEBANGSAAN SI-RUSA\nPERSIARAN PAHLAWAN, PORT DICKSON',
  examTitle: 'SLIP KEPUTUSAN PENTAKSIRAN TAHUN 3',
  schoolLogo: '',
  sessionYear: 'SESI 2026/2027',
  showClassRank: true,
  showOverallRank: true,
  showGPC: true,
  passingGradeThreshold: 'D' as const, // D and above considered lulus
};

export const SAMPLE_STUDENTS: StudentRow[] = [
  {
    id: '1',
    name: 'Ahmad Ammar Bin Zulkifli',
    className: '3 BESTARI',
    mykid: '140304085543',
    gender: 'LELAKI',
    bm: 88,
    bi: 82,
    mt: 95,
    sn: 90,
    sej: 86,
    teacherName: 'PN. NORAINI BINTI HASNAN',
    notes: 'Pencapaian cemerlang. Teruskan komitmen dan disiplin yang terpuji ini.',
  },
  {
    id: '2',
    name: 'Nur Aishah Binti Rosli',
    className: '3 BESTARI',
    mykid: '140712086654',
    gender: 'PEREMPUAN',
    bm: 94,
    bi: 90,
    mt: 98,
    sn: 92,
    sej: 91,
    teacherName: 'PN. NORAINI BINTI HASNAN',
    notes: 'Pencapaian amat membanggakan dan sentiasa bersikap proaktif di dalam kelas.',
  },
  {
    id: '3',
    name: 'Muhammad Danish Bin Hafiz',
    className: '3 BESTARI',
    mykid: '140111081123',
    gender: 'LELAKI',
    bm: 68,
    bi: 72,
    mt: 54,
    sn: 60,
    sej: 65,
    teacherName: 'PN. NORAINI BINTI HASNAN',
    notes: 'Perlu lebih banyak bimbingan dan latihan tubi terutamanya bagi subjek Matematik.',
  },
  {
    id: '4',
    name: 'Siti Khadijah Binti Azman',
    className: '3 BESTARI',
    mykid: '140909087788',
    gender: 'PEREMPUAN',
    bm: 75,
    bi: 80,
    mt: 82,
    sn: 79,
    sej: 85,
    teacherName: 'PN. NORAINI BINTI HASNAN',
    notes: 'Menunjukkan peningkatan yang konsisten dan positif. Tahniah & syabas!',
  },
  {
    id: '5',
    name: 'Lim Wei Xiang',
    className: '3 CERDAS',
    mykid: '140405089912',
    gender: 'LELAKI',
    bm: 82,
    bi: 85,
    mt: 90,
    sn: 84,
    sej: 78,
    teacherName: 'EN. RAZAK BIN HARUN',
    notes: 'Seorang murid yang rajin, berdedikasi dan sentiasa fokus semasa sesi PdP.',
  },
  {
    id: '6',
    name: 'Muhammad Harith Bin Yusof',
    className: '3 CERDAS',
    mykid: '140228084433',
    gender: 'LELAKI',
    bm: 62,
    bi: 58,
    mt: 65,
    sn: 60,
    sej: 70,
    teacherName: 'EN. RAZAK BIN HARUN',
    notes: 'Mempunyai potensi besar untuk meraih keputusan lebih cemerlang jika melipatgandakan usaha.',
  },
  {
    id: '7',
    name: 'Kavitha A/P Subramaniam',
    className: '3 CERDAS',
    mykid: '140815082244',
    gender: 'PEREMPUAN',
    bm: 86,
    bi: 94,
    mt: 88,
    sn: 85,
    sej: 90,
    teacherName: 'EN. RAZAK BIN HARUN',
    notes: 'Prestasi cemerlang dalam semua subjek. Sikap kepimpinan yang terpuji.',
  },
  {
    id: '8',
    name: 'Wan Muhammad Faiz Bin Wan Razali',
    className: '3 CERDAS',
    mykid: '141020083311',
    gender: 'LELAKI',
    bm: 38,
    bi: 28,
    mt: 18,
    sn: 25,
    sej: 35,
    teacherName: 'EN. RAZAK BIN HARUN',
    notes: 'Perlu bimbingan rapi daripada guru dan pemantauan kerja rumah di rumah.',
  },
];

export interface RemarkCategory {
  title: string;
  badge: string;
  badgeBg: string;
  textColor: string;
  remarks: string[];
}

export const CATEGORIZED_REMARKS: RemarkCategory[] = [
  {
    title: 'Pencapaian Cemerlang (Gred A)',
    badge: 'Cemerlang',
    badgeBg: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    remarks: [
      'Pencapaian cemerlang dalam semua mata pelajaran. Kekalkan iltizam dan disiplin terbaik ini.',
      'Prestasi akademik yang amat membanggakan, sentiasa proaktif dan menjadi contoh teladan di dalam kelas.',
      'Tahniah atas kejayaan yang membanggakan. Teruskan usaha gigih anda ke peringkat seterusnya.',
      'Memiliki daya pemikiran kritis yang tinggi serta tekun dalam menyempurnakan setiap tugasan.',
      'Pencapaian yang sangat cemerlang. Sentiasa bersedia membantu rakan-rakan di dalam kelas.',
    ],
  },
  {
    title: 'Pencapaian Baik & Kepujian (Gred B & C)',
    badge: 'Baik / Kepujian',
    badgeBg: 'bg-blue-100',
    textColor: 'text-blue-800',
    remarks: [
      'Menunjukkan pencapaian yang memuaskan dan berpotensi untuk melonjak ke gred cemerlang.',
      'Prestasi yang konsisten dan baik. Tingkatkan lagi usaha untuk mencapai keputusan yang lebih gemilang.',
      'Seorang murid yang rajin dan berdisiplin. Teruskan fokus dan banyakkan latihan pengukuhan.',
      'Menunjukkan minat belajar yang baik dan peningkatan berterusan dalam setiap ujian.',
      'Pencapaian yang baik. Berikan sedikit lagi tumpuan kepada subjek yang mencabar.',
    ],
  },
  {
    title: 'Sederhana & Berpotensi (Gred D)',
    badge: 'Sederhana',
    badgeBg: 'bg-amber-100',
    textColor: 'text-amber-800',
    remarks: [
      'Mempunyai potensi untuk berkembang. Perlu lebih berfokus dan mengelakkan kelalaian semasa PdP.',
      'Pencapaian pada tahap sederhana. Disarankan mengulang kaji pelajaran secara berkala di rumah.',
      'Boleh mencapai tahap lebih baik sekiranya melipatgandakan usaha dan rajin bertanya guru.',
      'Perlu melipatgandakan usaha dan membina jadual waktu belajar kendiri di rumah.',
    ],
  },
  {
    title: 'Perlu Bimbingan & Tumpuan (Gred E & F)',
    badge: 'Perlu Bimbingan',
    badgeBg: 'bg-rose-100',
    textColor: 'text-rose-800',
    remarks: [
      'Perlu bimbingan berterusan terutamanya dalam kemahiran asas membaca, mengira dan memahami konsep.',
      'Memerlukan sokongan padu dan pemantauan rapi daripada ibu bapa bagi menyiapkan kerja sekolah.',
      'Dikehendaki meningkatkan kehadiran, menumpukan perhatian penuh dan tidak berputus asa.',
      'Perlu menghadiri kelas bimbingan tambahan dan membuat lebih banyak latihan tubi berfokus.',
      'Jangan putus asa, kuatkan azam dan gandakan usaha agar dapat mencapai tahap penguasaan minimum.',
    ],
  },
];

export const REMARKS_BANK = CATEGORIZED_REMARKS.flatMap((c) => c.remarks);

export function calculateGrade(score: number | string, scale: GradeScale): string {
  if (typeof score === 'string') {
    const trimmed = score.trim().toUpperCase();
    if (trimmed === 'TH') return 'TH';
    if (['A', 'B', 'C', 'D', 'E', 'F'].includes(trimmed)) return trimmed;
  }
  if (score === 'TH') return 'TH';
  const num = typeof score === 'number' ? score : parseFloat(score);
  if (isNaN(num)) return '-';

  if (num >= scale.aMin) return 'A';
  if (num >= scale.bMin) return 'B';
  if (num >= scale.cMin) return 'C';
  if (num >= scale.dMin) return 'D';
  if (num >= scale.eMin) return 'E';
  return 'F';
}

export function calculateGPC(grades: string[]): string {
  const map: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6 };
  let totalPoints = 0;
  let count = 0;

  grades.forEach((g) => {
    if (map[g]) {
      totalPoints += map[g];
      count++;
    }
  });

  return count > 0 ? (totalPoints / count).toFixed(2) : '0.00';
}

export function getOverallGradeSummary(grades: string[]): string {
  const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, TH: 0 };
  grades.forEach((g) => {
    if (counts[g] !== undefined) counts[g]++;
  });

  const res: string[] = [];
  ['A', 'B', 'C', 'D', 'E', 'F', 'TH'].forEach((k) => {
    if (counts[k] > 0) {
      res.push(`${counts[k]}${k}`);
    }
  });

  return res.join(' ') || '-';
}

/**
 * Intelligent Rule-Based AI Remark Generator (Instant offline fallback & generator)
 * Tailored specifically to the student's exact strengths, weaknesses, and grades.
 */
export function generateSmartRemark(student: any): string {
  const subjectMap: { name: string; score: number | 'TH'; grade: string }[] = [];

  if (student.subjectResults && Array.isArray(student.subjectResults) && student.subjectResults.length > 0) {
    student.subjectResults.forEach((sub: any) => {
      subjectMap.push({
        name: sub.name,
        score: sub.score,
        grade: sub.grade ?? 'F',
      });
    });
  } else {
    if (student.bm !== undefined) subjectMap.push({ name: 'Bahasa Melayu', score: student.bm, grade: student.bmGrade });
    if (student.bi !== undefined) subjectMap.push({ name: 'Bahasa Inggeris', score: student.bi, grade: student.biGrade });
    if (student.mt !== undefined) subjectMap.push({ name: 'Matematik', score: student.mt, grade: student.mtGrade });
    if (student.sn !== undefined) subjectMap.push({ name: 'Sains', score: student.sn, grade: student.snGrade });
    if (student.sej !== undefined) subjectMap.push({ name: 'Sejarah', score: student.sej, grade: student.sejGrade });
  }

  if (subjectMap.length === 0) {
    return 'Menunjukkan sikap yang positif dan komitmen pembelajaran yang baik di dalam kelas.';
  }

  // Check if student was absent (TH) for all subjects
  const allTH = subjectMap.every((s) => s.score === 'TH' || s.grade === 'TH');
  if (allTH) {
    return 'Murid Tidak Hadir (TH) untuk menduduki keseluruhan pentaksiran / peperiksaan bagi sesi ini.';
  }

  const thCount = subjectMap.filter((s) => s.score === 'TH' || s.grade === 'TH').length;

  const attendedSubjects = subjectMap.filter(
    (s): s is { name: string; score: number; grade: string } =>
      typeof s.score === 'number' && s.grade !== 'TH'
  );

  const grades = subjectMap.map((s) => s.grade);
  const aCount = grades.filter((g) => g === 'A').length;
  const fCount = grades.filter((g) => g === 'F').length;
  const eCount = grades.filter((g) => g === 'E').length;

  const sortedBest = [...attendedSubjects].sort((a, b) => b.score - a.score);
  const sortedWeak = [...attendedSubjects].sort((a, b) => a.score - b.score);

  const bestSub = sortedBest[0];
  const weakSub = sortedWeak[0];
  const avg = Number(student.avg) || 0;

  const thNote = thCount > 0 ? ` (Catatan: Tidak Hadir bagi ${thCount} subjek).` : '';

  // Case 1: Majority A
  if (aCount >= Math.max(2, Math.floor(subjectMap.length * 0.7)) && bestSub) {
    return `Pencapaian amat cemerlang dalam mata pelajaran terutamanya ${bestSub.name} (${bestSub.score}%). Kekalkan disiplin dan iltizam terbaik ini.${thNote}`;
  }

  // Case 2: High average
  if (avg >= 80) {
    return `Prestasi cemerlang dan membanggakan. Sentiasa menunjukkan komitmen tinggi dan tumpuan padu di dalam kelas. Tahniah & syabas!${thNote}`;
  }

  // Case 3: Good performance with a specific strong subject
  if (avg >= 65 && bestSub && weakSub) {
    if (weakSub.grade === 'D' || weakSub.grade === 'E' || weakSub.grade === 'F') {
      return `Pencapaian baik terutamanya subjek ${bestSub.name} (${bestSub.score}%). Berikan sedikit lagi tumpuan dan latihan untuk subjek ${weakSub.name}.${thNote}`;
    }
    return `Pencapaian konsisten dan memuaskan. Mempunyai potensi besar untuk melonjak ke tahap gred cemerlang dengan usaha berterusan.${thNote}`;
  }

  // Case 4: Moderate (average 50 - 64)
  if (avg >= 50 && weakSub) {
    if (weakSub.grade === 'E' || weakSub.grade === 'F') {
      return `Menunjukkan usaha yang baik, namun memerlukan lebih bimbingan dan latihan tubi berfokus dalam subjek ${weakSub.name}.${thNote}`;
    }
    return `Pencapaian pada tahap memuaskan. Tingkatkan tumpuan semasa sesi pembelajaran serta banyakkan mengulang kaji di rumah.${thNote}`;
  }

  // Case 5: Has Grade F or E (Below 50)
  if (fCount > 0 || eCount > 0 || student.resultStatus === 'GAGAL') {
    const weakList = attendedSubjects
      .filter((s) => s.grade === 'F' || s.grade === 'E')
      .map((s) => s.name)
      .join(' dan ');
    if (weakList) {
      return `Memerlukan bimbingan rapi guru dan pemantauan ibu bapa terutamanya bagi subjek ${weakList}. Jangan berputus asa, lipatgandakan usaha.${thNote}`;
    }
    return `Perlu melipatgandakan usaha dan mengukuhkan kemahiran asas. Disarankan menghadiri kelas bimbingan tambahan dan menyiapkan latihan tubi harian.${thNote}`;
  }

  return `Menunjukkan usaha yang baik di dalam kelas. Teruskan bertanya guru dan mengulang kaji pelajaran secara berdisiplin di rumah.${thNote}`;
}

export function processStudentRows(
  rows: StudentRow[],
  subjectsOrScale: SubjectInfo[] | GradeScale,
  scaleOrOverrides?: GradeScale | Record<string, Record<string, string>>,
  overridesParam?: Record<string, Record<string, string>>,
  resultOverridesParam?: Record<string, 'LULUS' | 'GAGAL'>
): ProcessedStudent[] {
  let subjects: SubjectInfo[];
  let scale: GradeScale;
  let overrides: Record<string, Record<string, string>> = {};
  let resultOverrides: Record<string, 'LULUS' | 'GAGAL'> = {};

  if (Array.isArray(subjectsOrScale)) {
    subjects = subjectsOrScale.length > 0 ? subjectsOrScale : DEFAULT_SUBJECTS;
    scale = (scaleOrOverrides as GradeScale) || DEFAULT_GRADE_SCALE;
    overrides = overridesParam || {};
    resultOverrides = resultOverridesParam || {};
  } else {
    subjects = DEFAULT_SUBJECTS;
    scale = subjectsOrScale || DEFAULT_GRADE_SCALE;
    overrides = (scaleOrOverrides as Record<string, Record<string, string>>) || {};
    resultOverrides = (overridesParam as unknown as Record<string, 'LULUS' | 'GAGAL'>) || {};
  }

  const list: ProcessedStudent[] = [];

  rows.forEach((row, index) => {
    const name = row.name.trim();
    const className = row.className.trim();
    if (!name && !className) return;

    const studentOverrides = overrides[row.id] || {};
    const scores: Record<string, number | 'TH'> = {};
    const grades: Record<string, string> = {};
    const studentGradesList: string[] = [];
    let total = 0;

    const subjectResults = subjects.map((sub) => {
      let rawVal: any = '';
      if (row.scores && row.scores[sub.id] !== undefined) {
        rawVal = row.scores[sub.id];
      } else if (row[sub.id] !== undefined) {
        rawVal = row[sub.id];
      } else if (row[sub.code.toLowerCase()] !== undefined) {
        rawVal = row[sub.code.toLowerCase()];
      }

      const isTH =
        rawVal === 'TH' ||
        (typeof rawVal === 'string' && rawVal.trim().toUpperCase() === 'TH');

      let scoreVal: number | 'TH';
      let grade: string;

      if (isTH) {
        scoreVal = 'TH';
        scores[sub.id] = 'TH';
        const overrideGrade = studentOverrides[sub.id] || studentOverrides[sub.code.toLowerCase()];
        grade = overrideGrade || 'TH';
      } else {
        const scoreNum = typeof rawVal === 'number' ? rawVal : (parseFloat(String(rawVal)) || 0);
        scoreVal = scoreNum;
        scores[sub.id] = scoreNum;
        total += scoreNum;
        const overrideGrade = studentOverrides[sub.id] || studentOverrides[sub.code.toLowerCase()];
        grade = overrideGrade || calculateGrade(scoreNum, scale);
      }

      grades[sub.id] = grade;
      studentGradesList.push(grade);

      return {
        id: sub.id,
        name: sub.name,
        code: sub.code,
        score: scoreVal,
        grade,
      };
    });

    const subjectCount = subjects.length || 1;
    const avg = parseFloat((total / subjectCount).toFixed(1));
    const gpc = calculateGPC(studentGradesList);
    const gredSummary = getOverallGradeSummary(studentGradesList);

    // Default pass rule: no E, no F, and no TH grades
    const calculatedPass =
      !studentGradesList.includes('E') &&
      !studentGradesList.includes('F') &&
      !studentGradesList.includes('TH');
    const explicitOverride = resultOverrides[row.id] || (row.resultOverride as 'LULUS' | 'GAGAL' | undefined);
    const resultStatus: 'LULUS' | 'GAGAL' = explicitOverride ? explicitOverride : (calculatedPass ? 'LULUS' : 'GAGAL');
    const isPass = resultStatus === 'LULUS';

    // Standard subject backward-compatibility fallbacks
    const getVal = (key: string): number | 'TH' => {
      const v: any = scores[key] ?? row[key];
      if (v === 'TH' || String(v).trim().toUpperCase() === 'TH') return 'TH';
      const num = typeof v === 'number' ? v : parseFloat(String(v));
      return isNaN(num) ? 0 : num;
    };

    const bmVal = getVal('bm');
    const biVal = getVal('bi');
    const mtVal = getVal('mt');
    const snVal = getVal('sn');
    const sejVal = getVal('sej');

    list.push({
      id: row.id || String(index + 1),
      name: name || `MURID ${index + 1}`,
      className: className || 'KELAS',
      mykid: row.mykid || '-',
      gender: row.gender || 'LELAKI',
      scores,
      grades,
      subjectResults,
      bm: bmVal,
      bi: biVal,
      mt: mtVal,
      sn: snVal,
      sej: sejVal,
      bmGrade: grades['bm'] || calculateGrade(bmVal, scale),
      biGrade: grades['bi'] || calculateGrade(biVal, scale),
      mtGrade: grades['mt'] || calculateGrade(mtVal, scale),
      snGrade: grades['sn'] || calculateGrade(snVal, scale),
      sejGrade: grades['sej'] || calculateGrade(sejVal, scale),
      teacherName: row.teacherName || 'GURU KELAS',
      notes: row.notes || '',
      subjectCount,
      total,
      avg,
      gpc,
      gredSummary,
      isPass,
      resultStatus,
      classRank: 0,
      classTotalCount: 0,
      overallRank: 0,
      totalStudentsOverall: 0,
    });
  });

  // Calculate Overall Ranks
  list.sort((a, b) => b.avg - a.avg);
  list.forEach((s, idx) => {
    s.overallRank = idx + 1;
    s.totalStudentsOverall = list.length;
  });

  // Calculate Class Ranks
  const classGroups: Record<string, ProcessedStudent[]> = {};
  list.forEach((s) => {
    if (!classGroups[s.className]) classGroups[s.className] = [];
    classGroups[s.className].push(s);
  });

  Object.keys(classGroups).forEach((cName) => {
    classGroups[cName].sort((a, b) => b.avg - a.avg);
    classGroups[cName].forEach((s, idx) => {
      s.classRank = idx + 1;
      s.classTotalCount = classGroups[cName].length;
    });
  });

  return list;
}

export function computeSubjectStats(
  students: ProcessedStudent[],
  subjects: SubjectInfo[] = DEFAULT_SUBJECTS
): SubjectStats[] {
  const totalStudents = students.length;
  if (totalStudents === 0) return [];

  const gradeValues: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6 };

  return subjects.map((sub) => {
    const grades = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, TH: 0 };
    let totalScore = 0;
    let totalGpmpPoints = 0;
    let attendedStudents = 0;

    students.forEach((s) => {
      // Find score and grade for this subject
      let score: number | 'TH' = 0;
      let g = 'F';

      const found = s.subjectResults?.find((r) => r.id === sub.id || r.code === sub.code);
      if (found) {
        score = found.score;
        g = found.grade;
      } else if (s.scores && s.scores[sub.id] !== undefined) {
        score = s.scores[sub.id];
        g = s.grades?.[sub.id] || 'F';
      } else if (s[sub.id as keyof ProcessedStudent] !== undefined) {
        score = (s[sub.id as keyof ProcessedStudent] as number | 'TH') || 0;
        g = (s[`${sub.id}Grade` as keyof ProcessedStudent] as string) || 'F';
      }

      if (score === 'TH' || g === 'TH') {
        grades.TH++;
      } else {
        const numScore = typeof score === 'number' ? score : (parseFloat(String(score)) || 0);
        attendedStudents++;
        totalScore += numScore;
        if (grades[g as keyof typeof grades] !== undefined) {
          grades[g as keyof typeof grades]++;
        }
        totalGpmpPoints += gradeValues[g] || 6;
      }
    });

    const passCount = grades.A + grades.B + grades.C + grades.D;
    const passPercent =
      attendedStudents > 0
        ? parseFloat(((passCount / attendedStudents) * 100).toFixed(1))
        : 0;
    const avgScore =
      attendedStudents > 0
        ? parseFloat((totalScore / attendedStudents).toFixed(1))
        : 0;
    const gpmp =
      attendedStudents > 0
        ? parseFloat((totalGpmpPoints / attendedStudents).toFixed(2))
        : 0;

    return {
      id: sub.id,
      key: sub.id,
      name: sub.name,
      code: sub.code,
      totalStudents,
      attendedStudents,
      thCount: grades.TH,
      grades,
      passCount,
      passPercent,
      avgScore,
      gpmp,
    };
  });
}


export function computeClassStats(students: ProcessedStudent[]): ClassStats[] {
  const classes = Array.from(new Set(students.map((s) => s.className)));

  return classes.map((cName) => {
    const cStudents = students.filter((s) => s.className === cName);
    const count = cStudents.length;
    const avgScore = parseFloat((cStudents.reduce((acc, s) => acc + s.avg, 0) / count).toFixed(1));
    const passCount = cStudents.filter((s) => s.isPass).length;
    const passPercent = parseFloat(((passCount / count) * 100).toFixed(1));

    let gpcSum = 0;
    cStudents.forEach((s) => {
      gpcSum += parseFloat(s.gpc) || 0;
    });
    const gpcAvg = parseFloat((gpcSum / count).toFixed(2));

    let topStudent: { name: string; avg: number } | null = null;
    if (cStudents.length > 0) {
      const sorted = [...cStudents].sort((a, b) => b.avg - a.avg);
      topStudent = { name: sorted[0].name, avg: sorted[0].avg };
    }

    return {
      className: cName,
      studentCount: count,
      avgScore,
      passCount,
      passPercent,
      gpcAvg,
      topStudent,
    };
  });
}
