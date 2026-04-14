import { memo } from "react";
import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

type CallRecord = {
  id: string;
  timestamp: string;
  statusCode: number;
  latencyMs: number;
  method: string;
  path: string;
};

export type ApiRowExpandedProps = {
  records: CallRecord[];
};

const columns: ColumnsType<CallRecord> = [
  {
    title: "Time",
    dataIndex: "timestamp",
    width: 180,
    render: (val: string) => new Date(val).toLocaleString(),
  },
  {
    title: "Method",
    dataIndex: "method",
    width: 80,
  },
  {
    title: "Path",
    dataIndex: "path",
    ellipsis: true,
  },
  {
    title: "Status",
    dataIndex: "statusCode",
    width: 80,
    render: (code: number) => (
      <Tag color={code < 400 ? "green" : "red"}>{code}</Tag>
    ),
  },
  {
    title: "Latency",
    dataIndex: "latencyMs",
    width: 100,
    render: (val: number) => `${val}ms`,
  },
];

export const ApiRowExpanded = memo(function ApiRowExpanded({
  records,
}: ApiRowExpandedProps) {
  return (
    <div className="px-4 py-2">
      <Table
        columns={columns}
        dataSource={records}
        rowKey="id"
        size="small"
        pagination={false}
      />
    </div>
  );
});
