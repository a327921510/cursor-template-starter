import { useCallback, useMemo, useState } from "react";
import { Badge, Menu, Tooltip, Typography } from "antd";
import {
  AppstoreOutlined,
  FolderOutlined,
  HeartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TagOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import type { ApiEndpoint, GroupMode, Service, Tag } from "../types";
import { STATUS_LABELS } from "../constants";
import { GroupPieChart } from "./GroupPieChart";

export type GroupNavigatorProps = {
  endpoints: ApiEndpoint[];
  services: Service[];
  tags: Tag[];
  groupMode: GroupMode;
  selectedGroupId: string | null;
  onGroupModeChange: (mode: GroupMode) => void;
  onGroupSelect: (id: string | null) => void;
};

type GroupItem = {
  id: string;
  name: string;
  count: number;
};

const MODE_ICONS: Record<GroupMode, React.ReactNode> = {
  service: <FolderOutlined />,
  tag: <TagOutlined />,
  status: <WarningOutlined />,
  favorites: <HeartOutlined />,
};

function getCollapsedFromStorage(): boolean {
  try {
    return localStorage.getItem("api-dashboard-sidebar-collapsed") === "true";
  } catch {
    return false;
  }
}

export function GroupNavigator({
  endpoints,
  services,
  tags,
  groupMode,
  selectedGroupId,
  onGroupModeChange,
  onGroupSelect,
}: GroupNavigatorProps) {
  const [collapsed, setCollapsed] = useState(getCollapsedFromStorage);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("api-dashboard-sidebar-collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const groups: GroupItem[] = useMemo(() => {
    switch (groupMode) {
      case "service":
        return services.map((s) => ({
          id: s.id,
          name: s.name,
          count: endpoints.filter((e) => e.serviceId === s.id).length,
        }));
      case "tag":
        return tags.map((t) => ({
          id: t.id,
          name: t.name,
          count: endpoints.filter((e) => e.tags.some((et) => et.id === t.id)).length,
        }));
      case "status":
        return (["active", "deprecated", "draft", "error"] as const).map((s) => ({
          id: s,
          name: STATUS_LABELS[s],
          count: endpoints.filter((e) => e.status === s).length,
        }));
      case "favorites":
        return [
          {
            id: "__favorites__",
            name: "All Favorites",
            count: endpoints.filter((e) => e.isFavorite).length,
          },
        ];
      default:
        return [];
    }
  }, [groupMode, services, tags, endpoints]);

  const menuItems = useMemo(
    () =>
      groups.map((g) => ({
        key: g.id,
        label: (
          <div className="flex items-center justify-between">
            <span className="truncate">{g.name}</span>
            <Badge count={g.count} size="small" color="blue" />
          </div>
        ),
      })),
    [groups],
  );

  if (collapsed) {
    return (
      <div className="flex w-12 flex-col items-center border-r bg-gray-50 py-2">
        <Tooltip title="Expand sidebar" placement="right">
          <MenuUnfoldOutlined
            className="mb-4 cursor-pointer text-gray-500 hover:text-blue-500"
            onClick={toggleCollapsed}
          />
        </Tooltip>
        {(["service", "tag", "status", "favorites"] as GroupMode[]).map((mode) => (
          <Tooltip key={mode} title={mode} placement="right">
            <div
              className={`mb-2 cursor-pointer rounded p-1.5 ${
                groupMode === mode ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-200"
              }`}
              onClick={() => onGroupModeChange(mode)}
            >
              {MODE_ICONS[mode]}
            </div>
          </Tooltip>
        ))}
      </div>
    );
  }

  return (
    <div className="flex w-60 flex-col border-r bg-gray-50">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <Typography.Text strong className="text-sm">
          <AppstoreOutlined className="mr-1" />
          Navigator
        </Typography.Text>
        <Tooltip title="Collapse sidebar">
          <MenuFoldOutlined
            className="cursor-pointer text-gray-400 hover:text-blue-500"
            onClick={toggleCollapsed}
          />
        </Tooltip>
      </div>

      <div className="flex gap-1 border-b px-2 py-2">
        {(["service", "tag", "status", "favorites"] as GroupMode[]).map((mode) => (
          <Tooltip key={mode} title={mode}>
            <div
              className={`cursor-pointer rounded px-2 py-1 text-xs ${
                groupMode === mode
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
              onClick={() => {
                onGroupModeChange(mode);
                onGroupSelect(null);
              }}
            >
              {MODE_ICONS[mode]}
            </div>
          </Tooltip>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <Menu
          mode="inline"
          selectedKeys={selectedGroupId ? [selectedGroupId] : []}
          items={menuItems}
          onClick={({ key }) => onGroupSelect(key === selectedGroupId ? null : key)}
          className="border-none bg-transparent"
        />
      </div>

      <div className="border-t p-2">
        <Typography.Text type="secondary" className="mb-1 block text-xs">
          Distribution
        </Typography.Text>
        <GroupPieChart data={groups} onSelect={onGroupSelect} />
      </div>
    </div>
  );
}
