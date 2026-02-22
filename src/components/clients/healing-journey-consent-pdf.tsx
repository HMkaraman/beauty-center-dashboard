"use client";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { registerPdfFonts } from "@/components/invoices/invoice-pdf-fonts";
import type { HealingJourney, JourneyEntry } from "@/types";
import type { Settings } from "@/lib/api/settings";

registerPdfFonts();

interface ConsentPdfProps {
  journey: HealingJourney;
  entries: JourneyEntry[];
  clientName: string;
  settings: Settings;
  signatureDataUrl?: string;
  logoDataUrl?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "NotoKufiArabic",
    fontSize: 10,
    direction: "rtl",
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: "1px solid #e5e7eb",
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: "contain",
  },
  headerText: {
    textAlign: "right",
  },
  businessName: {
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 2,
  },
  businessNameEn: {
    fontSize: 11,
    fontFamily: "Outfit",
    color: "#6b7280",
    textAlign: "left",
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 4,
    color: "#111827",
  },
  titleEn: {
    fontSize: 11,
    fontFamily: "Outfit",
    textAlign: "center",
    marginBottom: 16,
    color: "#6b7280",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
    color: "#374151",
    paddingBottom: 4,
    borderBottom: "1px solid #e5e7eb",
  },
  row: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  label: {
    fontSize: 9,
    color: "#6b7280",
  },
  value: {
    fontSize: 10,
    color: "#111827",
  },
  table: {
    marginTop: 6,
  },
  tableHeader: {
    flexDirection: "row-reverse",
    backgroundColor: "#f3f4f6",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: "1px solid #e5e7eb",
  },
  tableRow: {
    flexDirection: "row-reverse",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottom: "1px solid #f3f4f6",
  },
  colType: { width: "15%", textAlign: "right" },
  colDate: { width: "15%", textAlign: "right", fontFamily: "Outfit" },
  colDetails: { width: "70%", textAlign: "right" },
  thText: {
    fontSize: 8,
    fontWeight: 700,
    color: "#374151",
  },
  tdText: {
    fontSize: 9,
    color: "#111827",
  },
  consent: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#fffbeb",
    borderRadius: 4,
  },
  consentText: {
    fontSize: 9,
    lineHeight: 1.6,
    color: "#111827",
    textAlign: "right",
    marginBottom: 8,
  },
  consentTextEn: {
    fontSize: 9,
    fontFamily: "Outfit",
    lineHeight: 1.6,
    color: "#6b7280",
    textAlign: "left",
  },
  signatureSection: {
    marginTop: 20,
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  signatureBlock: {
    alignItems: "center",
  },
  signatureImage: {
    width: 150,
    height: 60,
    objectFit: "contain",
    marginBottom: 4,
  },
  signatureLine: {
    width: 150,
    borderBottom: "1px solid #9ca3af",
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: "#6b7280",
  },
  timestamp: {
    fontSize: 8,
    fontFamily: "Outfit",
    color: "#9ca3af",
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
    borderTop: "1px solid #e5e7eb",
    paddingTop: 8,
  },
});

const entryTypeLabels: Record<string, { ar: string; en: string }> = {
  session: { ar: "جلسة", en: "Session" },
  prescription: { ar: "وصفة", en: "Prescription" },
  note: { ar: "ملاحظة", en: "Note" },
  photo: { ar: "صور", en: "Photo" },
  milestone: { ar: "إنجاز", en: "Milestone" },
};

function getEntryDetails(entry: JourneyEntry): string {
  switch (entry.type) {
    case "session":
      return [entry.serviceName, entry.doctorName].filter(Boolean).join(" - ");
    case "prescription":
      return entry.prescriptionText?.slice(0, 80) ?? "";
    case "milestone":
      return entry.milestoneLabel ?? "";
    case "note":
      return entry.notes?.slice(0, 80) ?? "";
    default:
      return entry.notes?.slice(0, 80) ?? "";
  }
}

export function HealingJourneyConsentPdf({
  journey,
  entries,
  clientName,
  settings,
  signatureDataUrl,
  logoDataUrl,
}: ConsentPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.businessName}>{settings.businessName}</Text>
            {settings.businessNameEn && (
              <Text style={styles.businessNameEn}>{settings.businessNameEn}</Text>
            )}
            {settings.phone && (
              <Text style={{ fontSize: 8, fontFamily: "Outfit", color: "#6b7280" }}>{settings.phone}</Text>
            )}
          </View>
          {logoDataUrl && <Image src={logoDataUrl} style={styles.logo} />}
        </View>

        {/* Title */}
        <Text style={styles.title}>إقرار موافقة العميل على خطة العلاج</Text>
        <Text style={styles.titleEn}>Client Consent for Treatment Plan</Text>

        {/* Journey Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>بيانات الخطة العلاجية / Treatment Plan Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>عنوان الخطة / Plan Title</Text>
            <Text style={styles.value}>{journey.title}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>اسم العميل / Client Name</Text>
            <Text style={styles.value}>{clientName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>تاريخ البدء / Start Date</Text>
            <Text style={{ ...styles.value, fontFamily: "Outfit" }}>{journey.startDate}</Text>
          </View>
          {journey.description && (
            <View style={styles.row}>
              <Text style={styles.label}>الوصف / Description</Text>
              <Text style={styles.value}>{journey.description}</Text>
            </View>
          )}
        </View>

        {/* Entries Table */}
        {entries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>تفاصيل الخطة / Plan Details</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ ...styles.thText, ...styles.colType }}>النوع</Text>
                <Text style={{ ...styles.thText, ...styles.colDate }}>التاريخ</Text>
                <Text style={{ ...styles.thText, ...styles.colDetails }}>التفاصيل</Text>
              </View>
              {entries.map((entry) => (
                <View key={entry.id} style={styles.tableRow}>
                  <Text style={{ ...styles.tdText, ...styles.colType }}>
                    {entryTypeLabels[entry.type]?.ar ?? entry.type}
                  </Text>
                  <Text style={{ ...styles.tdText, ...styles.colDate }}>{entry.date}</Text>
                  <Text style={{ ...styles.tdText, ...styles.colDetails }}>
                    {getEntryDetails(entry)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Consent Declaration */}
        <View style={styles.consent}>
          <Text style={styles.consentText}>
            أقر أنا الموقع أدناه بأنني قد اطلعت على خطة العلاج المذكورة أعلاه وفهمت جميع الإجراءات والمخاطر المحتملة المرتبطة بها. أوافق على المضي قدماً في العلاج وفقاً للخطة الموصوفة.
          </Text>
          <Text style={styles.consentTextEn}>
            I, the undersigned, hereby acknowledge that I have reviewed the treatment plan described above and understand all procedures and potential risks involved. I consent to proceed with the treatment as described.
          </Text>
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            {signatureDataUrl ? (
              <Image src={signatureDataUrl} style={styles.signatureImage} />
            ) : (
              <View style={styles.signatureLine} />
            )}
            <Text style={styles.signatureLabel}>توقيع العميل / Client Signature</Text>
            {journey.consentSignedAt && (
              <Text style={styles.timestamp}>
                {new Date(journey.consentSignedAt).toLocaleString("en-GB")}
              </Text>
            )}
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>توقيع المسؤول / Authorized Signature</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          {settings.businessName} {settings.phone ? `| ${settings.phone}` : ""} {settings.email ? `| ${settings.email}` : ""}
        </Text>
      </Page>
    </Document>
  );
}
