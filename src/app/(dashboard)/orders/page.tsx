import { Suspense } from "react";
import { OrderManagementPage } from "@/components/orders/OrderManagementPage";

export default function OrdersPage() {
  // OrderManagementPage reads its status filter via useSearchParams(), which
  // Next.js requires to be wrapped in Suspense so this (statically
  // prerenderable) route can still build.
  return (
    <Suspense>
      <OrderManagementPage />
    </Suspense>
  );
}
