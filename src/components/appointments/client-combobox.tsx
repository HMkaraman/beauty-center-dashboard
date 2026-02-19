"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Command } from "cmdk";
import { X, Search, UserPlus, Plus } from "lucide-react";
import { useClients, useCreateClient } from "@/lib/hooks/use-clients";
import { cn } from "@/lib/utils";
import { QuickClientDialog } from "./quick-client-dialog";

interface ClientValue {
  clientId: string;
  clientName: string;
  clientPhone: string;
}

interface ClientComboboxProps {
  value: ClientValue | null;
  onChange: (client: ClientValue | null) => void;
}

export function ClientCombobox({ value, onChange }: ClientComboboxProps) {
  const t = useTranslations("appointments");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query by 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: clientsData, isLoading } = useClients({
    search: debouncedSearch.length >= 1 ? debouncedSearch : undefined,
    limit: 10,
  });
  const clients = clientsData?.data ?? [];

  const createClient = useCreateClient();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (client: { id: string; name: string; phone: string }) => {
      onChange({
        clientId: client.id,
        clientName: client.name,
        clientPhone: client.phone,
      });
      setSearch("");
      setOpen(false);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange(null);
    setSearch("");
    inputRef.current?.focus();
  }, [onChange]);

  const handleQuickCreate = useCallback(() => {
    if (!search.trim()) return;
    createClient.mutate(
      { name: search.trim(), phone: "", status: "active" },
      {
        onSuccess: (newClient) => {
          handleSelect({
            id: newClient.id,
            name: newClient.name,
            phone: newClient.phone || "",
          });
        },
      }
    );
  }, [search, createClient, handleSelect]);

  const handleDialogCreate = useCallback(
    (client: { id: string; name: string; phone: string }) => {
      handleSelect(client);
      setDialogOpen(false);
    },
    [handleSelect]
  );

  // When selected, show the client name as a chip-like display
  if (value?.clientId) {
    return (
      <>
        <div className="border-input bg-background flex h-9 w-full items-center rounded-md border px-3 text-sm shadow-xs">
          <span className="flex-1 truncate">{value.clientName}</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground ms-2 shrink-0 rounded-xs p-0.5 transition-colors"
            aria-label={t("clearSelection")}
          >
            <X className="size-3.5" />
          </button>
        </div>
        {value.clientPhone && (
          <p className="text-muted-foreground mt-1 text-xs font-english" dir="ltr">
            {value.clientPhone}
          </p>
        )}
      </>
    );
  }

  return (
    <>
      <div ref={containerRef} className="relative">
        <Command shouldFilter={false} className="overflow-visible">
          <div className="border-input flex h-9 items-center rounded-md border px-3 shadow-xs">
            <Search className="text-muted-foreground me-2 size-4 shrink-0" />
            <Command.Input
              ref={inputRef}
              value={search}
              onValueChange={setSearch}
              onFocus={() => setOpen(true)}
              placeholder={t("searchClient")}
              className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
            />
          </div>

          {open && (
            <div className="bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 absolute top-full z-50 mt-1 w-full overflow-hidden rounded-md border shadow-md">
              <Command.List className="max-h-60 overflow-y-auto p-1">
                {isLoading && (
                  <Command.Loading>
                    <div className="text-muted-foreground py-3 text-center text-sm">...</div>
                  </Command.Loading>
                )}

                {!isLoading && clients.length === 0 && search.length >= 1 && (
                  <Command.Empty className="text-muted-foreground py-3 text-center text-sm">
                    {t("noClientsFound")}
                  </Command.Empty>
                )}

                {clients.map((client) => (
                  <Command.Item
                    key={client.id}
                    value={client.id}
                    onSelect={() => handleSelect(client)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                      "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                    )}
                  >
                    <div className="flex-1 truncate">
                      <span className="font-medium">{client.name}</span>
                      {client.phone && (
                        <span className="text-muted-foreground ms-2 text-xs font-english" dir="ltr">
                          {client.phone}
                        </span>
                      )}
                    </div>
                  </Command.Item>
                ))}

                {/* Divider */}
                {(search.trim().length > 0 || clients.length > 0) && (
                  <div className="bg-border mx-1 my-1 h-px" />
                )}

                {/* Quick Create */}
                {search.trim().length > 0 && (
                  <Command.Item
                    value="__quick_create__"
                    onSelect={handleQuickCreate}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                      "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                    )}
                  >
                    <Plus className="size-4 shrink-0" />
                    <span>
                      {t("quickCreate", { name: search.trim() })}
                    </span>
                  </Command.Item>
                )}

                {/* Create New Client (full dialog) */}
                <Command.Item
                  value="__create_new__"
                  onSelect={() => {
                    setOpen(false);
                    setDialogOpen(true);
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                    "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
                  )}
                >
                  <UserPlus className="size-4 shrink-0" />
                  <span>{t("createNewClient")}</span>
                </Command.Item>
              </Command.List>
            </div>
          )}
        </Command>
      </div>

      <QuickClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultName={search}
        onCreated={handleDialogCreate}
      />
    </>
  );
}
