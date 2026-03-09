import type { TranslationData } from "../types";

const en: TranslationData = {
  ui: {
    appName: "OpenMarkers",
    subtitle: "Lab Data Tracker",
    viewAll: "View All",
    allResults: "All Results",
    allResultsDesc: "Overview of all lab categories and biomarkers.",
    qualitativeResults: "Qualitative Results",
    flagged: "flagged",
    allOk: "All OK",
    ok: "OK",
    outOfRange: "OUT OF RANGE",
    normal: "normal",
    ref: "Ref",
    loading: "Analyzing samples...",
    test: "Test",
    biomarkers: "biomarkers",
    biomarker: "biomarker",
    timeline: "Timeline",
    timelineDesc: "All lab dates on a timeline. Click a date to see the full snapshot.",
    comparison: "Comparison",
    export: "Export Data",
    import: "Import Data",
    importConflictTitle: "User Already Exists",
    importConflictMessage: "A user named \"{name}\" already exists. Enter a new name or cancel.",
    importRename: "Import",
    importCancel: "Cancel",
    importError: "Import Error",
    importInvalidJson: "Invalid JSON file.",
    deleteUser: "Delete User",
    deleteUserTitle: "Delete User",
    deleteUserMessage: "Are you sure you want to delete \"{name}\"? All their data will be permanently removed.",
    deleteUserConfirm: "Delete",
    comparisonDesc: "Compare results between two lab dates side by side.",
    snapshot: "Snapshot",
    from: "From",
    to: "To",
    change: "Change",
    improved: "improved",
    worsened: "worsened",
    selectDifferentDates: "Select two different dates to compare.",
    noDataForDate: "No data for this date.",
    reminders: "Reminders",
    lastTested: "last tested",
    daysAgo: "days ago",
    monthsAgo: "months ago",
    overdue: "overdue",
    overdueCategories: "categories overdue for testing",
    sinceLast: "since last",
    overall: "overall",
    personalRange: "Your range",
    correlations: "Correlated Panels",
    correlationsDesc: "Related biomarkers that tell a story together.",
    iron_panel: "Iron Panel",
    lipid_panel: "Lipid Panel",
    liver_panel: "Liver Panel",
    thyroid_panel: "Thyroid Panel",
    kidney_panel: "Kidney Panel",
    aiAnalysis: "AI Analysis",
    aiAnalysisDesc: "Copy this prompt with all your lab data into any AI assistant for a personalized health analysis.",
    copyPrompt: "Copy Prompt",
    copied: "Copied!",
    showPrompt: "Preview",
    hidePrompt: "Hide",
    bioAge: "Biological Age",
    bioAgeDesc: "Estimated using Levine's PhenoAge formula from 9 blood biomarkers.",
    chronoAge: "Chronological Age",
    yearsOlder: "years older",
    yearsYounger: "years younger",
    bioAgeEqual: "same as chrono age",
    mortalityScore: "Mortality Score",
    mortalityScoreDesc: "10-year risk",
    dnamAge: "Est. DNAm Age",
    dnamAgeDesc: "DNA Methylation est.",
    dnamMortality: "DNAm Mortality",
    dnamMortalityDesc: "DNAm-based risk",
    editResults: "Edit Results",
    editResultsLink: "edit results",
    addResult: "Add",
    resultDate: "Date",
    resultValue: "Value",
    save: "Save",
    delete: "Delete",
    deleteResultConfirm: "Are you sure you want to delete this result?",
    authLogin: "Log In",
    authSignUp: "Sign Up",
    authSignOut: "Sign Out",
    authEmail: "Email",
    authPassword: "Password",
    authName: "Name",
    authTryDemo: "Try Demo",
    getStartedDesc: "Get started by importing your lab data or creating a new profile.",
    createProfile: "Create New Profile",
    createProfileDesc: "Start fresh with an empty profile.",
    profileName: "Name",
    sexMale: "Male",
    sexFemale: "Female",
    importingData: "Importing...",
    importDesc: "Upload a JSON file with your lab results.",
    demoDesc: "Explore the app with sample data.",
    settings: "Settings",
    settingsAppearance: "Appearance",
    settingsTheme: "Theme",
    settingsThemeLight: "Light",
    settingsThemeDark: "Dark",
    settingsLanguage: "Language",
    settingsProfiles: "Profiles",
    settingsEditProfile: "Edit Profile",
    settingsAccount: "Account",
    settingsChangeName: "Display Name",
    settingsChangeEmail: "Change Email",
    settingsChangePassword: "Change Password",
    settingsCurrentPassword: "Current Password",
    settingsNewPassword: "New Password",
    settingsNewEmail: "New Email",
    settingsSave: "Save",
    settingsSaved: "Saved!",
    settingsError: "Error",
    settingsDangerZone: "Danger Zone",
    settingsDeleteAccount: "Delete Account",
    settingsDeleteAccountDesc: "Permanently delete your account and all profiles. This cannot be undone.",
    settingsDeleteAccountConfirm: "Type DELETE to confirm",
    settingsDateOfBirth: "Date of Birth",
    settingsSex: "Sex",
    authConsent: "I agree to store my blood test results and lab data",
    authDisclaimer: "This is not a medical device or healthcare service. Not medical advice.",
    heroSubtitle: "Your lab results, visualized. Spot trends your doctor might miss.",
    heroBadgeOpenSource: "Open source",
    heroBadgeBiomarkers: "100+ biomarkers",
    heroBadgeMcp: "AI-ready via MCP",
    heroDemoButton: "Try Demo — no account needed",
    featureChartsTitle: "Charts & Trends",
    featureChartsDesc: "Visualize every biomarker over time with interactive charts. Reference ranges shown inline so you can spot what's out of range at a glance.",
    featureBioAgeTitle: "Biological Age",
    featureBioAgeDesc: "Calculate your biological age from 9 blood biomarkers using the Levine PhenoAge formula. See how your body is aging vs. your actual age.",
    featureBiomarkersTitle: "100+ Biomarkers",
    featureBiomarkersDesc: "From basic biochemistry to hormones, hematology, thyroid, iron, lipids, and more. Import your lab results as JSON — all data stays yours.",
    featureAiTitle: "AI-Ready via MCP",
    featureAiDesc: "Connect Claude, ChatGPT, or any AI assistant to your data via MCP. Get personalized health insights from your own lab history.",
    featurePrivacyTitle: "Private & Open Source",
    featurePrivacyDesc: "Your data is never shared with third parties. No tracking, no analytics. Fully open source — self-host if you want full control.",
  },
  categories: {
    basic_biochemistry: {
      name: "Basic Biochemistry",
      description:
        "Core blood chemistry panel measuring kidney function, electrolytes, liver enzymes, proteins, and lipids.",
    },
    diabetology: {
      name: "Diabetology",
      description: "Blood sugar markers used to screen for and monitor diabetes mellitus.",
    },
    hematology: {
      name: "Hematology",
      description:
        "Complete blood count and differential. Evaluates red blood cells, white blood cells, and platelets to detect anemia, infection, clotting disorders, and blood cancers.",
    },
    coagulation: {
      name: "Coagulation",
      description:
        "Blood clotting tests measuring how quickly and effectively blood forms clots. Used to screen for bleeding or clotting disorders and monitor anticoagulant therapy.",
    },
    immunology: {
      name: "Immunology & Inflammatory Markers",
      description:
        "Markers of inflammation and immune system activity. Used to detect infections, autoimmune conditions, and monitor inflammatory diseases.",
    },
    endocrinology: {
      name: "Endocrinology",
      description:
        "Thyroid function tests and thyroid antibody panel. The thyroid controls metabolism, energy, and many body systems.",
    },
    urine_dipstick: {
      name: "Urine Dipstick (MCHS)",
      description:
        "Rapid chemical analysis of urine using test strips. Screens for kidney disease, urinary tract infections, diabetes, and liver disease.",
    },
    urine_sediment: {
      name: "Urine Sediment (Microscopy)",
      description:
        "Microscopic examination of urine sediment. Detects cells, casts, crystals, and bacteria not captured by dipstick testing.",
    },
    immunity: {
      name: "Specific Immunity",
      description:
        "Antibody levels against specific infectious diseases. Used to verify vaccination status and protective immunity.",
    },
    calculated_indices: {
      name: "Calculated Indices",
      description:
        "Derived values and risk scores calculated from other lab results. Not directly measured but provide clinical insight.",
    },
    iron_metabolism: {
      name: "Iron Metabolism",
      description:
        "Iron levels, storage, and transport markers. Used to diagnose and monitor iron deficiency anemia and iron overload conditions.",
    },
    sleep_study: {
      name: "Sleep Study",
      description:
        "Polygraphy and polysomnography results. Measures breathing events, oxygen saturation, and snoring during sleep to diagnose sleep apnea and other sleep disorders.",
    },
    cardiovascular: {
      name: "Cardiovascular",
      description:
        "Heart and vascular health markers including cardiac stress indicators, coronary calcium scoring, and related risk biomarkers.",
    },
    tumor_markers: {
      name: "Tumor Markers",
      description:
        "Blood markers used for cancer screening, monitoring treatment response, and detecting recurrence. Elevated levels may indicate malignancy but can also be raised by benign conditions.",
    },
  },
  biomarkers: {
    "S-UREA": {
      name: "Urea",
      description:
        "Waste product from protein metabolism, filtered by the kidneys. Elevated levels may indicate impaired kidney function or high protein intake.",
    },
    "S-CREA": {
      name: "Creatinine",
      description:
        "Byproduct of muscle metabolism filtered by kidneys. High values suggest reduced kidney filtration capacity. Naturally higher in muscular individuals.",
    },
    "S-KM": {
      name: "Uric Acid",
      description:
        "End product of purine metabolism. Elevated levels increase the risk of gout and kidney stones. Can be affected by diet (red meat, alcohol, fructose).",
    },
    "S-CKDEPI": {
      name: "eGFR (CKD-EPI)",
      description:
        "Estimated glomerular filtration rate calculated from creatinine using the CKD-EPI formula. Measures how well the kidneys filter blood. Values >1.5 ml/s are normal; <1.0 may indicate significant kidney impairment.",
    },
    "S-Na": {
      name: "Sodium",
      description:
        "Major electrolyte regulating fluid balance and nerve/muscle function. Both low (hyponatremia) and high (hypernatremia) values can be clinically significant.",
    },
    "S-K": {
      name: "Potassium",
      description:
        "Essential electrolyte for heart rhythm, muscle contraction, and nerve signaling. Both low and high levels can cause dangerous cardiac arrhythmias.",
    },
    "S-Cl": {
      name: "Chloride",
      description:
        "Electrolyte that helps maintain fluid balance and acid-base status. Usually moves in tandem with sodium.",
    },
    "S-Mg": {
      name: "Magnesium",
      description:
        "Mineral important for muscle and nerve function, blood sugar control, and bone health. Deficiency is common and can cause fatigue, cramps, and arrhythmias.",
    },
    "S-BIL": {
      name: "Total Bilirubin",
      description:
        "Pigment from red blood cell breakdown processed by the liver. Elevated levels cause jaundice. Mildly elevated values may indicate Gilbert syndrome (benign).",
    },
    "S-ALT": {
      name: "ALT (Alanine Aminotransferase)",
      description:
        "Liver enzyme. Elevated levels indicate liver cell damage. Most specific marker for liver injury. Can be raised by alcohol, medications, fatty liver, or viral hepatitis.",
    },
    "S-AST": {
      name: "AST (Aspartate Aminotransferase)",
      description:
        "Enzyme found in liver, heart, and muscle. Elevated with liver damage, heart attack, or intense exercise. Less liver-specific than ALT.",
    },
    "S-GGT": {
      name: "GGT (Gamma-Glutamyl Transferase)",
      description:
        "Liver and bile duct enzyme. Sensitive marker for bile duct obstruction and alcohol use. Often the first liver enzyme to rise with alcohol-related liver damage.",
    },
    "S-ALP": {
      name: "ALP (Alkaline Phosphatase)",
      description:
        "Enzyme found in liver, bone, and bile ducts. Elevated in bone growth, bile duct obstruction, or liver disease. Normally higher in growing adolescents.",
    },
    "S-PAMS": {
      name: "Pancreatic Amylase",
      description:
        "Enzyme produced by the pancreas to digest starch. Elevated levels may indicate pancreatitis or pancreatic disease.",
    },
    "S-CB": {
      name: "Total Protein",
      description:
        "Total amount of albumin and globulin proteins in blood. Reflects nutritional status, liver synthetic function, and immune system activity.",
    },
    "S-ALB": {
      name: "Albumin",
      description:
        "Most abundant blood protein, made by the liver. Maintains fluid balance and transports hormones/drugs. Low values indicate liver disease, malnutrition, or kidney loss.",
    },
    "S-CHOL": {
      name: "Total Cholesterol",
      description:
        "Total amount of cholesterol in blood including LDL, HDL, and VLDL. Elevated levels increase cardiovascular disease risk. Target depends on individual risk factors.",
    },
    "S-HDL": {
      name: "HDL Cholesterol",
      description:
        '"Good" cholesterol that removes excess cholesterol from arteries. Higher values are protective against cardiovascular disease. Low HDL increases heart disease risk.',
    },
    "S-LDL": {
      name: "LDL Cholesterol",
      description:
        '"Bad" cholesterol that deposits in artery walls causing atherosclerosis. Primary target for cardiovascular risk reduction. Lower is better, especially with other risk factors.',
    },
    "S-TGL": {
      name: "Triglycerides",
      description:
        "Fat molecules in the blood, mainly from dietary sources. Elevated by high carbohydrate/alcohol intake. Very high levels (>10 mmol/l) risk pancreatitis.",
    },
    "S-nHDL": {
      name: "Non-HDL Cholesterol",
      description:
        "Total cholesterol minus HDL. Captures all atherogenic lipoproteins (LDL + VLDL). Better predictor of cardiovascular risk than LDL alone, especially with high triglycerides.",
    },
    "S-VITD": {
      name: "Vitamin D (25-OH)",
      description:
        "Measures vitamin D stores. Essential for bone health, immune function, and mood. Deficiency is very common, especially in northern latitudes and winter months.",
    },
    "P-P-GLU": {
      name: "Fasting Glucose",
      description:
        "Blood sugar measured after fasting. Primary screening test for diabetes. Values 5.6-6.9 indicate prediabetes; >=7.0 suggests diabetes.",
    },
    "B-WBC": {
      name: "White Blood Cells",
      description:
        "Total count of immune cells. Elevated with infection, inflammation, or stress. Low values (leukopenia) increase infection risk.",
    },
    "B-RBC": {
      name: "Red Blood Cells",
      description:
        "Oxygen-carrying cells. Low count indicates anemia. High count may indicate dehydration or polycythemia.",
    },
    "B-HB": {
      name: "Hemoglobin",
      description:
        "Oxygen-carrying protein in red blood cells. Low values indicate anemia. Key marker for blood's oxygen-carrying capacity.",
    },
    "B-HCT": {
      name: "Hematocrit",
      description:
        "Percentage of blood volume occupied by red blood cells. Elevated with dehydration; low with anemia or fluid overload.",
    },
    "B-MCV": {
      name: "Mean Corpuscular Volume",
      description:
        "Average size of red blood cells. Low MCV suggests iron deficiency; high MCV suggests B12/folate deficiency or alcohol use.",
    },
    "B-MCH": {
      name: "Mean Corpuscular Hemoglobin",
      description:
        "Average amount of hemoglobin per red blood cell. Correlates with MCV - low in iron deficiency, high in B12/folate deficiency.",
    },
    "B-MCHC": {
      name: "Mean Corpuscular Hemoglobin Concentration",
      description: "Average hemoglobin concentration within red blood cells. Helps classify types of anemia.",
    },
    "B-PLT": {
      name: "Platelets",
      description:
        "Cell fragments essential for blood clotting. Low counts (thrombocytopenia) risk bleeding; high counts (thrombocytosis) may indicate inflammation or blood disorder.",
    },
    "B-RDW": {
      name: "Red Cell Distribution Width",
      description:
        "Measures variation in red blood cell size. Elevated values suggest mixed causes of anemia (e.g., combined iron and B12 deficiency).",
    },
    "B-neu": {
      name: "Neutrophils (%)",
      description:
        "Percentage of white blood cells that are neutrophils - the first responders to bacterial infection. Low percentage may indicate viral infection or benign ethnic neutropenia.",
    },
    "B-lymf": {
      name: "Lymphocytes (%)",
      description:
        "Percentage of white blood cells that are lymphocytes - key to adaptive immunity (T-cells, B-cells). Elevated percentage often reflects low neutrophils (relative lymphocytosis) or viral infection.",
    },
    "B-mono": {
      name: "Monocytes (%)",
      description:
        "Percentage of white blood cells that are monocytes - involved in chronic inflammation and immune defense. Mildly elevated in infections and autoimmune conditions.",
    },
    "B-eo": {
      name: "Eosinophils (%)",
      description:
        "Percentage of white blood cells that are eosinophils - involved in allergic reactions and parasitic infections. Elevated in allergies, asthma, and parasitic disease.",
    },
    "B-baso": {
      name: "Basophils (%)",
      description:
        "Rarest white blood cell type. Involved in allergic and inflammatory reactions. Rarely clinically significant in isolation.",
    },
    "B-NEabs": {
      name: "Neutrophils (Absolute)",
      description:
        "Absolute count of neutrophils. Values below 2.0 are mildly low (mild neutropenia); below 1.0 significantly increases infection risk. More clinically useful than the percentage.",
    },
    "B-LYabs": {
      name: "Lymphocytes (Absolute)",
      description:
        "Absolute count of lymphocytes. Low values indicate immunodeficiency risk. Elevated in viral infections and some blood cancers.",
    },
    "B-MOabs": {
      name: "Monocytes (Absolute)",
      description:
        "Absolute count of monocytes. Elevated in chronic infections, autoimmune diseases, and some blood disorders.",
    },
    "B-EOabs": {
      name: "Eosinophils (Absolute)",
      description:
        "Absolute count of eosinophils. Elevated in allergic conditions, parasitic infections, and eosinophilic disorders.",
    },
    "B-BAabs": {
      name: "Basophils (Absolute)",
      description:
        "Absolute count of basophils. Rarely abnormal in isolation. Very high values may suggest a myeloproliferative disorder.",
    },
    "C-Quick": {
      name: "Prothrombin Time (Quick Ratio)",
      description:
        "Measures the extrinsic clotting pathway. Expressed as a ratio - values within 0.8-1.2 are normal. Prolonged in liver disease, vitamin K deficiency, or warfarin use.",
    },
    "C-INR": {
      name: "INR",
      description:
        "International Normalized Ratio - standardized prothrombin time used to monitor warfarin therapy. Normal is ~1.0; therapeutic range on warfarin is typically 2.0-3.0.",
    },
    "C-QT": {
      name: "Prothrombin Time (seconds)",
      description:
        "Time in seconds for blood to clot via the extrinsic pathway. Raw measurement used to calculate INR and Quick ratio.",
    },
    "C-APTTr": {
      name: "APTT Ratio",
      description:
        "Activated partial thromboplastin time ratio - measures the intrinsic clotting pathway. Prolonged in hemophilia, heparin use, or lupus anticoagulant.",
    },
    "C-APTT": {
      name: "APTT (seconds)",
      description:
        "Activated partial thromboplastin time - raw clotting time for the intrinsic pathway. Normal range is typically 25-35 seconds.",
    },
    "S-CRP": {
      name: "C-Reactive Protein",
      description:
        "Acute-phase protein produced by the liver in response to inflammation. Rises rapidly with infection, injury, or inflammatory disease. Non-specific but very sensitive marker.",
    },
    "B-ESR": {
      name: "Erythrocyte Sedimentation Rate",
      description:
        "Non-specific marker of inflammation. Measures how fast red blood cells settle in a tube. Elevated in infection, autoimmune disease, and cancer. Slower to change than CRP.",
    },
    "S-TSH": {
      name: "TSH (Thyroid-Stimulating Hormone)",
      description:
        "Pituitary hormone that stimulates the thyroid. Primary screening test for thyroid disorders. High TSH = underactive thyroid (hypothyroidism); low TSH = overactive (hyperthyroidism).",
    },
    "S-fT4": {
      name: "Free T4 (Thyroxine)",
      description:
        "Active thyroid hormone available to tissues. Low fT4 with high TSH confirms hypothyroidism. Normal fT4 with mildly elevated TSH is subclinical hypothyroidism.",
    },
    "S-aTSH": {
      name: "Anti-TSH Receptor Antibodies (TRAb)",
      description:
        "Antibodies against the TSH receptor. Elevated in Graves' disease (autoimmune hyperthyroidism). Important for differential diagnosis of thyroid disorders.",
    },
    "S-aTG": {
      name: "Anti-Thyroglobulin Antibodies",
      description:
        "Antibodies against thyroglobulin protein. Elevated in Hashimoto's thyroiditis and other autoimmune thyroid diseases. Present in ~10% of healthy individuals.",
    },
    "S-aTPO": {
      name: "Anti-TPO Antibodies",
      description:
        "Antibodies against thyroid peroxidase enzyme. Most sensitive marker for autoimmune thyroid disease (Hashimoto's). Positive in ~90% of Hashimoto's patients.",
    },
    "U-GLU": {
      name: "Urine Glucose",
      description:
        "Glucose in urine. Normally absent - presence suggests blood sugar exceeding the kidney's reabsorption threshold (typically >10 mmol/l), as in uncontrolled diabetes.",
    },
    "U-PROT": {
      name: "Urine Protein",
      description:
        "Protein in urine. Normally absent or trace. Persistent proteinuria indicates kidney damage, especially in diabetes or hypertension.",
    },
    "U-BILI": {
      name: "Urine Bilirubin",
      description:
        "Bilirubin in urine. Normally absent - presence suggests liver or bile duct disease causing conjugated bilirubin to spill into urine.",
    },
    "U-UBG": {
      name: "Urobilinogen",
      description:
        "Breakdown product of bilirubin. Small amounts are normal. Elevated in hemolytic anemia or liver disease; absent in complete bile duct obstruction.",
    },
    "U-PH": {
      name: "Urine pH",
      description:
        "Acidity/alkalinity of urine. Normal range 4.5-8.0. Affected by diet, medications, and metabolic conditions. Acidic urine is common with high protein diets.",
    },
    "U-KREV": {
      name: "Urine Blood",
      description:
        "Blood in urine (hematuria). Normally absent. Presence may indicate kidney stones, urinary tract infection, or bladder/kidney disease.",
    },
    "U-LEUC": {
      name: "Urine Leukocytes",
      description:
        "White blood cells in urine. Normally absent. Presence suggests urinary tract infection or kidney inflammation.",
    },
    "U-KETO": {
      name: "Urine Ketones",
      description:
        "Ketone bodies in urine. Normally absent. Present during fasting, low-carb diets, uncontrolled diabetes (diabetic ketoacidosis), or prolonged vomiting.",
    },
    "U-NIT": {
      name: "Urine Nitrites",
      description:
        "Bacterial metabolite in urine. Normally absent. Positive result strongly suggests urinary tract infection with gram-negative bacteria.",
    },
    "U-HUST": {
      name: "Urine Specific Gravity",
      description:
        "Measures urine concentration. Reflects hydration status and kidney concentrating ability. Low values suggest overhydration; high values suggest dehydration.",
    },
    "U-EPPL": {
      name: "Epithelial Cells",
      description:
        "Cells lining the urinary tract. Small numbers are normal from natural shedding. High counts may indicate contamination or urinary tract inflammation.",
    },
    "U-ERY": {
      name: "Urine Erythrocytes (Microscopy)",
      description:
        "Red blood cells seen under microscope. More precise than dipstick blood test. Elevated counts require investigation for kidney stones, infection, or malignancy.",
    },
    "U-LEUKU": {
      name: "Urine Leukocytes (Microscopy)",
      description:
        "White blood cells seen under microscope. Elevated counts indicate urinary tract infection or kidney inflammation.",
    },
    "U-UBAKT": {
      name: "Urine Bacteria",
      description:
        "Bacteria seen under microscope. Small numbers may be contamination. Significant bacteriuria with symptoms suggests urinary tract infection.",
    },
    "S-MorbilliG": {
      name: "Measles IgG Antibodies",
      description:
        "IgG antibodies against measles virus. Indicates immunity from vaccination or past infection. Sufficient level for post-vaccination is >=275 IU/l. High values confirm strong protection.",
    },
    "S-Tetanus": {
      name: "Tetanus Antibodies",
      description:
        "IgG antibodies against tetanus toxoid. Measures vaccine-induced immunity. 1.0-5.0 IU/ml indicates long-term protection; recheck in 5 years.",
    },
    "MDRD-UreaAlb": {
      name: "eGFR (MDRD with Urea & Albumin)",
      description:
        "Alternative kidney function estimate using MDRD formula with urea and albumin. Similar to CKD-EPI but uses additional inputs. Values >1.5 ml/s are normal.",
    },
    "S-FIB4": {
      name: "FIB-4 Index",
      description:
        "Non-invasive fibrosis score calculated from age, AST, ALT, and platelets. Estimates liver fibrosis risk. <1.3 = low risk; 1.3-2.67 = intermediate; >2.67 = high risk.",
    },
    "S-AMS": {
      name: "Serum Amylase",
      description:
        "Enzyme that breaks down starch, produced by the pancreas and salivary glands. Elevated in pancreatitis, salivary gland inflammation, or bowel obstruction.",
    },
    "S-Fe": {
      name: "Serum Iron",
      description:
        "Iron circulating in the blood bound to transferrin. Low levels indicate iron deficiency; very high levels may suggest iron overload or recent iron supplementation.",
    },
    "S-Feritin": {
      name: "Ferritin",
      description:
        "Primary iron storage protein. The most sensitive marker for iron deficiency - low ferritin is the earliest sign. Also an acute-phase reactant (rises with inflammation).",
    },
    "S-Transferin": {
      name: "Transferrin",
      description:
        "Iron transport protein in blood. Elevated when the body needs more iron (iron deficiency). Low in liver disease, malnutrition, or inflammation.",
    },
    "S-TransSat": {
      name: "Transferrin Saturation",
      description:
        "Percentage of transferrin binding sites occupied by iron. Low saturation (<20%) strongly suggests iron deficiency. High saturation (>45%) may indicate iron overload.",
    },
    "S-TransRec": {
      name: "Soluble Transferrin Receptors",
      description:
        "Receptor fragments shed into blood when cells need more iron. Elevated in iron deficiency anemia. Unlike ferritin, not affected by inflammation - useful when ferritin is unreliable.",
    },
    "S-UIBC": {
      name: "UIBC (Unsaturated Iron Binding Capacity)",
      description:
        "Available iron-binding capacity of transferrin. Elevated in iron deficiency as the body produces more transferrin to capture scarce iron.",
    },
    "S-TIBC": {
      name: "TIBC (Total Iron Binding Capacity)",
      description:
        "Total capacity of transferrin to bind iron (UIBC + serum iron). Elevated in iron deficiency; low in iron overload, liver disease, or chronic inflammation.",
    },
    "S-IgA": {
      name: "IgA (Immunoglobulin A)",
      description:
        "Antibody protecting mucosal surfaces (gut, respiratory tract). Measured to rule out IgA deficiency before celiac disease testing, as low IgA causes false-negative celiac results.",
    },
    "S-Anti-tTg-IgA": {
      name: "Anti-tTG IgA (Tissue Transglutaminase)",
      description:
        "Primary screening antibody for celiac disease. Elevated levels suggest immune reaction to gluten. Requires normal IgA levels for reliable results.",
    },
    "B-MPV": {
      name: "Mean Platelet Volume",
      description:
        "Average size of platelets. Larger platelets are younger and more active. Elevated MPV with low platelet count suggests increased platelet destruction or consumption.",
    },
    "SL-AHI": {
      name: "Apnea-Hypopnea Index (AHI)",
      description:
        "Number of apneas and hypopneas per hour of sleep. Primary metric for sleep apnea severity. Normal <5, mild 5-15, moderate 15-30, severe >30.",
    },
    "SL-OA": {
      name: "Obstructive Apneas",
      description:
        "Obstructive apnea events per hour - complete airway blockage for >=10 seconds during sleep despite breathing effort.",
    },
    "SL-HY": {
      name: "Hypopneas",
      description:
        "Partial airway obstruction events per hour - reduced airflow (>=30%) with oxygen desaturation or arousal. Usually the largest component of AHI.",
    },
    "SL-MA": {
      name: "Mixed Apneas",
      description:
        "Events per hour that begin as central apnea (no breathing effort) and transition to obstructive apnea. Rare in most patients.",
    },
    "SL-CA": {
      name: "Central Apneas",
      description:
        "Events per hour where the brain temporarily stops sending signals to breathe. No airway obstruction, no breathing effort. Common in heart failure patients.",
    },
    "SL-ODI": {
      name: "Oxygen Desaturation Index (ODI)",
      description:
        "Number of >=3% oxygen desaturation events per hour. Closely correlates with AHI. Normal <5; elevated values indicate significant intermittent hypoxia.",
    },
    "SL-SpO2min": {
      name: "Minimum SpO2",
      description:
        "Lowest oxygen saturation recorded during the night. Values below 90% are clinically significant; below 80% indicates severe desaturation.",
    },
    "SL-SpO2avg": {
      name: "Average SpO2",
      description:
        "Mean oxygen saturation throughout the entire sleep period. Normal >=94%. Reduced values suggest chronic intermittent hypoxia from sleep-disordered breathing.",
    },
    "SL-T90": {
      name: "Time Below 90% SpO2",
      description:
        "Percentage of total sleep time spent with oxygen saturation below 90%. Normal <1%. Elevated values indicate significant nocturnal hypoxemia.",
    },
    "SL-SFI": {
      name: "Snoring Frequency Index (SFI)",
      description:
        "Proportion of sleep time spent snoring. Higher values indicate more persistent snoring, a hallmark of upper airway resistance.",
    },
    "B-HbA1c": {
      name: "HbA1c (Glycated Hemoglobin)",
      description:
        "Measures average blood sugar over the past 2-3 months. Gold standard for long-term glucose control. <5.7% normal, 5.7-6.4% prediabetes, ≥6.5% diabetes.",
    },
    "S-INS": {
      name: "Fasting Insulin",
      description:
        "Insulin released by the pancreas to regulate blood sugar. Fasting levels reveal insulin resistance — elevated insulin with normal glucose is an early warning sign of metabolic dysfunction.",
    },
    "S-DHEA": {
      name: "DHEA-S (Dehydroepiandrosterone Sulfate)",
      description:
        "Adrenal 'recovery hormone' supporting stress resilience, repair processes, immune function, and vitality. Declines with age; higher levels are associated with longevity.",
    },
    "S-TESTO": {
      name: "Testosterone (Total)",
      description:
        "Primary male sex hormone, crucial for both men and women. Supports muscle strength, bone density, mood, libido, and cardiovascular health. Declines with age.",
    },
    "S-fTESTO": {
      name: "Free Testosterone",
      description:
        "Bioavailable form of testosterone not bound to proteins. More clinically relevant than total testosterone as it reflects the hormone actually available to tissues.",
    },
    "S-hsCRP": {
      name: "hs-CRP (High-Sensitivity C-Reactive Protein)",
      description:
        "Ultra-sensitive measure of systemic inflammation. Gold standard inflammatory marker — elevated levels are strongly linked to cardiovascular risk, cognitive decline, and chronic disease.",
    },
    "S-TNF": {
      name: "TNF-alpha (Tumor Necrosis Factor)",
      description:
        "Key inflammatory cytokine involved in systemic inflammation and immune regulation. Elevated levels are associated with chronic inflammatory conditions, autoimmune diseases, and metabolic dysfunction.",
    },
    "S-S100B": {
      name: "S-100B Protein",
      description:
        "Neuroinflammation marker. Elevated levels indicate blood-brain barrier disruption, brain injury, or neuroinflammation. Both high and low levels are linked to cognitive decline.",
    },
    "S-ApoA1": {
      name: "Apolipoprotein A1 (Apo-A1)",
      description:
        "Primary protein component of HDL particles. A more accurate metric to measure HDL particles and thus cardiovascular protection. Higher levels indicate better reverse cholesterol transport.",
    },
    "S-LDLP": {
      name: "LDL Particle Number (LDL-P)",
      description:
        "Counts the actual number of LDL particles, not just cholesterol content. A more accurate measure of LDL-driven cardiovascular risk than standard LDL-C, especially when particle size varies.",
    },
    "S-oxLDL": {
      name: "Oxidized LDL (oxLDL)",
      description:
        "LDL cholesterol that has been damaged by oxidation. Directly measures oxidative stress, inflammation, endothelial dysfunction, and the development of arterial plaque.",
    },
    "S-Lpa": {
      name: "Lipoprotein(a) [Lp(a)]",
      description:
        "Genetically determined lipoprotein promoting atherosclerosis and thrombosis. Elevated levels are linked to increased risk of heart disease and stroke. Largely unaffected by lifestyle changes.",
    },
    "S-CysC": {
      name: "Cystatin C",
      description:
        "A more sensitive biomarker of kidney function and cardiovascular risk than creatinine. Not affected by muscle mass, diet, or age — provides a cleaner estimate of true kidney filtration.",
    },
    "S-O3I": {
      name: "Omega-3 Index",
      description:
        "Measures EPA and DHA as a percentage of red blood cell membranes. Higher levels (>8%) are strongly linked to reduced cardiovascular risk, lower inflammation, and better brain health.",
    },
    "S-GSH": {
      name: "Glutathione",
      description:
        "The body's master antioxidant, essential for detoxification, reducing oxidative stress, and supporting immune function. Declines with age; maintaining high levels is linked to longevity.",
    },
    "S-BNP": {
      name: "BNP (B-type Natriuretic Peptide)",
      description:
        "Hormone released by the heart in response to stretching of heart muscle. Measures heart stress or failure. Low values indicate a healthy heart; elevated levels suggest cardiac strain or heart failure.",
    },
    "S-CAC": {
      name: "CAC Score (Coronary Artery Calcium)",
      description:
        "CT scan measurement of calcium buildup in coronary arteries. Score of 0 is perfect — indicates no detectable plaque. Higher scores quantify atherosclerotic burden and cardiovascular risk.",
    },
    "S-TelL": {
      name: "Telomere Length",
      description:
        "Measures the protective caps on chromosomes that shorten with age. Reflects cellular aging and impacts the risk of age-related diseases. Longer telomeres are associated with biological youth.",
    },
    "S-HCY": {
      name: "Homocysteine",
      description:
        "Amino acid linked to cardiovascular disease, stroke, and cognitive decline when elevated. High levels indicate B12/folate deficiency or methylation issues. Easily treatable with B vitamins.",
    },
    "S-LDH": {
      name: "LDH (Lactate Dehydrogenase)",
      description:
        "Enzyme released when cells are damaged. Elevated in many conditions including heart attack, liver disease, hemolytic anemia, and cancer. Non-specific but useful as a general tissue damage marker.",
    },
    "S-DBIL": {
      name: "Direct Bilirubin (Conjugated)",
      description:
        "Bilirubin processed by the liver. Elevated specifically in bile duct obstruction, liver disease, or hepatitis. Helps differentiate causes of jaundice when total bilirubin is high.",
    },
    "S-ApoB": {
      name: "Apolipoprotein B (ApoB)",
      description:
        "One ApoB molecule per atherogenic lipoprotein particle (LDL, VLDL, Lp(a)). Considered the single best measure of atherogenic risk — better than LDL-C alone. Lower is better.",
    },
    "S-VLDL": {
      name: "VLDL Cholesterol",
      description:
        "Very low-density lipoprotein cholesterol, mainly carrying triglycerides. Elevated with high carbohydrate/alcohol intake and metabolic syndrome. Contributes to atherosclerosis alongside LDL.",
    },
    "S-Ca": {
      name: "Calcium",
      description:
        "Essential mineral for bones, muscle contraction, nerve signaling, and blood clotting. Both high (hyperparathyroidism, cancer) and low (vitamin D deficiency) values are clinically significant.",
    },
    "S-P": {
      name: "Phosphorus (Phosphate)",
      description:
        "Mineral essential for bone health, energy production, and acid-base balance. Works in tandem with calcium. Abnormal levels can indicate kidney disease, parathyroid disorders, or vitamin D issues.",
    },
    "S-B12": {
      name: "Vitamin B12 (Cobalamin)",
      description:
        "Essential vitamin for nerve function, red blood cell formation, and DNA synthesis. Deficiency causes megaloblastic anemia and neurological damage. Common in vegetarians and older adults.",
    },
    "S-FOL": {
      name: "Folate (Folic Acid)",
      description:
        "B vitamin essential for DNA synthesis, red blood cell production, and neural tube development. Deficiency causes megaloblastic anemia. Important in pregnancy and alongside B12.",
    },
    "S-fT3": {
      name: "Free T3 (Triiodothyronine)",
      description:
        "The most active thyroid hormone — T4 is converted to T3 in tissues. Low fT3 with normal TSH/fT4 may indicate 'sick euthyroid syndrome' or poor T4-to-T3 conversion.",
    },
    "S-E2": {
      name: "Estradiol (E2)",
      description:
        "Primary estrogen hormone. Important in both sexes — regulates bone density, cardiovascular health, mood, and libido. In men, very high or very low levels are both problematic.",
    },
    "S-CORT": {
      name: "Cortisol",
      description:
        "Primary stress hormone produced by the adrenal glands. Follows a diurnal pattern (high in morning, low at night). Chronically elevated levels indicate stress, Cushing's syndrome; low levels suggest adrenal insufficiency.",
    },
    "S-IGF1": {
      name: "IGF-1 (Insulin-like Growth Factor 1)",
      description:
        "Growth factor mediating the effects of growth hormone. Involved in muscle growth, bone density, and tissue repair. High levels may increase cancer risk; low levels indicate GH deficiency.",
    },
    "S-SHBG": {
      name: "SHBG (Sex Hormone Binding Globulin)",
      description:
        "Protein that binds and transports sex hormones (testosterone, estradiol). High SHBG reduces free/bioavailable hormones. Affected by thyroid function, liver health, obesity, and aging.",
    },
    "S-PRL": {
      name: "Prolactin",
      description:
        "Pituitary hormone primarily involved in lactation. Elevated in both sexes by pituitary adenomas, medications, stress, or hypothyroidism. High levels can suppress testosterone and cause symptoms.",
    },
    "S-LH": {
      name: "LH (Luteinizing Hormone)",
      description:
        "Pituitary hormone stimulating testosterone production in men and ovulation in women. Used with FSH to evaluate fertility, hypogonadism, and pituitary function.",
    },
    "S-FSH": {
      name: "FSH (Follicle-Stimulating Hormone)",
      description:
        "Pituitary hormone regulating reproductive function. In men, stimulates sperm production. Elevated FSH with low testosterone indicates primary hypogonadism (testicular failure).",
    },
    "B-RET": {
      name: "Reticulocytes",
      description:
        "Immature red blood cells freshly released from bone marrow. Elevated count indicates active red blood cell production (response to anemia or blood loss). Low count suggests bone marrow suppression.",
    },
    "S-IgG": {
      name: "IgG (Immunoglobulin G)",
      description:
        "Most abundant antibody in blood, providing long-term immunity. Elevated in chronic infections, autoimmune diseases, and liver disease. Low levels indicate immunodeficiency.",
    },
    "S-IgM": {
      name: "IgM (Immunoglobulin M)",
      description:
        "First antibody produced in response to new infections. Elevated IgM indicates acute or recent infection. Also elevated in Waldenstrom's macroglobulinemia and some autoimmune conditions.",
    },
    "S-IgE": {
      name: "IgE (Immunoglobulin E)",
      description:
        "Antibody involved in allergic reactions and parasitic defense. Elevated in allergies, asthma, eczema, and parasitic infections. Used to assess allergic status and monitor treatment.",
    },
    "S-HOMA": {
      name: "HOMA-IR (Insulin Resistance Index)",
      description:
        "Calculated from fasting glucose and insulin: (glucose × insulin) / 22.5. Estimates insulin resistance. Values <1.0 are optimal; >2.5 suggests significant insulin resistance and metabolic risk.",
    },
    "S-PSA": {
      name: "PSA (Prostate-Specific Antigen)",
      description:
        "Protein produced by the prostate gland. Primary screening marker for prostate cancer in men. Also elevated in benign prostatic hyperplasia and prostatitis. Rising trend is more significant than absolute value.",
    },
    "S-FAI": {
      name: "Free Androgen Index",
      description:
        "Calculated ratio of total testosterone to SHBG, estimating bioavailable testosterone. Useful when SHBG is abnormal. High values may indicate PCOS in women or androgen excess.",
    },
    "S-PTH": {
      name: "PTH (Parathyroid Hormone)",
      description:
        "Hormone regulating calcium and phosphorus balance. Elevated in vitamin D deficiency (secondary hyperparathyroidism), primary hyperparathyroidism, or kidney disease. Low levels seen after thyroid surgery.",
    },
    "S-Cai": {
      name: "Ionized Calcium",
      description:
        "Biologically active form of calcium in the blood, not bound to proteins. More accurate than total calcium, especially when albumin is abnormal. Low levels may indicate hypoparathyroidism or vitamin D deficiency.",
    },
    "S-Cpep": {
      name: "C-Peptide",
      description:
        "Byproduct of insulin production, released in equal amounts. Measures endogenous insulin secretion independent of exogenous insulin. Useful for distinguishing type 1 from type 2 diabetes.",
    },
    "S-PROG": {
      name: "Progesterone",
      description:
        "Steroid hormone primarily involved in the menstrual cycle and pregnancy. In men, produced in small amounts by the adrenal glands and testes. Elevated levels are uncommon and may indicate adrenal or testicular pathology.",
    },
    "S-LIST": {
      name: "Free Testosterone Index (LIST)",
      description:
        "Lab-calculated index of free testosterone. Different from FAI — uses a distinct formula. A higher value indicates more bioavailable testosterone relative to binding proteins.",
    },
  },
};

export default en;
