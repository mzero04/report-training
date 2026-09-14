import { ScriptConfig } from '../types';

export function generateAppScriptCode(config: ScriptConfig): string {
  const {
    sheetName,
    recipients,
    ccRecipients,
    subjectPrefix,
    triggerHour,
    weekdaysOnly,
    includeSheetLink,
    createAuditTab,
    senderName,
  } = config;

  return `/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT: AUTOMATED DAILY REPORT & TEAM EMAIL NOTIFICATIONS
 * Specifically designed for Team Training & Daily Activity Spreadsheets
 * ==============================================================================
 * 
 * Instructions:
 * 1. Open your Google Spreadsheet
 * 2. Click "Extensions" > "Apps Script"
 * 3. Delete any code in the editor and replace it with this entire script
 * 4. Click "Save" (Ctrl+S / Cmd+S)
 * 5. Return to your Spreadsheet and refresh the tab
 * 6. A new menu named "📋 Daily Report Automation" will appear!
 * 7. Click "Daily Report Automation" > "⏰ Setup Daily Automated Trigger"
 */

// ==========================================
// CONFIGURATION SETTINGS
// ==========================================
const REPORT_CONFIG = {
  // Target sheet tab name (leave empty "" to always use the active sheet)
  SHEET_NAME: "${sheetName || ''}",

  // Recipients for daily reports (comma separated)
  RECIPIENTS: "${recipients}",

  // CC Recipients (optional, comma separated)
  CC_RECIPIENTS: "${ccRecipients}",

  // Email subject prefix
  SUBJECT_PREFIX: "${subjectPrefix || '[Daily Report]'}",

  // Sender display name in email
  SENDER_NAME: "${senderName || 'Team Training Bot'}",

  // Trigger hour (0-23, e.g. 17 = 5:00 PM)
  TRIGGER_HOUR: ${triggerHour},

  // Only trigger on weekdays (Monday - Friday)
  WEEKDAYS_ONLY: ${weekdaysOnly},

  // Include direct link back to Google Spreadsheet in email
  INCLUDE_SHEET_LINK: ${includeSheetLink},

  // Name of the audit log sheet tab
  AUDIT_SHEET_NAME: "${createAuditTab ? 'Daily_Report_Logs' : ''}",

  // Column header aliases (case-insensitive auto matching)
  COL_ALIASES: {
    DATE: ['date', 'tanggal', 'hari/tanggal'],
    NAME: ['name', 'nama', 'trainee', 'peserta'],
    MATERIAL: ["today's learning material", 'learning material', 'materi', 'materi pembelajaran', 'topic'],
    TRAINER: ['traineer', 'trainer', 'instruktur', 'mentor', 'pembimbing'],
    REMARK: ['remark / question', 'remark', 'question', 'catatan', 'keterangan', 'pertanyaan', 'kendala']
  }
};

/**
 * Creates custom menu in Google Sheets on document open
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📋 Daily Report Automation')
    .addItem('📧 Send Today\\'s Daily Report', 'sendDailyReportToday')
    .addItem('📑 Send Report for All Sheets (Semua Sheet)', 'sendReportForAllSheets')
    .addItem('👁️ Preview Today\\'s Email', 'previewDailyReportToday')
    .addItem('👁️ Preview All Sheets Email', 'previewAllSheetsReport')
    .addItem('📅 Send Report for Selected Row Date', 'sendReportForSelectedRow')
    .addSeparator()
    .addItem('📁 Export All Sheets by Month & Year (Create Monthly Tabs)', 'exportAllSheetsByMonthAndYear')
    .addItem('📦 Export Monthly Data to Drive Folder (CSV)', 'exportMonthlyToDriveFolder')
    .addSeparator()
    .addItem('📥 Import Data to Sheet (CSV / Paste)', 'showImportDataDialog')
    .addItem('📥 Import Data from Google Drive Archive', 'importFromDriveArchive')
    .addSeparator()
    .addItem('⏰ Setup Daily Automated Trigger (' + REPORT_CONFIG.TRIGGER_HOUR + ':00)', 'setupDailyReportTrigger')
    .addItem('🛑 Remove Automated Triggers', 'removeDailyReportTriggers')
    .addItem('🧪 Send Test Draft to Self', 'sendTestDraftToSelf')
    .addToUi();
}

/**
 * Main function invoked daily by Time-Driven Trigger
 */
function sendDailyReportToday() {
  const today = new Date();
  
  // Skip weekends if configured
  if (REPORT_CONFIG.WEEKDAYS_ONLY) {
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      Logger.log('Weekend detected. Skipping automated daily report.');
      return;
    }
  }

  const result = processAndSendReport(today, false);
  Logger.log('Daily report status: ' + JSON.stringify(result));
}

/**
 * Extracts trainee records across ALL visible sheets in this spreadsheet
 */
function extractAllSheetsData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const allRecords = [];
  const processedSheetNames = [];

  sheets.forEach(function(sheet) {
    const sName = sheet.getName();
    // Skip audit tabs and generated archive tabs
    if (sName === REPORT_CONFIG.AUDIT_SHEET_NAME || (sName.indexOf('[') === 0 && sName.indexOf(']') > 0)) {
      return;
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return;

    const indices = findColumnIndices(data);
    let currentDate = '';

    for (let r = indices.headerRow + 1; r < data.length; r++) {
      const rawDateVal = data[r][indices.dateCol];
      if (rawDateVal !== '' && rawDateVal !== null && rawDateVal !== undefined) {
        currentDate = String(rawDateVal).trim();
      }

      const name = String(data[r][indices.nameCol] || '').trim();
      const material = String(data[r][indices.materialCol] || '').trim();
      const trainer = String(data[r][indices.trainerCol] || '').trim();
      const remark = String(data[r][indices.remarkCol] || '').trim();

      if (!name && !material) continue;

      allRecords.push({
        row: r + 1,
        sheet: sName,
        date: currentDate || sName,
        name: name,
        material: material,
        trainer: trainer,
        remark: remark
      });
    }

    processedSheetNames.push(sName);
  });

  if (allRecords.length === 0) return null;

  const dateLabel = 'Semua Sheet (' + processedSheetNames.join(', ') + ')';
  return buildReportPayload(dateLabel, allRecords);
}

/**
 * Sends an email report containing trainee records from ALL sheets in this spreadsheet
 */
function sendReportForAllSheets() {
  const ui = SpreadsheetApp.getUi();
  const reportData = extractAllSheetsData();

  if (!reportData || reportData.records.length === 0) {
    ui.alert('No Records Found', 'No trainee log records found across sheets in this spreadsheet.', ui.ButtonSet.OK);
    return;
  }

  const confirm = ui.alert(
    'Konfirmasi Kirim Email Semua Sheet',
    'Kirim laporan email berisi ' + reportData.records.length + ' data dari semua sheet ke: ' + REPORT_CONFIG.RECIPIENTS + '?',
    ui.ButtonSet.YES_NO
  );

  if (confirm === ui.Button.YES) {
    dispatchEmail(reportData, false);
    ui.alert('✅ Berhasil!', 'Email laporan untuk semua sheet telah berhasil dikirim ke: ' + REPORT_CONFIG.RECIPIENTS, ui.ButtonSet.OK);
  }
}

/**
 * Previews the email report containing all sheets
 */
function previewAllSheetsReport() {
  const reportData = extractAllSheetsData();

  if (!reportData || reportData.records.length === 0) {
    SpreadsheetApp.getUi().alert('No Records Found', 'No trainee records found across sheets.', SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  const htmlBody = generateHtmlEmail(reportData);
  const htmlOutput = HtmlService.createHtmlOutput(htmlBody)
    .setWidth(850)
    .setHeight(650)
    .setTitle('Email Report Preview: ' + reportData.dateString);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Email Preview: Semua Sheet (' + reportData.records.length + ' Baris)');
}

/**
 * Previews the email report in a clean modal dialog inside Google Sheets
 */
function previewDailyReportToday() {
  const today = new Date();
  const reportData = extractDailyData(today);
  
  if (!reportData || reportData.records.length === 0) {
    SpreadsheetApp.getUi().alert(
      'No Records Found',
      'No log entries found matching today (' + formatDateOnly(today) + '). Try selecting a row from another date and click "Send Report for Selected Row Date".',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  const htmlBody = generateHtmlEmail(reportData);
  const htmlOutput = HtmlService.createHtmlOutput(htmlBody)
    .setWidth(850)
    .setHeight(650)
    .setTitle('Email Report Preview - ' + reportData.dateString);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Email Preview: ' + reportData.dateString);
}

/**
 * Sends a report for whatever date is in the currently selected cell/row
 */
function sendReportForSelectedRow() {
  const ui = SpreadsheetApp.getUi();
  const sheet = getTargetSheet();
  const activeRange = sheet.getActiveRange();
  
  if (!activeRange) {
    ui.alert('Please click on a row containing data first.');
    return;
  }

  const rowIndex = activeRange.getRow();
  const data = sheet.getDataRange().getValues();
  const headers = findColumnIndices(data);

  if (rowIndex < 2 || rowIndex > data.length) {
    ui.alert('Please select a valid data row below the header.');
    return;
  }

  // Look backwards to find the date of this block if blank
  let rowDate = '';
  for (let r = rowIndex - 1; r >= 1; r--) {
    const val = data[r][headers.dateCol];
    if (val !== '' && val !== null && val !== undefined) {
      rowDate = val;
      break;
    }
  }

  if (!rowDate) {
    ui.alert('Could not determine date for this row. Please check column headers.');
    return;
  }

  const confirm = ui.alert(
    'Confirm Report Dispatch',
    'Do you want to generate and send the team report for date: "' + rowDate + '" to ' + REPORT_CONFIG.RECIPIENTS + '?',
    ui.ButtonSet.YES_NO
  );

  if (confirm === ui.Button.YES) {
    const reportData = extractDataForDateMatch(rowDate);
    if (!reportData || reportData.records.length === 0) {
      ui.alert('No records found for: ' + rowDate);
      return;
    }
    dispatchEmail(reportData, false);
    ui.alert('✅ Report sent successfully for: ' + rowDate);
  }
}

/**
 * Sends test draft to current user's Gmail
 */
function sendTestDraftToSelf() {
  const userEmail = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
  const today = new Date();
  let reportData = extractDailyData(today);
  
  // If no records for today, use the last available date in the sheet
  if (!reportData || reportData.records.length === 0) {
    const allDates = getAllAvailableDates();
    if (allDates.length > 0) {
      reportData = extractDataForDateMatch(allDates[allDates.length - 1]);
    }
  }

  if (!reportData || reportData.records.length === 0) {
    SpreadsheetApp.getUi().alert('No data found in spreadsheet to build a test draft.');
    return;
  }

  const htmlBody = generateHtmlEmail(reportData);
  const subject = '[TEST DRAFT] ' + REPORT_CONFIG.SUBJECT_PREFIX + ' Team Report - ' + reportData.dateString;

  GmailApp.createDraft(userEmail, subject, 'Please view this message in an HTML-compatible email client.', {
    htmlBody: htmlBody,
    name: REPORT_CONFIG.SENDER_NAME
  });

  SpreadsheetApp.getUi().alert(
    'Draft Created!',
    'A test draft has been created in your Gmail account (' + userEmail + '). Open your Gmail drafts folder to check the formatting.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Process report and dispatch email
 */
function processAndSendReport(targetDate, isTest) {
  const reportData = extractDailyData(targetDate);
  if (!reportData || reportData.records.length === 0) {
    Logger.log('No records found for date: ' + formatDateOnly(targetDate));
    return { success: false, message: 'No records found for date' };
  }

  dispatchEmail(reportData, isTest);
  return { success: true, count: reportData.records.length };
}

/**
 * Sends the email via MailApp/GmailApp and writes audit record
 */
function dispatchEmail(reportData, isTest) {
  const subject = REPORT_CONFIG.SUBJECT_PREFIX + ' Team Daily Training & Activity Report - ' + reportData.dateString;
  const htmlBody = generateHtmlEmail(reportData);
  const plainText = generatePlainTextEmail(reportData);

  const mailOptions = {
    htmlBody: htmlBody,
    name: REPORT_CONFIG.SENDER_NAME
  };

  if (REPORT_CONFIG.CC_RECIPIENTS) {
    mailOptions.cc = REPORT_CONFIG.CC_RECIPIENTS;
  }

  const to = isTest ? Session.getActiveUser().getEmail() : REPORT_CONFIG.RECIPIENTS;
  
  MailApp.sendEmail(to, subject, plainText, mailOptions);

  // Write audit log if configured
  if (REPORT_CONFIG.AUDIT_SHEET_NAME) {
    logReportSent(reportData.dateString, reportData.records.length, to);
  }
}

/**
 * Locates target worksheet
 */
function getTargetSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (REPORT_CONFIG.SHEET_NAME) {
    const sheet = ss.getSheetByName(REPORT_CONFIG.SHEET_NAME);
    if (sheet) return sheet;
  }
  return ss.getActiveSheet();
}

/**
 * Finds column indices from header row
 */
function findColumnIndices(data) {
  let headerRowIndex = 0;
  // Look in first 5 rows for header row
  for (let r = 0; r < Math.min(5, data.length); r++) {
    const row = data[r].map(function(c) { return String(c).toLowerCase().trim(); });
    const hasName = row.some(function(cell) {
      return REPORT_CONFIG.COL_ALIASES.NAME.some(function(alias) { return cell.indexOf(alias) !== -1; });
    });
    const hasMaterial = row.some(function(cell) {
      return REPORT_CONFIG.COL_ALIASES.MATERIAL.some(function(alias) { return cell.indexOf(alias) !== -1; });
    });
    if (hasName || hasMaterial) {
      headerRowIndex = r;
      break;
    }
  }

  const headers = data[headerRowIndex].map(function(c) { return String(c).toLowerCase().trim(); });

  function findCol(aliases, defaultIndex) {
    for (let i = 0; i < headers.length; i++) {
      for (let a = 0; a < aliases.length; a++) {
        if (headers[i] === aliases[a] || headers[i].indexOf(aliases[a]) !== -1) {
          return i;
        }
      }
    }
    return defaultIndex;
  }

  return {
    headerRow: headerRowIndex,
    dateCol: findCol(REPORT_CONFIG.COL_ALIASES.DATE, 1),
    nameCol: findCol(REPORT_CONFIG.COL_ALIASES.NAME, 2),
    materialCol: findCol(REPORT_CONFIG.COL_ALIASES.MATERIAL, 3),
    trainerCol: findCol(REPORT_CONFIG.COL_ALIASES.TRAINER, 4),
    remarkCol: findCol(REPORT_CONFIG.COL_ALIASES.REMARK, 5)
  };
}

/**
 * Extracts data matching a given date object
 */
function extractDailyData(targetDate) {
  const sheet = getTargetSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return null;

  const indices = findColumnIndices(data);
  const targetDateFormatted = formatDateOnly(targetDate);

  let matchedRecords = [];
  let currentDate = '';
  let matchedDateString = '';

  for (let r = indices.headerRow + 1; r < data.length; r++) {
    const rawDateVal = data[r][indices.dateCol];
    if (rawDateVal !== '' && rawDateVal !== null && rawDateVal !== undefined) {
      currentDate = String(rawDateVal).trim();
    }

    const name = String(data[r][indices.nameCol] || '').trim();
    const material = String(data[r][indices.materialCol] || '').trim();
    const trainer = String(data[r][indices.trainerCol] || '').trim();
    const remark = String(data[r][indices.remarkCol] || '').trim();

    if (!name && !material) continue;

    // Compare date: checks standard date format or partial string match (e.g. "December 22, 2025")
    const isDateMatch = isSameCalendarDay(currentDate, targetDate) ||
      (currentDate && currentDate.toLowerCase().indexOf(targetDateFormatted.toLowerCase()) !== -1);

    if (isDateMatch) {
      matchedDateString = currentDate;
      matchedRecords.push({
        row: r + 1,
        date: currentDate,
        name: name,
        material: material,
        trainer: trainer,
        remark: remark
      });
    }
  }

  // Fallback: If no records match exact date today, but there are recent records, return null
  if (matchedRecords.length === 0) {
    return null;
  }

  return buildReportPayload(matchedDateString || targetDateFormatted, matchedRecords);
}

/**
 * Extracts records for an explicit date string
 */
function extractDataForDateMatch(targetDateStr) {
  const sheet = getTargetSheet();
  const data = sheet.getDataRange().getValues();
  const indices = findColumnIndices(data);

  const matchedRecords = [];
  let currentDate = '';
  const searchStr = String(targetDateStr).toLowerCase().trim();

  for (let r = indices.headerRow + 1; r < data.length; r++) {
    const rawDateVal = data[r][indices.dateCol];
    if (rawDateVal !== '' && rawDateVal !== null && rawDateVal !== undefined) {
      currentDate = String(rawDateVal).trim();
    }

    const name = String(data[r][indices.nameCol] || '').trim();
    const material = String(data[r][indices.materialCol] || '').trim();
    const trainer = String(data[r][indices.trainerCol] || '').trim();
    const remark = String(data[r][indices.remarkCol] || '').trim();

    if (!name && !material) continue;

    if (currentDate.toLowerCase().indexOf(searchStr) !== -1 || searchStr.indexOf(currentDate.toLowerCase()) !== -1) {
      matchedRecords.push({
        row: r + 1,
        date: currentDate,
        name: name,
        material: material,
        trainer: trainer,
        remark: remark
      });
    }
  }

  return buildReportPayload(targetDateStr, matchedRecords);
}

/**
 * Returns all unique dates present in the sheet
 */
function getAllAvailableDates() {
  const sheet = getTargetSheet();
  const data = sheet.getDataRange().getValues();
  const indices = findColumnIndices(data);
  const dates = [];

  for (let r = indices.headerRow + 1; r < data.length; r++) {
    const val = String(data[r][indices.dateCol] || '').trim();
    if (val && dates.indexOf(val) === -1) {
      dates.push(val);
    }
  }
  return dates;
}

/**
 * Helper to build report statistics and aggregation
 */
function buildReportPayload(dateString, records) {
  const trainersSet = {};
  const topicsSet = {};
  let remarksCount = 0;

  records.forEach(function(rec) {
    if (rec.trainer) {
      // Split numbered list or lines
      const parts = rec.trainer.split(/\\n|\\r|[0-9]+\\./);
      parts.forEach(function(p) {
        const clean = p.replace(/^[^a-zA-Z]+/, '').trim();
        if (clean.length > 2) trainersSet[clean] = true;
      });
    }
    if (rec.material) {
      const matLines = rec.material.split(/\\n|\\r|[0-9]+\\./);
      matLines.forEach(function(m) {
        const cleanM = m.replace(/^[^a-zA-Z0-9]+/, '').trim();
        if (cleanM.length > 3) topicsSet[cleanM] = true;
      });
    }
    if (rec.remark && rec.remark.trim().length > 0) {
      remarksCount++;
    }
  });

  return {
    dateString: dateString,
    records: records,
    traineeCount: records.length,
    trainersList: Object.keys(trainersSet),
    topicsList: Object.keys(topicsSet),
    remarksCount: remarksCount,
    spreadsheetUrl: SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    spreadsheetName: SpreadsheetApp.getActiveSpreadsheet().getName()
  };
}

/**
 * Generates beautiful, responsive, modern HTML email template
 */
function generateHtmlEmail(report) {
  const primaryColor = '#1e3a8a'; // Deep Navy
  const accentColor = '#2563eb'; // Blue
  const surfaceColor = '#f8fafc'; // Crisp slate background
  const borderColor = '#e2e8f0';

  // Build trainee table rows
  let rowsHtml = '';
  report.records.forEach(function(rec, idx) {
    const isEven = idx % 2 === 0;
    const bgStyle = isEven ? '#ffffff' : '#f8fafc';
    
    // Format learning materials as clean list
    const matList = rec.material
      .split(/\\n|\\r/)
      .filter(function(line) { return line.trim().length > 0; })
      .map(function(line) {
        return '<li style="margin-bottom: 4px; line-height: 1.4;">' + escapeHtml(line.trim()) + '</li>';
      }).join('');

    // Format trainers as tags
    const trainerBadges = rec.trainer
      .split(/\\n|\\r/)
      .filter(function(line) { return line.trim().length > 0; })
      .map(function(t) {
        const clean = t.replace(/^[0-9]+\\.\\s*/, '').trim();
        return '<span style="display:inline-block; background-color:#eff6ff; color:#1d4ed8; padding:2px 8px; border-radius:12px; font-size:12px; font-weight:500; margin:2px 4px 2px 0; border:1px solid #bfdbfe;">' + escapeHtml(clean) + '</span>';
      }).join(' ');

    // Highlight remark/question if present
    const remarkHtml = rec.remark && rec.remark.trim()
      ? '<div style="background:#fffbeb; border-left:3px solid #f59e0b; padding:6px 10px; font-size:12px; color:#92400e; border-radius:0 4px 4px 0; margin-top:4px;"><strong>Notice:</strong> ' + escapeHtml(rec.remark) + '</div>'
      : '<span style="color:#94a3b8; font-size:12px;">— None —</span>';

    rowsHtml += '<tr style="background-color:' + bgStyle + '; border-bottom:1px solid ' + borderColor + ';">' +
      '<td style="padding:12px 14px; font-weight:600; color:#0f172a; vertical-align:top; font-size:13px; width:180px;">' +
        '<div style="font-size:14px; color:#1e293b;">' + escapeHtml(rec.name) + '</div>' +
        (rec.date ? '<div style="font-size:11px; color:#64748b; font-weight:normal; margin-top:2px;">📅 ' + escapeHtml(rec.date) + (rec.sheet ? ' (' + escapeHtml(rec.sheet) + ')' : '') + '</div>' : '') +
        '<div style="margin-top:6px;">' + trainerBadges + '</div>' +
      '</td>' +
      '<td style="padding:12px 14px; color:#334155; vertical-align:top; font-size:13px;">' +
        '<ul style="margin:0; padding-left:18px; color:#334155;">' + matList + '</ul>' +
      '</td>' +
      '<td style="padding:12px 14px; vertical-align:top; width:220px;">' +
        remarkHtml +
      '</td>' +
    '</tr>';
  });

  // Topics highlight pills
  const topicsSummaryHtml = report.topicsList.slice(0, 8).map(function(t) {
    return '<span style="display:inline-block; background-color:#f1f5f9; color:#475569; padding:4px 10px; border-radius:6px; font-size:12px; margin:3px 4px 3px 0; border:1px solid #e2e8f0;">• ' + escapeHtml(t) + '</span>';
  }).join('');

  return '<!DOCTYPE html>' +
  '<html>' +
  '<head>' +
    '<meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>Daily Report</title>' +
  '</head>' +
  '<body style="margin:0; padding:20px; background-color:#f1f5f9; font-family:-apple-system, BlinkMacSystemFont, \\'Segoe UI\\', Roboto, Helvetica, Arial, sans-serif; color:#0f172a;">' +
    '<div style="max-width:760px; margin:0 auto; background-color:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 4px 12px rgba(0,0,0,0.05);">' +
      
      '<!-- HEADER -->' +
      '<div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color:#ffffff; padding:28px 32px;">' +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<div>' +
            '<div style="font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#93c5fd; margin-bottom:4px;">Team Daily Progress Report</div>' +
            '<h1 style="margin:0; font-size:24px; font-weight:700; letter-spacing:-0.5px; color:#ffffff;">' + escapeHtml(report.dateString) + '</h1>' +
            '<div style="font-size:13px; color:#cbd5e1; margin-top:6px;">Automated dispatch for ' + escapeHtml(report.spreadsheetName) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<!-- KPI METRICS BAR -->' +
      '<div style="background-color:#f8fafc; border-bottom:1px solid #e2e8f0; padding:18px 32px;">' +
        '<table width="100%" cellpadding="0" cellspacing="0" border="0">' +
          '<tr>' +
            '<td style="text-align:center; padding:6px; border-right:1px solid #e2e8f0;">' +
              '<div style="font-size:26px; font-weight:800; color:#1e3a8a;">' + report.traineeCount + '</div>' +
              '<div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:#64748b; margin-top:2px;">Trainees Active</div>' +
            '</td>' +
            '<td style="text-align:center; padding:6px; border-right:1px solid #e2e8f0;">' +
              '<div style="font-size:26px; font-weight:800; color:#2563eb;">' + report.trainersList.length + '</div>' +
              '<div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:#64748b; margin-top:2px;">Trainers on Duty</div>' +
            '</td>' +
            '<td style="text-align:center; padding:6px; border-right:1px solid #e2e8f0;">' +
              '<div style="font-size:26px; font-weight:800; color:#059669;">' + report.topicsList.length + '</div>' +
              '<div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:#64748b; margin-top:2px;">Topics Covered</div>' +
            '</td>' +
            '<td style="text-align:center; padding:6px;">' +
              '<div style="font-size:26px; font-weight:800; color:' + (report.remarksCount > 0 ? '#d97706' : '#64748b') + ';">' + report.remarksCount + '</div>' +
              '<div style="font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:#64748b; margin-top:2px;">Flagged Remarks</div>' +
            '</td>' +
          '</tr>' +
        '</table>' +
      '</div>' +

      '<!-- MAIN CONTENT -->' +
      '<div style="padding:28px 32px;">' +
        
        '<!-- Core Modules Summary -->' +
        '<div style="margin-bottom:24px;">' +
          '<h3 style="margin:0 0 10px 0; font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#334155;">Key Curriculum & Modules Trained Today</h3>' +
          '<div>' + topicsSummaryHtml + '</div>' +
        '</div>' +

        '<!-- Trainee Table -->' +
        '<div style="border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; margin-bottom:24px;">' +
          '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; text-align:left;">' +
            '<thead>' +
              '<tr style="background-color:#f1f5f9; border-bottom:2px solid #cbd5e1;">' +
                '<th style="padding:12px 14px; font-size:12px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">Trainee & Trainers</th>' +
                '<th style="padding:12px 14px; font-size:12px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">Today\\'s Learning Material</th>' +
                '<th style="padding:12px 14px; font-size:12px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:0.5px;">Remarks & Questions</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              rowsHtml +
            '</tbody>' +
          '</table>' +
        '</div>' +

        '<!-- SPREADSHEET CTA BUTTON -->' +
        (REPORT_CONFIG.INCLUDE_SHEET_LINK ? 
          '<div style="text-align:center; padding:12px 0 8px 0;">' +
            '<a href="' + report.spreadsheetUrl + '" style="display:inline-block; background-color:#2563eb; color:#ffffff; font-weight:600; font-size:14px; text-decoration:none; padding:12px 24px; border-radius:6px; box-shadow:0 2px 4px rgba(37,99,235,0.2);">' +
              '📊 Open Live Google Spreadsheet' +
            '</a>' +
          '</div>' : '') +

      '</div>' +

      '<!-- FOOTER -->' +
      '<div style="background-color:#f8fafc; border-top:1px solid #e2e8f0; padding:20px 32px; font-size:12px; color:#64748b; text-align:center; line-height:1.5;">' +
        '<div>Sent automatically by <strong>' + escapeHtml(REPORT_CONFIG.SENDER_NAME) + '</strong> via Google Apps Script.</div>' +
        '<div style="margin-top:4px;">To adjust triggers or recipients, open the Google Spreadsheet > Daily Report Automation menu.</div>' +
      '</div>' +

    '</div>' +
  '</body>' +
  '</html>';
}

/**
 * Generates plain-text fallback version of email
 */
function generatePlainTextEmail(report) {
  let text = 'DAILY TRAINING REPORT: ' + report.dateString + '\\n';
  text += '==================================================\\n';
  text += 'Trainees Active: ' + report.traineeCount + ' | Trainers: ' + report.trainersList.join(', ') + '\\n\\n';
  
  report.records.forEach(function(rec) {
    text += '- ' + rec.name + ' (Trainer: ' + rec.trainer.replace(/\\n/g, ', ') + ')\\n';
    text += '  Material: ' + rec.material.replace(/\\n/g, ' ') + '\\n';
    if (rec.remark) text += '  Remark: ' + rec.remark + '\\n';
    text += '\\n';
  });

  if (REPORT_CONFIG.INCLUDE_SHEET_LINK) {
    text += 'Spreadsheet: ' + report.spreadsheetUrl + '\\n';
  }

  return text;
}

/**
 * Configures the automated Time-Driven Trigger
 */
function setupDailyReportTrigger() {
  removeDailyReportTriggers();

  ScriptApp.newTrigger('sendDailyReportToday')
    .timeBased()
    .everyDays(1)
    .atHour(REPORT_CONFIG.TRIGGER_HOUR)
    .create();

  SpreadsheetApp.getUi().alert(
    'Trigger Installed Successfully!',
    'The automated daily report trigger is active. It will run every day at approximately ' + REPORT_CONFIG.TRIGGER_HOUR + ':00.' +
    (REPORT_CONFIG.WEEKDAYS_ONLY ? ' (Weekends will be automatically skipped)' : ''),
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Removes all existing daily report triggers
 */
function removeDailyReportTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  let count = 0;
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'sendDailyReportToday') {
      ScriptApp.deleteTrigger(triggers[i]);
      count++;
    }
  }
  Logger.log('Removed ' + count + ' old triggers.');
}

/**
 * Logs dispatch to an audit sheet tab
 */
function logReportSent(dateStr, traineeCount, recipient) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let auditSheet = ss.getSheetByName(REPORT_CONFIG.AUDIT_SHEET_NAME);
    if (!auditSheet) {
      auditSheet = ss.insertSheet(REPORT_CONFIG.AUDIT_SHEET_NAME);
      auditSheet.appendRow(['Timestamp', 'Report Date', 'Trainees Count', 'Recipients', 'Status']);
      auditSheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#f1f5f9');
    }
    auditSheet.appendRow([new Date(), dateStr, traineeCount, recipient, 'SUCCESS']);
  } catch (err) {
    Logger.log('Could not write audit row: ' + err);
  }
}

/**
 * Utility: Robustly parses various date formats (Date object, Sheets serial, string, Indonesian months)
 */
function parseDateValue(val) {
  if (!val) return null;

  // 1. Native Date object
  if (Object.prototype.toString.call(val) === '[object Date]' || val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }

  // 2. Numeric timestamp or Google Sheets serial number
  if (typeof val === 'number') {
    if (val > 30000 && val < 60000) {
      // Days since Dec 30, 1899
      const ms = Math.round((val - 25569) * 86400 * 1000);
      const d = new Date(ms);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }

  const str = String(val).trim();
  if (!str) return null;

  // 3. Indonesian / English month dictionary
  const idMonths = {
    'januari': 'January', 'jan': 'Jan',
    'februari': 'February', 'feb': 'Feb', 'peb': 'Feb',
    'maret': 'March', 'mar': 'Mar',
    'april': 'April', 'apr': 'Apr',
    'mei': 'May',
    'juni': 'June', 'jun': 'Jun',
    'juli': 'July', 'jul': 'Jul',
    'agustus': 'August', 'agu': 'Aug', 'ags': 'Aug',
    'september': 'September', 'sep': 'Sep',
    'oktober': 'October', 'okt': 'Oct',
    'november': 'November', 'nov': 'Nov', 'nop': 'Nov',
    'desember': 'December', 'des': 'Dec'
  };

  // Strip leading day names (e.g. "Monday, ", "Senin, ")
  let cleanStr = str.replace(/^(senin|selasa|rabu|kamis|jumat|sabtu|minggu|monday|tuesday|wednesday|thursday|friday|saturday|sunday)[,.\\s]*/i, '').trim();

  // Normalize Indonesian month names to English
  for (const mId in idMonths) {
    const reg = new RegExp('\\\\b' + mId + '\\\\b', 'i');
    if (reg.test(cleanStr)) {
      cleanStr = cleanStr.replace(reg, idMonths[mId]);
      break;
    }
  }

  // 4. Try DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = cleanStr.match(/^(\\d{1,2})[\\/\\-\\.](\\d{1,2})[\\/\\-\\.](\\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const parsed = new Date(year, month, day);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // 5. Try YYYY-MM-DD
  const ymdMatch = cleanStr.match(/^(\\d{4})[\\/\\-\\.](\\d{1,2})[\\/\\-\\.](\\d{1,2})/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const parsed = new Date(year, month, day);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // 6. Direct JS Date parsing with normalized string
  let d = new Date(cleanStr);
  if (!isNaN(d.getTime())) return d;

  // 7. Month & Year regex fallback (e.g. "December 2025")
  const myMatch = cleanStr.match(/(January|February|March|April|May|June|July|August|September|October|November|December).*?(\\d{4})/i);
  if (myMatch) {
    const parsed = new Date(myMatch[1] + ' 1, ' + myMatch[2]);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

/**
 * Utility: Checks if two date representations point to the same day
 */
function isSameCalendarDay(dateValA, dateValB) {
  try {
    const dA = parseDateValue(dateValA);
    const dB = parseDateValue(dateValB);
    if (!dA || !dB || isNaN(dA.getTime()) || isNaN(dB.getTime())) return false;
    return dA.getFullYear() === dB.getFullYear() &&
           dA.getMonth() === dB.getMonth() &&
           dA.getDate() === dB.getDate();
  } catch (e) {
    return false;
  }
}

/**
 * Utility: Formats date to simple string (e.g. "December 22, 2025")
 */
function formatDateOnly(d) {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}

/**
 * Utility: Escapes HTML entities
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * ==============================================================================
 * EXPORT FEATURE: EXPORT ALL SHEETS BY MONTH & YEAR
 * ==============================================================================
 * Scans all sheets in the spreadsheet, parses the date for each trainee log row,
 * groups them by Month & Year, and creates/updates dedicated monthly summary tabs.
 */
function exportAllSheetsByMonthAndYear() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  const sheets = ss.getSheets();
  
  const monthlyGroups = {}; // key: "YYYY-MM" -> { label, records: [] }
  let totalProcessedRows = 0;

  sheets.forEach(function(sheet) {
    const sheetName = sheet.getName();
    // Skip audit tabs and generated archive tabs
    if (sheetName === REPORT_CONFIG.AUDIT_SHEET_NAME || (sheetName.indexOf('[') === 0 && sheetName.indexOf(']') > 0)) {
      return;
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return;

    const headers = findColumnIndices(data);
    if (headers.nameCol === -1) return;

    let currentDateStr = '';
    let currentDateObj = null;

    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      const rawDate = row[headers.dateCol];

      if (rawDate !== '' && rawDate !== null && rawDate !== undefined) {
        currentDateStr = String(rawDate).trim();
        currentDateObj = parseDateValue(rawDate);
      }

      const name = String(row[headers.nameCol] || '').trim();
      if (!name) continue;

      const material = headers.materialCol !== -1 ? String(row[headers.materialCol] || '').trim() : '';
      const trainer = headers.trainerCol !== -1 ? String(row[headers.trainerCol] || '').trim() : '';
      const remark = headers.remarkCol !== -1 ? String(row[headers.remarkCol] || '').trim() : '';

      // Determine Month & Year key
      let yearMonthKey = 'Unknown';
      let monthLabel = 'Unknown Period';

      if (currentDateObj && !isNaN(currentDateObj.getTime())) {
        const y = currentDateObj.getFullYear();
        const m = ('0' + (currentDateObj.getMonth() + 1)).slice(-2);
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        yearMonthKey = y + '-' + m;
        monthLabel = months[currentDateObj.getMonth()] + ' ' + y;
      } else if (currentDateStr) {
        const match = currentDateStr.match(/(January|February|March|April|May|June|July|August|September|October|November|December).*?(\\d{4})/i);
        if (match) {
          monthLabel = match[1] + ' ' + match[2];
          yearMonthKey = monthLabel;
        }
      }

      if (!monthlyGroups[yearMonthKey]) {
        monthlyGroups[yearMonthKey] = {
          key: yearMonthKey,
          label: monthLabel,
          records: []
        };
      }

      monthlyGroups[yearMonthKey].records.push({
        sourceSheet: sheetName,
        date: currentDateStr,
        name: name,
        material: material,
        trainer: trainer,
        remark: remark
      });

      totalProcessedRows++;
    }
  });

  const groupKeys = Object.keys(monthlyGroups).sort();
  if (groupKeys.length === 0) {
    ui.alert('No Data Found', 'No records found across sheets to export.', ui.ButtonSet.OK);
    return;
  }

  // Create or update a dedicated tab for each month
  groupKeys.forEach(function(key) {
    const group = monthlyGroups[key];
    const targetTabName = '[' + group.key + '] Summary';
    
    let tab = ss.getSheetByName(targetTabName);
    if (!tab) {
      tab = ss.insertSheet(targetTabName);
    } else {
      tab.clear();
    }

    try {
      tab.setTabColor('#059669');
    } catch(e) {}

    // Title banner
    tab.getRange('A1:F1').merge()
       .setValue('MONTHLY TRAINING REPORT ARCHIVE: ' + group.label.toUpperCase())
       .setBackground('#1e3a8a')
       .setFontColor('#ffffff')
       .setFontWeight('bold')
       .setFontSize(12)
       .setHorizontalAlignment('center')
       .setVerticalAlignment('middle');
    tab.setRowHeight(1, 36);

    // Summary metadata row
    const uniqueTrainees = [];
    group.records.forEach(function(rec) {
      if (uniqueTrainees.indexOf(rec.name) === -1) uniqueTrainees.push(rec.name);
    });

    tab.getRange('A2:F2').merge()
       .setValue('Total Records: ' + group.records.length + ' | Trainees: ' + uniqueTrainees.length + ' | Generated on: ' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'))
       .setBackground('#f1f5f9')
       .setFontColor('#475569')
       .setFontSize(10)
       .setHorizontalAlignment('center')
       .setVerticalAlignment('middle');
    tab.setRowHeight(2, 24);

    // Table Headers
    const colHeaders = ['No', 'Date', 'Trainee Name', 'Today\\'s Learning Material', 'Trainer / Mentors', 'Remarks / Questions'];
    tab.getRange(3, 1, 1, colHeaders.length)
       .setValues([colHeaders])
       .setBackground('#334155')
       .setFontColor('#ffffff')
       .setFontWeight('bold')
       .setFontSize(10)
       .setVerticalAlignment('middle');
    tab.setRowHeight(3, 28);

    // Output rows
    const rows = group.records.map(function(r, idx) {
      return [
        idx + 1,
        r.date,
        r.name,
        r.material,
        r.trainer,
        r.remark
      ];
    });

    if (rows.length > 0) {
      const dataRange = tab.getRange(4, 1, rows.length, colHeaders.length);
      dataRange.setValues(rows)
               .setFontSize(10)
               .setVerticalAlignment('top')
               .setWrap(true);

      for (let i = 0; i < rows.length; i++) {
        const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
        tab.getRange(4 + i, 1, 1, colHeaders.length).setBackground(bg);
      }

      dataRange.setBorder(true, true, true, true, true, true, '#cbd5e1', SpreadsheetApp.BorderStyle.SOLID);
    }

    tab.setColumnWidth(1, 45);
    tab.setColumnWidth(2, 170);
    tab.setColumnWidth(3, 180);
    tab.setColumnWidth(4, 340);
    tab.setColumnWidth(5, 180);
    tab.setColumnWidth(6, 220);
  });

  ui.alert(
    'Export Berhasil! (Export Successful)',
    'Berhasil mengekspor semua sheet berdasarkan bulan dan tahun!\\n\\n' +
    '• Total Baris Diproses: ' + totalProcessedRows + '\\n' +
    '• Periode Bulan: ' + groupKeys.join(', ') + '\\n' +
    '• Sheet tab baru telah dibuat: ' + groupKeys.map(function(k) { return '[' + k + '] Summary'; }).join(', '),
    ui.ButtonSet.OK
  );
}

/**
 * Exports each month's dataset as a CSV file to a Google Drive folder
 */
function exportMonthlyToDriveFolder() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    const sheets = ss.getSheets();
    const monthlyGroups = {};

    sheets.forEach(function(sheet) {
      const sheetName = sheet.getName();
      if (sheetName === REPORT_CONFIG.AUDIT_SHEET_NAME || sheetName.indexOf('[') === 0) return;

      const data = sheet.getDataRange().getValues();
      if (data.length < 2) return;
      const headers = findColumnIndices(data);
      if (headers.nameCol === -1) return;

      let currentDateStr = '';
      let currentDateObj = null;

      for (let r = 1; r < data.length; r++) {
        const row = data[r];
        const rawDate = row[headers.dateCol];
        if (rawDate !== '' && rawDate !== null && rawDate !== undefined) {
          currentDateStr = String(rawDate).trim();
          currentDateObj = parseDateValue(rawDate);
        }
        const name = String(row[headers.nameCol] || '').trim();
        if (!name) continue;

        let key = 'Unknown';
        if (currentDateObj && !isNaN(currentDateObj.getTime())) {
          key = currentDateObj.getFullYear() + '-' + ('0' + (currentDateObj.getMonth() + 1)).slice(-2);
        } else if (currentDateStr) {
          const match = currentDateStr.match(/(January|February|March|April|May|June|July|August|September|October|November|December).*?(\\d{4})/i);
          if (match) {
            key = match[2] + '-' + match[1];
          } else {
            key = currentDateStr.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 15);
          }
        }

        if (!monthlyGroups[key]) monthlyGroups[key] = [];
        monthlyGroups[key].push({
          date: currentDateStr,
          name: name,
          material: headers.materialCol !== -1 ? String(row[headers.materialCol] || '') : '',
          trainer: headers.trainerCol !== -1 ? String(row[headers.trainerCol] || '') : '',
          remark: headers.remarkCol !== -1 ? String(row[headers.remarkCol] || '') : ''
        });
      }
    });

    const keys = Object.keys(monthlyGroups);
    if (keys.length === 0) {
      ui.alert('No records found to export to Google Drive.');
      return;
    }

    const folderName = 'Trainee_Monthly_Reports_Archive';
    const folders = DriveApp.getFoldersByName(folderName);
    const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

    keys.forEach(function(key) {
      const rows = monthlyGroups[key];
      const csvLines = ['No,Date,Name,Learning Material,Trainer,Remark'];
      rows.forEach(function(r, idx) {
        const escapeCsv = function(str) {
          return '"' + String(str).replace(/"/g, '""') + '"';
        };
        csvLines.push([
          idx + 1,
          escapeCsv(r.date),
          escapeCsv(r.name),
          escapeCsv(r.material),
          escapeCsv(r.trainer),
          escapeCsv(r.remark)
        ].join(','));
      });

      const csvContent = '\\uFEFF' + csvLines.join('\\r\\n');
      const filename = 'Report_' + key + '.csv';
      
      const existingFiles = folder.getFilesByName(filename);
      while (existingFiles.hasNext()) {
        existingFiles.next().setTrashed(true);
      }
      folder.createFile(filename, csvContent, MimeType.CSV);
    });

    ui.alert(
      'Export Google Drive Selesai!',
      'File CSV arsip per bulan telah disimpan ke Google Drive Anda di folder: "' + folderName + '"\\n' +
      'File dibuat untuk: ' + keys.join(', '),
      ui.ButtonSet.OK
    );
  } catch(err) {
    ui.alert('Error saat export Google Drive: ' + err.toString());
  }
}

/**
 * ==============================================================================
 * IMPORT FEATURE: IMPORT DATA TO GOOGLE SHEETS
 * ==============================================================================
 * Memungkinkan pengguna mengimpor data teks tabular (CSV/TSV/Excel) ke Google Sheets:
 * - Menambahkan ke sheet aktif (Append)
 * - Atau membuat tab sheet baru dengan format header standar
 */
function showImportDataDialog() {
  const htmlLines = [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    '  <base target="_top">',
    '  <style>',
    '    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 16px; margin: 0; color: #1e293b; background: #f8fafc; font-size: 13px; }',
    '    .title { font-weight: 700; font-size: 16px; margin-bottom: 4px; color: #0f172a; }',
    '    .subtitle { font-size: 12px; color: #64748b; margin-bottom: 12px; }',
    '    textarea { width: 100%; height: 150px; box-sizing: border-box; font-family: monospace; font-size: 11px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; resize: vertical; outline: none; background: #ffffff; }',
    '    textarea:focus { border-color: #059669; }',
    '    .options { margin: 12px 0; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }',
    '    .option-label { font-weight: 600; font-size: 12px; margin-bottom: 6px; display: block; color: #334155; }',
    '    .radio-item { margin: 6px 0; display: flex; align-items: center; gap: 8px; font-size: 12px; }',
    '    .input-sheet-name { padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 12px; width: 180px; margin-left: 24px; display: none; }',
    '    .btn-container { display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; }',
    '    button { padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; }',
    '    .btn-cancel { background: #e2e8f0; color: #475569; }',
    '    .btn-submit { background: #059669; color: #ffffff; }',
    '    .btn-submit:hover { background: #047857; }',
    '    .btn-submit:disabled { background: #94a3b8; cursor: not-allowed; }',
    '    #status { margin-top: 8px; font-size: 12px; font-weight: 500; }',
    '    .sample-btn { background: none; border: none; color: #059669; text-decoration: underline; cursor: pointer; padding: 0; font-size: 11px; float: right; }',
    '  </style>',
    '</head>',
    '<body>',
    '  <div class="title">📥 Import Data ke Spreadsheet</div>',
    '  <div class="subtitle">Tempel data teks CSV, TSV, atau data salinan langsung dari spreadsheet / Excel.</div>',
    '  <div style="margin-bottom:6px; overflow:hidden;">',
    '    <span style="font-weight:600; font-size:12px;">Data Input:</span>',
    '    <button type="button" class="sample-btn" onclick="loadSample()">Pakai Contoh Format</button>',
    '  </div>',
    '  <textarea id="csvData" placeholder="Date,Name,Learning Material,Trainer,Remark&#10;Monday, December 22, 2025,Alex Pratama,React State,Budi Santoso,Lancar"></textarea>',
    '  <div class="options">',
    '    <span class="option-label">Pilih Target Sheet:</span>',
    '    <div class="radio-item">',
    '      <input type="radio" id="modeActive" name="destMode" value="active" checked onchange="toggleNameInput()">',
    '      <label for="modeActive">Tambahkan ke sheet aktif saat ini (Append)</label>',
    '    </div>',
    '    <div class="radio-item">',
    '      <input type="radio" id="modeNew" name="destMode" value="new" onchange="toggleNameInput()">',
    '      <label for="modeNew">Buat tab sheet baru dengan nama:</label>',
    '    </div>',
    '    <input type="text" id="newSheetName" class="input-sheet-name" value="Imported_Log" placeholder="Nama Sheet">',
    '  </div>',
    '  <div id="status"></div>',
    '  <div class="btn-container">',
    '    <button type="button" class="btn-cancel" onclick="google.script.host.close()">Batal</button>',
    '    <button type="button" id="submitBtn" class="btn-submit" onclick="startImport()">🚀 Mulai Import Data</button>',
    '  </div>',
    '  <script>',
    '    function toggleNameInput() {',
    '      var isNew = document.getElementById("modeNew").checked;',
    '      document.getElementById("newSheetName").style.display = isNew ? "block" : "none";',
    '    }',
    '    function loadSample() {',
    '      var sample = [',
    '        ["Date", "Name", "Learning Material", "Trainer", "Remark"].join("\\t"),',
    '        ["Monday, December 22, 2025", "Alex Pratama", "React Fundamentals", "Budi Santoso", "Paham component"].join("\\t"),',
    '        ["", "Citra Dewi", "TypeScript Interfaces", "Siti Rahma", "Latihan types"].join("\\t"),',
    '        ["Tuesday, December 23, 2025", "Alex Pratama", "State Management", "Budi Santoso", "Latihan hook"].join("\\t")',
    '      ].join("\\n");',
    '      document.getElementById("csvData").value = sample;',
    '    }',
    '    function startImport() {',
    '      var text = document.getElementById("csvData").value.trim();',
    '      if (!text) { alert("Silakan tempel data terlebih dahulu."); return; }',
    '      var mode = document.getElementById("modeNew").checked ? "new" : "active";',
    '      var sheetName = document.getElementById("newSheetName").value.trim() || "Imported_Log";',
    '      document.getElementById("submitBtn").disabled = true;',
    '      var statusEl = document.getElementById("status");',
    '      statusEl.style.color = "#059669";',
    '      statusEl.textContent = "⏳ Memproses impor data...";',
    '      google.script.run',
    '        .withSuccessHandler(function(res) {',
    '          statusEl.style.color = "#059669";',
    '          statusEl.textContent = "✅ Berhasil mengimpor " + res.count + " baris ke sheet " + res.sheetName + "!";',
    '          setTimeout(function() { google.script.host.close(); }, 2000);',
    '        })',
    '        .withFailureHandler(function(err) {',
    '          document.getElementById("submitBtn").disabled = false;',
    '          statusEl.style.color = "#e11d48";',
    '          statusEl.textContent = "❌ Gagal: " + err.toString();',
    '        })',
    '        .executeSheetImport(text, mode, sheetName);',
    '    }',
    '  </script>',
    '</body>',
    '</html>',
  ].join('\\n');

  const htmlOutput = HtmlService.createHtmlOutput(htmlLines)
    .setWidth(620)
    .setHeight(480)
    .setTitle('Import Data Spreadsheet');

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '📥 Import Data ke Spreadsheet');
}

/**
 * Server-side parsing and sheet row insertion
 */
function executeSheetImport(rawText, mode, newSheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let targetSheet;

  if (mode === 'new') {
    let sheetName = newSheetName || 'Imported_Log';
    let counter = 1;
    let testName = sheetName;
    while (ss.getSheetByName(testName)) {
      testName = sheetName + '_' + counter;
      counter++;
    }
    targetSheet = ss.insertSheet(testName);
    const headers = ['No', 'Date', 'Name', "Today's Learning Material", 'Traineer', 'Remark / Question'];
    targetSheet.appendRow(headers);
    const headerRange = targetSheet.getRange(1, 1, 1, 6);
    headerRange.setBackground('#059669')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setFontSize(10)
      .setVerticalAlignment('middle')
      .setHorizontalAlignment('center');
    targetSheet.setRowHeight(1, 32);
    targetSheet.setFrozenRows(1);
  } else {
    targetSheet = ss.getActiveSheet();
  }

  const lines = rawText.split(/\\r?\\n/).filter(function(line) { return line.trim().length > 0; });
  if (lines.length === 0) {
    throw new Error('Tidak ada baris data yang ditemukan.');
  }

  const firstLine = lines[0];
  let sep = ',';
  const tabCount = (firstLine.match(/\\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  if (tabCount > commaCount && tabCount > semiCount) sep = '\\t';
  else if (semiCount > commaCount) sep = ';';

  let startLine = 0;
  const lowerFirst = firstLine.toLowerCase();
  if (lowerFirst.indexOf('name') !== -1 || lowerFirst.indexOf('nama') !== -1 || lowerFirst.indexOf('materi') !== -1 || lowerFirst.indexOf('material') !== -1) {
    startLine = 1;
  }

  let rowsToAdd = [];
  let currentDate = '';
  let rowCounter = targetSheet.getLastRow();

  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];
    let cells;
    if (sep === '\\t') {
      cells = line.split('\\t');
    } else {
      cells = line.split(sep).map(function(c) {
        return c.replace(/^"|"$/g, '').trim();
      });
    }

    if (cells.length === 0) continue;

    let dVal = cells[0] || '';
    let nVal = cells[1] || '';
    let mVal = cells[2] || '';
    let tVal = cells[3] || '';
    let rVal = cells[4] || '';

    if (dVal && dVal.toLowerCase() !== 'date' && dVal.toLowerCase() !== 'tanggal') {
      currentDate = dVal;
    }

    if (!nVal && !mVal) continue;

    rowCounter++;
    rowsToAdd.push([
      rowCounter,
      currentDate,
      nVal,
      mVal,
      tVal,
      rVal
    ]);
  }

  if (rowsToAdd.length === 0) {
    throw new Error('Tidak ada baris valid yang dapat diimpor.');
  }

  const startR = targetSheet.getLastRow() + 1;
  const writeRange = targetSheet.getRange(startR, 1, rowsToAdd.length, 6);
  writeRange.setValues(rowsToAdd);
  writeRange.setFontSize(10).setVerticalAlignment('top');
  writeRange.setBorder(true, true, true, true, true, true, '#cbd5e1', SpreadsheetApp.BorderStyle.SOLID);

  for (let c = 1; c <= 6; c++) {
    targetSheet.autoResizeColumn(c);
  }

  return {
    success: true,
    count: rowsToAdd.length,
    sheetName: targetSheet.getName()
  };
}

/**
 * Imports archived CSV data from Google Drive folder 'Trainee_Monthly_Reports_Archive'
 */
function importFromDriveArchive() {
  const ui = SpreadsheetApp.getUi();
  const folderName = 'Trainee_Monthly_Reports_Archive';

  try {
    const folders = DriveApp.getFoldersByName(folderName);
    if (!folders.hasNext()) {
      ui.alert(
        'Folder Arsip Tidak Ditemukan',
        'Belum ada folder "' + folderName + '" di Google Drive Anda.\\nSilakan jalankan "📦 Export Monthly Data to Drive Folder" terlebih dahulu.',
        ui.ButtonSet.OK
      );
      return;
    }

    const folder = folders.next();
    const files = folder.getFilesByType(MimeType.CSV);
    const availableFiles = [];

    while (files.hasNext()) {
      availableFiles.push(files.next());
    }

    if (availableFiles.length === 0) {
      ui.alert('Folder Arsip Kosong', 'Tidak ada file CSV arsip yang ditemukan di folder Google Drive "' + folderName + '".', ui.ButtonSet.OK);
      return;
    }

    availableFiles.sort(function(a, b) {
      return b.getName().localeCompare(a.getName());
    });

    const fileListStr = availableFiles.map(function(f, idx) {
      return (idx + 1) + '. ' + f.getName();
    }).join('\\n');

    const prompt = ui.prompt(
      'Pilih File Arsip Drive untuk Diimpor',
      'Ketik nomor file yang ingin diimpor ke tab sheet baru:\\n\\n' + fileListStr + '\\n\\nMasukkan nomor (1-' + availableFiles.length + '):',
      ui.ButtonSet.OK_CANCEL
    );

    if (prompt.getSelectedButton() !== ui.Button.OK) return;

    const chosenIdx = parseInt(prompt.getResponseText().trim(), 10) - 1;
    if (isNaN(chosenIdx) || chosenIdx < 0 || chosenIdx >= availableFiles.length) {
      ui.alert('Pilihan Tidak Valid', 'Nomor yang Anda masukkan tidak valid.', ui.ButtonSet.OK);
      return;
    }

    const targetFile = availableFiles[chosenIdx];
    const csvContent = targetFile.getBlob().getDataAsString();
    const cleanFileName = targetFile.getName().replace('.csv', '');
    const newTabName = '[' + cleanFileName + ']';

    const importResult = executeSheetImport(csvContent, 'new', newTabName);

    ui.alert(
      '✅ Import Berhasil!',
      'Berhasil mengimpor ' + importResult.count + ' baris data dari Google Drive file "' + targetFile.getName() + '" ke tab sheet baru: "' + importResult.sheetName + '"',
      ui.ButtonSet.OK
    );
  } catch(err) {
    ui.alert('Error saat import dari Google Drive: ' + err.toString());
  }
}
`;
}

export function generateManifestJson(): string {
  return `{
  "timeZone": "Asia/Jakarta",
  "dependencies": {
    "enabledAdvancedServices": []
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/script.send_mail",
    "https://www.googleapis.com/auth/script.container.ui",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/drive"
  ]
}`;
}
