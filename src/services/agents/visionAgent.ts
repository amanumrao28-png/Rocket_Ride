/**
 * Vision Agent Service
 *
 * Inspects physical claim evidence (photos, video keyframes) for:
 * - Product detection and model identification
 * - Visible physical damage (cracks, liquid ingress, drops, punctures)
 * - Serial number OCR barcode/chassis match
 *
 * MOCK / SWAPPABLE CONTRACT:
 * Drop in real multimodal LLM (Gemini 1.5 Pro / GPT-4o Vision) or RocketRide vision node
 * without touching caller code.
 */

import { VisionAgentResult } from "@/types";

export interface VisionAgentInput {
  imageUrl?: string;
  videoUrl?: string;
  filename?: string;
  expectedSerialNumber?: string;
  complaintContext?: string;
}

export async function run(evidence: VisionAgentInput): Promise<VisionAgentResult> {
  const url = (evidence.imageUrl || evidence.videoUrl || evidence.filename || "").toLowerCase();

  // Simulated inference delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Determine physical damage profile based on evidence identifiers
  const hasCrackedScreen =
    url.includes("cracked") ||
    url.includes("damage") ||
    url.includes("dent") ||
    url.includes("1025") ||
    url.includes("1027");

  const isDellClean = url.includes("dell") || url.includes("1024") || url.includes("clean");
  const isLenovo = url.includes("lenovo") || url.includes("1026") || url.includes("battery");

  if (hasCrackedScreen && url.includes("1027")) {
    // Conflict scenario (Asus ZenBook 14)
    return {
      agentName: "VISION",
      confidence: 0.92,
      damageDetected: true,
      physical_damage: true,
      product_detected: true,
      visible_issue: "Hairline screen fracture and lower-left hinge dent",
      damageType: "PHYSICAL_IMPACT",
      serialNumberDetected: evidence.expectedSerialNumber || "AS901234",
      serialNumberMatch: true,
      findings: [
        "Cracked screen detected: hairline fracture radiating across bottom-left glass near hinge.",
        "Visible metal dent and scuffing on the magnesium hinge housing.",
        "Contradicts claim description of 'zero physical damage'.",
      ],
      evidence: [
        "Bottom-left display fracture line",
        "Hinge corner impact deformation",
      ],
      analyzedAt: new Date().toISOString(),
    };
  }

  if (hasCrackedScreen) {
    // Physical damage scenario (HP Pavilion 14)
    return {
      agentName: "VISION",
      confidence: 0.98,
      damageDetected: true,
      physical_damage: true,
      product_detected: true,
      visible_issue: "LCD panel glass shattered with internal ink bleed",
      damageType: "PHYSICAL_IMPACT",
      serialNumberDetected: evidence.expectedSerialNumber || "HP789012",
      serialNumberMatch: true,
      findings: [
        "Radial fracture cluster originating at upper-right bezel impact point.",
        "LCD glass substrate rupture with internal liquid crystal bleeding.",
        "Direct mechanical shock / crushing force detected on display assembly.",
      ],
      evidence: [
        "Radial shatter lines in top-right quadrant",
        "Liquid crystal leak blotches across active matrix",
      ],
      analyzedAt: new Date().toISOString(),
    };
  }

  if (isLenovo) {
    // Normal wear / battery scenario (Lenovo ThinkPad E14)
    return {
      agentName: "VISION",
      confidence: 0.91,
      damageDetected: false,
      physical_damage: false,
      product_detected: true,
      visible_issue: "Minor exterior scuffs (normal aging)",
      damageType: "NORMAL_WEAR",
      serialNumberDetected: evidence.expectedSerialNumber || "LN345678",
      serialNumberMatch: true,
      findings: [
        "Chassis is intact with no thermal warping or battery swelling observed.",
        "Surface scratches consistent with 2+ years of normal office usage.",
        "Serial barcode LN345678 verified.",
      ],
      evidence: [
        "No chassis swelling or battery bulge",
        "Hinges and display bezel intact",
      ],
      analyzedAt: new Date().toISOString(),
    };
  }

  // Default / Dell Pristine Hardware Failure scenario (Dell Inspiron 15)
  return {
    agentName: "VISION",
    confidence: 0.95,
    damageDetected: false,
    physical_damage: false,
    product_detected: true,
    visible_issue: "Unlit display panel; chassis intact",
    damageType: "NO_DAMAGE_SEEN",
    serialNumberDetected: evidence.expectedSerialNumber || "DL123456",
    serialNumberMatch: true,
    findings: [
      "Zero signs of impact trauma, denting, or casing deformation.",
      "Serial barcode DL123456 verified on underside casing sticker.",
      "Liquid contact indicator (LCI) pristine white (no water ingress).",
      "Glass panel is completely intact with no internal cracks.",
    ],
    evidence: [
      "Pristine LCD surface and bezel",
      "Undamaged serial tag DL123456",
      "Pristine LCI water indicator",
    ],
    analyzedAt: new Date().toISOString(),
  };
}
