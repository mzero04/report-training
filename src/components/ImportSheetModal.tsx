import React, { useState, useRef, useMemo } from 'react';
import {
  Upload,
  FileUp,
  FileText,
  Check,
  AlertCircle,
  X,
  Download,
  Copy,
  Table,
  Calendar,
  User,
  BookOpen,
  Info,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { TraineeRecord } from '../types';
import { parseSheetData, getSampleCsvTemplate, ParsedImportResult } from '../utils/csvImportUtils';

interface ImportSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportRecords: (newRecords: TraineeRecord[], mode: 'append' | 'replace') => void;
  currentRecordsCount: number;
}

export const ImportSheetModal: React.FC<ImportSheetModalProps> = ({
  isOpen,
  onClose,
  onImportRecords,
  currentRecordsCount,
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'upload' | 'paste'>('upload');
  const [rawText, setRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [deduplicate, setDeduplicate] = useState<boolean>(true);
  const [copiedTemplate, setCopiedTemplate] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse records whenever rawText changes
  const parseResult: ParsedImportResult | null = useMemo(() => {
    if (!rawText.trim()) return null;
    return parseSheetData(rawText);
  }, [rawText]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleLoadSample = () => {
    const sample = getSampleCsvTemplate();
    setRawText(sample);
    setFileName('sample_training_data.csv');
    setActiveInputTab('paste');
  };

  const handleDownloadSample = () => {
    const sample = getSampleCsvTemplate();
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_daily_training_log.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyTemplate = () => {
    const sample = getSampleCsvTemplate();
    navigator.clipboard.writeText(sample);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleExecuteImport = () => {
    if (!parseResult || parseResult.records.length === 0) return;

    let finalRecords = parseResult.records;

    if (deduplicate) {
      const seen = new Set<string>();
      finalRecords = finalRecords.filter(r => {
        const key = `${r.date}__${r.name}__${r.learningMaterial}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    onImportRecords(finalRecords, importMode);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setRawText('');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      id="import-sheet-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="import-sheet-modal-card"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl my-auto overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Import Data Spreadsheet / Sheet
              </h3>
              <p className="text-xs text-slate-500">
                Impor data log harian peserta dari file CSV, Excel, atau tempel langsung data tabel.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Scrollable */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {/* Method Switcher & Sample Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveInputTab('upload')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                  activeInputTab === 'upload'
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File (CSV/TSV)</span>
              </button>
              <button
                onClick={() => setActiveInputTab('paste')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all ${
                  activeInputTab === 'paste'
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Tempel Data Tabel / CSV</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleLoadSample}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                title="Muat contoh data untuk uji coba"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pakai Contoh Template</span>
              </button>
              <button
                onClick={handleDownloadSample}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
                title="Unduh contoh template CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Unduh CSV</span>
              </button>
            </div>
          </div>

          {/* Input Method: Upload Box */}
          {activeInputTab === 'upload' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/60 scale-[1.01]'
                  : fileName
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileUp className="w-6 h-6" />
              </div>

              {fileName ? (
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900 text-sm">{fileName}</p>
                  <p className="text-xs text-emerald-600 font-medium">
                    File terpilih. Klik atau seret file lain untuk mengganti.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-semibold text-slate-800 text-sm">
                    Tarik & Lepas file CSV/TSV ke sini, atau klik untuk memilih file
                  </p>
                  <p className="text-xs text-slate-400">
                    Mendukung file .csv, .tsv, atau teks bertab dari Google Sheets / Excel
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Input Method: Paste Text Box */}
          {activeInputTab === 'paste' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Tempel teks bertab atau format CSV:</span>
                <button
                  onClick={handleCopyTemplate}
                  className="hover:text-slate-800 flex items-center gap-1 font-medium"
                >
                  {copiedTemplate ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedTemplate ? 'Tersalin!' : 'Salin Header Template'}</span>
                </button>
              </div>
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder={`Date\tName\tToday's Learning Material\tTraineer\tRemark / Question\nMonday, December 22, 2025\tAlex Pratama\tReact Hooks & Vite\tBudi Santoso\tLancar memahami state`}
                rows={6}
                className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden bg-slate-50/50"
              />
            </div>
          )}

          {/* Error Message if parsing failed */}
          {parseResult && parseResult.errors.length > 0 && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold">Perhatian Saat Membaca Data:</span>
                <ul className="list-disc list-inside space-y-0.5">
                  {parseResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Live Data Preview Section */}
          {parseResult && parseResult.validRowsCount > 0 && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                    {parseResult.validRowsCount} Baris Valid Terdeteksi
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-md">
                    {parseResult.datesFound.length} Tanggal
                  </span>
                  <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-md">
                    {parseResult.traineesFound.length} Peserta
                  </span>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/80 sticky top-0 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase">
                    <tr>
                      <th className="py-2 px-3 w-10 text-center">#</th>
                      <th className="py-2 px-3 w-36">Tanggal</th>
                      <th className="py-2 px-3 w-36">Peserta</th>
                      <th className="py-2 px-3">Materi</th>
                      <th className="py-2 px-3 w-32">Trainer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {parseResult.records.slice(0, 8).map((rec, i) => (
                      <tr key={i} className="hover:bg-slate-50/80">
                        <td className="py-1.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {i + 1}
                        </td>
                        <td className="py-1.5 px-3 whitespace-nowrap text-slate-600 font-medium text-[11px]">
                          {rec.date}
                        </td>
                        <td className="py-1.5 px-3 font-semibold text-slate-900">
                          {rec.name}
                        </td>
                        <td className="py-1.5 px-3 truncate max-w-[200px]">
                          {rec.learningMaterial}
                        </td>
                        <td className="py-1.5 px-3 text-slate-600 truncate max-w-[120px]">
                          {rec.trainer}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parseResult.records.length > 8 && (
                <p className="text-[11px] text-slate-400 text-center italic">
                  Menampilkan 8 dari total {parseResult.records.length} baris yang akan diimpor.
                </p>
              )}
            </div>
          )}

          {/* Import Mode Selection */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Opsi Penempatan Data:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  importMode === 'append'
                    ? 'border-emerald-500 bg-emerald-50/40 text-slate-900 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  value="append"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-bold text-xs sm:text-sm">
                    Tambahkan ke Data yang Ada (Append)
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Mempertahankan {currentRecordsCount} data saat ini dan menambahkan baris baru ke log.
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  importMode === 'replace'
                    ? 'border-emerald-500 bg-emerald-50/40 text-slate-900 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-bold text-xs sm:text-sm">
                    Ganti Seluruh Data (Replace)
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Mereset data saat ini dan menggantinya dengan dataset yang baru diimpor.
                  </div>
                </div>
              </label>
            </div>

            {/* Deduplicate Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="deduplicate-checkbox"
                type="checkbox"
                checked={deduplicate}
                onChange={e => setDeduplicate(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
              />
              <label htmlFor="deduplicate-checkbox" className="text-xs text-slate-700 cursor-pointer font-medium">
                Cegah baris duplikat (abaikan jika Tanggal, Nama, dan Materi persis sama)
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            disabled={!rawText}
            className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Input</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-white text-slate-700 text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleExecuteImport}
              disabled={!parseResult || parseResult.validRowsCount === 0}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-sm transition-all"
            >
              <FileUp className="w-4 h-4" />
              <span>
                {parseResult && parseResult.validRowsCount > 0
                  ? `Impor ${parseResult.validRowsCount} Data Peserta`
                  : 'Impor Data ke Sheet'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
