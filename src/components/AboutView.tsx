import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Download,
  Sparkles,
  AlertTriangle,
  Cpu,
  Layers,
  Database,
  Bell,
  BookOpen,
  FileText,
  GraduationCap,
  CheckCircle2
} from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission
} from '../lib/notificationService';

interface AboutViewProps {
  onOpenBackup: () => void;
  onLoadSampleData: () => void;
  onOpenSummary: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onOpenBackup, onLoadSampleData, onOpenSummary }) => {
  const [permission, setPermission] = useState<string>('default');

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  return (
    <div className="space-y-4 pb-8 text-slate-900 dark:text-zinc-100">
      {/* Identity */}
      <div className="bg-slate-900 dark:bg-zinc-900 text-white rounded-md p-4 shadow-2xs border border-slate-800 dark:border-zinc-800 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold">MedSafe</h1>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Offline medication safety companion</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          MedSafe screens every medication you add against your documented allergies, your current prescriptions and your
          health conditions - then reminds you when doses are due and when supplies are running low.
        </p>

        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {['Works offline', 'No account required', 'Data stays on device', 'WHO ATC based rule base'].map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-zinc-900 rounded-md p-4 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-semibold text-xs pb-2 border-b border-slate-100 dark:border-zinc-800">
          <Bell className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
          <span>Dose notifications</span>
        </div>

        {permission === 'granted' ? (
          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Notifications are enabled - MedSafe will chime and alert you while it is open.</span>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
              Allow notifications so MedSafe can alert you when a scheduled dose becomes due. On iPhone, also tap
              <span className="font-semibold"> Share → Add to Home Screen</span> so alerts work when the app is closed.
            </p>
            <button
              onClick={handleEnableNotifications}
              disabled={!isNotificationSupported() || permission === 'denied'}
              className="px-3 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition disabled:opacity-50"
            >
              {permission === 'denied' ? 'Notifications blocked by the browser' : 'Enable notifications'}
            </button>
          </div>
        )}

        <p className="text-[10px] text-slate-400 dark:text-zinc-500 leading-relaxed">
          Doses are evaluated whenever MedSafe is open or brought to the foreground. Do not rely on it as your only
          reminder for time-critical medication.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-white dark:bg-zinc-900 rounded-md p-4 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-semibold text-xs pb-2 border-b border-slate-100 dark:border-zinc-800">
          <Cpu className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
          <span>What MedSafe checks</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/40 rounded border border-slate-200 dark:border-zinc-800 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-900 dark:text-zinc-200">Drug safety screening</span>
              <span className="text-[10px] font-mono text-slate-700 dark:text-zinc-300 bg-slate-200 dark:bg-zinc-700 px-1.5 py-0.2 rounded">
                Fail-safe
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
              Flags drug-drug interactions, allergies and cross-reactivity, duplicate therapy and condition-based
              contraindications. Unknown drugs are never assumed safe - they return “unverified, pharmacist review
              required”.
            </p>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/40 rounded border border-slate-200 dark:border-zinc-800 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-900 dark:text-zinc-200">Refill forecasting</span>
              <span className="text-[10px] font-mono text-slate-700 dark:text-zinc-300 bg-slate-200 dark:bg-zinc-700 px-1.5 py-0.2 rounded">
                Predictive
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
              Calculates how many days of supply remain from your dose frequency and warns you before you run out.
            </p>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-zinc-800/40 rounded border border-slate-200 dark:border-zinc-800 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-900 dark:text-zinc-200">Daily dosing schedule</span>
              <span className="text-[10px] font-mono text-slate-700 dark:text-zinc-300 bg-slate-200 dark:bg-zinc-700 px-1.5 py-0.2 rounded">
                Recurring
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
              Every dose slot re-arms each day. One tap records a dose and decrements your pill count automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Data */}
      <div className="bg-white dark:bg-zinc-900 rounded-md p-4 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-semibold text-xs pb-2 border-b border-slate-100 dark:border-zinc-800">
          <Database className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
          <span>Your data</span>
        </div>

        <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
          Everything is stored in this browser on this device only. Back up regularly if you do not want to lose it -
          clearing browser data or uninstalling the app deletes it.
        </p>

        <button
          onClick={onOpenBackup}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/80 text-slate-700 dark:text-zinc-300 text-xs font-medium transition"
        >
          <Download className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
          <span>Back up / restore (JSON file)</span>
        </button>

        <button
          onClick={onOpenSummary}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded border border-teal-300 dark:border-teal-900/60 bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-950/50 text-teal-800 dark:text-teal-300 text-xs font-semibold transition"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Print / share medication list (for your doctor)</span>
        </button>

        <button
          onClick={onLoadSampleData}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/80 text-slate-700 dark:text-zinc-300 text-xs font-medium transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
          <span>Load example profiles (replaces current data)</span>
        </button>
      </div>

      {/* Safety advisory */}
      <div className="bg-white dark:bg-zinc-900 rounded-md p-4 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-semibold text-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Medical advisory</span>
        </div>

        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
          MedSafe is a decision-support aid, not a doctor. It does not diagnose or prescribe, and its alerts do not
          replace professional medical advice.
        </p>

        <div className="p-2.5 rounded bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200">
          <p className="text-[11px] leading-normal">
            If you feel unwell, develop allergic symptoms such as swelling or difficulty breathing, or have any serious
            reaction after taking a medication, seek emergency medical care immediately.
          </p>
        </div>
      </div>

      {/* Credits */}
      <div className="bg-white dark:bg-zinc-900 rounded-md p-4 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-semibold text-xs pb-2 border-b border-slate-100 dark:border-zinc-800">
          <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
          <span>About &amp; credits</span>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-semibold flex items-center justify-center text-xs shrink-0 border border-slate-200 dark:border-zinc-700">
            GE
          </div>
          <div className="space-y-0.5 min-w-0">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-tight">Glory Ephraim</h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400">
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              <span>Miva Open University, Abuja, Nigeria</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400">
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Faculty of Computing &amp; Informatics</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
          Rule base compiled from WHO ATC classification, British National Formulary guidance and FDA drug safety
          communications. All processing happens on your device.
        </p>
      </div>
    </div>
  );
};
