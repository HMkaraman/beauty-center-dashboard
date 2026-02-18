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
import { useServices } from "@/lib/hooks/use-services";
import { useEmployees } from "@/lib/hooks/use-employees";
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
  serviceId: "",
  employeeId: "",
  date: "",
  time: "",
  notes: "",
};

export function NewAppointmentSheet({ open, onOpenChange, editItem }: NewAppointmentSheetProps) {
  const t = useTranslations("appointments");
  const tc = useTranslations("common");
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  const { data: servicesData } = useServices({ limit: 100 });
  const { data: employeesData } = useEmployees({ limit: 100 });
  const services = servicesData?.data ?? [];
  const employees = employeesData?.data ?? [];

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editItem) {
      // When editing, try to match existing service/employee names to IDs
      const matchedService = services.find((s) => s.name === editItem.service);
      const matchedEmployee = employees.find((e) => e.name === editItem.employee);
      setForm({
        clientName: editItem.clientName,
        clientPhone: editItem.clientPhone,
        serviceId: matchedService?.id || "",
        employeeId: matchedEmployee?.id || "",
        date: editItem.date,
        time: editItem.time,
        notes: editItem.notes || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [editItem, open, services, employees]);

  const handleSubmit = () => {
    if (!form.clientName || !form.serviceId || !form.date || !form.time) {
      toast.error(tc("requiredField"));
      return;
    }

    const selectedService = services.find((s) => s.id === form.serviceId);
    const selectedEmployee = employees.find((e) => e.id === form.employeeId);

    if (editItem) {
      updateAppointment.mutate({ id: editItem.id, data: {
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        service: selectedService?.name || editItem.service,
        employee: selectedEmployee?.name || editItem.employee,
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
        service: selectedService?.name || "",
        employee: selectedEmployee?.name || "",
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
            <Select value={form.serviceId} onValueChange={(v) => setForm({ ...form, serviceId: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectService")} />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("employee")}</label>
            <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectEmployee")} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
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
