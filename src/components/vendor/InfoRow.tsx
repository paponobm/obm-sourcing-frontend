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
        "flex justify-between border-b border-paper-2 py-[9px] text-[0.78125rem]",
        noBorder && "border-b-0",
      )}
    >
      <span className="text-gray">{label}</span>
      <span className={cn("text-right font-semibold", mono && "font-mono")}>{value}</span>
    </div>
  );
}
