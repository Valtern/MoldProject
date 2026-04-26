# CI/CD Implementation Guide — MoldGuard Project

Panduan lengkap untuk mengimplementasikan **Continuous Integration / Continuous Deployment** pada project MoldGuard menggunakan **GitHub Actions** + **Firebase Hosting**.

> **Status saat ini:** Tahap 1 (Lint + Build CI) sudah disetup. Tahap 2 (Auto Deploy) tinggal di-aktifkan kapan kamu siap.

---

## Daftar Isi

1. Konteks Project & Apa yang Sudah Disetup
2. Pre-Requisites Sebelum Push
3. Tahap 1 — CI: Lint & Build (Sudah Aktif)
4. Tahap 2 — CD: Auto-Deploy ke Firebase (Upgrade Path)
5. Apa yang Bisa Dipresentasikan Senin
6. Troubleshooting
7. Glosarium Cepat

---

## 1. Konteks Project & Apa yang Sudah Disetup

### Stack yang dipakai

| Komponen | Teknologi |
|---|---|
| Frontend Dashboard | React 19 + Vite 7 + TypeScript + Tailwind |
| Hosting | Firebase Hosting (project `moldymoldbase`) |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| Watchdog Email | Node.js + Nodemailer (`alert-worker/`) — *jalan lokal, tidak di-deploy* |
| ESP32 Bridge | Node.js + Express (`esp32-middleware/`) — *jalan lokal, tidak di-deploy* |

### Branching Strategy Tim

Repo ini punya beberapa feature branch per developer (Seno, Charel, Hammam, anton) yang merge ke `main`. CI workflow dikonfigurasi trigger di **semua branch**, jadi setiap dev langsung dapat feedback di branch masing-masing tanpa perlu PR dulu.

### File yang baru ditambahkan oleh CI/CD setup

```
.github/
└── workflows/
    └── ci.yml          ← GitHub Actions workflow (lint + build)
.gitignore              ← di-update: exclude credentials, dist, dll.
eslint.config.js        ← di-update: demote 6 rules ke warning
CI-CD-GUIDE.md          ← dokumen ini
```

### Yang TIDAK termasuk scope CI/CD ini (untuk sekarang)

- `alert-worker/` — Node.js script yang jalan terus di laptop/server kamu sendiri. Tidak di-deploy lewat Firebase Hosting (Firebase Hosting hanya untuk static files).
- `esp32-middleware/` — server Express yang jalan di laptop/local server. Untuk produksi nyata, ini harus di-host di VPS, Cloud Run, atau di-convert jadi Firebase Cloud Functions. Itu topik upgrade berikutnya.

---

## 2. Pre-Requisites Sebelum Push

### 2.1 Bersihkan Service Account yang Bocor (KRITIS)

File berikut sudah ter-commit ke repo dan harus dibereskan:

```
esp32-middleware/moldymoldbase-firebase-adminsdk-fbsvc-fcc514e3d8.json
```

**Langkah-langkah:**

```bash
# 1. Hapus file dari tracking Git (file fisik tetap ada di laptop kamu)
git rm --cached esp32-middleware/moldymoldbase-firebase-adminsdk-fbsvc-fcc514e3d8.json

# 2. Commit perubahan .gitignore + penghapusan file
git add .gitignore
git commit -m "security: remove leaked service account, harden gitignore"

# 3. Revoke kunci yang lama di Firebase Console:
#    https://console.firebase.google.com/project/moldymoldbase/settings/serviceaccounts/adminsdk
#    -> Pilih kunci yang bocor -> Delete
#    -> Generate new private key (untuk dipakai lokal saja, jangan di-commit lagi!)
```

> **Catatan penting:** Service account itu masih ada di **history commit** sebelumnya. Untuk benar-benar bersih, gunakan `git filter-repo` atau BFG Repo-Cleaner. Tapi *minimal*: kunci lamanya HARUS di-revoke, supaya walaupun history-nya kebaca orang, kuncinya sudah tidak berlaku.

### 2.2 Pastikan Build Sukses di Lokal

Sebelum push, coba dulu di laptop:

```bash
cd /Users/macbookpro/MoldProject-PBL/MoldProject
npm ci
npm run lint
npm run build
```

Kalau ketiga command di atas hijau di lokal, dijamin hijau juga di GitHub Actions.

### 2.3 Verifikasi `.firebaserc` & `firebase.json`

Sudah benar di repo kamu:

```jsonc
// .firebaserc
{ "projects": { "default": "moldymoldbase" } }

// firebase.json
{
  "hosting": {
    "public": "dist",        // Vite build output
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

---

## 3. Tahap 1 — CI: Lint & Build (Sudah Aktif)

### 3.1 Anatomi `.github/workflows/ci.yml`

File ini "didengar" oleh GitHub. Begitu ada commit di repository, GitHub baca file ini dan eksekusi langkah-langkahnya di server gratis (GitHub Runner).

```yaml
on:
  push:
    branches: ['**']      # trigger di SEMUA branch (team-friendly)
  pull_request:
    branches: [main]      # trigger saat ada PR ke main
  workflow_dispatch:      # trigger manual dari UI GitHub
```

```yaml
jobs:
  lint-and-build:
    runs-on: ubuntu-latest    # mesin virtual Linux di-spin-up gratis
    steps:
      - actions/checkout@v4              # download source code
      - actions/setup-node@v4 (node 20)   # install Node 20
      - npm ci                            # install deps deterministic
      - npm run lint                      # ESLint check
      - npm run build                     # tsc + vite build
      - actions/upload-artifact@v4        # simpan dist/ untuk inspect
```

### 3.2 Cara Aktifkan

```bash
# di root project (branch Seno)
git add .github/workflows/ci.yml .gitignore eslint.config.js CI-CD-GUIDE.md
git commit -m "ci: add lint & build workflow + harden gitignore"
git push origin origin/Seno   # atau nama branch kamu yang sebenarnya
```

### 3.3 Cara Cek Hasilnya

1. Buka repo di GitHub: https://github.com/Valtern/MoldProject
2. Klik tab **Actions**
3. Klik run terbaru (judulnya = pesan commit kamu)
4. Klik job **Lint & Build Frontend**
5. Lihat log tiap step — kalau hijau ✅ artinya lulus

### 3.4 Branch Protection (Opsional Tapi Recommended)

Supaya nggak bisa merge PR yang gagal CI:

1. Repo → **Settings** → **Branches** → **Branch protection rules**
2. **Add rule** untuk pattern `main`
3. Centang **Require status checks to pass before merging**
4. Pilih `Lint & Build Frontend` sebagai required check
5. Save

Sekarang siapa pun (termasuk kamu sendiri) **tidak bisa merge** PR ke main kalau lint/build-nya gagal.

---

## 4. Tahap 2 — CD: Auto-Deploy ke Firebase (Upgrade Path)

> Ini adalah langkah berikutnya kapan kamu sudah siap auto-deploy. Ikuti urutannya.

### 4.1 Buat Service Account untuk GitHub Actions

GitHub Actions perlu "identitas" untuk deploy ke Firebase project kamu, dan kuncinya disimpan di GitHub Secrets (terenkripsi, tidak terlihat di log).

**Cara paling rapi (recommended): pakai Firebase CLI**

```bash
# Pastikan firebase-tools terbaru
npm install -g firebase-tools

# Login di terminal lokal kamu
firebase login

# Generate service account khusus untuk GitHub Actions
firebase init hosting:github
```

Command terakhir akan:

- Tanya repository GitHub kamu (`Valtern/MoldProject`)
- Otomatis generate service account dengan permissions yang tepat
- Otomatis menyimpan secret `FIREBASE_SERVICE_ACCOUNT_MOLDYMOLDBASE` ke GitHub repo
- Generate file workflow contoh (kamu **tidak perlu pakai file ini**, kita pakai versi custom di bawah)

**Cara manual (kalau cara di atas gagal):**

1. Google Cloud Console → IAM & Admin → Service Accounts → **Create Service Account**
2. Nama: `github-actions-deployer`
3. Roles yang dibutuhkan:
   - `Firebase Hosting Admin`
   - `Firebase Authentication Admin` (kalau auth dipakai)
   - `Cloud Datastore User` (kalau Firestore rules ikut deploy)
   - `Firebase Rules Admin`
4. Selesai → klik service account → tab **Keys** → **Add Key** → **Create new key** → JSON → download
5. Buka file JSON → copy seluruh isinya (termasuk kurawal)
6. GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
   - Name: `FIREBASE_SERVICE_ACCOUNT_MOLDYMOLDBASE`
   - Secret: paste isi JSON
7. Jangan simpan file JSON di repo. Tutup file dan hapus dari laptop.

### 4.2 Tambah Workflow Deploy

Buat file baru `.github/workflows/deploy.yml`:

```yaml
name: CD - Deploy to Firebase Hosting

on:
  # Auto-deploy saat ada push ke main
  push:
    branches: [main]
  # Preview deploy saat ada PR
  pull_request:
    branches: [main]

concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: false   # jangan batalkan deploy yang sudah berjalan

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  deploy-production:
    name: Deploy Production (Live)
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_MOLDYMOLDBASE }}
          channelId: live
          projectId: moldymoldbase

  deploy-preview:
    name: Deploy Preview (PR)
    needs: build
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_MOLDYMOLDBASE }}
          # Tanpa channelId, action ini auto-create preview channel per PR
          # dan auto-comment preview URL di PR-nya
          projectId: moldymoldbase
          expires: 7d
```

### 4.3 (Opsional) Auto-Deploy Firestore Rules & Storage Rules

Frontend deploy via action di atas hanya meng-update Hosting. Kalau kamu juga ingin `firestore.rules` dan `storage.rules` ikut auto-deploy, tambahkan job berikut di akhir workflow:

```yaml
  deploy-rules:
    name: Deploy Firestore & Storage Rules
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g firebase-tools
      - name: Auth & Deploy Rules
        env:
          GOOGLE_APPLICATION_CREDENTIALS_JSON: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_MOLDYMOLDBASE }}
        run: |
          echo "$GOOGLE_APPLICATION_CREDENTIALS_JSON" > /tmp/sa.json
          export GOOGLE_APPLICATION_CREDENTIALS=/tmp/sa.json
          firebase deploy --only firestore:rules,storage --project moldymoldbase --non-interactive
```

> Service account-nya butuh role **Firebase Rules Admin** dan **Cloud Datastore User** untuk ini.

---

## 5. Apa yang Bisa Dipresentasikan Senin

### Talking points yang sudah valid dengan setup saat ini

**(a) Definisi & Manfaat CI/CD**

> CI = setiap perubahan code dicek otomatis (lint, type-check, build) di server netral, sehingga error ketahuan sebelum production. CD = artifact yang lolos CI dipromosikan ke environment production secara otomatis.

**(b) Flow yang sudah berjalan di project ini**

```
Developer push commit
          │
          ▼
GitHub Actions trigger ci.yml di runner Ubuntu gratis
          │
   ┌──────┼──────┐
   ▼      ▼      ▼
 Install Lint  Build
  deps         (tsc + vite)
          │
          ▼
   Artifact dist/ tersimpan 7 hari
          │
          ▼
   Status check muncul di PR/commit (hijau ✅ atau merah ❌)
```

**(c) Cloud computing dimanfaatkan di mana**

| Layanan Cloud | Peran |
|---|---|
| GitHub Actions Runner | Compute on-demand untuk eksekusi pipeline (ubuntu-latest gratis) |
| GitHub Container Storage | Tempat artifact `dist/` disimpan & bisa di-download |
| Firebase Hosting | Static asset CDN global yang akan jadi target deploy |
| Firebase Firestore / Storage | Database & object storage real-time untuk dashboard |
| Google IAM (untuk tahap 2) | Otentikasi service account agar GitHub Actions bisa deploy |

**(d) Bukti konkret yang bisa ditunjukkan**

1. Tab **Actions** di GitHub menampilkan history run beserta status hijau/merah
2. Buka satu run → log step-by-step terlihat seperti terminal asli
3. Klik "Artifacts" → download `dist-<sha>.zip` → tunjukkan output build hasil pipeline
4. (Kalau branch protection sudah aktif) Coba bikin PR yang sengaja error → tunjukkan tombol Merge ke-disable

**(e) Roadmap (untuk menjawab pertanyaan dosen "next step apa?")**

1. Tahap 2: enable auto-deploy ke Firebase Hosting (workflow `deploy.yml` di section 4.2)
2. Tahap 3: tambahkan automated testing (Vitest/Jest) sebelum lint
3. Tahap 4: convert `alert-worker` & `esp32-middleware` jadi Cloud Functions, sehingga ikut auto-deploy
4. Tahap 5: tambahkan monitoring & alerting (Firebase Performance, Sentry, dll)

---

## 6. Troubleshooting

| Gejala | Kemungkinan Penyebab | Solusi |
|---|---|---|
| `npm ci` gagal di CI tapi di lokal sukses | `package-lock.json` tidak ter-commit atau out of sync | Run `npm install` lokal, commit `package-lock.json`, push lagi |
| `npm run lint` gagal di CI | Ada error/warning ESLint yang ke-skip lokal | Run `npm run lint` di lokal, fix warnings |
| `tsc -b` gagal di CI | Ada error TypeScript yang ke-suppress di IDE | Run `npx tsc -b` di lokal, fix type errors |
| Workflow tidak ter-trigger sama sekali | File workflow nggak di branch yang di-push, atau syntax YAML salah | Cek tab Actions → "All workflows" → kalau merah, klik untuk lihat error parsing |
| Job deploy gagal "permission denied" | Service account roles kurang, atau secret salah paste (kurang `{` di awal) | Cek IAM → Service Accounts → tambah role; atau replace ulang secret di GitHub |
| Preview URL nggak muncul di PR | Firebase project belum upgrade Spark→Blaze (untuk hosting tetap gratis sebenarnya, tapi sometimes hits limits) | Cek di Firebase Console → Hosting → Channels |

### Cek run gagal

1. GitHub repo → tab **Actions**
2. Klik run yang merah ❌
3. Klik nama job → klik step yang merah
4. Baca log error (biasanya di bagian akhir, ditandai `Error:` atau `npm ERR!`)
5. Reproduksi di lokal dengan command yang sama

---

## 7. Glosarium Cepat

| Istilah | Arti Singkat |
|---|---|
| **CI** | Continuous Integration — auto-cek setiap perubahan code |
| **CD** | Continuous Deployment/Delivery — auto-deploy artifact yang lolos CI |
| **Workflow** | File YAML di `.github/workflows/` yang mendefinisikan pipeline |
| **Job** | Satu kumpulan step yang jalan di runner yang sama |
| **Step** | Satu command atau action di dalam job |
| **Runner** | Mesin virtual yang menjalankan workflow (di sini: GitHub-hosted Ubuntu) |
| **Action** | Komponen reusable (misal `actions/checkout@v4`) yang dipublish ke GitHub Marketplace |
| **Artifact** | File output dari workflow yang disimpan & bisa di-download |
| **Secret** | Variable terenkripsi (mis. service account JSON) yang nggak terlihat di log |
| **Service Account** | "User robot" Google Cloud, dipakai untuk auth otomatis dari CI |
| **Branch protection** | Rule GitHub yang mencegah merge kalau CI gagal |
| **Channel (Firebase)** | Versi-versi Hosting; `live` = production, channel lain = preview |

---

**Pertanyaan? Lihat dulu di section Troubleshooting. Kalau masih stuck, paste log error-nya — diagnosa biasanya jelas dari pesan error.**
