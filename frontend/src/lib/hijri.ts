/**
 * Hijri/Gregorian dual calendar utilities for Saudi legal system.
 * Uses Intl.DateTimeFormat with islamic-umayyad calendar.
 */

const HIJRI_MONTHS_AR = [
  "محرم", "صفر", "ربيع الأول", "ربيع الثاني",
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

const HIJRI_MONTHS_EN = [
  "Muharram", "Safar", "Rabi I", "Rabi II",
  "Jumada I", "Jumada II", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhul Qi'dah", "Dhul Hijjah"
];

/**
 * Convert a Gregorian date to Hijri string.
 */
export function toHijri(date: Date | string, locale: "en" | "ar" = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  try {
    const formatter = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-islamic-umalqura" : "en-US-u-ca-islamic-umalqura", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return formatter.format(d);
  } catch {
    return "";
  }
}

/**
 * Get short Hijri date (numeric).
 */
export function toHijriShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  try {
    const formatter = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      year: "numeric", month: "numeric", day: "numeric",
    });
    return formatter.format(d);
  } catch {
    return "";
  }
}

/**
 * Format date with both Gregorian and Hijri.
 */
export function dualDate(date: Date | string, locale: "en" | "ar" = "en"): { gregorian: string; hijri: string; hijriAr: string } {
  const d = typeof date === "string" ? new Date(date) : date;
  return {
    gregorian: d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    hijri: toHijri(d, "en"),
    hijriAr: toHijri(d, "ar"),
  };
}

/**
 * React-friendly dual date display string.
 */
export function formatDualDate(date: string | Date): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const greg = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const hijri = toHijriShort(d);
  return `${greg} (${hijri} H)`;
}

export { HIJRI_MONTHS_AR, HIJRI_MONTHS_EN };
