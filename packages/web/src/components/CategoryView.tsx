import { memo } from "react";
import type { Category, I18n } from "../types.ts";
import ChartCard from "./ChartCard.tsx";
import QualitativeTable from "./QualitativeTable.tsx";

interface CategoryViewProps {
  category: Category;
  isDark: boolean;
  i18n: I18n;
  profileId?: number;
  onMutate?: () => void;
}

export default memo(function CategoryView({ category, isDark, i18n, profileId, onMutate }: CategoryViewProps) {
  const { tCat } = i18n;
  const quantitative: typeof category.biomarkers = [];
  const qualitative: typeof category.biomarkers = [];
  for (const b of category.biomarkers) {
    (b.type === "qualitative" ? qualitative : quantitative).push(b);
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{tCat(category.id, "name")}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tCat(category.id, "description")}</p>
      </div>
      {quantitative.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {quantitative.map((b) => (
            <ChartCard key={b.id} biomarker={b} isDark={isDark} i18n={i18n} profileId={profileId} onMutate={onMutate} />
          ))}
        </div>
      )}
      {qualitative.length > 0 && <QualitativeTable biomarkers={qualitative} i18n={i18n} profileId={profileId} onMutate={onMutate} />}
    </>
  );
});
