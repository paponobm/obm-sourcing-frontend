import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/invoice.types";

type StageState = "done" | "current" | "pending" | "warning";

const STAGE_LABELS = ["অর্ডার করা হয়েছে", "পথে আছে", "রিসিভড", "ভেরিফায়েড", "ক্লোজড"] as const;
const STAGE_DIGITS = ["১", "২", "৩", "৪", "৫"] as const;

function getStageStates(status: OrderStatus): StageState[] {
  // Confirmed is still pre-warehouse — a plain optional status flag on top
  // of Pending, not a distinct visual stage — so it reads the same as
  // IN_TRANSIT here.
  const isPreWarehouse = status === "IN_TRANSIT" || status === "CONFIRMED";
  const stage2: StageState = isPreWarehouse ? "current" : "done";

  let stage3: StageState;
  if (isPreWarehouse) stage3 = "pending";
  else if (status === "RECEIVED") stage3 = "current";
  else if (status === "DISCREPANCY") stage3 = "warning";
  else stage3 = "done"; // VERIFIED | CLOSED

  let stage4: StageState;
  if (status === "VERIFIED") stage4 = "current";
  else if (status === "CLOSED") stage4 = "done";
  else stage4 = "pending";

  const stage5: StageState = status === "CLOSED" ? "done" : "pending";

  return ["done", stage2, stage3, stage4, stage5];
}

export function OrderStepper({ status }: { status: OrderStatus }) {
  const states = getStageStates(status);

  return (
    <div className="flex items-start">
      {STAGE_LABELS.map((label, i) => {
        const state = states[i];
        const isLast = i === STAGE_LABELS.length - 1;
        return (
          <div key={label} className={cn("flex items-center", !isLast && "flex-1")}>
            <div className="flex flex-col items-center gap-1 sm:gap-1.5">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold sm:h-7 sm:w-7 sm:text-xs lg:h-8 lg:w-8 lg:text-sm",
                  state === "done" && "bg-teal text-white",
                  state === "current" && "bg-brass text-white",
                  state === "warning" && "bg-red text-white",
                  state === "pending" && "bg-paper-2 text-gray",
                )}
              >
                {state === "done" ? <Check className="h-3.5 w-3.5 lg:h-4 lg:w-4" /> : STAGE_DIGITS[i]}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-center text-[10px] sm:text-xs lg:text-sm",
                  state === "pending" ? "text-gray" : "text-ink",
                  state === "current" && "font-semibold text-brass",
                  state === "warning" && "font-semibold text-red",
                )}
              >
                {label}
              </span>
            </div>
            {!isLast && (
              <span
                className={cn(
                  "mx-1.5 mt-3 h-[2px] flex-1 sm:mt-3.5 lg:mt-4",
                  states[i + 1] === "pending" ? "bg-line" : "bg-teal",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
