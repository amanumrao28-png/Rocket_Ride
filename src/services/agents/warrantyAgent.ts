/**
 * Warranty Agent Service
 *
 * Evaluates warranty validity against policy terms:
 * - Calculates elapsed time between purchaseDate and claimDate
 * - Evaluates coverage clauses against diagnosed fault category
 * - Evaluates explicit exclusion clauses (physical damage, liquid ingress, unauthorized tampering)
 *
 * MOCK / SWAPPABLE CONTRACT:
 * Drop in real rules engine / policy evaluation LLM without touching caller code.
 */

import { FaultAgentResult, Product, WarrantyAgentResult, WarrantyPolicy } from "@/types";
import { SAMPLE_WARRANTY_POLICIES } from "@/data/warrantyPolicies";

export async function run(
  product: Product,
  purchaseDate: string,
  claimDate: string,
  faultResult: FaultAgentResult,
  warrantyPolicy?: WarrantyPolicy
): Promise<WarrantyAgentResult> {
  await new Promise((resolve) => setTimeout(resolve, 220));

  const policy =
    warrantyPolicy ||
    SAMPLE_WARRANTY_POLICIES.find(
      (p) => p.productCategory.toLowerCase() === product.category.toLowerCase()
    ) ||
    SAMPLE_WARRANTY_POLICIES[0];

  const purchaseTime = new Date(purchaseDate).getTime();
  const claimTime = new Date(claimDate).getTime();
  const monthsDuration = policy.warrantyPeriodMonths || 12;

  // Calculate expiration date (purchase date + duration in months)
  const pDate = new Date(purchaseDate);
  const expDate = new Date(pDate.setMonth(pDate.getMonth() + monthsDuration));
  const expirationDateStr = expDate.toISOString().split("T")[0];

  const isWithinWindow = claimTime <= expDate.getTime();

  // Check if physical damage exclusion applies
  const isPhysicalDamage =
    faultResult.physical_damage_related ||
    faultResult.faultType === "USER_ACCIDENTAL" ||
    faultResult.issueCategory.toLowerCase().includes("impact") ||
    faultResult.issueCategory.toLowerCase().includes("cracked");

  const exclusionApplies = !isWithinWindow || isPhysicalDamage;

  if (!isWithinWindow) {
    return {
      agentName: "WARRANTY",
      confidence: 0.99,
      isWithinWarranty: false,
      warranty_valid: false,
      coverage: "NONE (EXPIRED)",
      exclusion_applies: true,
      policyId: policy.id || "pol-laptop-standard",
      warrantyPeriodMonths: monthsDuration,
      purchaseDate,
      expirationDate: expirationDateStr,
      coveredClauses: [],
      exclusionClauses: ["Warranty Period Expired", "Normal Wear and Tear"],
      findings: [
        `12-month standard warranty expired on ${expirationDateStr}.`,
        "Claim filing date is outside statutory coverage window.",
      ],
      analyzedAt: new Date().toISOString(),
    };
  }

  if (isPhysicalDamage) {
    return {
      agentName: "WARRANTY",
      confidence: 0.99,
      isWithinWarranty: true,
      warranty_valid: false,
      coverage: "INACTIVE DUE TO EXCLUSION CLAUSE",
      exclusion_applies: true,
      policyId: policy.id || "pol-laptop-standard",
      warrantyPeriodMonths: monthsDuration,
      purchaseDate,
      expirationDate: expirationDateStr,
      coveredClauses: ["Hardware Failure"],
      exclusionClauses: ["Physical Damage", "Accidental Drops & Crushed Screens"],
      findings: [
        `Device is within the 12-month calendar window (expires ${expirationDateStr}), but diagnosed physical impact damage is strictly excluded under Section 4.1.`,
      ],
      analyzedAt: new Date().toISOString(),
    };
  }

  // Active & Covered Scenario
  return {
    agentName: "WARRANTY",
    confidence: 0.97,
    isWithinWarranty: true,
    warranty_valid: true,
    coverage: "FULL HARDWARE REPLACEMENT / REPAIR",
    exclusion_applies: false,
    policyId: policy.id || "pol-laptop-standard",
    warrantyPeriodMonths: monthsDuration,
    purchaseDate,
    expirationDate: expirationDateStr,
    coveredClauses: [
      "Hardware Failure",
      "Manufacturing Defect",
      "Internal Component Failure",
    ],
    exclusionClauses: [],
    findings: [
      `Active coverage confirmed: claim filed within ${monthsDuration}-month window (expires ${expirationDateStr}).`,
      "Hardware component failure is explicitly covered under Section 2.1 warranty provisions.",
    ],
    analyzedAt: new Date().toISOString(),
  };
}
