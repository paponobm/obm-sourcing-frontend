import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Mirrors the mockup's .pill / .pill.active / .pill.inactive / .pill.low classes. */
const badgeVariants = cva(
  "inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-2.5 sm:py-[3px] sm:text-[11px] lg:px-3 lg:text-xs",
  {
    variants: {
      variant: {
        active: "bg-green-soft text-green",
        inactive: "bg-paper-2 text-gray",
        low: "bg-brass-soft text-brass",
        destructive: "bg-red/10 text-red",
      },
    },
    defaultVariants: {
      variant: "active",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
