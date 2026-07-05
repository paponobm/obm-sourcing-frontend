/** Formats a price the way the mockup does: ৳ + integer, mono font applied via className at call site. */
export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString("bn-BD")}`;
}
