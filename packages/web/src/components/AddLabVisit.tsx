import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Search } from "lucide-react";
import { api } from "../lib/api.ts";
import type { I18n } from "../types.ts";
import { errorMessage } from "../lib/utils.ts";
import type { DbBiomarker } from "@openmarkers/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
        (b) => tBio(b.id, "name").toLowerCase().includes(q) || b.id.toLowerCase().includes(q),
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
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="w-full min-w-[min(640px,100vw)] max-w-5xl flex flex-col h-[90vh] p-0" showCloseButton={false}>
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b border-border">
          <DialogTitle className="text-lg font-bold">{t("addLabVisit")}</DialogTitle>
        </DialogHeader>

        {/* Date + Search */}
        <div className="px-5 py-3 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3">
          <DatePicker value={date} onChange={setDate} className="w-auto" />
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("addLabVisitSearch")}
              className="pl-8"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">...</div>
          ) : filteredGrouped.size === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">{t("addLabVisitNoMatch")}</div>
          ) : (
            Array.from(filteredGrouped.entries()).map(([catId, bios]) => {
              const isOpen = visibleCats.has(catId);
              const catFilled = bios.filter((b) => values[b.id]?.trim()).length;
              return (
                <Collapsible key={catId} open={isOpen} onOpenChange={() => toggleCat(catId)}>
                  <div className="border-b border-border last:border-b-0">
                    <CollapsibleTrigger className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-muted/50 transition-colors">
                      <span className="text-sm font-semibold text-foreground">{tCat(catId, "name")}</span>
                      <div className="flex items-center gap-2">
                        {catFilled > 0 && <Badge variant="default">{catFilled}</Badge>}
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                        />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
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
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex items-center justify-between">
          {error ? (
            <p className="text-sm text-destructive truncate mr-3">{error}</p>
          ) : (
            <span className="text-sm text-muted-foreground">
              {t("addLabVisitNValues").replace("{n}", String(filledCount))}
            </span>
          )}
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" onClick={onClose}>
              {t("importCancel")}
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !date || filledCount === 0}>
              {submitting ? t("addLabVisitSaving") : t("addLabVisitSubmit")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
      <Label className="flex-1 min-w-0 text-sm text-foreground cursor-default font-normal">{name}</Label>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs text-muted-foreground/60 w-20 truncate text-right">{biomarker.unit || ""}</span>
        <Input
          type={isQual ? "text" : "number"}
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-24 px-2 py-1 h-auto text-sm text-right ${hasValue ? "border-primary" : ""}`}
          placeholder={isQual ? "—" : "0.0"}
        />
      </div>
    </div>
  );
}
