import { memo } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Badge, Typography } from "antd";

const { Text } = Typography;

export type HealthMiniChartProps = {
  successRates: number[];
  currentStatus: "healthy" | "degraded" | "down";
  alerts: { id: string; message: string; time: string }[];
};

const STATUS_CONFIG = {
  healthy: { color: "green" as const, label: "Healthy" },
  degraded: { color: "yellow" as const, label: "Degraded" },
  down: { color: "red" as const, label: "Down" },
} as const;

export const HealthMiniChart = memo(function HealthMiniChart({
  successRates,
  currentStatus,
  alerts,
}: HealthMiniChartProps) {
  const chartData = successRates.map((rate, i) => ({ index: i, rate }));
  const config = STATUS_CONFIG[currentStatus];

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Badge status={config.color === "yellow" ? "warning" : config.color === "red" ? "error" : "success"} />
        <Text strong className="text-sm">
          {config.label}
        </Text>
      </div>

      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <Area
              type="monotone"
              dataKey="rate"
              stroke="#52c41a"
              fill="#f6ffed"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {alerts.length > 0 && (
        <div className="mt-2 space-y-1">
          {alerts.slice(0, 3).map((alert) => (
            <div key={alert.id} className="text-xs text-red-500">
              <Text type="secondary" className="text-xs mr-1">
                {alert.time}
              </Text>
              {alert.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
