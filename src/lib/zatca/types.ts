export interface ZatcaInvoiceData {
  uuid: string;
  invoiceNumber: string;
  issueDate: string;
  issueTime: string;
  invoiceTypeCode: string; // "388" standard, "381" credit, "383" debit
  // Seller
  sellerName: string;
  sellerTrn: string;
  sellerAddress?: string;
  sellerPhone?: string;
  // Buyer (for B2B / standard invoices)
  buyerName?: string;
  buyerTrn?: string;
  buyerAddress?: string;
  // Totals
  subtotal: number;
  discountTotal: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;
  currency: string;
  // Items
  items: ZatcaInvoiceItem[];
  // For credit/debit notes
  originalInvoiceNumber?: string;
}

export interface ZatcaInvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxCategory: string; // S, Z, E, O
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
}

export interface ZatcaQrData {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  totalWithVat: string;
  vatAmount: string;
}

export interface ZatcaCsidResponse {
  csid: string;
  requestId: string;
  dispositionMessage: string;
}

export interface ZatcaReportResponse {
  status: "REPORTED" | "CLEARED" | "REJECTED";
  clearanceStatus?: string;
  reportingStatus?: string;
  validationResults?: {
    status: string;
    infoMessages?: string[];
    warningMessages?: string[];
    errorMessages?: string[];
  };
}
