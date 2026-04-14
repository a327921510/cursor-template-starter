import { useCallback, useEffect, useState } from "react";
import { apiDashboardApi } from "@/services/modules/apiDashboard";
import type { ApiVersion } from "../types";

export function useApiVersions(apiId: string | null) {
  const [versions, setVersions] = useState<ApiVersion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVersions = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const data = (await apiDashboardApi.getVersions(id)) as unknown as ApiVersion[];
      setVersions(data);
    } catch {
      // keep previous data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (apiId) {
      fetchVersions(apiId);
    } else {
      setVersions([]);
    }
  }, [apiId, fetchVersions]);

  return { versions, loading, refetch: () => apiId && fetchVersions(apiId) };
}
