import React from 'react';
import { Bell, Moon, Sun, FileText } from 'lucide-react';
import { Patient, AppTheme } from '../types';

interface MobileHeaderProps {
  activePatient: Patient;
  now: Date;
  unreadAlertCount: number;
  onOpenAlerts: () => void;
  theme: AppTheme;
  onToggleTheme: (newTheme: AppTheme) => void;
  onOpenProfile: () => void;
  onOpenSummary: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  activePatient,
  now,
  unreadAlertCount,
  onOpenAlerts,
  theme,
  onToggleTheme,
  onOpenProfile,
  onOpenSummary
}) => {
  const formattedTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const initials = activePatient.fullName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800 px-3.5 py-2 transition-colors duration-200">
      <div className="flex items-center justify-between gap-2 min-w-0">
        {/* Left: profile avatar & identity — opens the profile drawer */}
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 hover:opacity-90 active:scale-98 transition text-left group min-w-0 flex-1"
          title="Open profile & settings"
        >
          <div
            className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0 ring-1 ring-slate-200 dark:ring-zinc-700 ${
              activePatient.avatarColor || 'bg-teal-700'
            }`}
          >
            {activePatient.photoUrl ? (
              <img src={activePatient.photoUrl} alt={activePatient.fullName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-slate-900 dark:text-zinc-100 text-xs truncate block">
              {activePatient.fullName}
            </span>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
              {activePatient.conditionTags?.[0] || 'Health profile'}
            </p>
          </div>
        </button>

        {/* Right: alerts, clock, theme */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onOpenSummary}
            className="p-1.5 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition active:scale-95"
            title="Print / share medication list"
            aria-label="Print or share medication list"
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAlerts}
            className="relative p-1.5 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition active:scale-95"
            title="Safety alerts"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-3.5 h-3.5 px-0.5 text-[9px] font-bold bg-rose-600 text-white rounded-full flex items-center justify-center">
                {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
              </span>
            )}
          </button>

          <span className="hidden sm:flex items-center px-1.5 font-mono text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            {formattedTime}
          </span>

          <button
            onClick={() => onToggleTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-1.5 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition active:scale-95"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
