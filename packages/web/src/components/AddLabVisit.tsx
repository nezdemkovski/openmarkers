import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, ChevronDown, Search } from "lucide-react";
import { api } from "../lib/api.ts";
import type { I18n } from "../types.ts";
import { errorMessage } from "../lib/utils.ts";
import type { DbBiomarker } from "@openmarkers/db";

interface AddLabVisitProps {
  profileId: number;
  i18n: I18n;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddLabVisit({ profileId, i18n, onClose, onSuccess }: AddLabVisitProps) {
  const { t, tCat, tBio } = i18n;
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [values, setValues] = useState<Record<string, string>>({});
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: catalog = [], isLoading } = useQuery({
    queryKey: ["biomarkers-catalog"],
    queryFn: () => api.listBiomarkers(),
    staleTime: Infinity,
  });

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, DbBiomarker[]>();
    for (const b of catalog) {
      const arr = map.get(b.category_id);
      if (arr) arr.push(b);
      else map.set(b.category_id, [b]);
    }
    return map;
  }, [catalog]);

  const filteredGrouped = useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.toLowerCase();
    const result = new Map<string, DbBiomarker[]>();
    for (const [catId, bios] of grouped) {
      const filtered = bios.filter(
        (b) =>
          tBio(b.id, "name").toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q),
      );
      if (filtered.length > 0) result.set(catId, filtered);
    }
    return result;
  }, [grouped, search, tBio]);

  const visibleCats = useMemo(() => {
    if (search.trim()) return new Set(filteredGrouped.keys());
    return expandedCats;
  }, [search, filteredGrouped, expandedCats]);

  const toggleCat = (catId: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const setValue = (biomarkerId: string, val: string) => {
    setValues((prev) => ({ ...prev, [biomarkerId]: val }));
  };

  const filledCount = Object.values(values).filter((v) => v.trim() !== "").length;

  const handleSubmit = async () => {
    if (!date || filledCount === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const entries = Object.entries(values)
        .filter(([, v]) => v.trim() !== "")
        .map(([biomarker_id, v]) => {
          const bio = catalog.find((b) => b.id === biomarker_id);
          const isQual = bio?.type === "qualitative";
          return {
            biomarker_id,
            value: isQual ? v : Number(v),
          };
        });
      await api.batchResults({ profile_id: profileId, date, entries });
      onSuccess();
    } catch (e: unknown) {
      setError(errorMessage(e));
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-xl flex flex-col h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("addLabVisit")}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date + Search */}
        <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("addLabVisitSearch")}
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-gray-400">...</div>
          ) : filteredGrouped.size === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">{t("addLabVisitNoMatch")}</div>
          ) : (
            Array.from(filteredGrouped.entries()).map(([catId, bios]) => {
              const isOpen = visibleCats.has(catId);
              const catFilled = bios.filter((b) => values[b.id]?.trim()).length;
              return (
                <div key={catId} className="border-b border-gray-100 dark:border-gray-700/50 last:border-b-0">
                  <button
                    onClick={() => toggleCat(catId)}
                    className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {tCat(catId, "name")}
                    </span>
                    <div className="flex items-center gap-2">
                      {catFilled > 0 && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                          {catFilled}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-3 space-y-1">
                      {bios.map((b) => (
                        <BiomarkerRow
                          key={b.id}
                          biomarker={b}
                          name={tBio(b.id, "name")}
                          value={values[b.id] || ""}
                          onChange={(val) => setValue(b.id, val)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400 truncate mr-3">{error}</p>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t("addLabVisitNValues").replace("{n}", String(filledCount))}
            </span>
          )}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {t("importCancel")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !date || filledCount === 0}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {submitting ? t("addLabVisitSaving") : t("addLabVisitSubmit")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BiomarkerRow({
  biomarker,
  name,
  value,
  onChange,
}: {
  biomarker: DbBiomarker;
  name: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const isQual = biomarker.type === "qualitative";
  const hasValue = value.trim() !== "";

  return (
    <div className="flex items-center gap-3 py-1.5 group">
      <label className="flex-1 min-w-0 text-sm text-gray-700 dark:text-gray-300 truncate cursor-default">
        {name}
      </label>
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type={isQual ? "text" : "number"}
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-24 px-2 py-1 text-sm text-right rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
            hasValue
              ? "border-blue-300 dark:border-blue-600"
              : "border-gray-200 dark:border-gray-600"
          }`}
          placeholder={isQual ? "—" : "0.0"}
        />
        <span className="text-xs text-gray-400 dark:text-gray-500 w-20 truncate">
          {biomarker.unit || ""}
        </span>
      </div>
    </div>
  );
}
