# PPT Notes - VTT for PBL (Indonesian)

Slide 1: Judul & tujuan
Slide 2: Ringkasan eksekutif — klaim utama dan batasan
Slide 3: Apa itu VTT? variabel utama (T, RH, surface, time)
Slide 4: Updated VTT — cakupan material & sensitivity class
Slide 5: Bukti kunci (halaman-line) — arahkan ke `README_PDF_VTT_REFERENSI.md`
Slide 6: Use case 1 (Rumah/Kos - Indonesia) — ringkasan input & mitigasi
Slide 7: Use case 2 (Lab aktif 06:30–17:00, AC 16°C) — ringkasan input & mitigasi
Slide 8: Rekomendasi implementasi PBL & mitigasi
Slide 9: Batasan & kebutuhan validasi lapangan
Slide 10: Referensi & lampiran (file ekstraksi)
# README PPT - Argumen VTT untuk PBL

Dokumen ini adalah versi ringkas berbentuk alur slide PPT. Isi dapat langsung dipindahkan ke presentasi, dengan rujukan halaman-line dari PDF dan link DOI untuk referensi akhir.

## Slide 1. Judul
**Pembuktian Kelayakan Model VTT untuk Evaluasi Risiko Jamur pada Berbagai Kondisi Bangunan**

## Slide 2. Masalah yang Dibahas
- Jamur pada bangunan dipengaruhi suhu, kelembapan relatif, material permukaan, waktu paparan, dan periode kering.
- Risiko jamur penting karena berdampak pada kesehatan penghuni dan kerusakan bangunan.
- Use case di slide berikutnya disusun dari 3 PDF: VTT utama, konteks Indonesia, dan konteks iklim lembap/AC.

Rujukan PDF:
- P001 L016-P001 L028
- P001 L061-P001 L075
- P004 L024-P004 L025

## Slide 3. Kenapa Pakai VTT
- VTT memasukkan variabel utama: suhu, RH, surface, exposure time, dan dry periods.
- Updated VTT diperluas untuk material bangunan lain, bukan hanya kayu.
- Model juga memiliki sensitivity class untuk memetakan material.

Rujukan PDF:
- P004 L024-P004 L025
- P005 L038-P005 L040
- P005 L057-P005 L059

## Slide 4. Bukti Material dari Paper
- Table 3 membagi material ke empat kelas: very sensitive, sensitive, medium resistant, resistant.
- Table 4 memberi parameter tiap kelas, termasuk RH min.
- Ini membuat VTT lebih mudah dipakai untuk komponen bangunan yang berbeda.

Rujukan PDF:
- P005 L117-P005 L126
- P005 L127-P005 L142

## Slide 5. Batasan yang Harus Disebutkan
- VTT original terbatas pada unpolluted spruce/pine softwood.
- Paper menegaskan keterbatasan pada kondisi fluktuatif nyata dan interval waktu logging.
- Semua model masih deterministik, sehingga wajib hati-hati saat menafsirkan hasil.

Rujukan PDF:
- P005 L028-P005 L031
- P005 L110-P005 L114
- P006 L005-P006 L013
- P014 L037-P014 L043

## Slide 6. Use Case — Surakarta low-cost dwellings (Murtyas et al., 2023)
- Context: Field survey of 17 low-cost dwellings in Pasar Kliwon, Surakarta; measured indoor T/RH time-series used to predict mould risk [P003 L030-L036].
- Key evidence: VTT applied to time-series T/RH [P001 L037-L039]; daily RH>80% duration 2.2–12.3 h [P001 L040-L041]; plywood walls show higher cumulative mould risk [P005 L026-L028; P006 L047-L049].
- Slide bullets (copy-ready):
	- Install data loggers (10–60 min) at representative points per dwelling.
	- Map elements to sensitivity class (plywood → `s`/`vs`, cement/brick → `mr`).
	- Run VTT per element and prioritise interventions (ventilation, material upgrade).
	- DOI: https://doi.org/10.3390/buildings13051333

## Slide 7. Use Case — Island residential buildings (Zhang et al., 2020)
- Context: Marine/island climate with high T, high RH and saline exposure; material ranking and HVAC recommendations provided to reduce mould risk [P001 L017-L019; P001 L025-L027].
- Key evidence & recommendation: material vulnerability ranking (RC→wood) and recommended indoor parameters T≈26–28°C, RH 50%–80% with dehumidification [P001 L028-L031; P012 L031-L032].
- Slide bullets (copy-ready):
	- Prioritise reinforced concrete/aerated concrete for envelopes; avoid wood on vulnerable facades.
	- Design AC operation and dehumidification to maintain 26–28°C and RH 50%–80% in occupied zones.
	- Validate with VTT/WUFI simulations on wall assemblies before retrofit.
	- DOI: https://doi.org/10.3390/ijerph17197316

## Slide 8. Kesimpulan
- VTT layak dipakai untuk PBL sebagai model evaluasi risiko jamur lintas material bangunan.
- Klaim harus aman: bukan akurasi absolut untuk semua bangunan, tetapi alat screening risiko yang kuat.
- Hasil model perlu divalidasi lapangan dan ditulis sesuai batasan paper.

Rujukan PDF:
- P013 L068-P013 L076
- P014 L032-P014 L043

## Slide 9. Referensi DOI
### Paper utama
Vereecken, E., & Roels, S. (2012). Review of mould prediction models and their influence on mould risk evaluation. *Building and Environment, 51*, 296-310.

DOI link:
- https://doi.org/10.1016/j.buildenv.2011.11.003

Artikel publisher:
- https://www.sciencedirect.com/science/article/pii/S0360132311003313

Rujukan DOI di PDF:
- P001 L085

### Paper pendukung 1 - konteks Indonesia
Murtyas, S., Minami, Y., Handayani, K. N., & Hagishima, A. (2023). *Assessment of Mould Risk in Low-Cost Residential Buildings in Urban Slum Districts of Surakarta City, Indonesia*.

DOI link:
- https://doi.org/10.3390/buildings13051333

### Paper pendukung 2 - konteks iklim lembap dan AC
Zhang, X., Liang, J., Wang, B., Lv, Y., & Xie, J. (2020). *Indoor Air Design Parameters of Air Conditioners for Mold-Prevention and Antibacterial in Island Residential Buildings*.

DOI link:
- https://doi.org/10.3390/ijerph17207316
