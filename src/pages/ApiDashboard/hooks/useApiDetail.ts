import { useCallback, useEffect, useState } from "react";
import { apiDashboardApi } from "@/services/modules/apiDashboard";
import type { ApiEndpoint } from "../types";

export function useApiDetail(apiId: string | null) {
  const [detail, setDetail] = useState<ApiEndpoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = (await apiDashboardApi.getEndpointById(id)) as unknown as ApiEndpoint;
      setDetail(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load detail");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (apiId) {
      fetchDetail(apiId);
    } else {
      setDetail(null);
    }
  }, [apiId, fetchDetail]);

  const updateDetail = useCallback(
    async (data: Partial<ApiEndpoint>) => {
      if (!apiId) return;
      const updated = (await apiDashboardApi.updateEndpoint(
        apiId,
        data,
      )) as unknown as ApiEndpoint;
      setDetail(updated);
      return updated;
    },
    [apiId],
  );

  return { detail, loading, error, refetch: () => apiId && fetchDetail(apiId), updateDetail };
}
