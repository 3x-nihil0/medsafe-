import React, { useState, useMemo } from 'react';
import {
  Bell,
  ShieldAlert,
  AlertTriangle,
  RotateCw,
  Clock,
  Filter,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { AlertLog, Patient, AlertType } from '../types';

interface PatientAlertHistoryViewProps {
  patient: Patient;
  alertLogs: AlertLog[];
}

export const PatientAlertHistoryView: React.FC<PatientAlertHistoryViewProps> = ({
  patient,
  alertLogs
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const patientAlerts = useMemo(() => {
    return alertLogs
      .filter(a => a.patientID === patient.patientID)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [alertLogs, patient.patientID]);

  const filteredAlerts = useMemo(() => {
    return patientAlerts.filter(a => {
      if (filterType !== 'ALL' && a.alertType !== filterType) return false;
      return true;
    });
  }, [patientAlerts, filterType]);

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
    <div className="space-y-3 text-slate-900 dark:text-zinc-100">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 rounded-md p-4 border border-slate-200 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            Safety &amp; Notification History
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Audit log of reminders, refill notices, and clinical alerts for {patient.fullName}
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1 flex-wrap">
          {['ALL', 'Reminder', 'Refill', 'Allergy', 'Interaction'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                filterType === t
                  ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-2xs'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200/60 dark:border-zinc-700/40'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts list */}
      <div className="space-y-2">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-md p-6 border border-slate-200 dark:border-zinc-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">No alert logs found</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              There are no matching notifications recorded for this filter category.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const isSevere = alert.severity === 'severe';
            const isModerate = alert.severity === 'moderate';

            return (
              <div
                key={alert.alertID}
                className={`bg-white dark:bg-zinc-900 rounded-md p-3.5 border transition shadow-2xs ${
                  isSevere
                    ? 'border-rose-300 dark:border-rose-900/60'
                    : isModerate
                    ? 'border-amber-300 dark:border-amber-900/60'
                    : 'border-slate-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 p-1 rounded bg-slate-100 dark:bg-zinc-800 shrink-0">
                      {getAlertIcon(alert.alertType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                          {alert.alertType} Alert
                        </span>
                        <span
                          className={`text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded border ${
                            isSevere
                              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
                              : isModerate
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60'
                              : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1 leading-relaxed">
                        {alert.message}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono shrink-0">
                    {alert.timestamp.split('T')[1]?.slice(0, 5) || alert.timestamp.split(' ')[1]?.slice(0, 5) || alert.timestamp}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
