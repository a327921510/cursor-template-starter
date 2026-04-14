import { memo } from "react";
import { Card, Skeleton } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import clsx from "clsx";

export type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  color: "blue" | "green" | "red" | "yellow";
  loading?: boolean;
  onClick?: () => void;
};

const COLOR_MAP = {
  blue: "border-l-blue-500",
  green: "border-l-green-500",
  red: "border-l-red-500",
  yellow: "border-l-yellow-500",
} as const;

const TEXT_COLOR_MAP = {
  blue: "text-blue-600",
  green: "text-green-600",
  red: "text-red-600",
  yellow: "text-yellow-600",
} as const;

export const StatCard = memo(function StatCard({
  title,
  value,
  subtitle,
  change,
  color,
  loading,
  onClick,
}: StatCardProps) {
  if (loading) {
    return (
      <Card size="small" className="flex-1">
        <Skeleton active paragraph={{ rows: 1 }} />
      </Card>
    );
  }

  return (
    <Card
      size="small"
      className={clsx(
        "flex-1 cursor-pointer border-l-4 transition-shadow hover:shadow-md",
        COLOR_MAP[color],
      )}
      onClick={onClick}
    >
      <div className="text-xs text-gray-500">{title}</div>
      <div className={clsx("mt-1 text-2xl font-semibold", TEXT_COLOR_MAP[color])}>
        {value}
      </div>
      <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
        {change !== undefined && change !== 0 && (
          <span
            className={clsx(
              "flex items-center",
              change > 0 ? "text-red-500" : "text-green-500",
            )}
          >
            {change > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(change)}
          </span>
        )}
        {subtitle && <span>{subtitle}</span>}
      </div>
    </Card>
  );
});
