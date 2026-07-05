import {
  LayoutDashboard,
  Store,
  Package,
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
};

/**
 * Mirrors the sidebar nav-item list from the source mockup, in the same order:
 * ড্যাশবোর্ড, ভেন্ডর তালিকা, প্রোডাক্ট তালিকা, প্রাইস কম্পেয়ার, অ্যাক্টিভিটি লগ, ইউজার ম্যানেজমেন্ট
 *
 * Product List and Price Compare both land on /products for now (the product
 * list is the entry point into a per-product comparison view); their active
 * states are disambiguated by whether the path has drilled into /compare.
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
    isActive: (p) => p.startsWith(ROUTES.products) && !p.includes("/compare"),
  },
  {
    label: "প্রাইস কম্পেয়ার",
    href: ROUTES.products,
    icon: Scale,
    isActive: (p) => p.includes("/compare"),
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
