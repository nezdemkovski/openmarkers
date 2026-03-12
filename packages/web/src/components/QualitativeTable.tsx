import { useState } from "react";
import ResultEditor from "./ResultEditor.tsx";
import type { Biomarker, I18n } from "../types.ts";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface QualitativeTableProps {
  biomarkers: Biomarker[];
  i18n: I18n;
  profileId?: number;
  onMutate?: () => void;
}

export default function QualitativeTable({ biomarkers, i18n, profileId, onMutate }: QualitativeTableProps) {
  const [editingBiomarker, setEditingBiomarker] = useState<Biomarker | null>(null);
  const { t, tBio } = i18n;
  if (biomarkers.length === 0) return null;

  const dateSet = new Set<string>();
  biomarkers.forEach((b) => b.results.forEach((r) => dateSet.add(r.date)));
  const dates = [...dateSet].sort();

  return (
    <Card className="p-4 mb-6">
      <h3 className="text-sm font-semibold text-foreground mb-3">{t("qualitativeResults")}</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">{t("test")}</TableHead>
              {dates.map((d) => (
                <TableHead key={d} className="text-xs text-center">
                  {new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {biomarkers.map((b) => (
              <TableRow key={b.id}>
                <TableCell>
                  <div className="text-sm font-medium text-foreground">{tBio(b.id, "name")}</div>
                  <div className="text-xs text-muted-foreground">{b.id}</div>
                  {b.note && <div className="text-xs text-muted-foreground mt-0.5">{b.note}</div>}
                  {profileId != null && onMutate && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setEditingBiomarker(b)}
                      className="text-xs text-muted-foreground mt-0.5 h-auto p-0"
                    >
                      {t("editResultsLink")}
                    </Button>
                  )}
                </TableCell>
                {dates.map((d) => {
                  const result = b.results.find((r) => r.date === d);
                  if (!result)
                    return (
                      <TableCell key={d} className="text-center text-muted-foreground/40">
                        &mdash;
                      </TableCell>
                    );
                  const isNeg = typeof result.value === "string" && result.value.toLowerCase() === "neg";
                  return (
                    <TableCell
                      key={d}
                      className={`text-center text-sm ${isNeg ? "text-green-600 dark:text-green-400" : "text-foreground"}`}
                    >
                      {result.value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {editingBiomarker && profileId != null && onMutate && (
        <ResultEditor
          biomarker={editingBiomarker}
          profileId={profileId}
          i18n={i18n}
          onClose={() => setEditingBiomarker(null)}
          onMutate={() => {
            onMutate();
            setEditingBiomarker(null);
          }}
        />
      )}
    </Card>
  );
}
