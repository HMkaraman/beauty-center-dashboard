import { DoctorDetailPage } from "@/components/doctors/doctor-detail-page";

export default async function DoctorDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DoctorDetailPage doctorId={id} />;
}
