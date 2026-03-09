export type {
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

export interface User {
  id?: number;
  name: string;
  dateOfBirth?: string;
  sex?: "M" | "F";
}

export interface Route {
  view: "dashboard" | "category" | "timeline" | "compare" | "settings" | "privacy" | "terms";
  id?: string;
}
