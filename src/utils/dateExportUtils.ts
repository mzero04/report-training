import { TraineeRecord } from '../types';

export interface MonthYearGroup {
  key: string; // e.g. "2025-12"
  label: string; // e.g. "December 2025"
  year: number;
  month: number; // 1-12
  monthName: string;
  records: TraineeRecord[];
  dates: string[];
  uniqueTrainees: string[];
  uniqueTrainers: string[];
  remarksCount: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Attempts to parse any date string format from Google Sheets:
 * - "Monday, December 22, 2025"
 * - "2025-12-22"
 * - "22/12/2025" or "12/22/2025"
 * - ISO timestamp
 */
export function parseAnyDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const cleaned = dateStr.trim();
  if (!cleaned) return null;

  // Try standard Date.parse
  const directParsed = new Date(cleaned);
  if (!isNaN(directParsed.getTime())) {
    return directParsed;
  }

  // Try extracting Month, Day, Year from words e.g. "Monday, December 22, 2025"
  for (let m = 0; m < MONTH_NAMES.length; m++) {
    const monthName = MONTH_NAMES[m];
    const regex = new RegExp(`${monthName}\\s+(\\d{1,2}),?\\s+(\\d{4})`, 'i');
    const match = cleaned.match(regex);
    if (match) {
      const day = parseInt(match[1], 10);
      const year = parseInt(match[2], 10);
      const d = new Date(year, m, day);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // Try YYYY-MM-DD
  const isoMatch = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10) - 1;
    const d = parseInt(isoMatch[3], 10);
    return new Date(y, m, d);
  }

  // Try DD/MM/YYYY or MM/DD/YYYY
  const slashMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const p1 = parseInt(slashMatch[1], 10);
    const p2 = parseInt(slashMatch[2], 10);
    const y = parseInt(slashMatch[3], 10);
    // If p1 > 12, assume DD/MM/YYYY
    if (p1 > 12) {
      return new Date(y, p2 - 1, p1);
    }
    // Default to MM/DD/YYYY or DD/MM/YYYY
    return new Date(y, p1 - 1, p2);
  }

  return null;
}

/**
 * Formats a Date into "Monday, December 22, 2025"
 */
export function formatToLongDate(date: Date): string {
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const month = MONTH_NAMES[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${weekday}, ${month} ${day}, ${year}`;
}

/**
 * Formats a Date into standard "YYYY-MM-DD" for HTML input[type="date"]
 */
export function formatToIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Extracts Month and Year information from a record date string
 */
export function getMonthYearMeta(dateStr: string): { key: string; label: string; year: number; month: number; monthName: string } {
  const parsed = parseAnyDate(dateStr);
  if (parsed) {
    const year = parsed.getFullYear();
    const month = parsed.getMonth() + 1;
    const monthName = MONTH_NAMES[parsed.getMonth()];
    const key = `${year}-${String(month).padStart(2, '0')}`;
    const label = `${monthName} ${year}`;
    return { key, label, year, month, monthName };
  }

  // Fallback regex search if date object couldn't be formed
  for (let m = 0; m < MONTH_NAMES.length; m++) {
    const monthName = MONTH_NAMES[m];
    if (dateStr.toLowerCase().includes(monthName.toLowerCase())) {
      const yearMatch = dateStr.match(/\b(20\d\d)\b/);
      const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
      const month = m + 1;
      const key = `${year}-${String(month).padStart(2, '0')}`;
      const label = `${monthName} ${year}`;
      return { key, label, year, month, monthName };
    }
  }

  // Default fallback
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return {
    key: `${year}-${String(month).padStart(2, '0')}`,
    label: `${MONTH_NAMES[now.getMonth()]} ${year}`,
    year,
    month,
    monthName: MONTH_NAMES[now.getMonth()],
  };
}

/**
 * Groups trainee records by Month and Year
 */
export function groupRecordsByMonthAndYear(records: TraineeRecord[]): MonthYearGroup[] {
  const groupsMap = new Map<string, MonthYearGroup>();

  records.forEach(rec => {
    const meta = getMonthYearMeta(rec.date);
    if (!groupsMap.has(meta.key)) {
      groupsMap.set(meta.key, {
        key: meta.key,
        label: meta.label,
        year: meta.year,
        month: meta.month,
        monthName: meta.monthName,
        records: [],
        dates: [],
        uniqueTrainees: [],
        uniqueTrainers: [],
        remarksCount: 0,
      });
    }

    const group = groupsMap.get(meta.key)!;
    group.records.push(rec);

    if (rec.date && !group.dates.includes(rec.date)) {
      group.dates.push(rec.date);
    }

    if (rec.remark && rec.remark.trim().length > 0) {
      group.remarksCount++;
    }
  });

  // Calculate unique trainees and trainers for each group
  const result = Array.from(groupsMap.values()).map(group => {
    const trainees = Array.from(new Set(group.records.map(r => r.name.trim()).filter(Boolean)));
    const trainersSet = new Set<string>();

    group.records.forEach(r => {
      r.trainer.split(/\n|\r|[0-9]+\./).forEach(t => {
        const clean = t.replace(/^[^a-zA-Z]+/, '').trim();
        if (clean.length > 2) trainersSet.add(clean);
      });
    });

    return {
      ...group,
      uniqueTrainees: trainees,
      uniqueTrainers: Array.from(trainersSet),
    };
  });

  // Sort chronologically descending (newest month first)
  result.sort((a, b) => b.key.localeCompare(a.key));
  return result;
}

/**
 * Generates CSV string for a set of records
 */
export function generateCsv(records: TraineeRecord[]): string {
  const escapeCsv = (val: string) => {
    const str = val || '';
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = ['No', 'Date', 'Name', "Today's Learning Material", 'Trainer / Mentors', 'Remark / Question'];
  const rows = records.map((r, i) => [
    i + 1,
    escapeCsv(r.date),
    escapeCsv(r.name),
    escapeCsv(r.learningMaterial),
    escapeCsv(r.trainer),
    escapeCsv(r.remark),
  ].join(','));

  // Prepend UTF-8 BOM so Excel opens accents and symbols correctly
  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * Triggers a browser download for a text file
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates an executive HTML report for a month-year group (for printing / PDF export)
 */
export function generateMonthlyHtmlReport(group: MonthYearGroup): string {
  const escapeHtml = (str: string) => {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const rows = group.records.map((r, idx) => `
    <tr style="border-bottom: 1px solid #e2e8f0; ${idx % 2 === 0 ? 'background:#ffffff;' : 'background:#f8fafc;'}">
      <td style="padding: 10px 12px; font-size: 11px; color:#64748b; text-align:center;">${idx + 1}</td>
      <td style="padding: 10px 12px; font-size: 12px; font-weight:600; color:#0f172a; white-space:nowrap;">${escapeHtml(r.date)}</td>
      <td style="padding: 10px 12px; font-size: 12px; font-weight:700; color:#1e293b;">${escapeHtml(r.name)}</td>
      <td style="padding: 10px 12px; font-size: 12px; color:#334155; line-height: 1.4;">${escapeHtml(r.learningMaterial).replace(/\n/g, '<br/>')}</td>
      <td style="padding: 10px 12px; font-size: 12px; color:#2563eb;">${escapeHtml(r.trainer).replace(/\n/g, '<br/>')}</td>
      <td style="padding: 10px 12px; font-size: 12px; color:${r.remark ? '#b45309' : '#94a3b8'};">${r.remark ? escapeHtml(r.remark) : '—'}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Monthly Training Report - ${escapeHtml(group.label)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 24px; color: #0f172a; background: #ffffff; }
    h1 { margin: 0 0 4px 0; font-size: 22px; color: #0f172a; }
    .meta { font-size: 13px; color: #64748b; margin-bottom: 20px; }
    .stats-bar { display: flex; gap: 16px; margin-bottom: 24px; }
    .stat-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 18px; flex: 1; background: #f8fafc; }
    .stat-num { font-size: 22px; font-weight: 800; color: #0f172a; }
    .stat-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    th { background: #f1f5f9; padding: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom:16px; text-align:right;">
    <button onclick="window.print()" style="background:#2563eb; color:white; border:none; padding:8px 16px; border-radius:6px; font-weight:600; cursor:pointer;">
      🖨️ Print / Save as PDF
    </button>
  </div>
  <h1>Monthly Training Log Archive: ${escapeHtml(group.label)}</h1>
  <div class="meta">Exported on ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</div>

  <div class="stats-bar">
    <div class="stat-card">
      <div class="stat-num">${group.records.length}</div>
      <div class="stat-label">Total Activity Records</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${group.dates.length}</div>
      <div class="stat-label">Training Days Logged</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${group.uniqueTrainees.length}</div>
      <div class="stat-label">Trainees Participating</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${group.uniqueTrainers.length}</div>
      <div class="stat-label">Mentors Active</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:40px; text-align:center;">#</th>
        <th style="width:160px;">Date</th>
        <th style="width:180px;">Trainee Name</th>
        <th>Learning Material</th>
        <th style="width:180px;">Trainer / Mentors</th>
        <th style="width:180px;">Remarks</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>`;
}
