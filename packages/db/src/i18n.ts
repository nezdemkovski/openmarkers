import cs from "./i18n/cs";
import en from "./i18n/en";
import is from "./i18n/is";
import ru from "./i18n/ru";
import type { I18n, Lang, TranslationData } from "./types";

const translations: Record<Lang, TranslationData> = { en, cs, ru, is };

export const LANGS: { code: Lang; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "cs", name: "Czech", nativeName: "Ceština" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "is", name: "Icelandic", nativeName: "Íslenska" },
];

export function makeI18n(lang: Lang): I18n {
  return {
    t: (key) => translations[lang]?.ui?.[key] || translations.en.ui[key] || key,
    tCat: (catId, field) =>
      translations[lang]?.categories?.[catId]?.[field] ||
      translations.en.categories[catId]?.[field] ||
      "",
    tBio: (bioId, field) =>
      translations[lang]?.biomarkers?.[bioId]?.[field] ||
      translations.en.biomarkers[bioId]?.[field] ||
      "",
  };
}
