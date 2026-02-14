"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/ui/dynamic-icon";

const colorOptions = [
  { name: "Gold", value: "#C4956A" },
  { name: "Green", value: "#7ECB8B" },
  { name: "Purple", value: "#8B7FF5" },
  { name: "Blue", value: "#5B9BD5" },
  { name: "Rose", value: "#E07B7B" },
];

export function AppearanceCard() {
  const t = useTranslations("settings");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [primaryColor, setPrimaryColor] = useState("#C4956A");

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">{t("appearance")}</h3>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">{t("theme")}</label>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm transition-colors ${theme === "dark" ? "border-[#C4956A] bg-[#C4956A]/10 text-foreground" : "border-border text-muted-foreground hover:border-muted-foreground"}`}
            >
              <DynamicIcon name="Moon" className="h-4 w-4" />
              {t("darkMode")}
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm transition-colors ${theme === "light" ? "border-[#C4956A] bg-[#C4956A]/10 text-foreground" : "border-border text-muted-foreground hover:border-muted-foreground"}`}
            >
              <DynamicIcon name="Sun" className="h-4 w-4" />
              {t("lightMode")}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">{t("primaryColor")}</label>
          <div className="flex gap-3">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => setPrimaryColor(color.value)}
                className={`h-8 w-8 rounded-full border-2 transition-all ${primaryColor === color.value ? "border-foreground scale-110" : "border-transparent"}`}
                style={{ backgroundColor: color.value }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button size="sm">{t("save")}</Button>
      </div>
    </div>
  );
}
