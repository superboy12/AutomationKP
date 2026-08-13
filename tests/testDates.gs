// ============================================================
// testDates.gs — Unit Tests untuk parseDate() dan calculateAge()
// KP4 Tunjangan Keluarga Automation System
// ============================================================

function testDateParsing() {
  var passed = 0;
  var failed = 0;

  function assert(condition, label) {
    if (condition) {
      Logger.log('[PASS] ' + label);
      passed++;
    } else {
      Logger.log('[FAIL] ' + label);
      failed++;
    }
  }

  // Test 1: DD/MM/YYYY format
  var d1 = parseDate('31/12/2026');
  assert(d1 instanceof Date, 'parseDate("31/12/2026") returns Date');
  assert(d1 && d1.getDate() === 31, 'Day = 31');
  assert(d1 && d1.getMonth() === 11, 'Month = 11 (December, 0-indexed)');
  assert(d1 && d1.getFullYear() === 2026, 'Year = 2026');

  // Test 2: DD-MM-YYYY format
  var d2 = parseDate('14-06-2011');
  assert(d2 instanceof Date, 'parseDate("14-06-2011") returns Date');
  assert(d2 && d2.getDate() === 14, 'Day = 14');

  // Test 3: YYYY-MM-DD format (ISO)
  var d3 = parseDate('2007-08-03');
  assert(d3 instanceof Date, 'parseDate("2007-08-03") returns Date');
  assert(d3 && d3.getFullYear() === 2007, 'Year = 2007');
  assert(d3 && d3.getMonth() === 7, 'Month = 7 (August)');

  // Test 4: Date object passthrough
  var dateObj = new Date(2015, 2, 11); // 11 Mar 2015
  var d4 = parseDate(dateObj);
  assert(d4 instanceof Date, 'parseDate(Date) passthrough works');
  assert(d4 && d4.getFullYear() === 2015, 'Year = 2015');

  // Test 5: null/empty/undefined
  var d5 = parseDate(null);
  assert(d5 === null, 'parseDate(null) = null');

  var d6 = parseDate('');
  assert(d6 === null, 'parseDate("") = null');

  var d7 = parseDate(undefined);
  assert(d7 === null, 'parseDate(undefined) = null');

  var d8 = parseDate('-');
  assert(d8 === null, 'parseDate("-") = null');

  // Test 6: String timestamp dari Sheets
  var d9 = parseDate('2020-10-10 00:00:00');
  assert(d9 instanceof Date, 'parseDate("2020-10-10 00:00:00") returns Date');

  // Test 7: Single digit day/month
  var d10 = parseDate('3/3/1988');
  assert(d10 instanceof Date, 'parseDate("3/3/1988") with single digits');
  assert(d10 && d10.getFullYear() === 1988, 'Year = 1988');

  Logger.log('\n=== DATE PARSING: ' + passed + ' passed, ' + failed + ' failed ===');
  return { passed: passed, failed: failed };
}

function testAgeCalculation() {
  var passed = 0;
  var failed = 0;

  function assert(condition, label) {
    if (condition) { Logger.log('[PASS] ' + label); passed++; }
    else { Logger.log('[FAIL] ' + label); failed++; }
  }

  var processDate2026 = new Date(2026, 11, 31); // 31 Dec 2026
  var processDate2027 = new Date(2027, 11, 31); // 31 Dec 2027

  // Anak lahir 11 Mar 2015 → umur 11 pada 31/12/2026
  var child2015 = new Date(2015, 2, 11);
  var age2026   = calculateAge(child2015, processDate2026);
  assert(age2026 === 11, 'Anak 2015 → umur 11 pada 2026 (actual: ' + age2026 + ')');

  // Tahun berubah ke 2027 → umur 12
  var age2027 = calculateAge(child2015, processDate2027);
  assert(age2027 === 12, 'Anak 2015 → umur 12 pada 2027 (actual: ' + age2027 + ')');

  // Anak lahir 31/12/2006 → tepat 20 tahun pada 31/12/2026
  var child2006 = new Date(2006, 11, 31);
  var age20 = calculateAge(child2006, processDate2026);
  assert(age20 === 20, 'Anak lahir 31/12/2006 → tepat 20 tahun (actual: ' + age20 + ')');

  // Anak lahir 1/1/2006 → 20 tahun pada 31/12/2026
  var child0101 = new Date(2006, 0, 1);
  var ageJan = calculateAge(child0101, processDate2026);
  assert(ageJan === 20, 'Anak lahir 1/1/2006 → 20 tahun pada akhir 2026 (actual: ' + ageJan + ')');

  // Null date → -1
  var ageNull = calculateAge(null, processDate2026);
  assert(ageNull === -1, 'calculateAge(null) = -1');

  Logger.log('\n=== AGE CALCULATION: ' + passed + ' passed, ' + failed + ' failed ===');
  return { passed: passed, failed: failed };
}

function runAllDateTests() {
  Logger.log('======= RUNNING DATE TESTS =======');
  var r1 = testDateParsing();
  var r2 = testAgeCalculation();
  var total = { passed: r1.passed + r2.passed, failed: r1.failed + r2.failed };
  Logger.log('\n=== TOTAL: ' + total.passed + ' passed, ' + total.failed + ' failed ===');
  return total;
}
