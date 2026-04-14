import { useCallback, useEffect, useMemo } from "react";
import {
  Button,
  Descriptions,
  Divider,
  Space,
  Tag,
  Typography,
  Collapse,
  Skeleton,
  Modal,
  message,
} from "antd";
import {
  EditOutlined,
  ThunderboltOutlined,
  CopyOutlined,
  FileTextOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ApiEndpoint, ApiVersion, Permission } from "../types";
import { useApiVersions } from "../hooks/useApiVersions";
import { useApiPermissions } from "../hooks/useApiPermissions";
import { MethodBadge } from "./MethodBadge";
import { StatusTag } from "./StatusTag";
import { VersionTimeline } from "./VersionTimeline";
import { PermissionTable } from "./PermissionTable";
import { HealthMiniChart } from "./HealthMiniChart";

const { Text, Paragraph } = Typography;

export type ApiDetailPanelProps = {
  detail: ApiEndpoint | null;
  loading: boolean;
  onEdit: (id: string) => void;
  onTest: (id: string) => void;
  onDelete: (id: string) => void;
  recentApis: { id: string; name: string }[];
  onSelectRecent: (id: string) => void;
};

export function ApiDetailPanel({
  detail,
  loading,
  onEdit,
  onTest,
  onDelete,
  recentApis,
  onSelectRecent,
}: ApiDetailPanelProps) {
  const { versions, loading: versionsLoading } = useApiVersions(
    detail?.id ?? null,
  );
  const {
    permissions,
    removePermission,
    resetPermissions,
  } = useApiPermissions(detail?.permissions ?? []);

  useEffect(() => {
    if (detail?.permissions) {
      resetPermissions(detail.permissions);
    }
  }, [detail?.permissions, resetPermissions]);

  const handlePermissionLevelChange = useCallback(
    (id: string, level: Permission["level"]) => {
      // Would call updatePermissions here; simplified for now
      void id;
      void level;
    },
    [],
  );

  const handleViewDiff = useCallback((_version: ApiVersion) => {
    Modal.info({
      title: `Version ${_version.version}`,
      content: <pre className="text-xs">{_version.changelog}</pre>,
      width: 600,
    });
  }, []);

  const handleCopyPath = useCallback(() => {
    if (detail) {
      navigator.clipboard.writeText(detail.path);
      message.success("Path copied");
    }
  }, [detail]);

  const healthData = useMemo(() => {
    if (!detail) return { successRates: [], currentStatus: "healthy" as const, alerts: [] };
    const rate = 1 - detail.stats.errorRate;
    const status: "healthy" | "degraded" | "down" =
      rate > 0.99 ? "healthy" : rate > 0.95 ? "degraded" : "down";
    return {
      successRates: detail.stats.callsTrend.map(() =>
        Math.max(0, rate + (Math.random() - 0.5) * 0.05),
      ),
      currentStatus: status,
      alerts: [],
    };
  }, [detail]);

  if (loading) {
    return (
      <div className="w-80 border-l p-4">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex w-80 flex-col items-center justify-center border-l p-6 text-center">
        <div className="text-4xl text-gray-300 mb-3">📋</div>
        <Text strong className="text-gray-600">
          Select an API
        </Text>
        <Text type="secondary" className="text-sm mt-1">
          Choose an API from the list to view details
        </Text>

        {recentApis.length > 0 && (
          <div className="mt-6 w-full">
            <Text type="secondary" className="text-xs mb-2 block">
              Recently viewed
            </Text>
            <div className="space-y-1">
              {recentApis.map((api) => (
                <Button
                  key={api.id}
                  type="text"
                  size="small"
                  block
                  onClick={() => onSelectRecent(api.id)}
                  className="text-left"
                >
                  {api.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const collapseItems = [
    {
      key: "info",
      label: "Basic Info",
      children: (
        <Descriptions column={1} size="small">
          <Descriptions.Item label="Path">{detail.path}</Descriptions.Item>
          <Descriptions.Item label="Methods">
            <Space size={4} wrap>
              {detail.methods.map((m) => (
                <MethodBadge key={m} method={m} />
              ))}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Service">
            {detail.serviceName}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <StatusTag status={detail.status} />
          </Descriptions.Item>
          <Descriptions.Item label="Tags">
            <Space size={4} wrap>
              {detail.tags.map((tag) => (
                <Tag key={tag.id} color={tag.color}>
                  {tag.name}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {new Date(detail.createdAt).toLocaleDateString()} by{" "}
            {detail.createdBy}
          </Descriptions.Item>
          <Descriptions.Item label="Updated">
            {new Date(detail.updatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: "description",
      label: "Description",
      children: (
        <Paragraph
          ellipsis={{ rows: 4, expandable: true, symbol: "more" }}
          className="text-sm"
        >
          {detail.description || "No description provided."}
        </Paragraph>
      ),
    },
    {
      key: "versions",
      label: `Versions (${versions.length})`,
      children: (
        <VersionTimeline
          versions={versions}
          loading={versionsLoading}
          onViewDiff={handleViewDiff}
          onViewAll={() => {}}
        />
      ),
    },
    {
      key: "permissions",
      label: `Permissions (${permissions.length})`,
      children: (
        <PermissionTable
          permissions={permissions}
          onRemove={removePermission}
          onLevelChange={handlePermissionLevelChange}
        />
      ),
    },
    {
      key: "health",
      label: "Health Status",
      children: (
        <HealthMiniChart
          successRates={healthData.successRates}
          currentStatus={healthData.currentStatus}
          alerts={healthData.alerts}
        />
      ),
    },
  ];

  return (
    <div className="flex w-80 flex-col border-l">
      <div className="border-b px-4 py-3">
        <Text strong className="text-base block truncate">
          {detail.name}
        </Text>
        <Text type="secondary" className="text-xs block truncate">
          v{detail.currentVersion}
        </Text>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Collapse
          defaultActiveKey={["info", "health"]}
          ghost
          items={collapseItems}
        />
      </div>

      <Divider className="my-0" />

      <div className="flex flex-wrap gap-2 px-4 py-3">
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => onEdit(detail.id)}
        >
          Edit
        </Button>
        <Button
          size="small"
          icon={<ThunderboltOutlined />}
          onClick={() => onTest(detail.id)}
        >
          Test
        </Button>
        <Button
          size="small"
          icon={<CopyOutlined />}
          onClick={handleCopyPath}
        >
          Copy Path
        </Button>
        <Button
          size="small"
          icon={<FileTextOutlined />}
          onClick={() => window.open(`/docs/${detail.id}`, "_blank")}
        >
          Docs
        </Button>
        <Button
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(detail.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
