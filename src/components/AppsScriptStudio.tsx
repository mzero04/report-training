import React, { useState } from 'react';
import { ScriptConfig } from '../types';
import { generateAppScriptCode, generateManifestJson } from '../services/appScriptGenerator';
import {
  Code2,
  Copy,
  Check,
  Download,
  Settings2,
  Clock,
  Mail,
  FileSpreadsheet,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileCode
} from 'lucide-react';

interface AppsScriptStudioProps {
  config: ScriptConfig;
  onUpdateConfig: (newConfig: ScriptConfig) => void;
  onOpenPreview: () => void;
}

export const AppsScriptStudio: React.FC<AppsScriptStudioProps> = ({
  config,
  onUpdateConfig,
  onOpenPreview,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'code' | 'manifest' | 'guide'>('code');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);

  const generatedCode = generateAppScriptCode(config);
  const manifestJson = generateManifestJson();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(manifestJson);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Code.gs';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              <Code2 className="w-3.5 h-3.5" />
              <span>Production-Grade Apps Script Studio</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Automated Daily Report & Notification Script
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
              This Apps Script is tailored for your spreadsheet structure (Date, Trainee Name, Learning Material, Trainer, Remarks).
              It handles grouped dates, builds responsive HTML emails, logs dispatches, and installs a daily scheduled time trigger.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copied Code.gs!' : 'Copy Code.gs'}</span>
            </button>
            <button
              onClick={handleDownloadCode}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Config Sidebar + Code Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Script Configuration Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Settings2 className="w-4 h-4 text-slate-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Script Automation Settings
              </h3>
            </div>

            {/* Recipients */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Recipient Email(s)
              </label>
              <input
                type="text"
                value={config.recipients}
                onChange={e => onUpdateConfig({ ...config, recipients: e.target.value })}
                placeholder="manager@company.com, team@company.com"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Comma-separated team leads and managers who will receive the daily digest.
              </p>
            </div>

            {/* CC Recipients */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                CC Recipients (Optional)
              </label>
              <input
                type="text"
                value={config.ccRecipients}
                onChange={e => onUpdateConfig({ ...config, ccRecipients: e.target.value })}
                placeholder="hr@company.com"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Subject Prefix */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Subject Prefix
              </label>
              <input
                type="text"
                value={config.subjectPrefix}
                onChange={e => onUpdateConfig({ ...config, subjectPrefix: e.target.value })}
                placeholder="[Daily Training Report]"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Sender Name */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Sender Bot Name
              </label>
              <input
                type="text"
                value={config.senderName}
                onChange={e => onUpdateConfig({ ...config, senderName: e.target.value })}
                placeholder="Team Training Bot"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Trigger Hour */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                <span>Automated Trigger Schedule</span>
                <span className="text-emerald-600 font-bold">{config.triggerHour}:00 ({config.triggerHour > 12 ? `${config.triggerHour - 12}:00 PM` : `${config.triggerHour}:00 AM`})</span>
              </label>
              <input
                type="range"
                min="8"
                max="21"
                step="1"
                value={config.triggerHour}
                onChange={e => onUpdateConfig({ ...config, triggerHour: parseInt(e.target.value, 10) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>8:00 AM</span>
                <span>5:00 PM (17h)</span>
                <span>9:00 PM</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={config.weekdaysOnly}
                  onChange={e => onUpdateConfig({ ...config, weekdaysOnly: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                />
                <span>Skip weekends (run Monday–Friday only)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={config.includeSheetLink}
                  onChange={e => onUpdateConfig({ ...config, includeSheetLink: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                />
                <span>Include "Open Live Spreadsheet" button in email</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={config.createAuditTab}
                  onChange={e => onUpdateConfig({ ...config, createAuditTab: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                />
                <span>Log dispatches to a [Daily_Report_Logs] sheet tab</span>
              </label>
            </div>

            <div className="pt-3">
              <button
                onClick={onOpenPreview}
                className="w-full py-2 px-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Preview Email Output</span>
              </button>
            </div>

          </div>

          {/* Quick Features Highlight */}
          <div className="bg-slate-900 text-white rounded-xl p-4 text-xs space-y-2.5 border border-slate-800">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Built-in Safety & Robustness
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              ✓ <strong>Merged/Grouped Dates:</strong> Automatically forward-fills blank date rows so multi-trainee days are never truncated.
            </p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              ✓ <strong>Flexible Headers:</strong> Detects column aliases (e.g. <em>Traineer</em>, <em>Trainer</em>, <em>Materi</em>, <em>Remarks</em>).
            </p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              ✓ <strong>Duplicate Protection:</strong> Automatically clears stale project triggers before registering a new daily schedule.
            </p>
          </div>
        </div>

        {/* Right Column: Code Viewer and Installation Guide */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          
          {/* Tabs bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-900 text-white border-b border-slate-800">
            <div className="flex items-center space-x-1 text-xs">
              <button
                onClick={() => setActiveSubTab('code')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  activeSubTab === 'code' ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Code.gs (Main Script)</span>
              </button>
              <button
                onClick={() => setActiveSubTab('manifest')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  activeSubTab === 'manifest' ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>appsscript.json (Scopes)</span>
              </button>
              <button
                onClick={() => setActiveSubTab('guide')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  activeSubTab === 'guide' ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Installation Guide (5 Steps)</span>
              </button>
            </div>

            <div>
              {activeSubTab === 'code' ? (
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              ) : activeSubTab === 'manifest' ? (
                <button
                  onClick={handleCopyManifest}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                >
                  {copiedManifest ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedManifest ? 'Copied' : 'Copy'}</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Sub Tab Content */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {activeSubTab === 'code' ? (
              <div className="relative">
                <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto max-h-[620px] border border-slate-800">
                  {generatedCode}
                </pre>
              </div>
            ) : activeSubTab === 'manifest' ? (
              <div className="space-y-4">
                <div className="text-xs text-slate-600 leading-relaxed">
                  The <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono">appsscript.json</code> manifest file defines the required OAuth permissions for MailApp, Gmail, and Spreadsheet access.
                  In Apps Script, click <strong>Project Settings</strong> (gear icon) &gt; check <strong>"Show 'appsscript.json' manifest file in editor"</strong>.
                </div>
                <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800">
                  {manifestJson}
                </pre>
              </div>
            ) : (
              /* Step-by-Step Installation Guide */
              <div className="space-y-6 text-slate-800">
                <div className="border-l-4 border-emerald-500 pl-4 py-1">
                  <h4 className="font-bold text-base text-slate-900">
                    How to Install this Script in Your Google Spreadsheet
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Follow these 5 simple steps to have automated daily reports running directly in your team's sheet.
                  </p>
                </div>

                <div className="space-y-4 text-xs sm:text-sm">
                  
                  <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      1
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-semibold mb-1">Open Apps Script in Google Sheets</strong>
                      <p className="text-slate-600">
                        Open your Google Spreadsheet, click on the top menu bar: <span className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono text-xs font-semibold">Extensions</span> &gt; <span className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono text-xs font-semibold">Apps Script</span>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      2
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-semibold mb-1">Paste the Code into Code.gs</strong>
                      <p className="text-slate-600">
                        Select any boilerplate code in the editor (e.g. <code className="font-mono bg-white px-1">function myFunction()</code>), delete it, and paste the code from the <strong>Code.gs</strong> tab above. Then click the <strong className="font-semibold">💾 Save</strong> button (or press Ctrl+S / Cmd+S).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      3
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-semibold mb-1">Refresh Your Spreadsheet Tab</strong>
                      <p className="text-slate-600">
                        Return to your spreadsheet browser tab and hit reload (F5). After a few seconds, a brand new custom menu will appear at the top: <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-semibold text-xs">📋 Daily Report Automation</span>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      4
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-semibold mb-1">Install the Automated Daily Trigger</strong>
                      <p className="text-slate-600">
                        Click on <span className="font-semibold text-slate-900">📋 Daily Report Automation</span> &gt; <span className="font-semibold text-slate-900">⏰ Setup Daily Automated Trigger</span>. Google will prompt you to grant authorization the first time (standard for any Apps Script).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      5
                    </div>
                    <div>
                      <strong className="text-slate-900 block font-semibold mb-1">Test Run & Enjoy!</strong>
                      <p className="text-slate-600">
                        You can immediately test by clicking <span className="font-semibold text-slate-900">📧 Send Today's Daily Report</span> or <span className="font-semibold text-slate-900">👁️ Preview Today's Email</span> to see the modal preview right inside Google Sheets.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      6
                    </div>
                    <div>
                      <strong className="text-emerald-950 block font-semibold mb-1">📁 Ekspor Berdasarkan Bulan & Tahun (Monthly Archive)</strong>
                      <p className="text-emerald-900 text-xs">
                        Klik <span className="font-semibold">📋 Daily Report Automation</span> &gt; <span className="font-semibold">📁 Export All Sheets by Month & Year</span> untuk otomatis membuat tab arsip bulanan (misal: <code>[2025-12] Summary</code>) lengkap dengan tabel, format rapi, dan metrik peserta, atau pilih <span className="font-semibold">📦 Export Monthly Data to Drive Folder</span> untuk mengunduh CSV ke Google Drive.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-blue-50/70 p-3.5 rounded-xl border border-blue-200">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      7
                    </div>
                    <div>
                      <strong className="text-blue-950 block font-semibold mb-1">📥 Impor Data ke Sheet (CSV / TSV & Drive Archive)</strong>
                      <p className="text-blue-900 text-xs">
                        Gunakan menu <span className="font-semibold">📥 Import Data to Sheet (CSV / Paste)</span> untuk menempelkan data tabel baru (Append ke sheet aktif atau buat tab sheet baru), atau pilih <span className="font-semibold">📥 Import Data from Google Drive Archive</span> untuk langsung memulihkan arsip CSV bulanan dari folder Google Drive Anda.
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
