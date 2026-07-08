import { cn } from "@/lib/utils";

export function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        "mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full font-mono text-[0.5625rem] font-bold sm:mr-2 sm:h-5 sm:w-5 sm:text-[0.6875rem] lg:h-6 lg:w-6 lg:text-xs",
        rank === 1 ? "bg-brass text-white" : "bg-paper-2 text-gray",
      )}
    >
      {rank}
    </span>
  );
}
