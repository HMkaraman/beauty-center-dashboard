import { createEntityStore } from "./createEntityStore";
import { reportsListData } from "@/lib/mock-data";
import { Report } from "@/types";

export const useReportsStore = createEntityStore<Report>(reportsListData);
