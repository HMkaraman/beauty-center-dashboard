"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useSettings, useUpdateSettings } from "@/lib/hooks/use-settings";
import { InvoiceDesignPreview } from "./invoice-design-preview";
import {
  type InvoiceDesign,
  type InvoiceTemplate,
  type InvoiceFontFamily,
  type LogoPosition,
  type HeaderLayout,
  type SectionSpacing,
  DEFAULT_INVOICE_DESIGN,
  COLOR_PRESETS,
  FONT_FAMILY_LABELS,
  invoiceTemplates,
  invoiceFontFamilies,
  logoPositions,
  headerLayouts,
  sectionSpacings,
  parseInvoiceDesign,
} from "@/lib/invoice-design";

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm">{label}</label>
      <div className="flex flex-wrap gap-2">
        {COLOR_PRESETS.map((c) => (
          <button
            key={c.value}
            onClick={() => onChange(c.value)}
            className={`h-7 w-7 rounded-full border-2 transition-all ${value === c.value ? "border-foreground scale-110" : "border-transparent"}`}
            style={{ backgroundColor: c.value }}
            title={c.name}
          />
        ))}
        <label className="relative h-7 w-7 rounded-full border-2 border-dashed border-muted-foreground cursor-pointer overflow-hidden flex items-center justify-center" title="Custom">
          <span className="text-xs text-muted-foreground">+</span>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded border" style={{ backgroundColor: value }} />
        <Input
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
          }}
          className="h-7 w-24 text-xs font-english"
        />
      </div>
    </div>
  );
}

const TEMPLATE_ICONS: Record<InvoiceTemplate, { label: string; descKey: string }> = {
  classic: { label: "Classic", descKey: "templateClassicDesc" },
  modern: { label: "Modern", descKey: "templateModernDesc" },
  elegant: { label: "Elegant", descKey: "templateElegantDesc" },
  compact: { label: "Compact", descKey: "templateCompactDesc" },
};

export function InvoiceDesignCard() {
  const t = useTranslations("settings.invoiceDesign");
  const ts = useTranslations("settings");
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [design, setDesign] = useState<InvoiceDesign>({ ...DEFAULT_INVOICE_DESIGN });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (settings && !initialized) {
      setDesign(parseInvoiceDesign(settings.invoiceDesign));
      setInitialized(true);
    }
  }, [settings, initialized]);

  const update = useCallback(<K extends keyof InvoiceDesign>(key: K, value: InvoiceDesign[K]) => {
    setDesign((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = () => {
    updateSettings.mutate(
      { invoiceDesign: JSON.stringify(design) },
      {
        onSuccess: () => toast.success(ts("save")),
        onError: () => toast.error("Error"),
      }
    );
  };

  const handleReset = () => {
    setDesign({ ...DEFAULT_INVOICE_DESIGN });
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-base font-semibold text-foreground mb-6">{t("title")}</h3>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Controls */}
        <div className="space-y-6 overflow-y-auto max-h-[700px] pe-2">
          {/* Template Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("template")}</label>
            <div className="grid grid-cols-2 gap-2">
              {invoiceTemplates.map((tmpl) => (
                <button
                  key={tmpl}
                  onClick={() => update("template", tmpl)}
                  className={`rounded-lg border px-3 py-2.5 text-start text-sm transition-colors ${
                    design.template === tmpl
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  <div className="font-medium">{t(`template${tmpl.charAt(0).toUpperCase() + tmpl.slice(1)}` as Parameters<typeof t>[0])}</div>
                  <div className="text-xs mt-0.5 opacity-70">
                    {t(TEMPLATE_ICONS[tmpl].descKey as Parameters<typeof t>[0])}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">{t("colors")}</h4>
            <ColorPicker label={t("primaryColor")} value={design.primaryColor} onChange={(v) => update("primaryColor", v)} />
            <ColorPicker label={t("secondaryColor")} value={design.secondaryColor} onChange={(v) => update("secondaryColor", v)} />
            <ColorPicker label={t("accentColor")} value={design.accentColor} onChange={(v) => update("accentColor", v)} />
          </div>

          {/* Typography */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">{t("typography")}</h4>
            <div>
              <label className="text-sm">{t("fontFamily")}</label>
              <select
                value={design.fontFamily}
                onChange={(e) => update("fontFamily", e.target.value as InvoiceFontFamily)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {invoiceFontFamilies.map((f) => (
                  <option key={f} value={f}>{FONT_FAMILY_LABELS[f]}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs">{t("businessNameSize")}</label>
                <Input type="number" min={14} max={28} value={design.businessNameSize} onChange={(e) => update("businessNameSize", Number(e.target.value))} className="mt-1" />
              </div>
              <div>
                <label className="text-xs">{t("bodyFontSize")}</label>
                <Input type="number" min={8} max={14} value={design.bodyFontSize} onChange={(e) => update("bodyFontSize", Number(e.target.value))} className="mt-1" />
              </div>
              <div>
                <label className="text-xs">{t("tableHeaderSize")}</label>
                <Input type="number" min={7} max={12} value={design.tableHeaderSize} onChange={(e) => update("tableHeaderSize", Number(e.target.value))} className="mt-1" />
              </div>
            </div>
          </div>

          {/* Layout */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">{t("layout")}</h4>
            <div>
              <label className="text-sm">{t("logoPosition")}</label>
              <div className="flex gap-2 mt-1">
                {logoPositions.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => update("logoPosition", pos as LogoPosition)}
                    className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                      design.logoPosition === pos ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground"
                    }`}
                  >
                    {t(`logoPosition${pos.charAt(0).toUpperCase() + pos.slice(1)}` as Parameters<typeof t>[0])}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm">{t("headerLayout")}</label>
              <div className="flex gap-2 mt-1">
                {headerLayouts.map((layout) => (
                  <button
                    key={layout}
                    onClick={() => update("headerLayout", layout as HeaderLayout)}
                    className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                      design.headerLayout === layout ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground"
                    }`}
                  >
                    {t(`headerLayout${layout.charAt(0).toUpperCase() + layout.slice(1)}` as Parameters<typeof t>[0])}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm">{t("pageMargin")}</label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="range"
                  min={20}
                  max={60}
                  value={design.pageMargin}
                  onChange={(e) => update("pageMargin", Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8">{design.pageMargin}pt</span>
              </div>
            </div>
            <div>
              <label className="text-sm">{t("sectionSpacing")}</label>
              <div className="flex gap-2 mt-1">
                {sectionSpacings.map((s) => (
                  <button
                    key={s}
                    onClick={() => update("sectionSpacing", s as SectionSpacing)}
                    className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                      design.sectionSpacing === s ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground"
                    }`}
                  >
                    {t(`spacing${s.charAt(0).toUpperCase() + s.slice(1)}` as Parameters<typeof t>[0])}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Toggles */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">{t("content")}</h4>
            {([
              ["showTaxBreakdown", t("showTaxBreakdown")],
              ["showUuid", t("showUuid")],
              ["showNotes", t("showNotes")],
              ["showQrCode", t("showQrCode")],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm">{label}</span>
                <Checkbox checked={design[key]} onCheckedChange={(v) => update(key, v === true)} />
              </label>
            ))}
          </div>

          {/* Custom Text */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">{t("customText")}</h4>
            <div>
              <label className="text-xs">{t("tagline")}</label>
              <Input value={design.tagline} onChange={(e) => update("tagline", e.target.value)} className="mt-1" placeholder={t("taglinePlaceholder")} />
            </div>
            <div>
              <label className="text-xs">{t("taglineEn")}</label>
              <Input value={design.taglineEn} onChange={(e) => update("taglineEn", e.target.value)} className="mt-1 font-english" dir="ltr" placeholder={t("taglineEnPlaceholder")} />
            </div>
            <div>
              <label className="text-xs">{t("footerText")}</label>
              <Input value={design.footerText} onChange={(e) => update("footerText", e.target.value)} className="mt-1" placeholder={t("footerTextPlaceholder")} />
            </div>
            <div>
              <label className="text-xs">{t("footerTextEn")}</label>
              <Input value={design.footerTextEn} onChange={(e) => update("footerTextEn", e.target.value)} className="mt-1 font-english" dir="ltr" placeholder={t("footerTextEnPlaceholder")} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={updateSettings.isPending}>
              {updateSettings.isPending ? ts("saving") : ts("save")}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 me-2" />
              {t("reset")}
            </Button>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:sticky lg:top-4 self-start">
          <InvoiceDesignPreview
            design={design}
            businessName={settings?.businessName}
            businessNameEn={settings?.businessNameEn}
            logoUrl={settings?.logoUrl}
          />
        </div>
      </div>
    </div>
  );
}
