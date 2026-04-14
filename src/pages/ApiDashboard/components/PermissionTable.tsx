import { memo } from "react";
import { Table, Button, Select, Tag } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Permission } from "../types";

export type PermissionTableProps = {
  permissions: Permission[];
  onRemove: (id: string) => void;
  onLevelChange: (id: string, level: Permission["level"]) => void;
};

export const PermissionTable = memo(function PermissionTable({
  permissions,
  onRemove,
  onLevelChange,
}: PermissionTableProps) {
  const columns: ColumnsType<Permission> = [
    {
      title: "Subject",
      dataIndex: "subjectName",
      render: (name: string, record) => (
        <span>
          <Tag>{record.subjectType}</Tag>
          {name}
        </span>
      ),
    },
    {
      title: "Level",
      dataIndex: "level",
      width: 140,
      render: (level: Permission["level"], record) => (
        <Select
          size="small"
          value={level}
          onChange={(val) => onLevelChange(record.id, val)}
          options={[
            { value: "read", label: <Tag color="blue">Read</Tag> },
            { value: "write", label: <Tag color="orange">Write</Tag> },
            { value: "admin", label: <Tag color="red">Admin</Tag> },
          ]}
          className="w-28"
        />
      ),
    },
    {
      title: "",
      width: 50,
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemove(record.id)}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={permissions}
      rowKey="id"
      size="small"
      pagination={false}
    />
  );
});
