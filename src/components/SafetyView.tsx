import React, { useState } from 'react';
import { ShieldAlert, Bell, BookOpen, Users } from 'lucide-react';
import { Patient, Allergy, AlertLog, DrugRegistryItem } from '../types';
import { PatientAllergiesView } from './PatientAllergiesView';
import { PatientAlertHistoryView } from './PatientAlertHistoryView';
import { DrugRegistryView } from './DrugRegistryView';

interface SafetyViewProps {
  patient: Patient;
  allergies: Allergy[];
  alertLogs: AlertLog[];
  drugRegistry: DrugRegistryItem[];
  onAddAllergy: (newAllergy: Omit<Allergy, 'allergyID'>) => void;
  onRemoveAllergy: (allergyID: number) => void;
  /** Care-team tab content (doctor directory, chat, notes) - rendered lazily by the parent. */
  careTeam?: React.ReactNode;
}

export const SafetyView: React.FC<SafetyViewProps> = ({
  patient,
  allergies,
  alertLogs,
  drugRegistry,
  onAddAllergy,
  onRemoveAllergy,
  careTeam
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'allergies' | 'history' | 'drugs' | 'care'>('allergies');

  const patientAllergyCount = allergies.filter(a => a.patientID === patient.patientID).length;
  const patientAlertCount = alertLogs.filter(a => a.patientID === patient.patientID && !a.read).length;

  return (
    <div className="space-y-4 text-slate-900 dark:text-zinc-100">
      {/* Segmented Control */}
      <div className="bg-slate-200/80 dark:bg-zinc-800 p-0.5 rounded-md flex items-center gap-1 transition-colors border border-slate-200 dark:border-zinc-700/60">
        <button
          onClick={() => setActiveSubTab('allergies')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-semibold transition ${
            activeSubTab === 'allergies'
              ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs border border-slate-200/60 dark:border-zinc-700/50'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          <span>Allergies</span>
          {patientAllergyCount > 0 && (
            <span className="text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold px-1.5 py-0.2 rounded">
              {patientAllergyCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded text-xs font-semibold transition ${
            activeSubTab === 'history'
              ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs border border-slate-200/60 dark:border-zinc-700/50'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-400" />
          <span>Alerts Log</span>
          {patientAlertCount > 0 && (
            <span className="text-[10px] bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold px-1.5 py-0.2 rounded">
              {patientAlertCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('drugs')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-semibold transition ${
            activeSubTab === 'drugs'
              ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs border border-slate-200/60 dark:border-zinc-700/50'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Drug guide</span>
        </button>

        <button
          onClick={() => setActiveSubTab('care')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-semibold transition ${
            activeSubTab === 'care'
              ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs border border-slate-200/60 dark:border-zinc-700/50'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Care</span>
        </button>
      </div>

      {/* Subtab content */}
      {activeSubTab === 'allergies' ? (
        <PatientAllergiesView
          patient={patient}
          allergies={allergies}
          onAddAllergy={onAddAllergy}
          onRemoveAllergy={onRemoveAllergy}
        />
      ) : activeSubTab === 'history' ? (
        <PatientAlertHistoryView
          patient={patient}
          alertLogs={alertLogs}
        />
      ) : activeSubTab === 'care' ? (
        careTeam
      ) : (
        <DrugRegistryView drugRegistry={drugRegistry} />
      )}
    </div>
  );
};
