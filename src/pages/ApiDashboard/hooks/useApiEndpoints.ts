import { useCallback, useEffect, useMemo, useState } from "react";
import { apiDashboardApi } from "@/services/modules/apiDashboard";
import type { ApiEndpoint, Filters, SortField } from "../types";

type UseApiEndpointsParams = {
  filters: Filters;
  groupId: string | null;
  page: number;
  pageSize: number;
};

function sortEndpoints(list: ApiEndpoint[], sort: SortField): ApiEndpoint[] {
  const sorted = [...list];
  sorted.sort((a, b) => {
    switch (sort) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "updatedAt-desc":
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case "updatedAt-asc":
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      case "calls-desc":
        return b.stats.calls24h - a.stats.calls24h;
      case "calls-asc":
        return a.stats.calls24h - b.stats.calls24h;
      case "latency-asc":
        return a.stats.avgLatencyMs - b.stats.avgLatencyMs;
      case "latency-desc":
        return b.stats.avgLatencyMs - a.stats.avgLatencyMs;
      case "errorRate-desc":
        return b.stats.errorRate - a.stats.errorRate;
      case "errorRate-asc":
        return a.stats.errorRate - b.stats.errorRate;
      default:
        return 0;
    }
  });
  return sorted;
}

export function useApiEndpoints({
  filters,
  groupId,
  page,
  pageSize,
}: UseApiEndpointsParams) {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEndpoints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiDashboardApi.getEndpoints({
        search: filters.search || undefined,
        status: filters.statuses.length < 4 ? filters.statuses.join(",") : undefined,
        serviceId: groupId ?? undefined,
        sort: filters.sort,
        page,
        limit: pageSize,
      });
      const data = result as unknown as {
        list: ApiEndpoint[];
        total: number;
      };
      setEndpoints(data.list);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load APIs");
    } finally {
      setLoading(false);
    }
  }, [filters, groupId, page, pageSize]);

  useEffect(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);

  const sortedEndpoints = useMemo(
    () => sortEndpoints(endpoints, filters.sort),
    [endpoints, filters.sort],
  );

  const createEndpoint = useCallback(async (data: Partial<ApiEndpoint>) => {
    const created = (await apiDashboardApi.createEndpoint(data)) as unknown as ApiEndpoint;
    setEndpoints((prev) => [created, ...prev]);
    setTotal((prev) => prev + 1);
    return created;
  }, []);

  const updateEndpoint = useCallback(async (id: string, data: Partial<ApiEndpoint>) => {
    const updated = (await apiDashboardApi.updateEndpoint(id, data)) as unknown as ApiEndpoint;
    setEndpoints((prev) => prev.map((e) => (e.id === id ? updated : e)));
    return updated;
  }, []);

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
        throw new Error("Delete failed");
      }
    },
    [endpoints],
  );

  const batchAction = useCallback(
    async (action: "deprecate" | "delete" | "tag", ids: string[], tagId?: string) => {
      await apiDashboardApi.batchAction({ action, ids, tagId });
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

  return {
    endpoints: sortedEndpoints,
    total,
    loading,
    error,
    refetch: fetchEndpoints,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
    batchAction,
    toggleFavorite,
  };
}
