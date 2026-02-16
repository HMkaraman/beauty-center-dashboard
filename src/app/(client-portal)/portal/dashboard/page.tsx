"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  FileText,
  LogOut,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  portalApi,
  type PortalAppointment,
  type PortalClient,
} from "@/lib/api/portal";

export default function PortalDashboardPage() {
  const t = useTranslations("portal");
  const router = useRouter();

  const [client, setClient] = useState<PortalClient | null>(null);
  const [upcoming, setUpcoming] = useState<PortalAppointment[]>([]);
  const [past, setPast] = useState<PortalAppointment[]>([]);
  const [showPast, setShowPast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [appointmentsData] = await Promise.all([
        portalApi.getAppointments(),
      ]);
      setUpcoming(appointmentsData.upcoming);
      setPast(appointmentsData.past);
    } catch {
      // Token may be invalid; redirect handled by portalFetch
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("portal_token");
    if (!token) {
      router.push("/portal");
      return;
    }

    const clientData = localStorage.getItem("portal_client");
    if (clientData) {
      try {
        setClient(JSON.parse(clientData));
      } catch {
        // ignore parse error
      }
    }

    loadData();
  }, [router, loadData]);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await portalApi.cancelAppointment(id);
      setUpcoming((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: "cancelled" } : a
        )
      );
      setConfirmCancelId(null);
    } catch {
      // error handled silently
    } finally {
      setCancellingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("portal_token");
    localStorage.removeItem("portal_client");
    localStorage.removeItem("portal_tenant_slug");
    router.push("/portal");
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green/20 text-green";
      case "pending":
        return "bg-gold/20 text-gold";
      case "cancelled":
        return "bg-destructive/20 text-destructive";
      case "completed":
        return "bg-primary/20 text-primary";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15">
              <Sparkles className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground">
                {t("welcome")}, {client?.name}
              </h1>
              <p className="text-xs text-muted-foreground font-mono" dir="ltr">
                {client?.phone}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t("logout")}</span>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-6">
        {/* Quick links */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push("/portal/invoices")}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary"
          >
            <FileText className="h-5 w-5 text-gold" />
            <span className="text-sm font-medium text-foreground">
              {t("invoices")}
            </span>
          </button>
          <button
            onClick={() => router.push("/portal/profile")}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary"
          >
            <User className="h-5 w-5 text-gold" />
            <span className="text-sm font-medium text-foreground">
              {t("profile")}
            </span>
          </button>
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            {t("upcomingAppointments")}
          </h2>

          {upcoming.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t("noUpcoming")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">
                        {appointment.service}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {appointment.employee}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-mono" dir="ltr">
                          <Calendar className="h-3 w-3" />
                          {appointment.date}
                        </span>
                        <span className="flex items-center gap-1 font-mono" dir="ltr">
                          <Clock className="h-3 w-3" />
                          {appointment.time}
                        </span>
                        <span className="font-mono" dir="ltr">
                          {appointment.duration} min
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        className={statusColor(appointment.status)}
                      >
                        {appointment.status}
                      </Badge>
                      <span className="text-sm font-semibold text-gold font-mono" dir="ltr">
                        {appointment.price}
                      </span>
                    </div>
                  </div>

                  {/* Cancel button */}
                  {appointment.status !== "cancelled" &&
                    appointment.status !== "completed" && (
                      <div className="mt-3 border-t border-border pt-3">
                        {confirmCancelId === appointment.id ? (
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-destructive">
                              {t("cancelConfirm")}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="xs"
                                variant="ghost"
                                onClick={() => setConfirmCancelId(null)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              <Button
                                size="xs"
                                variant="destructive"
                                disabled={cancellingId === appointment.id}
                                onClick={() => handleCancel(appointment.id)}
                              >
                                {t("cancelled")}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="xs"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() =>
                              setConfirmCancelId(appointment.id)
                            }
                          >
                            {t("cancelAppointment")}
                          </Button>
                        )}
                      </div>
                    )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Past Appointments */}
        <div>
          <button
            onClick={() => setShowPast(!showPast)}
            className="mb-3 flex w-full items-center justify-between text-lg font-semibold text-foreground"
          >
            {t("pastAppointments")}
            {showPast ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {showPast && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              {past.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t("noPast")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {past.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="rounded-xl border border-border bg-card p-4 opacity-70"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">
                            {appointment.service}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {appointment.employee}
                          </p>
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="font-mono" dir="ltr">
                              {appointment.date}
                            </span>
                            <span className="font-mono" dir="ltr">
                              {appointment.time}
                            </span>
                          </div>
                        </div>
                        <Badge
                          className={statusColor(appointment.status)}
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
