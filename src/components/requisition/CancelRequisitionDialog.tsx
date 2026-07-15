"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/** Like ConfirmDialog, but for the one action that needs a field (a
 * cancellation reason) rather than just plain confirm text — built on the
 * same underlying AlertDialog primitives. */
export function CancelRequisitionDialog({
  trigger,
  onConfirm,
  isLoading,
}: {
  trigger: React.ReactNode;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setReason("");
      }}
    >
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>রিকুইজিশন বাতিল করবেন?</AlertDialogTitle>
          <AlertDialogDescription>আপনি কি নিশ্চিত এই রিকুইজিশনটি বাতিল করতে চান?</AlertDialogDescription>
        </AlertDialogHeader>

        <div>
          <Label htmlFor="cancel-reason">বাতিলের কারণ</Label>
          <Textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="কারণ লিখুন..."
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>বাতিল</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isLoading || !reason.trim()}>
            {isLoading ? "বাতিল করা হচ্ছে..." : "নিশ্চিত বাতিল করুন"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
