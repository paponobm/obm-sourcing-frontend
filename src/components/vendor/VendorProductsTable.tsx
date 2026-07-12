"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Card, CardHeader, CardTitle, CardTag } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PriceCell } from "@/components/product/PriceCell";
import { StarRating } from "@/components/product/StarRating";
import { ProductEditForm } from "@/components/forms/ProductEditForm";
import { useHasRole } from "@/hooks/useHasRole";
import { MANAGE_CATALOG_ROLES } from "@/constants/roles";
import { formatBnDate } from "@/utils/date";
import type { VendorProductPrice } from "@/types/vendor.types";

export function VendorProductsTable({
  vendorId,
  products,
  totalCount,
}: {
  vendorId: string;
  products: VendorProductPrice[];
  totalCount: number;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const canEdit = useHasRole(MANAGE_CATALOG_ROLES);

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
              <TableHead>রেটিং</TableHead>
              <TableHead>সর্বশেষ আপডেট</TableHead>
              {canEdit && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="text-sm md:text-base lg:text-lg xl:text-xl">
                  {p.productName}
                </TableCell>
                <TableCell>
                  <PriceCell amount={p.price} lowest={p.isLowestForProduct} />
                </TableCell>
                <TableCell>
                  <StarRating value={p.rating} />
                </TableCell>
                <TableCell className="text-gray">{formatBnDate(p.lastUpdatedAt)}</TableCell>
                {canEdit && (
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <Dialog
                        open={editingId === p.id}
                        onOpenChange={(open) => setEditingId(open ? p.id : null)}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(p.id)}
                        >
                          <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                        </Button>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>দাম ও রেটিং এডিট করুন</DialogTitle>
                            <DialogDescription>
                              এই ভেন্ডরের জন্য শুধু দাম ও রেটিং পরিবর্তন হবে — প্রোডাক্টের নাম/ইউনিট/ক্যাটাগরি প্রোডাক্ট
                              তালিকা পাতা থেকে এডিট করুন।
                            </DialogDescription>
                          </DialogHeader>
                          <ProductEditForm
                            vendorId={vendorId}
                            productId={p.productId}
                            defaultValues={{ price: p.price, rating: p.rating }}
                            onSuccess={() => setEditingId(null)}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
