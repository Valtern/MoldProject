# Assets

Folder ini disiapkan untuk menyimpan screenshot, diagram, dan gambar pendukung dokumentasi.

## Rekomendasi Nama File
- `uml-use-case.png` — formal use case UML with actor, association, generalization, include, and extend
- `uml-activity-login.png` — swimlane activity diagram
- `uml-activity-signup.png` — swimlane activity diagram
- `uml-activity-forgot-password.png` — swimlane activity diagram
- `uml-activity-dashboard.png` — swimlane activity diagram
- `uml-activity-room-management.png` — swimlane activity diagram
- `uml-activity-devices.png` — swimlane activity diagram
- `uml-activity-reports.png` — swimlane activity diagram
- `uml-activity-settings.png` — swimlane activity diagram
- `uml-activity-language-theme.png` — swimlane activity diagram
- `uml-activity-logout.png` — swimlane activity diagram
- `architecture.png`
 - `uml-deployment.png` — deployment topology (ESP32, Hosting, Firestore, Functions, Analytics)
 - `uml-system-activity.png` — system activity/workflow (edge → functions → storage → frontend → analytics)

## Catatan
- Gunakan nama file yang konsisten dan deskriptif.
- Hindari spasi di nama file.
- File PNG hasil render untuk UML disimpan langsung di folder ini agar mudah dipakai di manual book dan presentasi.
- Semua file `uml-activity-*.png` menggunakan simbol activity UML seperti initial state, decision, fork/join, dan final state.
- File `uml-use-case.png` menggunakan notasi use case UML dengan aktor, oval use case, asosiasi, generalisasi, `<<include>>`, dan `<<extend>>`.