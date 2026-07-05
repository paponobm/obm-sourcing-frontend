export type VendorStatus = "ACTIVE" | "INACTIVE";

export type SortDirection = "asc" | "desc";

export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type SortParams<TColumn extends string = string> = {
  column: TColumn;
  direction: SortDirection;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ApiError = {
  statusCode: number;
  message: string;
  error?: string;
};
