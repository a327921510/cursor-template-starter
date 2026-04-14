import { Button, Popconfirm, Select, Table, Tag } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { Permission } from "../types";

export type PermissionTableProps = {
  permissions: Permission[];
  onRemove: (id: string) => void;
};

const LEVEL_COLORS: Record<string, string> = {
  read: "blue",
  write: "green",
  admin: "red",
};

export function PermissionTable({ permissions, onRemove }: PermissionTableProps) {
  return (
    <Table
      dataSource={permissions}
      rowKey="id"
      size="small"
      pagination={false}
      columns={[
        {
          title: "Subject",
          dataIndex: "subjectName",
          key: "subjectName",
          render: (name: string, record: Permission) => (
            <div>
              <span>{name}</span>
              <Tag className="ml-2" color="default">
                {record.subjectType}
              </Tag>
            </div>
          ),
        },
        {
          title: "Level",
          dataIndex: "level",
          key: "level",
          width: 100,
          render: (level: string) => (
            <Select
              size="small"
              value={level}
              disabled
              className="w-full"
              options={[
                { value: "read", label: "Read" },
                { value: "write", label: "Write" },
                { value: "admin", label: "Admin" },
              ]}
              labelRender={({ label }) => (
                <Tag color={LEVEL_COLORS[level]}>{label}</Tag>
              )}
            />
          ),
        },
        {
          title: "",
          key: "actions",
          width: 40,
          render: (_: unknown, record: Permission) => (
            <Popconfirm
              title="Remove this permission?"
              onConfirm={() => onRemove(record.id)}
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          ),
        },
      ]}
    />
  );
}
