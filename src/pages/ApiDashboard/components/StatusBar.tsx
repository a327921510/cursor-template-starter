import { memo } from "react";
import { Button, Switch, Select, Space } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { AUTO_REFRESH_INTERVALS } from "../constants";

export type StatusBarProps = {
  lastSyncTime: string | null;
  filteredCount: number;
  totalCount: number;
  errorCount: number;
  autoRefreshEnabled: boolean;
  autoRefreshInterval: number;
  onToggleAutoRefresh: () => void;
  onIntervalChange: (val: number) => void;
  onManualRefresh: () => void;
};

export const StatusBar = memo(function StatusBar({
  lastSyncTime,
  filteredCount,
  totalCount,
  errorCount,
  autoRefreshEnabled,
  autoRefreshInterval,
  onToggleAutoRefresh,
  onIntervalChange,
  onManualRefresh,
}: StatusBarProps) {
  return (
    <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-2 text-xs text-gray-500">
      <Space size="large">
        <span>
          Last sync: {lastSyncTime ?? "—"}
        </span>
        <span>
          {filteredCount} / {totalCount} APIs
        </span>
        {errorCount > 0 && (
          <span className="text-red-500">{errorCount} errors</span>
        )}
      </Space>

      <Space size="middle">
        <Space size="small">
          <span>Auto refresh:</span>
          <Switch
            size="small"
            checked={autoRefreshEnabled}
            onChange={onToggleAutoRefresh}
          />
          {autoRefreshEnabled && (
            <Select
              size="small"
              value={autoRefreshInterval}
              onChange={onIntervalChange}
              options={AUTO_REFRESH_INTERVALS.map((i) => ({
                value: i.value,
                label: i.label,
              }))}
              className="w-16"
            />
          )}
        </Space>
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          onClick={onManualRefresh}
        >
          Refresh
        </Button>
      </Space>
    </div>
  );
});
