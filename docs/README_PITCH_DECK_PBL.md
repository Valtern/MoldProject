# 🚀 Pitch Deck: MoldGuard — Smart Mold Prevention System

Dokumen ini berisi struktur *Pitch Deck* (slide-by-slide) untuk presentasi proyek PBL MoldGuard. Konten sudah disesuaikan dengan empat mata kuliah yang diintegrasikan: Internet of Things, Pemrograman Berbasis Framework, Cloud Computing, dan Big Data. Silakan salin isi per slide ke PowerPoint, Canva, atau Google Slides.

---

## Slide 1: Cover
**Headline:** MoldGuard
**Sub-headline:** Smart Mold Prevention System Berbasis IoT & Cloud
**Dosen Pembimbing:**
- Yoppy Yunhasnawa, S.ST., M.Sc.
- Agung Nugroho Pramudhita, S.T., M.T.
- Dian Hanifudin Subhi, S.Kom., M.Kom.

**Presenter:** [Nama Kelompok / Anggota]
**Visual:** Logo MoldGuard + mockup Dashboard.

---

## Slide 2: Latar Belakang Masalah
**Headline:** Bahaya Tersembunyi di Balik Kelembapan
**Teks:**
- **Kesehatan & Material:** Jamur merusak struktur bangunan, memicu gangguan pernapasan kronis, dan menurunkan kualitas udara dalam ruangan.
- **Deteksi Terlambat:** Pemantauan kelembapan masih manual. Jamur baru disadari *setelah* muncul secara kasat mata dan sudah merusak.
- **Data Tanpa Makna:** Kalaupun ada sensor, data hanya berupa angka mentah tanpa memberikan status bahaya atau panduan aksi.
- **Biaya Perbaikan Tinggi:** Remediasi jamur pada gedung bisa memakan biaya jutaan rupiah dan memerlukan waktu lama.

---

## Slide 3: Solusi — MoldGuard
**Headline:** Dari Pemantauan Reaktif Menjadi Pencegahan Proaktif
**Teks:**
MoldGuard adalah sistem monitoring lingkungan berbasis IoT yang mengintegrasikan sensor, cloud, dan dashboard web untuk mendeteksi risiko jamur *sebelum* terjadi.
- **Realtime IoT Monitoring:** Sensor memantau suhu, kelembapan, dan cahaya secara kontinu 24/7.
- **Cloud-Powered Risk Analysis:** Data diolah otomatis di cloud menjadi indikator risiko jamur (Safe → Warning → Critical).
- **Predictive Alerts:** Notifikasi proaktif saat kondisi mendekati ambang bahaya, bukan setelah jamur sudah muncul.

---

## Slide 4: Target Pengguna
**Headline:** Siapa yang Membutuhkan MoldGuard?
**Teks:**
- **Pemilik Kos & Kontrakan:** Menjaga kamar tetap layak huni, menghindari keluhan penyewa akibat jamur, bau lembap, dan dinding mengelupas.
- **Pemilik Rumah:** Melindungi keluarga dari risiko alergi, asma, dan kerusakan furnitur atau dinding akibat kelembapan berlebih.
- **Pengelola Fasilitas Sensitif:** Gudang penyimpanan (warehouse), rumah sakit, perpustakaan, laboratorium, dan ruang arsip yang sangat rentan terhadap pertumbuhan jamur.

---

## Slide 5: Integrasi Mata Kuliah PBL
**Headline:** Satu Proyek, Empat Mata Kuliah
**Visual:** Diagram lingkaran/blok empat komponen.
**Teks:**
| Mata Kuliah | Kontribusi pada MoldGuard |
|---|---|
| **Internet of Things** | Akuisisi data dari sensor suhu, kelembapan, cahaya, dan koneksi Wi-Fi perangkat. |
| **Pemrograman Berbasis Framework** | Frontend React + TypeScript + Vite: dashboard responsif, bilingual, dark/light mode. |
| **Cloud Computing** | Firebase Auth, Firestore (realtime DB), dan Cloud Functions (server-side logic & evaluasi risiko). |
| **Big Data** | Penyimpanan histori sensor berkelanjutan, analisis tren, dan penyajian laporan berbasis data. |

---

## Slide 6: Fitur Utama (MVP)
**Headline:** 6 Kebutuhan Fungsional yang Terpenuhi
**Visual:** Screenshot Dashboard / Room Management.
**Teks:**
1. **Autentikasi Pengguna** — Login, signup, forgot password, dan logout aman.
2. **Dashboard Realtime** — Status ruangan, suhu, kelembapan, cahaya, dan gauge risiko jamur dalam satu layar.
3. **Manajemen Ruangan** — Daftar ruangan, pemilihan ruang aktif, edit dan hapus.
4. **Manajemen Perangkat** — Status koneksi (online/offline), sinyal Wi-Fi, dan diagnostik sensor.
5. **Laporan & Alert Prediktif** — Tren data historis (24 jam / 7 hari / 30 hari), notifikasi risiko, dan export CSV.
6. **Pengaturan Sistem** — Ambang batas personal, email notifikasi, bahasa, dan tema.

---

## Slide 7: Alur Kerja Sistem
**Headline:** Dari Sensor ke Keputusan
**Visual:** Sisipkan diagram `workflow-bisnis-utama.png` atau `uml-system-activity.png`.
**Teks:**
1. Sensor IoT membaca suhu, kelembapan, dan cahaya → dikirim ke Firebase.
2. Cloud Functions menerima data, memperbarui heartbeat perangkat, dan mengevaluasi risiko.
3. Hasil evaluasi disimpan di Firestore → dashboard membaca secara realtime.
4. Pengguna melihat status ruangan (Safe/Warning/Critical) dan menerima alert jika ada bahaya.
5. Pengguna mengambil tindakan korektif berdasarkan informasi yang diberikan sistem.

---

## Slide 8: Arsitektur Sistem
**Headline:** Cloud-First & IoT-Driven
**Visual:** Sisipkan diagram `architecture.png` atau `uml-deployment.png`.
**Teks:**
- **IoT Layer:** Sensor terhubung Wi-Fi mengirim data kontinu ke backend.
- **Backend:** Firebase Firestore (database realtime) + Cloud Functions (evaluasi risiko, heartbeat, dan backup).
- **Frontend:** React + Vite (SPA responsif, bilingual, themeable).
- **Autentikasi:** Firebase Authentication mengamankan seluruh akses data per pengguna.

---

## Slide 9: Teknologi yang Digunakan
**Headline:** Stack Modern & Terbukti
**Visual:** Logo teknologi.
**Teks:**
| Komponen | Teknologi |
|---|---|
| Frontend | React, TypeScript, Vite, i18next, Recharts |
| Backend | Firebase Cloud Functions |
| Database | Firebase Firestore (Realtime) |
| Auth | Firebase Authentication |
| IoT | Sensor suhu/kelembapan/cahaya + Wi-Fi |
| Deployment | Firebase Hosting |

---

## Slide 10: Rencana High Availability
**Headline:** Siap untuk Skala Produksi
**Visual:** Sisipkan diagram `uml-ha-architecture.png`.
**Teks:**
- **Redundansi:** Dua zona aplikasi (Active-Active) untuk menghilangkan single point of failure.
- **Failover Otomatis:** Global Load Balancer mengalihkan trafik jika satu zona terganggu.
- **Replikasi Data:** Firestore Multi-Region memastikan data tetap tersedia (RPO ≈ 0).
- **Monitoring:** Alerting otomatis untuk mendeteksi komponen tidak sehat sebelum berdampak ke pengguna.

---

## Slide 11: Hasil & Dampak
**Headline:** Apa yang Sudah Dicapai
**Teks:**
- ✅ Sistem memisahkan halaman per fungsi agar informasi tidak menumpuk.
- ✅ Data realtime dari Firestore langsung tampil tanpa refresh manual.
- ✅ Bilingual UI (Indonesia & English) dan Dark/Light Mode.
- ✅ Threshold personal per ruangan — setiap ruang bisa punya batas berbeda.
- ✅ Laporan dan alert membantu transisi dari *monitoring* ke *decision making*.
- ✅ Backend Cloud Functions menjaga konsistensi data dan evaluasi risiko secara server-side.

---

## Slide 12: Pengembangan ke Depan
**Headline:** Roadmap Selanjutnya
**Teks:**
- Integrasi aktuator otomatis (menyalakan dehumidifier via smart plug saat kelembapan tinggi).
- Machine Learning untuk prediksi risiko berbasis pola cuaca.
- Notifikasi multi-channel (email, Telegram, WhatsApp).
- Skalabilitas infrastruktur untuk ratusan ruangan.

---

## Slide 13: Penutup & Tanya Jawab
**Headline:** Cegah Jamur Sebelum Terlambat.
**Visual:** Logo MoldGuard.
**Teks:**
- **Terima kasih atas perhatiannya.**
- Silakan ajukan pertanyaan.
- [Kontak / GitHub: github.com/Valtern/MoldProject]

---
*(Gunakan gambar dari folder `docs/assets/` untuk melengkapi visual setiap slide: `architecture.png`, `uml-ha-architecture.png`, `uml-use-case.png`, `uml-system-activity.png`, `uml-deployment.png`, dan screenshot halaman aplikasi.)*
