"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItemConfig } from "@/constants/nav";

export function NavItem({ item, collapsed = false }: { item: NavItemConfig; collapsed?: boolean }) {
  const pathname = usePathname();
  const active = item.isActive(pathname);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative mb-[2px] flex items-center rounded-[5px] py-2 text-xs font-medium text-[#B9CDCE] transition-colors sm:py-[9px] sm:text-[0.8125rem] lg:text-sm",
        collapsed ? "justify-center px-2" : "gap-2 px-2 sm:gap-[9px] sm:px-[10px]",
        active ? "bg-white/[0.08] text-white" : "hover:bg-white/[0.05] hover:text-white",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-85 sm:h-[15px] sm:w-[15px] lg:h-4 lg:w-4" />
      {collapsed ? (
        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-teal-dark px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-panel transition-opacity duration-150 group-hover:opacity-100">
          {item.label}
        </span>
      ) : (
        <span>{item.label}</span>
      )}
    </Link>
  );
}
