import { createEntityStore } from "./createEntityStore";
import { Appointment } from "@/types";

export const useAppointmentsStore = createEntityStore<Appointment>([]);
