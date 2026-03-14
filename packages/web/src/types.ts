export type {
  Sex,
  BiomarkerType,
  UnitSystem,
  TrendDirection,
  BiomarkerResult,
  Biomarker,
  Category,
  UserData,
  ProfileSummary,
  TrendResult,
  BiomarkerTrend,
  SnapshotItem,
  ComparisonRow,
  CorrelationGroup,
  MatchedCorrelationGroup,
  PhenoAgeScore,
  PhenoAgeResult,
  DaysSinceResult,
  TranslationData,
  Lang,
  I18n,
} from "@openmarkers/db/src/types";

import type { Sex } from "@openmarkers/db/src/types";

export interface User {
  id?: number;
  name: string;
  dateOfBirth?: string;
  sex?: Sex;
}

export interface Route {
  view:
    | "home"
    | "dashboard"
    | "category"
    | "timeline"
    | "compare"
    | "settings"
    | "privacy"
    | "terms"
    | "new-profile"
    | "public-profile"
    | "profiles";
  id?: string;
  isDemo?: boolean;
}
