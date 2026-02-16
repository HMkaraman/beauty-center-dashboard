"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    document.cookie = "auth=true;path=/;max-age=86400";
    router.push("/");
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
                {t("brandTitle")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("brandSubtitle")}
              </p>
            </div>
            <p className="max-w-sm text-muted-foreground">
              {t("brandTagline")}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Login Form */}
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
              {t("brandTitle")}
            </h2>
          </div>

          <div className="space-y-2 text-center lg:text-start">
            <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-foreground">{t("email")}</label>
              <Input
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-foreground">{t("password")}</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-secondary border-border pe-10"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="rounded border-border accent-gold"
                />
                {t("rememberMe")}
              </label>
              <button type="button" className="text-sm text-gold hover:underline">
                {t("forgotPassword")}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full bg-gold text-primary-foreground hover:bg-gold-light"
            >
              {t("signIn")}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
