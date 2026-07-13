"use client";

import { useMemo, useState } from "react";
import { Pencil, Bell } from "lucide-react";
import { Card, CardHeader, CardTitle, CardTag } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
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

type RequisitionFilter = "all" | "pending" | "none";

function PendingRequisitionBadge({ product }: { product: VendorProductPrice }) {
  const summary = product.pendingRequisitionSummary;
  if (!summary) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="alert" className="cursor-help">
          পেন্ডিং ({product.pendingRequisitionCount})
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="w-56">
        <p className="mb-1.5 font-semibold text-ink">পেন্ডিং রিকুইজিশনের বিবরণ</p>
        <dl className="space-y-0.5 text-gray">
          <div>
            <dt className="inline">পেন্ডিং পরিমাণ: </dt>
            <dd className="inline text-ink">
              {summary.totalQty} {product.unit}
            </dd>
          </div>
          <div>
            <dt className="inline">সর্বশেষ রিকুইজিশন: </dt>
            <dd className="inline text-ink">{formatBnDate(summary.latestDate)}</dd>
          </div>
          <div>
            <dt className="inline">অনুরোধকারী: </dt>
            <dd className="inline text-ink">{summary.latestRequestedByName}</dd>
          </div>
          <div>
            <dt className="inline">মোট পেন্ডিং অনুরোধ: </dt>
            <dd className="inline text-ink">{product.pendingRequisitionCount}</dd>
          </div>
        </dl>
      </TooltipContent>
    </Tooltip>
  );
}

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
  const [requisitionFilter, setRequisitionFilter] = useState<RequisitionFilter>("all");
  const canEdit = useHasRole(MANAGE_CATALOG_ROLES);

  const pendingProductCount = useMemo(
    () => products.filter((p) => p.pendingRequisitionCount > 0).length,
    [products],
  );

  const filteredProducts = useMemo(() => {
    if (requisitionFilter === "pending") return products.filter((p) => p.pendingRequisitionCount > 0);
    if (requisitionFilter === "none") return products.filter((p) => p.pendingRequisitionCount === 0);
    return products;
  }, [products, requisitionFilter]);

  return (
    <TooltipProvider delayDuration={200}>
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
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2 sm:px-4 lg:px-[18px]">
              {pendingProductCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setRequisitionFilter("pending")}
                  className="flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-left text-[11px] text-orange-700 transition hover:bg-orange-100 sm:text-xs"
                >
                  <Bell className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    <span className="font-semibold">পেন্ডিং রিকুইজিশন</span> — {pendingProductCount} টি প্রোডাক্ট
                    অপেক্ষমান
                  </span>
                </button>
              ) : (
                <span className="text-[11px] text-gray sm:text-xs">কোনো পেন্ডিং রিকুইজিশন নেই</span>
              )}

              <Select
                value={requisitionFilter}
                onValueChange={(v) => setRequisitionFilter(v as RequisitionFilter)}
              >
                <SelectTrigger className="h-8 w-auto min-w-[9.5rem] text-[11px] sm:text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব প্রোডাক্ট</SelectItem>
                  <SelectItem value="pending">শুধু পেন্ডিং</SelectItem>
                  <SelectItem value="none">পেন্ডিং নেই</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredProducts.length === 0 ? (
              <EmptyState title="কোনো প্রোডাক্ট পাওয়া যায়নি" description="এই ফিল্টারে কোনো প্রোডাক্ট নেই।" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>প্রোডাক্ট</TableHead>
                    <TableHead>দাম</TableHead>
                    <TableHead>রেটিং</TableHead>
                    {/* <TableHead>রিকুইজিশন</TableHead> */}
                    <TableHead>সর্বশেষ আপডেট</TableHead>
                    {canEdit && <TableHead />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((p) => (
                    <TableRow
                      key={p.id}
                      className={
                        p.pendingRequisitionCount > 0 ? "border-l-2 border-l-orange-400 bg-orange-50/50" : undefined
                      }
                    >
                      <TableCell className="text-sm md:text-base lg:text-lg xl:text-xl">
                        <span className="flex flex-wrap items-center gap-1.5">
                          {p.productName}
                          <PendingRequisitionBadge product={p} />
                        </span>
                      </TableCell>
                      <TableCell>
                        <PriceCell amount={p.price} lowest={p.isLowestForProduct} />
                      </TableCell>
                      <TableCell>
                        <StarRating value={p.rating} />
                      </TableCell>
                      {/* <TableCell>
                        {p.pendingRequisitionCount > 0 ? (
                          <PendingRequisitionBadge product={p} />
                        ) : (
                          <Badge variant="active">পেন্ডিং নেই</Badge>
                        )}
                      </TableCell> */}
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
                                className="relative"
                                onClick={() => setEditingId(p.id)}
                              >
                                <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                                {p.pendingRequisitionCount > 0 && (
                                  <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-orange-500" />
                                )}
                              </Button>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>দাম ও রেটিং এডিট করুন</DialogTitle>
                                  <DialogDescription>
                                    এই ভেন্ডরের জন্য শুধু দাম ও রেটিং পরিবর্তন হবে — প্রোডাক্টের নাম/ইউনিট/ক্যাটাগরি
                                    প্রোডাক্ট তালিকা পাতা থেকে এডিট করুন।
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
          </>
        )}
      </Card>
    </TooltipProvider>
  );
}
