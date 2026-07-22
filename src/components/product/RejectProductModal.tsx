"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ActionButtons } from "@/components/forms/ActionButtons";
import { useRejectProduct } from "@/hooks/useProducts";
import type { PendingProduct } from "@/types/product.types";

export function RejectProductModal({
  product,
  onOpenChange,
  onSuccess,
}: {
  product: PendingProduct | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const rejectProduct = useRejectProduct();
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (product) {
      setReason("");
      setTouched(false);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!product || !reason.trim()) return;
    await rejectProduct.mutateAsync({ id: product.id, input: { reason: reason.trim() } });
    onSuccess();
  };

  return (
    <Dialog open={Boolean(product)} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>প্রোডাক্ট প্রত্যাখ্যান করুন</DialogTitle>
          <DialogDescription>&quot;{product?.name}&quot; প্রত্যাখ্যানের কারণ জানান।</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          <div>
            <Label htmlFor="reject-reason">কারণ</Label>
            <Textarea
              id="reject-reason"
              placeholder="যেমন: ছবি অস্পষ্ট, SKU ভুল ইত্যাদি"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              invalid={touched && !reason.trim()}
            />
            {touched && !reason.trim() && <p className="mt-1 text-[11px] text-red sm:text-xs">কারণ আবশ্যক</p>}
          </div>

          <ActionButtons
            onCancel={() => onOpenChange(false)}
            isPending={rejectProduct.isPending}
            disabled={touched && !reason.trim()}
            savingLabel="প্রত্যাখ্যান হচ্ছে..."
            saveLabel="প্রত্যাখ্যান করুন"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
