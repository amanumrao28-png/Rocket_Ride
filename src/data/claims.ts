import { Claim } from "@/types";

/**
 * Seeded Demo Claims for Warranty & Returns Arbiter
 * Represents 4 key workflow and evaluation scenarios:
 * 1. CLM-1024: Valid Hardware Failure (REPLACE, confidence 94%, validation PASSED)
 * 2. CLM-1025: Physical Damage Exclusion (DENY, confidence 97%, validation PASSED)
 * 3. CLM-1026: Expired Warranty Window (DENY, confidence 96%, validation PASSED)
 * 4. CLM-1027: Evidence Conflict / Discrepancy (REQUEST_MORE_INFORMATION, validation FAILED, conflict true)
 */

export const SAMPLE_CLAIMS: Claim[] = [
  // =========================================================================
  // SCENARIO 1: CLM-1024 - Dell Laptop Display Failure (Valid Replacement)
  // =========================================================================
  {
    claimId: "CLM-1024",
    customer: {
      name: "Sarah Jenkins",
      email: "sarah.jenkins@example.com",
      phone: "+1 (555) 345-6789",
    },
    product: {
      category: "Laptop",
      brand: "Dell",
      model: "Inspiron 15 3520",
      serialNumber: "DL123456",
    },
    complaint:
      "Display backlight completely failed during normal usage. Screen stays dark while external HDMI monitor works properly. No drops, spills, or physical impacts.",
    files: {
      productImage: {
        url: "/mock/evidence/dell_screen_clean.jpg",
        filename: "dell_front_bezel.jpg",
        fileSize: 2150000,
        mimeType: "image/jpeg",
        uploadedAt: "2026-02-14T09:12:00Z",
      },
      invoice: {
        url: "/mock/evidence/invoice_inv1024.pdf",
        filename: "invoice_INV-1024_ABC_Electronics.pdf",
        fileSize: 345000,
        mimeType: "application/pdf",
        uploadedAt: "2026-02-14T09:13:00Z",
      },
      diagnosticReport: {
        url: "/mock/evidence/dell_hardware_diagnostics.json",
        filename: "dell_epsa_diagnostic_log.json",
        fileSize: 58000,
        mimeType: "application/json",
        uploadedAt: "2026-02-14T09:14:00Z",
      },
    },
    status: "UNDER_REVIEW",
    submittedAt: "2026-02-14T09:15:00Z",
    agentResults: {
      vision: {
        agentName: "VISION",
        confidence: 0.95,
        damageDetected: false,
        damageType: "NO_DAMAGE_SEEN",
        serialNumberDetected: "DL123456",
        serialNumberMatch: true,
        findings: [
          "Zero signs of impact trauma, denting, or casing deformation.",
          "Serial barcode DL123456 verified on underside casing sticker.",
          "Liquid contact indicator (LCI) pristine white (no water ingress).",
          "Glass panel is completely intact with no internal cracks.",
        ],
        analyzedAt: "2026-02-14T09:16:10Z",
      },
      document: {
        agentName: "DOCUMENT",
        confidence: 0.98,
        invoiceFound: true,
        purchaseDate: "2026-01-12",
        retailer: "ABC Electronics",
        orderNumber: "INV-1024",
        itemMatched: true,
        pricePaid: 749.99,
        currency: "USD",
        findings: [
          "Original sales receipt from authorized retailer ABC Electronics verified.",
          "Serial number DL123456 matches line item.",
          "Customer name Sarah Jenkins matches invoice billing address.",
        ],
        analyzedAt: "2026-02-14T09:16:15Z",
      },
      invoiceVerification: {
        status: "VERIFIED",
        retailerAuthorized: true,
        orderNumberVerified: true,
        dateVerified: true,
        discrepancies: [],
        verifiedRetailerName: "ABC Electronics",
        verificationTimestamp: "2026-02-14T09:16:20Z",
      },
      fault: {
        agentName: "FAULT",
        confidence: 0.93,
        issueCategory: "Display LED Backlight Driver Failure",
        faultType: "HARDWARE_FAILURE",
        isCovered: true,
        wearAndTearDetected: false,
        findings: [
          "Hardware telemetry confirms GPU output active with zero backlight PWM power.",
          "Failure pattern is characteristic of factory LED driver component failure.",
          "No customer software or firmware tampering detected.",
        ],
        analyzedAt: "2026-02-14T09:16:25Z",
      },
      warranty: {
        agentName: "WARRANTY",
        confidence: 0.97,
        isWithinWarranty: true,
        policyId: "pol-laptop-standard",
        warrantyPeriodMonths: 12,
        purchaseDate: "2026-01-12",
        expirationDate: "2027-01-12",
        coveredClauses: [
          "Hardware Failure",
          "Manufacturing Defect",
          "Internal Component Failure",
        ],
        exclusionClauses: [],
        findings: [
          "Claim filed within 1 month of purchase (11 months remaining on 12-month policy).",
          "Hardware component failure covered under Section 2.1 warranty provisions.",
        ],
        analyzedAt: "2026-02-14T09:16:30Z",
      },
    },
    validation: {
      agentName: "VALIDATOR",
      validation_status: "PASSED",
      evidence_conflict: false,
      field_checks: {
        serial_match: "PASS",
        invoice_authenticity: "PASS",
        warranty_eligibility: "PASS",
        damage_consistency: "PASS",
      },
      conflicts: [],
      validation_notes: [
        "All 5 agent outputs correlate without contradictory findings.",
        "Serial numbers, purchase dates, and retailer data align across vision, OCR, and policy checks.",
        "Diagnostic log matches complaint and visual findings.",
      ],
      validatedAt: "2026-02-14T09:16:35Z",
    },
    recommendation: {
      agentName: "DECISION",
      recommendation: "REPLACE",
      confidence: 0.94,
      summary:
        "Valid invoice from ABC Electronics, authentic serial number DL123456, zero physical damage detected, and hardware backlight failure is fully covered under the 12-month standard policy.",
      keyEvidence: [
        "Verified invoice INV-1024 from authorized retailer ABC Electronics",
        "Vision inspection confirmed zero impact trauma or liquid ingress",
        "Hardware diagnostic confirmed spontaneous backlight power failure",
        "Claim filed 1 month into 12-month active warranty window",
      ],
      policyBasis: "Laptop Policy Sec 2.1 — Component Defect Replacement",
      suggestedRemedy: "REPLACE",
      disclaimer:
        "AI RECOMMENDATION ONLY — REQUIRES HUMAN MANAGER FINAL APPROVAL",
      generatedAt: "2026-02-14T09:16:40Z",
    },
    updatedAt: "2026-02-14T09:16:40Z",
  },

  // =========================================================================
  // SCENARIO 2: CLM-1025 - HP Laptop Cracked Screen (Physical Damage Exclusion)
  // =========================================================================
  {
    claimId: "CLM-1025",
    customer: {
      name: "Robert Chen",
      email: "robert.chen@example.com",
      phone: "+1 (555) 789-0123",
    },
    product: {
      category: "Laptop",
      brand: "HP",
      model: "Pavilion 14-dv2000",
      serialNumber: "HP789012",
    },
    complaint:
      "Opened laptop after a business trip and the display shows spiderweb glass cracks with black ink pools on the right side.",
    files: {
      productImage: {
        url: "/mock/evidence/hp_cracked_screen.jpg",
        filename: "hp_screen_damage.jpg",
        fileSize: 3200000,
        mimeType: "image/jpeg",
        uploadedAt: "2026-02-15T11:00:00Z",
      },
      invoice: {
        url: "/mock/evidence/invoice_inv1025.pdf",
        filename: "invoice_INV-1025_BestBuy.pdf",
        fileSize: 290000,
        mimeType: "application/pdf",
        uploadedAt: "2026-02-15T11:01:00Z",
      },
    },
    status: "UNDER_REVIEW",
    submittedAt: "2026-02-15T11:05:00Z",
    agentResults: {
      vision: {
        agentName: "VISION",
        confidence: 0.98,
        damageDetected: true,
        damageType: "PHYSICAL_IMPACT",
        serialNumberDetected: "HP789012",
        serialNumberMatch: true,
        findings: [
          "Radial fracture cluster originating at upper-right bezel impact point.",
          "LCD glass substrate rupture with internal liquid crystal bleeding.",
          "Direct mechanical shock / crushing force detected on display assembly.",
        ],
        analyzedAt: "2026-02-15T11:06:10Z",
      },
      document: {
        agentName: "DOCUMENT",
        confidence: 0.97,
        invoiceFound: true,
        purchaseDate: "2025-10-05",
        retailer: "Best Buy Direct",
        orderNumber: "INV-1025",
        itemMatched: true,
        pricePaid: 629.0,
        currency: "USD",
        findings: [
          "Authorized Best Buy invoice verified.",
          "Purchase date 2025-10-05 falls within 12-month calendar window.",
        ],
        analyzedAt: "2026-02-15T11:06:15Z",
      },
      invoiceVerification: {
        status: "VERIFIED",
        retailerAuthorized: true,
        orderNumberVerified: true,
        dateVerified: true,
        discrepancies: [],
        verifiedRetailerName: "Best Buy Direct",
        verificationTimestamp: "2026-02-15T11:06:20Z",
      },
      fault: {
        agentName: "FAULT",
        confidence: 0.96,
        issueCategory: "Mechanical Impact Fracture",
        faultType: "USER_ACCIDENTAL",
        isCovered: false,
        wearAndTearDetected: false,
        findings: [
          "Visual stress profile indicates external point load impact, not spontaneous panel stress.",
          "Accidental drop/pressure incident classified as user accidental damage.",
        ],
        analyzedAt: "2026-02-15T11:06:25Z",
      },
      warranty: {
        agentName: "WARRANTY",
        confidence: 0.99,
        isWithinWarranty: true,
        policyId: "pol-laptop-standard",
        warrantyPeriodMonths: 12,
        purchaseDate: "2025-10-05",
        expirationDate: "2026-10-05",
        coveredClauses: ["Hardware Failure"],
        exclusionClauses: ["Physical Damage", "Accidental Drops & Crushed Screens"],
        findings: [
          "Active warranty window (4 months remaining), but fault is explicitly excluded under Section 4.1 (Physical Damage).",
        ],
        analyzedAt: "2026-02-15T11:06:30Z",
      },
    },
    validation: {
      agentName: "VALIDATOR",
      validation_status: "PASSED",
      evidence_conflict: false,
      field_checks: {
        serial_match: "PASS",
        invoice_authenticity: "PASS",
        warranty_eligibility: "FAIL",
        damage_consistency: "PASS",
      },
      conflicts: [],
      validation_notes: [
        "Vision findings of physical impact align with FaultAgent accidental classification and WarrantyAgent exclusion clause.",
        "No contradictory evidence detected.",
      ],
      validatedAt: "2026-02-15T11:06:35Z",
    },
    recommendation: {
      agentName: "DECISION",
      recommendation: "DENY",
      confidence: 0.97,
      summary:
        "Physical screen cracking and substrate rupture detected. Policy explicitly excludes physical and accidental damage from standard warranty coverage.",
      keyEvidence: [
        "Vision analysis confirms mechanical impact fracture point and LCD bleeding",
        "Policy Section 4.1 explicitly excludes accidental & physical impact damage",
        "Customer is eligible for out-of-warranty screen replacement fee quote ($189)",
      ],
      policyBasis: "Laptop Policy Sec 4.1 — Accidental & Physical Impact Exclusions",
      suggestedRemedy: "DENY",
      disclaimer:
        "AI RECOMMENDATION ONLY — REQUIRES HUMAN MANAGER FINAL APPROVAL",
      generatedAt: "2026-02-15T11:06:40Z",
    },
    updatedAt: "2026-02-15T11:06:40Z",
  },

  // =========================================================================
  // SCENARIO 3: CLM-1026 - Lenovo Laptop Battery Failure (Warranty Expired)
  // =========================================================================
  {
    claimId: "CLM-1026",
    customer: {
      name: "Daniel Morales",
      email: "daniel.morales@example.com",
      phone: "+1 (555) 456-7890",
    },
    product: {
      category: "Laptop",
      brand: "Lenovo",
      model: "ThinkPad E14 Gen 4",
      serialNumber: "LN345678",
    },
    complaint:
      "Battery only holds charge for 10 minutes and laptop shuts off immediately upon unplugging AC adapter.",
    files: {
      productImage: {
        url: "/mock/evidence/lenovo_battery_test.jpg",
        filename: "lenovo_laptop_battery_status.jpg",
        fileSize: 1850000,
        mimeType: "image/jpeg",
        uploadedAt: "2026-02-16T14:30:00Z",
      },
      invoice: {
        url: "/mock/evidence/invoice_inv1026.pdf",
        filename: "invoice_INV-1026_OfficeMax.pdf",
        fileSize: 310000,
        mimeType: "application/pdf",
        uploadedAt: "2026-02-16T14:31:00Z",
      },
      diagnosticReport: {
        url: "/mock/evidence/lenovo_battery_report.html",
        filename: "windows_battery_report_LN345678.html",
        fileSize: 45000,
        mimeType: "text/html",
        uploadedAt: "2026-02-16T14:32:00Z",
      },
    },
    status: "UNDER_REVIEW",
    submittedAt: "2026-02-16T14:35:00Z",
    agentResults: {
      vision: {
        agentName: "VISION",
        confidence: 0.91,
        damageDetected: false,
        damageType: "NORMAL_WEAR",
        serialNumberDetected: "LN345678",
        serialNumberMatch: true,
        findings: [
          "Chassis is intact with no thermal warping or battery swelling observed.",
          "Surface scratches consistent with 2+ years of normal office usage.",
          "Serial barcode LN345678 verified.",
        ],
        analyzedAt: "2026-02-16T14:36:10Z",
      },
      document: {
        agentName: "DOCUMENT",
        confidence: 0.99,
        invoiceFound: true,
        purchaseDate: "2024-02-15",
        retailer: "OfficeMax Supplies",
        orderNumber: "INV-1026",
        itemMatched: true,
        pricePaid: 899.0,
        currency: "USD",
        findings: [
          "Legitimate invoice from authorized retailer OfficeMax.",
          "Purchase date February 15, 2024 (24 months elapsed since purchase).",
        ],
        analyzedAt: "2026-02-16T14:36:15Z",
      },
      invoiceVerification: {
        status: "VERIFIED",
        retailerAuthorized: true,
        orderNumberVerified: true,
        dateVerified: true,
        discrepancies: ["Purchase date older than 12-month standard warranty window"],
        verifiedRetailerName: "OfficeMax Supplies",
        verificationTimestamp: "2026-02-16T14:36:20Z",
      },
      fault: {
        agentName: "FAULT",
        confidence: 0.92,
        issueCategory: "Battery Chemical Degradation / Cycle Depletion",
        faultType: "COSMETIC_WEAR",
        isCovered: false,
        wearAndTearDetected: true,
        findings: [
          "Battery health report indicates 842 charge cycles and 22% remaining design capacity.",
          "Standard chemical wear over extended multi-year operational lifetime.",
        ],
        analyzedAt: "2026-02-16T14:36:25Z",
      },
      warranty: {
        agentName: "WARRANTY",
        confidence: 0.99,
        isWithinWarranty: false,
        policyId: "pol-laptop-standard",
        warrantyPeriodMonths: 12,
        purchaseDate: "2024-02-15",
        expirationDate: "2025-02-15",
        coveredClauses: [],
        exclusionClauses: [
          "Warranty Period Expired",
          "Cosmetic Scratches & Normal Wear",
        ],
        findings: [
          "12-month warranty expired on February 15, 2025 (12 months past expiration).",
        ],
        analyzedAt: "2026-02-16T14:36:30Z",
      },
    },
    validation: {
      agentName: "VALIDATOR",
      validation_status: "PASSED",
      evidence_conflict: false,
      field_checks: {
        serial_match: "PASS",
        invoice_authenticity: "PASS",
        warranty_eligibility: "FAIL",
        damage_consistency: "PASS",
      },
      conflicts: [],
      validation_notes: [
        "Document OCR date, invoice verification, and warranty date calculation unanimously confirm expired policy.",
      ],
      validatedAt: "2026-02-16T14:36:35Z",
    },
    recommendation: {
      agentName: "DECISION",
      recommendation: "DENY",
      confidence: 0.96,
      summary:
        "The 12-month manufacturer warranty expired on February 15, 2025. Standard battery cycle wear on a 2-year-old device cannot be approved under expired warranty.",
      keyEvidence: [
        "Verified invoice purchase date February 15, 2024",
        "12-month warranty expired 12 months prior to claim filing",
        "Battery report shows 842 cycles (expected normal wear)",
        "Customer offered discounted battery replacement service ($89)",
      ],
      policyBasis: "Laptop Policy Sec 1.0 — 12-Month Coverage Limitation",
      suggestedRemedy: "DENY",
      disclaimer:
        "AI RECOMMENDATION ONLY — REQUIRES HUMAN MANAGER FINAL APPROVAL",
      generatedAt: "2026-02-16T14:36:40Z",
    },
    updatedAt: "2026-02-16T14:36:40Z",
  },

  // =========================================================================
  // SCENARIO 4: CLM-1027 - Evidence Conflict Scenario (Customer vs Vision vs Diagnostic)
  // =========================================================================
  {
    claimId: "CLM-1027",
    customer: {
      name: "Priya Patel",
      email: "priya.patel@example.com",
      phone: "+1 (555) 901-2345",
    },
    product: {
      category: "Laptop",
      brand: "Asus",
      model: "ZenBook 14 OLED",
      serialNumber: "AS901234",
    },
    complaint:
      "Screen is flickering and showing artifacts. Device has never been dropped, knocked, or physically damaged in any way. Purely an internal motherboard issue.",
    files: {
      productImage: {
        url: "/mock/evidence/asus_screen_hinge_dent.jpg",
        filename: "asus_zenbook_hinge_corner.jpg",
        fileSize: 2800000,
        mimeType: "image/jpeg",
        uploadedAt: "2026-02-17T16:00:00Z",
      },
      invoice: {
        url: "/mock/evidence/invoice_inv1027x.pdf",
        filename: "invoice_INV-1027-X_MicroCenter.pdf",
        fileSize: 320000,
        mimeType: "application/pdf",
        uploadedAt: "2026-02-17T16:01:00Z",
      },
      diagnosticReport: {
        url: "/mock/evidence/asus_sensor_log.json",
        filename: "asus_onboard_sensor_log.json",
        fileSize: 62000,
        mimeType: "application/json",
        uploadedAt: "2026-02-17T16:02:00Z",
      },
    },
    status: "NEEDS_MORE_EVIDENCE",
    submittedAt: "2026-02-17T16:05:00Z",
    agentResults: {
      vision: {
        agentName: "VISION",
        confidence: 0.92,
        damageDetected: true,
        damageType: "PHYSICAL_IMPACT",
        serialNumberDetected: "AS901234",
        serialNumberMatch: true,
        findings: [
          "Cracked screen detected: hairline fracture radiating across bottom-left glass near hinge.",
          "Visible metal dent and scuffing on the magnesium hinge housing.",
          "Contradicts claim description of 'zero physical damage'.",
        ],
        analyzedAt: "2026-02-17T16:06:10Z",
      },
      document: {
        agentName: "DOCUMENT",
        confidence: 0.94,
        invoiceFound: true,
        purchaseDate: "2025-11-20",
        retailer: "MicroCenter Outlet",
        orderNumber: "INV-1027-X",
        itemMatched: true,
        pricePaid: 849.0,
        currency: "USD",
        findings: [
          "Invoice verified from MicroCenter Outlet.",
          "Purchase date 2025-11-20 is within 12-month period.",
        ],
        analyzedAt: "2026-02-17T16:06:15Z",
      },
      invoiceVerification: {
        status: "VERIFIED",
        retailerAuthorized: true,
        orderNumberVerified: true,
        dateVerified: true,
        discrepancies: [],
        verifiedRetailerName: "MicroCenter Outlet",
        verificationTimestamp: "2026-02-17T16:06:20Z",
      },
      fault: {
        agentName: "FAULT",
        confidence: 0.74,
        issueCategory: "Mechanical Shock vs Hinge Defect Contradiction",
        faultType: "HARDWARE_FAILURE",
        isCovered: false,
        wearAndTearDetected: false,
        findings: [
          "Diagnostic sensor telemetry registered high G-force acceleration shock on 2026-02-12.",
          "Diagnostic report flags physical shock to display ribbon cable.",
          "Unclear if hinge factory defect caused mechanical bind or drop caused fracture.",
        ],
        analyzedAt: "2026-02-17T16:06:25Z",
      },
      warranty: {
        agentName: "WARRANTY",
        confidence: 0.88,
        isWithinWarranty: true,
        policyId: "pol-laptop-standard",
        warrantyPeriodMonths: 12,
        purchaseDate: "2025-11-20",
        expirationDate: "2026-11-20",
        coveredClauses: ["Manufacturing Defect", "Hardware Failure"],
        exclusionClauses: ["Physical Damage"],
        findings: [
          "Calendar window is active, but coverage depends entirely on whether damage is accidental impact (excluded) or spontaneous hinge torque failure (covered).",
        ],
        analyzedAt: "2026-02-17T16:06:30Z",
      },
    },
    validation: {
      agentName: "VALIDATOR",
      validation_status: "FAILED",
      evidence_conflict: true,
      field_checks: {
        serial_match: "PASS",
        invoice_authenticity: "PASS",
        warranty_eligibility: "WARNING",
        damage_consistency: "FAIL",
      },
      conflicts: [
        "Customer Statement: Customer insists 'no drops or physical damage in any way, internal issue only'.",
        "Vision Agent: Identifies hairline glass fracture and dented hinge corner.",
        "Diagnostic Sensor Report: Registers high-G physical impact shock event on 2026-02-12.",
      ],
      validation_notes: [
        "CRITICAL EVIDENCE CONFLICT: Direct contradiction between customer claim statement and optical/sensor findings.",
        "Automated decision is blocked. Human manager must review close-up hinge inspection or request customer clarify impact event.",
      ],
      validatedAt: "2026-02-17T16:06:35Z",
    },
    recommendation: {
      agentName: "DECISION",
      recommendation: "REQUEST_MORE_INFORMATION",
      confidence: 0.68,
      summary:
        "Evidence Conflict Detected: Customer claims no physical damage occurred, but Vision Agent detected a cracked screen/dented hinge and Diagnostic logs reveal a high-G impact event. Requesting additional photos and customer clarification before manager adjudication.",
      keyEvidence: [
        "Customer asserts zero physical damage or drops",
        "Vision Agent detected hairline screen fracture & corner dent",
        "Diagnostic log recorded physical impact shock event",
        "Validator detected irreconcilable conflict — human review required",
      ],
      policyBasis:
        "Arbiter Conflict Protocol Sec 5.2 — Contradictory Evidence Escalation",
      suggestedRemedy: "REQUEST_MORE_INFORMATION",
      disclaimer:
        "AI RECOMMENDATION ONLY — REQUIRES HUMAN MANAGER FINAL APPROVAL",
      generatedAt: "2026-02-17T16:06:40Z",
    },
    updatedAt: "2026-02-17T16:06:40Z",
  },

  // =========================================================================
  // SCENARIO 5: CLM-1028 - Low Confidence / Missing Evidence
  // =========================================================================
  {
    claimId: "CLM-1028",
    customer: {
      name: "Marcus Aurelius",
      email: "marcus@rome.emp",
      phone: "+1 (555) 123-9999",
    },
    product: {
      category: "Display",
      brand: "Samsung",
      model: "Odyssey G7",
      serialNumber: "SAM-9999-000",
    },
    complaint: "Monitor has dead pixels in the center of the screen.",
    files: {
      productImage: {
        url: "/mock/evidence/blurry_photo.jpg",
        filename: "monitor_screen.jpg",
        fileSize: 1200000,
        mimeType: "image/jpeg",
        uploadedAt: "2026-02-18T10:00:00Z",
      },
    },
    status: "SUBMITTED",
    submittedAt: "2026-02-18T10:01:00Z",
    updatedAt: "2026-02-18T10:01:00Z",
  },

  // =========================================================================
  // SCENARIO 6: CLM-1029 - Agent Pipeline Failure
  // =========================================================================
  {
    claimId: "CLM-1029",
    customer: {
      name: "Neo Anderson",
      email: "neo@matrix.sys",
      phone: "+1 (555) 101-0101",
    },
    product: {
      category: "Smartphone",
      brand: "Google",
      model: "Pixel 9 Pro",
      serialNumber: "PIX-101010",
    },
    complaint: "System crashed and won't turn on. Diagnostic tool threw a segmentation fault.",
    files: {
      productImage: {
        url: "/mock/evidence/pixel_dead.jpg",
        filename: "pixel_front.jpg",
        fileSize: 2200000,
        mimeType: "image/jpeg",
        uploadedAt: "2026-02-19T09:00:00Z",
      },
      invoice: {
        url: "/mock/evidence/invoice_neo.pdf",
        filename: "invoice.pdf",
        fileSize: 450000,
        mimeType: "application/pdf",
        uploadedAt: "2026-02-19T09:01:00Z",
      },
    },
    status: "SUBMITTED",
    submittedAt: "2026-02-19T09:05:00Z",
    updatedAt: "2026-02-19T09:05:00Z",
  }
];
