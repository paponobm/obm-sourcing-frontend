/** Formats a price the way the mockup does: ৳ + Bengali digits, always 2 decimal places, mono font applied via className at call site. */
export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString("bn-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
