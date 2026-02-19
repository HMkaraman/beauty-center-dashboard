"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReceptionHeader } from "./reception-header";
import { AppointmentBoard } from "./appointment-board";
import { QuickBookingWizard } from "./quick-booking-wizard";
import { QuickCheckout } from "./quick-checkout";
import { useTodayAppointments, useInvalidateReception } from "@/lib/hooks/use-reception";
import { useUpdateAppointment } from "@/lib/hooks/use-appointments";
import { Appointment } from "@/types";

export function ReceptionPageContent() {
  const t = useTranslations("reception");
  const { data: todayData, isLoading } = useTodayAppointments();
  const appointments = todayData?.data ?? [];
  const updateAppointment = useUpdateAppointment();
  const invalidateReception = useInvalidateReception();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [checkoutAppointment, setCheckoutAppointment] = useState<Appointment | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleAction = useCallback((id: string, action: string) => {
    const appointment = appointments.find((a) => a.id === id);
    if (!appointment) return;

    updateAppointment.mutate(
      {
        id,
        data: { status: action as Appointment["status"] },
      },
      {
        onSuccess: () => {
          invalidateReception();
          // If completing, check for checkout
          if (action === "completed") {
            // Check if part of a group
            if (appointment.groupId) {
              const groupAppts = appointments.filter(
                (a) => a.groupId === appointment.groupId && a.id !== id
              );
              const allOthersCompleted = groupAppts.every(
                (a) => a.status === "completed"
              );
              if (allOthersCompleted) {
                // All group appointments completed, open checkout
                setCheckoutAppointment({ ...appointment, status: "completed" });
                setCheckoutOpen(true);
              } else {
                toast.info(t("groupNotComplete"));
              }
            } else {
              // Single appointment, open checkout directly
              setCheckoutAppointment({ ...appointment, status: "completed" });
              setCheckoutOpen(true);
            }
          }
        },
      }
    );
  }, [appointments, updateAppointment, invalidateReception, t]);

  return (
    <div className="flex flex-col h-screen">
      <ReceptionHeader />

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Quick actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">{t("todayBoard")}</h1>
          <Button onClick={() => setWizardOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("newBooking")}
          </Button>
        </div>

        {/* Board */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-muted-foreground">{t("loading")}</p>
          </div>
        ) : (
          <AppointmentBoard
            appointments={appointments}
            onAction={handleAction}
          />
        )}
      </div>

      {/* Quick Booking Wizard */}
      <QuickBookingWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
      />

      {/* Quick Checkout */}
      <QuickCheckout
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        appointment={checkoutAppointment}
      />
    </div>
  );
}
