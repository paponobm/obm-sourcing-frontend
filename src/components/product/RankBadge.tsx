import { cn } from "@/lib/utils";

export function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        "mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full font-mono text-[11px] font-bold",
        rank === 1 ? "bg-brass text-white" : "bg-paper-2 text-gray",
      )}
    >
      {rank}
    </span>
  );
}
