// "short" mistranslates some months in bn-BD ICU data (e.g. জানুয়ারী → জানু,
// ফেব্রুয়ারী → ফেব, জুলাই → জুল — not real Bangla abbreviations); "long" gives
// the correct full month name and is identical to "short" for every other
// month anyway, so this only changes those three.
const BN_DATE_FORMATTER = new Intl.DateTimeFormat("bn-BD", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** e.g. "29 Jun, 2026" rendered with Bengali digits/month, matching the mockup's date style. */
export function formatBnDate(isoDate: string): string {
  return BN_DATE_FORMATTER.format(new Date(isoDate));
}

const BN_TIME_FORMATTER = new Intl.DateTimeFormat("bn-BD", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** e.g. "২:৩৫ PM", matching formatBnDate's style for activity log timestamps. */
export function formatBnTime(isoDate: string): string {
  return BN_TIME_FORMATTER.format(new Date(isoDate));
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBnDigits(n: number | string): string {
  return String(n)
    .split("")
    .map((ch) => (/\d/.test(ch) ? BN_DIGITS[Number(ch)] : ch))
    .join("");
}

const EN_DIGITS_BY_BN: Record<string, string> = BN_DIGITS.reduce(
  (acc, bn, i) => ({ ...acc, [bn]: String(i) }),
  {},
);

/** Reverse of toBnDigits — lets a text input show Bangla numerals while
 * still accepting/normalizing whatever digits the user actually types
 * (Bangla or English) back to a canonical English-digit string internally. */
export function toEnDigits(s: string): string {
  return s
    .split("")
    .map((ch) => EN_DIGITS_BY_BN[ch] ?? ch)
    .join("");
}

/** e.g. "১২ মিনিট আগে" for the dashboard activity feed. `now` must be passed in (no Date.now() at import time). */
export function formatRelativeBn(isoDate: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(isoDate).getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "এইমাত্র";
  if (diffMin < 60) return `${toBnDigits(diffMin)} মিনিট আগে`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${toBnDigits(diffHours)} ঘণ্টা আগে`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "গতকাল";
  return `${toBnDigits(diffDays)} দিন আগে`;
}
