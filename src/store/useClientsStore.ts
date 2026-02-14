import { createEntityStore } from "./createEntityStore";
import { clientsListData } from "@/lib/mock-data";
import { Client } from "@/types";

export const useClientsStore = createEntityStore<Client>(clientsListData);
