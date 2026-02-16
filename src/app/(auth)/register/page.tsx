"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("register");
  const tLogin = useTranslations("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    password: "",
    phone: "",
    currency: "SAR",
    locale: "ar",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "Email already exists") {
          setError(t("emailExists"));
        } else {
          setError(data.error || "Registration failed");
        }
        return;
      }

      // Auto sign in after registration
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError(signInResult.error);
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Brand Panel — hidden on mobile */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-[#1A1614] via-[#231F1C] to-[#2A2522] lg:flex">
        {/* Decorative elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 start-20 h-64 w-64 rounded-full bg-gold/5 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 end-20 h-80 w-80 rounded-full bg-gold/5 blur-3xl"
        />

        {/* Glassmorphism card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 rounded-2xl border border-white/10 bg-white/5 p-12 backdrop-blur-xl"
        >
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15">
              <Sparkles className="h-8 w-8 text-gold" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                {tLogin("brandTitle")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {tLogin("brandSubtitle")}
              </p>
            </div>
            <p className="max-w-sm text-muted-foreground">
              {tLogin("brandTagline")}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Register Form */}
      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15">
              <Sparkles className="h-6 w-6 text-gold" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {tLogin("brandTitle")}
            </h2>
          </div>

          <div className="space-y-2 text-center lg:text-start">
            <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg border border-red/20 bg-red/10 px-4 py-3 text-sm text-red">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-foreground">
                {t("businessName")}
              </label>
              <Input
                type="text"
                value={formData.businessName}
                onChange={(e) => updateField("businessName", e.target.value)}
                className="bg-secondary border-border"
                required
                minLength={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-foreground">
                {t("ownerName")}
              </label>
              <Input
                type="text"
                value={formData.ownerName}
                onChange={(e) => updateField("ownerName", e.target.value)}
                className="bg-secondary border-border"
                required
                minLength={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-foreground">{t("email")}</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="bg-secondary border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-foreground">{t("password")}</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="bg-secondary border-border pe-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-foreground">{t("phone")}</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm text-foreground">
                  {t("currency")}
                </label>
                <Select
                  value={formData.currency}
                  onValueChange={(val) => updateField("currency", val)}
                >
                  <SelectTrigger className="w-full bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">SAR</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
                    <SelectItem value="IQD">IQD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-foreground">
                  {t("language")}
                </label>
                <Select
                  value={formData.locale}
                  onValueChange={(val) => updateField("locale", val)}
                >
                  <SelectTrigger className="w-full bg-secondary border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-primary-foreground hover:bg-gold-light"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("submit")
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t("hasAccount")}{" "}
              <Link href="/login" className="text-gold hover:underline">
                {t("signIn")}
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
