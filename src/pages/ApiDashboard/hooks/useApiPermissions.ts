import { useCallback, useState } from "react";
import { apiDashboardApi } from "@/services/modules/apiDashboard";
import type { Permission } from "../types";

export function useApiPermissions(apiId: string | null, initialPermissions: Permission[]) {
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);
  const [saving, setSaving] = useState(false);

  const updatePermissions = useCallback(
    async (updated: Permission[]) => {
      if (!apiId) return;
      setSaving(true);
      try {
        await apiDashboardApi.updatePermissions(apiId, updated);
        setPermissions(updated);
      } finally {
        setSaving(false);
      }
    },
    [apiId],
  );

  const addPermission = useCallback(
    async (permission: Omit<Permission, "id">) => {
      const newPerm: Permission = { ...permission, id: crypto.randomUUID() };
      const next = [...permissions, newPerm];
      await updatePermissions(next);
    },
    [permissions, updatePermissions],
  );

  const removePermission = useCallback(
    async (permissionId: string) => {
      const next = permissions.filter((p) => p.id !== permissionId);
      await updatePermissions(next);
    },
    [permissions, updatePermissions],
  );

  return { permissions, saving, setPermissions, addPermission, removePermission };
}
