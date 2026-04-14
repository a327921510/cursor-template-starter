import { useCallback, useState } from "react";
import { apiDashboardApi } from "@/services/modules/apiDashboard";
import type { Permission } from "../types";

export function useApiPermissions(initialPermissions: Permission[]) {
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);
  const [saving, setSaving] = useState(false);

  const updatePermissions = useCallback(
    async (apiId: string, newPermissions: Permission[]) => {
      setSaving(true);
      try {
        await apiDashboardApi.updatePermissions(apiId, newPermissions);
        setPermissions(newPermissions);
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const addPermission = useCallback((permission: Permission) => {
    setPermissions((prev) => [...prev, permission]);
  }, []);

  const removePermission = useCallback((permissionId: string) => {
    setPermissions((prev) => prev.filter((p) => p.id !== permissionId));
  }, []);

  const resetPermissions = useCallback((perms: Permission[]) => {
    setPermissions(perms);
  }, []);

  return {
    permissions,
    saving,
    updatePermissions,
    addPermission,
    removePermission,
    resetPermissions,
  };
}
