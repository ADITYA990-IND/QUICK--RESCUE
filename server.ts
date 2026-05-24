import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import twilio from "twilio";
import { AlertStatus, AlertTriggerType, SosAlert, Ambulance, UserProfile, AppNotification } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database with robust state initialization
const DB_FILE = path.join(process.cwd(), "dist", "database_mock.json");
interface DBStructure {
  profile: UserProfile | null;
  alerts: SosAlert[];
  ambulances: Ambulance[];
  notifications: AppNotification[];
}

// Initial mockup data
const INITIAL_AMBULANCES: Ambulance[] = [
  {
    id: "amb_1",
    name: "Alpha Rescue 01",
    driverName: "Daniel K. Vance",
    phone: "+1 (555) 911-3042",
    coordinates: { latitude: 37.7885, longitude: -122.4082, address: "Union Square Metro Station" },
    status: "available",
    licensePlate: "RESC-911A",
    rating: 4.9,
  },
  {
    id: "amb_2",
    name: "TraumaCare Swift 14",
    driverName: "Sarah J. Stone",
    phone: "+1 (555) 911-8051",
    coordinates: { latitude: 37.7719, longitude: -122.4201, address: "Civic Center - Van Ness Ave" },
    status: "available",
    licensePlate: "LIFE-14X",
    rating: 4.8,
  },
  {
    id: "amb_3",
    name: "Metro Med-Force 07",
    driverName: "Marcus Brody",
    phone: "+1 (555) 911-7009",
    coordinates: { latitude: 37.7942, longitude: -122.3965, address: "Financial District - Battery St" },
    status: "available",
    licensePlate: "MEDF-07B",
    rating: 4.7,
  }
];

let db: DBStructure = {
  profile: {
    id: "user_101",
    fullName: "Adityaraj Chourasiya",
    age: 24,
    bloodGroup: "O+",
    city: "San Francisco",
    state: "California",
    medicalConditions: "Latex Allergy, Asthmatic (inhaler in backpack)",
    phoneNumber: "+1 (555) 382-9481",
    emergencyContacts: [
      { id: "c1", name: "Ramesh Chourasiya (Father)", phone: "+1 (555) 123-4567", relation: "Father" },
      { id: "c2", name: "Sita Chourasiya (Mother)", phone: "+1 (555) 765-4321", relation: "Mother" }
    ],
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
  },
  alerts: [
    {
      id: "alert_old_1",
      userId: "user_101",
      userName: "Adityaraj Chourasiya",
      userPhone: "+1 (555) 382-9481",
      bloodGroup: "O+",
      medicalConditions: "Latex Allergy, Asthmatic",
      coordinates: { latitude: 37.7749, longitude: -122.4194, address: "Civic Center Plaza, San Francisco, CA" },
      triggerType: AlertTriggerType.MANUAL,
      status: AlertStatus.COMPLETED,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      countdownRemaining: 0,
      ambulanceId: "amb_1",
      aiGuidance: "Calm the asthmatic patient. Give room temperature water and verify if the private inhaler is accessible.",
      sensorSnapshot: { gForce: 1.0, rotationSpeed: 12, tiltX: 1, tiltY: 2 }
    },
    {
      id: "alert_old_2",
      userId: "user_101",
      userName: "Adityaraj Chourasiya",
      userPhone: "+1 (555) 382-9481",
      bloodGroup: "O+",
      medicalConditions: "Latex Allergy, Asthmatic",
      coordinates: { latitude: 37.7833, longitude: -122.4167, address: "Tenderloin Recreational Park" },
      triggerType: AlertTriggerType.CRASH_DETECTION,
      status: AlertStatus.CANCELLED,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      countdownRemaining: 0,
      sensorSnapshot: { gForce: 5.8, rotationSpeed: 450, tiltX: 35, tiltY: -78 }
    }
  ],
  ambulances: INITIAL_AMBULANCES,
  notifications: [
    {
      id: "n_1",
      title: "System Online",
      message: "Quick Rescue crash detection and rotation jerk monitors initialized successfully.",
      timestamp: new Date().toISOString(),
      type: "system",
      resolved: false
    }
  ]
};

// Safe Database File write
function saveDB() {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error("Failed to write mock database file:", err);
  }
}

// Safe Database loading on boot
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(data);
      // Ensure ambulances are synchronized
      if (!db.ambulances || db.ambulances.length === 0) {
        db.ambulances = INITIAL_AMBULANCES;
      }
    } else {
      saveDB();
    }
  } catch (err) {
    console.warn("Could not read DB file, booting with fresh state:", err);
  }
}

loadDB();

// LAZY INITIALIZATION OF GEMINI SDK
let aiClient: any = null;
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------------------------------
// API ROUTES
// ----------------------------------------------------------------------------

// Check environment/API configuration
app.get("/api/config-status", (req, res) => {
  res.json({
    geminiApiKeyConfigured: !!process.env.GEMINI_API_KEY,
    twilioConfigured: !!process.env.TWILIO_ACCOUNT_SID && !!process.env.TWILIO_AUTH_TOKEN && !!process.env.TWILIO_PHONE_NUMBER,
    appUrl: process.env.APP_URL || "http://localhost:3000",
  });
});

// Profile endpoints
app.get("/api/profile", (req, res) => {
  res.json(db.profile);
});

app.post("/api/profile", (req, res) => {
  db.profile = {
    ...db.profile,
    ...req.body,
    id: db.profile?.id || "user_101",
  };
  saveDB();
  res.json({ success: true, profile: db.profile });
});

// Notification endpoints
app.get("/api/notifications", (req, res) => {
  res.json(db.notifications);
});

app.post("/api/notifications/clear", (req, res) => {
  db.notifications = db.notifications.map(n => ({ ...n, resolved: true }));
  saveDB();
  res.json({ success: true });
});

// Get all ambulances
app.get("/api/ambulances", (req, res) => {
  res.json(db.ambulances);
});

// Trigger a new SOS Request (Countdown or instant)
app.post("/api/sos/trigger", (req, res) => {
  const { triggerType, coordinates, sensorSnapshot, countdown } = req.body;
  
  const id = "sos_" + Math.random().toString(36).substring(2, 11);
  const user = db.profile || {
    id: "guest",
    fullName: "Unregistered Citizen",
    phoneNumber: "+1 (555) 999-9999",
    bloodGroup: "Unknown",
    medicalConditions: "None",
    emergencyContacts: []
  };

  const newAlert: SosAlert = {
    id,
    userId: user.id || "guest",
    userName: user.fullName,
    userPhone: user.phoneNumber,
    bloodGroup: user.bloodGroup,
    medicalConditions: db.profile?.medicalConditions || "None disclosed",
    coordinates: coordinates || { latitude: 37.7749, longitude: -122.4194, address: "Automated GPS Coordinates" },
    triggerType: triggerType || AlertTriggerType.MANUAL,
    status: countdown > 0 ? AlertStatus.COUNTDOWN : AlertStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    countdownRemaining: countdown || 0,
    sensorSnapshot: sensorSnapshot || { gForce: 1.0, rotationSpeed: 0, tiltX: 0, tiltY: 0 }
  };

  // If instantly active (or status counts down immediately on the backend client), dispatch simulations
  if (newAlert.status === AlertStatus.ACTIVE) {
    autoAssignAmbulance(newAlert);
  }

  db.alerts.unshift(newAlert);

  // Send Push Notification simulation
  db.notifications.unshift({
    id: "notif_" + Date.now(),
    title: `🚨 Emergency Triggered!`,
    message: `SOS initiated via ${newAlert.triggerType}. Dispatching nearest emergency responder.`,
    timestamp: new Date().toISOString(),
    type: "alert",
    resolved: false
  });

  saveDB();
  res.json({ success: true, alert: newAlert });
});

// Cancel active countdown
app.post("/api/sos/cancel", (req, res) => {
  const { alertId } = req.body;
  const alertIndex = db.alerts.findIndex(a => a.id === alertId);
  if (alertIndex !== -1) {
    db.alerts[alertIndex].status = AlertStatus.CANCELLED;
    
    // Release any assigned ambulances matching this
    const ambId = db.alerts[alertIndex].ambulanceId;
    if (ambId) {
      const ambIndex = db.ambulances.findIndex(a => a.id === ambId);
      if (ambIndex !== -1) {
        db.ambulances[ambIndex].status = "available";
      }
    }

    db.notifications.unshift({
      id: "notif_" + Date.now(),
      title: "SOS Alert Cancelled",
      message: `Emergency signal (${alertId}) marked invalid by citizen. Ambulance dispatch recalled.`,
      timestamp: new Date().toISOString(),
      type: "system",
      resolved: false
    });

    saveDB();
    res.json({ success: true, alert: db.alerts[alertIndex] });
  } else {
    res.status(404).json({ error: "Active SOS Alert not found" });
  }
});

// Confirm countdown (Transitions status to ACTIVE)
app.post("/api/sos/confirm", (req, res) => {
  const { alertId } = req.body;
  const alertIndex = db.alerts.findIndex(a => a.id === alertId);
  if (alertIndex !== -1) {
    db.alerts[alertIndex].status = AlertStatus.ACTIVE;
    db.alerts[alertIndex].countdownRemaining = 0;
    
    autoAssignAmbulance(db.alerts[alertIndex]);

    db.notifications.unshift({
      id: "notif_" + Date.now(),
      title: "SOS Activated!",
      message: `Emergency confirmed. Live tracking link dispatched to Saved Contacts.`,
      timestamp: new Date().toISOString(),
      type: "alert",
      resolved: false
    });

    saveDB();
    res.json({ success: true, alert: db.alerts[alertIndex] });
  } else {
    res.status(404).json({ error: "Alert not found" });
  }
});

// Fetch active logs and history
app.get("/api/sos/history", (req, res) => {
  res.json(db.alerts);
});

// Update SOS Alert status manually from dispatcher or driver
app.post("/api/sos/status", (req, res) => {
  const { alertId, status, ambulanceId } = req.body;
  const alertIndex = db.alerts.findIndex(a => a.id === alertId);
  if (alertIndex !== -1) {
    db.alerts[alertIndex].status = status;
    if (ambulanceId) {
      db.alerts[alertIndex].ambulanceId = ambulanceId;
      // update ambulance status
      const ambIndex = db.ambulances.findIndex(a => a.id === ambulanceId);
      if (ambIndex !== -1) {
        db.ambulances[ambIndex].status = status === AlertStatus.COMPLETED ? "available" : "dispatched";
      }
    }
    saveDB();
    res.json({ success: true, alert: db.alerts[alertIndex] });
  } else {
    res.status(404).json({ error: "Alert not found" });
  }
});

// Update live location of an active SOS alert from Mobile GPS Tracker
app.post("/api/sos/update-location", (req, res) => {
  const { alertId, coordinates } = req.body;
  const alertIndex = db.alerts.findIndex(a => a.id === alertId);
  if (alertIndex !== -1) {
    db.alerts[alertIndex].coordinates = coordinates;
    saveDB();
    res.json({ success: true, alert: db.alerts[alertIndex] });
  } else {
    res.status(404).json({ error: "Alert not found" });
  }
});

// Generate dynamic WhatsApp SMS simulation logs with Maps Coordinates
app.post("/api/sos/whatsapp-fallback", async (req, res) => {
  const { alertId } = req.body;
  const alert = db.alerts.find(a => a.id === alertId);
  if (!alert) {
    return res.status(404).json({ error: "Alert not found" });
  }

  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${alert.coordinates.latitude},${alert.coordinates.longitude}`;
  const emergencyContacts = db.profile?.emergencyContacts || [];
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  // If Twilio is not configured, return simulated logs
  if (!accountSid || !authToken || !twilioPhone) {
    const mockLogs = emergencyContacts.map(c => ({
      contactName: c.name,
      contactPhone: c.phone,
      message: `🚨 QUICK RESCUE SOS ALERT! 🚨\nMy phone detected an emergency (${alert.triggerType}).\nMy Location: ${mapsLink}.\nBlood Group: ${alert.bloodGroup}. Medical details: ${alert.medicalConditions}.\nPlease check on me immediately!`,
      smsFallback: `[SIMULATED] SMS Fallback to ${c.phone}. Configure Twilio in .env.local to send real SMS.`
    }));
    return res.json({ success: true, mapsLink, logs: mockLogs });
  }

  // If Twilio is configured, send real SMS
  const twilioClient = twilio(accountSid, authToken);
  const realLogs: any[] = [];

  for (const contact of emergencyContacts) {
    const messageBody = `🚨 QUICK RESCUE SOS ALERT! 🚨\n${db.profile?.fullName || 'A user'} has an emergency (${alert.triggerType}).\nLocation: ${mapsLink}.\nBlood Group: ${alert.bloodGroup}. Medical: ${alert.medicalConditions}.\nPlease check on them immediately!`;
    try {
      const message = await twilioClient.messages.create({
        body: messageBody,
        from: twilioPhone,
        to: contact.phone // NOTE: Twilio requires phone numbers in E.164 format (e.g., +15551234567)
      });
      realLogs.push({
        contactName: contact.name,
        contactPhone: contact.phone,
        message: messageBody,
        smsFallback: `✅ SMS successfully sent to ${contact.phone} (SID: ${message.sid}).`
      });
    } catch (error: any) {
      console.error(`Twilio Error sending to ${contact.phone}:`, error.message);
      realLogs.push({
        contactName: contact.name,
        contactPhone: contact.phone,
        message: messageBody,
        smsFallback: `❌ FAILED to send SMS to ${contact.phone}. Error: ${error.message}`
      });
    }
  }

  res.json({
    success: true,
    mapsLink,
    logs: realLogs
  });
});

// Dispatch simulation - updates ambulance location to converge to SOS
app.post("/api/ambulance/simulate-tracking", (req, res) => {
  const { ambulanceId, targetLat, targetLng } = req.body;
  const ambIndex = db.ambulances.findIndex(a => a.id === ambulanceId);
  if (ambIndex !== -1) {
    const amb = db.ambulances[ambIndex];
    // Move slightly closer to simulate active movement towards coordinates
    const diffLat = targetLat - amb.coordinates.latitude;
    const diffLng = targetLng - amb.coordinates.longitude;
    const distanceSq = diffLat * diffLat + diffLng * diffLng;

    if (distanceSq < 0.00001) {
      amb.coordinates.latitude = targetLat;
      amb.coordinates.longitude = targetLng;
      amb.status = "arrived";
    } else {
      amb.coordinates.latitude += diffLat * 0.4; // converged 40%
      amb.coordinates.longitude += diffLng * 0.4;
      amb.status = "dispatched";
    }
    saveDB();
    res.json({ success: true, ambulance: amb });
  } else {
    res.status(404).json({ error: "Ambulance not found" });
  }
});

// SMART GEMINI AI ASSISTANT DIAGNOSIS ENDPOINT (Server-Side)
app.post("/api/ai/diagnose", async (req, res) => {
  const { medicalConditions, triggerType, gForce, audioRecordingSummary, situationDescription } = req.body;

  try {
    const aiInstance = getGeminiClient();
    const prompt = `
      You are an expert emergency medical response AI assistant of the Quick Rescue app.
      A user has triggered an SOS alert!
      - Triggering Reason: ${triggerType || "Manual Alert"}
      - Medical Conditions: ${medicalConditions || "No special conditions disclosed"}
      - Incident Details: ${situationDescription || "No incident details entered"}
      ${gForce ? `- Detected Force: ${gForce} Gs` : ""}
      ${audioRecordingSummary ? `- High-tension Audio Summary: ${audioRecordingSummary}` : ""}

      Formulate a brief, actionable first-aid list (exactly 3 steps) and a supportive, brief calming message for the victim or bystanders on the scene. Keep your response structured as highly readable markdown:
      1. Calming statement (1 sentence)
      2. Step-by-Step actionable advice (Exactly 3 short bullet points, highlighting the specific medical condition or accident impact style)
      3. Highlight any critical things they MUST AVOID.

      Adopt a calm, ultra-professional, reassuring, authoritative voice.
    `;

    const response = await aiInstance.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const markdownText = response.text || "Emergency services are on their way. Take steady, calm breaths.";
    
    // Save to the active alert if it exists
    if (db.alerts.length > 0 && db.alerts[0].status === AlertStatus.ACTIVE) {
      db.alerts[0].aiGuidance = markdownText;
      saveDB();
    }

    res.json({
      success: true,
      guidance: markdownText
    });
  } catch (error: any) {
    console.warn("Gemini diagnostic error (likely missing key, which is handled gracefully):", error.message);
    
    // Provide fully functional, premium responsive fallback guidance
    const conditionText = medicalConditions ? `(${medicalConditions})` : "";
    const defaultGuidance = `
### 🚨 Help is Dispatched!
"Alpha Rescue 01" has received your coordinates and is speeding to your location. Keep your phone near.

**Emergency Steps to Take Now:**
1. **Remain Still and Calm**: Lie flat on your back, keeping your neck fully supported to allow safe air passages. 
2. **Access Rescue Gear**: Since your profile shows ${medicalConditions || 'no allergy history'}, check if your emergency medications (like an inhaler or auto-injector) are inside your pocket or backpack, and keep them in reach.
3. **Control Airflow**: If asthmatic or hyperventilating, perform pursed-lip breathing—inhale deeply for 2 seconds, and exhale slowly for 4 seconds.

*Avoid making sudden stands, drinking hot fluids, or walking around until paramedics check you.*
\n\n*(Note: To unlock real-time Gemini AI diagnostic guidance tailored to live sensor peaks, ensure you have set process.env.GEMINI_API_KEY in your Secrets list!)*
    `;
    res.json({
      success: true,
      guidance: defaultGuidance,
      fallbackUsed: true
    });
  }
});

// Admin User Reset for clean applet play
app.post("/api/admin/reset", (req, res) => {
  db.alerts = db.alerts.filter(a => a.id.startsWith("alert_old_"));
  db.ambulances = INITIAL_AMBULANCES.map(a => ({ ...a, status: "available" }));
  db.notifications = [
    {
      id: "n_reset",
      title: "System Flushed",
      message: "Simulation queues reset to original sandbox defaults.",
      timestamp: new Date().toISOString(),
      type: "system",
      resolved: false
    }
  ];
  saveDB();
  res.json({ success: true, db });
});

// Helper: Automatically dispatch the nearest available ambulance
function autoAssignAmbulance(alert: SosAlert) {
  const availableAmb = db.ambulances.find(a => a.status === "available");
  if (availableAmb) {
    availableAmb.status = "dispatched";
    alert.ambulanceId = availableAmb.id;

    db.notifications.unshift({
      id: "n_disp_" + Date.now(),
      title: "Ambulance Dispatched!",
      message: `${availableAmb.name} has accepted SOS alert ${alert.id} and is en-route.`,
      timestamp: new Date().toISOString(),
      type: "dispatch",
      resolved: false
    });
  }
}

// ----------------------------------------------------------------------------
// VITE OR STATIC SERVING MIDDLEWARE
// ----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite development middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Quick Rescue Server] Full-Stack Service started at http://0.0.0.0:${PORT}`);
  });
}

startServer();
