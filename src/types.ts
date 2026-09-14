export interface TraineeRecord {
  id: string;
  date: string;
  name: string;
  learningMaterial: string;
  trainer: string;
  remark: string;
}

export interface DayReport {
  date: string;
  displayDate: string;
  records: TraineeRecord[];
  traineeCount: number;
  uniqueTrainers: string[];
  materialsList: string[];
  remarksList: { name: string; remark: string }[];
}

export interface ScriptConfig {
  sheetName: string;
  recipients: string;
  ccRecipients: string;
  subjectPrefix: string;
  triggerHour: number; // 0-23
  weekdaysOnly: boolean;
  includeSheetLink: boolean;
  createAuditTab: boolean;
  senderName: string;
}

export interface AISummaryResponse {
  summary: string;
  highlights: string[];
  blockersOrRemarks: string[];
  trainerHighlights: string[];
}

export interface SheetTab {
  id: string;
  title: string;
  badge?: string;
  description: string;
  dates?: string[]; // if undefined, includes all dates
  recordCount: number;
}

