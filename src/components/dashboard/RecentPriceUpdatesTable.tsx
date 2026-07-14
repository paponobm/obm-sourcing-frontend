import { Card, CardHeader, CardTitle, CardTag } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatBDT } from "@/utils/currency";
import type { RecentPriceUpdate } from "@/types/dashboard.types";

export function RecentPriceUpdatesTable({
  updates,
  isLoading,
}: {
  updates: RecentPriceUpdate[] | undefined;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>সাম্প্রতিক দাম আপডেট</CardTitle>
        <CardTag>সব দেখুন</CardTag>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>প্রোডাক্ট</TableHead>
            <TableHead>ভেন্ডর</TableHead>
            <TableHead>নতুন দাম</TableHead>
            <TableHead>স্ট্যাটাস</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={4}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              </TableRow>
            ))}
          {!isLoading &&
            updates?.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.productName}</TableCell>
                <TableCell>{u.vendorName}</TableCell>
                <TableCell className="font-mono font-bold text-brass">{formatBDT(u.newPrice)}</TableCell>
                <TableCell>
                  <Badge variant={u.status === "LOWEST" ? "low" : "active"}>
                    {u.status === "LOWEST" ? "সর্বনিম্ন" : "আপডেটেড"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Card>
  );
}
