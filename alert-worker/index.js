import 'dotenv/config';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import nodemailer from 'nodemailer';

const firebaseConfig = {
    apiKey: "AIzaSyAqTvLjbLeiFKWU039mMYR9ucJVCqkkC9A",
    authDomain: "moldymoldbase.firebaseapp.com",
    projectId: "moldymoldbase",
    storageBucket: "moldymoldbase.firebasestorage.app",
    messagingSenderId: "54731132506",
    appId: "1:54731132506:web:7ba3446e7be899edcbd263",
    measurementId: "G-0YZBDJSZDM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// State definitions
let globalSettings = {
    safeHumidityLimit: 60,
    criticalHumidityLimit: 85,
    alertEmail: '',
    alertsEnabled: false
};

// Map<deviceID, 'safe' | 'alerting'>
const deviceStates = new Map();

async function sendAlertEmail(deviceID, timestamp, humidityValue) {
    if (!globalSettings.alertsEnabled || !globalSettings.alertEmail) {
        console.log(`[Alert Suppressed] Alerts disabled or no email specified for device ${deviceID}.`);
        return;
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.log(`[Alert Error] Gmail credentials missing from .env`);
        return;
    }

    console.log(`[ALERT] High humidity detected on ${deviceID}: ${humidityValue}%. Sending email to ${globalSettings.alertEmail}...`);
    
    try {
        const info = await transporter.sendMail({
            from: `"MoldGuard Alerts" <${process.env.GMAIL_USER}>`,
            to: globalSettings.alertEmail,
            subject: `CRITICAL: High Humidity on ${deviceID}`,
            text: `MoldGuard Alert: Device ${deviceID} reported a critical humidity level of ${humidityValue}% on ${new Date(timestamp).toLocaleString()}. Immediate action is recommended to prevent mold formation.`,
            html: `
                <h3>MoldGuard Alert</h3>
                <p><strong>Device:</strong> ${deviceID}</p>
                <p><strong>Humidity:</strong> <span style="color:red; font-size: 1.2em;">${humidityValue}%</span></p>
                <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
                <p>Immediate action is recommended to prevent mold formation.</p>
            `
        });

        console.log(`[Alert Success] Email sent successfully -> MessageId: ${info.messageId}`);
    } catch (error) {
        console.error(`[Alert Error] Failed to send email via NodeMailer:`, error);
    }
}

async function startWatchdog() {
    console.log("Starting MoldGuard Watchdog Process...");
    
    // 1. Listen to global Settings
    const settingsRef = doc(db, 'Settings', 'global');
    onSnapshot(settingsRef, (snap) => {
        if (snap.exists()) {
            globalSettings = snap.data();
            console.log(`[Config Updated] safeLimit: ${globalSettings.safeHumidityLimit}%, criticalLimit: ${globalSettings.criticalHumidityLimit}%, alertsEnabled: ${globalSettings.alertsEnabled}`);
        } else {
            console.log("[Config Warning] Settings/global document not found. Using defaults.");
        }
    });

    // 2. Listen to SensorLogs collection
    const logsRef = collection(db, 'SensorLogs');
    const logsQuery = query(logsRef, orderBy('timestamp', 'desc'));
    
    let isInitialLoad = true;
    
    onSnapshot(logsQuery, (snapshot) => {
        // Skip processing the massive backlog of history on boot
        // We only care about new events that happened after watchdog start
        const changes = snapshot.docChanges();
        
        if (isInitialLoad) {
            isInitialLoad = false;
            console.log(`[Watchdog Loaded] Listening to real-time events.`);
            return;
        }

        for (const change of changes) {
            if (change.type === 'added') {
                const log = change.doc.data();
                const { deviceID, humidity, timestamp } = log;
                
                if (!deviceID || humidity === undefined) continue;

                // State logic initialization
                if (!deviceStates.has(deviceID)) {
                    deviceStates.set(deviceID, 'safe');
                }
                
                const currentState = deviceStates.get(deviceID);
                
                // Determine crossing above Critical
                if (humidity >= globalSettings.criticalHumidityLimit && currentState === 'safe') {
                    // Update state safely
                    deviceStates.set(deviceID, 'alerting');
                    
                    // Trigger email
                    const timeMs = timestamp?.toDate ? timestamp.toDate().getTime() : Date.now();
                    sendAlertEmail(deviceID, timeMs, humidity);
                }
                // Determine crossing below Safe
                else if (humidity <= globalSettings.safeHumidityLimit && currentState === 'alerting') {
                    console.log(`[Recovery] Device ${deviceID} humidity stabilized back down to ${humidity}%. Alert system armed for next violation.`);
                    deviceStates.set(deviceID, 'safe');
                }
            }
        }
    });
}

startWatchdog();
