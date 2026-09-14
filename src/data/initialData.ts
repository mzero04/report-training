import { TraineeRecord } from '../types';

export const RAW_CSV_DATA = `,Date,Name,Today's Learning Material,Traineer,Remark / Question
," Monday, December 22, 2025",Aulia Darma Putra,"1. Compare PA pada Module Pre-Layout dan Add Info\\n2. Training Action Plan\\n3. Training Previous Layout","1. Siti Yuhaeni\\n2. Budi\\n3. Ijal",
,,Jaka Muhammad Zaelani,"1. Compare PA pada Module Pre-Layout dan Add Info\\n2. Training Action Plan\\n3. Training Previous Layout","1. Siti Yuhaeni\\n2. Budi\\n3. Ijal",
,,Diva Nuratnika Rahayu,"1. Pengenalan Pre-Layout, SOP Pre-Layout\\n2. Training Action Plan\\n3. Training Previous Layout","1. Sharah Putri Munggaran\\n2. Budi\\n3. Ijal",
,,Viona Iswi Nurlestari,"1. Pengenalan Pre-Layout, SOP Pre-Layout\\n2. Training Action Plan\\n3. Training Previous Layout","1. Sharah Putri Munggaran\\n2. Budi\\n3. Ijal",
,,Garnis Kirani,"1. Pengenalan Pre-Layout dan Menterjemahkannya\\n2. Training Action Plan\\n3. Training Previous Layout","1. Frisca Carvinia Setiawan\\n2. Budi\\n3. Ijal",
,,Mita Monika,"1. Pengenalan Pre-Layout dan Menterjemahkannya\\n2. Training Action Plan\\n3. Training Previous Layout","1. Frisca Carvinia Setiawan\\n2. Budi\\n3. Ijal",
,,Tasya Shakila Ramdhan,"1. Penjelasan mengenai jobdesk Engineer pada Pre Layout, penjelasan mengenai Pre Layout itu sendiri, dan SOP daripada  pengerjaan Pre Layout.\\n2. Training Action Plan\\n3. Training Previous Layout","1. Aris Jati Pratama\\n2. Budi\\n3. Ijal",
,,Hamidah Nur Wahdaniah,"1. Penjelasan mengenai jobdesk Engineer pada Pre Layout, penjelasan mengenai Pre Layout itu sendiri, dan SOP daripada  pengerjaan Pre Layout.\\n2. Training Action Plan\\n3. Training Previous Layout","1. Aris Jati Pratama\\n2. Budi\\n3. Ijal",
," Tuesday, December 23, 2025",Aulia Darma Putra,"1. Merapihkan Module dan Algorism, mengisi ETC Persen pada module di proses yang dibagi 2\\n2. Training Action Plan\\n3. Training Previous Layout","1. Siti Yuhaeni\\n2. Budi\\n3. Ijal",
,,Jaka Muhammad Zaelani,"1. Merapihkan Module dan Algorism, mengisi ETC Persen pada module di proses yang dibagi 2\\n2. Training Action Plan\\n3. Training Previous Layout","1. Siti Yuhaeni\\n2. Budi\\n3. Ijal",
,,Diva Nuratnika Rahayu,"1. Compare PA dan Module Pre-Layout sampai pada Add. Info\\n2. Training Action Plan\\n3. Training Previous Layout","1. Sharah Putri Munggaran\\n2. Budi\\n3. Ijal",
,,Viona Iswi Nurlestari,"1. Compare PA dan Module Pre-Layout sampai pada Add. Info\\n2. Training Action Plan\\n3. Training Previous Layout","1. Sharah Putri Munggaran\\n2. Budi\\n3. Ijal",
,,Garnis Kirani,"1. Compare PA pada Module Pre-Layout, Merapihkan Pre-layout dan Pengisian Add-Info\\n2. Training Action Plan\\n3. Training Previous Layout","1. Frisca Carvinia Setiawan\\n2. Budi\\n3. Ijal",
,,Mita Monika,"1. Compare PA pada Module Pre-Layout, Merapihkan Pre-layout dan Pengisian Add-Info\\n2. Training Action Plan\\n3. Training Previous Layout","1. Frisca Carvinia Setiawan\\n2. Budi\\n3. Ijal",
,,Tasya Shakila Ramdhan,"1. Compare PA SMV dengan Module Layout sampai menemukan proses yang benar antara keduanya dan jumlah mesin harus TRUE.\\n2. Training Action Plan\\n3. Training Previous Layout","1. Aris Jati Pratama\\n2. Budi\\n3. Ijal",
,,Hamidah Nur Wahdaniah,"1. Compare PA SMV dengan Module Layout sampai menemukan proses yang benar antara keduanya dan jumlah mesin harus TRUE.\\n2. Training Action Plan\\n3. Training Previous Layout","1. Aris Jati Pratama\\n2. Budi\\n3. Ijal",
," Wednesday, December 24, 2025",Aulia Darma Putra,"1. Merapihkan dan mengisi Mechanic Sub Layout\\n2. Training Action Plan\\n3. Training Previous Layout","1. Siti Yuhaeni\\n2. Budi\\n3. Ijal",
,,Jaka Muhammad Zaelani,"1. Merapihkan dan mengisi Mechanic Sub Layout\\n2. Training Action Plan\\n3. Training Previous Layout","1. Siti Yuhaeni\\n2. Budi\\n3. Ijal",
,,Diva Nuratnika Rahayu,"1. Compare PA dan Module Pre-Layout sampai pada Algorism\\n2. Training Action Plan\\n3. Training Previous Layout","1. Sharah Putri Munggaran\\n2. Budi\\n3. Ijal",
,,Viona Iswi Nurlestari,"1. Compare PA dan Module Pre-Layout sampai pada Algorism\\n2. Training Action Plan\\n3. Training Previous Layout","1. Sharah Putri Munggaran\\n2. Budi\\n3. Ijal",
,,Garnis Kirani,"1. Melanjutkan Compare PA pada Module Pre-Layout, Merapihkan Pre-layout dan Pengisian Add-Info\\n2. Training Action Plan\\n3. Training Previous Layout","1. Frisca Carvinia Setiawan\\n2. Budi\\n3. Ijal",
,,Mita Monika,"1. Melanjutkan Compare PA pada Module Pre-Layout, Merapihkan Pre-layout dan Pengisian Add-Info\\n2. Training Action Plan\\n3. Training Previous Layout","1. Frisca Carvinia Setiawan\\n2. Budi\\n3. Ijal",
,,Tasya Shakila Ramdhan,"1. Melanjutkan tahap compare sampai pada memasukan PA yang tidak ada pada Module Layout ke Add. Info (sampai TRUE juga).\\n2. Training Action Plan\\n3. Training Previous Layout","1. Aris Jati Pratama\\n2. Budi\\n3. Ijal",
,,Hamidah Nur Wahdaniah,"1. Melanjutkan tahap compare sampai pada memasukan PA yang tidak ada pada Module Layout ke Add. Info (sampai TRUE juga).\\n2. Training Action Plan\\n3. Training Previous Layout","1. Aris Jati Pratama\\n2. Budi\\n3. Ijal",
," Friday, December 26, 2025",Aulia Darma Putra,"1. Merapihkan dan mengisi Sewing Sub Layout\\n2. Test Action Plan\\n3. Test Previous Layout","1. Siti Yuhaeni\\n2. Budi\\n3. Ijal",
,,Jaka Muhammad Zaelani,"1. Merapihkan dan mengisi Sewing Sub Layout\\n2. Test Action Plan\\n3. Test Previous Layout","1. Siti Yuhaeni\\n2. Budi\\n3. Ijal",
,,Diva Nuratnika Rahayu,"1. Latihan compare PA dan Module Pre-Layout sampai pada Algorism\\n2. Test Action Plan\\n3. Test Previous Layout","1. Sharah Putri Munggaran\\n2. Budi\\n3. Ijal",
,,Viona Iswi Nurlestari,"1. Latihan compare PA dan Module Pre-Layout sampai pada Algorism\\n2. Test Action Plan\\n3. Test Previous Layout","1. Sharah Putri Munggaran\\n2. Budi\\n3. Ijal",
,,Garnis Kirani,"1. Menginput hasil dari Module & Add. Info ke Algorism\\n2. Test Action Plan\\n3. Test Previous Layout","1. Frisca Carvinia Setiawan\\n2. Budi\\n3. Ijal",
,,Mita Monika,"1. Menginput hasil dari Module & Add. Info ke Algorism\\n2. Test Action Plan\\n3. Test Previous Layout","1. Frisca Carvinia Setiawan\\n2. Budi\\n3. Ijal",
,,Tasya Shakila Ramdhan,"1. Menginput hasil Module Layout yang sudah benar ke summary Algorism dan mencoba mengerjakan Mechanic dan Sewing sub Lay out.\\n2. Training Action Plan\\n3. Training Previous Layout","1. Aris Jati Pratama\\n2. Budi\\n3. Ijal",
,,Hamidah Nur Wahdaniah,"1. Menginput hasil Module Layout yang sudah benar ke summary Algorism dan mencoba mengerjakan Mechanic dan Sewing sub Lay out dan penamaan file\\n2. Test Action Plan\\n3. Test Previous Layout","1. Aris Jati Pratama\\n2. Budi\\n3. Ijal",
," Monday, December 29, 2025",Aulia Darma Putra,"1. Modul Mechanic Sub Layout, Sewing Sub Layout\\n2. Skill Matrix (Materi)\\n3. Skill Mtrix (Program)","1. Siti Yuhaeni\\n2. Ijal\\n3. Lutfi",
,,Jaka Muhammad Zaelani,"1. Modul mechanic sub layout, sewing sub layout\\n2. Skill Matrix (Materi)\\n3. Skill Mtrix (Program)","1. Siti Yuhaeni\\n2. Ijal\\n3. Lutfi",
,,Diva Nuratnika Rahayu,"1. Menerapkan SOP Pre-Layout pada Module, pengisian ETC pada proses yang sama di Module\\n2. Skill Matrix (Materi)\\n3. Skill Mtrix (Program)","1. Sharah Putri Munggaran\\n2. Ijal\\n3. Lutfi",
,,Viona Iswi Nurlestari,"1. Menerapkan SOP Pre-Layout pada Module, pengisian ETC pada proses yang sama di Module\\n2. Skill Matrix (Materi)\\n3. Skill Mtrix (Program)","1. Sharah Putri Munggaran\\n2. Ijal\\n3. Lutfi",
,,Garnis Kirani,"1. Menginput Modul Mechanic Sub Layout, Sewing Sub Layout\\n2. Skill Matrix (Materi)\\n3. Skill Mtrix (Program)","1. Frisca Carvinia Setiawan\\n2. Ijal\\n3. Lutfi",
,,Mita Monika,"1. Modul Mechanic sub layout, Sewing sub layout\\n2. Skill Matrix (Materi)\\n3. Skill Mtrix (Program)","1. Frisca Carvinia Setiawan\\n2. Ijal\\n3. Lutfi",
,,Tasya Shakila Ramdhan,"1. Melanjutkan pengerjaan Mechanic sub Layout hingga jumlahnya TRUE.\\n2. Skill Matrix (Materi)\\n3. Skill Mtrix (Program)","1. Aris Jati Pratama\\n2. Ijal\\n3. Lutfi",
,,Hamidah Nur Wahdaniah,"1. Melanjutkan pengerjaan Mechanic sub Layout hingga jumlahnya TRUE.\\n2. Skill Matrix (Materi)\\n3. Skill Mtrix (Program)","1. Aris Jati Pratama\\n2. Ijal\\n3. Lutfi",
," Tuesday, December 30, 2025",Aulia Darma Putra,"1. Latihan dari awal Pre Layout Kathmandu #A1066\\n2. Skill Matrix (Materi)\\n3. Skill Mtrix (Program)","1. Siti Yuhaeni\\n2. Ijal\\n3. Lutfi",
,,Jaka Muhammad Zaelani,"1. Latihan dari awal Pre Layout Kathmandu #A1067\\n2. Skill Matrix (Materi)\\n3. Skill Mtrix (Program)","1. Siti Yuhaeni\\n2. Ijal\\n3. Lutfi",
,,Diva Nuratnika Rahayu,"1. Melanjutkan latihan dengan mengisi mechanic sub layout dan sewing sub layout serta merapikan tabel sesuai dengan SOP\\n2. Skill Matrix (Materi)\\n3. Skill Mtrix (Program)","1. Sharah Putri Munggaran\\n2. Ijal\\n3. Lutfi",
,,Viona Iswi Nurlestari,"1. Melanjutkan latihan dengan mengisi mechanic sub layout dan sewing sub layout serta merapikan tabel sesuai dengan SOP\\n2. Skill Matrix (Materi)\\n3. Skill Mtrix (Program)","1. Sharah Putri Munggaran\\n2. Ijal\\n3. Lutfi",
,,Garnis Kirani,"1. Latihan dari awal Pre Layout Module ARCTERYX (23-12-2025)\\n2. Skill Matrix (Materi)\\n3. Skill Mtrix (Program)","1. Frisca Carvinia Setiawan\\n2. Ijal\\n3. Lutfi",
,,Mita Monika,"1. Latihan dari awal Pre Layout Module ARCTERYX (23-12-2025)\\n2. Skill Matrix (Materi)\\n3. Skill Mtrix (Program)","1. Frisca Carvinia Setiawan\\n2. Ijal\\n3. Lutfi",
,,Tasya Shakila Ramdhan,"1. Melanjutkan pengerjaan Sewing sub Layout\\n2. Skill Matrix (Materi)\\n3. Skill Mtrix (Program)","1. Aris Jati Pratama\\n2. Ijal\\n3. Lutfi",
,,Hamidah Nur Wahdaniah,"1. Melanjutkan pengerjaan Sewing sub Layout\\n2. Skill Matrix (Materi)\\n3. Skill Mtrix (Program)","1. Aris Jati Pratama\\n2. Ijal\\n3. Lutfi",
," Wednesday, December 31, 2025",Aulia Darma Putra,"1. Melanjutkan Pre-Layout Kathmandu #A1066 ke Algorism, Mechanic cub layout dan sewing sub layout\\n2. Defect Control\\n3. Compare Attachment Report","1. Siti Yuhaeni\\n2. Yanto\\n3. Ijal",
,,Jaka Muhammad Zaelani,"1. Melanjutkan Pre-Layout Kathmandu #A1066 ke Module, Add info, Algorism, Mechanic Sub Layout, Sewing Sub Layout\\n2. Defect Control\\n3. Compare Attachment Report","1. Siti Yuhaeni\\n2. Yanto\\n3. Ijal",
,,Diva Nuratnika Rahayu,"1. Latihan Pre Layout mulai dari awal sampai Sewing Sub Layout (TNF #A8DDT)\\n2. Defect Control\\n3. Compare Attachment Report","1. Sharah Putri Munggaran\\n2. Yanto\\n3. Ijal",
,,Viona Iswi Nurlestari,"1. Latihan Pre Layout mulai dari awal sampai Sewing Sub Layout (TNF #A8DDT)\\n2. Defect Control\\n3. Compare Attachment Report","1. Sharah Putri Munggaran\\n2. Yanto\\n3. Ijal",
,,Garnis Kirani,"1. Melanjutkan Latihan dari awal Pre Layout Module ARCTERYX (23-12-2025)\\n2. Defect Control\\n3. Compare Attachment Report","1. Frisca Carvinia Setiawan\\n2. Yanto\\n3. Ijal",
,,Mita Monika,"1. Melanjutkan Latihan dari awal Pre Layout Module ARCTERYX (23-12-2025)\\n2. Defect Control\\n3. Compare Attachment Report","1. Frisca Carvinia Setiawan\\n2. Yanto\\n3. Ijal",
,,Tasya Shakila Ramdhan,"1. Latihan dari awal Pre Layout Module KATHMANDU B1145 dan penamaan file\\n2. Defect Control\\n3. Compare Attachment Report","1. Aris Jati Pratama\\n2. Yanto\\n3. Ijal",
,,Hamidah Nur Wahdaniah,"1. Latihan dari awal Pre Layout Module KATHMANDU B1145\\n2. Defect Control\\n3. Compare Attachment Report","1. Aris Jati Pratama\\n2. Yanto\\n3. Ijal",
`;

export function parseCsvRows(csvString: string): TraineeRecord[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < csvString.length; i++) {
    const char = csvString[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
      if (char === '\r' && csvString[i + 1] === '\n') {
        i++;
      }
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  const records: TraineeRecord[] = [];
  let lastDate = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Split line by comma respecting quotes
    const cols: string[] = [];
    let curCol = '';
    let colInQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') {
        colInQuotes = !colInQuotes;
      } else if (c === ',' && !colInQuotes) {
        cols.push(curCol.trim());
        curCol = '';
      } else {
        curCol += c;
      }
    }
    cols.push(curCol.trim());

    // Skip header line
    if (cols.some(c => c.toLowerCase().includes('learning material') || c.toLowerCase().includes('traineer'))) {
      continue;
    }

    // Typical layout:
    // col 0: empty or index
    // col 1: Date (e.g. "Monday, December 22, 2025" or empty if continuation)
    // col 2: Name
    // col 3: Learning Material
    // col 4: Trainer
    // col 5: Remark / Question

    let rawDate = cols[1] || '';
    let name = cols[2] || '';
    let learningMaterial = cols[3] || '';
    let trainer = cols[4] || '';
    let remark = cols[5] || '';

    // If col 0 had the date (flexible check)
    if (!name && cols[1] && cols[2] && cols[3]) {
      name = cols[1];
      learningMaterial = cols[2];
      trainer = cols[3];
      remark = cols[4] || '';
    }

    rawDate = rawDate.replace(/^"|"$/g, '').trim();
    name = name.replace(/^"|"$/g, '').trim();
    learningMaterial = learningMaterial.replace(/^"|"$/g, '').replace(/\\n/g, '\n').trim();
    trainer = trainer.replace(/^"|"$/g, '').replace(/\\n/g, '\n').trim();
    remark = remark.replace(/^"|"$/g, '').trim();

    if (rawDate) {
      lastDate = rawDate;
    }

    if (name && (learningMaterial || trainer || lastDate)) {
      records.push({
        id: `rec-${i}-${name.replace(/\s+/g, '-').toLowerCase()}`,
        date: lastDate || 'Unknown Date',
        name,
        learningMaterial,
        trainer,
        remark: remark || ''
      });
    }
  }

  return records;
}

export const INITIAL_RECORDS: TraineeRecord[] = parseCsvRows(RAW_CSV_DATA);

export function buildSheetTabs(records: TraineeRecord[]): {
  id: string;
  title: string;
  category: 'master' | 'week' | 'day';
  dates?: string[];
  count: number;
}[] {
  const dates = Array.from(new Set(records.map(r => r.date).filter(Boolean)));

  const week1Dates = [
    'Monday, December 22, 2025',
    'Tuesday, December 23, 2025',
    'Wednesday, December 24, 2025',
    'Friday, December 26, 2025'
  ];

  const week2Dates = [
    'Monday, December 29, 2025',
    'Tuesday, December 30, 2025',
    'Wednesday, December 31, 2025'
  ];

  const week1Count = records.filter(r => week1Dates.includes(r.date)).length;
  const week2Count = records.filter(r => week2Dates.includes(r.date)).length;

  const tabs: {
    id: string;
    title: string;
    category: 'master' | 'week' | 'day';
    dates?: string[];
    count: number;
  }[] = [
    {
      id: 'sheet-all',
      title: 'Semua Sheet (Master Log)',
      category: 'master',
      count: records.length
    },
    {
      id: 'sheet-week-1',
      title: 'Sheet Week 1 (22 - 26 Dec)',
      category: 'week',
      dates: week1Dates,
      count: week1Count
    },
    {
      id: 'sheet-week-2',
      title: 'Sheet Week 2 (29 - 31 Dec)',
      category: 'week',
      dates: week2Dates,
      count: week2Count
    }
  ];

  // Daily individual sheets
  dates.forEach(d => {
    const dayCount = records.filter(r => r.date === d).length;
    // Short title e.g. "Sheet: 22 Dec 2025"
    const shortTitle = d.replace(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/g, '').replace(',', '').trim();
    tabs.push({
      id: `sheet-day-${d}`,
      title: shortTitle || d,
      category: 'day',
      dates: [d],
      count: dayCount
    });
  });

  return tabs;
}

