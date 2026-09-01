/**
 * Fault Agent Service
 *
 * Evaluates customer complaint and diagnostic telemetry against hardware failure taxonomy:
 * - Identifies root cause category (Hardware Failure, User Accidental, Software, Cosmetic)
 * - Assesses severity (LOW, MEDIUM, HIGH)
 * - Flags whether fault is physical damage / impact related
 *
 * MOCK / SWAPPABLE CONTRACT:
 * Drop in real domain LLM (Gemini 1.5 Pro / Claude 3.5 Sonnet) or RocketRide classification node
 * without touching caller code.
 */

import { ClaimFileInfo, FaultAgentResult, VisionAgentResult } from "@/types";

export interface FaultAgentInput {
  complaint: string;
  diagnosticEvidence?: string | ClaimFileInfo | Record<string, unknown>;
  visionResult?: VisionAgentResult;
}

export async function run(
  complaint: string,
  diagnosticEvidence?: string | ClaimFileInfo | Record<string, unknown>,
  visionResult?: VisionAgentResult
): Promise<FaultAgentResult> {
  const text = (complaint || "").toLowerCase();
  const diagText =
    typeof diagnosticEvidence === "string"
      ? diagnosticEvidence.toLowerCase()
      : JSON.stringify(diagnosticEvidence || "").toLowerCase();

  await new Promise((resolve) => setTimeout(resolve, 250));

  // Scenario: ASUS Conflict (CLM-1027)
  if (text.includes("flickering") && (diagText.includes("shock") || text.includes("asus") || diagText.includes("sensor"))) {
    return {
      agentName: "FAULT",
      confidence: 0.74,
      issueCategory: "Mechanical Shock vs Hinge Defect Contradiction",
      fault: "Display Ribbon Cable & Hinge Micro-Fracture",
      severity: "HIGH",
      physical_damage_related: true,
      faultType: "HARDWARE_FAILURE",
      isCovered: false,
      wearAndTearDetected: false,
      findings: [
        "Diagnostic sensor telemetry registered high G-force acceleration shock on 2026-02-12.",
        "Diagnostic report flags physical shock to display ribbon cable.",
        "Unclear if hinge factory defect caused mechanical bind or drop caused fracture.",
      ],
      evidence: [
        "High-G sensor spike logged in onboard telemetry",
        "Ribbon cable transmission latency fluctuation",
      ],
      analyzedAt: new Date().toISOString(),
    };
  }

  // Scenario: HP Cracked Screen (CLM-1025)
  if (text.includes("cracked") || text.includes("spiderweb") || visionResult?.damageDetected) {
    return {
      agentName: "FAULT",
      confidence: 0.96,
      issueCategory: "Mechanical Impact Fracture",
      fault: "LCD Substrate Rupture from Point Load Impact",
      severity: "HIGH",
      physical_damage_related: true,
      faultType: "USER_ACCIDENTAL",
      isCovered: false,
      wearAndTearDetected: false,
      findings: [
        "Visual stress profile indicates external point load impact, not spontaneous panel stress.",
        "Accidental drop/pressure incident classified as user accidental damage.",
      ],
      evidence: [
        "Radiating glass crack originating from bezel edge",
        "Physical glass deformation profile",
      ],
      analyzedAt: new Date().toISOString(),
    };
  }

  // Scenario: Lenovo Battery (CLM-1026)
  if (text.includes("battery") || text.includes("charge") || text.includes("unplug")) {
    return {
      agentName: "FAULT",
      confidence: 0.92,
      issueCategory: "Battery Chemical Degradation / Cycle Depletion",
      fault: "Lithium-Ion Cathode Exhaustion",
      severity: "MEDIUM",
      physical_damage_related: false,
      faultType: "COSMETIC_WEAR",
      isCovered: false,
      wearAndTearDetected: true,
      findings: [
        "Battery health telemetry indicates 842 charge cycles and 22% remaining design capacity.",
        "Standard chemical wear over extended multi-year operational lifetime.",
      ],
      evidence: [
        "842 charge cycle count exceeds 500 cycle design threshold",
        "Low cell voltage under load",
      ],
      analyzedAt: new Date().toISOString(),
    };
  }

  // Default: Dell Display Backlight (CLM-1024)
  return {
    agentName: "FAULT",
    confidence: 0.93,
    issueCategory: "Display LED Backlight Driver Failure",
    fault: "Internal Backlight Inverter Transistor Failure",
    severity: "HIGH",
    physical_damage_related: false,
    faultType: "HARDWARE_FAILURE",
    isCovered: true,
    wearAndTearDetected: false,
    findings: [
      "Hardware telemetry confirms GPU output active with zero backlight PWM power.",
      "Failure pattern is characteristic of factory LED driver component failure.",
      "No customer software or firmware tampering detected.",
    ],
    evidence: [
      "GPU video output stream functioning (verified via HDMI diagnostic)",
      "Zero current draw on display LED rail",
    ],
    analyzedAt: new Date().toISOString(),
  };
}
