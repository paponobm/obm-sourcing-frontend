import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABEL_BN, orderStatusBadgeVariant } from "@/utils/status";
import type { OrderStatus } from "@/types/invoice.types";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={orderStatusBadgeVariant(status)}>{ORDER_STATUS_LABEL_BN[status]}</Badge>;
}
