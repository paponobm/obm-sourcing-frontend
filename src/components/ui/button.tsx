import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Variants map onto the mockup's .btn classes:
 *  - .btn            -> variant="primary"  (teal)
 *  - .btn.brass      -> variant="brass"
 *  - .btn.ghost      -> variant="ghost"
 *  - .btn.block      -> fullWidth
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded whitespace-nowrap font-sans text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-teal text-white hover:bg-teal-dark",
        brass: "bg-brass text-white hover:brightness-95",
        ghost: "border border-line bg-white text-teal-dark hover:bg-paper-2",
        destructive: "bg-red text-white hover:brightness-95",
        link: "text-teal underline-offset-4 hover:underline",
      },
      size: {
        default: "px-[18px] py-[11px] text-sm",
        sm: "px-3 py-2 text-xs",
        lg: "px-6 py-3 text-base",
        icon: "h-9 w-9",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
