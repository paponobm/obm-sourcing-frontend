import { cn } from "@/lib/utils";

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span
      className={cn(
        "mr-2.5 inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[6px] bg-teal font-serif text-xs text-white",
        className,
      )}
    >
      {initials}
    </span>
  );
}
