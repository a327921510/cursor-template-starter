import { useCallback, useEffect, useState } from "react";
import { apiDashboardApi } from "@/services/modules/apiDashboard";
import type { Tag } from "../types";

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await apiDashboardApi.getTags()) as unknown as Tag[];
      setTags(data);
    } catch {
      // keep previous data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = useCallback(
    async (name: string, color: string) => {
      const created = (await apiDashboardApi.createTag({ name, color })) as unknown as Tag;
      setTags((prev) => [...prev, created]);
      return created;
    },
    [],
  );

  return { tags, loading, refetch: fetchTags, createTag };
}
