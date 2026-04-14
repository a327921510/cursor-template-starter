import { useCallback, useEffect, useState } from "react";
import { apiDashboardApi } from "@/services/modules/apiDashboard";
import type { DashboardStats } from "../types";

const DEFAULT_STATS: DashboardStats = {
  totalApis: 0,
  totalApisChange: 0,
  activeApis: 0,
  activeApisPercent: 0,
  errorApis: 0,
  errorApisChange: 0,
  avgLatencyMs: 0,
  p95LatencyMs: 0,
};

export function useApiStats() {
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await apiDashboardApi.getDashboardStats()) as unknown as DashboardStats;
      setStats(data);
    } catch {
      // keep previous data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}
