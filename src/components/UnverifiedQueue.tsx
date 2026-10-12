import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, RefreshCw, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Medication, DrugRegistryItem, InteractionRule, Patient } from '../types';
import { getDrugClassName } from '../data/drugClasses';

/**
 * Unverified Medication Review Queue
 * Lists unregistered (Unverified) medications the user saved after confirming
 * a doctor's prescription, and offers three dispositions:
 *  - Confirm: record that the prescription was verified with the prescriber.
 *  - Replace: swap the entry for its verified registry equivalent (same dosage/schedule).
 *  - Remove: take it off the list entirely.
 */

interface UnverifiedQueueProps {
  patient: Patient;
  medications: Medication[];
  drugRegistry: DrugRegistryItem[];
  interactionRules: InteractionRule[];
  onConfirm: (medicationID: number) => void;
  onReplace: (medicationID: number, registryItem: DrugRegistryItem) => void;
  onRemove: (medicationID: number) => void;
}

const findRegistryMatch = (
  drugName: string,
  registry: DrugRegistryItem[]
): DrugRegistryItem | null => {
  const clean = drugName.trim().toLowerCase();
  for (const item of registry) {
    const gen = item.genericName.toLowerCase();
    if (clean === gen || clean.startsWith(gen + ' ') || clean.includes(gen.split('/')[0])) {
      return item;
    }
    for (const brand of item.brandNames) {
      const b = brand.toLowerCase();
      if (clean === b || clean.startsWith(b + ' ') || clean.includes(b)) return item;
    }
  }
  return null;
};

export const UnverifiedQueue: React.FC<UnverifiedQueueProps> = ({
  patient,
  medications,
  drugRegistry,
  onConfirm,
  onReplace,
  onRemove
}) => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const unverified = medications.filter(
    m => m.patientID === patient.patientID && (m.unverifiedConfirmed || !m.unverifiedConfirmed) && !findRegistryMatch(m.drugName, drugRegistry) && m.status === 'active'
  );

  if (unverified.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>Unverified medications ({unverified.length})</span>
        </div>
      </div>
      <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
        These entries are not in the verified drug registry. Confirm them once you've checked the prescription with your doctor, replace with the closest registered equivalent, or remove.
      </p>
      {unverified.map(med => {
        const isOpen = expanded[med.medicationID];
        return (
          <div key={med.medicationID} className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/60">
            <button
              onClick={() => setExpanded(p => ({ ...p, [med.medicationID]: !p[med.medicationID] }))}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">{med.drugName}</div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {med.dosage} • {getDrugClassName(med.drugClass)} {med.unverifiedConfirmed ? '• confirmed' : '• not yet verified'}
                </div>
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {isOpen && (
              <div className="mt-2 pt-2 border-t border-amber-100 dark:border-amber-900/40 space-y-2">
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Automated interaction and allergy checks are SKIPPED for this entry. Treatment decisions about it should follow the original prescription.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => onConfirm(med.medicationID)}
                    className="flex-1 min-w-[100px] flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold transition disabled:opacity-50"
                    disabled={med.unverifiedConfirmed}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirm prescription
                  </button>
                  <button
                    onClick={() => {
                      const match = findRegistryMatch(med.drugName, drugRegistry);
                      if (match) onReplace(med.medicationID, match);
                      else alert('No close registry equivalent found. Confirm or remove instead.');
                    }}
                    className="flex-1 min-w-[100px] flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-[11px] font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Replace
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Remove "${med.drugName}" from your medication list?`)) onRemove(med.medicationID);
                    }}
                    className="px-2 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-[11px] font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
