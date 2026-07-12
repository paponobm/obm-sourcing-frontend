import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { OrderStatusBadge } from "@/components/vendor/OrderStatusBadge";
import { ROUTES } from "@/constants/routes";
import { formatBnDate } from "@/utils/date";
import type { CompletedRequisition } from "@/types/requisition.types";

/** "PO Number" is the same value as the invoice number — this app models a
 * purchase order as an Invoice (see plan notes), so there's no separate PO
 * numbering scheme to show as a second column. */
export function CompletedOrderHistory({
  requisitions,
  isLoading,
}: {
  requisitions: CompletedRequisition[];
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>কমপ্লিটেড অর্ডার (মোট {requisitions.length} টি)</CardTitle>
      </CardHeader>

      {isLoading && (
        <div className="space-y-2 p-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}

      {!isLoading && requisitions.length === 0 && (
        <EmptyState
          title="কোনো কমপ্লিটেড অর্ডার নেই"
          description="রিকুইজিশন থেকে অর্ডার তৈরি হলে সেটি এখানে দেখাবে।"
        />
      )}

      {!isLoading && requisitions.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>প্রোডাক্ট</TableHead>
              <TableHead>ভেন্ডর</TableHead>
              <TableHead>ইনভয়েস / PO নম্বর</TableHead>
              <TableHead>অর্ডার QTY</TableHead>
              <TableHead>অর্ডার তারিখ</TableHead>
              <TableHead>অনুরোধ করেছেন</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requisitions.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-sm md:text-base lg:text-lg xl:text-xl">{r.productName}</TableCell>
                <TableCell>
                  {r.invoice ? (
                    <Link href={ROUTES.vendorDetail(r.invoice.vendorId)} className="hover:underline">
                      {r.invoice.vendorName}
                    </Link>
                  ) : (
                    "–"
                  )}
                </TableCell>
                <TableCell className="font-mono">
                  {r.invoice ? (
                    <Link href={ROUTES.invoiceDetail(r.invoice.id)} className="text-teal hover:underline">
                      {r.invoice.invoiceNumber}
                    </Link>
                  ) : (
                    "–"
                  )}
                </TableCell>
                <TableCell>
                  {r.orderedQty} {r.unit}
                </TableCell>
                <TableCell className="text-gray">{r.invoice ? formatBnDate(r.invoice.orderedAt) : "–"}</TableCell>
                <TableCell>{r.requestedByName}</TableCell>
                <TableCell>{r.invoice && <OrderStatusBadge status={r.invoice.status} />}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
