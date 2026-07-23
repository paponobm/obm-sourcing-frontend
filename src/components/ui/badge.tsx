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
        alert: "bg-orange-100 text-orange-700",
        // Distinct from `active`/`inactive`/`low` above (which are also
        // reused for unrelated meanings — order VERIFIED/CLOSED, requisition
        // priority, payment/fulfillment status) — these back ONLY the
        // Vendor/Product/Courier PENDING/ACTIVE/INACTIVE status badges.
        pending: "bg-brass text-white",
        statusActive: "bg-green text-white",
        statusInactive: "bg-red text-white",
        // Order workflow status badges (OrderStatusBadge only) — exact
        // hex values used instead of Tailwind's named indigo/blue/purple/
        // emerald/gray scales since this project's `gray`/`red` keys are
        // already redefined as flat DEFAULT-only colors in tailwind.config.ts.
        orderOnTheWay: "bg-[#2563eb] text-white",
        orderReceived: "bg-[#9333ea] text-white",
        orderVerified: "bg-[#4f46e5] text-white",
        orderClosed: "bg-[#059669] text-white",
        orderDiscrepancy: "bg-[#4b5563] text-white",
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
