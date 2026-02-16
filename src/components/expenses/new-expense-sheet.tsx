"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { expenseCategories, paymentMethods } from "@/lib/mock-data";
import { useCreateExpense, useUpdateExpense } from "@/lib/hooks/use-expenses";
import { Expense } from "@/types";

interface NewExpenseSheetProps { open: boolean; onOpenChange: (open: boolean) => void; editItem?: Expense | null; }
const emptyForm = { description: "", category: "", amount: "", paymentMethod: "", date: "", notes: "" };

export function NewExpenseSheet({ open, onOpenChange, editItem }: NewExpenseSheetProps) {
  const t = useTranslations("expenses"); const tc = useTranslations("common");
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const [form, setForm] = useState(emptyForm);
  useEffect(() => { if (editItem) { setForm({ description: editItem.description, category: editItem.category, amount: String(editItem.amount), paymentMethod: editItem.paymentMethod, date: editItem.date, notes: "" }); } else { setForm(emptyForm); } }, [editItem, open]);
  const handleSubmit = () => {
    if (!form.description || !form.amount) { toast.error(tc("requiredField")); return; }
    if (editItem) { updateExpense.mutate({ id: editItem.id, data: { description: form.description, category: form.category, amount: Number(form.amount), paymentMethod: form.paymentMethod, date: form.date } }, { onSuccess: () => { toast.success(tc("updateSuccess")); setForm(emptyForm); onOpenChange(false); } }); }
    else { createExpense.mutate({ description: form.description, category: form.category, amount: Number(form.amount), paymentMethod: form.paymentMethod, date: form.date || new Date().toISOString().split("T")[0], status: "pending" }, { onSuccess: () => { toast.success(tc("addSuccess")); setForm(emptyForm); onOpenChange(false); } }); }
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}><SheetContent side="left" className="overflow-y-auto">
      <SheetHeader><SheetTitle>{editItem ? tc("editItem") : t("newExpense")}</SheetTitle><SheetDescription className="sr-only">{editItem ? tc("editItem") : t("newExpense")}</SheetDescription></SheetHeader>
      <div className="flex-1 space-y-4 px-4">
        <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("description")}</label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("category")}</label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger className="w-full"><SelectValue placeholder={t("selectCategory")} /></SelectTrigger><SelectContent>{expenseCategories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select></div>
        <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("amount")}</label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="font-english" /></div>
        <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("paymentMethod")}</label><Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}><SelectTrigger className="w-full"><SelectValue placeholder={t("selectPaymentMethod")} /></SelectTrigger><SelectContent>{paymentMethods.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}</SelectContent></Select></div>
        <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("date")}</label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="font-english" /></div>
        <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("notes")}</label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
      </div>
      <SheetFooter><Button onClick={handleSubmit}>{t("save")}</Button><Button variant="outline" onClick={() => onOpenChange(false)}>{t("close")}</Button></SheetFooter>
    </SheetContent></Sheet>
  );
}
