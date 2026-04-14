import { Button, Select, Switch, Tooltip } from "antd";
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
  onChangeInterval: (seconds: number) => void;
  onManualRefresh: () => void;
};

export function StatusBar({
  lastSyncTime,
  filteredCount,
  totalCount,
  errorCount,
  autoRefreshEnabled,
  autoRefreshInterval,
  onToggleAutoRefresh,
  onChangeInterval,
  onManualRefresh,
}: StatusBarProps) {
  return (
    <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-2 text-xs text-gray-500">
      <div className="flex items-center gap-4">
        <span>
          Last sync: {lastSyncTime ?? "—"}
        </span>
        <span>
          {filteredCount} / {totalCount} APIs
        </span>
        {errorCount > 0 && (
          <span className="font-medium text-red-500">
            {errorCount} errors
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
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
              onChange={onChangeInterval}
              className="w-16"
              options={AUTO_REFRESH_INTERVALS.map((i) => ({
                value: i.value,
                label: i.label,
              }))}
            />
          )}
        </div>
        <Tooltip title="Refresh now">
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={onManualRefresh}
          />
        </Tooltip>
      </div>
    </div>
  );
}
