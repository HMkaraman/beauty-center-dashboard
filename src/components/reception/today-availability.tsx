"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useTodayAvailability, type TodayAvailabilityProvider } from "@/lib/hooks/use-reception";

interface TodayAvailabilityProps {
  onViewDetails?: (id: string, type: "employee" | "doctor") => void;
}

function MiniTimeline({
  workingHours,
  appointments,
}: {
  workingHours: { start: string; end: string };
  appointments: TodayAvailabilityProvider["appointments"];
}) {
  const startMins = timeToMinutes(workingHours.start);
  const endMins = timeToMinutes(workingHours.end);
  const totalMins = endMins - startMins;

  if (totalMins <= 0) return null;

  return (
    <div className="relative h-2 w-full rounded-full bg-green-200 dark:bg-green-900/40 overflow-hidden">
      {appointments.map((appt) => {
        const apptStart = timeToMinutes(appt.time);
        const apptEnd = apptStart + appt.duration;
        const left = ((Math.max(apptStart, startMins) - startMins) / totalMins) * 100;
        const width =
          ((Math.min(apptEnd, endMins) - Math.max(apptStart, startMins)) / totalMins) * 100;

        if (width <= 0) return null;

        const colors: Record<string, string> = {
          completed: "bg-gray-400 dark:bg-gray-600",
          "in-progress": "bg-blue-500",
          waiting: "bg-amber-500",
        };
        const color = colors[appt.status] ?? "bg-blue-400";

        return (
          <div
            key={appt.id}
            className={`absolute top-0 h-full rounded-full ${color}`}
            style={{ left: `${left}%`, width: `${width}%` }}
          />
        );
      })}
    </div>
  );
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function ProviderCard({
  provider,
  onClick,
}: {
  provider: TodayAvailabilityProvider;
  onClick?: () => void;
}) {
  const t = useTranslations("reception");

  const statusConfig = {
    free: {
      label: t("free"),
      className: "bg-green-500/10 text-green-600 border-green-200 dark:border-green-800",
    },
    busy: {
      label: t("busy"),
      className: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800",
    },
    off: {
      label: t("off"),
      className: "bg-muted text-muted-foreground",
    },
  };

  const status = statusConfig[provider.currentStatus];

  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-2 rounded-lg border bg-card p-3 text-start transition-colors hover:bg-accent/50 w-full"
    >
      <div className="flex items-center gap-2.5">
        <Avatar size="sm">
          {provider.image ? (
            <AvatarImage src={provider.image} alt={provider.name} />
          ) : null}
          <AvatarFallback>
            <User className="h-3 w-3" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{provider.name}</p>
          <p className="text-xs text-muted-foreground truncate">{provider.role}</p>
        </div>
        <Badge variant="outline" className={`text-[10px] shrink-0 ${status.className}`}>
          {status.label}
        </Badge>
      </div>

      {/* Status detail */}
      <div className="text-xs text-muted-foreground">
        {provider.currentStatus === "busy" && provider.currentAppointment && (
          <p className="truncate">
            {t("currentlyWith", { client: provider.currentAppointment.clientName })}
            {" — "}
            {provider.currentAppointment.service}
          </p>
        )}
        {provider.currentStatus === "off" && provider.notWorking && (
          <p>{t("notWorkingShort")}</p>
        )}
        {provider.currentStatus === "off" && !provider.notWorking && (
          <p>{t("off")}</p>
        )}
        {provider.currentStatus === "free" && provider.appointmentCount > 0 && provider.nextAvailableTime && (
          <p className="font-english">
            {provider.appointmentCount} {t("total").toLowerCase()}
          </p>
        )}
        {provider.currentStatus !== "off" && provider.nextAvailableTime && provider.currentStatus === "busy" && (
          <p className="font-english">{t("nextAvailable", { time: provider.nextAvailableTime })}</p>
        )}
        {provider.currentStatus === "busy" && !provider.nextAvailableTime && (
          <p>{t("noMoreSlots")}</p>
        )}
      </div>

      {/* Mini timeline */}
      {provider.workingHours && provider.appointments.length > 0 && (
        <MiniTimeline
          workingHours={provider.workingHours}
          appointments={provider.appointments}
        />
      )}
    </button>
  );
}

export function TodayAvailability({ onViewDetails }: TodayAvailabilityProps) {
  const t = useTranslations("reception");
  const { data } = useTodayAvailability();
  const [collapsed, setCollapsed] = useState(false);

  const providers = data?.providers ?? [];
  const workingCount = providers.filter((p) => !p.notWorking).length;

  if (providers.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">
            {t("todayAvailability")}
          </h2>
          <Badge variant="secondary" className="text-[10px]">
            {t("workingToday", { count: workingCount })}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed((prev) => !prev)}
          className="h-7 w-7 p-0"
        >
          {collapsed ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      </div>

      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {providers.map((provider) => (
            <ProviderCard
              key={`${provider.type}-${provider.id}`}
              provider={provider}
              onClick={() => onViewDetails?.(provider.id, provider.type)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
