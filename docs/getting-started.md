# Panduan Instalasi & Menjalankan

Dokumen ini menjelaskan cara menyiapkan proyek, menjalankan aplikasi lokal, dan melakukan build production.

## 1. Prasyarat

Pastikan perangkat sudah memiliki:

- Node.js versi 18 atau lebih baru.
- npm yang terpasang bersama Node.js.
- Git untuk clone repository.
- Akun Firebase jika ingin menghubungkan ke backend asli.

## 2. Clone Repository

```bash
git clone <url-repository>
cd MoldProject
```

## 3. Install Dependensi

Jalankan perintah berikut dari folder root proyek:

```bash
npm install
```

Jika folder `node_modules` belum ada, langkah ini wajib dilakukan sebelum menjalankan aplikasi.

## 4. Jalankan Mode Development

```bash
npm run dev
```

Setelah server aktif, buka alamat yang ditampilkan Vite, biasanya:

```text
http://localhost:5173
```

### Screenshot yang Disarankan
- `assets/getting-started-dev-server.png` — halaman awal aplikasi saat server sudah aktif.
- `assets/getting-started-browser.png` — tampilan aplikasi di browser.

## 5. Build Production

Gunakan build production untuk memastikan aplikasi siap dirilis:

```bash
npm run build
```

Jika ingin melihat hasil build secara lokal:

```bash
npm run preview
```

## 6. Konfigurasi Environment

Beberapa konfigurasi Firebase biasanya disimpan di environment variable. Contoh nama variabel yang umum dipakai:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Jika file environment belum tersedia, buat file `.env` di root proyek dan isi sesuai project Firebase yang digunakan.

## 7. Konfigurasi Firebase

Sebelum aplikasi dijalankan penuh, pastikan:

1. Project Firebase sudah dibuat.
2. Authentication sudah diaktifkan.
3. Firestore sudah tersedia.
4. Rules keamanan sudah disesuaikan dengan kebutuhan aplikasi.
5. Jika memakai Cloud Functions, folder `functions/` sudah diinstal dependensinya.

## 8. Troubleshooting Cepat

- Jika muncul error `vite: command not found`, jalankan ulang `npm install`.
- Jika halaman kosong, pastikan file environment Firebase sudah benar.
- Jika bahasa atau theme tidak berubah sesuai pilihan, cek cache browser lalu refresh.

## 9. Checklist Setelah Install

- [ ] `npm install` berhasil.
- [ ] `npm run dev` bisa dibuka di browser.
- [ ] Login page tampil normal.
- [ ] UI mobile dan desktop tampil sesuai breakpoint.
- [ ] `npm run build` berhasil.
