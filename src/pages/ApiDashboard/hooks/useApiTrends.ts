import { useCallback, useEffect, useState } from "react";
import { apiDashboardApi } from "@/services/modules/apiDashboard";
import type { TrendDataPoint, TrendGranularity, TrendRange } from "../types";

type UseApiTrendsParams = {
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
      const result = (await apiDashboardApi.getTrends({
        range,
        granularity,
        apiId: apiId ?? undefined,
      })) as unknown as TrendDataPoint[];
      setData(result);
    } catch {
      // keep previous data
    } finally {
      setLoading(false);
    }
  }, [apiId, range, granularity]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  return { data, loading, refetch: fetchTrends };
}
