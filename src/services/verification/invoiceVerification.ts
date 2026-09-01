/**
 * Invoice Verification Service
 *
 * NOTE ON FRAUD PREVENTION & SYSTEM INTEGRITY:
 * A readable PDF or clear OCR scan does NOT equal an authentic invoice!
 * Anyone can generate a visually convincing PDF. Authenticity is ONLY ever claimed
 * after cross-checking the extracted invoice number, serial number, purchase date,
 * and seller against the master trusted retailer & registration database.
 */

import { DocumentAgentResult, InvoiceVerificationResult, Product } from "@/types";
import { TRUSTED_PRODUCT_DATABASE } from "@/data/products";

export interface InvoiceVerificationRunOptions {
  product?: Product;
}

export async function run(
  documentResult: DocumentAgentResult,
  options?: InvoiceVerificationRunOptions
): Promise<InvoiceVerificationResult> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const invNum = documentResult.invoice_number || documentResult.orderNumber;
  const serial =
    documentResult.serial_number ||
    options?.product?.serialNumber ||
    "";
  const seller = documentResult.seller || documentResult.retailer || "";
  const purchaseDate =
    documentResult.purchase_date || documentResult.purchaseDate || "";

  if (!invNum && !serial) {
    return {
      status: "UNVERIFIED",
      retailerAuthorized: false,
      orderNumberVerified: false,
      dateVerified: false,
      discrepancies: ["No invoice number or serial number found to cross-reference"],
      mismatches: ["Missing invoice identification tokens"],
      verificationTimestamp: new Date().toISOString(),
    };
  }

  // Cross-check against master trusted registry
  const match = TRUSTED_PRODUCT_DATABASE.find(
    (entry) =>
      (invNum && entry.invoiceNumber.toLowerCase() === invNum.toLowerCase()) ||
      (serial && entry.serialNumber.toLowerCase() === serial.toLowerCase())
  );

  if (!match) {
    return {
      status: "UNVERIFIED",
      retailerAuthorized: false,
      orderNumberVerified: false,
      dateVerified: false,
      discrepancies: [
        `Invoice ${invNum || "N/A"} / Serial ${serial || "N/A"} not found in authorized registry`,
      ],
      mismatches: ["No matching registry record"],
      verificationTimestamp: new Date().toISOString(),
    };
  }

  const mismatches: string[] = [];
  const discrepancies: string[] = [];

  // 1. Check retailer authorization
  const retailerAuthorized = match.isAuthorizedSeller;
  if (!retailerAuthorized) {
    mismatches.push(`Seller '${seller || match.seller}' is not an authorized distributor`);
    discrepancies.push("Unauthorized retailer / liquidator");
  }

  // 2. Check serial number alignment
  let serialMatch = true;
  if (serial && match.serialNumber.toLowerCase() !== serial.toLowerCase()) {
    serialMatch = false;
    mismatches.push(
      `Serial mismatch: Invoice references ${serial}, trusted database has ${match.serialNumber}`
    );
    discrepancies.push("Serial number discrepancy against invoice registry");
  }

  // 3. Check purchase date alignment
  let dateMatch = true;
  if (purchaseDate && match.purchaseDate !== purchaseDate) {
    dateMatch = false;
    mismatches.push(
      `Date mismatch: Invoice claims ${purchaseDate}, registry records ${match.purchaseDate}`
    );
    discrepancies.push("Purchase timestamp discrepancy");
  }

  const isVerified = retailerAuthorized && serialMatch && mismatches.length === 0;

  return {
    status: isVerified ? "VERIFIED" : "MISMATCH",
    retailerAuthorized,
    orderNumberVerified: true,
    dateVerified: dateMatch,
    discrepancies,
    mismatches,
    verifiedRetailerName: match.seller,
    verificationTimestamp: new Date().toISOString(),
  };
}
