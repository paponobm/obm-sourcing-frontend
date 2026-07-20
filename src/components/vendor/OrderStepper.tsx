import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/invoice.types";

type StageState = "done" | "current" | "pending" | "warning";

const STAGE_LABELS = ["অর্ডার তৈরি", "ভেন্ডর নিশ্চিত করেছে", "পথে আছে", "ভেরিফাইড", "ক্লোজ"] as const;
const STAGE_DIGITS = ["১", "২", "৩", "৪", "৫"] as const;

/** Maps the real OrderStatus (IN_TRANSIT -> CONFIRMED -> RECEIVED/DISCREPANCY
 * -> VERIFIED -> CLOSED) onto the 5 procurement-workflow stages — nothing
 * here is a fixed/hardcoded "current step"; it's fully derived from whatever
 * status the backend reports for this invoice. */
function getStageStates(status: OrderStatus): StageState[] {
  // Stage 1 — অর্ডার তৈরি: the invoice existing at all means this is done.
  const stage1: StageState = "done";

  // Stage 2 — ভেন্ডর নিশ্চিত করেছে: done once confirmed (or further along);
  // current while still freshly created and unconfirmed.
  const stage2: StageState = status === "IN_TRANSIT" ? "current" : "done";

  // Stage 3 — পথে আছে: active once Confirmed (now moving toward the
  // warehouse), done once it's physically arrived (Received onward).
  let stage3: StageState;
  if (status === "IN_TRANSIT") stage3 = "pending";
  else if (status === "CONFIRMED") stage3 = "current";
  else stage3 = "done"; // RECEIVED | DISCREPANCY | VERIFIED | CLOSED

  // Stage 4 — ভেরিফাইড: active while the warehouse check is in progress;
  // flags a mismatch as a warning; done once that check has succeeded.
  let stage4: StageState;
  if (status === "IN_TRANSIT" || status === "CONFIRMED") stage4 = "pending";
  else if (status === "RECEIVED") stage4 = "current";
  else if (status === "DISCREPANCY") stage4 = "warning";
  else stage4 = "done"; // VERIFIED | CLOSED

  // Stage 5 — ক্লোজ: done only once actually closed.
  let stage5: StageState;
  if (status === "CLOSED") stage5 = "done";
  else if (status === "VERIFIED") stage5 = "current";
  else stage5 = "pending";

  return [stage1, stage2, stage3, stage4, stage5];
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
