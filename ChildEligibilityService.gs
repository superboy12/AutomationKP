// ============================================================
// ChildEligibilityService.gs — Eligibility Evaluation
// KP4 Tunjangan Keluarga Automation System
// ============================================================
//
// Aturan kelayakan tanggungan anak:
// 1. Anak kosong/tidak ada data → tidak eligible
// 2. Anak yang sudah menikah → tidak eligible
// 3. Anak yang sudah bekerja → tidak eligible  
// 4. Anak < 21 tahun dan belum menikah → eligible
// 5. Anak >= 21 tahun DAN masih sekolah/kuliah → eligible
// 6. Anak >= 21 tahun DAN tidak sekolah → tidak eligible
//
// Untuk mengubah aturan, cukup modifikasi fungsi evaluateChildEligibility()
// ============================================================

var AGE_LIMIT = 21; // Batas umur dasar

// Keyword yang mengindikasikan anak sudah bekerja
var WORKING_KEYWORDS = [
  'bekerja', 'kerja', 'pegawai', 'karyawan', 'wiraswasta',
  'berdagang', 'dagang', 'usaha', 'honorer', 'kontrak'
];

// Keyword yang mengindikasikan anak sudah menikah
var MARRIED_KEYWORDS = [
  'pernah', 'sudah', 'menikah', 'kawin'
];

// Keyword yang mengindikasikan anak masih sekolah/kuliah
var STUDYING_KEYWORDS = [
  'sekolah', 'kuliah', 'mahasiswa', 'siswa', 'tk', 'sd', 'smp', 'sma',
  'smk', 'ma', 'mi', 'mts', 'universitas', 'akademi', 'diploma',
  'sarjana', 's1', 's2', 'studi', 'pt', 'ptn', 'pts', 'pesantren',
  'pondok', 'belum sekolah' // Anak yang belum sekolah tapi masih kecil
];

/**
 * Evaluasi kelayakan satu anak sebagai tanggungan
 *
 * @param {Object} child - Child object dari extractChildren()
 * @param {Date} processDate - Tanggal proses dari CONFIG
 * @returns {{eligible: boolean, reason: string, age: number, masukDaftarGaji: boolean}}
 */
function evaluateChildEligibility(child, processDate) {
  // 1. Cek apakah data anak ada
  if (!child || !child.exists) {
    return { eligible: false, reason: 'no_data', age: -1, masukDaftarGaji: false };
  }

  if (!child.nama) {
    return { eligible: false, reason: 'no_name', age: -1, masukDaftarGaji: false };
  }

  // 2. Hitung umur
  var birthDate = child.tglLahir;
  var age = -1;

  if (birthDate) {
    age = calculateAge(birthDate, processDate);
  }

  // 3. Cek status kawin
  var statusKawinLower = (child.statusKawin || '').toLowerCase().trim();
  var isMarried = false;

  // "Belum" = belum kawin = OK
  // "Pernah" atau "Sudah" = sudah pernah kawin = tidak eligible
  if (statusKawinLower && statusKawinLower !== 'belum') {
    // Cek apakah ada kata yang mengindikasikan sudah menikah
    if (containsAny(statusKawinLower, ['pernah', 'sudah', 'menikah'])) {
      isMarried = true;
    }
    // Jika kosong atau hanya "-", anggap belum kawin
  }

  if (isMarried) {
    return { eligible: false, reason: 'married', age: age, masukDaftarGaji: false };
  }

  // 4. Cek apakah sudah bekerja (dari field Sekolah)
  var sekolahLower = (child.sekolah || '').toLowerCase().trim();
  var isWorking = false;

  if (sekolahLower && sekolahLower !== '-' && sekolahLower !== '') {
    if (containsAny(sekolahLower, WORKING_KEYWORDS)) {
      isWorking = true;
    }
  }

  if (isWorking) {
    return { eligible: false, reason: 'working', age: age, masukDaftarGaji: false };
  }

  // 5. Cek umur
  if (age >= 0 && age < AGE_LIMIT) {
    // Anak di bawah batas umur → eligible
    return { eligible: true, reason: 'under_age_limit', age: age, masukDaftarGaji: true };
  }

  if (age >= AGE_LIMIT) {
    // Anak sudah melewati batas umur, cek apakah masih sekolah/kuliah
    var isStudying = false;

    if (sekolahLower && sekolahLower !== '-' && sekolahLower !== '') {
      isStudying = containsAny(sekolahLower, STUDYING_KEYWORDS);
    }

    if (isStudying) {
      // Masih kuliah/sekolah → eligible tapi mungkin tidak masuk daftar gaji
      return {
        eligible      : true,
        reason        : 'over_age_limit_still_studying',
        age           : age,
        masukDaftarGaji: false // Perlu verifikasi manual untuk usia > 21
      };
    } else {
      return { eligible: false, reason: 'over_age_limit', age: age, masukDaftarGaji: false };
    }
  }

  // Age tidak diketahui (tanggal lahir kosong) — masih bisa masuk jika nama ada
  if (age === -1) {
    return { eligible: true, reason: 'age_unknown', age: -1, masukDaftarGaji: true };
  }

  return { eligible: false, reason: 'unknown', age: age, masukDaftarGaji: false };
}

/**
 * Pilih anak yang eligible dari seluruh anak (maks maxCount)
 *
 * @param {Object[]} children - array of child objects (dari extractChildren)
 * @param {Date} processDate
 * @param {number} [maxCount=2] - maksimal anak yang dipilih
 * @returns {{selected: Object[], all: Object[]}}
 *          selected = anak terpilih (max 2) dengan hasil evaluasi
 *          all = semua anak dengan hasil evaluasi (untuk log/display)
 */
function selectEligibleChildren(children, processDate, maxCount) {
  maxCount = maxCount || 2;

  if (!children || children.length === 0) {
    return { selected: [], all: [] };
  }

  var allWithEval = children.map(function(child) {
    var eval_ = evaluateChildEligibility(child, processDate);
    return {
      child    : child,
      eligible : eval_.eligible,
      reason   : eval_.reason,
      age      : eval_.age,
      masukDaftarGaji: eval_.masukDaftarGaji
    };
  });

  // Filter yang eligible
  var eligible = allWithEval.filter(function(e) { return e.eligible; });

  // Ambil maksimal maxCount
  var selected = eligible.slice(0, maxCount);

  return {
    selected: selected,
    all     : allWithEval
  };
}

/**
 * Hitung ringkasan kelayakan untuk display di dashboard
 * @param {Object[]} allWithEval - hasil dari selectEligibleChildren().all
 * @returns {{totalEligible: number, totalIneligible: number, totalUnknownAge: number}}
 */
function summarizeEligibility(allWithEval) {
  var total    = allWithEval.filter(function(e) { return e.child && e.child.exists; }).length;
  var eligible = allWithEval.filter(function(e) { return e.eligible; }).length;

  return {
    total          : total,
    totalEligible  : eligible,
    totalIneligible: total - eligible
  };
}
