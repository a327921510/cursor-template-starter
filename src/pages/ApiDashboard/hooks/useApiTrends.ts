import { useCallback, useEffect, useState } from "react";
import { apiDashboardApi } from "@/services/modules/apiDashboard";
import type { TrendDataPoint, TrendGranularity, TrendRange } from "../types";

export type UseApiTrendsParams = {
  apiId?: string | null;
  range: TrendRange;
  granularity: TrendGranularity;
};

export function useApiTrends({ apiId, range, granularity }: UseApiTrendsParams) {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiDashboardApi.getTrends({
        apiId: apiId ?? undefined,
        range,
        granularity,
      });
      setData(res as unknown as TrendDataPoint[]);
    } catch {
      // keep previous data
    } finally {
      setLoading(false);
    }
  }, [apiId, range, granularity]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  const refetch = useCallback(() => {
    fetchTrends();
  }, [fetchTrends]);

  return { data, loading, refetch };
}
