import type { Vendor, VendorWithProducts, CreateVendorInput } from "@/types/vendor.types";
import type { Product, PriceComparison } from "@/types/product.types";
import type { DashboardStats, RecentPriceUpdate } from "@/types/dashboard.types";
import type { ActivityLog } from "@/types/activity.types";
import type { User } from "@/types/user.types";

/**
 * Single source of truth for mock data across the app.
 * Every service reads from here — never hardcode data inside components.
 * Swapping to the real API later means only the services change, not this file's consumers.
 */

export const MOCK_CURRENT_USER: User = {
  id: "u-1",
  name: "রুবেল হোসেন",
  phone: "01711-000001",
  email: "rubel@obm.internal",
  role: "SUPER_ADMIN",
  avatarInitial: "রু",
  status: "ACTIVE",
  createdAt: "2025-01-10T00:00:00.000Z",
};

export const MOCK_USERS: User[] = [
  MOCK_CURRENT_USER,
  {
    id: "u-2",
    name: "নাদিয়া আক্তার",
    phone: "01911-000002",
    email: "nadia@obm.internal",
    role: "MANAGER",
    avatarInitial: "না",
    status: "ACTIVE",
    createdAt: "2025-02-14T00:00:00.000Z",
  },
  {
    id: "u-3",
    name: "ইমরান খান",
    phone: "01511-000003",
    email: "imran@obm.internal",
    role: "VIEWER",
    avatarInitial: "ই",
    status: "INACTIVE",
    createdAt: "2025-03-02T00:00:00.000Z",
  },
];

export const MOCK_VENDORS: Vendor[] = [
  {
    id: "vn-0032",
    vendorCode: "VN-0032",
    shopName: "মেঘনা ট্রেডার্স",
    address: "চকবাজার, চট্টগ্রাম",
    contactPerson: "মো. কামাল",
    phone: "01812-XXXXXX",
    whatsapp: "01812-XXXXXX",
    status: "ACTIVE",
    productCount: 38,
    note: "শুক্রবার বন্ধ থাকে, অগ্রিম পেমেন্ট লাগে",
    createdAt: "2025-04-01T00:00:00.000Z",
  },
  {
    id: "vn-0033",
    vendorCode: "VN-0033",
    shopName: "এরাবিয়ান ফুড হাউজ",
    address: "আজিজিয়া, চট্টগ্রাম",
    contactPerson: "মো. ফারুক",
    phone: "01919-XXXXXX",
    whatsapp: "01919-XXXXXX",
    status: "ACTIVE",
    productCount: 52,
    createdAt: "2025-04-03T00:00:00.000Z",
  },
  {
    id: "vn-0034",
    vendorCode: "VN-0034",
    shopName: "রাজধানী বাজার",
    address: "সৌদি মার্কেট",
    contactPerson: "মো. রাজু",
    phone: "01711-XXXXXX",
    whatsapp: "01711-XXXXXX",
    status: "ACTIVE",
    productCount: 29,
    createdAt: "2025-04-10T00:00:00.000Z",
  },
  {
    id: "vn-0035",
    vendorCode: "VN-0035",
    shopName: "নাফ নদী সাপ্লায়",
    address: "চকবাজার, চট্টগ্রাম",
    contactPerson: "মো. সেলিম",
    phone: "01611-XXXXXX",
    whatsapp: "01611-XXXXXX",
    status: "INACTIVE",
    productCount: 17,
    createdAt: "2025-04-12T00:00:00.000Z",
  },
  {
    id: "vn-0036",
    vendorCode: "VN-0036",
    shopName: "সৌদি-মার্টিন শুকতি ঘর",
    address: "সৌদি মার্কেট",
    contactPerson: "মো. ইউসুফ",
    phone: "01511-XXXXXX",
    whatsapp: "01511-XXXXXX",
    status: "ACTIVE",
    productCount: 44,
    createdAt: "2025-04-15T00:00:00.000Z",
  },
];

export const MOCK_VENDOR_PRODUCTS: Record<string, VendorWithProducts["products"]> = {
  "vn-0032": [
    {
      id: "vp-1",
      productId: "p-alfayar",
      productName: "আলফায়ার (শুকনা)",
      unit: "কেজি",
      price: 112,
      isLowestForProduct: true,
      lastUpdatedAt: "2026-06-29T00:00:00.000Z",
    },
    {
      id: "vp-2",
      productId: "p-lokkha-shutki",
      productName: "লক্ষ্যা শুটকি",
      unit: "কেজি",
      price: 132,
      isLowestForProduct: false,
      lastUpdatedAt: "2026-06-27T00:00:00.000Z",
    },
    {
      id: "vp-3",
      productId: "p-churi-shutki",
      productName: "চুরি শুটকি",
      unit: "কেজি",
      price: 155,
      isLowestForProduct: false,
      lastUpdatedAt: "2026-06-20T00:00:00.000Z",
    },
    {
      id: "vp-4",
      productId: "p-shutki-bharta",
      productName: "শুটকি ভর্তা মিক্স",
      unit: "প্যাকেট",
      price: 48,
      isLowestForProduct: false,
      lastUpdatedAt: "2026-06-18T00:00:00.000Z",
    },
  ],
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p-alfayar",
    name: "আলফায়ার (শুকনা)",
    unit: "কেজি",
    category: "শুটকি",
    vendorCount: 3,
    lowestPrice: 112,
    createdAt: "2025-04-01T00:00:00.000Z",
  },
  {
    id: "p-lokkha-shutki",
    name: "লক্ষ্যা শুটকি",
    unit: "কেজি",
    category: "শুটকি",
    vendorCount: 2,
    lowestPrice: 132,
    createdAt: "2025-04-02T00:00:00.000Z",
  },
  {
    id: "p-shutki-bharta",
    name: "শুটকি ভর্তা মিক্স",
    unit: "প্যাকেট",
    category: "রেডি মিক্স",
    vendorCount: 2,
    lowestPrice: 45,
    createdAt: "2025-04-05T00:00:00.000Z",
  },
];

export const MOCK_PRICE_COMPARISONS: Record<string, PriceComparison> = {
  "p-alfayar": {
    productId: "p-alfayar",
    productName: "আলফায়ার (শুকনা)",
    unit: "কেজি",
    rows: [
      {
        rank: 1,
        vendorId: "vn-0032",
        vendorName: "মেঘনা ট্রেডার্স",
        price: 112,
        isLowest: true,
        lastUpdatedAt: "2026-06-29T00:00:00.000Z",
      },
      {
        rank: 2,
        vendorId: "vn-0033",
        vendorName: "এরাবিয়ান ফুড হাউজ",
        price: 113,
        isLowest: false,
        lastUpdatedAt: "2026-06-25T00:00:00.000Z",
      },
      {
        rank: 3,
        vendorId: "vn-0034",
        vendorName: "রাজধানী বাজার",
        price: 114,
        isLowest: false,
        lastUpdatedAt: "2026-06-20T00:00:00.000Z",
      },
    ],
  },
};

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalVendors: 52,
  activeVendors: 48,
  totalProducts: 467,
  newProductsThisWeek: 5,
  priceUpdatesToday: 13,
  priceUpdatesFromVendorsCount: 3,
  priceDiscrepancyCount: 21,
};

export const MOCK_RECENT_PRICE_UPDATES: RecentPriceUpdate[] = [
  {
    id: "rpu-1",
    productName: "আলফায়ার (শুকনা)",
    vendorName: "মেঘনা ট্রেডার্স",
    newPrice: 112,
    status: "LOWEST",
  },
  {
    id: "rpu-2",
    productName: "শুটকি ভর্তা মিক্স",
    vendorName: "এরাবিয়ান ফুড হাউজ",
    newPrice: 45,
    status: "UPDATED",
  },
  {
    id: "rpu-3",
    productName: "শিদল",
    vendorName: "রাজধানী বাজার",
    newPrice: 38,
    status: "UPDATED",
  },
];

export const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "act-1",
    actorName: "নাদিয়া",
    action: "আলফায়ারের দাম আপডেট করেছেন",
    targetType: "PRODUCT",
    targetLabel: "আলফায়ার (শুকনা)",
    createdAt: "2026-07-05T09:48:00.000Z",
  },
  {
    id: "act-2",
    actorName: "রুবেল",
    action: "নতুন ভেন্ডর যোগ করেছেন",
    targetType: "VENDOR",
    targetLabel: "সৌদি-মার্টিন শুটকি ঘর",
    createdAt: "2026-07-05T09:00:00.000Z",
  },
  {
    id: "act-3",
    actorName: "ইমরান",
    action: "২টি প্রোডাক্ট আপডেট করেছেন",
    targetType: "PRODUCT",
    createdAt: "2026-07-04T14:00:00.000Z",
  },
];

export function getVendorWithProducts(vendorId: string): VendorWithProducts | undefined {
  const vendor = MOCK_VENDORS.find((v) => v.id === vendorId);
  if (!vendor) return undefined;
  return {
    ...vendor,
    products: MOCK_VENDOR_PRODUCTS[vendorId] ?? [],
  };
}

export function createMockVendor(input: CreateVendorInput): Vendor {
  return {
    id: `vn-${Math.floor(Math.random() * 9000 + 1000)}`,
    vendorCode: `VN-${Math.floor(Math.random() * 9000 + 1000)}`,
    shopName: input.shopName,
    address: input.address,
    contactPerson: input.contactPerson,
    phone: input.phone,
    whatsapp: input.whatsapp,
    note: input.note,
    status: "ACTIVE",
    productCount: 0,
    createdAt: new Date().toISOString(),
  };
}
