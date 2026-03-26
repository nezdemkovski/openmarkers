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
    timelineDesc:
      "Všechna data odběrů na časové ose. Kliknutím zobrazíte kompletní výsledky.",
    comparison: "Porovnání",
    export: "Exportovat data",
    import: "Importovat data",
    importConflictTitle: "Uživatel již existuje",
    importConflictMessage:
      'Uživatel "{name}" již existuje. Zadejte nové jméno nebo zrušte.',
    importRename: "Importovat",
    importCancel: "Zrušit",
    importError: "Chyba importu",
    importInvalidJson: "Neplatný JSON soubor.",
    deleteUser: "Smazat uživatele",
    deleteUserTitle: "Smazat uživatele",
    deleteUserMessage:
      'Opravdu chcete smazat "{name}"? Všechna data budou trvale odstraněna.',
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
    correlationsDesc:
      "Souvisejíci biomarkery, které spolu tvoří celkový obraz.",
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
    bioAgeDesc:
      "Odhad pomocí Levineho PhenoAge vzorce z 9 krevních biomarkerů.",
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
    getStartedDesc:
      "Importujte svá laboratorní data nebo vytvořte nový profil.",
    createProfile: "Vytvořit nový profil",
    createProfileDesc: "Začněte s prázdným profilem.",
    profileName: "Jméno",
    dateOfBirth: "Datum narození",
    sexMale: "Muž",
    sexFemale: "Žena",
    importingData: "Importuji...",
    importDesc: "Nahrajte JSON soubor s laboratorními výsledky.",
    importSettingsDesc:
      "Importujte laboratorní výsledky z JSON souboru. Vytvoří se nový profil s importovanými daty — stávající profily nebudou ovlivněny.",
    importSelectFile: "Vybrat JSON soubor",
    demoDesc: "Prozkoumejte aplikaci se vzorovými daty.",
    demoMode: "Prohlížíte si vzorová data",
    exitDemo: "Ukončit demo",
    addLabVisit: "Přidat odběr",
    addManually: "Zadat ručně",
    addLabVisitDesc: "Zadejte výsledky z krevního odběru ručně.",
    addLabVisitDate: "Datum odběru",
    addLabVisitSearch: "Hledat biomarkery...",
    addLabVisitSubmit: "Uložit výsledky",
    addLabVisitSaving: "Ukládám...",
    addLabVisitNValues: "{n} hodnot zadáno",
    addLabVisitNoMatch: "Žádné biomarkery neodpovídají hledání.",
    addLabVisitEmpty: "Zadejte alespoň jednu hodnotu.",
    addYourData: "Přidejte svá data",
    addYourDataDesc:
      "Váš profil je připraven. Přidejte první výsledky z odběrů.",
    uploadLabReport: "Nahrát laboratorní zprávu",
    uploadLabReportDesc: "Přetáhněte PDF nebo foto výsledků krevních testů",
    uploadDrop: "Přetáhněte laboratorní zprávu sem",
    uploadFormats: "PDF, JPG nebo PNG — do 20 MB",
    uploadHint:
      "Nejlepší výsledky s jednou návštěvou laboratoře. Velké zprávy s mnoha daty mohou ztratit některé hodnoty.",
    uploadChooseFile: "Vybrat soubor",
    uploadUploading: "Nahrávání...",
    uploadReading: "Čtení laboratorní zprávy...",
    uploadReview: "Zkontrolujte extrahované hodnoty",
    uploadReviewDesc:
      "Zkontrolujte hodnoty níže a opravte případné chyby před importem.",
    uploadSuspicious: "zkontrolujte — možná špatná jednotka",
    uploadAiDisclaimer:
      "Hodnoty jsou extrahovány pomocí AI a mohou obsahovat chyby. Před importem je prosím ověřte oproti původní zprávě.",
    uploadConfirm: "Potvrdit a importovat",
    uploadCancel: "Zrušit",
    uploadDontClose: "Prosím nezavírejte tuto stránku během zpracování.",
    uploadImporting: "Importování...",
    uploadSuccess: "Laboratorní výsledky úspěšně importovány",
    uploadColBiomarker: "Biomarker",
    uploadColValue: "Hodnota",
    uploadColDate: "Datum",
    uploadTooLarge: "Soubor je příliš velký. Maximální velikost je 20 MB.",
    uploadError:
      "Nepodařilo se extrahovat výsledky z tohoto souboru. Zkuste jasnější obrázek nebo PDF.",
    uploadRemaining: "nahrávání zbývá tento měsíc",
    uploadLimitReached:
      "Měsíční limit nahrávání dosažen (5 za měsíc). Stále můžete zadat hodnoty ručně.",
    uploadUnknownTitle: "Zatím nepodporované biomarkery — přeskočeny",
    uploadUnknownReport: "Nahlaste je na GitHubu, abychom je mohli přidat",
    aiImport: "Vytvořit soubor pro import pomocí AI",
    aiImportDesc:
      "Máte PDF nebo laboratorní zprávu? Pomocí AI ji převeďte na soubor k importu.",
    aiImportInstructions:
      "Zkopírujte prompt níže a vložte ho do ChatGPT, Claude nebo jiného AI asistenta spolu s vašimi výsledky (text, foto nebo PDF). Vygeneruje vám JSON soubor.",
    aiImportThen:
      "Uložte výstup jako .json soubor a nahrajte ho pomocí Import výše.",
    schemaTip:
      "Tip: Přidejte pole $schema pro automatické doplňování a validaci",
    schemaTipDesc:
      "Přidejte tento řádek na začátek JSON souboru pro automatické doplňování a kontrolu chyb ve VS Code a dalších editorech:",
    mcpSetup: "MCP Server",
    mcpSetupDesc: "Připojte AI asistenta přímo k OpenMarkers.",
    mcpSetupInstructions:
      "Přidejte toto do konfigurace MCP vašeho AI klienta (Claude Desktop, Cursor apod.):",
    mcpSetupAuth:
      "AI klient se ověří přes OAuth při prvním připojení — stačí schválit přihlášení v prohlížeči.",
    mcpSetupToolsTitle: "Hlavní dostupné nástroje:",
    mcpToolImport:
      "Hromadný import strukturovaných laboratorních dat jako JSON",
    mcpToolSchema:
      "Získat všechny podporované ID biomarkerů, jednotky a referenční rozsahy",
    mcpToolAddResult: "Přidat jednotlivé laboratorní výsledky",
    mcpToolGetProfile: "Zobrazit všechna data podle kategorií",
    mcpToolTrends: "Analyzovat trendy, směr a varování u biomarkerů",
    mcpToolAnalysis: "Vygenerovat kompletní zdravotní analýzu ze všech dat",
    mcpToolsMore:
      "A další — AI asistent automaticky objeví všechny dostupné nástroje.",
    settings: "Nastavení",
    settingsAppearance: "Vzhled",
    settingsTheme: "Motiv",
    settingsThemeLight: "Světlý",
    settingsThemeDark: "Tmavý",
    settingsLanguage: "Jazyk",
    settingsUnitSystem: "Jednotky",
    settingsUnitSystemDesc:
      "Zvolte zobrazení laboratorních hodnot. SI (mezinárodní systém) používá mmol/l, µmol/l, µkat/l — standard v Evropě. Konvenční používá mg/dL, U/L, g/dL — standard v USA. Uložená data nejsou ovlivněna, mění se pouze zobrazení.",
    settingsUnitSI: "SI (Evropa)",
    settingsUnitConventional: "Konvenční (USA)",
    settingsProfiles: "Profily",
    settingsEditProfile: "Upravit profil",
    settingsAiUsage: "AI extrakce laboratorních zpráv",
    settingsAiUsageDesc:
      "Nahrajte PDF nebo foto laboratorní zprávy a AI extrahuje hodnoty. Omezeno na 5 nahrávání za měsíc.",
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
    settingsDeleteAccountDesc:
      "Trvale smazat účet a všechny profily. Tuto akci nelze vrátit.",
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
    settingsMcpTokenDesc:
      "Tento token periodicky expiruje. Před konfigurací AI klienta zkopírujte nový.",
    settingsMcpConfigDesc:
      "Přidejte toto do MCP konfigurace vašeho AI klienta:",
    settingsMcpTools:
      "Dostupné nástroje: seznam profilů, trendy, biologický věk, korelace, AI analýzy a další.",
    settingsCli: "CLI nástroj",
    settingsCliDesc:
      "Spravujte profily, importujte výsledky a spouštějte analytiku z terminálu. Navrženo pro bezproblémovou spolupráci s AI agenty.",
    settingsCliInstall: "Instalace přes Homebrew",
    settingsCliUsage: "Poté spusťte:",
    authConsent:
      "Souhlasím s uložením výsledků krevních testů a laboratorních dat",
    authDisclaimer:
      "Toto není zdravotnický prostředek ani zdravotní služba. Nejedná se o lékařskou radu.",
    heroH1: "Podívejte se, co vaše krevní testy opravdu říkají.",
    heroDesc:
      "Sledujte 100+ biomarkerů v čase. Open source. Připojte jakékoli AI přes MCP.",
    heroIntegrations: "Funguje s",
    heroBadgeOpenSource: "Open source",
    heroBadgeBiomarkers: "100+ biomarkerů",
    heroBadgeMcp: "AI přes MCP",
    useCasesHeading: "Proč OpenMarkers",
    useCase1Title: "Nahrajte laboratorní zprávu",
    useCase1Desc:
      "Přetáhněte PDF nebo foto výsledků krevních testů. AI přečte každou hodnotu — stačí zkontrolovat a potvrdit.",
    useCase2Title: "Připojte jakéhokoli AI asistenta",
    useCase2Desc:
      "Přidejte jeden řádek do MCP konfigurace. Claude, ChatGPT, Cursor — všechny fungují.",
    useCase3Title: "Sledujte trendy v čase",
    useCase3Desc:
      "Každý biomarker v grafu s referenčními rozsahy. Biologický věk, korelace a upozornění na trendy.",
    trustHeading: "Vaše data, vaše pravidla",
    trustOpenSourceTitle: "Open Source",
    trustOpenSourceDesc:
      "Plně otevřený zdrojový kód. Zkontrolujte každý řádek.",
    trustFamilyTitle: "Pro vás a vaši rodinu",
    trustFamilyDesc:
      "Vytvořte více profilů pod jedním účtem. Sledujte své zdraví i zdraví svých blízkých — vše na jednom místě.",
    trustShareTitle: "Sdílejte svůj profil",
    trustShareDesc:
      "Zveřejněte svá data s vlastním odkazem. Nechte ostatní sledovat vaši cestu biomarkery.",
    heroDemoButton: "Prozkoumat s ukázkovými daty",
    heroMcpDesc:
      "Připojte jakéhokoli AI asistenta k vašim biomarkerům přes MCP",
    heroCliDesc:
      "Spravujte data z terminálu — skvěle funguje s {openClawLink} a podobnými osobními agenty",
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
    shareProfileDesc:
      "Zveřejněte tento profil na vlastní URL. Kdokoli s odkazem uvidí vaše data.",
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
      description:
        "Základní biochemický panel měřící funkci ledvin, elektrolyty, jaterní enzymy, bílkoviny a lipidy.",
    },
    diabetology: {
      name: "Diabetologie",
      description:
        "Markery krevního cukru pro screening a monitorování diabetes mellitus.",
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
};

export default cs;
