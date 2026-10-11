/**
 * 30-Class Drug Registry Extension (v2)
 * Every drug named in the clinical class taxonomy (src/data/drugClasses.ts is the
 * scoped source-of-truth for the class ids) becomes a registry entry so it can be
 * screened and saved without the "Unverified" fail-safe block.
 */

import type { DrugRegistryItem } from '../types';

export const DRUG_CLASS_REGISTRY_EXTENSION: DrugRegistryItem[] = [
  // 1. Analgesics
  {
    genericName: 'Tramadol',
    atcCode: 'N02AX02',
    category: 'general',
    drugClass: 'analgesics',
    brandNames: ['Tramal', 'Ultram'],
    commonForms: ['50mg Capsule', '100mg Tablet'],
    description: 'Centrally acting opioid analgesic with weak mu-receptor agonism and serotonin/norepinephrine reuptake inhibition.',
    bestTimeToTake: 'Every 4 to 6 hours as prescribed for moderate to severe pain; do not exceed the prescribed daily maximum.',
    foodAdvice: 'Can be taken with or without food.',
    clinicalPearl: 'Lower seizure threshold; avoid with other serotonergic agents (SSRIs) and never with MAO inhibitors.'
  },
  // 2. NSAIDs (Ibuprofen, Diclofenac, Aspirin already registered)
  // 3. Antibiotics
  {
    genericName: 'Azithromycin',
    atcCode: 'J01FA10',
    category: 'general',
    drugClass: 'antibiotics',
    brandNames: ['Zithromax', 'Azee'],
    commonForms: ['250mg Tablet', '500mg Tablet'],
    description: 'Macrolide antibiotic inhibiting bacterial 50S ribosomal subunit protein synthesis.',
    bestTimeToTake: 'Once daily at the same hour; a 3-day or 5-day course is common for respiratory and soft-tissue infections.',
    foodAdvice: 'Tablets may be taken with or without food; suspensions best taken on an empty stomach.',
    clinicalPearl: 'Long tissue half-life (~68 hours) allows short courses. Monitor QT prolongation with interacting drugs.'
  },
  // 4. Antifungals
  {
    genericName: 'Fluconazole',
    atcCode: 'J02AC01',
    category: 'general',
    drugClass: 'antifungals',
    brandNames: ['Diflucan', 'Forcan'],
    commonForms: ['50mg Capsule', '150mg Capsule'],
    description: 'Triazole antifungal inhibitor of fungal 14-alpha-demethylase (ergosterol synthesis).',
    bestTimeToTake: 'Once daily, at the same time each day for the full prescribed course.',
    foodAdvice: 'Can be taken with or without food.',
    clinicalPearl: 'Potent CYP2C9/CYP3A4 inhibitor — check interactions with warfarin, statins and phenytoin.'
  },
  {
    genericName: 'Clotrimazole',
    atcCode: 'G01AF01',
    category: 'general',
    drugClass: 'antifungals',
    brandNames: ['Canesten', 'Lotrimin'],
    commonForms: ['1% Cream', '100mg Vaginal Tab'],
    description: 'Imidazole topical antifungal disrupting fungal membrane ergosterol synthesis.',
    bestTimeToTake: 'Apply topically 2 to 3 times daily to the affected area, continuing 1-2 weeks after symptoms clear.',
    foodAdvice: 'For external/topical use only — not for oral administration.',
    clinicalPearl: 'Negligible systemic absorption. Complete the course even after the rash resolves to prevent relapse.'
  },
  // 5. Antivirals
  {
    genericName: 'Acyclovir',
    atcCode: 'J05AB01',
    category: 'general',
    drugClass: 'antivirals',
    brandNames: ['Zovirax', 'Acivir'],
    commonForms: ['200mg Tablet', '400mg Tablet', '5% Cream'],
    description: 'Nucleoside analogue guanosine-competitive inhibitor of herpesvirus DNA polymerase.',
    bestTimeToTake: 'Evenly spaced doses (4 or 5 times daily), typically 6:00, 12:00, 18:00, midnight.',
    foodAdvice: 'Take with a full glass of water; maintain good hydration to prevent crystalluria.',
    clinicalPearl: 'Topical and oral forms only suppress, never eradicate, latent herpesviruses.'
  },
  {
    genericName: 'Oseltamivir',
    atcCode: 'J05AH02',
    category: 'general',
    drugClass: 'antivirals',
    brandNames: ['Tamiflu', 'Fluvir'],
    commonForms: ['30mg Capsule', '75mg Capsule'],
    description: 'Prodrug of oseltamivir carboxylate, a neuraminidase inhibitor against influenza A and B.',
    bestTimeToTake: 'Twice daily (morning and evening) for treatment, begun within 48 hours of symptom onset; once daily for prophylaxis.',
    foodAdvice: 'Take with food to reduce nausea and vomiting.',
    clinicalPearl: 'Most effective when started in the first 48 hours of influenza symptoms.'
  },
  // 6. Antimalarials
  {
    genericName: 'Artemether/Lumefantrine',
    atcCode: 'P01BF02',
    category: 'general',
    drugClass: 'antimalarials',
    brandNames: ['Coartem', 'Lonart', 'CMXL', 'Al/fan'],
    commonForms: ['20mg/120mg Tablet (6-dose pack)', '20mg/120mg Twin pack'],
    description: 'Fixed-dose combination ACT: artemether rapidly clears parasitaemia and lumefantrine prevents recrudescence.',
    bestTimeToTake: 'Six doses over 3 days: first at diagnosis, again 8 hours later, then twice daily (morning and evening) on days 2 and 3.',
    foodAdvice: 'Take with a fatty meal or milk — fat increases lumefantrine absorption dramatically; never dose while fasting.',
    clinicalPearl: 'Can prolong QT. Diarrhoea/vomiting after a dose may warrant a repeat dose. Avoid in pregnancy first trimester unless lifesaving.'
  },
  {
    genericName: 'Artesunate',
    atcCode: 'P01BF07',
    category: 'general',
    drugClass: 'antimalarials',
    brandNames: ['Artesun', 'Arsenal'],
    commonForms: ['50mg Tablet', '100mg Suppository', '60mg Vial (IV/IM)'],
    description: 'Fast-acting artemisinin derivative producing free radicals that kill circulating malaria parasites.',
    bestTimeToTake: 'Treatment course as prescribed; oral doses once daily, often followed by a completing ACT course.',
    foodAdvice: 'Tablets may be taken with or without food.',
    clinicalPearl: 'First-line for severe malaria worldwide. Follow a full oral partner-drug course to prevent recrudescence.'
  },
  // 7. Anthelmintics
  {
    genericName: 'Albendazole',
    atcCode: 'P02CA01',
    category: 'general',
    drugClass: 'anthelmintics',
    brandNames: ['Albenza', 'Alben'],
    commonForms: ['400mg Tablet'],
    description: 'Benzimidazole anthelmintic binding tubulin and preventing glucose uptake in helminths and cestodes.',
    bestTimeToTake: 'Usually taken as a single evening dose after food; hydatid courses are continuous with meals.',
    foodAdvice: 'Take with food (bioavailability jumps up to fivefold with a fatty meal).',
    clinicalPearl: 'Avoid in the first trimester of pregnancy; monitor blood counts and liver function on long courses.'
  },
  {
    genericName: 'Mebendazole',
    atcCode: 'P02CA51',
    category: 'general',
    drugClass: 'anthelmintics',
    brandNames: ['Vermox', 'Ovex'],
    commonForms: ['100mg Tablet', '500mg Tablet'],
    description: 'Benzimidazole anthelmintic for threadworm, roundworm, hookworm and whipworm.',
    bestTimeToTake: 'Single dose (threadworm) or morning and evening for 3 days (roundworm/hookworm).',
    foodAdvice: 'Tablets may be chewed, crushed or swallowed whole; food not strictly required.',
    clinicalPearl: 'Minimal systemic absorption with single doses. Treat close household contacts for threadworm simultaneously.'
  },
  // 8. Antiprotozoals
  {
    genericName: 'Metronidazole',
    atcCode: 'P01AB01',
    category: 'general',
    drugClass: 'antiprotozoals',
    brandNames: ['Flagyl', 'Metrogyl'],
    commonForms: ['200mg Tablet', '400mg Tablet', '400mg Effervescent'],
    description: 'Nitroimidazole antibacterial/antiprotozoal reduced by anaerobic organisms to cytotoxic radicals.',
    bestTimeToTake: 'Three times daily (roughly 08:00, 15:00, 22:00) spaced evenly after food for most courses.',
    foodAdvice: 'Take during or after meals. ABSOLUTELY no alcohol — during therapy and for 48 hours after the final dose.',
    clinicalPearl: 'Alcohol triggers flushing, sweating, headache and palpitations (disulfiram-like reaction).'
  },
  {
    genericName: 'Tinidazole',
    atcCode: 'J01XD02',
    category: 'general',
    drugClass: 'antiprotozoals',
    brandNames: ['Fasigyn', 'Tindamax'],
    commonForms: ['500mg Tablet'],
    description: 'Second-generation nitroimidazole for giardiasis, amoebiasis and bacterial vaginosis.',
    bestTimeToTake: 'Single dose or once daily courses exactly as prescribed, taken with food.',
    foodAdvice: 'Take with food to minimize GI upset. No alcohol during therapy and for 72 hours after.',
    clinicalPearl: 'Longer half-life than metronidazole allows shorter courses and single-dose therapy.'
  },
  // 9. Antihistamines
  {
    genericName: 'Cetirizine',
    atcCode: 'R06AE07',
    category: 'general',
    drugClass: 'antihistamines',
    brandNames: ['Zyrtec', 'Cetriz'],
    commonForms: ['10mg Tablet', '5mg/5ml Syrup'],
    description: 'Second-generation H1-antihistamine with once-daily urticaria/rhinitis control.',
    bestTimeToTake: 'Once daily, usually in the evening (rhinitis) or as needed for urticaria.',
    foodAdvice: 'Can be taken with or without food.',
    clinicalPearl: 'Slightly more sedating than loratadine in some patients — can cause mild drowsiness.'
  },
  {
    genericName: 'Loratadine',
    atcCode: 'R06AX13',
    category: 'general',
    drugClass: 'antihistamines',
    brandNames: ['Claritin', 'Ativa'],
    commonForms: ['10mg Tablet', '5mg/5ml Syrup'],
    description: 'Non-sedating tricyclic second-generation antihistamine for allergic rhinitis and urticaria.',
    bestTimeToTake: 'Once daily in the morning at a consistent time.',
    foodAdvice: 'Can be taken with or without food.',
    clinicalPearl: 'Metabolised by CYP3A4 then CYP2D6 to active carboxylate; acceptable in most occupational settings.'
  },
  // 10. Antitussives
  {
    genericName: 'Dextromethorphan',
    atcCode: 'R05DA09',
    category: 'general',
    drugClass: 'antitussives',
    brandNames: ['Robitussin DM', 'Benylin DM'],
    commonForms: ['15mg/5ml Syrup', '30mg Tablet'],
    description: 'Sigma receptor agonist central cough suppressant for dry non-productive cough.',
    bestTimeToTake: 'Three or four times daily as needed for dry cough.',
    foodAdvice: 'Can be taken with or without food.',
    clinicalPearl: 'Avoid with MAOIs/SSRIs (serotonin syndrome risk). Most productive coughs benefit more from an expectorant.'
  },
  {
    genericName: 'Codeine',
    atcCode: 'R05DA01',
    category: 'general',
    drugClass: 'antitussives',
    brandNames: ['Codein', 'Codiphan'],
    commonForms: ['15mg Tablet', '30mg Tablet'],
    description: 'Opioid agonist converting to morphine (via CYP2D6) for cough suppression and mild-moderate pain.',
    bestTimeToTake: 'Every 4 to 6 hours as prescribed; lowest effective dose for shortest duration.',
    foodAdvice: 'Can be taken with or without food. Constipation is common — maintain fluid and fibre.',
    clinicalPearl: 'Dose-dependent respiratory depression. Avoid entirely in breastfeeding mothers and do not exceed prescribed dose.'
  },
  // 11. Expectorants
  {
    genericName: 'Guaifenesin',
    atcCode: 'R05CA03',
    category: 'general',
    drugClass: 'expectorants',
    brandNames: ['Mucinex', 'Robitussin'],
    commonForms: ['100mg/5ml Syrup', '200mg/5ml Syrup'],
    description: 'Expectorant increasing bronchial secretion volume to make productive cough easier to clear.',
    bestTimeToTake: 'Every 4 hours with a full glass of water to help loosen mucus.',
    foodAdvice: 'Can be taken with or without food. Drink plenty of water.',
    clinicalPearl: 'Keep hydrated — water is required for guaifenesin to thin secretions effectively.'
  },
  // 12. Decongestants
  {
    genericName: 'Pseudoephedrine',
    atcCode: 'R01BA02',
    category: 'general',
    drugClass: 'decongestants',
    brandNames: ['Sudafed', 'ChestClear'],
    commonForms: ['30mg Tablet', '60mg SR Tablet'],
    description: 'Sympathomimetic alpha-agonist producing vasoconstriction of nasal mucosa blood vessels.',
    bestTimeToTake: 'Three times daily (morning, afternoon, no later than early evening if in immediate-release form).',
    foodAdvice: 'Can be taken with or without food.',
    clinicalPearl: 'Oral decongestant caution: can raise BP/heart rate — avoid uncontrolled hypertension. Avoid within 2 weeks of MAOIs.'
  },
  {
    genericName: 'Oxymetazoline',
    atcCode: 'R01AB07',
    category: 'general',
    drugClass: 'decongestants',
    brandNames: ['Afrin', 'Claritin'],
    commonForms: ['0.05% Nasal Spray'],
    description: 'Long-acting topical imidazoline alpha-agonist for short-term nasal congestion relief.',
    bestTimeToTake: 'Two or three sprays into each nostril as needed, morning and night, up to 3 doses daily.',
    foodAdvice: 'Not applicable (topical).',
    clinicalPearl: 'Rebound congestion (rhinitis medicamentosa) if used more than 3-5 days continuously — strictly limit duration.'
  },
  // 13. Antacids
  {
    genericName: 'Magnesium Hydroxide',
    atcCode: 'A02AA04',
    category: 'general',
    drugClass: 'antacids',
    brandNames: ['Brulox', 'Milk of Magnesia'],
    commonForms: ['Susp 300mg/10ml'],
    description: 'Inorganic antacid neutralising gastric acid with mild laxative effect.',
    bestTimeToTake: 'One to two hours after meals and at bedtime, or as needed for heartburn.',
    foodAdvice: 'Shake bottle well before use. Space 1 hour away from other medications.',
    clinicalPearl: 'Also a mild osmotic laxative — prolonged use can cause soft stools and diarrhoea.'
  },
  {
    genericName: 'Aluminium Hydroxide',
    atcCode: 'A02AA01',
    category: 'general',
    drugClass: 'antacids',
    brandNames: ['Actogel', 'Alogel'],
    commonForms: ['Susp 100mg/5ml'],
    description: 'Slow-acting inorganic antacid with constipating effect, buffering gastric acidity.',
    bestTimeToTake: 'One and three hours after meals and at bedtime.',
    foodAdvice: 'Shake well. Space administration 1 hour away from levothyroxine, tetracyclines and fluoroquinolones.',
    clinicalPearl: 'Long-term use with phosphorus-rich diets: risk of aluminium-related bone disease due to phosphorus depletion.'
  },
  // 14. PPIs (Omeprazole already registered)
  {
    genericName: 'Pantoprazole',
    atcCode: 'A02BC02',
    category: 'general',
    drugClass: 'ppis',
    brandNames: ['Protonix', 'Controloc'],
    commonForms: ['20mg Tablet', '40mg Tablet'],
    description: 'PPI suppressing gastric acid secretion for reflux, ulceration and GI bleed prophylaxis.',
    bestTimeToTake: 'Once daily 30 minutes before breakfast (or before evening meal if taken bid).',
    foodAdvice: 'Take at least 30 minutes before any food. Swallow whole.',
    clinicalPearl: 'Fewer clinically significant CYP interactions than omeprazole — preferred with clopidogrel.'
  },
  // 15. Antiemetics
  {
    genericName: 'Ondansetron',
    atcCode: 'A04AA01',
    category: 'general',
    drugClass: 'antiemetics',
    brandNames: ['Zofran', 'Vomifene'],
    commonForms: ['4mg Tablet', '8mg Tablet', '4mg Wafers'],
    description: 'Serotonin 5-HT3 receptor antagonist antiemetic for chemo-, radiotherapy- and postoperative nausea.',
    bestTimeToTake: 'Typically one hour before chemotherapy, or 30 minutes before radiotherapy; post-op 30 minutes before surgery.',
    foodAdvice: 'Tablets may be taken with or without food.',
    clinicalPearl: 'Caution with arrhythmias/QT prolongation. Constipation is the most common side effect.'
  },
  {
    genericName: 'Metoclopramide',
    atcCode: 'A03FA01',
    category: 'general',
    drugClass: 'antiemetics',
    brandNames: ['Maxolon', 'Plasil'],
    commonForms: ['10mg Tablet', '10mg Injection', '5mg/5ml Syrup'],
    description: 'Dopamine D2 antagonist prokinetic antiemetic increasing gastric motility and oesophageal sphincter tone.',
    bestTimeToTake: 'Up to 3 times daily, 10 to 30 minutes before meals for maximal prokinetic effect.',
    foodAdvice: 'Take just before meals.',
    clinicalPearl: 'Extrapyramidal symptoms (dystonia, tremor) are dose-limiting; use durations under 3 months.'
  },
  // 16. Laxatives
  {
    genericName: 'Lactulose',
    atcCode: 'A06AD11',
    category: 'general',
    drugClass: 'laxatives',
    brandNames: ['Duphalac', 'Belam'],
    commonForms: ['Syrup 3.35g/5ml', 'Powder Sachet'],
    description: 'Synthetic disaccharide osmotic laxative drawing water into the colon and acidifying stool pH.',
    bestTimeToTake: 'Once daily (morning), or twice daily in two divided doses for adults.',
    foodAdvice: 'Take with one or two glasses of juice/water. Sweet-tasting; mixing with fruit juice improves palatability.',
    clinicalPearl: 'Can take 24-72 hours to act. Intestinal gas and bloating typically diminish after several days.'
  },
  {
    genericName: 'Bisacodyl',
    atcCode: 'A06AG02',
    category: 'general',
    drugClass: 'laxatives',
    brandNames: ['Dulcolax', 'Laxamit'],
    commonForms: ['5mg Tablet', '10mg Suppository'],
    description: 'Stimulant laxative acting directly on the colonic enteric nervous system to provoke peristalsis.',
    bestTimeToTake: 'Oral tablets in the evening with water for next-morning effect; suppositories work within an hour.',
    foodAdvice: 'Swallow tablets whole with water — do not crush or chew with antacids or milk.',
    clinicalPearl: 'Do not use for more than 5 consecutive days; keep tablets away from antacids and milk (enteric coat dissolves early).'
  },
  // 17. Antidiarrheals
  {
    genericName: 'Loperamide',
    atcCode: 'A07DA03',
    category: 'general',
    drugClass: 'antidiarrheals',
    brandNames: ['Imodium', 'Gastro-stop'],
    commonForms: ['2mg Capsule', '2mg/5ml Syrup'],
    description: 'Mu-opioid receptor agonist at intestinal wall reducing peristalsis and intestinal fluid secretion.',
    bestTimeToTake: 'After each loose stool, but never exceeding the daily minimum (8mg) or maximum (16mg) doses per label.',
    foodAdvice: 'Swallow capsule with water. Hydrate with ORS or oral electrolyte solution to replace lost fluid.',
    clinicalPearl: 'Not indicated for invasive colitis (fever, bloody stool). Do not exceed 48 hours of unsupervised self-treatment.'
  },
  // 18. Antidiabetics (Metformin, Glibenclamide, Glimepiride, insulin glargine already registered)
  // 19. Antihypertensives (Lisinopril, Amlodipine, Losartan, Atenolol already registered)
  // 20. Diuretics
  {
    genericName: 'Furosemide',
    atcCode: 'C03CA01',
    category: 'hypertension',
    drugClass: 'diuretics',
    brandNames: ['Lasix', 'Frusemide'],
    commonForms: ['20mg Tablet', '40mg Tablet'],
    description: 'High-ceiling loop diuretic and sodium/potassium/chloride-transport cotransporter inhibitor.',
    bestTimeToTake: 'Once or twice daily in the morning (and early afternoon), never after 6pm to preserve sleep.',
    foodAdvice: 'Take with water or meals to reduce GI upset.',
    clinicalPearl: 'Electrolyte loop (Na+, K+, Mg2+) and renal-function monitoring mandatory; gout risk via urate retention.'
  },
  // 21. Beta-Blockers
  {
    genericName: 'Propranolol',
    atcCode: 'C07AA05',
    category: 'hypertension',
    drugClass: 'beta-blockers',
    brandNames: ['Inderal', 'Avlocardyl'],
    commonForms: ['10mg Tablet', '40mg Capsule'],
    description: 'Non-selective beta-1/beta-2 adrenergic antagonist for hypertension, angina, anxiety and migraine prophylaxis.',
    bestTimeToTake: 'Two to three times daily before meals with consistent spacing. Long-acting forms once daily.',
    foodAdvice: 'Take on an empty stomach or with food consistently (food increases bioavailability).',
    clinicalPearl: 'Complete SD-blockade of bronchodilator classes in asthma; do not stop abruptly (rebound tachycardia).'
  },
  // 22. ACE Inhibitors
  {
    genericName: 'Enalapril',
    atcCode: 'C09AA02',
    category: 'hypertension',
    drugClass: 'ace-inhibitors',
    brandNames: ['Vasotec', 'Xanef'],
    commonForms: ['2.5mg Tablet', '5mg Tablet', '10mg Tablet'],
    description: 'Long-acting ACE inhibitor converting to active diacid enalaprilat for hypertension and heart failure.',
    bestTimeToTake: 'Once or twice daily in the morning at a consistent time.',
    foodAdvice: 'Can be taken with or without food.',
    clinicalPearl: 'Monitor serum potassium and creatinine after initial titration. Dry cough is the classic side effect.'
  },
  // 23. ARBs
  {
    genericName: 'Valsartan',
    atcCode: 'C09CA03',
    category: 'hypertension',
    drugClass: 'arbs',
    brandNames: ['Diovan', 'Valtura'],
    commonForms: ['80mg Capsule', '160mg Capsule'],
    description: 'Selective AT1 angiotensin II receptor antagonist for hypertension and heart failure.',
    bestTimeToTake: 'Once daily in the morning at the same time each day.',
    foodAdvice: 'Can be taken with or without food.',
    clinicalPearl: 'Avoid in pregnancy (SAE fetal toxicity). Monitor potassium and renal function on initiation.'
  },
  // 24. Statins
  {
    genericName: 'Rosuvastatin',
    atcCode: 'C10AA07',
    category: 'general',
    drugClass: 'statins',
    brandNames: ['Crestor', 'Rosulip'],
    commonForms: ['5mg Tablet', '10mg Tablet', '20mg Tablet'],
    description: 'High-potency HMG-CoA reductase inhibitor lowering plasma LDL-C.',
    bestTimeToTake: 'Once daily at a consistent hour (any time of day works — does not need to be evening).',
    foodAdvice: 'Can be taken with or without food. Avoid grapefruit juice (mild CYP3A4 interaction).',
    clinicalPearl: 'Minimal CYP metabolism (CYP2C9). Asian ancestry increases exposure — start with lower doses (5mg).'
  },
  // 25. Anticoagulants
  {
    genericName: 'Heparin',
    atcCode: 'B01AB01',
    category: 'general',
    drugClass: 'anticoagulants',
    brandNames: ['Clexane', 'Fragmin'] ,
    commonForms: ['5000 IU SC Injection', 'IV infusion'],
    description: 'Parenteral unfractionated/low-molecular-weight anticoagulant potentiating antithrombin III.',
    bestTimeToTake: 'Administered by injection at the prescribed interval (subcutaneous once or twice daily; IV by aclinician).',
    foodAdvice: 'Not applicable. Vitamin K-rich foods matter only for warfarin, not heparin.',
    clinicalPearl: 'HIT (heparin-induced thrombocytopenia) risk: platelet count drops >50% within days warrant immediate review.'
  },
  // 26. Antiplatelets (Aspirin, Clopidogrel already registered)
  // 27. Corticosteroids
  {
    genericName: 'Prednisolone',
    atcCode: 'H02AB06',
    category: 'general',
    drugClass: 'corticosteroids',
    brandNames: ['Deltacortril', 'Predone'],
    commonForms: ['5mg Tablet', '15mg Tablet'],
    description: 'Systemic glucocorticoid for acute inflammatory and immune-mediated conditions.',
    bestTimeToTake: 'Morning dose (18:00-08:00 window) to mimic the natural cortisol circadian peak.',
    foodAdvice: 'Take with food or milk to avoid gastritis. Taper dose if duration exceeds 7 days.',
    clinicalPearl: 'Abrupt withdrawal after prolonged courses risks Addisonian crises. Monitor glycemia and BP while cycling high doses.'
  },
  {
    genericName: 'Dexamethasone',
    atcCode: 'H02AB02',
    category: 'general',
    drugClass: 'corticosteroids',
    brandNames: ['Decadron', 'Dexa'],
    commonForms: ['4mg Tablet', '4mg/mL Injection', 'Eye drops'],
    description: 'Long-acting potent synthetic glucocorticoid (25x hydrocortisone potency) with minimal mineralo-corticoid activity.',
    bestTimeToTake: 'Morning with breakfast, or per specific treatment schedule (e.g. chemo prep).',
    foodAdvice: 'Take with food or milk. Never stop abruptly after long courses.',
    clinicalPearl: 'Long duration (~36-72h biological) makes split daily dosing unnecessary except in palliative-managerial protocols.'
  },
  // 28. Bronchodilators
  {
    genericName: 'Salmeterol',
    atcCode: 'R03AC12',
    category: 'asthma',
    drugClass: 'bronchodilators',
    brandNames: ['Serevent', 'Seretide'],
    commonForms: ['50mcg Diskus', '25mcg/mdp MDI'],
    description: 'Long-acting beta-2 agonist (LABA) providing smooth-muscle relaxation over 12 hours.',
    bestTimeToTake: 'Twice daily (morning and evening), 12 hours apart — never for acute symptom relief.',
    foodAdvice: 'Inhalation only. Rinse mouth after each use.',
    clinicalPearl: 'Never use as monotherapy in asthma (black box warning) — always pair with inhaled corticosteroid.'
  },
  // 29. Antidepressants
  {
    genericName: 'Fluoxetine',
   atcCode: 'N06AB03',
    category: 'general',
    drugClass: 'antidepressants',
    brandNames: ['Prozac', 'Fludac'],
    commonForms: ['20mg Capsule', '10mg Tablet'],
    description: 'Selective serotonin reuptake inhibitor antidepressant for depression, anxiety, OCD and bulimia.',
    bestTimeToTake: 'Once daily in the morning (activating SSRI); liquid or dissolvable forms available.',
    foodAdvice: 'Can be taken with or without food.',
    clinicalPearl: 'Long plasma half-life (~4-6 days; metabolite 7-15 days) allows a missed dose occasionally without withdrawl.'
  },
  {
    genericName: 'Sertraline',
    atcCode: 'N06AB06',
    category: 'general',
    drugClass: 'antidepressants',
    brandNames: ['Zoloft', 'Toralize'],
    commonForms: ['50mg Tablet', '100mg Tablet'],
    description: 'SSRI antidepressant for depression, panic, social anxiety and PTSD.',
    bestTimeToTake: 'Once daily — morning if it activates the patient, evening if it causes drowsiness.',
    foodAdvice: 'Take with food if nausea occurs.',
    clinicalPearl: 'Minimal CYP inhibition; safer for coprescription with other QT-aggravating drugs than fluoxetine.'
  },
  // 30. Antipsychotics
  {
    genericName: 'Risperidone',
    atcCode: 'N05AX08',
    category: 'general',
    drugClass: 'antipsychotics',
    brandNames: ['Risperdal', 'Risdone'],
    commonForms: ['1mg Tablet', '2mg Tablet', '0.5mg/mL Syrup'],
    description: 'Atypical antipsychotic with high-affinity 5-HT2A and D2 antagonism for psychosis and mania.',
    bestTimeToTake: 'Once or twice daily as prescribed; evening dose promotes consolidation of symptom control.',
    foodAdvice: 'Can be taken with or without food.',
    clinicalPearl: 'Titrate slowly to safeguard against sedation, EPS, and orthostatic hypotension; monitor prolactin and weight.'
  },
  {
    genericName: 'Olanzapine',
    atcCode: 'N05AH03',
    category: 'general',
    drugClass: 'antipsychotics',
    brandNames: ['Zyprexa', 'Oliza'],
    commonForms: ['5mg Tablet', '10mg Tablet'],
    description: 'Thienobenzodiazepine atypical antipsychotic for schizophrenia and bipolar disorder.',
    bestTimeToTake: 'Once daily in the evening — the oral disintegrating tablet can be dissolved on the tongue.',
    foodAdvice: 'Can be taken with or without food.',
    clinicalPearl: 'Highest antipsychotic metabolic risk: monitor weight, lipids and glucose; avoid smoking-induced clearance variability.'
  }
];
