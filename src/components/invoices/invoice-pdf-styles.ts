import { StyleSheet } from "@react-pdf/renderer";
import type { InvoiceDesign } from "@/lib/invoice-design";
import { PDF_FONT_MAP, SPACING_MULTIPLIERS } from "@/lib/invoice-design";

export function buildPdfStyles(design: InvoiceDesign) {
  const fontFamily = PDF_FONT_MAP[design.fontFamily];
  const sp = SPACING_MULTIPLIERS[design.sectionSpacing];
  const margin = design.pageMargin;

  const isModern = design.template === "modern";
  const isElegant = design.template === "elegant";
  const isCompact = design.template === "compact";

  // Table header background per template
  const tableHeaderBg = isModern
    ? design.accentColor
    : isElegant
      ? "transparent"
      : design.secondaryColor;

  const tableHeaderTextColor = isModern ? "#ffffff" : "#000000";

  // Header border
  const headerBorderWidth = isElegant ? 1 : isCompact ? 0 : 2;
  const headerBorderColor = isElegant ? design.accentColor : design.primaryColor;

  // Grand total styling
  const grandTotalBorderColor = isModern ? design.accentColor : design.primaryColor;

  // @react-pdf miscalculates Arabic glyph widths causing clipping.
  // A small letterSpacing compensates for the measurement error.
  const arabicLetterSpacing = 0.5;

  return StyleSheet.create({
    page: {
      padding: margin,
      fontFamily,
      fontSize: design.bodyFontSize,
      color: "#1a1a1a",
      direction: "rtl",
      letterSpacing: arabicLetterSpacing,
    },

    // ---- Header ----
    header: {
      textAlign: isModern ? "left" : "center",
      marginBottom: 16 * sp,
      borderBottomWidth: headerBorderWidth,
      borderBottomColor: headerBorderColor,
      paddingBottom: 12 * sp,
      ...(isModern
        ? { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center" }
        : {}),
      ...(isCompact
        ? { flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", paddingBottom: 6, marginBottom: 8 }
        : {}),
    },
    headerTextBlock: {
      textAlign: isModern || isCompact ? "right" : "center",
      ...(isModern || isCompact ? { flex: 1 } : { width: "100%" }),
    },
    logo: {
      width: isCompact ? 80 : 120,
      maxHeight: isCompact ? 40 : 60,
      ...(design.logoPosition === "center" && !isModern && !isCompact
        ? { marginLeft: "auto", marginRight: "auto" }
        : {}),
      ...(design.logoPosition === "left" && !isModern && !isCompact
        ? { marginLeft: "auto" }
        : {}),
      marginBottom: isModern || isCompact ? 0 : 8,
      objectFit: "contain" as const,
    },
    bizName: {
      fontSize: design.businessNameSize,
      fontWeight: 700,
      marginBottom: 2,
    },
    bizNameEn: {
      fontSize: Math.round(design.businessNameSize * 0.67),
      fontFamily: "Outfit",
      letterSpacing: 0,
      color: "#444",
      marginBottom: 6,
    },
    tagline: {
      fontSize: design.bodyFontSize - 1,
      color: design.accentColor,
      marginBottom: 2,
    },
    headerDetail: {
      fontSize: design.bodyFontSize - 1,
      color: "#555",
      marginBottom: 1,
    },
    trn: {
      fontSize: design.bodyFontSize,
      fontWeight: 700,
      marginTop: 4,
    },

    // ---- Accent bar (modern) ----
    accentBar: {
      height: 3,
      backgroundColor: design.accentColor,
      marginBottom: 12 * sp,
    },

    // ---- Type badge ----
    typeBadge: {
      textAlign: "center",
      marginVertical: 12 * sp,
      paddingVertical: isCompact ? 4 : 6,
      paddingHorizontal: 12,
      ...(isModern
        ? { backgroundColor: design.accentColor, borderRadius: 20 }
        : isElegant
          ? { borderBottomWidth: 1, borderBottomColor: design.accentColor, backgroundColor: "transparent" }
          : isCompact
            ? { backgroundColor: design.secondaryColor, borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8, alignSelf: "center" as const }
            : { backgroundColor: design.secondaryColor, borderWidth: 1, borderColor: "#ddd" }),
    },
    typeAr: {
      fontSize: isCompact ? 11 : 14,
      fontWeight: 700,
      ...(isModern ? { color: "#ffffff" } : {}),
      ...(isElegant ? { textDecoration: "underline", textDecorationColor: design.accentColor } : {}),
    },
    typeEn: {
      fontSize: isCompact ? 8 : 10,
      fontFamily: "Outfit",
      letterSpacing: 0,
      ...(isModern ? { color: "#ffffffcc" } : { color: "#555" }),
    },

    // ---- Meta row ----
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12 * sp,
      fontSize: design.bodyFontSize,
    },
    metaLabel: { fontWeight: 700 },
    uuid: {
      fontSize: 7,
      color: "#888",
      textAlign: "center",
      marginBottom: 8 * sp,
    },

    // ---- Buyer/Client ----
    buyerBox: {
      marginBottom: 12 * sp,
      padding: 8,
      borderWidth: 1,
      borderColor: "#ddd",
    },
    buyerTitle: {
      fontSize: design.bodyFontSize,
      fontWeight: 700,
      marginBottom: 4,
    },
    buyerLine: {
      fontSize: design.bodyFontSize - 1,
      color: "#333",
      marginBottom: 1,
    },
    clientLine: {
      fontSize: design.bodyFontSize,
      marginBottom: 12 * sp,
      color: "#333",
    },

    // ---- Items table ----
    table: { marginBottom: 12 * sp },
    tableHeaderRow: {
      flexDirection: "row",
      backgroundColor: tableHeaderBg,
      borderBottomWidth: isElegant ? 2 : 2,
      borderBottomColor: isElegant ? design.accentColor : design.primaryColor,
      paddingVertical: isCompact ? 3 : 5,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
      paddingVertical: isCompact ? 3 : 4,
      ...(isCompact ? { backgroundColor: undefined } : {}),
    },
    tableRowAlt: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
      paddingVertical: isCompact ? 3 : 4,
      backgroundColor: isCompact ? design.secondaryColor : undefined,
    },

    // Column widths
    colNum: { width: "5%", textAlign: "center" },
    colDesc: { width: "27%", textAlign: "right" },
    colQty: { width: "8%", textAlign: "center" },
    colPrice: { width: "13%", textAlign: "center" },
    colDisc: { width: "11%", textAlign: "center" },
    colTaxPct: { width: "9%", textAlign: "center" },
    colTaxAmt: { width: "13%", textAlign: "center" },
    colTotal: { width: "14%", textAlign: "center" },

    thText: {
      fontSize: design.tableHeaderSize,
      fontWeight: 700,
      color: tableHeaderTextColor,
    },
    thTextEn: {
      fontSize: design.tableHeaderSize - 2,
      fontFamily: "Outfit",
      letterSpacing: 0,
      color: isModern ? "#ffffffaa" : "#666",
    },
    tdText: {
      fontSize: design.bodyFontSize - 1,
      fontFamily: "Outfit",
      letterSpacing: 0,
    },
    tdTextAr: {
      fontSize: design.bodyFontSize - 1,
      fontFamily,
    },

    // ---- Tax breakdown ----
    taxSection: { marginBottom: 12 * sp },
    taxTitle: {
      fontSize: design.bodyFontSize,
      fontWeight: 700,
      marginBottom: 4,
    },
    taxRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
      paddingVertical: 3,
    },
    taxCol: {
      width: "33.33%",
      textAlign: "center",
      fontSize: design.bodyFontSize - 1,
      fontFamily: "Outfit",
      letterSpacing: 0,
    },
    taxColHeader: {
      width: "33.33%",
      textAlign: "center",
      fontSize: design.tableHeaderSize,
      fontWeight: 700,
    },

    // ---- Totals ----
    totalsWrap: {
      alignItems: "flex-end",
      marginBottom: 16 * sp,
    },
    totalsTable: { width: "45%" },
    totalsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
      paddingVertical: 3,
    },
    totalsLabel: {
      fontSize: design.bodyFontSize - 1,
      color: "#555",
    },
    totalsValue: {
      fontSize: design.bodyFontSize - 1,
      fontFamily: "Outfit",
      letterSpacing: 0,
    },
    grandTotalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 2,
      borderTopColor: grandTotalBorderColor,
      paddingTop: 5,
      marginTop: 2,
      ...(isModern
        ? { backgroundColor: `${design.accentColor}15`, padding: 6, borderRadius: 4 }
        : {}),
      ...(isElegant
        ? { borderTopWidth: 1, borderTopColor: design.accentColor }
        : {}),
    },
    grandTotalLabel: {
      fontSize: design.bodyFontSize + 2,
      fontWeight: 700,
    },
    grandTotalValue: {
      fontSize: design.bodyFontSize + 2,
      fontWeight: 700,
      fontFamily: "Outfit",
      letterSpacing: 0,
      ...(isModern ? { color: design.accentColor } : {}),
    },

    // ---- QR ----
    qrWrap: {
      textAlign: "center",
      alignItems: "center",
      marginBottom: 12 * sp,
    },
    qrImage: { width: 80, height: 80 },

    // ---- Notes ----
    notesBox: {
      marginBottom: 12 * sp,
      padding: 8,
      borderWidth: 1,
      borderColor: "#eee",
      fontSize: design.bodyFontSize - 1,
    },
    notesTitle: { fontWeight: 700, marginBottom: 2 },

    // ---- Footer ----
    footer: {
      textAlign: "center",
      fontSize: design.bodyFontSize - 2,
      color: "#999",
      borderTopWidth: 1,
      borderTopColor: "#ddd",
      paddingTop: 8,
      marginTop: "auto",
    },
  });
}
