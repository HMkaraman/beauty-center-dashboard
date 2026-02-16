"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  Check,
  Building2,
  Settings,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STEPS = [
  { icon: Building2, key: "step1" },
  { icon: Settings, key: "step2" },
  { icon: PartyPopper, key: "step3" },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const t = useTranslations("onboarding");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    businessNameEn: "",
    phone: "",
    email: "",
    address: "",
    timezone: "Asia/Riyadh",
    taxRate: 15,
  });

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 2) setStep((s) => s + 1);
  };

  const handlePrevious = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleFinish = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          taxRate: Number(formData.taxRate),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save settings");
        return;
      }

      setStep(2);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex flex-col items-center gap-3"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15">
          <Sparkles className="h-7 w-7 text-gold" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </motion.div>

      {/* Stepper */}
      <div className="mb-8 flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <motion.div
              initial={false}
              animate={{
                backgroundColor:
                  i <= step
                    ? "var(--color-gold, #C6A962)"
                    : "var(--color-secondary, #2A2522)",
                borderColor:
                  i <= step
                    ? "var(--color-gold, #C6A962)"
                    : "var(--color-border, #3A3532)",
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors"
            >
              {i < step ? (
                <Check className="h-5 w-5 text-primary-foreground" />
              ) : (
                <s.icon
                  className={`h-5 w-5 ${
                    i === step ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                />
              )}
            </motion.div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-12 transition-colors ${
                  i < step ? "bg-gold" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-xl border border-border bg-card p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red/20 bg-red/10 px-4 py-3 text-sm text-red">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-foreground">
                  {t("step1")}
                </h2>

                <div className="space-y-2">
                  <label className="text-sm text-foreground">
                    {t("businessNameEn")}
                  </label>
                  <Input
                    type="text"
                    value={formData.businessNameEn}
                    onChange={(e) =>
                      updateField("businessNameEn", e.target.value)
                    }
                    className="bg-secondary border-border"
                  />
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

                <div className="space-y-2">
                  <label className="text-sm text-foreground">{t("email")}</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-foreground">
                    {t("address")}
                  </label>
                  <Input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h2 className="text-lg font-semibold text-foreground">
                  {t("step2")}
                </h2>

                <div className="space-y-2">
                  <label className="text-sm text-foreground">
                    {t("timezone")}
                  </label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(val) => updateField("timezone", val)}
                  >
                    <SelectTrigger className="w-full bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Riyadh">
                        Asia/Riyadh (UTC+3)
                      </SelectItem>
                      <SelectItem value="Asia/Dubai">
                        Asia/Dubai (UTC+4)
                      </SelectItem>
                      <SelectItem value="Asia/Kuwait">
                        Asia/Kuwait (UTC+3)
                      </SelectItem>
                      <SelectItem value="Asia/Baghdad">
                        Asia/Baghdad (UTC+3)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-foreground">
                    {t("taxRate")}
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.taxRate}
                    onChange={(e) =>
                      updateField("taxRate", Number(e.target.value))
                    }
                    className="bg-secondary border-border"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center py-8 text-center"
              >
                {/* Animated checkmark */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gold/15"
                >
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Check className="h-10 w-10 text-gold" />
                  </motion.div>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl font-bold text-foreground"
                >
                  {t("complete")}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-2 max-w-xs text-sm text-muted-foreground"
                >
                  {t("completeMessage")}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="mt-6 flex items-center justify-between gap-3">
            {step > 0 && step < 2 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className="border-border"
              >
                {t("previous")}
              </Button>
            )}

            {step === 0 && (
              <>
                <div />
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-gold text-primary-foreground hover:bg-gold-light"
                >
                  {t("next")}
                </Button>
              </>
            )}

            {step === 1 && (
              <Button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="bg-gold text-primary-foreground hover:bg-gold-light"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("finish")
                )}
              </Button>
            )}

            {step === 2 && (
              <Button
                type="button"
                onClick={handleGoToDashboard}
                className="w-full bg-gold text-primary-foreground hover:bg-gold-light"
              >
                {t("goToDashboard")}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
