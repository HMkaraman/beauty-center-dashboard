"use client";

import { useTranslations } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ServiceStatusBadge } from "./service-status-badge";
import { formatCurrency } from "@/lib/formatters";
import { Service } from "@/types";

interface ServicesTableProps {
  data: Service[];
}

export function ServicesTable({ data }: ServicesTableProps) {
  const t = useTranslations("services");

  return (
    <div className="hidden md:block rounded-lg border border-border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("name")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("category")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("duration")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("price")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("status")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("bookings")}</th>
            <th className="px-4 py-3 text-start text-xs font-medium text-muted-foreground">{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((service) => (
            <tr key={service.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>{service.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="font-medium text-foreground">{service.name}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{service.category}</td>
              <td className="px-4 py-3 font-english text-muted-foreground">{service.duration}{t("minutes")}</td>
              <td className="px-4 py-3 font-english text-foreground">{formatCurrency(service.price)}</td>
              <td className="px-4 py-3">
                <ServiceStatusBadge status={service.status} />
              </td>
              <td className="px-4 py-3 font-english text-muted-foreground">{service.bookings}</td>
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
