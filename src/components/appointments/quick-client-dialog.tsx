"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateClient } from "@/lib/hooks/use-clients";

interface QuickClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultName?: string;
  onCreated: (client: { id: string; name: string; phone: string }) => void;
}

export function QuickClientDialog({
  open,
  onOpenChange,
  defaultName = "",
  onCreated,
}: QuickClientDialogProps) {
  const t = useTranslations("clients");
  const tc = useTranslations("common");
  const createClient = useCreateClient();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setPhone("");
      setEmail("");
    }
  }, [open, defaultName]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error(tc("requiredField"));
      return;
    }

    createClient.mutate(
      {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        status: "active",
      },
      {
        onSuccess: (newClient) => {
          toast.success(tc("addSuccess"));
          onCreated({
            id: newClient.id,
            name: newClient.name,
            phone: newClient.phone || "",
          });
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("newClient")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("newClient")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("clientName")} *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("clientPhone")}
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="font-english"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t("clientEmail")}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="font-english"
              dir="ltr"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("close")}
          </Button>
          <Button onClick={handleSubmit} disabled={createClient.isPending}>
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
