// ============================================================
// DocumentService.gs — Document Generation Orchestrator
// KP4 Tunjangan Keluarga Automation System
// ============================================================

var BATCH_SIZE = 2; // Jumlah pegawai per batch (diturunkan agar progress bar cepat update)

/**
 * Generate dokumen untuk SATU pegawai
 *
 * @param {string} nip   - NIP pegawai
 * @param {string} year  - Tahun proses
 * @param {string} mode  - 'skip' | 'replace' | 'regenerate'
 * @returns {{success: boolean, docUrl: string, docxUrl: string, error: string}}
 */
function generateDocumentForEmployee(nip, year, mode) {
  mode = mode || 'skip';
  var result = { success: false, docUrl: '', docxUrl: '', error: '' };

  try {
    // 1. Ambil config
    var cfg = getConfig();
    var processDate = cfg.processDate;

    if (!cfg.templateId) {
      throw new Error('Template Google Docs ID belum diatur di CONFIG!B3');
    }
    if (!cfg.outputFolderId) {
      throw new Error('Folder Output ID belum diatur di CONFIG!B4');
    }

    // 2. Ambil data pegawai
    var employeeData = getEmployeeByNIP(nip);
    if (!employeeData) {
      throw new Error('Pegawai dengan NIP ' + nip + ' tidak ditemukan.');
    }

    var emp  = employeeData.employee;
    var nama = emp.namaLengkap;
    var nipClean = emp.nip.replace(/\s+/g, '');

    logMsg('INFO', 'Generate dokumen untuk: ' + nama + ' (' + nipClean + ')');

    // 3. Siapkan folder
    var yearFolder = getOrCreateYearFolder(cfg.outputFolderId, year);
    var empFolder  = getOrCreateEmployeeFolder(yearFolder, nipClean, nama);

    // 4. Nama file dokumen
    var docFileName = 'Surat Tunjangan Keluarga - ' + year;

    // 5. Cek apakah sudah ada
    var existing = checkDocumentExists(empFolder, docFileName);

    if (existing.exists && mode === 'skip') {
      // Sudah ada, skip
      var skipDocUrl  = existing.docFile  ? existing.docFile.getUrl()  : '';
      var skipDocxUrl = existing.docxFile ? existing.docxFile.getUrl() : '';

      writeLog({
        tahun       : year,
        nip         : nipClean,
        nama        : nama,
        status      : 'SKIPPED',
        googleDocUrl: skipDocUrl,
        docxUrl     : skipDocxUrl,
        errorMessage: 'Dokumen sudah ada, di-skip.'
      });

      return {
        success : true,
        docUrl  : skipDocUrl,
        docxUrl : skipDocxUrl,
        error   : '',
        status  : 'SKIPPED'
      };
    }

    // 6. Jika replace/regenerate: hapus dokumen lama
    if (existing.exists && (mode === 'replace' || mode === 'regenerate')) {
      deleteFileByName(empFolder, docFileName);
      deleteFileByName(empFolder, docFileName + '.docx');
    }

    // 7. Evaluasi kelayakan anak
    var childResult = selectEligibleChildren(employeeData.anak, processDate, 2);
    var allEval     = childResult.all;

    // 8. Pisahkan anak masuk / tidak masuk daftar gaji
    var validChildren = allEval.filter(function(e) { return e.child && e.child.exists; });
    var childrenInGaji  = [];
    var childrenNotGaji = [];

    validChildren.forEach(function(e) {
      // Masuk daftar gaji jika memenuhi syarat (masukDaftarGaji: true) DAN kuota (maks 2) belum penuh
      if (e.masukDaftarGaji && childrenInGaji.length < 2) {
        childrenInGaji.push(e);
      } else {
        // Jika umur > 21, sudah menikah, atau kuota penuh -> masuk Tabel 2 (Tidak ditanggung)
        childrenNotGaji.push(e);
      }
    });

    // 9. Salin template ke folder pegawai
    var newDocFile = copyTemplateToFolder(cfg.templateId, empFolder, docFileName);
    var docId      = newDocFile.getId();
    var doc        = DocumentApp.openById(docId);

    // 10. Bangun replacement map
    var replacements = buildReplacementMap(
      employeeData, childrenInGaji, allEval, processDate, year
    );

    // 11. Replace placeholder di body (paragraf)
    replacePlaceholdersInDoc(doc, replacements);

    // 12. Isi tabel pasangan (Table 0)
    populateSpouseTable(doc.getBody(), employeeData.pasangan, processDate);

    // 13. Isi tabel anak (Table 1 & 2)
    populateChildTables(
      doc.getBody(),
      childrenInGaji,
      childrenNotGaji,
      employeeData,
      processDate
    );

    // 14. Simpan dan tutup dokumen
    doc.saveAndClose();

    var docUrl = newDocFile.getUrl();

    // 15. Export DOCX
    var docxFile = exportDocxToFolder(docId, empFolder, docFileName);
    var docxUrl  = docxFile ? docxFile.getUrl() : '';

    // 16. Tulis log
    writeLog({
      tahun       : year,
      nip         : nipClean,
      nama        : nama,
      status      : 'SUCCESS',
      googleDocUrl: docUrl,
      docxUrl     : docxUrl,
      errorMessage: ''
    });

    result = { success: true, docUrl: docUrl, docxUrl: docxUrl, error: '', status: 'SUCCESS' };
    logMsg('INFO', 'Dokumen berhasil: ' + nama);

  } catch(e) {
    var errMsg = e.message || e.toString();
    logMsg('ERROR', 'Gagal generate dokumen NIP ' + nip + ': ' + errMsg);

    // Tulis log error
    try {
      var empData = getEmployeeByNIP(nip);
      writeLog({
        tahun       : year,
        nip         : nip,
        nama        : empData ? empData.employee.namaLengkap : nip,
        status      : 'ERROR',
        googleDocUrl: '',
        docxUrl     : '',
        errorMessage: errMsg
      });
    } catch(logErr) {
      logMsg('ERROR', 'Gagal tulis log error: ' + logErr.message);
    }

    result = { success: false, docUrl: '', docxUrl: '', error: errMsg, status: 'ERROR' };
  }

  return result;
}

/**
 * Generate semua dokumen dalam satu batch
 * Dipanggil dari client JS, satu batch per klik
 *
 * @param {string[]} nips      - array NIP untuk di-generate
 * @param {string} year
 * @param {string} mode        - 'skip' | 'replace' | 'regenerate'
 * @returns {{results: Object[], totalProcessed: number, totalSuccess: number, totalError: number}}
 */
function generateBatch(nips, year, mode) {
  mode = mode || 'skip';
  var results      = [];
  var totalSuccess = 0;
  var totalError   = 0;

  for (var i = 0; i < nips.length; i++) {
    var nip = nips[i];
    try {
      var res = generateDocumentForEmployee(nip, year, mode);
      results.push({ nip: nip, result: res });
      if (res.success) totalSuccess++;
      else totalError++;
    } catch(e) {
      results.push({ nip: nip, result: { success: false, error: e.message, status: 'ERROR' } });
      totalError++;
    }

    // Cek apakah hampir timeout (5 menit = 300000ms)
    // Tidak bisa check execution time di GAS, tapi batch size kecil sudah cukup
  }

  return {
    results       : results,
    totalProcessed: nips.length,
    totalSuccess  : totalSuccess,
    totalError    : totalError
  };
}

/**
 * Generate dokumen untuk satu pegawai via NIP (dipanggil dari Web App)
 * @param {string} nip
 * @param {string} mode
 * @returns {Object}
 */
function generateSingle(nip, mode) {
  try {
    var cfg = getConfig();
    return generateDocumentForEmployee(nip, cfg.year, mode || 'skip');
  } catch(e) {
    return { success: false, error: e.message, status: 'ERROR' };
  }
}

/**
 * Ambil daftar semua pegawai + status generate untuk dashboard
 * @param {string} year
 * @returns {Object[]}
 */
function getEmployeeListWithStatus(year) {
  try {
    var employees = getAllEmployees();
    var logMap    = getLogStatusMapByYear(year);
    var cfg       = getConfig();
    var processDate = cfg.processDate;

    return employees.map(function(empData) {
      var emp     = empData.employee;
      var nipClean = emp.nip ? emp.nip.replace(/\s+/g, '') : '';
      var logEntry = logMap[nipClean] || null;

      // Evaluasi singkat anak
      var childResult = selectEligibleChildren(empData.anak, processDate, 2);
      var eligibleCount = childResult.selected.length;

      return {
        no          : emp.no,
        nip         : emp.nip,
        namaLengkap : emp.namaLengkap,
        jabatan     : emp.jabatan,
        jumlahAnak  : empData.jumlahAnak,
        eligibleAnak: eligibleCount,
        status      : logEntry ? logEntry.status : 'BELUM',
        googleDocUrl: logEntry ? logEntry.googleDocUrl : '',
        docxUrl     : logEntry ? logEntry.docxUrl : '',
        timestamp   : logEntry ? logEntry.timestamp : '',
        errorMessage: logEntry ? logEntry.errorMessage : ''
      };
    });
  } catch(e) {
    logMsg('ERROR', 'Gagal ambil employee list: ' + e.message);
    return [];
  }
}

/**
 * Update config tanggal proses dari Web App
 * @param {string} dateStr - DD/MM/YYYY
 * @returns {Object}
 */
function updateProcessDate(dateStr) {
  try {
    updateConfig('TANGGAL_PROSES', dateStr);
    var cfg = getConfig();
    return { success: true, year: cfg.year, processDate: formatDateDMY(cfg.processDate) };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

/**
 * Search pegawai dari Web App
 * @param {string} query
 * @param {string} year
 * @returns {Object[]}
 */
function searchEmployeesWithStatus(query, year) {
  try {
    var employees = searchEmployees(query);
    var logMap    = getLogStatusMapByYear(year);
    var cfg       = getConfig();
    var processDate = cfg.processDate;

    return employees.map(function(empData) {
      var emp      = empData.employee;
      var nipClean = emp.nip ? emp.nip.replace(/\s+/g, '') : '';
      var logEntry = logMap[nipClean] || null;

      return {
        nip         : emp.nip,
        namaLengkap : emp.namaLengkap,
        jabatan     : emp.jabatan,
        status      : logEntry ? logEntry.status : 'BELUM',
        googleDocUrl: logEntry ? logEntry.googleDocUrl : '',
        docxUrl     : logEntry ? logEntry.docxUrl : ''
      };
    });
  } catch(e) {
    return [];
  }
}
