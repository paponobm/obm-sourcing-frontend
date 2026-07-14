import { formatBDT } from "@/utils/currency";

export function PriceCell({ amount }: { amount: number; lowest?: boolean }) {
  return (
    <span className="font-mono text-xs font-bold text-brass sm:text-sm lg:text-base">{formatBDT(amount)}</span>
  );
}
