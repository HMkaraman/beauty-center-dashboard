import { AppointmentDetailPage } from "@/components/appointments/appointment-detail-page";

export default async function AppointmentDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AppointmentDetailPage appointmentId={id} />;
}
