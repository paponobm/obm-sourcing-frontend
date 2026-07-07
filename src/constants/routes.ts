export const ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  vendors: "/vendors",
  vendorNew: "/vendors/new",
  vendorDetail: (id: string) => `/vendors/${id}`,
  products: "/products",
  productsCompareAll: "/products/compare",
  categories: "/categories",
  activityLogs: "/activity-logs",
  users: "/users",
  settings: "/settings",
  profile: "/profile",
} as const;
