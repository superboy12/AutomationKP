// ============================================================
// DriveService.gs — Google Drive Operations
// KP4 Tunjangan Keluarga Automation System
// ============================================================

/**
 * Ambil atau buat folder berdasarkan nama di dalam parent folder
 * @param {Folder|null} parentFolder - null = root Drive
 * @param {string} folderName
 * @returns {Folder}
 */
function getOrCreateFolder(parentFolder, folderName) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000); // Tunggu maksimal 15 detik agar thread lain selesai buat folder

  try {
    var iter;
    if (parentFolder) {
      iter = parentFolder.getFoldersByName(folderName);
    } else {
      iter = DriveApp.getFoldersByName(folderName);
    }

    if (iter.hasNext()) {
      return iter.next();
    }

    // Buat folder baru
    if (parentFolder) {
      return parentFolder.createFolder(folderName);
    } else {
      return DriveApp.createFolder(folderName);
    }
  } finally {
    lock.releaseLock();
  }
}

/**
 * Ambil/buat folder tahun dalam folder output utama
 * @param {string} outputFolderId - ID folder output utama dari CONFIG
 * @param {string} year
 * @returns {Folder}
 */
function getOrCreateYearFolder(outputFolderId, year) {
  var rootFolder;
  if (outputFolderId && outputFolderId.trim() !== '') {
    try {
      rootFolder = DriveApp.getFolderById(outputFolderId);
    } catch(e) {
      logMsg('WARN', 'Folder output ID tidak valid, menggunakan root Drive: ' + e.message);
      rootFolder = null;
    }
  }

  // Buat/ambil folder "Tunjangan Keluarga" sebagai parent
  var parentFolder = getOrCreateFolder(rootFolder, 'Tunjangan Keluarga');
  // Buat/ambil folder tahun
  return getOrCreateFolder(parentFolder, year.toString());
}

/**
 * Ambil/buat folder pegawai di dalam folder tahun
 * @param {Folder} yearFolder
 * @param {string} nip
 * @param {string} name
 * @returns {Folder}
 */
function getOrCreateEmployeeFolder(yearFolder, nip, name) {
  var folderName = nip.toString().replace(/\s+/g, '') + ' - ' + name;
  return getOrCreateFolder(yearFolder, folderName);
}

/**
 * Cek apakah file dengan nama tertentu ada di folder
 * @param {Folder} folder
 * @param {string} fileName
 * @returns {File|null}
 */
function findFileInFolder(folder, fileName) {
  var iter = folder.getFilesByName(fileName);
  return iter.hasNext() ? iter.next() : null;
}

/**
 * Hapus semua file dengan nama tertentu di folder
 * @param {Folder} folder
 * @param {string} fileName
 */
function deleteFileByName(folder, fileName) {
  var iter = folder.getFilesByName(fileName);
  while (iter.hasNext()) {
    var file = iter.next();
    file.setTrashed(true);
    logMsg('INFO', 'File dihapus: ' + fileName);
  }
}

/**
 * Cek apakah dokumen pegawai sudah ada untuk tahun tertentu
 * @param {Folder} employeeFolder
 * @param {string} docFileName
 * @returns {{exists: boolean, docFile: File|null, docxFile: File|null}}
 */
function checkDocumentExists(employeeFolder, docFileName) {
  var docFile  = findFileInFolder(employeeFolder, docFileName);
  var docxFile = findFileInFolder(employeeFolder, docFileName + '.docx');

  return {
    exists  : docFile !== null || docxFile !== null,
    docFile : docFile,
    docxFile: docxFile
  };
}

/**
 * Salin Google Docs template ke folder tujuan
 * @param {string} templateId - Google Docs template ID
 * @param {Folder} targetFolder
 * @param {string} fileName
 * @returns {File} file hasil copy
 */
function copyTemplateToFolder(templateId, targetFolder, fileName) {
  try {
    var templateFile = DriveApp.getFileById(templateId);
    var newFile = templateFile.makeCopy(fileName, targetFolder);
    logMsg('INFO', 'Template disalin: ' + fileName);
    return newFile;
  } catch(e) {
    throw new Error('Gagal menyalin template (ID: ' + templateId + '): ' + e.message);
  }
}

/**
 * Export Google Docs ke format DOCX dan simpan di folder tujuan
 * @param {string} docId - Google Docs ID
 * @param {Folder} targetFolder
 * @param {string} fileName - nama file (tanpa .docx)
 * @returns {File} file DOCX yang dibuat
 */
function exportDocxToFolder(docId, targetFolder, fileName) {
  try {
    // Export URL untuk DOCX
    var exportUrl = 'https://docs.google.com/document/d/' + docId +
                    '/export?format=docx';

    var token   = ScriptApp.getOAuthToken();
    var options = {
      method     : 'get',
      headers    : { 'Authorization': 'Bearer ' + token },
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(exportUrl, options);

    if (response.getResponseCode() !== 200) {
      throw new Error('Export DOCX gagal: HTTP ' + response.getResponseCode());
    }

    var blob = response.getBlob().setName(fileName + '.docx');

    // Hapus DOCX lama jika ada
    deleteFileByName(targetFolder, fileName + '.docx');

    // Simpan ke folder
    var docxFile = targetFolder.createFile(blob);
    logMsg('INFO', 'DOCX diekspor: ' + fileName + '.docx');
    return docxFile;

  } catch(e) {
    throw new Error('Gagal export DOCX: ' + e.message);
  }
}

/**
 * Pindahkan file ke folder (hapus dari folder lama jika diperlukan)
 * @param {File} file
 * @param {Folder} targetFolder
 */
function moveFileToFolder(file, targetFolder) {
  var parents = file.getParents();
  while (parents.hasNext()) {
    var parent = parents.next();
    parent.removeFile(file);
  }
  targetFolder.addFile(file);
}
