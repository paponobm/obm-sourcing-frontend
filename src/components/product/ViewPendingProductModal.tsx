"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { PendingProduct } from "@/types/product.types";

export function ViewPendingProductModal({
  product,
  onOpenChange,
}: {
  product: PendingProduct | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={Boolean(product)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{product?.name}</DialogTitle>
          <DialogDescription>অনুমোদনের অপেক্ষায় থাকা প্রোডাক্টের বিবরণ</DialogDescription>
        </DialogHeader>
        {product && (
          <div className="space-y-3 text-sm">
            {product.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.thumbnailUrl}
                alt={product.name}
                className="h-40 w-full rounded-md object-cover"
              />
            )}
            <div className="grid grid-cols-2 gap-x-3.5 gap-y-2">
              <div>
                <div className="text-xs text-gray">SKU</div>
                <div className="font-mono">{product.sku}</div>
              </div>
              <div>
                <div className="text-xs text-gray">ইউনিট</div>
                <div>{product.unit}</div>
              </div>
              <div>
                <div className="text-xs text-gray">ক্যাটাগরি</div>
                <div>{product.categories.map((c) => c.name).join(", ")}</div>
              </div>
              <div>
                <div className="text-xs text-gray">তৈরি করেছেন</div>
                <div>{product.createdByName}</div>
              </div>
            </div>
            {product.description && (
              <div>
                <div className="mb-1 text-xs text-gray">বিবরণ</div>
                <p className="whitespace-pre-line">{product.description}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
