import { request } from "../request";

export type ApiEndpointListParams = {
  search?: string;
  status?: string;
  serviceId?: string;
  tagId?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

export type BatchActionParams = {
  action: "deprecate" | "delete" | "tag";
  ids: string[];
  tagId?: string;
};

export type ExportParams = {
  format: "json" | "csv" | "openapi";
  ids?: string[];
};

export type TrendParams = {
  range: string;
  granularity: string;
  apiId?: string;
};

export type TestRequestParams = {
  method: string;
  url: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: string;
  environment: string;
};

export const apiDashboardApi = {
  getEndpoints: (params: ApiEndpointListParams) =>
    request.get<PaginatedResult<unknown>>("/api/endpoints", { params }),

  getEndpointById: (id: string) =>
    request.get<unknown>(`/api/endpoints/${id}`),

  createEndpoint: (data: unknown) =>
    request.post<unknown>("/api/endpoints", data),

  updateEndpoint: (id: string, data: unknown) =>
    request.patch<unknown>(`/api/endpoints/${id}`, data),

  deleteEndpoint: (id: string) =>
    request.delete(`/api/endpoints/${id}`),

  batchAction: (data: BatchActionParams) =>
    request.post<unknown>("/api/endpoints/batch", data),

  getEndpointStats: (id: string) =>
    request.get<unknown>(`/api/endpoints/${id}/stats`),

  getTrends: (params: TrendParams) =>
    request.get<unknown>("/api/endpoints/trends", { params }),

  getVersions: (id: string) =>
    request.get<unknown>(`/api/endpoints/${id}/versions`),

  getServices: () =>
    request.get<unknown>("/api/services"),

  getTags: () =>
    request.get<unknown>("/api/tags"),

  createTag: (data: { name: string; color: string }) =>
    request.post<unknown>("/api/tags", data),

  toggleFavorite: (id: string) =>
    request.post<unknown>(`/api/endpoints/${id}/favorite`),

  getDashboardStats: () =>
    request.get<unknown>("/api/dashboard/stats"),

  testEndpoint: (id: string, data: TestRequestParams) =>
    request.post<unknown>(`/api/endpoints/${id}/test`, data),

  updatePermissions: (id: string, permissions: unknown) =>
    request.put<unknown>(`/api/endpoints/${id}/permissions`, permissions),

  exportEndpoints: (params: ExportParams) =>
    request.get<Blob>("/api/endpoints/export", {
      params,
      responseType: "blob",
    }),
};
