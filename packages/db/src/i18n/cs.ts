import type { TranslationData } from "../types";

const cs: TranslationData = {
  ui: {
    appName: "OpenMarkers",
    subtitle: "Sledování laboratorních výsledků",
    viewAll: "Zobrazit vše",
    allResults: "Všechny výsledky",
    allResultsDesc: "Přehled všech kategorií a biomarkerů.",
    qualitativeResults: "Kvalitativní výsledky",
    flagged: "mimo normu",
    allOk: "Vše OK",
    ok: "OK",
    outOfRange: "MIMO NORMU",
    normal: "v normě",
    ref: "Ref",
    loading: "Analyzuji vzorky...",
    test: "Test",
    biomarkers: "biomarkerů",
    biomarker: "biomarker",
    timeline: "Časová osa",
    timelineDesc: "Všechna data odběrů na časové ose. Kliknutím zobrazíte kompletní výsledky.",
    comparison: "Porovnání",
    export: "Exportovat data",
    import: "Importovat data",
    importConflictTitle: "Uživatel již existuje",
    importConflictMessage: 'Uživatel "{name}" již existuje. Zadejte nové jméno nebo zrušte.',
    importRename: "Importovat",
    importCancel: "Zrušit",
    importError: "Chyba importu",
    importInvalidJson: "Neplatný JSON soubor.",
    deleteUser: "Smazat uživatele",
    deleteUserTitle: "Smazat uživatele",
    deleteUserMessage: 'Opravdu chcete smazat "{name}"? Všechna data budou trvale odstraněna.',
    deleteUserConfirm: "Smazat",
    comparisonDesc: "Porovnejte výsledky dvou odběrů vedle sebe.",
    snapshot: "Snímek",
    from: "Od",
    to: "Do",
    change: "Změna",
    improved: "zlepšeno",
    worsened: "zhoršeno",
    selectDifferentDates: "Vyberte dvě různá data pro porovnání.",
    noDataForDate: "Pro toto datum nejsou data.",
    reminders: "Připomínky",
    lastTested: "poslední test",
    daysAgo: "dní",
    monthsAgo: "měsíců",
    overdue: "k obnovení",
    overdueCategories: "kategorií k obnovení testů",
    overdueDesc: "Některé testy nebyly delší dobu aktualizovány",
    sinceLast: "od posl.",
    overall: "celkem",
    personalRange: "Váš rozsah",
    correlations: "Korelované panely",
    correlationsDesc: "Souvisejíci biomarkery, které spolu tvoří celkový obraz.",
    iron_panel: "Panel železa",
    lipid_panel: "Lipidový panel",
    liver_panel: "Jaterní panel",
    thyroid_panel: "Štítná žláza",
    kidney_panel: "Ledvinový panel",
    aiAnalysis: "AI Analýza",
    aiAnalysisDesc:
      "Použijte {mcpLink} nebo {cliLink} pro průběžnou AI analýzu, nebo zkopírujte tento prompt do libovolného AI asistenta pro jednorázový přehled.",
    aiAnalysisSetupMcp: "MCP server",
    aiAnalysisSetupCli: "CLI nástroj",
    copyPrompt: "Kopírovat prompt",
    copied: "Zkopírováno!",
    showPrompt: "Náhled",
    hidePrompt: "Skrýt",
    bioAge: "Biologický věk",
    bioAgeDesc: "Odhad pomocí Levineho PhenoAge vzorce z 9 krevních biomarkerů.",
    chronoAge: "Chronologický věk",
    yearsOlder: "let starší",
    yearsYounger: "let mladší",
    bioAgeEqual: "stejný jako chronologický věk",
    mortalityScore: "Skóre mortality",
    mortalityScoreDesc: "10leté riziko",
    dnamAge: "Odhad DNAm věku",
    dnamAgeDesc: "Odhad DNA metylace",
    dnamMortality: "DNAm mortalita",
    dnamMortalityDesc: "Riziko dle DNAm",
    bioAgeLocked: "Přidejte chybějící markery pro odemknutí",
    bioAgeLockedMarkers: "Chybějící markery",
    editResults: "Upravit výsledky",
    editResultsLink: "upravit v\u00fdsledky",
    addResult: "P\u0159idat",
    resultDate: "Datum",
    resultValue: "Hodnota",
    save: "Ulo\u017eit",
    delete: "Smazat",
    deleteResultConfirm: "Opravdu chcete smazat tento v\u00fdsledek?",
    authLogin: "P\u0159ihl\u00e1sit se",
    authSignUp: "Registrovat se",
    authSignOut: "Odhl\u00e1sit se",
    authEmail: "Email",
    authPassword: "Heslo",
    authTryDemo: "Zkusit demo",
    getStarted: "Začněte",
    getStartedFree: "Přidejte se ke komunitě. Sdílejte své markery se světem.",
    goToApp: "Přejít do aplikace",
    landingWelcomeBack: "Vaše data na vás čekají.",
    landingPeople: "lidí",
    getStartedDesc: "Importujte svá laboratorní data nebo vytvořte nový profil.",
    createProfile: "Vytvořit nový profil",
    createProfileDesc: "Začněte s prázdným profilem.",
    profileName: "Jméno",
    dateOfBirth: "Datum narození",
    sexMale: "Muž",
    sexFemale: "Žena",
    importingData: "Importuji...",
    importDesc: "Nahrajte JSON soubor s laboratorními výsledky.",
    importSettingsDesc: "Importujte laboratorní výsledky z JSON souboru. Vytvoří se nový profil s importovanými daty — stávající profily nebudou ovlivněny.",
    importSelectFile: "Vybrat JSON soubor",
    demoDesc: "Prozkoumejte aplikaci se vzorovými daty.",
    addLabVisit: "Přidat odběr",
    addLabVisitDesc: "Zadejte výsledky z krevního odběru ručně.",
    addLabVisitDate: "Datum odběru",
    addLabVisitSearch: "Hledat biomarkery...",
    addLabVisitSubmit: "Uložit výsledky",
    addLabVisitSaving: "Ukládám...",
    addLabVisitNValues: "{n} hodnot zadáno",
    addLabVisitNoMatch: "Žádné biomarkery neodpovídají hledání.",
    addLabVisitEmpty: "Zadejte alespoň jednu hodnotu.",
    addYourData: "Přidejte svá data",
    addYourDataDesc: "Váš profil je připraven. Přidejte první výsledky z odběrů.",
    aiImport: "Vytvořit soubor pro import pomocí AI",
    aiImportDesc: "Máte PDF nebo laboratorní zprávu? Pomocí AI ji převeďte na soubor k importu.",
    aiImportInstructions:
      "Zkopírujte prompt níže a vložte ho do ChatGPT, Claude nebo jiného AI asistenta spolu s vašimi výsledky (text, foto nebo PDF). Vygeneruje vám JSON soubor.",
    aiImportThen: "Uložte výstup jako .json soubor a nahrajte ho pomocí Import výše.",
    schemaTip: "Tip: Přidejte pole $schema pro automatické doplňování a validaci",
    schemaTipDesc:
      "Přidejte tento řádek na začátek JSON souboru pro automatické doplňování a kontrolu chyb ve VS Code a dalších editorech:",
    mcpSetup: "MCP Server",
    mcpSetupDesc: "Připojte AI asistenta přímo k OpenMarkers.",
    mcpSetupInstructions: "Přidejte toto do konfigurace MCP vašeho AI klienta (Claude Desktop, Cursor apod.):",
    mcpSetupAuth: "AI klient se ověří přes OAuth při prvním připojení — stačí schválit přihlášení v prohlížeči.",
    mcpSetupToolsTitle: "Hlavní dostupné nástroje:",
    mcpToolImport: "Hromadný import strukturovaných laboratorních dat jako JSON",
    mcpToolSchema: "Získat všechny podporované ID biomarkerů, jednotky a referenční rozsahy",
    mcpToolAddResult: "Přidat jednotlivé laboratorní výsledky",
    mcpToolGetProfile: "Zobrazit všechna data podle kategorií",
    mcpToolTrends: "Analyzovat trendy, směr a varování u biomarkerů",
    mcpToolAnalysis: "Vygenerovat kompletní zdravotní analýzu ze všech dat",
    mcpToolsMore: "A další — AI asistent automaticky objeví všechny dostupné nástroje.",
    settings: "Nastavení",
    settingsAppearance: "Vzhled",
    settingsTheme: "Motiv",
    settingsThemeLight: "Světlý",
    settingsThemeDark: "Tmavý",
    settingsLanguage: "Jazyk",
    settingsProfiles: "Profily",
    settingsEditProfile: "Upravit profil",
    settingsAccount: "Účet",
    settingsChangeEmail: "Změnit email",
    settingsChangePassword: "Změnit heslo",
    settingsCurrentPassword: "Současné heslo",
    settingsNewPassword: "Nové heslo",
    settingsNewEmail: "Nový email",
    settingsSave: "Uložit",
    settingsSaved: "Uloženo!",
    settingsError: "Chyba",
    settingsDangerZone: "Nebezpečná zóna",
    settingsDeleteAccount: "Smazat účet",
    settingsDeleteAccountDesc: "Trvale smazat účet a všechny profily. Tuto akci nelze vrátit.",
    settingsDeleteAccountConfirm: "Napište DELETE pro potvrzení",
    settingsDateOfBirth: "Datum narození",
    settingsSex: "Pohlaví",
    settingsMcp: "AI Asistent (MCP)",
    settingsMcpDesc:
      "Připojte Claude, ChatGPT nebo jakéhokoli AI asistenta kompatibilního s MCP k vašim datům biomarkerů.",
    settingsMcpEndpoint: "MCP Endpoint",
    settingsMcpToken: "Váš Auth Token",
    settingsMcpCopied: "Zkopírováno!",
    settingsMcpCopy: "Kopírovat",
    settingsMcpCopyToken: "Kopírovat token",
    settingsMcpCopyConfig: "Kopírovat konfiguraci",
    settingsMcpTokenDesc: "Tento token periodicky expiruje. Před konfigurací AI klienta zkopírujte nový.",
    settingsMcpConfigDesc: "Přidejte toto do MCP konfigurace vašeho AI klienta:",
    settingsMcpTools: "Dostupné nástroje: seznam profilů, trendy, biologický věk, korelace, AI analýzy a další.",
    settingsCli: "CLI nástroj",
    settingsCliDesc: "Spravujte profily, importujte výsledky a spouštějte analytiku z terminálu. Navrženo pro bezproblémovou spolupráci s AI agenty.",
    settingsCliInstall: "Instalace přes Homebrew",
    settingsCliUsage: "Poté spusťte:",
    authConsent: "Souhlasím s uložením výsledků krevních testů a laboratorních dat",
    authDisclaimer: "Toto není zdravotnický prostředek ani zdravotní služba. Nejedná se o lékařskou radu.",
    heroSubtitle: "Vaše laboratorní výsledky, vizualizované. Odhalte trendy, které lékař přehlédne.",
    heroBadgeOpenSource: "Open source",
    heroBadgeBiomarkers: "100+ biomarkerů",
    heroBadgeMcp: "AI přes MCP",
    landingFeaturesHeading: "Vše, co potřebujete ke sledování zdraví",
    landingHowItWorks: "Jak to funguje",
    landingStep1Title: "Nahrajte výsledky",
    landingStep1Desc: "Importujte laboratorní data jako JSON, zadejte ručně nebo nechte AI převést vaše PDF reporty.",
    landingStep2Title: "Vizualizujte trendy",
    landingStep2Desc: "Sledujte každý biomarker v čase s interaktivními grafy a referenčními rozsahy.",
    landingStep3Title: "Získejte přehledy",
    landingStep3Desc: "Biologický věk, analýza trendů, korelace — nebo připojte jakékoli AI přes MCP.",
    heroDemoButton: "Prozkoumat s ukázkovými daty",
    heroMcpDesc: "Připojte jakéhokoli AI asistenta k vašim biomarkerům přes MCP",
    heroCliDesc: "Spravujte data z terminálu — skvěle funguje s AI agenty",
    featureChartsTitle: "Grafy a trendy",
    featureChartsDesc:
      "Vizualizujte každý biomarker v čase pomocí interaktivních grafů. Referenční rozsahy zobrazeny přímo, abyste na první pohled viděli odchylky.",
    featureBioAgeTitle: "Biologický věk",
    featureBioAgeDesc:
      "Vypočítejte svůj biologický věk z 9 krevních biomarkerů pomocí vzorce PhenoAge. Porovnejte, jak vaše tělo stárne oproti skutečnému věku.",
    featureBiomarkersTitle: "100+ biomarkerů",
    featureBiomarkersDesc:
      "Od základní biochemie po hormony, hematologii, štítnou žlázu, železo, lipidy a další. Importujte výsledky jako JSON — data zůstávají vaše.",
    featureAiTitle: "AI přes MCP",
    featureAiDesc:
      "Připojte Claude, ChatGPT nebo jakéhokoli AI asistenta k vašim datům přes MCP. Získejte personalizované zdravotní poznatky z vaší historie.",
    featurePrivacyTitle: "Soukromé a open source",
    featurePrivacyDesc:
      "Vaše data nikdy nesdílíme s třetími stranami. Žádné sledování, žádná analytika. Plně open source — hostujte si sami pro plnou kontrolu.",
    shareProfile: "Sdílet profil",
    shareProfileDesc: "Zveřejněte tento profil na vlastní URL. Kdokoli s odkazem uvidí vaše data.",
    publicHandle: "Identifikátor",
    publicHandlePlaceholder: "moje-zdravi",
    publicHandleAvailable: "Dostupný",
    publicHandleTaken: "Již obsazený",
    publicHandleInvalid: "3–40 znaků, malá písmena, čísla, pomlčky",
    publicProfileUrl: "Veřejná URL",
    publicProfileTitle: "Zdravotní profil — {name}",
    publicProfilePoweredBy: "Provozuje OpenMarkers",
    publicProfileNotFound: "Profil nenalezen",
    publicProfileNotFoundDesc: "Tento profil neexistuje nebo není veřejný.",
    openProfiles: "Otevřené profily",
    openProfilesDesc: "Lidé, kteří sdílejí svá data veřejně.",
  },
  categories: {
    basic_biochemistry: {
      name: "Základní biochemie",
      description: "Základní biochemický panel měřící funkci ledvin, elektrolyty, jaterní enzymy, bílkoviny a lipidy.",
    },
    diabetology: {
      name: "Diabetologie",
      description: "Markery krevního cukru pro screening a monitorování diabetes mellitus.",
    },
    hematology: {
      name: "Hematologie",
      description:
        "Kompletní krevní obraz a diferenciál. Hodnotí červené krvinky, bílé krvinky a krevní destičky pro detekci anémie, infekce, poruch srážlivosti a nádorů krve.",
    },
    coagulation: {
      name: "Koagulace",
      description:
        "Testy srážlivosti krve měřící rychlost a účinnost tvorby krevních sraženin. Slouží ke screeningu poruch krvácení nebo srážlivosti a monitorování antikoagulační terapie.",
    },
    immunology: {
      name: "Imunologie a zánětlivé markery",
      description:
        "Markery zánětu a aktivity imunitního systému. Slouží k detekci infekcí, autoimunitních stavů a monitorování zánětlivých onemocnění.",
    },
    endocrinology: {
      name: "Endokrinologie",
      description:
        "Testy funkce štítné žlázy a panel protilátek. Štítná žláza řídí metabolismus, energii a mnoho tělesných systémů.",
    },
    urine_dipstick: {
      name: "Moč — chemicky (MCHS)",
      description:
        "Rychlá chemická analýza moči pomocí testovacích proužků. Screening onemocnění ledvin, infekcí močových cest, diabetu a onemocnění jater.",
    },
    urine_sediment: {
      name: "Moč — sediment (mikroskopie)",
      description:
        "Mikroskopické vyšetření močového sedimentu. Detekuje buňky, válce, krystaly a bakterie nezachycené testovacími proužky.",
    },
    immunity: {
      name: "Specifická imunita",
      description:
        "Hladiny protilátek proti konkrétním infekčním onemocněním. Slouží k ověření stavu očkování a ochranné imunity.",
    },
    calculated_indices: {
      name: "Vypočtené indexy",
      description:
        "Odvozené hodnoty a skóre rizika vypočtené z jiných laboratorních výsledků. Nejsou přímo měřeny, ale poskytují klinický pohled.",
    },
    iron_metabolism: {
      name: "Metabolismus železa",
      description:
        "Hladiny železa, zásoby a transportní markery. Slouží k diagnostice a sledování anémie z nedostatku železa a přetížení železem.",
    },
    sleep_study: {
      name: "Spánková studie",
      description:
        "Výsledky polygrafie a polysomnografie. Měří dechové příhody, saturaci kyslíkem a chrápání během spánku pro diagnostiku spánkové apnoe.",
    },
    cardiovascular: {
      name: "Kardiovaskulární",
      description:
        "Markery zdraví srdce a cév včetně ukazatelů srdeční zátěže, skóre kalcifikace koronárních tepen a souvisejících rizikových biomarkerů.",
    },
    tumor_markers: {
      name: "Nádorové markery",
      description:
        "Krevní markery používané pro screening nádorů, monitorování léčby a detekci recidivy. Zvýšené hodnoty mohou ukazovat na malignitu, ale mohou být zvýšené i u benigních stavů.",
    },
  },
  biomarkers: {
    "S-UREA": {
      name: "Urea (Močovina)",
      description:
        "Odpadní produkt metabolismu bílkovin filtrovaný ledvinami. Zvýšené hodnoty mohou ukazovat na poruchu funkce ledvin nebo vysoký příjem bílkovin.",
    },
    "S-CREA": {
      name: "Kreatinin",
      description:
        "Vedlejší produkt svalového metabolismu filtrovaný ledvinami. Vysoké hodnoty naznačují sníženou filtrační kapacitu ledvin. Přirozeně vyšší u svalnatých jedinců.",
    },
    "S-KM": {
      name: "Kyselina močová",
      description:
        "Konečný produkt metabolismu purinů. Zvýšené hladiny zvyšují riziko dny a ledvinových kamenů. Ovlivňuje ji strava (červené maso, alkohol, fruktóza).",
    },
    "S-CKDEPI": {
      name: "eGFR (CKD-EPI)",
      description:
        "Odhadovaná glomerulární filtrace vypočtená z kreatininu vzorcem CKD-EPI. Měří, jak dobře ledviny filtrují krev. Hodnoty >1,5 ml/s jsou normální; <1,0 může znamenat závažné poškození ledvin.",
    },
    "S-Na": {
      name: "Sodík",
      description:
        "Hlavní elektrolyt regulující rovnováhu tekutin a funkci nervů/svalů. Nízké (hyponatrémie) i vysoké (hypernatrémie) hodnoty mohou být klinicky významné.",
    },
    "S-K": {
      name: "Draslík",
      description:
        "Důležitý elektrolyt pro srdeční rytmus, svalovou kontrakci a nervovou signalizaci. Nízké i vysoké hodnoty mohou způsobit nebezpečné srdeční arytmie.",
    },
    "S-Cl": {
      name: "Chloridy",
      description:
        "Elektrolyt pomáhající udržovat rovnováhu tekutin a acidobazický stav. Obvykle se pohybuje společně se sodíkem.",
    },
    "S-Mg": {
      name: "Hořčík",
      description:
        "Minerál důležitý pro funkci svalů a nervů, kontrolu krevního cukru a zdraví kostí. Nedostatek je častý a může způsobit únavu, křeče a arytmie.",
    },
    "S-BIL": {
      name: "Celkový bilirubin",
      description:
        "Pigment z rozpadu červených krvinek zpracovávaný játry. Zvýšené hladiny způsobují žloutenku. Mírně zvýšené hodnoty mohou ukazovat na Gilbertův syndrom (benigní).",
    },
    "S-ALT": {
      name: "ALT (Alaninaminotransferáza)",
      description:
        "Jaterní enzym. Zvýšené hodnoty ukazují na poškození jaterních buněk. Nejspecifičtější marker poškození jater. Může být zvýšený alkoholem, léky, steatózou nebo virovou hepatitidou.",
    },
    "S-AST": {
      name: "AST (Aspartátaminotransferáza)",
      description:
        "Enzym nacházející se v játrech, srdci a svalech. Zvýšený při poškození jater, infarktu nebo intenzivním cvičení. Méně specifický pro játra než ALT.",
    },
    "S-GGT": {
      name: "GGT (Gama-glutamyltransferáza)",
      description:
        "Jaterní enzym a enzym žlučových cest. Citlivý marker obstrukce žlučových cest a užívání alkoholu. Často první jaterní enzym, který stoupá při poškození jater alkoholem.",
    },
    "S-ALP": {
      name: "ALP (Alkalická fosfatáza)",
      description:
        "Enzym nacházející se v játrech, kostech a žlučových cestách. Zvýšený při růstu kostí, obstrukci žlučových cest nebo onemocnění jater. Normálně vyšší u rostoucích dospívajících.",
    },
    "S-PAMS": {
      name: "Pankreatická amyláza",
      description:
        "Enzym produkovaný slinivkou k trávení škrobu. Zvýšené hladiny mohou ukazovat na pankreatitidu nebo onemocnění slinivky.",
    },
    "S-CB": {
      name: "Celková bílkovina",
      description:
        "Celkové množství albuminu a globulinů v krvi. Odráží nutriční stav, syntetickou funkci jater a aktivitu imunitního systému.",
    },
    "S-ALB": {
      name: "Albumin",
      description:
        "Nejhojnější krevní bílkovina tvořená v játrech. Udržuje rovnováhu tekutin a transportuje hormony/léky. Nízké hodnoty ukazují na onemocnění jater, podvýživu nebo ztrátu ledvinami.",
    },
    "S-CHOL": {
      name: "Celkový cholesterol",
      description:
        "Celkové množství cholesterolu v krvi včetně LDL, HDL a VLDL. Zvýšené hodnoty zvyšují riziko kardiovaskulárních onemocnění.",
    },
    "S-HDL": {
      name: "HDL cholesterol",
      description:
        '"Dobrý" cholesterol, který odstraňuje přebytečný cholesterol z tepen. Vyšší hodnoty chrání před kardiovaskulárními onemocněními.',
    },
    "S-LDL": {
      name: "LDL cholesterol",
      description:
        '"Špatný" cholesterol, který se ukládá ve stěnách tepen a způsobuje aterosklerózu. Hlavní cíl pro snížení kardiovaskulárního rizika.',
    },
    "S-TGL": {
      name: "Triglyceridy",
      description:
        "Tuky v krvi, převážně z potravy. Zvýšené vysokým příjmem sacharidů/alkoholu. Velmi vysoké hodnoty (>10 mmol/l) hrozí pankreatitidou.",
    },
    "S-nHDL": {
      name: "Non-HDL cholesterol",
      description:
        "Celkový cholesterol minus HDL. Zahrnuje všechny aterogenní lipoproteiny (LDL + VLDL). Lepší prediktor kardiovaskulárního rizika než samotný LDL.",
    },
    "S-VITD": {
      name: "Vitamin D (25-OH)",
      description:
        "Měří zásoby vitaminu D. Nezbytný pro zdraví kostí, imunitní funkci a náladu. Nedostatek je velmi častý, zejména v severních zeměpisných šířkách a v zimních měsících.",
    },
    "P-P-GLU": {
      name: "Glukóza nalačno",
      description:
        "Krevní cukr měřený nalačno. Základní screeningový test na diabetes. Hodnoty 5,6–6,9 značí prediabetes; ≥7,0 naznačuje diabetes.",
    },
    "B-WBC": {
      name: "Bílé krvinky (leukocyty)",
      description:
        "Celkový počet imunitních buněk. Zvýšené při infekci, zánětu nebo stresu. Nízké hodnoty (leukopenie) zvyšují riziko infekce.",
    },
    "B-RBC": {
      name: "Červené krvinky (erytrocyty)",
      description:
        "Buňky přenášející kyslík. Nízký počet ukazuje na anémii. Vysoký počet může ukazovat na dehydrataci nebo polycytémii.",
    },
    "B-HB": {
      name: "Hemoglobin",
      description:
        "Bílkovina přenášející kyslík v červených krvinkách. Nízké hodnoty ukazují na anémii. Klíčový marker pro schopnost krve přenášet kyslík.",
    },
    "B-HCT": {
      name: "Hematokrit",
      description:
        "Procento objemu krve tvořené červenými krvinkami. Zvýšený při dehydrataci; nízký při anémii nebo přetížení tekutinami.",
    },
    "B-MCV": {
      name: "Střední objem erytrocytů",
      description:
        "Průměrná velikost červených krvinek. Nízký MCV naznačuje nedostatek železa; vysoký MCV naznačuje nedostatek B12/kyseliny listové nebo užívání alkoholu.",
    },
    "B-MCH": {
      name: "Střední hmotnost hemoglobinu v erytrocytu",
      description:
        "Průměrné množství hemoglobinu v jedné červené krvince. Koreluje s MCV — nízký při nedostatku železa, vysoký při nedostatku B12/kyseliny listové.",
    },
    "B-MCHC": {
      name: "Střední koncentrace hemoglobinu v erytrocytech",
      description: "Průměrná koncentrace hemoglobinu v červených krvinkách. Pomáhá klasifikovat typy anémie.",
    },
    "B-PLT": {
      name: "Trombocyty (krevní destičky)",
      description:
        "Buněčné fragmenty nezbytné pro srážení krve. Nízký počet (trombocytopenie) hrozí krvácením; vysoký počet (trombocytóza) může ukazovat na zánět nebo poruchu krve.",
    },
    "B-RDW": {
      name: "Distribuční šíře erytrocytů",
      description:
        "Měří variabilitu velikosti červených krvinek. Zvýšené hodnoty naznačují smíšené příčiny anémie (např. kombinovaný nedostatek železa a B12).",
    },
    "B-neu": {
      name: "Neutrofily (%)",
      description:
        "Procento bílých krvinek tvořených neutrofily — první obránci proti bakteriální infekci. Nízké procento může ukazovat na virovou infekci nebo benigní etnickou neutropenii.",
    },
    "B-lymf": {
      name: "Lymfocyty (%)",
      description:
        "Procento bílých krvinek tvořených lymfocyty — klíčové pro adaptivní imunitu (T-lymfocyty, B-lymfocyty). Zvýšené procento často odráží nízké neutrofily nebo virovou infekci.",
    },
    "B-mono": {
      name: "Monocyty (%)",
      description:
        "Procento bílých krvinek tvořených monocyty — podílejí se na chronickém zánětu a imunitní obraně. Mírně zvýšené při infekcích a autoimunitních stavech.",
    },
    "B-eo": {
      name: "Eozinofily (%)",
      description:
        "Procento bílých krvinek tvořených eozinofily — podílejí se na alergických reakcích a parazitárních infekcích. Zvýšené u alergií, astmatu a parazitárních onemocnění.",
    },
    "B-baso": {
      name: "Bazofily (%)",
      description:
        "Nejvzácnější typ bílých krvinek. Podílejí se na alergických a zánětlivých reakcích. Zřídka klinicky významné izolovaně.",
    },
    "B-NEabs": {
      name: "Neutrofily (absolutní počet)",
      description:
        "Absolutní počet neutrofilů. Hodnoty pod 2,0 jsou mírně nízké (mírná neutropenie); pod 1,0 výrazně zvyšují riziko infekce. Klinicky užitečnější než procento.",
    },
    "B-LYabs": {
      name: "Lymfocyty (absolutní počet)",
      description:
        "Absolutní počet lymfocytů. Nízké hodnoty ukazují na riziko imunodeficience. Zvýšené při virových infekcích a některých nádorech krve.",
    },
    "B-MOabs": {
      name: "Monocyty (absolutní počet)",
      description:
        "Absolutní počet monocytů. Zvýšené při chronických infekcích, autoimunitních onemocněních a některých poruchách krve.",
    },
    "B-EOabs": {
      name: "Eozinofily (absolutní počet)",
      description:
        "Absolutní počet eozinofilů. Zvýšené u alergických stavů, parazitárních infekcí a eozinofilních poruch.",
    },
    "B-BAabs": {
      name: "Bazofily (absolutní počet)",
      description:
        "Absolutní počet bazofilů. Zřídka abnormální izolovaně. Velmi vysoké hodnoty mohou naznačovat myeloproliferativní onemocnění.",
    },
    "C-Quick": {
      name: "Protrombinový čas (Quickův poměr)",
      description:
        "Měří vnější koagulační cestu. Vyjádřeno jako poměr — hodnoty 0,8–1,2 jsou normální. Prodloužený při onemocnění jater, nedostatku vitaminu K nebo užívání warfarinu.",
    },
    "C-INR": {
      name: "INR",
      description:
        "Mezinárodní normalizovaný poměr — standardizovaný protrombinový čas pro monitorování terapie warfarinem. Normální je ~1,0; terapeutické rozmezí na warfarinu je obvykle 2,0–3,0.",
    },
    "C-QT": {
      name: "Protrombinový čas (sekundy)",
      description:
        "Čas v sekundách pro srážení krve vnější cestou. Surové měření používané k výpočtu INR a Quickova poměru.",
    },
    "C-APTTr": {
      name: "APTT poměr",
      description:
        "Poměr aktivovaného parciálního tromboplastinového času — měří vnitřní koagulační cestu. Prodloužený u hemofilie, při užívání heparinu nebo lupus antikoagulans.",
    },
    "C-APTT": {
      name: "APTT (sekundy)",
      description:
        "Aktivovaný parciální tromboplastinový čas — surový čas srážení vnitřní cestou. Normální rozmezí je obvykle 25–35 sekund.",
    },
    "S-CRP": {
      name: "C-reaktivní protein",
      description:
        "Protein akutní fáze produkovaný játry v reakci na zánět. Rychle stoupá při infekci, poranění nebo zánětlivém onemocnění. Nespecifický, ale velmi citlivý marker.",
    },
    "B-ESR": {
      name: "Sedimentace erytrocytů",
      description:
        "Nespecifický marker zánětu. Měří, jak rychle se červené krvinky usazují ve zkumavce. Zvýšená při infekci, autoimunitním onemocnění a nádorech. Mění se pomaleji než CRP.",
    },
    "S-TSH": {
      name: "TSH (Tyreotropní hormon)",
      description:
        "Hormon hypofýzy stimulující štítnou žlázu. Základní screeningový test poruch štítné žlázy. Vysoký TSH = snížená funkce (hypotyreóza); nízký TSH = zvýšená funkce (hypertyreóza).",
    },
    "S-fT4": {
      name: "Volný T4 (tyroxin)",
      description:
        "Aktivní hormon štítné žlázy dostupný tkáním. Nízký fT4 s vysokým TSH potvrzuje hypotyreózu. Normální fT4 s mírně zvýšeným TSH je subklinická hypotyreóza.",
    },
    "S-aTSH": {
      name: "Protilátky proti TSH receptorům (TRAb)",
      description:
        "Protilátky proti TSH receptoru. Zvýšené u Gravesovy-Basedowovy choroby (autoimunitní hypertyreóza). Důležité pro diferenciální diagnostiku poruch štítné žlázy.",
    },
    "S-aTG": {
      name: "Protilátky proti tyreoglobulinu",
      description:
        "Protilátky proti proteinu tyreoglobulinu. Zvýšené u Hashimotovy tyreoiditidy a dalších autoimunitních onemocnění štítné žlázy. Přítomny u ~10 % zdravých jedinců.",
    },
    "S-aTPO": {
      name: "Protilátky proti TPO",
      description:
        "Protilátky proti tyreoidální peroxidáze. Nejcitlivější marker autoimunitního onemocnění štítné žlázy (Hashimoto). Pozitivní u ~90 % pacientů s Hashimotem.",
    },
    "U-GLU": {
      name: "Glukóza v moči",
      description:
        "Glukóza v moči. Normálně nepřítomna — přítomnost naznačuje překročení renálního prahu pro reabsorpci glukózy (obvykle >10 mmol/l), jako u nekontrolovaného diabetu.",
    },
    "U-PROT": {
      name: "Bílkovina v moči",
      description:
        "Bílkovina v moči. Normálně nepřítomna nebo stopová. Přetrvávající proteinurie ukazuje na poškození ledvin, zejména u diabetu nebo hypertenze.",
    },
    "U-BILI": {
      name: "Bilirubin v moči",
      description: "Bilirubin v moči. Normálně nepřítomen — přítomnost naznačuje onemocnění jater nebo žlučových cest.",
    },
    "U-UBG": {
      name: "Urobilinogen",
      description:
        "Rozkladný produkt bilirubinu. Malá množství jsou normální. Zvýšený u hemolytické anémie nebo onemocnění jater; nepřítomen při úplné obstrukci žlučovodu.",
    },
    "U-PH": {
      name: "pH moči",
      description:
        "Kyselost/zásaditost moči. Normální rozmezí 4,5–8,0. Ovlivněno stravou, léky a metabolickými stavy. Kyselá moč je běžná při dietě bohaté na bílkoviny.",
    },
    "U-KREV": {
      name: "Krev v moči",
      description:
        "Krev v moči (hematurie). Normálně nepřítomna. Přítomnost může ukazovat na ledvinové kameny, infekci močových cest nebo onemocnění ledvin/močového měchýře.",
    },
    "U-LEUC": {
      name: "Leukocyty v moči",
      description:
        "Bílé krvinky v moči. Normálně nepřítomny. Přítomnost naznačuje infekci močových cest nebo zánět ledvin.",
    },
    "U-KETO": {
      name: "Ketolátky v moči",
      description:
        "Ketolátky v moči. Normálně nepřítomny. Přítomny při hladovění, nízkosacharidové dietě, nekontrolovaném diabetu (diabetická ketoacidóza) nebo déletrvajícím zvracení.",
    },
    "U-NIT": {
      name: "Nitrity v moči",
      description:
        "Bakteriální metabolit v moči. Normálně nepřítomen. Pozitivní výsledek silně naznačuje infekci močových cest gramnegativními bakteriemi.",
    },
    "U-HUST": {
      name: "Specifická hmotnost moči",
      description:
        "Měří koncentraci moči. Odráží stav hydratace a schopnost ledvin koncentrovat moč. Nízké hodnoty naznačují nadměrnou hydrataci; vysoké dehydrataci.",
    },
    "U-EPPL": {
      name: "Epiteliální buňky",
      description:
        "Buňky vystýlající močové cesty. Malé množství je normální z přirozeného odlupování. Vysoký počet může ukazovat na kontaminaci nebo zánět močových cest.",
    },
    "U-ERY": {
      name: "Erytrocyty v moči (mikroskopie)",
      description:
        "Červené krvinky viděné pod mikroskopem. Přesnější než test na krev testovacím proužkem. Zvýšený počet vyžaduje vyšetření na ledvinové kameny, infekci nebo malignitu.",
    },
    "U-LEUKU": {
      name: "Leukocyty v moči (mikroskopie)",
      description:
        "Bílé krvinky viděné pod mikroskopem. Zvýšený počet ukazuje na infekci močových cest nebo zánět ledvin.",
    },
    "U-UBAKT": {
      name: "Bakterie v moči",
      description:
        "Bakterie viděné pod mikroskopem. Malé množství může být kontaminace. Významná bakteriurie se symptomy naznačuje infekci močových cest.",
    },
    "S-MorbilliG": {
      name: "Protilátky IgG proti spalničkám",
      description:
        "IgG protilátky proti viru spalniček. Ukazují na imunitu z očkování nebo prodělaného onemocnění. Dostatečná hladina po očkování je ≥275 IU/l.",
    },
    "S-Tetanus": {
      name: "Protilátky proti tetanu",
      description:
        "IgG protilátky proti tetanovému toxoidu. Měří imunitu vyvolanou očkováním. 1,0–5,0 IU/ml = dlouhodobá ochrana; kontrola za 5 let.",
    },
    "MDRD-UreaAlb": {
      name: "eGFR (MDRD s ureou a albuminem)",
      description:
        "Alternativní odhad funkce ledvin vzorcem MDRD s ureou a albuminem. Podobný CKD-EPI, ale používá další vstupy. Hodnoty >1,5 ml/s jsou normální.",
    },
    "S-FIB4": {
      name: "Index FIB-4",
      description:
        "Neinvazivní skóre fibrózy vypočtené z věku, AST, ALT a trombocytů. Odhaduje riziko jaterní fibrózy. <1,3 = nízké riziko; 1,3–2,67 = střední; >2,67 = vysoké.",
    },
    "S-AMS": {
      name: "Sérová amyláza",
      description:
        "Enzym rozkládající škrob, produkovaný slinivkou a slinivými žlázami. Zvýšený při pankreatitidě, zánětu slinných žláz nebo obstrukci střeva.",
    },
    "S-Fe": {
      name: "Železo v séru",
      description:
        "Železo cirkulující v krvi vázané na transferin. Nízké hodnoty ukazují na nedostatek železa; vysoké mohou znamenat přetížení železem nebo nedávnou suplementaci.",
    },
    "S-Feritin": {
      name: "Feritin",
      description:
        "Hlavní zásobní protein železa. Nejcitlivější marker nedostatku železa — nízký feritin je nejranějším příznakem. Také protein akutní fáze (stoupá při zánětu).",
    },
    "S-Transferin": {
      name: "Transferin",
      description:
        "Transportní protein železa v krvi. Zvýšený když tělo potřebuje více železa. Snížený při onemocnění jater, malnutrici nebo zánětu.",
    },
    "S-TransSat": {
      name: "Saturace transferinu",
      description:
        "Procento vazebných míst transferinu obsazených železem. Nízká saturace (<20 %) silně naznačuje nedostatek železa. Vysoká saturace (>45 %) může znamenat přetížení.",
    },
    "S-TransRec": {
      name: "Solubilní transferinové receptory",
      description:
        "Fragmenty receptorů uvolněné do krve když buňky potřebují více železa. Zvýšené při anémii z nedostatku železa. Na rozdíl od feritinu nejsou ovlivněny zánětem.",
    },
    "S-UIBC": {
      name: "UIBC (Nenasycená vazebná kapacita)",
      description:
        "Dostupná vazebná kapacita transferinu pro železo. Zvýšená při nedostatku železa, protože tělo produkuje více transferinu k zachycení vzácného železa.",
    },
    "S-TIBC": {
      name: "TIBC (Celková vazebná kapacita)",
      description:
        "Celková kapacita transferinu vázat železo (UIBC + sérové železo). Zvýšená při nedostatku železa; snížená při přetížení, onemocnění jater nebo chronickém zánětu.",
    },
    "S-IgA": {
      name: "IgA (Imunoglobulin A)",
      description:
        "Protilátka chránící slizniční povrchy (střevo, dýchací cesty). Měří se k vyloučení deficitu IgA před testováním celiakie.",
    },
    "S-Anti-tTg-IgA": {
      name: "Anti-tTG IgA (Tkáňová transglutamináza)",
      description:
        "Primární screeningová protilátka pro celiakii. Zvýšené hodnoty naznačují imunitní reakci na lepek. Vyžaduje normální hladinu IgA pro spolehlivé výsledky.",
    },
    "B-MPV": {
      name: "Střední objem trombocytů",
      description:
        "Průměrná velikost krevních destiček. Větší destičky jsou mladší a aktivnější. Zvýšený MPV s nízkým počtem destiček naznačuje zvýšenou destrukci destiček.",
    },
    "SL-AHI": {
      name: "Apnoe-hypopnoe index (AHI)",
      description:
        "Počet apnoí a hypopnoí za hodinu spánku. Hlavní ukazatel závažnosti spánkové apnoe. Norma <5, lehká 5–15, středně těžká 15–30, těžká >30.",
    },
    "SL-OA": {
      name: "Obstrukční apnoe",
      description:
        "Počet obstrukčních apnoí za hodinu — úplné zablokování dýchacích cest na ≥10 sekund při zachovalém dýchacím úsilí.",
    },
    "SL-HY": {
      name: "Hypopnoe",
      description:
        "Částečné zúžení dýchacích cest za hodinu — snížení proudu vzduchu (≥30 %) s desaturací nebo probuzením. Obvykle největší složka AHI.",
    },
    "SL-MA": {
      name: "Smíšené apnoe",
      description:
        "Příhody za hodinu začínající jako centrální apnoe (bez dýchacího úsilí) a přecházející v obstrukční apnoe. U většiny pacientů vzácné.",
    },
    "SL-CA": {
      name: "Centrální apnoe",
      description:
        "Příhody za hodinu, kdy mozek dočasně přestane vysílat signály k dýchání. Žádná obstrukce, žádné dýchací úsilí. Časté u pacientů se srdečním selháním.",
    },
    "SL-ODI": {
      name: "Index desaturací (ODI)",
      description:
        "Počet poklesů saturace kyslíkem o ≥3 % za hodinu. Úzce koreluje s AHI. Norma <5; zvýšené hodnoty značí významnou intermitentní hypoxii.",
    },
    "SL-SpO2min": {
      name: "Minimální SpO2",
      description:
        "Nejnižší naměřená saturace kyslíkem během noci. Hodnoty pod 90 % jsou klinicky významné; pod 80 % znamenají těžkou desaturaci.",
    },
    "SL-SpO2avg": {
      name: "Průměrná SpO2",
      description:
        "Průměrná saturace kyslíkem během celého spánku. Norma ≥94 %. Snížené hodnoty naznačují chronickou intermitentní hypoxii.",
    },
    "SL-T90": {
      name: "Čas pod 90 % SpO2",
      description:
        "Procento celkového spánku strávené se saturací pod 90 %. Norma <1 %. Zvýšené hodnoty znamenají významnou noční hypoxémii.",
    },
    "SL-SFI": {
      name: "Index chrápání (SFI)",
      description:
        "Podíl doby spánku strávené chrápáním. Vyšší hodnoty znamenají častější chrápání, znak zvýšeného odporu horních cest dýchacích.",
    },
    "B-HbA1c": {
      name: "HbA1c (Glykovaný hemoglobin)",
      description:
        "Měří průměrnou hladinu cukru v krvi za posledních 2–3 měsíce. Zlatý standard dlouhodobé kontroly glykémie. <5,7 % norma, 5,7–6,4 % prediabetes, ≥6,5 % diabetes.",
    },
    "S-INS": {
      name: "Inzulín nalačno",
      description:
        "Inzulín uvolněný slinivkou k regulaci krevního cukru. Hladiny nalačno odhalují inzulínovou rezistenci — zvýšený inzulín s normální glukózou je časný varovný signál metabolické dysfunkce.",
    },
    "S-DHEA": {
      name: "DHEA-S (Dehydroepiandrosteron sulfát)",
      description:
        'Nadledvinový „regenerační hormon" podporující odolnost vůči stresu, reparační procesy, imunitní funkci a vitalitu. S věkem klesá; vyšší hladiny jsou spojeny s dlouhověkostí.',
    },
    "S-TESTO": {
      name: "Testosteron (celkový)",
      description:
        "Primární mužský pohlavní hormon, důležitý pro muže i ženy. Podporuje svalovou sílu, kostní denzitu, náladu, libido a kardiovaskulární zdraví. S věkem klesá.",
    },
    "S-fTESTO": {
      name: "Volný testosteron",
      description:
        "Biologicky dostupná forma testosteronu nevázaná na bílkoviny. Klinicky relevantnější než celkový testosteron, protože odráží hormon skutečně dostupný tkáním.",
    },
    "S-hsCRP": {
      name: "hs-CRP (Vysoce citlivý C-reaktivní protein)",
      description:
        "Ultracitlivé měření systémového zánětu. Zlatý standard zánětlivého markeru — zvýšené hodnoty jsou silně spojeny s kardiovaskulárním rizikem, kognitivním poklesem a chronickými onemocněními.",
    },
    "S-TNF": {
      name: "TNF-alfa (Tumor nekrotizující faktor)",
      description:
        "Klíčový zánětlivý cytokin podílející se na systémovém zánětu a regulaci imunity. Zvýšené hladiny jsou spojeny s chronickými zánětlivými stavy, autoimunitními onemocněními a metabolickou dysfunkcí.",
    },
    "S-S100B": {
      name: "Protein S-100B",
      description:
        "Marker neurozánětu. Zvýšené hladiny ukazují na narušení hematoencefalické bariéry, poškození mozku nebo neurozánět. Vysoké i nízké hodnoty jsou spojeny s kognitivním poklesem.",
    },
    "S-ApoA1": {
      name: "Apolipoprotein A1 (Apo-A1)",
      description:
        "Hlavní proteinová složka HDL částic. Přesnější ukazatel HDL částic a tím kardiovaskulární ochrany. Vyšší hladiny znamenají lepší zpětný transport cholesterolu.",
    },
    "S-LDLP": {
      name: "Počet LDL částic (LDL-P)",
      description:
        "Počítá skutečný počet LDL částic, nejen obsah cholesterolu. Přesnější měřítko kardiovaskulárního rizika způsobeného LDL než standardní LDL-C, zejména při variabilní velikosti částic.",
    },
    "S-oxLDL": {
      name: "Oxidovaný LDL (oxLDL)",
      description:
        "LDL cholesterol poškozený oxidací. Přímo měří oxidační stres, zánět, endoteliální dysfunkci a rozvoj aterosklerotického plátu.",
    },
    "S-Lpa": {
      name: "Lipoprotein(a) [Lp(a)]",
      description:
        "Geneticky determinovaný lipoprotein podporující aterosklerózu a trombózu. Zvýšené hladiny jsou spojeny se zvýšeným rizikem srdečních onemocnění a mrtvice. Životním stylem téměř neovlivnitelný.",
    },
    "S-CysC": {
      name: "Cystatin C",
      description:
        "Citlivější biomarker funkce ledvin a kardiovaskulárního rizika než kreatinin. Není ovlivněn svalovou hmotou, dietou ani věkem — poskytuje čistší odhad skutečné ledvinové filtrace.",
    },
    "S-O3I": {
      name: "Omega-3 index",
      description:
        "Měří EPA a DHA jako procento membrán červených krvinek. Vyšší hodnoty (>8 %) jsou silně spojeny se sníženým kardiovaskulárním rizikem, nižším zánětem a lepším zdravím mozku.",
    },
    "S-GSH": {
      name: "Glutathion",
      description:
        "Hlavní antioxidant těla, nezbytný pro detoxikaci, snižování oxidačního stresu a podporu imunitní funkce. S věkem klesá; udržení vysokých hladin je spojeno s dlouhověkostí.",
    },
    "S-BNP": {
      name: "BNP (Mozkový natriuretický peptid)",
      description:
        "Hormon uvolněný srdcem v reakci na napínání srdečního svalu. Měří srdeční zátěž nebo selhání. Nízké hodnoty ukazují na zdravé srdce; zvýšené naznačují srdeční zátěž nebo selhání.",
    },
    "S-CAC": {
      name: "CAC skóre (Kalcium koronárních tepen)",
      description:
        "CT měření hromadění vápníku v koronárních tepnách. Skóre 0 je ideální — žádný detekovatelný plát. Vyšší skóre kvantifikuje aterosklerotickou zátěž a kardiovaskulární riziko.",
    },
    "S-TelL": {
      name: "Délka telomer",
      description:
        "Měří ochranné čepičky na chromozomech, které se s věkem zkracují. Odráží buněčné stárnutí a ovlivňuje riziko věkově podmíněných onemocnění. Delší telomery jsou spojeny s biologickým mládím.",
    },
    "S-HCY": {
      name: "Homocystein",
      description:
        "Aminokyselina spojená s kardiovaskulárním onemocněním, mrtvicí a kognitivním poklesem při zvýšení. Vysoké hladiny ukazují na nedostatek B12/kyseliny listové nebo problémy s metylací. Snadno léčitelné vitaminy skupiny B.",
    },
    "S-LDH": {
      name: "LDH (Laktátdehydrogenáza)",
      description:
        "Enzym uvolňovaný při poškození buněk. Zvýšený u mnoha stavů včetně infarktu, onemocnění jater, hemolytické anémie a nádorů. Nespecifický, ale užitečný jako obecný marker poškození tkání.",
    },
    "S-DBIL": {
      name: "Přímý bilirubin (konjugovaný)",
      description:
        "Bilirubin zpracovaný játry. Zvýšený specificky při obstrukci žlučových cest, onemocnění jater nebo hepatitidě. Pomáhá rozlišit příčiny žloutenky při zvýšeném celkovém bilirubinu.",
    },
    "S-ApoB": {
      name: "Apolipoprotein B (ApoB)",
      description:
        "Jedna molekula ApoB na každou aterogenní lipoproteinovou částici (LDL, VLDL, Lp(a)). Považován za nejlepší jednotlivé měřítko aterogenního rizika — lepší než samotný LDL-C. Nižší je lepší.",
    },
    "S-VLDL": {
      name: "VLDL cholesterol",
      description:
        "Lipoprotein o velmi nízké hustotě nesoucí převážně triglyceridy. Zvýšený při vysokém příjmu sacharidů/alkoholu a metabolickém syndromu. Přispívá k ateroskleróze vedle LDL.",
    },
    "S-Ca": {
      name: "Vápník",
      description:
        "Nezbytný minerál pro kosti, svalovou kontrakci, nervovou signalizaci a srážení krve. Vysoké (hyperparatyreóza, nádory) i nízké (nedostatek vitaminu D) hodnoty jsou klinicky významné.",
    },
    "S-P": {
      name: "Fosfor (fosfát)",
      description:
        "Minerál nezbytný pro zdraví kostí, produkci energie a acidobazickou rovnováhu. Spolupracuje s vápníkem. Abnormální hladiny mohou ukazovat na onemocnění ledvin, poruchy příštítných tělísek nebo problémy s vitaminem D.",
    },
    "S-B12": {
      name: "Vitamin B12 (Kobalamin)",
      description:
        "Nezbytný vitamin pro nervovou funkci, tvorbu červených krvinek a syntézu DNA. Nedostatek způsobuje megaloblastickou anémii a neurologické poškození. Častý u vegetariánů a starších osob.",
    },
    "S-FOL": {
      name: "Kyselina listová (folát)",
      description:
        "Vitamin skupiny B nezbytný pro syntézu DNA, tvorbu červených krvinek a vývoj nervové trubice. Nedostatek způsobuje megaloblastickou anémii. Důležitý v těhotenství a společně s B12.",
    },
    "S-fT3": {
      name: "Volný T3 (trijodtyronin)",
      description:
        "Nejaktivnější hormon štítné žlázy — T4 se v tkáních přeměňuje na T3. Nízký fT3 s normálním TSH/fT4 může ukazovat na syndrom nemocného eutyreoidního stavu nebo špatnou konverzi T4 na T3.",
    },
    "S-E2": {
      name: "Estradiol (E2)",
      description:
        "Primární estrogenový hormon. Důležitý pro obě pohlaví — reguluje kostní denzitu, kardiovaskulární zdraví, náladu a libido. U mužů jsou velmi vysoké i velmi nízké hodnoty problematické.",
    },
    "S-CORT": {
      name: "Kortizol",
      description:
        "Primární stresový hormon produkovaný nadledvinami. Má denní rytmus (vysoký ráno, nízký večer). Chronicky zvýšené hladiny ukazují na stres, Cushingův syndrom; nízké na nedostatečnost nadledvin.",
    },
    "S-IGF1": {
      name: "IGF-1 (Inzulinu podobný růstový faktor 1)",
      description:
        "Růstový faktor zprostředkující účinky růstového hormonu. Podílí se na růstu svalů, kostní denzitě a opravě tkání. Vysoké hladiny mohou zvýšit riziko nádorů; nízké ukazují na deficit růstového hormonu.",
    },
    "S-SHBG": {
      name: "SHBG (Globulin vázající pohlavní hormony)",
      description:
        "Protein vázající a transportující pohlavní hormony (testosteron, estradiol). Vysoký SHBG snižuje volné/biodostupné hormony. Ovlivněn funkcí štítné žlázy, zdravím jater, obezitou a stárnutím.",
    },
    "S-PRL": {
      name: "Prolaktin",
      description:
        "Hormon hypofýzy primárně zapojený do laktace. Zvýšený u obou pohlaví adenomy hypofýzy, léky, stresem nebo hypotyreózou. Vysoké hladiny mohou potlačit testosteron a způsobit příznaky.",
    },
    "S-LH": {
      name: "LH (Luteinizační hormon)",
      description:
        "Hormon hypofýzy stimulující produkci testosteronu u mužů a ovulaci u žen. Používá se s FSH k hodnocení plodnosti, hypogonadismu a funkce hypofýzy.",
    },
    "S-FSH": {
      name: "FSH (Folikulostimulační hormon)",
      description:
        "Hormon hypofýzy regulující reprodukční funkci. U mužů stimuluje tvorbu spermií. Zvýšený FSH s nízkým testosteronem ukazuje na primární hypogonadismus (selhání varlat).",
    },
    "B-RET": {
      name: "Retikulocyty",
      description:
        "Nezralé červené krvinky čerstvě uvolněné z kostní dřeně. Zvýšený počet ukazuje na aktivní tvorbu červených krvinek (odpověď na anémii nebo ztrátu krve). Nízký počet naznačuje útlum kostní dřeně.",
    },
    "S-IgG": {
      name: "IgG (Imunoglobulin G)",
      description:
        "Nejhojnější protilátka v krvi zajišťující dlouhodobou imunitu. Zvýšený u chronických infekcí, autoimunitních onemocnění a onemocnění jater. Nízké hladiny ukazují na imunodeficienci.",
    },
    "S-IgM": {
      name: "IgM (Imunoglobulin M)",
      description:
        "První protilátka produkovaná v reakci na novou infekci. Zvýšený IgM ukazuje na akutní nebo nedávnou infekci. Také zvýšený u Waldenströmovy makroglobulinémie a některých autoimunitních stavů.",
    },
    "S-IgE": {
      name: "IgE (Imunoglobulin E)",
      description:
        "Protilátka zapojená do alergických reakcí a obrany proti parazitům. Zvýšená u alergií, astmatu, ekzému a parazitárních infekcí. Používá se k hodnocení alergického stavu a monitorování léčby.",
    },
    "S-HOMA": {
      name: "HOMA-IR (Index inzulínové rezistence)",
      description:
        "Vypočtený z glukózy a inzulínu nalačno: (glukóza × inzulín) / 22,5. Odhaduje inzulínovou rezistenci. Hodnoty <1,0 jsou optimální; >2,5 naznačuje významnou inzulínovou rezistenci a metabolické riziko.",
    },
    "S-PSA": {
      name: "PSA (Prostatický specifický antigen)",
      description:
        "Protein produkovaný prostatou. Primární screeningový marker karcinomu prostaty u mužů. Také zvýšený u benigní hyperplazie prostaty a prostatitidy. Rostoucí trend je významnější než absolutní hodnota.",
    },
    "S-FAI": {
      name: "Index volných androgenů",
      description:
        "Vypočtený poměr celkového testosteronu k SHBG, odhadující biologicky dostupný testosteron. Užitečný při abnormálním SHBG. Vysoké hodnoty mohou ukazovat na PCOS u žen nebo nadbytek androgenů.",
    },
    "S-PTH": {
      name: "PTH (Parathormon)",
      description:
        "Hormon regulující rovnováhu vápníku a fosforu. Zvýšený při nedostatku vitamínu D (sekundární hyperparatyreóza), primární hyperparatyreóze nebo onemocnění ledvin. Nízké hodnoty po operaci štítné žlázy.",
    },
    "S-Cai": {
      name: "Ionizovaný vápník",
      description:
        "Biologicky aktivní forma vápníku v krvi, nevázaná na bílkoviny. Přesnější než celkový vápník, zejména při abnormálním albuminu. Nízké hodnoty mohou ukazovat na hypoparatyreózu nebo nedostatek vitamínu D.",
    },
    "S-Cpep": {
      name: "C-peptid",
      description:
        "Vedlejší produkt tvorby inzulínu, uvolňovaný ve stejném množství. Měří endogenní sekreci inzulínu nezávisle na exogenním inzulínu. Užitečný pro odlišení diabetu 1. a 2. typu.",
    },
    "S-PROG": {
      name: "Progesteron",
      description:
        "Steroidní hormon zapojený především do menstruačního cyklu a těhotenství. U mužů produkován v malém množství nadledvinami a varlaty. Zvýšené hladiny jsou vzácné a mohou ukazovat na patologii nadledvin nebo varlat.",
    },
    "S-LIST": {
      name: "Index volného testosteronu (LIST)",
      description:
        "Laboratorně vypočtený index volného testosteronu. Odlišný od FAI — používá jiný vzorec. Vyšší hodnota ukazuje na více biologicky dostupného testosteronu.",
    },
  },
};

export default cs;
