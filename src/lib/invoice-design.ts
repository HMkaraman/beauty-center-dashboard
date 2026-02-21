import { z } from "zod";

export const invoiceTemplates = ["classic", "modern", "elegant", "compact"] as const;
export type InvoiceTemplate = (typeof invoiceTemplates)[number];

export const invoiceFontFamilies = ["noto-kufi-arabic", "tajawal", "cairo"] as const;
export type InvoiceFontFamily = (typeof invoiceFontFamilies)[number];

export const logoPositions = ["center", "right", "left"] as const;
export type LogoPosition = (typeof logoPositions)[number];

export const headerLayouts = ["stacked", "inline"] as const;
export type HeaderLayout = (typeof headerLayouts)[number];

export const sectionSpacings = ["compact", "normal", "relaxed"] as const;
export type SectionSpacing = (typeof sectionSpacings)[number];

export interface InvoiceDesign {
  template: InvoiceTemplate;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: InvoiceFontFamily;
  businessNameSize: number;
  bodyFontSize: number;
  tableHeaderSize: number;
  logoPosition: LogoPosition;
  headerLayout: HeaderLayout;
  showTaxBreakdown: boolean;
  showUuid: boolean;
  showNotes: boolean;
  showQrCode: boolean;
  tagline: string;
  taglineEn: string;
  footerText: string;
  footerTextEn: string;
  pageMargin: number;
  sectionSpacing: SectionSpacing;
}

export const invoiceDesignSchema = z.object({
  template: z.enum(invoiceTemplates).default("classic"),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#333333"),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#f0f0f0"),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#C4956A"),
  fontFamily: z.enum(invoiceFontFamilies).default("noto-kufi-arabic"),
  businessNameSize: z.number().min(14).max(28).default(18),
  bodyFontSize: z.number().min(8).max(14).default(10),
  tableHeaderSize: z.number().min(7).max(12).default(8),
  logoPosition: z.enum(logoPositions).default("center"),
  headerLayout: z.enum(headerLayouts).default("stacked"),
  showTaxBreakdown: z.boolean().default(true),
  showUuid: z.boolean().default(true),
  showNotes: z.boolean().default(true),
  showQrCode: z.boolean().default(true),
  tagline: z.string().default(""),
  taglineEn: z.string().default(""),
  footerText: z.string().default(""),
  footerTextEn: z.string().default(""),
  pageMargin: z.number().min(20).max(60).default(40),
  sectionSpacing: z.enum(sectionSpacings).default("normal"),
});

export const DEFAULT_INVOICE_DESIGN: InvoiceDesign = {
  template: "classic",
  primaryColor: "#333333",
  secondaryColor: "#f0f0f0",
  accentColor: "#C4956A",
  fontFamily: "noto-kufi-arabic",
  businessNameSize: 18,
  bodyFontSize: 10,
  tableHeaderSize: 8,
  logoPosition: "center",
  headerLayout: "stacked",
  showTaxBreakdown: true,
  showUuid: true,
  showNotes: true,
  showQrCode: true,
  tagline: "",
  taglineEn: "",
  footerText: "",
  footerTextEn: "",
  pageMargin: 40,
  sectionSpacing: "normal",
};

export const COLOR_PRESETS = [
  { name: "Gold", value: "#C4956A" },
  { name: "Rose Gold", value: "#B76E79" },
  { name: "Blush", value: "#DE98AB" },
  { name: "Mauve", value: "#9B7EA1" },
  { name: "Teal", value: "#4FD1C5" },
  { name: "Navy", value: "#2C3E6B" },
  { name: "Charcoal", value: "#333333" },
  { name: "Forest", value: "#3B6B4F" },
] as const;

/** Font family display names */
export const FONT_FAMILY_LABELS: Record<InvoiceFontFamily, string> = {
  "noto-kufi-arabic": "Noto Kufi Arabic",
  tajawal: "Tajawal",
  cairo: "Cairo",
};

/** Map design font family to PDF registered font name */
export const PDF_FONT_MAP: Record<InvoiceFontFamily, string> = {
  "noto-kufi-arabic": "NotoKufiArabic",
  tajawal: "Tajawal",
  cairo: "Cairo",
};

/** Map design font family to CSS font-family value for browser rendering */
export const CSS_FONT_MAP: Record<InvoiceFontFamily, string> = {
  "noto-kufi-arabic": "var(--font-noto-kufi-arabic), 'Noto Kufi Arabic', sans-serif",
  tajawal: "'Tajawal', sans-serif",
  cairo: "'Cairo', sans-serif",
};

/** Spacing multipliers for section spacing */
export const SPACING_MULTIPLIERS: Record<SectionSpacing, number> = {
  compact: 0.6,
  normal: 1,
  relaxed: 1.5,
};

export function parseInvoiceDesign(raw: string | null | undefined): InvoiceDesign {
  if (!raw) return { ...DEFAULT_INVOICE_DESIGN };
  try {
    const parsed = JSON.parse(raw);
    const result = invoiceDesignSchema.safeParse(parsed);
    if (result.success) {
      return { ...DEFAULT_INVOICE_DESIGN, ...result.data };
    }
    return { ...DEFAULT_INVOICE_DESIGN };
  } catch {
    return { ...DEFAULT_INVOICE_DESIGN };
  }
}
