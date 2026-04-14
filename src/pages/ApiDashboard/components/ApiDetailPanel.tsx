import { useEffect } from "react";
import { Button, Collapse, Descriptions, Divider, Skeleton, Space, Tag, Tooltip, Typography } from "antd";
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  SendOutlined,
} from "@ant-design/icons";
import type { ApiEndpoint, ApiVersion, Permission } from "../types";
import { MethodBadge } from "./MethodBadge";
import { StatusTag } from "./StatusTag";
import { VersionTimeline } from "./VersionTimeline";
import { PermissionTable } from "./PermissionTable";
import { HealthMiniChart } from "./HealthMiniChart";

export type ApiDetailPanelProps = {
  api: ApiEndpoint | null;
  loading: boolean;
  versions: ApiVersion[];
  versionsLoading: boolean;
  permissions: Permission[];
  onEdit: (id: string) => void;
  onTest: (id: string) => void;
  onDelete: (id: string) => void;
  onCopyPath: (path: string) => void;
  onViewDocs: (id: string) => void;
  onViewDiff: (version: ApiVersion) => void;
  onViewAllVersions: () => void;
  onRemovePermission: (id: string) => void;
  recentApis?: { id: string; name: string }[];
  onSelectRecent?: (id: string) => void;
};

export function ApiDetailPanel({
  api,
  loading,
  versions,
  versionsLoading,
  permissions,
  onEdit,
  onTest,
  onDelete,
  onCopyPath,
  onViewDocs,
  onViewDiff,
  onViewAllVersions,
  onRemovePermission,
  recentApis = [],
  onSelectRecent,
}: ApiDetailPanelProps) {
  useEffect(() => {
    // Reset scroll on api change
  }, [api?.id]);

  if (!api && !loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 text-5xl text-gray-300">
          <FileTextOutlined />
        </div>
        <Typography.Text type="secondary" className="mb-4">
          Select an API from the list to view details
        </Typography.Text>
        {recentApis.length > 0 && (
          <div className="mt-4">
            <Typography.Text type="secondary" className="mb-2 block text-xs">
              Recently viewed
            </Typography.Text>
            <div className="space-y-1">
              {recentApis.map((item) => (
                <Button
                  key={item.id}
                  type="link"
                  size="small"
                  onClick={() => onSelectRecent?.(item.id)}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading || !api) {
    return (
      <div className="p-4">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  const healthStatus =
    api.stats.errorRate > 0.1 ? "down" : api.stats.errorRate > 0.02 ? "degraded" : "healthy";

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b p-4">
        <div className="flex items-start justify-between">
          <div>
            <Typography.Title level={5} className="mb-1">
              {api.name}
            </Typography.Title>
            <div className="flex items-center gap-2">
              <Typography.Text code className="text-xs">
                {api.path}
              </Typography.Text>
              <Tooltip title="Copy path">
                <CopyOutlined
                  className="cursor-pointer text-gray-400 hover:text-blue-500"
                  onClick={() => onCopyPath(api.path)}
                />
              </Tooltip>
            </div>
          </div>
          <StatusTag status={api.status} />
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {api.methods.map((m) => (
            <MethodBadge key={m} method={m} />
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          {api.tags.map((t) => (
            <Tag key={t.id} color={t.color}>
              {t.name}
            </Tag>
          ))}
        </div>

        {api.description && (
          <Typography.Paragraph
            type="secondary"
            className="mt-3 text-sm"
            ellipsis={{ rows: 3, expandable: true, symbol: "more" }}
          >
            {api.description}
          </Typography.Paragraph>
        )}

        <Descriptions size="small" column={1} className="mt-3">
          <Descriptions.Item label="Service">{api.serviceName}</Descriptions.Item>
          <Descriptions.Item label="Created">
            {new Date(api.createdAt).toLocaleDateString()} by {api.createdBy}
          </Descriptions.Item>
          <Descriptions.Item label="Updated">
            {new Date(api.updatedAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Version">v{api.currentVersion}</Descriptions.Item>
        </Descriptions>
      </div>

      <div className="flex-1 p-4">
        <Collapse
          defaultActiveKey={["health", "versions"]}
          ghost
          items={[
            {
              key: "health",
              label: <Typography.Text strong>Health Status</Typography.Text>,
              children: (
                <HealthMiniChart
                  data={api.stats.callsTrend}
                  status={healthStatus}
                  alerts={[]}
                />
              ),
            },
            {
              key: "versions",
              label: <Typography.Text strong>Version History</Typography.Text>,
              children: (
                <VersionTimeline
                  versions={versions}
                  isLoading={versionsLoading}
                  onViewDiff={onViewDiff}
                  onViewAll={onViewAllVersions}
                />
              ),
            },
            {
              key: "permissions",
              label: <Typography.Text strong>Permissions</Typography.Text>,
              children: (
                <PermissionTable
                  permissions={permissions}
                  onRemove={onRemovePermission}
                />
              ),
            },
          ]}
        />
      </div>

      <Divider className="my-0" />

      <div className="flex justify-center gap-2 p-3">
        <Space wrap>
          <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(api.id)}>
            Edit
          </Button>
          <Button size="small" icon={<SendOutlined />} onClick={() => onTest(api.id)}>
            Test
          </Button>
          <Button size="small" icon={<FileTextOutlined />} onClick={() => onViewDocs(api.id)}>
            Docs
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onDelete(api.id)}>
            Delete
          </Button>
        </Space>
      </div>
    </div>
  );
}
