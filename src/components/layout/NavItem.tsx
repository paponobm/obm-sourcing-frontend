"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItemConfig } from "@/constants/nav";

export function NavItem({ item }: { item: NavItemConfig }) {
  const pathname = usePathname();
  const active = item.isActive(pathname);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "mb-[2px] flex items-center gap-[9px] rounded-[5px] px-[10px] py-[9px] text-[13px] font-medium text-[#B9CDCE] transition-colors",
        active ? "bg-white/[0.08] text-white" : "hover:bg-white/[0.05] hover:text-white",
      )}
    >
      <Icon className="w-[15px] shrink-0 opacity-85" size={14} />
      <span>{item.label}</span>
    </Link>
  );
}
