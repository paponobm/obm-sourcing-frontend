import {
  LayoutDashboard,
  Store,
  Package,
  ClipboardList,
  Tags,
  Scale,
  Activity,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "./routes";

export type NavItemConfig = {
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
  /** Shows a live count badge (currently only the pending-requisitions count) beside the label. */
  badge?: "pendingRequisitions";
};

/**
 * Mirrors the sidebar nav-item list from the source mockup, in the same order:
 * ড্যাশবোর্ড, ভেন্ডর তালিকা, প্রোডাক্ট তালিকা, প্রাইস কম্পেয়ার, অ্যাক্টিভিটি লগ, ইউজার ম্যানেজমেন্ট
 */
export const NAV_ITEMS: NavItemConfig[] = [
  {
    label: "ড্যাশবোর্ড",
    href: ROUTES.dashboard,
    icon: LayoutDashboard,
    isActive: (p) => p.startsWith(ROUTES.dashboard),
  },
  {
    label: "ভেন্ডর তালিকা",
    href: ROUTES.vendors,
    icon: Store,
    isActive: (p) => p.startsWith(ROUTES.vendors),
  },
  {
    label: "প্রোডাক্ট তালিকা",
    href: ROUTES.products,
    icon: Package,
    isActive: (p) => p === ROUTES.products,
  },
  {
    label: "রিকুইজিশন",
    href: ROUTES.requisitions,
    icon: ClipboardList,
    isActive: (p) => p.startsWith(ROUTES.requisitions),
    badge: "pendingRequisitions",
  },
  {
    label: "প্রাইস কম্পেয়ার",
    href: ROUTES.productsCompareAll,
    icon: Scale,
    isActive: (p) => p.startsWith(ROUTES.productsCompareAll),
  },
  {
    label: "প্রোডাক্ট ক্যাটাগরি",
    href: ROUTES.categories,
    icon: Tags,
    isActive: (p) => p.startsWith(ROUTES.categories),
  },
  {
    label: "অ্যাক্টিভিটি লগ",
    href: ROUTES.activityLogs,
    icon: Activity,
    isActive: (p) => p.startsWith(ROUTES.activityLogs),
  },
  {
    label: "ইউজার ম্যানেজমেন্ট",
    href: ROUTES.users,
    icon: Users,
    isActive: (p) => p.startsWith(ROUTES.users),
  },
];
