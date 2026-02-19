"use client";

import { useTranslations, useLocale } from "next-intl";
import type { ServiceAssignment } from "./booking-step-provider-time";
import { Price } from "@/components/ui/price";

interface ClientValue {
  clientId: string;
  clientName: string;
  clientPhone: string;
}

interface BookingStepConfirmProps {
  client: ClientValue | null;
  assignments: ServiceAssignment[];
}

export function BookingStepConfirm({
  client,
  assignments,
}: BookingStepConfirmProps) {
  const t = useTranslations("reception");
  const locale = useLocale();
  const total = assignments.reduce((sum, a) => sum + a.service.price, 0);

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <h3 className="text-sm font-semibold">{t("confirmBooking")}</h3>
      <div className="rounded-lg border border-border p-4 space-y-4">
        {/* Client info */}
        <div>
          <p className="text-xs text-muted-foreground">{t("client")}</p>
          <p className="text-sm font-medium">{client?.clientName}</p>
          {client?.clientPhone && (
            <p className="text-xs font-english text-muted-foreground">
              {client.clientPhone}
            </p>
          )}
        </div>

        {/* Services with assignments */}
        <div className="border-t border-border pt-3 space-y-3">
          {assignments.map((a) => (
            <div key={a.service.serviceId} className="flex justify-between text-sm">
              <div>
                <p className="font-medium">{a.service.name}</p>
                <p className="text-xs text-muted-foreground">
                  {a.employeeName && a.employeeName}
                  {a.doctorName && ` · ${a.doctorName}`}
                  {` · ${a.time}`}
                </p>
              </div>
              <span className="font-english shrink-0">
                <Price value={a.service.price} />
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t border-border pt-3 flex justify-between font-bold">
          <span>{t("total")}</span>
          <span className="font-english"><Price value={total} /></span>
        </div>
      </div>
    </div>
  );
}
