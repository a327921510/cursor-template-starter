import { useCallback, useEffect, useState } from "react";
import { apiDashboardApi } from "@/services/modules/apiDashboard";
import type { ApiVersion } from "../types";

export function useApiVersions(apiId: string | null) {
  const [versions, setVersions] = useState<ApiVersion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!apiId) {
      setVersions([]);
      return;
    }
    setLoading(true);
    apiDashboardApi
      .getVersions(apiId)
      .then((res) => {
        setVersions(res as unknown as ApiVersion[]);
      })
      .catch(() => {
        setVersions([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [apiId]);

  const refetch = useCallback(() => {
    if (!apiId) return;
    apiDashboardApi
      .getVersions(apiId)
      .then((res) => {
        setVersions(res as unknown as ApiVersion[]);
      })
      .catch(() => {});
  }, [apiId]);

  return { versions, loading, refetch };
}
