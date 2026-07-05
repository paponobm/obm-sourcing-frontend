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
