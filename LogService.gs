// ============================================================
// LogService.gs — Logging to LOG_GENERATE Sheet
// KP4 Tunjangan Keluarga Automation System
// ============================================================

var LOG_HEADERS = [
  'timestamp', 'tahun', 'NIP', 'nama',
  'status', 'google_doc_url', 'docx_url', 'error_message'
];

/**
 * Tulis satu baris log ke sheet LOG_GENERATE
 * @param {{tahun, nip, nama, status, googleDocUrl, docxUrl, errorMessage}} logData
 */
function writeLog(logData) {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(LOG_SHEET_NAME);

    if (!sheet) {
      initLogSheet();
      sheet = ss.getSheetByName(LOG_SHEET_NAME);
    }

    var row = [
      new Date().toISOString(),
      logData.tahun        || '',
      logData.nip          || '',
      logData.nama         || '',
      logData.status       || '',
      logData.googleDocUrl || '',
      logData.docxUrl      || '',
      logData.errorMessage || ''
    ];

    sheet.appendRow(row);
  } catch(e) {
    // Jangan throw agar tidak menghentikan proses utama
    logMsg('ERROR', 'Gagal menulis log: ' + e.message);
  }
}

/**
 * Ambil semua log untuk tahun tertentu
 * @param {string} year
 * @returns {Object[]}
 */
function getLogsByYear(year) {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(LOG_SHEET_NAME);
    if (!sheet) return [];

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    // Skip header row
    return data.slice(1)
      .filter(function(row) { return row[1] && row[1].toString() === year.toString(); })
      .map(function(row) {
        return {
          timestamp   : row[0],
          tahun       : row[1],
          nip         : row[2],
          nama        : row[3],
          status      : row[4],
          googleDocUrl: row[5],
          docxUrl     : row[6],
          errorMessage: row[7]
        };
      });
  } catch(e) {
    logMsg('ERROR', 'Gagal membaca log: ' + e.message);
    return [];
  }
}

/**
 * Ambil log terakhir untuk satu NIP di tahun tertentu
 * @param {string} nip
 * @param {string} year
 * @returns {Object|null}
 */
function getLatestLogByNIP(nip, year) {
  var logs = getLogsByYear(year);
  var nipNorm = nip.toString().trim().replace(/\s+/g, '');

  // Filter dan ambil yang terakhir
  var filtered = logs.filter(function(l) {
    return l.nip && l.nip.toString().replace(/\s+/g, '') === nipNorm;
  });

  return filtered.length > 0 ? filtered[filtered.length - 1] : null;
}

/**
 * Ambil map NIP → status log untuk tahun tertentu (untuk dashboard)
 * @param {string} year
 * @returns {Object} { nip: {status, googleDocUrl, docxUrl, timestamp} }
 */
function getLogStatusMapByYear(year) {
  var logs  = getLogsByYear(year);
  var map   = {};

  logs.forEach(function(l) {
    var key = l.nip ? l.nip.toString().replace(/\s+/g, '') : '';
    if (key) {
      // Simpan yang terakhir jika ada duplikat
      map[key] = {
        status      : l.status,
        googleDocUrl: l.googleDocUrl,
        docxUrl     : l.docxUrl,
        timestamp   : l.timestamp,
        errorMessage: l.errorMessage
      };
    }
  });

  return map;
}

/**
 * Hapus semua log untuk tahun tertentu (opsional, untuk reset)
 * @param {string} year
 */
function clearLogsByYear(year) {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(LOG_SHEET_NAME);
    if (!sheet) return;

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;

    // Hapus baris dari bawah ke atas
    for (var i = data.length; i >= 2; i--) {
      if (data[i - 1][1] && data[i - 1][1].toString() === year.toString()) {
        sheet.deleteRow(i);
      }
    }

    logMsg('INFO', 'Log untuk tahun ' + year + ' dihapus.');
  } catch(e) {
    logMsg('ERROR', 'Gagal hapus log: ' + e.message);
  }
}
