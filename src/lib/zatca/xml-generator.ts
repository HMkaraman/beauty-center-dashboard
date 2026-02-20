import type { ZatcaInvoiceData } from "./types";

/**
 * Generate ZATCA UBL 2.1 compliant XML for an invoice.
 *
 * This produces a minimal compliant XML structure.
 * For full ZATCA Phase 2 compliance, the XML must also be digitally signed
 * and include the CSID — that part is handled by the api-service.
 */
export function generateZatcaXml(data: ZatcaInvoiceData): string {
  const escXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const itemsXml = data.items
    .map(
      (item, index) => `
    <cac:InvoiceLine>
      <cbc:ID>${index + 1}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="PCE">${item.quantity}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="${data.currency}">${item.lineTotal.toFixed(2)}</cbc:LineExtensionAmount>
      <cac:TaxTotal>
        <cbc:TaxAmount currencyID="${data.currency}">${item.taxAmount.toFixed(2)}</cbc:TaxAmount>
        <cac:TaxSubtotal>
          <cbc:TaxableAmount currencyID="${data.currency}">${item.lineTotal.toFixed(2)}</cbc:TaxableAmount>
          <cbc:TaxAmount currencyID="${data.currency}">${item.taxAmount.toFixed(2)}</cbc:TaxAmount>
          <cac:TaxCategory>
            <cbc:ID>${item.taxCategory}</cbc:ID>
            <cbc:Percent>${item.taxRate.toFixed(2)}</cbc:Percent>
            <cac:TaxScheme>
              <cbc:ID>VAT</cbc:ID>
            </cac:TaxScheme>
          </cac:TaxCategory>
        </cac:TaxSubtotal>
      </cac:TaxTotal>
      <cac:Item>
        <cbc:Name>${escXml(item.name)}</cbc:Name>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="${data.currency}">${item.unitPrice.toFixed(2)}</cbc:PriceAmount>
      </cac:Price>
    </cac:InvoiceLine>`
    )
    .join("");

  const buyerParty = data.buyerName
    ? `
    <cac:AccountingCustomerParty>
      <cac:Party>
        <cac:PartyIdentification>
          <cbc:ID schemeID="VAT">${escXml(data.buyerTrn || "")}</cbc:ID>
        </cac:PartyIdentification>
        <cac:PartyLegalEntity>
          <cbc:RegistrationName>${escXml(data.buyerName)}</cbc:RegistrationName>
        </cac:PartyLegalEntity>
        ${data.buyerAddress ? `<cac:PostalAddress><cbc:StreetName>${escXml(data.buyerAddress)}</cbc:StreetName></cac:PostalAddress>` : ""}
      </cac:Party>
    </cac:AccountingCustomerParty>`
    : "";

  const billingRef = data.originalInvoiceNumber
    ? `
    <cac:BillingReference>
      <cac:InvoiceDocumentReference>
        <cbc:ID>${escXml(data.originalInvoiceNumber)}</cbc:ID>
      </cac:InvoiceDocumentReference>
    </cac:BillingReference>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${escXml(data.invoiceNumber)}</cbc:ID>
  <cbc:UUID>${escXml(data.uuid)}</cbc:UUID>
  <cbc:IssueDate>${data.issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${data.issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="0100000">${data.invoiceTypeCode}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${data.currency}</cbc:DocumentCurrencyCode>${billingRef}
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="VAT">${escXml(data.sellerTrn)}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${escXml(data.sellerName)}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
      ${data.sellerAddress ? `<cac:PostalAddress><cbc:StreetName>${escXml(data.sellerAddress)}</cbc:StreetName></cac:PostalAddress>` : ""}
    </cac:Party>
  </cac:AccountingSupplierParty>${buyerParty}
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${data.currency}">${data.taxAmount.toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${data.currency}">${data.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${data.currency}">${data.taxableAmount.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${data.currency}">${data.total.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="${data.currency}">${data.discountTotal.toFixed(2)}</cbc:AllowanceTotalAmount>
    <cbc:PayableAmount currencyID="${data.currency}">${data.total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>${itemsXml}
</Invoice>`;
}
