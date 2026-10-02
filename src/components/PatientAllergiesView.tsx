import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Info,
  ShieldCheck
} from 'lucide-react';
import { Allergy, Patient, ReactionSeverity } from '../types';
import { COMMON_ALLERGEN_CATEGORIES } from '../data/initialData';
import { toLocalDateStr } from '../lib/dateUtils';

interface PatientAllergiesViewProps {
  patient: Patient;
  allergies: Allergy[];
  onAddAllergy: (newAllergy: Omit<Allergy, 'allergyID'>) => void;
  onRemoveAllergy: (allergyID: number) => void;
}

export const PatientAllergiesView: React.FC<PatientAllergiesViewProps> = ({
  patient,
  allergies,
  onAddAllergy,
  onRemoveAllergy
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [allergenName, setAllergenName] = useState('Penicillins');
  const [customAllergen, setCustomAllergen] = useState('');
  const [reactionSeverity, setReactionSeverity] = useState<ReactionSeverity>('severe');
  const [symptoms, setSymptoms] = useState('');

  const patientAllergies = allergies.filter(a => a.patientID === patient.patientID);

  const handleCreateAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = allergenName === 'Custom' ? customAllergen.trim() : allergenName;
    if (!finalName) return;

    onAddAllergy({
      patientID: patient.patientID,
      allergenName: finalName,
      reactionSeverity,
      symptoms: symptoms.trim() || undefined,
      documentedDate: toLocalDateStr()
    });

    setSymptoms('');
    setCustomAllergen('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4 text-slate-900 dark:text-zinc-100">
      {/* Header Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-md p-4 border border-slate-200 dark:border-zinc-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            Documented Allergies
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Prescription verification evaluates new medications against these recorded allergens.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs font-medium transition shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Allergy</span>
        </button>
      </div>

      {/* Add Allergy Form Drawer */}
      {showAddForm && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-normal">Record Known Drug Allergy</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateAllergy} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="allergy-category-select" className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">Allergen Category</label>
                <select
                  id="allergy-category-select"
                  value={allergenName}
                  onChange={e => setAllergenName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-slate-400 focus:outline-none"
                >
                  {COMMON_ALLERGEN_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Custom">Other (Specify)</option>
                </select>
              </div>

              {allergenName === 'Custom' && (
                <div>
                  <label htmlFor="allergy-custom-name" className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">Specify Allergen Name</label>
                  <input
                    id="allergy-custom-name"
                    type="text"
                    value={customAllergen}
                    onChange={e => setCustomAllergen(e.target.value)}
                    placeholder="e.g. Erythromycin, Codeine..."
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-slate-400 focus:outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="allergy-severity-select" className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">Reaction Severity</label>
                <select
                  id="allergy-severity-select"
                  value={reactionSeverity}
                  onChange={e => setReactionSeverity(e.target.value as ReactionSeverity)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-slate-400 focus:outline-none"
                >
                  <option value="severe">Severe (Anaphylaxis, Angioedema)</option>
                  <option value="moderate">Moderate (Severe Urticaria, Blistering)</option>
                  <option value="mild">Mild (Pruritus, Mild Rash)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="allergy-symptoms-input" className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">Reaction Symptoms (Optional)</label>
              <input
                id="allergy-symptoms-input"
                type="text"
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                placeholder="e.g. Swelling of lips/tongue, shortness of breath..."
                className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-slate-900 dark:text-zinc-100 focus:ring-1 focus:ring-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded hover:bg-slate-200 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs font-semibold shadow-2xs"
              >
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of allergies */}
      <div className="space-y-2.5">
        {patientAllergies.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-md p-6 border border-slate-200 dark:border-zinc-800 text-center space-y-2">
            <div className="w-10 h-10 rounded bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-500 dark:text-zinc-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">No Drug Allergies Documented</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mt-0.5">
                No adverse drug hypersensitivities recorded for this patient profile.
              </p>
            </div>
          </div>
        ) : (
          patientAllergies.map(allergy => {
            const isSevere = allergy.reactionSeverity === 'severe';

            return (
              <div
                key={allergy.allergyID}
                className="bg-white dark:bg-zinc-900 rounded-md p-3.5 border border-slate-200 dark:border-zinc-800 flex flex-col justify-between gap-2.5 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className={`mt-0.5 p-1 rounded ${isSevere ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400' : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'}`}>
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{allergy.allergenName}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Documented: {allergy.documentedDate}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                      isSevere
                        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
                        : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60'
                    }`}
                  >
                    {allergy.reactionSeverity}
                  </span>
                </div>

                {allergy.symptoms && (
                  <div className="text-xs text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded border border-slate-100 dark:border-zinc-800">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">Manifestation: </span>
                    <span>{allergy.symptoms}</span>
                  </div>
                )}

                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => onRemoveAllergy(allergy.allergyID)}
                    aria-label={`Remove allergy record for ${allergy.allergenName}`}
                    className="text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
