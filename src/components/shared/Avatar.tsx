"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Clicking an image avatar (product/vendor/category/courier row thumbnail)
 * opens it zoomed-in over a blurred/dimmed backdrop — closes via the X,
 * clicking outside, or Escape. Initials-only avatars (no imageUrl) have
 * nothing to zoom, so they stay plain and non-interactive as before. */
export function Avatar({
  initials,
  imageUrl,
  className,
}: {
  initials: string;
  imageUrl?: string;
  className?: string;
}) {
  const [zoomed, setZoomed] = useState(false);

  if (imageUrl) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          onClick={(e) => {
            e.stopPropagation();
            setZoomed(true);
          }}
          className={cn(
            "mr-1.5 h-6 w-6 shrink-0 cursor-zoom-in rounded-md border border-line object-cover sm:mr-2 sm:h-7 sm:w-7 lg:mr-2.5 lg:h-[30px] lg:w-[30px]",
            className,
          )}
        />
        <DialogPrimitive.Root open={zoomed} onOpenChange={setZoomed}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-ink/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
            <DialogPrimitive.Content
              onClick={(e) => e.stopPropagation()}
              className="fixed left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            >
              <DialogPrimitive.Title className="sr-only">ছবি</DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">বড় করে দেখানো ছবি</DialogPrimitive.Description>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt=""
                className="max-h-[85vh] max-w-[90vw] rounded-md object-contain shadow-panel"
              />
              <DialogPrimitive.Close className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink shadow-panel">
                <X className="h-4 w-4" />
                <span className="sr-only">বন্ধ করুন</span>
              </DialogPrimitive.Close>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </>
    );
  }

  return (
    <span
      className={cn(
        "mr-1.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-teal font-serif text-[10px] text-white sm:mr-2 sm:h-7 sm:w-7 sm:text-xs lg:mr-2.5 lg:h-[30px] lg:w-[30px] lg:text-xs",
        className,
      )}
    >
      {initials}
    </span>
  );
}
