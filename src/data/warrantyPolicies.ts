import { WarrantyPolicy } from "@/types";

/**
 * Standard Warranty Policies Database
 * Seeded with clear coverage and exclusion terms.
 */
export const SAMPLE_WARRANTY_POLICIES: WarrantyPolicy[] = [
  {
    id: "pol-laptop-standard",
    productCategory: "Laptop",
    warrantyPeriodMonths: 12,
    covered: [
      "Hardware Failure",
      "Manufacturing Defect",
      "Internal Component Failure",
      "Power Subsystem Malfunction",
      "Keyboard / Trackpad Factory Glitch",
    ],
    excluded: [
      "Physical Damage",
      "Liquid Damage",
      "Unauthorized Repair",
      "Accidental Drops & Crushed Screens",
      "Cosmetic Scratches & Normal Wear",
    ],
    requireOriginalInvoice: true,
    requireVisualProof: true,
  },
  {
    id: "pol-audio-standard",
    productCategory: "Audio",
    warrantyPeriodMonths: 24,
    covered: [
      "Driver failure / no sound",
      "Active Noise Cancellation malfunction",
      "Bluetooth connectivity failure",
      "Factory acoustic transducer defect",
    ],
    excluded: [
      "Physical water immersion / liquid ingress",
      "Cracked headband due to impact",
      "Unauthorized disassembly",
      "Normal cosmetic wear on earpads",
    ],
    requireOriginalInvoice: true,
    requireVisualProof: true,
  },
  {
    id: "pol-display-standard",
    productCategory: "Displays",
    warrantyPeriodMonths: 36,
    covered: [
      "Dead pixels (>3 bright pixels)",
      "Backlight bleed / panel failure",
      "Power supply failure",
      "Port failure (HDMI / DisplayPort)",
    ],
    excluded: [
      "Screen cracks / direct impact damage",
      "Power surge damage without surge protector",
      "Liquid ingress",
    ],
    requireOriginalInvoice: true,
    requireVisualProof: true,
  },
  {
    id: "pol-wearable-standard",
    productCategory: "Wearables",
    warrantyPeriodMonths: 12,
    covered: [
      "Optical heart rate sensor failure",
      "Touch screen unresponsiveness",
      "Charging pin corrosion under normal use",
    ],
    excluded: [
      "Deep water pressure immersion exceeding IP68 spec",
      "Cracked glass from drops",
      "Strap wear and tear",
    ],
    requireOriginalInvoice: true,
    requireVisualProof: true,
  },
];
