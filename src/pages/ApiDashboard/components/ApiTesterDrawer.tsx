import { useCallback, useState } from "react";
import {
  Drawer,
  Input,
  Select,
  Button,
  Divider,
  Tag,
  Space,
  Typography,
} from "antd";
import { SendOutlined, MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import type { ApiEndpoint, HttpMethod, TestResult } from "../types";
import { useApiTester } from "../hooks/useApiTester";

const { TextArea } = Input;
const { Text } = Typography;

export type ApiTesterDrawerProps = {
  open: boolean;
  api: ApiEndpoint | null;
  onClose: () => void;
};

type KVPair = { key: string; value: string };

export function ApiTesterDrawer({
  open,
  api,
  onClose,
}: ApiTesterDrawerProps) {
  const { result, loading, sendTest, clearResult } = useApiTester();
  const [method, setMethod] = useState<HttpMethod>("GET");
  const [environment, setEnvironment] = useState("dev");
  const [headers, setHeaders] = useState<KVPair[]>([]);
  const [queryParams, setQueryParams] = useState<KVPair[]>([]);
  const [body, setBody] = useState("");

  const handleOpen = useCallback(() => {
    if (api) {
      setMethod(api.methods[0] ?? "GET");
      setBody("");
      setHeaders([]);
      setQueryParams([]);
      clearResult();
    }
  }, [api, clearResult]);

  const handleSend = useCallback(async () => {
    if (!api) return;
    const headersMap: Record<string, string> = {};
    for (const h of headers) {
      if (h.key) headersMap[h.key] = h.value;
    }
    const paramsMap: Record<string, string> = {};
    for (const p of queryParams) {
      if (p.key) paramsMap[p.key] = p.value;
    }
    await sendTest(api.id, {
      method,
      headers: headersMap,
      queryParams: paramsMap,
      body,
      environment,
    });
  }, [api, method, headers, queryParams, body, environment, sendTest]);

  const updateKV = useCallback(
    (
      setter: React.Dispatch<React.SetStateAction<KVPair[]>>,
      index: number,
      field: "key" | "value",
      val: string,
    ) => {
      setter((prev) =>
        prev.map((item, i) => (i === index ? { ...item, [field]: val } : item)),
      );
    },
    [],
  );

  const addKV = useCallback(
    (setter: React.Dispatch<React.SetStateAction<KVPair[]>>) => {
      setter((prev) => [...prev, { key: "", value: "" }]);
    },
    [],
  );

  const removeKV = useCallback(
    (setter: React.Dispatch<React.SetStateAction<KVPair[]>>, index: number) => {
      setter((prev) => prev.filter((_, i) => i !== index));
    },
    [],
  );

  const renderKVEditor = useCallback(
    (
      items: KVPair[],
      setter: React.Dispatch<React.SetStateAction<KVPair[]>>,
      label: string,
    ) => (
      <div className="mb-4">
        <Text strong className="text-sm mb-2 block">
          {label}
        </Text>
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 mb-1">
            <Input
              size="small"
              placeholder="Key"
              value={item.key}
              onChange={(e) => updateKV(setter, i, "key", e.target.value)}
              className="flex-1"
            />
            <Input
              size="small"
              placeholder="Value"
              value={item.value}
              onChange={(e) => updateKV(setter, i, "value", e.target.value)}
              className="flex-1"
            />
            <Button
              type="text"
              size="small"
              icon={<MinusCircleOutlined />}
              onClick={() => removeKV(setter, i)}
            />
          </div>
        ))}
        <Button
          type="dashed"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => addKV(setter)}
          block
        >
          Add
        </Button>
      </div>
    ),
    [updateKV, addKV, removeKV],
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      afterOpenChange={(visible) => {
        if (visible) handleOpen();
      }}
      title={`Test: ${api?.name ?? ""}`}
      width={720}
    >
      <div className="flex gap-4 h-full">
        <div className="flex-1 overflow-y-auto pr-2">
          <Text strong className="text-sm mb-2 block">
            Request
          </Text>

          <div className="flex gap-2 mb-3">
            <Select
              value={method}
              onChange={(val) => setMethod(val as HttpMethod)}
              className="w-28"
            >
              {api?.methods.map((m) => (
                <Select.Option key={m} value={m}>
                  {m}
                </Select.Option>
              ))}
            </Select>
            <Input value={api?.path ?? ""} disabled className="flex-1" />
            <Select
              value={environment}
              onChange={setEnvironment}
              className="w-28"
            >
              <Select.Option value="dev">Dev</Select.Option>
              <Select.Option value="staging">Staging</Select.Option>
              <Select.Option value="prod">Prod</Select.Option>
            </Select>
          </div>

          {renderKVEditor(headers, setHeaders, "Headers")}
          {renderKVEditor(queryParams, setQueryParams, "Query Params")}

          <Text strong className="text-sm mb-2 block">
            Body
          </Text>
          <TextArea
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='{"key": "value"}'
            className="mb-4 font-mono text-xs"
          />

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

        <Divider type="vertical" className="h-full" />

        <div className="flex-1 overflow-y-auto pl-2">
          <Text strong className="text-sm mb-2 block">
            Response
          </Text>

          {result ? (
            <ResponseDisplay result={result} />
          ) : (
            <div className="flex h-64 items-center justify-center text-gray-400 text-sm">
              Send a request to see the response
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

function ResponseDisplay({ result }: { result: TestResult }) {
  const statusColor = result.statusCode < 400 ? "green" : "red";

  return (
    <div>
      <Space className="mb-3">
        <Tag color={statusColor}>{result.statusCode}</Tag>
        <Text type="secondary" className="text-xs">
          {result.duration}ms
        </Text>
      </Space>

      <div className="mb-3">
        <Text strong className="text-xs mb-1 block">
          Response Headers
        </Text>
        <div className="rounded bg-gray-50 p-2 text-xs max-h-32 overflow-y-auto">
          {Object.entries(result.headers).map(([key, value]) => (
            <div key={key}>
              <Text type="secondary">{key}:</Text> {value}
            </div>
          ))}
        </div>
      </div>

      <div>
        <Text strong className="text-xs mb-1 block">
          Response Body
        </Text>
        <pre className="rounded bg-gray-50 p-2 text-xs max-h-96 overflow-auto">
          {formatJSON(result.body)}
        </pre>
      </div>
    </div>
  );
}

function formatJSON(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}
