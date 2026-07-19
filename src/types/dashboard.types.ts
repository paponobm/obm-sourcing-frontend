export type DashboardStats = {
  totalVendors: number;
  activeVendors: number;
  totalProducts: number;
  newProductsThisWeek: number;
  priceUpdatesToday: number;
  priceUpdatesFromVendorsCount: number;
  priceDiscrepancyCount: number;
};

export type RecentPriceUpdate = {
  id: string;
  productName: string;
  vendorName: string;
  newPrice: number;
  status: "UPDATED" | "LOWEST";
};

export type ProductStatsFilters = {
  dateFrom?: string;
  dateTo?: string;
  categoryId?: string;
  status?: "ACTIVE" | "INACTIVE";
};

export type ProductStats = {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
};

export type VendorStatsFilters = {
  dateFrom?: string;
  dateTo?: string;
  status?: "ACTIVE" | "INACTIVE";
};

export type VendorStats = {
  totalVendors: number;
  activeVendors: number;
  inactiveVendors: number;
  monthlyActiveSuppliers: number;
};

export type OrderStatsFilters = {
  dateFrom?: string;
  dateTo?: string;
  vendorId?: string;
  status?: string;
};
