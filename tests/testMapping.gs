// ============================================================
// testMapping.gs — Tests untuk field mapping dari SpreadsheetService
// KP4 Tunjangan Keluarga Automation System
// ============================================================

function testMapping() {
  var passed = 0;
  var failed = 0;

  function assert(condition, label) {
    if (condition) { Logger.log('[PASS] ' + label); passed++; }
    else { Logger.log('[FAIL] ' + label); failed++; }
  }

  // Simulasi satu baris data (berdasarkan row 2 KP4 2026 2.xlsx)
  var sampleRow = new Array(60).fill('');
  // Pegawai
  sampleRow[0]  = 1;
  sampleRow[1]  = 'PANDARIA RILIYANA, S.P., M.M';
  sampleRow[2]  = '19780105 200212 2 002';
  sampleRow[3]  = 'T. Karang, 05-01-1978';
  sampleRow[4]  = 'Perempuan';
  sampleRow[5]  = 'Islam';
  sampleRow[6]  = 'Indonesia';
  sampleRow[7]  = 'Pembina / IV.a';
  sampleRow[8]  = 'Kepala Sub Bagian Umum dan Kepegawaian';
  sampleRow[9]  = 'Dinas Kehutanan Provinsi Lampung';
  sampleRow[10] = '23 Tahun 1 Bulan';
  sampleRow[11] = 4624300;
  sampleRow[12] = 'JL. Sandi Hasan Kel. Labuhan Dalam';
  // Pasangan
  sampleRow[13] = 'Erlan Kafrawi, S.P., MM';
  sampleRow[14] = new Date(1972, 8, 23); // 23 Sep 1972
  sampleRow[15] = new Date(2006, 8, 15); // 15 Sep 2006
  sampleRow[16] = 'PNS';
  sampleRow[17] = 3565000;
  sampleRow[18] = 'Masuk daftar gaji';
  sampleRow[19] = '2 (dua)';
  // Anak 1
  sampleRow[20] = '1.';
  sampleRow[21] = 'BEENA FARAH ERIA';
  sampleRow[22] = 'AK';
  sampleRow[23] = new Date(2007, 7, 3); // 3 Aug 2007
  sampleRow[24] = 'BELUM';
  sampleRow[25] = 'SEKOLAH';
  sampleRow[26] = 'ERLAN KAFRAWI, S.P., MM';
  sampleRow[27] = 'PANDARIA RILIYANA, S.P., MM';
  // Anak 2
  sampleRow[28] = '2.';
  sampleRow[29] = 'M. FARHAN ERIA';
  sampleRow[30] = 'AK';
  sampleRow[31] = '12-06-2011';
  sampleRow[32] = 'BELUM';
  sampleRow[33] = 'SEKOLAH';
  sampleRow[34] = 'ERLAN KAFRAWI, S.P., MM';
  sampleRow[35] = 'PANDARIA RILIYANA, S.P., MM';

  var empData = buildEmployeeObject(sampleRow);

  // Test pegawai
  assert(empData.employee.namaLengkap === 'PANDARIA RILIYANA, S.P., M.M',
    'T01: Nama Lengkap dipetakan');
  assert(empData.employee.nip === '19780105 200212 2 002',
    'T02: NIP dipetakan');
  assert(empData.employee.jabatan === 'Kepala Sub Bagian Umum dan Kepegawaian',
    'T03: Jabatan dipetakan');
  assert(empData.employee.pangkatGol === 'Pembina / IV.a',
    'T04: Pangkat/Gol dipetakan');
  assert(empData.employee.instansi === 'Dinas Kehutanan Provinsi Lampung',
    'T05: Instansi dipetakan');

  // Test pasangan
  assert(empData.pasangan.nama === 'Erlan Kafrawi, S.P., MM',
    'T06: Nama pasangan dipetakan');
  assert(empData.pasangan.pekerjaan === 'PNS',
    'T07: Pekerjaan pasangan dipetakan');
  assert(empData.pasangan.tglLahir instanceof Date,
    'T08: Tgl lahir pasangan parsed sebagai Date');

  // Test anak 1
  assert(empData.anak[0].exists === true,
    'T09: Anak 1 exists = true');
  assert(empData.anak[0].nama === 'BEENA FARAH ERIA',
    'T10: Nama Anak 1 dipetakan');
  assert(empData.anak[0].status === 'AK',
    'T11: Status Anak 1 = AK');
  assert(empData.anak[0].tglLahir instanceof Date,
    'T12: Tgl lahir Anak 1 = Date');
  assert(empData.anak[0].namaAyah === 'ERLAN KAFRAWI, S.P., MM',
    'T13: Nama Ayah Anak 1 dipetakan');

  // Test anak 2
  assert(empData.anak[1].exists === true,
    'T14: Anak 2 exists = true');
  assert(empData.anak[1].nama === 'M. FARHAN ERIA',
    'T15: Nama Anak 2 dipetakan');
  var tgl2 = empData.anak[1].tglLahir;
  assert(tgl2 instanceof Date && tgl2.getFullYear() === 2011,
    'T16: Tgl lahir Anak 2 (string DD-MM-YYYY) = 2011');

  // Test anak 3-6 tidak ada
  assert(empData.anak[2].exists === false, 'T17: Anak 3 tidak ada');
  assert(empData.anak[3].exists === false, 'T18: Anak 4 tidak ada');
  assert(empData.anak[4].exists === false, 'T19: Anak 5 tidak ada');
  assert(empData.anak[5].exists === false, 'T20: Anak 6 tidak ada');

  // Test jumlah anak
  assert(empData.jumlahAnak === '2 (dua)', 'T21: Jumlah anak = "2 (dua)"');

  // Test formatCurrency
  assert(formatCurrency(4624300)   === 'Rp. 4.624.300', 'T22: formatCurrency(4624300)');
  assert(formatCurrency(0)         === 'Rp. 0',         'T23: formatCurrency(0)');
  assert(formatCurrency(null)      === '-',              'T24: formatCurrency(null) = "-"');
  assert(formatCurrency('-')       === '-',              'T25: formatCurrency("-") = "-"');

  Logger.log('\n=== MAPPING: ' + passed + ' passed, ' + failed + ' failed ===');
  return { passed: passed, failed: failed };
}

/**
 * Run semua tests sekaligus
 */
function runAllTests() {
  Logger.log('============================================');
  Logger.log('   KP4 AUTOMATION SYSTEM — ALL TESTS       ');
  Logger.log('============================================');

  var r1 = runAllDateTests();
  var r2 = runAllEligibilityTests();
  var r3 = runAllChildSelectionTests();
  var r4 = testMapping();

  var total = {
    passed: r1.passed + r2.passed + r3.passed + r4.passed,
    failed: r1.failed + r2.failed + r3.failed + r4.failed
  };

  Logger.log('\n============================================');
  Logger.log('TOTAL: ' + total.passed + ' PASSED, ' + total.failed + ' FAILED');
  Logger.log('============================================');

  return total;
}
