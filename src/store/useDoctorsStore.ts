import { createEntityStore } from "./createEntityStore";
import { Doctor } from "@/types";

export const useDoctorsStore = createEntityStore<Doctor>([]);
