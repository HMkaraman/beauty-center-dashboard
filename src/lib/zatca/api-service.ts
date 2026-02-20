import type { ZatcaCsidResponse, ZatcaReportResponse } from "./types";

/**
 * ZATCA Fatoora API service.
 *
 * Currently stubbed — throws clear errors until tenant configures ZATCA credentials.
 * When implemented, connects to:
 *   Sandbox: https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal
 *   Production: https://gw-fatoora.zatca.gov.sa/e-invoicing/core
 */
export class ZatcaApiService {
  private environment: "sandbox" | "production";
  private complianceCsid?: string;
  private productionCsid?: string;

  constructor(config: {
    environment: "sandbox" | "production";
    complianceCsid?: string;
    productionCsid?: string;
  }) {
    this.environment = config.environment;
    this.complianceCsid = config.complianceCsid;
    this.productionCsid = config.productionCsid;
  }

  private get baseUrl(): string {
    return this.environment === "production"
      ? "https://gw-fatoora.zatca.gov.sa/e-invoicing/core"
      : "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal";
  }

  /**
   * Step 1: Get Compliance CSID from ZATCA using CSR.
   * Used during initial onboarding.
   */
  async getComplianceCsid(_csr: string): Promise<ZatcaCsidResponse> {
    throw new Error(
      "ZATCA integration not configured. Please set up your ZATCA credentials in Settings > Financial > E-Invoicing."
    );
  }

  /**
   * Step 2: Run compliance check with sample invoices.
   * Required before getting production CSID.
   */
  async complianceCheck(_signedXml: string): Promise<ZatcaReportResponse> {
    if (!this.complianceCsid) {
      throw new Error("Compliance CSID not set. Complete ZATCA onboarding first.");
    }
    throw new Error("ZATCA compliance check not yet implemented.");
  }

  /**
   * Step 3: Get Production CSID.
   * Called after passing compliance checks.
   */
  async getProductionCsid(): Promise<ZatcaCsidResponse> {
    if (!this.complianceCsid) {
      throw new Error("Compliance CSID not set. Complete ZATCA onboarding first.");
    }
    throw new Error("ZATCA production CSID retrieval not yet implemented.");
  }

  /**
   * Report a B2C (simplified) invoice to ZATCA.
   * Must be done within 24 hours of issuance.
   */
  async reportInvoice(_signedXml: string, _invoiceHash: string): Promise<ZatcaReportResponse> {
    if (!this.productionCsid) {
      throw new Error("Production CSID not set. Complete ZATCA onboarding first.");
    }
    throw new Error("ZATCA invoice reporting not yet implemented.");
  }

  /**
   * Clear a B2B (standard) invoice with ZATCA.
   * Must be done in real-time before delivering to buyer.
   */
  async clearInvoice(_signedXml: string, _invoiceHash: string): Promise<ZatcaReportResponse> {
    if (!this.productionCsid) {
      throw new Error("Production CSID not set. Complete ZATCA onboarding first.");
    }
    throw new Error("ZATCA invoice clearance not yet implemented.");
  }

  /**
   * Check if the service is properly configured and ready to use.
   */
  isConfigured(): boolean {
    return !!(this.complianceCsid || this.productionCsid);
  }
}
