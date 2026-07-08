import { cn } from "@/lib/utils";
import { formatBDT } from "@/utils/currency";

export function PriceCell({ amount, lowest }: { amount: number; lowest?: boolean }) {
  return (
    <span className={cn("font-mono text-xs font-bold sm:text-sm lg:text-base", lowest && "text-brass")}>
      {formatBDT(amount)}
    </span>
  );
}
