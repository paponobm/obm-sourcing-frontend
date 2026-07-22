"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { useVendorInvoices } from "@/hooks/useInvoices";
import { formatBDT } from "@/utils/currency";
import { formatBnDate, toBnDigits } from "@/utils/date";
import { ROUTES } from "@/constants/routes";

export function VendorOrdersTable({ vendorId }: { vendorId: string }) {
  const { data: invoices, isLoading } = useVendorInvoices(vendorId);
  const [oldestFirst, setOldestFirst] = useState(false);

  const sorted = useMemo(() => {
    if (!invoices) return [];
    return oldestFirst ? [...invoices].reverse() : invoices;
  }, [invoices, oldestFirst]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>সব ইনভয়েস (মোট {invoices != null ? toBnDigits(invoices.length) : "..."} টি)</CardTitle>
        <button
          type="button"
          onClick={() => setOldestFirst((v) => !v)}
          className="text-[11px] text-gray hover:underline sm:text-xs"
        >
          {oldestFirst ? "পুরনো আগে" : "সাম্প্রতিক আগে"}
        </button>
      </CardHeader>

      {isLoading && (
        <div className="space-y-2 p-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      )}

      {!isLoading && sorted.length === 0 && (
        <EmptyState title="কোনো অর্ডার নেই" description="এই ভেন্ডরের জন্য এখনো কোনো অর্ডার তৈরি করা হয়নি।" />
      )}

      {!isLoading && sorted.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ইনভয়েস</TableHead>
              <TableHead>তারিখ</TableHead>
              <TableHead>আইটেম</TableHead>
              <TableHead>সর্বমোট</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono">{inv.invoiceNumber}</TableCell>
                <TableCell className="text-gray">{formatBnDate(inv.orderedAt)}</TableCell>
                <TableCell className="font-mono">{toBnDigits(inv.itemCount)} টি</TableCell>
                <TableCell className="font-mono font-bold text-brass">
                  {formatBDT(inv.procurementCost ?? inv.totalAmount)}
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={inv.status} />
                </TableCell>
                <TableCell>
                  <Button asChild type="button" variant="ghost" size="sm" className="ml-auto flex">
                    <Link href={ROUTES.invoiceDetail(inv.id)}>দেখুন</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
