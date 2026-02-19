"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReceptionHeader } from "./reception-header";
import { AppointmentBoard } from "./appointment-board";
import { BookingOverlay } from "./booking-overlay";
import { QuickCheckout } from "./quick-checkout";
import { AvailabilityChecker } from "./availability-checker";
import { useTodayAppointments, useInvalidateReception } from "@/lib/hooks/use-reception";
import { useUpdateAppointment } from "@/lib/hooks/use-appointments";
import { Appointment } from "@/types";

export function ReceptionPageContent() {
  const t = useTranslations("reception");
  const queryClient = useQueryClient();
  const { data: todayData, isLoading } = useTodayAppointments();
  const appointments = todayData?.data ?? [];
  const updateAppointment = useUpdateAppointment();
  const invalidateReception = useInvalidateReception();

  const [bookingOpen, setBookingOpen] = useState(false);
  const [checkerOpen, setCheckerOpen] = useState(false);
  const [checkoutAppointment, setCheckoutAppointment] = useState<Appointment | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const handleAction = useCallback((id: string, action: string) => {
    const appointment = appointments.find((a) => a.id === id);
    if (!appointment) return;

    // Edit invoice — open checkout sheet without changing status
    if (action === "editInvoice") {
      setCheckoutAppointment(appointment);
      setCheckoutOpen(true);
      return;
    }

    const newStatus = action as Appointment["status"];
    const today = new Date().toISOString().split("T")[0];
    const queryKey = ["reception", "today-appointments", today];

    // Optimistic update: move the card instantly
    const previousData = queryClient.getQueryData(queryKey);
    queryClient.setQueryData(queryKey, (old: { data: Appointment[]; total: number; page: number; limit: number } | undefined) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.map((a) =>
          a.id === id ? { ...a, status: newStatus } : a
        ),
      };
    });

    // If completing, handle checkout immediately (don't wait for API)
    if (action === "completed") {
      if (appointment.groupId) {
        const groupAppts = appointments.filter(
          (a) => a.groupId === appointment.groupId && a.id !== id
        );
        const allOthersCompleted = groupAppts.every(
          (a) => a.status === "completed"
        );
        if (allOthersCompleted) {
          setCheckoutAppointment({ ...appointment, status: "completed" });
          setCheckoutOpen(true);
        } else {
          toast.info(t("groupNotComplete"));
        }
      } else {
        setCheckoutAppointment({ ...appointment, status: "completed" });
        setCheckoutOpen(true);
      }
    }

    // Fire API call in the background
    updateAppointment.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          invalidateReception();
        },
        onError: () => {
          // Rollback on failure
          queryClient.setQueryData(queryKey, previousData);
          toast.error(t("statusUpdateFailed"));
        },
      }
    );
  }, [appointments, updateAppointment, invalidateReception, queryClient, t]);

  return (
    <div className="flex flex-col h-screen">
      <ReceptionHeader onCheckAvailability={() => setCheckerOpen(true)} />

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Quick actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">{t("todayBoard")}</h1>
          <Button onClick={() => setBookingOpen(true)}>
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

      {/* Full-window Booking Overlay */}
      <BookingOverlay
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />

      {/* Availability Checker */}
      <AvailabilityChecker
        open={checkerOpen}
        onOpenChange={setCheckerOpen}
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
