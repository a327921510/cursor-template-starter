import { useCallback, useState } from "react";

export function useSelection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const select = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const toggleMulti = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const selectRange = useCallback(
    (ids: string[]) => {
      setSelectedIds((prev) => {
        const set = new Set(prev);
        for (const id of ids) {
          set.add(id);
        }
        return Array.from(set);
      });
    },
    [],
  );

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  const clearAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds],
  );

  return {
    selectedId,
    selectedIds,
    select,
    toggleMulti,
    selectRange,
    selectAll,
    clearAll,
    isSelected,
  };
}
