import type { TranslationData } from "../types";

const is: TranslationData = {
  ui: {
    appName: "OpenMarkers",
    subtitle: "Rannsóknagagnaskrá",
    viewAll: "Skoða allt",
    allResults: "Allar niðurstöður",
    allResultsDesc: "Yfirlit yfir alla rannsóknaflokka og lífmerki.",
    qualitativeResults: "Eigindlegar niðurstöður",
    flagged: "merkt",
    allOk: "Allt í lagi",
    ok: "Í lagi",
    outOfRange: "UTAN VIÐMIÐA",
    normal: "eðlilegt",
    ref: "Viðm.",
    loading: "Greini sýni...",
    test: "Próf",
    biomarkers: "lífmerki",
    biomarker: "lífmerki",
    timeline: "Tímalína",
    timelineDesc:
      "Allar rannsóknardagsetningar á tímalínu. Smelltu á dagsetningu til að sjá heildaryfirlit.",
    comparison: "Samanburður",
    export: "Flytja út gögn",
    import: "Flytja inn gögn",
    importConflictTitle: "Notandi er þegar til",
    importConflictMessage:
      'Notandi að nafni "{name}" er þegar til. Sláðu inn nýtt nafn eða hættu við.',
    importRename: "Flytja inn",
    importCancel: "Hætta við",
    importError: "Innflutningsvilla",
    importInvalidJson: "Ógild JSON skrá.",
    deleteUser: "Eyða notanda",
    deleteUserTitle: "Eyða notanda",
    deleteUserMessage:
      'Ertu viss um að þú viljir eyða "{name}"? Öll gögn verða fjarlægð varanlega.',
    deleteUserConfirm: "Eyða",
    comparisonDesc:
      "Berðu saman niðurstöður milli tveggja rannsóknardaga hlið við hlið.",
    snapshot: "Skyndimynd",
    from: "Frá",
    to: "Til",
    change: "Breyting",
    improved: "batnað",
    worsened: "versnað",
    selectDifferentDates: "Veldu tvær mismunandi dagsetningar til samanburðar.",
    noDataForDate: "Engin gögn fyrir þessa dagsetningu.",
    reminders: "Áminningar",
    lastTested: "síðast mælt",
    daysAgo: "dögum síðan",
    monthsAgo: "mánuðum síðan",
    overdue: "tímabært",
    overdueCategories: "flokkar tímabærir til mælingar",
    overdueDesc: "Sumar prófanir hafa ekki verið uppfærðar í nokkurn tíma",
    sinceLast: "frá síðustu",
    overall: "heild",
    personalRange: "Þitt svið",
    correlations: "Tengdir flokkar",
    correlationsDesc: "Tengd lífmerki sem segja sögu saman.",
    iron_panel: "Járnflokkur",
    lipid_panel: "Fituflokkur",
    liver_panel: "Lifrarflokkur",
    thyroid_panel: "Skjaldkirtilsflokkur",
    kidney_panel: "Nýrnaflokkur",
    aiAnalysis: "Gervigreindargreining",
    aiAnalysisDesc:
      "Notaðu {mcpLink} eða {cliLink} fyrir áframhaldandi gervigreindargreiningu, eða afritaðu þessa kvaðningu í hvaða gervigreindaraðstoðarmann sem er fyrir einstaka yfirferð.",
    aiAnalysisSetupMcp: "MCP-þjóninn",
    aiAnalysisSetupCli: "CLI-tólið",
    copyPrompt: "Afrita kvaðningu",
    copied: "Afritað!",
    showPrompt: "Forskoða",
    hidePrompt: "Fela",
    bioAge: "Líffræðilegur aldur",
    bioAgeDesc: "Áætlaður með PhenoAge formúlu Levine úr 9 blóðlífmerkjum.",
    chronoAge: "Tímafræðilegur aldur",
    yearsOlder: "árum eldri",
    yearsYounger: "árum yngri",
    bioAgeEqual: "sami og tímafræðilegur aldur",
    mortalityScore: "Dánarstig",
    mortalityScoreDesc: "10 ára áhætta",
    dnamAge: "Áætlaður DNAm aldur",
    dnamAgeDesc: "DNA metýleringaráætlun",
    dnamMortality: "DNAm dánartíðni",
    dnamMortalityDesc: "DNAm-undirstaða áhætta",
    bioAgeLocked: "Bættu við merkjum til að opna",
    bioAgeLockedMarkers: "Vantar merki",
    editResults: "Breyta niðurstöðum",
    editResultsLink: "breyta niðurstöðum",
    addResult: "Bæta við",
    resultDate: "Dagsetning",
    resultValue: "Gildi",
    save: "Vista",
    delete: "Eyða",
    deleteResultConfirm: "Ertu viss um að þú viljir eyða þessari niðurstöðu?",
    authLogin: "Skrá inn",
    authSignUp: "Nýskrá",
    authSignOut: "Skrá út",
    authEmail: "Netfang",
    authPassword: "Lykilorð",
    authTryDemo: "Prófa kynningu",
    getStarted: "Byrjaðu",
    getStartedFree:
      "Vertu hluti af samfélaginu. Deildu merkjunum þínum með heiminum.",
    goToApp: "Fara í appið",
    landingWelcomeBack: "Gögnin þín bíða þín.",
    landingPeople: "manns",
    getStartedDesc: "Flytjið inn rannsóknargögn eða búið til nýjan prófíl.",
    createProfile: "Búa til nýjan prófíl",
    createProfileDesc: "Byrjið með tóman prófíl.",
    profileName: "Nafn",
    dateOfBirth: "Fæðingardagur",
    sexMale: "Karl",
    sexFemale: "Kona",
    importingData: "Flyt inn...",
    importDesc: "Hlaðið upp JSON-skrá með rannsóknarniðurstöðum.",
    importSettingsDesc:
      "Flytjið inn rannsóknarniðurstöður úr JSON-skrá. Nýr prófíll verður búinn til með innfluttum gögnum — núverandi prófílar verða ekki fyrir áhrifum.",
    importSelectFile: "Velja JSON-skrá",
    demoDesc: "Skoðið forritið með sýnigögnum.",
    demoMode: "Þú skoðar sýnigögn",
    exitDemo: "Hætta kynningu",
    addLabVisit: "Bæta við rannsókn",
    addManually: "Slá inn handvirkt",
    addLabVisitDesc: "Sláðu inn niðurstöður úr blóðrannsókn handvirkt.",
    addLabVisitDate: "Dagsetning rannsóknar",
    addLabVisitSearch: "Leita að lífvísum...",
    addLabVisitSubmit: "Vista niðurstöður",
    addLabVisitSaving: "Vista...",
    addLabVisitNValues: "{n} gildi skráð",
    addLabVisitNoMatch: "Engir lífvísar passa við leit.",
    addLabVisitEmpty: "Sláðu inn að minnsta kosti eitt gildi.",
    addYourData: "Bættu við gögnum",
    addYourDataDesc:
      "Prófíllinn þinn er tilbúinn. Bættu við fyrstu rannsóknarniðurstöðunum.",
    uploadLabReport: "Hlaða upp rannsóknarskýrslu",
    uploadLabReportDesc: "Dragðu PDF eða mynd af blóðrannsóknarniðurstöðum",
    uploadDrop: "Dragðu rannsóknarskýrslu hér",
    uploadFormats: "PDF, JPG eða PNG — allt að 20 MB",
    uploadHint:
      "Best árangur með einni rannsókn. Stórar skýrslur með mörgum dagsetningum geta misst nokkur gildi.",
    uploadChooseFile: "Velja skrá",
    uploadUploading: "Hleður upp...",
    uploadReading: "Les rannsóknarskýrslu...",
    uploadReview: "Skoðaðu útdregin gildi",
    uploadReviewDesc:
      "Athugaðu gildin hér að neðan og leiðréttu villur áður en flutt er inn.",
    uploadSuspicious: "athugaðu — gæti verið röng eining",
    uploadAiDisclaimer:
      "Gildi eru dregin út af gervigreind og geta innihaldið villur. Vinsamlegast staðfestu við upprunalegu skýrsluna áður en þú flytur inn.",
    uploadConfirm: "Staðfesta og flytja inn",
    uploadCancel: "Hætta við",
    uploadDontClose: "Vinsamlegast ekki loka þessari síðu meðan unnið er.",
    uploadImporting: "Flytur inn...",
    uploadSuccess: "Rannsóknarniðurstöður fluttar inn",
    uploadColBiomarker: "Lífmerki",
    uploadColValue: "Gildi",
    uploadColDate: "Dagsetning",
    uploadTooLarge: "Skráin er of stór. Hámarksstærð er 20 MB.",
    uploadError:
      "Gat ekki dregið niðurstöður úr þessari skrá. Prófaðu skýrari mynd eða PDF.",
    uploadRemaining: "upphleðslur eftir í þessum mánuði",
    uploadLimitReached:
      "Mánaðarleg upphleðslumörk náð (5 á mánuði). Þú getur enn slegið inn gildi handvirkt.",
    uploadUnknownTitle: "Gat ekki samsvörun þessum merkjum",
    uploadUnknownSelect: "Áttirðu við...",
    uploadUnknownReport: "Tilkynntu vantar lífmerki á GitHub",
    aiImport: "Búa til innflutningsskrá með AI",
    aiImportDesc:
      "Ertu með PDF eða rannsóknarskýrslu? Notaðu AI til að búa til skrá til innflutnings.",
    aiImportInstructions:
      "Afritaðu promptið hér að neðan og límdu í ChatGPT, Claude eða annan AI aðstoðarmann ásamt niðurstöðum (texti, mynd eða PDF). Hann býr til JSON-skrá fyrir þig.",
    aiImportThen:
      "Vistaðu úttakið sem .json skrá og notaðu Flytja inn hér að ofan.",
    schemaTip:
      "Ábending: Bættu við $schema reit fyrir sjálfvirka útfyllingu og villuleit",
    schemaTipDesc:
      "Bættu þessari línu efst í JSON-skrána til að fá sjálfvirka útfyllingu og villuprófun í VS Code og öðrum ritlum:",
    mcpSetup: "MCP Þjónn",
    mcpSetupDesc: "Tengdu AI aðstoðarmann beint við OpenMarkers.",
    mcpSetupInstructions:
      "Bættu þessu við MCP stillingar AI biðlarans þíns (Claude Desktop, Cursor o.fl.):",
    mcpSetupAuth:
      "AI biðlarinn auðkennir sig með OAuth þegar hann tengist fyrst — samþykktu innskráningu í vafranum.",
    mcpSetupToolsTitle: "Helstu tæki í boði:",
    mcpToolImport: "Magninnflutningur skipulagðra rannsóknargagna sem JSON",
    mcpToolSchema:
      "Sækja öll studd lífvísaauðkenni, einingar og viðmiðunargildi",
    mcpToolAddResult: "Bæta við einstökum rannsóknarniðurstöðum",
    mcpToolGetProfile: "Skoða öll gögn raðað eftir flokkum",
    mcpToolTrends: "Greina þróun, stefnu og viðvaranir fyrir lífvísa",
    mcpToolAnalysis: "Búa til heildar heilsugreiningu úr öllum gögnum",
    mcpToolsMore:
      "Og fleira — AI aðstoðarmaðurinn finnur öll tiltæk tæki sjálfkrafa.",
    settings: "Stillingar",
    settingsAppearance: "Útlit",
    settingsTheme: "Þema",
    settingsThemeLight: "Ljóst",
    settingsThemeDark: "Dökkt",
    settingsLanguage: "Tungumál",
    settingsUnitSystem: "Mælieiningar",
    settingsUnitSystemDesc:
      "Veldu hvernig rannsóknarniðurstöður birtast. SI (alþjóðlega kerfið) notar mmól/l, µmól/l, µkat/l — staðall í Evrópu. Hefðbundið notar mg/dL, U/L, g/dL — staðall í Bandaríkjunum. Gögn þín breytast ekki, aðeins birting.",
    settingsUnitSI: "SI (Evrópa)",
    settingsUnitConventional: "Hefðbundið (BNA)",
    settingsProfiles: "Prófílar",
    settingsEditProfile: "Breyta prófíl",
    settingsAiUsage: "AI útdráttur rannsóknarskýrslna",
    settingsAiUsageDesc:
      "Hladdu upp PDF eða mynd af rannsóknarskýrslu og AI dregur gildin út. Takmarkað við 5 upphleðslur á mánuði.",
    settingsAccount: "Reikningur",
    settingsChangeEmail: "Breyta netfangi",
    settingsChangePassword: "Breyta lykilorði",
    settingsCurrentPassword: "Núverandi lykilorð",
    settingsNewPassword: "Nýtt lykilorð",
    settingsNewEmail: "Nýtt netfang",
    settingsSave: "Vista",
    settingsSaved: "Vistað!",
    settingsError: "Villa",
    settingsDangerZone: "Hættusvæði",
    settingsDeleteAccount: "Eyða reikningi",
    settingsDeleteAccountDesc:
      "Eyða reikningi og öllum prófílum varanlega. Þetta er óafturkræft.",
    settingsDeleteAccountConfirm: "Sláðu inn DELETE til staðfestingar",
    settingsDateOfBirth: "Fæðingardagur",
    settingsSex: "Kyn",
    settingsMcp: "AI Aðstoðarmaður (MCP)",
    settingsMcpDesc:
      "Tengdu Claude, ChatGPT eða hvaða AI aðstoðarmann sem er við lífmerki gögnin þín í gegnum MCP.",
    settingsMcpEndpoint: "MCP Endapunktur",
    settingsMcpToken: "Auðkenningartákn þitt",
    settingsMcpCopied: "Afritað!",
    settingsMcpCopy: "Afrita",
    settingsMcpCopyToken: "Afrita tákn",
    settingsMcpCopyConfig: "Afrita stillingar",
    settingsMcpTokenDesc:
      "Þetta tákn rennur reglulega út. Afritaðu nýtt áður en þú stillir AI biðlarann.",
    settingsMcpConfigDesc: "Bættu þessu við MCP stillingar AI biðlarans þíns:",
    settingsMcpTools:
      "Verkfæri í boði: listi yfir prófíla, þróun, lífaldur, fylgni, AI greiningar og fleira.",
    settingsCli: "CLI tól",
    settingsCliDesc:
      "Stjórnaðu prófílum, fluttu inn niðurstöður og keyrðu greiningar úr skipanalínu. Hannað til að virka óaðfinnanlega með AI-þjónum.",
    settingsCliInstall: "Setja upp með Homebrew",
    settingsCliUsage: "Keyrðu síðan:",
    authConsent:
      "Ég samþykki að geyma blóðrannsóknarniðurstöður og rannsóknargögn",
    authDisclaimer:
      "Þetta er ekki lækningatæki eða heilbrigðisþjónusta. Ekki læknisráðgjöf.",
    heroH1: "Sjáðu hvað blóðrannsóknirnar þínar segja í raun.",
    heroDesc:
      "Fylgstu með 100+ lífmerkjum yfir tíma. Opinn hugbúnaður. Tengdu hvaða AI sem er gegnum MCP.",
    heroIntegrations: "Virkar með",
    heroBadgeOpenSource: "Opinn hugbúnaður",
    heroBadgeBiomarkers: "100+ lífmerki",
    heroBadgeMcp: "AI gegnum MCP",
    useCasesHeading: "Af hverju OpenMarkers",
    useCase1Title: "Hladdu upp rannsóknarskýrslu",
    useCase1Desc:
      "Dragðu PDF eða mynd af blóðrannsóknarniðurstöðum. AI les hvert gildi — skoðaðu og staðfestu.",
    useCase2Title: "Tengdu hvaða AI aðstoðarmann sem er",
    useCase2Desc:
      "Bættu einni línu við MCP stillingarnar. Claude, ChatGPT, Cursor — öll virka.",
    useCase3Title: "Fylgstu með þróun yfir tíma",
    useCase3Desc:
      "Hvert lífmerki á grafi með viðmiðunarsviðum. Líffræðilegur aldur, fylgni og þróunarviðvaranir.",
    trustHeading: "Þín gögn, þínar reglur",
    trustOpenSourceTitle: "Opinn hugbúnaður",
    trustOpenSourceDesc: "Fullkomlega opinn kóði. Skoðaðu hverja línu.",
    trustFamilyTitle: "Fyrir þig og fjölskylduna",
    trustFamilyDesc:
      "Búðu til marga prófíla undir einum reikningi. Fylgstu með heilsu þinni og ástvina — allt á einum stað.",
    trustShareTitle: "Deildu prófílnum þínum",
    trustShareDesc:
      "Gerðu gögnin opinber með sérsniðnum hlekk. Láttu aðra sjá lífmerkjaferðalagið þitt.",
    heroDemoButton: "Skoða með sýnigögnum",
    heroMcpDesc:
      "Tengdu hvaða AI aðstoðarmann sem er við lífmerkjagögnin þín gegnum MCP",
    heroCliDesc:
      "Stjórnaðu gögnunum úr skipanalínu — virkar vel með {openClawLink} og svipuðum persónulegum þjónum",
    featureChartsTitle: "Gröf og þróun",
    featureChartsDesc:
      "Sjónrændu hvert lífmerki yfir tíma með gagnvirkum gröfum. Viðmiðunarbil sýnd beint svo þú sérð frávik í fljótu bragði.",
    featureBioAgeTitle: "Líffræðilegur aldur",
    featureBioAgeDesc:
      "Reiknaðu líffræðilegan aldur þinn út frá 9 blóðlífmerkjum með PhenoAge formúlunni. Sjáðu hvernig líkaminn þinn eldist miðað við raunverulegan aldur.",
    featureBiomarkersTitle: "100+ lífmerki",
    featureBiomarkersDesc:
      "Frá grunnlífefnafræði til hormóna, blóðfræði, skjaldkirtils, járns, fitu og fleira. Flytjið inn niðurstöður sem JSON — gögnin eru alltaf þín.",
    featureAiTitle: "AI gegnum MCP",
    featureAiDesc:
      "Tengdu Claude, ChatGPT eða hvaða AI-aðstoðarmann sem er við gögnin þín gegnum MCP. Fáðu persónulega heilsufræðilega innsýn úr rannsóknarsögu þinni.",
    featurePrivacyTitle: "Einkalíf og opinn hugbúnaður",
    featurePrivacyDesc:
      "Gögnin þín eru aldrei deild með þriðju aðilum. Engin mælitæki, engin greining. Fullkomlega opinn hugbúnaður — hýstu sjálfur fyrir fulla stjórn.",
    shareProfile: "Deila prófíl",
    shareProfileDesc:
      "Gerðu þennan prófíl opinberan á sérsniðnu vefslóð. Allir með hlekkinn geta skoðað gögnin.",
    publicHandle: "Auðkenni",
    publicHandlePlaceholder: "heilsa-min",
    publicHandleAvailable: "Laust",
    publicHandleTaken: "Þegar í notkun",
    publicHandleInvalid: "3–40 stafir, lágstafir, tölur, bandstrik",
    publicProfileUrl: "Opinber vefslóð",
    publicProfileTitle: "Heilsuprófíll — {name}",
    publicProfilePoweredBy: "Keyrt af OpenMarkers",
    publicProfileNotFound: "Prófíll fannst ekki",
    publicProfileNotFoundDesc: "Þessi prófíll er ekki til eða er ekki opinber.",
    openProfiles: "Opinberir prófílar",
    openProfilesDesc: "Fólk sem deilir lífmerkjagögnum sínum opinberlega.",
  },
  categories: {
    basic_biochemistry: {
      name: "Grunnlífefnafræði",
      description:
        "Grunnblóðefnafræðirannsókn sem mælir nýrnastarfsemi, saltbúskap, lifrarensím, prótín og fitu.",
    },
    diabetology: {
      name: "Sykursýkisfræði",
      description: "Blóðsykursmerki til skimunar og eftirlits með sykursýki.",
    },
    hematology: {
      name: "Blóðmeinafræði",
      description:
        "Heildarblóðtala og hvítfrumnagreining. Metur rauð blóðkorn, hvít blóðkorn og blóðflögur til að greina blóðleysi, sýkingar, storknunarraskanir og blóðkrabbamein.",
    },
    coagulation: {
      name: "Storknun",
      description:
        "Blóðstorknunarpróf sem mæla hversu hratt og vel blóð storknast. Notað til skimunar á blæðingar- eða storknunarröskun og eftirlit með blóðþynningarmeðferð.",
    },
    immunology: {
      name: "Ónæmisfræði og bólgumerki",
      description:
        "Merki um bólgu og virkni ónæmiskerfisins. Notað til að greina sýkingar, sjálfsofnæmissjúkdóma og fylgjast með bólgusjúkdómum.",
    },
    endocrinology: {
      name: "Innkirtlafræði",
      description:
        "Skjaldkirtilsrannsóknir og skjaldkirtilsmótefnarannsókn. Skjaldkirtillinn stjórnar efnaskiptum, orku og mörgum líkamskerfum.",
    },
    urine_dipstick: {
      name: "Þvagstika (MCHS)",
      description:
        "Hraðefnagreining þvags með prófstrimli. Skimunar fyrir nýrnasjúkdómi, þvagfærasýkingum, sykursýki og lifrarsjúkdómi.",
    },
    urine_sediment: {
      name: "Þvagset (smásjárskoðun)",
      description:
        "Smásjárskoðun á þvagsetmyndum. Greinir frumur, steypur, kristalla og bakteríur sem þvagstikapróf nær ekki.",
    },
    immunity: {
      name: "Sértæk ónæmi",
      description:
        "Mótefnastig gegn tilteknum smitsjúkdómum. Notað til að staðfesta bólusetningarstöðu og verndarónæmi.",
    },
    calculated_indices: {
      name: "Reiknuð gildi",
      description:
        "Afleidd gildi og áhættustig reiknuð úr öðrum rannsóknaniðurstöðum. Ekki mæld beint en gefa klíníska innsýn.",
    },
    iron_metabolism: {
      name: "Járnbúskapur",
      description:
        "Járnstig, geymsla og flutningsmerki. Notað til að greina og fylgjast með járnskortsblóðleysi og járnofhleðslu.",
    },
    sleep_study: {
      name: "Svefnrannsókn",
      description:
        "Niðurstöður svefnmælinga. Mælir öndunaratburði, súrefnismettun og hrotur í svefni til að greina kæfisvefn og aðrar svefnraskanir.",
    },
    cardiovascular: {
      name: "Hjarta- og æðakerfi",
      description:
        "Merki um heilsu hjarta og æða, þar á meðal hjartaálagsvísar, kransæðakalkgildi og tengd áhættulífmerki.",
    },
    tumor_markers: {
      name: "Æxlismerki",
      description:
        "Blóðmerki notuð til krabbameinsleitar, eftirlits með meðferðarsvörun og greiningar á endurkomu. Hækkuð gildi geta bent til illkynja sjúkdóms en geta einnig hækkað vegna góðkynja ástanda.",
    },
  },
};

export default is;
