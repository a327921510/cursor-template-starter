import { useCallback, useState } from "react";
import { apiDashboardApi } from "@/services/modules/apiDashboard";
import type { TestResponse } from "../types";

export function useApiTester(apiId: string | null) {
  const [response, setResponse] = useState<TestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendRequest = useCallback(
    async (params: {
      method: string;
      url: string;
      headers?: Record<string, string>;
      queryParams?: Record<string, string>;
      body?: string;
      environment: string;
    }) => {
      if (!apiId) return;
      setLoading(true);
      setError(null);
      setResponse(null);
      try {
        const result = (await apiDashboardApi.testEndpoint(apiId, params)) as unknown as TestResponse;
        setResponse(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Request failed");
      } finally {
        setLoading(false);
      }
    },
    [apiId],
  );

  const reset = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  return { response, loading, error, sendRequest, reset };
}
