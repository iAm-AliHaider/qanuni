/**
 * ZATCA E-Invoicing Module for Qanuni
 * Phase 1: TLV QR Code generation (mandatory since Dec 2021)
 * Phase 2: UBL 2.1 XML + cryptographic stamps (future)
 *
 * References:
 * - ZATCA E-Invoice SDK: https://zatca.gov.sa/en/E-Invoicing
 * - TLV Encoding: Tag-Length-Value per ZATCA BR-KSA-27
 * - VAT Rate: 15% (Saudi Arabia)
 */

// ═══════════════════════════════════════════════════════
// Phase 1: TLV QR Code (Required for all Saudi invoices)
// ═══════════════════════════════════════════════════════

interface ZATCAQRInput {
  sellerName: string;       // Arabic or English firm name
  vatNumber: string;        // 15-digit VAT registration number
  timestamp: string;        // ISO 8601: "2026-03-02T14:00:00Z"
  invoiceTotal: string;     // Total including VAT (SAR)
  vatTotal: string;         // VAT amount (SAR)
}

/**
 * Generate ZATCA Phase 1 TLV-encoded QR code data (base64).
 * This is the minimum required QR for all Saudi tax invoices.
 *
 * TLV Tags:
 *   1 = Seller Name
 *   2 = VAT Registration Number
 *   3 = Timestamp (ISO 8601)
 *   4 = Invoice Total (incl. VAT)
 *   5 = VAT Total
 */
export function generateZATCAQR(input: ZATCAQRInput): string {
  const tags = [
    input.sellerName,
    input.vatNumber,
    input.timestamp,
    input.invoiceTotal,
    input.vatTotal,
  ];

  // TLV encoding
  const buffers: number[] = [];
  tags.forEach((value, index) => {
    const tag = index + 1;
    const encoded = new TextEncoder().encode(value);
    buffers.push(tag, encoded.length, ...encoded);
  });

  // Base64 encode
  const uint8 = new Uint8Array(buffers);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(uint8).toString("base64");
  }
  // Browser fallback
  let binary = "";
  uint8.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

/**
 * Decode a ZATCA TLV QR string back to fields (for verification/display).
 */
export function decodeZATCAQR(base64: string): ZATCAQRInput | null {
  try {
    let bytes: Uint8Array;
    if (typeof Buffer !== "undefined") {
      bytes = Buffer.from(base64, "base64");
    } else {
      const binary = atob(base64);
      bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    }

    const fields: string[] = [];
    let offset = 0;
    while (offset < bytes.length) {
      const tag = bytes[offset++];
      const length = bytes[offset++];
      const value = new TextDecoder().decode(bytes.slice(offset, offset + length));
      fields[tag - 1] = value;
      offset += length;
    }

    return {
      sellerName: fields[0] || "",
      vatNumber: fields[1] || "",
      timestamp: fields[2] || "",
      invoiceTotal: fields[3] || "",
      vatTotal: fields[4] || "",
    };
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════
// Firm Configuration (editable via Settings page later)
// ═══════════════════════════════════════════════════════

export const FIRM_ZATCA_CONFIG = {
  sellerName: "مكتب الراشد والشركاء للمحاماة", // Arabic name (required)
  sellerNameEn: "Al-Rashid & Partners Law Firm",
  vatNumber: "300000000000003",  // Placeholder — replace with real VAT number
  crNumber: "1010000000",        // Commercial Registration
  address: {
    street: "King Fahad Road",
    city: "Riyadh",
    cityAr: "الرياض",
    district: "Al Olaya",
    postalCode: "11564",
    country: "SA",
  },
  vatRate: 0.15, // 15%
};

// ═══════════════════════════════════════════════════════
// Invoice Calculations
// ═══════════════════════════════════════════════════════

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;   // SAR, tax-exclusive
  discount?: number;    // SAR
  vatRate?: number;     // Override default 15%
}

export interface ZATCAInvoice {
  invoiceNumber: string;
  issueDate: string;        // YYYY-MM-DD
  issueTime: string;        // HH:mm:ss
  clientName: string;
  clientNameAr?: string;
  clientVatNumber?: string;
  lineItems: InvoiceLineItem[];
  paymentMethod?: "cash" | "bank_transfer" | "check" | "card";
}

export interface InvoiceCalculation {
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  vatAmount: number;
  total: number;
  qrCode: string;          // Base64 TLV
  lineDetails: {
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    lineTotal: number;
    vatRate: number;
    vatAmount: number;
    totalWithVat: number;
  }[];
}

/**
 * Calculate invoice totals and generate ZATCA QR code.
 */
export function calculateInvoice(invoice: ZATCAInvoice): InvoiceCalculation {
  const lineDetails = invoice.lineItems.map((item) => {
    const vatRate = item.vatRate ?? FIRM_ZATCA_CONFIG.vatRate;
    const discount = item.discount ?? 0;
    const lineTotal = item.quantity * item.unitPrice - discount;
    const vatAmount = lineTotal * vatRate;
    return {
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount,
      lineTotal,
      vatRate,
      vatAmount,
      totalWithVat: lineTotal + vatAmount,
    };
  });

  const subtotal = lineDetails.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const totalDiscount = lineDetails.reduce((s, l) => s + l.discount, 0);
  const taxableAmount = subtotal - totalDiscount;
  const vatAmount = lineDetails.reduce((s, l) => s + l.vatAmount, 0);
  const total = taxableAmount + vatAmount;

  const timestamp = `${invoice.issueDate}T${invoice.issueTime}Z`;

  const qrCode = generateZATCAQR({
    sellerName: FIRM_ZATCA_CONFIG.sellerName,
    vatNumber: FIRM_ZATCA_CONFIG.vatNumber,
    timestamp,
    invoiceTotal: total.toFixed(2),
    vatTotal: vatAmount.toFixed(2),
  });

  return { subtotal, totalDiscount, taxableAmount, vatAmount, total, qrCode, lineDetails };
}

// ═══════════════════════════════════════════════════════
// Phase 2: UBL 2.1 XML Generation (ZATCA compliant)
// ═══════════════════════════════════════════════════════

/**
 * Generate UBL 2.1 XML for a simplified tax invoice.
 * Required for ZATCA Phase 2 integration/reporting.
 */
export function generateUBLXML(invoice: ZATCAInvoice, calc: InvoiceCalculation): string {
  const firm = FIRM_ZATCA_CONFIG;
  const currencyID = "SAR";

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${invoice.invoiceNumber}</cbc:ID>
  <cbc:UUID>${crypto.randomUUID ? crypto.randomUUID() : Date.now()}</cbc:UUID>
  <cbc:IssueDate>${invoice.issueDate}</cbc:IssueDate>
  <cbc:IssueTime>${invoice.issueTime}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="0200000">388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${currencyID}</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>${currencyID}</cbc:TaxCurrencyCode>

  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="CRN">${firm.crNumber}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PostalAddress>
        <cbc:StreetName>${firm.address.street}</cbc:StreetName>
        <cbc:CityName>${firm.address.city}</cbc:CityName>
        <cbc:PostalZone>${firm.address.postalCode}</cbc:PostalZone>
        <cac:Country><cbc:IdentificationCode>${firm.address.country}</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${firm.vatNumber}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${firm.sellerName}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${invoice.clientNameAr || invoice.clientName}</cbc:RegistrationName>
      </cac:PartyLegalEntity>
      ${invoice.clientVatNumber ? `<cac:PartyTaxScheme>
        <cbc:CompanyID>${invoice.clientVatNumber}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>` : ""}
    </cac:Party>
  </cac:AccountingCustomerParty>

  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>${invoice.paymentMethod === "cash" ? "10" : invoice.paymentMethod === "card" ? "48" : "42"}</cbc:PaymentMeansCode>
  </cac:PaymentMeans>

  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${currencyID}">${calc.vatAmount.toFixed(2)}</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${currencyID}">${calc.taxableAmount.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${currencyID}">${calc.vatAmount.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>15.00</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>

  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${currencyID}">${calc.taxableAmount.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${currencyID}">${calc.taxableAmount.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${currencyID}">${calc.total.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="${currencyID}">${calc.totalDiscount.toFixed(2)}</cbc:AllowanceTotalAmount>
    <cbc:PayableAmount currencyID="${currencyID}">${calc.total.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

${calc.lineDetails.map((line, i) => `  <cac:InvoiceLine>
    <cbc:ID>${i + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="PCE">${line.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${currencyID}">${line.lineTotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="${currencyID}">${line.vatAmount.toFixed(2)}</cbc:TaxAmount>
      <cbc:RoundingAmount currencyID="${currencyID}">${line.totalWithVat.toFixed(2)}</cbc:RoundingAmount>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>${line.description}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>${(line.vatRate * 100).toFixed(2)}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${currencyID}">${line.unitPrice.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`).join("\n")}

</Invoice>`;
}
