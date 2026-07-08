import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded border bg-white px-2.5 py-2 font-sans text-xs text-ink placeholder:text-gray/70 sm:px-3 sm:py-2.5 sm:text-sm lg:px-3.5 lg:py-3 lg:text-base",
          "min-h-[70px] focus:outline-none focus:ring-2 focus:ring-ring/40 sm:min-h-[80px] lg:min-h-[100px]",
          invalid ? "border-red" : "border-line",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
