import React from 'react';
import { ShieldCheck, User, Stethoscope, ArrowRight } from 'lucide-react';

interface EntryChoiceViewProps {
  /** Called with the chosen role; 'doctor' routes into account creation. */
  onChoose: (role: 'patient' | 'doctor') => void;
}

/**
 * First-run screen shown before anything else: a brand-new user says whether
 * they are a patient (local profile setup) or a doctor (care-team account).
 * Without this a doctor had to walk through patient setup first.
 */
export const EntryChoiceView: React.FC<EntryChoiceViewProps> = ({ onChoose }) => {
  const option =
    'w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition active:scale-[0.99]';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-100 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5 text-center shadow-2xl">
        <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
          <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-500" />
          <span>MedSafe</span>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">How will you use MedSafe?</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
            Pick once to get started. Patients keep their own medication list; doctors review the lists their patients
            share with them.
          </p>
        </div>

        <div className="space-y-3 text-left">
          <button
            onClick={() => onChoose('patient')}
            className={`${option} border-teal-200 dark:border-teal-900/60 hover:bg-teal-50 dark:hover:bg-teal-950/30`}
          >
            <span className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-slate-900 dark:text-zinc-100">I'm a patient</span>
              <span className="block text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
                Track my medications and share my list with my doctor
              </span>
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 ml-auto shrink-0" />
          </button>

          <button
            onClick={() => onChoose('doctor')}
            className={`${option} border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800`}
          >
            <span className="w-10 h-10 rounded-full bg-slate-800 dark:bg-zinc-700 text-white flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-slate-900 dark:text-zinc-100">I'm a doctor</span>
              <span className="block text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
                Create a doctor account and review patients who request me
              </span>
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 ml-auto shrink-0" />
          </button>
        </div>

        <p className="text-[10px] text-slate-400 dark:text-zinc-500 leading-relaxed">
          Your medication data stays on this device. Only what you choose to share is sent to your care team.
        </p>
      </div>
    </div>
  );
};
