"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Report } from "@/types";

const typeIcons: Record<string, string> = {
  financial: "DollarSign",
  appointments: "CalendarDays",
  clients: "Users",
  employees: "UserCog",
  inventory: "Package",
  marketing: "Megaphone",
};

const typeColors: Record<string, string> = {
  financial: "text-green-400 bg-green-500/10",
  appointments: "text-yellow-400 bg-yellow-500/10",
  clients: "text-purple-400 bg-purple-500/10",
  employees: "text-blue-400 bg-blue-500/10",
  inventory: "text-orange-400 bg-orange-500/10",
  marketing: "text-pink-400 bg-pink-500/10",
};

interface ReportCardProps {
  data: Report;
  onEdit?: (item: Report) => void;
  onDelete?: (id: string) => void;
}

export function ReportCard({ data, onEdit, onDelete }: ReportCardProps) {
  const t = useTranslations("reports");

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(196, 149, 106, 0.15)" }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border border-border bg-card p-5"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`rounded-lg p-2.5 ${typeColors[data.type]}`}>
            <DynamicIcon name={typeIcons[data.type]} className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground text-sm truncate">{data.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{data.description}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(data)}>{t("edit")}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(data.id)}>{t("delete")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <DynamicIcon name="Calendar" className="h-3.5 w-3.5" />
          <span className="font-english">{data.lastGenerated}</span>
        </div>
        <div className="flex items-center gap-1">
          <DynamicIcon name="Download" className="h-3.5 w-3.5" />
          <span className="font-english">{data.downloads}</span>
        </div>
        <div className="flex items-center gap-1">
          <DynamicIcon name="HardDrive" className="h-3.5 w-3.5" />
          <span className="font-english">{data.fileSize}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <DynamicIcon name="Eye" className="h-3.5 w-3.5" />
          {t("viewReport")}
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <DynamicIcon name="Download" className="h-3.5 w-3.5" />
          {t("download")}
        </Button>
      </div>
    </motion.div>
  );
}
