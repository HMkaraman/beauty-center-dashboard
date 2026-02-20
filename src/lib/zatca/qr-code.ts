import type { ZatcaQrData } from "./types";

/**
 * Generate ZATCA-compliant TLV (Tag-Length-Value) encoded QR code as base64 string.
 *
 * ZATCA Phase 2 requires TLV encoding with 5 fields:
 * Tag 1: Seller name (UTF-8)
 * Tag 2: VAT registration number
 * Tag 3: Timestamp (ISO 8601)
 * Tag 4: Invoice total with VAT
 * Tag 5: VAT amount
 */
export function generateZatcaQrCode(data: ZatcaQrData): string {
  const tlvParts: Buffer[] = [];

  tlvParts.push(createTlvTag(1, data.sellerName));
  tlvParts.push(createTlvTag(2, data.vatNumber));
  tlvParts.push(createTlvTag(3, data.timestamp));
  tlvParts.push(createTlvTag(4, data.totalWithVat));
  tlvParts.push(createTlvTag(5, data.vatAmount));

  const combined = Buffer.concat(tlvParts);
  return combined.toString("base64");
}

function createTlvTag(tag: number, value: string): Buffer {
  const valueBuffer = Buffer.from(value, "utf-8");
  const tagBuffer = Buffer.from([tag]);
  const lengthBuffer = Buffer.from([valueBuffer.length]);
  return Buffer.concat([tagBuffer, lengthBuffer, valueBuffer]);
}

/**
 * Decode a ZATCA TLV QR code from base64 back to structured data (for verification).
 */
export function decodeZatcaQrCode(base64: string): ZatcaQrData {
  const buffer = Buffer.from(base64, "base64");
  const fields: Record<number, string> = {};
  let offset = 0;

  while (offset < buffer.length) {
    const tag = buffer[offset++];
    const length = buffer[offset++];
    const value = buffer.subarray(offset, offset + length).toString("utf-8");
    fields[tag] = value;
    offset += length;
  }

  return {
    sellerName: fields[1] || "",
    vatNumber: fields[2] || "",
    timestamp: fields[3] || "",
    totalWithVat: fields[4] || "",
    vatAmount: fields[5] || "",
  };
}
