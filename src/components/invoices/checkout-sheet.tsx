"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServices } from "@/lib/hooks/use-services";
import { useCreateInvoice } from "@/lib/hooks/use-invoices";
import { formatCurrency } from "@/lib/formatters";
import { Appointment, InvoicePaymentMethod } from "@/types";

interface CheckoutSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onComplete?: () => void;
}

interface ExtraRow { description: string; unitPrice: string; serviceId: string; }

const CUSTOM_ITEM_VALUE = "__custom__";

export function CheckoutSheet({ open, onOpenChange, appointment, onComplete }: CheckoutSheetProps) {
  const t = useTranslations("invoices");
  const tc = useTranslations("common");
  const locale = useLocale();
  const createInvoice = useCreateInvoice();

  const { data: servicesData } = useServices({ limit: 100 });
  const services = servicesData?.data ?? [];

  const paymentMethods = [
    { value: "cash", label: t("paymentCash") },
    { value: "card", label: t("paymentCard") },
    { value: "bank_transfer", label: t("paymentBankTransfer") },
  ];

  const [mainServiceId, setMainServiceId] = useState("");
  const [mainServiceName, setMainServiceName] = useState("");
  const [mainServicePrice, setMainServicePrice] = useState(0);
  const [extras, setExtras] = useState<ExtraRow[]>([]);
  const [discountPercent, setDiscountPercent] = useState("0");
  const [taxRate, setTaxRate] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<InvoicePaymentMethod>("cash");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!appointment) return;
    const matched = services.find((s) => s.name === appointment.service);
    setMainServiceId(matched ? matched.id : CUSTOM_ITEM_VALUE);
    setMainServiceName(appointment.service);
    setMainServicePrice(appointment.price);
  }, [appointment, services]);

  const handleMainServiceSelect = (serviceId: string) => {
    if (serviceId === CUSTOM_ITEM_VALUE) {
      setMainServiceId(CUSTOM_ITEM_VALUE);
      setMainServiceName("");
      setMainServicePrice(0);
    } else {
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        setMainServiceId(serviceId);
        setMainServiceName(service.name);
        setMainServicePrice(service.price);
      }
    }
  };

  const handleExtraServiceSelect = (idx: number, serviceId: string) => {
    const n = [...extras];
    if (serviceId === CUSTOM_ITEM_VALUE) {
      n[idx] = { ...n[idx], serviceId: CUSTOM_ITEM_VALUE, description: "", unitPrice: "" };
    } else {
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        n[idx] = { ...n[idx], serviceId, description: service.name, unitPrice: String(service.price) };
      }
    }
    setExtras(n);
  };

  const calc = useMemo(() => {
    if (!appointment) return { rawSubtotal: 0, discountAmount: 0, subtotal: 0, taxAmount: 0, total: 0 };
    const serviceTotal = mainServicePrice;
    const extrasTotal = extras.reduce((s, e) => s + (Number(e.unitPrice) || 0), 0);
    const rawSubtotal = serviceTotal + extrasTotal;
    const disc = Math.min(100, Math.max(0, Number(discountPercent) || 0));
    const discountAmount = rawSubtotal * (disc / 100);
    const subtotal = rawSubtotal - discountAmount;
    const tax = Math.min(100, Math.max(0, Number(taxRate) || 0));
    const taxAmount = subtotal * (tax / 100);
    return { rawSubtotal, discountAmount, subtotal, taxAmount, total: subtotal + taxAmount };
  }, [appointment, mainServicePrice, extras, discountPercent, taxRate]);

  const handleCheckout = () => {
    if (!appointment) return;

    const disc = Number(discountPercent) || 0;
    const serviceItem = { description: mainServiceName, quantity: 1, unitPrice: mainServicePrice, discount: disc, total: mainServicePrice * (1 - disc / 100) };
    const extraItems = extras.filter((e) => e.description).map((e) => ({ description: e.description, quantity: 1, unitPrice: Number(e.unitPrice) || 0, discount: disc, total: (Number(e.unitPrice) || 0) * (1 - disc / 100) }));

    createInvoice.mutate({
      invoiceNumber: `INV-${String(Date.now()).slice(-3)}`,
      date: new Date().toISOString().split("T")[0],
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone,
      appointmentId: appointment.id,
      items: [serviceItem, ...extraItems],
      subtotal: calc.subtotal,
      taxRate: Number(taxRate) || 0,
      taxAmount: calc.taxAmount,
      total: calc.total,
      status: "paid",
      paymentMethod,
      notes: notes || undefined,
    }, {
      onSuccess: () => {
        toast.success(t("checkoutSuccess"));
        setMainServiceId(""); setMainServiceName(""); setMainServicePrice(0);
        setExtras([]); setDiscountPercent("0"); setTaxRate("0"); setPaymentMethod("cash"); setNotes("");
        onComplete?.();
        onOpenChange(false);
      },
    });
  };

  if (!appointment) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("checkout")}</SheetTitle>
          <SheetDescription className="sr-only">{t("checkout")}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 px-4">
          {/* Client */}
          <div className="rounded-lg border border-border p-3">
            <p className="font-medium text-foreground">{appointment.clientName}</p>
            <p className="text-sm font-english text-muted-foreground">{appointment.clientPhone}</p>
          </div>

          {/* Service */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{t("services")}</p>
            <div className="space-y-2 rounded-lg border border-border p-3">
              <Select value={mainServiceId} onValueChange={handleMainServiceSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("selectService")} />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                  ))}
                  <SelectItem value={CUSTOM_ITEM_VALUE}>{t("customItem")}</SelectItem>
                </SelectContent>
              </Select>
              {mainServiceId === CUSTOM_ITEM_VALUE && (
                <Input value={mainServiceName} onChange={(e) => setMainServiceName(e.target.value)} placeholder={t("description")} />
              )}
              <div>
                <label className="text-xs text-muted-foreground">{t("price")}</label>
                <Input type="number" min={0} value={mainServicePrice} onChange={(e) => setMainServicePrice(Number(e.target.value) || 0)} className="w-full font-english" dir="ltr" />
              </div>
            </div>
          </div>

          {/* Extras */}
          {extras.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{t("extraItems")}</p>
              {extras.map((e, idx) => (
                <div key={idx} className="space-y-2 rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Select value={e.serviceId} onValueChange={(v) => handleExtraServiceSelect(idx, v)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={t("selectService")} />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                        ))}
                        <SelectItem value={CUSTOM_ITEM_VALUE}>{t("customItem")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon-xs" onClick={() => setExtras(extras.filter((_, i) => i !== idx))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                  {e.serviceId === CUSTOM_ITEM_VALUE && (
                    <Input value={e.description} onChange={(ev) => { const n = [...extras]; n[idx] = { ...n[idx], description: ev.target.value }; setExtras(n); }} placeholder={t("description")} />
                  )}
                  <div>
                    <label className="text-xs text-muted-foreground">{t("price")}</label>
                    <Input type="number" min={0} value={e.unitPrice} onChange={(ev) => { const n = [...extras]; n[idx] = { ...n[idx], unitPrice: ev.target.value }; setExtras(n); }} className="w-full font-english" dir="ltr" />
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setExtras([...extras, { description: "", unitPrice: "", serviceId: "" }])}>
            <Plus className="h-3 w-3" /> {t("addItem")}
          </Button>

          {/* Discount & Tax */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("discountPercent")}</label>
              <Input type="number" min={0} max={100} value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} className="font-english" dir="ltr" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("taxPercent")}</label>
              <Input type="number" min={0} max={100} value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="font-english" dir="ltr" />
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg border border-border bg-secondary/20 p-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{t("subtotalRaw")}</span><span className="font-english">{formatCurrency(calc.rawSubtotal, locale)}</span></div>
            {Number(discountPercent) > 0 && <div className="flex justify-between text-destructive"><span>{t("discountPercent")} ({discountPercent}%)</span><span className="font-english">- {formatCurrency(calc.discountAmount, locale)}</span></div>}
            {Number(taxRate) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">{t("tax")} ({taxRate}%)</span><span className="font-english">{formatCurrency(calc.taxAmount, locale)}</span></div>}
            <div className="flex justify-between font-bold border-t border-border pt-1"><span>{t("total")}</span><span className="font-english text-gold">{formatCurrency(calc.total, locale)}</span></div>
          </div>

          {/* Payment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("paymentMethod")}</label>
            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as InvoicePaymentMethod)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {paymentMethods.map((m) => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("notes")}</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleCheckout}>{t("completeCheckout")}</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("close")}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
