"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
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
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PriceCell } from "@/components/product/PriceCell";
import { ProductEditForm } from "@/components/forms/ProductEditForm";
import { useDeleteProduct } from "@/hooks/useProducts";
import { useHasRole } from "@/hooks/useHasRole";
import { MANAGE_CATALOG_ROLES, SUPER_ADMIN_ONLY } from "@/constants/roles";
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
  const deleteProduct = useDeleteProduct();
  const canEdit = useHasRole(MANAGE_CATALOG_ROLES);
  const canDelete = useHasRole(SUPER_ADMIN_ONLY);
  const showActionsColumn = canEdit || canDelete;

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
              {showActionsColumn && <TableHead />}
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
                {showActionsColumn && (
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      {canEdit && (
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
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>প্রোডাক্ট এডিট করুন</DialogTitle>
                              <DialogDescription>
                                প্রোডাক্টের নাম, ইউনিট, ক্যাটাগরি পরিবর্তন করলে তা অন্য সব ভেন্ডরের জন্যও পরিবর্তিত হবে।
                              </DialogDescription>
                            </DialogHeader>
                            <ProductEditForm
                              vendorId={vendorId}
                              productId={p.productId}
                              defaultValues={{
                                name: p.productName,
                                unit: p.unit,
                                category: p.category,
                                price: p.price,
                              }}
                              onSuccess={() => setEditingId(null)}
                            />
                          </DialogContent>
                        </Dialog>
                      )}

                      {canDelete && (
                        <ConfirmDialog
                          trigger={
                            <Button type="button" variant="ghost" size="sm">
                              <Trash2 className="h-3.5 w-3.5 text-red" />
                            </Button>
                          }
                          title="প্রোডাক্ট মুছে ফেলবেন?"
                          description={`"${p.productName}" সম্পূর্ণরূপে মুছে ফেলা হবে — এটি অন্য সব ভেন্ডরের তালিকা ও দামের তুলনা থেকেও বাদ যাবে। এই কাজটি ফিরিয়ে আনা যাবে না।`}
                          confirmLabel="মুছে ফেলুন"
                          onConfirm={() => deleteProduct.mutate(p.productId)}
                          isLoading={deleteProduct.isPending}
                        />
                      )}
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
