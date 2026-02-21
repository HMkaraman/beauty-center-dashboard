import { DoctorFormPage } from "@/components/doctors/doctor-form-page";

export default async function EditDoctorRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DoctorFormPage doctorId={id} />;
}
