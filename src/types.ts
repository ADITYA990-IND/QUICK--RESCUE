export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export interface UserProfile {
  id: string;
  fullName: stringdi;
  age: number;
  bloodGroup: string;
  city: string;
  state: string;
  medicalConditions: string;
  emergencyContacts: EmergencyContact[];
  phoneNumber: string;
  avatarUrl?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  address?: string;
}

export enum AlertTriggerType {
  MANUAL = "Manual Button Hold",
  CRASH_DETECTION = "Sudden Crash Impact",
  ROTATIONAL_JERK = "Rotational Slip/Drop from Hand",
  VOICE_COMMAND = "Voice Activation (Help/SOS)",
  SHAKE = "Shake Trigger"
}

export enum AlertStatus {
  COUNTDOWN = "COUNTDOWN",
  ACTIVE = "ACTIVE",
  RESPONDED = "RESPONDED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export interface SosAlert {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  bloodGroup: string;
  medicalConditions: string;
  coordinates: Coordinates;
  triggerType: AlertTriggerType;
  status: AlertStatus;
  createdAt: string;
  countdownRemaining: number;
  ambulanceId?: string;
  aiGuidance?: string;
  sensorSnapshot?: {
    gForce: number;
    rotationSpeed: number; // degrees/sec
    tiltX: number;
    tiltY: number;
  };
}

export interface Ambulance {
  id: string;
  name: string;
  driverName: string;
  phone: string;
  coordinates: Coordinates;
  status: "available" | "dispatched" | "arrived" | "offline";
  licensePlate: string;
  rating: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "alert" | "dispatch" | "system" | "custom";
  resolved: boolean;
}

export interface EmergencyHistoryLog {
  id: string;
  date: string;
  triggerType: AlertTriggerType;
  location: string;
  status: "Completed" | "Cancelled" | "Saved";
  responder: string;
}
