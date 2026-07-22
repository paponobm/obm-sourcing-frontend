import Link from "next/link";
import { Card, CardHeader, CardTitle, CardTag } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/shared/Avatar";
import { RankBadge } from "./RankBadge";
import { PriceCell } from "./PriceCell";
import { StarRating } from "./StarRating";
import { formatBnDate, toBnDigits } from "@/utils/date";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { ProductVendorEntry } from "@/types/product.types";

export function PriceCompareTable({
  productName,
  rows,
}: {
  productName: string;
  rows: ProductVendorEntry[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{productName}</CardTitle>
        <CardTag>
          <span className="font-mono">{toBnDigits(rows.length)}</span> জন ভেন্ডর
        </CardTag>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead>ভেন্ডর</TableHead>
            <TableHead>দাম</TableHead>
            <TableHead>রেটিং</TableHead>
            <TableHead>সর্বশেষ আপডেট</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => {
            const isLowest = index === 0;
            return (
              <TableRow key={row.vendorId} className={cn(isLowest && "bg-brass-soft")}>
                <TableCell>
                  <RankBadge rank={index + 1} />
                </TableCell>
                <TableCell>
                  <Link
                    href={ROUTES.vendorDetail(row.vendorId)}
                    className="flex items-center hover:underline"
                  >
                    <Avatar initials={row.vendorName.slice(0, 2)} />
                    {row.vendorName}
                  </Link>
                </TableCell>
                <TableCell>
                  <PriceCell amount={row.price} lowest={isLowest} />
                </TableCell>
                <TableCell>
                  <StarRating value={row.rating} />
                </TableCell>
                <TableCell className="text-gray">{formatBnDate(row.lastUpdatedAt)}</TableCell>
                <TableCell>{isLowest && <Badge variant="low">সর্বনিম্ন দাম</Badge>}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
