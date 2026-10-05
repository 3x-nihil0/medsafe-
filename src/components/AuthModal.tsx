import React, { useState } from 'react';
import { X, ShieldCheck, UserPlus, Users, ChevronRight, Sparkles, Pill } from 'lucide-react';
import { Patient } from '../types';
import { sanitizeInput, toLocalDateStr } from '../services/ruleEngine';
import type { NewProfileInput } from '../App';

interface AuthModalProps {
  isOpen: boolean;
  /** False on first run - the app cannot be used until a profile exists. */
  canClose: boolean;
  onClose: () => void;
  patients: Patient[];
  activePatientID: number;
  onSelectProfile: (patientID: number) => void;
  onCreateProfile: (data: NewProfileInput) => void;
  onLoadSampleData: () => void;
}

const CONDITION_OPTIONS = [
  { label: 'Hypertension', value: 'Hypertension' },
  { label: 'Diabetes', value: 'Diabetes' },
  { label: 'Asthma', value: 'Asthma' },
  { label: 'HIV', value: 'HIV' },
  { label: 'High cholesterol', value: 'High cholesterol' },
  { label: 'Kidney disease', value: 'Kidney disease' },
  { label: 'General wellness', value: 'General Wellness' }
];

const ALLERGY_OPTIONS = [
  'none',
  'Penicillins',
  'Sulfonamides (Sulfa drugs)',
  'Aspirin / NSAIDs',
  'Latex',
  'Iodine contrast',
  'Codeine / Opioids'
];

const AVATAR_COLORS = ['bg-teal-600', 'bg-blue-600', 'bg-violet-600', 'bg-rose-600', 'bg-amber-600', 'bg-emerald-600'];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  canClose,
  onClose,
  patients,
  activePatientID,
  onSelectProfile,
  onCreateProfile,
  onLoadSampleData
}) => {
  const [mode, setMode] = useState<'profiles' | 'create'>(patients.length === 0 ? 'create' : 'profiles');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [gender, setGender] = useState<Patient['gender']>('Prefer not to say');
  const [bloodGroup, setBloodGroup] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergy, setAllergy] = useState('none');
  const [customAllergy, setCustomAllergy] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCondition = (value: string) => {
    setConditions(prev => (prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]));
  };

  const submitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nameCheck = sanitizeInput(fullName);
    if (!nameCheck.isValid || !nameCheck.sanitized) {
      setError('Please enter a valid full name.');
      return;
    }
    if (!dateOfBirth) {
      setError('Please enter a date of birth (used for age-aware safety checks).');
      return;
    }

    const allergyValue =
      allergy === 'custom' ? customAllergy.trim() : allergy === 'none' ? undefined : allergy;

    if (allergy === 'custom' && !allergyValue) {
      setError('Please specify the allergen, or choose "No known allergies".');
      return;
    }

    const contact = sanitizeInput(contactNumber);
    const data: NewProfileInput = {
      fullName: nameCheck.sanitized,
      dateOfBirth,
      contactNumber: contact.isValid ? contact.sanitized : '',
      gender,
      bloodGroup,
      conditionTags: conditions.length > 0 ? conditions : ['General Wellness'],
      initialAllergyGroup: allergyValue,
      avatarColor: AVATAR_COLORS[patients.length % AVATAR_COLORS.length]
    };

    onCreateProfile(data);

    // Reset for a possible next profile
    setFullName('');
    setDateOfBirth('');
    setContactNumber('');
    setConditions([]);
    setAllergy('none');
    setCustomAllergy('');
    setMode('profiles');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/70 dark:bg-black/80 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        className="bg-white dark:bg-zinc-900 w-full sm:max-w-md sm:rounded-xl rounded-t-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden text-slate-900 dark:text-zinc-100 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-zinc-800 bg-gradient-to-b from-teal-50/70 to-white dark:from-teal-950/30 dark:to-zinc-900 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 id="profile-modal-title" className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                {patients.length === 0 ? 'Set up MedSafe' : mode === 'create' ? 'Add a profile' : 'Choose a profile'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug mt-0.5">
                {patients.length === 0
                  ? 'MedSafe screens every medication against allergies, interactions and your health conditions.'
                  : 'Profiles keep each person’s medications, allergies and history separate.'}
              </p>
            </div>
          </div>
          {canClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* ---------------- profile picker ---------------- */}
          {mode === 'profiles' && (
            <div className="p-4 space-y-3">
              {patients.length === 0 ? (
                <div className="text-center py-6 space-y-3">
                  <Pill className="w-7 h-7 text-slate-300 dark:text-zinc-600 mx-auto" />
                  <p className="text-xs text-slate-500 dark:text-zinc-400">No profiles on this device yet.</p>
                </div>
              ) : (
                patients.map(p => {
                  const initials = p.fullName
                    .split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();
                  const isActive = p.patientID === activePatientID;
                  return (
                    <button
                      key={p.patientID}
                      onClick={() => onSelectProfile(p.patientID)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition active:scale-[0.99] ${
                        isActive
                          ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/30 dark:border-teal-700'
                          : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${
                          p.avatarColor || 'bg-teal-600'
                        }`}
                      >
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt={p.fullName} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          initials
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold truncate">{p.fullName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                          {p.conditionTags?.join(' • ') || 'General wellness'}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  );
                })
              )}

              <button
                onClick={() => setMode('create')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60 text-xs font-semibold transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>New profile</span>
              </button>

              {patients.length === 0 && (
                <button
                  onClick={onLoadSampleData}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[11px] text-slate-500 dark:text-zinc-400 hover:text-teal-700 dark:hover:text-teal-300 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explore with example profiles instead</span>
                </button>
              )}
            </div>
          )}

          {/* ---------------- create profile ---------------- */}
          {mode === 'create' && (
            <form onSubmit={submitProfile} className="p-4 space-y-3 text-xs">
              {error && (
                <div role="alert" className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-[11px]">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="profile-name" className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Full name *
                </label>
                <input
                  id="profile-name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Amina Bello"
                  required
                  autoComplete="name"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="profile-dob" className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Date of birth *
                  </label>
                  <input
                    id="profile-dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={e => setDateOfBirth(e.target.value)}
                    required
                    max={toLocalDateStr()}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="profile-gender" className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Sex
                  </label>
                  <select
                    id="profile-gender"
                    value={gender || ''}
                    onChange={e => setGender(e.target.value as Patient['gender'])}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="profile-blood" className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Blood group
                  </label>
                  <select
                    id="profile-blood"
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="">Not known</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="profile-contact" className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Phone (optional)
                  </label>
                  <input
                    id="profile-contact"
                    type="tel"
                    value={contactNumber}
                    onChange={e => setContactNumber(e.target.value)}
                    placeholder="+234 …"
                    autoComplete="tel"
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <span className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Health conditions (used for contraindication checks)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CONDITION_OPTIONS.map(c => {
                    const selected = conditions.includes(c.value);
                    return (
                      <button
                        type="button"
                        key={c.value}
                        onClick={() => toggleCondition(c.value)}
                        aria-pressed={selected}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition ${
                          selected
                            ? 'bg-teal-600 border-teal-600 text-white'
                            : 'bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="profile-allergy" className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Drug allergies
                </label>
                <select
                  id="profile-allergy"
                  value={allergy}
                  onChange={e => setAllergy(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {ALLERGY_OPTIONS.map(a => (
                    <option key={a} value={a}>
                      {a === 'none' ? 'No known allergies' : a}
                    </option>
                  ))}
                  <option value="custom">Other (specify)…</option>
                </select>
              </div>

              {allergy === 'custom' && (
                <div>
                  <label htmlFor="profile-custom-allergy" className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Allergen
                  </label>
                  <input
                    id="profile-custom-allergy"
                    value={customAllergy}
                    onChange={e => setCustomAllergy(e.target.value)}
                    placeholder="e.g. Erythromycin, Codeine…"
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                {patients.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setMode('profiles')}
                    className="px-3 py-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition shadow-xs active:scale-[0.99]"
                >
                  <Users className="w-4 h-4" />
                  <span>{patients.length === 0 ? 'Create profile & start' : 'Create profile'}</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400 dark:text-zinc-500 leading-relaxed pt-1">
                Everything you enter stays on this device. MedSafe does not upload your health data anywhere.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
