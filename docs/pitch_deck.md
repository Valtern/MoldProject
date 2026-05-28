<!-- Pitch Deck untuk MoldGuard (PBL) - disimpan di docs/ -->

# MoldGuard — Pitch Deck (Ringkas)

---

## Slide 1 — Perkenalan Singkat Tim & Latar PBL
- Judul: MoldGuard — Dashboard IoT Pemantauan Kelembapan Ruangan
- Tim: Tim PBL (Frontend, Integrasi Firebase, QA)
- Latar: Proyek berbasis Problem-Based Learning untuk solusi deteksi jamur dan pemantauan kelembapan secara real-time

**Catatan Presenter:** Perkenalkan diri singkat (nama, peran), jelaskan tujuan PBL dan motivasi proyek.

---

## Slide 2 — Contoh Kasus Nyata: Ruang Arsip Terkontaminasi
- Kasus: Arsip dokumen penting mengalami pertumbuhan jamur karena kelembapan tinggi
- Dampak: Kerusakan aset, biaya restorasi, risiko kesehatan pekerja
- Kesulitan: Deteksi telat, kontrol lingkungan tidak terautomasi

**Catatan Presenter:** Ceritakan skenario singkat (who, what, when) untuk menggugah kebutuhan solusi.

---

## Slide 3 — Bagaimana Data IoT Mencegah Insiden
- Sensor mengirim data suhu & kelembapan secara berkala ke cloud
- Dashboard menampilkan grafik waktu nyata dan tren historis
- Alert dini: notifikasi ketika ambang kelembapan terlampaui
- Tindakan: maintenance/pengaturan ventilasi sebelum jamur berkembang

**Catatan Presenter:** Jelaskan alur data dari sensor → Firebase → dashboard → aksi operasional.

---

## Slide 4 — Fitur Singkat (opsional)
- Live dashboard per device
- Manajemen ruangan & perangkat
- Grafik historis (Recharts)
- Notifikasi terkonfigurasi

---

## Slide 5 — Tampilan UI: Sorot Waktu Update dan Chart
- Highlight: `StatusBanner` menampilkan "updated at DD/MM/YYYY HH:MM"
- Chart: visualisasi kelembapan per waktu (interaktif, zoom pada rentang)
- Mobile & Desktop: desain responsif; sidebar navigasi yang disederhanakan

**Catatan Presenter:** Tunjukkan screenshot dashboard, arahkan pointer ke label waktu dan chart interaktif.

---

## Slide 6 — Teknologi & Arsitektur (singkat)
- Frontend: React + TypeScript + Vite + Tailwind
- Backend/BaaS: Firebase (Auth, Firestore)
- Visual: Recharts, Radix UI, lucide-react
- CI/CD: GitHub Actions (lint & build otomatis)

---

## Slide 7 — Target Pasar
- Sekolah, museum, arsip, gudang penyimpanan, kantor kecil
- Pengelola fasilitas yang butuh monitoring biaya-efektif

---

## Slide 8 — Model Bisnis (Tekankan Subscription & B2B)
- Model: Langganan bulanan/tahunan per lokasi atau per device
- Tier: Freemium (basic monitoring) → Pro (historis & alert lanjutan) → Enterprise (SLA & integrasi)
- Potensi B2B: kontrak dengan fasilitas penyimpanan, jasa restorasi, institusi pendidikan

**Catatan Presenter:** Tekankan recurring revenue dan skala B2B via pilot & integrasi sistem eksisting.

---

## Slide 9 — Roadmap Singkat
- Short term: onboarding device & stabilisasi mobile UX
- Mid term: scheduled reports, integrasi gateway industri
- Long term: white-label & enterprise hosting

---

## Slide 10 — Bukti Teknis & Status
- Repo aktif (MoldProject) — dev server demo tersedia
- CI lulus (lint & build) — kesiapan teknis untuk pilot
- Catatan: beberapa fitur masih PBL-prototype, siap untuk pilot

---

## Slide 11 — Tim & Kontak
- Nama tim / kontributor utama
- Kontak: email, link GitHub repo, link demo lokal/hosted

---

## Slide 12 — Call To Action (CTA): Pilot & Demo
- Ajakan: Cari 3 pilot customers untuk uji lapangan (1–3 bulan)
- Tawaran demo 20 menit + dukungan setup awal perangkat (opsional berbayar)
- Langkah selanjutnya: jadwalkan demo → kirim perangkat sample → lakukan integrasi pilot

**Catatan Presenter:** Tutup dengan permintaan konkret: pilot, sponsor, atau waktu demo.

---

## Lampiran / Aset yang Disarankan
- Screenshot dashboard (desktop + mobile)
- Video walkthrough 30–60 detik
- One-pager PDF ringkasan value prop + harga
- Badge CI / screenshot build green

---

_File ini disimpan di docs/pitch_deck.md. Jika Anda ingin, saya bisa men-generate PPTX atau Google Slides dari konten ini._
