import { cn } from "@/lib/utils";

export function Avatar({
  initials,
  imageUrl,
  className,
}: {
  initials: string;
  imageUrl?: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className={cn("mr-2.5 h-[30px] w-[30px] shrink-0 rounded-[6px] object-cover", className)}
      />
    );
  }

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
