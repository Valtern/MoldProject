# Manual Pengguna MoldGuard (Desktop & Mobile)

Manual ini ditujukan untuk pengguna akhir yang ingin memakai web MoldGuard yang sudah di-host pada [https://moldymoldbase.web.app/](https://moldymoldbase.web.app/). Dokumen ini mencakup panduan lengkap untuk versi **Desktop** (Bagian A) dan **Mobile** (Bagian B).

MoldGuard adalah web monitoring untuk membantu memantau risiko jamur pada ruangan. Setelah login, pengguna dapat melihat dashboard, memeriksa sensor, memantau perangkat, membaca analytics, membuka halaman About Us, menyesuaikan settings, lalu logout dengan aman.

---
---

# Bagian A: Panduan Versi Desktop

---

## A1. Cara Membuka Web

1. Buka browser di laptop atau desktop.
2. Akses [https://moldymoldbase.web.app/](https://moldymoldbase.web.app/).
3. Tunggu halaman login tampil.
4. Masukkan email dan password yang diberikan oleh admin.
5. Klik **Sign in** untuk masuk ke dashboard.

Catatan:
- Web ini tidak perlu di-install.
- Web ini tidak perlu dijalankan secara lokal oleh customer.
- Pastikan koneksi internet aktif karena data dibaca dari cloud.

### Screenshot yang Disarankan
- `assets/user-manual-login.png` — halaman login.
- `assets/user-manual-login-error.png` — pesan gagal login.

## A2. Fitur Login, Create Account, dan Forgot Password

### Login
1. Isi email pada kolom **Email**.
2. Isi password pada kolom **Password**.
3. Klik **Sign in**.
4. Jika data benar, Anda akan masuk ke dashboard.

### Create Account
1. Pada halaman login, klik **Create account**.
2. Isi data yang diminta pada formulir pendaftaran.
3. Ikuti petunjuk berikutnya sampai akun berhasil dibuat.

### Forgot Password
1. Pada halaman login, klik **Forgot password?**.
2. Masukkan email yang terdaftar.
3. Ikuti instruksi pemulihan password yang dikirim ke email.

### Screenshot yang Disarankan
- `assets/user-manual-create-account.png` — halaman pendaftaran.
- `assets/user-manual-forgot-password.png` — halaman lupa password.

## A3. Tampilan Utama Setelah Login (Desktop)

Setelah login, web akan menampilkan sidebar di kiri dan area konten utama di kanan. Menu yang tersedia pada versi web ini adalah **Dashboard**, **Sensors**, **Device**, **Analytics**, **About Us**, dan **Settings**.

### Cara Membaca Tampilan
1. Sidebar kiri dipakai untuk berpindah halaman.
2. Area tengah menampilkan isi halaman yang sedang dibuka.
3. Bagian bawah sidebar menampilkan akun pengguna dan tombol logout.
4. Tombol bahasa berada di bagian atas untuk mengganti bahasa web.

### Screenshot yang Disarankan
- `assets/user-manual-desktop-dashboard.png` — tampilan utama desktop.

## A4. Menggunakan Dashboard (Desktop)

Dashboard adalah halaman ringkasan utama untuk melihat kondisi ruangan secara cepat.

### Langkah-langkah
1. Setelah login, pastikan Anda berada di halaman **Dashboard**.
2. Lihat kartu suhu, kelembapan, cahaya, dan risiko jamur.
3. Periksa status ruangan yang muncul di bagian atas.
4. Gunakan halaman ini sebagai ringkasan cepat sebelum membuka menu lain.

### Yang Perlu Diperhatikan
- Dashboard membantu customer memahami kondisi saat ini tanpa harus membaca data mentah.
- Jika ada perubahan kondisi, biasanya terlihat pada kartu nilai dan status risiko.

### Screenshot yang Disarankan
- `assets/user-manual-dashboard.png` — dashboard utama.

## A5. Menggunakan Sensors (Desktop)

Halaman **Sensors** dipakai untuk memantau sensor yang terhubung ke sistem.

### Langkah-langkah
1. Klik menu **Sensors** pada sidebar.
2. Lihat daftar sensor node yang tersedia.
3. Periksa suhu, kelembapan, dan status masing-masing sensor.
4. Jika ada sensor dengan status warning atau offline, cek kembali kondisi perangkat di lapangan.

### Di Desktop
- Sensor ditampilkan dalam bentuk kartu yang mudah dibaca.
- Pengguna bisa membandingkan beberapa sensor sekaligus.

### Screenshot yang Disarankan
- `assets/user-manual-sensors-desktop.png` — halaman Sensors.

## A6. Menggunakan Device (Desktop)

Halaman **Device** dipakai untuk melihat perangkat yang sudah terhubung dan memeriksa statusnya.

### Langkah-langkah
1. Klik menu **Device**.
2. Lihat daftar device yang terdaftar.
3. Periksa device ID, nama ruangan, Wi-Fi signal, dan status online/offline.
4. Gunakan halaman ini untuk memastikan perangkat masih aktif.

### Fitur Edit dan Hapus
1. Jika tombol **edit** tersedia, klik untuk memperbarui nama ruangan atau device ID.
2. Jika tombol **hapus** tersedia, klik untuk menghapus device atau room yang tidak digunakan lagi.
3. Konfirmasi tindakan agar data tidak terhapus secara tidak sengaja.

### Screenshot yang Disarankan
- `assets/user-manual-device.png` — halaman Device.
- `assets/user-manual-device-edit.png` — aksi edit jika tersedia.
- `assets/user-manual-device-delete.png` — aksi hapus jika tersedia.

## A7. Menggunakan Analytics (Desktop)

Halaman **Analytics** dipakai untuk membaca laporan risiko dan tren data.

### Langkah-langkah
1. Klik menu **Analytics**.
2. Lihat daftar predictive alerts di sisi kiri.
3. Periksa grafik tren dan stream data di sisi kanan.
4. Gunakan filter waktu jika tersedia, misalnya 24H, 7D, atau 30D.
5. Jika ada alert penting, baca detail risiko sebelum menutupnya.

### Fungsi Halaman Ini
- Membantu customer melihat pola data, bukan hanya nilai saat ini.
- Berguna untuk evaluasi kondisi ruangan dan tindak lanjut.

### Screenshot yang Disarankan
- `assets/user-manual-analytics.png` — halaman Analytics.

## A8. Menggunakan About Us (Desktop)

Halaman **About Us** menjelaskan informasi produk, teknologi, tim pengembang, dosen pembimbing, dan institusi.

### Langkah-langkah
1. Klik menu **About Us**.
2. Baca ringkasan proyek dan penjelasan sistem.
3. Lihat bagian technology highlights untuk memahami fitur utama produk.
4. Baca bagian development team dan supervising lecturers jika diperlukan.

### Screenshot yang Disarankan
- `assets/user-manual-about-us.png` — halaman About Us.

## A9. Menggunakan Settings (Desktop)

Halaman **Settings** dipakai untuk mengubah pengaturan sistem sesuai kebutuhan customer.

### Langkah-langkah
1. Klik menu **Settings**.
2. Ubah threshold jika akun Anda punya akses untuk itu.
3. Atur email notifikasi jika fitur tersebut digunakan.
4. Pilih mode tampilan seperti Light, Dark, atau System.
5. Aktifkan atau nonaktifkan ripple effect jika diperlukan.
6. Klik **Save Changes** untuk menyimpan pengaturan.

### Yang Perlu Diperhatikan
- Pengaturan akan mengikuti akun pengguna.
- Jika tidak disimpan, perubahan tidak akan aktif.

### Screenshot yang Disarankan
- `assets/user-manual-settings.png` — halaman Settings.

## A10. Ganti Bahasa dan Theme (Desktop)

### Ganti Bahasa
1. Cari tombol bahasa di bagian atas web.
2. Klik untuk memilih bahasa yang tersedia, misalnya `ID` atau `EN`.
3. Tunggu seluruh teks berubah sesuai pilihan.

### Ganti Theme
1. Klik ikon theme di pojok kanan atas.
2. Pilih tampilan terang, gelap, atau system.
3. Web akan menyesuaikan tampilan sesuai pilihan Anda.

### Screenshot yang Disarankan
- `assets/user-manual-language-switcher.png` — tombol bahasa.
- `assets/user-manual-theme-light.png` — mode terang.
- `assets/user-manual-theme-dark.png` — mode gelap.

## A11. Logout (Desktop)

### Langkah-langkah
1. Lihat bagian bawah sidebar atau menu akun.
2. Klik tombol logout.
3. Konfirmasi jika muncul dialog peringatan.
4. Setelah logout, Anda akan kembali ke halaman login.

### Penting
- Logout jika selesai memakai web, terutama pada perangkat bersama.
- Jangan membiarkan akun tetap terbuka di browser umum.

### Screenshot yang Disarankan
- `assets/user-manual-logout-confirm.png` — dialog logout.

## A12. Alur Cepat Pemakaian Desktop

1. Buka web pada browser.
2. Login / Membuat akun.
3. Cek Dashboard untuk ringkasan kondisi.
4. Buka Sensors atau Device untuk melihat detail perangkat.
5. Buka Analytics jika ingin membaca laporan dan tren.
6. Buka Settings jika perlu mengubah preferensi.
7. Logout setelah selesai.

## A13. Troubleshooting Desktop

- Jika halaman tidak terbuka, cek koneksi internet lalu refresh browser.
- Jika login gagal, periksa email dan password.
- Jika bahasa tidak berubah, klik pilihan bahasa sekali lagi.
- Jika data tidak muncul, tunggu sebentar karena web membaca data realtime dari cloud.
- Jika tombol edit atau hapus tidak muncul, kemungkinan akun Anda tidak punya hak akses untuk aksi tersebut.

---
---

# Bagian B: Panduan Versi Mobile

---

## B1. Perbedaan Tampilan Desktop dan Mobile

| Aspek | Desktop | Mobile |
|---|---|---|
| Navigasi utama | Sidebar di sisi kiri | Bottom navigation bar (tab bawah) |
| Menu profil | Sidebar bawah (email + tombol logout) | Tombol profil di pojok kanan atas (dropdown) |
| About Us & Settings | Menu sidebar | Tersembunyi di dalam dropdown profil (pojok kanan atas) |
| Layout konten | Multi-kolom (kartu bersebelahan) | Satu kolom (kartu bertumpuk vertikal) |
| Tombol bahasa | Sidebar atas | Pojok kiri atas di samping logo |

## B2. Cara Membuka di Mobile

1. Buka browser di smartphone (Chrome, Safari, atau browser lain).
2. Ketik atau tempel alamat **https://moldymoldbase.web.app/** pada address bar.
3. Tunggu halaman login tampil.
4. Masukkan email dan password.
5. Ketuk tombol **Sign in**.

Tips:
- Tambahkan halaman ke home screen agar mudah diakses seperti aplikasi native.
- Pastikan koneksi internet stabil karena seluruh data dibaca dari cloud secara realtime.

## B3. Login, Create Account, dan Forgot Password (Mobile)

### Login
1. Isi kolom **Email** dengan email yang terdaftar.
2. Isi kolom **Password**.
3. Ketuk **Sign in**.
4. Jika berhasil, Anda akan masuk ke halaman Dashboard.

### Create Account
1. Pada halaman login, ketuk **Create account**.
2. Isi formulir pendaftaran (nama, email, password).
3. Ikuti petunjuk sampai akun berhasil dibuat.
4. Login menggunakan akun yang baru dibuat.

### Forgot Password
1. Pada halaman login, ketuk **Forgot password?**
2. Masukkan email yang terdaftar.
3. Periksa inbox email untuk instruksi reset password.

## B4. Navigasi Utama di Mobile

Setelah login, navigasi utama tampil sebagai **bottom navigation bar** di bagian bawah layar. Tab yang tersedia:

| Ikon | Nama Tab | Fungsi |
|---|---|---|
| 🏠 | **Dashboard** | Ringkasan kondisi ruangan secara realtime |
| 📡 | **Sensors** | Daftar sensor node dan pembacaan data |
| ⚡ | **Device** | Status koneksi perangkat IoT |
| 📊 | **Analytics** | Laporan risiko, tren data, dan alert prediktif |

### Menu Profil (Pojok Kanan Atas)
Ketuk **ikon angka/nama pengguna** di pojok kanan atas untuk membuka dropdown yang berisi:
- **Nama pengguna dan email** (informasi akun yang sedang login)
- **About Us** — informasi proyek, tim, dan teknologi
- **Settings** — pengaturan threshold, notifikasi, tampilan
- **Log out** — keluar dari akun

## B5. Menggunakan Dashboard (Mobile)

Dashboard adalah halaman utama yang langsung tampil setelah login. Pada tampilan mobile, seluruh konten disusun dalam satu kolom vertikal.

### Komponen yang Tampil (dari atas ke bawah)
1. **Header ruangan** — Menampilkan nama ruangan aktif dan status (contoh: "lkj3test1 — Warning"). Warna status menandakan tingkat bahaya.
2. **Kartu sensor** — Tiga kartu menampilkan:
   - **Temperature** (suhu dalam °C, status: Comfortable/Hot/Cold)
   - **Humidity** (kelembapan dalam %, status: Humid/Dry/Normal)
   - **Light Level** (intensitas cahaya dalam lux, status: Bright/Dim/Dark)
3. **Gauge risiko jamur** — Dua gauge melingkar:
   - **General Mold Risk** (persentase risiko jamur umum)
   - **Black Mold Risk** (persentase risiko black mold / Stachybotrys)
   - Masing-masing menampilkan status: Low Risk, Medium Risk, atau High Risk.
4. **Humidity History** — Grafik riwayat kelembapan (default: 24 jam terakhir) dengan garis batas aman (Safe 40-60%).
5. **Appliance Control** — Kontrol perangkat:
   - Pilih mode **Auto** atau **Manual**.
   - Toggle **Exhaust Fan** (On/Off).
   - Toggle **Dehumidifier** (On/Off).
   - Bagian **Trigger Thresholds** (dapat dibuka/tutup dengan tap).
   - Catatan: override dikirim ke ESP32 pada siklus push data berikutnya.

### Cara Membaca Status Ruangan
- **Safe / Low Risk** (hijau): Kondisi aman, tidak perlu tindakan.
- **Warning / Medium Risk** (kuning/oranye): Kondisi mulai berisiko, pantau lebih sering.
- **Critical / High Risk** (merah): Kondisi bahaya, segera ambil tindakan (ventilasi, dehumidifier, cek perangkat).

## B6. Menggunakan Sensors (Mobile)

1. Ketuk tab **Sensors** pada bottom navigation bar.
2. Lihat daftar sensor node yang terhubung ke akun Anda.
3. Periksa pembacaan suhu, kelembapan, dan cahaya dari masing-masing node.
4. Perhatikan status setiap sensor (aktif, warning, atau offline).

Pada tampilan mobile, kartu sensor ditampilkan bertumpuk vertikal sehingga mudah di-scroll.

## B7. Menggunakan Device (Mobile)

1. Ketuk tab **Device** pada bottom navigation bar.
2. Lihat daftar perangkat IoT yang terdaftar.
3. Periksa informasi berikut pada setiap kartu perangkat:
   - **Device ID** — identitas unik perangkat.
   - **Nama ruangan** — ruangan yang terhubung ke perangkat.
   - **Wi-Fi Signal** — kekuatan sinyal koneksi.
   - **Status** — Online atau Offline.
4. Jika tersedia, ketuk tombol **Edit** untuk mengubah nama ruangan atau device ID.
5. Jika tersedia, ketuk tombol **Delete** untuk menghapus perangkat/ruangan yang tidak lagi digunakan.

## B8. Menggunakan Analytics (Mobile)

1. Ketuk tab **Analytics** pada bottom navigation bar.
2. Lihat daftar **Predictive Alerts** yang berisi peringatan risiko.
3. Periksa grafik **Trend Data** untuk melihat pola kelembapan dan suhu.
4. Gunakan filter waktu jika tersedia:
   - **24H** — data 24 jam terakhir.
   - **7D** — data 7 hari terakhir.
   - **30D** — data 30 hari terakhir.
5. Ketuk tombol **Export CSV** untuk mengunduh data ke file CSV (berguna untuk analisis lanjutan atau audit).
6. Alert yang sudah dibaca dapat dihapus agar daftar tetap bersih.

## B9. Mengakses About Us (Mobile)

1. Ketuk **ikon profil** (angka/nama) di pojok kanan atas layar.
2. Pada dropdown, ketuk **About Us**.
3. Halaman ini menampilkan:
   - Ringkasan proyek MoldGuard.
   - Penjelasan singkat tentang fitur dan pendekatan sistem.
   - **Technology Highlights** — IoT Sensor Network, AI-Powered Prevention, Proactive Control, dan Cloud for real-time access.
   - **Development Team** (Grup 2) — daftar anggota tim beserta perannya.
   - **Supervising Lecturers** — dosen pembimbing.
   - **Institution** — Program Studi dan Politeknik.

## B10. Mengakses Settings (Mobile)

1. Ketuk **ikon profil** di pojok kanan atas.
2. Ketuk **Settings** pada dropdown.
3. Halaman Data Management akan terbuka berisi:

### Threshold Configuration
- **General Mold Thresholds:**
  - Safe Limit (% RH) — kelembapan di bawah nilai ini dianggap aman.
  - Critical Limit (% RH) — kelembapan di atas nilai ini memicu alert kritis.
- **Toxic Black Mold Thresholds:**
  - Safe Limit (% RH) — batas aman untuk risiko black mold.
  - Critical Limit (% RH) — batas kritis (maksimum yang dapat dikonfigurasi: 90% RH).
  - Catatan: 90% RH adalah batas biologis untuk pertumbuhan *Stachybotrys chartarum*. Sistem tidak mengizinkan pengaturan di atas nilai ini.

### Enable Email Alerts
- Toggle untuk mengaktifkan/menonaktifkan notifikasi email otomatis.

### Notification Preferences
- Pilih level notifikasi yang ingin diterima:
  - **Low Risk** — menerima semua email.
  - **Medium Risk** — hanya risiko sedang ke atas.
  - **High Risk** — hanya risiko tinggi.
- Anda dapat memilih satu, beberapa, atau semua level.

### Appearance
- **Light** — tampilan terang.
- **Dark** — tampilan gelap.
- **System** — mengikuti pengaturan perangkat.

### Click Ripple Effect
- Toggle untuk menampilkan atau menyembunyikan animasi gelombang saat mengetuk elemen.

### Menyimpan Pengaturan
- Setelah selesai mengubah pengaturan, **wajib** ketuk tombol **Save Changes** (hijau, di pojok kanan bawah).
- Jika tidak disimpan, perubahan tidak akan berlaku.

## B11. Ganti Bahasa (Mobile)

1. Ketuk tombol bahasa di pojok kiri atas (di samping logo MoldGuard), biasanya bertuliskan **EN** atau **ID**.
2. Pilih bahasa yang diinginkan.
3. Seluruh teks antarmuka akan berubah sesuai pilihan (Bahasa Indonesia atau English).

## B12. Logout (Mobile)

1. Ketuk **ikon profil** di pojok kanan atas.
2. Ketuk **Log out** (berwarna hijau) pada dropdown.
3. Akan muncul dialog konfirmasi **"Log out?"** dengan tombol:
   - **No** — membatalkan logout.
   - **Yes** — mengonfirmasi logout.
4. Setelah mengonfirmasi, Anda akan kembali ke halaman login.

Penting:
- Selalu logout jika menggunakan perangkat bersama.
- Jangan biarkan akun tetap terbuka di browser umum.

## B13. Alur Cepat Pemakaian Mobile

1. Buka **https://moldymoldbase.web.app/** di browser mobile.
2. **Login** menggunakan email dan password.
3. Cek **Dashboard** — lihat suhu, kelembapan, cahaya, dan status risiko jamur.
4. Buka **Sensors** — periksa status node sensor.
5. Buka **Device** — pastikan perangkat IoT masih online.
6. Buka **Analytics** — baca alert prediktif dan tren data.
7. Buka **Settings** (via dropdown profil) — sesuaikan threshold jika diperlukan.
8. **Logout** setelah selesai.

## B14. Troubleshooting Mobile

| Masalah | Solusi |
|---|---|
| Halaman tidak terbuka | Periksa koneksi internet, coba refresh browser. |
| Login gagal | Pastikan email dan password benar. Coba reset password jika lupa. |
| Data tidak muncul | Tunggu beberapa detik karena data dibaca realtime dari cloud. Coba refresh. |
| Bahasa tidak berubah | Ketuk pilihan bahasa sekali lagi. Pastikan halaman sudah selesai loading. |
| Appliance toggle tidak merespons | Pastikan mode **Manual** aktif. Override baru berlaku saat ESP32 melakukan push berikutnya. |
| Settings tidak tersimpan | Pastikan Anda sudah mengetuk **Save Changes** sebelum meninggalkan halaman. |
| Tampilan terlalu kecil | Pastikan zoom browser di 100%. Coba rotasi ke landscape jika diperlukan. |

## B15. Tips Penggunaan Mobile

- **Bookmark** halaman agar mudah dibuka kembali.
- **Add to Home Screen** melalui menu browser agar MoldGuard bisa diakses seperti aplikasi native.
- Gunakan **mode gelap (Dark)** di malam hari untuk kenyamanan mata.
- Periksa dashboard setidaknya **sekali sehari** agar kondisi ruangan selalu terpantau.
- Aktifkan **email alert** agar mendapat notifikasi otomatis tanpa harus membuka aplikasi.
