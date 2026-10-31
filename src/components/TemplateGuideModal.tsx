import React from 'react';
import * as XLSX from 'xlsx';
import {
  HelpCircle,
  Download,
  Copy,
  Printer,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Sparkles,
} from 'lucide-react';

interface TemplateGuideModalProps {
  onLoadSample: () => void;
  onGoToData: () => void;
}

export const TemplateGuideModal: React.FC<TemplateGuideModalProps> = ({
  onLoadSample,
  onGoToData,
}) => {
  const downloadExcelTemplate = () => {
    const wsData = [
      [
        'Bil',
        'NAMA MURID',
        'KELAS',
        'NO. K/P (MYKID)',
        'JANTINA',
        'BM',
        'BI',
        'MT',
        'SN',
        'SEJ',
        'NAMA GURU KELAS',
        'ULASAN GURU',
      ],
      [
        1,
        'Ahmad Ammar Bin Zulkifli',
        '3 BESTARI',
        '140304085543',
        'LELAKI',
        88,
        82,
        95,
        90,
        86,
        'PN. NORAINI BINTI HASNAN',
        'Pencapaian cemerlang.',
      ],
      [
        2,
        'Nur Aishah Binti Rosli',
        '3 BESTARI',
        '140712086654',
        'PEREMPUAN',
        94,
        90,
        98,
        92,
        91,
        'PN. NORAINI BINTI HASNAN',
        'Pencapaian amat baik.',
      ],
      [
        3,
        'Muhammad Danish Bin Hafiz',
        '3 BESTARI',
        '140111081123',
        'LELAKI',
        68,
        72,
        54,
        60,
        65,
        'PN. NORAINI BINTI HASNAN',
        'Perlu lebih latihan.',
      ],
      [
        4,
        'Lim Wei Xiang',
        '3 CERDAS',
        '140405089912',
        'LELAKI',
        82,
        85,
        90,
        84,
        78,
        'EN. RAZAK BIN HARUN',
        'Komited dan berdisiplin.',
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Templat_Markah');
    XLSX.writeFile(wb, 'Templat_Markah_Sekolah_Rendah.xlsx');
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-8">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-indigo-600" />
          Panduan Penggunaan & Templat Fail
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ketahui cara memasukkan data murid secara pukal, menampal dari Excel, dan mencetak slip rasmi ke format PDF.
        </p>
      </div>

      {/* 3 Simple Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              1
            </span>
            <h4 className="font-bold text-slate-800 text-sm">Sedia / Tampal Data</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Buka fail Excel anda, <b>Salin (Ctrl+C)</b> julat markah murid, dan <b>Tampal (Ctrl+V)</b> terus ke dalam petak jadual di tab <i>Input Data Pukal</i>.
            </p>
          </div>
          <button
            onClick={downloadExcelTemplate}
            className="mt-4 px-3.5 py-2 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" /> Muat Turun Templat (.xlsx)
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              2
            </span>
            <h4 className="font-bold text-slate-800 text-sm">Tetapkan Info & Gred</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Isi nama sekolah, tajuk ujian, muat naik logo sekolah (pilihan), dan laraskan skala markah minima untuk Gred A hingga E mengikut ketetapan sekolah anda.
            </p>
          </div>
          <button
            onClick={onLoadSample}
            className="mt-4 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" /> Cuba Data Contoh
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              3
            </span>
            <h4 className="font-bold text-slate-800 text-sm">Cetak Slip / Semak Analisis</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Klik <i>Proses & Jana Slip</i>. Anda boleh mencetak semua slip murid sekaligus (setiap murid satu muka surat A4), atau tapis mengikut kelas dan murid individu.
            </p>
          </div>
          <button
            onClick={onGoToData}
            className="mt-4 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5" /> Mula Memasukkan Data
          </button>
        </div>
      </div>

      {/* Detailed Columns Table */}
      <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
        <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
          Susunan Lajur Yang Disyorkan (Excel / Spreadsheet)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left bg-white border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Lajur</th>
                <th className="p-2.5">Tajuk Lajur</th>
                <th className="p-2.5">Format / Contoh</th>
                <th className="p-2.5">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-2.5 font-bold text-slate-500">A</td>
                <td className="p-2.5 font-semibold text-slate-800">Nama Murid</td>
                <td className="p-2.5">Ahmad Ammar Bin Zulkifli</td>
                <td className="p-2.5 text-slate-500">Nama penuh murid</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-500">B</td>
                <td className="p-2.5 font-semibold text-slate-800">Kelas</td>
                <td className="p-2.5 font-mono">3 BESTARI</td>
                <td className="p-2.5 text-slate-500">Nama kelas murid</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-500">C</td>
                <td className="p-2.5 font-semibold text-slate-800">No. K/P (MyKid)</td>
                <td className="p-2.5 font-mono">140304085543</td>
                <td className="p-2.5 text-slate-500">Tanpa tanda sempang (-)</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-500">D</td>
                <td className="p-2.5 font-semibold text-slate-800">Jantina</td>
                <td className="p-2.5">LELAKI / PEREMPUAN</td>
                <td className="p-2.5 text-slate-500">Boleh guna L atau P</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-500">E - I</td>
                <td className="p-2.5 font-semibold text-slate-800">Markah Subjek</td>
                <td className="p-2.5 font-mono">88, 82, 95, 90, 86</td>
                <td className="p-2.5 text-slate-500">BM, BI, MT, SN, SEJ (0 - 100)</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-500">J</td>
                <td className="p-2.5 font-semibold text-slate-800">Nama Guru Kelas</td>
                <td className="p-2.5">PN. NORAINI BINTI HASNAN</td>
                <td className="p-2.5 text-slate-500">Dipaparkan pada ruang tandatangan</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-500">K</td>
                <td className="p-2.5 font-semibold text-slate-800">Ulasan Guru</td>
                <td className="p-2.5 italic">Pencapaian cemerlang...</td>
                <td className="p-2.5 text-slate-500">Ulasan kemajuan murid</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-slate-500">L</td>
                <td className="p-2.5 font-semibold text-slate-800">Keputusan</td>
                <td className="p-2.5 font-bold text-indigo-700">LULUS / GAGAL</td>
                <td className="p-2.5 text-slate-500">Pilihan: Cikgu boleh tetapkan LULUS, GAGAL, atau Auto</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Printing Tips */}
      <div className="border border-indigo-200 bg-indigo-50/40 rounded-2xl p-5 space-y-2">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Printer className="w-4 h-4 text-indigo-600" />
          Petua Cetakan PDF yang Kemas (A4)
        </h3>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
          <li>
            Pada tetingkap cetakan pelayar (Chrome / Edge), pilih <b>Destination: Save as PDF (Simpan sebagai PDF)</b>.
          </li>
          <li>
            Pastikan saiz kertas dipilih sebagai <b>A4</b> dan orientasi <b>Portrait (Menegak)</b>.
          </li>
          <li>
            Di bawah bahagian <b>More settings</b>, nyahtanda (uncheck) pilihan <i>Headers and footers</i> untuk mengelakkan alamat URL dicetak pada tepi slip.
          </li>
          <li>
            Setkan <b>Scale: 100%</b> atau <b>Fit to printable area</b> untuk hasil paparan bingkai yang kemas.
          </li>
        </ul>
      </div>
    </div>
  );
};
