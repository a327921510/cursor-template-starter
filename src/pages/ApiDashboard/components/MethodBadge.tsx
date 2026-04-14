import { Tag } from "antd";
import { METHOD_COLOR_MAP } from "../constants";
import type { HttpMethod } from "../types";

export type MethodBadgeProps = {
  method: HttpMethod;
};

export function MethodBadge({ method }: MethodBadgeProps) {
  return (
    <Tag color={METHOD_COLOR_MAP[method] ?? "default"} className="font-mono text-xs">
      {method}
    </Tag>
  );
}
