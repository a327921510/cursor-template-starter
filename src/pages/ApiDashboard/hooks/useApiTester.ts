import { useCallback, useState } from "react";
import { apiDashboardApi } from "@/services/modules/apiDashboard";
import type { TestResult } from "../types";

export type TestRequest = {
  method: string;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  body: string;
  environment: string;
};

export function useApiTester() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const sendTest = useCallback(async (apiId: string, req: TestRequest) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await apiDashboardApi.testEndpoint(apiId, req);
      const data = res as unknown as TestResult;
      setResult(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return { result, loading, sendTest, clearResult };
}
