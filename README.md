
<div align="center">
  <img width="800" alt="Quick Rescue Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# 🚨 Quick Rescue

**AI-powered mobile-first emergency SOS application**

---

## 🌟 Features

- **Automatic Accident Detection**: Detects crashes, falls, and sudden impacts using device sensors.
- **SOS Countdown & Broadcast**: Triggers an emergency countdown and sends alerts if not cancelled.
- **Live Location Tracking**: Shares real-time location with emergency contacts and nearby ambulances.
- **Ambulance Coordination**: Notifies and coordinates with the nearest available ambulances.
- **Secure Authentication**: Google (Gmail) login with simulated secure flow.
- **Multi-language Support**: English and Hindi UI.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)

### 1. Clone & Install

```bash
git clone <repo-url>
cd QUICK\ RESCUE
npm install
```

### 2. Install Twilio SDK (for SMS alerts)

```bash
npm install twilio
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
TWILIO_ACCOUNT_SID="YOUR_TWILIO_ACCOUNT_SID"
TWILIO_AUTH_TOKEN="YOUR_TWILIO_AUTH_TOKEN"
TWILIO_PHONE_NUMBER="YOUR_TWILIO_PHONE_NUMBER"
```

Get your keys from [Google AI Studio](https://ai.studio/) and [Twilio Console](https://console.twilio.com/).

### 4. Run Locally

```bash
npm run dev
```

App will be available at [http://localhost:3000](http://localhost:3000)

---

## 📝 Project Structure

- `src/` — React components, types, and styles
- `server.ts` — Express server with Vite integration
- `vite.config.ts` — Vite + Tailwind CSS config
- `package.json` — Scripts and dependencies

---

## 📱 About

Quick Rescue is designed for rapid, autonomous emergency response. It leverages AI and real-time communication to protect users in critical situations.

View your app in AI Studio: [AI Studio App Link](https://ai.studio/apps/0b0650e2-b495-455a-a80f-07204e1e139c)

---

**Made with ❤️ for safety and innovation.**
