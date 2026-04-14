import { useCallback } from "react";
import { apiDashboardApi } from "@/services/modules/apiDashboard";

export function useFavorites() {
  const toggleFavorite = useCallback(async (id: string) => {
    await apiDashboardApi.toggleFavorite(id);
  }, []);

  return { toggleFavorite };
}
