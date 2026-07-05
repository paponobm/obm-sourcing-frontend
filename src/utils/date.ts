const BN_DATE_FORMATTER = new Intl.DateTimeFormat("bn-BD", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** e.g. "29 Jun, 2026" rendered with Bengali digits/month, matching the mockup's date style. */
export function formatBnDate(isoDate: string): string {
  return BN_DATE_FORMATTER.format(new Date(isoDate));
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

function toBnDigits(n: number): string {
  return String(n)
    .split("")
    .map((ch) => (/\d/.test(ch) ? BN_DIGITS[Number(ch)] : ch))
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
