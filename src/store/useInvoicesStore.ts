import { createEntityStore } from "./createEntityStore";
import { invoicesListData } from "@/lib/mock-data";
import { Invoice } from "@/types";

export const useInvoicesStore = createEntityStore<Invoice>(invoicesListData);
