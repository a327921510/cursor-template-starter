import { useCallback, useEffect, useState } from "react";
import { apiDashboardApi } from "@/services/modules/apiDashboard";
import type { ApiEndpoint, Filters } from "../types";
import { DEFAULT_PAGE_SIZE } from "../constants";

export type UseApiEndpointsParams = {
  filters: Filters;
  groupId: string | null;
  page: number;
  pageSize: number;
};

export function useApiEndpoints({
  filters,
  groupId,
  page,
  pageSize,
}: UseApiEndpointsParams) {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchEndpoints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiDashboardApi.getEndpoints({
        search: filters.search || undefined,
        status: filters.statuses.length < 4 ? filters.statuses.join(",") : undefined,
        sort: filters.sortField,
        page,
        limit: pageSize,
        serviceId: groupId ?? undefined,
      });
      const data = res as unknown as PaginatedResult<ApiEndpoint>;
      setEndpoints(data.list);
      setTotal(data.total);
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  }, [filters, groupId, page, pageSize]);

  useEffect(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);

  const deleteEndpoint = useCallback(
    async (id: string) => {
      const snapshot = endpoints;
      setEndpoints((prev) => prev.filter((e) => e.id !== id));
      setTotal((prev) => prev - 1);
      try {
        await apiDashboardApi.deleteEndpoint(id);
      } catch {
        setEndpoints(snapshot);
        setTotal((prev) => prev + 1);
      }
    },
    [endpoints],
  );

  const batchAction = useCallback(
    async (action: string, ids: string[]) => {
      await apiDashboardApi.batchAction(action, ids);
      await fetchEndpoints();
    },
    [fetchEndpoints],
  );

  const toggleFavorite = useCallback(async (id: string) => {
    setEndpoints((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, isFavorite: !e.isFavorite } : e,
      ),
    );
    try {
      await apiDashboardApi.toggleFavorite(id);
    } catch {
      setEndpoints((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, isFavorite: !e.isFavorite } : e,
        ),
      );
    }
  }, []);

  const refetch = useCallback(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);

  return {
    endpoints,
    total,
    loading,
    deleteEndpoint,
    batchAction,
    toggleFavorite,
    refetch,
    pageSize: pageSize || DEFAULT_PAGE_SIZE,
  };
}
