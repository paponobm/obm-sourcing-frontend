"use client";

import { useState } from "react";
import { Eye, Check, X, RefreshCw, Loader2, History } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Avatar } from "@/components/shared/Avatar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Pagination } from "@/components/shared/Pagination";
import { ViewPendingProductModal } from "./ViewPendingProductModal";
import { ApproveProductModal } from "./ApproveProductModal";
import { RejectProductModal } from "./RejectProductModal";
import { WordpressSyncLogModal } from "./WordpressSyncLogModal";
import { usePendingProducts } from "@/hooks/useProducts";
import { useWordpressSync, useWordpressSyncStatus } from "@/hooks/useWordpress";
import { useHasRole } from "@/hooks/useHasRole";
import { SUPER_ADMIN_ONLY } from "@/constants/roles";
import { PRODUCT_STATUS_LABEL_BN, productStatusBadgeVariant } from "@/utils/status";
import { formatBnDate, formatBnTime, toBnDigits } from "@/utils/date";
import type { PendingProduct } from "@/types/product.types";

const PAGE_SIZE = 10;

export function PendingProductsSection() {
  const { data: products, isLoading } = usePendingProducts();
  const canReview = useHasRole(SUPER_ADMIN_ONLY);
  const { data: syncStatus } = useWordpressSyncStatus({ enabled: canReview });
  const wordpressSync = useWordpressSync();
  const [viewingProduct, setViewingProduct] = useState<PendingProduct | null>(null);
  const [approvingProduct, setApprovingProduct] = useState<PendingProduct | null>(null);
  const [rejectingProduct, setRejectingProduct] = useState<PendingProduct | null>(null);
  const [syncLogOpen, setSyncLogOpen] = useState(false);
  const [page, setPage] = useState(1);

  const total = products?.length ?? 0;
  const pagedProducts = products?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const syncActions = canReview && (
    <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:gap-3">
      <div className="text-left text-[11px] leading-tight text-gray sm:text-xs">
        <div>Last Sync:</div>
        <div className="font-semibold text-ink">
          {syncStatus?.lastSyncedAt ? (
            <>
              {formatBnDate(syncStatus.lastSyncedAt)}
              <br />
              {formatBnTime(syncStatus.lastSyncedAt)}
            </>
          ) : (
            "Never"
          )}
        </div>
      </div>
      {/* <div className="flex items-center gap-1.5 sm:gap-2">
        <Button type="button" variant="brass" disabled={wordpressSync.isPending} onClick={() => wordpressSync.mutate()}>
          {wordpressSync.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          )}
          ওয়ার্ডপ্রেস থেকে প্রোডাক্ট আনুন
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="সিঙ্ক অ্যাক্টিভিটি লগ"
          onClick={() => setSyncLogOpen(true)}
        >
          <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div> */}
    </div>
  );

  if (isLoading) {
    return (
      <div>
        <Topbar title="পেন্ডিং প্রোডাক্ট" actions={syncActions} />
        <Skeleton className="h-72 w-full" />
        <WordpressSyncLogModal open={syncLogOpen} onOpenChange={setSyncLogOpen} />
      </div>
    );
  }

  if ((products?.length ?? 0) === 0) {
    return (
      <>
        <Topbar title="পেন্ডিং প্রোডাক্ট" actions={syncActions} />
        <Card>
          <EmptyState
            title="কোনো পেন্ডিং প্রোডাক্ট নেই"
            description="ম্যানেজার নতুন প্রোডাক্ট তৈরি করলে সেটি এখানে অনুমোদনের অপেক্ষায় দেখাবে, অথবা WordPress থেকে সিঙ্ক করুন।"
          />
        </Card>
        <WordpressSyncLogModal open={syncLogOpen} onOpenChange={setSyncLogOpen} />
      </>
    );
  }

  return (
    <>
      <Topbar title={`পেন্ডিং প্রোডাক্ট (${toBnDigits(total)})`} actions={syncActions} />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center">ক্রমিক</TableHead>
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
            {pagedProducts?.map((p, index) => (
              <TableRow key={p.id}>
                <TableCell className="text-center font-mono text-gray">
                  {toBnDigits((page - 1) * PAGE_SIZE + index + 1)}
                </TableCell>
                <TableCell className="text-sm md:text-base lg:text-lg xl:text-xl">
                  <span className="flex items-center">
                    <Avatar initials={p.name.slice(0, 2)} imageUrl={p.thumbnailUrl} />
                    {p.name}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-[11px] sm:text-xs lg:text-sm">{p.sku ?? "—"}</TableCell>
                <TableCell>{p.categories.length > 0 ? p.categories.map((c) => c.name).join(", ") : "—"}</TableCell>
                <TableCell className="text-gray">{p.createdByName}</TableCell>
                <TableCell className="text-gray">{formatBnDate(p.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant={productStatusBadgeVariant(p.status)}>{PRODUCT_STATUS_LABEL_BN[p.status]}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1.5">
                    {/* <Button type="button" variant="ghost" size="sm" onClick={() => setViewingProduct(p)}>
                      <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                    </Button> */}
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
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
      </Card>

      {/* <ViewPendingProductModal product={viewingProduct} onOpenChange={(open) => !open && setViewingProduct(null)} /> */}
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
      <WordpressSyncLogModal open={syncLogOpen} onOpenChange={setSyncLogOpen} />
    </>
  );
}
