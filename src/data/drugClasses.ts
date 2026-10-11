import type { ChronicConditionCategory, DrugRegistryItem } from '../types';

/**
 * Clinical Drug-Class Taxonomy (v1)
 * 30 starting therapeutic classes. Every registered drug maps to exactly one
 * primary class id; the class auto-fills the Add Medication form and remains
 * user-editable so newer agents can be categorised manually.
 */

export interface DrugClassDefinition {
  id: string; // stable machine id, stored on Medication.drugClass
  name: string; // human label shown in dropdowns and cards
  exampleDrugs: string[]; // illustrative members shown in registry hints
}

export const DRUG_CLASSES: DrugClassDefinition[] = [
  { id: 'analgesics', name: 'Analgesics', exampleDrugs: ['Paracetamol', 'Tramadol'] },
  { id: 'nsaids', name: 'NSAIDs', exampleDrugs: ['Ibuprofen', 'Diclofenac'] },
  { id: 'antibiotics', name: 'Antibiotics', exampleDrugs: ['Amoxicillin', 'Azithromycin'] },
  { id: 'antifungals', name: 'Antifungals', exampleDrugs: ['Fluconazole', 'Clotrimazole'] },
  { id: 'antivirals', name: 'Antivirals', exampleDrugs: ['Acyclovir', 'Oseltamivir'] },
  { id: 'antimalarials', name: 'Antimalarials', exampleDrugs: ['Artemether/Lumefantrine', 'Artesunate'] },
  { id: 'anthelmintics', name: 'Anthelmintics', exampleDrugs: ['Albendazole', 'Mebendazole'] },
  { id: 'antiprotozoals', name: 'Antiprotozoals', exampleDrugs: ['Metronidazole', 'Tinidazole'] },
  { id: 'antihistamines', name: 'Antihistamines', exampleDrugs: ['Cetirizine', 'Loratadine'] },
  { id: 'antitussives', name: 'Antitussives', exampleDrugs: ['Dextromethorphan', 'Codeine'] },
  { id: 'expectorants', name: 'Expectorants', exampleDrugs: ['Guaifenesin'] },
  { id: 'decongestants', name: 'Decongestants', exampleDrugs: ['Pseudoephedrine', 'Oxymetazoline'] },
  { id: 'antacids', name: 'Antacids', exampleDrugs: ['Magnesium hydroxide', 'Aluminium hydroxide'] },
  { id: 'ppis', name: 'Antiulcer Drugs / PPIs', exampleDrugs: ['Omeprazole', 'Pantoprazole'] },
  { id: 'antiemetics', name: 'Antiemetics', exampleDrugs: ['Ondansetron', 'Metoclopramide'] },
  { id: 'laxatives', name: 'Laxatives', exampleDrugs: ['Lactulose', 'Bisacodyl'] },
  { id: 'antidiarrheals', name: 'Antidiarrheals', exampleDrugs: ['Loperamide'] },
  { id: 'antidiabetics', name: 'Antidiabetics', exampleDrugs: ['Metformin', 'Glibenclamide'] },
  { id: 'antihypertensives', name: 'Antihypertensives (Other)', exampleDrugs: ['Amlodipine'] },
  { id: 'diuretics', name: 'Diuretics', exampleDrugs: ['Furosemide', 'Hydrochlorothiazide'] },
  { id: 'beta-blockers', name: 'Beta-Blockers', exampleDrugs: ['Propranolol', 'Atenolol'] },
  { id: 'ace-inhibitors', name: 'ACE Inhibitors', exampleDrugs: ['Enalapril', 'Lisinopril'] },
  { id: 'arbs', name: 'ARBs', exampleDrugs: ['Losartan', 'Valsartan'] },
  { id: 'statins', name: 'Statins / Lipid-Lowering', exampleDrugs: ['Atorvastatin', 'Rosuvastatin'] },
  { id: 'anticoagulants', name: 'Anticoagulants', exampleDrugs: ['Warfarin', 'Heparin'] },
  { id: 'antiplatelets', name: 'Antiplatelets', exampleDrugs: ['Aspirin', 'Clopidogrel'] },
  { id: 'corticosteroids', name: 'Corticosteroids', exampleDrugs: ['Prednisolone', 'Dexamethasone'] },
  { id: 'bronchodilators', name: 'Bronchodilators', exampleDrugs: ['Salbutamol', 'Salmeterol'] },
  { id: 'antidepressants', name: 'Antidepressants', exampleDrugs: ['Fluoxetine', 'Sertraline'] },
  { id: 'antipsychotics', name: 'Antipsychotics', exampleDrugs: ['Risperidone', 'Olanzapine'] }
];

export const DEFAULT_DRUG_CLASS = 'nsaids';

export function getDrugClassName(classId: string | undefined): string {
  if (!classId) return 'General Co-Prescription';
  return DRUG_CLASSES.find(c => c.id === classId)?.name ?? 'General Co-Prescription';
}

/**
 * Legacy mapped categories (Hypertension / Diabetes / HIV / Asthma) are kept as
 * a separate "Condition" concept: every drug class carries the condition(s) it
 * is typically prescribed FOR, and legacy stored data keeps working.
 */
export const CLASS_TO_CONDITION: Record<string, ChronicConditionCategory> = {
  antihypertensives: 'hypertension',
  diuretics: 'hypertension',
  'beta-blockers': 'hypertension',
  'ace-inhibitors': 'hypertension',
  arbs: 'hypertension',
  anticoagulants: 'general',
  antiplatelets: 'general',
  statins: 'general',
  antidiabetics: 'diabetes',
  antivirals: 'hiv',
  bronchodilators: 'asthma',
  corticosteroids: 'asthma',
  nsaids: 'general',
  analgesics: 'general',
  antibiotics: 'general',
  antifungals: 'general',
  antimalarials: 'general',
  anthelmintics: 'general',
  antiprotozoals: 'general',
  antihistamines: 'general',
  antitussives: 'general',
  expectorants: 'general',
  decongestants: 'general',
  antacids: 'general',
  ppis: 'general',
  antiemetics: 'general',
  laxatives: 'general',
  antidiarrheals: 'general',
  antidepressants: 'general',
  antipsychotics: 'general'
};

/**
 * Registry items exported as data: each of the 30 above classes contributes its
 * example drugs. Existing registry entries (Lisinopril, Metformin, ...) map to
 * the matching class id, so nothing currently stored is lost.
 */
export function deriveConditionCategory(classId: string | undefined): ChronicConditionCategory {
  return (classId && CLASS_TO_CONDITION[classId]) || 'general';
}

export function suggestDrugClass(registryItem: DrugRegistryItem | null): string {
  if (!registryItem) return DEFAULT_DRUG_CLASS;
  const gen = registryItem.genericName.toLowerCase();
  switch (registryItem.category) {
    case 'hypertension':
      if (gen.includes('amlo')) return 'antihypertensives';
      if (gen.includes('losartan') || gen.includes('valsartan') || gen.includes('candesartan')) return 'arbs';
      if (gen.includes('lisinopril') || gen.includes('enalapril') || gen.includes('captopril')) return 'ace-inhibitors';
      if (gen.includes('hctz') || gen.includes('hydrochlorothiazide') || gen.includes('furosemide')) return 'diuretics';
      if (gen.includes('atenol') || gen.includes('propranol') || gen.includes('metoprolol')) return 'beta-blockers';
      return 'antihypertensives';
    case 'diabetes':
      return 'antidiabetics';
    case 'hiv':
      return 'antivirals';
    case 'asthma':
      return 'bronchodilators';
    default:
      return matchGenericToClass(gen) ?? DEFAULT_DRUG_CLASS;
  }
}

/** Match a generic / brand drug string against the taxonomy's example members. */
export function matchGenericToClass(genericLower: string): string | null {
  for (const cls of DRUG_CLASSES) {
    for (const ex of cls.exampleDrugs) {
      const exLower = ex.toLowerCase();
      if (genericLower === exLower || genericLower.includes(exLower) || exLower.includes(genericLower)) {
        return cls.id;
      }
    }
  }
  return null;
}

export function getDrugClassOptions(): { value: string; label: string }[] {
  return DRUG_CLASSES.map(c => ({ value: c.id, label: c.name }));
}
