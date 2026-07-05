export type Product = {
  id: string;
  name: string;
  unit: string;
  category?: string;
  vendorCount: number;
  lowestPrice: number;
  createdAt: string;
};

export type PriceComparisonRow = {
  rank: number;
  vendorId: string;
  vendorName: string;
  price: number;
  isLowest: boolean;
  lastUpdatedAt: string;
};

export type PriceComparison = {
  productId: string;
  productName: string;
  unit: string;
  rows: PriceComparisonRow[];
};

export type CreateProductInput = {
  name: string;
  unit: string;
  category?: string;
};
