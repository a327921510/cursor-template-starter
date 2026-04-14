import { useCallback, useEffect, useState } from "react";
import { apiDashboardApi } from "@/services/modules/apiDashboard";
import type { Service } from "../types";

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await apiDashboardApi.getServices()) as unknown as Service[];
      setServices(data);
    } catch {
      // keep previous data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, loading, refetch: fetchServices };
}
