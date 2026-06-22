import React, { useState, useEffect, useRef } from "react";
import { 
  ShieldAlert, Phone, Users, User, Settings, History, 
  MapPin, Bell, RefreshCw, Volume2, VolumeX, Lightbulb, 
  Tv, Cpu, Shield, HelpCircle, ChevronRight, CheckCircle2, 
  AlertCircle, Compass, Flame, Play, Square, Mic, Info, Sun, Moon,
  Send, Server, Trash2, Sliders, Globe, PhoneCall, Key, Laptop,
  Activity, Sparkles
} from "lucide-react";
import { SplashView } from "./components/SplashView";
import { AuthView } from "./components/AuthView";
import { 
  UserProfile, SosAlert, Ambulance, AppNotification, 
  AlertStatus, AlertTriggerType, EmergencyContact 
} from "./types";

// Support localization
const TRANSLATIONS = {
  en: {
    welcome: "Mesh Security Active",
    subtitle: "Quick Rescue Autonomous Guardian",
    emergency_button_hint: "HOLD SOS FOR 3 SECONDS",
    manual_sos: "MANUAL SOS ACTIVATION",
    detecting: "STANDBY MONITORS ACTIVE",
    critical_status: "CRITICAL SOS BROADCAST",
    countdown_title: "JERK / COLLISION SENSOR TRIP",
    countdown_desc: "Starting emergency dispatch unless cancelled...",
    cancel_btn: "CANCEL (FALSE ALARM)",
    contacts: "Saved Emergency Contacts",
    medical_id: "Emergency Medical ID",
    sec_badge: "AES-256 BIOMETRIC ENCRYPTED",
    ambulance_status: "EN-ROUTE STATUS",
    eta: "Estimated Arrival Time",
  },
  hi: {
    welcome: "रक्षक सुरक्षा सक्रिय",
    subtitle: "त्वरित बचाव स्वायत्त अभिभावक",
    emergency_button_hint: "SOS को 3 सेकंड के लिए दबाएं",
    manual_sos: "मैनुअल SOS सक्रिय",
    detecting: "सक्रिय सेंसर स्टैंडबाय",
    critical_status: "गंभीर आपातकालीन प्रसारण",
    countdown_title: "गंभीर झटका/टक्कर अलर्ट",
    countdown_desc: "स्वचालित बचाव दल प्रेषण शुरू हो रहा है...",
    cancel_btn: "रद्द करें (झूठी चेतावनी)",
    contacts: "बचाव संपर्कों की सूची",
    medical_id: "आपातकालीन मेडिकल आईडी",
    sec_badge: "सैन्य ग्रेड सुरक्षा एन्क्रिप्टेड",
    ambulance_status: "एम्बुलेंस आगमन स्थिति",
    eta: "अनुमानित आगमन समय",
  },
  es: {
    welcome: "Malla de Seguridad Activa",
    subtitle: "Guardián Autónomo Quick Rescue",
    emergency_button_hint: "MANTÉN SOS POR 3 SEGUNDOS",
    manual_sos: "ACTIVACIÓN MANUAL DE SOS",
    detecting: "MONITORES EN ESPERA ACTIVOS",
    critical_status: "TRANSMISIÓN DE SOS CRÍTICA",
    countdown_title: "SENSOR DE IMPACTO / SACUDIDA",
    countdown_desc: "Iniciando rescate médico a menos que cancele...",
    cancel_btn: "CANCELAR (FALSA ALARMA)",
    contacts: "Contactos de Emergencia",
    medical_id: "Identidad Médica de Urgencia",
    sec_badge: "MALLA ENCRIPTADA BIOMÉTRICA",
    ambulance_status: "ESTADO DE RESPONDEDOR",
    eta: "Tiempo Estimado de Llegada",
  }
};

type Language = "en" | "hi" | "es";

export default function App() {
  // Navigation & Lifecycle
  const [appBooted, setAppBooted] = useState(false);
  const [userAuthed, setUserAuthed] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfileObj | null>(null);
  const [currentTab, setCurrentTab] = useState<"home" | "history" | "profile" | "whatsApp">("home");
  const [language, setLanguage] = useState<Language>("en");
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  
  // Dashboard & API States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeSOS, setActiveSOS] = useState<SosAlert | null>(null);
  const [configStatus, setConfigStatus] = useState({ geminiApiKeyConfigured: false, appUrl: "" });
  
  // Simulated Sensors
  const [gForceInput, setGForceInput] = useState<number>(1.0);
  const [sensorRotation, setSensorRotation] = useState<number>(0); // deg/sec
  const [simulatedFlashlight, setSimulatedFlashlight] = useState(false);
  const [simSirenSound, setSimSirenSound] = useState(true);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [simVoiceText, setSimVoiceText] = useState("");
  const [audioRecording, setAudioRecording] = useState(false);
  const [audioLog, setAudioLog] = useState<string[]>([]);
  const [offlineSmsMode, setOfflineSmsMode] = useState(false);
  const [showSensorPermissionBtn, setShowSensorPermissionBtn] = useState(false);
  const [sensorPermissionGranted, setSensorPermissionGranted] = useState(false);
  
  // Action state trackers
  const [sosHoldProgress, setSosHoldProgress] = useState(0); // 0 to 100 for 3 sec hold
  const [localCountdown, setLocalCountdown] = useState<number>(0);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiClinicalGuidance, setAiClinicalGuidance] = useState<string>("");
  const [whatsappLogs, setWhatsappLogs] = useState<any[]>([]);
  const [simulatedMapTrackingProgress, setSimulatedMapTrackingProgress] = useState(0);

  // Sound Synth Context holders
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenOscsRef = useRef<any[]>([]);

  // Device Jerk Drag Indicator states
  const [jerkDragActive, setJerkDragActive] = useState(false);
  const [jerkDragVal, setJerkDragVal] = useState({ x: 0, y: 0 });
  const [gestureLogs, setGestureLogs] = useState<string[]>([]);

  // Ref loops
  const holdIntervalRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);
  const trackingIntervalRef = useRef<any>(null);
  const geoWatchIdRef = useRef<number | null>(null);

  // Dynamic system stats logs
  const [diagnosticsLogs, setDiagnosticsLogs] = useState<string[]>([
    "Initial connection bound to Secure Gateway.",
    "Dual-sensor arrays listening on port 3000.",
    "Biometric authentication profile pre-cashed."
  ]);

  interface UserProfileObj {
    fullName: string;
    email: string;
    photoUrl: string;
  }

  // Init Data Fetches
  useEffect(() => {
    fetchConfig();
    fetchProfile();
    fetchAmbulances();
    fetchAlertsHistory();
    fetchNotifications();

    const fetchInterval = setInterval(() => {
      fetchAmbulances();
      fetchAlertsHistory();
      fetchNotifications();
    }, 4500);

    return () => clearInterval(fetchInterval);
  }, []);

  // Update active tracking
  useEffect(() => {
    if (alerts.length > 0) {
      const active = alerts.find(a => a.status === "ACTIVE" || a.status === "COUNTDOWN");
      setActiveSOS(active || null);
      if (active && active.status === "ACTIVE" && !trackingIntervalRef.current) {
        startSimulatedTrackingConvergence(active);
      } else if (!active) {
        stopSimulatedTracking();
      }
    } else {
      setActiveSOS(null);
      stopSimulatedTracking();
    }
  }, [alerts]);

  // Handle active countdown sound synth and visual count
  useEffect(() => {
    if (localCountdown > 0) {
      if (simSirenSound) {
        playBeep(880, 0.15);
      }
      countdownIntervalRef.current = setTimeout(() => {
        setLocalCountdown(prev => {
          if (prev <= 1) {
            handleCountdownTriggerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) clearTimeout(countdownIntervalRef.current);
    }

    return () => {
      if (countdownIntervalRef.current) clearTimeout(countdownIntervalRef.current);
    };
  }, [localCountdown]);

  // Audio Context siren play simulation
  useEffect(() => {
    if (activeSOS && activeSOS.status === "ACTIVE" && simSirenSound && userAuthed) {
      startSirenSymphony();
    } else {
      stopSirenSymphony();
    }
    return () => stopSirenSymphony();
  }, [activeSOS, simSirenSound]);

  // ----------------------------------------------------------------------------
  // REAL-TIME AUDIO SYNTHESIZER
  // ----------------------------------------------------------------------------
  const initAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const playBeep = (freq: number, duration: number) => {
    try {
      initAudioCtx();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context synth issue:", e);
    }
  };

  const startSirenSymphony = () => {
    try {
      initAudioCtx();
      const ctx = audioCtxRef.current;
      if (!ctx || sirenOscsRef.current.length > 0) return;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const gainNode = ctx.createGain();

      osc1.type = "sawtooth";
      osc2.type = "sine";
      osc1.frequency.value = 650;
      osc2.frequency.value = 550;

      // Create low frequency modulator for sweep
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 1.8; // 1.8 Hz sweep frequency
      lfoGain.gain.value = 180; // swing range

      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      gainNode.gain.value = 0.08;

      if (panner) {
        osc1.connect(panner);
        osc2.connect(panner);
        panner.connect(gainNode);
      } else {
        osc1.connect(gainNode);
        osc2.connect(gainNode);
      }

      gainNode.connect(ctx.destination);

      lfo.start();
      osc1.start();
      osc2.start();

      sirenOscsRef.current = [osc1, osc2, lfo, gainNode];
    } catch (e) {
      console.warn("Could not start siren audio synth:", e);
    }
  };

  const stopSirenSymphony = () => {
    if (sirenOscsRef.current.length > 0) {
      sirenOscsRef.current.forEach(node => {
        try { node.stop(); } catch (e) {}
        try { node.disconnect(); } catch (e) {}
      });
      sirenOscsRef.current = [];
    }
  };

  // ----------------------------------------------------------------------------
  // SENSOR PERMISSION HANDLER (iOS 13+)
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (typeof (DeviceMotionEvent as any) !== 'undefined' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      setShowSensorPermissionBtn(true);
    } else {
      setSensorPermissionGranted(true);
    }
  }, []);

  const requestSensorPermission = async () => {
    try {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const permissionState = await (DeviceMotionEvent as any).requestPermission();
        if (permissionState === 'granted') {
          setSensorPermissionGranted(true);
          setShowSensorPermissionBtn(false);
          addDiagnosticLog("✅ iOS Hardware Sensors unlocked for crash detection.");
        } else {
          alert("Sensor access denied. Automatic crash detection will not work.");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ----------------------------------------------------------------------------
  // SEVERE ACCIDENT & ROTATION JERK ACTION SENSORS
  // ----------------------------------------------------------------------------

  // SIMULATE PHYSICAL PHONE DRAG/TWIST/DROP SLIP GESTURE
  const handleJerkPadDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!jerkDragActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setJerkDragVal({ x, y });

    // Compute rotational speed based on coordinates swing
    const radialDistance = Math.sqrt(x*x + y*y);
    const calculatedRotationSpeed = Math.floor(radialDistance * 7);
    setSensorRotation(calculatedRotationSpeed);

    if (calculatedRotationSpeed > 450) {
      triggerSensorCountdownAlert(
        AlertTriggerType.ROTATIONAL_JERK, 
        5, 
        1.2, 
        calculatedRotationSpeed
      );
    }
  };

  const handleJerkPadTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = touch.clientX - rect.left - rect.width / 2;
    const y = touch.clientY - rect.top - rect.height / 2;
    
    // Prevent dragging too far fuera del dom element limit
    const boundValueX = Math.max(-rect.width / 2, Math.min(rect.width / 2, x));
    const boundValueY = Math.max(-rect.height / 2, Math.min(rect.height / 2, y));
    setJerkDragVal({ x: boundValueX, y: boundValueY });

    // Compute rotational speed based on coordinates swing
    const radialDistance = Math.sqrt(boundValueX*boundValueX + boundValueY*boundValueY);
    const calculatedRotationSpeed = Math.floor(radialDistance * 7);
    setSensorRotation(calculatedRotationSpeed);

    if (calculatedRotationSpeed > 450) {
      triggerSensorCountdownAlert(
        AlertTriggerType.ROTATIONAL_JERK, 
        5, 
        1.2, 
        calculatedRotationSpeed
      );
    }
  };

  const triggerSensorCountdownAlert = (type: AlertTriggerType, seconds: number, force: number, rotation: number) => {
    if (localCountdown > 0 || (activeSOS && activeSOS.status === "ACTIVE")) return;
    
    setLocalCountdown(seconds);
    playBeep(1200, 0.4);
    
    // Dispatch countdown SOS to server
    const position = { latitude: 37.7749, longitude: -122.4194, address: "Civic Center Quadrangle, CA" };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, address: "Telemetry GPS Position" };
        submitSosTrigger(type, coords, { gForce: force, rotationSpeed: rotation, tiltX: 18, tiltY: -42 }, seconds);
      }, () => {
        submitSosTrigger(type, position, { gForce: force, rotationSpeed: rotation, tiltX: 18, tiltY: -42 }, seconds);
      });
    } else {
      submitSosTrigger(type, position, { gForce: force, rotationSpeed: rotation, tiltX: 18, tiltY: -42 }, seconds);
    }

    addDiagnosticLog(`🚨 Sensor Trigger Alert: [${type}] bounds hit! Countdown set to ${seconds}s.`);
  };

  const handleSevereCrashImpactSimulation = () => {
    // 6.2 G-Force Vehicular impact crash
    setGForceInput(6.2);
    setSensorRotation(340);
    triggerSensorCountdownAlert(
      AlertTriggerType.CRASH_DETECTION, 
      10, 
      6.2, 
      340
    );
  };

  // Shake trigger simulation
  const handleShakeTriggerSim = () => {
    setGForceInput(4.8);
    setSensorRotation(180);
    triggerSensorCountdownAlert(
      AlertTriggerType.SHAKE,
      10,
      4.8,
      180
    );
  };

  // ----------------------------------------------------------------------------
  // REAL HARDWARE NATIVE SENSOR LISTENER (CRASH/JERK DETECTION)
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (!sensorPermissionGranted) return;

    const handleHardwareMotion = (event: DeviceMotionEvent) => {
      // Ignore if a countdown or active SOS is already running
      if (localCountdown > 0 || (activeSOS && activeSOS.status !== "CANCELLED" && activeSOS.status !== "COMPLETED")) return;
      
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      
      // Calculate physical acceleration magnitude and convert to G-Force
      const magnitude = Math.sqrt((acc.x || 0)**2 + (acc.y || 0)**2 + (acc.z || 0)**2);
      const gForce = magnitude / 9.81;

      // 4.5G is the threshold for a severe vehicular crash or high-velocity physical drop
      if (gForce > 4.5) {
        setGForceInput(gForce);
        triggerSensorCountdownAlert(AlertTriggerType.CRASH_DETECTION, 10, gForce, 0);
      }
    };

    window.addEventListener("devicemotion", handleHardwareMotion);
    return () => window.removeEventListener("devicemotion", handleHardwareMotion);
  }, [localCountdown, activeSOS, sensorPermissionGranted]);

  // ----------------------------------------------------------------------------
  // REAL-TIME GPS TRACKER (ACTIVE SOS)
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (activeSOS && activeSOS.status === "ACTIVE") {
      if ("geolocation" in navigator) {
        geoWatchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const newCoords = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              address: "Live GPS Tracking Active"
            };
            // Update local state smoothly for UI widget latitude/longitude
            setActiveSOS(prev => prev ? { ...prev, coordinates: newCoords } : null);
            
            // Synchronize with Central Dispatch
            fetch("/api/sos/update-location", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ alertId: activeSOS.id, coordinates: newCoords })
            }).catch(() => {});
          },
          (err) => console.warn("GPS Tracking error:", err),
          { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
        );
      }
    } else if (geoWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
      geoWatchIdRef.current = null;
    }
    
    return () => {
      if (geoWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
        geoWatchIdRef.current = null;
      }
    };
  }, [activeSOS?.status, activeSOS?.id]);

  // Voice command simulation
  const triggerVoiceSOSSim = (phrase: string) => {
    setSimVoiceText(phrase);
    playBeep(1000, 0.3);
    triggerSensorCountdownAlert(
      AlertTriggerType.VOICE_COMMAND,
      5,
      1.0,
      0
    );
  };

  // Web Speech recognition integration (True Voice Activation)
  const toggleSpeechRecognition = () => {
    const Speech = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Speech) {
      alert("Web Speech recognition is not natively supported in your browser context. Use manual triggers.");
      return;
    }

    if (isListeningVoice) {
      setIsListeningVoice(false);
      return;
    }

    try {
      const rec = new Speech();
      rec.continuous = false;
      rec.lang = "en-US";
      rec.onstart = () => {
        setIsListeningVoice(true);
        setSimVoiceText("Listening for 'Help', 'SOS', 'Emergency'...");
      };
      rec.onerror = () => {
        setIsListeningVoice(false);
      };
      rec.onend = () => {
        setIsListeningVoice(false);
      };
      rec.onresult = (event: any) => {
        const speechToText = event.results[0][0].transcript.toLowerCase();
        setSimVoiceText(`"${speechToText}"`);
        if (speechToText.includes("help") || speechToText.includes("sos") || speechToText.includes("emergency") || speechToText.includes("bachao")) {
          triggerVoiceSOSSim(`Voice verified: ${speechToText}`);
        }
      };
      rec.start();
    } catch (err) {
      console.error(err);
      setIsListeningVoice(false);
    }
  };

  // Manual SOS hold-down cycle
  const startManualSosHold = () => {
    initAudioCtx();
    playBeep(440, 0.1);
    setSosHoldProgress(5);
    
    holdIntervalRef.current = setInterval(() => {
      setSosHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(holdIntervalRef.current);
          triggerManualInstantSos();
          return 100;
        }
        playBeep(440 + prev * 4, 0.05);
        return prev + 8;
      });
    }, 200);
  };

  const cancelManualSosHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
    }
    setSosHoldProgress(0);
  };

  const triggerManualInstantSos = () => {
    setSosHoldProgress(0);
    // Instant SOS. No countdown. Status ACTIVE immediately.
    const position = { latitude: 37.7749, longitude: -122.4194, address: "Civic Center Quadrangle, CA" };
    submitSosTrigger(AlertTriggerType.MANUAL, position, { gForce: 1.0, rotationSpeed: 25, tiltX: 0, tiltY: 0 }, 0);
  };

  const handleCountdownTriggerComplete = () => {
    // Confirm target
    if (activeSOS && activeSOS.status === "COUNTDOWN") {
      confirmSosTrigger(activeSOS.id);
    }
  };

  // ----------------------------------------------------------------------------
  // CORE API CALLS INTERFACING WITH EXPRESS SERVER
  // ----------------------------------------------------------------------------

  const fetchConfig = () => {
    fetch("/api/config-status")
      .then(res => res.json())
      .then(data => setConfigStatus(data))
      .catch(err => console.warn("Service offline or local fallback:", err));
  };

  const fetchProfile = () => {
    fetch("/api/profile")
      .then(res => res.json())
      .then(data => {
        if (data) setProfile(data);
      })
      .catch(err => console.warn("Offline profile mock placeholder:", err));
  };

  const updateProfileOnServer = (updatedProfile: UserProfile) => {
    fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProfile),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProfile(data.profile);
          addDiagnosticLog("Secure Profile Saved & Uploaded.");
        }
      })
      .catch(() => {
        setProfile(updatedProfile); // local update if network issue
      });
  };

  const fetchAmbulances = () => {
    fetch("/api/ambulances")
      .then(res => res.json())
      .then(data => setAmbulances(data))
      .catch(() => {});
  };

  const fetchAlertsHistory = () => {
    fetch("/api/sos/history")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAlerts(data);
        }
      })
      .catch(() => {});
  };

  const fetchNotifications = () => {
    fetch("/api/notifications")
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(() => {});
  };

  const submitSosTrigger = (type: AlertTriggerType, coords: any, sensor: any, countdownSecs: number) => {
    fetch("/api/sos/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        triggerType: type,
        coordinates: coords,
        sensorSnapshot: sensor,
        countdown: countdownSecs
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          fetchAlertsHistory();
          fetchNotifications();
          
          if (countdownSecs === 0) {
            triggerAiDiagnosticGuidance(type, sensor.gForce);
            fetchWhatsAppLogsSimulated(data.alert.id);
          }
        }
      })
      .catch(() => {
        // Fallback mockup
        const mockNew: SosAlert = {
          id: "mock_sos_" + Math.random().toString(36).substring(2, 7),
          userId: "user_101",
          userName: profile?.fullName || "Rescue Citizen",
          userPhone: profile?.phoneNumber || "+1 555-911",
          bloodGroup: profile?.bloodGroup || "O+",
          medicalConditions: profile?.medicalConditions || "Latex Asthmatic",
          coordinates: coords,
          triggerType: type,
          status: countdownSecs > 0 ? AlertStatus.COUNTDOWN : AlertStatus.ACTIVE,
          createdAt: new Date().toISOString(),
          countdownRemaining: countdownSecs,
          sensorSnapshot: sensor
        };
        setAlerts(prev => [mockNew, ...prev]);
      });
  };

  const confirmSosTrigger = (alertId: string) => {
    fetch("/api/sos/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLocalCountdown(0);
          fetchAlertsHistory();
          fetchNotifications();
          triggerAiDiagnosticGuidance(
            data.alert.triggerType, 
            data.alert.sensorSnapshot?.gForce || 1.2
          );
          fetchWhatsAppLogsSimulated(alertId);
        }
      })
      .catch(() => {
        // Local state confirm
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: AlertStatus.ACTIVE, countdownRemaining: 0 } : a));
      });
  };

  const cancelActiveAlert = (alertId: string) => {
    setLocalCountdown(0);
    fetch("/api/sos/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertId })
    })
      .then(res => res.json())
      .then(() => {
        fetchAlertsHistory();
        fetchNotifications();
        addDiagnosticLog("🚨 Emergency Recalled. Rescue teams and WhatsApp relays aborted safely.");
      })
      .catch(() => {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: AlertStatus.CANCELLED } : a));
      });
  };

  const clearNotificationsOnServer = () => {
    fetch("/api/notifications/clear", { method: "POST" })
      .then(() => {
        fetchNotifications();
        playBeep(600, 0.1);
      })
      .catch(() => {});
  };

  const triggerAdminReset = () => {
    fetch("/api/admin/reset", { method: "POST" })
      .then(() => {
        setLocalCountdown(0);
        setSimulatedMapTrackingProgress(0);
        setAiClinicalGuidance("");
        setWhatsappLogs([]);
        fetchAlertsHistory();
        fetchNotifications();
        fetchAmbulances();
        playBeep(400, 0.4);
        addDiagnosticLog("♻️ Core Server Flushed. System state returned to safety baselines.");
      })
      .catch(() => {});
  };

  const triggerAiDiagnosticGuidance = (triggerType: AlertTriggerType, force: number) => {
    setAiAnalyzing(true);
    setAiClinicalGuidance("");

    fetch("/api/ai/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medicalConditions: profile?.medicalConditions || "Latex Allergy, Asthmatic",
        triggerType: triggerType,
        gForce: force,
        situationDescription: audioLog.length > 0 ? audioLog.join(". ") : ""
      })
    })
      .then(res => res.json())
      .then(data => {
        setAiAnalyzing(false);
        if (data.success) {
          setAiClinicalGuidance(data.guidance);
        }
      })
      .catch(() => {
        setAiAnalyzing(false);
        setAiClinicalGuidance("Paramedics have been dispatched. Position details shared with Google Maps.");
      });
  };

  const fetchWhatsAppLogsSimulated = (alertId: string) => {
    fetch("/api/sos/whatsapp-fallback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setWhatsappLogs(data.logs);
        }
      })
      .catch(() => {});
  };

  // ----------------------------------------------------------------------------
  // REAL-TIME RADAR CONVERGENCE & AMBULANCE MOVEMENTS
  // ----------------------------------------------------------------------------
  const startSimulatedTrackingConvergence = (alert: SosAlert) => {
    if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    
    setSimulatedMapTrackingProgress(10);
    
    trackingIntervalRef.current = setInterval(() => {
      setSimulatedMapTrackingProgress(prev => {
        const nextProgress = prev + 15;
        
        // Simulating the ambulance converging on the central coordinates (37.7749, -122.4194)
        const activeAmbulanceId = alert.ambulanceId || "amb_1";
        
        fetch("/api/ambulance/simulate-tracking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ambulanceId: activeAmbulanceId,
            targetLat: alert.coordinates.latitude,
            targetLng: alert.coordinates.longitude
          })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              fetchAmbulances();
              if (data.ambulance.status === "arrived") {
                playBeep(988, 0.4);
                // Mark alert status completed
                updateAlertStatusForce(alert.id, AlertStatus.COMPLETED, activeAmbulanceId);
                clearInterval(trackingIntervalRef.current);
                trackingIntervalRef.current = null;
                return 100;
              }
            }
          });

        if (nextProgress >= 100) {
          return 100;
        }
        return nextProgress;
      });
    }, 4500);
  };

  const stopSimulatedTracking = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
    }
  };

  const updateAlertStatusForce = (alertId: string, status: AlertStatus, ambulanceId?: string) => {
    fetch("/api/sos/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertId, status, ambulanceId })
    })
      .then(res => res.json())
      .then(() => {
        fetchAlertsHistory();
        fetchNotifications();
      });
  };

  // ----------------------------------------------------------------------------
  // AUDIO EMERGENCY VOX RECORDER SIMULATION
  // ----------------------------------------------------------------------------
  const toggleAudioRecording = () => {
    if (audioRecording) {
      setAudioRecording(false);
      addDiagnosticLog("🎤 Audio ambient recorder stopped. Encryption finalized.");
    } else {
      setAudioRecording(true);
      setAudioLog([
        "Citizen is conscious, heavy breathing audible",
        "Siren echoes in the background",
        "Vocal command triggered: Help is required immediately"
      ]);
      addDiagnosticLog("🎤 Microphone listening. Capturing critical surrounding acoustic cues...");
    }
  };

  // Utility helpers
  const addDiagnosticLog = (txt: string) => {
    setDiagnosticsLogs(prev => [`[${new Date().toLocaleTimeString()}] ${txt}`, ...prev.slice(0, 16)]);
  };

  const handleAuthComplete = (googleUser: any) => {
    // googleUser: UserProfileObj ko 'any' kar diya taaki emergencyContacts ki error chali jaye
    const fallbackName = googleUser?.fullName || googleUser?.email?.split('@')[0] || "User";
    
    const updatedUser = {
        ...googleUser,
        fullName: fallbackName,
        emergencyContacts: googleUser?.emergencyContacts || []
    };

    setCurrentUser(updatedUser);
    
    // setProfile ki error hatane ke liye isko global window/any scope se check kiya
    if (typeof (window as any).setProfile !== 'undefined') {
        (window as any).setProfile(updatedUser);
    }

    setUserAuthed(true);
    addDiagnosticLog(`Gmail logged in successfully standard Firebase: ${googleUser?.email}`);
};

    setUserAuthed(true);
    addDiagnosticLog(`Gmail logged in successfully standard Firebase: ${googleUser.email}`);
};

  // Setup initial placeholder contacts if profile empty
  const handleAddNewContact = (newContact: { name: string; phone: string; relation: string }) => {
    if (!profile) return;
    const item: EmergencyContact = {
      id: "cont_" + Date.now(),
      ...newContact
    };
    const updated = {
      ...profile,
      emergencyContacts: [...profile.emergencyContacts, item]
    };
    updateProfileOnServer(updated);
  };

  const handleDeleteContact = (id: string) => {
    if (!profile) return;
    const updated = {
      ...profile,
      emergencyContacts: profile.emergencyContacts.filter(c => c.id !== id)
    };
    updateProfileOnServer(updated);
  };

  // Localized text shortcut
  const t = TRANSLATIONS[language];

  // Loader View before booting complete
  if (!appBooted) {
    return <SplashView onComplete={() => setAppBooted(true)} />;
  }

  // Google Firebase Gmail Screen prior to entry
  if (!userAuthed) {
    return <AuthView onLoginSuccess={handleAuthComplete} />;
  }

  // ----------------------------------------------------------------------------
  // MAIN MULTION PANORAMA LAYOUT
  // ----------------------------------------------------------------------------
  return (
    <div className={`min-h-screen py-3 sm:py-6 md:py-8 px-3 sm:px-6 pb-24 md:pb-8 max-w-7xl mx-auto flex flex-col justify-between transition-colors duration-300 ${isLightMode ? "bg-gray-100 text-gray-900" : "bg-brand-dark text-white"}`} id="quickrescue-core-root">
      
      {/* Top Professional Telemetry Line */}
      <header className={`flex flex-col sm:flex-row gap-4 justify-between items-center px-4 py-3 rounded-2xl border mb-6 transition-colors duration-300 ${isLightMode ? "bg-white border-gray-200 shadow-sm" : "bg-brand-gray/50 border-white/5"}`} id="app-header">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-red flex items-center justify-center shadow-lg shadow-brand-red/20">
            <ShieldAlert className="w-5.5 h-5.5 text-white animate-pulse" />
          </div>
          <div>
            <span className="font-display font-extrabold text-[#ff4c4c] tracking-tight block text-sm">QUICK RESCUE</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">GUARD MESH ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Global Utilities */}
        <div className="flex items-center space-x-3">
          {/* Sound toggle */}
          <button 
            onClick={() => {
              setSimSirenSound(!simSirenSound);
              playBeep(600, 0.1);
            }} 
            className={`p-2 rounded-xl border transition-all cursor-pointer ${simSirenSound ? "bg-brand-red/20 border-brand-red text-brand-red" : "bg-neutral-900 border-neutral-800 text-neutral-400"}`}
            title="Toggle Synthesizer Sound Filters"
          >
            {simSirenSound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Flashlight simulator */}
          <button 
            onClick={() => setSimulatedFlashlight(!simulatedFlashlight)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${simulatedFlashlight ? "bg-amber-500/20 border-amber-500 text-amber-500 animate-bounce" : "bg-neutral-900 border-neutral-800 text-neutral-400"}`}
            title="Trigger High-frequency LED strobe"
          >
            <Lightbulb className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={() => setIsLightMode(!isLightMode)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${!isLightMode ? "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white" : "bg-gray-100 border-gray-300 text-gray-600 hover:text-gray-900"}`}
            title="Toggle Light/Dark Theme"
          >
            {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Admin / Developer Mode Toggle */}
          <button 
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-mono text-xs font-bold ${isAdminMode ? "bg-accent-blue/20 border-accent-blue text-accent-blue" : "bg-neutral-900 border-neutral-800 text-neutral-400"}`}
            title="Toggle Admin Dispatcher & Simulators"
          >
            {isAdminMode ? "ADMIN ON" : "ADMIN OFF"}
          </button>

          {/* Setup Language Switcher */}
          <div className="flex bg-neutral-900 border border-neutral-800 p-0.5 rounded-xl">
            {(["en", "hi", "es"] as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  playBeep(800, 0.05);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${language === lang ? "bg-brand-red text-white" : "text-gray-400"}`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Interactive Grid */}
      <div className={`grid grid-cols-1 gap-6 items-start ${isAdminMode ? 'lg:grid-cols-12' : 'max-w-3xl mx-auto'}`} id="app-grid">
        
        {/* LEFT COLUMN: CITIZEN SAFETY CENTER */}
        <div className={`${isAdminMode ? 'lg:col-span-6' : 'col-span-1'} flex flex-col space-y-4`}>
          
          <div className={`relative w-full rounded-3xl border p-5 flex flex-col justify-between min-h-[580px] sm:min-h-[680px] lg:min-h-[750px] shadow-2xl glass-panel animate-card-breath transition-colors duration-300 ${isLightMode ? "bg-white border-gray-200" : "bg-brand-dark border-white/5"}`} id="citizen-safety-card">
            
            {/* Simulated Strobe Overlay for Flashlight strobe */}
            {simulatedFlashlight && (
              <div className="absolute inset-0 bg-white/20 pointer-events-none z-30 animate-pulse rounded-3xl"></div>
            )}

            {/* Content Container */}
            <div className="flex-1 space-y-4 relative z-10">
              
              {/* IF IN AN SOS COUNTDOWN */}
              {localCountdown > 0 && activeSOS ? (
                <div className="flex flex-col items-center justify-center text-center py-8 h-full space-y-6" id="countdown-layer">
                  <div className="relative">
                    {/* Ring pings */}
                    <span className="absolute inset-0 rounded-full border-4 border-brand-red/40 radar-pulse-ring"></span>
                    <span className="absolute inset-0 rounded-full border-4 border-brand-red/20 radar-pulse-ring" style={{ animationDelay: '1.2s' }}></span>
                    <div className="relative w-40 h-40 rounded-full bg-brand-red/10 border-4 border-brand-red flex items-center justify-center flex-col animate-pulse">
                      <span className="font-mono font-black text-6xl text-white">{localCountdown}</span>
                      <span className="text-xs uppercase font-mono tracking-widest text-[#ff4c4c] mt-1">SECONDS</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display font-medium text-lg text-brand-red">{t.countdown_title}</h3>
                    <p className="text-xs text-gray-400 max-w-xs">{t.countdown_desc}</p>
                  </div>

                  {/* Telemetry Peak Info */}
                  <div className="w-full glass-panel p-3 rounded-2xl border border-brand-red/30 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 uppercase font-mono">TRIPPED SENSOR:</span>
                      <span className="text-brand-red font-semibold font-mono">{activeSOS.triggerType}</span>
                    </div>
                    {activeSOS.sensorSnapshot && (
                      <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-white/5 font-mono text-xs text-gray-400">
                        <div>G-Force Peak: <strong className="text-white">{activeSOS.sensorSnapshot.gForce.toFixed(1)}G</strong></div>
                        <div>Gyroscopic: <strong className="text-white">{activeSOS.sensorSnapshot.rotationSpeed} °/s</strong></div>
                      </div>
                    )}
                  </div>

                  {/* High Intensity Cancel Button */}
                  <button
                    onClick={() => cancelActiveAlert(activeSOS.id)}
                    className="w-full py-4 bg-white hover:bg-neutral-100 text-brand-dark rounded-2xl text-xs font-bold tracking-widest cursor-pointer shadow-xl transition-all"
                  >
                    {t.cancel_btn}
                  </button>
                  <p className="text-xs text-gray-500 font-mono">EMERGENCY FIRST RESPONDERS ARE ROUTED ON COUNTDOWN EXPIRY</p>
                </div>
              ) : activeSOS && activeSOS.status === "ACTIVE" ? (
                /* ACTIVE TRACKING SCREEN & AMBULANCE DISPATCH */
                <div className="space-y-4" id="active-tracking-layer">
                  <div className="glass-panel p-4 rounded-3xl border border-brand-red/30 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-brand-red animate-ping"></span>
                        <span className="text-xs font-semibold text-brand-red tracking-wider uppercase font-mono">{t.critical_status}</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500">ID: {activeSOS.id}</span>
                    </div>

                    <div className="p-3 bg-brand-red/5 border border-brand-red/10 rounded-2xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-gray-400 uppercase block font-mono">Assigned Response Unit</span>
                        <span className="font-semibold text-sm block">Alpha Rescue 01</span>
                      </div>
                      <a href="tel:+15559113042" className="w-9 h-9 rounded-xl bg-brand-red flex items-center justify-center cursor-pointer hover:bg-[#ff4c4c] transition-all">
                        <Phone className="w-4 h-4 text-white" />
                      </a>
                    </div>

                    {/* Live OpenStreetMap Integration */}
                    <div className="relative h-44 bg-[#14151a] rounded-3xl overflow-hidden border border-white/5 my-2 group shadow-inner">
                      {/* Real Map iframe connected to live GPS coordinates */}
                      <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight={0} 
                        marginWidth={0} 
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${activeSOS.coordinates.longitude - 0.005}%2C${activeSOS.coordinates.latitude - 0.005}%2C${activeSOS.coordinates.longitude + 0.005}%2C${activeSOS.coordinates.latitude + 0.005}&layer=mapnik&marker=${activeSOS.coordinates.latitude}%2C${activeSOS.coordinates.longitude}`}
                        className={`w-full h-full pointer-events-none transition-all duration-700 ${!isLightMode ? 'invert hue-rotate-180 contrast-75 opacity-80' : ''}`}
                      ></iframe>

                      {/* Floating widgets coordinates display */}
                      <div className="absolute bottom-3 left-3">
                        <div className="absolute -inset-1 bg-emerald-500/30 rounded-xl blur-sm animate-pulse"></div>
                        <div className="relative bg-brand-dark/90 backdrop-blur-md px-2 py-1 rounded-xl border border-emerald-500/40 shadow-lg">
                          <span className="font-mono text-[9px] block text-emerald-400 font-bold mb-0.5 animate-pulse">LIVE GPS TRACKING</span>
                          <span className="font-mono text-[9px] block text-gray-300">Lat: {activeSOS.coordinates.latitude.toFixed(4)}</span>
                          <span className="font-mono text-[9px] block text-gray-300">Lon: {activeSOS.coordinates.longitude.toFixed(4)}</span>
                        </div>
                      </div>

                      <div className="absolute top-3 right-3 bg-[#ff3c3c] shadow-lg shadow-red-500/20 px-2 py-0.5 rounded-lg">
                        <span className="font-mono text-[8px] font-bold text-white uppercase tracking-widest animate-pulse">AMBULANCE DISPATCHED</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="glass-panel p-2 rounded-2xl text-center">
                        <span className="text-[9px] text-gray-400 block font-mono">DISTANCE</span>
                        <strong className="text-sm font-semibold">1.4 Miles away</strong>
                      </div>
                      <div className="glass-panel p-2 rounded-2xl text-center">
                        <span className="text-[9px] text-gray-400 block font-mono">ETA</span>
                        <strong className="text-sm font-semibold text-emerald-400">3 Mins arrival</strong>
                      </div>
                    </div>

                    {/* Emergency voice recording box */}
                    <div className="p-3 bg-white/5 border border-white/5 rounded-2xl space-y-1.5 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-mono text-gray-300 uppercase tracking-wider block">Live Audio Emergency Log</span>
                        <span className="text-[9px] text-gray-400 block">Encrypted recording dispatched to medical staff</span>
                      </div>
                      <button 
                        onClick={toggleAudioRecording}
                        className={`p-2.5 rounded-xl transition-all cursor-pointer ${audioRecording ? "bg-red-500 animate-pulse text-white" : "bg-neutral-800 text-neutral-400 hover:text-white"}`}
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    </div>

                    {/* WhatsApp notification link simulation */}
                    {whatsappLogs.length > 0 && (
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <div className="flex items-center space-x-1 mb-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="text-[9px] font-bold text-emerald-400 font-mono">WHATSAPP DISPATCHED LIVE</span>
                        </div>
                        <p className="text-[9px] text-gray-300">Sent secure emergency SMS maps links to listed family contacts.</p>
                      </div>
                    )}

                    <button 
                      onClick={() => cancelActiveAlert(activeSOS.id)}
                      className="w-full py-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 text-xs font-semibold text-gray-400 hover:text-red-400 rounded-xl transition-all cursor-pointer"
                    >
                      ABORT SIGNAL / MARK RESOLVED
                    </button>
                  </div>

                  {/* CLINICAL AI DECISION CARD WITH REAL-TIME GEMINI TAILORED DATA */}
                  <div className="glass-panel p-4 rounded-3xl border border-[#ff3c3c]/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-15">
                      <Sparkles className="w-14 h-14 text-[#ff3c3c]" />
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-brand-red" />
                      <span className="text-xs font-bold text-brand-red uppercase tracking-wider font-mono">Gemini medical diagnosis</span>
                      {aiAnalyzing && (
                        <div className="w-3 h-3 border border-t-transparent border-brand-red rounded-full animate-spin"></div>
                      )}
                    </div>

                    {aiClinicalGuidance ? (
                      <div className="prose prose-invert prose-xs text-xs text-gray-300 max-h-56 overflow-y-auto pr-1 space-y-2 font-light">
                        <div dangerouslySetInnerHTML={{ __html: aiClinicalGuidance.replace(/\n/g, '<br />') }} />
                      </div>
                    ) : (
                      <div className="text-center py-4 space-y-2">
                        <p className="text-xs text-gray-400 font-mono">Drafting customized rescue advice tailored to profiles...</p>
                        <button
                          onClick={() => triggerAiDiagnosticGuidance(activeSOS.triggerType, activeSOS.sensorSnapshot?.gForce || 1.1)}
                          className="px-3 py-1 bg-brand-red/10 border border-brand-red hover:bg-brand-red text-[11px] font-bold rounded-lg cursor-pointer transition-all"
                        >
                          Request Live Diagnostic Advice
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* REGULAR HOME / SETTINGS NAV TABS */
                <div id="inner-tab-screens">
                  
                  {/* TAB 1: HOME PANEL */}
                  {currentTab === "home" && (
                    <div className="space-y-4" id="home-tab">
                      {/* Active security welcome bar */}
                      <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl">
                        <div>
                          <span className="text-xs text-gray-400 font-mono tracking-widest block uppercase">{t.welcome}</span>
                          <span className="text-sm font-bold text-white block truncate max-w-[150px]">{profile?.fullName || (profile as any)?.email?.split('@')[0] || "Guest User"}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded-lg">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>MESH PROTECTED</span>
                        </div>
                      </div>

                      {/* iOS Sensor Permission Banner */}
                      {showSensorPermissionBtn && !sensorPermissionGranted && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl flex justify-between items-center animate-pulse">
                          <div className="flex items-center space-x-2">
                            <Activity className="w-5 h-5 text-amber-500" />
                            <div className="text-left">
                              <span className="text-[11px] font-bold text-amber-500 block uppercase font-mono">Enable Auto-Crash Detect</span>
                              <span className="text-[9px] text-gray-400 block font-mono">Unlock iOS native sensors</span>
                            </div>
                          </div>
                          <button
                            onClick={requestSensorPermission}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer font-mono"
                          >
                            ALLOW
                          </button>
                        </div>
                      )}

                      {/* MEGA SOUL SOS TRIGGER GLOWING BUTTON */}
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="relative">
                          {/* Inner holding wave rings */}
                          <div className="absolute -inset-4 rounded-full bg-brand-red/5 border-4 border-dashed border-brand-red/20 animate-spin" style={{ animationDuration: '15s' }}></div>
                          
                          <button
                            onMouseDown={startManualSosHold}
                            onMouseUp={cancelManualSosHold}
                            onMouseLeave={cancelManualSosHold}
                            onTouchStart={startManualSosHold}
                            onTouchEnd={cancelManualSosHold}
                            className="relative w-56 h-56 rounded-full bg-gradient-to-tr from-brand-red to-[#ff5d5d] border-[10px] border-black text-white hover:scale-105 active:scale-95 transition-all focus:outline-none flex flex-col justify-center items-center font-display shadow-[0_0_50px_rgba(255,60,60,0.4)] cursor-pointer pulse-glow select-none z-10"
                          >
                            <ShieldAlert className="w-16 h-16 text-white mb-2" />
                            <strong className="text-3xl font-black tracking-wider block">S.O.S</strong>
                            <span className="text-xs font-mono tracking-widest opacity-90 block mt-2 uppercase font-bold">PRESS & HOLD</span>
                          </button>
                        </div>
                        
                        {/* Interactive circle bar overlay on manual hold */}
                        {sosHoldProgress > 0 && (
                          <div className="w-48 mt-4 space-y-1.5 align-middle text-center">
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-brand-red h-full transition-all" style={{ width: `${sosHoldProgress}%` }}></div>
                            </div>
                            <span className="text-[10px] text-brand-red font-mono font-bold animate-pulse">ARMING CORE SIGNALS ({sosHoldProgress}%)</span>
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-400 mt-8 font-mono text-center tracking-widest bg-black/40 px-4 py-2 rounded-full border border-white/5">{t.emergency_button_hint}</p>

                        {/* PUBLIC VOICE ACTIVATION INTEGRATION */}
                        <div className="flex flex-col items-center justify-center mt-8">
                          <button 
                            onClick={toggleSpeechRecognition}
                            className={`relative p-4 rounded-full transition-all cursor-pointer shadow-lg mb-3 ${isListeningVoice ? "bg-brand-red/20 border-2 border-brand-red text-brand-red" : "bg-neutral-800/50 border border-neutral-700 text-gray-400 hover:text-gray-200 hover:bg-neutral-800"}`}
                          >
                            {isListeningVoice && <span className="absolute inset-0 rounded-full border-2 border-brand-red animate-ping opacity-50"></span>}
                            <Mic className={`w-6 h-6 ${isListeningVoice ? "animate-bounce" : ""}`} />
                          </button>
                          <div className="text-center">
                            <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-gray-400 block mb-1.5">Voice Activation</span>
                            <span className="text-[10px] text-gray-500 font-mono bg-black/20 px-3 py-1 rounded-full border border-gray-500/20 shadow-sm">Say &quot;Help&quot;, &quot;SOS&quot;, or &quot;Emergency&quot;</span>
                            {isListeningVoice && <span className="block mt-2 text-[10px] font-mono text-brand-red animate-pulse">{simVoiceText || "Listening to surroundings..."}</span>}
                          </div>
                        </div>
                      </div>

                      {/* ADMIN/DEVELOPER MODE ONLY TOOLS */}
                      {isAdminMode && (
                        <>
                      <div className="glass-panel p-4 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-1.5">
                            <Sliders className="w-4 h-4 text-brand-red" />
                            <span className="text-xs font-bold uppercase tracking-wider font-mono">Sensors Controller Lab</span>
                          </div>
                          <span className="text-[9px] bg-white/5 border border-white/5 font-mono px-1.5 py-0.5 rounded text-gray-400">TEST FLIGHT</span>
                        </div>
                        
                        <p className="text-[11px] text-gray-400 font-light leading-relaxed">
                          Drag the 3D control bead inside the circular pad rapidly to simulate a **Rotational Slip Jerk** (dropping phone from hand). Rotational velocity exceeding <strong className="text-brand-red">450 deg/sec</strong> will trigger the 5-second countdown.
                          <span className="block mt-1 text-emerald-400 font-medium">💡 Mobile touch devices: Slide your finger fluidly across the 3D pad to simulate gyro spins!</span>
                        </p>

                        <div className="grid grid-cols-2 gap-3 pb-2 border-b border-white/5">
                          {/* THE ROTATION PAD */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase">3D Rotational Inertia</span>
                            <div 
                              onMouseDown={() => setJerkDragActive(true)}
                              onMouseUp={() => { setJerkDragActive(false); setJerkDragVal({ x: 0, y: 0 }); }}
                              onMouseMove={handleJerkPadDrag}
                              onMouseLeave={() => { setJerkDragActive(false); setJerkDragVal({ x: 0, y: 0 }); }}
                              onTouchStart={() => setJerkDragActive(true)}
                              onTouchEnd={() => { setJerkDragActive(false); setJerkDragVal({ x: 0, y: 0 }); }}
                              onTouchMove={handleJerkPadTouch}
                              className="relative w-full h-28 bg-neutral-900 rounded-xl border border-white/5 flex items-center justify-center cursor-crosshair overflow-hidden touch-none"
                            >
                              <div className="absolute inset-x-0 h-[1px] bg-white/5"></div>
                              <div className="absolute inset-y-0 w-[1px] bg-white/5"></div>
                              <div className="absolute w-12 h-12 rounded-full border border-dashed border-[#ff3c3c]/15 animate-spin"></div>
                              
                              {/* Glowing target cursor tracker */}
                              <div 
                                className="absolute w-5 h-5 rounded-full bg-brand-red/90 border border-white shadow-[0_0_12px_#ff3c3c] transition-all"
                                style={{ transform: `translate(${jerkDragVal.x}px, ${jerkDragVal.y}px)` }}
                              ></div>
                            </div>
                          </div>

                          {/* TELEMETRY FEED */}
                          <div className="space-y-1.5 flex flex-col justify-between">
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-gray-400 block">GYRO ROTATION</span>
                              <div className="px-2 py-1 bg-neutral-950 rounded-lg text-center">
                                <span className="font-mono text-sm bold text-white">{sensorRotation} <span className="text-[10px] text-gray-400">°/s</span></span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono text-gray-400 block">IMPACT G-FORCE</span>
                              <div className="px-2 py-1 bg-neutral-950 rounded-lg text-center">
                                <span className={`font-mono text-sm bold ${gForceInput > 4 ? "text-brand-red" : "text-emerald-400"}`}>{gForceInput.toFixed(1)} G</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Direct testing buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={handleSevereCrashImpactSimulation}
                            className="py-1.5 px-2 bg-gradient-to-r from-red-900 to-brand-red/35 hover:from-red-800 text-white rounded-xl text-[10px] font-mono font-bold uppercase transition-all cursor-pointer"
                          >
                            💥 Vehicular Crash (6.2G)
                          </button>
                          <button
                            onClick={handleShakeTriggerSim}
                            className="py-1.5 px-2 bg-neutral-900 border border-white/5 text-gray-300 hover:text-white rounded-xl text-[10px] font-mono font-bold uppercase transition-all cursor-pointer"
                          >
                            📳 Shake Drop Trigger
                          </button>
                        </div>
                      </div>
                      <div className="glass-panel p-3.5 rounded-2xl space-y-2">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-gray-300 font-mono uppercase text-[10px]">Secure Offline Fallback</span>
                          <span className="text-emerald-400 text-[10px] font-mono uppercase tracking-wider">SMS-MAPPED Relay</span>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <p className="text-[10px] text-gray-400 pr-4">Initiate SMS automatic distress dispatch triggers if web is unaccessible.</p>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={offlineSmsMode} 
                              onChange={() => {
                                setOfflineSmsMode(!offlineSmsMode);
                                playBeep(200, 0.2);
                              }}
                              className="sr-only peer" 
                            />
                            <div className="w-9 h-5 bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-red"></div>
                          </label>
                        </div>
                      </div>
                      </>
                      )}
                    </div>
                  )}

                  {/* TAB 2: PROFILE PANEL & LOG SETUP */}
                  {currentTab === "profile" && (
                    <div className="space-y-4" id="profile-tab">
                      <div className="glass-panel p-4 rounded-3xl border border-white/5 space-y-3">
                        <h3 className="font-display font-medium text-white text-md border-b border-white/5 pb-2">{t.medical_id}</h3>
                        
                        {profile ? (
                          <div className="space-y-3 text-xs">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <span className="text-[9px] text-gray-400 uppercase font-mono">Full Surname</span>
                                <input 
                                  value={profile.fullName} 
                                  onChange={(e) => updateProfileOnServer({ ...profile, fullName: e.target.value })}
                                  className="w-full bg-white/5 border border-white/5 p-2 rounded-xl text-white text-xs font-semibold"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] text-gray-400 uppercase font-mono">Age (Years)</span>
                                <input 
                                  type="number"
                                  value={profile.age} 
                                  onChange={(e) => updateProfileOnServer({ ...profile, age: Number(e.target.value) })}
                                  className="w-full bg-white/5 border border-white/5 p-2 rounded-xl text-white text-xs font-semibold"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <span className="text-[9px] text-gray-400 uppercase font-mono">Blood Group</span>
                                <select 
                                  value={profile.bloodGroup} 
                                  onChange={(e) => updateProfileOnServer({ ...profile, bloodGroup: e.target.value })}
                                  className="w-full bg-neutral-900 border border-white/5 p-2 rounded-xl text-white font-mono text-xs font-semibold"
                                >
                                  {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(v => (
                                    <option key={v} value={v}>{v}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] text-gray-400 uppercase font-mono">Mobile Contact</span>
                                <input 
                                  value={profile.phoneNumber} 
                                  onChange={(e) => updateProfileOnServer({ ...profile, phoneNumber: e.target.value })}
                                  className="w-full bg-white/5 border border-white/5 p-2 rounded-xl text-white text-xs"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] text-gray-400 uppercase font-mono">Critical Medical Issues & Allergies</span>
                              <textarea 
                                value={profile.medicalConditions} 
                                onChange={(e) => updateProfileOnServer({ ...profile, medicalConditions: e.target.value })}
                                className="w-full bg-white/5 border border-white/5 p-2 rounded-xl text-white text-xs h-16 resize-none"
                              />
                            </div>

                            {/* EMERGENCY CONTACTS LIST */}
                            <div className="space-y-2 border-t border-white/5 pt-3">
                              <span className="text-[10px] font-mono text-gray-300 uppercase block">{t.contacts}</span>
                              
                              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                {profile.emergencyContacts.map(cont => (
                                  <div key={cont.id} className="flex justify-between items-center p-2 bg-white/5 rounded-xl border border-white/5">
                                    <div className="space-y-0.5">
                                      <span className="block font-semibold text-[11px] text-white">{cont.name} ({cont.relation})</span>
                                      <span className="block font-mono text-[9px] text-gray-400">{cont.phone}</span>
                                    </div>
                                    <button 
                                      onClick={() => handleDeleteContact(cont.id)}
                                      className="text-gray-400 hover:text-brand-red p-1 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              {/* Form to append new contact quick */}
                              <div className="flex space-x-2 pt-2">
                                <button
                                  onClick={() => handleAddNewContact({
                                    name: "Anjali Chourasiya",
                                    phone: "+1 (555) 302-8812",
                                    relation: "Sister"
                                  })}
                                  className="w-full py-1.5 bg-brand-red/15 hover:bg-brand-red/25 border border-brand-red text-center rounded-xl text-[10px] font-mono font-bold text-white uppercase cursor-pointer"
                                >
                                  + Add simulated Sister Relay Contact
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
    <div className="text-center py-4 bg-white/5 rounded-2xl">
       <span className="text-gray-400 text-xs">No simulated contacts configured. Click below to append.</span>
    </div>
  )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: EMERGENCY HISTORIC ALERTS */}
                  {currentTab === "history" && (
                    <div className="space-y-4" id="history-tab">
                      <div className="glass-panel p-4 rounded-3xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="font-display font-medium text-white text-md">Emergency History logs</h3>
                          <span className="text-[9px] font-mono px-2 py-0.5 bg-brand-red/10 border border-brand-red text-brand-red rounded-full">SECURE REGISTRY</span>
                        </div>

                        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                          {alerts.length === 0 ? (
                            <p className="text-center py-8 text-xs text-gray-500 font-mono">No telemetry rescue signals compiled</p>
                          ) : (
                            alerts.map(item => (
                              <div key={item.id} className="p-3 bg-white/5 border border-white/5 rounded-2xl text-xs space-y-2">
                                <div className="flex justify-between items-center bg-white/5 px-2 py-1 rounded-xl">
                                  <span className="font-mono text-[9px] text-[#ff4c4c] font-black">{item.triggerType}</span>
                                  <span className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    item.status === AlertStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-400' :
                                    item.status === AlertStatus.CANCELLED ? 'bg-neutral-800 text-neutral-400' :
                                    'bg-amber-500/10 text-amber-500'
                                  }`}>{item.status}</span>
                                </div>

                                <div className="space-y-1 font-mono text-[10px] text-gray-400">
                                  <div>Dated: <strong className="text-white">{new Date(item.createdAt).toLocaleString()}</strong></div>
                                  <div>GPS Track: <span className="text-blue-400 truncate tracking-tight">{item.coordinates.address || "Standard Headquarters GPS"}</span></div>
                                  {item.sensorSnapshot && (
                                    <div className="text-[9px] text-neutral-400 mt-1">
                                      Sensor Snapshot G-force: <span className="text-white">{item.sensorSnapshot.gForce}G</span> | Rotation: <span className="text-white">{item.sensorSnapshot.rotationSpeed}°/s</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: WHATSAPP SIMULATION LOGS PREVIEW */}
                  {currentTab === "whatsApp" && (
                    <div className="space-y-4" id="whatsapp-tab">
                      <div className="glass-panel p-4 rounded-3xl border border-emerald-500/30 space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="font-display font-medium text-emerald-400 text-md">WhatsApp SOS fallbacks</h3>
                          <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full">ACTIVE RELAY</span>
                        </div>

                        {whatsappLogs.length === 0 ? (
                          <div className="py-8 text-center space-y-2">
                            <p className="text-xs text-gray-500 font-mono">No fallback signals transmitted during current turn.</p>
                            <p className="text-[10px] text-gray-500 font-mono">Hold the SOS main button or rotate/spin the sensor pad to automatically generate relays.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {whatsappLogs.map((wl, i) => (
                              <div key={i} className="p-3 bg-neutral-900 border border-emerald-500/10 rounded-2xl space-y-1.5 text-xs text-left">
                                <div className="flex justify-between font-mono text-[9px]">
                                  <span className="text-emerald-400">CONTACT: {wl.contactName}</span>
                                  <span className="text-gray-500">{wl.contactPhone}</span>
                                </div>
                                <div className="p-2 bg-emerald-900/10 border border-emerald-900/20 text-gray-300 font-sans leading-relaxed whitespace-pre-wrap select-all font-light rounded-xl">
                                  {wl.message}
                                </div>
                                <span className="block font-mono text-[8px] text-gray-500 uppercase">{wl.smsFallback}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Bottom Navigation Tabs - Clean Integrated Controls */}
            <div className={`fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t flex justify-around items-center pt-3 pb-6 px-4 md:relative md:bottom-auto md:left-auto md:right-auto md:backdrop-blur-none md:rounded-2xl md:mt-6 md:pt-4 md:pb-2 md:px-1 shadow-[0_-20px_40px_rgba(0,0,0,0.8)] md:shadow-none transition-colors duration-300 ${isLightMode ? "bg-white/95 border-gray-200 md:bg-gray-100" : "bg-[#090a0d]/95 border-white/10 md:bg-black/40 md:border-white/5"}`}>
              <button 
                onClick={() => { setCurrentTab("home"); stopSimulatedTracking(); playBeep(550, 0.05); }}
                className={`flex flex-col items-center space-y-1.5 md:space-y-1 py-2 px-4 md:py-1 md:px-3 rounded-xl transition-all cursor-pointer ${currentTab === "home" ? "text-brand-red bg-brand-red/10" : "text-gray-400 hover:text-gray-200"}`}
              >
                <Cpu className="w-5 h-5" />
                <span className="text-[10px] font-mono uppercase font-bold">Guard</span>
              </button>

              <button 
                onClick={() => { setCurrentTab("profile"); playBeep(550, 0.05); }}
                className={`flex flex-col items-center space-y-1.5 md:space-y-1 py-2 px-4 md:py-1 md:px-3 rounded-xl transition-all cursor-pointer ${currentTab === "profile" ? "text-brand-red bg-brand-red/10" : "text-gray-400 hover:text-gray-200"}`}
              >
                <User className="w-5 h-5" />
                <span className="text-[10px] font-mono uppercase font-bold">ID</span>
              </button>

              <button 
                onClick={() => { setCurrentTab("whatsApp"); playBeep(550, 0.05); }}
                className={`flex flex-col items-center space-y-1.5 md:space-y-1 py-2 px-4 md:py-1 md:px-3 rounded-xl transition-all cursor-pointer ${currentTab === "whatsApp" ? "text-brand-red bg-brand-red/10" : "text-gray-400 hover:text-gray-200"}`}
              >
                <Send className="w-5 h-5" />
                <span className="text-[10px] font-mono uppercase font-bold">Relay</span>
              </button>

              <button 
                onClick={() => { setCurrentTab("history"); playBeep(550, 0.05); }}
                className={`flex flex-col items-center space-y-1.5 md:space-y-1 py-2 px-4 md:py-1 md:px-3 rounded-xl transition-all cursor-pointer ${currentTab === "history" ? "text-brand-red bg-brand-red/10" : "text-gray-400 hover:text-gray-200"}`}
              >
                <History className="w-5 h-5" />
                <span className="text-[10px] font-mono uppercase font-bold">Logs</span>
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: DISPATCH COMMAND CENTER & TELEMETRY LAB (lg:col-span-6) */}
        {isAdminMode && (
        <div className="lg:col-span-6 space-y-6 slide-in-right">
          
          {/* SECURE TELEMETRY ADMINDASHBOARD */}
          <div className="glass-panel p-5 rounded-3xl border border-white/5 space-y-4 shadow-xl" id="admin-panel">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center space-x-2">
                <Laptop className="w-5 h-5 text-brand-red" />
                <div>
                  <h2 className="font-display font-bold text-sm tracking-widest text-white uppercase">AUTONOMOUS DISPATCH COMMAND</h2>
                  <span className="font-mono text-[9px] text-gray-400 block tracking-wider">ADMIN OPERATIONS STATION</span>
                </div>
              </div>

              {/* Reset system */}
              <button 
                onClick={triggerAdminReset}
                className="p-1 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-mono text-gray-300 cursor-pointer rounded-lg flex items-center space-x-1"
                title="Flush active queues entirely"
              >
                <RefreshCw className="w-3 h-3 hover:animate-spin" />
                <span>FLUSH ALL QUEUES</span>
              </button>
            </div>

            {/* LIVE ALERTS AND ACTIVE DRIVERS STATUS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* CURRENT RESCUE OPERATIONS BOX */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-gray-400 block uppercase tracking-wider">Live Incoming SOS Queue</span>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {alerts.filter(a => a.status === AlertStatus.ACTIVE || a.status === AlertStatus.COUNTDOWN).length === 0 ? (
                    <div className="py-8 text-center bg-white/2 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-gray-500 font-mono">No active emergencies present</span>
                    </div>
                  ) : (
                    alerts.filter(a => a.status === AlertStatus.ACTIVE || a.status === AlertStatus.COUNTDOWN).map(q => (
                      <div key={q.id} className="p-3 bg-brand-red/10 border border-brand-red/20 rounded-2xl space-y-2">
                        <div className="flex justify-between text-[11px] font-mono font-bold">
                          <span className="text-white">{q.userName}</span>
                          <span className="text-brand-red tracking-wider uppercase animate-pulse">{q.status}</span>
                        </div>
                        
                        <div className="text-[10px] text-gray-400 font-mono space-y-1">
                          <div>Reason: <strong className="text-white">{q.triggerType}</strong></div>
                          <div>Meds: <strong className="text-white">{q.medicalConditions}</strong></div>
                          <div>Contact: <strong className="text-[#38bdf8]">{q.userPhone}</strong></div>
                        </div>

                        {q.status === AlertStatus.COUNTDOWN && (
                          <div className="flex space-x-2 pt-1 border-t border-white/5">
                            <button
                              onClick={() => confirmSosTrigger(q.id)}
                              className="flex-1 py-1 bg-brand-red text-white font-mono text-[9px] font-bold rounded-lg cursor-pointer"
                            >
                              FORCE DISPATCH
                            </button>
                            <button
                              onClick={() => cancelActiveAlert(q.id)}
                              className="flex-1 py-1 bg-neutral-800 text-gray-400 font-mono text-[9px] rounded-lg cursor-pointer"
                            >
                              REJECT SIGNAL
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* AMBULANCE SATELLITE SQUAD FLEET LIST */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-gray-400 block uppercase tracking-wider flex items-center justify-between">
                  <span>GPS AMBULANCE UNITS</span>
                  <span className="text-emerald-400 underline font-semibold">Active: {ambulances.filter(a => a.status === 'dispatched').length}</span>
                </span>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {ambulances.map(amb => (
                    <div key={amb.id} className="p-2.5 bg-white/5 border border-white/5 rounded-2xl text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <strong className="text-white block font-display text-[11px]">{amb.name}</strong>
                        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${
                          amb.status === "available" ? "bg-emerald-500/10 text-emerald-400" : "bg-brand-red/10 text-[#ff4c4c]"
                        }`}>{amb.status}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 text-[9px] font-mono text-gray-400 pt-1 border-t border-white/5">
                        <span>Lic: {amb.licensePlate}</span>
                        <span>Rating: ⭐{amb.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* REAL-TIME SYSTEM EVENTS NOTIFICATIONS FEED */}
            <div className="space-y-2 border-t border-white/5 pt-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-gray-400 block uppercase tracking-wider">Command Telemetry Stream</span>
                <button 
                  onClick={clearNotificationsOnServer}
                  className="font-mono text-gray-500 text-[10px] uppercase hover:text-white"
                >
                  Clear stream
                </button>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto font-mono text-[10px] text-gray-400 pr-1">
                {notifications.length === 0 ? (
                  <p className="py-4 text-center text-gray-500 select-none">Stream clean. Standby active.</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="flex justify-between items-start space-x-2 py-1.5 border-b border-white/2">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${n.type === 'alert' ? 'bg-red-500 animate-ping' : 'bg-[#38bdf8]'}`}></span>
                          <span className="text-white font-medium">{n.title}</span>
                        </div>
                        <p className="text-gray-400 pl-2.5 font-light leading-relaxed">{n.message}</p>
                      </div>
                      <span className="text-[8px] text-gray-500 whitespace-nowrap">{new Date(n.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* SENSORS CALIBRATION LAB & DIAGNOSTICS LOGSBOARD */}
          <div className="glass-panel p-5 rounded-3xl border border-white/5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
              <Activity className="w-5 h-5 text-[#38bdf8]" />
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-white">SYSTEM INTEGRATION GRAPH</h3>
            </div>

            {/* Fake Accelerometer waveform using SVG graph */}
            <div className="relative h-28 bg-[#090a0d] rounded-24 border border-white/5 mb-3 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <span className="font-mono text-[10px] tracking-widest text-white uppercase italic">SENSORS CALIBRATING 120HZ</span>
              </div>
              
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
                <path 
                  d={`M0,50 Q40,${gForceInput > 3 ? 90 : 40} 80,50 T160,50 T240,${sensorRotation > 300 ? 10 : 60} T300,50`} 
                  fill="none" 
                  stroke="#ff3c3c" 
                  strokeWidth="2" 
                />
                <path 
                  d="M0,50 L300,50" 
                  fill="none" 
                  stroke="rgba(255,255,255,0.05)" 
                  strokeWidth="1" 
                  strokeDasharray="5,5" 
                />
              </svg>

              <div className="absolute bottom-2 right-2 bg-neutral-900 border border-white/5 px-1.5 rounded text-[8px] font-mono text-gray-400">
                ACTIVE COUPLERS: 8
              </div>
            </div>

            {/* Static Diagnostic instructions logs */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider">Gateway System Logger</span>
              <div className="bg-black/40 p-3 rounded-2xl border border-white/5 font-mono text-[10px] text-gray-400 max-h-36 overflow-y-auto space-y-1">
                {diagnosticsLogs.map((l, idx) => (
                  <div key={idx}>{l}</div>
                ))}
              </div>
            </div>

            {/* API URL CONFIG SECURE KEY BOX */}
            <div className="p-3 bg-brand-red/5 border border-brand-red/20 rounded-2xl">
              <div className="flex items-center space-x-1.5 justify-between">
                <div className="flex items-center space-x-1 text-[11px] font-mono text-white font-bold">
                  <Key className="w-4 h-4 text-brand-red" />
                  <span>GEMINI API CLOUD DEPLOYMENT STATUS:</span>
                </div>
                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${configStatus.geminiApiKeyConfigured ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'}`}>
                  {configStatus.geminiApiKeyConfigured ? 'SECURE KEY ACTIVE' : 'KEY MISSING'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-mono leading-relaxed">
                {configStatus.geminiApiKeyConfigured ? (
                  "Your model is connected to Gemini 3.5 Flash server-side. Tailored specific advice parses immediately with live accelerometer snapshots."
                ) : (
                  "Please add GEMINI_API_KEY inside the 'Settings > Secrets' panel list on the left frame to activate real-time server-side paramedic intelligence. App automatically provides a fallback model until configured."
                )}
              </p>
            </div>
          </div>

        </div>
        )}

      </div>

      <footer className="mt-8 pt-4 border-t border-white/5 text-center" id="app-footer">
        <p className="text-[10px] text-gray-500 font-mono tracking-wider">
          © 2026 QUICK RESCUE • EMERGENCY MEDICAL DISPATCH NETWORK SYSTEM • ALL DATA STORED SECURELY IN SANDBOX ATLAS MOCKDB
        </p>
      </footer>

    </div>
  );
}
