"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarContent } from "./Sidebar";
import { VisuallyHidden } from "@/components/shared/VisuallyHidden";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="মেনু খুলুন"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-white text-teal-dark md:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>
      <SheetContent side="left" className="w-[210px] max-w-[210px] bg-teal-dark p-[14px] py-[18px]">
        <VisuallyHidden>
          <SheetTitle>নেভিগেশন মেনু</SheetTitle>
        </VisuallyHidden>
        <div onClick={() => setOpen(false)}>
          <SidebarContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}
