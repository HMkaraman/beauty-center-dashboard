import { NextRequest } from "next/server";
import {
  getAuthSession,
  unauthorized,
  success,
  serverError,
} from "@/lib/api-utils";
import { db } from "@/db/db";
import { tenantSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

interface ExchangeRateEntry {
  rate: number;
  isManual: boolean;
  updatedAt: string;
}

export async function POST(_req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const tenantId = session.user.tenantId;

    const [settings] = await db
      .select()
      .from(tenantSettings)
      .where(eq(tenantSettings.tenantId, tenantId));

    const baseCurrency = settings?.currency || "SAR";

    // Parse existing rates
    let existingRates: Record<string, ExchangeRateEntry> = {};
    if (settings?.exchangeRates) {
      try {
        existingRates = JSON.parse(settings.exchangeRates);
      } catch {
        // ignore
      }
    }

    // Get target currencies from existing rates
    const targets = Object.keys(existingRates);
    if (targets.length === 0) {
      return success({ exchangeRates: existingRates });
    }

    // Fetch live rates from frankfurter.app
    const targetStr = targets.join(",");
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=${baseCurrency}&to=${targetStr}`
    );

    if (!res.ok) {
      console.error("Frankfurter API error:", res.status, await res.text());
      return success({ exchangeRates: existingRates });
    }

    const data = await res.json();
    const liveRates: Record<string, number> = data.rates || {};
    const now = new Date().toISOString();

    // Merge: preserve manual overrides, update auto rates
    const merged: Record<string, ExchangeRateEntry> = {};
    for (const code of targets) {
      const existing = existingRates[code];
      if (existing?.isManual) {
        merged[code] = existing;
      } else {
        merged[code] = {
          rate: liveRates[code] ?? existing?.rate ?? 0,
          isManual: false,
          updatedAt: liveRates[code] ? now : (existing?.updatedAt ?? now),
        };
      }
    }

    // Save to DB
    const ratesJson = JSON.stringify(merged);
    if (settings) {
      await db
        .update(tenantSettings)
        .set({ exchangeRates: ratesJson, updatedAt: new Date() })
        .where(eq(tenantSettings.tenantId, tenantId));
    }

    return success({ exchangeRates: merged });
  } catch (error) {
    console.error("POST /api/settings/exchange-rates/fetch error:", error);
    return serverError();
  }
}
