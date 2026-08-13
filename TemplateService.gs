// ============================================================
// TemplateService.gs — Google Docs Template Population
// KP4 Tunjangan Keluarga Automation System
//
// Template KP4.docx structure (setelah dikonversi ke Google Docs):
// - Paragraf: Data pegawai dengan placeholder {{...}}
// - Table 0: Pasangan (3 rows × 7 cols) - row 2 adalah data
// - Table 1: Anak masuk daftar gaji (11 cols) - rows 2+ adalah data
// - Table 2: Anak tidak masuk daftar gaji (9 cols) - rows 1+ adalah data
// ============================================================

/**
 * Replace semua placeholder di paragraf dan tabel dokumen
 * Strategi: replace teks di body, kemudian handle tabel khusus
 *
 * @param {Document} doc - Google Docs Document object
 * @param {Object} replacements - map { '{{PLACEHOLDER}}': 'nilai' }
 */
function replacePlaceholdersInDoc(doc, replacements) {
  var body = doc.getBody();

  // Replace di semua paragraf body
  Object.keys(replacements).forEach(function(placeholder) {
    var value = replacements[placeholder];
    if (value === null || value === undefined) value = '';
    try {
      body.replaceText(escapeRegex(placeholder), value.toString());
    } catch(e) {
      logMsg('WARN', 'Gagal replace placeholder ' + placeholder + ': ' + e.message);
    }
  });
}

/**
 * Escape karakter regex khusus dalam string placeholder
 * @param {string} str
 * @returns {string}
 */
function escapeRegex(str) {
  return str.replace(/[\{\}\[\]\(\)\.\*\+\?\^\$\|\\]/g, '\\$&');
}

/**
 * Bangun map replacement lengkap dari data pegawai, pasangan, dan anak
 *
 * @param {Object} employeeData - {employee, pasangan, jumlahAnak, anak}
 * @param {Object[]} selectedChildren - hasil dari selectEligibleChildren().selected
 * @param {Object[]} allChildrenEval  - hasil dari selectEligibleChildren().all
 * @param {Date} processDate
 * @param {string} year
 * @returns {Object} replacement map
 */
function buildReplacementMap(employeeData, selectedChildren, allChildrenEval, processDate, year) {
  var emp  = employeeData.employee;
  var pas  = employeeData.pasangan;
  var map  = {};

  // ─── DATA PEGAWAI ───────────────────────────────────────────
  map['{{NO}}']                 = safeGet(emp, 'no', '');
  map['{{NAMA_LENGKAP}}']       = safeGet(emp, 'namaLengkap', '');
  map['{{NIP}}']                = safeGet(emp, 'nip', '');
  map['{{TEMPAT_TANGGAL_LAHIR}}'] = safeGet(emp, 'tempatTglLahir', '');
  map['{{JENIS_KELAMIN}}']      = safeGet(emp, 'jenisKelamin', '');
  map['{{AGAMA}}']              = safeGet(emp, 'agama', '');
  map['{{KEBANGSAAN}}']         = safeGet(emp, 'kebangsaan', '');
  map['{{PANGKAT_GOL}}']        = safeGet(emp, 'pangkatGol', '');
  map['{{JABATAN}}']            = safeGet(emp, 'jabatan', '');
  map['{{INSTANSI}}']           = safeGet(emp, 'instansi', '');
  map['{{MASA_KERJA}}']         = safeGet(emp, 'masaKerja', '');
  map['{{DIGAJI_MENURUT}}']     = formatCurrency(safeGet(emp, 'digajiMenurut', ''));
  map['{{ALAMAT}}']             = safeGet(emp, 'alamat', '');

  // ─── DATA PASANGAN ──────────────────────────────────────────
  var hasPasangan = pas && pas.nama && pas.nama !== '-' && pas.nama !== '';
  map['{{NAMA_PASANGAN}}']      = hasPasangan ? pas.nama : '-';
  map['{{STATUS_PASANGAN}}']    = hasPasangan ? 'KAWIN' : '-';
  map['{{PEKERJAAN_PASANGAN}}'] = hasPasangan ? safeGet(pas, 'pekerjaan', '-') : '-';
  map['{{PENGHASILAN_PASANGAN}}'] = hasPasangan ? formatCurrency(safeGet(pas, 'penghasilan', '-')) : '-';
  map['{{KETERANGAN_PASANGAN}}'] = hasPasangan ? safeGet(pas, 'keterangan', '-') : '-';

  // Tanggal lahir pasangan
  if (hasPasangan && pas.tglLahir) {
    map['{{TANGGAL_LAHIR_PASANGAN}}'] = formatDateDMY(pas.tglLahir);
    map['{{UMUR_PASANGAN}}']          = calculateAge(pas.tglLahir, processDate).toString();
  } else {
    map['{{TANGGAL_LAHIR_PASANGAN}}'] = '-';
    map['{{UMUR_PASANGAN}}']          = '-';
  }

  // Tanggal perkawinan
  if (hasPasangan && pas.tglPerkawinan) {
    map['{{TANGGAL_PERKAWINAN}}'] = formatDateDMY(pas.tglPerkawinan);
  } else {
    map['{{TANGGAL_PERKAWINAN}}'] = '-';
  }

  // ─── UMUM ───────────────────────────────────────────────────
  map['{{TANGGAL_PROSES}}'] = formatDateDMY(processDate);
  map['{{TAHUN}}']          = year.toString();
  map['{{JUMLAH_ANAK}}']    = safeGet(employeeData, 'jumlahAnak', '0');

  // ─── DATA SEMUA ANAK (untuk placeholder individual Anak 1-6) ─
  // Ini untuk paragraf/teks "Mempunyai anak...X orang"
  var anakPlaceholders = ['ANAK1', 'ANAK2', 'ANAK3', 'ANAK4', 'ANAK5', 'ANAK6'];
  var allChildren = employeeData.anak || [];

  allChildren.forEach(function(child, idx) {
    var prefix = 'ANAK' + (idx + 1);
    var eval_  = allChildrenEval[idx] || { age: -1, eligible: false, masukDaftarGaji: false };

    if (child && child.exists) {
      map['{{' + prefix + '_NO}}']               = child.no || (idx + 1).toString() + '.';
      map['{{' + prefix + '_NAMA}}']             = child.nama || '-';
      map['{{' + prefix + '_STATUS}}']           = child.status || '-';
      map['{{' + prefix + '_TGL_LAHIR}}']        = formatDateDMY(child.tglLahir);
      map['{{' + prefix + '_STATUS_KAWIN}}']     = child.statusKawin || 'BELUM';
      map['{{' + prefix + '_SEKOLAH}}']          = child.sekolah || '-';
      map['{{' + prefix + '_NAMA_AYAH}}']        = child.namaAyah || emp.namaLengkap || '-';
      map['{{' + prefix + '_NAMA_IBU}}']         = child.namaIbu  || pas.nama || '-';
      map['{{' + prefix + '_UMUR}}']             = eval_.age >= 0 ? eval_.age.toString() : '-';
      map['{{' + prefix + '_STATUS_TANGGUNGAN}}'] = eval_.eligible ? 'DITANGGUNG' : 'TIDAK DITANGGUNG';
      map['{{' + prefix + '_MASUK_DAFTAR_GAJI}}'] = eval_.masukDaftarGaji ? 'YA' : 'TIDAK';
    } else {
      // Anak tidak ada: kosongkan semua placeholder
      map['{{' + prefix + '_NO}}']               = '';
      map['{{' + prefix + '_NAMA}}']             = '';
      map['{{' + prefix + '_STATUS}}']           = '';
      map['{{' + prefix + '_TGL_LAHIR}}']        = '';
      map['{{' + prefix + '_STATUS_KAWIN}}']     = '';
      map['{{' + prefix + '_SEKOLAH}}']          = '';
      map['{{' + prefix + '_NAMA_AYAH}}']        = '';
      map['{{' + prefix + '_NAMA_IBU}}']         = '';
      map['{{' + prefix + '_UMUR}}']             = '';
      map['{{' + prefix + '_STATUS_TANGGUNGAN}}'] = '';
      map['{{' + prefix + '_MASUK_DAFTAR_GAJI}}'] = '';
    }
  });

  return map;
}

/**
 * Isi tabel pasangan (Table 0) dengan data pasangan
 * Table 0 structure: row 0 = header, row 1 = sub-header, row 2 = data
 *
 * @param {Body} body - doc.getBody()
 * @param {Object} pasangan - data pasangan
 * @param {Date} processDate
 */
function populateSpouseTable(body, pasangan, processDate) {
  try {
    var tables = body.getTables();
    if (!tables || tables.length < 1) {
      logMsg('WARN', 'Table 0 (pasangan) tidak ditemukan.');
      return;
    }

    var table    = tables[0]; // Table 0
    var dataRow  = table.getRow(2); // Row index 2 = data row

    var hasPasangan = pasangan && pasangan.nama &&
                      pasangan.nama !== '-' && pasangan.nama !== '';

    if (!hasPasangan) {
      // Kosongkan data row
      setCellText(dataRow, 0, '1.');
      setCellText(dataRow, 1, '-');
      setCellText(dataRow, 2, '-');
      setCellText(dataRow, 3, '-');
      setCellText(dataRow, 4, '-');
      setCellText(dataRow, 5, '-');
      setCellText(dataRow, 6, '-');
      return;
    }

    var umur = pasangan.tglLahir ? calculateAge(pasangan.tglLahir, processDate).toString() : '-';

    setCellText(dataRow, 0, '1.');
    setCellText(dataRow, 1, pasangan.nama);
    setCellText(dataRow, 2, umur);
    setCellText(dataRow, 3, 'KAWIN');
    setCellText(dataRow, 4, pasangan.pekerjaan || '-');
    setCellText(dataRow, 5, formatCurrency(pasangan.penghasilan));
    setCellText(dataRow, 6, pasangan.keterangan || '-');

    logMsg('INFO', 'Tabel pasangan diisi.');
  } catch(e) {
    logMsg('ERROR', 'Gagal mengisi tabel pasangan: ' + e.message);
  }
}

/**
 * Isi tabel anak (Table 1 = masuk daftar gaji, Table 2 = tidak masuk)
 * Strategi: pertahankan 2 header rows, replace data rows
 *
 * @param {Body} body
 * @param {Object[]} childrenInGaji   - anak yang masuk daftar gaji (max 2)
 * @param {Object[]} childrenNotGaji  - anak yang tidak masuk daftar gaji (max 2)
 * @param {Object} employeeData       - untuk mengisi nama ayah/ibu jika tidak ada
 * @param {Date} processDate
 */
function populateChildTables(body, childrenInGaji, childrenNotGaji, employeeData, processDate) {
  try {
    var tables = body.getTables();

    if (!tables || tables.length < 3) {
      logMsg('WARN', 'Tabel anak tidak ditemukan (butuh minimal 3 tabel).');
      return;
    }

    // Table 1: Anak masuk daftar gaji (11 kolom, header di rows 0-1, data mulai row 2)
    populateSingleChildTable(
      tables[1], childrenInGaji, employeeData, processDate,
      2,   // indeks baris data pertama
      11,  // jumlah kolom
      true // hasNamaAyahIbu
    );

    // Table 2: Anak tidak masuk daftar gaji (9 kolom, header di row 0, data mulai row 1)
    populateSingleChildTable(
      tables[2], childrenNotGaji, employeeData, processDate,
      1,   // indeks baris data pertama
      9,   // jumlah kolom
      false // hasNamaAyahIbu
    );

    logMsg('INFO', 'Tabel anak diisi. Masuk gaji: ' + childrenInGaji.length +
           ', Tidak masuk: ' + childrenNotGaji.length);
  } catch(e) {
    logMsg('ERROR', 'Gagal mengisi tabel anak: ' + e.message);
  }
}

/**
 * Isi satu tabel anak dengan data anak yang diberikan
 *
 * @param {Table} table
 * @param {Object[]} children  - array of {child, age, ...}
 * @param {Object} employeeData
 * @param {Date} processDate
 * @param {number} dataStartRow  - indeks baris data pertama (setelah header)
 * @param {number} numCols       - jumlah kolom tabel
 * @param {boolean} hasNamaAyahIbu
 */
function populateSingleChildTable(table, children, employeeData, processDate,
                                   dataStartRow, numCols, hasNamaAyahIbu) {
  var currentRows = table.getNumRows();

  // Hitung berapa baris data yang dibutuhkan (minimal 2 = kosong)
  var neededDataRows = Math.max(2, children.length);

  // Pastikan ada cukup data rows
  // Template sudah punya 2 data rows, tambah jika perlu (tidak biasa untuk KP4)
  while (table.getNumRows() < dataStartRow + neededDataRows) {
    // Salin format dari baris data terakhir yang ada
    var lastDataRow = table.getRow(table.getNumRows() - 1);
    var newRow = table.insertTableRow(table.getNumRows());
    // Salin jumlah sel
    for (var c = 0; c < numCols; c++) {
      if (c < lastDataRow.getNumCells()) {
        newRow.appendTableCell('');
      }
    }
  }

  // Isi data rows
  for (var i = 0; i < neededDataRows; i++) {
    var rowIdx = dataStartRow + i;
    if (rowIdx >= table.getNumRows()) break;

    var tableRow = table.getRow(rowIdx);
    var child    = (i < children.length) ? children[i] : null;

    if (child && child.child && child.child.exists) {
      var c      = child.child;
      var age    = child.age;
      var empN   = employeeData.employee;
      var pasN   = employeeData.pasangan;

      var noText = (i + 1) + '.';
      var namaAyah = c.namaAyah || (empN ? empN.namaLengkap : '') || '-';
      var namaIbu  = c.namaIbu  || (pasN ? pasN.nama : '') || '-';

      if (hasNamaAyahIbu) {
        // Table 1: 11 kolom
        setCellText(tableRow, 0, noText);
        setCellText(tableRow, 1, c.nama || '-');
        setCellText(tableRow, 2, c.status || '-');
        setCellText(tableRow, 3, formatDateDMY(c.tglLahir));
        setCellText(tableRow, 4, c.statusKawin || 'BELUM');
        setCellText(tableRow, 5, c.sekolah || '-');
        setCellText(tableRow, 6, '-');
        setCellText(tableRow, 7, namaAyah);
        setCellText(tableRow, 8, namaIbu);
        setCellText(tableRow, 9, '-');
        setCellText(tableRow, 10, '-');
      } else {
        // Table 2: 9 kolom
        setCellText(tableRow, 0, noText);
        setCellText(tableRow, 1, c.nama || '-');
        setCellText(tableRow, 2, c.status || '-');
        setCellText(tableRow, 3, formatDateDMY(c.tglLahir));
        setCellText(tableRow, 4, c.statusKawin || 'BELUM');
        setCellText(tableRow, 5, c.sekolah || '-');
        setCellText(tableRow, 6, '-');
        setCellText(tableRow, 7, '-');
        setCellText(tableRow, 8, '-');
      }
    } else {
      // Baris kosong: isi semua sel dengan '-', kecuali nomor urut
      for (var k = 0; k < numCols; k++) {
        if (k < tableRow.getNumCells()) {
          setCellText(tableRow, k, '-');
        }
      }
      // Override: nomor urut selalu tampil
      setCellText(tableRow, 0, (i + 1) + '.');
    }
  }

  // Hapus baris extra jika ada lebih dari yang dibutuhkan
  while (table.getNumRows() > dataStartRow + neededDataRows) {
    table.removeRow(table.getNumRows() - 1);
  }
}

/**
 * Set teks di sel tabel dengan aman
 * Mempertahankan formatting sel yang ada, hanya mengganti teks
 * @param {TableRow} row
 * @param {number} colIdx
 * @param {string} text
 */
function setCellText(row, colIdx, text) {
  try {
    if (colIdx >= row.getNumCells()) return;
    var cell = row.getCell(colIdx);
    cell.clear();
    cell.setText(text.toString());
  } catch(e) {
    logMsg('WARN', 'Gagal set teks sel [' + colIdx + ']: ' + e.message);
  }
}
