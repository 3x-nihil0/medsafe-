import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Pill,
  Calendar,
  Check,
  Plus
} from 'lucide-react';
import { Reminder, Medication, Patient } from '../types';

interface TodayScheduleViewProps {
  patient: Patient;
  reminders: Reminder[];
  medications: Medication[];
  onAcknowledgeReminder: (reminderID: number) => void;
  onOpenNewPrescription: () => void;
  simulatedTime: Date;
}

export const TodayScheduleView: React.FC<TodayScheduleViewProps> = ({
  patient,
  reminders,
  medications,
  onAcknowledgeReminder,
  onOpenNewPrescription,
  simulatedTime
}) => {
  const patientReminders = reminders.filter(r => r.patientID === patient.patientID);
  const acknowledgedCount = patientReminders.filter(r => r.status === 'Acknowledged').length;
  const totalCount = patientReminders.length;
  const completionPercentage = totalCount > 0 ? Math.round((acknowledgedCount / totalCount) * 100) : 0;

  const upcomingReminders = patientReminders.filter(r => r.status !== 'Acknowledged');
  const nextPending = upcomingReminders[0];

  const currentTimeString = simulatedTime.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const currentDateString = simulatedTime.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Sort reminders chronologically by scheduled time
  const sortedReminders = [...patientReminders].sort((a, b) =>
    a.scheduledTime.localeCompare(b.scheduledTime)
  );

  return (
    <div className="space-y-4 text-slate-900 dark:text-zinc-100">
      {/* Page Title & Schedule Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
            Medication Schedule
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Prescribed regimen for {patient.fullName} • {currentDateString} ({currentTimeString})
          </p>
        </div>

        <button
          onClick={onOpenNewPrescription}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-medium transition shadow-none focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <Plus className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
          <span>Add Medication</span>
        </button>
      </div>

      {/* Adherence Summary Bar */}
      <section
        id="today-adherence-summary"
        aria-label="Daily Adherence Summary"
        className="bg-white dark:bg-zinc-800/60 rounded-md p-3.5 border border-slate-200 dark:border-zinc-800 text-xs space-y-2.5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-slate-700 dark:text-zinc-300">
          <div className="font-medium">
            Daily Adherence: <span className="font-semibold text-slate-900 dark:text-zinc-100">{acknowledgedCount} of {totalCount} doses administered</span>
            {totalCount > 0 && <span className="text-slate-500 dark:text-zinc-400"> ({completionPercentage}%)</span>}
          </div>

          <div className="text-slate-500 dark:text-zinc-400">
            {nextPending ? (
              <span>Next dose scheduled: <strong className="text-slate-700 dark:text-zinc-200 font-medium">{nextPending.scheduledTime} ({nextPending.drugName})</strong></span>
            ) : totalCount > 0 ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">All scheduled doses completed for today</span>
            ) : (
              <span>No medications scheduled</span>
            )}
          </div>
        </div>

        {/* Minimal Linear Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-700 rounded-sm overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              completionPercentage === 100
                ? 'bg-emerald-600 dark:bg-emerald-500'
                : 'bg-blue-700 dark:bg-blue-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </section>

      {/* Structured Regimen Dose List */}
      <section aria-label="Scheduled Doses" className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300 px-1 pt-1">
          <span>Scheduled Doses ({patientReminders.length})</span>
          <span className="text-slate-400 dark:text-zinc-500 font-normal">Organized chronologically</span>
        </div>

        {patientReminders.length === 0 ? (
          <div className="bg-white dark:bg-zinc-800/50 rounded-md p-8 border border-slate-200 dark:border-zinc-800 text-center space-y-2">
            <Pill className="w-6 h-6 text-slate-400 dark:text-zinc-500 mx-auto" />
            <h2 className="text-sm font-medium text-slate-800 dark:text-zinc-200">
              No medications scheduled for today
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
              Prescribed medications will display their administration times, dosages, and adherence status here.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenNewPrescription}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-xs font-medium transition"
              >
                Add Prescription
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedReminders.map(reminder => {
              const med = medications.find(m => m.medicationID === reminder.medicationID);
              const isAcknowledged = reminder.status === 'Acknowledged';
              const isDue = reminder.status === 'Sent';

              return (
                <div
                  key={reminder.reminderID}
                  id={`dose-card-${reminder.reminderID}`}
                  className={`p-3.5 rounded-md border transition-colors ${
                    isAcknowledged
                      ? 'bg-slate-50/70 dark:bg-zinc-800/30 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                      : isDue
                      ? 'bg-white dark:bg-zinc-800 border-blue-400 dark:border-blue-600 shadow-none'
                      : 'bg-white dark:bg-zinc-800/70 border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Time & Medication Details (Primary visual priority) */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Scheduled Time Column */}
                      <div className="min-w-[70px] shrink-0 pt-0.5">
                        <div className="font-mono text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                          <span>{reminder.scheduledTime}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          {isAcknowledged ? 'Administered' : isDue ? 'Due now' : 'Scheduled'}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="hidden sm:block w-px self-stretch bg-slate-200 dark:bg-zinc-700" />

                      {/* Medication Info Column */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                            {reminder.drugName}
                          </h3>
                          <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                            {reminder.dosage}
                          </span>
                          {med?.conditionCategory && (
                            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                              ({med.conditionCategory})
                            </span>
                          )}
                        </div>

                        {med?.instructions && (
                          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                            {med.instructions}
                          </p>
                        )}

                        {med && (
                          <div className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1 flex items-center gap-2">
                            <span>Supply remaining: <strong className="font-mono text-slate-700 dark:text-zinc-300">{med.quantityRemaining}</strong> units</span>
                            {med.quantityRemaining <= (med.dosesPerDay || 1) * 7 && (
                              <span className="text-amber-700 dark:text-amber-400 font-medium">
                                • Refill needed
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action / Status Column */}
                    <div className="shrink-0 flex items-center justify-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-zinc-800">
                      {isAcknowledged ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-medium">
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Taken</span>
                        </div>
                      ) : (
                        <button
                          id={`acknowledge-dose-${reminder.reminderID}`}
                          onClick={() => onAcknowledgeReminder(reminder.reminderID)}
                          className="w-full sm:w-auto px-3.5 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-medium text-xs transition focus:outline-none focus:ring-2 focus:ring-blue-600 flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Record Dose Taken</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

