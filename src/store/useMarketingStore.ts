import { createEntityStore } from "./createEntityStore";
import { Campaign } from "@/types";

export const useMarketingStore = createEntityStore<Campaign>([]);
