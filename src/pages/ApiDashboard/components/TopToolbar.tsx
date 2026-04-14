import { useCallback, useState } from "react";
import { Input, Button, Select, Checkbox, Dropdown } from "antd";
import {
  PlusOutlined,
  ExportOutlined,
  SearchOutlined,
  FileTextOutlined,
  FileExcelOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import type { Filters, GroupMode, ApiStatus, SortField, ExportFormat } from "../types";
import { ALL_STATUSES, STATUS_LABELS, SORT_OPTIONS, GROUP_MODE_LABELS } from "../constants";

export type TopToolbarProps = {
  filters: Filters;
  groupMode: GroupMode;
  onFiltersChange: (filters: Filters) => void;
  onGroupModeChange: (mode: GroupMode) => void;
  onCreateNew: () => void;
  onExport: (format: ExportFormat) => void;
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
  const searchTimerRef = { current: null as ReturnType<typeof setTimeout> | null };

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSearchValue(val);
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
      searchTimerRef.current = setTimeout(() => {
        onFiltersChange({ ...filters, search: val });
      }, 300);
    },
    [filters, onFiltersChange],
  );

  const handleStatusChange = useCallback(
    (checkedValues: ApiStatus[]) => {
      onFiltersChange({ ...filters, statuses: checkedValues });
    },
    [filters, onFiltersChange],
  );

  const handleSortChange = useCallback(
    (val: SortField) => {
      onFiltersChange({ ...filters, sortField: val });
    },
    [filters, onFiltersChange],
  );

  const exportMenuItems = [
    {
      key: "json",
      label: "JSON",
      icon: <FileTextOutlined />,
      onClick: () => onExport("json"),
    },
    {
      key: "csv",
      label: "CSV",
      icon: <FileExcelOutlined />,
      onClick: () => onExport("csv"),
    },
    {
      key: "openapi",
      label: "OpenAPI Spec (YAML)",
      icon: <ApiOutlined />,
      onClick: () => onExport("openapi"),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 border-b bg-white px-4 py-3">
      <Input
        placeholder="Search APIs... (e.g. method:GET, status:active)"
        prefix={<SearchOutlined className="text-gray-400" />}
        value={searchValue}
        onChange={handleSearchChange}
        allowClear
        className="w-72"
      />

      <Checkbox.Group
        value={filters.statuses}
        onChange={(vals) => handleStatusChange(vals as ApiStatus[])}
      >
        {ALL_STATUSES.map((s) => (
          <Checkbox key={s} value={s}>
            {STATUS_LABELS[s]}
          </Checkbox>
        ))}
      </Checkbox.Group>

      <Select
        size="middle"
        value={groupMode}
        onChange={(val) => onGroupModeChange(val as GroupMode)}
        options={(Object.keys(GROUP_MODE_LABELS) as GroupMode[]).map((m) => ({
          value: m,
          label: GROUP_MODE_LABELS[m],
        }))}
        className="w-32"
      />

      <Select
        size="middle"
        value={filters.sortField}
        onChange={handleSortChange}
        options={SORT_OPTIONS}
        className="w-44"
      />

      <div className="ml-auto flex gap-2">
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreateNew}>
          New API
        </Button>
        <Dropdown menu={{ items: exportMenuItems }}>
          <Button icon={<ExportOutlined />}>Export</Button>
        </Dropdown>
      </div>
    </div>
  );
}
