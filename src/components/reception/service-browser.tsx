"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Search, Plus, X, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSections } from "@/lib/hooks/use-sections";
import { useServiceCategories } from "@/lib/hooks/use-service-categories";
import { useServices } from "@/lib/hooks/use-services";
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
  const { data: sectionsData } = useSections({ limit: 100 });
  const sections = sectionsData?.data ?? [];

  const { data: allCategoriesData } = useServiceCategories();
  const allCategories = allCategoriesData?.data ?? [];

  const { data: servicesData } = useServices({ limit: 200 });
  const allServices = servicesData?.data ?? [];

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Build category -> section map
  const categoryToSection = useMemo(() => {
    const map = new Map<string, string>();
    for (const cat of allCategories) {
      if (cat.sectionId) map.set(cat.id, cat.sectionId);
    }
    return map;
  }, [allCategories]);

  const activeServices = useMemo(() => allServices.filter((s) => s.status === "active"), [allServices]);

  // Count active services per section
  const sectionServiceCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const svc of activeServices) {
      if (svc.categoryId) {
        const secId = categoryToSection.get(svc.categoryId);
        if (secId) counts.set(secId, (counts.get(secId) || 0) + 1);
      }
    }
    return counts;
  }, [activeServices, categoryToSection]);

  // Categories for the active section
  const sectionCategories = useMemo(() => {
    if (!activeSectionId || activeSectionId === "all") return [];
    return allCategories.filter((c) => c.sectionId === activeSectionId);
  }, [allCategories, activeSectionId]);

  // Services with no category or whose category has no section
  const uncategorizedServices = useMemo(() => {
    return activeServices.filter((s) => !s.categoryId || !categoryToSection.has(s.categoryId));
  }, [activeServices, categoryToSection]);

  // Filtered services for drilled-in and search views
  const filteredServices = useMemo(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return activeServices.filter(
        (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
      );
    }

    if (activeSectionId === "all") {
      return activeServices;
    }

    if (activeCategoryId) {
      return activeServices.filter((s) => s.categoryId === activeCategoryId);
    }

    if (activeSectionId) {
      const sectionCatIds = new Set(sectionCategories.map((c) => c.id));
      return activeServices.filter((s) => s.categoryId && sectionCatIds.has(s.categoryId));
    }

    return activeServices;
  }, [activeServices, searchQuery, activeSectionId, activeCategoryId, sectionCategories]);

  const selectedIds = new Set(selectedServices.map((s) => s.serviceId));
  const total = selectedServices.reduce((sum, s) => sum + s.price, 0);

  const activeSection =
    activeSectionId && activeSectionId !== "all"
      ? sections.find((s) => s.id === activeSectionId)
      : null;

  // View states
  const showSectionGrid = sections.length > 0 && !activeSectionId && !searchQuery;
  const showDrillDown = !!activeSectionId && !searchQuery;

  const renderServiceCard = (service: (typeof activeServices)[number]) => {
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
  };

  const renderServicesGrid = (services: (typeof activeServices)) => (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 overflow-y-auto" style={{ maxHeight }}>
      {services.map(renderServiceCard)}
      {services.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6 col-span-2">
          {t("noServicesFound")}
        </p>
      )}
    </div>
  );

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

      {/* State 1: Section buttons grid */}
      {showSectionGrid && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveSectionId("all");
                setActiveCategoryId(null);
              }}
              className="flex items-center gap-3 rounded-lg border border-border p-4 text-start transition-colors hover:border-primary/50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t("allServices")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("servicesCount", { count: activeServices.length })}
                </p>
              </div>
            </button>
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  setActiveSectionId(section.id);
                  setActiveCategoryId(null);
                }}
                className="flex items-center gap-3 rounded-lg border border-border p-4 text-start transition-colors hover:border-primary/50"
              >
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: section.color || "#6B7280" }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{section.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("servicesCount", { count: sectionServiceCounts.get(section.id) || 0 })}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {uncategorizedServices.length > 0 && (
            <>
              <p className="text-xs font-medium text-muted-foreground">{t("uncategorizedServices")}</p>
              {renderServicesGrid(uncategorizedServices)}
            </>
          )}
        </>
      )}

      {/* State 2: Drilled into a section or "All" */}
      {showDrillDown && (
        <>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveSectionId(null);
                setActiveCategoryId(null);
              }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              {t("backToSections")}
            </button>
            {activeSection && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: activeSection.color || "#6B7280" }}
                />
                {activeSection.name}
              </span>
            )}
          </div>

          {activeSection && sectionCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveCategoryId(null)}
                className={`rounded-full px-2.5 py-1 text-xs border transition-colors ${
                  !activeCategoryId
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary"
                }`}
              >
                {t("allSectionServices")}
              </button>
              {sectionCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`rounded-full px-2.5 py-1 text-xs border transition-colors ${
                    activeCategoryId === cat.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:border-primary"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {renderServicesGrid(filteredServices)}
        </>
      )}

      {/* State 3: Search results or no-sections fallback */}
      {!showSectionGrid && !showDrillDown && renderServicesGrid(filteredServices)}

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
