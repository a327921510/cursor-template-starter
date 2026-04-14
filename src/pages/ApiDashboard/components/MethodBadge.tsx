import { memo } from "react";
import { Tag } from "antd";
import type { HttpMethod } from "../types";
import { METHOD_COLORS } from "../constants";

export type MethodBadgeProps = {
  method: HttpMethod;
};

export const MethodBadge = memo(function MethodBadge({ method }: MethodBadgeProps) {
  return (
    <Tag color={METHOD_COLORS[method]} bordered={false}>
      {method}
    </Tag>
  );
});
