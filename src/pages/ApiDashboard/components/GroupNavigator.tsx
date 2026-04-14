import { useCallback, useMemo, useState } from "react";
import { Tree, Segmented, Button, Tooltip, Badge } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  TagsOutlined,
  CheckCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";
import type { GroupMode, GroupNode, ApiEndpoint } from "../types";
import { GROUP_MODE_LABELS } from "../constants";
import { GroupPieChart } from "./GroupPieChart";

export type GroupNavigatorProps = {
  endpoints: ApiEndpoint[];
  groupMode: GroupMode;
  selectedGroupId: string | null;
  onGroupModeChange: (mode: GroupMode) => void;
  onGroupSelect: (groupId: string | null) => void;
};

const MODE_ICONS: Record<GroupMode, React.ReactNode> = {
  service: <AppstoreOutlined />,
  tag: <TagsOutlined />,
  status: <CheckCircleOutlined />,
  favorites: <StarOutlined />,
};

export function GroupNavigator({
  endpoints,
  groupMode,
  selectedGroupId,
  onGroupModeChange,
  onGroupSelect,
}: GroupNavigatorProps) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("api-dashboard-nav-collapsed") === "true";
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("api-dashboard-nav-collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const groups = useMemo((): GroupNode[] => {
    switch (groupMode) {
      case "service": {
        const map = new Map<string, { name: string; count: number }>();
        for (const ep of endpoints) {
          const existing = map.get(ep.serviceId);
          if (existing) {
            existing.count++;
          } else {
            map.set(ep.serviceId, { name: ep.serviceName, count: 1 });
          }
        }
        return Array.from(map.entries()).map(([id, { name, count }]) => ({
          id,
          name,
          count,
        }));
      }
      case "tag": {
        const map = new Map<string, { name: string; count: number }>();
        for (const ep of endpoints) {
          for (const tag of ep.tags) {
            const existing = map.get(tag.id);
            if (existing) {
              existing.count++;
            } else {
              map.set(tag.id, { name: tag.name, count: 1 });
            }
          }
        }
        return Array.from(map.entries()).map(([id, { name, count }]) => ({
          id,
          name,
          count,
        }));
      }
      case "status": {
        const map = new Map<string, number>();
        for (const ep of endpoints) {
          map.set(ep.status, (map.get(ep.status) ?? 0) + 1);
        }
        return Array.from(map.entries()).map(([status, count]) => ({
          id: status,
          name: status.charAt(0).toUpperCase() + status.slice(1),
          count,
        }));
      }
      case "favorites":
        return endpoints
          .filter((ep) => ep.isFavorite)
          .map((ep) => ({ id: ep.id, name: ep.name, count: 1 }));
      default:
        return [];
    }
  }, [endpoints, groupMode]);

  const treeData = useMemo(
    () =>
      groups.map((g) => ({
        key: g.id,
        title: (
          <div className="flex items-center justify-between pr-2">
            <span className="truncate">{g.name}</span>
            <Badge count={g.count} size="small" color="#8c8c8c" />
          </div>
        ),
      })),
    [groups],
  );

  const handleTreeSelect = useCallback(
    (selectedKeys: React.Key[]) => {
      const key = selectedKeys[0] as string | undefined;
      onGroupSelect(key ?? null);
    },
    [onGroupSelect],
  );

  const handlePieClick = useCallback(
    (groupId: string) => {
      onGroupSelect(groupId);
    },
    [onGroupSelect],
  );

  if (collapsed) {
    return (
      <div className="flex w-12 flex-col items-center border-r bg-gray-50 py-2">
        <Button
          type="text"
          size="small"
          icon={<MenuUnfoldOutlined />}
          onClick={handleToggleCollapse}
        />
        <div className="mt-4 flex flex-col gap-2">
          {(Object.keys(MODE_ICONS) as GroupMode[]).map((mode) => (
            <Tooltip key={mode} title={GROUP_MODE_LABELS[mode]} placement="right">
              <Button
                type={groupMode === mode ? "primary" : "text"}
                size="small"
                icon={MODE_ICONS[mode]}
                onClick={() => onGroupModeChange(mode)}
              />
            </Tooltip>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-60 flex-col border-r bg-gray-50">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-semibold text-gray-700">Groups</span>
        <Button
          type="text"
          size="small"
          icon={<MenuFoldOutlined />}
          onClick={handleToggleCollapse}
        />
      </div>

      <div className="px-3 py-2">
        <Segmented
          block
          size="small"
          value={groupMode}
          onChange={(val) => onGroupModeChange(val as GroupMode)}
          options={(Object.keys(GROUP_MODE_LABELS) as GroupMode[]).map((m) => ({
            value: m,
            label: GROUP_MODE_LABELS[m],
          }))}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-1">
        <Tree
          treeData={treeData}
          selectedKeys={selectedGroupId ? [selectedGroupId] : []}
          onSelect={handleTreeSelect}
          blockNode
        />
      </div>

      <div className="border-t px-2 py-2">
        <div className="mb-1 text-xs font-medium text-gray-500">Distribution</div>
        <GroupPieChart groups={groups} onGroupClick={handlePieClick} />
      </div>
    </div>
  );
}
