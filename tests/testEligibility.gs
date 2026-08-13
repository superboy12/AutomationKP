// ============================================================
// testEligibility.gs — Unit Tests untuk evaluateChildEligibility()
// KP4 Tunjangan Keluarga Automation System
// ============================================================

function testEligibility() {
  var passed = 0;
  var failed = 0;

  function assert(condition, label) {
    if (condition) { Logger.log('[PASS] ' + label); passed++; }
    else { Logger.log('[FAIL] ' + label); failed++; }
  }

  var processDate = new Date(2026, 11, 31); // 31 Dec 2026

  // Helper: buat child object
  function makeChild(nama, tglLahir, statusKawin, sekolah) {
    return {
      exists      : !!nama,
      nama        : nama || '',
      tglLahir    : tglLahir ? parseDate(tglLahir) : null,
      statusKawin : statusKawin || 'Belum',
      sekolah     : sekolah || '-'
    };
  }

  // Test 1: Anak tidak ada (exists=false)
  var r1 = evaluateChildEligibility({ exists: false }, processDate);
  assert(!r1.eligible, 'T01: Anak tidak ada → tidak eligible');
  assert(r1.reason === 'no_data', 'T01: reason = no_data');

  // Test 2: Anak tanpa nama
  var r2 = evaluateChildEligibility({ exists: true, nama: '' }, processDate);
  assert(!r2.eligible, 'T02: Anak tanpa nama → tidak eligible');

  // Test 3: Anak 8 tahun, belum kawin, sekolah SD
  var c3 = makeChild('Anak Test', '15/06/2018', 'Belum', 'SDN 1');
  var r3 = evaluateChildEligibility(c3, processDate);
  assert(r3.eligible, 'T03: Anak 8 tahun → eligible (under age limit)');
  assert(r3.age === 8, 'T03: Umur = 8 (actual: ' + r3.age + ')');

  // Test 4: Anak 22 tahun, masih kuliah
  var c4 = makeChild('Anak Kuliah', '10/05/2004', 'Belum', 'Universitas Lampung');
  var r4 = evaluateChildEligibility(c4, processDate);
  assert(r4.eligible, 'T04: Anak 22 tahun masih kuliah → eligible');
  assert(r4.reason === 'over_age_limit_still_studying', 'T04: reason = over_age_limit_still_studying');

  // Test 5: Anak 23 tahun, tidak sekolah, tidak bekerja
  var c5 = makeChild('Anak Tua', '01/01/2003', 'Belum', '-');
  var r5 = evaluateChildEligibility(c5, processDate);
  assert(!r5.eligible, 'T05: Anak 23 tahun, tidak sekolah → tidak eligible');
  assert(r5.reason === 'over_age_limit', 'T05: reason = over_age_limit');

  // Test 6: Anak sudah menikah
  var c6 = makeChild('Anak Kawin', '10/03/2000', 'Pernah Kawin', 'Sekolah');
  var r6 = evaluateChildEligibility(c6, processDate);
  assert(!r6.eligible, 'T06: Anak sudah menikah → tidak eligible');
  assert(r6.reason === 'married', 'T06: reason = married');

  // Test 7: Anak sudah bekerja (sekolah diisi kata "bekerja")
  var c7 = makeChild('Anak Kerja', '15/08/2000', 'Belum', 'Bekerja di perusahaan');
  var r7 = evaluateChildEligibility(c7, processDate);
  assert(!r7.eligible, 'T07: Anak bekerja → tidak eligible');
  assert(r7.reason === 'working', 'T07: reason = working');

  // Test 8: Anak 20 tahun 11 bulan → eligible (masih < 21)
  var c8 = makeChild('Anak Hampir 21', '01/02/2006', 'Belum', 'SMA');
  var r8 = evaluateChildEligibility(c8, processDate);
  assert(r8.eligible, 'T08: Anak hampir 21 → eligible');
  assert(r8.age < 21, 'T08: Umur < 21 (actual: ' + r8.age + ')');

  // Test 9: Anak tepat 21 tahun (birthday 31 Dec 2005)
  var c9 = makeChild('Anak 21 Pas', '31/12/2005', 'Belum', '-');
  var r9 = evaluateChildEligibility(c9, processDate);
  assert(!r9.eligible, 'T09: Anak tepat 21 tahun, tidak sekolah → tidak eligible (actual age: ' + r9.age + ')');

  // Test 10: Anak tanpa tanggal lahir (age unknown) → eligible by default
  var c10 = makeChild('Anak No DOB', null, 'Belum', 'Sekolah');
  var r10 = evaluateChildEligibility(c10, processDate);
  assert(r10.eligible, 'T10: Anak tanpa tanggal lahir → eligible (age_unknown)');

  // Test 11: Anak belum sekolah (bayi) → eligible
  var c11 = makeChild('Bayi', '15/03/2025', 'Belum', 'Belum Sekolah');
  var r11 = evaluateChildEligibility(c11, processDate);
  assert(r11.eligible, 'T11: Bayi → eligible');

  Logger.log('\n=== ELIGIBILITY: ' + passed + ' passed, ' + failed + ' failed ===');
  return { passed: passed, failed: failed };
}

function runAllEligibilityTests() {
  Logger.log('======= RUNNING ELIGIBILITY TESTS =======');
  return testEligibility();
}
