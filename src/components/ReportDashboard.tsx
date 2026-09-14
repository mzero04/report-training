import React, { useState, useMemo } from 'react';
import { TraineeRecord, AISummaryResponse } from '../types';
import {
  Users,
  GraduationCap,
  BookOpen,
  AlertTriangle,
  Sparkles,
  Calendar,
  Mail,
  Plus,
  CheckCircle,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Copy,
  Check,
  Download,
  FileSpreadsheet,
  FileUp,
  Layers,
  FolderKanban
} from 'lucide-react';

interface ReportDashboardProps {
  records: TraineeRecord[];
  availableDates: string[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenEmailPreview: () => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  onOpenImportModal: () => void;
  onSwitchToScript: () => void;
  aiSummary: AISummaryResponse | null;
  isGeneratingAI: boolean;
  onGenerateAI: () => void;
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({
  records,
  availableDates,
  selectedDate,
  onSelectDate,
  onOpenEmailPreview,
  onOpenAddModal,
  onOpenExportModal,
  onOpenImportModal,
  onSwitchToScript,
  aiSummary,
  isGeneratingAI,
  onGenerateAI,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);

  const week1Dates = useMemo(() => [
    'Monday, December 22, 2025',
    'Tuesday, December 23, 2025',
    'Wednesday, December 24, 2025',
    'Friday, December 26, 2025',
  ], []);

  const week2Dates = useMemo(() => [
    'Monday, December 29, 2025',
    'Tuesday, December 30, 2025',
    'Wednesday, December 31, 2025',
  ], []);

  // Filter records for the selected sheet or date
  const dateRecords = useMemo(() => {
    if (selectedDate === 'ALL') {
      return records;
    }
    if (selectedDate === 'WEEK_1') {
      return records.filter(r => week1Dates.includes(r.date));
    }
    if (selectedDate === 'WEEK_2') {
      return records.filter(r => week2Dates.includes(r.date));
    }
    return records.filter(r => r.date === selectedDate);
  }, [records, selectedDate, week1Dates, week2Dates]);

  // Trainee search filter
  const filteredRecords = dateRecords.filter(r => {
    const q = searchTerm.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.trainer.toLowerCase().includes(q) ||
      r.learningMaterial.toLowerCase().includes(q) ||
      r.remark.toLowerCase().includes(q) ||
      r.date.toLowerCase().includes(q)
    );
  });

  // Calculate stats
  const uniqueTrainees = Array.from(new Set(dateRecords.map(r => r.name)));
  
  const trainersSet = new Set<string>();
  dateRecords.forEach(r => {
    r.trainer.split(/\n|\r|[0-9]+\./).forEach(t => {
      const clean = t.replace(/^[^a-zA-Z]+/, '').trim();
      if (clean.length > 2) trainersSet.add(clean);
    });
  });

  const topicsSet = new Set<string>();
  dateRecords.forEach(r => {
    r.learningMaterial.split(/\n|\r|[0-9]+\./).forEach(m => {
      const clean = m.replace(/^[^a-zA-Z0-9]+/, '').trim();
      if (clean.length > 3) topicsSet.add(clean);
    });
  });

  const flaggedRemarks = dateRecords.filter(r => r.remark && r.remark.trim().length > 0);

  const getHeaderTitle = () => {
    if (selectedDate === 'ALL') return 'Semua Sheet (Master Log - Desember 2025)';
    if (selectedDate === 'WEEK_1') return 'Sheet Week 1 (22 - 26 Desember 2025)';
    if (selectedDate === 'WEEK_2') return 'Sheet Week 2 (29 - 31 Desember 2025)';
    return selectedDate;
  };

  const getHeaderSubtitle = () => {
    if (selectedDate === 'ALL') {
      return `Menampilkan seluruh data dari semua sheet spreadsheet (${records.length} baris log, ${availableDates.length} hari kegiatan, 8 peserta).`;
    }
    if (selectedDate === 'WEEK_1') {
      return 'Menampilkan data modul Pre-Layout, Sub Layout Mechanic & Sewing tahap awal (4 hari, 32 entri).';
    }
    if (selectedDate === 'WEEK_2') {
      return 'Menampilkan data modul Pre-Layout Kathmandu, ARCTERYX, Skill Matrix & Defect Control (3 hari, 24 entri).';
    }
    return 'Tinjau materi harian peserta, bimbingan instruktur, catatan/pertanyaan kendala, dan kirim laporan email.';
  };

  const isMultiDateView = selectedDate === 'ALL' || selectedDate === 'WEEK_1' || selectedDate === 'WEEK_2';

  const handleCopySummary = () => {
    if (!aiSummary) return;
    const text = `DAILY REPORT SUMMARY: ${getHeaderTitle()}
${aiSummary.summary}

Key Milestones:
${aiSummary.highlights.map(h => `• ${h}`).join('\n')}

Action Items & Remarks:
${aiSummary.blockersOrRemarks.map(b => `• ${b}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Sheet Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Spreadsheet Training Activity Log</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {getHeaderTitle()}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {getHeaderSubtitle()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-2xs"
              title="Import data CSV/TSV atau tempel data spreadsheet"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Import Data Sheet</span>
            </button>
            <button
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold transition-colors shadow-2xs"
              title="Export semua sheet berdasarkan bulan dan tahun"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Bulan & Tahun</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Entry</span>
            </button>
            <button
              onClick={onOpenEmailPreview}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Generate Email Report</span>
            </button>
          </div>
        </div>

        {/* Google Sheets Tab Navigation Ribbon */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5 text-emerald-600" />
              <span>Navigasi Sheet (Sheet Tabs):</span>
            </label>
            <span className="text-xs text-slate-400 font-medium">
              Total Database: {records.length} Entri • 7 Hari • 8 Peserta
            </span>
          </div>

          {/* Master & Week Sheet Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 rounded-xl border border-slate-200/80">
            <button
              onClick={() => onSelectDate('ALL')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedDate === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/60'
              }`}
            >
              <FileSpreadsheet className={`w-4 h-4 ${selectedDate === 'ALL' ? 'text-white' : 'text-emerald-600'}`} />
              <span>Semua Sheet (Master Log)</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                selectedDate === 'ALL' ? 'bg-emerald-700/80 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {records.length}
              </span>
            </button>

            <button
              onClick={() => onSelectDate('WEEK_1')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedDate === 'WEEK_1'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/60'
              }`}
            >
              <Layers className={`w-4 h-4 ${selectedDate === 'WEEK_1' ? 'text-white' : 'text-blue-600'}`} />
              <span>Sheet Week 1 (22 - 26 Dec)</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                selectedDate === 'WEEK_1' ? 'bg-blue-700/80 text-white' : 'bg-blue-100 text-blue-800'
              }`}>
                {records.filter(r => week1Dates.includes(r.date)).length}
              </span>
            </button>

            <button
              onClick={() => onSelectDate('WEEK_2')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedDate === 'WEEK_2'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/60'
              }`}
            >
              <Layers className={`w-4 h-4 ${selectedDate === 'WEEK_2' ? 'text-white' : 'text-indigo-600'}`} />
              <span>Sheet Week 2 (29 - 31 Dec)</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                selectedDate === 'WEEK_2' ? 'bg-indigo-700/80 text-white' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {records.filter(r => week2Dates.includes(r.date)).length}
              </span>
            </button>
          </div>

          {/* Daily Sheet Chips */}
          <div>
            <div className="text-[11px] font-medium text-slate-500 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Sheet Harian (Daily Logs per Tanggal):</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {availableDates.map(d => {
                const isSelected = d === selectedDate;
                const shortDate = d.replace(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/g, match => match.slice(0, 3)).replace(',', '').trim();
                const dayCount = records.filter(r => r.date === d).length;
                return (
                  <button
                    key={d}
                    onClick={() => onSelectDate(d)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm font-semibold'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{shortDate}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                      isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600 font-semibold'
                    }`}>
                      {dayCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{uniqueTrainees.length}</div>
            <div className="text-xs font-medium text-slate-500">Trainees Logged</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{trainersSet.size}</div>
            <div className="text-xs font-medium text-slate-500">Trainers on Duty</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{topicsSet.size}</div>
            <div className="text-xs font-medium text-slate-500">Topics & Modules</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${
            flaggedRemarks.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{flaggedRemarks.length}</div>
            <div className="text-xs font-medium text-slate-500">Remarks / Questions</div>
          </div>
        </div>
      </div>

      {/* AI Daily Executive Summary Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Executive Daily Briefing
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-normal">
                  Powered by Gemini 3.8 Flash
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Automated synthesized highlights for management and team notification emails.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {aiSummary && (
              <button
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors"
              >
                {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSummary ? 'Copied' : 'Copy Text'}</span>
              </button>
            )}
            <button
              onClick={onGenerateAI}
              disabled={isGeneratingAI}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingAI ? 'Analyzing...' : aiSummary ? 'Regenerate Briefing' : 'Generate AI Briefing'}</span>
            </button>
          </div>
        </div>

        {aiSummary ? (
          <div className="pt-4 space-y-4">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/50">
              {aiSummary.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <div className="font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Key Curriculum Milestones:
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  {aiSummary.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <div className="font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Trainee Remarks & Follow-ups:
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  {aiSummary.blockersOrRemarks.map((b, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-4 text-xs text-slate-400 flex items-center justify-between">
            <span>Click "Generate AI Briefing" to extract automated key takeaways, trainer workload, and trainee action items.</span>
          </div>
        )}
      </div>

      {/* Trainees List and Details */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Trainee Training Records ({filteredRecords.length})
            </h3>
            <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold">
              {getHeaderTitle()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search trainee, trainer, module..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 w-52 sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Trainee Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 sm:px-6 w-12 text-center">#</th>
                {isMultiDateView && (
                  <th className="py-3 px-4 sm:px-6 w-44">Tanggal / Sheet</th>
                )}
                <th className="py-3 px-4 sm:px-6 w-60">Trainee & Assigned Mentors</th>
                <th className="py-3 px-4 sm:px-6">Today's Learning Material</th>
                <th className="py-3 px-4 sm:px-6 w-64">Remark / Question</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={isMultiDateView ? 5 : 4} className="py-12 text-center text-slate-400">
                    No trainee log entries found matching this search or sheet.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, idx) => {
                  const trainerLines = rec.trainer
                    .split(/\n|\r/)
                    .filter(t => t.trim().length > 0);

                  const materialLines = rec.learningMaterial
                    .split(/\n|\r/)
                    .filter(m => m.trim().length > 0);

                  const hasRemark = rec.remark && rec.remark.trim().length > 0;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 text-center text-slate-400 text-xs font-mono">
                        {idx + 1}
                      </td>

                      {/* Date Badge in Multi-Date View */}
                      {isMultiDateView && (
                        <td className="py-3.5 px-4 sm:px-6 align-top">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                            <Calendar className="w-3 h-3 text-emerald-600" />
                            {rec.date.replace(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/g, match => match.slice(0, 3)).replace(',', '').trim()}
                          </span>
                        </td>
                      )}

                      {/* Name and Trainer */}
                      <td className="py-3.5 px-4 sm:px-6 align-top">
                        <div className="font-semibold text-slate-900 text-xs sm:text-sm">
                          {rec.name}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {trainerLines.map((t, ti) => {
                            const cleanT = t.replace(/^[0-9]+\.\s*/, '').trim();
                            return (
                              <span
                                key={ti}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200"
                              >
                                {cleanT}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Learning Material */}
                      <td className="py-3.5 px-4 sm:px-6 align-top text-slate-700">
                        <ul className="space-y-1">
                          {materialLines.map((mat, mi) => (
                            <li key={mi} className="flex items-start gap-1.5 text-xs sm:text-sm leading-relaxed">
                              <span className="text-emerald-500 font-bold mt-0.5">•</span>
                              <span>{mat}</span>
                            </li>
                          ))}
                        </ul>
                      </td>

                      {/* Remark / Question */}
                      <td className="py-3.5 px-4 sm:px-6 align-top">
                        {hasRemark ? (
                          <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-2 text-xs text-amber-900 flex items-start gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <span>{rec.remark}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">No questions noted</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Quick Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Viewing <strong>{filteredRecords.length}</strong> of <strong>{dateRecords.length}</strong> trainees for <strong>{getHeaderTitle()}</strong>.
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onSwitchToScript}
              className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1"
            >
              <span>View Apps Script Trigger Code</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
