"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Syringe, MoreHorizontal, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReservationStatusBadge } from "./reservation-status-badge";
import { TouchUpSheet } from "./touch-up-sheet";
import { useReservations, useUpdateReservation } from "@/lib/hooks/use-reservations";
import { Price } from "@/components/ui/price";
import type { ClientProductReservation, ReservationStatus } from "@/types";

const CLEAR_VALUE = "__all__";

export function ReservationsTable() {
  const t = useTranslations("reservations");
  const tc = useTranslations("common");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [touchUpItem, setTouchUpItem] = useState<ClientProductReservation | null>(null);
  const [touchUpOpen, setTouchUpOpen] = useState(false);

  const { data, isLoading } = useReservations({
    status: statusFilter || undefined,
    page,
    limit: 20,
  });
  const updateReservation = useUpdateReservation();

  const reservations = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  const handleDispose = (id: string) => {
    updateReservation.mutate({ id, data: { status: "disposed" } }, {
      onSuccess: () => toast.success(tc("updateSuccess")),
    });
  };

  const handleTouchUp = (reservation: ClientProductReservation) => {
    setTouchUpItem(reservation);
    setTouchUpOpen(true);
  };

  const getDaysLeft = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-lg bg-muted" />;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter || CLEAR_VALUE} onValueChange={(v) => { setStatusFilter(v === CLEAR_VALUE ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={CLEAR_VALUE}>{t("allStatuses")}</SelectItem>
            <SelectItem value="active">{t("statusActive")}</SelectItem>
            <SelectItem value="used">{t("statusUsed")}</SelectItem>
            <SelectItem value="expired">{t("statusExpired")}</SelectItem>
            <SelectItem value="disposed">{t("statusDisposed")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {reservations.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          {t("noReservations")}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("client")}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("product")}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("remaining")}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("expires")}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("daysLeft")}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("status")}</th>
                <th className="px-4 py-3 text-start font-medium text-muted-foreground">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reservations.map((r) => {
                const daysLeft = getDaysLeft(r.expiryDate);
                return (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">{r.clientName || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Syringe className="h-3.5 w-3.5 text-muted-foreground" />
                        {r.productName}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-english">{r.remainingAmount} {r.unit}</td>
                    <td className="px-4 py-3 font-english">{r.expiryDate || "-"}</td>
                    <td className="px-4 py-3">
                      {daysLeft != null ? (
                        <span className={`flex items-center gap-1 font-english ${daysLeft <= 3 ? "text-red-600" : daysLeft <= 7 ? "text-amber-600" : "text-muted-foreground"}`}>
                          <Clock className="h-3 w-3" />
                          {daysLeft}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3"><ReservationStatusBadge status={r.status} /></td>
                    <td className="px-4 py-3">
                      {r.status === "active" && (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleTouchUp(r)}>
                            {t("touchUp")}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => handleDispose(r.id)}>
                            {t("dispose")}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            &laquo;
          </Button>
          <span className="text-sm text-muted-foreground font-english">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            &raquo;
          </Button>
        </div>
      )}

      <TouchUpSheet
        open={touchUpOpen}
        onOpenChange={setTouchUpOpen}
        reservation={touchUpItem}
      />
    </div>
  );
}
