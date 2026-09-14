import React, { useState } from 'react';
import { TraineeRecord, AISummaryResponse, ScriptConfig } from '../types';
import {
  X,
  Smartphone,
  Monitor,
  Copy,
  Check,
  Download,
  Mail,
  Send,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  records: TraineeRecord[];
  config: ScriptConfig;
  aiSummary: AISummaryResponse | null;
  spreadsheetUrl?: string;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  date,
  records,
  config,
  aiSummary,
  spreadsheetUrl,
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'preview' | 'html' | 'text'>('preview');
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [customNote, setCustomNote] = useState('');

  if (!isOpen) return null;

  // Aggregate stats
  const trainersSet = new Set<string>();
  const topicsSet = new Set<string>();
  let remarksCount = 0;

  records.forEach(r => {
    r.trainer.split(/\n|\r|[0-9]+\./).forEach(t => {
      const clean = t.replace(/^[^a-zA-Z]+/, '').trim();
      if (clean.length > 2) trainersSet.add(clean);
    });
    r.learningMaterial.split(/\n|\r|[0-9]+\./).forEach(m => {
      const cleanM = m.replace(/^[^a-zA-Z0-9]+/, '').trim();
      if (cleanM.length > 3) topicsSet.add(cleanM);
    });
    if (r.remark && r.remark.trim().length > 0) remarksCount++;
  });

  const trainersList = Array.from(trainersSet);
  const topicsList = Array.from(topicsSet);

  // Generate HTML
  const escapeHtml = (str: string) => {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const rowsHtml = records.map((rec, idx) => {
    const isEven = idx % 2 === 0;
    const bgStyle = isEven ? '#ffffff' : '#f8fafc';

    const matList = rec.learningMaterial
      .split(/\n|\r/)
      .filter(line => line.trim().length > 0)
      .map(line => `<li style="margin-bottom: 4px; line-height: 1.4;">${escapeHtml(line.trim())}</li>`)
      .join('');

    const trainerBadges = rec.trainer
      .split(/\n|\r/)
      .filter(line => line.trim().length > 0)
      .map(t => {
        const clean = t.replace(/^[0-9]+\.\s*/, '').trim();
        return `<span style="display:inline-block; background-color:#eff6ff; color:#1d4ed8; padding:2px 8px; border-radius:12px; font-size:12px; font-weight:500; margin:2px 4px 2px 0; border:1px solid #bfdbfe;">${escapeHtml(clean)}</span>`;
      })
      .join(' ');

    const remarkHtml = rec.remark && rec.remark.trim()
      ? `<div style="background:#fffbeb; border-left:3px solid #f59e0b; padding:6px 10px; font-size:12px; color:#92400e; border-radius:0 4px 4px 0; margin-top:4px;"><strong>Notice:</strong> ${escapeHtml(rec.remark)}</div>`
      : `<span style="color:#94a3b8; font-size:12px;">— None —</span>`;

    return `
      <tr style="background-color:${bgStyle}; border-bottom:1px solid #e2e8f0;">
        <td style="padding:12px 14px; font-weight:600; color:#0f172a; vertical-align:top; font-size:13px; width:180px;">
          <div style="font-size:14px; color:#1e293b;">${escapeHtml(rec.name)}</div>
          <div style="font-size:11px; color:#64748b; font-weight:normal; margin-top:2px;">📅 ${escapeHtml(rec.date.replace(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/g, m => m.slice(0, 3)).replace(',', '').trim())}</div>
          <div style="margin-top:6px;">${trainerBadges}</div>
        </td>
        <td style="padding:12px 14px; color:#334155; vertical-align:top; font-size:13px;">
          <ul style="margin:0; padding-left:18px; color:#334155;">${matList}</ul>
        </td>
        <td style="padding:12px 14px; vertical-align:top; width:220px;">
          ${remarkHtml}
        </td>
      </tr>
    `;
  }).join('');

  const topicsSummaryHtml = topicsList.slice(0, 8).map(t => {
    return `<span style="display:inline-block; background-color:#f1f5f9; color:#475569; padding:4px 10px; border-radius:6px; font-size:12px; margin:3px 4px 3px 0; border:1px solid #e2e8f0;">• ${escapeHtml(t)}</span>`;
  }).join('');

  const executiveBriefingHtml = aiSummary ? `
    <div style="background-color:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:16px 20px; margin-bottom:24px;">
      <div style="font-size:12px; font-weight:700; color:#1d4ed8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">Executive Briefing</div>
      <p style="margin:0 0 10px 0; font-size:13px; color:#1e3a8a; line-height:1.5;">${escapeHtml(aiSummary.summary)}</p>
      ${aiSummary.blockersOrRemarks.length > 0 ? `
        <div style="font-size:12px; color:#92400e; background:#fffbeb; padding:8px 12px; border-radius:6px; border:1px solid #fef3c7;">
          <strong>Attention Needed:</strong> ${aiSummary.blockersOrRemarks.join('; ')}
        </div>
      ` : ''}
    </div>
  ` : '';

  const fullEmailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Report - ${escapeHtml(date)}</title>
</head>
<body style="margin:0; padding:20px; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#0f172a;">
  <div style="max-width:760px; margin:0 auto; background-color:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
    
    <!-- HEADER -->
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color:#ffffff; padding:28px 32px;">
      <div style="font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#93c5fd; margin-bottom:4px;">Team Daily Progress Report</div>
      <h1 style="margin:0; font-size:24px; font-weight:700; letter-spacing:-0.5px; color:#ffffff;">${escapeHtml(date)}</h1>
      <div style="font-size:13px; color:#cbd5e1; margin-top:6px;">Automated daily log generated for ${escapeHtml(config.senderName)}</div>
    </div>

    <!-- KPI METRICS BAR -->
    <div style="background-color:#f8fafc; border-bottom:1px solid #e2e8f0; padding:18px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="text-align:center; padding:6px; border-right:1px solid #e2e8f0;">
            <div style="font-size:26px; font-weight:800; color:#1e3a8a;">${records.length}</div>
            <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:#64748b; margin-top:2px;">Trainees Active</div>
          </td>
          <td style="text-align:center; padding:6px; border-right:1px solid #e2e8f0;">
            <div style="font-size:26px; font-weight:800; color:#2563eb;">${trainersList.length}</div>
            <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:#64748b; margin-top:2px;">Trainers on Duty</div>
          </td>
          <td style="text-align:center; padding:6px; border-right:1px solid #e2e8f0;">
            <div style="font-size:26px; font-weight:800; color:#059669;">${topicsList.length}</div>
            <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:#64748b; margin-top:2px;">Topics Covered</div>
          </td>
          <td style="text-align:center; padding:6px;">
            <div style="font-size:26px; font-weight:800; color:${remarksCount > 0 ? '#d97706' : '#64748b'};">${remarksCount}</div>
            <div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:#64748b; margin-top:2px;">Flagged Remarks</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- MAIN CONTENT -->
    <div style="padding:28px 32px;">
      
      ${executiveBriefingHtml}

      ${customNote ? `
        <div style="background-color:#f8fafc; border-left:4px solid #2563eb; padding:12px 16px; margin-bottom:24px; font-size:13px; color:#334155; line-height:1.5;">
          <strong>Manager Note:</strong> ${escapeHtml(customNote)}
        </div>
      ` : ''}

      <!-- Curriculum Summary -->
      <div style="margin-bottom:24px;">
        <h3 style="margin:0 0 10px 0; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#334155;">Key Curriculum & Modules Trained Today</h3>
        <div>${topicsSummaryHtml}</div>
      </div>

      <!-- Trainee Breakdown Table -->
      <div style="border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; margin-bottom:24px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; text-align:left;">
          <thead>
            <tr style="background-color:#f1f5f9; border-bottom:2px solid #cbd5e1;">
              <th style="padding:12px 14px; font-size:12px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">Trainee & Trainers</th>
              <th style="padding:12px 14px; font-size:12px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">Today's Learning Material</th>
              <th style="padding:12px 14px; font-size:12px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">Remarks & Questions</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      ${config.includeSheetLink && spreadsheetUrl ? `
        <div style="text-align:center; padding:12px 0 8px 0;">
          <a href="${spreadsheetUrl}" style="display:inline-block; background-color:#2563eb; color:#ffffff; font-weight:600; font-size:14px; text-decoration:none; padding:12px 24px; border-radius:6px; box-shadow:0 2px 4px rgba(37,99,235,0.2);">
            📊 Open Live Google Spreadsheet
          </a>
        </div>
      ` : ''}

    </div>

    <!-- FOOTER -->
    <div style="background-color:#f8fafc; border-top:1px solid #e2e8f0; padding:20px 32px; font-size:12px; color:#64748b; text-align:center; line-height:1.5;">
      <div>Sent automatically by <strong>${escapeHtml(config.senderName)}</strong> via Google Apps Script.</div>
      <div style="margin-top:4px;">Automated schedule trigger: Every day at ${config.triggerHour}:00 (${config.weekdaysOnly ? 'Weekdays only' : 'Daily'}).</div>
    </div>

  </div>
</body>
</html>`;

  const plainTextEmail = `DAILY TRAINING REPORT: ${date}
==================================================
Recipients: ${config.recipients}
Trainees Active: ${records.length} | Trainers: ${trainersList.join(', ')}

${aiSummary ? `Executive Summary:\n${aiSummary.summary}\n\n` : ''}
Trainee Details:
${records.map(r => `- ${r.name} (Trainers: ${r.trainer.replace(/\n/g, ', ')})\n  Learning: ${r.learningMaterial.replace(/\n/g, ' ')}${r.remark ? `\n  Remark: ${r.remark}` : ''}`).join('\n\n')}

Automated dispatch by Google Apps Script.`;

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(fullEmailHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPlainText = () => {
    navigator.clipboard.writeText(plainTextEmail);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([fullEmailHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-report-${date.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Team Email Notification Preview
              </h3>
              <p className="text-xs text-slate-400">
                Subject: {config.subjectPrefix} Team Report - {date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Visual Preview
              </button>
              <button
                onClick={() => setViewMode('html')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'html' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                HTML Source
              </button>
              <button
                onClick={() => setViewMode('text')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'text' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                Plain Text
              </button>
            </div>

            {/* Device Width Toggle */}
            {viewMode === 'preview' && (
              <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
                <button
                  onClick={() => setDeviceMode('desktop')}
                  className={`p-1.5 rounded-md ${deviceMode === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeviceMode('mobile')}
                  className={`p-1.5 rounded-md ${deviceMode === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Email Header Metadata Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 w-16">To:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
              {config.recipients || 'team-leads@company.com, trainee-mentors@company.com'}
            </span>
            {config.ccRecipients && (
              <>
                <span className="font-semibold text-slate-700 ml-2">CC:</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                  {config.ccRecipients}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 w-16">Subject:</span>
            <span className="font-medium text-slate-900">
              {config.subjectPrefix} Team Daily Training & Activity Report - {date}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70">
          {viewMode === 'preview' ? (
            <div className="flex justify-center">
              <div
                className={`transition-all duration-300 ${
                  deviceMode === 'mobile' ? 'w-[380px] shadow-lg rounded-2xl overflow-hidden' : 'w-full max-w-[760px]'
                }`}
              >
                <div
                  className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: fullEmailHtml }}
                />
              </div>
            </div>
          ) : viewMode === 'html' ? (
            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[60vh]">
              <pre>{fullEmailHtml}</pre>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl border border-slate-200 font-mono text-xs whitespace-pre-wrap text-slate-800 max-h-[60vh] overflow-y-auto">
              {plainTextEmail}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Automated by Apps Script with <strong>{records.length} trainees</strong>, <strong>{trainersList.length} trainers</strong>.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPlainText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copied Text' : 'Copy Plain Text'}</span>
            </button>
            <button
              onClick={handleCopyHtml}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied HTML' : 'Copy HTML Code'}</span>
            </button>
            <button
              onClick={handleDownloadHtml}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download HTML</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
