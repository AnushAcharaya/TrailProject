/**
 * Format numbers in the user's currently active language.
 *
 * In Nepali (Devanagari) the digits are different glyphs: ०१२३४५६७८९.
 * Numbers in the database are always integers — this helper converts them
 * to the right script just before rendering. Like translateEnum, the data
 * itself is never touched.
 *
 * Usage:
 *   import { formatNumber, useLocalizedNumber } from "../utils/formatNumber";
 *   formatNumber("ne", 1234)  // "१२३४"
 *   formatNumber("en", 1234)  // "1234"
 *
 *   // In a component:
 *   const fmt = useLocalizedNumber();
 *   <p>{fmt(stats.completed)}</p>
 */
import { useTranslation } from "react-i18next";

const NE_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

const toDevanagariDigits = (str) =>
  String(str).replace(/\d/g, (d) => NE_DIGITS[Number(d)]);

export const formatNumber = (lang, value) => {
  if (value === null || value === undefined || value === "") return "";
  const str = String(value);
  if ((lang || "").toLowerCase().startsWith("ne")) {
    return toDevanagariDigits(str);
  }
  return str;
};

/**
 * React hook — returns a memoized formatter that uses whatever language
 * is currently active in i18next. Re-renders on language change.
 */
export const useLocalizedNumber = () => {
  const { i18n } = useTranslation();
  return (value) => formatNumber(i18n.language, value);
};
