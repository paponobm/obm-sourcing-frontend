import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";

/** Shared "Coming Soon" body for vendor-workspace sections not built yet — keeps
 * every future tab (documents, payments, ledger, ...) visually consistent for free. */
export function PlaceholderSection({ title, icon }: { title: string; icon?: LucideIcon }) {
  return (
    <div>
      <h2 className="m-0 mb-3.5 font-serif text-base text-teal-dark sm:mb-4 sm:text-lg lg:text-[1.1875rem] xl:text-xl">
        {title}
      </h2>
      <Card>
        <EmptyState icon={icon} title="শীঘ্রই আসছে" description="এই ফিচারটি শীঘ্রই যুক্ত করা হবে।" />
      </Card>
    </div>
  );
}
