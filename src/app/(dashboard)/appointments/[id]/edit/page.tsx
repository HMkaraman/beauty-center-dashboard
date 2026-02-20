import { AppointmentFormPage } from "@/components/appointments/appointment-form-page";

export default async function EditAppointmentRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AppointmentFormPage appointmentId={id} />;
}
