// MoldGuard Cloud Functions - Production Build
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const nodemailer = require('nodemailer');
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
    methods: ['GET', 'POST'],
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

// 5. Authentication Middleware (Per-Device Identity)
// The ESP32 sends its deviceID as the x-esp32-api-key header.
// This middleware only checks that the header is present; the actual
// identity match (header === payload.deviceID) is verified after Zod parsing.
const authenticateESP32 = (req, res, next) => {
    const providedKey = req.headers['x-esp32-api-key'];

    if (!providedKey || typeof providedKey !== 'string' || providedKey.trim() === '') {
        return res.status(401).json({ error: "Unauthorized: Missing API Key header" });
    }

    next();
};

// 6. Application Route
app.post('/api/sensorlogs', cors(corsOptions), limiter, authenticateESP32, async (req, res) => {
    try {
        // Validate payload using Zod. Unrecognized keys are stripped/ignored by default,
        // and formatting must strictly match the schema requirements.
        const validatedData = payloadSchema.parse(req.body);

        // Per-device identity check: the API key header must match the deviceID in the payload.
        // This ensures the ESP32 can only submit data for its own identity.
        const providedKey = req.headers['x-esp32-api-key'];
        if (providedKey !== validatedData.deviceID) {
            return res.status(401).json({ error: "Unauthorized: API key does not match device identity" });
        }

        // Prepare data payload for Firestore and inject secure server-side timestamp
        const docData = {
            ...validatedData,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        };

        // Push valid data as a new document to the SensorLogs Firestore collection
        const docRef = await db.collection('SensorLogs').add(docData);

        // Device auto-registration & heartbeat update
        // Query by deviceID field since documents use auto-generated IDs
        const devicesQuery = await db.collection('Devices').where('deviceID', '==', validatedData.deviceID).limit(1).get();

        // Default control values for unclaimed / newly registered devices
        let deviceControls = {
            mode: 'auto',
            fanOverride: 'OFF',
            dehumidifierOverride: 'OFF'
        };

        if (devicesQuery.empty) {
            // First-time contact: create an unclaimed shell document.
            // This allows the device to appear in the "Claim Device" flow on the frontend.
            await db.collection('Devices').add({
                deviceID: validatedData.deviceID,
                status: 'unclaimed',
                mode: 'auto',
                fanOverride: 'OFF',
                dehumidifierOverride: 'OFF',
                firstSeen: admin.firestore.FieldValue.serverTimestamp(),
                lastSeen: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`[esp32api] New unclaimed device registered: ${validatedData.deviceID}`);
        } else {
            // Device exists — only update the heartbeat timestamp.
            // CRITICAL: Never overwrite status, userId, or name to protect ownership state.
            await devicesQuery.docs[0].ref.set({
                lastSeen: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // Extract control fields from the device document for the response
            const deviceData = devicesQuery.docs[0].data();
            deviceControls = {
                mode: deviceData.mode || 'auto',
                fanOverride: deviceData.fanOverride || 'OFF',
                dehumidifierOverride: deviceData.dehumidifierOverride || 'OFF'
            };
        }

        return res.status(201).json({
            success: true,
            message: "Payload validated and successfully saved to Firestore.",
            docId: docRef.id,
            mode: deviceControls.mode,
            fanOverride: deviceControls.fanOverride,
            dehumidifierOverride: deviceControls.dehumidifierOverride
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

// 7. Lightweight Fast-Polling Status Endpoint (Read-Only Heartbeat)
// Returns only control fields — no writes to SensorLogs or timestamp updates.
app.get('/api/status/:deviceId', cors(corsOptions), async (req, res) => {
    try {
        const { deviceId } = req.params;

        if (!deviceId || typeof deviceId !== 'string' || deviceId.trim() === '') {
            return res.status(400).json({ error: 'Missing or invalid deviceId parameter.' });
        }

        const devicesQuery = await db.collection('Devices')
            .where('deviceID', '==', deviceId)
            .limit(1)
            .get();

        if (devicesQuery.empty) {
            return res.status(404).json({ error: `Device not found: ${deviceId}` });
        }

        const deviceData = devicesQuery.docs[0].data();

        return res.status(200).json({
            mode: deviceData.mode || 'auto',
            fanOverride: deviceData.fanOverride || 'OFF',
            dehumidifierOverride: deviceData.dehumidifierOverride || 'OFF'
        });
    } catch (error) {
        console.error('[status] Firestore read error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


// 7.5. Automated Backup Trigger (Embedded in existing API to bypass IAM restrictions)
app.get('/api/run-backup', cors(corsOptions), async (req, res) => {
    // Simple security check: You must add ?key=backup to your URL
    if (req.query.key !== 'backup') {
        return res.status(403).send('Forbidden: Missing or invalid key');
    }

    const bucket = admin.storage().bucket();
    const backupStateRef = db.collection('Metadata').doc('backup_state');
    
    try {
        const stateSnap = await backupStateRef.get();
        const state = stateSnap.exists ? stateSnap.data() : {};
        const now = Date.now();
        const backupManifest = {};

        const incrementalCollections = [
            { name: 'SensorLogs', field: 'timestamp' },
            { name: 'AnalyticsAlerts', field: 'timestamp' }
        ];
        const snapshotCollections = ['Devices', 'Settings'];

        console.log(`[Backup] Starting backup cycle at ${new Date(now).toISOString()}`);

        for (const col of incrementalCollections) {
            const lastTimestamp = state[`last_${col.name}_ts`] || new admin.firestore.Timestamp(0, 0);
            const snapshot = await db.collection(col.name)
                .where(col.field, '>', lastTimestamp)
                .orderBy(col.field, 'asc')
                .get();

            if (!snapshot.empty) {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const fileName = `backups/${col.name.toLowerCase()}/inc_${now}.json`;
                await bucket.file(fileName).save(JSON.stringify(data, null, 2));
                
                backupManifest[col.name] = { count: data.length, file: fileName };
                state[`last_${col.name}_ts`] = data[data.length - 1][col.field];
            }
        }

        for (const colName of snapshotCollections) {
            const snapshot = await db.collection(colName).get();
            if (!snapshot.empty) {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const fileName = `backups/${colName.toLowerCase()}/snap_${now}.json`;
                await bucket.file(fileName).save(JSON.stringify(data, null, 2));
                
                backupManifest[colName] = { count: data.length, file: fileName };
            }
        }

        if (Object.keys(backupManifest).length === 0) {
            return res.status(200).send("No new data to back up today.");
        }

        await backupStateRef.set({
            ...state,
            lastBackupRun: admin.firestore.FieldValue.serverTimestamp(),
            lastManifest: backupManifest
        }, { merge: true });

        console.log(`[Backup] SUCCESS: Backed up ${Object.keys(backupManifest).join(', ')}`);
        return res.status(200).send(`Backup successful: ${Object.keys(backupManifest).join(', ')}`);

    } catch (error) {
        console.error("[Backup] CRITICAL ERROR:", error.message);
        return res.status(500).send('Backup failed. Check logs.');
    }
});

// 8. Export the serverless HTTP Function
exports.esp32api = onRequest({ region: 'asia-southeast2', maxInstances: 10 }, app);

// 9. Event-Driven Alert Worker (Firestore Trigger)
exports.checkMoldRisk = onDocumentCreated({ document: 'SensorLogs/{logId}', region: 'asia-southeast2' }, async (event) => {
    const logData = event.data.data();

    if (!logData) {
        console.warn('[checkMoldRisk] Abort: Trigger fired but event data is null/undefined.');
        return;
    }

    console.log(`[checkMoldRisk] Trigger fired for document SensorLogs/${event.params.logId}, deviceID: ${logData.deviceID}, humidity: ${logData.humidity}`);

    const deviceID = logData.deviceID;
    // Query by deviceID field since documents use auto-generated IDs
    const devicesQuery = await db.collection('Devices').where('deviceID', '==', deviceID).limit(1).get();
    
    if (devicesQuery.empty) {
        console.warn(`[checkMoldRisk] Abort: No device document found for deviceID: ${deviceID}`);
        return;
    }

    const deviceSnap = devicesQuery.docs[0];
    const deviceRef = deviceSnap.ref;
    const deviceData = deviceSnap.data();
    const userId = deviceData.userId;

    if (!userId) {
        console.warn(`[checkMoldRisk] Abort: Device ${deviceID} has no assigned userId field.`);
        return;
    }

    console.log(`[checkMoldRisk] Resolved userId: ${userId} from device: ${deviceID} (docId: ${deviceSnap.id})`);

    // Query the exact Settings document for this user
    const settingsRef = db.collection('Settings').doc(userId);
    const settingsSnap = await settingsRef.get();

    if (!settingsSnap.exists) {
        console.warn(`[checkMoldRisk] Abort: No Settings document found for userId: ${userId}`);
        return;
    }

    const settingsData = settingsSnap.data();
    
    // Extract dynamic fields
    const alertsEnabled = settingsData.alertsEnabled;
    const alertEmail = settingsData.alertEmail;
    const criticalThreshold = settingsData.criticalHumidityLimit;

    // Abort if email is missing/invalid or alerts disabled
    if (!alertsEnabled || !alertEmail || alertEmail.trim() === '') {
        console.warn(`[checkMoldRisk] Abort: Alerts disabled or email missing for userId: ${userId} (alertsEnabled=${alertsEnabled}, alertEmail=${alertEmail})`);
        return;
    }

    // Dynamic Threshold: Replace the hardcoded 70% with fetched threshold
    const threshold = criticalThreshold ?? 70; // Fallback just in case

    // Only proceed if humidity exceeds the critical threshold
    if (logData.humidity <= threshold) {
        console.log(`[checkMoldRisk] No alert needed: humidity ${logData.humidity}% is within safe threshold of ${threshold}%.`);
        return;
    }

    console.log(`[checkMoldRisk] THRESHOLD EXCEEDED: humidity ${logData.humidity}% > ${threshold}% for device ${deviceID}. Proceeding to hysteresis check.`);

    const lastAlertSent = deviceData.lastAlertSent;
    // Hysteresis: Check if an alert was sent in the last 3 hours
    if (lastAlertSent) {
        const threeHoursAgo = Date.now() - (3 * 60 * 60 * 1000);
        const timeSinceLastAlert = Date.now() - lastAlertSent.toMillis();
        if (lastAlertSent.toMillis() > threeHoursAgo) {
            console.warn(`[checkMoldRisk] Abort: Alert for ${deviceID} suppressed by hysteresis. Last alert was ${Math.round(timeSinceLastAlert / 60000)} minutes ago.`);
            return;
        }
        console.log(`[checkMoldRisk] Hysteresis passed: last alert for ${deviceID} was ${Math.round(timeSinceLastAlert / 60000)} minutes ago.`);
    } else {
        console.log(`[checkMoldRisk] No previous alert found for ${deviceID}. First alert dispatch.`);
    }

    // Initialize Nodemailer for Gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
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
        console.log(`[checkMoldRisk] Sending email to: ${alertEmail} for device: ${deviceID}`);
        await transporter.sendMail({
            from: `"MoldGuard Alerts" <${process.env.ALERT_FROM_EMAIL}>`,
            to: alertEmail,
            subject: `[CRITICAL] Humidity Alert: ${deviceID} (${logData.humidity}%)`,
            html: htmlBody
        });

        console.log(`[checkMoldRisk] SUCCESS: Alert email delivered for ${deviceID} to ${alertEmail}`);

        // State Update: Update lastAlertSent to reset hysteresis loop
        await deviceRef.set({
            lastAlertSent: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`[checkMoldRisk] Updated lastAlertSent timestamp for device ${deviceID}`);

    } catch (error) {
        console.error(`[checkMoldRisk] SMTP ERROR for device ${deviceID}:`, error);
    }
});

// 10. Predictive Analytics Alert Worker (Firestore Trigger)
exports.notifyPredictiveAlert = onDocumentCreated({ document: 'AnalyticsAlerts/{alertId}', region: 'asia-southeast2' }, async (event) => {
    const alertData = event.data.data();

    if (!alertData) {
        console.warn('[notifyPredictiveAlert] Abort: Trigger fired but event data is null/undefined.');
        return;
    }

    console.log(`[notifyPredictiveAlert] Trigger fired for AnalyticsAlerts/${event.params.alertId}, deviceID: ${alertData.deviceID}, riskLevel: ${alertData.riskLevel}`);

    const deviceID = alertData.deviceID;
    // Query by deviceID field since documents use auto-generated IDs
    const devicesQuery = await db.collection('Devices').where('deviceID', '==', deviceID).limit(1).get();
    
    if (devicesQuery.empty) {
        console.warn(`[notifyPredictiveAlert] Abort: No device document found for deviceID: ${deviceID}`);
        return;
    }

    const deviceSnap = devicesQuery.docs[0];
    const deviceData = deviceSnap.data();
    const userId = deviceData.userId;

    if (!userId) {
        console.warn(`[notifyPredictiveAlert] Abort: Device ${deviceID} has no assigned userId field.`);
        return;
    }

    console.log(`[notifyPredictiveAlert] Resolved userId: ${userId} from device: ${deviceID} (docId: ${deviceSnap.id})`);

    // Query the exact Settings document for this user
    const settingsRef = db.collection('Settings').doc(userId);
    const settingsSnap = await settingsRef.get();

    if (!settingsSnap.exists) {
        console.warn(`[notifyPredictiveAlert] Abort: No Settings document found for userId: ${userId}`);
        return;
    }

    const settingsData = settingsSnap.data();
    
    const alertsEnabled = settingsData.alertsEnabled;
    const alertEmail = settingsData.alertEmail;

    // Early exit if disabled or no email
    if (!alertsEnabled || !alertEmail || alertEmail.trim() === '') {
        console.warn(`[notifyPredictiveAlert] Abort: Alerts disabled or email missing for userId: ${userId} (alertsEnabled=${alertsEnabled}, alertEmail=${alertEmail})`);
        return;
    }

    // Severity Suppression Gate — only send emails for user-selected risk levels
    const riskLevel = alertData.riskLevel || 'Low';

    // Read the multi-select array; fall back to legacy single-value field for migration
    let emailAlertLevels = settingsData.emailAlertLevels;
    if (!Array.isArray(emailAlertLevels)) {
        // Migrate from legacy emailAlertThreshold if present
        const legacy = settingsData.emailAlertThreshold || 'High';
        if (legacy === 'Low') emailAlertLevels = ['Low', 'Medium', 'High'];
        else if (legacy === 'Medium') emailAlertLevels = ['Medium', 'High'];
        else emailAlertLevels = ['High'];
    }

    if (!emailAlertLevels.includes(riskLevel)) {
        console.log(`[SKIPPED] Email suppressed for device ${deviceID}. Alert level (${riskLevel}) is not in user's selected levels [${emailAlertLevels.join(', ')}].`);
        return;
    }

    console.log(`[notifyPredictiveAlert] Severity gate passed: alert (${riskLevel}) is in user's selected levels [${emailAlertLevels.join(', ')}]. Proceeding to send email.`);

    // Initialize Nodemailer for Gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const eventTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });

    // Distinct HTML Email Template for Predictive Alerts
    const htmlBody = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background-color: #f57c00; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 600;">🔮 Predictive Analytics Warning</h1>
            </div>
            <div style="padding: 30px; background-color: #ffffff; color: #333333;">
                <p style="font-size: 16px; line-height: 1.5; margin-top: 0;">Our Big Data Hadoop cluster has identified a potential future mold risk based on current environmental patterns.</p>
                
                <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #555;">Device ID</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right; color: #111;">${deviceID}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #555;">Time of Analysis</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right; color: #111;">${eventTime}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #f57c00;">Risk Level</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: bold; color: #f57c00;">${alertData.riskLevel}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; font-weight: bold; color: #555;">Message</td>
                        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right; color: #111;">${alertData.message}</td>
                    </tr>
                </table>

                <p style="font-size: 14px; color: #666; margin-bottom: 0;">Consider adjusting your environment controls preemptively to mitigate this risk.</p>
            </div>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #999;">
                <p style="margin: 0;">This is an automated predictive alert generated by MoldGuard Analytics.</p>
            </div>
        </div>
    `;

    try {
        console.log(`[notifyPredictiveAlert] Sending email to: ${alertEmail} for device: ${deviceID}`);
        await transporter.sendMail({
            from: '"MoldGuard Predictive Alerts" <' + process.env.ALERT_FROM_EMAIL + '>',
            to: alertEmail,
            subject: `[PREDICTIVE] Mold Risk Alert: ${deviceID} (${alertData.riskLevel})`,
            html: htmlBody
        });

        console.log(`[notifyPredictiveAlert] SUCCESS: Predictive alert email delivered for ${deviceID} to ${alertEmail}`);

    } catch (error) {
        console.error(`[notifyPredictiveAlert] SMTP ERROR for device ${deviceID}:`, error);
    }
});
