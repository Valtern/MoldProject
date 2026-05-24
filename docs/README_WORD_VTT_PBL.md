# README Word - Argumen VTT untuk PBL (Versi Final)

## Judul
Pembuktian Kelayakan Model VTT untuk Evaluasi Risiko Jamur pada Berbagai Kondisi Bangunan (PBL)

## Ringkasan Eksekutif
Berdasarkan Vereecken & Roels (2012), model VTT (terutama updated VTT) layak digunakan sebagai alat evaluasi risiko jamur lintas material bangunan untuk kebutuhan PBL, dengan catatan batasan validitas dan kebutuhan verifikasi lapangan.

## Tujuan
1. Menyediakan dasar ilmiah bahwa VTT dapat dipakai lintas konteks bangunan.
2. Memberi panduan implementasi dan interpretasi hasil untuk tugas PBL.
3. Menyertakan bukti rujukan halaman+line ke sumber utama.

## Klaim Utama dan Rujukan Singkat
- VTT termasuk model prediksi jamur yang relevan: [docs/vereecken2012.pdf] P001 L019
- VTT memperhitungkan suhu, RH, permukaan, exposure time: P004 L024-P004 L025
- Updated VTT meluas ke material lain dan memiliki 4 kelas sensitivitas: P005 L038-P005 L040; P005 L057-P005 L059
- Keterbatasan validasi dan kebutuhan pengukuran tambahan: P014 L032-P014 L036

## Metodologi (siap tempel ke Word)
1. Ekstraksi bukti dari PDF: lihat `docs/vereecken2012_extracted_with_lines.txt`.
2. Sintesis klaim kuat vs klaim bersyarat berdasarkan kutipan langsung.
3. Pemetaan material proyek ke sensitivity class.
4. Jalankan updated VTT untuk skenario nyata dan validasi lapangan.

## Struktur Dokumen Word
1. Pendahuluan
2. Dasar Teori Prediksi Jamur
3. Model VTT & Updated VTT
4. Bukti Kelayakan (dengan kutipan halaman-line)
5. Use Case & Analisis (contoh terlampir)
6. Batasan & Rekomendasi
7. Kesimpulan
8. Lampiran: Bukti Halaman-Line

## Use Case (Ringkasan)
- Use Case 1 — Low-cost dwellings, Pasar Kliwon, Surakarta (Murtyas et al., 2023): pengukuran T/RH interval 10–60 menit, fokus pada dinding plywood dan elemen kayu yang lebih sensitif.
- Use Case 2 — Island residential buildings (Zhang et al., 2020): konteks bangunan pulau dengan strategi HVAC, dehumidification, dan pemilihan material untuk menekan risiko jamur.

## Lampiran Bukti
- File ekstraksi: `docs/vereecken2012_extracted_with_lines.txt` (format Pxxx Lyyy)
- Daftar cepat referensi halaman-line ada di `docs/README_PDF_VTT_REFERENSI.md`.

---
File ini siap di-copy ke dokumen Word; terminologi dan rujukan sudah disertakan untuk tiap klaim utama.
# README Word - Argumen VTT untuk PBL (Versi Diperjelas)

## 1. Judul Dokumen Word
Pembuktian Kelayakan Model VTT untuk Evaluasi Risiko Jamur pada Berbagai Kondisi Bangunan (PBL)

## 2. Ringkasan Eksekutif
Dokumen ini menyimpulkan bahwa model VTT layak digunakan untuk PBL pada beragam konteks bangunan, terutama jika menggunakan updated VTT. Alasannya adalah model ini memasukkan faktor fisik utama pertumbuhan jamur, sudah diperluas ke beberapa material bangunan, dan menyediakan sensitivity class untuk pemetaan material. Penjelasan pada dokumen ini sengaja memakai 3 PDF: paper utama VTT sebagai dasar teori, satu paper konteks Indonesia, dan satu paper konteks iklim lembap/AC sebagai penguat penerapan.

Meski begitu, klaim akademik harus ditulis hati-hati: paper tidak membuktikan akurasi absolut untuk semua kondisi bangunan tanpa batas. Karena itu, hasil VTT harus dipakai sebagai evaluasi risiko yang tetap membutuhkan validasi lapangan.

## 3. Tujuan Dokumen
Dokumen ini disusun untuk:
1. Menyediakan dasar ilmiah bahwa VTT dapat dipakai lintas konteks bangunan pada PBL.
## 11. Use Case Scenario untuk PBL (Surakarta & Island)
Catatan penting: berikut dua use-case yang disusun langsung dari bukti di Murtyas et al. (2023) untuk konteks Surakarta dan Zhang et al. (2020) untuk konteks pulau/iklim maritim. Sertakan kutipan Pxxx Lyyy dari file ekstraksi `docs/murtyas2023_extracted_with_lines.txt` dan `docs/zhang2020_extracted_with_lines.txt` saat menempel ke laporan.

### 11.1 Use Case A — Low-cost dwellings, Pasar Kliwon, Surakarta (Murtyas et al., 2023)
- Konteks: survei lapangan pada 17 rumah berbiaya rendah di distrik kumuh Pasar Kliwon, Surakarta; pengukuran T/RH 10-min interval selama 41 hari [P003 L030-L036].
- Bukti utama: VTT dipakai untuk memprediksi risiko jamur dari time-series T/RH [P001 L037-L039]; durasi RH>80% harian 2.2–12.3 jam [P001 L040-L041]; rumah dengan dinding plywood menunjukkan risiko kumulatif lebih tinggi [P005 L026-L028; P006 L047-L049].
- Langkah implementasi (siap dimasukkan ke Word):
	1. Pasang data logger T/RH (10–60 min) di 3–4 titik per rumah, minimal 14–30 hari.
	2. Peta tiap elemen ke sensitivity class (contoh: plywood → `s`/`vs`, cement brick → `mr`) berdasarkan Table 3 dari ekstraksi VTT.
	3. Jalankan VTT per elemen untuk membandingkan laju kenaikan mould index dan identifikasi zona prioritas.
	4. Ambil keputusan mitigasi: ventilasi, perbaikan material (ganti/coat plywood), atau pemindahan fungsi ruangan dari area rawan.
- Contoh kutipan hasil untuk laporan: "VTT digunakan pada 17 dwellings untuk memprediksi mould risk [P001 L037-L039]; durasi RH>80% 2.2–12.3 h [P001 L040-L041]; plywood walls showed higher cumulative mould growth risk [P005 L026-L028; P006 L047-L049]."

### 11.2 Use Case B — Island residential buildings (Nansha Islands) — HVAC & material strategy (Zhang et al., 2020)
- Konteks: studi numerik dan survei pada bangunan pulau dengan iklim maritim (suhu & RH tinggi, kandungan garam) yang mendorong reproduksi jamur pada permukaan dinding [P001 L017-L019; P004 L005-L009].
- Bukti utama: material vulnerability ranking (low→high): reinforced concrete → wood [P001 L025-L027]; rekomendasi desain HVAC untuk pencegahan jamur: T≈26–28°C dan RH 50%–80% bersama dehumidification [P001 L028-L031; P012 L031-L032].
- Langkah implementasi (siap dimasukkan ke Word/PPT):
	1. Klasifikasikan envelope material dan fokus pada penggantian/peningkatan material yang rentan (hindari kayu pada area luar/terkena kelembapan langsung).
	2. Rancang operasi AC dengan setpoint dan dehumidifier sesuai rekomendasi (target 26–28°C, RH 50%–80%) dan monitor kestabilan RH.
	3. Gunakan simulasi WUFI/WUFI-Bio atau VTT untuk mengevaluasi dampak operasi HVAC terhadap growth index di permukaan.
	4. Pilih tindakan prioritas: material substitution, AC + continuous dehumidification di area kritis, perawatan permukaan.
- Contoh kutipan hasil untuk laporan: "Material vulnerability ranking and HVAC parameters recommended to prevent mould: T 26–28°C; RH 50–80% [P001 L028-L031; P012 L031-L032]."

### 11.3 Template ringkas use case (siap copy)
1. Nama skenario & lokasi.
2. Deskripsi singkat konteks (bangunan, penggunaan, iklim).
3. Material kunci & sensitivity class.
4. Data input (interval logger, titik ukur, durasi).
5. Langkah analisis (VTT per elemen, bandingkan material).
6. Hasil utama & kutipan Pxxx Lyyy per klaim.
7. Keputusan mitigasi dan rencana verifikasi lapangan.

### 11.4 Catatan penulisan untuk Word/PPT
- Pastikan setiap klaim mitigasi memuat kutipan Pxxx Lyyy dari file ekstraksi yang sesuai (contoh: Murtyas `[P001 L037-L039]`, Zhang `[P001 L028-L031]`).
- Gunakan template ringkas di atas untuk slide atau lampiran Word agar reviewer dapat menilai klaim terhadap bukti PDF.

## 12. Alur Explanasi untuk Presentasi/Sidang
Gunakan urutan ini agar penjelasan mudah dipahami dosen/penguji:
1. Jelaskan masalah: jamur dipengaruhi suhu, RH, waktu, dan material.
2. Tunjukkan kenapa VTT dipilih: variabel kunci tercakup dan ada updated model.
3. Tunjukkan bukti material: ada empat sensitivity class + daftar material uji.
4. Tunjukkan batasan: model tidak absolut, masih butuh validasi lapangan.
5. Tutup dengan keputusan: VTT layak sebagai model evaluasi risiko untuk PBL, bukan alat prediksi absolut.

Rujukan sumber:
- Halaman 4, line P004 L024-P004 L025
- Halaman 5, line P005 L038-P005 L040
- Halaman 5, line P005 L117-P005 L126
- Halaman 6, line P006 L005-P006 L013
- Halaman 14, line P014 L037-P014 L043

## 13. Daftar Rujukan Halaman-Line (Cepat)
1. Halaman 1: P001 L019
2. Halaman 4: P004 L024-P004 L025
3. Halaman 5: P005 L028-P005 L031
4. Halaman 5: P005 L038-P005 L040
5. Halaman 5: P005 L050-P005 L052
6. Halaman 5: P005 L052-P005 L056
7. Halaman 5: P005 L057-P005 L059
8. Halaman 6: P006 L005-P006 L008
9. Halaman 13: P013 L068-P013 L070
10. Halaman 13: P013 L107
11. Halaman 14: P014 L032-P014 L036
12. Halaman 14: P014 L037-P014 L043
13. Halaman 5: P005 L110-P005 L114
14. Halaman 5: P005 L117-P005 L126
15. Halaman 5: P005 L127-P005 L142
16. Halaman 6: P006 L009-P006 L013

Catatan pembacaan:
- Format Pxxx Lyyy berarti page dan line pada file ekstraksi sumber di docs/vereecken2012_extracted_with_lines.txt.

## 14. Daftar 3 PDF Referensi
Bagian ini adalah daftar 3 PDF yang dipakai bersama untuk menyusun argumen Word ini. PDF 1 dipakai sebagai dasar teori VTT, PDF 2 dan PDF 3 dipakai sebagai penguat konteks penerapan di Indonesia dan kondisi bangunan lembap/AC.

### PDF 1 - Paper utama VTT
Vereecken, E., & Roels, S. (2012). Review of mould prediction models and their influence on mould risk evaluation. *Building and Environment, 51*, 296-310.

DOI:
- https://doi.org/10.1016/j.buildenv.2011.11.003

### PDF 2 - Konteks Indonesia (rumah murah / Surakarta)
Murtyas, S., Minami, Y., Handayani, K. N., & Hagishima, A. (2023). Assessment of Mould Risk in Low-Cost Residential Buildings in Urban Slum Districts of Surakarta City, Indonesia. *Buildings, 13*(5), 1333.

DOI:
- https://doi.org/10.3390/buildings13051333

### PDF 3 - Konteks iklim lembap dan AC
Zhang, X., Liang, J., Wang, B., Lv, Y., & Xie, J. (2020). Indoor Air Design Parameters of Air Conditioners for Mold-Prevention and Antibacterial in Island Residential Buildings. *International Journal of Environmental Research and Public Health, 17*(20), 7316.

DOI:
- https://doi.org/10.3390/ijerph17207316

