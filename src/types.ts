/**
 * MedSafe Clinical Decision Support System Types
 * Based on research specification by Glory Ephraim (Miva Open University, 2026)
 */

export type ReactionSeverity = 'mild' | 'moderate' | 'severe';
export type InteractionSeverity = 'mild' | 'moderate' | 'severe';
export type AlertSeverity = 'info' | 'mild' | 'moderate' | 'severe';
export type AlertType = 'Reminder' | 'Refill' | 'Allergy' | 'Interaction' | 'Duplicate' | 'Contraindication' | 'Unverified';
export type ReminderStatus = 'Pending' | 'Sent' | 'Acknowledged';
export type RefillStatus = 'Pending' | 'Notified' | 'Refilled';
export type UserRole = 'patient' | 'practitioner' | 'administrator';
export type AppTheme = 'light' | 'dark';

export type ChronicConditionCategory = 'hypertension' | 'diabetes' | 'hiv' | 'asthma' | 'general';

/** Medical Practitioner / Doctor Table */
export interface MedicalPractitioner {
  practitionerID: number;
  fullName: string;
  title: string; // e.g. "Dr. Aisha Bello, MBBS, FWACP"
  roleDesignation: 'Doctor' | 'Consultant Physician' | 'Clinical Pharmacist' | 'Specialist';
  specialty: string; // e.g. "Cardiology & Internal Medicine"
  licenseNumber: string; // e.g. "MDCN-48291" or "PCN-89210"
  hospitalAffiliation: string; // e.g. "National Hospital Abuja"
  contactEmail: string;
  contactPhone: string;
  avatarColor?: string;
  photoUrl?: string; // Base64 or URL profile photo
  pin?: string;
  bio?: string;
  joinedDate?: string;
}

/** Table 3.2: Patient Table */
export interface Patient {
  patientID: number;
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  contactNumber: string;
  passwordHash: string;
  conditionTags: string[];
  email?: string;
  gender?: 'Female' | 'Male' | 'Other' | 'Prefer not to say';
  bloodGroup?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  avatarColor?: string;
  photoUrl?: string; // Base64 or URL profile photo
  assignedDoctorID?: number; // Linked medical practitioner ID
  clinicalNotes?: string; // Latest clinical advice/note from doctor
}

/** Table 3.3: Medication Table */
export interface Medication {
  medicationID: number;
  patientID: number;
  drugName: string;
  normalisedGeneric: string;
  atcCode?: string;
  dosage: string;
  schedule: string; // Comma separated times e.g. "08:00, 20:00"
  quantityRemaining: number;
  quantityPerDose: number;
  dosesPerDay: number;
  refillThresholdDays: number;
  status: 'active' | 'discontinued';
  prescribedDate: string;
  conditionCategory: ChronicConditionCategory;
  instructions?: string;
  photoUrl?: string; // Photo of pill bottle, blister pack, or Rx label
}

/** Table 3.4: Allergy Table */
export interface Allergy {
  allergyID: number;
  patientID: number;
  allergenName: string;
  reactionSeverity: ReactionSeverity;
  symptoms?: string;
  documentedDate: string;
}

/** Table 3.5: Interaction Rule Table (with Provenance FR11) */
export interface InteractionRule {
  ruleID: number;
  drugA: string; // generic ATC name
  drugB: string; // generic ATC name
  severityLevel: InteractionSeverity;
  clinicalEffect: string;
  sourceReference: string; // e.g. "British National Formulary 85 (Appendix 1)", "FDA Drug Safety Communication"
  versionDate: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
}

/** Table 3.6: AlertLog Table */
export interface AlertLog {
  alertID: number;
  patientID: number;
  alertType: AlertType;
  severity: AlertSeverity;
  message: string;
  details?: string;
  ruleID?: number;
  timestamp: string; // ISO String
  read?: boolean;
}

/** Table 3.7: Administrator Table */
export interface Administrator {
  adminID: number;
  username: string;
  passwordHash: string;
  fullName: string;
  role: string;
}

/** Table 3.8: Reminder Table */
export interface Reminder {
  reminderID: number;
  medicationID: number;
  patientID: number;
  drugName: string;
  dosage: string;
  scheduledTime: string; // "HH:MM"
  status: ReminderStatus;
  sentAt?: string;
  acknowledgedAt?: string;
  note?: string;
  /** Local calendar date (YYYY-MM-DD) this dose slot belongs to. Used to re-arm reminders daily. */
  dueDate?: string;
}

/** Table 3.9: RefillNotification Table */
export interface RefillNotification {
  notificationID: number;
  medicationID: number;
  patientID: number;
  drugName: string;
  dueDate: string; // YYYY-MM-DD
  daysRemaining: number;
  quantityRemaining: number;
  thresholdDays: number;
  status: RefillStatus;
  createdAt: string;
}

/** Real-world Multi-channel SMS & Push Dispatch Notification Record */
export interface SMSNotificationRecord {
  smsID: number;
  patientID: number;
  phoneNumber: string;
  message: string;
  channel: 'SMS' | 'PUSH' | 'WEBHOOK';
  status: 'DELIVERED' | 'QUEUED' | 'FAILED';
  provider: string;
  dispatchTimestamp: string;
  referenceId: string;
}

export type ClockMode = 'realtime' | 'simulated';


/** Pharmacokinetic Summary and Chronotherapy Profile */
export interface PharmacokineticProfile {
  halfLife: string; // Elimination half-life (t1/2)
  peakPlasmaTime: string; // Time to peak concentration (Tmax)
  bioavailability: string; // Systemic bioavailability (F)
  clearanceRoute: string; // Primary elimination / organ clearance
  metabolism: string; // Hepatic enzyme / biochemical pathway
}

/** Drug Registry item for normalization (WHO ATC based) */
export interface DrugRegistryItem {
  genericName: string;
  atcCode: string;
  category: ChronicConditionCategory;
  brandNames: string[];
  commonForms: string[];
  allergenGroup?: string;
  description: string;
  // Pharmacokinetic Summary & Best Time to Take Advice
  pharmacokinetics?: PharmacokineticProfile;
  bestTimeToTake?: string; // Chronotherapy advice & optimal dosing window
  foodAdvice?: string; // Food-drug interactions and dietary guidance
  clinicalPearl?: string; // Key clinical and mechanism note
}

/** Audit Trail for administrative changes (FR12) */
export interface AuditTrailEntry {
  auditID: number;
  adminUsername: string;
  action: 'CREATE_RULE' | 'UPDATE_RULE' | 'DELETE_RULE' | 'OVERRIDE_ALERT' | 'BACKUP_DATA' | 'UPDATE_CARE_TEAM' | 'REGISTER_PRACTITIONER' | 'REGISTER_PATIENT';
  entityType: 'InteractionRule' | 'DrugRegistry' | 'Patient' | 'Practitioner' | 'System';
  entityID: string | number;
  details: string;
  timestamp: string;
}

/** Table 3.11: Verification Test Case Definition */
export interface TestCase {
  id: string;
  name: string;
  inputDescription: string;
  expectedResult: string;
  category: 'Allergy' | 'Interaction' | 'FailSafe' | 'Safe' | 'Refill' | 'Reminder' | 'Security' | 'Validation';
}

export interface TestCaseResult extends TestCase {
  actualResult: string;
  passed: boolean;
  executionTimeMs: number;
  logs: string[];
}

/** Technology Acceptance Model (TAM - Davis 1989) Survey Response */
export interface TAMSurveyResponse {
  responseID: string;
  patientID?: number;
  patientName: string;
  perceivedUsefulness: {
    workSpeed: number; // 1-5
    performance: number; // 1-5
    effectiveness: number; // 1-5
    overallUseful: number; // 1-5
  };
  perceivedEaseOfUse: {
    easyToLearn: number; // 1-5
    clearInteraction: number; // 1-5
    flexible: number; // 1-5
    overallEasy: number; // 1-5
  };
  qualitativeFeedback?: string;
  submittedAt: string;
}
