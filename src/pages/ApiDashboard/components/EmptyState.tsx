import { memo } from "react";
import { Empty, Button } from "antd";

export type EmptyStateProps = {
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = memo(function EmptyState({
  description = "No matching APIs found",
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-16">
      <Empty description={description}>
        {actionLabel && onAction && (
          <Button type="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </Empty>
    </div>
  );
});
