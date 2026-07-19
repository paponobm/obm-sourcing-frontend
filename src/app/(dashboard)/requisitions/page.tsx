import { Suspense } from "react";
import { RequisitionDashboard } from "@/components/requisition/RequisitionDashboard";

export default function RequisitionPage() {
  // RequisitionDashboard reads its active tab via useSearchParams(), which
  // Next.js requires to be wrapped in Suspense so this (statically
  // prerenderable) route can still build.
  return (
    <Suspense>
      <RequisitionDashboard />
    </Suspense>
  );
}
