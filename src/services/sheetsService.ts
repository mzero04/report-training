import { TraineeRecord } from '../types';
import { getAccessToken } from './googleAuth';

export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

export interface SheetInfo {
  id: string;
  title: string;
  sheets: { id: number; title: string }[];
}

export async function fetchSpreadsheetInfo(spreadsheetId: string): Promise<SheetInfo> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('You must be signed in with Google to access this spreadsheet.');
  }

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to load Google Sheet (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return {
    id: data.spreadsheetId,
    title: data.properties?.title || 'Untitled Spreadsheet',
    sheets: (data.sheets || []).map((s: { properties: { sheetId: number; title: string } }) => ({
      id: s.properties.sheetId,
      title: s.properties.title,
    })),
  };
}

export async function fetchSheetValues(spreadsheetId: string, sheetTitle: string): Promise<TraineeRecord[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Authentication token missing.');
  }

  const range = encodeURIComponent(`'${sheetTitle}'!A1:H200`);
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch sheet values: ${errorText}`);
  }

  const json = await res.json();
  const rows: string[][] = json.values || [];
  if (rows.length === 0) {
    return [];
  }

  // Parse rows
  const records: TraineeRecord[] = [];
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const r = rows[i].map(c => String(c).toLowerCase());
    if (r.some(cell => cell.includes('name') || cell.includes('material') || cell.includes('traineer'))) {
      headerRowIndex = i;
      break;
    }
  }

  const headers = rows[headerRowIndex].map(c => String(c).toLowerCase());
  const dateCol = headers.findIndex(h => h.includes('date') || h.includes('tanggal'));
  const nameCol = headers.findIndex(h => h.includes('name') || h.includes('nama'));
  const matCol = headers.findIndex(h => h.includes('material') || h.includes('materi'));
  const trainerCol = headers.findIndex(h => h.includes('traineer') || h.includes('trainer'));
  const remarkCol = headers.findIndex(h => h.includes('remark') || h.includes('question') || h.includes('catatan'));

  const dCol = dateCol !== -1 ? dateCol : 1;
  const nCol = nameCol !== -1 ? nameCol : 2;
  const mCol = matCol !== -1 ? matCol : 3;
  const tCol = trainerCol !== -1 ? trainerCol : 4;
  const rCol = remarkCol !== -1 ? remarkCol : 5;

  let lastDate = '';

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    const rawDate = row[dCol] !== undefined ? String(row[dCol]).trim() : '';
    const name = row[nCol] !== undefined ? String(row[nCol]).trim() : '';
    const material = row[mCol] !== undefined ? String(row[mCol]).trim() : '';
    const trainer = row[tCol] !== undefined ? String(row[tCol]).trim() : '';
    const remark = row[rCol] !== undefined ? String(row[rCol]).trim() : '';

    if (rawDate) {
      lastDate = rawDate;
    }

    if (name && (material || trainer || lastDate)) {
      records.push({
        id: `gsheet-${i}-${name.replace(/\s+/g, '-').toLowerCase()}`,
        date: lastDate || 'Unknown Date',
        name,
        learningMaterial: material,
        trainer,
        remark,
      });
    }
  }

  return records;
}

export async function fetchAllSheetsValues(
  spreadsheetId: string,
  sheetTitles: string[]
): Promise<TraineeRecord[]> {
  const allResults = await Promise.all(
    sheetTitles.map(async title => {
      try {
        return await fetchSheetValues(spreadsheetId, title);
      } catch (err) {
        console.warn(`Could not fetch sheet "${title}":`, err);
        return [];
      }
    })
  );

  // Flatten and deduplicate records by id or date+name
  const seen = new Set<string>();
  const merged: TraineeRecord[] = [];

  for (const sheetRecords of allResults) {
    for (const rec of sheetRecords) {
      const key = `${rec.date}__${rec.name}__${rec.learningMaterial}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(rec);
      }
    }
  }

  return merged;
}

export async function createDemoSpreadsheet(records: TraineeRecord[]): Promise<{ spreadsheetId: string; url: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Authentication required to create a Google Sheet.');
  }

  // Create spreadsheet with all sheets pre-configured
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: `Team Daily Training Log - Desember 2025`,
      },
      sheets: [
        { properties: { title: 'Semua Data (Master)' } },
        { properties: { title: 'Week 1 (22-26 Des)' } },
        { properties: { title: 'Week 2 (29-31 Des)' } },
      ],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create Google Spreadsheet: ${err}`);
  }

  const created = await createRes.json();
  const spreadsheetId = created.spreadsheetId;
  const url = created.spreadsheetUrl;

  const buildSheetRows = (subset: TraineeRecord[]) => {
    const rows: string[][] = [
      ['', 'Date', 'Name', "Today's Learning Material", 'Traineer', 'Remark / Question'],
    ];
    let prevDate = '';
    subset.forEach(r => {
      const isNewDate = r.date !== prevDate;
      rows.push([
        '',
        isNewDate ? r.date : '',
        r.name,
        r.learningMaterial,
        r.trainer,
        r.remark,
      ]);
      prevDate = r.date;
    });
    return rows;
  };

  const week1Dates = [
    'Monday, December 22, 2025',
    'Tuesday, December 23, 2025',
    'Wednesday, December 24, 2025',
    'Friday, December 26, 2025',
  ];

  const week2Dates = [
    'Monday, December 29, 2025',
    'Tuesday, December 30, 2025',
    'Wednesday, December 31, 2025',
  ];

  const masterRows = buildSheetRows(records);
  const week1Rows = buildSheetRows(records.filter(r => week1Dates.includes(r.date)));
  const week2Rows = buildSheetRows(records.filter(r => week2Dates.includes(r.date)));

  // Batch update values to all sheets
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: `'Semua Data (Master)'!A1:F${masterRows.length}`,
          values: masterRows,
        },
        {
          range: `'Week 1 (22-26 Des)'!A1:F${week1Rows.length}`,
          values: week1Rows,
        },
        {
          range: `'Week 2 (29-31 Des)'!A1:F${week2Rows.length}`,
          values: week2Rows,
        },
      ],
    }),
  });

  return { spreadsheetId, url };
}
