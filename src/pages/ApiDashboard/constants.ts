import type { ApiStatus, GroupMode, SortField } from "./types";

export const STATUS_COLOR_MAP: Record<ApiStatus, string> = {
  active: "green",
  deprecated: "default",
  draft: "blue",
  error: "red",
} as const;

export const STATUS_LABELS: Record<ApiStatus, string> = {
  active: "Active",
  deprecated: "Deprecated",
  draft: "Draft",
  error: "Error",
} as const;

export const METHOD_COLOR_MAP: Record<string, string> = {
  GET: "blue",
  POST: "green",
  PUT: "orange",
  PATCH: "cyan",
  DELETE: "red",
  HEAD: "purple",
  OPTIONS: "default",
} as const;

export const GROUP_MODE_OPTIONS: { value: GroupMode; label: string }[] = [
  { value: "service", label: "By Service" },
  { value: "tag", label: "By Tag" },
  { value: "status", label: "By Status" },
  { value: "favorites", label: "Favorites" },
];

export const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "updatedAt-desc", label: "Recently Updated" },
  { value: "updatedAt-asc", label: "Oldest Updated" },
  { value: "calls-desc", label: "Most Calls" },
  { value: "calls-asc", label: "Fewest Calls" },
  { value: "latency-asc", label: "Lowest Latency" },
  { value: "latency-desc", label: "Highest Latency" },
  { value: "errorRate-desc", label: "Highest Error Rate" },
  { value: "errorRate-asc", label: "Lowest Error Rate" },
];

export const ALL_STATUSES: ApiStatus[] = [
  "active",
  "deprecated",
  "draft",
  "error",
];

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [20, 50, 100];

export const LATENCY_THRESHOLDS = {
  good: 100,
  warning: 300,
} as const;

export const ERROR_RATE_THRESHOLD = 0.05;

export const AUTO_REFRESH_INTERVALS = [
  { value: 15, label: "15s" },
  { value: 30, label: "30s" },
  { value: 60, label: "60s" },
] as const;

export const TREND_RANGE_OPTIONS = [
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
] as const;

export const TREND_GRANULARITY_OPTIONS = [
  { value: "hour", label: "Hourly" },
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
] as const;
