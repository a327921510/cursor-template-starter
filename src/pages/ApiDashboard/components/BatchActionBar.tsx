import { memo } from "react";
import { Button, Space } from "antd";
import {
  DeleteOutlined,
  ExportOutlined,
  StopOutlined,
  TagOutlined,
  CloseOutlined,
} from "@ant-design/icons";

export type BatchActionBarProps = {
  count: number;
  onBatchDeprecate: () => void;
  onBatchDelete: () => void;
  onBatchTag: () => void;
  onBatchExport: () => void;
  onClear: () => void;
};

export const BatchActionBar = memo(function BatchActionBar({
  count,
  onBatchDeprecate,
  onBatchDelete,
  onBatchTag,
  onBatchExport,
  onClear,
}: BatchActionBarProps) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-2">
      <span className="text-sm font-medium text-blue-700">
        {count} selected
      </span>
      <Space size="small">
        <Button
          size="small"
          icon={<StopOutlined />}
          onClick={onBatchDeprecate}
        >
          Deprecate
        </Button>
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={onBatchDelete}
        >
          Delete
        </Button>
        <Button size="small" icon={<TagOutlined />} onClick={onBatchTag}>
          Tag
        </Button>
        <Button
          size="small"
          icon={<ExportOutlined />}
          onClick={onBatchExport}
        >
          Export
        </Button>
      </Space>
      <Button
        type="text"
        size="small"
        icon={<CloseOutlined />}
        onClick={onClear}
      >
        Clear
      </Button>
    </div>
  );
});
