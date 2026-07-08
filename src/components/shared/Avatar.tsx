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
        className={cn(
          "mr-1.5 h-6 w-6 shrink-0 rounded-md object-cover sm:mr-2 sm:h-7 sm:w-7 lg:mr-2.5 lg:h-[30px] lg:w-[30px]",
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "mr-1.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal font-serif text-[10px] text-white sm:mr-2 sm:h-7 sm:w-7 sm:text-xs lg:mr-2.5 lg:h-[30px] lg:w-[30px] lg:text-xs",
        className,
      )}
    >
      {initials}
    </span>
  );
}
