// ============================================================
// Utils.gs — Utility Functions
// KP4 Tunjangan Keluarga Automation System
// ============================================================

/**
 * Parse tanggal dari berbagai format yang mungkin ada di Google Sheets:
 * - Date object (dari Sheets)
 * - "DD/MM/YYYY"
 * - "DD-MM-YYYY"
 * - "YYYY-MM-DD"
 * - Angka serial Excel
 * - null / undefined / kosong
 * @param {*} value
 * @returns {Date|null}
 */
function parseDate(value) {
  if (!value) return null;

  // Sudah Date object
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return value;
  }

  // Angka serial Excel (Sheets mungkin kirim sebagai number)
  if (typeof value === 'number') {
    // Excel serial: 1 = 1 Jan 1900, tapi ada bug 29 Feb 1900
    var excelEpoch = new Date(1899, 11, 30);
    var d = new Date(excelEpoch.getTime() + value * 86400000);
    if (!isNaN(d.getTime())) return d;
    return null;
  }

  if (typeof value !== 'string') return null;

  var str = value.toString().trim();
  if (!str || str === '-' || str === '') return null;

  // Format DD/MM/YYYY atau DD-MM-YYYY
  var dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    var day   = parseInt(dmyMatch[1], 10);
    var month = parseInt(dmyMatch[2], 10) - 1; // 0-indexed
    var year  = parseInt(dmyMatch[3], 10);
    var d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // Format YYYY-MM-DD atau YYYY/MM/DD
  var ymdMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (ymdMatch) {
    var year  = parseInt(ymdMatch[1], 10);
    var month = parseInt(ymdMatch[2], 10) - 1;
    var day   = parseInt(ymdMatch[3], 10);
    var d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // Coba native parse sebagai fallback terakhir
  var fallback = new Date(str);
  if (!isNaN(fallback.getTime())) return fallback;

  return null;
}

/**
 * Format Date ke string DD/MM/YYYY
 * @param {Date|null} date
 * @returns {string}
 */
function formatDateDMY(date) {
  if (!date || isNaN(date.getTime())) return '-';
  var d = date.getDate().toString().padStart(2, '0');
  var m = (date.getMonth() + 1).toString().padStart(2, '0');
  var y = date.getFullYear();
  return d + '/' + m + '/' + y;
}

/**
 * Format Date ke string Indonesia: "DD MMMM YYYY"
 * @param {Date|null} date
 * @returns {string}
 */
function formatDateIndonesia(date) {
  if (!date || isNaN(date.getTime())) return '-';
  var months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  var d = date.getDate();
  var m = months[date.getMonth()];
  var y = date.getFullYear();
  return d + ' ' + m + ' ' + y;
}

/**
 * Hitung umur dalam tahun penuh berdasarkan tanggal lahir dan tanggal proses
 * @param {Date|null} birthDate
 * @param {Date} processDate
 * @returns {number} umur dalam tahun, -1 jika data tidak valid
 */
function calculateAge(birthDate, processDate) {
  if (!birthDate || !processDate) return -1;
  if (isNaN(birthDate.getTime()) || isNaN(processDate.getTime())) return -1;

  var years = processDate.getFullYear() - birthDate.getFullYear();
  var m = processDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && processDate.getDate() < birthDate.getDate())) {
    years--;
  }
  return years;
}

/**
 * Format angka ke format Rupiah: Rp. X.XXX.XXX
 * @param {number|string|null} value
 * @returns {string}
 */
function formatCurrency(value) {
  if (value === null || value === undefined || value === '' || value === '-') return '-';
  var num = parseFloat(value.toString().replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return value.toString();
  return 'Rp. ' + num.toLocaleString('id-ID');
}

/**
 * Safe get value dari object dengan default
 * @param {Object} obj
 * @param {string} key
 * @param {*} defaultVal
 * @returns {*}
 */
function safeGet(obj, key, defaultVal) {
  if (!obj) return defaultVal !== undefined ? defaultVal : '';
  var val = obj[key];
  if (val === null || val === undefined || val === '') {
    return defaultVal !== undefined ? defaultVal : '';
  }
  return val;
}

/**
 * Normalize string: trim dan uppercase
 * @param {*} value
 * @returns {string}
 */
function normalizeStr(value) {
  if (!value) return '';
  return value.toString().trim();
}

/**
 * Cek apakah string mengandung keyword (case-insensitive)
 * @param {string} text
 * @param {string[]} keywords
 * @returns {boolean}
 */
function containsAny(text, keywords) {
  if (!text) return false;
  var lower = text.toString().toLowerCase();
  return keywords.some(function(kw) { return lower.indexOf(kw.toLowerCase()) >= 0; });
}

/**
 * Terbilang angka anak (1→"satu", 2→"dua", dst)
 * @param {number} n
 * @returns {string}
 */
function terbilangAnak(n) {
  var words = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam',
               'tujuh', 'delapan', 'sembilan', 'sepuluh'];
  if (n <= 0) return 'nol';
  if (n <= 10) return words[n];
  return n.toString();
}

/**
 * Log ke konsol dengan timestamp
 * @param {string} level - INFO / WARN / ERROR
 * @param {string} message
 * @param {*} [data]
 */
function logMsg(level, message, data) {
  var ts = new Date().toISOString();
  var output = '[' + level + '] ' + ts + ' | ' + message;
  if (data !== undefined) {
    try { output += ' | ' + JSON.stringify(data); } catch(e) {}
  }
  Logger.log(output);
}
