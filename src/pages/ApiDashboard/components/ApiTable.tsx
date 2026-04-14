import { useCallback, useMemo } from "react";
import { Button, Checkbox, Dropdown, Pagination, Progress, Table, Tooltip } from "antd";
import type { TableProps } from "antd";
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  FileTextOutlined,
  HeartFilled,
  HeartOutlined,
  StopOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import clsx from "clsx";
import type { ApiEndpoint } from "../types";
import { LATENCY_THRESHOLDS, ERROR_RATE_THRESHOLD, PAGE_SIZE_OPTIONS } from "../constants";
import { MethodBadge } from "./MethodBadge";
import { StatusTag } from "./StatusTag";
import { SearchHighlight } from "./SearchHighlight";
import { EmptyState } from "./EmptyState";
import { BatchActionBar } from "./BatchActionBar";

export type ApiTableProps = {
  endpoints: ApiEndpoint[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  searchKeyword: string;
  selectedId: string | null;
  selectedIds: string[];
  onSelect: (id: string) => void;
  onToggleMulti: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearSelection: () => void;
  onPageChange: (page: number, pageSize: number) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (id: string) => void;
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
  onDeprecate: (id: string) => void;
  onViewDocs: (id: string) => void;
  onViewLogs: (id: string) => void;
  onBatchDeprecate: () => void;
  onBatchDelete: () => void;
  onBatchTag: () => void;
  onBatchExport: () => void;
  onClearFilters: () => void;
};

function getLatencyColor(ms: number): string {
  if (ms < LATENCY_THRESHOLDS.good) return "text-green-600";
  if (ms < LATENCY_THRESHOLDS.warning) return "text-yellow-600";
  return "text-red-600";
}

export function ApiTable({
  endpoints,
  total,
  page,
  pageSize,
  loading,
  searchKeyword,
  selectedId,
  selectedIds,
  onSelect,
  onToggleMulti,
  onSelectAll,
  onClearSelection,
  onPageChange,
  onToggleFavorite,
  onEdit,
  onCopy,
  onDelete,
  onDeprecate,
  onViewDocs,
  onViewLogs,
  onBatchDeprecate,
  onBatchDelete,
  onBatchTag,
  onBatchExport,
  onClearFilters,
}: ApiTableProps) {
  const allSelected = useMemo(
    () => endpoints.length > 0 && endpoints.every((e) => selectedIds.includes(e.id)),
    [endpoints, selectedIds],
  );

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      onClearSelection();
    } else {
      onSelectAll(endpoints.map((e) => e.id));
    }
  }, [allSelected, endpoints, onSelectAll, onClearSelection]);

  const columns: TableProps<ApiEndpoint>["columns"] = useMemo(
    () => [
      {
        title: (
          <Checkbox
            checked={allSelected}
            indeterminate={selectedIds.length > 0 && !allSelected}
            onChange={handleSelectAll}
          />
        ),
        key: "checkbox",
        width: 40,
        render: (_: unknown, record: ApiEndpoint) => (
          <Checkbox
            checked={selectedIds.includes(record.id)}
            onChange={() => onToggleMulti(record.id)}
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      {
        title: "",
        key: "favorite",
        width: 36,
        render: (_: unknown, record: ApiEndpoint) => (
          <Button
            type="text"
            size="small"
            icon={
              record.isFavorite ? (
                <HeartFilled className="text-red-400" />
              ) : (
                <HeartOutlined className="text-gray-300" />
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
        key: "name",
        ellipsis: true,
        sorter: true,
        render: (_: unknown, record: ApiEndpoint) => (
          <div>
            <div className="font-medium">
              <SearchHighlight text={record.name} keyword={searchKeyword} />
            </div>
            <div className="text-xs text-gray-400 font-mono">
              <SearchHighlight text={record.path} keyword={searchKeyword} />
            </div>
          </div>
        ),
      },
      {
        title: "Method",
        key: "methods",
        width: 120,
        render: (_: unknown, record: ApiEndpoint) => (
          <div className="flex flex-wrap gap-1">
            {record.methods.map((m) => (
              <MethodBadge key={m} method={m} />
            ))}
          </div>
        ),
      },
      {
        title: "Service",
        dataIndex: "serviceName",
        key: "serviceName",
        width: 120,
        sorter: true,
        ellipsis: true,
      },
      {
        title: "Status",
        key: "status",
        width: 90,
        sorter: true,
        render: (_: unknown, record: ApiEndpoint) => (
          <StatusTag status={record.status} />
        ),
      },
      {
        title: "Calls (24h)",
        key: "calls24h",
        width: 100,
        sorter: true,
        render: (_: unknown, record: ApiEndpoint) => (
          <span className="font-mono text-sm">
            {record.stats.calls24h.toLocaleString()}
          </span>
        ),
      },
      {
        title: "Avg Latency",
        key: "avgLatency",
        width: 100,
        sorter: true,
        render: (_: unknown, record: ApiEndpoint) => (
          <span className={clsx("font-mono text-sm", getLatencyColor(record.stats.avgLatencyMs))}>
            {record.stats.avgLatencyMs}ms
          </span>
        ),
      },
      {
        title: "Error Rate",
        key: "errorRate",
        width: 100,
        sorter: true,
        render: (_: unknown, record: ApiEndpoint) => {
          const percent = +(record.stats.errorRate * 100).toFixed(1);
          return (
            <div className="flex items-center gap-2">
              <Progress
                percent={percent}
                size="small"
                showInfo={false}
                strokeColor={record.stats.errorRate > ERROR_RATE_THRESHOLD ? "#ff4d4f" : "#52c41a"}
                className="w-12"
              />
              <span
                className={clsx(
                  "text-xs",
                  record.stats.errorRate > ERROR_RATE_THRESHOLD ? "text-red-500" : "text-gray-500",
                )}
              >
                {percent}%
              </span>
            </div>
          );
        },
      },
      {
        title: "Updated",
        key: "updatedAt",
        width: 120,
        sorter: true,
        render: (_: unknown, record: ApiEndpoint) => (
          <Tooltip title={new Date(record.updatedAt).toLocaleString()}>
            <span className="text-xs text-gray-500">
              {getRelativeTime(record.updatedAt)}
            </span>
          </Tooltip>
        ),
      },
      {
        title: "",
        key: "actions",
        width: 50,
        render: (_: unknown, record: ApiEndpoint) => (
          <Dropdown
            menu={{
              items: [
                { key: "edit", icon: <EditOutlined />, label: "Edit" },
                { key: "copy", icon: <CopyOutlined />, label: "Duplicate" },
                { key: "docs", icon: <FileTextOutlined />, label: "View Docs" },
                { key: "logs", icon: <UnorderedListOutlined />, label: "View Logs" },
                { type: "divider" },
                {
                  key: "deprecate",
                  icon: <StopOutlined />,
                  label: record.status === "deprecated" ? "Restore" : "Mark Deprecated",
                },
                {
                  key: "delete",
                  icon: <DeleteOutlined />,
                  label: "Delete",
                  danger: true,
                },
              ],
              onClick: ({ key, domEvent }) => {
                domEvent.stopPropagation();
                switch (key) {
                  case "edit":
                    onEdit(record.id);
                    break;
                  case "copy":
                    onCopy(record.id);
                    break;
                  case "docs":
                    onViewDocs(record.id);
                    break;
                  case "logs":
                    onViewLogs(record.id);
                    break;
                  case "deprecate":
                    onDeprecate(record.id);
                    break;
                  case "delete":
                    onDelete(record.id);
                    break;
                }
              },
            }}
            trigger={["click"]}
          >
            <Button
              type="text"
              size="small"
              icon={<EllipsisOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        ),
      },
    ],
    [
      allSelected,
      selectedIds,
      searchKeyword,
      handleSelectAll,
      onToggleMulti,
      onToggleFavorite,
      onEdit,
      onCopy,
      onDelete,
      onDeprecate,
      onViewDocs,
      onViewLogs,
    ],
  );

  if (!loading && endpoints.length === 0) {
    return <EmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden px-4">
      <BatchActionBar
        count={selectedIds.length}
        onBatchDeprecate={onBatchDeprecate}
        onBatchDelete={onBatchDelete}
        onBatchTag={onBatchTag}
        onBatchExport={onBatchExport}
        onClearSelection={onClearSelection}
      />
      <div className="flex-1 overflow-auto">
        <Table
          dataSource={endpoints}
          columns={columns}
          rowKey="id"
          size="middle"
          loading={loading}
          pagination={false}
          rowClassName={(record) =>
            clsx(
              "cursor-pointer transition-colors",
              record.id === selectedId && "bg-blue-50",
            )
          }
          onRow={(record) => ({
            onClick: () => onSelect(record.id),
          })}
        />
      </div>
      <div className="flex justify-end border-t py-3">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          pageSizeOptions={PAGE_SIZE_OPTIONS.map(String)}
          onChange={onPageChange}
          showTotal={(t) => `Total ${t} APIs`}
        />
      </div>
    </div>
  );
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
