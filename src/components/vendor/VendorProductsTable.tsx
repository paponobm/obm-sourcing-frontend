import { Card, CardHeader, CardTitle, CardTag } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { PriceCell } from "@/components/product/PriceCell";
import { formatBnDate } from "@/utils/date";
import type { VendorProductPrice } from "@/types/vendor.types";

export function VendorProductsTable({
  products,
  totalCount,
}: {
  products: VendorProductPrice[];
  totalCount: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>এই ভেন্ডরের প্রোডাক্ট ও দাম</CardTitle>
        <CardTag>{totalCount} টি</CardTag>
      </CardHeader>
      {products.length === 0 ? (
        <EmptyState
          title="কোনো প্রোডাক্ট যোগ করা হয়নি"
          description="এই ভেন্ডরের জন্য এখনো কোনো প্রোডাক্ট ও দাম যোগ করা হয়নি।"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>প্রোডাক্ট</TableHead>
              <TableHead>দাম</TableHead>
              <TableHead>সর্বশেষ আপডেট</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.productName}</TableCell>
                <TableCell>
                  <PriceCell amount={p.price} lowest={p.isLowestForProduct} />
                </TableCell>
                <TableCell className="text-gray">{formatBnDate(p.lastUpdatedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
