"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { RoleEditorPage } from "@/components/settings/role-editor-page";

export default function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const duplicate = searchParams.get("duplicate") === "true";

  return <RoleEditorPage roleId={id} duplicate={duplicate} />;
}
