"use client";

import { useState } from "react";
import { Eye, Check, X } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Avatar } from "@/components/shared/Avatar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ViewPendingProductModal } from "./ViewPendingProductModal";
import { ApproveProductModal } from "./ApproveProductModal";
import { RejectProductModal } from "./RejectProductModal";
import { usePendingProducts } from "@/hooks/useProducts";
import { useHasRole } from "@/hooks/useHasRole";
import { SUPER_ADMIN_ONLY } from "@/constants/roles";
import { PRODUCT_STATUS_LABEL_BN, productStatusBadgeVariant } from "@/utils/status";
import { formatBnDate } from "@/utils/date";
import type { PendingProduct } from "@/types/product.types";

export function PendingProductsSection() {
  const { data: products, isLoading } = usePendingProducts();
  const canReview = useHasRole(SUPER_ADMIN_ONLY);
  const [viewingProduct, setViewingProduct] = useState<PendingProduct | null>(null);
  const [approvingProduct, setApprovingProduct] = useState<PendingProduct | null>(null);
  const [rejectingProduct, setRejectingProduct] = useState<PendingProduct | null>(null);

  if (isLoading) {
    return (
      <div>
        <Topbar title="পেন্ডিং প্রোডাক্ট" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if ((products?.length ?? 0) === 0) {
    return (
      <>
        <Topbar title="পেন্ডিং প্রোডাক্ট" />
        <Card>
          <EmptyState
            title="কোনো পেন্ডিং প্রোডাক্ট নেই"
            description="ম্যানেজার নতুন প্রোডাক্ট তৈরি করলে সেটি এখানে অনুমোদনের অপেক্ষায় দেখাবে।"
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <Topbar title={`পেন্ডিং প্রোডাক্ট (${products?.length ?? 0})`} />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>প্রোডাক্ট</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>ক্যাটাগরি</TableHead>
              <TableHead>তৈরি করেছেন</TableHead>
              <TableHead>তৈরির তারিখ</TableHead>
              <TableHead>স্ট্যাটাস</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="text-sm md:text-base lg:text-lg xl:text-xl">
                  <span className="flex items-center">
                    <Avatar initials={p.name.slice(0, 2)} imageUrl={p.thumbnailUrl} />
                    {p.name}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-[11px] sm:text-xs lg:text-sm">{p.sku}</TableCell>
                <TableCell>{p.categoryName}</TableCell>
                <TableCell className="text-gray">{p.createdByName}</TableCell>
                <TableCell className="text-gray">{formatBnDate(p.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant={productStatusBadgeVariant(p.status)}>{PRODUCT_STATUS_LABEL_BN[p.status]}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1.5">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setViewingProduct(p)}>
                      <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                    </Button>
                    {canReview && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setApprovingProduct(p)}
                        >
                          <Check className="h-3 w-3 text-teal sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setRejectingProduct(p)}
                        >
                          <X className="h-3 w-3 text-red sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <ViewPendingProductModal product={viewingProduct} onOpenChange={(open) => !open && setViewingProduct(null)} />
      <ApproveProductModal
        product={approvingProduct}
        onOpenChange={(open) => !open && setApprovingProduct(null)}
        onSuccess={() => setApprovingProduct(null)}
      />
      <RejectProductModal
        product={rejectingProduct}
        onOpenChange={(open) => !open && setRejectingProduct(null)}
        onSuccess={() => setRejectingProduct(null)}
      />
    </>
  );
}
