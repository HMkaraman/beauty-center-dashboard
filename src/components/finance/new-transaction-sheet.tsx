"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { financeCategories, transactionTypes } from "@/lib/mock-data";
import { useCreateTransaction, useUpdateTransaction } from "@/lib/hooks/use-finance";
import { Transaction } from "@/types";

interface NewTransactionSheetProps { open: boolean; onOpenChange: (open: boolean) => void; editItem?: Transaction | null; }
const emptyForm = { description: "", category: "", type: "", amount: "", date: "" };

export function NewTransactionSheet({ open, onOpenChange, editItem }: NewTransactionSheetProps) {
  const t = useTranslations("finance"); const tc = useTranslations("common");
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const [form, setForm] = useState(emptyForm);
  useEffect(() => { if (editItem) { setForm({ description: editItem.description, category: editItem.category, type: editItem.type, amount: String(editItem.amount), date: editItem.date }); } else { setForm(emptyForm); } }, [editItem, open]);
  const handleSubmit = () => {
    if (!form.description || !form.type || !form.amount) { toast.error(tc("requiredField")); return; }
    if (editItem) { updateTransaction.mutate({ id: editItem.id, data: { description: form.description, category: form.category, type: form.type as "income" | "expense", amount: Number(form.amount), date: form.date } }, { onSuccess: () => { toast.success(tc("updateSuccess")); setForm(emptyForm); onOpenChange(false); } }); }
    else { createTransaction.mutate({ description: form.description, category: form.category, type: form.type as "income" | "expense", amount: Number(form.amount), date: form.date || new Date().toISOString().split("T")[0] }, { onSuccess: () => { toast.success(tc("addSuccess")); setForm(emptyForm); onOpenChange(false); } }); }
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}><SheetContent side="left" className="overflow-y-auto">
      <SheetHeader><SheetTitle>{editItem ? tc("editItem") : t("newTransaction")}</SheetTitle><SheetDescription className="sr-only">{editItem ? tc("editItem") : t("newTransaction")}</SheetDescription></SheetHeader>
      <div className="flex-1 space-y-4 px-4">
        <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("description")}</label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("category")}</label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger className="w-full"><SelectValue placeholder={t("selectCategory")} /></SelectTrigger><SelectContent>{financeCategories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select></div>
        <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("type")}</label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger className="w-full"><SelectValue placeholder={t("selectType")} /></SelectTrigger><SelectContent>{transactionTypes.map((t2) => (<SelectItem key={t2.value} value={t2.value}>{t2.label}</SelectItem>))}</SelectContent></Select></div>
        <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("amount")}</label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="font-english" dir="ltr" /></div>
        <div className="space-y-2"><label className="text-sm font-medium text-foreground">{t("date")}</label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="font-english" dir="ltr" /></div>
      </div>
      <SheetFooter><Button onClick={handleSubmit}>{t("save")}</Button><Button variant="outline" onClick={() => onOpenChange(false)}>{t("close")}</Button></SheetFooter>
    </SheetContent></Sheet>
  );
}
