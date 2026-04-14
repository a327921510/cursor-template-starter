import { memo } from "react";
import { Tag } from "antd";
import type { ApiStatus } from "../types";
import { STATUS_COLORS, STATUS_LABELS } from "../constants";

export type StatusTagProps = {
  status: ApiStatus;
};

export const StatusTag = memo(function StatusTag({ status }: StatusTagProps) {
  return <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>;
});
