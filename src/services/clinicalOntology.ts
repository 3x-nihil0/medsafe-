/**
 * Clinical Decision Support (CDS) Ontology & Knowledge Engine
 * 
 * Provides:
 * 1. Comprehensive Allergen Class Hierarchy & Cross-Reactivity Ontology
 *    - Strict token-boundary and semantic length guards (prevents false positives like "in" matching ARBs)
 *    - Empty/whitespace rejection
 *    - UK/Commonwealth/Nigerian phonetic & spelling normalization ("Sulpha" <-> "Sulfa")
 *    - True class-level cross-reactivity (e.g. Ibuprofen -> Diclofenac, Ampicillin -> Amoxicillin)
 * 2. Duplicate Therapy & Therapeutic Redundancy Detection (Exact Chemical & Class level)
 * 3. Clinical Condition Contraindication Rules (Patient condition tags vs formulary agents)
 */

import { DrugRegistryItem, Allergy, ReactionSeverity, Medication } from '../types';

export interface AllergenClassDefinition {
  id: string;
  name: string;
  categoryDisplayName: string;
  description: string;
  /** Drug generic names or brand keywords belonging to this class */
  memberDrugs: string[];
  /** Synonyms, aliases, abbreviations, and international/local spelling variants */
  aliases: string[];
  /** Clinical cross-reactivity warning message template */
  crossReactivityMechanism: string;
}

export const CLINICAL_ALLERGEN_CLASSES: AllergenClassDefinition[] = [
  {
    id: 'PENICILLINS',
    name: 'Penicillins',
    categoryDisplayName: 'Beta-Lactam / Penicillin Antibiotics',
    description: 'Bactericidal beta-lactam antibiotics sharing the 6-aminopenicillanic acid core.',
    memberDrugs: [
      'amoxicillin',
      'ampicillin',
      'benzylpenicillin',
      'phenoxymethylpenicillin',
      'penicillin v',
      'penicillin g',
      'flucloxacillin',
      'cloxacillin',
      'piperacillin',
      'amoxil',
      'augmentin',
      'clavam'
    ],
    aliases: [
      'penicillin',
      'penicillins',
      'ampicillin',
      'amoxicillin',
      'beta-lactam',
      'beta lactam',
      'beta lactams',
      'beta-lactams',
      'aminopenicillin',
      'aminopenicillins',
      'augmentin',
      'amoxil'
    ],
    crossReactivityMechanism:
      'Shares the core beta-lactam ring with potential for severe IgE-mediated type-I hypersensitivity (anaphylaxis, urticaria, angioedema).'
  },
  {
    id: 'SULFONAMIDES',
    name: 'Sulfa Drugs',
    categoryDisplayName: 'Sulfonamide (Sulfa / Sulpha) Compounds',
    description: 'Drugs containing arylamine sulfonamide or non-arylamine sulfamyl moieties.',
    memberDrugs: [
      'hydrochlorothiazide',
      'glimepiride',
      'glibenclamide',
      'sulfamethoxazole',
      'co-trimoxazole',
      'septrin',
      'bactrim',
      'sulfasalazine',
      'furosemide',
      'hctz'
    ],
    aliases: [
      'sulfa',
      'sulfa drugs',
      'sulfa drug',
      'sulfas',
      'sulfonamide',
      'sulfonamides',
      'sulpha',
      'sulpha drugs',
      'sulpha drug',
      'sulphas',
      'sulphonamide',
      'sulphonamides',
      'co-trimoxazole',
      'cotrimoxazole',
      'septrin',
      'septran',
      'bactrim',
      'sulfamethoxazole'
    ],
    crossReactivityMechanism:
      'Contains a sulfonamide functional group with risk of cutaneous adverse reactions, erythema multiforme, and hypersensitivity cross-reactivity.'
  },
  {
    id: 'NSAIDS',
    name: 'NSAIDs/Aspirin',
    categoryDisplayName: 'Non-Steroidal Anti-Inflammatory Drugs (NSAIDs) & Aspirin',
    description: 'Cyclooxygenase (COX-1/COX-2) inhibitors with analgesic, antipyretic, and anti-inflammatory action.',
    memberDrugs: [
      'aspirin',
      'ibuprofen',
      'diclofenac',
      'naproxen',
      'indomethacin',
      'meloxicam',
      'piroxicam',
      'ketorolac',
      'celecoxib',
      'voltaren',
      'advil',
      'motrin',
      'brufen',
      'cataflam',
      'disprin'
    ],
    aliases: [
      'nsaid',
      'nsaids',
      'non-steroidal',
      'nonsteroidal',
      'non-steroidal anti-inflammatory',
      'non-steroidal anti-inflammatory drugs',
      'nonsteroidal anti-inflammatory drugs',
      'aspirin',
      'acetylsalicylic acid',
      'asa',
      'ibuprofen',
      'diclofenac',
      'advil',
      'motrin',
      'brufen',
      'voltaren',
      'cataflam',
      'naproxen',
      'cox inhibitor'
    ],
    crossReactivityMechanism:
      'Non-selective cyclooxygenase (COX) inhibition shunts arachidonic acid to leukotrienes, risking life-threatening bronchospasm, angioedema, and severe anaphylactoid reactions.'
  },
  {
    id: 'ACE_INHIBITORS',
    name: 'ACE Inhibitors',
    categoryDisplayName: 'Angiotensin-Converting Enzyme (ACE) Inhibitors',
    description: 'Inhibitors of angiotensin-converting enzyme preventing conversion of angiotensin I to angiotensin II.',
    memberDrugs: [
      'lisinopril',
      'ramipril',
      'enalapril',
      'captopril',
      'perindopril',
      'zestril',
      'prinivil'
    ],
    aliases: [
      'ace inhibitor',
      'ace inhibitors',
      'ace-i',
      'acei',
      'angiotensin-converting enzyme inhibitor',
      'angiotensin converting enzyme inhibitor',
      'lisinopril',
      'ramipril',
      'enalapril',
      'captopril'
    ],
    crossReactivityMechanism:
      'Class-effect kininase II inhibition causing bradykinin accumulation, with substantial risk of recurrent severe facial, laryngeal, or visceral angioedema.'
  },
  {
    id: 'ARBS',
    name: 'Angiotensin Receptor Blockers',
    categoryDisplayName: 'Angiotensin II Receptor Blockers (ARBs)',
    description: 'Selective AT1 subtype angiotensin II receptor antagonists.',
    memberDrugs: [
      'losartan',
      'valsartan',
      'candesartan',
      'telmisartan',
      'irbesartan',
      'olmesartan',
      'cozaar'
    ],
    aliases: [
      'arb',
      'arbs',
      'angiotensin receptor blocker',
      'angiotensin receptor blockers',
      'angiotensin ii receptor antagonist',
      'angiotensin-receptor blocker',
      'losartan',
      'valsartan',
      'candesartan',
      'cozaar'
    ],
    crossReactivityMechanism:
      'Selective AT1 receptor blocker class cross-reactivity and potential for cross-angioedema or severe hypersensitivity.'
  },
  {
    id: 'BETA_BLOCKERS',
    name: 'Beta Blockers',
    categoryDisplayName: 'Beta-Adrenergic Antagonists (Beta Blockers)',
    description: 'Adrenergic beta-receptor antagonists for cardiovascular disorders.',
    memberDrugs: [
      'atenolol',
      'metoprolol',
      'propranolol',
      'carvedilol',
      'bisoprolol',
      'labetalol',
      'tenormin'
    ],
    aliases: [
      'beta blocker',
      'beta blockers',
      'beta-blocker',
      'beta-blockers',
      'beta adrenergic antagonist',
      'atenolol',
      'metoprolol',
      'propranolol',
      'carvedilol',
      'bisoprolol'
    ],
    crossReactivityMechanism:
      'Beta-adrenergic receptor antagonist class sensitivity with potential for severe bronchospasm or bradyarrhythmias.'
  },
  {
    id: 'STATINS',
    name: 'Statins',
    categoryDisplayName: 'HMG-CoA Reductase Inhibitors (Statins)',
    description: 'Inhibitors of 3-hydroxy-3-methylglutaryl-coenzyme A reductase.',
    memberDrugs: [
      'atorvastatin',
      'simvastatin',
      'rosuvastatin',
      'pravastatin',
      'fluvastatin',
      'lipitor'
    ],
    aliases: [
      'statin',
      'statins',
      'hmg-coa reductase inhibitor',
      'hmg-coa inhibitor',
      'atorvastatin',
      'simvastatin',
      'rosuvastatin',
      'pravastatin',
      'lipitor'
    ],
    crossReactivityMechanism:
      'Class-wide immunogenic myopathy or hepatic hypersensitivity reaction.'
  },
  {
    id: 'FLUOROQUINOLONES',
    name: 'Fluoroquinolones',
    categoryDisplayName: 'Fluoroquinolone Antibacterials',
    description: 'Broad-spectrum synthetic bacterial DNA gyrase inhibitors.',
    memberDrugs: [
      'ciprofloxacin',
      'levofloxacin',
      'moxifloxacin',
      'ofloxacin',
      'norfloxacin',
      'cipro',
      'ciprobay'
    ],
    aliases: [
      'fluoroquinolone',
      'fluoroquinolones',
      'quinolone',
      'quinolones',
      'ciprofloxacin',
      'levofloxacin',
      'cipro'
    ],
    crossReactivityMechanism:
      'Extensive intra-class cross-reactivity across fluoroquinolones with risk of anaphylaxis, photosensitivity, and tendonitis.'
  },
  {
    id: 'CALCIUM_CHANNEL_BLOCKERS',
    name: 'Calcium Channel Blockers',
    categoryDisplayName: 'Calcium Channel Blockers (CCBs)',
    description: 'Dihydropyridine and non-dihydropyridine calcium channel blockers.',
    memberDrugs: [
      'amlodipine',
      'nifedipine',
      'felodipine',
      'diltiazem',
      'verapamil',
      'norvasc'
    ],
    aliases: [
      'calcium channel blocker',
      'calcium channel blockers',
      'ccb',
      'ccbs',
      'dihydropyridine',
      'amlodipine',
      'nifedipine'
    ],
    crossReactivityMechanism:
      'Vasodilatory calcium entry blocker hypersensitivity.'
  },
  {
    id: 'PROH_PUMP_INHIBITORS',
    name: 'Proton Pump Inhibitors',
    categoryDisplayName: 'Proton Pump Inhibitors (PPIs)',
    description: 'Substituted benzimidazole gastric H+/K+-ATPase pump inhibitors.',
    memberDrugs: [
      'omeprazole',
      'esomeprazole',
      'pantoprazole',
      'rabeprazole',
      'lansoprazole',
      'prilosec',
      'losec'
    ],
    aliases: [
      'ppi',
      'ppis',
      'proton pump inhibitor',
      'proton pump inhibitors',
      'omeprazole',
      'esomeprazole',
      'pantoprazole'
    ],
    crossReactivityMechanism:
      'High structural cross-reactivity among substituted benzimidazole proton pump inhibitors.'
  }
];

/**
 * Normalizes an allergen search string:
 * - Trims whitespace
 * - Standardizes UK/Commonwealth/Nigerian spellings (e.g. "sulpha" -> "sulfa", "sulpho" -> "sulfo")
 * - Removes superfluous punctuation
 */
export function normalizeAllergenTerm(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .trim()
    .toLowerCase()
    .replace(/\bsulpha\b/g, 'sulfa')
    .replace(/\bsulpho\b/g, 'sulfo')
    .replace(/\bsulphonamides?\b/g, 'sulfonamides')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Evaluates whether a given patient allergy matches a target drug,
 * checking direct chemical names, brand aliases, and comprehensive class cross-reactivity.
 *
 * CRITICAL SAFETY GUARDS:
 * 1. Rejects empty or whitespace-only inputs (never returns false positive for "").
 * 2. Rejects generic substrings shorter than 3 characters unless exact match (never lets "in" match "Angiotensin").
 * 3. Enforces word-boundary matching `\b` for keyword queries.
 * 4. Resolves cross-reactivity hierarchies (e.g. "Ampicillin" catches "Amoxicillin", "Ibuprofen" catches "Diclofenac").
 */
export function matchPatientAllergy(
  allergy: Allergy,
  normalisedDrug: string,
  registryItem: DrugRegistryItem | null
): {
  isMatch: boolean;
  matchType: 'direct' | 'cross_reactivity' | 'class';
  matchedClass?: AllergenClassDefinition;
  message: string;
} | null {
  const rawAllergen = allergy.allergenName ? allergy.allergenName.trim() : '';

  // Guard 1: Empty or whitespace-only allergy must NEVER match
  if (rawAllergen.length === 0) {
    return null;
  }

  const cleanAllergen = normalizeAllergenTerm(rawAllergen);
  if (cleanAllergen.length < 2) {
    return null;
  }

  const drugGenClean = normalizeAllergenTerm(normalisedDrug);
  const brandNamesClean = (registryItem?.brandNames || []).map(b => normalizeAllergenTerm(b));
  const drugGroupClean = normalizeAllergenTerm(registryItem?.allergenGroup || '');

  // 1. Direct Generic Name Match
  if (cleanAllergen === drugGenClean) {
    return {
      isMatch: true,
      matchType: 'direct',
      message: `Direct Allergy Conflict: Patient has a documented ${allergy.reactionSeverity.toUpperCase()} allergy to ${rawAllergen}. The prescribed drug is ${normalisedDrug}.`
    };
  }

  // 2. Direct Brand Name Match
  if (brandNamesClean.includes(cleanAllergen)) {
    return {
      isMatch: true,
      matchType: 'direct',
      message: `Direct Brand Allergy Conflict: Patient has a documented ${allergy.reactionSeverity.toUpperCase()} allergy to ${rawAllergen} (${normalisedDrug}).`
    };
  }

  // Find if target drug belongs to any known allergen class
  const targetDrugClasses = CLINICAL_ALLERGEN_CLASSES.filter(cls => {
    // Drug matches by member drug list
    const inMemberList = cls.memberDrugs.some(m => normalizeAllergenTerm(m) === drugGenClean);
    // Drug matches by allergenGroup in registry
    const inGroup = drugGroupClean && (
      normalizeAllergenTerm(cls.name) === drugGroupClean ||
      cls.aliases.some(a => normalizeAllergenTerm(a) === drugGroupClean)
    );
    return inMemberList || inGroup;
  });

  // Find if the patient's documented allergy maps to any known allergen class
  const allergenMappedClasses = CLINICAL_ALLERGEN_CLASSES.filter(cls => {
    // Check aliases
    for (const alias of cls.aliases) {
      const aliasNorm = normalizeAllergenTerm(alias);
      if (cleanAllergen === aliasNorm) return true;

      // Word boundary match if alias is at least 3 chars
      if (cleanAllergen.length >= 3 && aliasNorm.length >= 3) {
        const regex = new RegExp(`\\b${escapeRegExp(aliasNorm)}\\b`, 'i');
        if (regex.test(cleanAllergen)) return true;
        const revRegex = new RegExp(`\\b${escapeRegExp(cleanAllergen)}\\b`, 'i');
        if (revRegex.test(aliasNorm)) return true;
      }
    }

    // Check member drugs
    for (const member of cls.memberDrugs) {
      const memberNorm = normalizeAllergenTerm(member);
      if (cleanAllergen === memberNorm) return true;
      if (cleanAllergen.length >= 4 && memberNorm.length >= 4) {
        const regex = new RegExp(`\\b${escapeRegExp(memberNorm)}\\b`, 'i');
        if (regex.test(cleanAllergen)) return true;
      }
    }

    return false;
  });

  // Check intersection between target drug classes and allergen classes
  for (const drugClass of targetDrugClasses) {
    const classMatched = allergenMappedClasses.some(ac => ac.id === drugClass.id);

    if (classMatched) {
      // Check if patient's allergy was to a specific member drug in the class that differs from target drug
      const isSpecificMemberDrug = drugClass.memberDrugs.some(m => normalizeAllergenTerm(m) === cleanAllergen);
      const isCrossReactivityBetweenDrugs = isSpecificMemberDrug && cleanAllergen !== drugGenClean;

      if (isCrossReactivityBetweenDrugs) {
        return {
          isMatch: true,
          matchType: 'cross_reactivity',
          matchedClass: drugClass,
          message: `Allergy Cross-Reactivity Alert (${allergy.reactionSeverity.toUpperCase()}): Patient has a documented allergy to ${rawAllergen}. ${normalisedDrug} is a member of the same ${drugClass.categoryDisplayName} family. ${drugClass.crossReactivityMechanism}`
        };
      } else {
        return {
          isMatch: true,
          matchType: 'class',
          matchedClass: drugClass,
          message: `Allergy Class Conflict: Patient has a documented ${allergy.reactionSeverity.toUpperCase()} allergy to ${rawAllergen}. ${normalisedDrug} belongs to the ${drugClass.categoryDisplayName} class.`
        };
      }
    }
  }

  // Exact whole-word boundary check on allergenGroup if not covered above
  if (drugGroupClean && drugGroupClean.length >= 3 && cleanAllergen.length >= 3) {
    const groupWordRegex = new RegExp(`\\b${escapeRegExp(cleanAllergen)}\\b`, 'i');
    if (groupWordRegex.test(drugGroupClean)) {
      return {
        isMatch: true,
        matchType: 'class',
        message: `Allergen Group Match: ${normalisedDrug} belongs to the "${registryItem?.allergenGroup}" group, matching patient's documented allergy to ${rawAllergen}.`
      };
    }
  }

  return null;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Duplicate Therapy & Redundancy Detection Engine
 * 
 * Flags:
 * 1. Exact active ingredient duplication (e.g. Lisinopril + Lisinopril)
 * 2. Same-class redundant therapy (e.g. dual NSAIDs, dual ACEi/ARBs, dual sulfonylureas)
 */
export interface DuplicateTherapyAlert {
  type: 'exact' | 'class';
  existingDrug: string;
  className?: string;
  severityLevel: 'moderate' | 'severe';
  message: string;
}

export function checkDuplicateTherapy(
  normalisedDrug: string,
  registryItem: DrugRegistryItem | null,
  activeMedications: Medication[],
  patientID: number
): DuplicateTherapyAlert[] {
  const alerts: DuplicateTherapyAlert[] = [];
  const normLower = normalisedDrug.toLowerCase();

  for (const med of activeMedications) {
    if (med.patientID !== patientID || med.status !== 'active') continue;

    const existingGeneric = (med.normalisedGeneric || med.drugName).toLowerCase();

    // 1. Exact chemical entity duplication
    if (normLower === existingGeneric) {
      alerts.push({
        type: 'exact',
        existingDrug: med.drugName,
        severityLevel: 'severe',
        message: `Duplicate Therapy Alert (Exact Entity): Patient is currently prescribed active ${med.drugName} (${normalisedDrug}). Adding another prescription for ${normalisedDrug} creates a redundant duplicate regimen, risking accidental cumulative overdose and toxicity.`
      });
      continue;
    }

    // 2. Class-level duplication checks
    // Dual NSAIDs (e.g. Ibuprofen + Diclofenac)
    const isTargetNSAID = registryItem?.allergenGroup === 'NSAIDs/Aspirin' || ['ibuprofen', 'diclofenac', 'aspirin'].includes(normLower);
    const isExistingNSAID = ['ibuprofen', 'diclofenac', 'aspirin'].includes(existingGeneric);
    if (isTargetNSAID && isExistingNSAID && normLower !== existingGeneric) {
      alerts.push({
        type: 'class',
        existingDrug: med.drugName,
        className: 'Non-Steroidal Anti-Inflammatory Drugs (NSAIDs)',
        severityLevel: 'severe',
        message: `Duplicate Therapeutic Class Alert (Dual NSAID): ${normalisedDrug} and active ${med.drugName} are both systemic NSAIDs/COX-inhibitors. Concomitant dual NSAID therapy produces no additive therapeutic efficacy but substantially multiplies the risk of severe gastrointestinal ulceration, massive bleeding, and acute renal decompensation.`
      });
    }

    // Dual Sulfonylureas (e.g. Glimepiride + Glibenclamide)
    const sulfonylureas = ['glimepiride', 'glibenclamide'];
    if (sulfonylureas.includes(normLower) && sulfonylureas.includes(existingGeneric) && normLower !== existingGeneric) {
      alerts.push({
        type: 'class',
        existingDrug: med.drugName,
        className: 'Sulfonylurea Insulin Secretagogues',
        severityLevel: 'severe',
        message: `Duplicate Secretagogue Therapy (Dual Sulfonylurea): ${normalisedDrug} and active ${med.drugName} belong to the sulfonylurea class. Concurrent administration provides redundant beta-cell stimulation and severely escalates the hazard of refractory, prolonged hypoglycemia.`
      });
    }

    // Dual RAAS Blockade (ACE inhibitor + ARB)
    const aceInhibitors = ['lisinopril', 'ramipril', 'enalapril'];
    const arbs = ['losartan', 'valsartan', 'candesartan'];
    if (
      (aceInhibitors.includes(normLower) && aceInhibitors.includes(existingGeneric) && normLower !== existingGeneric) ||
      (arbs.includes(normLower) && arbs.includes(existingGeneric) && normLower !== existingGeneric)
    ) {
      alerts.push({
        type: 'class',
        existingDrug: med.drugName,
        className: 'Renin-Angiotensin System Blockers',
        severityLevel: 'severe',
        message: `Duplicate Therapeutic Class Alert: ${normalisedDrug} and active ${med.drugName} represent redundant dual renin-angiotensin system blockade without proven additive cardiovascular mortality benefit, multiplying hyperkalemia and acute kidney injury risk.`
      });
    }

    // Dual Cytidine NRTIs (Lamivudine + Emtricitabine)
    const cytidineNRTIs = ['lamivudine', 'emtricitabine'];
    if (cytidineNRTIs.includes(normLower) && cytidineNRTIs.includes(existingGeneric) && normLower !== existingGeneric) {
      alerts.push({
        type: 'class',
        existingDrug: med.drugName,
        className: 'Cytidine Analog NRTIs',
        severityLevel: 'severe',
        message: `Therapeutic Redundancy & Antagonism: ${normalisedDrug} and active ${med.drugName} are both cytidine analog NRTIs. They compete intracellularly for identical triphosphorylation enzymes with complete clinical antagonism.`
      });
    }

    // Dual Inhaled Corticosteroids (Fluticasone + Budesonide)
    const inhaledSteroids = ['fluticasone', 'budesonide'];
    if (inhaledSteroids.includes(normLower) && inhaledSteroids.includes(existingGeneric) && normLower !== existingGeneric) {
      alerts.push({
        type: 'class',
        existingDrug: med.drugName,
        className: 'Inhaled Corticosteroids (ICS)',
        severityLevel: 'moderate',
        message: `Duplicate Inhaled Corticosteroid Therapy: Patient is already active on ${med.drugName}. Prescribing ${normalisedDrug} simultaneously represents redundant topical steroid therapy.`
      });
    }
  }

  return alerts;
}

/**
 * Clinical Condition Contraindication Matrix
 * Evaluates patient condition tags against the prescribed medication.
 */
export interface ConditionContraindicationAlert {
  condition: string;
  severityLevel: 'moderate' | 'severe';
  mechanism: string;
  message: string;
}

export function checkConditionContraindications(
  normalisedDrug: string,
  conditionTags: string[]
): ConditionContraindicationAlert[] {
  if (!conditionTags || conditionTags.length === 0) return [];

  const alerts: ConditionContraindicationAlert[] = [];
  const drugLower = normalisedDrug.toLowerCase();
  const normalizedTags = conditionTags.map(t => t.trim().toLowerCase());

  const hasCondition = (terms: string[]) => {
    return normalizedTags.some(tag => terms.some(term => tag.includes(term)));
  };

  // 1. ASTHMA / REACTIVE AIRWAYS
  if (hasCondition(['asthma', 'reactive airway', 'copd', 'bronchospasm'])) {
    if (['atenolol'].includes(drugLower)) {
      alerts.push({
        condition: 'Asthma / Reactive Airway Disease',
        severityLevel: 'severe',
        mechanism: 'Beta-Adrenergic Blockade Bronchoconstriction',
        message: `Contraindication Alert (Severe): Atenolol is contraindicated in patients with Asthma. Beta-adrenergic antagonism can trigger life-threatening, acute bronchospasm refractory to rescue beta-2 bronchodilators.`
      });
    }
    if (['aspirin', 'ibuprofen', 'diclofenac'].includes(drugLower)) {
      alerts.push({
        condition: 'Asthma / Reactive Airway Disease',
        severityLevel: 'severe',
        mechanism: 'Aspirin-Exacerbated Respiratory Disease (AERD)',
        message: `Contraindication Warning: ${normalisedDrug} is an NSAID/COX-1 inhibitor. In patients with documented asthma, cyclooxygenase inhibition can shunt arachidonate metabolism toward leukotrienes, precipitating severe acute bronchospasm (AERD).`
      });
    }
  }

  // 2. PEPTIC ULCER DISEASE / GASTROINTESTINAL BLEEDING
  if (hasCondition(['peptic ulcer', 'gastric ulcer', 'pud', 'gi bleed', 'gastritis'])) {
    if (['ibuprofen', 'diclofenac', 'aspirin'].includes(drugLower)) {
      alerts.push({
        condition: 'Peptic Ulcer Disease / GI Bleed',
        severityLevel: 'severe',
        mechanism: 'Inhibition of Cytoprotective Gastric Mucosal Prostaglandins',
        message: `Contraindication Alert (Severe): ${normalisedDrug} is contraindicated in active or recurrent Peptic Ulcer Disease. Inhibition of gastric prostaglandin synthesis markedly increases the risk of ulcer recurrence, perforation, and massive hemorrhage.`
      });
    }
    if (['warfarin', 'clopidogrel'].includes(drugLower)) {
      alerts.push({
        condition: 'Peptic Ulcer Disease / GI Bleed',
        severityLevel: 'severe',
        mechanism: 'Systemic Antithrombotic Hemorrhage Aggravation',
        message: `High Warning Contraindication: ${normalisedDrug} markedly heightens the severity of active or occult gastrointestinal bleeding in patients with documented peptic ulcer disease.`
      });
    }
  }

  // 3. CHRONIC KIDNEY DISEASE / RENAL IMPAIRMENT
  if (hasCondition(['chronic kidney disease', 'ckd', 'renal failure', 'renal impairment', 'nephropathy'])) {
    if (['ibuprofen', 'diclofenac'].includes(drugLower)) {
      alerts.push({
        condition: 'Chronic Kidney Disease (CKD)',
        severityLevel: 'severe',
        mechanism: 'Renal Vasodilatory Prostaglandin Inhibition',
        message: `Nephrotoxic Contraindication (Severe): ${normalisedDrug} blocks renal synthesis of vasodilatory prostaglandins, inducing afferent arteriolar vasoconstriction and acute decline in glomerular filtration rate (GFR).`
      });
    }
    if (['tenofovir disoproxil'].includes(drugLower)) {
      alerts.push({
        condition: 'Chronic Kidney Disease (CKD)',
        severityLevel: 'moderate',
        mechanism: 'Proximal Renal Tubular Accumulation & Nephrotoxicity',
        message: `Clinical Precaution: Tenofovir Disoproxil undergoes active renal tubular clearance. Patients with underlying renal impairment require dose interval adjustment and frequent creatinine/phosphate monitoring.`
      });
    }
    if (['metformin'].includes(drugLower)) {
      alerts.push({
        condition: 'Chronic Kidney Disease (CKD)',
        severityLevel: 'severe',
        mechanism: 'Metformin Accumulation & Fatal Lactic Acidosis',
        message: `Contraindication Alert: Metformin accumulation in moderate-to-severe renal impairment significantly elevates the hazard of life-threatening lactic acidosis.`
      });
    }
  }

  // 4. GOUT / HYPERURICEMIA
  if (hasCondition(['gout', 'hyperuricemia'])) {
    if (['hydrochlorothiazide'].includes(drugLower)) {
      alerts.push({
        condition: 'Gout / Hyperuricemia',
        severityLevel: 'severe',
        mechanism: 'Renal Urate Secretion Competition',
        message: `Contraindication Alert: Hydrochlorothiazide competes with uric acid for proximal renal tubular organic acid transport, elevating serum urate and frequently precipitating acute gout attacks.`
      });
    }
  }

  // 5. HYPERTENSION
  if (hasCondition(['hypertension', 'high blood pressure'])) {
    if (['ibuprofen', 'diclofenac'].includes(drugLower)) {
      alerts.push({
        condition: 'Hypertension',
        severityLevel: 'moderate',
        mechanism: 'Sodium/Fluid Retention & Hemodynamic Antagonism',
        message: `Hemodynamic Warning: Systemic NSAIDs (${normalisedDrug}) cause renal sodium and fluid retention, destabilizing arterial blood pressure and attenuating antihypertensive medications.`
      });
    }
  }

  // 6. TYPE 2 DIABETES
  if (hasCondition(['type 2 diabetes', 'diabetes', 't2d'])) {
    if (['atenolol'].includes(drugLower)) {
      alerts.push({
        condition: 'Type 2 Diabetes',
        severityLevel: 'moderate',
        mechanism: 'Sympathoadrenal Hypoglycemia Masking',
        message: `Precaution Alert: Atenolol masks warning signs of acute hypoglycemia (tremor, tachycardia, palpitations). Patients must be educated to monitor for diaphoresis (sweating).`
      });
    }
  }

  // 7. HEART FAILURE
  if (hasCondition(['heart failure', 'congestive heart failure', 'chf'])) {
    if (['ibuprofen', 'diclofenac'].includes(drugLower)) {
      alerts.push({
        condition: 'Heart Failure',
        severityLevel: 'severe',
        mechanism: 'Renal Sodium Retention & Afterload Increase',
        message: `Contraindication Alert (Severe): NSAIDs (${normalisedDrug}) induce systemic fluid retention and vasoconstriction, triggering acute decompensation of heart failure.`
      });
    }
  }

  // 8. PREGNANCY
  if (hasCondition(['pregnancy', 'pregnant'])) {
    if (['lisinopril', 'losartan', 'atorvastatin', 'warfarin'].includes(drugLower)) {
      alerts.push({
        condition: 'Pregnancy',
        severityLevel: 'severe',
        mechanism: 'Teratogenic / Feto-toxic Organogenesis Damage',
        message: `Absolute Contraindication (Boxed Warning): ${normalisedDrug} is contraindicated in pregnancy due to severe teratogenic hazards and fetal organ toxicity.`
      });
    }
  }

  return alerts;
}
