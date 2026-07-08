import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, invalid, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "h-9 w-full rounded border bg-white px-2.5 font-sans text-xs text-ink placeholder:text-gray/70 sm:h-10 sm:px-3 sm:text-sm lg:h-11 lg:px-3.5 lg:text-base",
          "focus:outline-none focus:ring-2 focus:ring-ring/40",
          invalid ? "border-red" : "border-line",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
