import { createEntityStore } from "./createEntityStore";
import { Client } from "@/types";

export const useClientsStore = createEntityStore<Client>([]);
