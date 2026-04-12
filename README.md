# MoldGuard IoT Dashboard & Alert System

A complete smart home monitoring environment designed to track humidity and temperature across multiple rooms dynamically, predicting and alerting users to critical mold risks before they become a hazard. 

This project is broken into two distinct environments:
1. **The React/Vite Frontend Dashboard** 
2. **The Node.js Watchdog Alert Worker**

---

## 1. Frontend Dashboard Setup

The dashboard is built with React, Vite, TailwindCSS, and synced in real-time with Firebase.

### Installation
From the root directory (`/MoldProject`):
```bash
npm install
```

### Running the Dashboard
```bash
npm run dev
```
The application will launch locally (typically at `http://localhost:5173`). All room limits, global settings, and devices are pulled directly from Google Firebase in real-time.

---

## 2. Watchdog Alert System (Email Alerts)

To avoid sending hundreds of emails when a room stays humid for a long time, we run an independent Node.js watchdog script (`/alert-worker`). This script tracks 'Threshold Crossing' events in real-time and securely fires off automated **Nodemailer** warnings using a Gmail transport.

### Installation
Navigate into the alert worker folder:
```bash
cd alert-worker
npm install
```

### Configuring Gmail Credentials
For security reasons, email credentials are not stored in version control. 

1. Copy the `.env.example` file and rename it to exactly `.env`.
   ```bash
   # Inside the alert-worker directory
   cp .env.example .env
   ```
2. Open your new `.env` file.
3. Replace the placeholder values with your real Gmail address and a **16-character Google App Password**. 
   > **Note:** If you do not have an App Password, you must enable 2-Step Verification in your Google Account Settings, go to "App Passwords", and generate a new one specifically for this script.

### Running the Alert Worker
Once your `.env` is configured, start the persistent watchdog alongside your frontend:
```bash
node --env-file=.env index.js
```
The script will announce:
`[Watchdog Loaded] Listening to real-time events.`

It will silently monitor all incoming Firebase sensor logs and send alerts to the `alertEmail` configured globally in your Dashboard Settings.
