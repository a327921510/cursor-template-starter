import { useCallback, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button, Segmented, Space } from "antd";
import {
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import type { TrendDataPoint, TrendRange, TrendGranularity } from "../types";
import { TREND_RANGE_LABELS } from "../constants";

export type TrendChartProps = {
  data: TrendDataPoint[];
  loading: boolean;
  range: TrendRange;
  granularity: TrendGranularity;
  onRangeChange: (range: TrendRange) => void;
  onGranularityChange: (granularity: TrendGranularity) => void;
};

export function TrendChart({
  data,
  loading,
  range,
  granularity,
  onRangeChange,
  onGranularityChange,
}: TrendChartProps) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("api-dashboard-trend-collapsed") === "true";
    } catch {
      return false;
    }
  });

  const handleToggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("api-dashboard-trend-collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const rangeOptions = (
    Object.entries(TREND_RANGE_LABELS) as [TrendRange, string][]
  )
    .filter(([key]) => key !== "custom")
    .map(([value, label]) => ({ value, label }));

  return (
    <div className="border-t px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">
            Call Trends
          </span>
          {!collapsed && (
            <Space size="small">
              <Segmented
                size="small"
                value={range}
                onChange={(val) => onRangeChange(val as TrendRange)}
                options={rangeOptions}
              />
              <Segmented
                size="small"
                value={granularity}
                onChange={(val) => onGranularityChange(val as TrendGranularity)}
                options={[
                  { value: "hour", label: "Hour" },
                  { value: "day", label: "Day" },
                  { value: "week", label: "Week" },
                ]}
              />
            </Space>
          )}
        </div>
        <Button
          type="text"
          size="small"
          icon={collapsed ? <DownOutlined /> : <UpOutlined />}
          onClick={handleToggle}
        />
      </div>

      {!collapsed && (
        <div className="mt-3 h-56">
          {loading ? (
            <div className="flex h-full items-center justify-center text-gray-400">
              Loading chart...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(val) => {
                    const d = new Date(val);
                    return granularity === "hour"
                      ? d.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : d.toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        });
                  }}
                  fontSize={11}
                />
                <YAxis yAxisId="left" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" fontSize={11} />
                <Tooltip
                  labelFormatter={(label) =>
                    new Date(label as string).toLocaleString()
                  }
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="calls"
                  name="Calls"
                  stroke="#1677ff"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgLatencyMs"
                  name="Avg Latency (ms)"
                  stroke="#faad14"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="errorCount"
                  name="Errors"
                  stroke="#ff4d4f"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
}
