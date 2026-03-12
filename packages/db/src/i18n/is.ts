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
    timelineDesc: "Allar rannsóknardagsetningar á tímalínu. Smelltu á dagsetningu til að sjá heildaryfirlit.",
    comparison: "Samanburður",
    export: "Flytja út gögn",
    import: "Flytja inn gögn",
    importConflictTitle: "Notandi er þegar til",
    importConflictMessage: 'Notandi að nafni "{name}" er þegar til. Sláðu inn nýtt nafn eða hættu við.',
    importRename: "Flytja inn",
    importCancel: "Hætta við",
    importError: "Innflutningsvilla",
    importInvalidJson: "Ógild JSON skrá.",
    deleteUser: "Eyða notanda",
    deleteUserTitle: "Eyða notanda",
    deleteUserMessage: 'Ertu viss um að þú viljir eyða "{name}"? Öll gögn verða fjarlægð varanlega.',
    deleteUserConfirm: "Eyða",
    comparisonDesc: "Berðu saman niðurstöður milli tveggja rannsóknardaga hlið við hlið.",
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
    getStartedFree: "Vertu hluti af samfélaginu. Deildu merkjunum þínum með heiminum.",
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
    importSettingsDesc: "Flytjið inn rannsóknarniðurstöður úr JSON-skrá. Nýr prófíll verður búinn til með innfluttum gögnum — núverandi prófílar verða ekki fyrir áhrifum.",
    importSelectFile: "Velja JSON-skrá",
    demoDesc: "Skoðið forritið með sýnigögnum.",
    addLabVisit: "Bæta við rannsókn",
    addLabVisitDesc: "Sláðu inn niðurstöður úr blóðrannsókn handvirkt.",
    addLabVisitDate: "Dagsetning rannsóknar",
    addLabVisitSearch: "Leita að lífvísum...",
    addLabVisitSubmit: "Vista niðurstöður",
    addLabVisitSaving: "Vista...",
    addLabVisitNValues: "{n} gildi skráð",
    addLabVisitNoMatch: "Engir lífvísar passa við leit.",
    addLabVisitEmpty: "Sláðu inn að minnsta kosti eitt gildi.",
    addYourData: "Bættu við gögnum",
    addYourDataDesc: "Prófíllinn þinn er tilbúinn. Bættu við fyrstu rannsóknarniðurstöðunum.",
    aiImport: "Búa til innflutningsskrá með AI",
    aiImportDesc: "Ertu með PDF eða rannsóknarskýrslu? Notaðu AI til að búa til skrá til innflutnings.",
    aiImportInstructions:
      "Afritaðu promptið hér að neðan og límdu í ChatGPT, Claude eða annan AI aðstoðarmann ásamt niðurstöðum (texti, mynd eða PDF). Hann býr til JSON-skrá fyrir þig.",
    aiImportThen: "Vistaðu úttakið sem .json skrá og notaðu Flytja inn hér að ofan.",
    schemaTip: "Ábending: Bættu við $schema reit fyrir sjálfvirka útfyllingu og villuleit",
    schemaTipDesc:
      "Bættu þessari línu efst í JSON-skrána til að fá sjálfvirka útfyllingu og villuprófun í VS Code og öðrum ritlum:",
    mcpSetup: "MCP Þjónn",
    mcpSetupDesc: "Tengdu AI aðstoðarmann beint við OpenMarkers.",
    mcpSetupInstructions: "Bættu þessu við MCP stillingar AI biðlarans þíns (Claude Desktop, Cursor o.fl.):",
    mcpSetupAuth: "AI biðlarinn auðkennir sig með OAuth þegar hann tengist fyrst — samþykktu innskráningu í vafranum.",
    mcpSetupToolsTitle: "Helstu tæki í boði:",
    mcpToolImport: "Magninnflutningur skipulagðra rannsóknargagna sem JSON",
    mcpToolSchema: "Sækja öll studd lífvísaauðkenni, einingar og viðmiðunargildi",
    mcpToolAddResult: "Bæta við einstökum rannsóknarniðurstöðum",
    mcpToolGetProfile: "Skoða öll gögn raðað eftir flokkum",
    mcpToolTrends: "Greina þróun, stefnu og viðvaranir fyrir lífvísa",
    mcpToolAnalysis: "Búa til heildar heilsugreiningu úr öllum gögnum",
    mcpToolsMore: "Og fleira — AI aðstoðarmaðurinn finnur öll tiltæk tæki sjálfkrafa.",
    settings: "Stillingar",
    settingsAppearance: "Útlit",
    settingsTheme: "Þema",
    settingsThemeLight: "Ljóst",
    settingsThemeDark: "Dökkt",
    settingsLanguage: "Tungumál",
    settingsProfiles: "Prófílar",
    settingsEditProfile: "Breyta prófíl",
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
    settingsDeleteAccountDesc: "Eyða reikningi og öllum prófílum varanlega. Þetta er óafturkræft.",
    settingsDeleteAccountConfirm: "Sláðu inn DELETE til staðfestingar",
    settingsDateOfBirth: "Fæðingardagur",
    settingsSex: "Kyn",
    settingsMcp: "AI Aðstoðarmaður (MCP)",
    settingsMcpDesc: "Tengdu Claude, ChatGPT eða hvaða AI aðstoðarmann sem er við lífmerki gögnin þín í gegnum MCP.",
    settingsMcpEndpoint: "MCP Endapunktur",
    settingsMcpToken: "Auðkenningartákn þitt",
    settingsMcpCopied: "Afritað!",
    settingsMcpCopy: "Afrita",
    settingsMcpCopyToken: "Afrita tákn",
    settingsMcpCopyConfig: "Afrita stillingar",
    settingsMcpTokenDesc: "Þetta tákn rennur reglulega út. Afritaðu nýtt áður en þú stillir AI biðlarann.",
    settingsMcpConfigDesc: "Bættu þessu við MCP stillingar AI biðlarans þíns:",
    settingsMcpTools: "Verkfæri í boði: listi yfir prófíla, þróun, lífaldur, fylgni, AI greiningar og fleira.",
    settingsCli: "CLI tól",
    settingsCliDesc: "Stjórnaðu prófílum, fluttu inn niðurstöður og keyrðu greiningar úr skipanalínu. Hannað til að virka óaðfinnanlega með AI-þjónum.",
    settingsCliInstall: "Setja upp með Homebrew",
    settingsCliUsage: "Keyrðu síðan:",
    authConsent: "Ég samþykki að geyma blóðrannsóknarniðurstöður og rannsóknargögn",
    authDisclaimer: "Þetta er ekki lækningatæki eða heilbrigðisþjónusta. Ekki læknisráðgjöf.",
    heroSubtitle: "Rannsóknaniðurstöður þínar, sjónrænar. Greindu þróun sem læknirinn gæti misst af.",
    heroBadgeOpenSource: "Opinn hugbúnaður",
    heroBadgeBiomarkers: "100+ lífmerki",
    heroBadgeMcp: "AI gegnum MCP",
    landingFeaturesHeading: "Allt sem þú þarft til að fylgjast með heilsu",
    landingHowItWorks: "Hvernig virkar það",
    landingStep1Title: "Hladdu upp niðurstöðum",
    landingStep1Desc: "Flytjið inn rannsóknargögn sem JSON, sláðu inn handvirkt eða láttu AI umbreyta PDF-skýrslum.",
    landingStep2Title: "Sjónrændu þróun",
    landingStep2Desc: "Sjáðu hvert lífmerki yfir tíma með gagnvirkum gröfum og viðmiðunarsviðum.",
    landingStep3Title: "Fáðu innsýn",
    landingStep3Desc: "Líffræðilegur aldur, þróunargreining, fylgni — eða tengdu hvaða AI sem er gegnum MCP.",
    heroDemoButton: "Skoða með sýnigögnum",
    heroMcpDesc: "Tengdu hvaða AI aðstoðarmann sem er við lífmerkjagögnin þín gegnum MCP",
    heroCliDesc: "Stjórnaðu gögnunum úr skipanalínu — virkar vel með {openClawLink} og svipuðum persónulegum þjónum",
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
    shareProfileDesc: "Gerðu þennan prófíl opinberan á sérsniðnu vefslóð. Allir með hlekkinn geta skoðað gögnin.",
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
      description: "Grunnblóðefnafræðirannsókn sem mælir nýrnastarfsemi, saltbúskap, lifrarensím, prótín og fitu.",
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
  biomarkers: {
    "S-UREA": {
      name: "Þvagefni",
      description:
        "Úrgangsefni frá prótínefnaskiptum, síað af nýrum. Hækkuð gildi geta bent til skertrar nýrnastarfsemi eða mikillar prótíninntöku.",
    },
    "S-CREA": {
      name: "Kreatínín",
      description:
        "Aukaafurð vöðvaefnaskipta síuð af nýrum. Há gildi benda til skertrar nýrnasíunar. Náttúrulega hærra hjá vöðvamiklum einstaklingum.",
    },
    "S-KM": {
      name: "Þvagsýra",
      description:
        "Lokafurð púrínefnaskipta. Hækkuð gildi auka hættu á þvagsýrugigt og nýrnasteinum. Getur orðið fyrir áhrifum af mataræði (rautt kjöt, áfengi, frúktósi).",
    },
    "S-CKDEPI": {
      name: "eGFR (CKD-EPI)",
      description:
        "Áætluð nýrnahreinsihlutfall reiknað úr kreatíníni með CKD-EPI formúlu. Mælir hversu vel nýrun sía blóðið. Gildi >1,5 ml/s eru eðlileg; <1,0 getur bent til verulegrar nýrnaskerðingar.",
    },
    "S-Na": {
      name: "Natríum",
      description:
        "Aðalsaltsteind sem stjórnar vökvajafnvægi og tauga-/vöðvastarfsemi. Bæði lág og há gildi geta verið klínískt mikilvæg.",
    },
    "S-K": {
      name: "Kalíum",
      description:
        "Nauðsynleg saltsteind fyrir hjartsláttartakt, vöðvasamdrátt og taugaboð. Bæði lág og há gildi geta valdið hættulegum hjartsláttatruflunum.",
    },
    "S-Cl": {
      name: "Klóríð",
      description:
        "Saltsteind sem hjálpar til við að viðhalda vökvajafnvægi og sýru-basajafnvægi. Fylgist venjulega með natríumi.",
    },
    "S-Mg": {
      name: "Magnesíum",
      description:
        "Steinefni mikilvægt fyrir vöðva- og taugastarfsemi, blóðsykurstjórnun og beinheilsu. Skortur er algengur og getur valdið þreytu, krömpum og hjartsláttatruflunum.",
    },
    "S-BIL": {
      name: "Heildarbílirúbín",
      description:
        "Litarefni frá niðurbroti rauðra blóðkorna unnið af lifrinni. Hækkuð gildi valda gulu. Vægt hækkuð gildi geta bent til Gilbert heilkennis (góðkynja).",
    },
    "S-ALT": {
      name: "ALT (Alanín amínótransferasi)",
      description:
        "Lifrarensím. Hækkuð gildi benda til lifrarskaða. Sértækasta merki um lifrarskaða. Getur hækkað vegna áfengis, lyfja, fitulifrar eða veirulifrarbólgu.",
    },
    "S-AST": {
      name: "AST (Aspartat amínótransferasi)",
      description:
        "Ensím sem finnst í lifur, hjarta og vöðvum. Hækkar við lifrarskaða, hjartaáfall eða mikla hreyfingu. Minna sértækt fyrir lifur en ALT.",
    },
    "S-GGT": {
      name: "GGT (Gamma-glútamýl transferasi)",
      description:
        "Lifrar- og gallvegsensím. Viðkvæmt merki um gallvegsstíflu og áfengisneyslu. Oft fyrsta lifrarensímið sem hækkar við áfengistengdan lifrarskaða.",
    },
    "S-ALP": {
      name: "ALP (Alkalískt fosfatasi)",
      description:
        "Ensím sem finnst í lifur, beinum og gallvegum. Hækkað við beinvöxt, gallvegsstíflu eða lifrarsjúkdóm. Venjulega hærra hjá vaxandi unglingum.",
    },
    "S-PAMS": {
      name: "Briskirtilsamýlasi",
      description:
        "Ensím framleitt af briskirtlinum til að brjóta niður sterkju. Hækkuð gildi geta bent til briskirtilsbólgu eða briskirtilssjúkdóms.",
    },
    "S-CB": {
      name: "Heildarprótín",
      description:
        "Heildarmagn albúmíns og glóbúlínpróteina í blóði. Endurspeglar næringarástand, efnasmíðastarfsemi lifrar og virkni ónæmiskerfis.",
    },
    "S-ALB": {
      name: "Albúmín",
      description:
        "Algengasta blóðprótínið, framleitt af lifrinni. Viðheldur vökvajafnvægi og flytur hormón/lyf. Lág gildi benda til lifrarsjúkdóms, vannæringar eða nýrnataps.",
    },
    "S-CHOL": {
      name: "Heildarkólesteról",
      description:
        "Heildarmagn kólesteróls í blóði þar á meðal LDL, HDL og VLDL. Hækkuð gildi auka hættu á hjarta- og æðasjúkdómum.",
    },
    "S-HDL": {
      name: "HDL kólesteról",
      description:
        '"Góða" kólesterólið sem fjarlægir umframkólesteról úr slagæðum. Hærri gildi eru verndandi gegn hjarta- og æðasjúkdómum.',
    },
    "S-LDL": {
      name: "LDL kólesteról",
      description:
        '"Slæma" kólesterólið sem safnast upp í slagæðaveggjum og veldur æðakölkun. Lægra er betra, sérstaklega með öðrum áhættuþáttum.',
    },
    "S-TGL": {
      name: "Þríglýseríð",
      description:
        "Fitusameindi í blóði, aðallega frá fæðu. Hækkuð af mikilli kolvetna-/áfengisneyslu. Mjög há gildi (>10 mmól/l) hafa hættu á briskirtilsbólgu.",
    },
    "S-nHDL": {
      name: "Ekki-HDL kólesteról",
      description:
        "Heildarkólesteról mínus HDL. Nær yfir allar æðaskaðandi fitupróteinsagnir (LDL + VLDL). Betri spáþáttur hjarta- og æðaáhættu en LDL eitt og sér.",
    },
    "S-VITD": {
      name: "D-vítamín (25-OH)",
      description:
        "Mælir D-vítamínbirgðir. Nauðsynlegt fyrir beinheilsu, ónæmisstarfsemi og skap. Skortur er mjög algengur, sérstaklega á norðlægum breiddargráðum og á vetri.",
    },
    "P-P-GLU": {
      name: "Fastandi blóðsykur",
      description:
        "Blóðsykur mældur eftir föstu. Frumskimunarpróf fyrir sykursýki. Gildi 5,6-6,9 benda til forsykursýki; >=7,0 bendir til sykursýki.",
    },
    "B-WBC": {
      name: "Hvít blóðkorn",
      description:
        "Heildarfjöldi ónæmisfrumna. Hækkað við sýkingu, bólgu eða streitu. Lág gildi (hvítfrumnafæð) auka sýkingarhættu.",
    },
    "B-RBC": {
      name: "Rauð blóðkorn",
      description:
        "Súrefnisflutningsfrumur. Lágur fjöldi bendir til blóðleysis. Hár fjöldi getur bent til þurrðar eða fjölrauðkornasjúkdóms.",
    },
    "B-HB": {
      name: "Blóðrauði",
      description:
        "Súrefnisflutningsprótín í rauðum blóðkornum. Lág gildi benda til blóðleysis. Lykilmerki um súrefnisflutningsgetu blóðsins.",
    },
    "B-HCT": {
      name: "Blóðkornaskil",
      description:
        "Hlutfall blóðrúmmáls sem rauð blóðkorn skipa. Hækkað við þurrð; lágt við blóðleysi eða vökvaoflestun.",
    },
    "B-MCV": {
      name: "Meðalrúmmál rauðra blóðkorna",
      description:
        "Meðalstærð rauðra blóðkorna. Lágt MCV bendir til járnskorts; hátt MCV bendir til B12/fólsýruskorts eða áfengisnotkunar.",
    },
    "B-MCH": {
      name: "Meðalblóðrauði í korni",
      description:
        "Meðalmagn blóðrauða í hverju rauðu blóðkorni. Fylgir MCV - lágt við járnskort, hátt við B12/fólsýruskort.",
    },
    "B-MCHC": {
      name: "Meðalþéttni blóðrauða í korni",
      description: "Meðalþéttni blóðrauða í rauðum blóðkornum. Hjálpar til við að flokka tegundir blóðleysis.",
    },
    "B-PLT": {
      name: "Blóðflögur",
      description:
        "Frumubrot nauðsynleg fyrir blóðstorknun. Lágur fjöldi (blóðflögufæð) hefur blæðingarhættu; hár fjöldi (blóðflöguaukninng) getur bent til bólgu eða blóðsjúkdóms.",
    },
    "B-RDW": {
      name: "Stærðardreifing rauðra blóðkorna",
      description:
        "Mælir breytileika í stærð rauðra blóðkorna. Hækkuð gildi benda til blandaðra orsaka blóðleysis (t.d. samsettur járn- og B12-skortur).",
    },
    "B-neu": {
      name: "Daufkyrningar (%)",
      description: "Hlutfall hvítra blóðkorna sem eru daufkyrningar - fyrstu viðbragðsaðilar við bakteríusýkingum.",
    },
    "B-lymf": {
      name: "Eitilfrumur (%)",
      description: "Hlutfall hvítra blóðkorna sem eru eitilfrumur - lykill að aðlögunarónæmi (T-frumur, B-frumur).",
    },
    "B-mono": {
      name: "Einkyrningar (%)",
      description: "Hlutfall hvítra blóðkorna sem eru einkyrningar - taka þátt í langvinnri bólgu og ónæmisvörnum.",
    },
    "B-eo": {
      name: "Súrkyrningar (%)",
      description:
        "Hlutfall hvítra blóðkorna sem eru súrkyrningar - taka þátt í ofnæmisviðbrögðum og sníkjudýrasýkingum.",
    },
    "B-baso": {
      name: "Baskyrningar (%)",
      description: "Sjaldgæfasta tegund hvítra blóðkorna. Taka þátt í ofnæmis- og bólguviðbrögðum.",
    },
    "B-NEabs": {
      name: "Daufkyrningar (heildarfjöldi)",
      description: "Heildarfjöldi daufkyrninga. Gildi undir 2,0 eru vægt lág; undir 1,0 eykur sýkingarhættu verulega.",
    },
    "B-LYabs": {
      name: "Eitilfrumur (heildarfjöldi)",
      description:
        "Heildarfjöldi eitilfrumna. Lág gildi benda til ónæmisskorts. Hækkuð við veirusýkingar og sum blóðkrabbamein.",
    },
    "B-MOabs": {
      name: "Einkyrningar (heildarfjöldi)",
      description:
        "Heildarfjöldi einkyrni. Hækkað við langvinnar sýkingar, sjálfsofnæmissjúkdóma og sumar blóðraskanir.",
    },
    "B-EOabs": {
      name: "Súrkyrningar (heildarfjöldi)",
      description: "Heildarfjöldi súrkyrninga. Hækkað við ofnæmissjúkdóma, sníkjudýrasýkingar og súrkyrníngaraskanir.",
    },
    "B-BAabs": {
      name: "Baskyrningar (heildarfjöldi)",
      description:
        "Heildarfjöldi baskyrninga. Sjaldnast óeðlilegt eitt og sér. Mjög há gildi geta bent til mergfjölgunarsjúkdóms.",
    },
    "C-Quick": {
      name: "Prótrombíntími (Quick hlutfall)",
      description:
        "Mælir ytri storknunarleiðina. Gildi innan 0,8-1,2 eru eðlileg. Lengt við lifrarsjúkdóm, K-vítamínskort eða warfarínnotkun.",
    },
    "C-INR": {
      name: "INR",
      description:
        "Alþjóðlegt staðlað hlutfall - staðlað prótrombíntímapróf notað til eftirlits með warfarínmeðferð. Eðlilegt er ~1,0; meðferðarsvið á warfaríni er venjulega 2,0-3,0.",
    },
    "C-QT": {
      name: "Prótrombíntími (sekúndur)",
      description: "Tími í sekúndum þar til blóð storknast um ytri storknunarleiðina.",
    },
    "C-APTTr": {
      name: "APTT hlutfall",
      description:
        "Virkjað hlutaþrombóplastíntímahlutfall - mælir innri storknunarleiðina. Lengt við dreyrasýki, heparínnotkun eða rauðaúlfsmótefni.",
    },
    "C-APTT": {
      name: "APTT (sekúndur)",
      description:
        "Virkjað hlutaþrombóplastíntími - hráur storknunartími innri storknunarleiðar. Eðlilegt svið er venjulega 25-35 sekúndur.",
    },
    "S-CRP": {
      name: "C-viðbragðsprótín",
      description:
        "Bráðaviðbragðsprótín framleitt af lifrinni sem svar við bólgu. Hækkar hratt við sýkingu, áverka eða bólgusjúkdóm. Ósértækt en mjög viðkvæmt merki.",
    },
    "B-ESR": {
      name: "Sökkhraði rauðra blóðkorna",
      description:
        "Ósértækt bólgumerki. Mælir hversu hratt rauð blóðkorn sökkva í glasi. Hækkað við sýkingu, sjálfsofnæmissjúkdóm og krabbamein.",
    },
    "S-TSH": {
      name: "TSH (Skjaldkirtilsörvandi hormón)",
      description:
        "Heiladingulshormón sem örvar skjaldkirtilinn. Frumskilmunarpróf fyrir skjaldkirtilsraskanir. Hátt TSH = vanvirkur skjaldkirtill; lágt TSH = ofvirkur.",
    },
    "S-fT4": {
      name: "Frjálst T4 (Týroxín)",
      description:
        "Virkt skjaldkirtilshormón tiltækt vefjum. Lágt fT4 með háu TSH staðfestir vanstarfsemi skjaldkirtils.",
    },
    "S-aTSH": {
      name: "Anti-TSH viðtakamótefni (TRAb)",
      description: "Mótefni gegn TSH viðtaka. Hækkuð í Basedow-sjúkdómi (sjálfsofnæmisofvirkni skjaldkirtils).",
    },
    "S-aTG": {
      name: "Anti-týróglóbúlínmótefni",
      description:
        "Mótefni gegn týróglóbúlínpróteini. Hækkuð í Hashimoto-skjaldkirtilsbólgu og öðrum sjálfsofnæmissjúkdómum skjaldkirtils.",
    },
    "S-aTPO": {
      name: "Anti-TPO mótefni",
      description:
        "Mótefni gegn skjaldkirtilsperoxídasa ensími. Viðkvæmasta merkið um sjálfsofnæmissjúkdóm í skjaldkirtli (Hashimoto).",
    },
    "U-GLU": {
      name: "Þvagsykur",
      description:
        "Sykur í þvagi. Venjulega fjarverandi - nærvera bendir til þess að blóðsykur fari yfir enduruppsogunarmörk nýrna.",
    },
    "U-PROT": {
      name: "Þvagprótín",
      description:
        "Prótín í þvagi. Venjulega fjarverandi eða í snefilmagni. Viðvarandi prótínþvag bendir til nýrnaskemmda.",
    },
    "U-BILI": {
      name: "Þvagbílirúbín",
      description: "Bílirúbín í þvagi. Venjulega fjarverandi - nærvera bendir til lifrar- eða gallvegssjúkdóms.",
    },
    "U-UBG": {
      name: "Úróbílínógen",
      description: "Niðurbrotsefni bílirúbíns. Lítið magn er eðlilegt. Hækkað í blóðleysigulu eða lifrarsjúkdómi.",
    },
    "U-PH": {
      name: "Þvag-pH",
      description: "Sýrustig þvags. Eðlilegt svið 4,5-8,0. Hefur áhrif af mataræði, lyfjum og efnaskiptasjúkdómum.",
    },
    "U-KREV": {
      name: "Blóð í þvagi",
      description:
        "Blóð í þvagi (blóðþvag). Venjulega fjarverandi. Nærvera getur bent til nýrnasteina, þvagfærasýkingar eða nýrnasjúkdóms.",
    },
    "U-LEUC": {
      name: "Hvít blóðkorn í þvagi",
      description: "Hvít blóðkorn í þvagi. Venjulega fjarverandi. Nærvera bendir til þvagfærasýkingar eða nýrnabólgu.",
    },
    "U-KETO": {
      name: "Ketónefni í þvagi",
      description:
        "Ketónefni í þvagi. Venjulega fjarverandi. Finnast við föstu, lágkolvetnamataræði eða óstýrðri sykursýki.",
    },
    "U-NIT": {
      name: "Nítrít í þvagi",
      description:
        "Bakteríuefnaskiptaafurð í þvagi. Venjulega fjarverandi. Jákvætt niðurstaða bendir sterklega til þvagfærasýkingar.",
    },
    "U-HUST": {
      name: "Eðlisþyngd þvags",
      description: "Mælir þéttni þvags. Endurspeglar vökvastöðu og styrkingareiginleika nýrna.",
    },
    "U-EPPL": {
      name: "Þekjufrumur",
      description:
        "Frumur sem þekja þvagvegi. Lítill fjöldi er eðlilegur. Mikill fjöldi getur bent til mengunar eða þvagvegsbólgu.",
    },
    "U-ERY": {
      name: "Rauð blóðkorn í þvagi (smásjá)",
      description: "Rauð blóðkorn séð undir smásjá. Nákvæmara en þvagstikupróf. Hækkað fjöldi krefst rannsóknar.",
    },
    "U-LEUKU": {
      name: "Hvít blóðkorn í þvagi (smásjá)",
      description: "Hvít blóðkorn séð undir smásjá. Hækkað fjöldi bendir til þvagfærasýkingar eða nýrnabólgu.",
    },
    "U-UBAKT": {
      name: "Bakteríur í þvagi",
      description:
        "Bakteríur séðar undir smásjá. Lítill fjöldi getur verið mengun. Veruleg bakteríuþvag með einkennum bendir til þvagfærasýkingar.",
    },
    "S-MorbilliG": {
      name: "Mislingamótefni IgG",
      description: "IgG mótefni gegn mislingaveiru. Sýnir ónæmi vegna bólusetningu eða fyrri sýkingar.",
    },
    "S-Tetanus": {
      name: "Stífkrampamótefni",
      description: "IgG mótefni gegn stífkrampatoxíni. Mælir ónæmi vegna bólusetningar.",
    },
    "MDRD-UreaAlb": {
      name: "eGFR (MDRD með þvagefni og albúmíni)",
      description: "Önnur aðferð til mats á nýrnastarfsemi með MDRD formúlu ásamt þvagefni og albúmíni.",
    },
    "S-FIB4": {
      name: "FIB-4 vísitala",
      description: "Ónæðingslegt trefjagildi reiknað úr aldri, AST, ALT og blóðflögum. Áætlar hættu á lifrartrefjun.",
    },
    "S-AMS": {
      name: "Amýlasi í sermi",
      description:
        "Ensím sem brýtur niður sterkju, framleitt af briskirtli og munnvatnskirtlum. Hækkað við briskirtilsbólgu.",
    },
    "S-Fe": {
      name: "Járn í sermi",
      description:
        "Járn í blóðrásinni bundið transferríni. Lág gildi benda til járnskorts; mjög há gildi geta bent til járnofhleðslu.",
    },
    "S-Feritin": {
      name: "Ferritín",
      description:
        "Aðaljárngeymsluprótín. Viðkvæmasta merkið um járnskort. Einnig bráðaviðbragðsefni (hækkar við bólgu).",
    },
    "S-Transferin": {
      name: "Transferrín",
      description: "Járnflutningsprótín í blóði. Hækkað þegar líkaminn þarfnast meiri járns (járnskortur).",
    },
    "S-TransSat": {
      name: "Transferrínmettun",
      description:
        "Hlutfall transferrínbindistöðva sem járn hefur uppfyllt. Lág mettun (<20%) bendir sterklega til járnskorts.",
    },
    "S-TransRec": {
      name: "Leysanlegir transferrínviðtakar",
      description:
        "Viðtakabrot sem losna í blóð þegar frumur þurfa meiri járn. Hækkuð við járnskortsblóðleysi. Ekki háð bólgu eins og ferritín.",
    },
    "S-UIBC": {
      name: "UIBC (Ómettaður járnbindingargeta)",
      description: "Tiltæk járnbindingargeta transferríns. Hækkuð við járnskort.",
    },
    "S-TIBC": {
      name: "TIBC (Heilderjárnbindingargeta)",
      description:
        "Heildargeta transferríns til að binda járn (UIBC + sermijárn). Hækkuð við járnskort; lág við járnofhleðslu.",
    },
    "S-IgA": {
      name: "IgA (Ónæmisglóbúlín A)",
      description:
        "Mótefni sem verndar slímhúðaryfirborð. Mælt til að útiloka IgA skort áður en cölíakíupróf eru gerð.",
    },
    "S-Anti-tTg-IgA": {
      name: "Anti-tTG IgA (Vefjatransglútamínasi)",
      description: "Aðalskimunarmótefni fyrir cölíakíu. Hækkuð gildi benda til ónæmisviðbragða gegn glúten.",
    },
    "B-MPV": {
      name: "Meðalrúmmál blóðflagna",
      description: "Meðalstærð blóðflagna. Stærri blóðflögur eru yngri og virkari.",
    },
    "SL-AHI": {
      name: "Öndunarhlévísitala (AHI)",
      description: "Fjöldi öndunarhléa og öndunardýpta á klukkustund í svefni. Aðalmælikvarði á alvarleika kæfisvefns.",
    },
    "SL-OA": {
      name: "Teppu-öndunarhléáföll",
      description: "Teppu-öndunarhléáföll á klukkustund - algjör lokun loftvega í >=10 sekúndur í svefni.",
    },
    "SL-HY": {
      name: "Öndunardýpt",
      description: "Hluta-teppuatburðir á klukkustund - minnkað loftflæði (>=30%) með súrefnisfalli eða vaknun.",
    },
    "SL-MA": {
      name: "Blönduð öndunarhléáföll",
      description:
        "Atburðir á klukkustund sem byrja sem miðtaugar öndunarhléáfall og breytast í teppu-öndunarhléáfall.",
    },
    "SL-CA": {
      name: "Miðtaugar öndunarhléáföll",
      description: "Atburðir á klukkustund þar sem heilinn hættir tímabundið að senda öndunarmerkingar.",
    },
    "SL-ODI": {
      name: "Súrefnisfallsvísitala (ODI)",
      description: "Fjöldi >=3% súrefnisfallsatburða á klukkustund. Tengist vel AHI.",
    },
    "SL-SpO2min": {
      name: "Lágmarks SpO2",
      description: "Lægsta súrefnismettun skráð á nóttunni. Gildi undir 90% eru klínískt mikilvæg.",
    },
    "SL-SpO2avg": {
      name: "Meðal SpO2",
      description: "Meðalsúrefnismettun yfir allan svefntímann. Eðlilegt >=94%.",
    },
    "SL-T90": {
      name: "Tími undir 90% SpO2",
      description: "Hlutfall heildarstefntíma með súrefnismettun undir 90%. Eðlilegt <1%.",
    },
    "SL-SFI": {
      name: "Hroturstíðnivísitala (SFI)",
      description: "Hlutfall svefntíma sem varið er í hrotum.",
    },
    "B-HbA1c": {
      name: "HbA1c (Sykrað blóðrauði)",
      description:
        "Mælir meðalblóðsykur síðustu 2-3 mánuðina. Gullstaðall fyrir langtímasykurstjórnun. <5,7% eðlilegt, 5,7-6,4% forsykursýki, >=6,5% sykursýki.",
    },
    "S-INS": {
      name: "Fastandi insúlín",
      description: "Insúlín losað af briskirtlinum til að stjórna blóðsykri. Fastandi gildi sýna insúlínviðnám.",
    },
    "S-DHEA": {
      name: "DHEA-S",
      description:
        "Nýrnahettuhormón sem styður streituþol, viðgerðarferla, ónæmisstarfsemi og lífsorku. Minnkar með aldri.",
    },
    "S-TESTO": {
      name: "Testósterón (heild)",
      description:
        "Aðalkynhormón karla, mikilvægt fyrir bæði kyn. Styður vöðvastyrk, beindíðni, skap, kynhvöt og hjarta- og æðaheilsu.",
    },
    "S-fTESTO": {
      name: "Frjálst testósterón",
      description:
        "Lífvirkt form testósteróns sem er ekki bundið próteinum. Klínískt mikilvægara en heildartestósterón.",
    },
    "S-hsCRP": {
      name: "hs-CRP (Háviðkvæmt C-viðbragðsprótín)",
      description:
        "Ofurviðkvæm mæling á kerfisbólgu. Gullstaðall bólgumerki - hækkuð gildi tengjast hjarta- og æðaáhættu, vitsmunalegu hnignun og langvinnum sjúkdómum.",
    },
    "S-TNF": {
      name: "TNF-alfa (Æxlisdrepandi þáttur)",
      description: "Lykil bólgubotni sem tekur þátt í kerfisbólgu og ónæmisstjórnun.",
    },
    "S-S100B": {
      name: "S-100B prótín",
      description:
        "Taugabólgumerki. Hækkuð gildi benda til truflunar á blóð-heilaþröskuldi, heilaskaða eða taugabólgu.",
    },
    "S-ApoA1": {
      name: "Apólípóprótín A1 (Apo-A1)",
      description: "Aðalprótínhluti HDL agna. Nákvæmari mælikvarði á HDL agnir og þar með hjarta- og æðavernd.",
    },
    "S-LDLP": {
      name: "LDL agnafjöldi (LDL-P)",
      description: "Telur raunverulegan fjölda LDL agna. Nákvæmari mælikvarði á LDL-drifna hjarta- og æðaáhættu.",
    },
    "S-oxLDL": {
      name: "Oxaðað LDL (oxLDL)",
      description: "LDL kólesteról sem hefur skemmst vegna oxunar. Mælir beint oxunarstreitu og bólgu.",
    },
    "S-Lpa": {
      name: "Lípóprótín(a) [Lp(a)]",
      description:
        "Erfðaákvarðað lípóprótín sem ýtir undir æðakölkun og segamyndun. Hækkuð gildi tengjast aukinni hættu á hjartasjúkdómi.",
    },
    "S-CysC": {
      name: "Cýstatín C",
      description:
        "Viðkvæmara lífmerki nýrnastarfsemi og hjarta- og æðaáhættu en kreatínín. Ekki háð vöðvamassa, mataræði eða aldri.",
    },
    "S-O3I": {
      name: "Ómega-3 vísitala",
      description:
        "Mælir EPA og DHA sem hlutfall af rauðkornshimnum. Hærri gildi (>8%) tengjast minni hjarta- og æðaáhættu.",
    },
    "S-GSH": {
      name: "Glútatíón",
      description:
        "Aðalandoxunarvörn líkamans. Nauðsynlegt fyrir eitrunarvarnir, minnkun oxunarstreitu og stuðning ónæmiskerfis.",
    },
    "S-BNP": {
      name: "BNP (B-gerðar natríumþvagdrifspeptíð)",
      description:
        "Hormón losað af hjartanu sem svar við togun hjartavöðva. Mælir hjartaálag. Hækkuð gildi benda til hjartabilunar.",
    },
    "S-CAC": {
      name: "CAC stig (Kransæðakalk)",
      description: "Sneiðmyndamæling á kalksöfnun í kransæðum. Stig 0 er fullkomið. Hærri stig mæla æðakölkunarbyrði.",
    },
    "S-TelL": {
      name: "Litningaendahettulengd",
      description: "Mælir verndarhetturnar á litningum sem styttast með aldri. Endurspeglar frumuöldrun.",
    },
    "S-HCY": {
      name: "Hómócysteín",
      description:
        "Amínósýra tengd hjarta- og æðasjúkdómi, heilablóðfalli og vitsmunalegu hnignun þegar hækkað. Auðvelt að meðhöndla með B-vítamínum.",
    },
    "S-LDH": {
      name: "LDH (Laktógenasi)",
      description:
        "Ensím sem losnar þegar frumur skemmast. Hækkað í mörgum sjúkdómum þar á meðal hjartaáfalli, lifrarsjúkdómi og krabbameini.",
    },
    "S-DBIL": {
      name: "Beint bílirúbín (samtengt)",
      description: "Bílirúbín unnið af lifur. Sértækt hækkað við gallvegsstíflu eða lifrarsjúkdóm.",
    },
    "S-ApoB": {
      name: "Apólípóprótín B (ApoB)",
      description:
        "Eitt ApoB sameind á hverja æðaskaðandi lípóprótínagn. Talinn besti einstaki mælikvarðinn á æðaskaðandi áhættu.",
    },
    "S-VLDL": {
      name: "VLDL kólesteról",
      description:
        "Mjög léttar lípóprotínagnir sem bera aðallega þríglýseríð. Hækkuð við mikla kolvetna-/áfengisneyslu.",
    },
    "S-Ca": {
      name: "Kalsíum",
      description: "Nauðsynlegt steinefni fyrir bein, vöðvasamdrátt, taugaboð og blóðstorknun.",
    },
    "S-P": {
      name: "Fosfór (Fosfat)",
      description:
        "Steinefni nauðsynlegt fyrir beinheilsu, orkuframleiðslu og sýru-basajafnvægi. Virkar í samstarfi við kalsíum.",
    },
    "S-B12": {
      name: "B12 vítamín (Kóbalamín)",
      description:
        "Nauðsynlegt vítamín fyrir taugastarfsemi, myndun rauðra blóðkorna og DNA-efnasmíðar. Skortur veldur stórfrumulegu blóðleysi og taugaskaða.",
    },
    "S-FOL": {
      name: "Fólsýra",
      description: "B-vítamín nauðsynlegt fyrir DNA-efnasmíðar og myndun rauðra blóðkorna. Mikilvægt á meðgöngu.",
    },
    "S-fT3": {
      name: "Frjálst T3 (Þríjoðþýrónín)",
      description: "Virkasta skjaldkirtilshormónið - T4 er breytt í T3 í vefjum.",
    },
    "S-E2": {
      name: "Estradíól (E2)",
      description:
        "Aðalestrógen hormón. Mikilvægt hjá báðum kynjum - stýrir beindíðni, hjarta- og æðaheilsu, skapi og kynhvöt.",
    },
    "S-CORT": {
      name: "Kórtísól",
      description: "Aðalstreituhormón nýrnahettna. Fylgir dagssveiflumynstri (hátt á morgni, lágt á kvöldi).",
    },
    "S-IGF1": {
      name: "IGF-1 (Insúlínlíkur vaxtarþáttur 1)",
      description:
        "Vaxtarþáttur sem miðlar áhrifum vaxtarhormóns. Tekur þátt í vöðvavexti, beindíðni og vefjaviðgerðum.",
    },
    "S-SHBG": {
      name: "SHBG (Kynhormónbindandi glóbúlín)",
      description:
        "Prótín sem bindur og flytur kynhormón (testósterón, estradíól). Hátt SHBG dregur úr frjálsum/lífvirkum hormónum.",
    },
    "S-PRL": {
      name: "Prólaktín",
      description:
        "Heiladingulshormón aðallega tengt mjólkurframleiðslu. Hækkað hjá báðum kynjum vegna heiladinglisæxla, lyfja, streitu eða vanstarfsemi skjaldkirtils.",
    },
    "S-LH": {
      name: "LH (Gulbúshormón)",
      description: "Heiladingulshormón sem örvar testósterónframleiðslu hjá körlum og egglos hjá konum.",
    },
    "S-FSH": {
      name: "FSH (Eggbúsörvandi hormón)",
      description: "Heiladingulshormón sem stýrir æxlunarvirkni. Hjá körlum örvar sæðismyndun.",
    },
    "B-RET": {
      name: "Frumstæð rauð blóðkorn",
      description: "Ung rauð blóðkorn nýkomin úr beinmerg. Hækkuð gildi benda til virkrar rauðkornamyndunar.",
    },
    "S-IgG": {
      name: "IgG (Ónæmisglóbúlín G)",
      description:
        "Algengasta mótefnið í blóði sem veitir langtímaónæmi. Hækkað við langvinnar sýkingar og sjálfsofnæmissjúkdóma.",
    },
    "S-IgM": {
      name: "IgM (Ónæmisglóbúlín M)",
      description:
        "Fyrsta mótefnið sem myndast við nýjum sýkingum. Hækkað IgM bendir til bráðrar eða nýlegrar sýkingar.",
    },
    "S-IgE": {
      name: "IgE (Ónæmisglóbúlín E)",
      description: "Mótefni tengt ofnæmisviðbrögðum og sníkjudýravörnum. Hækkað við ofnæmi, astma og exemi.",
    },
    "S-HOMA": {
      name: "HOMA-IR (Insúlínviðnámsvísitala)",
      description:
        "Reiknuð úr fastandi glúkósa og insúlíni. Áætlar insúlínviðnám. Gildi <1,0 eru ákjósanleg; >2,5 bendir til verulegs insúlínviðnáms.",
    },
    "S-PSA": {
      name: "PSA (Blöðruhálskirtilssértækt mótefnavaki)",
      description:
        "Prótín framleitt af blöðruhálskirtli. Aðalskimunarmersik fyrir blöðruhálskirtilskrabbamein hjá körlum.",
    },
    "S-FAI": {
      name: "Frjáls andrógensvísitala",
      description: "Reiknað hlutfall heildartestósteróns og SHBG sem áætlar lífvirkt testósterón.",
    },
    "S-PTH": {
      name: "PTH (Kalkkirtilshormón)",
      description: "Hormón sem stýrir kalsíum- og fosfórjafnvægi. Hækkað við D-vítamínskort eða kalkkirtilsofvirkni.",
    },
    "S-Cai": {
      name: "Jónað kalsíum",
      description: "Lífvirkt form kalsíums í blóði, ekki bundið próteinum. Nákvæmara en heildarkalsíum.",
    },
    "S-Cpep": {
      name: "C-peptíð",
      description: "Aukaafurð insúlínframleiðslu. Mælir innræna insúlínframleiðslu óháð ytri insúlíni.",
    },
    "S-PROG": {
      name: "Prógesterón",
      description: "Sterahormón sem tekur aðallega þátt í tíðahring og þungun.",
    },
    "S-LIST": {
      name: "Frjáls testósterónvísitala (LIST)",
      description: "Reiknuð vísitala frjáls testósteróns. Hærra gildi bendir til meira lífvirks testósteróns.",
    },
  },
};

export default is;
