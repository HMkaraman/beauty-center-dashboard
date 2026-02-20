"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserCog,
  Stethoscope,
  Sparkles,
  Wallet,
  Package,
  BarChart3,
  Megaphone,
  MonitorSmartphone,
  Settings,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { NAV_ITEMS } from "@/constants/navigation";
import { useClients } from "@/lib/hooks/use-clients";
import { useServices } from "@/lib/hooks/use-services";
import { useEmployees } from "@/lib/hooks/use-employees";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserCog,
  Stethoscope,
  Sparkles,
  Wallet,
  Package,
  BarChart3,
  Megaphone,
  MonitorSmartphone,
  Settings,
};

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const t = useTranslations();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const hasSearch = debouncedSearch.length >= 2;

  const { data: clientsData } = useClients(
    hasSearch ? { search: debouncedSearch, limit: 5 } : undefined
  );
  const { data: servicesData } = useServices(
    hasSearch ? { search: debouncedSearch, limit: 5 } : undefined
  );
  const { data: employeesData } = useEmployees(
    hasSearch ? { search: debouncedSearch, limit: 5 } : undefined
  );

  const clients = clientsData?.data ?? [];
  const services = servicesData?.data ?? [];
  const employees = employeesData?.data ?? [];

  const handleSelect = useCallback(
    (route: string) => {
      onOpenChange(false);
      setSearch("");
      router.push(route);
    },
    [onOpenChange, router]
  );

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("commandPalette.title")}
      description={t("commandPalette.placeholder")}
      showCloseButton={false}
    >
      <CommandInput
        placeholder={t("commandPalette.placeholder")}
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>{t("commandPalette.noResults")}</CommandEmpty>

        {/* Pages — always visible */}
        <CommandGroup heading={t("commandPalette.pages")}>
          {NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon];
            return (
              <CommandItem
                key={item.id}
                value={`page-${item.id}-${t(item.labelKey)}`}
                onSelect={() => handleSelect(item.route)}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{t(item.labelKey)}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        {/* Clients */}
        {hasSearch && clients.length > 0 && (
          <CommandGroup heading={t("commandPalette.clients")}>
            {clients.map((client) => (
              <CommandItem
                key={client.id}
                value={`client-${client.id}-${client.name}`}
                onSelect={() => handleSelect(`/clients/${client.id}`)}
              >
                <Users className="h-4 w-4" />
                <div className="flex flex-1 items-center justify-between">
                  <span>{client.name}</span>
                  {client.phone && (
                    <span className="text-xs text-muted-foreground font-english" dir="ltr">
                      {client.phone}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Services */}
        {hasSearch && services.length > 0 && (
          <CommandGroup heading={t("commandPalette.services")}>
            {services.map((service) => (
              <CommandItem
                key={service.id}
                value={`service-${service.id}-${service.name}`}
                onSelect={() => handleSelect("/services")}
              >
                <Sparkles className="h-4 w-4" />
                <div className="flex flex-1 items-center justify-between">
                  <span>{service.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {service.price} {t("common.sar")}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Employees */}
        {hasSearch && employees.length > 0 && (
          <CommandGroup heading={t("commandPalette.employees")}>
            {employees.map((employee) => (
              <CommandItem
                key={employee.id}
                value={`employee-${employee.id}-${employee.name}`}
                onSelect={() => handleSelect(`/employees/${employee.id}`)}
              >
                <UserCog className="h-4 w-4" />
                <div className="flex flex-1 items-center justify-between">
                  <span>{employee.name}</span>
                  <span className="text-xs text-muted-foreground">{employee.role}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
