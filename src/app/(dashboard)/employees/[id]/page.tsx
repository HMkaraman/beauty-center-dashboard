import { EmployeeDetailPage } from "@/components/employees/employee-detail-page";

export default async function EmployeeDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EmployeeDetailPage employeeId={id} />;
}
