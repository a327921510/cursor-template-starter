import { StatCard } from "./StatCard";
import type { DashboardStats, Filters } from "../types";

export type StatsRowProps = {
  stats: DashboardStats;
  isLoading: boolean;
  onFilterByStatus: (filter: Partial<Filters>) => void;
};

export function StatsRow({ stats, isLoading, onFilterByStatus }: StatsRowProps) {
  return (
    <div className="flex gap-4 p-4">
      <StatCard
        title="Total APIs"
        value={stats.totalApis}
        change={stats.totalApisChange}
        changeLabel="vs last week"
        color="blue"
        isLoading={isLoading}
        onClick={() => onFilterByStatus({ statuses: ["active", "deprecated", "draft", "error"] })}
      />
      <StatCard
        title="Active APIs"
        value={stats.activeApis}
        suffix={`${stats.activeApisPercent.toFixed(1)}%`}
        color="green"
        isLoading={isLoading}
        onClick={() => onFilterByStatus({ statuses: ["active"] })}
      />
      <StatCard
        title="Error APIs"
        value={stats.errorApis}
        change={stats.errorApisChange}
        changeLabel="vs yesterday"
        color="red"
        isLoading={isLoading}
        onClick={() => onFilterByStatus({ statuses: ["error"] })}
      />
      <StatCard
        title="Avg Latency"
        value={`${stats.avgLatencyMs}ms`}
        suffix={`P95: ${stats.p95LatencyMs}ms`}
        color={stats.avgLatencyMs > 300 ? "red" : "yellow"}
        isLoading={isLoading}
      />
    </div>
  );
}
