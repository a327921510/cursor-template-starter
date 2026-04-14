import type { ApiStatus, GroupMode, SortField } from "./types";

export const STATUS_COLORS: Record<ApiStatus, string> = {
  active: "green",
  deprecated: "default",
  draft: "blue",
  error: "red",
};

export const STATUS_LABELS: Record<ApiStatus, string> = {
  active: "Active",
  deprecated: "Deprecated",
  draft: "Draft",
  error: "Error",
};

export const METHOD_COLORS: Record<string, string> = {
  GET: "blue",
  POST: "green",
  PUT: "orange",
  PATCH: "cyan",
  DELETE: "red",
  HEAD: "purple",
  OPTIONS: "default",
};

export const GROUP_MODE_LABELS: Record<GroupMode, string> = {
  service: "By Service",
  tag: "By Tag",
  status: "By Status",
  favorites: "Favorites",
};

export const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "updatedAt-desc", label: "Recently Updated" },
  { value: "updatedAt-asc", label: "Least Recently Updated" },
  { value: "calls-desc", label: "Most Calls" },
  { value: "calls-asc", label: "Least Calls" },
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
  warn: 300,
} as const;

export const ERROR_RATE_THRESHOLD = 0.05;

export const AUTO_REFRESH_INTERVALS = [
  { value: 15, label: "15s" },
  { value: 30, label: "30s" },
  { value: 60, label: "60s" },
] as const;

export const TREND_RANGE_LABELS: Record<string, string> = {
  "24h": "Last 24h",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  custom: "Custom",
};
