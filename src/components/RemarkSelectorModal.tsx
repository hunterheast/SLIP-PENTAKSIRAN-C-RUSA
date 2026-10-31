import React, { useState } from 'react';
import { Sparkles, Search, MessageSquareQuote, Check, X, Loader2, PenLine } from 'lucide-react';
import { CATEGORIZED_REMARKS } from '../utils/gradeCalculations';
import { StudentRow, ProcessedStudent } from '../types';

interface RemarkSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentRow | ProcessedStudent | null;
  onSelectRemark: (remark: string) => void;
  onGenerateAiRemark?: (student: any) => Promise<void> | void;
  isGenerating?: boolean;
}

export const RemarkSelectorModal: React.FC<RemarkSelectorModalProps> = ({
  isOpen,
  onClose,
  student,
  onSelectRemark,
  onGenerateAiRemark,
  isGenerating = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customRemark, setCustomRemark] = useState<string>('');

  if (!isOpen || !student) return null;

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

  const filteredRemarks = allRemarks.filter((item) => {
    const matchCat = selectedCategory === 'SEMUA' || item.category === selectedCategory;
    const matchQuery =
      searchQuery.trim() === '' ||
      item.remark.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const studentGradesSummary = (student as ProcessedStudent).gredSummary || '';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                Pilih Ulasan Guru / Jana Ulasan AI
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-slate-700">{student.name || 'Murid'}</span>
                <span>•</span>
                <span>{student.className}</span>
                {studentGradesSummary && (
                  <>
                    <span>•</span>
                    <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-mono font-bold text-[11px]">
                      {studentGradesSummary}
                    </span>
                  </>
                )}
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

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* AI Generator Action Box */}
          {onGenerateAiRemark && (
            <div className="p-4 bg-linear-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-indigo-950 text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600 fill-indigo-100" />
                  <span>Jana Ulasan Guru Menggunakan AI Pintar</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  AI akan menganalisis gred &amp; markah murid (BM, BI, MT, SN, SEJ) untuk menghasilkan ulasan yang tepat, membina, dan motivasi.
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await onGenerateAiRemark(student);
                  onClose();
                }}
                disabled={isGenerating}
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-sm hover:shadow flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sedang Menjana...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Jana Sekarang (AI)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Search Bar & Category Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari ulasan mengikut kata kunci (cth: cemerlang, usaha, bimbingan, potensi)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-semibold transition whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.replace('Pencapaian ', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Remarks List */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {filteredRemarks.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                Tiada ulasan ditemui bagi padanan kata kunci ini.
              </div>
            ) : (
              filteredRemarks.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onSelectRemark(item.remark);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 text-xs text-slate-700 transition flex flex-col gap-1.5 group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.badgeBg} ${item.textColor}`}>
                      {item.badge}
                    </span>
                    <span className="text-[11px] text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                      Pilih Ulasan Ini <Check className="w-3 h-3" />
                    </span>
                  </div>
                  <span className="leading-relaxed text-slate-800">{item.remark}</span>
                </button>
              ))
            )}
          </div>

          {/* Write Custom Remark */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <PenLine className="w-3.5 h-3.5 text-slate-500" />
              Atau Tulis Ulasan Sendiri Secara Manual:
            </label>
            <div className="flex gap-2">
              <textarea
                rows={2}
                value={customRemark}
                onChange={(e) => setCustomRemark(e.target.value)}
                placeholder="Tulis ulasan tersuai anda untuk murid ini..."
                className="flex-1 p-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <button
                type="button"
                disabled={!customRemark.trim()}
                onClick={() => {
                  if (customRemark.trim()) {
                    onSelectRemark(customRemark.trim());
                    onClose();
                  }
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition disabled:opacity-40 self-end"
              >
                Gunakan
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {filteredRemarks.length} pilihan ulasan tersedia
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
