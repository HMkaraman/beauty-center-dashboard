"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Clock, TrendingUp, DollarSign, XCircle, BarChart3, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClientStatusBadge } from "./client-status-badge";
import { ClientValueTierBadge } from "./client-value-tier-badge";
import { ClientInsightsPanel } from "./client-insights-panel";
import { ClientDetailAppointmentsTable } from "./client-detail-appointments-table";
import { ClientDetailInvoicesTable } from "./client-detail-invoices-table";
import { ClientAppointmentCard } from "./client-appointment-card";
import { ClientInvoiceCard } from "./client-invoice-card";
import { ClientHealingJourneysTable } from "./client-healing-journeys-table";
import { ClientHealingJourneyCard } from "./client-healing-journey-card";
import { ActivityTimeline } from "@/components/activity/activity-timeline";
import { NewHealingJourneySheet } from "./new-healing-journey-sheet";
import { HealingJourneyUpdatesSheet } from "./healing-journey-updates-sheet";
import { useClientDetails, useHealingJourneys, useDeleteHealingJourney } from "@/lib/hooks";
import { formatCurrency } from "@/lib/formatters";
import type { HealingJourney } from "@/types";

interface ClientDetailPageProps {
  clientId: string;
}

export function ClientDetailPage({ clientId }: ClientDetailPageProps) {
  const t = useTranslations("clients");
  const locale = useLocale();
  const router = useRouter();
  const { data, isLoading, error } = useClientDetails(clientId);
  const { data: healingJourneys } = useHealingJourneys(clientId);
  const deleteJourney = useDeleteHealingJourney();

  const [journeySheetOpen, setJourneySheetOpen] = useState(false);
  const [editingJourney, setEditingJourney] = useState<HealingJourney | null>(null);
  const [updatesSheetOpen, setUpdatesSheetOpen] = useState(false);
  const [viewingJourney, setViewingJourney] = useState<HealingJourney | null>(null);

  const handleViewJourney = (journey: HealingJourney) => {
    setViewingJourney(journey);
    setUpdatesSheetOpen(true);
  };

  const handleEditJourney = (journey: HealingJourney) => {
    setEditingJourney(journey);
    setJourneySheetOpen(true);
  };

  const handleDeleteJourney = (journey: HealingJourney) => {
    if (!confirm(t("deleteJourneyConfirm"))) return;
    deleteJourney.mutate(
      { clientId, journeyId: journey.id },
      { onSuccess: () => toast.success(t("journeyDeleted")) }
    );
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/clients")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("backToClients")}
        </Button>
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          {error?.message || "Client not found"}
        </div>
      </div>
    );
  }

  const { client, kpis, analytics, recentAppointments, recentInvoices } = data;

  const kpiCards = [
    {
      label: t("kpiTotalAppointments"),
      value: String(kpis.totalAppointments),
      icon: <Calendar className="h-5 w-5 text-gold" />,
    },
    {
      label: t("kpiTotalSpent"),
      value: formatCurrency(kpis.totalSpent, locale),
      icon: <DollarSign className="h-5 w-5 text-gold" />,
    },
    {
      label: t("kpiAvgSpendPerVisit"),
      value: formatCurrency(kpis.averageSpendPerVisit, locale),
      icon: <TrendingUp className="h-5 w-5 text-gold" />,
    },
    {
      label: t("kpiLastVisit"),
      value: kpis.lastVisitDate || t("never"),
      icon: <Clock className="h-5 w-5 text-gold" />,
    },
    {
      label: t("kpiCancellationRate"),
      value: `${kpis.cancellationRate}%`,
      icon: <XCircle className="h-5 w-5 text-gold" />,
    },
    {
      label: t("kpiVisitFrequency"),
      value: kpis.visitFrequencyDays > 0
        ? t("everyXDays", { days: kpis.visitFrequencyDays })
        : t("noVisitsYet"),
      icon: <BarChart3 className="h-5 w-5 text-gold" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.push("/clients")} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        {t("backToClients")}
      </Button>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-border bg-card p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Avatar size="lg" className="!size-16">
              <AvatarFallback className="text-lg">{client.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">{client.name}</h1>
                <ClientStatusBadge status={client.status} />
                <ClientValueTierBadge tier={analytics.valueTier} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {client.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    <span className="font-english">{client.phone}</span>
                  </span>
                )}
                {client.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="font-english">{client.email}</span>
                  </span>
                )}
                {(client.city || client.country) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {[client.city, client.country].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
              {client.joinDate && (
                <p className="text-xs text-muted-foreground/60">
                  {t("memberSince")}: <span className="font-english">{client.joinDate}</span>
                </p>
              )}
            </div>
          </div>
        </div>
        {client.notes && (
          <div className="mt-4 rounded-md bg-secondary/30 p-3 text-sm text-muted-foreground">
            {client.notes}
          </div>
        )}
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(196, 149, 106, 0.15)" }}
            className="rounded-lg border border-border bg-gradient-to-br from-card to-card/80 p-4"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15">
              {kpi.icon}
            </div>
            <div className="mt-3">
              <p className="text-lg font-bold font-english text-foreground">{kpi.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{kpi.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Insights Panel */}
      <ClientInsightsPanel analytics={analytics} />

      {/* Tabs: Appointments & Invoices */}
      <Tabs defaultValue="appointments">
        <TabsList>
          <TabsTrigger value="appointments">
            {t("tabAppointments")} ({recentAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="invoices">
            {t("tabInvoices")} ({recentInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="healingJourneys">
            {t("tabHealingJourneys")} ({healingJourneys?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="activity">
            {t("tabActivity")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments">
          <ClientDetailAppointmentsTable data={recentAppointments} />
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {recentAppointments.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
                {t("noAppointments")}
              </div>
            ) : (
              recentAppointments.map((appt) => (
                <ClientAppointmentCard key={appt.id} data={appt} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <ClientDetailInvoicesTable data={recentInvoices} />
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {recentInvoices.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
                {t("noInvoices")}
              </div>
            ) : (
              recentInvoices.map((inv) => (
                <ClientInvoiceCard key={inv.id} data={inv} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="healingJourneys">
          <div className="mb-4 flex justify-end">
            <Button size="sm" className="gap-2" onClick={() => { setEditingJourney(null); setJourneySheetOpen(true); }}>
              <Plus className="h-4 w-4" />
              {t("newJourney")}
            </Button>
          </div>
          <ClientHealingJourneysTable
            data={healingJourneys ?? []}
            onView={handleViewJourney}
            onEdit={handleEditJourney}
            onDelete={handleDeleteJourney}
          />
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {(!healingJourneys || healingJourneys.length === 0) ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
                {t("noJourneys")}
              </div>
            ) : (
              healingJourneys.map((journey) => (
                <ClientHealingJourneyCard
                  key={journey.id}
                  data={journey}
                  onView={handleViewJourney}
                  onEdit={handleEditJourney}
                  onDelete={handleDeleteJourney}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="rounded-lg border border-border bg-card p-6">
            <ActivityTimeline entityType="client" entityId={clientId} />
          </div>
        </TabsContent>
      </Tabs>

      <NewHealingJourneySheet
        open={journeySheetOpen}
        onOpenChange={setJourneySheetOpen}
        clientId={clientId}
        editItem={editingJourney}
      />
      <HealingJourneyUpdatesSheet
        open={updatesSheetOpen}
        onOpenChange={setUpdatesSheetOpen}
        clientId={clientId}
        journey={viewingJourney}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-9 w-32 rounded-md bg-secondary/50" />
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-secondary/50" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-48 rounded bg-secondary/50" />
            <div className="h-4 w-64 rounded bg-secondary/50" />
            <div className="h-3 w-32 rounded bg-secondary/50" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="h-8 w-8 rounded-full bg-secondary/50" />
            <div className="space-y-1">
              <div className="h-5 w-16 rounded bg-secondary/50" />
              <div className="h-3 w-24 rounded bg-secondary/50" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5 h-32" />
        ))}
      </div>
      <div className="h-10 w-64 rounded-lg bg-secondary/50" />
      <div className="rounded-lg border border-border bg-card h-48" />
    </div>
  );
}
