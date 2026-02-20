import { createEntityStore } from "./createEntityStore";
import { Invoice } from "@/types";

export const useInvoicesStore = createEntityStore<Invoice>([]);
