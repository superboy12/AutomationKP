// ============================================================
// Code.gs — Web App Entry Point & API Handlers
// KP4 Tunjangan Keluarga Automation System
// ============================================================

/**
 * Entry point Web App — Serve HTML
 */
function doGet(e) {
  initializeSheets(); // Pastikan sheets ada saat pertama kali dibuka

  var template = HtmlService.createTemplateFromFile('index');
  return template.evaluate()
    .setTitle('Sistem Tunjangan Keluarga — KP4')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Include helper untuk HtmlService
 * @param {string} filename
 * @returns {string}
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ─── API FUNCTIONS (dipanggil dari client via google.script.run) ────────────

/**
 * API: Ambil data awal untuk dashboard
 * @returns {Object}
 */
function apiGetDashboardData(year) {
  try {
    var cfg      = getConfig();
    var yearToUse = year || cfg.year;
    var employees = getEmployeeListWithStatus(yearToUse);
    var logs      = getLogsByYear(yearToUse);

    var totalSuccess = logs.filter(function(l) { return l.status === 'SUCCESS'; }).length;
    var totalError   = logs.filter(function(l) { return l.status === 'ERROR'; }).length;
    var totalSkipped = logs.filter(function(l) { return l.status === 'SKIPPED'; }).length;

    return {
      success     : true,
      processDate : formatDateDMY(cfg.processDate),
      year        : yearToUse,
      employees   : employees,
      stats: {
        total        : employees.length,
        success      : totalSuccess,
        error        : totalError,
        skipped      : totalSkipped,
        belum        : employees.length - (totalSuccess + totalError + totalSkipped)
      }
    };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

/**
 * API untuk menyimpan data pegawai (Add/Edit) dari Web App
 * @param {Object} employeeData - Data pegawai dari form
 * @returns {Object} {success: boolean, error?: string}
 */
function apiSaveEmployee(employeeData) {
  try {
    var result = saveEmployeeData(employeeData);
    return result;
  } catch (e) {
    writeLog({ error: 'Save Error: ' + e.message });
    return { success: false, error: e.message };
  }
}

/**
 * API: Ambil URL folder output untuk tahun tertentu
 * @param {string} year
 * @returns {string} URL folder atau string kosong
 */
function apiGetOutputFolderUrl(year) {
  try {
    var cfg = getConfig();
    if (!cfg.outputFolderId) return '';
    var yearFolder = getOrCreateYearFolder(cfg.outputFolderId, year || cfg.year);
    return yearFolder ? yearFolder.getUrl() : '';
  } catch (e) {
    return '';
  }
}

/**
 * API: Cari pegawai
 * @param {string} query
 * @param {string} year
 * @returns {Object}
 */
function apiSearchEmployees(query, year) {
  try {
    var cfg      = getConfig();
    var yearToUse = year || cfg.year;
    var results   = searchEmployeesWithStatus(query, yearToUse);
    return { success: true, results: results };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

/**
 * API: Generate satu pegawai
 * @param {string} nip
 * @param {string} mode - 'skip' | 'replace' | 'regenerate'
 * @returns {Object}
 */
function apiGenerateSingle(nip, mode) {
  try {
    return generateSingle(nip, mode || 'skip');
  } catch(e) {
    return { success: false, error: e.message };
  }
}

/**
 * API: Generate batch pegawai
 * @param {string[]} nips
 * @param {string} year
 * @param {string} mode
 * @returns {Object}
 */
function apiGenerateBatch(nips, year, mode) {
  try {
    if (!nips || nips.length === 0) {
      return { success: false, error: 'Tidak ada NIP yang diberikan.' };
    }
    var result = generateBatch(nips, year, mode || 'skip');
    return { success: true, data: result };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

/**
 * API: Ambil semua NIP untuk generate massal (dibagi batch)
 * @param {string} year
 * @returns {Object}
 */
function apiGetAllNIPs(year) {
  try {
    var employees = getAllEmployees();
    var nips = employees.map(function(e) { return e.employee.nip; });
    return { success: true, nips: nips, total: nips.length };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

/**
 * API: Update tanggal proses
 * @param {string} dateStr - DD/MM/YYYY
 * @returns {Object}
 */
function apiUpdateProcessDate(dateStr) {
  try {
    return updateProcessDate(dateStr);
  } catch(e) {
    return { success: false, error: e.message };
  }
}

/**
 * API: Inisialisasi sistem (buat sheet CONFIG & LOG)
 * @returns {Object}
 */
function apiInitialize() {
  try {
    return initializeSheets();
  } catch(e) {
    return { success: false, error: e.message };
  }
}

/**
 * API: Ambil config (hanya data aman untuk client)
 * @returns {Object}
 */
function apiGetConfig() {
  try {
    var cfg = getConfig();
    return {
      success     : true,
      processDate : formatDateDMY(cfg.processDate),
      year        : cfg.year,
      hasTemplate : cfg.templateId !== '',
      hasFolder   : cfg.outputFolderId !== ''
    };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

/**
 * API: Ambil log untuk pegawai tertentu
 * @param {string} nip
 * @param {string} year
 * @returns {Object}
 */
function apiGetEmployeeLog(nip, year) {
  try {
    var cfg       = getConfig();
    var yearToUse = year || cfg.year;
    var log       = getLatestLogByNIP(nip, yearToUse);
    return { success: true, log: log };
  } catch(e) {
    return { success: false, error: e.message };
  }
}
