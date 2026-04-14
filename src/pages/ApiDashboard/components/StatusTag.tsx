import { Tag } from "antd";
import { STATUS_COLOR_MAP, STATUS_LABELS } from "../constants";
import type { ApiStatus } from "../types";

export type StatusTagProps = {
  status: ApiStatus;
};

export function StatusTag({ status }: StatusTagProps) {
  return <Tag color={STATUS_COLOR_MAP[status]}>{STATUS_LABELS[status]}</Tag>;
}
