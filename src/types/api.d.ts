type ApiResponse<T = unknown> = {
  code: number;
  message: string;
  data: T;
};

type PaginatedResult<T> = {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
};
