"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePendingRequisitionsCount } from "@/hooks/useRequisitions";
import { usePendingProductsCount } from "@/hooks/useProducts";
import { useHasRole } from "@/hooks/useHasRole";
import { toBnDigits } from "@/utils/date";
import type { NavItemConfig } from "@/constants/nav";

export function NavItem({ item, collapsed = false }: { item: NavItemConfig; collapsed?: boolean }) {
  const pathname = usePathname();
  const active = item.isActive(pathname);
  const Icon = item.icon;
  // The pending-products approval queue is Super Admin-only server-side —
  // Manager/Viewer never fetch it here, same as they never see that tab.
  const isSuperAdmin = useHasRole(["SUPER_ADMIN"]);

  // Each of these queries stays disabled (no network call) for every other
  // nav item — and dedupes against whichever component is currently viewing
  // that same pending list, since it's the same query key.
  const { data: pendingRequisitionsCount } = usePendingRequisitionsCount({
    enabled: item.badge === "pendingRequisitions",
  });
  const { data: pendingProductsCount } = usePendingProductsCount({
    enabled: item.badge === "pendingProducts" && isSuperAdmin,
  });
  const count =
    item.badge === "pendingRequisitions"
      ? pendingRequisitionsCount
      : item.badge === "pendingProducts"
        ? pendingProductsCount
        : undefined;

  return (
    <Link
      href={item.href}
      // className={cn(

      //   "group relative mb-[2px] flex items-center rounded-[5px] py-2 text-xs font-medium text-[#B9CDCE] transition-colors sm:py-[9px] sm:text-[0.8125rem] lg:text-sm",
      //   collapsed ? "justify-center px-2" : "gap-2 px-2 sm:gap-[9px] sm:px-[10px]",
      //   active ? "bg-white/[0.08] text-white" : "hover:bg-white/[0.05] hover:text-white",
      // )}
      className={cn(

        "group relative mb-[12px] flex items-center rounded-[5px] py-2 text-xs font-medium text-[#B9CDCE] transition-colors sm:py-[9px] sm:text-[0.8125rem] lg:text-sm",
        collapsed ? "justify-center px-2" : "gap-2 px-2 sm:gap-[9px] sm:px-[10px]",
        active ? "bg-white/[0.08] text-white" : "hover:bg-white/[0.05] hover:text-white",
      )}
    >
      <span className="relative shrink-0">
        <Icon className="h-4.5 w-4.5 opacity-85 sm:h-[15px] sm:w-[15px] lg:h-4 lg:w-4" />
        {collapsed && Boolean(count) && (
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-brass" />
        )}
      </span>
      {collapsed ? (
        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-teal-dark px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-panel transition-opacity duration-150 group-hover:opacity-100">
          {item.label}
          {Boolean(count) && ` (${toBnDigits(count ?? 0)})`}
        </span>
      ) : (
        <>
          <span>{item.label}</span>
          {Boolean(count) && (
            // <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-brass px-1 text-[10px] font-bold text-white sm:h-[18px] sm:min-w-[18px] sm:text-[11px]">
            //   {count}
            // </span>
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brass px-1 font-mono text-xs font-bold text-white sm:h-[18px] sm:min-w-[18px] sm:text-[11px]">
              {toBnDigits(count ?? 0)}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
