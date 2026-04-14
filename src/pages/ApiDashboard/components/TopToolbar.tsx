import { useCallback, useState } from "react";
import { Button, Checkbox, Dropdown, Input, Select } from "antd";
import {
  DownloadOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { Filters, GroupMode, SortField } from "../types";
import { ALL_STATUSES, GROUP_MODE_OPTIONS, SORT_OPTIONS, STATUS_LABELS } from "../constants";
import type { ApiStatus } from "../types";

export type TopToolbarProps = {
  filters: Filters;
  groupMode: GroupMode;
  onFiltersChange: (filters: Partial<Filters>) => void;
  onGroupModeChange: (mode: GroupMode) => void;
  onCreateNew: () => void;
  onExport: (format: "json" | "csv" | "openapi") => void;
};

export function TopToolbar({
  filters,
  groupMode,
  onFiltersChange,
  onGroupModeChange,
  onCreateNew,
  onExport,
}: TopToolbarProps) {
  const [searchValue, setSearchValue] = useState(filters.search);
  const searchTimerRef = useCallback(
    (() => {
      let timer: ReturnType<typeof setTimeout> | null = null;
      return (value: string) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          onFiltersChange({ search: value });
        }, 300);
      };
    })(),
    [onFiltersChange],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      searchTimerRef(value);
    },
    [searchTimerRef],
  );

  const handleStatusToggle = useCallback(
    (status: ApiStatus, checked: boolean) => {
      const next = checked
        ? [...filters.statuses, status]
        : filters.statuses.filter((s) => s !== status);
      onFiltersChange({ statuses: next.length > 0 ? next : ALL_STATUSES });
    },
    [filters.statuses, onFiltersChange],
  );

  return (
    <div className="flex flex-wrap items-center gap-3 border-b bg-white px-4 py-3">
      <Input
        placeholder="Search APIs... (method:GET, status:active, etc.)"
        prefix={<SearchOutlined className="text-gray-400" />}
        value={searchValue}
        onChange={(e) => handleSearchChange(e.target.value)}
        allowClear
        className="w-72"
      />

      <div className="flex items-center gap-1">
        {ALL_STATUSES.map((status) => (
          <Checkbox
            key={status}
            checked={filters.statuses.includes(status)}
            onChange={(e) => handleStatusToggle(status, e.target.checked)}
          >
            <span className="text-xs">{STATUS_LABELS[status]}</span>
          </Checkbox>
        ))}
      </div>

      <Select
        value={groupMode}
        onChange={onGroupModeChange}
        options={GROUP_MODE_OPTIONS}
        className="w-32"
        size="middle"
      />

      <Select
        value={filters.sort}
        onChange={(value: SortField) => onFiltersChange({ sort: value })}
        options={SORT_OPTIONS}
        className="w-40"
        size="middle"
      />

      <div className="ml-auto flex items-center gap-2">
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreateNew}>
          New API
        </Button>
        <Dropdown
          menu={{
            items: [
              { key: "json", label: "Export JSON" },
              { key: "csv", label: "Export CSV" },
              { key: "openapi", label: "Export OpenAPI" },
            ],
            onClick: ({ key }) => onExport(key as "json" | "csv" | "openapi"),
          }}
        >
          <Button icon={<DownloadOutlined />}>Export</Button>
        </Dropdown>
      </div>
    </div>
  );
}
