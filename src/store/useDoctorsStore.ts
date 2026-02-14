import { createEntityStore } from "./createEntityStore";
import { doctorsListData } from "@/lib/mock-data";
import { Doctor } from "@/types";

export const useDoctorsStore = createEntityStore<Doctor>(doctorsListData);
