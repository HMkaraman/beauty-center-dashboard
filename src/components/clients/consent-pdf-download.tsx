"use client";

import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HealingJourneyConsentPdf } from "./healing-journey-consent-pdf";
import { imageUrlToDataUrl } from "@/components/invoices/invoice-pdf-document";
import type { HealingJourney, JourneyEntry } from "@/types";
import type { Settings } from "@/lib/api/settings";

interface ConsentPdfDownloadProps {
  journey: HealingJourney;
  entries: JourneyEntry[];
  clientName: string;
  settings: Settings;
}

export function ConsentPdfDownload({ journey, entries, clientName, settings }: ConsentPdfDownloadProps) {
  const t = useTranslations("clients");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>();
  const [logoDataUrl, setLogoDataUrl] = useState<string>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const prepare = async () => {
      try {
        const promises: Promise<void>[] = [];

        if (journey.signatureUrl) {
          promises.push(
            imageUrlToDataUrl(journey.signatureUrl).then((url) => {
              if (!cancelled) setSignatureDataUrl(url);
            })
          );
        }

        if (settings.logoUrl) {
          promises.push(
            imageUrlToDataUrl(settings.logoUrl).then((url) => {
              if (!cancelled) setLogoDataUrl(url);
            })
          );
        }

        await Promise.all(promises);
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) setReady(true);
      }
    };

    prepare();
    return () => { cancelled = true; };
  }, [journey.signatureUrl, settings.logoUrl]);

  if (!ready) {
    return (
      <Button size="sm" variant="outline" className="gap-1.5" disabled>
        <Download className="h-3.5 w-3.5" />
        ...
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={
        <HealingJourneyConsentPdf
          journey={journey}
          entries={entries}
          clientName={clientName}
          settings={settings}
          signatureDataUrl={signatureDataUrl}
          logoDataUrl={logoDataUrl}
        />
      }
      fileName={`consent-${journey.title.replace(/\s+/g, "-")}.pdf`}
    >
      {({ loading }) => (
        <Button size="sm" variant="outline" className="gap-1.5" disabled={loading}>
          <Download className="h-3.5 w-3.5" />
          {t("downloadConsentPdf")}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
