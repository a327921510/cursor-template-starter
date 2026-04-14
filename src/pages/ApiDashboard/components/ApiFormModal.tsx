import { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Steps,
  Form,
  Input,
  Select,
  Button,
  Space,
  Switch,
  InputNumber,
  message,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import type { ApiEndpoint, HttpMethod, Service, Tag } from "../types";

const { TextArea } = Input;

export type ApiFormModalProps = {
  open: boolean;
  editingApi: ApiEndpoint | null;
  services: Service[];
  tags: Tag[];
  onSubmit: (data: Partial<ApiEndpoint>) => Promise<void>;
  onSaveDraft: (data: Partial<ApiEndpoint>) => Promise<void>;
  onClose: () => void;
};

const HTTP_METHODS: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
];

const STEP_TITLES = ["Basic Info", "Parameters", "Responses", "Advanced"];

export function ApiFormModal({
  open,
  editingApi,
  services,
  tags,
  onSubmit,
  onSaveDraft,
  onClose,
}: ApiFormModalProps) {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!editingApi;

  useEffect(() => {
    if (open && editingApi) {
      form.setFieldsValue({
        name: editingApi.name,
        path: editingApi.path,
        methods: editingApi.methods,
        serviceId: editingApi.serviceId,
        tagIds: editingApi.tags.map((t) => t.id),
        description: editingApi.description,
        queryParams: editingApi.config.queryParams,
        headers: Object.entries(editingApi.config.headers).map(([k, v]) => ({
          key: k,
          value: v,
        })),
        responses: editingApi.config.responses,
        rateLimitPerMinute: editingApi.config.rateLimitPerMinute,
        cacheTtlSeconds: editingApi.config.cacheTtlSeconds,
        timeoutMs: editingApi.config.timeoutMs,
        retryCount: editingApi.config.retryCount,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, editingApi, form]);

  const handleNext = useCallback(async () => {
    try {
      if (current === 0) {
        await form.validateFields(["name", "path", "methods"]);
      }
      setCurrent((prev) => Math.min(prev + 1, STEP_TITLES.length - 1));
    } catch {
      // validation failed
    }
  }, [current, form]);

  const handlePrev = useCallback(() => {
    setCurrent((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
      setCurrent(0);
      message.success(isEditing ? "API updated" : "API created");
    } catch {
      // validation failed
    } finally {
      setSubmitting(false);
    }
  }, [form, onSubmit, isEditing]);

  const handleSaveDraft = useCallback(async () => {
    const values = form.getFieldsValue(true);
    await onSaveDraft({ ...values, status: "draft" });
    form.resetFields();
    setCurrent(0);
    message.success("Saved as draft");
  }, [form, onSaveDraft]);

  const handleClose = useCallback(() => {
    form.resetFields();
    setCurrent(0);
    onClose();
  }, [form, onClose]);

  return (
    <Modal
      open={open}
      title={isEditing ? "Edit API" : "Create New API"}
      width={720}
      onCancel={handleClose}
      footer={
        <div className="flex justify-between">
          <Button onClick={handleSaveDraft}>Save Draft</Button>
          <Space>
            {current > 0 && <Button onClick={handlePrev}>Previous</Button>}
            {current < STEP_TITLES.length - 1 ? (
              <Button type="primary" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={submitting}
              >
                {isEditing ? "Update" : "Create"}
              </Button>
            )}
          </Space>
        </div>
      }
    >
      <Steps
        current={current}
        size="small"
        className="mb-6"
        items={STEP_TITLES.map((t) => ({ title: t }))}
      />

      <Form form={form} layout="vertical" requiredMark="optional">
        <div className={current === 0 ? "" : "hidden"}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="e.g. Get User List" />
          </Form.Item>
          <Form.Item
            name="path"
            label="Path"
            rules={[
              { required: true, message: "Path is required" },
              {
                pattern: /^\//,
                message: "Path must start with /",
              },
            ]}
          >
            <Input placeholder="e.g. /api/v1/users" />
          </Form.Item>
          <Form.Item
            name="methods"
            label="Methods"
            rules={[
              { required: true, message: "Select at least one method" },
            ]}
          >
            <Select mode="multiple" placeholder="Select HTTP methods">
              {HTTP_METHODS.map((m) => (
                <Select.Option key={m} value={m}>
                  {m}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="serviceId" label="Service">
            <Select placeholder="Select service">
              {services.map((s) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="tagIds" label="Tags">
            <Select mode="multiple" placeholder="Select tags">
              {tags.map((t) => (
                <Select.Option key={t.id} value={t.id}>
                  {t.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="API description..." />
          </Form.Item>
        </div>

        <div className={current === 1 ? "" : "hidden"}>
          <div className="mb-3 text-sm font-medium">Request Headers</div>
          <Form.List name="headers">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="flex gap-2 mb-2">
                    <Form.Item {...restField} name={[name, "key"]} className="flex-1 mb-0">
                      <Input placeholder="Header name" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "value"]} className="flex-1 mb-0">
                      <Input placeholder="Header value" />
                    </Form.Item>
                    <MinusCircleOutlined
                      onClick={() => remove(name)}
                      className="mt-2 text-gray-400"
                    />
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                  Add Header
                </Button>
              </>
            )}
          </Form.List>

          <div className="mb-3 mt-4 text-sm font-medium">Query Parameters</div>
          <Form.List name="queryParams">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="flex gap-2 mb-2">
                    <Form.Item {...restField} name={[name, "name"]} className="flex-1 mb-0">
                      <Input placeholder="Param name" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "type"]} className="w-28 mb-0">
                      <Select placeholder="Type">
                        <Select.Option value="string">String</Select.Option>
                        <Select.Option value="number">Number</Select.Option>
                        <Select.Option value="boolean">Boolean</Select.Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "required"]}
                      valuePropName="checked"
                      className="mb-0"
                    >
                      <Switch checkedChildren="Required" unCheckedChildren="Optional" />
                    </Form.Item>
                    <MinusCircleOutlined
                      onClick={() => remove(name)}
                      className="mt-2 text-gray-400"
                    />
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                  Add Parameter
                </Button>
              </>
            )}
          </Form.List>

          <div className="mb-3 mt-4 text-sm font-medium">Request Body Schema</div>
          <Form.Item name="requestBodySchema">
            <TextArea rows={6} placeholder='{"type": "object", "properties": {...}}' />
          </Form.Item>
        </div>

        <div className={current === 2 ? "" : "hidden"}>
          <Form.List name="responses">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="mb-4 rounded border p-3">
                    <div className="flex gap-2 mb-2">
                      <Form.Item
                        {...restField}
                        name={[name, "statusCode"]}
                        label="Status Code"
                        className="w-28 mb-0"
                      >
                        <InputNumber placeholder="200" min={100} max={599} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "description"]}
                        label="Description"
                        className="flex-1 mb-0"
                      >
                        <Input placeholder="Success response" />
                      </Form.Item>
                      <MinusCircleOutlined
                        onClick={() => remove(name)}
                        className="mt-8 text-gray-400"
                      />
                    </div>
                    <Form.Item {...restField} name={[name, "example"]} label="Example" className="mb-0">
                      <TextArea rows={3} placeholder='{"id": "1", "name": "..."}' />
                    </Form.Item>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                  Add Response Definition
                </Button>
              </>
            )}
          </Form.List>
        </div>

        <div className={current === 3 ? "" : "hidden"}>
          <Form.Item name="rateLimitPerMinute" label="Rate Limit (per minute)">
            <InputNumber placeholder="e.g. 1000" min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="cacheTtlSeconds" label="Cache TTL (seconds)">
            <InputNumber placeholder="e.g. 300" min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="timeoutMs" label="Timeout (ms)">
            <InputNumber placeholder="e.g. 5000" min={100} className="w-full" />
          </Form.Item>
          <Form.Item name="retryCount" label="Retry Count">
            <InputNumber placeholder="e.g. 3" min={0} max={10} className="w-full" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
