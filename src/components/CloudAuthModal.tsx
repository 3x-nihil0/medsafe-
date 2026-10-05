import React, { useRef, useState } from 'react';
import { X, Stethoscope, User, Mail, KeyRound, BadgeCheck, ShieldCheck } from 'lucide-react';
import type { CloudRole } from '../types';
import { isCloudEnabled, signInWithEmail, signUpWithEmail, friendlyError } from '../lib/cloud';

interface CloudAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: CloudRole;
  /** Called with the Supabase user id once sign-in/registration succeeds. */
  onSignedIn: (userId: string) => void;
}

const SPECIALTIES = [
  'General Practice',
  'Cardiology',
  'Endocrinology',
  'Pulmonology',
  'Nephrology',
  'Infectious Disease',
  'Pharmacy',
  'Other'
];

export const CloudAuthModal: React.FC<CloudAuthModalProps> = ({ isOpen, onClose, initialRole, onSignedIn }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<CloudRole>(initialRole || 'patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState(SPECIALTIES[0]);
  const [licenseNo, setLicenseNo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Hard guard: busy state updates asynchronously, so a rapid double tap
  // could otherwise fire two sign-ups (the second one failing on duplicate).
  const submittingRef = useRef(false);

  if (!isOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setError(null);

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    if (mode === 'signup' && fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    setBusy(true);
    submittingRef.current = true;
    try {
      if (mode === 'signin') {
        const uid = await signInWithEmail(email.trim(), password);
        onSignedIn(uid);
      } else {
        const uid = await signUpWithEmail(email.trim(), password, {
          role,
          fullName: fullName.trim(),
          specialty: role === 'doctor' ? specialty : undefined,
          licenseNo: role === 'doctor' ? licenseNo.trim() || undefined : undefined
        });
        onSignedIn(uid);
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/70 dark:bg-black/80 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cloud-auth-title"
        className="bg-white dark:bg-zinc-900 w-full sm:max-w-md sm:rounded-xl rounded-t-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden text-slate-900 dark:text-zinc-100 max-h-[92vh] flex flex-col"
      >
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-zinc-800 bg-gradient-to-b from-teal-50/70 to-white dark:from-teal-950/30 dark:to-zinc-900 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 id="cloud-auth-title" className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                {mode === 'signin' ? 'Sign in to care team' : 'Create your account'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug mt-0.5">
                Connect with your doctor - messaging, notes and your shared medication list.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!isCloudEnabled() ? (
            <div className="text-xs space-y-3 leading-relaxed text-slate-600 dark:text-zinc-400">
              <p className="font-semibold text-slate-800 dark:text-zinc-200">Cloud features are switched off.</p>
              <p>
                Accounts and messaging need a free Supabase project. The person deploying the app adds two keys to a
                <span className="font-mono"> .env </span> file:
              </p>
              <pre className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded p-2.5 text-[10px] overflow-x-auto">
{`VITE_SUPABASE_URL=…
VITE_SUPABASE_ANON_KEY=…`}
              </pre>
              <p>Then run <span className="font-mono">supabase/schema.sql</span> once in the Supabase SQL editor. Full steps are in the README.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3 text-xs">
              {error && (
                <div role="alert" className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-[11px] leading-snug">
                  {error}
                </div>
              )}

              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-zinc-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setRole('patient')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition ${
                      role === 'patient' ? 'bg-white dark:bg-zinc-900 shadow-xs text-teal-700 dark:text-teal-300' : 'text-slate-500 dark:text-zinc-400'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>I'm a patient</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('doctor')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition ${
                      role === 'doctor' ? 'bg-white dark:bg-zinc-900 shadow-xs text-teal-700 dark:text-teal-300' : 'text-slate-500 dark:text-zinc-400'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>I'm a doctor</span>
                  </button>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label htmlFor="cloud-name" className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Full name *
                  </label>
                  <input
                    id="cloud-name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder={role === 'doctor' ? 'e.g. Dr. Chika Okafor' : 'e.g. Amina Bello'}
                    required
                    autoComplete="name"
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              )}

              {mode === 'signup' && role === 'doctor' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="cloud-specialty" className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Specialty *
                    </label>
                    <select
                      id="cloud-specialty"
                      value={specialty}
                      onChange={e => setSpecialty(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    >
                      {SPECIALTIES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="cloud-license" className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Licence no. (optional)
                    </label>
                    <input
                      id="cloud-license"
                      value={licenseNo}
                      onChange={e => setLicenseNo(e.target.value)}
                      placeholder="e.g. MDCN/12345"
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="cloud-email" className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="cloud-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cloud-password" className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="cloud-password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition shadow-xs active:scale-[0.99] disabled:opacity-60"
              >
                {busy ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : mode === 'signin' ? (
                  <BadgeCheck className="w-4 h-4" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>{mode === 'signin' ? 'Sign in' : role === 'doctor' ? 'Register as doctor' : 'Create patient account'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError(null);
                }}
                className="w-full py-2 text-[11px] text-slate-500 dark:text-zinc-400 hover:text-teal-700 dark:hover:text-teal-300 transition"
              >
                {mode === 'signin' ? 'New here? Create an account (patient or doctor)' : 'Already registered? Sign in'}
              </button>

              <p className="text-[10px] text-slate-400 dark:text-zinc-500 leading-relaxed pt-1">
                Your medication data stays on this device. Only the medication list you choose to share - plus messages
                and notes - are stored in your encrypted care-team account.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
