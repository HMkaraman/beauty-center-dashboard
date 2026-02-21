import { EmployeeFormPage } from "@/components/employees/employee-form-page";

export default async function EditEmployeeRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EmployeeFormPage employeeId={id} />;
}
