# ARCHITECTURE.md — Sistem Otomatisasi KP4

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                    OPERATOR / BROWSER                       │
│              (Google Apps Script Web App)                   │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTML/CSS/JS
                            │ google.script.run
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 GOOGLE APPS SCRIPT (Backend)                │
│                                                             │
│  Code.gs           — doGet(), API handlers                  │
│  Config.gs         — CONFIG sheet read/write                │
│  SpreadsheetService.gs — DATABASE sheet access              │
│  ChildEligibilityService.gs — Evaluasi kelayakan anak       │
│  TemplateService.gs     — Replace placeholder, isi tabel    │
│  DocumentService.gs     — Orkestrasi generate per pegawai   │
│  DriveService.gs        — Folder, copy, export DOCX         │
│  ExportService.gs       — DOCX export helper                │
│  LogService.gs          — LOG_GENERATE sheet                │
│  Utils.gs              — parseDate, calculateAge, dll       │
└─────┬────────────────┬──────────────────┬───────────────────┘
      │                │                  │
      ▼                ▼                  ▼
┌──────────┐  ┌─────────────────┐  ┌───────────────────────┐
│ Google   │  │  Google Docs    │  │     Google Drive       │
│ Sheets   │  │  Template       │  │                        │
│          │  │  (KP4.docx as  │  │  Tunjangan Keluarga/   │
│ DATABASE │  │   Google Docs) │  │    2026/               │
│ CONFIG   │  │                 │  │      NIP - Nama/       │
│ LOG_GEN  │  └────────┬────────┘  │        *.gdoc          │
└──────────┘           │           │        *.docx          │
                       │           └───────────────────────┘
                       └──────────────────┘
                        (copy → fill → export)
```

## Alur Kerja

```
1. Operator buka Web App (Google Apps Script URL)
2. Dashboard load → baca CONFIG (tanggal proses, tahun)
3. Operator set/verifikasi Tanggal Proses
4. Operator klik "Generate" (satu/semua)

Per pegawai:
  a. Baca data dari DATABASE sheet
  b. Evaluasi kelayakan anak (berdasarkan tanggal proses CONFIG)
  c. Pilih maksimal 2 anak eligible
  d. Salin Google Docs template ke folder pegawai
  e. Replace semua placeholder
  f. Isi tabel pasangan (Table 0)
  g. Isi tabel anak masuk daftar gaji (Table 1)
  h. Isi tabel anak tidak masuk daftar gaji (Table 2)
  i. Save dokumen
  j. Export ke DOCX via Drive API
  k. Tulis log ke LOG_GENERATE
  l. Return URL ke dashboard

5. Dashboard tampilkan status per pegawai
6. Operator dapat buka Google Docs atau download DOCX
```

## Struktur Google Drive Output

```
[Folder Output dari CONFIG] /
  Tunjangan Keluarga /
    2026 /
      197801050020122002 - PANDARIA RILIYANA, S.P., M.M /
        Surat Tunjangan Keluarga - 2026           (Google Docs)
        Surat Tunjangan Keluarga - 2026.docx      (DOCX download)
      199005072014031002 - AZANU RUDIT SEPTIMA, SP /
        Surat Tunjangan Keluarga - 2026
        Surat Tunjangan Keluarga - 2026.docx
      ... (57 pegawai)
    2027 /
      ... (generate tahun berikutnya, data tidak berubah)
```

## Struktur Google Sheets

### Sheet: DATABASE
- Import dari KP4 2026 2.xlsx
- Header tetap (60 kolom A-BH)
- Jangan ubah struktur

### Sheet: CONFIG
| Baris | Kolom A | Kolom B |
|-------|---------|---------|
| 1 | Tanggal Proses | 31/12/2026 |
| 2 | Tahun | 2026 |
| 3 | Template Google Docs ID | [ID Docs template] |
| 4 | Folder Output Google Drive ID | [ID folder Drive] |

### Sheet: LOG_GENERATE
| timestamp | tahun | NIP | nama | status | google_doc_url | docx_url | error_message |

## Komponen Kunci

### parseDate(value)
Menangani semua format tanggal yang mungkin muncul di Google Sheets:
- Date object (native)
- `DD/MM/YYYY` (string)
- `DD-MM-YYYY` (string)
- `YYYY-MM-DD` (ISO string dari Sheets)
- Angka serial Excel
- null/undefined/kosong → return null

### evaluateChildEligibility(child, processDate)
Semua aturan kelayakan terpusat di sini. Untuk mengubah aturan:
cukup modifikasi fungsi ini, tidak perlu mengubah bagian lain.

Return: `{ eligible: boolean, reason: string, age: number, masukDaftarGaji: boolean }`

### selectEligibleChildren(children, processDate, maxCount=2)
- Filter anak yang eligible
- Ambil maximal 2 pertama
- Semua anak tetap ada di database
- Return: `{ selected: [], all: [] }`

### populateChildTables(body, childrenInGaji, childrenNotGaji, ...)
- Isi Table 1 (masuk daftar gaji) dan Table 2 (tidak masuk)
- Pertahankan header rows
- Clear dan isi ulang data rows
- Hapus baris extra jika ada lebih dari 2

## Keamanan
- Tidak ada credential hardcoded
- Template ID dan Folder ID hanya di CONFIG sheet (server-side)
- Client hanya menerima data aman (bukan ID internal)
- Akses Google Drive/Docs via ScriptApp authorization
- Input validasi di sisi server

## Batasan

| Batasan | Nilai | Keterangan |
|---------|-------|------------|
| Eksekusi GAS max | 6 menit | Batch size 10 untuk antisipasi |
| Daily trigger limit | 20 menit | Tidak digunakan (triggered manual) |
| Concurrent users | 1 ideal | GAS tidak thread-safe untuk banyak user |
| Max anak per pegawai | 6 | Sesuai struktur database |
| Max anak terpilih | 2 | Sesuai aturan sistem tunjangan |
