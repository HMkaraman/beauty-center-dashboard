import { createEntityStore } from "./createEntityStore";
import { InventoryItem } from "@/types";

export const useInventoryStore = createEntityStore<InventoryItem>([]);
