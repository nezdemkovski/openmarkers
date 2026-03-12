import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Lang } from "../types";

const LANG_VALUES = new Set(["en", "cs", "ru", "is"]);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && LANG_VALUES.has(value);
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Unknown error";
}
