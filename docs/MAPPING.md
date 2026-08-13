# MAPPING.md — Field Mapping KP4 Automation System

> Auto-generated dari inspeksi KP4 2026 2.xlsx dan KP4.docx

---

## Spreadsheet DATABASE Sheet — Column Mapping

### Data Pegawai (Kolom A–M)

| # | Header Excel (Asli) | Kolom | Index (0-based) | Placeholder GAS | Keterangan |
|---|---|---|---|---|---|
| 1 | NO | A | 0 | `{{NO}}` | Nomor urut |
| 2 | Nama Lengkap | B | 1 | `{{NAMA_LENGKAP}}` | Nama lengkap pegawai |
| 3 | NIP | C | 2 | `{{NIP}}` | Nomor Induk Pegawai |
| 4 | Tempat/Tanggal Lahir | D | 3 | `{{TEMPAT_TANGGAL_LAHIR}}` | Format: Kota, DD MMMM YYYY |
| 5 | Jenis Kelamin | E | 4 | `{{JENIS_KELAMIN}}` | Laki-laki / Perempuan |
| 6 | Agama | F | 5 | `{{AGAMA}}` | Islam / dll |
| 7 | Kebangsaan | G | 6 | `{{KEBANGSAAN}}` | Indonesia |
| 8 | Pangkat/Gol | H | 7 | `{{PANGKAT_GOL}}` | Contoh: Penata / III.c |
| 9 | Jabatan | I | 8 | `{{JABATAN}}` | Jabatan struktural/fungsional |
| 10 | Instansi | J | 9 | `{{INSTANSI}}` | Nama instansi |
| 11 | Masa Kerja Seluruhnya | K | 10 | `{{MASA_KERJA}}` | Contoh: 8 Th 10 Bln |
| 12 | Digaji menurut | L | 11 | `{{DIGAJI_MENURUT}}` | Nominal gaji pokok (Rp) |
| 13 | Alamat | M | 12 | `{{ALAMAT}}` | Alamat tempat tinggal |

### Data Pasangan (Kolom N–S)

| # | Header Excel (Asli) | Kolom | Index (0-based) | Placeholder GAS | Keterangan |
|---|---|---|---|---|---|
| 14 | Nama Istri/suami | N | 13 | `{{NAMA_PASANGAN}}` | Nama istri/suami |
| 15 | Tanggal Kelahiran | O | 14 | `{{TANGGAL_LAHIR_PASANGAN}}` | Tanggal lahir pasangan (parsed) |
| 15b | — (dihitung) | — | — | `{{UMUR_PASANGAN}}` | **DIHITUNG** dari col O vs processDate |
| 16 | Tgl Perkawinan | P | 15 | `{{TANGGAL_PERKAWINAN}}` | Tanggal perkawinan |
| 17 | Pekerjaan | Q | 16 | `{{PEKERJAAN_PASANGAN}}` | Pekerjaan pasangan |
| 18 | Penghasilan | R | 17 | `{{PENGHASILAN_PASANGAN}}` | Penghasilan/bulan (format Rp) |
| 19 | Keterangan | S | 18 | `{{KETERANGAN_PASANGAN}}` | Contoh: Masuk daftar gaji |
| — | — (hardcoded) | — | — | `{{STATUS_PASANGAN}}` | KAWIN (untuk row pasangan di Table 0) |

### Data Jumlah Anak (Kolom T)

| # | Header Excel (Asli) | Kolom | Index (0-based) | Placeholder GAS | Keterangan |
|---|---|---|---|---|---|
| 20 | Jumlah anak seluruhnya | T | 19 | `{{JUMLAH_ANAK}}` | Contoh: 2 (dua) |

### Data Anak 1 (Kolom U–AB)

| # | Header Excel (Asli) | Kolom | Index (0-based) | Placeholder GAS | Keterangan |
|---|---|---|---|---|---|
| 21 | No | U | 20 | `{{ANAK1_NO}}` | Nomor urut anak (contoh: "1.") |
| 22 | Nama Anak 1 | V | 21 | `{{ANAK1_NAMA}}` | Nama anak |
| 23 | Status Anak | W | 22 | `{{ANAK1_STATUS}}` | AK=Anak Kandung, AT=Tiri, AA=Angkat |
| 24 | Tgl lahir | X | 23 | `{{ANAK1_TGL_LAHIR}}` | Tanggal lahir (parsed) |
| 24b | — (dihitung) | — | — | `{{ANAK1_UMUR}}` | **DIHITUNG** dari col X vs processDate |
| 25 | Blm/Pernah Kawin | Y | 24 | `{{ANAK1_STATUS_KAWIN}}` | Belum / Pernah Kawin |
| 26 | Sekolah pada | Z | 25 | `{{ANAK1_SEKOLAH}}` | Nama sekolah/kuliah |
| 27 | Nama Ayah | AA | 26 | `{{ANAK1_NAMA_AYAH}}` | Nama ayah anak |
| 28 | Nama Ibu | AB | 27 | `{{ANAK1_NAMA_IBU}}` | Nama ibu anak |
| — | — (dihitung) | — | — | `{{ANAK1_STATUS_TANGGUNGAN}}` | **DIHITUNG** dari evaluateChildEligibility |
| — | — (dari col S) | — | — | `{{ANAK1_MASUK_DAFTAR_GAJI}}` | Dari field Keterangan pasangan / heuristic |

### Data Anak 2 (Kolom AC–AJ)

| # | Header Excel (Asli) | Kolom | Index (0-based) | Placeholder GAS | Keterangan |
|---|---|---|---|---|---|
| 29 | No | AC | 28 | `{{ANAK2_NO}}` | |
| 30 | Nama Anak 2 | AD | 29 | `{{ANAK2_NAMA}}` | |
| 31 | Status Anak | AE | 30 | `{{ANAK2_STATUS}}` | |
| 32 | Tgl lahir | AF | 31 | `{{ANAK2_TGL_LAHIR}}` | |
| 32b | — (dihitung) | — | — | `{{ANAK2_UMUR}}` | |
| 33 | Blm/Pernah Kawin | AG | 32 | `{{ANAK2_STATUS_KAWIN}}` | |
| 34 | Sekolah pada | AH | 33 | `{{ANAK2_SEKOLAH}}` | |
| 35 | Nama Ayah | AI | 34 | `{{ANAK2_NAMA_AYAH}}` | |
| 36 | Nama Ibu | AJ | 35 | `{{ANAK2_NAMA_IBU}}` | |

### Data Anak 3 (Kolom AK–AP) ⚠️ TIDAK ADA Nama Ayah/Ibu

| # | Header Excel (Asli) | Kolom | Index (0-based) | Placeholder GAS | Keterangan |
|---|---|---|---|---|---|
| 37 | No | AK | 36 | `{{ANAK3_NO}}` | |
| 38 | Nama Anak 3 | AL | 37 | `{{ANAK3_NAMA}}` | |
| 39 | Status Anak | AM | 38 | `{{ANAK3_STATUS}}` | |
| 40 | Tgl lahir | AN | 39 | `{{ANAK3_TGL_LAHIR}}` | |
| 40b | — (dihitung) | — | — | `{{ANAK3_UMUR}}` | |
| 41 | Blm/Pernah Kawin | AO | 40 | `{{ANAK3_STATUS_KAWIN}}` | |
| 42 | Sekolah pada | AP | 41 | `{{ANAK3_SEKOLAH}}` | |

### Data Anak 4 (Kolom AQ–AV)

| # | Header Excel (Asli) | Kolom | Index (0-based) | Placeholder GAS | Keterangan |
|---|---|---|---|---|---|
| 43 | No | AQ | 42 | `{{ANAK4_NO}}` | |
| 44 | Nama Anak 4 | AR | 43 | `{{ANAK4_NAMA}}` | |
| 45 | Status Anak | AS | 44 | `{{ANAK4_STATUS}}` | |
| 46 | Tgl lahir | AT | 45 | `{{ANAK4_TGL_LAHIR}}` | |
| 46b | — (dihitung) | — | — | `{{ANAK4_UMUR}}` | |
| 47 | Blm/Pernah Kawin | AU | 46 | `{{ANAK4_STATUS_KAWIN}}` | |
| 48 | Sekolah pada | AV | 47 | `{{ANAK4_SEKOLAH}}` | |

### Data Anak 5 (Kolom AW–BB)

| # | Header Excel (Asli) | Kolom | Index (0-based) | Placeholder GAS | Keterangan |
|---|---|---|---|---|---|
| 49 | No | AW | 48 | `{{ANAK5_NO}}` | |
| 50 | Nama Anak 5 | AX | 49 | `{{ANAK5_NAMA}}` | |
| 51 | Status Anak | AY | 50 | `{{ANAK5_STATUS}}` | |
| 52 | Tgl lahir | AZ | 51 | `{{ANAK5_TGL_LAHIR}}` | |
| 52b | — (dihitung) | — | — | `{{ANAK5_UMUR}}` | |
| 53 | Blm/Pernah Kawin | BA | 52 | `{{ANAK5_STATUS_KAWIN}}` | |
| 54 | Sekolah pada | BB | 53 | `{{ANAK5_SEKOLAH}}` | |

### Data Anak 6 (Kolom BC–BH)

| # | Header Excel (Asli) | Kolom | Index (0-based) | Placeholder GAS | Keterangan |
|---|---|---|---|---|---|
| 55 | No | BC | 54 | `{{ANAK6_NO}}` | |
| 56 | Nama Anak 6 | BD | 55 | `{{ANAK6_NAMA}}` | |
| 57 | Status Anak | BE | 56 | `{{ANAK6_STATUS}}` | |
| 58 | Tgl lahir | BF | 57 | `{{ANAK6_TGL_LAHIR}}` | |
| 58b | — (dihitung) | — | — | `{{ANAK6_UMUR}}` | |
| 59 | Blm/Pernah Kawin | BG | 58 | `{{ANAK6_STATUS_KAWIN}}` | |
| 60 | Sekolah pada | BH | 59 | `{{ANAK6_SEKOLAH}}` | |

---

## Placeholder Umum (Dihitung Runtime)

| Placeholder | Sumber | Keterangan |
|---|---|---|
| `{{TANGGAL_PROSES}}` | CONFIG!B1 | Tanggal proses dari config |
| `{{TAHUN}}` | CONFIG!B2 | Tahun dari config |
| `{{UMUR_PASANGAN}}` | Dihitung | Dari Tanggal Kelahiran pasangan vs processDate |
| `{{ANAKn_UMUR}}` | Dihitung | Dari Tgl lahir anak n vs processDate |
| `{{ANAKn_STATUS_TANGGUNGAN}}` | Dihitung | Hasil evaluateChildEligibility() |
| `{{ANAKn_MASUK_DAFTAR_GAJI}}` | Dihitung | Dari sekolah/pekerjaan + aturan |

---

## Template KP4.docx → Google Docs Placeholder Map

### Section 1: Data Pegawai (Paragraf)

| Teks Asli di Template | Ganti Dengan |
|---|---|
| `AZANU RUDIT SEPTIMA, SP` | `{{NAMA_LENGKAP}}` |
| `199005072014031002` | `{{NIP}}` |
| `B. LAMPUNG / 7 MEI 1990` | `{{TEMPAT_TANGGAL_LAHIR}}` |
| `LAKI-LAKI` | `{{JENIS_KELAMIN}}` |
| `ISLAM` | `{{AGAMA}}` |
| `Indonesia` | `{{KEBANGSAAN}}` |
| `PENATA (III/c)` | `{{PANGKAT_GOL}}` |
| `ANALIS SDM APARATUR AHLI MUDA` | `{{JABATAN}}` |
| `Dinas Kehutanan Provinsi Lampung` (di para Instansi) | `{{INSTANSI}}` |
| `8 Th 10 Bln` | `{{MASA_KERJA}}` |
| `PP No. 15 Tahun 2019 dengan Gaji Pokok Rp. 3.172.300` | `{{DIGAJI_MENURUT}}` |
| `PERUM BLORA INDAH BLOK G.20 SEGALAMIDER` | `{{ALAMAT}}` |

### Table 0: Pasangan (Row 2, Data Row)

| Kolom | Teks Asli | Placeholder |
|---|---|---|
| [0] No | `1.` | `1.` (static) |
| [1] Nama Istri/Suami | `RIANA MAULIDA` | `{{NAMA_PASANGAN}}` |
| [2] Kelahiran (Umur) | `32` | `{{UMUR_PASANGAN}}` |
| [3] Tanggal Perkawinan / Status | `KAWIN` | `{{STATUS_PASANGAN}}` |
| [4] Pekerjaan | `IRT` | `{{PEKERJAAN_PASANGAN}}` |
| [5] Penghasilan | `-` | `{{PENGHASILAN_PASANGAN}}` |
| [6] Keterangan | `DITANGGUNG` | `{{KETERANGAN_PASANGAN}}` |

### Table 1: Anak Masuk Daftar Gaji (11 kolom)

Row 2 (template row anak pertama):
| Kolom | Placeholder |
|---|---|
| [0] No Urut | `{{ANAK_MASUK_1_NO}}` |
| [1] Nama | `{{ANAK_MASUK_1_NAMA}}` |
| [2] Status Anak | `{{ANAK_MASUK_1_STATUS}}` |
| [3] Tanggal Lahir | `{{ANAK_MASUK_1_TGL_LAHIR}}` |
| [4] Belum/Pernah Kawin | `{{ANAK_MASUK_1_STATUS_KAWIN}}` |
| [5] Sekolah/Kuliah | `{{ANAK_MASUK_1_SEKOLAH}}` |
| [6] Tidak Mendapat Beasiswa | `-` |
| [7] Nama Ayah | `{{ANAK_MASUK_1_NAMA_AYAH}}` |
| [8] Nama Ibu | `{{ANAK_MASUK_1_NAMA_IBU}}` |
| [9] Tgl Meninggal/Diceraikan | `-` |
| [10] Diangkat menurut | `-` |

Row 3 (anak kedua — sama dengan row 2 tapi placeholder `_2_`):

### Table 2: Anak Tidak Masuk Daftar Gaji (9 kolom)

Row 1 (anak pertama):
| Kolom | Placeholder |
|---|---|
| [0] No Urut | `{{ANAK_TIDAK_1_NO}}` |
| [1] Nama | `{{ANAK_TIDAK_1_NAMA}}` |
| [2] Status Anak | `{{ANAK_TIDAK_1_STATUS}}` |
| [3] Tanggal Lahir | `{{ANAK_TIDAK_1_TGL_LAHIR}}` |
| [4] Belum/Pernah Kawin | `{{ANAK_TIDAK_1_STATUS_KAWIN}}` |
| [5] Sekolah/Kuliah | `{{ANAK_TIDAK_1_SEKOLAH}}` |
| [6] Mendapat Beasiswa | `-` |
| [7] Bekerja/Tidak | `-` |
| [8] Keterangan | `-` |

---

## Field Tidak Ada di Spreadsheet (UNKNOWN/Derived)

| Field | Status | Penanganan |
|---|---|---|
| `{{ANAKn_UMUR}}` | DIHITUNG | Calculated from birthdate vs CONFIG!B1 |
| `{{ANAKn_STATUS_TANGGUNGAN}}` | DIHITUNG | Result of evaluateChildEligibility() |
| `{{ANAKn_MASUK_DAFTAR_GAJI}}` | DERIVED | Derived from eligibility + keterangan |
| `{{UMUR_PASANGAN}}` | DIHITUNG | Calculated from col O vs CONFIG!B1 |
| `{{STATUS_PASANGAN}}` | HARDCODED | "KAWIN" untuk semua yang ada pasangan |
| `{{TANGGAL_PROSES}}` | CONFIG | Dari CONFIG!B1 |
| `{{TAHUN}}` | CONFIG | Dari CONFIG!B2 |

---

## Catatan Penting

1. **Anak 3–6 tidak memiliki kolom Nama Ayah/Ibu** di spreadsheet. Untuk keperluan tabel, gunakan data pegawai dan pasangan yang tersedia.
2. **Status Anak**: AK = Anak Kandung, AT = Anak Tiri, AA = Anak Angkat
3. **Format tanggal output**: DD/MM/YYYY (sesuai template asli)
4. **Digaji menurut**: Di spreadsheet berupa angka (gaji pokok), perlu diformat sebagai teks "PP No. ... Rp. X.XXX.XXX" atau langsung angka sesuai data
5. **Penghasilan pasangan**: Di spreadsheet berupa angka, perlu diformat Rp. X.XXX.XXX
