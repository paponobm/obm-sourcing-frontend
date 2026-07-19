import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

/**
 * Shared layout for each of the Dashboard's 4 independently-filterable
 * sections (Products/Vendors/Orders/Requisitions) — header with icon, its
 * own filter row, then a cards-grid beside its own pie chart. Extracted so
 * the "beautiful enterprise card" chrome (soft shadow via Card, spacing,
 * icon badge) is written once, not copy-pasted 4 times.
 */
export function DashboardSectionCard({
  icon: Icon,
  title,
  filters,
  cards,
  chart,
}: {
  icon: LucideIcon;
  title: string;
  filters: ReactNode;
  cards: ReactNode;
  chart: ReactNode;
}) {
  return (
    <Card className="mb-4 p-3.5 transition-shadow duration-200 hover:shadow-panel sm:mb-5 sm:p-4 lg:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5 sm:mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-paper-2 text-teal">
            <Icon className="h-4 w-4" />
          </span>
          <h2 className="m-0 font-serif text-sm text-teal-dark sm:text-base lg:text-lg">{title}</h2>
        </div>
        <div className="flex flex-wrap items-end gap-2">{filters}</div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        <div>{cards}</div>
        <div className="rounded-md border border-line bg-paper-2/40 p-2">{chart}</div>
      </div>
    </Card>
  );
}
