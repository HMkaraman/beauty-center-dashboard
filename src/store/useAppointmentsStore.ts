import { createEntityStore } from "./createEntityStore";
import { appointmentsListData } from "@/lib/mock-data";
import { Appointment } from "@/types";

export const useAppointmentsStore = createEntityStore<Appointment>(appointmentsListData);
