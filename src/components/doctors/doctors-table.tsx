"use client";

import { useTranslations } from "next-intl";
import { MoreHorizontal, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DoctorStatusBadge } from "./doctor-status-badge";
import { Doctor } from "@/types";

interface DoctorsTableProps {
  data: Doctor[];
}

export function DoctorsTable({ data }: DoctorsTableProps) {
  const t = useTranslations("doctors");

  return (
    <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("name")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("specialty")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("phone")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("email")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("status")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("rating")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("consultations")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((doctor) => (
            <tr key={doctor.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{doctor.name}</p>
                    <p className="text-xs text-muted-foreground font-english">{doctor.phone}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{doctor.specialty}</td>
              <td className="px-4 py-3 font-english text-muted-foreground">{doctor.phone}</td>
              <td className="px-4 py-3 font-english text-muted-foreground">{doctor.email}</td>
              <td className="px-4 py-3">
                <DoctorStatusBadge status={doctor.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 font-english text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  {doctor.rating > 0 ? doctor.rating : "—"}
                </div>
              </td>
              <td className="px-4 py-3 font-english text-muted-foreground">{doctor.consultations}</td>
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-xs">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>{t("view")}</DropdownMenuItem>
                    <DropdownMenuItem>{t("edit")}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">{t("delete")}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
