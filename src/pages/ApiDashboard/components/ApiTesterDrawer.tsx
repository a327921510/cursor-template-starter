import { useCallback, useState } from "react";
import { Button, Drawer, Input, Select, Spin, Tag, Typography } from "antd";
import { SendOutlined } from "@ant-design/icons";
import type { ApiEndpoint, TestResponse } from "../types";

export type ApiTesterDrawerProps = {
  open: boolean;
  api: ApiEndpoint | null;
  response: TestResponse | null;
  loading: boolean;
  error: string | null;
  onSendRequest: (params: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
    body?: string;
    environment: string;
  }) => void;
  onClose: () => void;
};

const ENVIRONMENTS = [
  { value: "dev", label: "Development" },
  { value: "staging", label: "Staging" },
  { value: "prod", label: "Production" },
];

export function ApiTesterDrawer({
  open,
  api,
  response,
  loading,
  error,
  onSendRequest,
  onClose,
}: ApiTesterDrawerProps) {
  const [method, setMethod] = useState(api?.methods[0] ?? "GET");
  const [url, setUrl] = useState(api?.path ?? "");
  const [headers, setHeaders] = useState("{}");
  const [body, setBody] = useState("");
  const [environment, setEnvironment] = useState("dev");

  const resetForm = useCallback(() => {
    if (api) {
      setMethod(api.methods[0] ?? "GET");
      setUrl(api.path);
    }
  }, [api]);

  const handleSend = useCallback(() => {
    let parsedHeaders: Record<string, string> = {};
    try {
      parsedHeaders = JSON.parse(headers) as Record<string, string>;
    } catch {
      // ignore
    }
    onSendRequest({
      method,
      url,
      headers: parsedHeaders,
      body: body || undefined,
      environment,
    });
  }, [method, url, headers, body, environment, onSendRequest]);

  // Sync form when api changes
  if (api && url !== api.path) {
    resetForm();
  }

  const statusColor =
    response && response.statusCode < 400
      ? "green"
      : response && response.statusCode < 500
        ? "orange"
        : "red";

  return (
    <Drawer
      title="API Tester"
      open={open}
      onClose={onClose}
      width={800}
      className="api-tester-drawer"
    >
      <div className="flex h-full gap-4">
        <div className="flex-1 space-y-3">
          <Typography.Text strong>Request</Typography.Text>

          <div className="flex gap-2">
            <Select
              value={method}
              onChange={setMethod}
              className="w-28"
              options={(api?.methods ?? ["GET"]).map((m) => ({
                value: m,
                label: m,
              }))}
            />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="font-mono"
            />
          </div>

          <Select
            value={environment}
            onChange={setEnvironment}
            options={ENVIRONMENTS}
            className="w-full"
          />

          <div>
            <Typography.Text type="secondary" className="mb-1 block text-xs">
              Headers (JSON)
            </Typography.Text>
            <Input.TextArea
              rows={4}
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <div>
            <Typography.Text type="secondary" className="mb-1 block text-xs">
              Body (JSON)
            </Typography.Text>
            <Input.TextArea
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
            block
          >
            Send Request
          </Button>
        </div>

        <div className="flex-1 space-y-3">
          <Typography.Text strong>Response</Typography.Text>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <Spin />
            </div>
          )}

          {error && (
            <div className="rounded bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {response && !loading && (
            <>
              <div className="flex items-center gap-3">
                <Tag color={statusColor}>{response.statusCode}</Tag>
                <Typography.Text type="secondary" className="text-xs">
                  {response.duration}ms
                </Typography.Text>
              </div>

              <div>
                <Typography.Text type="secondary" className="mb-1 block text-xs">
                  Response Headers
                </Typography.Text>
                <pre className="max-h-32 overflow-auto rounded bg-gray-50 p-2 text-xs">
                  {JSON.stringify(response.headers, null, 2)}
                </pre>
              </div>

              <div>
                <Typography.Text type="secondary" className="mb-1 block text-xs">
                  Response Body
                </Typography.Text>
                <pre className="max-h-64 overflow-auto rounded bg-gray-50 p-2 text-xs">
                  {formatJson(response.body)}
                </pre>
              </div>
            </>
          )}

          {!response && !loading && !error && (
            <div className="py-16 text-center text-sm text-gray-400">
              Send a request to see the response
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

function formatJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}
