import { createEntityStore } from "./createEntityStore";
import { Service } from "@/types";

export const useServicesStore = createEntityStore<Service>([]);
