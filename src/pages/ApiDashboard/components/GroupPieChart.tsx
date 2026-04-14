import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type GroupData = {
  id: string;
  name: string;
  count: number;
};

export type GroupPieChartProps = {
  data: GroupData[];
  onSelect: (id: string) => void;
};

const COLORS = [
  "#1677ff",
  "#52c41a",
  "#faad14",
  "#ff4d4f",
  "#722ed1",
  "#13c2c2",
  "#eb2f96",
  "#fa8c16",
];

export function GroupPieChart({ data, onSelect }: GroupPieChartProps) {
  if (data.length === 0) {
    return <div className="py-4 text-center text-xs text-gray-400">No data</div>;
  }

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={25}
            outerRadius={55}
            paddingAngle={2}
            onClick={(entry: GroupData) => onSelect(entry.id)}
            className="cursor-pointer"
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
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
}
