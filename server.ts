import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// Persistence Data File Path
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'school-data.json');

const getStoredData = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading stored school data:', err);
  }
  return null;
};

const saveStoredData = (newData: Record<string, any>) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const current = getStoredData() || {};
    const merged = {
      ...current,
      ...newData,
      adminPassword: newData.adminPassword || current.adminPassword || 'guru123',
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2), 'utf-8');
    return merged;
  } catch (err) {
    console.error('Error writing stored school data:', err);
    throw err;
  }
};

// Endpoint: Get persisted school data for shared links
app.get('/api/data', (_req, res) => {
  try {
    const stored = getStoredData();
    if (!stored) {
      return res.json({ exists: false, data: null });
    }
    // Return data without exposing plain admin password
    const { adminPassword, ...safeData } = stored;
    res.json({
      exists: true,
      data: safeData,
      hasCustomPassword: Boolean(adminPassword && adminPassword !== 'guru123'),
    });
  } catch (err: any) {
    console.error('GET /api/data error:', err);
    res.status(500).json({ error: 'Gagal memuatkan data pelayan' });
  }
});

// Endpoint: Save school data from admin
app.post('/api/data', (req, res) => {
  try {
    const { students, settings, gradeScale, gradeOverrides, resultOverrides, subjects } = req.body;
    const saved = saveStoredData({
      students: students || [],
      settings: settings || {},
      gradeScale: gradeScale || {},
      gradeOverrides: gradeOverrides || {},
      resultOverrides: resultOverrides || {},
      subjects: subjects || [],
    });
    res.json({ success: true, updatedAt: saved.updatedAt });
  } catch (err: any) {
    console.error('POST /api/data error:', err);
    res.status(500).json({ error: 'Gagal menyimpan data ke pelayan' });
  }
});

// Endpoint: Verify teacher passcode
app.post('/api/auth/verify', (req, res) => {
  try {
    const { password } = req.body;
    const stored = getStoredData();
    const correctPassword = stored?.adminPassword || 'guru123';

    if (password === correctPassword) {
      return res.json({ success: true, token: 'guru_session_' + Date.now() });
    }
    return res.status(401).json({ success: false, error: 'Kata laluan salah. Sila cuba lagi.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Ralat pengesahan kata laluan' });
  }
});

// Endpoint: Change teacher passcode
app.post('/api/auth/change-password', (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.trim().length < 4) {
      return res.status(400).json({ error: 'Kata laluan baharu mestilah sekurang-kurangnya 4 aksara.' });
    }

    const stored = getStoredData();
    const activePassword = stored?.adminPassword || 'guru123';

    if (currentPassword !== activePassword) {
      return res.status(401).json({ error: 'Kata laluan semasa tidak tepat.' });
    }

    saveStoredData({
      ...(stored || {}),
      adminPassword: newPassword.trim(),
    });

    res.json({ success: true, message: 'Kata laluan guru berjaya dikemaskini.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Gagal mengemaskini kata laluan' });
  }
});

// Server-side Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Generate personalized remark for a single student
app.post('/api/generate-remark', async (req, res) => {
  try {
    const { student } = req.body;
    if (!student || !student.name) {
      return res.status(400).json({ error: 'Maklumat murid diperlukan' });
    }

    const gradesText =
      student.subjectResults && Array.isArray(student.subjectResults) && student.subjectResults.length > 0
        ? student.subjectResults
            .map((r: any) => `- ${r.name} (${r.code}): ${r.score}% (Gred ${r.grade})`)
            .join('\n')
        : [
            `- Bahasa Melayu: ${student.bm || 0}% (${student.bmGrade || '-'})`,
            `- Bahasa Inggeris: ${student.bi || 0}% (${student.biGrade || '-'})`,
            `- Matematik: ${student.mt || 0}% (${student.mtGrade || '-'})`,
            `- Sains: ${student.sn || 0}% (${student.snGrade || '-'})`,
            `- Sejarah: ${student.sej || 0}% (${student.sejGrade || '-'})`,
          ].join('\n');

    const prompt = `Nama Murid: ${student.name}
Kelas: ${student.className || '-'}
Gred & Markah Mata Pelajaran:
${gradesText}
Purata Keseluruhan: ${student.avg || 0}%
Pencapaian Gred: ${student.gredSummary || '-'}
Keputusan Keseluruhan: ${student.resultStatus || 'LULUS'}

Sila hasilkan satu atau dua ayat ulasan guru kelas rasmi yang bernas, membina, dan memberi dorongan dalam Bahasa Melayu standard. Jika murid mendapat Gred E atau F, nyatakan secara sopan subjek yang memerlukan bimbingan tambahan. Jangan masukkan tanda petikan.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'Anda adalah seorang guru kelas sekolah rendah di Malaysia yang prihatin, positif, dan profesional. Tulis ulasan rasmi slip pentaksiran (1-2 ayat) yang ringkas, tepat, membina dan memberi dorongan.',
        temperature: 0.7,
      },
    });

    const remark = response.text ? response.text.trim().replace(/^["']|["']$/g, '') : '';
    res.json({ remark });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      error: error?.message || 'Gagal menjana ulasan AI',
      fallback: true,
    });
  }
});

// Endpoint: Generate remarks for multiple students in one batch
app.post('/api/generate-bulk-remarks', async (req, res) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'Senarai murid diperlukan' });
    }

    // Limit batch to 30 at a time for fast responses
    const batch = students.slice(0, 30);
    const studentsSummary = batch
      .map((s, idx) => {
        const subStr =
          s.subjectResults && Array.isArray(s.subjectResults)
            ? s.subjectResults.map((r: any) => `${r.code}:${r.grade}`).join(', ')
            : `BM:${s.bmGrade}, BI:${s.biGrade}, MT:${s.mtGrade}, SN:${s.snGrade}, SEJ:${s.sejGrade}`;
        return `[${idx + 1}] ID: "${s.id}", Nama: "${s.name}", Purata: ${s.avg}%, Subjek: [${subStr}], Keputusan: ${s.resultStatus}`;
      })
      .join('\n');

    const prompt = `Berikut adalah senarai keputusan murid:
${studentsSummary}

Sila jana satu ayat ulasan guru kelas rasmi dan membina dalam Bahasa Melayu untuk setiap murid. Kembalikan jawapan dalam format JSON Array seperti berikut:
[
  { "id": "...", "remark": "Ulasan guru di sini..." }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'Anda adalah guru kelas sekolah rendah di Malaysia. Hasilkan ulasan ringkas (1 ayat) yang membina untuk setiap murid mengikut prestasinya. Balas dalam format JSON sahaja.',
        responseMimeType: 'application/json',
      },
    });

    let results = [];
    try {
      results = JSON.parse(response.text || '[]');
    } catch {
      results = [];
    }

    res.json({ remarks: results });
  } catch (error: any) {
    console.error('Gemini Bulk API Error:', error);
    res.status(500).json({
      error: error?.message || 'Gagal menjana ulasan pukal AI',
      fallback: true,
    });
  }
});

// Setup Vite middleware in dev or static files in production
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on http://0.0.0.0:${PORT}`);
});
