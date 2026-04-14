import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Steps,
} from "antd";
import type { ApiEndpoint, HttpMethod, Service, Tag } from "../types";

export type ApiFormModalProps = {
  open: boolean;
  editingApi: ApiEndpoint | null;
  services: Service[];
  tags: Tag[];
  onSubmit: (values: ApiFormValues) => Promise<void>;
  onSaveDraft: (values: ApiFormValues) => Promise<void>;
  onCancel: () => void;
};

export type ApiFormValues = {
  name: string;
  path: string;
  methods: HttpMethod[];
  serviceId: string;
  tagIds: string[];
  description: string;
  headers: Record<string, string>;
  queryParams: { name: string; type: string; required: boolean; description: string }[];
  requestBodySchema: string;
  responses: { statusCode: number; description: string; schema: string; example: string }[];
  rateLimitPerMinute: number | null;
  cacheTtlSeconds: number | null;
  timeoutMs: number;
  retryCount: number;
};

const ALL_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const STEPS = ["Basic Info", "Parameters", "Responses", "Advanced"];

export function ApiFormModal({
  open,
  editingApi,
  services,
  tags,
  onSubmit,
  onSaveDraft,
  onCancel,
}: ApiFormModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm<ApiFormValues>();
  const [submitting, setSubmitting] = useState(false);

  const isEditing = editingApi !== null;

  useEffect(() => {
    if (open && editingApi) {
      form.setFieldsValue({
        name: editingApi.name,
        path: editingApi.path,
        methods: editingApi.methods,
        serviceId: editingApi.serviceId,
        tagIds: editingApi.tags.map((t) => t.id),
        description: editingApi.description,
        headers: editingApi.config.headers,
        queryParams: editingApi.config.queryParams.map((p) => ({
          name: p.name,
          type: p.type,
          required: p.required,
          description: p.description,
        })),
        requestBodySchema: editingApi.config.requestBodySchema
          ? JSON.stringify(editingApi.config.requestBodySchema, null, 2)
          : "",
        responses: editingApi.config.responses.map((r) => ({
          statusCode: r.statusCode,
          description: r.description,
          schema: r.schema ? JSON.stringify(r.schema, null, 2) : "",
          example: r.example,
        })),
        rateLimitPerMinute: editingApi.config.rateLimitPerMinute,
        cacheTtlSeconds: editingApi.config.cacheTtlSeconds,
        timeoutMs: editingApi.config.timeoutMs,
        retryCount: editingApi.config.retryCount,
      });
    } else if (open) {
      form.resetFields();
      setCurrentStep(0);
    }
  }, [open, editingApi, form]);

  const handleNext = useCallback(async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(["name", "path", "methods"]);
      }
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    } catch {
      // validation failed
    }
  }, [currentStep, form]);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await onSubmit(values);
    } catch {
      // validation failed
    } finally {
      setSubmitting(false);
    }
  }, [form, onSubmit]);

  const handleSaveDraft = useCallback(async () => {
    const values = form.getFieldsValue();
    setSubmitting(true);
    try {
      await onSaveDraft(values);
    } finally {
      setSubmitting(false);
    }
  }, [form, onSaveDraft]);

  return (
    <Modal
      title={isEditing ? "Edit API" : "New API"}
      open={open}
      onCancel={onCancel}
      width={720}
      footer={
        <div className="flex justify-between">
          <Button onClick={handleSaveDraft} loading={submitting}>
            Save Draft
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && <Button onClick={handlePrev}>Previous</Button>}
            {currentStep < STEPS.length - 1 ? (
              <Button type="primary" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button type="primary" onClick={handleSubmit} loading={submitting}>
                {isEditing ? "Update" : "Create"}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <Steps
        current={currentStep}
        items={STEPS.map((title) => ({ title }))}
        size="small"
        className="mb-6"
      />

      <Form form={form} layout="vertical" autoComplete="off">
        <div className={currentStep === 0 ? "" : "hidden"}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Name is required" }]}
          >
            <Input placeholder="e.g. Get User Profile" />
          </Form.Item>
          <Form.Item
            label="Path"
            name="path"
            rules={[
              { required: true, message: "Path is required" },
              { pattern: /^\//, message: "Path must start with /" },
            ]}
          >
            <Input placeholder="/api/v1/users" className="font-mono" />
          </Form.Item>
          <Form.Item
            label="Methods"
            name="methods"
            rules={[{ required: true, message: "Select at least one method" }]}
          >
            <Select
              mode="multiple"
              options={ALL_METHODS.map((m) => ({ value: m, label: m }))}
              placeholder="Select HTTP methods"
            />
          </Form.Item>
          <Form.Item label="Service" name="serviceId">
            <Select
              options={services.map((s) => ({ value: s.id, label: s.name }))}
              placeholder="Select service"
              allowClear
            />
          </Form.Item>
          <Form.Item label="Tags" name="tagIds">
            <Select
              mode="multiple"
              options={tags.map((t) => ({ value: t.id, label: t.name }))}
              placeholder="Select tags"
            />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="API description (Markdown supported)" />
          </Form.Item>
        </div>

        <div className={currentStep === 1 ? "" : "hidden"}>
          <Form.Item label="Request Body Schema (JSON)" name="requestBodySchema">
            <Input.TextArea rows={8} className="font-mono text-xs" placeholder="{}" />
          </Form.Item>
        </div>

        <div className={currentStep === 2 ? "" : "hidden"}>
          <Form.Item label="Response Definitions" name="responses">
            <Input.TextArea
              rows={8}
              className="font-mono text-xs"
              placeholder='[{"statusCode": 200, "description": "Success", "schema": {}, "example": "{}"}]'
            />
          </Form.Item>
        </div>

        <div className={currentStep === 3 ? "" : "hidden"}>
          <Form.Item label="Rate Limit (req/min)" name="rateLimitPerMinute">
            <Input type="number" placeholder="Leave empty for unlimited" />
          </Form.Item>
          <Form.Item label="Cache TTL (seconds)" name="cacheTtlSeconds">
            <Input type="number" placeholder="Leave empty for no cache" />
          </Form.Item>
          <Form.Item
            label="Timeout (ms)"
            name="timeoutMs"
            initialValue={30000}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Retry Count"
            name="retryCount"
            initialValue={0}
          >
            <Input type="number" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}
