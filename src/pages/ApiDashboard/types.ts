export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export type ApiStatus = "active" | "deprecated" | "draft" | "error";

export type Tag = {
  id: string;
  name: string;
  color: string;
};

export type ApiStats = {
  calls24h: number;
  callsTrend: number[];
  avgLatencyMs: number;
  p95LatencyMs: number;
  errorRate: number;
  lastCallAt: string | null;
};

export type Permission = {
  id: string;
  subjectType: "user" | "role" | "team";
  subjectId: string;
  subjectName: string;
  level: "read" | "write" | "admin";
};

export type ParamDef = {
  name: string;
  type: "string" | "number" | "boolean";
  required: boolean;
  description: string;
  defaultValue?: string;
};

export type ResponseDef = {
  statusCode: number;
  description: string;
  schema: object | null;
  example: string;
};

export type ApiConfig = {
  rateLimitPerMinute: number | null;
  cacheTtlSeconds: number | null;
  timeoutMs: number;
  retryCount: number;
  headers: Record<string, string>;
  queryParams: ParamDef[];
  requestBodySchema: object | null;
  responses: ResponseDef[];
};

export type ApiEndpoint = {
  id: string;
  name: string;
  path: string;
  methods: HttpMethod[];
  serviceId: string;
  serviceName: string;
  status: ApiStatus;
  tags: Tag[];
  description: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  isFavorite: boolean;
  stats: ApiStats;
  currentVersion: string;
  permissions: Permission[];
  config: ApiConfig;
};

export type ApiVersion = {
  id: string;
  apiId: string;
  version: string;
  changelog: string;
  createdAt: string;
  createdBy: string;
  diff: object;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  apiCount: number;
};

export type TrendDataPoint = {
  timestamp: string;
  calls: number;
  avgLatencyMs: number;
  errorCount: number;
};

export type DashboardStats = {
  totalApis: number;
  totalApisWeekChange: number;
  activeApis: number;
  activeApisPercent: number;
  errorApis: number;
  errorApisDayChange: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
};

export type GroupMode = "service" | "tag" | "status" | "favorites";

export type GroupNode = {
  id: string;
  name: string;
  count: number;
  children?: GroupNode[];
};

export type SortField =
  | "name-asc"
  | "name-desc"
  | "updatedAt-desc"
  | "updatedAt-asc"
  | "calls-desc"
  | "calls-asc"
  | "latency-asc"
  | "latency-desc"
  | "errorRate-desc"
  | "errorRate-asc";

export type Filters = {
  search: string;
  statuses: ApiStatus[];
  sortField: SortField;
};

export type TrendRange = "24h" | "7d" | "30d" | "90d" | "custom";
export type TrendGranularity = "hour" | "day" | "week";

export type FormModalState = {
  open: boolean;
  editId?: string;
};

export type TesterDrawerState = {
  open: boolean;
  apiId?: string;
};

export type TestResult = {
  statusCode: number;
  duration: number;
  headers: Record<string, string>;
  body: string;
};

export type ExportFormat = "json" | "csv" | "openapi";
