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
    timelineDesc:
      "All lab dates on a timeline. Click a date to see the full snapshot.",
    comparison: "Comparison",
    export: "Export Data",
    import: "Import Data",
    importConflictTitle: "User Already Exists",
    importConflictMessage:
      'A user named "{name}" already exists. Enter a new name or cancel.',
    importRename: "Import",
    importCancel: "Cancel",
    importError: "Import Error",
    importInvalidJson: "Invalid JSON file.",
    deleteUser: "Delete User",
    deleteUserTitle: "Delete User",
    deleteUserMessage:
      'Are you sure you want to delete "{name}"? All their data will be permanently removed.',
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
    overdueDesc: "Some tests haven't been updated in a while",
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
    aiAnalysisDesc:
      "Use the {mcpLink} or {cliLink} for ongoing AI-powered analysis, or copy this prompt into any AI assistant for a one-time review.",
    aiAnalysisSetupMcp: "MCP server",
    aiAnalysisSetupCli: "CLI tool",
    copyPrompt: "Copy Prompt",
    copied: "Copied!",
    showPrompt: "Preview",
    hidePrompt: "Hide",
    bioAge: "Biological Age",
    bioAgeDesc:
      "Estimated using Levine's PhenoAge formula from 9 blood biomarkers.",
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
    bioAgeLocked: "Add missing markers to unlock",
    bioAgeLockedMarkers: "Missing markers",
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
    authTryDemo: "Try Demo",
    getStarted: "Get Started",
    getStartedFree: "Join the community. Share your markers with the world.",
    goToApp: "Go to App",
    landingWelcomeBack: "Your data is waiting for you.",
    landingPeople: "people",
    getStartedDesc:
      "Get started by importing your lab data or creating a new profile.",
    createProfile: "Create New Profile",
    createProfileDesc: "Start fresh with an empty profile.",
    profileName: "Name",
    dateOfBirth: "Date of Birth",
    sexMale: "Male",
    sexFemale: "Female",
    importingData: "Importing...",
    importDesc: "Upload a JSON file with your lab results.",
    importSettingsDesc:
      "Import lab results from a JSON file. This will create a new profile with the imported data — your existing profiles won't be affected.",
    importSelectFile: "Select JSON File",
    demoDesc: "Explore the app with sample data.",
    demoMode: "You are viewing sample data",
    exitDemo: "Exit demo",
    addLabVisit: "Add Lab Visit",
    addManually: "Add manually",
    addLabVisitDesc: "Enter results from a blood test manually.",
    addLabVisitDate: "Test Date",
    addLabVisitSearch: "Search biomarkers...",
    addLabVisitSubmit: "Save Results",
    addLabVisitSaving: "Saving...",
    addLabVisitNValues: "{n} values entered",
    addLabVisitNoMatch: "No biomarkers match your search.",
    addLabVisitEmpty: "Enter at least one value.",
    addYourData: "Add Your Data",
    addYourDataDesc:
      "Your profile is ready. Add your first lab results to get started.",
    uploadLabReport: "Upload Lab Report",
    uploadLabReportDesc: "Drop a PDF or photo of your blood test results",
    uploadDrop: "Drop your lab report here",
    uploadFormats: "PDF, JPG, or PNG — up to 20 MB",
    uploadHint:
      "Best results with a single lab visit. Large reports with many dates may lose some values.",
    uploadChooseFile: "Choose file",
    uploadUploading: "Uploading...",
    uploadReading: "Reading your lab report...",
    uploadReview: "Review extracted values",
    uploadReviewDesc:
      "Check the values below and fix any mistakes before importing.",
    uploadSuspicious: "check value — may be wrong unit",
    uploadAiDisclaimer:
      "Values are extracted by AI and may contain errors. Please verify against your original report before importing.",
    uploadConfirm: "Confirm & Import",
    uploadCancel: "Cancel",
    uploadDontClose: "Please don't close this page while processing.",
    uploadImporting: "Importing...",
    uploadSuccess: "Lab results imported successfully",
    uploadColBiomarker: "Biomarker",
    uploadColValue: "Value",
    uploadColDate: "Date",
    uploadTooLarge: "File is too large. Maximum size is 20 MB.",
    uploadError:
      "Could not extract results from this file. Try a clearer image or PDF.",
    uploadRemaining: "uploads remaining this month",
    uploadLimitReached:
      "Monthly upload limit reached (5 per month). You can still enter values manually.",
    uploadUnknownTitle: "Could not match these markers",
    uploadUnknownSelect: "Did you mean...",
    uploadUnknownReport: "Report missing biomarkers on GitHub",
    aiImport: "Create Import File with AI",
    aiImportDesc:
      "Have a PDF or lab report? Use AI to convert it into a file you can import here.",
    aiImportInstructions:
      "Copy the prompt below and paste it into ChatGPT, Claude, or any AI assistant along with your lab results (text, photo, or PDF). It will generate a JSON file for you.",
    aiImportThen:
      "Save the output as a .json file and use Import Data above to upload it.",
    schemaTip: "Tip: Add a $schema field for autocomplete and validation",
    schemaTipDesc:
      "Add this line to the top of your JSON file to get autocomplete and error checking in VS Code and other editors:",
    mcpSetup: "MCP Server",
    mcpSetupDesc:
      "Connect an AI assistant directly to OpenMarkers for ongoing access.",
    mcpSetupInstructions:
      "Add this to your AI client's MCP configuration (Claude Desktop, Cursor, etc.):",
    mcpSetupAuth:
      "Your AI client will authenticate via OAuth when it first connects — just approve the login in your browser.",
    mcpSetupToolsTitle: "Key tools available:",
    mcpToolImport: "Bulk import structured lab data as JSON",
    mcpToolSchema:
      "Get all supported biomarker IDs, units, and reference ranges",
    mcpToolAddResult: "Add individual lab results one at a time",
    mcpToolGetProfile: "View all your data organized by category",
    mcpToolTrends: "Analyze trends, direction, and warnings for any biomarker",
    mcpToolAnalysis:
      "Generate a full health analysis prompt with all your data",
    mcpToolsMore:
      "And more — your AI assistant will discover all available tools automatically.",
    settings: "Settings",
    settingsAppearance: "Appearance",
    settingsTheme: "Theme",
    settingsThemeLight: "Light",
    settingsThemeDark: "Dark",
    settingsLanguage: "Language",
    settingsUnitSystem: "Unit System",
    settingsUnitSystemDesc:
      "Choose how lab values are displayed. SI (International System) uses mmol/l, µmol/l, µkat/l — standard in Europe. Conventional uses mg/dL, U/L, g/dL — standard in the US. Your stored data is not affected, only the display.",
    settingsUnitSI: "SI (Europe)",
    settingsUnitConventional: "Conventional (US)",
    settingsProfiles: "Profiles",
    settingsEditProfile: "Edit Profile",
    settingsAiUsage: "AI Lab Report Extraction",
    settingsAiUsageDesc:
      "Upload a PDF or photo of your lab report and AI will extract the values. Limited to 5 uploads per month.",
    settingsAccount: "Account",
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
    settingsDeleteAccountDesc:
      "Permanently delete your account and all profiles. This cannot be undone.",
    settingsDeleteAccountConfirm: "Type DELETE to confirm",
    settingsDateOfBirth: "Date of Birth",
    settingsSex: "Sex",
    settingsMcp: "AI Assistant (MCP)",
    settingsMcpDesc:
      "Connect Claude, ChatGPT, or any MCP-compatible AI assistant to your biomarker data.",
    settingsMcpEndpoint: "MCP Endpoint",
    settingsMcpToken: "Your Auth Token",
    settingsMcpCopied: "Copied!",
    settingsMcpCopy: "Copy",
    settingsMcpCopyToken: "Copy Token",
    settingsMcpCopyConfig: "Copy Config",
    settingsMcpTokenDesc:
      "This token expires periodically. Copy a fresh one before configuring your AI client.",
    settingsMcpConfigDesc: "Add this to your AI client's MCP configuration:",
    settingsMcpTools:
      "Tools available: list profiles, get trends, biological age, correlations, AI analysis prompts, and more.",
    settingsCli: "CLI Tool",
    settingsCliDesc:
      "Manage profiles, import results, and run analytics from your terminal. Designed to work seamlessly with AI agents.",
    settingsCliInstall: "Install via Homebrew",
    settingsCliUsage: "Then run:",
    authConsent: "I agree to store my blood test results and lab data",
    authDisclaimer:
      "This is not a medical device or healthcare service. Not medical advice.",
    heroH1: "See what your blood tests really say.",
    heroDesc:
      "Track 100+ biomarkers over time. Open source. Connect any AI via MCP.",
    heroIntegrations: "Works with",
    heroBadgeOpenSource: "Open source",
    heroBadgeBiomarkers: "100+ biomarkers",
    heroBadgeMcp: "AI-ready via MCP",
    heroDemoButton: "Explore with sample data",
    heroMcpDesc: "Connect any AI assistant to your biomarker data via MCP",
    heroCliDesc:
      "Manage your data from the terminal — works great with {openClawLink} and similar personal agents",
    useCasesHeading: "Why OpenMarkers",
    useCase1Title: "Upload your lab report",
    useCase1Desc:
      "Drop a PDF or photo of your blood test results. AI reads every value — just review and confirm.",
    useCase2Title: "Connect any AI assistant",
    useCase2Desc:
      "Add one line to your MCP config. Claude, ChatGPT, Cursor — they all work.",
    useCase3Title: "Track trends over time",
    useCase3Desc:
      "See every biomarker charted with reference ranges. Biological age, correlations, and trend alerts.",
    trustHeading: "Your data, your rules",
    trustOpenSourceTitle: "Open Source",
    trustOpenSourceDesc: "Fully open source. Audit every line of code.",
    trustFamilyTitle: "For You & Your Family",
    trustFamilyDesc:
      "Create multiple profiles under one account. Track your own health and your loved ones — all in one place.",
    trustShareTitle: "Share Your Profile",
    trustShareDesc:
      "Make your data public with a custom link. Let others see your biomarker journey.",
    featureChartsTitle: "Charts & Trends",
    featureChartsDesc:
      "Visualize every biomarker over time with interactive charts. Reference ranges shown inline so you can spot what's out of range at a glance.",
    featureBioAgeTitle: "Biological Age",
    featureBioAgeDesc:
      "Calculate your biological age from 9 blood biomarkers using the Levine PhenoAge formula. See how your body is aging vs. your actual age.",
    featureBiomarkersTitle: "100+ Biomarkers",
    featureBiomarkersDesc:
      "From basic biochemistry to hormones, hematology, thyroid, iron, lipids, and more. Import your lab results as JSON — all data stays yours.",
    featureAiTitle: "AI-Ready via MCP",
    featureAiDesc:
      "Connect Claude, ChatGPT, or any AI assistant to your data via MCP. Get personalized health insights from your own lab history.",
    featurePrivacyTitle: "Private & Open Source",
    featurePrivacyDesc:
      "Your data is never shared with third parties. No tracking, no analytics. Fully open source — self-host if you want full control.",
    shareProfile: "Share Profile",
    shareProfileDesc:
      "Make this profile publicly visible at a custom URL. Anyone with the link can view your data.",
    publicHandle: "Handle",
    publicHandlePlaceholder: "my-health",
    publicHandleAvailable: "Available",
    publicHandleTaken: "Already taken",
    publicHandleInvalid: "3-40 chars, lowercase letters, numbers, hyphens",
    publicProfileUrl: "Public URL",
    publicProfileTitle: "{name}'s Health Profile",
    publicProfilePoweredBy: "Powered by OpenMarkers",
    publicProfileNotFound: "Profile not found",
    publicProfileNotFoundDesc: "This profile doesn't exist or isn't public.",
    openProfiles: "Open Profiles",
    openProfilesDesc: "People who share their biomarker data publicly.",
  },
  categories: {
    basic_biochemistry: {
      name: "Basic Biochemistry",
      description:
        "Core blood chemistry panel measuring kidney function, electrolytes, liver enzymes, proteins, and lipids.",
    },
    diabetology: {
      name: "Diabetology",
      description:
        "Blood sugar markers used to screen for and monitor diabetes mellitus.",
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
};

export default en;
