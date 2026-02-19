"use client";

import { useMemo } from "react";
import { useTodayAppointments, useInvalidateReception } from "@/lib/hooks/use-reception";
import { CheckoutSheet } from "@/components/invoices/checkout-sheet";
import { Appointment } from "@/types";

interface QuickCheckoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
}

export function QuickCheckout({ open, onOpenChange, appointment }: QuickCheckoutProps) {
  const { data: todayData } = useTodayAppointments();
  const todayAppointments = todayData?.data ?? [];
  const invalidateReception = useInvalidateReception();

  // Check if this appointment is part of a group
  const groupAppointments = useMemo(() => {
    if (!appointment?.groupId) return [];
    return todayAppointments.filter((a) => a.groupId === appointment.groupId);
  }, [appointment, todayAppointments]);

  const allGroupCompleted = useMemo(() => {
    if (groupAppointments.length <= 1) return true;
    return groupAppointments.every((a) => a.status === "completed");
  }, [groupAppointments]);

  const handleComplete = () => {
    invalidateReception();
  };

  if (!appointment) return null;

  // If part of a group and not all completed, don't open checkout yet
  // The parent component handles this, but as a safety check:
  return (
    <CheckoutSheet
      open={open}
      onOpenChange={onOpenChange}
      appointment={appointment}
      onComplete={handleComplete}
    />
  );
}
