import { Button, Empty } from "antd";

export type EmptyStateProps = {
  description?: string;
  onClearFilters?: () => void;
};

export function EmptyState({
  description = "No matching APIs found",
  onClearFilters,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Empty description={description}>
        {onClearFilters && (
          <Button type="primary" onClick={onClearFilters}>
            Clear Filters
          </Button>
        )}
      </Empty>
    </div>
  );
}
