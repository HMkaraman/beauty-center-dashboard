"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { invoicePaymentMethods } from "@/lib/mock-data";
import { useInvoicesStore } from "@/store/useInvoicesStore";
import { Invoice } from "@/types";

interface NewInvoiceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: Invoice | null;
}

interface ItemRow { description: string; quantity: string; unitPrice: string; discount: string; }

const emptyItem: ItemRow = { description: "", quantity: "1", unitPrice: "", discount: "0" };

export function NewInvoiceSheet({ open, onOpenChange, editItem }: NewInvoiceSheetProps) {
  const t = useTranslations("invoices");
  const tc = useTranslations("common");
  const { addItem, updateItem } = useInvoicesStore();

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ ...emptyItem }]);
  const [taxRate, setTaxRate] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [status, setStatus] = useState("paid");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (editItem) {
      setClientName(editItem.clientName);
      setClientPhone(editItem.clientPhone);
      setItems(editItem.items.map((i) => ({ description: i.description, quantity: String(i.quantity), unitPrice: String(i.unitPrice), discount: String(i.discount) })));
      setTaxRate(String(editItem.taxRate));
      setPaymentMethod(editItem.paymentMethod || "cash");
      setStatus(editItem.status === "void" ? "paid" : editItem.status);
      setNotes(editItem.notes || "");
      setDate(editItem.date);
    } else {
      setClientName(""); setClientPhone(""); setItems([{ ...emptyItem }]); setTaxRate("0"); setPaymentMethod("cash"); setStatus("paid"); setNotes(""); setDate("");
    }
  }, [editItem, open]);

  const calc = useMemo(() => {
    const parsed = items.map((r) => {
      const qty = Number(r.quantity) || 1;
      const price = Number(r.unitPrice) || 0;
      const disc = Math.min(100, Math.max(0, Number(r.discount) || 0));
      const total = qty * price * (1 - disc / 100);
      return { description: r.description, quantity: qty, unitPrice: price, discount: disc, total };
    });
    const subtotal = parsed.reduce((s, i) => s + i.total, 0);
    const tax = Number(taxRate) || 0;
    const taxAmount = subtotal * (tax / 100);
    return { items: parsed, subtotal, taxAmount, total: subtotal + taxAmount };
  }, [items, taxRate]);

  const handleSubmit = () => {
    if (!clientName) { toast.error(tc("requiredField")); return; }
    if (!items.some((i) => i.description)) { toast.error(tc("requiredField")); return; }

    const nextNum = editItem ? editItem.invoiceNumber : `INV-${String(Date.now()).slice(-3)}`;
    const invoiceData: Omit<Invoice, "id"> = {
      invoiceNumber: nextNum,
      date: date || new Date().toISOString().split("T")[0],
      clientName, clientPhone,
      items: calc.items,
      subtotal: calc.subtotal,
      taxRate: Number(taxRate) || 0,
      taxAmount: calc.taxAmount,
      total: calc.total,
      status: status as "paid" | "unpaid",
      paymentMethod: status === "paid" ? paymentMethod as "cash" | "card" | "bank_transfer" : undefined,
      notes: notes || undefined,
    };

    if (editItem) {
      updateItem(editItem.id, invoiceData);
      toast.success(tc("updateSuccess"));
    } else {
      addItem(invoiceData);
      toast.success(tc("addSuccess"));
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editItem ? tc("editItem") : t("newInvoice")}</SheetTitle>
          <SheetDescription className="sr-only">{editItem ? tc("editItem") : t("newInvoice")}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 px-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("clientName")}</label>
            <Input value={clientName} onChange={(e) => setClientName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("clientPhone")}</label>
            <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="font-english" dir="ltr" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">{t("items")}</label>
              <Button variant="ghost" size="sm" onClick={() => setItems([...items, { ...emptyItem }])}>
                <Plus className="h-3 w-3" /> {t("addItem")}
              </Button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="space-y-2 rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <Input value={item.description} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], description: e.target.value }; setItems(n); }} placeholder={t("description")} className="flex-1" />
                  {items.length > 1 && (
                    <Button variant="ghost" size="icon-xs" onClick={() => setItems(items.filter((_, i) => i !== idx))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div><label className="text-xs text-muted-foreground">{t("qty")}</label><Input type="number" min={1} value={item.quantity} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], quantity: e.target.value }; setItems(n); }} className="font-english" dir="ltr" /></div>
                  <div><label className="text-xs text-muted-foreground">{t("price")}</label><Input type="number" min={0} value={item.unitPrice} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], unitPrice: e.target.value }; setItems(n); }} className="font-english" dir="ltr" /></div>
                  <div><label className="text-xs text-muted-foreground">{t("discountPercent")}</label><Input type="number" min={0} max={100} value={item.discount} onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], discount: e.target.value }; setItems(n); }} className="font-english" dir="ltr" /></div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("taxPercent")}</label>
              <Input type="number" min={0} max={100} value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="font-english" dir="ltr" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("status")}</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">{t("statusPaid")}</SelectItem>
                  <SelectItem value="unpaid">{t("statusUnpaid")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {status === "paid" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("paymentMethod")}</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {invoicePaymentMethods.map((m) => (<SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("date")}</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="font-english" dir="ltr" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("notes")}</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {/* Summary */}
          <div className="rounded-lg border border-border bg-secondary/20 p-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{t("subtotal")}</span><span className="font-english">{calc.subtotal.toFixed(2)}</span></div>
            {Number(taxRate) > 0 && <div className="flex justify-between"><span className="text-muted-foreground">{t("tax")}</span><span className="font-english">{calc.taxAmount.toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold border-t border-border pt-1"><span>{t("total")}</span><span className="font-english">{calc.total.toFixed(2)}</span></div>
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSubmit}>{t("save")}</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("close")}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
