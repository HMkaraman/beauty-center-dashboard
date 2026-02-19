"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * useRowSelection — Shared hook for managing table row selection.
 *
 * @param ids – The IDs of all currently visible / filtered rows.
 */
export function useRowSelection(ids: string[]) {
  const [selectedSet, setSelectedSet] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelectedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedSet((prev) => {
      const allSelected = ids.length > 0 && ids.every((id) => prev.has(id));
      return allSelected ? new Set<string>() : new Set(ids);
    });
  }, [ids]);

  const clearSelection = useCallback(() => {
    setSelectedSet(new Set());
  }, []);

  // Only keep IDs that are in the current visible set
  const selectedIds = useMemo(
    () => ids.filter((id) => selectedSet.has(id)),
    [ids, selectedSet]
  );

  const selectedCount = selectedIds.length;

  const isAllSelected = ids.length > 0 && ids.every((id) => selectedSet.has(id));

  const isSomeSelected = ids.some((id) => selectedSet.has(id)) && !isAllSelected;

  const isSelected = useCallback(
    (id: string) => selectedSet.has(id),
    [selectedSet]
  );

  return {
    selectedIds,
    selectedCount,
    isSelected,
    isAllSelected,
    isSomeSelected,
    toggle,
    toggleAll,
    clearSelection,
  };
}
