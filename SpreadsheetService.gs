// ============================================================
// SpreadsheetService.gs — Database Access Layer
// KP4 Tunjangan Keluarga Automation System
//
// Mapping berdasarkan header aktual KP4 2026 2.xlsx:
// A=NO, B=Nama Lengkap, C=NIP, D=Tempat/Tanggal Lahir,
// E=Jenis Kelamin, F=Agama, G=Kebangsaan, H=Pangkat/Gol,
// I=Jabatan, J=Instansi, K=Masa Kerja Seluruhnya,
// L=Digaji menurut, M=Alamat,
// N=Nama Istri/suami, O=Tanggal Kelahiran, P=Tgl Perkawinan,
// Q=Pekerjaan, R=Penghasilan, S=Keterangan,
// T=Jumlah anak seluruhnya
// Anak1: U-AB (8 col), Anak2: AC-AJ (8 col)
// Anak3: AK-AP (6 col, no Ayah/Ibu)
// Anak4: AQ-AV (6 col), Anak5: AW-BB (6 col)
// Anak6: BC-BH (6 col)
// ============================================================

// Indeks kolom (0-based) berdasarkan inspeksi aktual
var COL = {
  NO                 : 0,   // A
  NAMA_LENGKAP       : 1,   // B
  NIP                : 2,   // C
  TEMPAT_TGL_LAHIR   : 3,   // D
  JENIS_KELAMIN      : 4,   // E
  AGAMA              : 5,   // F
  KEBANGSAAN         : 6,   // G
  PANGKAT_GOL        : 7,   // H
  JABATAN            : 8,   // I
  INSTANSI           : 9,   // J
  MASA_KERJA         : 10,  // K
  DIGAJI_MENURUT     : 11,  // L
  ALAMAT             : 12,  // M
  NAMA_PASANGAN      : 13,  // N
  TGL_LAHIR_PASANGAN : 14,  // O
  TGL_PERKAWINAN     : 15,  // P
  PEKERJAAN_PASANGAN : 16,  // Q
  PENGHASILAN_PASANGAN:17,  // R
  KETERANGAN_PASANGAN: 18,  // S
  JUMLAH_ANAK        : 19,  // T
  // Anak 1
  A1_NO              : 20,  // U
  A1_NAMA            : 21,  // V
  A1_STATUS          : 22,  // W
  A1_TGL_LAHIR       : 23,  // X
  A1_STATUS_KAWIN    : 24,  // Y
  A1_SEKOLAH         : 25,  // Z
  A1_NAMA_AYAH       : 26,  // AA
  A1_NAMA_IBU        : 27,  // AB
  // Anak 2
  A2_NO              : 28,  // AC
  A2_NAMA            : 29,  // AD
  A2_STATUS          : 30,  // AE
  A2_TGL_LAHIR       : 31,  // AF
  A2_STATUS_KAWIN    : 32,  // AG
  A2_SEKOLAH         : 33,  // AH
  A2_NAMA_AYAH       : 34,  // AI
  A2_NAMA_IBU        : 35,  // AJ
  // Anak 3
  A3_NO              : 36,  // AK
  A3_NAMA            : 37,  // AL
  A3_STATUS          : 38,  // AM
  A3_TGL_LAHIR       : 39,  // AN
  A3_STATUS_KAWIN    : 40,  // AO
  A3_SEKOLAH         : 41,  // AP
  // Anak 4
  A4_NO              : 42,  // AQ
  A4_NAMA            : 43,  // AR
  A4_STATUS          : 44,  // AS
  A4_TGL_LAHIR       : 45,  // AT
  A4_STATUS_KAWIN    : 46,  // AU
  A4_SEKOLAH         : 47,  // AV
  // Anak 5
  A5_NO              : 48,  // AW
  A5_NAMA            : 49,  // AX
  A5_STATUS          : 50,  // AY
  A5_TGL_LAHIR       : 51,  // AZ
  A5_STATUS_KAWIN    : 52,  // BA
  A5_SEKOLAH         : 53,  // BB
  // Anak 6
  A6_NO              : 54,  // BC
  A6_NAMA            : 55,  // BD
  A6_STATUS          : 56,  // BE
  A6_TGL_LAHIR       : 57,  // BF
  A6_STATUS_KAWIN    : 58,  // BG
  A6_SEKOLAH         : 59   // BH
};

/**
 * Baca semua pegawai dari sheet DATABASE
 * @returns {Object[]} array of employee objects
 */
function getAllEmployees() {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(DATABASE_SHEET_NAME);

  if (!sheet) {
    throw new Error('Sheet DATABASE tidak ditemukan.');
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return []; // Hanya header

  // Baca semua data (skip header row 1)
  var data = sheet.getRange(2, 1, lastRow - 1, 60).getValues();
  var employees = [];

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    // Skip baris kosong (cek NIP)
    if (!row[COL.NIP] || row[COL.NIP].toString().trim() === '') continue;
    employees.push(buildEmployeeObject(row));
  }

  return employees;
}

/**
 * Cari satu pegawai berdasarkan NIP
 * @param {string} nip
 * @returns {Object|null}
 */
function getEmployeeByNIP(nip) {
  var employees = getAllEmployees();
  var nipNorm   = nip.toString().trim().replace(/\s+/g, '');
  return employees.find(function(e) {
    return e.nip.toString().replace(/\s+/g, '') === nipNorm;
  }) || null;
}

/**
 * Cari pegawai berdasarkan NIP atau nama (untuk search)
 * @param {string} query
 * @returns {Object[]}
 */
function searchEmployees(query) {
  if (!query || query.trim() === '') return getAllEmployees();
  var employees = getAllEmployees();
  var q = query.toString().toLowerCase().trim();
  return employees.filter(function(e) {
    return (e.nip && e.nip.toLowerCase().indexOf(q) >= 0) ||
           (e.namaLengkap && e.namaLengkap.toLowerCase().indexOf(q) >= 0);
  });
}

/**
 * Map satu baris data ke Employee object
 * @param {Array} row - raw row values (0-based index)
 * @returns {Object}
 */
function buildEmployeeObject(row) {
  var get = function(idx) {
    var v = row[idx];
    return (v === null || v === undefined) ? '' : v;
  };

  // Pegawai
  var employee = {
    no               : get(COL.NO),
    namaLengkap      : normalizeStr(get(COL.NAMA_LENGKAP)),
    nip              : normalizeStr(get(COL.NIP)),
    tempatTglLahir   : normalizeStr(get(COL.TEMPAT_TGL_LAHIR)),
    jenisKelamin     : normalizeStr(get(COL.JENIS_KELAMIN)),
    agama            : normalizeStr(get(COL.AGAMA)),
    kebangsaan       : normalizeStr(get(COL.KEBANGSAAN)),
    pangkatGol       : normalizeStr(get(COL.PANGKAT_GOL)),
    jabatan          : normalizeStr(get(COL.JABATAN)),
    instansi         : normalizeStr(get(COL.INSTANSI)),
    masaKerja        : normalizeStr(get(COL.MASA_KERJA)),
    digajiMenurut    : get(COL.DIGAJI_MENURUT),
    alamat           : normalizeStr(get(COL.ALAMAT))
  };

  // Pasangan
  var pasangan = {
    nama             : normalizeStr(get(COL.NAMA_PASANGAN)),
    tglLahirRaw      : get(COL.TGL_LAHIR_PASANGAN),
    tglLahir         : parseDate(get(COL.TGL_LAHIR_PASANGAN)),
    tglPerkawinanRaw : get(COL.TGL_PERKAWINAN),
    tglPerkawinan    : parseDate(get(COL.TGL_PERKAWINAN)),
    pekerjaan        : normalizeStr(get(COL.PEKERJAAN_PASANGAN)),
    penghasilan      : get(COL.PENGHASILAN_PASANGAN),
    keterangan       : normalizeStr(get(COL.KETERANGAN_PASANGAN))
  };

  // Jumlah anak
  var jumlahAnak = normalizeStr(get(COL.JUMLAH_ANAK));

  // Anak 1-6
  var anak = extractChildren(row);

  return {
    employee   : employee,
    pasangan   : pasangan,
    jumlahAnak : jumlahAnak,
    anak       : anak
  };
}

/**
 * Ekstrak data Anak 1–6 dari satu baris
 * @param {Array} row
 * @returns {Object[]} array of child objects (index 0–5 = Anak 1–6)
 */
function extractChildren(row) {
  var get = function(idx) {
    var v = row[idx];
    return (v === null || v === undefined) ? '' : v;
  };

  var childDefs = [
    // Anak 1 (memiliki Nama Ayah & Ibu)
    {
      no: COL.A1_NO, nama: COL.A1_NAMA, status: COL.A1_STATUS,
      tglLahir: COL.A1_TGL_LAHIR, statusKawin: COL.A1_STATUS_KAWIN,
      sekolah: COL.A1_SEKOLAH, namaAyah: COL.A1_NAMA_AYAH, namaIbu: COL.A1_NAMA_IBU
    },
    // Anak 2 (memiliki Nama Ayah & Ibu)
    {
      no: COL.A2_NO, nama: COL.A2_NAMA, status: COL.A2_STATUS,
      tglLahir: COL.A2_TGL_LAHIR, statusKawin: COL.A2_STATUS_KAWIN,
      sekolah: COL.A2_SEKOLAH, namaAyah: COL.A2_NAMA_AYAH, namaIbu: COL.A2_NAMA_IBU
    },
    // Anak 3 (TIDAK ada Nama Ayah/Ibu di spreadsheet)
    {
      no: COL.A3_NO, nama: COL.A3_NAMA, status: COL.A3_STATUS,
      tglLahir: COL.A3_TGL_LAHIR, statusKawin: COL.A3_STATUS_KAWIN,
      sekolah: COL.A3_SEKOLAH, namaAyah: null, namaIbu: null
    },
    // Anak 4
    {
      no: COL.A4_NO, nama: COL.A4_NAMA, status: COL.A4_STATUS,
      tglLahir: COL.A4_TGL_LAHIR, statusKawin: COL.A4_STATUS_KAWIN,
      sekolah: COL.A4_SEKOLAH, namaAyah: null, namaIbu: null
    },
    // Anak 5
    {
      no: COL.A5_NO, nama: COL.A5_NAMA, status: COL.A5_STATUS,
      tglLahir: COL.A5_TGL_LAHIR, statusKawin: COL.A5_STATUS_KAWIN,
      sekolah: COL.A5_SEKOLAH, namaAyah: null, namaIbu: null
    },
    // Anak 6
    {
      no: COL.A6_NO, nama: COL.A6_NAMA, status: COL.A6_STATUS,
      tglLahir: COL.A6_TGL_LAHIR, statusKawin: COL.A6_STATUS_KAWIN,
      sekolah: COL.A6_SEKOLAH, namaAyah: null, namaIbu: null
    }
  ];

  return childDefs.map(function(def, idx) {
    var nama = normalizeStr(get(def.nama));
    // Anak dianggap tidak ada jika nama kosong
    if (!nama) {
      return { index: idx + 1, exists: false };
    }

    return {
      index       : idx + 1, // 1-based (Anak ke-n)
      exists      : true,
      no          : normalizeStr(get(def.no)),
      nama        : nama,
      status      : normalizeStr(get(def.status)), // AK/AT/AA
      tglLahirRaw : get(def.tglLahir),
      tglLahir    : parseDate(get(def.tglLahir)),
      statusKawin : normalizeStr(get(def.statusKawin)),
      sekolah     : normalizeStr(get(def.sekolah)),
      namaAyah    : def.namaAyah !== null ? normalizeStr(get(def.namaAyah)) : '',
      namaIbu     : def.namaIbu !== null ? normalizeStr(get(def.namaIbu)) : ''
    };
  });
}

/**
 * Ambil data config untuk dikirim ke client (hanya field aman)
 * @returns {Object}
 */
function getClientConfig() {
  try {
    var cfg = getConfig();
    return {
      processDate: formatDateDMY(cfg.processDate),
      year       : cfg.year,
      hasTemplate: cfg.templateId !== '',
      hasFolder  : cfg.outputFolderId !== ''
    };
  } catch(e) {
    return { error: e.message };
  }
}
