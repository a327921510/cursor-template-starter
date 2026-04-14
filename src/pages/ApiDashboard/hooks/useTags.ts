import { useCallback, useEffect, useState } from "react";
import { apiDashboardApi } from "@/services/modules/apiDashboard";
import type { Tag } from "../types";

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiDashboardApi.getTags();
      setTags(res as unknown as Tag[]);
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = useCallback(async (name: string, color: string) => {
    const res = await apiDashboardApi.createTag({ name, color });
    const created = res as unknown as Tag;
    setTags((prev) => [...prev, created]);
    return created;
  }, []);

  return { tags, loading, createTag };
}
