import type { Sex } from "../../types";

export interface ProfileSummary {
  id: number;
  name: string;
  dateOfBirth: string;
  sex: Sex;
}

let getToken: (() => Promise<string | null>) | null = null;

export function setTokenProvider(fn: () => Promise<string | null>) {
  getToken = fn;
}

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(fn: () => void) {
  onUnauthorized = fn;
}

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (getToken) {
    const token = await getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(path, {
    ...options,
    headers: { ...headers, ...(options?.headers || {}) },
  });
  if (res.status === 401) {
    onUnauthorized?.();
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
  }
  return res.json();
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function patch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}

export const api = {
  listProfiles: () => request<ProfileSummary[]>("/api/profiles"),
  createProfile: (data: { name: string; date_of_birth: string; sex: Sex }) =>
    post<{ id: number; name: string }>("/api/profiles", data),
  getProfile: (id: number) => request<import("../types.ts").UserData>(`/api/profiles/${id}`),
  exportProfile: (id: number) => request<object>(`/api/profiles/${id}/export`),
  checkImport: (data: unknown) =>
    post<{ exists: boolean; user: { id: number; name: string } | null }>("/api/import/check", data),
  importProfile: (data: unknown) => post<{ ok: boolean; profile_id: number }>("/api/import", data),
  updateProfile: (id: number, data: Partial<{ name: string; date_of_birth: string; sex: Sex }>) =>
    patch<{ id: number; name: string }>(`/api/profiles/${id}`, data),
  deleteProfile: (id: number) => del<{ ok: boolean }>(`/api/profiles/${id}`),
  reorderProfiles: (profileIds: number[]) =>
    request<{ ok: boolean }>("/api/profiles/reorder", {
      method: "PUT",
      body: JSON.stringify({ profileIds }),
    }),
  deleteAccount: () => del<{ ok: boolean }>("/api/account"),
  listBiomarkers: (categoryId?: string) => {
    const qs = categoryId ? `?category_id=${encodeURIComponent(categoryId)}` : "";
    return request<import("@openmarkers/db").DbBiomarker[]>(`/api/biomarkers${qs}`);
  },
  batchResults: (data: {
    profile_id: number;
    date: string;
    entries: Array<{ biomarker_id: string; value: string | number }>;
  }) => post<{ inserted: number; skipped: number }>("/api/batch-results", data),
  addResult: (data: { profile_id: number; biomarker_id: string; date: string; value: string | number }) =>
    post<{ id: number; profile_id: number; biomarker_id: string; date: string; value: string }>("/api/results", data),
  updateResult: (id: number, data: { date?: string; value?: string | number }) =>
    patch<{ id: number; date: string; value: string }>(`/api/results/${id}`, data),
  deleteResult: (id: number) => del<{ ok: boolean }>(`/api/results/${id}`),
  getTimeline: (profileId: number) => request<string[]>(`/api/profiles/${profileId}/timeline`),
  getSnapshot: (profileId: number, date: string) =>
    request<import("../types.ts").SnapshotItem[]>(`/api/profiles/${profileId}/snapshot?date=${encodeURIComponent(date)}`),
  getTrends: (profileId: number, opts?: { biomarker_id?: string; category_id?: string }) => {
    const params = new URLSearchParams();
    if (opts?.biomarker_id) params.set("biomarker_id", opts.biomarker_id);
    if (opts?.category_id) params.set("category_id", opts.category_id);
    const qs = params.toString();
    return request<import("../types.ts").BiomarkerTrend[]>(`/api/profiles/${profileId}/trends${qs ? `?${qs}` : ""}`);
  },
  getDaysSince: (profileId: number) =>
    request<import("../types.ts").DaysSinceResult[]>(`/api/profiles/${profileId}/days-since`),
  compareDates: (profileId: number, date1: string, date2: string) =>
    request<import("../types.ts").ComparisonRow[]>(
      `/api/profiles/${profileId}/compare?date1=${encodeURIComponent(date1)}&date2=${encodeURIComponent(date2)}`,
    ),
  getCorrelations: (profileId: number) =>
    request<import("../types.ts").MatchedCorrelationGroup[]>(`/api/profiles/${profileId}/correlations`),
  getBiologicalAge: (profileId: number) =>
    request<import("../types.ts").PhenoAgeResult[]>(`/api/profiles/${profileId}/biological-age`),
  getAnalysisPrompt: (profileId: number, lang: string) =>
    request<{ prompt: string }>(`/api/profiles/${profileId}/analysis-prompt?lang=${encodeURIComponent(lang)}`),
};
