import { create } from "zustand";
import { applyColorPalette, DEFAULT_COLOR } from "@/config/color-palettes";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  primaryColor: string;
  setTheme: (theme: Theme) => void;
  setPrimaryColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: (typeof window !== "undefined"
    ? (localStorage.getItem("theme") as Theme) ?? "dark"
    : "dark"),
  primaryColor: (typeof window !== "undefined"
    ? localStorage.getItem("primaryColor") ?? DEFAULT_COLOR
    : DEFAULT_COLOR),
  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
    applyColorPalette(get().primaryColor, theme);
    set({ theme });
  },
  setPrimaryColor: (color) => {
    localStorage.setItem("primaryColor", color);
    applyColorPalette(color, get().theme);
    set({ primaryColor: color });
  },
}));
