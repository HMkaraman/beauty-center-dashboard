import { Font } from "@react-pdf/renderer";

let registered = false;

export function registerPdfFonts() {
  if (registered) return;
  registered = true;

  const base = typeof window !== "undefined" ? window.location.origin : "";

  Font.register({
    family: "NotoKufiArabic",
    fonts: [
      { src: `${base}/fonts/noto-kufi-arabic/NotoKufiArabic-Regular.ttf`, fontWeight: 400 },
      { src: `${base}/fonts/noto-kufi-arabic/NotoKufiArabic-Bold.ttf`, fontWeight: 700 },
    ],
  });

  Font.register({
    family: "Outfit",
    fonts: [
      { src: `${base}/fonts/outfit/Outfit-Regular.ttf`, fontWeight: 400 },
      { src: `${base}/fonts/outfit/Outfit-Bold.ttf`, fontWeight: 700 },
    ],
  });

  Font.register({
    family: "Tajawal",
    fonts: [
      { src: `${base}/fonts/tajawal/Tajawal-Regular.ttf`, fontWeight: 400 },
      { src: `${base}/fonts/tajawal/Tajawal-Bold.ttf`, fontWeight: 700 },
    ],
  });

  Font.register({
    family: "Cairo",
    fonts: [
      { src: `${base}/fonts/cairo/Cairo-Regular.ttf`, fontWeight: 400 },
      { src: `${base}/fonts/cairo/Cairo-Bold.ttf`, fontWeight: 700 },
    ],
  });
}
