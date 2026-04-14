import { useCallback, useEffect, useState } from "react";
import { apiDashboardApi } from "@/services/modules/apiDashboard";
import type { ApiEndpoint } from "../types";

export function useApiDetail(apiId: string | null) {
  const [detail, setDetail] = useState<ApiEndpoint | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!apiId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    apiDashboardApi
      .getEndpointById(apiId)
      .then((res) => {
        setDetail(res as unknown as ApiEndpoint);
      })
      .catch(() => {
        setDetail(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [apiId]);

  const updateDetail = useCallback(
    async (id: string, data: Partial<ApiEndpoint>) => {
      const res = await apiDashboardApi.updateEndpoint(id, data);
      const updated = res as unknown as ApiEndpoint;
      setDetail(updated);
      return updated;
    },
    [],
  );

  return { detail, loading, updateDetail };
}
