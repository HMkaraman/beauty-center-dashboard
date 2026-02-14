import { createEntityStore } from "./createEntityStore";
import { inventoryListData } from "@/lib/mock-data";
import { InventoryItem } from "@/types";

export const useInventoryStore = createEntityStore<InventoryItem>(inventoryListData);
