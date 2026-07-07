"use client";

import { ChevronsUpDown, LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { NAV_ITEMS } from "@/constants/nav";
import { ROUTES } from "@/constants/routes";
import { ROLE_LABEL_BN } from "@/constants/roles";
import { NavItem } from "./NavItem";
import { useCurrentUser, useLogout } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SidebarContent() {
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <div className="flex h-full flex-col text-[#CFE1E2]">
      <div className="mb-[14px] flex items-center gap-[9px] border-b border-white/10 pb-4 font-serif text-[0.9375rem] text-white">
        <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] bg-brass font-sans text-[0.8125rem] font-bold text-[#2B1E08]">
          OS
        </span>
        OBM সোর্সিং
      </div>

      <nav className="flex-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href + item.label} item={item} />
        ))}
      </nav>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="mt-4 flex w-full items-center justify-between border-t border-white/10 pt-[14px] text-left text-[0.6875rem] text-[#88a3a4]">
            <span>
              <b className="block text-[0.78125rem] text-[#E9D6A9]">{user?.name ?? "..."}</b>
              {user ? ROLE_LABEL_BN[user.role] : ""}
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
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
  return (
    <aside className="w-[210px] shrink-0 bg-teal-dark px-[14px] py-[18px]">
      <SidebarContent />
    </aside>
  );
}
