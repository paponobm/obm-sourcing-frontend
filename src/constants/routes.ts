export const ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  vendors: "/vendors",
  vendorNew: "/vendors/new",
  vendorDetail: (id: string) => `/vendors/${id}`,
  products: "/products",
  priceCompare: (productId: string) => `/products/${productId}/compare`,
  activityLogs: "/activity-logs",
  users: "/users",
  settings: "/settings",
  profile: "/profile",
} as const;
