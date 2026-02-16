"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowLeft, User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { portalApi, type PortalClient } from "@/lib/api/portal";

export default function PortalProfilePage() {
  const t = useTranslations("portal");
  const router = useRouter();

  const [profile, setProfile] = useState<PortalClient | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const data = await portalApi.getProfile();
      setProfile(data);
      setName(data.name);
      setEmail(data.email || "");
    } catch {
      // Token may be invalid; redirect handled by portalFetch
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("portal_token");
    if (!token) {
      router.push("/portal");
      return;
    }
    loadProfile();
  }, [router, loadProfile]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await portalApi.updateProfile({ name, email: email || undefined });

      // Update localStorage client data
      const clientData = localStorage.getItem("portal_client");
      if (clientData) {
        try {
          const parsed = JSON.parse(clientData);
          parsed.name = name;
          parsed.email = email || null;
          localStorage.setItem("portal_client", JSON.stringify(parsed));
        } catch {
          // ignore parse error
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // error handled silently
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <button
            onClick={() => router.push("/portal/dashboard")}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">
            {t("profile")}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          {/* Avatar */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/15">
              <User className="h-10 w-10 text-gold" />
            </div>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t("name")}
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("name")}
              />
            </div>

            {/* Phone (read-only) */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t("phone")}
              </label>
              <Input
                value={profile?.phone || ""}
                readOnly
                disabled
                className="font-mono opacity-60"
                dir="ltr"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {/* Phone cannot be changed as it's the login identifier */}
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t("email")}
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("email")}
                dir="ltr"
              />
            </div>

            {/* Save button */}
            <Button
              onClick={handleSave}
              disabled={saving || !name}
              className="w-full bg-gold text-primary-foreground hover:bg-gold-light"
            >
              {saved ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {t("saved")}
                </span>
              ) : saving ? (
                t("saving")
              ) : (
                t("save")
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
