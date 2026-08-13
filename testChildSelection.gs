// ============================================================
// testChildSelection.gs — Tests untuk selectEligibleChildren()
// KP4 Tunjangan Keluarga Automation System
// ============================================================

function testChildSelection() {
  var passed = 0;
  var failed = 0;

  function assert(condition, label) {
    if (condition) { Logger.log('[PASS] ' + label); passed++; }
    else { Logger.log('[FAIL] ' + label); failed++; }
  }

  var processDate2026 = new Date(2026, 11, 31);
  var processDate2027 = new Date(2027, 11, 31);

  function makeChild(nama, tglLahirStr, statusKawin, sekolah) {
    return {
      index      : 1,
      exists     : !!nama,
      nama       : nama || '',
      status     : 'AK',
      tglLahir   : tglLahirStr ? parseDate(tglLahirStr) : null,
      statusKawin: statusKawin || 'Belum',
      sekolah    : sekolah || '-',
      namaAyah   : 'Ayah',
      namaIbu    : 'Ibu'
    };
  }

  // Test 1: Tidak ada anak (array kosong)
  var r1 = selectEligibleChildren([], processDate2026);
  assert(r1.selected.length === 0, 'T01: 0 anak → 0 dipilih');
  assert(r1.all.length === 0,      'T01: all = 0');

  // Test 2: Satu anak eligible
  var c2 = [makeChild('Anak 1', '15/06/2015', 'Belum', 'SD')];
  var r2 = selectEligibleChildren(c2, processDate2026);
  assert(r2.selected.length === 1, 'T02: 1 anak eligible → 1 dipilih');

  // Test 3: Dua anak eligible → dipilih keduanya
  var c3 = [
    makeChild('Anak 1', '15/06/2015', 'Belum', 'SD'),
    makeChild('Anak 2', '10/03/2018', 'Belum', 'TK')
  ];
  var r3 = selectEligibleChildren(c3, processDate2026);
  assert(r3.selected.length === 2, 'T03: 2 anak eligible → 2 dipilih');

  // Test 4: 6 anak, semua eligible → dipilih hanya 2
  var c4 = [
    makeChild('Anak 1', '01/01/2010', 'Belum', 'SMA'),
    makeChild('Anak 2', '01/01/2012', 'Belum', 'SMP'),
    makeChild('Anak 3', '01/01/2014', 'Belum', 'SD'),
    makeChild('Anak 4', '01/01/2016', 'Belum', 'SD'),
    makeChild('Anak 5', '01/01/2018', 'Belum', 'TK'),
    makeChild('Anak 6', '01/01/2020', 'Belum', 'Belum Sekolah')
  ];
  var r4 = selectEligibleChildren(c4, processDate2026);
  assert(r4.selected.length === 2, 'T04: 6 anak → hanya 2 dipilih');
  assert(r4.all.length === 6,      'T04: all = 6 (tidak ada yang dihapus)');

  // Test 5: Semua anak tidak eligible → 0 dipilih
  var c5 = [
    makeChild('Anak Kawin', '01/01/2000', 'Pernah Kawin', '-'),
    makeChild('Anak Tua',   '01/01/1998', 'Belum',        '-')
  ];
  var r5 = selectEligibleChildren(c5, processDate2026);
  assert(r5.selected.length === 0, 'T05: Semua tidak eligible → 0 dipilih');

  // Test 6: 3 anak, 2 eligible, 1 tidak → dipilih 2
  var c6 = [
    makeChild('Anak 1', '01/01/2010', 'Belum',        'SMA'),
    makeChild('Anak 2', '01/01/2012', 'Pernah Kawin', '-'),   // tidak eligible
    makeChild('Anak 3', '01/01/2015', 'Belum',        'SD')
  ];
  var r6 = selectEligibleChildren(c6, processDate2026);
  assert(r6.selected.length === 2, 'T06: 3 anak, 2 eligible → 2 dipilih');
  assert(r6.all.length === 3,      'T06: all = 3 (semua anak tetap ada)');
  assert(!r6.all[1].eligible,      'T06: Anak 2 (kawin) tidak eligible');

  // Test 7: Perubahan tahun proses mengubah umur
  var anak = makeChild('Anak Batas', '31/12/2005', 'Belum', '-');
  var r7a = selectEligibleChildren([anak], processDate2026);
  var r7b = selectEligibleChildren([anak], processDate2027);

  // Pada 31/12/2026: umur = 21 → tidak eligible (no school)
  assert(!r7a.selected.length || !r7a.selected[0].eligible,
    'T07: Anak tepat 21 pada 2026 (tanpa sekolah) → tidak eligible');

  // Pada 31/12/2027: umur = 22 → tidak eligible (no school)
  assert(!r7b.selected.length || !r7b.selected[0].eligible,
    'T07: Anak 22 pada 2027 (tanpa sekolah) → tidak eligible');

  // Test 8: Anak berisi null/undefined/exists=false → diabaikan
  var c8 = [
    { exists: false },
    makeChild('Anak Valid', '01/01/2015', 'Belum', 'SD'),
    null
  ];
  var r8 = selectEligibleChildren(c8, processDate2026);
  assert(r8.selected.length === 1, 'T08: Hanya 1 anak valid → 1 dipilih');

  // Test 9: Pasangan kosong tidak mempengaruhi pemilihan anak
  var c9 = [makeChild('Anak 1', '01/01/2015', 'Belum', 'SD')];
  var r9 = selectEligibleChildren(c9, processDate2026, 2);
  assert(r9.selected.length === 1, 'T09: Pasangan kosong tidak mengganggu');

  Logger.log('\n=== CHILD SELECTION: ' + passed + ' passed, ' + failed + ' failed ===');
  return { passed: passed, failed: failed };
}

function runAllChildSelectionTests() {
  Logger.log('======= RUNNING CHILD SELECTION TESTS =======');
  return testChildSelection();
}
