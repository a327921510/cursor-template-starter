import { request } from "../request";
import type {
  ApiEndpoint,
  ApiVersion,
  DashboardStats,
  ExportFormat,
  Permission,
  Service,
  Tag,
  TestResult,
  TrendDataPoint,
  TrendGranularity,
  TrendRange,
} from "@/pages/ApiDashboard/types";

export type EndpointListParams = {
  search?: string;
  status?: string;
  serviceId?: string;
  tagId?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

export const apiDashboardApi = {
  getEndpoints: (params: EndpointListParams) =>
    request.get<PaginatedResult<ApiEndpoint>>("/api/endpoints", { params }),

  getEndpointById: (id: string) =>
    request.get<ApiEndpoint>(`/api/endpoints/${id}`),

  createEndpoint: (data: Partial<ApiEndpoint>) =>
    request.post<ApiEndpoint>("/api/endpoints", data),

  updateEndpoint: (id: string, data: Partial<ApiEndpoint>) =>
    request.patch<ApiEndpoint>(`/api/endpoints/${id}`, data),

  deleteEndpoint: (id: string) =>
    request.delete(`/api/endpoints/${id}`),

  batchAction: (action: string, ids: string[]) =>
    request.post("/api/endpoints/batch", { action, ids }),

  getEndpointStats: (id: string) =>
    request.get(`/api/endpoints/${id}/stats`),

  getTrends: (params: {
    range?: TrendRange;
    granularity?: TrendGranularity;
    apiId?: string;
  }) =>
    request.get<TrendDataPoint[]>("/api/endpoints/trends", { params }),

  getVersions: (id: string) =>
    request.get<ApiVersion[]>(`/api/endpoints/${id}/versions`),

  getServices: () => request.get<Service[]>("/api/services"),

  getTags: () => request.get<Tag[]>("/api/tags"),

  createTag: (data: Omit<Tag, "id">) =>
    request.post<Tag>("/api/tags", data),

  toggleFavorite: (id: string) =>
    request.post(`/api/endpoints/${id}/favorite`),

  getDashboardStats: () =>
    request.get<DashboardStats>("/api/dashboard/stats"),

  testEndpoint: (
    id: string,
    data: {
      method: string;
      headers: Record<string, string>;
      queryParams: Record<string, string>;
      body: string;
      environment: string;
    },
  ) => request.post<TestResult>(`/api/endpoints/${id}/test`, data),

  updatePermissions: (id: string, permissions: Permission[]) =>
    request.put(`/api/endpoints/${id}/permissions`, { permissions }),

  exportEndpoints: (params: { format: ExportFormat; ids?: string[] }) =>
    request.get("/api/endpoints/export", {
      params,
      responseType: "blob",
    }),
};
