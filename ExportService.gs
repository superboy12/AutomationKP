// ============================================================
// ExportService.gs — DOCX Export (Thin Wrapper)
// KP4 Tunjangan Keluarga Automation System
// ============================================================
// Note: Fungsi utama export sudah ada di DriveService.gs (exportDocxToFolder)
// File ini menyediakan helper tambahan untuk export dan URL.
// ============================================================

/**
 * Ambil URL download langsung untuk Google Docs (sebagai DOCX)
 * @param {string} docId
 * @returns {string}
 */
function getDocxExportUrl(docId) {
  return 'https://docs.google.com/document/d/' + docId + '/export?format=docx';
}

/**
 * Ambil URL untuk membuka Google Docs di browser
 * @param {string} docId
 * @returns {string}
 */
function getDocUrl(docId) {
  return 'https://docs.google.com/document/d/' + docId + '/edit';
}

/**
 * Cek apakah Google Docs ID valid (accessible)
 * @param {string} docId
 * @returns {boolean}
 */
function isDocAccessible(docId) {
  if (!docId) return false;
  try {
    var doc = DocumentApp.openById(docId);
    return doc !== null;
  } catch(e) {
    return false;
  }
}
