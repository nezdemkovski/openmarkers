import { init, track as plausibleTrack } from "@plausible-analytics/tracker";

const isProd = import.meta.env.PROD;

if (isProd) {
  init({
    domain: "openmarkers.app",
    autoCapturePageviews: true,
  });
}

export const Event = {
  SignedUp: "Signed Up",
  SignedIn: "Signed In",
  SignedOut: "Signed Out",
  AccountDeleted: "Account Deleted",
  ProfileCreated: "Profile Created",
  ProfileDeleted: "Profile Deleted",
  ProfileMadePublic: "Profile Made Public",
  DataImported: "Data Imported",
  DataExported: "Data Exported",
  LabVisitAdded: "Lab Visit Added",
  DemoStarted: "Demo Started",
  AiPromptCopied: "AI Prompt Copied",
  ThemeToggled: "Theme Toggled",
  LanguageChanged: "Language Changed",
} as const;

type Props = Record<string, string | number | boolean>;

export function track(event: (typeof Event)[keyof typeof Event], props?: Props) {
  if (!isProd) return;
  plausibleTrack(event, { props });
}
