import React, { useEffect, useRef, useState } from 'react';
import { X, Stethoscope, User, Mail, KeyRound, BadgeCheck, ShieldCheck } from 'lucide-react';
import type { CloudRole } from '../types';
import {
  isCloudEnabled,
  signInWithEmail,
  signUpWithEmail,
  requestPasswordReset,
  resendConfirmation,
  updatePassword,
  currentSession,
  friendlyError
} from '../lib/cloud';

type AuthMode = 'signin' | 'signup' | 'reset' | 'setnew';

interface CloudAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: CloudRole;
  /** Which screen to show first ('setnew' = arrived via a recovery link). */
  initialMode?: AuthMode;
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

export const CloudAuthModal: React.FC<CloudAuthModalProps> = ({
  isOpen,
  onClose,
  initialRole,
  initialMode = 'signin',
  onSignedIn
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [role, setRole] = useState<CloudRole>(initialRole || 'patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState(SPECIALTIES[0]);
  const [licenseNo, setLicenseNo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Hard guard: busy state updates asynchronously, so a rapid double tap
  // could otherwise fire two sign-ups (the second one failing on duplicate).
  const submittingRef = useRef(false);

  // Re-sync with the outside world (e.g. a password-recovery link reopened
  // the sheet in 'setnew') every time the sheet is shown.
  useEffect(() => {
    if (!isOpen) return;
    setMode(initialMode);
    setError(null);
    setNotice(null);
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const go = async (work: () => Promise<void>) => {
    if (submittingRef.current) return;
    setError(null);
    setNotice(null);
    setBusy(true);
    submittingRef.current = true;
    try {
      await work();
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
      submittingRef.current = false;
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'reset') {
      if (!email.trim()) {
        setError('Email is required.');
        return;
      }
      await go(async () => {
        await requestPasswordReset(email.trim());
        setNotice(
          'If that address has an account, a reset link is on its way. Open it on this device to choose a new password (check your spam folder).'
        );
        setMode('signin');
      });
      return;
    }

    if (mode === 'setnew') {
      if (!password) {
        setError('Choose a new password (at least 6 characters).');
        return;
      }
      await go(async () => {
        await updatePassword(password);
        setPassword('');
        const session = await currentSession();
        if (session?.user) onSignedIn(session.user.id);
        else onClose();
      });
      return;
    }

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    if (mode === 'signup' && fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }

    await go(async () => {
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
    });
  };

  const resend = async () => {
    if (!email.trim()) {
      setError('Enter your email above first, then tap resend.');
      return;
    }
    await go(async () => {
      await resendConfirmation(email.trim());
      setNotice('Confirmation email re-sent - check your inbox (and spam folder), then sign in.');
    });
  };

  const titles: Record<AuthMode, string> = {
    signin: 'Sign in to care team',
    signup: 'Create your account',
    reset: 'Reset your password',
    setnew: 'Choose a new password'
  };
  const subtitles: Record<AuthMode, string> = {
    signin: 'Connect with your doctor - messaging, notes and your shared medication list.',
    signup: 'A patient or doctor account - your local medication data stays on this device.',
    reset: 'We email you a single-use secure link, valid for a short time.',
    setnew: 'Pick a new password for your care-team account. Your local data is untouched.'
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
                {titles[mode]}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug mt-0.5">
                {subtitles[mode]}
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
              {notice && (
                <div role="status" className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-[11px] leading-snug">
                  {notice}
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

              {mode !== 'setnew' && (
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
              )}

              {mode !== 'reset' && (
              <div>
                <label htmlFor="cloud-password" className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  {mode === 'setnew' ? 'New password *' : 'Password *'}
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
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition shadow-xs active:scale-[0.99] disabled:opacity-60"
              >
                {busy ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : mode === 'reset' ? (
                  <Mail className="w-4 h-4" />
                ) : mode === 'signin' ? (
                  <BadgeCheck className="w-4 h-4" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>
                  {mode === 'signin'
                    ? 'Sign in'
                    : mode === 'reset'
                      ? 'Send reset link'
                      : mode === 'setnew'
                        ? 'Save new password'
                        : role === 'doctor'
                          ? 'Register as doctor'
                          : 'Create patient account'}
                </span>
              </button>

              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setNotice(null);
                  }}
                  className="w-full py-2 text-[11px] text-slate-500 dark:text-zinc-400 hover:text-teal-700 dark:hover:text-teal-300 transition"
                >
                  New here? Create an account (patient or doctor)
                </button>
              )}

              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('reset');
                    setError(null);
                    setNotice(null);
                  }}
                  className="w-full py-1 text-[11px] text-slate-500 dark:text-zinc-400 hover:text-teal-700 dark:hover:text-teal-300 transition"
                >
                  Forgot password?
                </button>
              )}

              {mode === 'signup' && (
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                      setNotice(null);
                    }}
                    className="w-full py-2 text-[11px] text-slate-500 dark:text-zinc-400 hover:text-teal-700 dark:hover:text-teal-300 transition"
                  >
                    Already registered? Sign in
                  </button>
                  <button
                    type="button"
                    onClick={resend}
                    disabled={busy}
                    className="w-full py-1.5 text-[11px] text-teal-700 dark:text-teal-300 hover:underline transition disabled:opacity-60"
                  >
                    Resend confirmation email
                  </button>
                </div>
              )}

              {mode === 'reset' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setNotice(null);
                  }}
                  className="w-full py-2 text-[11px] text-slate-500 dark:text-zinc-400 hover:text-teal-700 dark:hover:text-teal-300 transition"
                >
                  Back to sign in
                </button>
              )}

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
