import type { PaginatedResult, SortDirection } from "@/types/common.types";

export type ListQuery<TSortColumn extends string = string> = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortColumn?: TSortColumn;
  sortDirection?: SortDirection;
};

/**
 * Simulates the search/sort/paginate a real API would do server-side.
 * Services call this over the in-memory mock arrays so swapping to real
 * HTTP calls later only means dropping this and passing the same query
 * shape as request params.
 */
export function paginateList<T, TSortColumn extends string = string>(
  items: T[],
  query: ListQuery<TSortColumn>,
  options: {
    searchFields?: (item: T) => string[];
    sortAccessor?: (item: T, column: TSortColumn) => string | number;
  } = {},
): PaginatedResult<T> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 10;

  let result = [...items];

  if (query.search && options.searchFields) {
    const term = query.search.trim().toLowerCase();
    result = result.filter((item) =>
      options.searchFields!(item).some((field) => field.toLowerCase().includes(term)),
    );
  }

  if (query.sortColumn && options.sortAccessor) {
    const direction = query.sortDirection === "desc" ? -1 : 1;
    result.sort((a, b) => {
      const valueA = options.sortAccessor!(a, query.sortColumn as TSortColumn);
      const valueB = options.sortAccessor!(b, query.sortColumn as TSortColumn);
      if (valueA < valueB) return -1 * direction;
      if (valueA > valueB) return 1 * direction;
      return 0;
    });
  }

  const total = result.length;
  const start = (page - 1) * pageSize;
  const data = result.slice(start, start + pageSize);

  return { data, total, page, pageSize };
}
