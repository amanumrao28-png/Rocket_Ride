/**
 * Document Agent Service
 *
 * Performs OCR and structured entity extraction on sales receipts and invoices:
 * - Invoice / Order number
 * - Product brand, model, SKU
 * - Serial number (if printed on invoice)
 * - Purchase date & retailer / seller
 * - Price paid and currency
 *
 * MOCK / SWAPPABLE CONTRACT:
 * Drop in real multimodal OCR/Document LLM (Gemini 1.5 Pro / Textract / RocketRide OCR node)
 * without touching caller code.
 */

import { DocumentAgentResult } from "@/types";

export interface DocumentAgentInput {
  invoiceUrl?: string;
  pdfText?: string;
  filename?: string;
  claimId?: string;
}

export async function run(evidence: DocumentAgentInput): Promise<DocumentAgentResult> {
  const identifier = (
    evidence.invoiceUrl ||
    evidence.filename ||
    evidence.claimId ||
    evidence.pdfText ||
    ""
  ).toLowerCase();

  await new Promise((resolve) => setTimeout(resolve, 280));

  if (identifier.includes("1025") || identifier.includes("hp")) {
    return {
      agentName: "DOCUMENT",
      confidence: 0.97,
      invoiceFound: true,
      invoice_number: "INV-1025",
      orderNumber: "INV-1025",
      product: "HP Pavilion 14",
      brand: "HP",
      model: "Pavilion 14-dv2000",
      serial_number: "HP789012",
      purchase_date: "2025-10-05",
      purchaseDate: "2025-10-05",
      seller: "Best Buy Direct",
      retailer: "Best Buy Direct",
      price: 629.0,
      pricePaid: 629.0,
      currency: "USD",
      itemMatched: true,
      findings: [
        "Authorized Best Buy invoice verified.",
        "Purchase date 2025-10-05 falls within 12-month calendar window.",
        "Model HP Pavilion 14 matches customer claim filing.",
      ],
      analyzedAt: new Date().toISOString(),
    };
  }

  if (identifier.includes("1026") || identifier.includes("lenovo")) {
    return {
      agentName: "DOCUMENT",
      confidence: 0.99,
      invoiceFound: true,
      invoice_number: "INV-1026",
      orderNumber: "INV-1026",
      product: "Lenovo ThinkPad E14",
      brand: "Lenovo",
      model: "ThinkPad E14 Gen 4",
      serial_number: "LN345678",
      purchase_date: "2024-02-15",
      purchaseDate: "2024-02-15",
      seller: "OfficeMax Supplies",
      retailer: "OfficeMax Supplies",
      price: 899.0,
      pricePaid: 899.0,
      currency: "USD",
      itemMatched: true,
      findings: [
        "Legitimate invoice from authorized retailer OfficeMax.",
        "Purchase date February 15, 2024 (24 months elapsed since purchase).",
        "Serial LN345678 printed on purchase record.",
      ],
      analyzedAt: new Date().toISOString(),
    };
  }

  if (identifier.includes("1027") || identifier.includes("asus")) {
    return {
      agentName: "DOCUMENT",
      confidence: 0.94,
      invoiceFound: true,
      invoice_number: "INV-1027-X",
      orderNumber: "INV-1027-X",
      product: "Asus ZenBook 14 OLED",
      brand: "Asus",
      model: "ZenBook 14 OLED",
      serial_number: "AS901234",
      purchase_date: "2025-11-20",
      purchaseDate: "2025-11-20",
      seller: "MicroCenter Outlet",
      retailer: "MicroCenter Outlet",
      price: 849.0,
      pricePaid: 849.0,
      currency: "USD",
      itemMatched: true,
      findings: [
        "Invoice verified from MicroCenter Outlet.",
        "Purchase date 2025-11-20 is within 12-month period.",
        "Serial AS901234 extracted from invoice item description.",
      ],
      analyzedAt: new Date().toISOString(),
    };
  }

  // Default: Dell Inspiron 15 (CLM-1024)
  return {
    agentName: "DOCUMENT",
    confidence: 0.98,
    invoiceFound: true,
    invoice_number: "INV-1024",
    orderNumber: "INV-1024",
    product: "Dell Inspiron 15",
    brand: "Dell",
    model: "Inspiron 15 3520",
    serial_number: "DL123456",
    purchase_date: "2026-01-12",
    purchaseDate: "2026-01-12",
    seller: "ABC Electronics",
    retailer: "ABC Electronics",
    price: 749.99,
    pricePaid: 749.99,
    currency: "USD",
    itemMatched: true,
    findings: [
      "Original sales receipt from authorized retailer ABC Electronics verified.",
      "Serial number DL123456 matches line item.",
      "Purchase date 2026-01-12 within 12-month active warranty window.",
    ],
    analyzedAt: new Date().toISOString(),
  };
}
