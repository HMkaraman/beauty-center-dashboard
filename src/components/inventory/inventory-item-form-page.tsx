"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useInventoryItem,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useInventoryCategories,
} from "@/lib/hooks/use-inventory";
import { uploadFileApi } from "@/lib/api/upload";

const PRODUCT_TYPES = [
  "injectable",
  "skincare",
  "consumable",
  "retail",
  "equipment",
  "device_supply",
  "medication",
  "chemical",
] as const;

const UNITS_OF_MEASURE = [
  "units",
  "ml",
  "cc",
  "syringe",
  "vial",
  "piece",
  "box",
  "g",
  "bottle",
  "tube",
  "ampule",
  "sachet",
] as const;

const STORAGE_CONDITIONS = ["ambient", "refrigerated", "frozen"] as const;

interface InventoryItemFormPageProps {
  itemId?: string;
}

export function InventoryItemFormPage({ itemId }: InventoryItemFormPageProps) {
  const t = useTranslations("inventory");
  const tc = useTranslations("common");
  const router = useRouter();
  const isEdit = !!itemId;

  const { data: existingItem, isLoading: loadingItem } = useInventoryItem(itemId || "");
  const { data: categoriesData } = useInventoryCategories();
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();

  const categories = categoriesData?.data ?? [];

  // Form state
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);

  // Classification
  const [categoryId, setCategoryId] = useState("");
  const [productType, setProductType] = useState("");
  const [isRetail, setIsRetail] = useState(false);

  // Stock & Units
  const [unitOfMeasure, setUnitOfMeasure] = useState("");
  const [unitsPerPackage, setUnitsPerPackage] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [reorderLevel, setReorderLevel] = useState("");
  const [storageConditions, setStorageConditions] = useState("");

  // Pricing
  const [costPrice, setCostPrice] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  // Tracking
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [notes, setNotes] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializedId = useRef<string | null>(null);

  const clearFormError = (field: string) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Populate form when editing — keyed on existingItem.id to run exactly once per item
  useEffect(() => {
    if (isEdit && existingItem && initializedId.current !== existingItem.id) {
      initializedId.current = existingItem.id;
      setName(existingItem.name);
      setNameEn(existingItem.nameEn || "");
      setBrand(existingItem.brand || "");
      setSku(existingItem.sku);
      setBarcode(existingItem.barcode || "");
      setDescription(existingItem.description || "");
      setImage(existingItem.image || null);
      setIsActive(existingItem.isActive === 1);
      setCategoryId(existingItem.categoryId || "");
      setProductType(existingItem.productType || "");
      setIsRetail(existingItem.isRetail === 1);
      setUnitOfMeasure(existingItem.unitOfMeasure || "");
      setUnitsPerPackage(existingItem.unitsPerPackage ? String(existingItem.unitsPerPackage) : "");
      setQuantity(String(existingItem.quantity));
      setReorderLevel(existingItem.reorderLevel != null ? String(existingItem.reorderLevel) : "");
      setStorageConditions(existingItem.storageConditions || "");
      setCostPrice(existingItem.costPrice != null ? String(existingItem.costPrice) : "");
      setUnitPrice(String(existingItem.unitPrice));
      setBatchNumber(existingItem.batchNumber || "");
      setExpiryDate(existingItem.expiryDate || "");
      setSupplierName(existingItem.supplierName || "");
      setNotes(existingItem.notes || "");
    }
  }, [isEdit, existingItem]);

  const markupPercent = useMemo(() => {
    const cost = Number(costPrice);
    const sell = Number(unitPrice);
    if (!cost || cost === 0 || !sell) return null;
    return ((sell - cost) / cost * 100).toFixed(1);
  }, [costPrice, unitPrice]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!name) errors.name = tc("requiredField");
    if (!sku) errors.sku = tc("requiredField");
    if (!categoryId) errors.categoryId = tc("requiredField");

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error(tc("requiredField"));
      const firstKey = Object.keys(errors)[0];
      setTimeout(() => {
        document.querySelector(`[name="${firstKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return;
    }
    setFormErrors({});

    setIsSaving(true);

    try {
      // Upload image if changed
      let imageUrl = image;
      if (imageFile) {
        const result = await uploadFileApi(imageFile, "inventory");
        imageUrl = result.url;
      }

      const payload: Record<string, unknown> = {
        name,
        nameEn: nameEn || undefined,
        brand: brand || undefined,
        sku,
        barcode: barcode || undefined,
        description: description || undefined,
        image: imageUrl,
        categoryId,
        productType: productType || null,
        unitOfMeasure: unitOfMeasure || null,
        unitsPerPackage: unitsPerPackage ? Number(unitsPerPackage) : null,
        quantity: Number(quantity) || 0,
        reorderLevel: reorderLevel ? Number(reorderLevel) : null,
        costPrice: costPrice ? Number(costPrice) : null,
        unitPrice: unitPrice ? Number(unitPrice) : 0,
        expiryDate: expiryDate || null,
        batchNumber: batchNumber || null,
        isRetail,
        isActive,
        supplierName: supplierName || null,
        storageConditions: storageConditions || null,
        notes: notes || null,
      };

      if (isEdit && itemId) {
        await updateItem.mutateAsync({ id: itemId, data: payload });
        toast.success(tc("updateSuccess"));
      } else {
        await createItem.mutateAsync(payload);
        toast.success(tc("addSuccess"));
      }
      router.push("/inventory");
    } catch {
      toast.error(tc("errorOccurred"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isEdit && loadingItem) {
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
            {isEdit ? t("editItem") : t("newItem")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            {t("close")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "..." : t("saveItem")}
          </Button>
        </div>
      </div>

      {/* Section 1: Basic Details */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("basicDetails")}</h2>

        <FormField label={t("name")} required error={formErrors.name}>
          <Input name="name" value={name} onChange={(e) => { setName(e.target.value); clearFormError("name"); }} aria-invalid={!!formErrors.name} />
        </FormField>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("nameEn")}</label>
          <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} dir="ltr" className="font-english" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("brand")}</label>
          <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={t("sku")} required error={formErrors.sku}>
            <Input name="sku" value={sku} onChange={(e) => { setSku(e.target.value); clearFormError("sku"); }} className="font-english" dir="ltr" aria-invalid={!!formErrors.sku} />
          </FormField>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("barcode")}</label>
            <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} className="font-english" dir="ltr" />
          </div>
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
          <label className="text-sm font-medium text-foreground">{t("image")}</label>
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
            <Select value={isActive ? "active" : "inactive"} onValueChange={(v) => setIsActive(v === "active")}>
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

      {/* Section 2: Classification */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("classification")}</h2>

        <FormField label={t("category")} required error={formErrors.categoryId}>
          {categories.length > 0 ? (
            <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); clearFormError("categoryId"); }}>
              <SelectTrigger className="w-full" aria-invalid={!!formErrors.categoryId} data-field="categoryId">
                <SelectValue placeholder={t("selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {categories.filter((c) => c.isActive === 1).map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder={t("selectCategory")}
            />
          )}
        </FormField>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("productType")}</label>
          <Select value={productType || "_none"} onValueChange={(v) => setProductType(v === "_none" ? "" : v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("selectProductType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">—</SelectItem>
              {PRODUCT_TYPES.map((pt) => (
                <SelectItem key={pt} value={pt}>{t(`productType_${pt}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox checked={isRetail} onCheckedChange={(v) => setIsRetail(v === true)} />
          <span className="text-sm font-medium text-foreground">{t("isRetail")}</span>
        </label>
      </div>

      {/* Section 3: Stock & Units */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("stockUnits")}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("unitOfMeasure")}</label>
            <Select value={unitOfMeasure || "_none"} onValueChange={(v) => setUnitOfMeasure(v === "_none" ? "" : v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectUnit")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">—</SelectItem>
                {UNITS_OF_MEASURE.map((u) => (
                  <SelectItem key={u} value={u}>{t(`unit_${u}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("unitsPerPackage")}</label>
            <Input
              type="number"
              value={unitsPerPackage}
              onChange={(e) => setUnitsPerPackage(e.target.value)}
              className="font-english"
              dir="ltr"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("quantity")}</label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="font-english"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("reorderLevel")}</label>
            <Input
              type="number"
              value={reorderLevel}
              onChange={(e) => setReorderLevel(e.target.value)}
              className="font-english"
              dir="ltr"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("storageConditions")}</label>
          <Select value={storageConditions || "_none"} onValueChange={(v) => setStorageConditions(v === "_none" ? "" : v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("selectStorage")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">—</SelectItem>
              {STORAGE_CONDITIONS.map((sc) => (
                <SelectItem key={sc} value={sc}>{t(`storage_${sc}`)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Section 4: Pricing */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("pricing")}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("costPrice")}</label>
            <Input
              type="number"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              className="font-english"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("sellPrice")} *</label>
            <Input
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="font-english"
              dir="ltr"
            />
          </div>
        </div>

        {markupPercent !== null && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("markup")}:</span>
            <span className="text-sm font-medium font-english text-foreground">{markupPercent}%</span>
          </div>
        )}
      </div>

      {/* Section 5: Tracking & Compliance */}
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">{t("trackingCompliance")}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("batchNumber")}</label>
            <Input
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              className="font-english"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("expiryDate")}</label>
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="font-english"
              dir="ltr"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("supplier")}</label>
          <Input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">{t("notes")}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
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
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-6 space-y-4">
          <div className="h-4 w-32 rounded bg-secondary/50" />
          <div className="h-10 w-full rounded bg-secondary/50" />
          <div className="h-10 w-full rounded bg-secondary/50" />
        </div>
      ))}
    </div>
  );
}
