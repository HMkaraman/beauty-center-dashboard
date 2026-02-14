import { createEntityStore } from "./createEntityStore";
import { marketingCampaignsData } from "@/lib/mock-data";
import { Campaign } from "@/types";

export const useMarketingStore = createEntityStore<Campaign>(marketingCampaignsData);
