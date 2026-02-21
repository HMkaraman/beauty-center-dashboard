"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { useClient, useCreateClient, useUpdateClient } from "@/lib/hooks/use-clients";
import { useFormValidation } from "@/lib/hooks/use-form-validation";
import { clientSchema } from "@/lib/validations";

interface ClientFormPageProps {
  clientId?: string;
}

export function ClientFormPage({ clientId }: ClientFormPageProps) {
  const t = useTranslations("clients");
  const tc = useTranslations("common");
  const router = useRouter();
  const isEdit = !!clientId;

  const { data: existingClient, isLoading: loadingClient } = useClient(clientId || "");
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [status, setStatus] = useState("active");

  // Address
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  // Notes
  const [notes, setNotes] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const initializedId = useRef<string | null>(null);
  const { validate, hasError, getError, clearError } = useFormValidation(clientSchema);

  // Populate form when editing
  useEffect(() => {
    if (isEdit && existingClient && initializedId.current !== existingClient.id) {
      initializedId.current = existingClient.id;
      setName(existingClient.name);
      setPhone(existingClient.phone);
      setEmail(existingClient.email || "");
      setDateOfBirth(existingClient.dateOfBirth || "");
      setStatus(existingClient.status);
      setAddress(existingClient.address || "");
      setCity(existingClient.city || "");
      setCountry(existingClient.country || "");
      setNotes((existingClient as unknown as { notes?: string | null }).notes || "");
    }
  }, [isEdit, existingClient]);

  const handleSubmit = async () => {
    const formData = {
      name,
      phone,
      email: email || undefined,
      dateOfBirth: dateOfBirth || undefined,
      address: address || undefined,
      city: city || undefined,
      country: country || undefined,
      notes: notes || undefined,
      status: isEdit ? status as "active" | "inactive" : "active" as const,
    };

    if (!validate(formData)) {
      toast.error(tc("requiredField"));
      return;
    }

    setIsSaving(true);

    try {
      const payload: Record<string, unknown> = {
        name,
        phone,
        email: email || undefined,
        dateOfBirth: dateOfBirth || undefined,
        address: address || undefined,
        city: city || undefined,
        country: country || undefined,
        notes: notes || undefined,
      };

      if (isEdit && clientId) {
        payload.status = status;
        await updateClient.mutateAsync({ id: clientId, data: payload });
        toast.success(tc("updateSuccess"));
      } else {
        payload.status = "active";
        await createClient.mutateAsync(payload);
        toast.success(tc("addSuccess"));
      }
      router.push("/clients");
    } catch {
      toast.error(tc("errorOccurred"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isEdit && loadingClient) {
    return <FormSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-background py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()} size="icon-xs">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            {isEdit ? t("editClient") : t("newClient")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            {t("close")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "..." : t("saveClient")}
          </Button>
        </div>
      </div>

      {/* Section 1: Personal Information */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("personalInfo")}</h2>

        <FormField label={t("clientName")} required error={getError("name")}>
          <Input
            name="name"
            value={name}
            onChange={(e) => { setName(e.target.value); clearError("name"); }}
            aria-invalid={hasError("name")}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={t("clientPhone")} required error={getError("phone")}>
            <Input
              name="phone"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); clearError("phone"); }}
              className="font-english"
              dir="ltr"
              aria-invalid={hasError("phone")}
            />
          </FormField>
          <FormField label={t("clientEmail")} error={getError("email")}>
            <Input
              name="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
              className="font-english"
              dir="ltr"
              aria-invalid={hasError("email")}
            />
          </FormField>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("clientDOB")}</label>
          <Input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="font-english"
            dir="ltr"
          />
        </div>

        {isEdit && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-foreground">{t("status")}</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{t("statusActive")}</SelectItem>
                <SelectItem value="inactive">{t("statusInactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Section 2: Address */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("addressInfo")}</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("clientAddress")}</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("clientCity")}</label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("clientCountry")}</label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Section 3: Notes */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("notes")}</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-pulse">
      <div className="flex items-center justify-between py-3">
        <div className="h-8 w-40 rounded bg-secondary/50" />
        <div className="flex gap-2">
          <div className="h-9 w-20 rounded bg-secondary/50" />
          <div className="h-9 w-24 rounded bg-secondary/50" />
        </div>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="h-4 w-32 rounded bg-secondary/50" />
          <div className="h-10 w-full rounded bg-secondary/50" />
          <div className="h-10 w-full rounded bg-secondary/50" />
        </div>
      ))}
    </div>
  );
}
