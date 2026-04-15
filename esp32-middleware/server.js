require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const admin = require('firebase-admin');

// 1. Initialize Firebase Admin SDK
// Securely load service account from Environment Variables.
let serviceAccount;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    }
} catch (error) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", error);
}

if (serviceAccount) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} else {
    // Fallback: This relies on the GOOGLE_APPLICATION_CREDENTIALS environment variable
    admin.initializeApp();
}

const db = admin.firestore();

// 2. Express Configuration & Basic Hardening
const app = express();
const PORT = process.env.PORT || 3000;

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

// 7. Start the server
app.listen(PORT, () => {
    console.log(`[IoT Bridge Server] Listening on port ${PORT}`);
});
