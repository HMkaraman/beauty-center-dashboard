"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  User,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  StickyNote,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  bookingApi,
  type TenantInfo,
  type BookingService,
  type BookingEmployee,
  type TimeSlot,
} from "@/lib/api/booking";

// ─── Types ───────────────────────────────────────────────────────────

interface BookingState {
  service: BookingService | null;
  employee: BookingEmployee | null;
  date: string | null;
  slot: TimeSlot | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes: string;
}

const STEPS = [
  "selectService",
  "selectEmployee",
  "selectDateTime",
  "clientInfo",
  "confirmation",
] as const;

type Step = (typeof STEPS)[number];

// ─── Animation variants ──────────────────────────────────────────────

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

// ─── Main Component ──────────────────────────────────────────────────

export default function BookingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const t = useTranslations("booking");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [booking, setBooking] = useState<BookingState>({
    service: null,
    employee: null,
    date: null,
    slot: null,
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    notes: "",
  });

  // ─── Data Queries ────────────────────────────────────────────────

  const tenantQuery = useQuery({
    queryKey: ["tenant-info", slug],
    queryFn: () => bookingApi.getTenantInfo(slug),
    enabled: !!slug,
  });

  const servicesQuery = useQuery({
    queryKey: ["booking-services", slug],
    queryFn: () => bookingApi.getServices(slug),
    enabled: !!slug,
  });

  const employeesQuery = useQuery({
    queryKey: ["booking-employees", slug],
    queryFn: () => bookingApi.getEmployees(slug),
    enabled: !!slug,
  });

  const datesQuery = useQuery({
    queryKey: ["booking-dates", slug, booking.service?.id],
    queryFn: () => bookingApi.getDates(slug, booking.service!.id),
    enabled: !!slug && !!booking.service,
  });

  const slotsQuery = useQuery({
    queryKey: [
      "booking-slots",
      slug,
      booking.date,
      booking.service?.id,
      booking.employee?.id,
    ],
    queryFn: () =>
      bookingApi.getAvailability(
        slug,
        booking.date!,
        booking.service!.id,
        booking.employee?.id
      ),
    enabled: !!slug && !!booking.date && !!booking.service,
  });

  const bookMutation = useMutation({
    mutationFn: () =>
      bookingApi.book(slug, {
        clientName: booking.clientName,
        clientPhone: booking.clientPhone,
        serviceId: booking.service!.id,
        employeeId: booking.employee?.id || booking.slot!.employeeId,
        date: booking.date!,
        time: booking.slot!.time,
      }),
    onSuccess: () => {
      setBookingSuccess(true);
    },
  });

  // ─── Grouped Services ────────────────────────────────────────────

  const groupedServices = useMemo(() => {
    const services = servicesQuery.data?.data || [];
    const groups: Record<string, BookingService[]> = {};
    for (const s of services) {
      const cat = s.category || "other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    }
    return groups;
  }, [servicesQuery.data]);

  // ─── Navigation ──────────────────────────────────────────────────

  const goNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep]);

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const canProceed = useMemo(() => {
    switch (STEPS[currentStep]) {
      case "selectService":
        return !!booking.service;
      case "selectEmployee":
        return true; // employee is optional
      case "selectDateTime":
        return !!booking.date && !!booking.slot;
      case "clientInfo":
        return booking.clientName.trim() !== "" && booking.clientPhone.trim() !== "";
      case "confirmation":
        return true;
      default:
        return false;
    }
  }, [currentStep, booking]);

  const resetBooking = useCallback(() => {
    setBooking({
      service: null,
      employee: null,
      date: null,
      slot: null,
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      notes: "",
    });
    setCurrentStep(0);
    setDirection(0);
    setBookingSuccess(false);
    bookMutation.reset();
  }, [bookMutation]);

  // Reset date/slot when service or employee changes
  useEffect(() => {
    setBooking((prev) => ({ ...prev, date: null, slot: null }));
  }, [booking.service?.id, booking.employee?.id]);

  // ─── Tenant Info ─────────────────────────────────────────────────

  const tenantName = useMemo(() => {
    if (!tenantQuery.data) return "";
    return locale === "ar"
      ? tenantQuery.data.name
      : tenantQuery.data.nameEn || tenantQuery.data.name;
  }, [tenantQuery.data, locale]);

  const currency = tenantQuery.data?.currency || "SAR";

  // ─── Success Screen ──────────────────────────────────────────────

  if (bookingSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-green/15 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-green" />
          </motion.div>

          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t("success")}
          </h2>
          <p className="text-muted-foreground mb-8">{t("successMessage")}</p>

          <div className="bg-card rounded-xl border border-border p-5 mb-8 text-start">
            <div className="space-y-3">
              <SummaryRow
                label={t("selectService")}
                value={
                  locale === "ar"
                    ? booking.service!.name
                    : booking.service!.nameEn || booking.service!.name
                }
              />
              <SummaryRow
                label={t("date")}
                value={formatDate(booking.date!, locale)}
              />
              <SummaryRow label={t("time")} value={booking.slot!.time} />
              <SummaryRow
                label={t("selectEmployee")}
                value={booking.slot!.employeeName}
              />
              <SummaryRow
                label={t("price")}
                value={`${booking.service!.price} ${currency}`}
              />
            </div>
          </div>

          <button
            onClick={resetBooking}
            className="w-full py-3 rounded-xl bg-gold text-primary-foreground font-semibold hover:bg-gold-light transition-colors"
          >
            {t("bookAnother")}
          </button>

          <p className="text-xs text-muted-foreground mt-6">
            {t("poweredBy")}
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── Main Render ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {tenantQuery.data?.logo ? (
                <img
                  src={tenantQuery.data.logo}
                  alt={tenantName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-gold" />
                </div>
              )}
              <div>
                <h1 className="font-bold text-foreground text-lg leading-tight">
                  {tenantName || <span className="invisible">Loading</span>}
                </h1>
                <p className="text-xs text-muted-foreground">{t("title")}</p>
              </div>
            </div>
          </div>

          {/* Stepper */}
          <StepperBar
            steps={STEPS}
            currentStep={currentStep}
            t={t}
            isRtl={isRtl}
          />
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={STEPS[currentStep]}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {STEPS[currentStep] === "selectService" && (
              <StepSelectService
                groupedServices={groupedServices}
                selected={booking.service}
                onSelect={(s) => setBooking((prev) => ({ ...prev, service: s }))}
                loading={servicesQuery.isLoading}
                error={servicesQuery.isError}
                t={t}
                locale={locale}
                currency={currency}
              />
            )}

            {STEPS[currentStep] === "selectEmployee" && (
              <StepSelectEmployee
                employees={employeesQuery.data?.data || []}
                selected={booking.employee}
                onSelect={(e) =>
                  setBooking((prev) => ({ ...prev, employee: e }))
                }
                loading={employeesQuery.isLoading}
                t={t}
              />
            )}

            {STEPS[currentStep] === "selectDateTime" && (
              <StepSelectDateTime
                dates={datesQuery.data?.dates || []}
                slots={slotsQuery.data?.slots || []}
                selectedDate={booking.date}
                selectedSlot={booking.slot}
                onSelectDate={(d) =>
                  setBooking((prev) => ({ ...prev, date: d, slot: null }))
                }
                onSelectSlot={(s) =>
                  setBooking((prev) => ({ ...prev, slot: s }))
                }
                loadingDates={datesQuery.isLoading}
                loadingSlots={slotsQuery.isLoading}
                t={t}
                locale={locale}
                isRtl={isRtl}
              />
            )}

            {STEPS[currentStep] === "clientInfo" && (
              <StepClientInfo
                name={booking.clientName}
                phone={booking.clientPhone}
                email={booking.clientEmail}
                notes={booking.notes}
                onChange={(field, value) =>
                  setBooking((prev) => ({ ...prev, [field]: value }))
                }
                t={t}
              />
            )}

            {STEPS[currentStep] === "confirmation" && (
              <StepConfirmation
                booking={booking}
                currency={currency}
                locale={locale}
                t={t}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Navigation */}
      <footer className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={goBack}
              className="flex-1 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-secondary transition-colors flex items-center justify-center gap-2"
            >
              {isRtl ? (
                <ArrowRight className="w-4 h-4" />
              ) : (
                <ArrowLeft className="w-4 h-4" />
              )}
              {t("back")}
            </button>
          )}

          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={goNext}
              disabled={!canProceed}
              className={cn(
                "flex-1 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2",
                canProceed
                  ? "bg-gold text-primary-foreground hover:bg-gold-light"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {t("next")}
              {isRtl ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <button
              onClick={() => bookMutation.mutate()}
              disabled={bookMutation.isPending}
              className="flex-1 py-3 rounded-xl bg-gold text-primary-foreground font-semibold hover:bg-gold-light transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {bookMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("booking")}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {t("confirm")}
                </>
              )}
            </button>
          )}
        </div>

        {bookMutation.isError && (
          <div className="max-w-2xl mx-auto px-4 pb-4">
            <div className="flex items-center gap-2 text-red text-sm bg-red/10 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {bookMutation.error?.message || t("errorLoading")}
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}

// ─── Stepper Bar ───────────────────────────────────────────────────

function StepperBar({
  steps,
  currentStep,
  t,
  isRtl,
}: {
  steps: readonly string[];
  currentStep: number;
  t: ReturnType<typeof useTranslations>;
  isRtl: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={cn(
                "w-full h-1.5 rounded-full transition-colors duration-300",
                i <= currentStep ? "bg-gold" : "bg-muted"
              )}
            />
            <span
              className={cn(
                "text-[10px] mt-1.5 transition-colors duration-300 text-center leading-tight",
                i === currentStep
                  ? "text-gold font-semibold"
                  : i < currentStep
                    ? "text-foreground"
                    : "text-muted-foreground"
              )}
            >
              {t(step as Parameters<typeof t>[0])}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Step 1: Select Service ────────────────────────────────────────

function StepSelectService({
  groupedServices,
  selected,
  onSelect,
  loading,
  error,
  t,
  locale,
  currency,
}: {
  groupedServices: Record<string, BookingService[]>;
  selected: BookingService | null;
  onSelect: (s: BookingService) => void;
  loading: boolean;
  error: boolean;
  t: ReturnType<typeof useTranslations>;
  locale: string;
  currency: string;
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gold mb-3" />
        <p className="text-muted-foreground text-sm">{t("loadingServices")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-8 h-8 text-red mb-3" />
        <p className="text-muted-foreground text-sm">{t("errorLoading")}</p>
      </div>
    );
  }

  const categories = Object.keys(groupedServices);

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">{t("noServices")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categories.map((cat) => (
        <div key={cat}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {cat}
          </h3>
          <div className="space-y-2">
            {groupedServices[cat].map((service) => {
              const isSelected = selected?.id === service.id;
              const serviceName =
                locale === "ar"
                  ? service.name
                  : service.nameEn || service.name;

              return (
                <button
                  key={service.id}
                  onClick={() => onSelect(service)}
                  className={cn(
                    "w-full text-start p-4 rounded-xl border transition-all duration-200",
                    isSelected
                      ? "border-gold bg-gold/10 ring-1 ring-gold/30"
                      : "border-border bg-card hover:border-gold/40 hover:bg-card/80"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "font-semibold truncate",
                          isSelected ? "text-gold" : "text-foreground"
                        )}
                      >
                        {serviceName}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {service.duration} {t("minutes")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gold whitespace-nowrap">
                        {service.price} {currency}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-gold flex items-center justify-center"
                        >
                          <Check className="w-3.5 h-3.5 text-primary-foreground" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Step 2: Select Employee ───────────────────────────────────────

function StepSelectEmployee({
  employees,
  selected,
  onSelect,
  loading,
  t,
}: {
  employees: BookingEmployee[];
  selected: BookingEmployee | null;
  onSelect: (e: BookingEmployee | null) => void;
  loading: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gold mb-3" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Any Available option */}
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "w-full text-start p-4 rounded-xl border transition-all duration-200",
          selected === null
            ? "border-gold bg-gold/10 ring-1 ring-gold/30"
            : "border-border bg-card hover:border-gold/40"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              selected === null ? "bg-gold/20" : "bg-muted"
            )}
          >
            <User
              className={cn(
                "w-5 h-5",
                selected === null ? "text-gold" : "text-muted-foreground"
              )}
            />
          </div>
          <div className="flex-1">
            <p
              className={cn(
                "font-semibold",
                selected === null ? "text-gold" : "text-foreground"
              )}
            >
              {t("anyEmployee")}
            </p>
          </div>
          {selected === null && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full bg-gold flex items-center justify-center"
            >
              <Check className="w-3.5 h-3.5 text-primary-foreground" />
            </motion.div>
          )}
        </div>
      </button>

      {/* Employee list */}
      {employees.map((emp) => {
        const isSelected = selected?.id === emp.id;
        return (
          <button
            key={emp.id}
            onClick={() => onSelect(emp)}
            className={cn(
              "w-full text-start p-4 rounded-xl border transition-all duration-200",
              isSelected
                ? "border-gold bg-gold/10 ring-1 ring-gold/30"
                : "border-border bg-card hover:border-gold/40"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center overflow-hidden",
                  isSelected ? "bg-gold/20" : "bg-muted"
                )}
              >
                {emp.image ? (
                  <img
                    src={emp.image}
                    alt={emp.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User
                    className={cn(
                      "w-5 h-5",
                      isSelected ? "text-gold" : "text-muted-foreground"
                    )}
                  />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "font-semibold",
                    isSelected ? "text-gold" : "text-foreground"
                  )}
                >
                  {emp.name}
                </p>
                <p className="text-xs text-muted-foreground">{emp.role}</p>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full bg-gold flex items-center justify-center"
                >
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </motion.div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Step 3: Select Date & Time ────────────────────────────────────

function StepSelectDateTime({
  dates,
  slots,
  selectedDate,
  selectedSlot,
  onSelectDate,
  onSelectSlot,
  loadingDates,
  loadingSlots,
  t,
  locale,
  isRtl,
}: {
  dates: string[];
  slots: TimeSlot[];
  selectedDate: string | null;
  selectedSlot: TimeSlot | null;
  onSelectDate: (d: string) => void;
  onSelectSlot: (s: TimeSlot) => void;
  loadingDates: boolean;
  loadingSlots: boolean;
  t: ReturnType<typeof useTranslations>;
  locale: string;
  isRtl: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {t("date")}
        </h3>

        {loadingDates ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : dates.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            {t("noSlots")}
          </p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {dates.map((date) => {
              const isSelected = selectedDate === date;
              const d = new Date(date + "T00:00:00");
              const dayName = d.toLocaleDateString(locale, {
                weekday: "short",
              });
              const dayNum = d.getDate();
              const month = d.toLocaleDateString(locale, { month: "short" });

              return (
                <button
                  key={date}
                  onClick={() => onSelectDate(date)}
                  className={cn(
                    "flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border transition-all duration-200 min-w-[72px]",
                    isSelected
                      ? "border-gold bg-gold/10 ring-1 ring-gold/30"
                      : "border-border bg-card hover:border-gold/40"
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] uppercase font-medium",
                      isSelected ? "text-gold" : "text-muted-foreground"
                    )}
                  >
                    {dayName}
                  </span>
                  <span
                    className={cn(
                      "text-lg font-bold",
                      isSelected ? "text-gold" : "text-foreground"
                    )}
                  >
                    {dayNum}
                  </span>
                  <span
                    className={cn(
                      "text-[10px]",
                      isSelected ? "text-gold" : "text-muted-foreground"
                    )}
                  >
                    {month}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t("time")}
          </h3>

          {loadingSlots ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gold mb-2" />
              <p className="text-xs text-muted-foreground">
                {t("loadingSlots")}
              </p>
            </div>
          ) : slots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground text-sm">{t("noSlots")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot, i) => {
                const isSelected =
                  selectedSlot?.time === slot.time &&
                  selectedSlot?.employeeId === slot.employeeId;

                return (
                  <button
                    key={`${slot.time}-${slot.employeeId}-${i}`}
                    onClick={() => onSelectSlot(slot)}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-xl border transition-all duration-200",
                      isSelected
                        ? "border-gold bg-gold/10 ring-1 ring-gold/30"
                        : "border-border bg-card hover:border-gold/40"
                    )}
                  >
                    <span
                      className={cn(
                        "font-semibold text-sm",
                        isSelected ? "text-gold" : "text-foreground"
                      )}
                    >
                      {slot.time}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-full mt-0.5">
                      {slot.employeeName}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Step 4: Client Info ───────────────────────────────────────────

function StepClientInfo({
  name,
  phone,
  email,
  notes,
  onChange,
  t,
}: {
  name: string;
  phone: string;
  email: string;
  notes: string;
  onChange: (field: string, value: string) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div className="space-y-4">
      {/* Name */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
          <User className="w-4 h-4 text-gold" />
          {t("name")} <span className="text-red">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onChange("clientName", e.target.value)}
          placeholder={t("name")}
          className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
          <Phone className="w-4 h-4 text-gold" />
          {t("phone")} <span className="text-red">*</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => onChange("clientPhone", e.target.value)}
          placeholder={t("phone")}
          dir="ltr"
          className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
        />
      </div>

      {/* Email */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
          <Mail className="w-4 h-4 text-gold" />
          {t("email")}
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => onChange("clientEmail", e.target.value)}
          placeholder={t("email")}
          dir="ltr"
          className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
          <StickyNote className="w-4 h-4 text-gold" />
          {t("notes")}
        </label>
        <textarea
          value={notes}
          onChange={(e) => onChange("notes", e.target.value)}
          placeholder={t("notes")}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors resize-none"
        />
      </div>
    </div>
  );
}

// ─── Step 5: Confirmation ──────────────────────────────────────────

function StepConfirmation({
  booking,
  currency,
  locale,
  t,
}: {
  booking: BookingState;
  currency: string;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const serviceName =
    locale === "ar"
      ? booking.service!.name
      : booking.service!.nameEn || booking.service!.name;

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="bg-gold/10 px-5 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">{t("confirmation")}</h3>
        </div>
        <div className="p-5 space-y-4">
          <SummaryRow label={t("selectService")} value={serviceName} />
          <SummaryRow
            label={t("selectEmployee")}
            value={
              booking.employee
                ? booking.employee.name
                : booking.slot
                  ? booking.slot.employeeName
                  : t("anyEmployee")
            }
          />
          <SummaryRow
            label={t("date")}
            value={formatDate(booking.date!, locale)}
          />
          <SummaryRow label={t("time")} value={booking.slot!.time} />
          <SummaryRow
            label={t("duration")}
            value={`${booking.service!.duration} ${t("minutes")}`}
          />

          <div className="border-t border-border pt-4">
            <SummaryRow label={t("name")} value={booking.clientName} />
            <SummaryRow label={t("phone")} value={booking.clientPhone} />
            {booking.clientEmail && (
              <SummaryRow label={t("email")} value={booking.clientEmail} />
            )}
            {booking.notes && (
              <SummaryRow label={t("notes")} value={booking.notes} />
            )}
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">{t("price")}</span>
              <span className="text-xl font-bold text-gold">
                {booking.service!.price} {currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper Components ─────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground text-end">
        {value}
      </span>
    </div>
  );
}

// ─── Helper Functions ──────────────────────────────────────────────

function formatDate(dateStr: string, locale: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
