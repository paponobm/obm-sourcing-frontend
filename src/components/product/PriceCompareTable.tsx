import Link from "next/link";
import { Card, CardHeader, CardTitle, CardTag } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/shared/Avatar";
import { RankBadge } from "./RankBadge";
import { PriceCell } from "./PriceCell";
import { formatBnDate } from "@/utils/date";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { PriceComparisonRow } from "@/types/product.types";

export function PriceCompareTable({ rows }: { rows: PriceComparisonRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ভেন্ডর অনুযায়ী দামের তালিকা</CardTitle>
        <CardTag>Auto-sorted</CardTag>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead>ভেন্ডর</TableHead>
            <TableHead>দাম / ইউনিট</TableHead>
            <TableHead>সর্বশেষ আপডেট</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.vendorId} className={cn(row.isLowest && "bg-brass-soft")}>
              <TableCell>
                <RankBadge rank={row.rank} />
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
                <PriceCell amount={row.price} lowest={row.isLowest} />
              </TableCell>
              <TableCell className="text-gray">{formatBnDate(row.lastUpdatedAt)}</TableCell>
              <TableCell>
                {row.isLowest && <Badge variant="low">সর্বনিম্ন দাম</Badge>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
