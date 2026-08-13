// ============================================================
// Config.gs — Configuration Management
// KP4 Tunjangan Keluarga Automation System
// ============================================================

var CONFIG_SHEET_NAME     = 'CONFIG';
var DATABASE_SHEET_NAME   = 'DATABASE';
var LOG_SHEET_NAME        = 'LOG_GENERATE';

var CONFIG_ROWS = {
  TANGGAL_PROSES : 1, // B1
  TAHUN          : 2, // B2
  TEMPLATE_ID    : 3, // B3
  OUTPUT_FOLDER  : 4  // B4
};

/**
 * Ambil semua config dari sheet CONFIG
 * @returns {{processDate: Date, year: string, templateId: string, outputFolderId: string}}
 */
function getConfig() {
  var ss     = SpreadsheetApp.getActiveSpreadsheet();
  var sheet  = ss.getSheetByName(CONFIG_SHEET_NAME);

  if (!sheet) {
    throw new Error('Sheet CONFIG tidak ditemukan. Silakan buat sheet CONFIG terlebih dahulu.');
  }

  var data = sheet.getRange(1, 1, 4, 2).getValues(); // A1:B4

  var processDateRaw = data[CONFIG_ROWS.TANGGAL_PROSES - 1][1];
  var processDate    = parseDate(processDateRaw);
  if (!processDate) {
    throw new Error('Tanggal Proses di CONFIG!B1 tidak valid: ' + processDateRaw);
  }

  var year       = data[CONFIG_ROWS.TAHUN - 1][1] || processDate.getFullYear().toString();
  var templateId = data[CONFIG_ROWS.TEMPLATE_ID - 1][1] || '';
  var folderId   = data[CONFIG_ROWS.OUTPUT_FOLDER - 1][1] || '';

  return {
    processDate   : processDate,
    year          : year.toString().trim(),
    templateId    : templateId.toString().trim(),
    outputFolderId: folderId.toString().trim()
  };
}

/**
 * Update satu nilai di CONFIG berdasarkan key
 * @param {string} key - 'TANGGAL_PROSES' | 'TAHUN' | 'TEMPLATE_ID' | 'OUTPUT_FOLDER'
 * @param {*} value
 */
function updateConfig(key, value) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);
  if (!sheet) throw new Error('Sheet CONFIG tidak ditemukan.');

  var row = CONFIG_ROWS[key];
  if (!row) throw new Error('Config key tidak dikenal: ' + key);

  sheet.getRange(row, 2).setValue(value);
  // Auto-update TAHUN jika yang diubah adalah TANGGAL_PROSES
  if (key === 'TANGGAL_PROSES') {
    var d = parseDate(value);
    if (d) {
      sheet.getRange(CONFIG_ROWS.TAHUN, 2).setValue(d.getFullYear());
    }
  }
}

/**
 * Inisialisasi sheet CONFIG jika belum ada
 */
function initConfigSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG_SHEET_NAME);
    logMsg('INFO', 'Sheet CONFIG dibuat baru.');
  }

  var rows = [
    ['Tanggal Proses', '31/12/2026'],
    ['Tahun',          '2026'],
    ['Template Google Docs ID', ''],
    ['Folder Output Google Drive ID', '']
  ];

  sheet.clearContents();
  sheet.getRange(1, 1, rows.length, 2).setValues(rows);

  // Format header kolom A (bold)
  sheet.getRange(1, 1, rows.length, 1).setFontWeight('bold');
  sheet.setColumnWidth(1, 250);
  sheet.setColumnWidth(2, 400);

  logMsg('INFO', 'CONFIG sheet diinisialisasi.');
}

/**
 * Inisialisasi sheet LOG_GENERATE jika belum ada
 */
function initLogSheet() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(LOG_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(LOG_SHEET_NAME);
    logMsg('INFO', 'Sheet LOG_GENERATE dibuat baru.');
  }

  // Cek apakah header sudah ada
  var firstRow = sheet.getRange(1, 1, 1, 8).getValues()[0];
  if (!firstRow[0] || firstRow[0] !== 'timestamp') {
    var headers = [
      'timestamp', 'tahun', 'NIP', 'nama',
      'status', 'google_doc_url', 'docx_url', 'error_message'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    logMsg('INFO', 'LOG_GENERATE header diinisialisasi.');
  }
}

/**
 * Setup semua sheet yang diperlukan (dijalankan sekali saat deploy)
 */
function initializeSheets() {
  initConfigSheet();
  initLogSheet();
  return { success: true, message: 'Inisialisasi sheet selesai.' };
}
