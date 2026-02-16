"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
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
import { servicesList, employeesList } from "@/lib/mock-data";
import { useCreateAppointment, useUpdateAppointment } from "@/lib/hooks/use-appointments";
import { Appointment } from "@/types";

interface NewAppointmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: Appointment | null;
}

const emptyForm = {
  clientName: "",
  clientPhone: "",
  service: "",
  employee: "",
  date: "",
  time: "",
  notes: "",
};

export function NewAppointmentSheet({ open, onOpenChange, editItem }: NewAppointmentSheetProps) {
  const t = useTranslations("appointments");
  const tc = useTranslations("common");
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editItem) {
      setForm({
        clientName: editItem.clientName,
        clientPhone: editItem.clientPhone,
        service: editItem.service,
        employee: editItem.employee,
        date: editItem.date,
        time: editItem.time,
        notes: editItem.notes || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [editItem, open]);

  const handleSubmit = () => {
    if (!form.clientName || !form.service || !form.date || !form.time) {
      toast.error(tc("requiredField"));
      return;
    }

    const selectedService = servicesList.find((s) => s.name === form.service);

    if (editItem) {
      updateAppointment.mutate({ id: editItem.id, data: {
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        service: form.service,
        employee: form.employee,
        date: form.date,
        time: form.time,
        notes: form.notes || undefined,
        duration: selectedService?.duration || editItem.duration,
        price: selectedService?.price || editItem.price,
      } }, { onSuccess: () => { toast.success(tc("updateSuccess")); setForm(emptyForm); onOpenChange(false); } });
    } else {
      createAppointment.mutate({
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        service: form.service,
        employee: form.employee,
        date: form.date,
        time: form.time,
        duration: selectedService?.duration || 60,
        status: "pending",
        price: selectedService?.price || 0,
        notes: form.notes || undefined,
      }, { onSuccess: () => { toast.success(tc("addSuccess")); setForm(emptyForm); onOpenChange(false); } });
    }
    return;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editItem ? tc("editItem") : t("newAppointment")}</SheetTitle>
          <SheetDescription className="sr-only">
            {editItem ? tc("editItem") : t("newAppointment")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 px-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("clientName")}</label>
            <Input
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("clientPhone")}</label>
            <Input
              value={form.clientPhone}
              onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
              className="font-english"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("service")}</label>
            <Select value={form.service} onValueChange={(v) => setForm({ ...form, service: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectService")} />
              </SelectTrigger>
              <SelectContent>
                {servicesList.map((service) => (
                  <SelectItem key={service.name} value={service.name}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("employee")}</label>
            <Select value={form.employee} onValueChange={(v) => setForm({ ...form, employee: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectEmployee")} />
              </SelectTrigger>
              <SelectContent>
                {employeesList.map((emp) => (
                  <SelectItem key={emp.id} value={emp.name}>
                    {emp.name}
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
            <label className="text-sm font-medium text-foreground">{t("time")}</label>
            <Input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="font-english"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("notes")}</label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={t("notesPlaceholder")}
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
