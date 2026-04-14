import { Button, Timeline, Typography } from "antd";
import type { ApiVersion } from "../types";

export type VersionTimelineProps = {
  versions: ApiVersion[];
  isLoading: boolean;
  onViewDiff: (version: ApiVersion) => void;
  onViewAll: () => void;
};

export function VersionTimeline({
  versions,
  isLoading,
  onViewDiff,
  onViewAll,
}: VersionTimelineProps) {
  if (isLoading) {
    return <div className="py-4 text-center text-sm text-gray-400">Loading versions...</div>;
  }

  if (versions.length === 0) {
    return <div className="py-4 text-center text-sm text-gray-400">No version history</div>;
  }

  return (
    <div>
      <Timeline
        items={versions.slice(0, 10).map((v) => ({
          children: (
            <div
              className="cursor-pointer hover:bg-gray-50 rounded p-1 -m-1"
              onClick={() => onViewDiff(v)}
            >
              <div className="flex items-center justify-between">
                <Typography.Text strong className="text-sm">
                  v{v.version}
                </Typography.Text>
                <Typography.Text type="secondary" className="text-xs">
                  {new Date(v.createdAt).toLocaleDateString()}
                </Typography.Text>
              </div>
              <Typography.Paragraph
                type="secondary"
                className="mb-0 mt-0.5 text-xs"
                ellipsis={{ rows: 2 }}
              >
                {v.changelog}
              </Typography.Paragraph>
              <Typography.Text type="secondary" className="text-xs">
                by {v.createdBy}
              </Typography.Text>
            </div>
          ),
        }))}
      />
      {versions.length > 10 && (
        <Button type="link" size="small" onClick={onViewAll} className="px-0">
          View all {versions.length} versions
        </Button>
      )}
    </div>
  );
}
