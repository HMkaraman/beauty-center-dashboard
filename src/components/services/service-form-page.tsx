"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useService,
  useCreateService,
  useUpdateService,
  useServiceInventory,
  useServiceEmployees,
  useUpdateServiceInventory,
  useUpdateServiceEmployees,
} from "@/lib/hooks/use-services";
import { useServiceCategories } from "@/lib/hooks/use-service-categories";
import { useEmployees } from "@/lib/hooks";
import { ServiceInventoryEditor, InventoryRow } from "./service-inventory-editor";
import { uploadFileApi } from "@/lib/api/upload";

const CLEAR_SERVICE_TYPE = "__clear__";

interface ServiceFormPageProps {
  serviceId?: string;
}

export function ServiceFormPage({ serviceId }: ServiceFormPageProps) {
  const t = useTranslations("services");
  const tc = useTranslations("common");
  const tct = useTranslations("consumptionTracking");
  const router = useRouter();
  const isEdit = !!serviceId;

  const { data: existingService, isLoading: loadingService } = useService(serviceId || "");
  const { data: inventoryData, isLoading: loadingInventory } = useServiceInventory(serviceId || "");
  const { data: employeeAssignments, isLoading: loadingEmployees } = useServiceEmployees(serviceId || "");
  const { data: categoriesData } = useServiceCategories();
  const { data: employeesData } = useEmployees({ limit: 200 });

  const createService = useCreateService();
  const updateService = useUpdateService();
  const updateInventory = useUpdateServiceInventory();
  const updateEmployees = useUpdateServiceEmployees();

  const categories = categoriesData?.data ?? [];
  const allEmployees = (employeesData?.data ?? []).filter((e) => e.status === "active");

  // Form state
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [categoryId, setCategoryId] = useState("");
  const [category, setCategory] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [laserMinShots, setLaserMinShots] = useState("");
  const [laserMaxShots, setLaserMaxShots] = useState("");
  const [injectableUnit, setInjectableUnit] = useState("");
  const [injectableExpiryDays, setInjectableExpiryDays] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [inventoryRows, setInventoryRows] = useState<InventoryRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  // Populate form when editing
  useEffect(() => {
    if (isEdit && existingService && !initialized.current) {
      initialized.current = true;
      setName(existingService.name);
      setNameEn(existingService.nameEn || "");
      setDescription(existingService.description || "");
      setImage(existingService.image || null);
      setStatus(existingService.status);
      setCategoryId(existingService.categoryId || "");
      setCategory(existingService.category);
      setServiceType(existingService.serviceType || "");
      setLaserMinShots(existingService.laserMinShots ? String(existingService.laserMinShots) : "");
      setLaserMaxShots(existingService.laserMaxShots ? String(existingService.laserMaxShots) : "");
      setInjectableUnit(existingService.injectableUnit || "");
      setInjectableExpiryDays(existingService.injectableExpiryDays ? String(existingService.injectableExpiryDays) : "");
      setPrice(String(existingService.price));
      setDuration(String(existingService.duration));
    }
  }, [isEdit, existingService]);

  useEffect(() => {
    if (isEdit && inventoryData && !inventoryRows.length && inventoryData.length > 0) {
      setInventoryRows(
        inventoryData.map((r) => ({
          inventoryItemId: r.inventoryItemId,
          quantityRequired: r.quantityRequired,
        }))
      );
    }
  }, [isEdit, inventoryData]);

  useEffect(() => {
    if (isEdit && employeeAssignments && !selectedEmployeeIds.length && employeeAssignments.length > 0) {
      setSelectedEmployeeIds(employeeAssignments.map((e) => e.id));
    }
  }, [isEdit, employeeAssignments]);

  const handleCategoryChange = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    setCategoryId(catId);
    setCategory(cat?.name || category);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  const toggleEmployee = (empId: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const handleSubmit = async () => {
    if (!name || (!categoryId && !category) || !price) {
      toast.error(tc("requiredField"));
      return;
    }

    if (serviceType === "laser" && (!laserMinShots || !laserMaxShots)) {
      toast.error(tct("laserShotsRequired"));
      return;
    }
    if (serviceType === "injectable" && (!injectableUnit || !injectableExpiryDays)) {
      toast.error(tct("injectableFieldsRequired"));
      return;
    }

    setIsSaving(true);

    try {
      // 1. Upload image if changed
      let imageUrl = image;
      if (imageFile) {
        const result = await uploadFileApi(imageFile, "services");
        imageUrl = result.url;
      }

      // 2. Create/update service
      const payload: Record<string, unknown> = {
        name,
        nameEn: nameEn || undefined,
        description: description || undefined,
        image: imageUrl,
        categoryId: categoryId || undefined,
        category: category || undefined,
        duration: duration ? Number(duration) : undefined,
        price: price ? Number(price) : 0,
        status,
        serviceType: serviceType || null,
        laserMinShots: serviceType === "laser" && laserMinShots ? Number(laserMinShots) : null,
        laserMaxShots: serviceType === "laser" && laserMaxShots ? Number(laserMaxShots) : null,
        injectableUnit: serviceType === "injectable" ? injectableUnit || null : null,
        injectableExpiryDays: serviceType === "injectable" && injectableExpiryDays ? Number(injectableExpiryDays) : null,
      };

      let finalServiceId = serviceId;

      if (isEdit && serviceId) {
        await updateService.mutateAsync({ id: serviceId, data: payload });
      } else {
        const created = await createService.mutateAsync({
          ...payload,
          status: "active",
        } as Parameters<typeof createService.mutateAsync>[0]);
        finalServiceId = created.id;
      }

      // 3. Save inventory requirements
      if (finalServiceId) {
        const validRows = inventoryRows.filter((r) => r.inventoryItemId);
        await updateInventory.mutateAsync({
          id: finalServiceId,
          requirements: validRows,
        });

        // 4. Save team members
        await updateEmployees.mutateAsync({
          id: finalServiceId,
          employeeIds: selectedEmployeeIds,
        });
      }

      toast.success(isEdit ? tc("updateSuccess") : tc("addSuccess"));
      router.push(`/services/${finalServiceId}`);
    } catch {
      toast.error(tc("errorOccurred"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isEdit && (loadingService || loadingInventory || loadingEmployees)) {
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
            {isEdit ? t("editService") : t("newServiceFull")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            {t("close")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "..." : t("saveService")}
          </Button>
        </div>
      </div>

      {/* Section A: Basic Details */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("basicDetails")}</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("name")} *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("nameEn")}</label>
          <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} dir="ltr" className="font-english" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("description")}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("serviceImage")}</label>
          <div className="flex items-center gap-4">
            {image ? (
              <div className="relative">
                <Avatar size="lg" className="!size-16">
                  <AvatarImage src={image} />
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <button
                  onClick={() => { setImage(null); setImageFile(null); }}
                  className="absolute -top-1 -end-1 rounded-full bg-destructive p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-border hover:border-gold/50 transition-colors"
              >
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              {t("uploadImage")}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
        </div>

        {isEdit && (
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-foreground">{t("status")}</label>
            <Select value={status} onValueChange={(v) => setStatus(v as "active" | "inactive")}>
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

      {/* Section B: Category & Type */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("categoryType")}</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("category")} *</label>
          {categories.length > 0 ? (
            <Select value={categoryId} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={t("selectCategory")}
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("serviceType")}</label>
          <Select
            value={serviceType || ""}
            onValueChange={(v) => setServiceType(v === CLEAR_SERVICE_TYPE ? "" : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("general")} />
            </SelectTrigger>
            <SelectContent>
              {serviceType && (
                <SelectItem value={CLEAR_SERVICE_TYPE} className="text-muted-foreground">{t("general")}</SelectItem>
              )}
              <SelectItem value="laser">{t("laser")}</SelectItem>
              <SelectItem value="injectable">{t("injectable")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {serviceType === "laser" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{tct("laserMinShots")}</label>
              <Input type="number" value={laserMinShots} onChange={(e) => setLaserMinShots(e.target.value)} className="font-english" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{tct("laserMaxShots")}</label>
              <Input type="number" value={laserMaxShots} onChange={(e) => setLaserMaxShots(e.target.value)} className="font-english" />
            </div>
          </div>
        )}

        {serviceType === "injectable" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{tct("injectableUnit")}</label>
              <Select value={injectableUnit} onValueChange={setInjectableUnit}>
                <SelectTrigger className="w-full"><SelectValue placeholder={tct("selectUnit")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="units">{tct("unitUnits")}</SelectItem>
                  <SelectItem value="cc">{tct("unitCc")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{tct("injectableExpiryDays")}</label>
              <Input type="number" value={injectableExpiryDays} onChange={(e) => setInjectableExpiryDays(e.target.value)} className="font-english" />
            </div>
          </div>
        )}
      </div>

      {/* Section C: Pricing & Duration */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("pricingDuration")}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("price")} *</label>
            <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="font-english" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("duration")}</label>
            <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="font-english" />
          </div>
        </div>
      </div>

      {/* Section D: Team Members */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("teamMembers")}</h2>
        {allEmployees.length === 0 ? (
          <p className="text-sm text-muted-foreground/60">{t("noTeamAssigned")}</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {allEmployees.map((emp) => (
              <label
                key={emp.id}
                className="flex items-center gap-3 rounded-md p-2 hover:bg-secondary/20 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selectedEmployeeIds.includes(emp.id)}
                  onCheckedChange={() => toggleEmployee(emp.id)}
                />
                <div>
                  <p className="text-sm text-foreground">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">{emp.role}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Section E: Inventory Requirements */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("inventoryRequirements")}</h2>
        <ServiceInventoryEditor rows={inventoryRows} onChange={setInventoryRows} />
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
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="h-4 w-32 rounded bg-secondary/50" />
          <div className="h-10 w-full rounded bg-secondary/50" />
          <div className="h-10 w-full rounded bg-secondary/50" />
        </div>
      ))}
    </div>
  );
}
