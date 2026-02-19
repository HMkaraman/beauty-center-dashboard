"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Search, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSections } from "@/lib/hooks/use-sections";
import { useServiceCategories } from "@/lib/hooks/use-service-categories";
import { useServices } from "@/lib/hooks/use-services";
import type { Service } from "@/types";
import { Price } from "@/components/ui/price";

interface SelectedService {
  serviceId: string;
  name: string;
  price: number;
  duration: number;
  categoryId?: string;
}

interface ServiceBrowserProps {
  selectedServices: SelectedService[];
  onAdd: (service: SelectedService) => void;
  onRemove: (serviceId: string) => void;
  maxHeight?: string;
}

export function ServiceBrowser({ selectedServices, onAdd, onRemove, maxHeight = "300px" }: ServiceBrowserProps) {
  const t = useTranslations("reception");
  const locale = useLocale();
  const { data: sectionsData } = useSections({ limit: 100 });
  const sections = sectionsData?.data ?? [];

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const { data: categoriesData } = useServiceCategories(
    activeSectionId ? { sectionId: activeSectionId } : undefined
  );
  const categories = categoriesData?.data ?? [];
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const { data: servicesData } = useServices({ limit: 200 });
  const allServices = servicesData?.data ?? [];

  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = useMemo(() => {
    let result = allServices.filter((s) => s.status === "active");

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      );
    }

    if (activeCategoryId) {
      result = result.filter((s) => s.categoryId === activeCategoryId);
    } else if (activeSectionId) {
      const sectionCatIds = categories.map((c) => c.id);
      if (sectionCatIds.length > 0) {
        result = result.filter((s) => s.categoryId && sectionCatIds.includes(s.categoryId));
      }
    }

    return result;
  }, [allServices, searchQuery, activeSectionId, activeCategoryId, categories]);

  const selectedIds = new Set(selectedServices.map((s) => s.serviceId));
  const total = selectedServices.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value) {
              setActiveSectionId(null);
              setActiveCategoryId(null);
            }
          }}
          placeholder={t("searchServices")}
          className="ps-9"
        />
      </div>

      {/* Section tabs */}
      {!searchQuery && sections.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => { setActiveSectionId(null); setActiveCategoryId(null); }}
            className={`rounded-full px-3 py-1 text-xs border transition-colors ${
              !activeSectionId
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-border hover:border-primary"
            }`}
          >
            {t("allServices")}
          </button>
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => { setActiveSectionId(section.id); setActiveCategoryId(null); }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs border transition-colors ${
                activeSectionId === section.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:border-primary"
              }`}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: section.color || "#6B7280" }}
              />
              {section.name}
            </button>
          ))}
        </div>
      )}

      {/* Category pills */}
      {!searchQuery && activeSectionId && categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveCategoryId(null)}
            className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
              !activeCategoryId
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("allCategories")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryId(cat.id)}
              className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                activeCategoryId === cat.id
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Services grid */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 overflow-y-auto" style={{ maxHeight }}>
        {filteredServices.map((service) => {
          const isSelected = selectedIds.has(service.id);
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => {
                if (isSelected) {
                  onRemove(service.id);
                } else {
                  onAdd({
                    serviceId: service.id,
                    name: service.name,
                    price: service.price,
                    duration: service.duration,
                    categoryId: service.categoryId,
                  });
                }
              }}
              className={`flex items-center justify-between rounded-lg border p-3 text-start transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{service.name}</p>
                <p className="text-xs text-muted-foreground">
                  {service.duration} {t("min")} · {service.category}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-english font-medium">
                  <Price value={service.price} />
                </span>
                {isSelected ? (
                  <X className="h-4 w-4 text-destructive" />
                ) : (
                  <Plus className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>
          );
        })}
        {filteredServices.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6 col-span-2">
            {t("noServicesFound")}
          </p>
        )}
      </div>

      {/* Cart summary */}
      {selectedServices.length > 0 && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {t("selectedServices")} ({selectedServices.length})
            </p>
            <p className="text-sm font-english font-bold">
              <Price value={total} />
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedServices.map((s) => (
              <span
                key={s.serviceId}
                className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs"
              >
                {s.name}
                <button type="button" onClick={() => onRemove(s.serviceId)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export type { SelectedService };
