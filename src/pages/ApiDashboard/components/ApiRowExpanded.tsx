import { Table, Tag } from "antd";

type CallRecord = {
  id: string;
  timestamp: string;
  method: string;
  statusCode: number;
  durationMs: number;
  caller: string;
};

export type ApiRowExpandedProps = {
  recentCalls: CallRecord[];
};

const columns = [
  {
    title: "Time",
    dataIndex: "timestamp",
    key: "timestamp",
    render: (val: string) => new Date(val).toLocaleString(),
  },
  {
    title: "Method",
    dataIndex: "method",
    key: "method",
  },
  {
    title: "Status",
    dataIndex: "statusCode",
    key: "statusCode",
    render: (code: number) => (
      <Tag color={code < 400 ? "green" : code < 500 ? "orange" : "red"}>
        {code}
      </Tag>
    ),
  },
  {
    title: "Duration",
    dataIndex: "durationMs",
    key: "durationMs",
    render: (ms: number) => `${ms}ms`,
  },
  {
    title: "Caller",
    dataIndex: "caller",
    key: "caller",
  },
];

export function ApiRowExpanded({ recentCalls }: ApiRowExpandedProps) {
  return (
    <Table
      dataSource={recentCalls}
      columns={columns}
      rowKey="id"
      size="small"
      pagination={false}
      className="bg-gray-50"
    />
  );
}
