import { Card, Skeleton } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import clsx from "clsx";

export type StatCardProps = {
  title: string;
  value: string | number;
  suffix?: string;
  change?: number;
  changeLabel?: string;
  color: "blue" | "green" | "red" | "yellow";
  isLoading?: boolean;
  onClick?: () => void;
};

const COLOR_CLASSES: Record<string, string> = {
  blue: "border-l-blue-500",
  green: "border-l-green-500",
  red: "border-l-red-500",
  yellow: "border-l-yellow-500",
};

export function StatCard({
  title,
  value,
  suffix,
  change,
  changeLabel,
  color,
  isLoading,
  onClick,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card className="flex-1" size="small">
        <Skeleton active paragraph={{ rows: 1 }} />
      </Card>
    );
  }

  return (
    <Card
      className={clsx(
        "flex-1 cursor-pointer border-l-4 transition-shadow hover:shadow-md",
        COLOR_CLASSES[color],
      )}
      size="small"
      onClick={onClick}
    >
      <div className="text-xs text-gray-500">{title}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-semibold">{value}</span>
        {suffix && <span className="text-sm text-gray-400">{suffix}</span>}
      </div>
      {change !== undefined && (
        <div
          className={clsx(
            "mt-1 flex items-center gap-1 text-xs",
            change > 0 ? "text-red-500" : change < 0 ? "text-green-500" : "text-gray-400",
          )}
        >
          {change > 0 ? <ArrowUpOutlined /> : change < 0 ? <ArrowDownOutlined /> : null}
          <span>
            {change > 0 ? "+" : ""}
            {change} {changeLabel}
          </span>
        </div>
      )}
    </Card>
  );
}
