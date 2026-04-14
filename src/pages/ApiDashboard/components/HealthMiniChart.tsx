import { Tag } from "antd";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";

export type HealthMiniChartProps = {
  data: number[];
  status: "healthy" | "degraded" | "down";
  alerts: { id: string; message: string; time: string }[];
};

const STATUS_CONFIG = {
  healthy: { color: "green", label: "Healthy" },
  degraded: { color: "orange", label: "Degraded" },
  down: { color: "red", label: "Down" },
} as const;

export function HealthMiniChart({ data, status, alerts }: HealthMiniChartProps) {
  const config = STATUS_CONFIG[status];
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: config.color }}
        />
        <Tag color={config.color}>{config.label}</Tag>
      </div>

      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <Area
              type="monotone"
              dataKey="value"
              stroke={config.color}
              fill={config.color}
              fillOpacity={0.2}
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {alerts.length > 0 && (
        <div className="mt-2 space-y-1">
          {alerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className="text-xs text-gray-500">
              <span className="text-red-400">!</span> {alert.message}
              <span className="ml-1 text-gray-400">{alert.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
