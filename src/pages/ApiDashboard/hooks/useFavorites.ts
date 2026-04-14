import { useCallback } from "react";
import { apiDashboardApi } from "@/services/modules/apiDashboard";

export function useFavorites(onToggled?: () => void) {
  const toggleFavorite = useCallback(
    async (id: string) => {
      await apiDashboardApi.toggleFavorite(id);
      onToggled?.();
    },
    [onToggled],
  );

  return { toggleFavorite };
}
