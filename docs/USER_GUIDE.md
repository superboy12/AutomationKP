# USER_GUIDE.md — Panduan Penggunaan Harian

## Mengakses Sistem

Buka URL Web App yang diberikan admin (contoh):
```
https://script.google.com/macros/s/[DEPLOYMENT_ID]/exec
```

---

## Tampilan Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│ 🌳  Sistem Tunjangan Keluarga                          2026  │
│     Dinas Kehutanan Provinsi Lampung                         │
├──────────────────────────────────────────────────────────────┤
│ ⚙ Konfigurasi Proses                                        │
│   Tanggal Proses: [2026-12-31]    Tahun Aktif: [2026]  🔄   │
├──────────────────────────────────────────────────────────────┤
│ 📊 Statistik Generate                                        │
│  [57] Total    [45] Berhasil    [2] Error    [10] Belum/Skip │
├──────────────────────────────────────────────────────────────┤
│ 🔍 Cari NIP atau Nama...              [⚡ Generate Semua]    │
├──────────────────────────────────────────────────────────────┤
│ No │ NIP              │ Nama           │ ... │ Status │ Aksi │
│ 1  │ 19780105...2002  │ PANDARIA RI... │ ... │ ✓ Selesai     │
│ 2  │ 19721008...1004  │ AZANU RUDIT...│ ... │ ✓ Selesai     │
│ 3  │ 19850306...3013  │ DENDI SUTHA...│ ... │ — Belum       │
└──────────────────────────────────────────────────────────────┘
```

---

## Cara Generate Satu Pegawai

1. Cari pegawai di tabel (gunakan search jika perlu)
2. Klik tombol **⚡ Generate** di kolom Aksi
3. Muncul dialog pilihan mode:

   | Mode | Penjelasan |
   |------|-----------|
   | **↷ Skip jika sudah ada** | Tidak buat ulang jika dokumen sudah ada (Default) |
   | **↺ Replace dokumen lama** | Hapus dokumen lama, buat yang baru |
   | **⟳ Generate semua (paksa)** | Paksa generate ulang |

4. Klik **⚡ Konfirmasi**
5. Tunggu proses (biasanya 10-30 detik per pegawai)
6. Status berubah menjadi **✓ Selesai**

---

## Cara Generate Semua Pegawai

1. Klik tombol **⚡ Generate Semua** (pojok kanan atas tabel)
2. Pilih mode generate
3. Klik **⚡ Konfirmasi**
4. Progress bar akan tampil:
   ```
   Memproses...                          20 / 57 (35%)
   ████████████░░░░░░░░░░░░░░░░░░░░░░░░
   ```
5. Log proses akan muncul di bawah progress bar:
   ```
   [09:15:32] Mulai generate 57 pegawai (mode: skip)...
   [09:15:33] Proses batch 1-10 dari 57...
   [09:15:45] OK: 19780105200212 2002
   [09:15:45] OK: 19721008200...
   ```
6. Setelah selesai, notifikasi muncul:
   ```
   ✓ Selesai! ✓ 55 berhasil, ✗ 0 error, ↷ 2 skip.
   ```

---

## Cara Akses Dokumen

Setelah generate berhasil:

| Tombol | Fungsi |
|--------|--------|
| **📄 Docs** | Buka Google Docs di tab baru |
| **⬇ DOCX** | Download file DOCX langsung |

---

## Cara Mencari Pegawai

Ketik di kotak pencarian:
- **Nama**: `AZANU` → menampilkan semua yang namanya mengandung "AZANU"
- **NIP**: `199005` → menampilkan semua NIP yang mengandung angka tersebut

Pencarian bersifat real-time (tidak perlu tekan Enter).

---

## Cara Update Tanggal Proses

1. Klik input **Tanggal Proses** di atas
2. Pilih tanggal baru (misalnya 31/12/2027)
3. Sistem otomatis:
   - Update CONFIG sheet
   - Update Tahun Aktif → 2027
   - Reload dashboard
4. Generate berikutnya menggunakan tahun 2027
5. **Umur anak dihitung ulang** berdasarkan tanggal baru

---

## Arti Status Dokumen

| Status | Arti |
|--------|------|
| **✓ Selesai** | Dokumen berhasil digenerate dan DOCX tersedia |
| **✗ Error** | Terjadi kesalahan (lihat LOG_GENERATE sheet) |
| **↷ Skipped** | Dokumen sudah ada, tidak digenerate ulang |
| **— Belum** | Belum pernah di-generate |

---

## Cek Log Error

Jika ada error:
1. Buka Google Sheets
2. Klik sheet **LOG_GENERATE**
3. Filter kolom `status` = `ERROR`
4. Lihat kolom `error_message` untuk detail

---

## FAQ

**Q: Apakah data tanggal lahir berubah jika saya ganti tahun proses?**
A: Tidak. Data tanggal lahir di DATABASE tidak pernah berubah. Umur dihitung otomatis saat generate berdasarkan CONFIG.

**Q: Anak saya ada 4, tapi dokumen hanya menampilkan 2?**
A: Sistem membatasi maksimal 2 anak yang eligible sebagai tanggungan. Semua data anak tetap tersimpan di DATABASE.

**Q: Dokumen tahun 2026 saya terhapus setelah generate 2027?**
A: Tidak. Dokumen 2026 tersimpan di folder `Tunjangan Keluarga/2026/`. Dokumen 2027 tersimpan terpisah di folder `Tunjangan Keluarga/2027/`.

**Q: Bisa tidak generate ulang satu pegawai saja tanpa menghapus yang lain?**
A: Bisa. Gunakan tombol **⚡ Generate** di baris pegawai tersebut, pilih mode **Replace dokumen lama**.

**Q: Apakah format dokumen berubah?**
A: Tidak. Sistem menggunakan template KP4.docx yang sudah dikonversi ke Google Docs. Hanya data dinamis yang diisi.
