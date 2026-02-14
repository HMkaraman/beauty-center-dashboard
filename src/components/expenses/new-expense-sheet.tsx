"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { expenseCategories, paymentMethods } from "@/lib/mock-data";

interface NewExpenseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewExpenseSheet({ open, onOpenChange }: NewExpenseSheetProps) {
  const t = useTranslations("expenses");

  const [form, setForm] = useState({
    description: "",
    category: "",
    amount: "",
    paymentMethod: "",
    date: "",
    notes: "",
  });

  const handleSubmit = () => {
    console.log("New expense:", form);
    setForm({
      description: "",
      category: "",
      amount: "",
      paymentMethod: "",
      date: "",
      notes: "",
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("newExpense")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("newExpense")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 px-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("description")}</label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("category")}</label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("amount")}</label>
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="font-english"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("paymentMethod")}</label>
            <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectPaymentMethod")} />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("date")}</label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="font-english"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("notes")}</label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSubmit}>{t("save")}</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
