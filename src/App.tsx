import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { TraineeRecord, ScriptConfig, AISummaryResponse } from './types';
import { INITIAL_RECORDS } from './data/initialData';
import { initAuth, googleSignIn, logout } from './services/googleAuth';
import { Header } from './components/Header';
import { ReportDashboard } from './components/ReportDashboard';
import { AppsScriptStudio } from './components/AppsScriptStudio';
import { SheetsLiveConnector } from './components/SheetsLiveConnector';
import { EmailPreviewModal } from './components/EmailPreviewModal';
import { AddRecordModal } from './components/AddRecordModal';
import { ExportMonthlyModal } from './components/ExportMonthlyModal';
import { ImportSheetModal } from './components/ImportSheetModal';

export default function App() {
  const [records, setRecords] = useState<TraineeRecord[]>(INITIAL_RECORDS);
  const [activeTab, setActiveTab] = useState<'report' | 'script' | 'sync' | 'guide'>('report');
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>('https://docs.google.com/spreadsheets/d/your-sheet-id/edit');

  // Apps Script configuration state
  const [config, setConfig] = useState<ScriptConfig>({
    sheetName: '',
    recipients: 'auliadarmaputra34@gmail.com',
    ccRecipients: '',
    subjectPrefix: '[Daily Training Report]',
    triggerHour: 17, // 5:00 PM
    weekdaysOnly: true,
    includeSheetLink: true,
    createAuditTab: true,
    senderName: 'Team Training Bot',
  });

  // Unique available dates in the dataset
  const availableDates = useMemo(() => {
    const datesSet = new Set<string>();
    records.forEach(r => {
      if (r.date && r.date.trim()) {
        datesSet.add(r.date.trim());
      }
    });
    return Array.from(datesSet);
  }, [records]);

  // Selected active date or sheet (defaults to 'ALL' to show all sheets & records)
  const [selectedDate, setSelectedDate] = useState<string>('ALL');

  // Active records based on selected sheet / date
  const activeRecords = useMemo(() => {
    if (selectedDate === 'ALL') return records;
    if (selectedDate === 'WEEK_1') {
      const week1Dates = [
        'Monday, December 22, 2025',
        'Tuesday, December 23, 2025',
        'Wednesday, December 24, 2025',
        'Friday, December 26, 2025',
      ];
      return records.filter(r => week1Dates.includes(r.date));
    }
    if (selectedDate === 'WEEK_2') {
      const week2Dates = [
        'Monday, December 29, 2025',
        'Tuesday, December 30, 2025',
        'Wednesday, December 31, 2025',
      ];
      return records.filter(r => week2Dates.includes(r.date));
    }
    return records.filter(r => r.date === selectedDate);
  }, [records, selectedDate]);

  // Human-readable title for email and AI summary
  const displayDateLabel = useMemo(() => {
    if (selectedDate === 'ALL') return 'Desember 2025 (Semua Sheet / 56 Entri)';
    if (selectedDate === 'WEEK_1') return 'Sheet Week 1 (22 - 26 Desember 2025)';
    if (selectedDate === 'WEEK_2') return 'Sheet Week 2 (29 - 31 Desember 2025)';
    return selectedDate;
  }, [selectedDate]);

  // Update selected date if not in available dates and not a special sheet
  useEffect(() => {
    if (
      availableDates.length > 0 &&
      !availableDates.includes(selectedDate) &&
      selectedDate !== 'ALL' &&
      selectedDate !== 'WEEK_1' &&
      selectedDate !== 'WEEK_2'
    ) {
      setSelectedDate('ALL');
    }
  }, [availableDates, selectedDate]);

  // Modals state
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExportMonthlyOpen, setIsExportMonthlyOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // AI Summary state
  const [aiSummary, setAiSummary] = useState<AISummaryResponse | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Auth Initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser: User) => {
        setUser(currentUser);
        if (currentUser.email && !config.recipients.includes(currentUser.email)) {
          setConfig(prev => ({
            ...prev,
            recipients: currentUser.email || prev.recipients,
          }));
        }
      },
      () => {
        setUser(null);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setUser(res.user);
        if (res.user.email) {
          setConfig(prev => ({
            ...prev,
            recipients: res.user.email || prev.recipients,
          }));
        }
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
  };

  const handleDataLoaded = (newRecords: TraineeRecord[], url: string) => {
    if (newRecords && newRecords.length > 0) {
      setRecords(newRecords);
      setSpreadsheetUrl(url);
      setActiveTab('report');
    }
  };

  const handleAddRecord = (record: TraineeRecord) => {
    setRecords(prev => [record, ...prev]);
  };

  const handleImportRecords = (newRecords: TraineeRecord[], mode: 'append' | 'replace') => {
    if (mode === 'replace') {
      setRecords(newRecords);
    } else {
      setRecords(prev => [...prev, ...newRecords]);
    }
    setSelectedDate('ALL');
  };

  // Generate AI Executive Summary via Gemini API backend
  const handleGenerateAI = async () => {
    const targetRecords = activeRecords;
    if (targetRecords.length === 0) return;

    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/summarize-daily-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: displayDateLabel,
          records: targetRecords,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch from /api/summarize-daily-report');
      }

      const data = await res.json();
      setAiSummary(data);
    } catch (err) {
      console.warn('Backend AI summary error, generating fallback summary:', err);
      // Fallback local analytical summary
      const uniqueT = Array.from(new Set(targetRecords.map(r => r.name)));
      const remarks = targetRecords.filter(r => r.remark && r.remark.trim().length > 0);
      setAiSummary({
        summary: `Ringkasan untuk ${displayDateLabel}: sebanyak ${uniqueT.length} trainee aktif menyelesaikan materi Pre-Layout, Sub Layout (Mechanic & Sewing), dan Skill Matrix di bawah bimbingan mentor.`,
        highlights: [
          'Pre-Layout module comparison dan penginputan Algorism serta Add Info terlaksana',
          'Mechanic & Sewing Sub Layout dikerjakan dan diverifikasi hingga jumlah TRUE',
          'Latihan mandiri Pre-Layout Kathmandu dan ArcTeryx serta persiapan Defect Control berjalan lancar'
        ],
        blockersOrRemarks: remarks.length > 0
          ? remarks.map(r => `${r.name}: ${r.remark}`)
          : ['Semua peserta mencatat progres lancar tanpa kendala kritikal.'],
        trainerHighlights: [
          'Mentor aktif: Siti Yuhaeni, Sharah Putri Munggaran, Frisca Carvinia, Aris Jati Pratama, Budi, Ijal, Lutfi, Yanto',
          'Standarisasi SOP dan review kesesuaian PA SMV terlaksana dengan baik'
        ]
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isLoggingIn={isLoggingIn}
        selectedDate={selectedDate}
        onOpenEmailPreview={() => setIsEmailPreviewOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {activeTab === 'report' && (
          <ReportDashboard
            records={records}
            availableDates={availableDates}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onOpenEmailPreview={() => setIsEmailPreviewOpen(true)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenExportModal={() => setIsExportMonthlyOpen(true)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onSwitchToScript={() => setActiveTab('script')}
            aiSummary={aiSummary}
            isGeneratingAI={isGeneratingAI}
            onGenerateAI={handleGenerateAI}
          />
        )}

        {activeTab === 'script' && (
          <AppsScriptStudio
            config={config}
            onUpdateConfig={setConfig}
            onOpenPreview={() => setIsEmailPreviewOpen(true)}
          />
        )}

        {activeTab === 'sync' && (
          <SheetsLiveConnector
            user={user}
            onSignIn={handleSignIn}
            isLoggingIn={isLoggingIn}
            onDataLoaded={handleDataLoaded}
            currentSpreadsheetUrl={spreadsheetUrl}
            initialRecords={INITIAL_RECORDS}
          />
        )}

      </main>

      {/* Email Preview Modal */}
      <EmailPreviewModal
        isOpen={isEmailPreviewOpen}
        onClose={() => setIsEmailPreviewOpen(false)}
        date={displayDateLabel}
        records={activeRecords}
        config={config}
        aiSummary={aiSummary}
        spreadsheetUrl={spreadsheetUrl}
      />

      {/* Add Trainee Record Modal */}
      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddRecord={handleAddRecord}
        selectedDate={selectedDate}
        availableDates={availableDates}
      />

      {/* Export Monthly Modal */}
      <ExportMonthlyModal
        isOpen={isExportMonthlyOpen}
        onClose={() => setIsExportMonthlyOpen(false)}
        records={records}
        spreadsheetUrl={spreadsheetUrl}
        onNavigateToScript={() => setActiveTab('script')}
      />

      {/* Import Sheet Modal */}
      <ImportSheetModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportRecords={handleImportRecords}
        currentRecordsCount={records.length}
      />

      {/* Global Clean Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Built for Google Sheets Daily Report Generation & Team Email Notifications
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('script')}
              className="text-emerald-600 hover:underline font-medium"
            >
              Get Apps Script Code
            </button>
            <span>•</span>
            <button
              onClick={() => setIsEmailPreviewOpen(true)}
              className="text-blue-600 hover:underline font-medium"
            >
              Email Preview
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
