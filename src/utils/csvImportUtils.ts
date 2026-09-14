import { TraineeRecord } from '../types';
import { formatToLongDate, parseAnyDate } from './dateExportUtils';

export interface ParsedImportResult {
  records: TraineeRecord[];
  totalRowsFound: number;
  validRowsCount: number;
  skippedRowsCount: number;
  datesFound: string[];
  traineesFound: string[];
  detectedColumns: {
    date: number;
    name: number;
    material: number;
    trainer: number;
    remark: number;
  };
  errors: string[];
}

/**
 * Splits raw CSV/TSV text into an array of string arrays,
 * properly handling quoted cells containing commas, tabs, or newlines.
 */
export function parseDelimitedText(text: string): string[][] {
  if (!text || !text.trim()) return [];

  // Detect delimiter: tab, semicolon, or comma
  const firstLine = text.split(/\r?\n/)[0] || '';
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;

  let delimiter = ',';
  if (tabCount > commaCount && tabCount > semiCount) {
    delimiter = '\t';
  } else if (semiCount > commaCount) {
    delimiter = ';';
  }

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n of \r\n
      }
      currentRow.push(currentCell.trim());
      currentCell = '';
      if (currentRow.some(cell => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(cell => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Automatically inspects the first few rows to locate column indices
 * matching Date, Name, Learning Material, Trainer, and Remark.
 */
export function detectHeaderIndices(rows: string[][]): {
  headerRowIndex: number;
  dateCol: number;
  nameCol: number;
  materialCol: number;
  trainerCol: number;
  remarkCol: number;
} {
  const dateAliases = ['date', 'tanggal', 'tgl', 'hari', 'day', 'waktu'];
  const nameAliases = ['name', 'trainee', 'nama', 'peserta', 'murid', 'siswa', 'person'];
  const materialAliases = ['material', 'materi', 'learning', 'topic', 'topik', 'subject', 'subjek', 'pelajaran', 'belajar', 'kegiatan'];
  const trainerAliases = ['trainer', 'traineer', 'mentor', 'pembimbing', 'instruktur', 'pengajar', 'lead'];
  const remarkAliases = ['remark', 'question', 'catatan', 'note', 'keterangan', 'tanya', 'pertanyaan', 'kendala'];

  let headerRowIndex = 0;

  // Search first 5 rows for the best candidate header row
  for (let r = 0; r < Math.min(5, rows.length); r++) {
    const lowerRow = rows[r].map(c => c.toLowerCase().trim());
    const hasName = lowerRow.some(cell => nameAliases.some(a => cell.includes(a)));
    const hasMaterial = lowerRow.some(cell => materialAliases.some(a => cell.includes(a)));
    if (hasName || hasMaterial) {
      headerRowIndex = r;
      break;
    }
  }

  const headerRow = rows[headerRowIndex].map(c => c.toLowerCase().trim());

  const findCol = (aliases: string[], fallback: number): number => {
    // 1. Exact match
    for (let i = 0; i < headerRow.length; i++) {
      if (aliases.includes(headerRow[i])) return i;
    }
    // 2. Partial match
    for (let i = 0; i < headerRow.length; i++) {
      for (const alias of aliases) {
        if (headerRow[i].includes(alias)) return i;
      }
    }
    return fallback;
  };

  return {
    headerRowIndex,
    dateCol: findCol(dateAliases, 1),
    nameCol: findCol(nameAliases, 2),
    materialCol: findCol(materialAliases, 3),
    trainerCol: findCol(trainerAliases, 4),
    remarkCol: findCol(remarkAliases, 5),
  };
}

/**
 * Parses raw tabular string into an array of TraineeRecord
 */
export function parseSheetData(rawText: string, fallbackDate: string = ''): ParsedImportResult {
  const result: ParsedImportResult = {
    records: [],
    totalRowsFound: 0,
    validRowsCount: 0,
    skippedRowsCount: 0,
    datesFound: [],
    traineesFound: [],
    detectedColumns: {
      date: 1,
      name: 2,
      material: 3,
      trainer: 4,
      remark: 5,
    },
    errors: [],
  };

  const rows = parseDelimitedText(rawText);
  if (rows.length === 0) {
    result.errors.push('Teks kosong atau file tidak memiliki konten.');
    return result;
  }

  result.totalRowsFound = rows.length;

  const headerInfo = detectHeaderIndices(rows);
  result.detectedColumns = {
    date: headerInfo.dateCol,
    name: headerInfo.nameCol,
    material: headerInfo.materialCol,
    trainer: headerInfo.trainerCol,
    remark: headerInfo.remarkCol,
  };

  let activeDate = fallbackDate || '';
  const datesSet = new Set<string>();
  const traineesSet = new Set<string>();

  for (let r = headerInfo.headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    
    // Check if date column has a value; if so, update activeDate
    const rawDateVal = (row[headerInfo.dateCol] || '').trim();
    if (rawDateVal && rawDateVal.toLowerCase() !== 'date' && rawDateVal.toLowerCase() !== 'tanggal') {
      const parsedDate = parseAnyDate(rawDateVal);
      if (parsedDate) {
        activeDate = formatToLongDate(parsedDate);
      } else {
        activeDate = rawDateVal;
      }
    }

    const name = (row[headerInfo.nameCol] || '').trim();
    const material = (row[headerInfo.materialCol] || '').trim();
    const trainer = (row[headerInfo.trainerCol] || '').trim();
    const remark = (row[headerInfo.remarkCol] || '').trim();

    // Skip empty lines or pure number lines
    if (!name && !material) {
      result.skippedRowsCount++;
      continue;
    }

    // Skip repeat headers
    if (name.toLowerCase() === 'name' || name.toLowerCase() === 'nama') {
      result.skippedRowsCount++;
      continue;
    }

    const recordDate = activeDate || fallbackDate || 'Desember 2025';

    result.records.push({
      id: `imported_${Date.now()}_${r}_${Math.random().toString(36).slice(2, 7)}`,
      date: recordDate,
      name: name || 'Unnamed Trainee',
      learningMaterial: material || '-',
      trainer: trainer || 'Mentor Team',
      remark: remark || '',
    });

    result.validRowsCount++;
    if (recordDate) datesSet.add(recordDate);
    if (name) traineesSet.add(name);
  }

  result.datesFound = Array.from(datesSet);
  result.traineesFound = Array.from(traineesSet);

  if (result.records.length === 0) {
    result.errors.push('Tidak ditemukan baris peserta yang valid. Pastikan ada kolom nama atau materi pembelajaran.');
  }

  return result;
}

/**
 * Returns a clean sample CSV string formatted as standard template
 */
export function getSampleCsvTemplate(): string {
  return `Date,Name,Today's Learning Material,Traineer,Remark / Question
Monday, December 22, 2025,Alex Pratama,React Fundamentals & Components,Budi Santoso,Sudah paham dasar JSX
,Citra Dewi,TypeScript Types & Interfaces,Siti Rahma,Perlu latihan generics
,Deni Kurniawan,Tailwind CSS Utilities,Budi Santoso,Berhasil styling dashboard
Tuesday, December 23, 2025,Alex Pratama,State Management & Hooks,Siti Rahma,Membuat custom hook
,Citra Dewi,API Integration & Fetch,Budi Santoso,Testing endpoint REST
,Deni Kurniawan,Responsive Layout & Flexbox,Siti Rahma,Selesai membuat mobile view`;
}
