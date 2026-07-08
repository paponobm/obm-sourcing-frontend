"use client";

import { ChevronsUpDown, LogOut, Menu, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { NAV_ITEMS } from "@/constants/nav";
import { ROUTES } from "@/constants/routes";
import { ROLE_LABEL_BN } from "@/constants/roles";
import { NavItem } from "./NavItem";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SidebarContent({
  collapsed = false,
  onToggleCollapse,
}: {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="flex h-full flex-col text-[#CFE1E2]">
      <div
        className={cn(
          "mb-3 flex items-center border-b border-white/10 pb-3 sm:mb-3.5 sm:pb-4",
          collapsed ? "justify-center" : "justify-between gap-2",
        )}
      >
        <div className="flex min-w-0 items-center gap-2 font-serif text-sm text-white sm:gap-[9px] sm:text-base lg:text-lg">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brass font-sans text-xs font-bold text-[#2B1E08] sm:h-[26px] sm:w-[26px] sm:text-[0.8125rem] lg:h-8 lg:w-8 lg:text-sm">
            OS
          </span>
          {!collapsed && <span className="truncate">OBM সোর্সিং</span>}
        </div>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "সাইডবার প্রসারিত করুন" : "সাইডবার সংকুচিত করুন"}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#B9CDCE] transition-colors hover:bg-white/10 hover:text-white"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href + item.label} item={item} collapsed={collapsed} />
        ))}
      </nav>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "mt-3 flex w-full items-center border-t border-white/10 pt-3 text-left text-[0.625rem] text-[#88a3a4] sm:mt-4 sm:pt-[14px] sm:text-[0.6875rem] lg:text-xs",
              collapsed ? "justify-center" : "justify-between",
            )}
          >
            {!collapsed && (
              <span className="min-w-0 truncate">
                <b className="block truncate text-xs text-[#E9D6A9] sm:text-[0.78125rem] lg:text-sm">
                  {user?.name ?? "..."}
                </b>
                {user ? ROLE_LABEL_BN[user.role] : ""}
              </span>
            )}
            <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-70 sm:h-3.5 sm:w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-[190px]">
          <DropdownMenuItem asChild>
            <Link href={ROUTES.profile}>
              <UserRound className="h-4 w-4" /> প্রোফাইল
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={ROUTES.settings}>
              <Settings className="h-4 w-4" /> সেটিংস
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red"
            onSelect={(e) => {
              e.preventDefault();
              logout.mutate();
            }}
          >

            <LogOut className="h-4 w-4" /> লগ আউট
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function Sidebar() {
  const { collapsed, toggle } = useSidebarCollapsed();

  return (
    <aside
      className={cn(
        "shrink-0 overflow-visible bg-teal-dark py-3.5 transition-all duration-300 ease-in-out sm:py-4 lg:py-[18px]",
        collapsed
          ? "w-[72px] px-2"
          : "w-[180px] px-3 sm:w-[194px] sm:px-3.5 lg:w-[210px] lg:px-[14px] xl:w-[232px]",
      )}
    >
      <SidebarContent collapsed={collapsed} onToggleCollapse={toggle} />
    </aside>
  );
}
