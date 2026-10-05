import React from 'react';
import {
  X,
  User,
  AlertCircle,
  Moon,
  Sun,
  UserPlus,
  ChevronRight,
  Users,
  Trash2,
  Bell,
  BellOff,
  Check,
  Lock,
  KeyRound
} from 'lucide-react';
import { Patient, AppTheme, Allergy } from '../types';
import { PhotoUploadDropzone } from './PhotoUploadDropzone';
import { PWAInstallButton } from './PWAInstallButton';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  patientAllergies: Allergy[];
  patients: Patient[];
  onSelectProfile: (patientID: number) => void;
  onAddProfile: () => void;
  onUpdatePatientPhoto?: (photoUrl: string | undefined) => void;
  onEraseAllData: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme: AppTheme;
  onToggleTheme: (newTheme: AppTheme) => void;
  appLockEnabled: boolean;
  onSetupAppLock: () => void;
  onLockNow: () => void;
  onRemoveAppLock: () => void;
}

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  isOpen,
  onClose,
  patient,
  patientAllergies,
  patients,
  onSelectProfile,
  onAddProfile,
  onUpdatePatientPhoto,
  onEraseAllData,
  soundEnabled,
  onToggleSound,
  theme,
  onToggleTheme,
  appLockEnabled,
  onSetupAppLock,
  onLockNow,
  onRemoveAppLock
}) => {
  if (!isOpen) return null;

  const initials = patient.fullName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-drawer-title"
        className="w-full max-w-sm h-full bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-zinc-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 id="patient-drawer-title" className="text-sm font-bold">
              Profile &amp; Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Identity card */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-white dark:from-zinc-800/60 dark:to-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center text-white font-bold text-xl shadow-xs shrink-0 ${
                  patient.avatarColor || 'bg-teal-600'
                }`}
              >
                {patient.photoUrl ? (
                  <img src={patient.photoUrl} alt={patient.fullName} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100 truncate">{patient.fullName}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                  {patient.contactNumber || 'Health profile'}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800">
                    Profile #{patient.patientID.toString().padStart(4, '0')}
                  </span>
                  {patient.bloodGroup && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800">
                      Blood {patient.bloodGroup}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
              <PhotoUploadDropzone
                id="drawer-patient-photo-upload"
                photoUrl={patient.photoUrl}
                onChangePhoto={url => onUpdatePatientPhoto?.(url)}
                label="Profile Photo"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 dark:text-zinc-500 text-[11px] block">Date of birth</span>
                <span className="font-medium text-slate-800 dark:text-zinc-200">{patient.dateOfBirth}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-zinc-500 text-[11px] block">Contact</span>
                <span className="font-medium text-slate-800 dark:text-zinc-200 truncate block">
                  {patient.contactNumber || '-'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 dark:text-zinc-500 text-[11px] block mb-1">Active conditions</span>
              <div className="flex flex-wrap gap-1">
                {patient.conditionTags.map(c => (
                  <span
                    key={c}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {patientAllergies.length > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40">
                <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 text-xs font-semibold mb-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Documented drug allergies ({patientAllergies.length})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {patientAllergies.map(a => (
                    <span
                      key={a.allergyID}
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm bg-white dark:bg-zinc-900 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800"
                    >
                      {a.allergenName} ({a.reactionSeverity})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {patient.emergencyContact && (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800 text-xs">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 block mb-0.5">
                  Emergency contact
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {patient.emergencyContact.name} ({patient.emergencyContact.relationship})
                  </span>
                  <a
                    href={`tel:${patient.emergencyContact.phone}`}
                    className="text-teal-600 dark:text-teal-400 font-medium hover:underline text-[11px]"
                  >
                    {patient.emergencyContact.phone}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Profiles on this device */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-100">
                <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Profiles on this device</span>
              </div>
              <button
                onClick={onAddProfile}
                className="flex items-center gap-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300 hover:underline"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {patients.map(p => {
                const isActive = p.patientID === patient.patientID;
                const pInitials = p.fullName
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();
                return (
                  <button
                    key={p.patientID}
                    onClick={() => onSelectProfile(p.patientID)}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left text-xs border transition ${
                      isActive
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30 dark:border-teal-700 font-semibold'
                        : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${
                        p.avatarColor || 'bg-teal-600'
                      }`}
                    >
                      {pInitials}
                    </span>
                    <span className="flex-1 truncate">{p.fullName}</span>
                    {isActive ? (
                      <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferences */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-3">
            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">Preferences</span>

            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-zinc-950 rounded-xl">
              <button
                type="button"
                onClick={() => onToggleTheme('light')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                  theme === 'light'
                    ? 'bg-white text-teal-800 shadow-xs ring-1 ring-slate-200 dark:bg-zinc-800 dark:text-teal-200'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleTheme('dark')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                  theme === 'dark'
                    ? 'bg-slate-900 text-white shadow-xs ring-1 ring-slate-700 dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
            </div>

            <button
              onClick={onToggleSound}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                {soundEnabled ? (
                  <Bell className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                ) : (
                  <BellOff className="w-4 h-4 text-slate-400" />
                )}
                <div>
                  <div className="text-xs font-semibold">Dose reminder sound</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400">Chime when a dose is due</div>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  soundEnabled
                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                    : 'bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {soundEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Install MedSafe</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400">Add to your home screen</div>
                </div>
              </div>
              <PWAInstallButton />
            </div>
          </div>

          {/* App lock */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-100">
                <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>PIN app lock</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  appLockEnabled
                    ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300'
                    : 'bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {appLockEnabled ? 'ON' : 'OFF'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
              {appLockEnabled
                ? 'MedSafe asks for your PIN when it opens, and after a minute in the background.'
                : 'Require a 4-digit PIN whenever MedSafe is opened on this device.'}
            </p>

            {appLockEnabled ? (
              <div className="flex gap-2">
                <button
                  onClick={onLockNow}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition active:scale-[0.99]"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock now</span>
                </button>
                <button
                  onClick={onSetupAppLock}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold transition"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Change PIN</span>
                </button>
                <button
                  onClick={onRemoveAppLock}
                  className="py-2 px-3 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold transition"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                onClick={onSetupAppLock}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition active:scale-[0.99]"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Protect this app with a PIN</span>
              </button>
            )}
          </div>

          {/* Danger zone */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-rose-200/70 dark:border-rose-900/50 space-y-2">
            <button
              onClick={onEraseAllData}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-900/40 transition text-left"
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <div>
                  <div className="text-xs font-semibold text-rose-700 dark:text-rose-300">Erase all data</div>
                  <div className="text-[11px] text-rose-600/70 dark:text-rose-400/70">
                    Remove every profile from this device
                  </div>
                </div>
              </div>
            </button>
          </div>

          <p className="text-[10px] text-slate-400 dark:text-zinc-500 leading-relaxed text-center pb-2">
            MedSafe stores all data locally on this device. Nothing is uploaded to a server.
          </p>
        </div>
      </div>
    </div>
  );
};
