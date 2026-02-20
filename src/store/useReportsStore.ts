import { createEntityStore } from "./createEntityStore";
import { Report } from "@/types";

export const useReportsStore = createEntityStore<Report>([]);
