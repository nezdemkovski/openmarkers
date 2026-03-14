export enum Sex {
  Male = "M",
  Female = "F",
}

export enum BiomarkerType {
  Quantitative = "quantitative",
  Qualitative = "qualitative",
}
export enum UnitSystem {
  SI = "si",
  Conventional = "conventional",
}
export type TrendDirection = "up" | "down" | "stable";

export interface DbProfile {
  id: number;
  auth_user_id: string;
  name: string;
  date_of_birth: string;
  sex: Sex;
  is_public: boolean;
  public_handle: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCategory {
  id: string;
}

export interface DbBiomarker {
  id: string;
  category_id: string;
  unit: string | null;
  ref_min_m: number | null;
  ref_max_m: number | null;
  ref_min_f: number | null;
  ref_max_f: number | null;
  type: BiomarkerType;
  molecular_weight: number | null;
}

export interface DbResult {
  id: number;
  profile_id: number;
  biomarker_id: string;
  date: string;
  value: string;
  ref_min: number | null;
  ref_max: number | null;
  unit: string | null;
  created_at: string;
}

export interface ProfileSummary {
  id: number;
  name: string;
  dateOfBirth: string;
  sex: Sex;
  isPublic: boolean;
  publicHandle: string | null;
}

export interface BiomarkerResult {
  id?: number;
  date: string;
  value: number | string;
  refMin?: number | null;
  refMax?: number | null;
  unit?: string | null;
  outOfRange?: boolean;
}

export interface Biomarker {
  id: string;
  type?: BiomarkerType;
  unit?: string | null;
  refMin?: number | null;
  refMax?: number | null;
  note?: string;
  results: BiomarkerResult[];
  trend?: TrendResult | null;
  latestOutOfRange?: boolean;
}

export interface Category {
  id: string;
  biomarkers: Biomarker[];
}

export interface UserData {
  user: {
    id?: number;
    name: string;
    dateOfBirth: string;
    sex: Sex;
    publicHandle?: string | null;
  };
  categories: Category[];
  daysSince?: DaysSinceResult[];
  correlations?: MatchedCorrelationGroup[];
  biologicalAge?: { results: PhenoAgeResult[]; missingMarkers: string[] };
}

export interface TrendResult {
  direction: TrendDirection;
  rateChange: number;
  overallChange: number | null;
  trendWarning: boolean;
  improving: boolean | null;
}

export interface BiomarkerTrend {
  biomarkerId: string;
  categoryId: string;
  direction: TrendDirection;
  rateChange: number;
  overallChange: number | null;
  trendWarning: boolean;
  improving: boolean | null;
  latestValue: number | string;
  latestDate: string;
}

export interface SnapshotItem {
  categoryId: string;
  biomarkerId: string;
  unit?: string | null;
  refMin?: number | null;
  refMax?: number | null;
  value: number | string;
  outOfRange: boolean;
}

export interface ComparisonRow {
  categoryId: string;
  biomarkerId: string;
  unit?: string | null;
  refMin?: number | null;
  refMax?: number | null;
  v1: number | string | null;
  v2: number | string | null;
  delta: number | null;
  deltaPct: number | null;
  out1: boolean;
  out2: boolean;
}

export interface CorrelationGroup {
  id: string;
  biomarkers: string[];
}

export interface MatchedCorrelationGroup extends CorrelationGroup {
  matched: string[];
}

export interface PhenoAgeScore {
  id: string;
  value: number;
  unit: string;
  score: number;
  date: string;
  refMin?: number;
  refMax?: number;
}

export interface PhenoAgeResult {
  date: string;
  phenoAge: number;
  chronoAge: number;
  delta: number;
  mortalityScore: number;
  dnamAge: number;
  dnamMortality: number;
  xb: number;
  scores: PhenoAgeScore[];
}

export interface DaysSinceResult {
  categoryId: string;
  days: number | null;
  lastDate: string | null;
}

export interface TranslationData {
  ui: Record<string, string>;
  categories: Record<string, Record<string, string>>;
  biomarkers: Record<string, Record<string, string>>;
}

export type Lang = "en" | "cs" | "ru" | "is";
const LANG_VALUES: readonly string[] = ["en", "cs", "ru", "is"];
export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && LANG_VALUES.includes(value);
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Unknown error";
}

export interface I18n {
  t: (key: string) => string;
  tCat: (catId: string, field: string) => string;
  tBio: (bioId: string, field: string) => string;
}
