import React, { useState } from 'react';
import {
  Pill,
  Calendar,
  AlertTriangle,
  Plus,
  Trash2,
  Clock,
  Info,
  PackagePlus,
  Minus,
  ChevronDown,
  ChevronUp,
  Utensils,
  Activity,
  Sun,
  Moon,
  FlaskConical,
  ShieldCheck,
  Check,
  FileText
} from 'lucide-react';
import { Medication, Patient, DrugRegistryItem } from '../types';

interface MedicationCabinetViewProps {
  patient: Patient;
  medications: Medication[];
  drugRegistry?: DrugRegistryItem[];
  onTakeDose: (medicationID: number) => void;
  onRestockSupply: (medicationID: number, quantityToAdd: number) => void;
  onRemoveMedication: (medicationID: number) => void;
  onOpenNewMedication: () => void;
}

export const MedicationCabinetView: React.FC<MedicationCabinetViewProps> = ({
  patient,
  medications,
  drugRegistry = [],
  onTakeDose,
  onRestockSupply,
  onRemoveMedication,
  onOpenNewMedication
}) => {
  const [restockMedID, setRestockMedID] = useState<number | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(30);

  // Global toggle state: show PK & Best Time for all cards
  const [globalShowPK, setGlobalShowPK] = useState<boolean>(false);

  // Per-card expanded state for fine-grained toggling
  const [expandedMedIDs, setExpandedMedIDs] = useState<Set<number>>(new Set());

  const patientMeds = medications.filter(
    m => m.patientID === patient.patientID && m.status === 'active'
  );

  const handleConfirmRestock = (medID: number) => {
    onRestockSupply(medID, restockAmount);
    setRestockMedID(null);
  };

  // Toggle individual card PK section
  const handleToggleCardPK = (medID: number) => {
    setExpandedMedIDs(prev => {
      const next = new Set(prev);
      if (next.has(medID)) {
        next.delete(medID);
      } else {
        next.add(medID);
      }
      return next;
    });
  };

  // Toggle master PK switch
  const handleToggleGlobalPK = () => {
    setGlobalShowPK(prev => {
      const nextVal = !prev;
      if (nextVal) {
        // Expand all active patient medications
        setExpandedMedIDs(new Set(patientMeds.map(m => m.medicationID)));
      } else {
        // Collapse all
        setExpandedMedIDs(new Set());
      }
      return nextVal;
    });
  };

  // Match medication to reference Drug Registry item
  const getMatchedRegistryItem = (med: Medication): DrugRegistryItem | undefined => {
    if (!drugRegistry || drugRegistry.length === 0) return undefined;

    // 1. Direct ATC code match
    if (med.atcCode) {
      const atcMatch = drugRegistry.find(
        d => d.atcCode.trim().toLowerCase() === med.atcCode?.trim().toLowerCase()
      );
      if (atcMatch) return atcMatch;
    }

    // 2. Normalized generic match
    const genMatch = drugRegistry.find(
      d => d.genericName.trim().toLowerCase() === med.normalisedGeneric.trim().toLowerCase()
    );
    if (genMatch) return genMatch;

    // 3. Drug name or brand alias match
    const brandOrNameMatch = drugRegistry.find(
      d =>
        d.genericName.trim().toLowerCase() === med.drugName.trim().toLowerCase() ||
        d.brandNames.some(b => b.trim().toLowerCase() === med.drugName.trim().toLowerCase())
    );
    if (brandOrNameMatch) return brandOrNameMatch;

    // 4. Substring containment match
    return drugRegistry.find(
      d =>
        med.drugName.toLowerCase().includes(d.genericName.toLowerCase()) ||
        med.normalisedGeneric.toLowerCase().includes(d.genericName.toLowerCase()) ||
        d.genericName.toLowerCase().includes(med.normalisedGeneric.toLowerCase())
    );
  };

  return (
    <div className="space-y-4 text-slate-900 dark:text-zinc-100">
      {/* Header Banner with Add Drug & PK Master Toggle */}
      <div className="bg-white dark:bg-zinc-800/60 p-3.5 sm:p-4 rounded-md border border-slate-200 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-zinc-100">
              Prescription Medication Cabinet
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              {patientMeds.length} active prescription{patientMeds.length === 1 ? '' : 's'} on record for {patient.fullName}
            </p>
          </div>

          <button
            onClick={onOpenNewMedication}
            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white rounded-md text-xs font-medium transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Medication</span>
          </button>
        </div>

        {/* Master Clinical Timing & Pharmacokinetics Toggle Bar */}
        {patientMeds.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-700/80 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              <span className="text-xs text-slate-700 dark:text-zinc-300">
                Pharmacokinetics &amp; Timing Guidance
              </span>
            </div>

            <button
              onClick={handleToggleGlobalPK}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition border ${
                globalShowPK
                  ? 'bg-slate-100 dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 border-slate-300 dark:border-zinc-600'
                  : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700'
              }`}
            >
              <span>{globalShowPK ? 'Collapse All PK Details' : 'Expand All PK Details'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Medication List */}
      {patientMeds.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800/60 rounded-md p-8 border border-slate-200 dark:border-zinc-800 text-center space-y-2">
          <Pill className="w-6 h-6 text-slate-400 mx-auto" />
          <div>
            <h3 className="text-sm font-medium text-slate-800 dark:text-zinc-200">
              Cabinet is currently empty
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 max-w-sm mx-auto">
              Add prescribed medications to enable automated interaction checking, schedule tracking, and supply forecasts.
            </p>
          </div>
          <button
            onClick={onOpenNewMedication}
            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-xs font-medium transition"
          >
            Add Medication
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {patientMeds.map(med => {
            const dailyUsage = med.quantityPerDose * med.dosesPerDay;
            const daysRemaining = dailyUsage > 0 ? Math.floor(med.quantityRemaining / dailyUsage) : 0;
            const isRefillWarning = daysRemaining <= med.refillThresholdDays;
            const isRestockingThis = restockMedID === med.medicationID;

            const registryItem = getMatchedRegistryItem(med);
            const isPKExpanded = expandedMedIDs.has(med.medicationID);

            // Determine day/night icon based on advice text
            const timingTextLower = (registryItem?.bestTimeToTake || '').toLowerCase();
            const isMorningFocused =
              timingTextLower.includes('morning') || timingTextLower.includes('breakfast');
            const isEveningFocused =
              timingTextLower.includes('bedtime') ||
              timingTextLower.includes('evening') ||
              timingTextLower.includes('night');

            return (
              <div
                key={med.medicationID}
                className={`bg-white dark:bg-zinc-800/60 rounded-md p-3.5 border transition-colors space-y-2.5 ${
                  isRefillWarning
                    ? 'border-amber-300 dark:border-amber-700/80'
                    : 'border-slate-200 dark:border-zinc-800'
                }`}
              >
                {/* Top Row: Drug Name, Dosage, Category */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    {med.photoUrl ? (
                      <div className="w-9 h-9 rounded overflow-hidden shrink-0 border border-slate-200 dark:border-zinc-700">
                        <img
                          src={med.photoUrl}
                          alt={med.drugName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-9 h-9 rounded flex items-center justify-center shrink-0 border ${
                          isRefillWarning
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                            : 'bg-slate-100 dark:bg-zinc-700/60 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-600'
                        }`}
                      >
                        <Pill className="w-4 h-4" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {med.drugName}
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-zinc-400">
                          {med.dosage}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                        Generic: {med.normalisedGeneric} {med.atcCode ? `• ATC: ${med.atcCode}` : ''}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[11px] font-medium border bg-slate-50 dark:bg-zinc-700/50 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 shrink-0">
                    {med.conditionCategory}
                  </span>
                </div>

                {/* Instructions */}
                {med.instructions && (
                  <div className="text-xs text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-800 p-2.5 rounded border border-slate-100 dark:border-zinc-700/60">
                    {med.instructions}
                  </div>
                )}

                {/* Schedule & Days remaining metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-slate-50 dark:bg-zinc-800 rounded border border-slate-100 dark:border-zinc-700/60">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Dose Times</span>
                    <span className="font-mono font-medium text-slate-800 dark:text-zinc-200">{med.schedule}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Daily Usage</span>
                    <span className="font-mono font-medium text-slate-800 dark:text-zinc-200">{dailyUsage} / day</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Supply Remaining</span>
                    <span
                      className={`font-mono font-semibold ${
                        isRefillWarning ? 'text-amber-700 dark:text-amber-400' : 'text-slate-900 dark:text-zinc-100'
                      }`}
                    >
                      ~{daysRemaining} days
                    </span>
                  </div>
                </div>

                {/* Inventory Remaining Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
                      Stock: <strong className="text-slate-800 dark:text-zinc-200 font-mono">{med.quantityRemaining}</strong> units
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Alert at: {med.refillThresholdDays}d remaining
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-700 rounded overflow-hidden">
                    <div
                      className={`h-full rounded transition-all duration-300 ${
                        isRefillWarning ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(6, (med.quantityRemaining / 40) * 100))}%`
                      }}
                    />
                  </div>
                </div>

                {/* Pharmacokinetics & Best Time To Take Toggle Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-700/80">
                  <button
                    onClick={() => handleToggleCardPK(med.medicationID)}
                    className={`w-full py-1.5 px-2.5 rounded text-xs font-medium flex items-center justify-between transition border ${
                      isPKExpanded
                        ? 'bg-slate-100 dark:bg-zinc-700/70 text-slate-800 dark:text-zinc-200 border-slate-200 dark:border-zinc-600'
                        : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {isMorningFocused ? (
                        <Sun className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      ) : isEveningFocused ? (
                        <Moon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                      )}
                      <span>Administration Timing &amp; Pharmacokinetics</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400 text-[11px]">
                      <span>{isPKExpanded ? 'Hide' : 'Details'}</span>
                      {isPKExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Pharmacokinetics & Best Time Panel */}
                  {isPKExpanded && (
                    <div className="mt-2 p-3 rounded bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 space-y-2.5 text-xs">
                      {registryItem ? (
                        <>
                          {/* 1. Best Time to Take */}
                          {registryItem.bestTimeToTake && (
                            <div className="p-2.5 rounded bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 space-y-1">
                              <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200 text-xs">
                                <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                <span>Administration Timing Guidance</span>
                              </div>
                              <p className="text-slate-600 dark:text-zinc-400 text-xs leading-relaxed">
                                {registryItem.bestTimeToTake}
                              </p>
                            </div>
                          )}

                          {/* 2. Food and Dietary Interaction Guidance */}
                          {registryItem.foodAdvice && (
                            <div className="p-2.5 rounded bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 space-y-1">
                              <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200 text-xs">
                                <Utensils className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
                                <span>Food &amp; Meal Administration</span>
                              </div>
                              <p className="text-slate-600 dark:text-zinc-400 text-xs leading-relaxed">
                                {registryItem.foodAdvice}
                              </p>
                            </div>
                          )}

                          {/* 3. Detailed Pharmacokinetic Metrics Grid */}
                          {registryItem.pharmacokinetics && (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-zinc-300 text-xs">
                                <Activity className="w-3.5 h-3.5 text-slate-500" />
                                <span>Pharmacokinetic Parameters</span>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 rounded bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
                                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block uppercase font-mono">
                                    Half-Life (t½)
                                  </span>
                                  <span className="font-medium text-slate-800 dark:text-zinc-200 text-xs font-mono">
                                    {registryItem.pharmacokinetics.halfLife}
                                  </span>
                                </div>

                                <div className="p-2 rounded bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
                                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block uppercase font-mono">
                                    Peak Plasma (Tmax)
                                  </span>
                                  <span className="font-medium text-slate-800 dark:text-zinc-200 text-xs font-mono">
                                    {registryItem.pharmacokinetics.peakPlasmaTime}
                                  </span>
                                </div>

                                <div className="p-2 rounded bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
                                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block uppercase font-mono">
                                    Bioavailability (F)
                                  </span>
                                  <span className="font-medium text-slate-800 dark:text-zinc-200 text-xs font-mono">
                                    {registryItem.pharmacokinetics.bioavailability}
                                  </span>
                                </div>

                                <div className="p-2 rounded bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
                                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block uppercase font-mono">
                                    Clearance Route
                                  </span>
                                  <span className="font-medium text-slate-800 dark:text-zinc-200 text-xs truncate block">
                                    {registryItem.pharmacokinetics.clearanceRoute}
                                  </span>
                                </div>
                              </div>

                              {/* Metabolism pathway */}
                              <div className="p-2 rounded bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs text-slate-600 dark:text-zinc-400 flex items-start gap-1.5">
                                <span className="font-medium text-slate-700 dark:text-zinc-300 shrink-0">
                                  Metabolism:
                                </span>
                                <span>{registryItem.pharmacokinetics.metabolism}</span>
                              </div>
                            </div>
                          )}

                          {/* 4. Clinical Pearl & Mechanism Note */}
                          {registryItem.clinicalPearl && (
                            <div className="p-2.5 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 text-xs flex items-start gap-2">
                              <FileText className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                              <div className="leading-relaxed">
                                <span className="font-medium block text-xs">Clinical Pearl:</span>
                                <span>{registryItem.clinicalPearl}</span>
                              </div>
                            </div>
                          )}

                          {/* Reference Citation Footer */}
                          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 pt-1 border-t border-slate-200 dark:border-zinc-700">
                            <span className="font-mono">ATC: {registryItem.atcCode}</span>
                            <span>WHO ATC / BNF Reference</span>
                          </div>
                        </>
                      ) : (
                        <div className="p-3 text-center space-y-1">
                          <Info className="w-4 h-4 text-slate-400 mx-auto" />
                          <p className="text-xs text-slate-600 dark:text-zinc-400">
                            No pharmacokinetic monograph available for generic{' '}
                            <strong>{med.normalisedGeneric}</strong>.
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                            Follow dosing intervals specified by the prescriber ({med.schedule}).
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Restock Subform if toggled */}
                {isRestockingThis ? (
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-700/80 p-2.5 rounded bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-800 dark:text-zinc-200">Record Pharmacy Refill</span>
                      <button
                        onClick={() => setRestockMedID(null)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={restockAmount}
                        onChange={e => setRestockAmount(Number(e.target.value))}
                        className="w-20 px-2 py-1 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-600 rounded font-mono text-center text-slate-900 dark:text-zinc-100 text-xs"
                        title="Quantity to add"
                      />
                      <span className="text-slate-600 dark:text-zinc-400 text-xs">units</span>
                      <button
                        onClick={() => handleConfirmRestock(med.medicationID)}
                        className="ml-auto px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded font-medium text-xs"
                      >
                        Confirm Restock
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-700/80 flex items-center justify-between">
                    <button
                      onClick={() => onTakeDose(med.medicationID)}
                      disabled={med.quantityRemaining <= 0}
                      className="px-2.5 py-1.5 rounded border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 transition flex items-center gap-1 disabled:opacity-50"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>Log Dose (-{med.quantityPerDose})</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setRestockMedID(med.medicationID);
                          setRestockAmount(30);
                        }}
                        className="px-2.5 py-1.5 rounded bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-xs font-medium transition flex items-center gap-1"
                      >
                        <PackagePlus className="w-3.5 h-3.5" />
                        <span>Restock</span>
                      </button>

                      <button
                        onClick={() => onRemoveMedication(med.medicationID)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition"
                        title="Discontinue Medication"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
