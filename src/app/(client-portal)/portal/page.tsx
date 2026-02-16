"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Shield, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { portalApi } from "@/lib/api/portal";

type Step = "phone" | "otp";

export default function PortalLoginPage() {
  const t = useTranslations("portal");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [tenantSlug, setTenantSlug] = useState(
    searchParams.get("t") || ""
  );
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem("portal_token");
    if (token) {
      router.push("/portal/dashboard");
    }
  }, [router]);

  const handleSendOtp = async () => {
    if (!phone || !tenantSlug) return;
    setLoading(true);
    setError("");

    try {
      await portalApi.sendOtp(phone, tenantSlug);
      setStep("otp");
      // Focus first OTP input after step change
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error";
      if (message.includes("not found") || message.includes("Not found")) {
        setError(t("clientNotFound"));
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = useCallback(async (otpCode: string) => {
    setLoading(true);
    setError("");

    try {
      const result = await portalApi.verifyOtp(phone, otpCode, tenantSlug);
      localStorage.setItem("portal_token", result.token);
      localStorage.setItem("portal_client", JSON.stringify(result.client));
      localStorage.setItem("portal_tenant_slug", tenantSlug);
      router.push("/portal/dashboard");
    } catch {
      setError(t("invalidOtp"));
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  }, [phone, tenantSlug, router, t]);

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (value.length > 1) {
        // Handle paste
        const chars = value.replace(/\D/g, "").slice(0, 6).split("");
        const newOtp = [...otp];
        chars.forEach((char, i) => {
          if (index + i < 6) newOtp[index + i] = char;
        });
        setOtp(newOtp);

        const nextIndex = Math.min(index + chars.length, 5);
        otpRefs.current[nextIndex]?.focus();

        // Auto-verify if complete
        if (newOtp.every((d) => d !== "")) {
          handleVerifyOtp(newOtp.join(""));
        }
        return;
      }

      const digit = value.replace(/\D/g, "");
      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);

      if (digit && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }

      // Auto-verify if all digits entered
      if (newOtp.every((d) => d !== "")) {
        handleVerifyOtp(newOtp.join(""));
      }
    },
    [otp, handleVerifyOtp]
  );

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15">
            <Sparkles className="h-8 w-8 text-gold" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("login")}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Center code input */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {t("centerCode")}
                  </label>
                  <Input
                    value={tenantSlug}
                    onChange={(e) => setTenantSlug(e.target.value)}
                    placeholder="salon-name"
                    className="font-mono"
                    dir="ltr"
                  />
                </div>

                {/* Phone input */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {t("phone")}
                  </label>
                  <div className="relative">
                    <Phone className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05xxxxxxxx"
                      className="ps-10 font-mono"
                      dir="ltr"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendOtp();
                      }}
                    />
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-destructive"
                  >
                    {error}
                  </motion.p>
                )}

                <Button
                  onClick={handleSendOtp}
                  disabled={loading || !phone || !tenantSlug}
                  className="w-full bg-gold text-primary-foreground hover:bg-gold-light"
                >
                  {loading ? t("sendingCode") : t("sendCode")}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Back button */}
                <button
                  onClick={() => {
                    setStep("phone");
                    setOtp(["", "", "", "", "", ""]);
                    setError("");
                  }}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("phone")}
                </button>

                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
                    <Shield className="h-6 w-6 text-gold" />
                  </div>
                  <p className="text-sm text-foreground font-medium">
                    {t("enterOtp")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("otpSent")}
                  </p>
                </div>

                {/* OTP inputs */}
                <div className="flex justify-center gap-2" dir="ltr">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) =>
                        handleOtpChange(index, e.target.value)
                      }
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="h-12 w-12 rounded-lg border border-input bg-background text-center text-lg font-mono font-bold text-foreground outline-none transition-all focus:border-gold focus:ring-2 focus:ring-gold/30"
                    />
                  ))}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-sm text-destructive"
                  >
                    {error}
                  </motion.p>
                )}

                <Button
                  onClick={() => handleVerifyOtp(otp.join(""))}
                  disabled={loading || otp.some((d) => !d)}
                  className="w-full bg-gold text-primary-foreground hover:bg-gold-light"
                >
                  {loading ? t("verifying") : t("verify")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
