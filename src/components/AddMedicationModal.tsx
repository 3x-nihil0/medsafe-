import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Clock,
  Pill,
  BookOpen,
  ArrowRight,
  FileText
} from 'lucide-react';
import {
  DrugRegistryItem,
  InteractionRule,
  Allergy,
  Medication,
  Patient,
  ChronicConditionCategory
} from '../types';
import { PhotoUploadDropzone } from './PhotoUploadDropzone';
import {
  evaluateMedicationSafety,
  EvaluationResult,
  sanitizeInput,
  toLocalDateStr
} from '../services/ruleEngine';

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  patientAllergies: Allergy[];
  activeMedications: Medication[];
  drugRegistry: DrugRegistryItem[];
  interactionRules: InteractionRule[];
  onAddMedication: (
    newMed: Omit<Medication, 'medicationID'>,
    evaluation: EvaluationResult,
    overrideReason?: string
  ) => void;
}

export const AddMedicationModal: React.FC<AddMedicationModalProps> = ({
  isOpen,
  onClose,
  patient,
  patientAllergies,
  activeMedications,
  drugRegistry,
  interactionRules,
  onAddMedication
}) => {
  const [drugInput, setDrugInput] = useState('');
  const [dosage, setDosage] = useState('10mg');
  const [schedule, setSchedule] = useState('08:00');
  const [quantityRemaining, setQuantityRemaining] = useState<number>(30);
  const [quantityPerDose, setQuantityPerDose] = useState<number>(1);
  const [dosesPerDay, setDosesPerDay] = useState<number>(1);
  const [refillThresholdDays, setRefillThresholdDays] = useState<number>(7);
  const [conditionCategory, setConditionCategory] = useState<ChronicConditionCategory>('hypertension');
  const [instructions, setInstructions] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideField, setShowOverrideField] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Real-time evaluation calculation
  const evaluation: EvaluationResult | null = useMemo(() => {
    if (!drugInput.trim()) return null;
    return evaluateMedicationSafety(
      drugInput.trim(),
      patient.patientID,
      patientAllergies.filter(a => a.patientID === patient.patientID),
      activeMedications.filter(m => m.patientID === patient.patientID),
      drugRegistry,
      interactionRules,
      patient.conditionTags || []
    );
  }, [drugInput, patient.patientID, patient.conditionTags, activeMedications, patientAllergies, drugRegistry, interactionRules]);

  useEffect(() => {
    if (evaluation && !evaluation.isSafe) {
      setShowOverrideField(true);
    } else {
      setShowOverrideField(false);
      setOverrideReason('');
    }
  }, [evaluation]);

  const handleSelectDrug = (item: DrugRegistryItem) => {
    setDrugInput(item.genericName);
    setConditionCategory(item.category);
    setInstructions(`Standard clinical regimen for ${item.category}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate and sanitize free-text inputs per FR13/NFR7
    const drugSanitized = sanitizeInput(drugInput);
    if (!drugSanitized.isValid) {
      setValidationError(`Medication Name: ${drugSanitized.error}`);
      return;
    }

    const dosageSanitized = sanitizeInput(dosage);
    if (!dosageSanitized.isValid) {
      setValidationError(`Dosage: ${dosageSanitized.error}`);
      return;
    }

    if (instructions.trim()) {
      const instructionsSanitized = sanitizeInput(instructions);
      if (!instructionsSanitized.isValid) {
        setValidationError(`Instructions: ${instructionsSanitized.error}`);
        return;
      }
    }

    if (overrideReason.trim()) {
      const overrideSanitized = sanitizeInput(overrideReason);
      if (!overrideSanitized.isValid) {
        setValidationError(`Override Rationale: ${overrideSanitized.error}`);
        return;
      }
    }

    if (!drugSanitized.sanitized) {
      setValidationError('Medication name is required.');
      return;
    }

    if (!evaluation) {
      setValidationError('Rule screening incomplete.');
      return;
    }

    if (!evaluation.isSafe && !overrideReason.trim()) {
      setValidationError('Please review identified conflicts and provide a therapeutic rationale override.');
      setShowOverrideField(true);
      return;
    }

    const newMed: Omit<Medication, 'medicationID'> = {
      patientID: patient.patientID,
      drugName: drugSanitized.sanitized,
      normalisedGeneric: evaluation.normalisedDrug || drugSanitized.sanitized,
      atcCode: evaluation.registryItem?.atcCode,
      dosage: dosageSanitized.sanitized,
      schedule: schedule.trim() || '08:00',
      quantityRemaining: Number(quantityRemaining) || 30,
      quantityPerDose: Number(quantityPerDose) || 1,
      dosesPerDay: Number(dosesPerDay) || 1,
      refillThresholdDays: Number(refillThresholdDays) || 7,
      status: 'active',
      prescribedDate: toLocalDateStr(),
      conditionCategory,
      instructions: instructions.trim() ? sanitizeInput(instructions).sanitized : undefined,
      photoUrl
    };

    onAddMedication(
      newMed,
      evaluation,
      overrideReason.trim() ? sanitizeInput(overrideReason).sanitized : undefined
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-medication-title"
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col border border-slate-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-zinc-100"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900/60">
          <div>
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 id="add-medication-title" className="text-base font-bold text-slate-900 dark:text-zinc-100">Add Prescribed Medication</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Prescribing for <span className="font-semibold text-slate-700 dark:text-zinc-200">{patient.fullName}</span> • Automated Safety Verification
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close add medication dialog"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {validationError && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 flex items-center gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Drug Search / Input */}
          <div>
            <label htmlFor="add-med-drug-input" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Medication Generic or Brand Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="add-med-drug-input"
              type="text"
              value={drugInput}
              onChange={e => setDrugInput(e.target.value)}
              placeholder="e.g. Lisinopril, Metformin, Salbutamol, Aspirin..."
              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none text-slate-900 dark:text-zinc-100 font-medium"
              required
            />

            {/* Quick Registry Chips */}
            <div className="mt-2">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 mr-1.5">Common presets:</span>
              <div className="inline-flex flex-wrap gap-1 mt-1">
                {drugRegistry.slice(0, 6).map(item => (
                  <button
                    key={item.atcCode}
                    type="button"
                    onClick={() => handleSelectDrug(item)}
                    className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-zinc-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-800 dark:hover:text-teal-300 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 transition"
                  >
                    {item.genericName}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* REAL-TIME SAFETY SCREENING RESULT BANNER */}
          {evaluation && (
            <div className="space-y-2">
              {/* Status Box */}
              {evaluation.isSafe ? (
                <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-xs">Safe to Prescribe</p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {evaluation.normalisedDrug} ({evaluation.registryItem?.atcCode}) cleared against active regimen and patient allergy profile.
                    </p>
                  </div>
                </div>
              ) : evaluation.isUnverified ? (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
                  <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs">Unverified Medication</span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-mono text-[10px]">Fail-Safe</span>
                    </div>
                    <p className="text-[11px] text-amber-800 dark:text-amber-400 mt-0.5">
                      "{drugInput}" is not recognized in the clinical drug registry. Per safety specifications, unknown medications are never assumed safe.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Allergy alerts */}
                  {evaluation.allergyAlerts.map((all, i) => (
                    <div key={i} className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-950 dark:text-rose-200 flex items-start gap-2.5">
                      <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs uppercase text-rose-700 dark:text-rose-400">
                            Allergy Alert: {all.reactionSeverity} Severity
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 text-[10px] font-semibold">
                            {all.allergenName}
                          </span>
                        </div>
                        <p className="text-xs text-rose-900 dark:text-rose-300 leading-relaxed font-medium">{all.message}</p>
                      </div>
                    </div>
                  ))}

                  {/* Interaction alerts */}
                  {evaluation.interactionAlerts.map((inter, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                        inter.severityLevel === 'severe'
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-950 dark:text-rose-200'
                          : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900 text-amber-950 dark:text-amber-200'
                      }`}
                    >
                      <AlertTriangle
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          inter.severityLevel === 'severe' ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                        }`}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-bold text-xs uppercase px-2 py-0.5 rounded ${
                              inter.severityLevel === 'severe'
                                ? 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200'
                                : 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                            }`}
                          >
                            Interaction: {inter.severityLevel}
                          </span>
                          <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-400 font-medium">
                            {inter.drugA} ↔ {inter.drugB}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed font-medium">{inter.clinicalEffect}</p>
                      </div>
                    </div>
                  ))}

                  {/* Duplicate Therapy Alerts */}
                  {evaluation.duplicateAlerts && evaluation.duplicateAlerts.map((dup, i) => (
                    <div
                      key={`dup-${i}`}
                      className="p-3.5 rounded-xl border border-purple-300 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/40 text-purple-950 dark:text-purple-200 flex items-start gap-2.5"
                    >
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-purple-600 dark:text-purple-400" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200">
                            Duplicate Therapy: {dup.type === 'exact' ? 'Exact Active Ingredient' : 'Class Redundancy'}
                          </span>
                          <span className="font-mono text-[11px] text-purple-700 dark:text-purple-300 font-medium">
                            Active: {dup.existingDrug}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed font-medium">{dup.message}</p>
                      </div>
                    </div>
                  ))}

                  {/* Condition Contraindication Alerts */}
                  {evaluation.contraindicationAlerts && evaluation.contraindicationAlerts.map((contra, i) => (
                    <div
                      key={`contra-${i}`}
                      className="p-3.5 rounded-xl border border-red-400 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-950 dark:text-red-200 flex items-start gap-2.5"
                    >
                      <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-200">
                            Condition Contraindication: {contra.severityLevel}
                          </span>
                          <span className="text-[11px] font-semibold text-red-800 dark:text-red-300">
                            Patient Condition: {contra.condition}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed font-medium">{contra.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Dosage & Scheduling Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label htmlFor="add-med-dosage" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Prescribed Dosage</label>
              <input
                id="add-med-dosage"
                type="text"
                value={dosage}
                onChange={e => setDosage(e.target.value)}
                placeholder="e.g. 10mg, 500mg, 2 puffs"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="add-med-schedule" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Dose Times (24h)
              </label>
              <input
                id="add-med-schedule"
                type="text"
                value={schedule}
                onChange={e => setSchedule(e.target.value)}
                placeholder="e.g. 08:00, 20:00"
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label htmlFor="add-med-condition" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Condition Category</label>
              <select
                id="add-med-condition"
                value={conditionCategory}
                onChange={e => setConditionCategory(e.target.value as ChronicConditionCategory)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="hypertension">Hypertension</option>
                <option value="diabetes">Diabetes Mellitus</option>
                <option value="hiv">HIV Management (ART)</option>
                <option value="asthma">Asthma / Respiratory</option>
                <option value="general">General Co-Prescription</option>
              </select>
            </div>

            <div>
              <label htmlFor="add-med-quantity" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Initial Quantity In Stock</label>
              <input
                id="add-med-quantity"
                type="number"
                min="1"
                max="500"
                value={quantityRemaining}
                onChange={e => setQuantityRemaining(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          {/* Medication photo documentation */}
          <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2">
            <PhotoUploadDropzone
              id="medication-package-photo"
              photoUrl={photoUrl}
              onChangePhoto={setPhotoUrl}
              label="Pill Packaging / Prescription Label Photo (Optional)"
            />
          </div>

          {/* Clinical instructions */}
          <div>
            <label htmlFor="add-med-instructions" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">Instructions / Notes</label>
            <input
              id="add-med-instructions"
              type="text"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="e.g. Take with morning meal and full glass of water..."
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Conflict Override Field */}
          {showOverrideField && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold">
                <FileText className="w-4 h-4 text-amber-600" />
                <label htmlFor="add-med-override-reason" className="cursor-pointer">Clinical Override Justification</label>
              </div>
              <textarea
                id="add-med-override-reason"
                value={overrideReason}
                onChange={e => setOverrideReason(e.target.value)}
                placeholder="State the therapeutic rationale or specialist approval..."
                className="w-full p-2.5 text-xs bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 rounded-lg text-slate-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                rows={2}
                required
              />
            </div>
          )}
        </form>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-zinc-900/60 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-xl transition shadow-xs flex items-center gap-1.5 ${
              evaluation && !evaluation.isSafe && !overrideReason
                ? 'bg-amber-600 hover:bg-amber-500'
                : 'bg-teal-600 hover:bg-teal-500'
            }`}
          >
            <span>
              {evaluation && !evaluation.isSafe
                ? showOverrideField
                  ? 'Confirm with Override'
                  : 'Review Conflicts'
                : 'Save Prescription'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
