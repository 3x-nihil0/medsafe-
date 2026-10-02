import React from 'react';
import {
  X,
  Bell,
  ShieldAlert,
  AlertTriangle,
  RotateCw,
  Clock,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { AlertLog, AlertType } from '../types';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alertLogs: AlertLog[];
  onClearAlert: (alertID: number) => void;
  onMarkAllAsRead: () => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  alertLogs,
  onClearAlert,
  onMarkAllAsRead
}) => {
  if (!isOpen) return null;

  const sortedAlerts = [...alertLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'Allergy':
        return <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'Interaction':
        return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'Refill':
        return <RotateCw className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      case 'Reminder':
        return <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500 dark:text-zinc-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="alerts-drawer-title"
        className="bg-white dark:bg-zinc-900 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-zinc-800 animate-in slide-in-from-right duration-200 text-slate-900 dark:text-zinc-100"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
            <h2 id="alerts-drawer-title" className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Notifications & Alerts</h2>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
              {alertLogs.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 font-medium"
            >
              Mark read
            </button>
            <button
              onClick={onClose}
              aria-label="Close alerts drawer"
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100 dark:divide-zinc-800">
          {sortedAlerts.length === 0 ? (
            <div className="py-16 text-center text-slate-400 dark:text-zinc-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-600" />
              <p className="text-xs">No active notifications</p>
            </div>
          ) : (
            sortedAlerts.map(alert => {
              const isSevere = alert.severity === 'severe';
              return (
                <div key={alert.alertID} className="pt-3 first:pt-0 flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      alert.severity === 'severe'
                        ? 'bg-rose-100 dark:bg-rose-950/60'
                        : alert.severity === 'moderate'
                        ? 'bg-amber-100 dark:bg-amber-950/60'
                        : 'bg-teal-50 dark:bg-teal-950/60'
                    }`}
                  >
                    {getAlertIcon(alert.alertType)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                        {alert.alertType} Alert
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                        {new Date(alert.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-normal">
                      {alert.message}
                    </p>

                    {alert.details && (
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono bg-slate-50 dark:bg-zinc-800 p-1.5 rounded">
                        {alert.details}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => onClearAlert(alert.alertID)}
                    className="text-slate-300 dark:text-zinc-600 hover:text-slate-500 dark:hover:text-zinc-400 p-1"
                    title="Dismiss alert"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-zinc-900/80 border-t border-slate-200 dark:border-zinc-800 text-center text-[10px] text-slate-400 dark:text-zinc-500">
          Automated dosing reminders, refill predictions, and safety conflict alerts.
        </div>
      </div>
    </div>
  );
};
