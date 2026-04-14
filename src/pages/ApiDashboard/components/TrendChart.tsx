import { useCallback, useState } from "react";
import { Button, Radio, Spin, Tooltip, Typography } from "antd";
import {
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendDataPoint, TrendGranularity, TrendRange } from "../types";
import { TREND_GRANULARITY_OPTIONS, TREND_RANGE_OPTIONS } from "../constants";

export type TrendChartProps = {
  data: TrendDataPoint[];
  loading: boolean;
  range: TrendRange;
  granularity: TrendGranularity;
  onRangeChange: (range: TrendRange) => void;
  onGranularityChange: (granularity: TrendGranularity) => void;
};

function getCollapsedFromStorage(): boolean {
  try {
    return localStorage.getItem("api-dashboard-trend-collapsed") === "true";
  } catch {
    return false;
  }
}

export function TrendChart({
  data,
  loading,
  range,
  granularity,
  onRangeChange,
  onGranularityChange,
}: TrendChartProps) {
  const [collapsed, setCollapsed] = useState(getCollapsedFromStorage);

  const toggleCollapsed = useCallback(() => {
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

  return (
    <div className="border-t">
      <div className="flex items-center justify-between px-4 py-2">
        <Typography.Text strong className="text-sm">
          Call Trends
        </Typography.Text>
        <div className="flex items-center gap-3">
          {!collapsed && (
            <>
              <Radio.Group
                size="small"
                value={range}
                onChange={(e) => onRangeChange(e.target.value as TrendRange)}
                optionType="button"
                options={TREND_RANGE_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
              />
              <Radio.Group
                size="small"
                value={granularity}
                onChange={(e) => onGranularityChange(e.target.value as TrendGranularity)}
                optionType="button"
                options={TREND_GRANULARITY_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
              />
            </>
          )}
          <Tooltip title={collapsed ? "Expand chart" : "Collapse chart"}>
            <Button
              type="text"
              size="small"
              icon={collapsed ? <DownOutlined /> : <UpOutlined />}
              onClick={toggleCollapsed}
            />
          </Tooltip>
        </div>
      </div>

      {!collapsed && (
        <div className="h-64 px-4 pb-4">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Spin />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(val: string) => {
                    const d = new Date(val);
                    return granularity === "hour"
                      ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : d.toLocaleDateString([], { month: "short", day: "numeric" });
                  }}
                  fontSize={12}
                />
                <YAxis yAxisId="calls" fontSize={12} />
                <YAxis yAxisId="latency" orientation="right" fontSize={12} />
                <RechartsTooltip
                  labelFormatter={(label: string) => new Date(label).toLocaleString()}
                  formatter={(value: number, name: string) => {
                    if (name === "avgLatencyMs") return [`${value}ms`, "Avg Latency"];
                    if (name === "errorCount") return [value, "Errors"];
                    return [value.toLocaleString(), "Calls"];
                  }}
                />
                <Legend />
                <Line
                  yAxisId="calls"
                  type="monotone"
                  dataKey="calls"
                  stroke="#1677ff"
                  strokeWidth={2}
                  dot={false}
                  name="Calls"
                />
                <Line
                  yAxisId="latency"
                  type="monotone"
                  dataKey="avgLatencyMs"
                  stroke="#faad14"
                  strokeWidth={2}
                  dot={false}
                  name="Avg Latency (ms)"
                />
                <Line
                  yAxisId="calls"
                  type="monotone"
                  dataKey="errorCount"
                  stroke="#ff4d4f"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Errors"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
}
