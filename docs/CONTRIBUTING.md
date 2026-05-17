# Contributing Guide

Panduan ini menjelaskan cara berkontribusi ke proyek dengan aman dan konsisten.

## 1. Prinsip Umum

- Satu perubahan harus fokus pada satu tujuan.
- Jangan ubah perilaku desktop jika tugasnya hanya mobile.
- Ikuti struktur komponen dan halaman yang sudah ada.
- Jika ada perubahan UI, sertakan screenshot sebelum dan sesudah.

## 2. Langkah Berkontribusi

1. Pastikan branch kerja sudah benar.
2. Sinkronkan branch dengan branch utama yang disepakati.
3. Buat branch baru jika perubahan cukup besar.
4. Implementasikan perubahan secara bertahap.
5. Jalankan validasi lokal.
6. Perbarui dokumentasi jika perilaku aplikasi berubah.
7. Ajukan pull request dengan ringkasan yang jelas.

## 3. Setup Lokal

```bash
npm install
npm run dev
```

Sebelum submit, jalankan build production:

```bash
npm run build
```

## 4. Standar Kode

- Gunakan TypeScript dengan tipe yang jelas.
- Pertahankan penamaan file dan komponen yang sudah ada.
- Hindari perubahan yang tidak perlu di area lain.
- Untuk komponen reusable, ikuti pola props yang sederhana dan eksplisit.

## 5. Standar UI

- Perubahan mobile harus tetap memelihara desktop.
- Gunakan breakpoint Tailwind untuk memisahkan perilaku.
- Pastikan teks, tombol, dan modal tetap terbaca di layar kecil.
- Jika menambah asset, taruh di folder yang sudah ditentukan di `docs/assets/` atau `public/` sesuai kebutuhan.

## 6. Validasi yang Wajib

Minimal yang perlu dilakukan sebelum submit:

1. Jalankan `npm install` bila dependensi berubah.
2. Jalankan `npm run build`.
3. Cek halaman penting di browser.
4. Cek mobile dan desktop bila UI berubah.
5. Pastikan tidak ada error TypeScript atau lint yang tersisa.

## 7. Checklist Pull Request

- [ ] Tujuan perubahan dijelaskan dengan singkat.
- [ ] Screenshot dilampirkan jika ada perubahan UI.
- [ ] Dokumentasi diperbarui jika perilaku berubah.
- [ ] Build berhasil.
- [ ] Tidak ada file yang berubah di luar scope.

## 8. Git Flow

- Gunakan branch fitur untuk pekerjaan baru.
- Merge hanya setelah validasi selesai.
- Jangan commit file build kecuali memang diperlukan oleh proses rilis.
- Jika branch target sudah ditentukan, ikuti branch tersebut secara konsisten.

## 9. Saat Membuat Dokumentasi Baru

- Tempatkan semua dokumentasi di folder `docs/`.
- Gunakan gaya bahasa yang konsisten.
- Tambahkan langkah-langkah, screenshot, dan diagram seperlunya.
- Perbarui `docs/README.md` jika ada file baru.
# Contributing Guide

Panduan singkat untuk berkontribusi ke proyek ini.

## Alur Kerja
1. Buat branch dari `main` atau branch kerja yang disepakati.
2. Lakukan perubahan secukupnya dan tetap fokus pada satu tujuan.
3. Pastikan aplikasi bisa dijalankan dan dibuild sebelum mengirim perubahan.
4. Buat pull request dengan ringkasan perubahan yang jelas.

## Standar Perubahan
- Jaga perubahan mobile dan desktop tetap terpisah bila memungkinkan.
- Hindari mengubah perilaku yang tidak diminta.
- Ikuti pola komponen dan struktur folder yang sudah ada.
- Gunakan pesan commit yang singkat dan deskriptif.

## Validasi
Sebelum submit, jalankan minimal:
```bash
npm install
npm run build
```

## Dokumentasi
- Jika menambah fitur atau mengubah perilaku, perbarui dokumentasi terkait.
- Untuk perubahan UI, tambahkan catatan screenshot atau langkah verifikasi.

## Catatan
- Jika perubahan menyentuh Firebase atau rules, lakukan review ekstra pada keamanan dan akses data.
