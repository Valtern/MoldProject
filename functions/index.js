const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const Mailjet = require('node-mailjet');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const admin = require('firebase-admin');

// 1. Initialize Firebase Admin SDK
// Running natively in Google Cloud, default credentials are automatically used.
admin.initializeApp();
const db = admin.firestore();

// 2. Express Configuration & Basic Hardening
const app = express();

// Trust proxy to get correct client IP from Cloud Functions load balancer
app.set('trust proxy', 1);

app.use(helmet()); // Secure Express HTTP headers

// CORS configuration to only accept POST requests
const corsOptions = {
    origin: '*', // Adjust to match specific frontend/origin if required
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'x-esp32-api-key'],
};

app.use(express.json()); // Parse incoming JSON payloads

// 3. Rate Limiting for the specific endpoint
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again after a minute.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// 4. Strict Data Validation (Zod Schema)
const payloadSchema = z.object({
    temperature: z.number().min(-10.0).max(60.0),
    humidity: z.number().min(0.0).max(100.0),
    lightLevel: z.number().int().min(0).max(4095),
    fanStatus: z.enum(["ON", "OFF"]),
    dehumidifierStatus: z.enum(["ON", "OFF"]),
    deviceID: z.string().max(50),
    wifiSignal: z.number().int().min(-100).max(0)
});

// 5. Authentication Middleware (API Key/PSK)
const authenticateESP32 = (req, res, next) => {
    const providedKey = req.headers['x-esp32-api-key'];
    // In Cloud Functions, .env files in the functions directory are automatically loaded into process.env
    const validKey = process.env.ESP32_API_KEY;

    if (!validKey) {
        console.error("CRITICAL ERROR: ESP32_API_KEY environment variable is not set on the server!");
        return res.status(500).json({ error: "Server misconfiguration" });
    }

    if (!providedKey || providedKey !== validKey) {
        return res.status(401).json({ error: "Unauthorized: Invalid or missing API Key" });
    }

    next();
};

// 6. Application Route
app.post('/api/sensorlogs', cors(corsOptions), limiter, authenticateESP32, async (req, res) => {
    try {
        // Validate payload using Zod. Unrecognized keys are stripped/ignored by default,
        // and formatting must strictly match the schema requirements.
        const validatedData = payloadSchema.parse(req.body);

        // Prepare data payload for Firestore and inject secure server-side timestamp
        const docData = {
            ...validatedData,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        };

        // Push valid data as a new document to the SensorLogs Firestore collection
        const docRef = await db.collection('SensorLogs').add(docData);

        // Update the Devices collection with the last seen status
        await db.collection('Devices').doc(validatedData.deviceID).set({
            lastSeen: admin.firestore.FieldValue.serverTimestamp(),
            status: 'Online'
        }, { merge: true });

        return res.status(201).json({
            success: true,
            message: "Payload validated and successfully saved to Firestore.",
            docId: docRef.id
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            // Drop request with 400 status if validation failed
            return res.status(400).json({
                error: "Invalid payload format.",
                details: error.errors
            });
        }

        console.error("Firestore push error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// 7. Export the serverless HTTP Function
exports.esp32api = onRequest({ region: 'asia-southeast2', maxInstances: 10 }, app);

// 8. Event-Driven Alert Worker (Firestore Trigger)
exports.checkMoldRisk = onDocumentCreated({ document: 'SensorLogs/{logId}', region: 'asia-southeast2' }, async (event) => {
    const logData = event.data.data();

    if (!logData) return;

    const deviceID = logData.deviceID;
    const deviceRef = db.collection('Devices').doc(deviceID);
    const deviceSnap = await deviceRef.get();
    
    if (!deviceSnap.exists) {
        console.log(`Device ${deviceID} not found. Aborting alert.`);
        return;
    }

    const deviceData = deviceSnap.data();
    const userId = deviceData.userId;

    if (!userId) {
        console.log(`Device ${deviceID} has no assigned userId. Aborting alert.`);
        return;
    }

    // Query the exact Settings document for this user
    const settingsRef = db.collection('Settings').doc(userId);
    const settingsSnap = await settingsRef.get();

    if (!settingsSnap.exists) {
        console.log(`Settings not found for user ${userId}. Aborting alert.`);
        return;
    }

    const settingsData = settingsSnap.data();
    
    // Extract dynamic fields
    const alertsEnabled = settingsData.alertsEnabled;
    const alertEmail = settingsData.alertEmail;
    const criticalThreshold = settingsData.criticalHumidityLimit;

    // Abort if email is missing/invalid or alerts disabled
    if (!alertsEnabled || !alertEmail || alertEmail.trim() === '') {
        console.log(`Alerts disabled or email missing for user ${userId}. Aborting alert.`);
        return;
    }

    // Dynamic Threshold: Replace the hardcoded 70% with fetched threshold
    const threshold = criticalThreshold ?? 70; // Fallback just in case

    // Only proceed if humidity exceeds the critical threshold
    if (logData.humidity <= threshold) {
        return;
    }

    const lastAlertSent = deviceData.lastAlertSent;
    // Hysteresis: Check if an alert was sent in the last 3 hours
    if (lastAlertSent) {
        const threeHoursAgo = Date.now() - (3 * 60 * 60 * 1000);
        if (lastAlertSent.toMillis() > threeHoursAgo) {
            console.log(`Alert for ${deviceID} skipped due to 3-hour hysteresis loop.`);
            return;
        }
    }

    // Initialize Mailjet
    const mailjet = new Mailjet({
        apiKey: process.env.MAILJET_API_KEY,
        apiSecret: process.env.MAILJET_SECRET_KEY
    });

    const eventTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });

    // Modern HTML Email Template
    const htmlBody = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background-color: #d32f2f; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 600;">⚠️ Critical Humidity Alert</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff; color: #333333;">
                <p style="font-size: 16px; line-height: 1.5; margin-top: 0;">MoldGuard has detected critical humidity levels that pose a high risk of mold growth.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #555;">Device ID</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right; color: #111;">${deviceID}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #555;">Time of Event</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right; color: #111;">${eventTime}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #d32f2f;">Humidity Level</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: bold; color: #d32f2f;">${logData.humidity}%</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #555;">Temperature</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right; color: #111;">${logData.temperature}&deg;C</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; font-weight: bold; color: #555;">Light Level</td>
                        <td style="padding: 12px; text-align: right; color: #111;">${logData.lightLevel}</td>
                    </tr>
                </table>

                <p style="font-size: 14px; color: #666; margin-bottom: 0;">Please take immediate action to ventilate or dehumidify the area.</p>
            </div>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #999;">
                <p style="margin: 0;">This is an automated alert generated by MoldGuard IoT System.</p>
            </div>
        </div>
    `;

    try {
        await mailjet.post("send", { 'version': 'v3.1' }).request({
            "Messages": [
                {
                    "From": {
                        "Email": process.env.ALERT_FROM_EMAIL,
                        "Name": "MoldGuard Alerts"
                    },
                    "To": [
                        {
                            "Email": alertEmail,
                            "Name": "Administrator"
                        }
                    ],
                    "Subject": `[CRITICAL] Humidity Alert: ${deviceID} (${logData.humidity}%)`,
                    "HTMLPart": htmlBody
                }
            ]
        });

        console.log(`Successfully sent alert email for ${deviceID}`);

        // State Update: Update lastAlertSent to reset hysteresis loop
        await deviceRef.set({
            lastAlertSent: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

    } catch (error) {
        console.error("Failed to send Mailjet email or update device:", error);
    }
});
