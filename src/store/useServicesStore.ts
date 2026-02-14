import { createEntityStore } from "./createEntityStore";
import { servicesListData } from "@/lib/mock-data";
import { Service } from "@/types";

export const useServicesStore = createEntityStore<Service>(servicesListData);
