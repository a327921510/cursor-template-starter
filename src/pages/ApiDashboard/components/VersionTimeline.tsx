import { memo } from "react";
import { Timeline, Button, Typography } from "antd";
import { TagOutlined } from "@ant-design/icons";
import type { ApiVersion } from "../types";

const { Text } = Typography;

export type VersionTimelineProps = {
  versions: ApiVersion[];
  loading: boolean;
  onViewDiff: (version: ApiVersion) => void;
  onViewAll: () => void;
};

export const VersionTimeline = memo(function VersionTimeline({
  versions,
  loading,
  onViewDiff,
  onViewAll,
}: VersionTimelineProps) {
  if (loading) {
    return <div className="py-4 text-center text-gray-400 text-sm">Loading versions...</div>;
  }

  if (versions.length === 0) {
    return <div className="py-4 text-center text-gray-400 text-sm">No version history</div>;
  }

  const items = versions.slice(0, 10).map((v) => ({
    dot: <TagOutlined className="text-blue-500" />,
    children: (
      <div className="cursor-pointer" onClick={() => onViewDiff(v)}>
        <div className="flex items-center gap-2">
          <Text strong className="text-sm">
            v{v.version}
          </Text>
          <Text type="secondary" className="text-xs">
            {new Date(v.createdAt).toLocaleDateString()}
          </Text>
        </div>
        <Text className="text-xs text-gray-500 line-clamp-2">
          {v.changelog}
        </Text>
        <Text type="secondary" className="text-xs">
          by {v.createdBy}
        </Text>
      </div>
    ),
  }));

  return (
    <div>
      <Timeline items={items} />
      {versions.length > 10 && (
        <Button type="link" size="small" onClick={onViewAll}>
          View all versions
        </Button>
      )}
    </div>
  );
});
