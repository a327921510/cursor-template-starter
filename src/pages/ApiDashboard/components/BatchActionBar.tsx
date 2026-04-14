import { Button, Space } from "antd";
import {
  DeleteOutlined,
  ExportOutlined,
  StopOutlined,
  TagOutlined,
} from "@ant-design/icons";

export type BatchActionBarProps = {
  count: number;
  onBatchDeprecate: () => void;
  onBatchDelete: () => void;
  onBatchTag: () => void;
  onBatchExport: () => void;
  onClearSelection: () => void;
};

export function BatchActionBar({
  count,
  onBatchDeprecate,
  onBatchDelete,
  onBatchTag,
  onBatchExport,
  onClearSelection,
}: BatchActionBarProps) {
  if (count === 0) return null;

  return (
    <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2">
      <span className="text-sm font-medium text-blue-700">
        {count} item{count > 1 ? "s" : ""} selected
      </span>
      <Space>
        <Button size="small" icon={<StopOutlined />} onClick={onBatchDeprecate}>
          Mark Deprecated
        </Button>
        <Button size="small" icon={<TagOutlined />} onClick={onBatchTag}>
          Add Tag
        </Button>
        <Button size="small" icon={<ExportOutlined />} onClick={onBatchExport}>
          Export
        </Button>
        <Button size="small" danger icon={<DeleteOutlined />} onClick={onBatchDelete}>
          Delete
        </Button>
        <Button size="small" type="link" onClick={onClearSelection}>
          Cancel
        </Button>
      </Space>
    </div>
  );
}
