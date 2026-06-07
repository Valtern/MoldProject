# 🚀 Pitch Deck: MoldGuard — Smart Mold Prevention System

This document contains the slide-by-slide *Pitch Deck* structure for the MoldGuard PBL project presentation. Content is aligned with the four integrated courses: Internet of Things, Framework-based Programming, Cloud Computing, and Big Data. Copy each slide into PowerPoint, Canva, or Google Slides.

---

## Slide 1: Cover
**Headline:** MoldGuard
**Sub-headline:** IoT & Cloud-First Smart Mold Prevention System
**Supervisors:**
- Yoppy Yunhasnawa, S.ST., M.Sc.
- Agung Nugroho Pramudhita, S.T., M.T.
- Dian Hanifudin Subhi, S.Kom., M.Kom.

**Presenter:** [Team Name / Members]
**Visual:** MoldGuard Logo + Dashboard mockup.

---

## Slide 2: Background & Problem
**Headline:** The Hidden Danger Behind Humidity
**Text:**
- **Health & Material Damage:** Mold destroys building structures, triggers chronic respiratory issues, and lowers indoor air quality.
- **Late Detection:** Humidity monitoring is still manual. Mold is only noticed *after* it becomes visible and has already caused damage.
- **Meaningless Data:** Even when sensors exist, the data is just raw numbers without danger indicators or action guidance.
- **High Repair Costs:** Mold remediation in buildings can cost millions and require significant downtime.

---

## Slide 3: Solution — MoldGuard
**Headline:** From Reactive Monitoring to Proactive Prevention
**Text:**
MoldGuard is an IoT-based environmental monitoring system that integrates sensors, cloud computing, and a web dashboard to detect mold risk *before* it happens.
- **Realtime IoT Monitoring:** Sensors track temperature, humidity, and light continuously 24/7.
- **Cloud-Powered Risk Analysis:** Data is automatically processed in the cloud into mold-risk indicators (Safe → Warning → Critical).
- **Predictive Alerts:** Proactive notifications when conditions approach danger thresholds, not after mold has already appeared.

---

## Slide 4: Target Users
**Headline:** Who Needs MoldGuard?
**Text:**
- **Boarding House & Rental Property Owners:** Keep rooms livable and avoid tenant complaints caused by mold, musty odors, and peeling walls.
- **Homeowners:** Protect families from allergy risks, asthma, and furniture or wall damage caused by excessive humidity.
- **Specialized Facility Managers:** Warehouses, hospitals, libraries, laboratories, and archive rooms highly susceptible to mold growth.

---

## Slide 5: PBL Course Integration
**Headline:** One Project, Four Courses
**Visual:** Circle/block diagram of four components.
**Text:**
| Course | Contribution to MoldGuard |
|---|---|
| **Internet of Things** | Data acquisition from temperature, humidity, light sensors, and device Wi-Fi connectivity. |
| **Framework-based Programming** | React + TypeScript + Vite frontend: responsive dashboard, bilingual, dark/light mode. |
| **Cloud Computing** | Firebase Auth, Firestore (realtime DB), and Cloud Functions (server-side logic & risk evaluation). |
| **Big Data** | Continuous sensor history storage, trend analysis, and data-driven reporting. |

---

## Slide 6: Core Features (MVP)
**Headline:** 6 Functional Requirements Fulfilled
**Visual:** Dashboard / Room Management screenshot.
**Text:**
1. **User Authentication** — Secure login, signup, forgot password, and logout.
2. **Realtime Dashboard** — Room status, temperature, humidity, light, and mold-risk gauge in one screen.
3. **Room Management** — Room list, active room selection, edit, and delete.
4. **Device Management** — Connection status (online/offline), Wi-Fi signal, and sensor diagnostics.
5. **Reports & Predictive Alerts** — Historical trends (24h / 7d / 30d), risk notifications, and CSV export.
6. **System Settings** — Personal thresholds, notification email, language, and theme.

---

## Slide 7: System Workflow
**Headline:** From Sensor to Decision
**Visual:** Insert `workflow-bisnis-utama.png` or `uml-system-activity.png`.
**Text:**
1. IoT sensors read temperature, humidity, and light → data sent to Firebase.
2. Cloud Functions receive data, update device heartbeat, and evaluate risk.
3. Evaluation results stored in Firestore → dashboard reads in realtime.
4. User sees room status (Safe/Warning/Critical) and receives alerts when danger is detected.
5. User takes corrective action based on the information provided by the system.

---

## Slide 8: System Architecture
**Headline:** Cloud-First & IoT-Driven
**Visual:** Insert `architecture.png` or `uml-deployment.png`.
**Text:**
- **IoT Layer:** Wi-Fi-connected sensors send continuous data to the backend.
- **Backend:** Firebase Firestore (realtime database) + Cloud Functions (risk evaluation, heartbeat, and backup).
- **Frontend:** React + Vite (responsive SPA, bilingual, themeable).
- **Authentication:** Firebase Authentication secures all per-user data access.

---

## Slide 9: Technology Stack
**Headline:** Modern & Proven Stack
**Visual:** Technology logos.
**Text:**
| Component | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, i18next, Recharts |
| Backend | Firebase Cloud Functions |
| Database | Firebase Firestore (Realtime) |
| Auth | Firebase Authentication |
| IoT | Temperature/Humidity/Light sensors + Wi-Fi |
| Deployment | Firebase Hosting |

---

## Slide 10: High Availability Plan
**Headline:** Production-Ready Scalability
**Visual:** Insert `uml-ha-architecture.png`.
**Text:**
- **Redundancy:** Two application zones (Active-Active) to eliminate single points of failure.
- **Automated Failover:** Global Load Balancer reroutes traffic when one zone is disrupted.
- **Data Replication:** Firestore Multi-Region ensures data availability (RPO ≈ 0).
- **Monitoring:** Automated alerting to detect unhealthy components before they impact users.

---

## Slide 11: Results & Impact
**Headline:** What Has Been Achieved
**Text:**
- ✅ System separates pages by function to prevent information overload.
- ✅ Realtime Firestore data displayed without manual refresh.
- ✅ Bilingual UI (Indonesian & English) and Dark/Light Mode.
- ✅ Personal thresholds per room — each room can have different limits.
- ✅ Reports and alerts help transition from *monitoring* to *decision making*.
- ✅ Cloud Functions backend ensures consistent data and server-side risk evaluation.

---

## Slide 12: Future Roadmap
**Headline:** What's Next
**Text:**
- Automatic actuator integration (trigger dehumidifier via smart plug when humidity is high).
- Machine Learning for weather-driven risk prediction.
- Multi-channel notifications (email, Telegram, WhatsApp).
- Infrastructure scalability for hundreds of rooms.

---

## Slide 13: Closing & Q&A
**Headline:** Prevent Mold Before It's Too Late.
**Visual:** MoldGuard Logo.
**Text:**
- **Thank you for your attention.**
- Please ask any questions.
- [Contact / GitHub: github.com/Valtern/MoldProject]

---
*(Use images from the `docs/assets/` folder to complement each slide: `architecture.png`, `uml-ha-architecture.png`, `uml-use-case.png`, `uml-system-activity.png`, `uml-deployment.png`, and application page screenshots.)*
