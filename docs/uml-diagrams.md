# UML Diagram Set

Dokumen ini memvisualisasikan alur utama aplikasi berdasarkan README dan implementasi saat ini, tanpa mengubah `README.md`.

## 1. Ringkasan Aktor

- **User**: pengguna aplikasi yang login dan memakai dashboard.
- **Firebase Authentication**: memverifikasi kredensial.
- **Firestore**: menyimpan dan menyediakan data realtime.
- **Cloud Functions**: menangani proses backend otomatis.
- **Email Service**: mengirim email notifikasi dan reset password.

## 2. Use Case Diagram

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Guest" as guest
actor "Authenticated User" as authUser
actor "External Services" as extSvc

rectangle "MoldProject System" {
  ' Dikelompokkan berdasarkan fungsi agar rapi
  
  ' Authentication
  usecase "Sign Up" as UC_SignUp
  usecase "Login" as UC_Login
  usecase "Forgot Password" as UC_Forgot
  usecase "Logout" as UC_Logout

  ' General Settings
  usecase "Switch Language" as UC_Lang
  usecase "Switch Theme" as UC_Theme

  ' Core Features
  usecase "View Dashboard" as UC_Dash
  usecase "Manage / Select Rooms" as UC_Rooms
  usecase "View Reports" as UC_Reports
  usecase "Manage Settings" as UC_Settings
  usecase "View Devices" as UC_Devices
}

' Relasi Guest
guest --> UC_SignUp
guest --> UC_Login
guest --> UC_Forgot
guest --> UC_Lang
guest --> UC_Theme

' Relasi Extend (Forgot Password memperluas fungsi Login)
UC_Forgot .> UC_Login : <<extend>>

' Relasi Authenticated User
authUser --> UC_Logout
authUser --> UC_Lang
authUser --> UC_Theme
authUser --> UC_Dash
authUser --> UC_Rooms
authUser --> UC_Reports
authUser --> UC_Settings
authUser --> UC_Devices

' Relasi ke External Services (Aktor Sekunder)
UC_Login --> extSvc
UC_Reports --> extSvc
UC_Settings --> extSvc
UC_Devices --> extSvc

@enduml
```

## 3. Activity Diagram - Login

```mermaid
flowchart TD
  A([Start]) --> B[User opens login page]
  B --> C[Enter email and password]
  C --> D{Fields valid?}
  D -- No --> E[Show validation error]
  E --> C
  D -- Yes --> F[Send credentials to Firebase Auth]
  F --> G{Authentication success?}
  G -- No --> H[Show auth error message]
  H --> C
  G -- Yes --> I[Load user session]
  I --> J[Redirect to dashboard]
  J --> K([End])
```

## 4. Activity Diagram - Sign Up

```mermaid
flowchart TD
  A([Start]) --> B[User opens sign up page]
  B --> C[Fill email, password, confirm password]
  C --> D{Input valid?}
  D -- No --> E[Show validation error]
  E --> C
  D -- Yes --> F[Send request to Firebase Auth]
  F --> G{Account created?}
  G -- No --> H[Show sign up error]
  H --> C
  G -- Yes --> I[Sign out new account]
  I --> J[Return to login page]
  J --> K([End])
```

## 5. Activity Diagram - Forgot Password

```mermaid
flowchart TD
  A([Start]) --> B[User opens forgot password page]
  B --> C[Enter registered email]
  C --> D{Email valid?}
  D -- No --> E[Show validation error]
  E --> C
  D -- Yes --> F[Send reset email request]
  F --> G{Email sent?}
  G -- No --> H[Show reset error]
  H --> C
  G -- Yes --> I[Show success message]
  I --> J[Start resend cooldown]
  J --> K([End])
```

## 6. Activity Diagram - View Dashboard

```mermaid
flowchart TD
  A([Start]) --> B[User opens dashboard]
  B --> C[Read available rooms from Firestore]
  C --> D{Room found?}
  D -- No --> E[Show empty state]
  E --> Z([End])
  D -- Yes --> F[Select active room]
  F --> G[Listen to latest sensor logs]
  G --> H[Render status banner]
  H --> I[Render stat cards]
  I --> J[Render humidity chart]
  J --> K[Render appliance control panel]
  K --> L([End])
```

## 7. Activity Diagram - Select / Manage Room

```mermaid
flowchart TD
  A([Start]) --> B[User opens Rooms page]
  B --> C[Load room cards from Firestore]
  C --> D[User selects a room]
  D --> E[Update active room in app state]
  E --> F[Return to dashboard]
  F --> G[Dashboard reloads selected room data]
  G --> H([End])
```

## 8. Activity Diagram - View Devices

```mermaid
flowchart TD
  A([Start]) --> B[User opens Devices page]
  B --> C[Load rooms linked to user]
  C --> D[Fetch latest sensor log for each device]
  D --> E{Device active?}
  E -- Yes --> F[Show online or warning status]
  E -- No --> G[Show offline status]
  F --> H[Display wifi, temperature, humidity]
  G --> H
  H --> I[Render table on desktop or cards on mobile]
  I --> J([End])
```

## 9. Activity Diagram - View Reports

```mermaid
flowchart TD
  A([Start]) --> B[User opens Reports page]
  B --> C[Collect device IDs from rooms]
  C --> D[Query alerts and sensor logs]
  D --> E[Group data by selected timeframe]
  E --> F[Calculate humidity and temperature averages]
  F --> G[Render recent activity list]
  G --> H[Render predictive alert cards]
  H --> I[Render chart with selected timeframe]
  I --> J([End])
```

## 10. Activity Diagram - Update Settings

```mermaid
flowchart TD
  A([Start]) --> B[User opens Settings page]
  B --> C[Load current settings from Firestore]
  C --> D[Edit threshold, email, notification, theme]
  D --> E{Validation passed?}
  E -- No --> F[Show validation errors]
  F --> D
  E -- Yes --> G[Save settings to Firestore]
  G --> H[Update local theme if needed]
  H --> I[Show success toast]
  I --> J([End])
```

## 11. Activity Diagram - Switch Language / Theme

```mermaid
flowchart TD
  A([Start]) --> B[User taps language or theme control]
  B --> C{Control type?}
  C -- Language --> D[Change i18n locale]
  C -- Theme --> E[Toggle dark or light theme]
  D --> F[Persist interface state]
  E --> F
  F --> G[Re-render UI with new preference]
  G --> H([End])
```

## 12. Activity Diagram - Logout

```mermaid
flowchart TD
  A([Start]) --> B[User opens profile or logout action]
  B --> C[Show logout confirmation]
  C --> D{User confirms?}
  D -- No --> E[Close dialog]
  E --> F([End])
  D -- Yes --> G[Call signOut]
  G --> H[Reset session state]
  H --> I[Return to login page]
  I --> J([End])
```

## 13. Catatan Visualisasi

- PNG hasil render tersedia di `docs/assets/` dan sudah memakai notasi swimlane serta simbol activity UML:
  - `uml-use-case.png` (use case UML formal)
  - `uml-activity-login.png`
  - `uml-activity-signup.png`
  - `uml-activity-forgot-password.png`
  - `uml-activity-dashboard.png`
  - `uml-activity-room-management.png`
  - `uml-activity-devices.png`
  - `uml-activity-reports.png`
  - `uml-activity-settings.png`
  - `uml-activity-language-theme.png`
  - `uml-activity-logout.png`
- Struktur diagram sengaja dipisah per fitur agar mudah dipakai untuk manual book atau presentasi.
- Jika Anda mau, saya bisa lanjut buat versi yang lebih formal dalam bentuk diagram PlantUML juga.

## 14. Deployment Diagram

Diagram deployment menggambarkan arsitektur runtime dan aliran data antara perangkat edge, front-end, dan layanan cloud.

![Deployment Diagram](assets/uml-deployment.png)

Catatan:
- File PNG disimpan di `docs/assets/uml-deployment.png`.
- Diagram dibuat dengan PlantUML dan menggunakan layout `smetana` untuk menghindari ketergantungan Graphviz.

## 15. System Activity Diagram

Diagram aktivitas ini memvisualisasikan aliran data dan workflow runtime satu sistem penanganan sensor:

![System Activity Diagram](assets/uml-system-activity.png)

Ringkasan alur:
- ESP32 mengumpulkan data dan mengirim ke gateway.
- Gateway meneruskan ke Cloud Functions yang melakukan validasi, threshold check, penyimpanan ke Firestore, dan pemicu notifikasi.
- Frontend (Firebase Hosting) mendengarkan update realtime dan menampilkan dashboard.
- Data diekspor periodik ke cluster analytics untuk pemrosesan batch dan pelatihan model.