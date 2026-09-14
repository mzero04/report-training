import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { TraineeRecord } from '../types';
import {
  fetchSpreadsheetInfo,
  fetchSheetValues,
  fetchAllSheetsValues,
  createDemoSpreadsheet,
  extractSpreadsheetId,
  SheetInfo
} from '../services/sheetsService';
import {
  FileSpreadsheet,
  Link,
  RefreshCw,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  LogIn,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface SheetsLiveConnectorProps {
  user: User | null;
  onSignIn: () => void;
  isLoggingIn: boolean;
  onDataLoaded: (records: TraineeRecord[], spreadsheetUrl: string) => void;
  currentSpreadsheetUrl?: string;
  initialRecords: TraineeRecord[];
}

export const SheetsLiveConnector: React.FC<SheetsLiveConnectorProps> = ({
  user,
  onSignIn,
  isLoggingIn,
  onDataLoaded,
  currentSpreadsheetUrl,
  initialRecords,
}) => {
  const [sheetUrlInput, setSheetUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sheetInfo, setSheetInfo] = useState<SheetInfo | null>(null);
  const [selectedSheetTitle, setSelectedSheetTitle] = useState<string>('');
  const [createdSheetUrl, setCreatedSheetUrl] = useState<string | null>(null);

  const handleConnectSheet = async () => {
    if (!sheetUrlInput.trim()) {
      setErrorMsg('Please enter a Google Spreadsheet URL or ID.');
      return;
    }

    const spreadsheetId = extractSpreadsheetId(sheetUrlInput);
    if (!spreadsheetId) {
      setErrorMsg('Could not detect a valid Google Spreadsheet ID.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const info = await fetchSpreadsheetInfo(spreadsheetId);
      setSheetInfo(info);
      setSelectedSheetTitle('__ALL__');

      // Fetch values for all tabs by default
      const sheetTitles = info.sheets.map(s => s.title);
      const rows = sheetTitles.length > 1
        ? await fetchAllSheetsValues(spreadsheetId, sheetTitles)
        : await fetchSheetValues(spreadsheetId, sheetTitles[0] || 'Sheet1');

      const fullUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
      onDataLoaded(rows, fullUrl);
    } catch (err: unknown) {
      console.error('Error connecting sheet:', err);
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = async (newTitle: string) => {
    if (!sheetInfo) return;
    setSelectedSheetTitle(newTitle);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const rows = newTitle === '__ALL__'
        ? await fetchAllSheetsValues(sheetInfo.id, sheetInfo.sheets.map(s => s.title))
        : await fetchSheetValues(sheetInfo.id, newTitle);

      const fullUrl = `https://docs.google.com/spreadsheets/d/${sheetInfo.id}/edit`;
      onDataLoaded(rows, fullUrl);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewSheet = async () => {
    if (!user) {
      onSignIn();
      return;
    }

    setIsCreatingSheet(true);
    setErrorMsg(null);

    try {
      const result = await createDemoSpreadsheet(initialRecords);
      setCreatedSheetUrl(result.url);
      setSheetUrlInput(result.url);
      
      // Load this newly created sheet with all tabs
      const info = await fetchSpreadsheetInfo(result.spreadsheetId);
      setSheetInfo(info);
      setSelectedSheetTitle('__ALL__');
      onDataLoaded(initialRecords, result.url);
    } catch (err: unknown) {
      console.error('Error creating sheet:', err);
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsCreatingSheet(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Google Sheets Cloud Integration</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Connect Your Live Team Spreadsheet
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
            Link directly to your Google Spreadsheet via the Google Sheets API to read trainee records in real time, or generate a brand new Google Sheet in your Google Drive with the template pre-populated.
          </p>
        </div>
      </div>

      {/* Auth Status Banner */}
      {!user && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Sign in with Google to Connect Sheets
              </h3>
              <p className="text-xs text-blue-200">
                Grant read/write access to your team's Google Sheets to load logs and automate reports.
              </p>
            </div>
          </div>

          <button
            onClick={onSignIn}
            disabled={isLoggingIn}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-4 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
          </button>
        </div>
      )}

      {/* Grid: Connect Existing vs Create New */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Box 1: Connect Existing Sheet */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Link className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Connect an Existing Spreadsheet
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Paste the URL or ID of your team's Google Sheet (e.g. from your browser address bar):
            </p>

            <div>
              <input
                type="text"
                value={sheetUrlInput}
                onChange={e => setSheetUrlInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5.../edit"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {sheetInfo && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{sheetInfo.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Sheet tab:</span>
                  <select
                    value={selectedSheetTitle}
                    onChange={e => handleTabChange(e.target.value)}
                    className="px-2 py-1 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-emerald-500 font-medium"
                  >
                    <option value="__ALL__">📑 Semua Sheet (Gabungkan Seluruh Tab)</option>
                    {sheetInfo.sheets.map(s => (
                      <option key={s.id} value={s.title}>
                        📄 Sheet: {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3">
            <button
              onClick={handleConnectSheet}
              disabled={isLoading || !user}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Reading Sheet Values...' : 'Fetch & Sync Data'}</span>
            </button>
          </div>
        </div>

        {/* Box 2: Create New Google Sheet Template */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Create New Google Sheet with Template
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Don't have a spreadsheet set up yet? Click below to create a brand new Google Spreadsheet in your Google Drive with all 8 team members and all training records pre-formatted:
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1 text-slate-600">
              <div className="font-semibold text-slate-700">Preloaded Dataset Includes:</div>
              <div>• 8 Trainees (Aulia Darma Putra, Jaka, Diva, Viona, Garnis, Mita, Tasya, Hamidah)</div>
              <div>• 7 Training Days (Dec 22 – Dec 31, 2025)</div>
              <div>• Pre-Layout, Sewing Sub Layout, Algorism, Defect Control modules</div>
            </div>

            {createdSheetUrl && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                <span className="font-medium">New sheet created successfully!</span>
                <a
                  href={createdSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold inline-flex items-center gap-1 text-emerald-700 hover:underline"
                >
                  <span>Open Sheet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          <div className="pt-3">
            <button
              onClick={handleCreateNewSheet}
              disabled={isCreatingSheet || !user}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isCreatingSheet ? 'Creating Sheet in Drive...' : 'Create New Spreadsheet in Google Drive'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
