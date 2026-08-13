# SETUP.md — Panduan Deployment KP4 Automation System

## Prasyarat
- Akun Google Workspace / Gmail
- Akses ke Google Sheets, Google Drive, Google Docs, Google Apps Script
- File `KP4 2026 2.xlsx` (database pegawai)
- File `KP4.docx` (template surat)

---

## Langkah 1: Siapkan Google Sheets (Database)

1. Buka [Google Drive](https://drive.google.com)
2. Klik **+ New → File Upload** → upload `KP4 2026 2.xlsx`
3. Setelah upload, klik kanan file → **Open with → Google Sheets**
4. Spreadsheet akan terbuka. **Rename sheet tab** pertama menjadi `DATABASE`
5. **JANGAN ubah** header atau struktur data
6. Catat **Spreadsheet ID** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

---

## Langkah 2: Siapkan Google Docs Template

1. Di Google Drive, klik **+ New → File Upload** → upload `KP4.docx`
2. Klik kanan file → **Open with → Google Docs**
   - Google Docs akan membuat salinan sebagai Google Docs format
3. Di Google Docs yang terbuka, **edit data dinamis** dan ganti dengan placeholder:

   **Cara edit:** Tekan `Ctrl+H` (Find & Replace) untuk setiap nilai

   ### Bagian Paragraf (Data Pegawai):
   | Ganti teks ini | Dengan placeholder ini |
   |---|---|
   | `AZANU RUDIT SEPTIMA, SP` | `{{NAMA_LENGKAP}}` |
   | `199005072014031002` | `{{NIP}}` |
   | `B. LAMPUNG / 7 MEI 1990` | `{{TEMPAT_TANGGAL_LAHIR}}` |
   | `LAKI-LAKI` | `{{JENIS_KELAMIN}}` |
   | `ISLAM` | `{{AGAMA}}` |
   | `Indonesia` (di baris kebangsaan) | `{{KEBANGSAAN}}` |
   | `PENATA (III/c)` | `{{PANGKAT_GOL}}` |
   | `ANALIS SDM APARATUR AHLI MUDA` | `{{JABATAN}}` |
   | `Dinas Kehutanan Provinsi Lampung` (baris instansi) | `{{INSTANSI}}` |
   | `8 Th 10 Bln` | `{{MASA_KERJA}}` |
   | `PP No. 15 Tahun 2019 dengan Gaji Pokok Rp. 3.172.300` | `{{DIGAJI_MENURUT}}` |
   | `PERUM BLORA INDAH BLOK G.20 SEGALAMIDER` | `{{ALAMAT}}` |

   ### Tabel Pasangan (Table 0, Row Data):
   | Kolom | Ganti dengan |
   |---|---|
   | Nama Istri/Suami | `{{NAMA_PASANGAN}}` |
   | Kelahiran (Umur) | `{{UMUR_PASANGAN}}` |
   | Status | `{{STATUS_PASANGAN}}` |
   | Pekerjaan | `{{PEKERJAAN_PASANGAN}}` |
   | Penghasilan | `{{PENGHASILAN_PASANGAN}}` |
   | Keterangan | `{{KETERANGAN_PASANGAN}}` |

   ### Tabel Anak Masuk Daftar Gaji (Table 1, Rows Data):
   - Row data pertama (anak 1):
     `{{ANAK_MASUK_1_NO}}` | `{{ANAK_MASUK_1_NAMA}}` | `{{ANAK_MASUK_1_STATUS}}` |
     `{{ANAK_MASUK_1_TGL_LAHIR}}` | `{{ANAK_MASUK_1_STATUS_KAWIN}}` |
     `{{ANAK_MASUK_1_SEKOLAH}}` | `-` | `{{ANAK_MASUK_1_NAMA_AYAH}}` |
     `{{ANAK_MASUK_1_NAMA_IBU}}` | `-` | `-`
   - Row data kedua (anak 2): sama, ganti `_1_` → `_2_`

   ### Tabel Anak Tidak Masuk Daftar Gaji (Table 2, Rows Data):
   - Row 1 dan Row 2: isi dengan placeholder yang sesuai

4. **Simpan** Google Docs template (Ctrl+S)
5. Catat **Google Docs ID** dari URL:
   ```
   https://docs.google.com/document/d/[DOCS_ID]/edit
   ```

---

## Langkah 3: Siapkan Folder Output di Google Drive

1. Di Google Drive, buat folder baru: **Tunjangan Keluarga**
2. Catat **Folder ID** dari URL saat folder terbuka:
   ```
   https://drive.google.com/drive/folders/[FOLDER_ID]
   ```

---

## Langkah 4: Setup Google Apps Script

1. Di Google Sheets yang sudah dibuat, klik menu:
   **Extensions → Apps Script**
2. Hapus kode default yang ada
3. Di panel kiri, **buat file-file baru** dengan klik **+** (Add file → Script):

   Buat file berikut (copy-paste isi dari folder `src/`):
   - `Utils` → isi dari `src/Utils.gs`
   - `Config` → isi dari `src/Config.gs`
   - `SpreadsheetService` → isi dari `src/SpreadsheetService.gs`
   - `ChildEligibilityService` → isi dari `src/ChildEligibilityService.gs`
   - `TemplateService` → isi dari `src/TemplateService.gs`
   - `DocumentService` → isi dari `src/DocumentService.gs`
   - `DriveService` → isi dari `src/DriveService.gs`
   - `ExportService` → isi dari `src/ExportService.gs`
   - `LogService` → isi dari `src/LogService.gs`
   - `Code` → isi dari `src/Code.gs`

4. Buat file **HTML** (klik **+** → **HTML file**):
   - `index` → isi dari `web/index.html`
   - `css` → isi dari `web/css.html`
   - `javascript` → isi dari `web/javascript.html`

5. (Opsional) Tambahkan test files:
   - `testDates`, `testEligibility`, `testChildSelection`, `testMapping`
   → isi dari folder `tests/`

---

## Langkah 5: Inisialisasi Sheet CONFIG dan LOG

1. Di Apps Script Editor, pilih fungsi `initializeSheets`
2. Klik tombol **▶ Run**
3. Izinkan permission yang diminta
4. Buka Google Sheets → akan ada sheet **CONFIG** dan **LOG_GENERATE**

---

## Langkah 6: Isi CONFIG Sheet

1. Buka Google Sheets → klik sheet **CONFIG**
2. Isi nilai:

| Baris | Kolom A | Kolom B | Keterangan |
|-------|---------|---------|------------|
| 1 | Tanggal Proses | `31/12/2026` | Tanggal proses (DD/MM/YYYY) |
| 2 | Tahun | `2026` | Auto-update dari tanggal proses |
| 3 | Template Google Docs ID | `[ID dari Langkah 2]` | Paste ID template |
| 4 | Folder Output Google Drive ID | `[ID dari Langkah 3]` | Paste ID folder |

---

## Langkah 7: Deploy Web App

1. Di Apps Script Editor, klik **Deploy → New deployment**
2. Klik ikon ⚙ (gear) → pilih **Web app**
3. Atur:
   - **Description**: Sistem KP4 Tunjangan Keluarga
   - **Execute as**: Me (your Google account)
   - **Who has access**: Anyone (atau Anyone within organization)
4. Klik **Deploy**
5. Salin **Web App URL** yang muncul
6. Buka URL tersebut di browser → Dashboard akan tampil

---

## Langkah 8: Test Sistem

### Test Unit (di Apps Script Editor):
1. Pilih fungsi `runAllTests` → klik **▶ Run**
2. Lihat hasil di **Execution Log** (Ctrl+Enter atau View → Logs)

### Test Generate Satu Pegawai:
1. Buka Web App
2. Cari pegawai AZANU RUDIT SEPTIMA
3. Klik **⚡ Generate**
4. Pilih mode **Skip jika sudah ada** → Konfirmasi
5. Tunggu proses selesai
6. Klik **📄 Docs** untuk membuka dokumen
7. Verifikasi: nama, NIP, pasangan, anak terisi benar

### Test Generate Semua:
1. Klik **⚡ Generate Semua**
2. Pilih mode → Konfirmasi
3. Pantau progress bar
4. Setelah selesai, cek LOG_GENERATE sheet

---

## Langkah 9: Test Multi-Tahun

1. Buka CONFIG sheet, ubah B1 menjadi `31/12/2027`
2. B2 otomatis berubah ke `2027`
3. Di Web App, klik **🔄 Refresh**
4. Generate beberapa pegawai → dokumen masuk ke folder `2027/`
5. Verifikasi: umur anak berubah sesuai 2027
6. Data tanggal lahir di DATABASE tidak berubah

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| "Template Google Docs ID belum diatur" | Cek CONFIG!B3 terisi ID yang benar |
| "Sheet DATABASE tidak ditemukan" | Pastikan sheet tab bernama `DATABASE` |
| "Gagal menyalin template" | Pastikan akun GAS memiliki akses ke template file |
| "Export DOCX gagal" | Cek koneksi internet; coba Generate ulang |
| Dokumen placeholder tidak terganti | Pastikan placeholder di template persis `{{NAMA}}` tanpa spasi |
| Tabel anak tidak terisi | Cek jumlah tabel di Google Docs template (harus ada 3 tabel) |
| Timeout (>6 menit) | Kurangi BATCH_SIZE di `javascript.html` |

---

## Update Tahun Berikutnya

1. Buka CONFIG sheet
2. Ubah **B1** (Tanggal Proses) ke `31/12/2027`
3. **B2** (Tahun) otomatis update ke `2027`
4. Buka Web App → klik Refresh
5. Generate semua → dokumen masuk folder `Tunjangan Keluarga/2027/`
6. **Database tidak perlu diubah** — umur dihitung otomatis

---

## Struktur File Lokal (untuk referensi)

```
d:\KP4\
├── KP4 2026 2.xlsx          (database sumber — jangan diubah)
├── KP4.docx                 (template asli — jangan diubah)
├── src/
│   ├── Code.gs
│   ├── Config.gs
│   ├── SpreadsheetService.gs
│   ├── TemplateService.gs
│   ├── ChildEligibilityService.gs
│   ├── DocumentService.gs
│   ├── DriveService.gs
│   ├── ExportService.gs
│   ├── LogService.gs
│   └── Utils.gs
├── web/
│   ├── index.html
│   ├── css.html
│   └── javascript.html
├── tests/
│   ├── testDates.gs
│   ├── testEligibility.gs
│   ├── testChildSelection.gs
│   └── testMapping.gs
└── docs/
    ├── ARCHITECTURE.md
    ├── MAPPING.md
    ├── SETUP.md
    └── USER_GUIDE.md
```
