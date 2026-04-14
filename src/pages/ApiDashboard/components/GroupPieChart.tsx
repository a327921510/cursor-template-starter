import { memo, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { GroupNode } from "../types";

export type GroupPieChartProps = {
  groups: GroupNode[];
  onGroupClick: (groupId: string) => void;
};

const PIE_COLORS = [
  "#1677ff",
  "#52c41a",
  "#faad14",
  "#ff4d4f",
  "#722ed1",
  "#13c2c2",
  "#eb2f96",
  "#fa8c16",
];

export const GroupPieChart = memo(function GroupPieChart({
  groups,
  onGroupClick,
}: GroupPieChartProps) {
  const handleClick = useCallback(
    (_: unknown, index: number) => {
      const group = groups[index];
      if (group) {
        onGroupClick(group.id);
      }
    },
    [groups, onGroupClick],
  );

  if (groups.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-xs text-gray-400">
        No data
      </div>
    );
  }

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={groups}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={55}
            innerRadius={30}
            onClick={handleClick}
            className="cursor-pointer"
          >
            {groups.map((_, index) => (
              <Cell
                key={index}
                fill={PIE_COLORS[index % PIE_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${value} APIs`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});
