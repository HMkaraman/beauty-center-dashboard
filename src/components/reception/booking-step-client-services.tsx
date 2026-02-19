"use client";

import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientCombobox } from "@/components/appointments/client-combobox";
import { ServiceBrowser, type SelectedService } from "./service-browser";
import { formatCurrency } from "@/lib/formatters";
import { X } from "lucide-react";

interface ClientValue {
  clientId: string;
  clientName: string;
  clientPhone: string;
}

interface BookingStepClientServicesProps {
  client: ClientValue | null;
  onClientChange: (client: ClientValue | null) => void;
  isWalkIn: boolean;
  onWalkInChange: (v: boolean) => void;
  walkInName: string;
  onWalkInNameChange: (v: string) => void;
  walkInPhone: string;
  onWalkInPhoneChange: (v: string) => void;
  selectedServices: SelectedService[];
  onAddService: (service: SelectedService) => void;
  onRemoveService: (serviceId: string) => void;
}

export function BookingStepClientServices({
  client,
  onClientChange,
  isWalkIn,
  onWalkInChange,
  walkInName,
  onWalkInNameChange,
  walkInPhone,
  onWalkInPhoneChange,
  selectedServices,
  onAddService,
  onRemoveService,
}: BookingStepClientServicesProps) {
  const t = useTranslations("reception");
  const locale = useLocale();
  const total = selectedServices.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left: Client Selection */}
      <div className="lg:w-[340px] shrink-0 space-y-4">
        <h3 className="text-sm font-semibold">{t("selectClient")}</h3>
        {!isWalkIn ? (
          <>
            <ClientCombobox value={client} onChange={onClientChange} />
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <span className="relative bg-background px-2 text-xs text-muted-foreground">
                {t("or")}
              </span>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                onWalkInChange(true);
                onClientChange(null);
              }}
            >
              {t("walkIn")}
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("clientName")}</label>
              <Input
                value={walkInName}
                onChange={(e) => onWalkInNameChange(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("clientPhone")}</label>
              <Input
                value={walkInPhone}
                onChange={(e) => onWalkInPhoneChange(e.target.value)}
                className="font-english"
                dir="ltr"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onWalkInChange(false);
                onWalkInNameChange("");
                onWalkInPhoneChange("");
              }}
            >
              {t("backToSearch")}
            </Button>
          </div>
        )}

        {/* Cart summary (mobile: inline, desktop: sticky) */}
        {selectedServices.length > 0 && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {t("selectedServices")} ({selectedServices.length})
              </p>
              <p className="text-sm font-english font-bold">
                {formatCurrency(total, locale)}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedServices.map((s) => (
                <span
                  key={s.serviceId}
                  className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs"
                >
                  {s.name}
                  <button type="button" onClick={() => onRemoveService(s.serviceId)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Service Browser */}
      <div className="flex-1 min-w-0 space-y-3">
        <h3 className="text-sm font-semibold">{t("selectServices")}</h3>
        <ServiceBrowser
          selectedServices={selectedServices}
          onAdd={onAddService}
          onRemove={onRemoveService}
          maxHeight="60vh"
        />
      </div>
    </div>
  );
}
