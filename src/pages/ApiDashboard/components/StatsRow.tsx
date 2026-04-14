import { memo } from "react";
import type { DashboardStats, Filters } from "../types";
import { StatCard } from "./StatCard";
import { LATENCY_THRESHOLDS } from "../constants";

export type StatsRowProps = {
  stats: DashboardStats;
  loading: boolean;
  onStatsClick: (filter: Partial<Filters>) => void;
};

export const StatsRow = memo(function StatsRow({
  stats,
  loading,
  onStatsClick,
}: StatsRowProps) {
  const latencyColor =
    stats.avgLatencyMs > LATENCY_THRESHOLDS.warn ? "red" : "yellow";

  return (
    <div className="flex gap-4 p-4">
      <StatCard
        title="API Total"
        value={stats.totalApis}
        change={stats.totalApisWeekChange}
        subtitle="vs last week"
        color="blue"
        loading={loading}
        onClick={() => onStatsClick({ statuses: ["active", "deprecated", "draft", "error"] })}
      />
      <StatCard
        title="Active APIs"
        value={stats.activeApis}
        subtitle={`${stats.activeApisPercent.toFixed(1)}%`}
        color="green"
        loading={loading}
        onClick={() => onStatsClick({ statuses: ["active"] })}
      />
      <StatCard
        title="Error APIs"
        value={stats.errorApis}
        change={stats.errorApisDayChange}
        subtitle="vs yesterday"
        color="red"
        loading={loading}
        onClick={() => onStatsClick({ statuses: ["error"] })}
      />
      <StatCard
        title="Avg Latency"
        value={`${stats.avgLatencyMs}ms`}
        subtitle={`P95: ${stats.p95LatencyMs}ms`}
        color={latencyColor}
        loading={loading}
      />
    </div>
  );
});
