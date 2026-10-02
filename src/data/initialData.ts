/**
 * Curated Clinical Knowledge Base and Simulated Data
 * Grounded in Section 3.5 (Secondary Data Collection: WHO ATC, BNF, FDA)
 * and Section 3.10 (Evaluation Plan) of Glory Ephraim's research study.
 */

import type {
  DrugRegistryItem,
  InteractionRule,
  Patient,
  MedicalPractitioner,
  Medication,
  Allergy,
  AlertLog,
  Administrator,
  Reminder,
  RefillNotification,
  AuditTrailEntry,
  TAMSurveyResponse,
  TestCase
} from '../types.ts';

/**
 * 25 Reference Medications screened for inclusion per Section 3.5.1
 * Spanning Hypertension, Diabetes, HIV, Asthma + co-prescribed classes
 */
export const INITIAL_DRUG_REGISTRY: DrugRegistryItem[] = [
  // 1. HYPERTENSION
  {
    genericName: 'Lisinopril',
    atcCode: 'C09AA03',
    category: 'hypertension',
    brandNames: ['Zestril', 'Prinivil', 'Lisipril'],
    commonForms: ['10mg Tablet', '20mg Tablet'],
    allergenGroup: 'ACE Inhibitors',
    description: 'Angiotensin-converting enzyme (ACE) inhibitor for hypertension and heart failure.',
    bestTimeToTake: 'Morning (around 08:00) at approximately the same time daily to counteract morning blood pressure surges.',
    foodAdvice: 'Can be taken with or without food. Avoid potassium supplements or salt substitutes containing potassium.',
    clinicalPearl: 'ACE inhibitor with peak hemodynamic effect at 6 hours. Persistent dry cough occurs in 5-20% of patients.',
    pharmacokinetics: {
      halfLife: '12 hours',
      peakPlasmaTime: '6 to 8 hours',
      bioavailability: '~25% (unaffected by food)',
      clearanceRoute: 'Renal (100% eliminated unchanged in urine)',
      metabolism: 'Not metabolized by the liver'
    }
  },
  {
    genericName: 'Amlodipine',
    atcCode: 'C08CA01',
    category: 'hypertension',
    brandNames: ['Norvasc', 'Amlovasc', 'Amlodac'],
    commonForms: ['5mg Tablet', '10mg Tablet'],
    description: 'Dihydropyridine calcium channel blocker for systemic arterial hypertension.',
    bestTimeToTake: 'Morning or evening consistently. Evening dosing may reduce peripheral pedal edema in susceptible patients.',
    foodAdvice: 'Take with or without meals. Avoid large quantities of grapefruit juice (CYP3A4 inhibition).',
    clinicalPearl: 'Very slow onset prevents reflex sympathetic tachycardia. Achieves steady state in 7-8 days.',
    pharmacokinetics: {
      halfLife: '30 to 50 hours (prolonged, allows once-daily dosing)',
      peakPlasmaTime: '6 to 12 hours',
      bioavailability: '64% to 90%',
      clearanceRoute: 'Hepatic metabolism (90%); 10% excreted unchanged in urine',
      metabolism: 'Extensively metabolized by hepatic CYP3A4'
    }
  },
  {
    genericName: 'Losartan',
    atcCode: 'C09CA01',
    category: 'hypertension',
    brandNames: ['Cozaar', 'Losar'],
    commonForms: ['50mg Tablet', '100mg Tablet'],
    allergenGroup: 'Angiotensin Receptor Blockers',
    description: 'Angiotensin II receptor antagonist (ARB) for hypertension.',
    bestTimeToTake: 'Morning or evening at the same time each day to ensure uniform 24-hour blood pressure control.',
    foodAdvice: 'May be taken with food or on an empty stomach. Ensure steady hydration.',
    clinicalPearl: 'Competitive ARB. Does not inhibit bradykinin breakdown, avoiding the dry cough common with ACE inhibitors.',
    pharmacokinetics: {
      halfLife: '2 hours (losartan); 6 to 9 hours (active E-3174 metabolite)',
      peakPlasmaTime: '1 hour (parent drug); 3 to 4 hours (active metabolite)',
      bioavailability: '~33% (first-pass hepatic extraction)',
      clearanceRoute: 'Biliary / fecal (60%) and renal (35%)',
      metabolism: 'Hepatic CYP2C9 and CYP3A4 into potent E-3174 metabolite'
    }
  },
  {
    genericName: 'Hydrochlorothiazide',
    atcCode: 'C03AA03',
    category: 'hypertension',
    brandNames: ['Microzide', 'Esidrix', 'HCTZ'],
    commonForms: ['12.5mg Tablet', '25mg Tablet'],
    allergenGroup: 'Sulfa Drugs',
    description: 'Thiazide diuretic causing natriuresis to reduce intravascular volume.',
    bestTimeToTake: 'Morning (08:00) with breakfast. Strictly avoid evening doses to prevent nocturia and sleep interruption.',
    foodAdvice: 'Take with food to minimize gastric upset. Maintain adequate electrolyte balance.',
    clinicalPearl: 'Inhibits Na+/Cl- cotransporter in distal convoluted tubule. Monitor serum potassium, sodium, and uric acid.',
    pharmacokinetics: {
      halfLife: '6 to 15 hours',
      peakPlasmaTime: '1.5 to 3 hours',
      bioavailability: '65% to 75%',
      clearanceRoute: 'Renal (eliminated >95% unchanged in urine)',
      metabolism: 'Not significantly metabolized'
    }
  },
  {
    genericName: 'Atenolol',
    atcCode: 'C07AB03',
    category: 'hypertension',
    brandNames: ['Tenormin', 'Atenol'],
    commonForms: ['50mg Tablet', '100mg Tablet'],
    allergenGroup: 'Beta Blockers',
    description: 'Cardioselective beta-1 adrenergic antagonist for hypertension and angina.',
    bestTimeToTake: 'Morning with breakfast. Consistent morning dosing protects against morning adrenergic catecholamine surges.',
    foodAdvice: 'Take with water. Avoid co-administering with large volumes of citrus juices which reduce absorption.',
    clinicalPearl: 'Hydrophilic cardioselective beta blocker. Low lipid solubility minimizes sleep disturbances and nightmares.',
    pharmacokinetics: {
      halfLife: '6 to 7 hours',
      peakPlasmaTime: '2 to 4 hours',
      bioavailability: '50% (incomplete gastrointestinal absorption)',
      clearanceRoute: 'Renal (>85% eliminated unchanged)',
      metabolism: 'Minimal hepatic metabolism (<10%)'
    }
  },

  // 2. DIABETES
  {
    genericName: 'Metformin',
    atcCode: 'A10BA02',
    category: 'diabetes',
    brandNames: ['Glucophage', 'Diaformin', 'Fortamet'],
    commonForms: ['500mg Tablet', '850mg Tablet', '1000mg XR'],
    description: 'Biguanide oral hypoglycaemic that reduces hepatic gluconeogenesis.',
    bestTimeToTake: 'With or immediately following meals (breakfast and dinner). Extended-release (XR) once daily with dinner.',
    foodAdvice: 'Always take with food to minimize gastrointestinal upset, nausea, and abdominal cramping.',
    clinicalPearl: 'First-line type 2 diabetes agent. Does not cause hypoglycemia in monotherapy or stimulate insulin secretion.',
    pharmacokinetics: {
      halfLife: '4 to 9 hours (plasma); up to 17.6 hours in erythrocytes',
      peakPlasmaTime: '2.5 hours (immediate release); 7 hours (extended release)',
      bioavailability: '50% to 60% (fasted absorption)',
      clearanceRoute: 'Renal tubular secretion (>90% excreted unchanged)',
      metabolism: 'No hepatic metabolism; no biliary excretion'
    }
  },
  {
    genericName: 'Glimepiride',
    atcCode: 'A10BB12',
    category: 'diabetes',
    brandNames: ['Amaryl', 'Diapride'],
    commonForms: ['1mg Tablet', '2mg Tablet', '4mg Tablet'],
    allergenGroup: 'Sulfa Drugs',
    description: 'Second-generation sulfonylurea stimulating pancreatic beta-cell insulin secretion.',
    bestTimeToTake: 'Immediately before or with the first substantial meal of the day (breakfast). Never take on an empty stomach.',
    foodAdvice: 'Must be accompanied by a meal containing carbohydrates to prevent sudden hypoglycemic episodes.',
    clinicalPearl: 'Stimulates physiological second-phase insulin secretion. Keep emergency fast-acting glucose available.',
    pharmacokinetics: {
      halfLife: '5 to 8 hours (single dose); longer with repeated therapy',
      peakPlasmaTime: '2 to 3 hours',
      bioavailability: '100% complete oral absorption',
      clearanceRoute: 'Renal (60%) and biliary/fecal (40%)',
      metabolism: 'Completely metabolized by hepatic CYP2C9'
    }
  },
  {
    genericName: 'Glibenclamide',
    atcCode: 'A10BB01',
    category: 'diabetes',
    brandNames: ['Daonil', 'Diabeta'],
    commonForms: ['5mg Tablet'],
    allergenGroup: 'Sulfa Drugs',
    description: 'Sulfonylurea insulin secretagogue for type 2 diabetes mellitus.',
    bestTimeToTake: '30 minutes before breakfast or the main morning meal.',
    foodAdvice: 'Follow with food within 30 minutes. Do not skip meals after ingestion.',
    clinicalPearl: 'Long duration of biological action. Higher propensity for prolonged hypoglycemia, especially in older adults.',
    pharmacokinetics: {
      halfLife: '10 hours (biological effect extends up to 24 hours)',
      peakPlasmaTime: '2 to 4 hours',
      bioavailability: '~95% high bioavailability',
      clearanceRoute: 'Equally distributed between bile/feces (50%) and urine (50%)',
      metabolism: 'Hepatic hydroxylation into weakly active metabolites'
    }
  },
  {
    genericName: 'Insulin Glargine',
    atcCode: 'A10AE04',
    category: 'diabetes',
    brandNames: ['Lantus', 'Basaglar', 'Toujeo'],
    commonForms: ['100 units/mL Pen', 'Vial'],
    description: 'Long-acting basal human insulin analog providing 24-hour glycemic control.',
    bestTimeToTake: 'Once daily at the exact same hour every day (typically at bedtime ~21:00 or every morning at 08:00).',
    foodAdvice: 'Does not require immediate food consumption due to peakless profile, but maintain consistent dietary schedules.',
    clinicalPearl: 'Acidic formulation (pH 4.0) precipitates into slow-dissolving subcutaneous microprecipitates. Never mix with other insulins.',
    pharmacokinetics: {
      halfLife: 'Gradual sustained depot release across 24 hours',
      peakPlasmaTime: 'Peakless steady-state concentration',
      bioavailability: 'Subcutaneous depot micro-precipitation',
      clearanceRoute: 'Metabolized into active M1 and M2 moieties, followed by cellular catabolism',
      metabolism: 'Partial enzymatic cleavage at beta-chain carboxyl terminus'
    }
  },
  {
    genericName: 'Empagliflozin',
    atcCode: 'A10BK03',
    category: 'diabetes',
    brandNames: ['Jardiance'],
    commonForms: ['10mg Tablet', '25mg Tablet'],
    description: 'Sodium-glucose co-transporter 2 (SGLT2) inhibitor reducing renal glucose reabsorption.',
    bestTimeToTake: 'Morning with or without food. Morning dosing aligns with active daytime fluid intake and prevents nocturia.',
    foodAdvice: 'Can be taken with or without meals. Drink ample water (1.5-2L daily) to prevent volume depletion.',
    clinicalPearl: 'SGLT2 inhibitor. Induces glucosuria (~78g/day), providing proven renal and cardiovascular mortality reduction.',
    pharmacokinetics: {
      halfLife: '12.4 hours',
      peakPlasmaTime: '1.5 hours',
      bioavailability: '~75% high oral absorption',
      clearanceRoute: 'Renal (54%) and fecal (41%)',
      metabolism: 'Hepatic glucuronidation via UGT2B7, UGT1A3, UGT1A8, UGT1A9'
    }
  },

  // 3. HIV MANAGEMENT (ART)
  {
    genericName: 'Tenofovir Disoproxil',
    atcCode: 'J05AF07',
    category: 'hiv',
    brandNames: ['Viread', 'Ricovir'],
    commonForms: ['300mg Tablet'],
    description: 'Nucleotide reverse transcriptase inhibitor (NRTI) backbone in antiretroviral therapy.',
    bestTimeToTake: 'Once daily with a meal or light snack at the same hour every day to support viral suppression.',
    foodAdvice: 'Administration with a meal increases oral bioavailability by approximately 40%.',
    clinicalPearl: 'Nucleotide analog prodrug. Monitor baseline and serial renal function (eGFR) and serum phosphate levels.',
    pharmacokinetics: {
      halfLife: '17 hours (plasma); intracellular tenofovir diphosphate >60 hours',
      peakPlasmaTime: '1 hour (fasted); 2 hours (fed)',
      bioavailability: '25% (fasted) to 39% (with meal)',
      clearanceRoute: 'Active renal tubular secretion and glomerular filtration (>70% in urine)',
      metabolism: 'Prodrug diester hydrolysis to tenofovir, phosphorylated intracellularly'
    }
  },
  {
    genericName: 'Lamivudine',
    atcCode: 'J05AF05',
    category: 'hiv',
    brandNames: ['Epivir', '3TC'],
    commonForms: ['150mg Tablet', '300mg Tablet'],
    description: 'Cytidine analog reverse transcriptase inhibitor for HIV and Hepatitis B.',
    bestTimeToTake: 'Morning and evening or once daily, co-timed with combined ART regimen partners.',
    foodAdvice: 'May be taken with or without food. Food does not impair the extent of absorption.',
    clinicalPearl: 'Cytidine NRTI with excellent clinical tolerability and minimal metabolic drug-drug interactions.',
    pharmacokinetics: {
      halfLife: '5 to 7 hours (plasma); intracellular triphosphate 16-19 hours',
      peakPlasmaTime: '1 hour',
      bioavailability: '80% to 85%',
      clearanceRoute: 'Renal tubular excretion unchanged (>70%)',
      metabolism: 'Minimal hepatic metabolism (<10%)'
    }
  },
  {
    genericName: 'Dolutegravir',
    atcCode: 'J05AJ03',
    category: 'hiv',
    brandNames: ['Tivicay'],
    commonForms: ['50mg Tablet'],
    description: 'Integrase strand transfer inhibitor (INSTI) with high genetic barrier to resistance.',
    bestTimeToTake: 'Once daily at any set hour. If taking calcium, magnesium, or iron antacids, dose 2h before or 6h after.',
    foodAdvice: 'Take with or without food. Take with meals if treating viral strains with documented integrase resistance.',
    clinicalPearl: 'Second-generation INSTI. Chelates polyvalent cations (Ca2+, Mg2+, Fe2+, Al3+); avoid simultaneous antacids.',
    pharmacokinetics: {
      halfLife: '14 hours',
      peakPlasmaTime: '2 to 3 hours',
      bioavailability: '>80% high bioavailability',
      clearanceRoute: 'Fecal excretion (53%) and renal excretion (31%)',
      metabolism: 'Hepatic glucuronidation via UGT1A1 with minor CYP3A4 contribution'
    }
  },
  {
    genericName: 'Efavirenz',
    atcCode: 'J05AG03',
    category: 'hiv',
    brandNames: ['Sustiva', 'Stocrin'],
    commonForms: ['600mg Tablet'],
    description: 'Non-nucleoside reverse transcriptase inhibitor (NNRTI) for combination ART.',
    bestTimeToTake: 'At bedtime on an empty stomach. Bedtime dosing diminishes daytime dizziness, ataxia, and drowsiness.',
    foodAdvice: 'Do NOT take with high-fat meals, which increase absorption by 50% and aggravate CNS toxicities.',
    clinicalPearl: 'NNRTI. CNS side effects (dizziness, vivid nightmares, impaired concentration) typically improve after 2-4 weeks.',
    pharmacokinetics: {
      halfLife: '40 to 55 hours (terminal elimination)',
      peakPlasmaTime: '3 to 5 hours',
      bioavailability: '40% to 45%',
      clearanceRoute: 'Biliary / fecal (16-61%) and renal (14-34%)',
      metabolism: 'Hepatic CYP2B6 and CYP3A4 auto-induction'
    }
  },
  {
    genericName: 'Emtricitabine',
    atcCode: 'J05AF09',
    category: 'hiv',
    brandNames: ['Emtriva', 'FTC'],
    commonForms: ['200mg Capsule'],
    description: 'Synthetic nucleoside analog of cytidine active against HIV-1 reverse transcriptase.',
    bestTimeToTake: 'Once daily alongside Tenofovir or Dolutegravir as part of fixed-dose combination therapy.',
    foodAdvice: 'Can be taken with or without food.',
    clinicalPearl: 'Fluorinated cytidine analog. Provides synergistic suppression when paired with tenofovir prodrugs.',
    pharmacokinetics: {
      halfLife: '10 hours (plasma); intracellular active triphosphate >20 hours',
      peakPlasmaTime: '1 to 2 hours',
      bioavailability: '93% high bioavailability',
      clearanceRoute: 'Renal (86% eliminated unchanged in urine)',
      metabolism: 'Modest oxidation and glucuronidation (<14%)'
    }
  },

  // 4. ASTHMA / RESPIRATORY
  {
    genericName: 'Salbutamol',
    atcCode: 'R03AC02',
    category: 'asthma',
    brandNames: ['Ventolin', 'Proventil', 'Albuterol', 'Asthalin'],
    commonForms: ['100mcg Inhaler', 'Nebules 2.5mg'],
    description: 'Short-acting selective beta-2 adrenergic agonist bronchodilator for acute bronchospasm.',
    bestTimeToTake: 'As needed (PRN) for acute wheezing or breathlessness, or 15-30 minutes before anticipated exercise.',
    foodAdvice: 'Inhaled administration is unaffected by meals. Rinse mouth with water after use.',
    clinicalPearl: 'Short-acting rescue bronchodilator. Rapid onset within 5 minutes. Use of >2 canisters/year indicates poor asthma control.',
    pharmacokinetics: {
      halfLife: '3.8 to 5 hours',
      peakPlasmaTime: 'Rapid bronchodilation onset in 5 to 15 minutes; peak effect in 1 hour',
      bioavailability: '10% to 20% systemic absorption from pulmonary/swallowed fraction',
      clearanceRoute: 'Renal excretion of sulfate conjugates and unchanged drug',
      metabolism: 'Hepatic sulfotransferase to inactive 4-O-sulfate'
    }
  },
  {
    genericName: 'Fluticasone',
    atcCode: 'R03BA05',
    category: 'asthma',
    brandNames: ['Flixotide', 'Flovent'],
    commonForms: ['125mcg Inhaler', '250mcg Inhaler'],
    description: 'Inhaled synthetic trifluorinated corticosteroid for persistent asthma maintenance.',
    bestTimeToTake: 'Morning and evening every day, ideally immediately prior to brushing teeth.',
    foodAdvice: 'Always rinse mouth and gargle with water, spitting it out, after each dose to prevent oral candidiasis (thrush).',
    clinicalPearl: 'Maintenance controller. High topical anti-inflammatory potency with minimal systemic cortisol suppression.',
    pharmacokinetics: {
      halfLife: '7.8 to 14.4 hours',
      peakPlasmaTime: '1 to 2 hours (systemic peak); clinical anti-inflammatory benefit takes 1-2 weeks',
      bioavailability: '<1% systemic bioavailability for swallowed portion due to 99% first-pass hepatic extraction',
      clearanceRoute: 'Biliary / fecal (>95%)',
      metabolism: 'Extensive hepatic CYP3A4 to inactive 17-beta-carboxylic acid'
    }
  },
  {
    genericName: 'Budesonide',
    atcCode: 'R03BA02',
    category: 'asthma',
    brandNames: ['Pulmicort', 'Budecort'],
    commonForms: ['200mcg Turbuhaler', 'Nebulising suspension'],
    description: 'Glucocorticoid with potent local anti-inflammatory action in bronchial mucosa.',
    bestTimeToTake: 'Twice daily (morning and evening). Regular dosing maintains steady local mucosal anti-inflammatory coverage.',
    foodAdvice: 'Rinse mouth thoroughly with water and spit out after inhalation to avoid hoarseness (dysphonia) and thrush.',
    clinicalPearl: 'Airway-selective ICS. Rapidly undergoes reversible fatty acid conjugation inside airway tissues for prolonged retention.',
    pharmacokinetics: {
      halfLife: '2 to 3 hours',
      peakPlasmaTime: '15 to 45 minutes (pulmonary absorption)',
      bioavailability: '~10% from inhalation; 90% first-pass hepatic inactivation of swallowed fraction',
      clearanceRoute: 'Renal (60%) and fecal metabolites',
      metabolism: 'Rapid hepatic clearance via CYP3A4 into 16-alpha-hydroxyprednisolone'
    }
  },
  {
    genericName: 'Montelukast',
    atcCode: 'R03DC03',
    category: 'asthma',
    brandNames: ['Singulair', 'Montair'],
    commonForms: ['10mg Tablet', '4mg Chewable'],
    description: 'Cysteinyl leukotriene receptor antagonist inhibiting bronchoconstriction.',
    bestTimeToTake: 'In the evening (around 20:00 - 21:00) before sleep. Aligns with nocturnal circadian peaks in leukotriene-mediated bronchoconstriction.',
    foodAdvice: 'May be taken with or without food. Swallow tablets whole with water.',
    clinicalPearl: 'Leukotriene receptor antagonist. Effective for exercise-induced bronchospasm and allergic rhinitis.',
    pharmacokinetics: {
      halfLife: '2.7 to 5.5 hours',
      peakPlasmaTime: '3 to 4 hours (10mg film-coated tablet)',
      bioavailability: '64%',
      clearanceRoute: 'Biliary / fecal excretion (>86%); renal (<0.2%)',
      metabolism: 'Extensively metabolized by hepatic CYP2C8, CYP3A4, and CYP2C9'
    }
  },
  {
    genericName: 'Ipratropium',
    atcCode: 'R03BB01',
    category: 'asthma',
    brandNames: ['Atrovent'],
    commonForms: ['20mcg Inhaler', '500mcg Nebule'],
    description: 'Anticholinergic bronchodilator inhibiting vagally mediated bronchomotor tone.',
    bestTimeToTake: 'Every 6 to 8 hours as prescribed. Avoid spraying mist near eyes to prevent accidental pupillary dilation.',
    foodAdvice: 'Unaffected by meals.',
    clinicalPearl: 'Short-acting muscarinic antagonist (SAMA). Produces additive bronchodilation when co-administered with beta agonists.',
    pharmacokinetics: {
      halfLife: '1.6 to 2 hours',
      peakPlasmaTime: 'Onset in 15 minutes; peak effect in 1 to 2 hours',
      bioavailability: 'Negligible systemic absorption (<2%)',
      clearanceRoute: 'Renal and fecal excretion of hydrolyzed ester metabolites',
      metabolism: 'Enzymatic hydrolysis of ester bonds to inactive tropic acid'
    }
  },

  // 5. COMMONLY CO-PRESCRIBED (Analgesics, Antibiotics, Anticoagulants, Statins, Gastroprotectants)
  {
    genericName: 'Aspirin',
    atcCode: 'B01AC06',
    category: 'general',
    brandNames: ['Disprin', 'Bayer', 'Vasoprin', 'Ecotrin'],
    commonForms: ['75mg Tablet', '100mg Tablet', '300mg Tablet'],
    allergenGroup: 'NSAIDs/Aspirin',
    description: 'Irreversible platelet cyclo-oxygenase inhibitor with anti-thrombotic and analgesic action.',
    bestTimeToTake: 'Morning with breakfast, or once daily in the evening with food for cardiovascular prophylaxis.',
    foodAdvice: 'Always take with food or milk and a full glass of water to protect gastric mucosa against direct contact irritation.',
    clinicalPearl: 'Irreversible COX-1 inhibition. Antiplatelet effect lasts for the entire 7-10 day circulating lifespan of the platelet.',
    pharmacokinetics: {
      halfLife: '15 to 20 minutes (aspirin); 2 to 3 hours (salicylic acid at low cardioprotective doses)',
      peakPlasmaTime: '1 to 2 hours (plain); 3 to 4 hours (enteric-coated)',
      bioavailability: '50% to 70% (rapid deacetylation in gut wall and liver)',
      clearanceRoute: 'Renal excretion of salicylate and glycine conjugates',
      metabolism: 'Hydrolyzed in GI mucosa and liver to salicylic acid, then conjugated'
    }
  },
  {
    genericName: 'Ibuprofen',
    atcCode: 'M01AE01',
    category: 'general',
    brandNames: ['Advil', 'Motrin', 'Brufen', 'Nurofen'],
    commonForms: ['200mg Tablet', '400mg Tablet'],
    allergenGroup: 'NSAIDs/Aspirin',
    description: 'Non-steroidal anti-inflammatory drug (NSAID) inhibiting COX-1 and COX-2 enzymes.',
    bestTimeToTake: 'With or immediately after meals. Use the lowest effective dose for the shortest duration.',
    foodAdvice: 'Always take with food, milk, or a snack to prevent gastrointestinal dyspepsia, erosion, and bleeding.',
    clinicalPearl: 'Reversible non-selective NSAID. Antagonizes aspirin antiplatelet effect; take aspirin at least 30 min before ibuprofen.',
    pharmacokinetics: {
      halfLife: '1.8 to 2 hours',
      peakPlasmaTime: '1 to 2 hours (fasted: 45 min)',
      bioavailability: '80% to 100%',
      clearanceRoute: 'Renal excretion of inactive glucuronide conjugates (90%)',
      metabolism: 'Hepatic CYP2C9 oxidation to hydroxylated and carboxylated metabolites'
    }
  },
  {
    genericName: 'Diclofenac',
    atcCode: 'M01AB05',
    category: 'general',
    brandNames: ['Voltaren', 'Cataflam', 'Diclogesic'],
    commonForms: ['50mg Tablet', '75mg SR Tablet'],
    allergenGroup: 'NSAIDs/Aspirin',
    description: 'Potent non-steroidal anti-inflammatory and analgesic agent.',
    bestTimeToTake: 'With or immediately after food. For twice-daily dosing, take at breakfast and dinner.',
    foodAdvice: 'Always take with meals. Swallow enteric-coated tablets whole; do not break or chew.',
    clinicalPearl: 'Potent analgesic with high synovial fluid penetration. Highest cardiovascular thrombotic risk among traditional NSAIDs.',
    pharmacokinetics: {
      halfLife: '1 to 2 hours (accumulates and persists in joint synovial fluid for >11 hours)',
      peakPlasmaTime: '2 hours',
      bioavailability: '50% (due to first-pass metabolism)',
      clearanceRoute: 'Renal (65%) and biliary/fecal (35%)',
      metabolism: 'Hepatic CYP2C9 hydroxylation and glucuronidation'
    }
  },
  {
    genericName: 'Paracetamol',
    atcCode: 'N02BE01',
    category: 'general',
    brandNames: ['Panadol', 'Tylenol', 'Calpol'],
    commonForms: ['500mg Tablet', '1000mg Tablet'],
    description: 'Centrally acting analgesic and antipyretic lacking peripheral anti-inflammatory action.',
    bestTimeToTake: 'Every 4 to 6 hours as needed for pain or fever. Space doses at least 4 hours apart.',
    foodAdvice: 'Can be taken with or without food. Fasted state yields faster gastric emptying and quicker pain relief.',
    clinicalPearl: 'Maximum daily dose is 4000mg (4g) across all sources. Caution in chronic alcohol use or malnutrition.',
    pharmacokinetics: {
      halfLife: '2 to 3 hours',
      peakPlasmaTime: '30 to 60 minutes',
      bioavailability: '63% to 89%',
      clearanceRoute: 'Renal (mostly as glucuronide and sulfate conjugates)',
      metabolism: 'Hepatic glucuronidation (60%), sulfation (30%), and CYP2E1 (<10% to reactive toxic NAPQI)'
    }
  },
  {
    genericName: 'Warfarin',
    atcCode: 'B01AA03',
    category: 'general',
    brandNames: ['Coumadin', 'Jantoven', 'Marevan'],
    commonForms: ['1mg Tablet', '2.5mg Tablet', '5mg Tablet'],
    description: 'Vitamin K epoxide reductase antagonist anticoagulant requiring narrow therapeutic monitoring.',
    bestTimeToTake: 'Once daily in the evening (around 18:00) at the same time each day, with or without food.',
    foodAdvice: 'Maintain a stable, consistent dietary intake of vitamin K (spinach, kale, collard greens, broccoli).',
    clinicalPearl: 'Narrow therapeutic index. Anticoagulant effect peaks 72-96 hours post-dose. Monitor International Normalized Ratio (INR).',
    pharmacokinetics: {
      halfLife: '20 to 60 hours (mean 40 hours)',
      peakPlasmaTime: '2 to 8 hours (anticoagulant effect delayed 24-72 hours)',
      bioavailability: '>95% complete oral absorption',
      clearanceRoute: 'Renal elimination of inactive metabolites',
      metabolism: 'Stereoselective hepatic metabolism (S-warfarin via CYP2C9; R-warfarin via CYP1A2, CYP3A4)'
    }
  },
  {
    genericName: 'Clopidogrel',
    atcCode: 'B01AC04',
    category: 'general',
    brandNames: ['Plavix', 'Clopilet'],
    commonForms: ['75mg Tablet'],
    description: 'Thienopyridine class P2Y12 adenosine diphosphate receptor inhibitor.',
    bestTimeToTake: 'Once daily at the same time each day (morning or evening), with or without food.',
    foodAdvice: 'Can be taken with or without meals. Avoid omeprazole/esomeprazole which inhibit CYP2C19 bioactivation.',
    clinicalPearl: 'Prodrug requiring two-step hepatic bioactivation. CYP2C19 poor metabolizers experience reduced platelet inhibition.',
    pharmacokinetics: {
      halfLife: '6 hours (parent clopidogrel); active thiol metabolite: 30 minutes',
      peakPlasmaTime: '45 to 60 minutes',
      bioavailability: 'Prodrug; ~50% absorbed',
      clearanceRoute: 'Renal (50%) and fecal (46%)',
      metabolism: 'Two-step hepatic bioactivation via CYP2C19, CYP1A2, CYP2B6 into active thiol metabolite'
    }
  },
  {
    genericName: 'Amoxicillin',
    atcCode: 'J01CA04',
    category: 'general',
    brandNames: ['Amoxil', 'Augmentin', 'Clavam'],
    commonForms: ['250mg Capsule', '500mg Capsule'],
    allergenGroup: 'Penicillins',
    description: 'Broad-spectrum bactericidal beta-lactam aminopenicillin.',
    bestTimeToTake: 'Evenly spaced intervals (every 8 hours or every 12 hours) throughout the day to keep drug levels above MIC.',
    foodAdvice: 'Can be taken with or without food. Taking with meals reduces gastrointestinal discomfort.',
    clinicalPearl: 'Time-dependent bactericidal beta-lactam. Complete the full prescribed antibiotic course to avoid resistance.',
    pharmacokinetics: {
      halfLife: '1 to 1.5 hours',
      peakPlasmaTime: '1 to 2 hours',
      bioavailability: '74% to 92% (superior acid stability compared to ampicillin)',
      clearanceRoute: 'Renal (60% to 70% excreted unchanged in urine)',
      metabolism: 'Modest hepatic cleavage to penicilloic acid (<20%)'
    }
  },
  {
    genericName: 'Ciprofloxacin',
    atcCode: 'J01MA02',
    category: 'general',
    brandNames: ['Cipro', 'Ciprobay', 'Cifran'],
    commonForms: ['250mg Tablet', '500mg Tablet'],
    allergenGroup: 'Fluoroquinolones',
    description: 'Fluoroquinolone antibiotic inhibiting bacterial DNA gyrase and topoisomerase IV.',
    bestTimeToTake: 'Twice daily every 12 hours. Drink a full glass of water with each dose to prevent crystalluria.',
    foodAdvice: 'Do NOT take simultaneously with calcium-rich dairy products (milk, yogurt) or mineral antacids. Separate by 2 hours.',
    clinicalPearl: 'Fluoroquinolone. Polyvalent cations (Ca, Mg, Al, Fe) chelate the drug and abort absorption. Warn patient of tendon pain.',
    pharmacokinetics: {
      halfLife: '4 hours',
      peakPlasmaTime: '1 to 2 hours',
      bioavailability: '70% to 80%',
      clearanceRoute: 'Renal tubular secretion and filtration (40-50% unchanged) + biliary/fecal (20-35%)',
      metabolism: 'Hepatic conversion into 4 active metabolites (15%)'
    }
  },
  {
    genericName: 'Atorvastatin',
    atcCode: 'C10AA05',
    category: 'general',
    brandNames: ['Lipitor', 'Atorlip', 'Storvas'],
    commonForms: ['10mg Tablet', '20mg Tablet', '40mg Tablet'],
    allergenGroup: 'Statins',
    description: 'Competitive HMG-CoA reductase inhibitor lowering plasma LDL cholesterol.',
    bestTimeToTake: 'Once daily in the evening (20:00 - 22:00) when hepatic cholesterol biosynthesis reaches its circadian peak.',
    foodAdvice: 'Can be taken with or without food. Avoid drinking large quantities of grapefruit juice (>1L/day).',
    clinicalPearl: 'Long effective half-life (20-30 hours including active metabolites). Promptly evaluate any unexplained muscle pain.',
    pharmacokinetics: {
      halfLife: '14 hours (active inhibitory metabolites extend functional half-life to 20-30 hours)',
      peakPlasmaTime: '1 to 2 hours',
      bioavailability: '14% (extensive first-pass hepatic extraction)',
      clearanceRoute: 'Biliary and fecal excretion (>98%); renal (<2%)',
      metabolism: 'Extensively metabolized by hepatic CYP3A4 into active ortho- and parahydroxylated metabolites'
    }
  },
  {
    genericName: 'Omeprazole',
    atcCode: 'A02BC01',
    category: 'general',
    brandNames: ['Prilosec', 'Losec', 'Omez'],
    commonForms: ['20mg Capsule', '40mg Capsule'],
    description: 'Substituted benzimidazole proton pump inhibitor suppressing gastric acid secretion.',
    bestTimeToTake: 'First thing in the morning, 30 to 60 minutes BEFORE breakfast. Active proton pumps are best inhibited when stimulated by a meal.',
    foodAdvice: 'Take on an empty stomach 30-60 minutes before food with water. Swallow capsule whole; do not chew or crush pellets.',
    clinicalPearl: 'PPI prodrug. Irreversibly binds active H+/K+-ATPase pumps. Full antisecretory efficacy builds over 3-5 days of daily dosing.',
    pharmacokinetics: {
      halfLife: '0.5 to 1 hour (acid suppression lasts 24 to 72 hours due to covalent H+/K+-ATPase binding)',
      peakPlasmaTime: '0.5 to 3.5 hours',
      bioavailability: '30% to 40% (increases to 65% with repeated daily dosing)',
      clearanceRoute: 'Renal excretion of inactive metabolites (80%) and fecal (20%)',
      metabolism: 'Completely metabolized by CYP2C19 and CYP3A4'
    }
  }
];

/**
 * 20 Well-Documented Drug-Drug Interaction Rules
 * Sourced from BNF 85 Appendix 1, FDA Drug Safety Label Warnings, and WHO ATC guidelines (Section 3.5.1)
 */
export const INITIAL_INTERACTION_RULES: InteractionRule[] = [
  {
    ruleID: 101,
    drugA: 'Warfarin',
    drugB: 'Ibuprofen',
    severityLevel: 'severe',
    clinicalEffect: 'Major haemorrhagic risk. Concurrent NSAID use causes gastric erosion and inhibits platelet aggregation, multiplying the anticoagulant effect of warfarin.',
    sourceReference: 'British National Formulary 85 (Appendix 1) & FDA Boxed Warning',
    versionDate: '2024-01-15',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-07-02T10:00:00Z'
  },
  {
    ruleID: 102,
    drugA: 'Warfarin',
    drugB: 'Aspirin',
    severityLevel: 'severe',
    clinicalEffect: 'Severe bleeding risk. Synergistic anticoagulation with antiplatelet therapy markedly increases major gastrointestinal and intracerebral hemorrhage risk.',
    sourceReference: 'British National Formulary 85 (Appendix 1, Anticoagulant Warnings)',
    versionDate: '2024-01-15',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-07-02T10:00:00Z'
  },
  {
    ruleID: 103,
    drugA: 'Lisinopril',
    drugB: 'Losartan',
    severityLevel: 'severe',
    clinicalEffect: 'Dual renin-angiotensin-aldosterone system (RAAS) blockade. Marked elevation of hyperkalaemia risk, syncope, and acute kidney failure without added clinical benefit.',
    sourceReference: 'FDA Safety Announcement on Dual RAAS Blockade (ONTARGET/ALTITUDE)',
    versionDate: '2023-11-20',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-07-02T10:00:00Z'
  },
  {
    ruleID: 104,
    drugA: 'Lisinopril',
    drugB: 'Ibuprofen',
    severityLevel: 'moderate',
    clinicalEffect: 'NSAIDs attenuate the antihypertensive and renal vasodilatory effect of ACE inhibitors. Risk of acute deterioration in renal function, particularly in dehydrated patients.',
    sourceReference: 'British National Formulary 85 (Appendix 1: ACE Inhibitors)',
    versionDate: '2024-02-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-07-02T10:00:00Z'
  },
  {
    ruleID: 105,
    drugA: 'Lisinopril',
    drugB: 'Diclofenac',
    severityLevel: 'moderate',
    clinicalEffect: 'Reduced antihypertensive response and increased nephrotoxicity. NSAID inhibition of renal prostaglandin synthesis triggers afferent arteriolar vasoconstriction.',
    sourceReference: 'British National Formulary 85 (Appendix 1)',
    versionDate: '2024-02-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-07-02T10:00:00Z'
  },
  {
    ruleID: 106,
    drugA: 'Tenofovir Disoproxil',
    drugB: 'Diclofenac',
    severityLevel: 'severe',
    clinicalEffect: 'Synergistic nephrotoxicity. Co-administration precipitates acute tubular necrosis and Fanconi-like syndrome in patients on tenofovir-based ART.',
    sourceReference: 'WHO Consolidated Guidelines on HIV Prevention and Treatment (Annex 4)',
    versionDate: '2023-09-12',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-07-02T10:00:00Z'
  },
  {
    ruleID: 107,
    drugA: 'Tenofovir Disoproxil',
    drugB: 'Ibuprofen',
    severityLevel: 'severe',
    clinicalEffect: 'Additive nephrotoxic insult. Chronic or high-dose NSAID exposure impairs tenofovir renal clearance, inducing serum creatinine elevation.',
    sourceReference: 'WHO Consolidated Guidelines on HIV (Annex 4) & Gilead Viread Prescribing Info',
    versionDate: '2023-09-12',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-07-02T10:00:00Z'
  },
  {
    ruleID: 108,
    drugA: 'Dolutegravir',
    drugB: 'Metformin',
    severityLevel: 'moderate',
    clinicalEffect: 'Dolutegravir inhibits renal organic cation transporter 2 (OCT2) and MATE1, increasing metformin plasma concentration up to two-fold. Monitor for hypoglycemia and lactic acidosis.',
    sourceReference: 'FDA Tivicay Clinical Pharmacology Guidance & BNF 85',
    versionDate: '2023-08-18',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-07-02T10:00:00Z'
  },
  {
    ruleID: 109,
    drugA: 'Clopidogrel',
    drugB: 'Omeprazole',
    severityLevel: 'moderate',
    clinicalEffect: 'Omeprazole is a competitive inhibitor of CYP2C19, reducing conversion of clopidogrel to its active metabolite and diminishing antiplatelet efficacy.',
    sourceReference: 'FDA Drug Safety Communication: Clopidogrel and Omeprazole Interaction',
    versionDate: '2022-10-05',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-07-02T10:00:00Z'
  },
  {
    ruleID: 110,
    drugA: 'Salbutamol',
    drugB: 'Atenolol',
    severityLevel: 'severe',
    clinicalEffect: 'Pharmacological antagonism. Beta-blockers can cause severe, potentially fatal bronchospasm in asthmatic patients, directly neutralizing beta-2 agonist bronchodilation.',
    sourceReference: 'British National Formulary 85 (Appendix 1: Beta-blockers in Asthma)',
    versionDate: '2024-03-01',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-07-02T10:00:00Z'
  },
  {
    ruleID: 111,
    drugA: 'Aspirin',
    drugB: 'Ibuprofen',
    severityLevel: 'moderate',
    clinicalEffect: 'Ibuprofen competitively interferes with low-dose aspirin binding to platelet COX-1, attenuating aspirin\'s irreversible cardioprotective antiplatelet effect.',
    sourceReference: 'FDA Science Paper on Concomitant Use of Ibuprofen and Aspirin',
    versionDate: '2023-04-14',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-07-02T10:00:00Z'
  },
  {
    ruleID: 112,
    drugA: 'Atorvastatin',
    drugB: 'Ciprofloxacin',
    severityLevel: 'moderate',
    clinicalEffect: 'CYP3A4 inhibition by ciprofloxacin moderately increases atorvastatin serum levels, heightening the risk of myopathy and rhabdomyolysis.',
    sourceReference: 'British National Formulary 85 (Statins & Antibacterials)',
    versionDate: '2023-06-20',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-07-02T10:00:00Z'
  },
  {
    ruleID: 113,
    drugA: 'Amlodipine',
    drugB: 'Atenolol',
    severityLevel: 'moderate',
    clinicalEffect: 'Additive negative inotropic and chronotropic effects. Exaggerated hypotensive response and potential for profound bradycardia.',
    sourceReference: 'British National Formulary 85 (Appendix 1: Calcium-channel Blockers)',
    versionDate: '2023-11-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-07-02T10:00:00Z'
  },
  {
    ruleID: 114,
    drugA: 'Paracetamol',
    drugB: 'Warfarin',
    severityLevel: 'moderate',
    clinicalEffect: 'Prolonged regular administration of paracetamol (>2g/day for >3 days) enhances the anticoagulant action of warfarin, raising INR.',
    sourceReference: 'British National Formulary 85 (Coumarins & Paracetamol)',
    versionDate: '2024-02-01',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-07-02T10:00:00Z'
  },
  {
    ruleID: 115,
    drugA: 'Efavirenz',
    drugB: 'Atorvastatin',
    severityLevel: 'moderate',
    clinicalEffect: 'Efavirenz induces hepatic CYP3A4, substantially reducing atorvastatin area-under-the-curve (AUC) by ~40-50%, risking loss of lipid control.',
    sourceReference: 'WHO ART Clinical Guidelines & Sustiva Prescribing Information',
    versionDate: '2023-05-19',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-07-02T10:00:00Z'
  },
  {
    ruleID: 116,
    drugA: 'Hydrochlorothiazide',
    drugB: 'Ibuprofen',
    severityLevel: 'moderate',
    clinicalEffect: 'NSAIDs counteract thiazide diuretic efficacy by inhibiting renal prostaglandins, precipitating fluid retention and blood pressure rebound.',
    sourceReference: 'British National Formulary 85 (Diuretics & NSAIDs)',
    versionDate: '2023-10-11',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-07-02T10:00:00Z'
  },
  {
    ruleID: 117,
    drugA: 'Metformin',
    drugB: 'Ciprofloxacin',
    severityLevel: 'moderate',
    clinicalEffect: 'Fluoroquinolones may dysregulate blood glucose homeostasis, causing sudden severe hypoglycemia or hyperglycemia in diabetic patients.',
    sourceReference: 'FDA Drug Safety Communication: Fluoroquinolone Hypoglycemia Alerts',
    versionDate: '2022-12-08',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-07-02T10:00:00Z'
  },
  {
    ruleID: 118,
    drugA: 'Glimepiride',
    drugB: 'Ciprofloxacin',
    severityLevel: 'severe',
    clinicalEffect: 'Ciprofloxacin potentiates sulfonylurea action by displacing it from plasma proteins and inhibiting clearance, triggering refractory profound hypoglycemia.',
    sourceReference: 'FDA Safety Alert & British National Formulary 85',
    versionDate: '2023-01-25',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-07-02T10:00:00Z'
  },
  {
    ruleID: 119,
    drugA: 'Warfarin',
    drugB: 'Ciprofloxacin',
    severityLevel: 'severe',
    clinicalEffect: 'Ciprofloxacin inhibits CYP1A2 and CYP3A4, markedly reducing warfarin clearance and disrupting gut vitamin K flora, causing acute INR spikes and severe hemorrhage.',
    sourceReference: 'British National Formulary 85 & Coumadin US Prescribing Information',
    versionDate: '2024-01-05',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-07-02T10:00:00Z'
  },
  {
    ruleID: 120,
    drugA: 'Empagliflozin',
    drugB: 'Hydrochlorothiazide',
    severityLevel: 'moderate',
    clinicalEffect: 'Additive osmotic diuresis. Increases risk of excessive volume depletion, symptomatic orthostatic hypotension, and hemoconcentration.',
    sourceReference: 'FDA Jardiance Prescribing Information & European Medicines Agency (EMA)',
    versionDate: '2023-07-14',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-07-02T10:00:00Z'
  },
  {
    ruleID: 121,
    drugA: 'Ibuprofen',
    drugB: 'Diclofenac',
    severityLevel: 'severe',
    clinicalEffect: 'Dual NSAID toxicity. Concomitant administration of two systemic NSAIDs provides no additive analgesic efficacy while synergistically multiplying gastrointestinal ulceration, severe GI bleeding, and acute renal impairment.',
    sourceReference: 'British National Formulary 85 (Section 10.1.1: NSAID Duplication) & FDA Class Warning',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 122,
    drugA: 'Aspirin',
    drugB: 'Clopidogrel',
    severityLevel: 'severe',
    clinicalEffect: 'Dual antiplatelet therapy (DAPT) synergism. Substantially increases major bleeding events, gastrointestinal ulceration, and hemorrhagic stroke. Requires structured gastroprotection and strict clinical indication monitoring.',
    sourceReference: 'British National Formulary 85 (Appendix 1: Antiplatelets) & ACC/AHA Guideline on Dual Antiplatelet Therapy',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 123,
    drugA: 'Warfarin',
    drugB: 'Clopidogrel',
    severityLevel: 'severe',
    clinicalEffect: 'Combination anticoagulant and antiplatelet therapy. Marked elevation of major fatal hemorrhage and upper gastrointestinal bleeding.',
    sourceReference: 'British National Formulary 85 (Appendix 1: Oral Anticoagulants)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 124,
    drugA: 'Warfarin',
    drugB: 'Diclofenac',
    severityLevel: 'severe',
    clinicalEffect: 'Major haemorrhagic risk. Diclofenac induces gastric mucosal ulceration and inhibits platelet aggregation, multiplying the anticoagulant toxicity of warfarin.',
    sourceReference: 'British National Formulary 85 (Appendix 1: Anticoagulants & NSAIDs)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 125,
    drugA: 'Clopidogrel',
    drugB: 'Ibuprofen',
    severityLevel: 'severe',
    clinicalEffect: 'NSAID-induced gastric mucosal damage combined with P2Y12 platelet inhibition multiplies gastrointestinal hemorrhage hazard.',
    sourceReference: 'British National Formulary 85 (Appendix 1: Clopidogrel & NSAIDs)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 126,
    drugA: 'Clopidogrel',
    drugB: 'Diclofenac',
    severityLevel: 'severe',
    clinicalEffect: 'Potentiated upper gastrointestinal bleeding and ulceration. P2Y12 inhibition impairs hemostatic plug formation in NSAID-induced ulcers.',
    sourceReference: 'British National Formulary 85 (Appendix 1: Antiplatelet Drugs)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 127,
    drugA: 'Aspirin',
    drugB: 'Diclofenac',
    severityLevel: 'severe',
    clinicalEffect: 'Dual COX inhibition. Severe risk of gastrointestinal ulceration and hemorrhage; diclofenac may also interfere with aspirin cardioprotection.',
    sourceReference: 'British National Formulary 85 & FDA Guidance on Concomitant NSAID Use',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 128,
    drugA: 'Ciprofloxacin',
    drugB: 'Ibuprofen',
    severityLevel: 'severe',
    clinicalEffect: 'Central nervous system neurotoxicity. Concurrent administration of fluoroquinolones and NSAIDs synergistically antagonizes GABA receptors, significantly increasing seizure and convulsion risk.',
    sourceReference: 'British National Formulary 85 (Appendix 1: Quinolones & NSAIDs) & MHRA Drug Safety Update',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 129,
    drugA: 'Ciprofloxacin',
    drugB: 'Diclofenac',
    severityLevel: 'severe',
    clinicalEffect: 'Epileptogenic neurotoxicity. NSAIDs potentiate fluoroquinolone inhibition of central GABA-ergic neurotransmission, precipitating central nervous system stimulation and seizures.',
    sourceReference: 'British National Formulary 85 (Appendix 1: Quinolones & NSAIDs)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 130,
    drugA: 'Glimepiride',
    drugB: 'Glibenclamide',
    severityLevel: 'severe',
    clinicalEffect: 'Redundant dual sulfonylurea secretagogue therapy. Synergistically triggers severe, refractory, and life-threatening prolonged hypoglycemia.',
    sourceReference: 'British National Formulary 85 (Section 6.1.2) & WHO Guidelines for Type 2 Diabetes',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 131,
    drugA: 'Lamivudine',
    drugB: 'Emtricitabine',
    severityLevel: 'severe',
    clinicalEffect: 'Therapeutic duplication and intracellular competition. Both agents are cytidine analogs that compete for identical intracellular phosphorylation kinases, conferring zero additive antiviral benefit.',
    sourceReference: 'WHO Consolidated Guidelines on HIV & DHHS Antiretroviral Guidelines',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 132,
    drugA: 'Losartan',
    drugB: 'Ibuprofen',
    severityLevel: 'moderate',
    clinicalEffect: 'NSAIDs attenuate the antihypertensive effect of ARBs through renal prostaglandin inhibition, and compound the risk of acute renal failure and hyperkalemia.',
    sourceReference: 'British National Formulary 85 (Appendix 1: Angiotensin-II Receptor Blockers)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 133,
    drugA: 'Losartan',
    drugB: 'Diclofenac',
    severityLevel: 'moderate',
    clinicalEffect: 'Reduced antihypertensive efficacy and elevated nephrotoxicity. NSAID inhibition of renal prostaglandins impairs glomerular filtration in patients taking ARBs.',
    sourceReference: 'British National Formulary 85 (Appendix 1: ARBs & NSAIDs)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 134,
    drugA: 'Lisinopril',
    drugB: 'Aspirin',
    severityLevel: 'moderate',
    clinicalEffect: 'High-dose aspirin inhibits vasodilatory prostaglandins, attenuating the blood pressure and hemodynamic benefit of ACE inhibitors; may exacerbate renal function decline.',
    sourceReference: 'British National Formulary 85 (Appendix 1: ACE Inhibitors)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 135,
    drugA: 'Losartan',
    drugB: 'Aspirin',
    severityLevel: 'moderate',
    clinicalEffect: 'Analgesic doses of aspirin reduce the antihypertensive efficacy of ARBs and increase renal impairment risk.',
    sourceReference: 'British National Formulary 85 (Appendix 1: ARBs & Analgesics)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 136,
    drugA: 'Hydrochlorothiazide',
    drugB: 'Diclofenac',
    severityLevel: 'moderate',
    clinicalEffect: 'NSAIDs counteract thiazide diuretic efficacy by inhibiting vasodilatory prostaglandins, triggering renal sodium and fluid retention.',
    sourceReference: 'British National Formulary 85 (Diuretics & NSAIDs)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 137,
    drugA: 'Hydrochlorothiazide',
    drugB: 'Aspirin',
    severityLevel: 'moderate',
    clinicalEffect: 'Inhibition of renal prostaglandins blunts the natriuretic and antihypertensive actions of hydrochlorothiazide.',
    sourceReference: 'British National Formulary 85 (Diuretics & NSAIDs)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 138,
    drugA: 'Atenolol',
    drugB: 'Ibuprofen',
    severityLevel: 'moderate',
    clinicalEffect: 'NSAIDs cause fluid retention and inhibit renal vasodilating prostaglandins, attenuating the antihypertensive efficacy of atenolol.',
    sourceReference: 'British National Formulary 85 (Beta-blockers & NSAIDs)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 139,
    drugA: 'Atenolol',
    drugB: 'Diclofenac',
    severityLevel: 'moderate',
    clinicalEffect: 'NSAIDs attenuate the blood pressure response to beta-blockers and increase cardiovascular afterload.',
    sourceReference: 'British National Formulary 85 (Beta-blockers & NSAIDs)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 140,
    drugA: 'Atenolol',
    drugB: 'Lisinopril',
    severityLevel: 'moderate',
    clinicalEffect: 'Additive blood pressure reduction and potential for first-dose postural hypotension and bradycardia.',
    sourceReference: 'British National Formulary 85 (Antihypertensive Combinations)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 141,
    drugA: 'Atenolol',
    drugB: 'Losartan',
    severityLevel: 'moderate',
    clinicalEffect: 'Additive hemodynamic suppression. Enhanced hypotensive response and potential bradycardia; requires regular blood pressure monitoring.',
    sourceReference: 'British National Formulary 85 (Beta-blockers & ARBs)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 142,
    drugA: 'Atenolol',
    drugB: 'Glimepiride',
    severityLevel: 'moderate',
    clinicalEffect: 'Beta-blockers mask early warning symptoms of acute hypoglycemia (tremor, tachycardia, palpitations) induced by sulfonylureas.',
    sourceReference: 'British National Formulary 85 (Beta-blockers & Antidiabetics)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 143,
    drugA: 'Atenolol',
    drugB: 'Glibenclamide',
    severityLevel: 'moderate',
    clinicalEffect: 'Beta-blockade masks autonomic signs of hypoglycemia, delaying appropriate patient oral carbohydrate intake.',
    sourceReference: 'British National Formulary 85 (Beta-blockers & Antidiabetics)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 144,
    drugA: 'Atenolol',
    drugB: 'Insulin Glargine',
    severityLevel: 'moderate',
    clinicalEffect: 'Cardioselective beta-blockade attenuates adrenergic hypoglycemia signs (tachycardia, tremor), heightening the severity of nocturnal insulin hypoglycemia.',
    sourceReference: 'British National Formulary 85 (Beta-blockers & Insulins)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 145,
    drugA: 'Glibenclamide',
    drugB: 'Ciprofloxacin',
    severityLevel: 'severe',
    clinicalEffect: 'Fluoroquinolones inhibit CYP2C9-mediated sulfonylurea metabolism and displace glibenclamide from albumin binding sites, inducing profound hypoglycemia.',
    sourceReference: 'British National Formulary 85 & FDA Safety Alert',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 146,
    drugA: 'Warfarin',
    drugB: 'Omeprazole',
    severityLevel: 'moderate',
    clinicalEffect: 'Omeprazole competitively inhibits CYP2C19, delaying clearance of the R-enantiomer of warfarin and potentially elevating INR.',
    sourceReference: 'British National Formulary 85 (Coumarins & PPIs)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 147,
    drugA: 'Warfarin',
    drugB: 'Atorvastatin',
    severityLevel: 'moderate',
    clinicalEffect: 'Competitive hepatic CYP3A4 metabolism and plasma protein displacement may cause transient INR elevations. Monitor prothrombin time upon initiating or titrating statin.',
    sourceReference: 'British National Formulary 85 (Anticoagulants & Statins)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 148,
    drugA: 'Tenofovir Disoproxil',
    drugB: 'Aspirin',
    severityLevel: 'moderate',
    clinicalEffect: 'High-dose or long-term aspirin impairs renal perfusion, accelerating tenofovir proximal tubular accumulation and nephrotoxicity.',
    sourceReference: 'WHO Consolidated Guidelines on HIV & Gilead Viread Prescribing Info',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 149,
    drugA: 'Empagliflozin',
    drugB: 'Glimepiride',
    severityLevel: 'moderate',
    clinicalEffect: 'Potentiated hypoglycemic risk. SGLT2 inhibitor glucosuria combined with sulfonylurea insulin secretagogue therapy increases hypoglycemia incidence; sulfonylurea dose reduction may be indicated.',
    sourceReference: 'British National Formulary 85 (SGLT2 Inhibitors & Sulfonylureas)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 150,
    drugA: 'Empagliflozin',
    drugB: 'Glibenclamide',
    severityLevel: 'moderate',
    clinicalEffect: 'Increased hypoglycemia hazard when SGLT2 inhibitor is combined with long-acting sulfonylureas.',
    sourceReference: 'British National Formulary 85 & ADA Standards of Medical Care',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 151,
    drugA: 'Empagliflozin',
    drugB: 'Insulin Glargine',
    severityLevel: 'moderate',
    clinicalEffect: 'Additive glycemic reduction increases risk of hypoglycemia and euglycemic ketoacidosis; carefully monitor ketones and glucose during acute illness.',
    sourceReference: 'FDA Jardiance Prescribing Information & ADA Standards of Care',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 152,
    drugA: 'Metformin',
    drugB: 'Glimepiride',
    severityLevel: 'moderate',
    clinicalEffect: 'Standard combination oral hypoglycaemic regimen; potentiated glucose lowering requires awareness of hypoglycemia symptoms.',
    sourceReference: 'British National Formulary 85 (Oral Antidiabetics)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 153,
    drugA: 'Metformin',
    drugB: 'Glibenclamide',
    severityLevel: 'moderate',
    clinicalEffect: 'Additive hypoglycemic action. Long biological half-life of glibenclamide increases prolonged hypoglycemia risk.',
    sourceReference: 'British National Formulary 85 (Oral Antidiabetics)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 154,
    drugA: 'Hydrochlorothiazide',
    drugB: 'Lisinopril',
    severityLevel: 'mild',
    clinicalEffect: 'Synergistic antihypertensive action. ACE inhibitor counteracts thiazide-induced hypokalemia; monitor blood pressure and creatinine on initiation.',
    sourceReference: 'British National Formulary 85 (Diuretics & ACE Inhibitors)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 155,
    drugA: 'Hydrochlorothiazide',
    drugB: 'Losartan',
    severityLevel: 'mild',
    clinicalEffect: 'Synergistic blood pressure reduction. Standard combination therapy; monitor volume status and electrolytes.',
    sourceReference: 'British National Formulary 85 (Diuretics & ARBs)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 156,
    drugA: 'Amlodipine',
    drugB: 'Lisinopril',
    severityLevel: 'mild',
    clinicalEffect: 'Complementary vasodilatory mechanism. Dual arterial vasodilation lowers blood pressure effectively; observe for initial postural dizziness.',
    sourceReference: 'British National Formulary 85 (Calcium-channel Blockers & ACE Inhibitors)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 157,
    drugA: 'Amlodipine',
    drugB: 'Losartan',
    severityLevel: 'mild',
    clinicalEffect: 'Synergistic blood pressure control with reduced incidence of CCB-induced peripheral edema.',
    sourceReference: 'British National Formulary 85 (Calcium-channel Blockers & ARBs)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 158,
    drugA: 'Amlodipine',
    drugB: 'Atorvastatin',
    severityLevel: 'mild',
    clinicalEffect: 'Amlodipine inhibits CYP3A4 metabolism, increasing atorvastatin AUC by approximately 18%. Monitor for statin-related muscle soreness.',
    sourceReference: 'British National Formulary 85 (Statins & Calcium-channel Blockers)',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 159,
    drugA: 'Salbutamol',
    drugB: 'Ipratropium',
    severityLevel: 'mild',
    clinicalEffect: 'Complementary bronchodilator synergy. Combined beta-2 agonism and anticholinergic muscarinic blockade produces superior airflow improvement with no adverse interaction.',
    sourceReference: 'British National Formulary 85 (Section 3.1.2) & GINA Guidelines',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  },
  {
    ruleID: 160,
    drugA: 'Lamivudine',
    drugB: 'Tenofovir Disoproxil',
    severityLevel: 'mild',
    clinicalEffect: 'Standard synergistic dual NRTI backbone in preferred first-line antiretroviral therapy for HIV and Hepatitis B co-infection.',
    sourceReference: 'WHO Consolidated Guidelines on HIV Prevention and Treatment',
    versionDate: '2024-03-10',
    lastModifiedBy: 'admin_glory',
    lastModifiedAt: '2026-09-23T12:00:00Z'
  }
];

/**
 * 10 Documented Common Allergen Categories
 */
export const COMMON_ALLERGEN_CATEGORIES = [
  'Penicillins',
  'Sulfa Drugs',
  'NSAIDs/Aspirin',
  'ACE Inhibitors',
  'Beta Blockers',
  'Fluoroquinolones',
  'Statins',
  'Cephalosporins',
  'Macrolides',
  'Sulfonylureas'
];

/**
 * Administrator Account (Table 3.7)
 */
export const INITIAL_ADMINISTRATOR: Administrator = {
  adminID: 1,
  username: 'admin_glory',
  passwordHash: '$2b$10$OKeeQo3HUgB4JyYrAI36X.N7zGk.d5/pPkQPflR0c5QMeE8BS4FaG', // password: admin123
  fullName: 'Glory Ephraim (Miva OU Lead Researcher)',
  role: 'System Administrator & Clinical Informatics Officer'
};

/**
 * Medical Practitioners & Registered Clinicians
 */
export const INITIAL_PRACTITIONERS: MedicalPractitioner[] = [
  {
    practitionerID: 1,
    fullName: 'Dr. Aisha Bello, MBBS, FWACP',
    title: 'Consultant Physician & Cardiologist',
    roleDesignation: 'Consultant Physician',
    specialty: 'Cardiovascular Medicine & Hypertension',
    licenseNumber: 'MDCN-48291',
    hospitalAffiliation: 'National Hospital Abuja',
    contactEmail: 'dr.aisha.bello@nationalhospital.gov.ng',
    contactPhone: '+234 803 123 4567',
    avatarColor: 'bg-emerald-700',
    pin: '$2b$10$tE.5.zNHUG74eCm6Xhaz0udMCyRgsWb/ZaEd3/V2cn7A6JeWzaZUO', // PIN: 1234
    bio: 'Head of Hypertension and Preventive Cardiology Clinic. Specializes in multi-drug resistant hypertension and polypharmacy reduction.',
    joinedDate: '2023-01-10'
  },
  {
    practitionerID: 2,
    fullName: 'Dr. Emeka Okafor, MBBS, FMCP',
    title: 'Consultant Endocrinologist & Diabetologist',
    roleDesignation: 'Doctor',
    specialty: 'Endocrinology & Metabolic Disorders',
    licenseNumber: 'MDCN-39102',
    hospitalAffiliation: 'Miva Health Medical Center, Abuja',
    contactEmail: 'dr.okafor@mivahealth.org',
    contactPhone: '+234 802 987 6543',
    avatarColor: 'bg-blue-700',
    pin: '$2b$10$tE.5.zNHUG74eCm6Xhaz0udMCyRgsWb/ZaEd3/V2cn7A6JeWzaZUO', // PIN: 1234
    bio: 'Senior Diabetologist with over 15 years experience in personalized glycemic management and renal-safe diabetes pharmacotherapy.',
    joinedDate: '2023-04-15'
  },
  {
    practitionerID: 3,
    fullName: 'PharmD Folake Adeleke, B.Pharm, FPCPharm',
    title: 'Lead Clinical Pharmacist & Toxicologist',
    roleDesignation: 'Clinical Pharmacist',
    specialty: 'Clinical Pharmacotherapy & Drug-Drug Interactions',
    licenseNumber: 'PCN-89210',
    hospitalAffiliation: 'MedSafe Pharmacovigilance Centre, Lagos',
    contactEmail: 'folake.adeleke@medsafe.org.ng',
    contactPhone: '+234 814 345 6789',
    avatarColor: 'bg-teal-700',
    pin: '$2b$10$tE.5.zNHUG74eCm6Xhaz0udMCyRgsWb/ZaEd3/V2cn7A6JeWzaZUO', // PIN: 1234
    bio: 'Fellow of the West African Postgraduate College of Pharmacists. Expert in clinical decision support and adverse drug reaction surveillance.',
    joinedDate: '2023-06-20'
  },
  {
    practitionerID: 4,
    fullName: 'Dr. David Ibrahim, MBBS, FWACP',
    title: 'Consultant Pulmonologist & Infectious Disease Specialist',
    roleDesignation: 'Specialist',
    specialty: 'Pulmonology, Asthma & Antiretroviral Therapy (ART)',
    licenseNumber: 'MDCN-52019',
    hospitalAffiliation: 'Federal Medical Centre, Jabi, Abuja',
    contactEmail: 'dr.ibrahim@fmcabuja.gov.ng',
    contactPhone: '+234 805 678 1234',
    avatarColor: 'bg-purple-700',
    pin: '$2b$10$tE.5.zNHUG74eCm6Xhaz0udMCyRgsWb/ZaEd3/V2cn7A6JeWzaZUO', // PIN: 1234
    bio: 'Specialist in airway diseases, asthma step-down protocols, and viral load optimization in chronic disease management.',
    joinedDate: '2023-09-01'
  }
];

/**
 * Synthetic Test Patients (Table 3.2 per Section 3.5.2 & Section 3.11)
 */
export const INITIAL_PATIENTS: Patient[] = [
  {
    patientID: 1,
    fullName: 'Amina Bello',
    dateOfBirth: '1974-06-14',
    email: 'amina.bello@gmail.com',
    gender: 'Female',
    contactNumber: '+234 803 555 0192',
    passwordHash: '$2b$10$tE.5.zNHUG74eCm6Xhaz0udMCyRgsWb/ZaEd3/V2cn7A6JeWzaZUO', // PIN: 1234
    conditionTags: ['Hypertension', 'Type 2 Diabetes'],
    bloodGroup: 'O+',
    avatarColor: 'bg-emerald-600',
    assignedDoctorID: 1, // Dr. Aisha Bello
    clinicalNotes: 'Blood pressure controlled at 128/82 mmHg. Continue Lisinopril 10mg daily and Metformin 500mg BID. Remember to take Lisinopril in the morning.',
    emergencyContact: {
      name: 'Ibrahim Bello',
      relationship: 'Spouse',
      phone: '+234 803 555 0199'
    }
  },
  {
    patientID: 2,
    fullName: 'Emeka Okonkwo',
    dateOfBirth: '1968-11-03',
    email: 'emeka.okonkwo@gmail.com',
    gender: 'Male',
    contactNumber: '+234 802 555 0841',
    passwordHash: '$2b$10$tE.5.zNHUG74eCm6Xhaz0udMCyRgsWb/ZaEd3/V2cn7A6JeWzaZUO', // PIN: 1234
    conditionTags: ['Hypertension', 'Cardiovascular Risk', 'Dyslipidemia'],
    bloodGroup: 'A+',
    avatarColor: 'bg-blue-600',
    assignedDoctorID: 2, // Dr. Emeka Okafor
    clinicalNotes: 'Lipid profile review due next month. Emphasized strictly taking Atorvastatin at evening/bedtime for peak hepatic synthesis inhibition.',
    emergencyContact: {
      name: 'Ngozi Okonkwo',
      relationship: 'Spouse',
      phone: '+234 802 555 0849'
    }
  },
  {
    patientID: 3,
    fullName: 'Fatima Abubakar',
    dateOfBirth: '1992-03-27',
    email: 'fatima.abubakar@gmail.com',
    gender: 'Female',
    contactNumber: '+234 814 555 0329',
    passwordHash: '$2b$10$tE.5.zNHUG74eCm6Xhaz0udMCyRgsWb/ZaEd3/V2cn7A6JeWzaZUO', // PIN: 1234
    conditionTags: ['Persistent Asthma'],
    bloodGroup: 'B+',
    avatarColor: 'bg-purple-600',
    assignedDoctorID: 4, // Dr. David Ibrahim
    clinicalNotes: 'Asthma symptom diary stable. Always rinse mouth thoroughly after Fluticasone inhaler to prevent oral candidiasis.',
    emergencyContact: {
      name: 'Aisha Abubakar',
      relationship: 'Sister',
      phone: '+234 814 555 0330'
    }
  },
  {
    patientID: 4,
    fullName: 'David Adeleke',
    dateOfBirth: '1985-08-19',
    email: 'david.adeleke@gmail.com',
    gender: 'Male',
    contactNumber: '+234 805 555 0714',
    passwordHash: '$2b$10$tE.5.zNHUG74eCm6Xhaz0udMCyRgsWb/ZaEd3/V2cn7A6JeWzaZUO', // PIN: 1234
    conditionTags: ['HIV Management (ART)'],
    bloodGroup: 'O-',
    avatarColor: 'bg-amber-600',
    assignedDoctorID: 3, // PharmD Folake Adeleke
    clinicalNotes: 'Viral load suppressed (<20 copies/mL). Emphasized consistent daily dosing schedule to maintain adherence >95%.',
    emergencyContact: {
      name: 'Grace Adeleke',
      relationship: 'Mother',
      phone: '+234 805 555 0715'
    }
  }
];

/**
 * Initial Recorded Allergies (Table 3.4)
 */
export const INITIAL_ALLERGIES: Allergy[] = [
  // Amina Bello is allergic to Penicillins (Amoxicillin)
  {
    allergyID: 1,
    patientID: 1,
    allergenName: 'Penicillins',
    reactionSeverity: 'severe',
    symptoms: 'Facial angioedema, urticaria, bronchospasm (Type 1 anaphylactic reaction)',
    documentedDate: '2024-02-10'
  },
  // Emeka Okonkwo is hypersensitive to NSAIDs/Aspirin
  {
    allergyID: 2,
    patientID: 2,
    allergenName: 'NSAIDs/Aspirin',
    reactionSeverity: 'moderate',
    symptoms: 'Diffuse maculopapular rash, severe epigastric pain',
    documentedDate: '2023-09-15'
  },
  // Fatima Abubakar is allergic to Sulfa Drugs
  {
    allergyID: 3,
    patientID: 3,
    allergenName: 'Sulfa Drugs',
    reactionSeverity: 'severe',
    symptoms: 'Severe erythema multiforme, blistering eruption',
    documentedDate: '2025-01-20'
  }
];

/**
 * Initial Medications for Patient 1 (Amina Bello) - Table 3.3
 */
export const INITIAL_MEDICATIONS: Medication[] = [
  {
    medicationID: 1001,
    patientID: 1,
    drugName: 'Lisinopril',
    normalisedGeneric: 'Lisinopril',
    atcCode: 'C09AA03',
    dosage: '10mg',
    schedule: '08:00',
    quantityRemaining: 8, // Low remaining! (triggers refill calculation FR5)
    quantityPerDose: 1,
    dosesPerDay: 1,
    refillThresholdDays: 10,
    status: 'active',
    prescribedDate: '2026-08-01',
    conditionCategory: 'hypertension',
    instructions: 'Take one tablet every morning with water.'
  },
  {
    medicationID: 1002,
    patientID: 1,
    drugName: 'Metformin',
    normalisedGeneric: 'Metformin',
    atcCode: 'A10BA02',
    dosage: '500mg',
    schedule: '08:00, 20:00',
    quantityRemaining: 42,
    quantityPerDose: 1,
    dosesPerDay: 2,
    refillThresholdDays: 7,
    status: 'active',
    prescribedDate: '2026-08-01',
    conditionCategory: 'diabetes',
    instructions: 'Take with meals to reduce gastrointestinal discomfort.'
  },
  // For Patient 2: Emeka Okonkwo
  {
    medicationID: 1003,
    patientID: 2,
    drugName: 'Amlodipine',
    normalisedGeneric: 'Amlodipine',
    atcCode: 'C08CA01',
    dosage: '5mg',
    schedule: '09:00',
    quantityRemaining: 24,
    quantityPerDose: 1,
    dosesPerDay: 1,
    refillThresholdDays: 5,
    status: 'active',
    prescribedDate: '2026-08-15',
    conditionCategory: 'hypertension',
    instructions: 'Take daily at breakfast.'
  },
  {
    medicationID: 1004,
    patientID: 2,
    drugName: 'Warfarin',
    normalisedGeneric: 'Warfarin',
    atcCode: 'B01AA03',
    dosage: '2.5mg',
    schedule: '18:00',
    quantityRemaining: 18,
    quantityPerDose: 1,
    dosesPerDay: 1,
    refillThresholdDays: 7,
    status: 'active',
    prescribedDate: '2026-08-10',
    conditionCategory: 'general',
    instructions: 'Strict adherence required. Monitor INR regularly.'
  },
  // For Patient 3: Fatima Abubakar
  {
    medicationID: 1005,
    patientID: 3,
    drugName: 'Salbutamol',
    normalisedGeneric: 'Salbutamol',
    atcCode: 'R03AC02',
    dosage: '100mcg (2 puffs)',
    schedule: '08:00, 20:00',
    quantityRemaining: 60,
    quantityPerDose: 2,
    dosesPerDay: 2,
    refillThresholdDays: 7,
    status: 'active',
    prescribedDate: '2026-09-01',
    conditionCategory: 'asthma',
    instructions: 'Inhale using spacer chamber.'
  },
  // For Patient 4: David Adeleke
  {
    medicationID: 1006,
    patientID: 4,
    drugName: 'Tenofovir Disoproxil',
    normalisedGeneric: 'Tenofovir Disoproxil',
    atcCode: 'J05AF07',
    dosage: '300mg',
    schedule: '21:00',
    quantityRemaining: 14,
    quantityPerDose: 1,
    dosesPerDay: 1,
    refillThresholdDays: 7,
    status: 'active',
    prescribedDate: '2026-08-20',
    conditionCategory: 'hiv',
    instructions: 'Take once daily before bedtime.'
  }
];

/**
 * Initial Dosing Reminders (Table 3.8 per Algorithm 3.3)
 */
export const INITIAL_REMINDERS: Reminder[] = [
  {
    reminderID: 501,
    medicationID: 1001,
    patientID: 1,
    drugName: 'Lisinopril',
    dosage: '10mg',
    scheduledTime: '08:00',
    status: 'Sent',
    sentAt: '2026-09-19T08:00:00Z',
    note: 'Scheduled morning dose'
  },
  {
    reminderID: 502,
    medicationID: 1002,
    patientID: 1,
    drugName: 'Metformin',
    dosage: '500mg',
    scheduledTime: '08:00',
    status: 'Acknowledged',
    sentAt: '2026-09-19T08:00:00Z',
    acknowledgedAt: '2026-09-19T08:14:22Z',
    note: 'UI acknowledgement only (not a clinical adherence record)'
  },
  {
    reminderID: 503,
    medicationID: 1002,
    patientID: 1,
    drugName: 'Metformin',
    dosage: '500mg',
    scheduledTime: '20:00',
    status: 'Pending',
    note: 'Evening dose'
  }
];

/**
 * Initial Refill Notifications (Table 3.9 per Algorithm 3.2)
 */
export const INITIAL_REFILL_NOTIFICATIONS: RefillNotification[] = [
  {
    notificationID: 301,
    medicationID: 1001,
    patientID: 1,
    drugName: 'Lisinopril',
    dueDate: '2026-09-27',
    daysRemaining: 8,
    quantityRemaining: 8,
    thresholdDays: 10,
    status: 'Pending',
    createdAt: '2026-09-19T06:00:00Z'
  }
];

/**
 * Initial AlertLog entries (Table 3.6 per Section 3.7.6)
 */
export const INITIAL_ALERT_LOGS: AlertLog[] = [
  {
    alertID: 901,
    patientID: 1,
    alertType: 'Refill',
    severity: 'mild',
    message: 'Prescription refill due in 8 days for Lisinopril 10mg (8 doses remaining; threshold 10 days).',
    details: 'Algorithm 3.2 triggered: dailyUsage = 1, daysRemaining = 8 <= threshold (10).',
    timestamp: '2026-09-19T06:00:00Z'
  },
  {
    alertID: 902,
    patientID: 1,
    alertType: 'Reminder',
    severity: 'info',
    message: 'Scheduled dosing alert: Lisinopril 10mg at 08:00.',
    details: 'Algorithm 3.3 scheduler trigger: Sent to patient in-app notification.',
    timestamp: '2026-09-19T08:00:00Z'
  },
  {
    alertID: 903,
    patientID: 2,
    alertType: 'Interaction',
    severity: 'severe',
    message: 'Safety rule conflict flagged during pre-screen: Warfarin + Ibuprofen interaction.',
    details: 'Rule 101 matched: Major haemorrhagic risk. BNF 85 Appendix 1.',
    ruleID: 101,
    timestamp: '2026-09-18T14:22:00Z'
  }
];

/**
 * Administrative Audit Trail (FR12 per Section 3.4.1 & NFR10)
 */
export const INITIAL_AUDIT_TRAIL: AuditTrailEntry[] = [
  {
    auditID: 1,
    adminUsername: 'admin_glory',
    action: 'CREATE_RULE',
    entityType: 'InteractionRule',
    entityID: 101,
    details: 'Authored rule Warfarin + Ibuprofen (Severe) with citation BNF 85 App 1',
    timestamp: '2026-07-02T10:00:00Z'
  },
  {
    auditID: 2,
    adminUsername: 'admin_glory',
    action: 'CREATE_RULE',
    entityType: 'InteractionRule',
    entityID: 106,
    details: 'Authored rule Tenofovir Disoproxil + Diclofenac (Severe) per WHO ART Guidelines',
    timestamp: '2026-07-02T10:05:00Z'
  },
  {
    auditID: 3,
    adminUsername: 'admin_glory',
    action: 'UPDATE_RULE',
    entityType: 'InteractionRule',
    entityID: 108,
    details: 'Updated Dolutegravir + Metformin severity to moderate with OCT2 mechanistic notes',
    timestamp: '2026-07-02T11:15:00Z'
  }
];

/**
 * Table 3.11: Formal Test Cases Defined in Glory Ephraim's Thesis
 */
export const FORMAL_TEST_CASES: TestCase[] = [
  {
    id: 'TC1',
    name: 'Add medication matching a recorded allergy',
    inputDescription: "Patient 1 (Amina Bello, documented Penicillins allergy) adds 'Amoxicillin 500mg'",
    expectedResult: 'Allergy alert raised (severe) and logged to AlertLog; medication rejected or flagged.',
    category: 'Allergy'
  },
  {
    id: 'TC2',
    name: 'Add medication with a known severe interaction',
    inputDescription: "Patient 2 (Emeka Okonkwo, on active Warfarin) attempts to add 'Ibuprofen 400mg'",
    expectedResult: 'Interaction alert (severe) raised citing BNF 85 / FDA Boxed Warning and logged.',
    category: 'Interaction'
  },
  {
    id: 'TC3',
    name: 'Add medication not in the rule base (Fail-Safe)',
    inputDescription: "Patient attempts to add unrecognized compound 'MiracleHerbX 100mg'",
    expectedResult: "Return 'UNVERIFIED: No verified rule available for this medication' response; NEVER false safe.",
    category: 'FailSafe'
  },
  {
    id: 'TC4',
    name: 'Add medication with no conflicts',
    inputDescription: "Patient 3 (Fatima Abubakar, asthma) adds 'Paracetamol 500mg'",
    expectedResult: 'Confirmation returned; medication saved to active list and dosing reminders scheduled.',
    category: 'Safe'
  },
  {
    id: 'TC5',
    name: 'Refill threshold reached',
    inputDescription: 'QuantityRemaining is updated to 8 for Lisinopril (daily usage = 1, threshold = 10 days)',
    expectedResult: 'RefillNotification generated with calculated DueDate = TODAY + 8 days.',
    category: 'Refill'
  },
  {
    id: 'TC6',
    name: 'Reminder fires at scheduled time',
    inputDescription: 'Medication has schedule 08:00; system trigger fires',
    expectedResult: 'Reminder status changes Pending -> Sent; Patient acknowledge sets status -> Acknowledged.',
    category: 'Reminder'
  },
  {
    id: 'TC7',
    name: 'Unauthorised access attempt (NFR8)',
    inputDescription: "Patient session attempts direct POST to admin rule modification endpoint",
    expectedResult: 'Access denied: Role-Based Access Control restricts rule management to Administrator.',
    category: 'Security'
  },
  {
    id: 'TC8',
    name: 'SQL Injection / Malformed Input Attempt (FR13)',
    inputDescription: "Input string in drug name field: \"Lisinopril'; DROP TABLE Medication; --\"",
    expectedResult: 'Input rejected/sanitised; no database error, query executed safely with parameterized mapping.',
    category: 'Validation'
  }
];

/**
 * 12 Volunteer Participant TAM Survey Responses (Davis 1989)
 * From Chapter 3.10 & 3.11 User Acceptance Testing
 */
export const INITIAL_TAM_SURVEYS: TAMSurveyResponse[] = [
  {
    responseID: 'TAM-01',
    patientID: 1,
    patientName: 'Amina Bello (Chronic Outpatient)',
    perceivedUsefulness: { workSpeed: 5, performance: 5, effectiveness: 5, overallUseful: 5 },
    perceivedEaseOfUse: { easyToLearn: 5, clearInteraction: 4, flexible: 4, overallEasy: 5 },
    qualitativeFeedback: 'The allergy warning for penicillin stopped me from making an accidental purchase.',
    submittedAt: '2026-08-10T14:30:00Z'
  },
  {
    responseID: 'TAM-02',
    patientID: 2,
    patientName: 'Emeka Okonkwo (Cardiovascular)',
    perceivedUsefulness: { workSpeed: 4, performance: 5, effectiveness: 5, overallUseful: 5 },
    perceivedEaseOfUse: { easyToLearn: 4, clearInteraction: 5, flexible: 4, overallEasy: 4 },
    qualitativeFeedback: 'Seeing exactly why Warfarin clashed with pain relief tablets gave me confidence.',
    submittedAt: '2026-08-10T15:10:00Z'
  },
  {
    responseID: 'TAM-03',
    patientID: 3,
    patientName: 'Fatima Abubakar (Asthma Care)',
    perceivedUsefulness: { workSpeed: 5, performance: 4, effectiveness: 5, overallUseful: 5 },
    perceivedEaseOfUse: { easyToLearn: 5, clearInteraction: 5, flexible: 5, overallEasy: 5 },
    qualitativeFeedback: 'The refill countdown lets me buy my inhaler five days before it finishes.',
    submittedAt: '2026-08-11T09:20:00Z'
  },
  {
    responseID: 'TAM-04',
    patientName: 'Volunteer Tester 4 (B.Sc. Student)',
    perceivedUsefulness: { workSpeed: 4, performance: 4, effectiveness: 5, overallUseful: 4 },
    perceivedEaseOfUse: { easyToLearn: 5, clearInteraction: 5, flexible: 4, overallEasy: 5 },
    qualitativeFeedback: 'Very intuitive interface with no confusing clutter.',
    submittedAt: '2026-08-11T11:00:00Z'
  },
  {
    responseID: 'TAM-05',
    patientName: 'Volunteer Tester 5 (Community Pharmacist Intern)',
    perceivedUsefulness: { workSpeed: 5, performance: 5, effectiveness: 5, overallUseful: 5 },
    perceivedEaseOfUse: { easyToLearn: 4, clearInteraction: 5, flexible: 5, overallEasy: 5 },
    qualitativeFeedback: 'Having the BNF rule provenance visible makes auditing therapeutic risks transparent.',
    submittedAt: '2026-08-11T13:40:00Z'
  },
  {
    responseID: 'TAM-06',
    patientName: 'Volunteer Tester 6 (Diabetic Outpatient)',
    perceivedUsefulness: { workSpeed: 4, performance: 4, effectiveness: 4, overallUseful: 4 },
    perceivedEaseOfUse: { easyToLearn: 4, clearInteraction: 4, flexible: 4, overallEasy: 4 },
    qualitativeFeedback: 'Straightforward dosing reminders.',
    submittedAt: '2026-08-12T10:15:00Z'
  },
  {
    responseID: 'TAM-07',
    patientName: 'Volunteer Tester 7 (General Outpatient)',
    perceivedUsefulness: { workSpeed: 5, performance: 5, effectiveness: 5, overallUseful: 5 },
    perceivedEaseOfUse: { easyToLearn: 5, clearInteraction: 4, flexible: 4, overallEasy: 4 },
    qualitativeFeedback: 'Simple to understand without technical medical jargon.',
    submittedAt: '2026-08-12T11:45:00Z'
  },
  {
    responseID: 'TAM-08',
    patientName: 'Volunteer Tester 8 (Hypertension Clinic Visitor)',
    perceivedUsefulness: { workSpeed: 4, performance: 5, effectiveness: 4, overallUseful: 5 },
    perceivedEaseOfUse: { easyToLearn: 4, clearInteraction: 5, flexible: 4, overallEasy: 4 },
    qualitativeFeedback: 'The pill inventory counter is very practical.',
    submittedAt: '2026-08-12T14:30:00Z'
  },
  {
    responseID: 'TAM-09',
    patientName: 'Volunteer Tester 9 (Caregiver)',
    perceivedUsefulness: { workSpeed: 5, performance: 5, effectiveness: 5, overallUseful: 5 },
    perceivedEaseOfUse: { easyToLearn: 5, clearInteraction: 5, flexible: 5, overallEasy: 5 },
    qualitativeFeedback: 'Helps elderly relatives stay on track with their morning and evening pills.',
    submittedAt: '2026-08-13T09:00:00Z'
  },
  {
    responseID: 'TAM-10',
    patientName: 'Volunteer Tester 10 (Pharmacy Student)',
    perceivedUsefulness: { workSpeed: 5, performance: 4, effectiveness: 5, overallUseful: 5 },
    perceivedEaseOfUse: { easyToLearn: 5, clearInteraction: 4, flexible: 4, overallEasy: 5 },
    qualitativeFeedback: 'Fail-safe logic for unknown drugs is an essential safety barrier.',
    submittedAt: '2026-08-13T10:30:00Z'
  },
  {
    responseID: 'TAM-11',
    patientName: 'Volunteer Tester 11 (Elderly Patient)',
    perceivedUsefulness: { workSpeed: 4, performance: 4, effectiveness: 5, overallUseful: 4 },
    perceivedEaseOfUse: { easyToLearn: 4, clearInteraction: 4, flexible: 3, overallEasy: 4 },
    qualitativeFeedback: 'Large clear text makes it easy to read my daily schedules.',
    submittedAt: '2026-08-13T13:15:00Z'
  },
  {
    responseID: 'TAM-12',
    patientName: 'Volunteer Tester 12 (Clinical Research Assistant)',
    perceivedUsefulness: { workSpeed: 5, performance: 5, effectiveness: 5, overallUseful: 5 },
    perceivedEaseOfUse: { easyToLearn: 5, clearInteraction: 5, flexible: 5, overallEasy: 5 },
    qualitativeFeedback: 'Deterministic IF-THEN verification is far superior to unpredictable black-box models.',
    submittedAt: '2026-08-13T16:00:00Z'
  }
];
