# 🚑 Quick Rescue

<div align="center">

![Quick Rescue Banner](https://img.shields.io/badge/Quick%20Rescue-Emergency%20SOS-red?style=for-the-badge&logo=applehealth)
![React Native](https://img.shields.io/badge/React%20Native-Mobile%20App-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)
![Firebase](https://img.shields.io/badge/Auth-Firebase-FFCA28?style=for-the-badge&logo=firebase)

<h4>⚡ AI-Powered Emergency SOS & Crash Detection Platform</h4>
<strong>"Every Second Matters."</strong>

</div>

---

## 📌 Overview

**Quick Rescue** is a modern, mobile-first emergency response application designed to provide instant assistance during accidents and critical medical situations. 

By leveraging mobile device sensors (Accelerometer & Gyroscope), the app intelligently detects severe impacts, crashes, or falls. It automatically triggers an emergency countdown, sending real-time GPS locations and automated alerts to emergency contacts and the nearest available ambulance network if not canceled.

---

## ✨ Key Features

* **🚨 Smart Crash Detection:** Utilizes hardware sensors via Expo Sensors to track sudden impacts, severe jerks, and subsequent inactivity. Includes a safety countdown to prevent false alarms.
* **📍 Live GPS Tracking & Navigation:** Integrated with Google Maps API to provide live ambulance routing, precise location coordinates, and accurate ETA estimations.
* **🆘 Multi-Channel Emergency SOS:** Automatically broadcasts alerts via SMS (via Twilio) and WhatsApp to pre-configured emergency contacts.
* **🚑 Ambulance Coordination:** Real-time pairing and communication between victims and nearby ambulance drivers via Socket.IO.
* **🔐 Secure Authentication:** Seamless user login via Firebase (Gmail) coupled with secure JWT-based API route protection.
* **🌐 Multi-Language Support:** Localized user interface available in both **English** and **Hindi**.

---

## 🧠 Crash Detection Logic Flow

```text
[ Sensor Monitoring ] ──> ( Sudden Impact/Jerk Detected )
                                    │
                                    ▼
                        [ Emergency Countdown Starts ]
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
         [ User Cancels Alert ]          [ Countdown Expires ]
                    │                               │
                    ▼                               ▼
            ( System Resets )            ( AUTOMATIC SOS TRIGGERED )
                                                    │
                                    ┌───────────────┴───────────────┐
                                    ▼                               ▼
                        [ Broadcast Live Location ]     [ Notify Nearby Ambulances ]

```

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| --- | --- | --- |
| **Frontend** | `React Native / Expo` | Cross-platform native mobile interface |
| **Backend** | `Node.js / Express.js` | Scalable API Gateway & core business logic |
| **Real-time** | `Socket.IO` | Bi-directional live updates & location streaming |
| **Database** | `MongoDB` | Distributed storage for profiles & incident history |
| **Auth** | `Firebase Auth / JWT` | Bulletproof client-to-server identity validation |
| **AI / Alerts** | `Gemini API & Twilio` | Contextual text intelligence & automated SMS routing |

---

## 📂 Project Structure

```bash
Quick-Rescue/
├── 📱 mobile-app/         # React Native frontend client
│   ├── screens/         # Dashboard, Map, Login, and SOS interfaces
│   ├── components/      # Reusable styled UI elements
│   ├── services/        # API calls, Location tracking, and Sensor listeners
│   └── assets/          # Localization strings, icons, and media assets
├── ⚙️ backend/            # Node.js + Express development server
│   ├── controllers/     # Modular route logic handlers
│   ├── models/          # MongoDB structural schemas (User, Ambulance, Incident)
│   ├── middleware/      # Authentication barriers & error interceptors
│   └── server.js        # Main Express and Socket.io setup entry point
└── README.md

```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js** (v18+ recommended)
* **Expo CLI** installed globally (`npm install -g expo-cli`)

### 1. Repository Setup

```bash
git clone [https://github.com/your-username/Quick-Rescue.git](https://github.com/your-username/Quick-Rescue.git)
cd Quick-Rescue

```

### 2. Environment Configurations

#### 🔓 Backend Environment (`backend/.env`)

Create a `.env` file inside the `backend/` directory:

```env
MONGO_URI="your_mongodb_connection_string"
JWT_SECRET="your_jwt_signing_key"
FIREBASE_API_KEY="your_firebase_api_key"
GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
PORT=5000

```

#### 🔐 Frontend Environment (`mobile-app/.env.local`)

Create a `.env.local` file inside the `mobile-app/` directory:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
TWILIO_ACCOUNT_SID="YOUR_TWILIO_ACCOUNT_SID"
TWILIO_AUTH_TOKEN="YOUR_TWILIO_AUTH_TOKEN"
TWILIO_PHONE_NUMBER="YOUR_TWILIO_PHONE_NUMBER"

```

### 3. Installation & Local Development

#### Setup Backend Server

```bash
cd backend
npm install
npm run dev

```

> 💡 *The backend server will live-reload and spin up on port `5000`.*

#### Setup Mobile Client

```bash
cd ../mobile-app
npm install
npm start

```

> 📱 *Scan the generated Metro QR code with your **Expo Go** app (Android/iOS) to launch the app on your physical device.*

---

## 📈 Future Roadmap

* ⌚ **Smartwatch Integration:** Sync sensor analysis with Wear OS and Apple Watch for fallback fall-detection metrics.
* 🎙️ **Voice-Activated SOS:** Trigger immediate backup protocols using offline phrase-matching algorithms.
* 🛜 **Offline Mesh Mode:** Utilize Bluetooth/P2P capabilities to signal nearby users when cellular signals are completely dropped.

---

## 👨‍💻 Developer

**Aditya Raj Chourasiya** *Passionate about Full-Stack ecosystems, real-time architectures, and impact-driven technologies.*

---

## ⭐ Support

If you find this project meaningful or helpful, please consider **starring** the repository, **forking** it to add your custom features, or **following** for future updates!

