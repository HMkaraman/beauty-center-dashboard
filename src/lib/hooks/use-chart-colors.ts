import { useThemeStore } from "@/store/useThemeStore";
import { COLOR_PALETTES, DEFAULT_COLOR } from "@/config/color-palettes";

export function useChartColors() {
  const { primaryColor, theme } = useThemeStore();
  const palette = COLOR_PALETTES[primaryColor]?.[theme] ?? COLOR_PALETTES[DEFAULT_COLOR][theme];

  return {
    gold: palette["--gold"],
    goldLight: palette["--gold-light"],
    green: palette["--green"],
    red: palette["--red"],
    purple: "#8B7FF5",
    yellow: "#F5C26B",
    border: palette["--border"],
    muted: palette["--muted-foreground"],
  } as const;
}
