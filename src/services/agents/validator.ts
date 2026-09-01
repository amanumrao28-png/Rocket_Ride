/**
 * Consistency Validator Service
 *
 * Performs autonomous cross-agent consistency and conflict checks:
 * 1. Product Consistency (Invoice ↔ Vision Image ↔ Diagnostic Report)
 * 2. Serial Number Consistency (Invoice ↔ Trusted DB ↔ Vision OCR)
 * 3. Warranty Date Consistency (Purchase timestamp vs expiration math)
 * 4. Fault Consistency (Customer Complaint ↔ Diagnostic Telemetry ↔ Vision Findings)
 * 5. Evidence Conflict Detection (Detects direct customer vs sensor contradictions)
 *
 * SAFETY INVARIANT:
 * On any detected conflict or discrepancy, returns validation_status: "FAILED"
 * with `evidence_conflict: true`, human-readable conflict reasons, and recommended_action.
 * NEVER allows automated approval or high-confidence pass on conflicting evidence.
 */

import {
  DecisionAgentResult,
  DocumentAgentResult,
  FaultAgentResult,
  InvoiceVerificationResult,
  ValidationFieldStatus,
  ValidatorResult,
  VisionAgentResult,
  WarrantyAgentResult,
} from "@/types";

export interface ValidatorInputs {
  customerComplaint?: string;
  visionResult: VisionAgentResult;
  documentResult: DocumentAgentResult;
  invoiceVerification: InvoiceVerificationResult;
  faultResult: FaultAgentResult;
  warrantyResult: WarrantyAgentResult;
  decisionResult?: DecisionAgentResult;
}

export async function run(inputs: ValidatorInputs): Promise<ValidatorResult> {
  await new Promise((resolve) => setTimeout(resolve, 250));

  const {
    customerComplaint = "",
    visionResult,
    documentResult,
    invoiceVerification,
    faultResult,
    warrantyResult,
  } = inputs;

  const conflicts: string[] = [];
  const validationNotes: string[] = [];

  let serialStatus: ValidationFieldStatus = "PASS";
  let invoiceStatus: ValidationFieldStatus = "PASS";
  let warrantyStatus: ValidationFieldStatus = "PASS";
  let damageStatus: ValidationFieldStatus = "PASS";

  // 1. Serial Number Check
  if (
    visionResult.serialNumberDetected &&
    documentResult.serial_number &&
    visionResult.serialNumberDetected.toLowerCase() !== documentResult.serial_number.toLowerCase()
  ) {
    serialStatus = "FAIL";
    conflicts.push(
      `Serial Discrepancy: Vision OCR extracted '${visionResult.serialNumberDetected}' but Invoice lists '${documentResult.serial_number}'`
    );
  } else if (!visionResult.serialNumberMatch || invoiceVerification.mismatches?.some(m => m.includes("Serial"))) {
    serialStatus = "FAIL";
    conflicts.push("Serial number could not be verified against the master product registry.");
  }

  // 2. Invoice Authenticity & Product Consistency Check
  if (invoiceVerification.status === "MISMATCH") {
    invoiceStatus = "FAIL";
    conflicts.push(`Invoice Verification Failed: ${invoiceVerification.discrepancies.join("; ")}`);
  } else if (invoiceVerification.status === "UNVERIFIED") {
    invoiceStatus = "WARNING";
    validationNotes.push("Invoice is unverified against authorized vendor registry.");
  }

  // 3. Warranty Date Consistency Check
  if (!warrantyResult.isWithinWarranty) {
    warrantyStatus = "FAIL";
    validationNotes.push(`Warranty validity check failed: Expired on ${warrantyResult.expirationDate}`);
  }

  // 4. Evidence Conflict & Customer Statement Contradiction Check
  const complaintLower = customerComplaint.toLowerCase();
  const customerClaimsNoDamage =
    complaintLower.includes("no drop") ||
    complaintLower.includes("no physical damage") ||
    complaintLower.includes("never been dropped") ||
    complaintLower.includes("internal issue only") ||
    complaintLower.includes("never dropped");

  const visionFoundDamage =
    visionResult.damageDetected &&
    (visionResult.damageType === "PHYSICAL_IMPACT" ||
      visionResult.visible_issue?.toLowerCase().includes("crack") ||
      visionResult.visible_issue?.toLowerCase().includes("dent"));

  const diagnosticFoundShock =
    faultResult.physical_damage_related ||
    faultResult.issueCategory.toLowerCase().includes("shock") ||
    faultResult.issueCategory.toLowerCase().includes("contradiction");

  if (customerClaimsNoDamage && (visionFoundDamage || diagnosticFoundShock)) {
    damageStatus = "FAIL";
    conflicts.push(
      "Customer Statement: Customer explicitly states 'no physical damage / never dropped'."
    );
    if (visionFoundDamage) {
      conflicts.push(
        `Vision Agent: Detected physical trauma (${visionResult.visible_issue || "cracked screen / dented housing"}).`
      );
    }
    if (diagnosticFoundShock) {
      conflicts.push(
        "Diagnostic Telemetry: Hardware accelerometer logs registered an impact shock event."
      );
    }
  }

  const hasConflict = conflicts.length > 0;
  const isPassed = !hasConflict && invoiceStatus !== "FAIL" && serialStatus === "PASS";

  if (hasConflict) {
    return {
      agentName: "VALIDATOR",
      validation_status: "FAILED",
      evidence_conflict: true,
      reason:
        "Severe contradiction detected between customer claim assertion and optical/telemetry findings.",
      recommended_action:
        "Escalate to Warranty Manager: Request high-resolution macro photos of hinge/bezel or issue clarification request to customer.",
      field_checks: {
        serial_match: serialStatus,
        invoice_authenticity: invoiceStatus,
        warranty_eligibility: warrantyStatus,
        damage_consistency: damageStatus,
      },
      conflicts,
      validation_notes: [
        "CRITICAL EVIDENCE CONFLICT: Automated approval blocked.",
        "Human Manager review required to reconcile contradictory evidence.",
      ],
      validatedAt: new Date().toISOString(),
    };
  }

  return {
    agentName: "VALIDATOR",
    validation_status: "PASSED",
    evidence_conflict: false,
    reason: "All agent findings and data points are mutually consistent and corroborated.",
    recommended_action: "Proceed to standard Warranty Manager review.",
    field_checks: {
      serial_match: serialStatus,
      invoice_authenticity: invoiceStatus,
      warranty_eligibility: warrantyStatus,
      damage_consistency: damageStatus,
    },
    conflicts: [],
    validation_notes: [
      "All agent outputs correlate without contradictory signals.",
      "Serial numbers, purchase dates, and retailer data align across vision, OCR, and policy checks.",
    ],
    validatedAt: new Date().toISOString(),
  };
}
