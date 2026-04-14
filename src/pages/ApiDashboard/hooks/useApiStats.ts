import { useCallback, useEffect, useState } from "react";
import { apiDashboardApi } from "@/services/modules/apiDashboard";
import type { DashboardStats } from "../types";

const DEFAULT_STATS: DashboardStats = {
  totalApis: 0,
  totalApisWeekChange: 0,
  activeApis: 0,
  activeApisPercent: 0,
  errorApis: 0,
  errorApisDayChange: 0,
  avgLatencyMs: 0,
  p95LatencyMs: 0,
};

export function useApiStats() {
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiDashboardApi.getDashboardStats();
      setStats(res as unknown as DashboardStats);
    } catch {
      // keep previous stats
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch };
}
