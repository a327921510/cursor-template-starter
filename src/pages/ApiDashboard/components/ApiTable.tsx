import { useCallback, useMemo } from "react";
import { Table, Button, Dropdown, Tooltip, Progress } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  StarOutlined,
  StarFilled,
  MoreOutlined,
  EditOutlined,
  CopyOutlined,
  FileTextOutlined,
  FileSearchOutlined,
  StopOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import clsx from "clsx";
import type { ApiEndpoint } from "../types";
import { LATENCY_THRESHOLDS, ERROR_RATE_THRESHOLD, PAGE_SIZE_OPTIONS } from "../constants";
import { MethodBadge } from "./MethodBadge";
import { StatusTag } from "./StatusTag";
import { SearchHighlight } from "./SearchHighlight";
import { BatchActionBar } from "./BatchActionBar";
import { EmptyState } from "./EmptyState";

export type ApiTableProps = {
  endpoints: ApiEndpoint[];
  total: number;
  loading: boolean;
  page: number;
  pageSize: number;
  selectedId: string | null;
  selectedIds: string[];
  searchKeyword: string;
  onSelect: (id: string | null) => void;
  onToggleMulti: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearSelection: () => void;
  onPageChange: (page: number, pageSize: number) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (id: string) => void;
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
  onDeprecate: (id: string) => void;
  onBatchDeprecate: () => void;
  onBatchDelete: () => void;
  onBatchTag: () => void;
  onBatchExport: () => void;
  onClearFilters: () => void;
};

export function ApiTable({
  endpoints,
  total,
  loading,
  page,
  pageSize,
  selectedId,
  selectedIds,
  searchKeyword,
  onSelect,
  onToggleMulti: _onToggleMulti,
  onSelectAll,
  onClearSelection,
  onPageChange,
  onToggleFavorite,
  onEdit,
  onCopy,
  onDelete,
  onDeprecate,
  onBatchDeprecate,
  onBatchDelete,
  onBatchTag,
  onBatchExport,
  onClearFilters,
}: ApiTableProps) {
  const getRowMenuItems = useCallback(
    (record: ApiEndpoint) => [
      {
        key: "edit",
        label: "Edit",
        icon: <EditOutlined />,
        onClick: () => onEdit(record.id),
      },
      {
        key: "copy",
        label: "Duplicate",
        icon: <CopyOutlined />,
        onClick: () => onCopy(record.id),
      },
      {
        key: "docs",
        label: "View Docs",
        icon: <FileTextOutlined />,
        onClick: () => window.open(`/docs/${record.id}`, "_blank"),
      },
      {
        key: "logs",
        label: "View Logs",
        icon: <FileSearchOutlined />,
        onClick: () => window.open(`/logs?apiId=${record.id}`, "_blank"),
      },
      { type: "divider" as const },
      {
        key: "deprecate",
        label: record.status === "deprecated" ? "Restore" : "Deprecate",
        icon: <StopOutlined />,
        onClick: () => onDeprecate(record.id),
      },
      {
        key: "delete",
        label: "Delete",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => onDelete(record.id),
      },
    ],
    [onEdit, onCopy, onDeprecate, onDelete],
  );

  const columns: ColumnsType<ApiEndpoint> = useMemo(
    () => [
      {
        title: "",
        dataIndex: "isFavorite",
        width: 36,
        render: (isFav: boolean, record) => (
          <Button
            type="text"
            size="small"
            icon={
              isFav ? (
                <StarFilled className="text-yellow-400" />
              ) : (
                <StarOutlined className="text-gray-300" />
              )
            }
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(record.id);
            }}
          />
        ),
      },
      {
        title: "Name",
        dataIndex: "name",
        sorter: true,
        render: (name: string, record) => (
          <div>
            <div className="font-medium">
              <SearchHighlight text={name} keyword={searchKeyword} />
            </div>
            <div className="text-xs text-gray-400">
              <SearchHighlight text={record.path} keyword={searchKeyword} />
            </div>
          </div>
        ),
      },
      {
        title: "Method",
        dataIndex: "methods",
        width: 120,
        render: (methods: ApiEndpoint["methods"]) => (
          <div className="flex flex-wrap gap-1">
            {methods.map((m) => (
              <MethodBadge key={m} method={m} />
            ))}
          </div>
        ),
      },
      {
        title: "Service",
        dataIndex: "serviceName",
        width: 120,
        sorter: true,
        ellipsis: true,
      },
      {
        title: "Status",
        dataIndex: "status",
        width: 100,
        sorter: true,
        render: (status: ApiEndpoint["status"]) => <StatusTag status={status} />,
      },
      {
        title: "Calls (24h)",
        dataIndex: ["stats", "calls24h"],
        width: 110,
        sorter: true,
        render: (calls: number) => (
          <span className="font-mono text-sm">{calls.toLocaleString()}</span>
        ),
      },
      {
        title: "Avg Latency",
        dataIndex: ["stats", "avgLatencyMs"],
        width: 100,
        sorter: true,
        render: (latency: number) => (
          <span
            className={clsx("font-mono text-sm", {
              "text-green-600": latency < LATENCY_THRESHOLDS.good,
              "text-yellow-600":
                latency >= LATENCY_THRESHOLDS.good &&
                latency <= LATENCY_THRESHOLDS.warn,
              "text-red-600": latency > LATENCY_THRESHOLDS.warn,
            })}
          >
            {latency}ms
          </span>
        ),
      },
      {
        title: "Error Rate",
        dataIndex: ["stats", "errorRate"],
        width: 100,
        sorter: true,
        render: (rate: number) => (
          <div className="flex items-center gap-1">
            <Progress
              percent={rate * 100}
              size="small"
              showInfo={false}
              strokeColor={rate > ERROR_RATE_THRESHOLD ? "#ff4d4f" : "#52c41a"}
              className="w-12"
            />
            <span
              className={clsx("font-mono text-xs", {
                "text-red-500": rate > ERROR_RATE_THRESHOLD,
              })}
            >
              {(rate * 100).toFixed(1)}%
            </span>
          </div>
        ),
      },
      {
        title: "Updated",
        dataIndex: "updatedAt",
        width: 120,
        sorter: true,
        render: (val: string) => (
          <Tooltip title={new Date(val).toLocaleString()}>
            <span className="text-xs text-gray-500">
              {getRelativeTime(val)}
            </span>
          </Tooltip>
        ),
      },
      {
        title: "",
        width: 50,
        render: (_, record) => (
          <Dropdown
            menu={{ items: getRowMenuItems(record) }}
            trigger={["click"]}
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        ),
      },
    ],
    [searchKeyword, onToggleFavorite, getRowMenuItems],
  );

  const rowSelection = useMemo(
    () => ({
      selectedRowKeys: selectedIds,
      onChange: (keys: React.Key[]) => {
        onSelectAll(keys as string[]);
      },
    }),
    [selectedIds, onSelectAll],
  );

  const handleRowClick = useCallback(
    (record: ApiEndpoint) => ({
      onClick: () => onSelect(record.id),
      className: clsx(
        "cursor-pointer transition-colors",
        record.id === selectedId && "bg-blue-50",
      ),
    }),
    [selectedId, onSelect],
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden px-4">
      <BatchActionBar
        count={selectedIds.length}
        onBatchDeprecate={onBatchDeprecate}
        onBatchDelete={onBatchDelete}
        onBatchTag={onBatchTag}
        onBatchExport={onBatchExport}
        onClear={onClearSelection}
      />

      <Table
        columns={columns}
        dataSource={endpoints}
        rowKey="id"
        loading={loading}
        rowSelection={rowSelection}
        onRow={handleRowClick}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: PAGE_SIZE_OPTIONS.map(String),
          showTotal: (t) => `Total ${t} APIs`,
          onChange: onPageChange,
        }}
        scroll={{ y: "calc(100vh - 400px)" }}
        size="middle"
        locale={{
          emptyText: (
            <EmptyState
              description="No matching APIs found"
              actionLabel="Clear Filters"
              onAction={onClearFilters}
            />
          ),
        }}
      />
    </div>
  );
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
