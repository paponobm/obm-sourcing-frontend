import { cn } from "@/lib/utils";

export function InfoRow({
  label,
  value,
  mono,
  noBorder,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  noBorder?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex justify-between gap-2 border-b border-paper-2 py-2 text-xs sm:py-[9px] sm:text-[0.78125rem] lg:text-sm",
        noBorder && "border-b-0",
      )}
    >
      <span className="text-gray">{label}</span>
      <span className={cn("text-right font-semibold", mono && "font-mono")}>{value}</span>
    </div>
  );
}
