import React, { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { ShieldCheck } from 'lucide-react';

import { MobileHeader } from './components/MobileHeader';
import { MobileBottomNav, MobileTab } from './components/MobileBottomNav';
import { TodayScheduleView } from './components/TodayScheduleView';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { playDoseReminderChime, isAudioAlertEnabled, setAudioAlertEnabled } from './lib/audioAlert';
import { sendDesktopNotification } from './lib/notificationService';
import { readCollection, writeCollection, readSetting, writeSetting, eraseAllData } from './services/store';
import { isPinSet, setPin, clearPin } from './lib/appLock';
import { AppLockScreen } from './components/AppLockScreen';

// Code-split views keep the initial install download small
const MedicationCabinetView = lazy(() => import('./components/MedicationCabinetView').then(m => ({ default: m.MedicationCabinetView })));
const RefillTrackerView = lazy(() => import('./components/RefillTrackerView').then(m => ({ default: m.RefillTrackerView })));
const SafetyView = lazy(() => import('./components/SafetyView').then(m => ({ default: m.SafetyView })));
const AboutView = lazy(() => import('./components/AboutView').then(m => ({ default: m.AboutView })));
const AddMedicationModal = lazy(() => import('./components/AddMedicationModal').then(m => ({ default: m.AddMedicationModal })));
const BackupExportModal = lazy(() => import('./components/BackupExportModal').then(m => ({ default: m.BackupExportModal })));
const AlertsDrawer = lazy(() => import('./components/AlertsDrawer').then(m => ({ default: m.AlertsDrawer })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const UserProfileDrawer = lazy(() => import('./components/UserProfileDrawer').then(m => ({ default: m.UserProfileDrawer })));

const ViewFallback: React.FC = () => (
  <div className="flex items-center justify-center p-8 text-slate-400 dark:text-zinc-500 text-xs">
    <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mr-2" />
    <span>Loading…</span>
  </div>
);

import {
  Patient,
  Medication,
  Allergy,
  InteractionRule,
  DrugRegistryItem,
  Reminder,
  RefillNotification,
  AlertLog,
  AppTheme
} from './types';

import {
  INITIAL_PATIENTS,
  INITIAL_MEDICATIONS,
  INITIAL_ALLERGIES,
  INITIAL_INTERACTION_RULES,
  INITIAL_DRUG_REGISTRY,
  INITIAL_REMINDERS,
  INITIAL_REFILL_NOTIFICATIONS,
  INITIAL_ALERT_LOGS
} from './data/initialData';

import {
  calculateRefillDueDate,
  scheduleRemindersForMedication,
  EvaluationResult,
  toLocalDateStr
} from './services/ruleEngine';

export interface NewProfileInput {
  fullName: string;
  dateOfBirth: string;
  contactNumber?: string;
  gender?: Patient['gender'];
  bloodGroup?: string;
  conditionTags: string[];
  initialAllergyGroup?: string;
  avatarColor?: string;
  photoUrl?: string;
}

export default function App() {
  // ---------------------------------------------------------------- theme
  const [theme, setTheme] = useState<AppTheme>(() => readSetting<AppTheme>('theme', 'light'));

  useEffect(() => {
    writeSetting('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleToggleTheme = (newTheme?: AppTheme) => {
    setTheme(prev => newTheme || (prev === 'light' ? 'dark' : 'light'));
  };

  // ------------------------------------------------- local-first data
  const [patients, setPatients] = useState<Patient[]>(() => readCollection('patients', [] as Patient[]));
  const [activePatientID, setActivePatientID] = useState<number>(() => readSetting<number>('active_patient', 0));
  const [medications, setMedications] = useState<Medication[]>(() => readCollection('medications', [] as Medication[]));
  const [allergies, setAllergies] = useState<Allergy[]>(() => readCollection('allergies', [] as Allergy[]));
  const [interactionRules, setInteractionRules] = useState<InteractionRule[]>(() =>
    readCollection('interactionRules', INITIAL_INTERACTION_RULES)
  );
  const [reminders, setReminders] = useState<Reminder[]>(() => readCollection('reminders', [] as Reminder[]));
  const [refillNotifications, setRefillNotifications] = useState<RefillNotification[]>(() =>
    readCollection('refillNotifications', [] as RefillNotification[])
  );
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>(() => readCollection('alertLogs', [] as AlertLog[]));
  const [drugRegistry] = useState<DrugRegistryItem[]>(INITIAL_DRUG_REGISTRY);

  // Persist every collection the moment it changes (this is the whole
  // persistence layer — no server round trip, works fully offline).
  useEffect(() => writeCollection('patients', patients), [patients]);
  useEffect(() => writeCollection('medications', medications), [medications]);
  useEffect(() => writeCollection('allergies', allergies), [allergies]);
  useEffect(() => writeCollection('interactionRules', interactionRules), [interactionRules]);
  useEffect(() => writeCollection('reminders', reminders), [reminders]);
  useEffect(() => writeCollection('refillNotifications', refillNotifications), [refillNotifications]);
  useEffect(() => writeCollection('alertLogs', alertLogs), [alertLogs]);
  useEffect(() => writeSetting('active_patient', activePatientID), [activePatientID]);

  // --------------------------------------------------------- navigation
  const [mobileTab, setMobileTab] = useState<MobileTab>('today');
  const [isAddMedModalOpen, setIsAddMedModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // --------------------------------------------------------- sound & clock
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => isAudioAlertEnabled());
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(interval);
  }, []);

  // Dedupe guards so StrictMode / re-renders never double-fire a notification
  const notifiedRef = useRef<Set<string>>(new Set());
  const refillAlertedRef = useRef<Set<string>>(new Set());

  const activePatient = useMemo(
    () => patients.find(p => p.patientID === activePatientID) || patients[0],
    [patients, activePatientID]
  );

  const unreadAlerts = useMemo(
    () => alertLogs.filter(a => activePatient && a.patientID === activePatient.patientID && !a.read),
    [alertLogs, activePatient]
  );

  const pendingRefills = useMemo(
    () =>
      refillNotifications.filter(
        r => activePatient && r.patientID === activePatient.patientID && (r.status === 'Pending' || r.status === 'Notified')
      ),
    [refillNotifications, activePatient]
  );

  const pendingReminders = useMemo(
    () => reminders.filter(r => activePatient && r.patientID === activePatient.patientID && r.status === 'Sent'),
    [reminders, activePatient]
  );

  const fireReminderNotification = useCallback(
    (rem: Reminder) => {
      const dedupeKey = `${rem.reminderID}:${toLocalDateStr(now)}`;
      if (notifiedRef.current.has(dedupeKey)) return;
      notifiedRef.current.add(dedupeKey);

      if (soundEnabled) playDoseReminderChime();
      sendDesktopNotification({
        title: `Dose due: ${rem.drugName} (${rem.dosage})`,
        body: `Scheduled for ${rem.scheduledTime}. Tap to open MedSafe.`,
        tag: `reminder-${rem.reminderID}`,
        requireInteraction: true
      });

      setAlertLogs(prev => [
        {
          alertID: Date.now() + Math.floor(Math.random() * 1000),
          patientID: rem.patientID,
          alertType: 'Reminder',
          severity: 'moderate',
          message: `Time for your scheduled dose: ${rem.drugName} (${rem.dosage}) — ${rem.scheduledTime}`,
          timestamp: new Date().toISOString(),
          read: false
        },
        ...prev
      ]);
    },
    [soundEnabled, now]
  );

  // ==========================================
  // SCHEDULER: daily reminder arming + refill forecasting (algorithms 3.2 / 3.3)
  // ==========================================
  useEffect(() => {
    const today = toLocalDateStr(now);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // --- 1. Re-arm reminders for a new day, then flip due doses to "Sent" ---
    const newlyDue: Reminder[] = [];
    let remindersChanged = false;

    const nextReminders = reminders.map(rem => {
      let next = rem;

      if ((next.dueDate || '') !== today) {
        // New calendar day: this dose slot has not been taken yet
        next = {
          ...next,
          dueDate: today,
          status: 'Pending' as const,
          sentAt: undefined,
          acknowledgedAt: undefined
        };
        remindersChanged = true;
      }

      if (next.status === 'Pending') {
        const [h, m] = next.scheduledTime.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m) && nowMinutes >= h * 60 + m) {
          next = { ...next, status: 'Sent' as const, sentAt: now.toISOString() };
          remindersChanged = true;
          newlyDue.push(next);
        }
      }

      return next;
    });

    if (remindersChanged) setReminders(nextReminders);

    // Only alert for doses that became due recently (avoids a notification
    // storm when the app is opened long after a scheduled time).
    newlyDue.forEach(rem => {
      const [h, m] = rem.scheduledTime.split(':').map(Number);
      if (nowMinutes - (h * 60 + m) <= 180) fireReminderNotification(rem);
    });

    // --- 2. Refill depletion forecasting (Algorithm 3.2) ---
    medications.forEach(med => {
      if (med.status !== 'active') return;
      const refillCalc = calculateRefillDueDate(med, now);

      if (refillCalc.isDue && refillCalc.notification) {
        const alreadyOpen = refillNotifications.find(
          rn => rn.medicationID === med.medicationID && rn.status !== 'Refilled'
        );

        if (!alreadyOpen) {
          setRefillNotifications(prev => [
            { ...refillCalc.notification!, notificationID: Date.now() + Math.floor(Math.random() * 500) },
            ...prev
          ]);
        }

        const alertKey = `${med.medicationID}:${refillCalc.notification.dueDate}`;
        if (refillCalc.alert && !refillAlertedRef.current.has(alertKey)) {
          refillAlertedRef.current.add(alertKey);
          setAlertLogs(prev => [{ ...refillCalc.alert!, alertID: Date.now() + Math.floor(Math.random() * 1000) }, ...prev]);
        }
      }
    });
  }, [now, reminders, medications, refillNotifications, fireReminderNotification]);

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  const handleAcknowledgeReminder = (reminderID: number) => {
    const target = reminders.find(r => r.reminderID === reminderID);
    if (!target) return;

    setReminders(prev =>
      prev.map(r => (r.reminderID === reminderID ? { ...r, status: 'Acknowledged' as const, acknowledgedAt: new Date().toISOString() } : r))
    );

    // Decrement the pill count for this dose
    setMedications(prev =>
      prev.map(med =>
        med.medicationID === target.medicationID
          ? { ...med, quantityRemaining: Math.max(0, med.quantityRemaining - (med.quantityPerDose || 1)) }
          : med
      )
    );
  };

  const handleTakeDose = (medicationID: number) => {
    setMedications(prev =>
      prev.map(med =>
        med.medicationID === medicationID
          ? { ...med, quantityRemaining: Math.max(0, med.quantityRemaining - (med.quantityPerDose || 1)) }
          : med
      )
    );
  };

  const handleRestockSupply = (medicationID: number, quantityToAdd: number) => {
    setMedications(prev =>
      prev.map(med => (med.medicationID === medicationID ? { ...med, quantityRemaining: med.quantityRemaining + quantityToAdd } : med))
    );
    setRefillNotifications(prev =>
      prev.map(r => (r.medicationID === medicationID && r.status !== 'Refilled' ? { ...r, status: 'Refilled' as const } : r))
    );
  };

  const handleRemoveMedication = (medicationID: number) => {
    setMedications(prev => prev.filter(m => m.medicationID !== medicationID));
    setReminders(prev => prev.filter(r => r.medicationID !== medicationID));
    setRefillNotifications(prev => prev.filter(rn => rn.medicationID !== medicationID));
  };

  /** Add a medication after rule-based safety verification (Algorithm 3.1). */
  const handleAddMedication = (
    newMedData: Omit<Medication, 'medicationID'>,
    evaluation: EvaluationResult,
    overrideReason?: string
  ) => {
    const newMedication: Medication = { ...newMedData, medicationID: Date.now() };

    setMedications(prev => [newMedication, ...prev]);

    // Schedule daily dose slots (Algorithm 3.3)
    const newReminders = scheduleRemindersForMedication(newMedication, reminders).filter(
      nr => !reminders.some(r => r.reminderID === nr.reminderID)
    );
    setReminders(prev => [...prev, ...newReminders]);

    // Persist the full screening result — every alert the engine produced
    // (allergy, interaction, duplicate, contraindication, fail-safe) is kept.
    const stamp = Date.now();
    const persistedAlerts: AlertLog[] = evaluation.alertsToLog.map((a, i) => ({
      ...a,
      alertID: stamp + i
    }));

    if (overrideReason) {
      persistedAlerts.unshift({
        alertID: stamp - 1,
        patientID: newMedication.patientID,
        alertType: 'Interaction',
        severity: 'moderate',
        message: `Added under clinical override: "${overrideReason}"`,
        details: `${newMedication.drugName} (${newMedication.dosage}) was added despite a flagged conflict.`,
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    if (persistedAlerts.length > 0) {
      setAlertLogs(prev => [...persistedAlerts, ...prev]);
      if (soundEnabled) playDoseReminderChime();
    }
  };

  // ----------------------------------------- allergies
  const handleAddAllergy = (newAllergyData: Omit<Allergy, 'allergyID'>) => {
    const newAllergy: Allergy = { ...newAllergyData, allergyID: Date.now() };
    setAllergies(prev => [newAllergy, ...prev]);
    setAlertLogs(prev => [
      {
        alertID: Date.now() + 1,
        patientID: newAllergy.patientID,
        alertType: 'Allergy',
        severity: newAllergy.reactionSeverity,
        message: `${newAllergy.allergenName} recorded — every new medication is now screened against this allergy.`,
        timestamp: new Date().toISOString(),
        read: false
      },
      ...prev
    ]);
  };

  const handleRemoveAllergy = (allergyID: number) => {
    setAllergies(prev => prev.filter(a => a.allergyID !== allergyID));
  };

  // ----------------------------------------- alerts
  const handleClearAlert = (alertID: number) => {
    setAlertLogs(prev => prev.filter(a => a.alertID !== alertID));
  };

  const handleMarkAllAlertsRead = () => {
    if (!activePatient) return;
    const id = activePatient.patientID;
    setAlertLogs(prev => prev.map(a => (a.patientID === id ? { ...a, read: true } : a)));
  };

  // ----------------------------------------- profiles
  const handleCreateProfile = (data: NewProfileInput) => {
    const nextId = patients.length === 0 ? 1 : Math.max(...patients.map(p => p.patientID), 0) + 1;
    const newPatient: Patient = {
      patientID: nextId,
      fullName: data.fullName.trim(),
      dateOfBirth: data.dateOfBirth,
      contactNumber: data.contactNumber?.trim() || '',
      passwordHash: '',
      conditionTags: data.conditionTags.length > 0 ? data.conditionTags : ['General Wellness'],
      gender: data.gender,
      bloodGroup: data.bloodGroup,
      avatarColor: data.avatarColor || 'bg-teal-600',
      photoUrl: data.photoUrl
    };

    setPatients(prev => [newPatient, ...prev]);
    setActivePatientID(nextId);
    setIsProfileModalOpen(false);

    if (data.initialAllergyGroup && data.initialAllergyGroup !== 'none' && data.initialAllergyGroup !== 'None') {
      setAllergies(prev => [
        {
          allergyID: Date.now() + 2,
          patientID: nextId,
          allergenName: data.initialAllergyGroup!,
          reactionSeverity: 'severe',
          symptoms: 'Reported during profile setup',
          documentedDate: toLocalDateStr()
        },
        ...prev
      ]);
    }

    setAlertLogs(prev => [
      {
        alertID: Date.now() + 1,
        patientID: nextId,
        alertType: 'Reminder',
        severity: 'mild',
        message: `Welcome, ${newPatient.fullName}! Your safety profile is active. Add your medications to enable interaction and allergy screening.`,
        timestamp: new Date().toISOString(),
        read: false
      },
      ...prev
    ]);
  };

  const handleSelectProfile = (patientID: number) => {
    setActivePatientID(patientID);
    setIsProfileModalOpen(false);
    setIsProfileDrawerOpen(false);
    setMobileTab('today');
  };

  const handleUpdatePatientPhoto = (patientID: number, photoUrl: string | undefined) => {
    setPatients(prev => prev.map(p => (p.patientID === patientID ? { ...p, photoUrl } : p)));
  };

  // ----------------------------------------- app lock (optional PIN)
  const [lockEnabled, setLockEnabled] = useState<boolean>(() => isPinSet());
  const [lockMode, setLockMode] = useState<'unlock' | 'setup' | null>(() => (isPinSet() ? 'unlock' : null));

  const handleSetPin = async (pin: string) => {
    await setPin(pin);
    setLockEnabled(true);
    setLockMode(null);
  };

  const handleRemovePin = () => {
    if (!window.confirm('Remove the PIN lock? The app will open without a PIN.')) return;
    clearPin();
    setLockEnabled(false);
    setLockMode(null);
  };

  const handleLockNow = () => setLockMode('unlock');

  // Auto-lock after the app has been in the background for over a minute
  useEffect(() => {
    if (!lockEnabled || lockMode) return;
    let hiddenAt = 0;
    const onVisibility = () => {
      if (document.hidden) {
        hiddenAt = Date.now();
        return;
      }
      if (hiddenAt && Date.now() - hiddenAt > 60_000) setLockMode('unlock');
      hiddenAt = 0;
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [lockEnabled, lockMode]);

  // ----------------------------------------- data management
  const handleRestoreDatabaseState = (restored: any) => {
    if (Array.isArray(restored.patients)) setPatients(restored.patients);
    if (Array.isArray(restored.medications)) setMedications(restored.medications);
    if (Array.isArray(restored.allergies)) setAllergies(restored.allergies);
    if (Array.isArray(restored.interactionRules)) setInteractionRules(restored.interactionRules);
    if (Array.isArray(restored.reminders)) setReminders(restored.reminders);
    if (Array.isArray(restored.refillNotifications)) setRefillNotifications(restored.refillNotifications);
    if (Array.isArray(restored.alertLogs)) setAlertLogs(restored.alertLogs);
    if (Array.isArray(restored.patients) && restored.patients.length > 0) {
      setActivePatientID(restored.patients[0].patientID);
    }
  };

  const fullDatabaseSnapshot = useMemo(
    () => ({
      schemaVersion: '3.0',
      exportedAt: new Date().toISOString(),
      app: 'MedSafe',
      patients,
      medications,
      allergies,
      interactionRules,
      reminders,
      refillNotifications,
      alertLogs
    }),
    [patients, medications, allergies, interactionRules, reminders, refillNotifications, alertLogs]
  );

  const handleLoadSampleData = () => {
    setPatients(INITIAL_PATIENTS);
    setActivePatientID(INITIAL_PATIENTS[0]?.patientID ?? 1);
    setMedications(INITIAL_MEDICATIONS);
    setAllergies(INITIAL_ALLERGIES);
    setInteractionRules(INITIAL_INTERACTION_RULES);
    setReminders(INITIAL_REMINDERS);
    setRefillNotifications(INITIAL_REFILL_NOTIFICATIONS);
    setAlertLogs(INITIAL_ALERT_LOGS);
    setIsProfileModalOpen(false);
  };

  const handleEraseAllData = () => {
    if (!window.confirm('Erase every profile, medication, allergy and alert stored on this device? This cannot be undone.')) return;
    eraseAllData();
    setPatients([]);
    setMedications([]);
    setAllergies([]);
    setReminders([]);
    setRefillNotifications([]);
    setAlertLogs([]);
    setInteractionRules(INITIAL_INTERACTION_RULES);
    setActivePatientID(0);
    setIsProfileDrawerOpen(false);
    clearPin();
    setLockEnabled(false);
    setLockMode(null);
    notifiedRef.current.clear();
    refillAlertedRef.current.clear();
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setAudioAlertEnabled(next);
    if (next) playDoseReminderChime();
  };

  const hasProfiles = patients.length > 0;
  const nowString = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-teal-600 selection:text-white transition-colors">
      {/* Slim brand bar */}
      <div className="safe-top bg-white dark:bg-zinc-900 px-4 py-1.5 text-xs border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-zinc-100">
          <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-500" />
          <span>MedSafe</span>
          <span className="text-[10px] font-normal text-slate-400 dark:text-zinc-500 font-mono">v2.0</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[11px] text-slate-500 dark:text-zinc-400">{nowString}</span>
          <PWAInstallButton />
        </div>
      </div>

      {/* Main phone-width container */}
      <div className="flex-1 flex items-start justify-center p-0 sm:py-6 overflow-x-hidden">
        <div className="w-full max-w-md min-h-screen sm:min-h-[820px] bg-white dark:bg-zinc-900 sm:rounded-2xl sm:border sm:border-slate-200 dark:sm:border-zinc-800 sm:shadow-sm flex flex-col overflow-hidden transition-all duration-200">
          {hasProfiles && activePatient && (
            <>
              <MobileHeader
                activePatient={activePatient}
                now={now}
                unreadAlertCount={unreadAlerts.length}
                onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
                theme={theme}
                onToggleTheme={handleToggleTheme}
                onOpenProfile={() => setIsProfileDrawerOpen(true)}
              />

              <main className="flex-1 overflow-y-auto p-4 pb-28 space-y-4 bg-slate-50 dark:bg-zinc-950 transition-colors">
                <Suspense fallback={<ViewFallback />}>
                  {mobileTab === 'today' && (
                    <TodayScheduleView
                      patient={activePatient}
                      reminders={reminders}
                      medications={medications}
                      onAcknowledgeReminder={handleAcknowledgeReminder}
                      onOpenNewPrescription={() => setIsAddMedModalOpen(true)}
                      simulatedTime={now}
                    />
                  )}

                  {mobileTab === 'cabinet' && (
                    <MedicationCabinetView
                      patient={activePatient}
                      medications={medications}
                      drugRegistry={drugRegistry}
                      onTakeDose={handleTakeDose}
                      onRestockSupply={handleRestockSupply}
                      onRemoveMedication={handleRemoveMedication}
                      onOpenNewMedication={() => setIsAddMedModalOpen(true)}
                    />
                  )}

                  {mobileTab === 'refills' && (
                    <RefillTrackerView
                      patient={activePatient}
                      refillNotifications={refillNotifications}
                      medications={medications}
                      onFulfillRefill={handleRestockSupply}
                      onOpenNewPrescription={() => setIsAddMedModalOpen(true)}
                      simulatedTime={now}
                    />
                  )}

                  {mobileTab === 'safety' && (
                    <SafetyView
                      patient={activePatient}
                      allergies={allergies}
                      alertLogs={alertLogs}
                      drugRegistry={drugRegistry}
                      onAddAllergy={handleAddAllergy}
                      onRemoveAllergy={handleRemoveAllergy}
                    />
                  )}

                  {mobileTab === 'about' && (
                    <AboutView onOpenBackup={() => setIsBackupModalOpen(true)} onLoadSampleData={handleLoadSampleData} />
                  )}
                </Suspense>
              </main>

              <div className="relative">
                <MobileBottomNav
                  activeTab={mobileTab}
                  onChangeTab={setMobileTab}
                  unreadAlertCount={unreadAlerts.length}
                  pendingRefillCount={pendingRefills.length}
                  pendingReminderCount={pendingReminders.length}
                />
              </div>

          {/* Bottom home indicator — sits above the iOS home bar / Android gesture bar */}
          <div className="safe-bottom bg-white/95 dark:bg-zinc-900 pb-1.5 pt-0.5 flex justify-center shrink-0 border-t border-slate-100 dark:border-zinc-800">
                <div className="w-28 h-1 bg-slate-300 dark:bg-zinc-700 rounded-full" />
              </div>
            </>
          )}
        </div>
      </div>

      <Suspense fallback={null}>
        {isAddMedModalOpen && activePatient && (
          <AddMedicationModal
            isOpen={isAddMedModalOpen}
            onClose={() => setIsAddMedModalOpen(false)}
            patient={activePatient}
            patientAllergies={allergies}
            activeMedications={medications}
            drugRegistry={drugRegistry}
            interactionRules={interactionRules}
            onAddMedication={handleAddMedication}
          />
        )}

        {isBackupModalOpen && (
          <BackupExportModal
            isOpen={isBackupModalOpen}
            onClose={() => setIsBackupModalOpen(false)}
            fullDatabaseState={fullDatabaseSnapshot}
            onRestoreState={handleRestoreDatabaseState}
          />
        )}

        {isAlertsDrawerOpen && activePatient && (
          <AlertsDrawer
            isOpen={isAlertsDrawerOpen}
            onClose={() => setIsAlertsDrawerOpen(false)}
            alertLogs={alertLogs.filter(a => a.patientID === activePatient.patientID)}
            onClearAlert={handleClearAlert}
            onMarkAllAsRead={handleMarkAllAlertsRead}
          />
        )}

        <AuthModal
          isOpen={!hasProfiles || isProfileModalOpen}
          canClose={hasProfiles}
          onClose={() => setIsProfileModalOpen(false)}
          patients={patients}
          activePatientID={activePatient?.patientID ?? 0}
          onSelectProfile={handleSelectProfile}
          onCreateProfile={handleCreateProfile}
          onLoadSampleData={handleLoadSampleData}
        />

        {isProfileDrawerOpen && activePatient && (
          <UserProfileDrawer
            isOpen={isProfileDrawerOpen}
            onClose={() => setIsProfileDrawerOpen(false)}
            patient={activePatient}
            patientAllergies={allergies.filter(a => a.patientID === activePatient.patientID)}
            patients={patients}
            onSelectProfile={handleSelectProfile}
            onAddProfile={() => {
              setIsProfileDrawerOpen(false);
              setIsProfileModalOpen(true);
            }}
            onUpdatePatientPhoto={photoUrl => handleUpdatePatientPhoto(activePatient.patientID, photoUrl)}
            onEraseAllData={handleEraseAllData}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            appLockEnabled={lockEnabled}
            onSetupAppLock={() => {
              setIsProfileDrawerOpen(false);
              setLockMode('setup');
            }}
            onLockNow={handleLockNow}
            onRemoveAppLock={handleRemovePin}
          />
        )}
      </Suspense>

      {/* PIN lock — covers everything until verified */}
      {lockMode && (
        <AppLockScreen
          mode={lockMode}
          onUnlock={() => setLockMode(null)}
          onSetPin={handleSetPin}
          onCancelSetup={() => setLockMode(null)}
        />
      )}

      <OfflineIndicator />
    </div>
  );
}
