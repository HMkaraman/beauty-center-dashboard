import { create } from "zustand";
import { generateId } from "@/lib/utils";

export interface EntityState<T extends { id: string }> {
  items: T[];
  searchQuery: string;
  addItem: (item: Omit<T, "id">) => void;
  updateItem: (id: string, updates: Partial<T>) => void;
  deleteItem: (id: string) => void;
  setSearchQuery: (query: string) => void;
}

export function createEntityStore<T extends { id: string }>(
  initialItems: T[]
) {
  return create<EntityState<T>>((set) => ({
    items: initialItems,
    searchQuery: "",
    addItem: (item) =>
      set((state) => ({
        items: [{ ...item, id: generateId() } as T, ...state.items],
      })),
    updateItem: (id, updates) =>
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      })),
    deleteItem: (id) =>
      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
  }));
}
