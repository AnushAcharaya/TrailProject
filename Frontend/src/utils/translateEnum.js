/**
 * Translate "enum-style" backend values (animal type, specialization, status,
 * role, etc.) to the user's language without changing what's stored in the DB.
 *
 * Backend stays in English/codes:
 *   { animal_type: "Cattle", specialization: "Child Care", status: "Pending" }
 *
 * Frontend display picks up the translation:
 *   translateEnum(t, "animals", "Cattle")          -> "Cattle" / "पशु"
 *   translateEnum(t, "specializations", "Child Care") -> "Animal Child Care" / "बच्चा हेरचाह"
 *
 * The function is forgiving:
 *   - Lower-cases and snake_cases the value before lookup
 *   - Returns the raw value if no translation exists (so unknown values still show)
 *   - Handles null / undefined / empty string
 *
 * Translations live in `common.json` -> `enums.<namespace>.<key>`
 * (so this helper assumes useTranslation() is called WITHOUT a namespace
 *  arg, or the caller passes a `t` from common namespace).
 */
export const translateEnum = (t, namespace, value, fallback) => {
  if (value === null || value === undefined || value === "") {
    return fallback ?? "";
  }
  const raw = String(value).trim();
  // Normalize: "Child Care" → "child_care", "GENERAL_PRACTICE" → "general_practice"
  const key = raw.toLowerCase().replace(/[\s-]+/g, "_");
  // Look up — t() returns the key itself if no translation; we use defaultValue
  // so that UNKNOWN values render as the original raw string instead of "enums.x.y".
  return t(`enums.${namespace}.${key}`, { defaultValue: fallback ?? raw });
};

// Convenience wrappers so call sites read naturally.
export const tAnimal = (t, value, fallback) =>
  translateEnum(t, "animals", value, fallback);
export const tSpecialization = (t, value, fallback) =>
  translateEnum(t, "specializations", value, fallback);
export const tStatus = (t, value, fallback) =>
  translateEnum(t, "statuses", value, fallback);
export const tRole = (t, value, fallback) =>
  translateEnum(t, "roles", value, fallback);
export const tAvailability = (t, value, fallback) =>
  translateEnum(t, "availability", value, fallback);
