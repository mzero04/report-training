import React, { useState } from 'react';
import { TraineeRecord } from '../types';
import {
  groupRecordsByMonthAndYear,
  generateCsv,
  triggerFileDownload,
  generateMonthlyHtmlReport,
  MonthYearGroup
} from '../utils/dateExportUtils';
import {
  X,
  Download,
  Calendar,
  FileSpreadsheet,
  Printer,
  FileCode,
  CheckCircle2,
  ExternalLink,
  Users,
  GraduationCap,
  Sparkles,
  BookOpen,
  Filter
} from 'lucide-react';

interface ExportMonthlyModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: TraineeRecord[];
  spreadsheetUrl?: string;
  onNavigateToScript?: () => void;
}

export const ExportMonthlyModal: React.FC<ExportMonthlyModalProps> = ({
  isOpen,
  onClose,
  records,
  spreadsheetUrl,
  onNavigateToScript,
}) => {
  const groups = groupRecordsByMonthAndYear(records);
  const [selectedKey, setSelectedKey] = useState<string>(groups[0]?.key || '');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentGroup: MonthYearGroup | undefined = groups.find(g => g.key === selectedKey) || groups[0];

  const handleExportMonthCsv = (group: MonthYearGroup) => {
    const csv = generateCsv(group.records);
    const filename = `Trainee_Report_${group.key}_${group.monthName}_${group.year}.csv`;
    triggerFileDownload(csv, filename, 'text/csv;charset=utf-8;');
    setDownloadSuccess(`Berhasil mengunduh CSV ${group.label}!`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleExportAllCsv = () => {
    const csv = generateCsv(records);
    const filename = `All_Trainee_Reports_Master_${records.length}_records.csv`;
    triggerFileDownload(csv, filename, 'text/csv;charset=utf-8;');
    setDownloadSuccess('Berhasil mengunduh Master CSV untuk semua bulan!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handlePrintMonthlyReport = (group: MonthYearGroup) => {
    const html = generateMonthlyHtmlReport(group);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  const handleExportJson = (group?: MonthYearGroup) => {
    const dataToExport = group ? group.records : records;
    const jsonStr = JSON.stringify(dataToExport, null, 2);
    const filename = group
      ? `Trainee_Report_${group.key}.json`
      : `Trainee_Reports_All.json`;
    triggerFileDownload(jsonStr, filename, 'application/json');
    setDownloadSuccess(`Berhasil mengunduh JSON!`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Export Spreadsheet Berdasarkan Bulan & Tahun
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-normal">
                  {groups.length} Periode Bulan
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Ekspor data trainee per bulan/tahun dalam format CSV Excel, HTML Cetak/PDF, atau buat sheet arsip bulanan.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Download Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Total Keseluruhan:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 font-bold">
              {records.length} Baris Data
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">Terbagi dalam {groups.length} bulan</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAllCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Semua Bulan (Master CSV)</span>
            </button>
            <button
              onClick={() => handleExportJson()}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 font-medium transition-colors"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>JSON Backup</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {downloadSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{downloadSuccess}</span>
          </div>
        )}

        {/* Main Content: Month Selector + Month Detail */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-100/60">
          
          {/* Left Column: Month-Year Selector Cards */}
          <div className="md:col-span-1 space-y-3">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Pilih Periode Bulan & Tahun:
            </label>

            <div className="space-y-2">
              {groups.map(g => {
                const isSelected = g.key === currentGroup?.key;
                return (
                  <button
                    key={g.key}
                    onClick={() => setSelectedKey(g.key)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500'
                        : 'bg-white/80 hover:bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <Calendar className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{g.label}</span>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {g.records.length} Data
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                      <span>{g.dates.length} Hari Pelatihan</span>
                      <span>{g.uniqueTrainees.length} Peserta</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Google Sheets Native Apps Script Box */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-xl p-4 text-xs space-y-2.5 border border-slate-800 mt-4">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Otomatisasi Google Sheets
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Ingin spreadsheet membuat sheet tab bulanan otomatis langsung di Google Sheets?
              </p>
              <div className="bg-slate-800/80 p-2 rounded border border-slate-700 font-mono text-[10px] text-emerald-300">
                Menu: 📁 Export All Sheets by Month & Year
              </div>
              {onNavigateToScript && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToScript();
                  }}
                  className="w-full mt-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-[11px] text-center block transition-colors"
                >
                  Buka Kode Apps Script (Code.gs)
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Selected Month Detail & Action Bar */}
          {currentGroup && (
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                
                {/* Header of selected month */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                      Detail Periode Terpilih
                    </span>
                    <h4 className="text-lg font-bold text-slate-900">
                      {currentGroup.label}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Mencakup {currentGroup.dates.length} tanggal aktif dari total {currentGroup.records.length} log entri peserta.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportMonthCsv(currentGroup)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download CSV {currentGroup.monthName}</span>
                    </button>
                    <button
                      onClick={() => handlePrintMonthlyReport(currentGroup)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold text-xs transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak / PDF</span>
                    </button>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="text-xl font-bold text-slate-900">{currentGroup.records.length}</div>
                    <div className="text-[11px] font-medium text-slate-500">Total Entri</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="text-xl font-bold text-blue-600">{currentGroup.uniqueTrainees.length}</div>
                    <div className="text-[11px] font-medium text-slate-500">Peserta / Trainee</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="text-xl font-bold text-purple-600">{currentGroup.dates.length}</div>
                    <div className="text-[11px] font-medium text-slate-500">Hari Kerja/Training</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="text-xl font-bold text-amber-600">{currentGroup.remarksCount}</div>
                    <div className="text-[11px] font-medium text-slate-500">Catatan / Kendala</div>
                  </div>
                </div>

                {/* Trainee Roster Pills */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                    Daftar Trainee Bulan Ini:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {currentGroup.uniqueTrainees.map(name => (
                      <span
                        key={name}
                        className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Data preview table snippet */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Pratinjau Data ({currentGroup.records.length} baris):
                    </label>
                    <span className="text-[11px] text-slate-400">Format Excel kompatibel</span>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-[11px] text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                        <tr>
                          <th className="py-2 px-3 w-10 text-center">#</th>
                          <th className="py-2 px-3 w-40">Tanggal</th>
                          <th className="py-2 px-3 w-40">Nama Trainee</th>
                          <th className="py-2 px-3">Materi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentGroup.records.map((r, i) => (
                          <tr key={r.id || i} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 text-center text-slate-400 font-mono text-[11px]">{i + 1}</td>
                            <td className="py-1.5 px-3 font-medium text-slate-800 whitespace-nowrap">{r.date}</td>
                            <td className="py-1.5 px-3 font-semibold text-slate-900">{r.name}</td>
                            <td className="py-1.5 px-3 text-slate-600 truncate max-w-xs">{r.learningMaterial}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Data siap diekspor ke Microsoft Excel, Google Sheets, atau CSV terenkripsi UTF-8.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
