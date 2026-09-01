/**
 * Warranty & Returns Arbiter - Core Domain Types
 * Strict, typed schema matching the AI agent orchestration and manager workflow specification.
 */

// ==========================================
// Customer & Product Interfaces
// ==========================================

export interface Customer {
  name: string;
  email: string;
  phone?: string;
}

export interface Product {
  category: string;
  brand: string;
  model: string;
  serialNumber: string;
  id?: string;
  name?: string;
  sku?: string;
}

// ==========================================
// Claim Files & Evidence
// ==========================================

export interface ClaimFileInfo {
  url: string;
  filename: string;
  fileSize?: number;
  mimeType?: string;
  uploadedAt?: string;
}

export interface ClaimFiles {
  productImage?: string | ClaimFileInfo;
  productVideo?: string | ClaimFileInfo;
  invoice?: string | ClaimFileInfo;
  diagnosticReport?: string | ClaimFileInfo;
}

// ==========================================
// Enums & Statuses
// ==========================================

export type ClaimStatus =
  | "SUBMITTED"
  | "PREPROCESSING"
  | "ANALYZING"
  | "UNDER_REVIEW"
  | "NEEDS_MORE_EVIDENCE"
  | "APPROVED"
  | "REJECTED";

export type AgentName =
  | "VISION"
  | "DOCUMENT"
  | "FAULT"
  | "WARRANTY"
  | "DECISION"
  | "VALIDATOR";

export type InvoiceVerificationStatus = "VERIFIED" | "MISMATCH" | "UNVERIFIED";

export type RecommendationType =
  | "REPAIR"
  | "REPLACE"
  | "REFUND"
  | "DENY"
  | "REQUEST_MORE_INFORMATION";

export type ValidationStatus = "PASSED" | "FAILED";

export type ValidationFieldStatus = "PASS" | "FAIL" | "WARNING" | "UNVERIFIED";

export type ManagerDecisionAction =
  | "APPROVED"
  | "REJECTED"
  | "NEEDS_MORE_EVIDENCE";

// ==========================================
// Agent Results
// ==========================================

export interface VisionAgentResult {
  agentName?: "VISION";
  confidence: number; // 0.0 - 1.0
  damageDetected: boolean;
  physical_damage?: boolean;
  product_detected?: boolean;
  visible_issue?: string;
  damageType?:
    | "PHYSICAL_IMPACT"
    | "WATER_DAMAGE"
    | "NORMAL_WEAR"
    | "MANUFACTURING_DEFECT"
    | "NO_DAMAGE_SEEN";
  serialNumberDetected?: string;
  serialNumberMatch: boolean | "UNCERTAIN";
  findings: string[];
  evidence?: string[];
  analyzedAt?: string;
}

export interface DocumentAgentResult {
  agentName?: "DOCUMENT";
  confidence: number;
  invoiceFound: boolean;
  invoice_number?: string;
  product?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  seller?: string;
  price?: number;
  purchaseDate?: string;
  retailer?: string;
  orderNumber?: string;
  itemMatched: boolean;
  pricePaid?: number;
  currency?: string;
  findings: string[];
  analyzedAt?: string;
}

export interface InvoiceVerificationResult {
  status: InvoiceVerificationStatus;
  retailerAuthorized: boolean;
  orderNumberVerified: boolean;
  dateVerified: boolean;
  discrepancies: string[];
  mismatches?: string[];
  verificationTimestamp?: string;
  verifiedRetailerName?: string;
}

export interface FaultAgentResult {
  agentName?: "FAULT";
  confidence: number;
  issueCategory: string;
  fault?: string;
  severity?: "LOW" | "MEDIUM" | "HIGH";
  physical_damage_related?: boolean;
  faultType:
    | "HARDWARE_FAILURE"
    | "USER_ACCIDENTAL"
    | "SOFTWARE_GLITCH"
    | "COSMETIC_WEAR";
  isCovered: boolean;
  wearAndTearDetected: boolean;
  findings: string[];
  evidence?: string[];
  analyzedAt?: string;
}

export interface WarrantyAgentResult {
  agentName?: "WARRANTY";
  confidence: number;
  isWithinWarranty: boolean;
  warranty_valid?: boolean;
  coverage?: string;
  exclusion_applies?: boolean;
  policyId?: string;
  warrantyPeriodMonths: number;
  purchaseDate?: string;
  expirationDate: string;
  coveredClauses: string[];
  exclusionClauses: string[];
  findings: string[];
  analyzedAt?: string;
}

export interface DecisionAgentResult {
  agentName?: "DECISION";
  recommendation: RecommendationType;
  confidence: number; // 0.0 - 1.0
  summary: string;
  reason?: string;
  keyEvidence: string[];
  policyBasis: string;
  suggestedRemedy?: RecommendationType;
  disclaimer: "AI RECOMMENDATION ONLY — REQUIRES HUMAN MANAGER FINAL APPROVAL";
  generatedAt?: string;
}

export interface ValidatorResult {
  agentName?: "VALIDATOR";
  validation_status: ValidationStatus;
  evidence_conflict: boolean;
  reason?: string;
  recommended_action?: string;
  field_checks: {
    serial_match: ValidationFieldStatus;
    invoice_authenticity: ValidationFieldStatus;
    warranty_eligibility: ValidationFieldStatus;
    damage_consistency: ValidationFieldStatus;
    [key: string]: ValidationFieldStatus;
  };
  conflicts: string[];
  validation_notes: string[];
  validatedAt?: string;
}

// ==========================================
// Manager Decision & Resolution
// ==========================================

export interface ManagerDecision {
  decidedBy: string;
  decision: ManagerDecisionAction;
  comment?: string;
  decidedAt: string;
  finalRemedy?: RecommendationType;
}

export interface Resolution {
  resolutionType?: RecommendationType;
  customerNotificationSent: boolean;
  notificationTimestamp?: string;
  resolutionNotes?: string;
  trackingNumber?: string;
}

// ==========================================
// Warranty Policy Model
// ==========================================

export interface WarrantyPolicy {
  productCategory: string;
  warrantyPeriodMonths: number;
  covered: string[];
  excluded: string[];
  id?: string;
  productId?: string;
  requireOriginalInvoice?: boolean;
  requireVisualProof?: boolean;
}

// ==========================================
// Claim Aggregate Model
// ==========================================

export interface ClaimAgentResults {
  vision?: VisionAgentResult;
  document?: DocumentAgentResult;
  invoiceVerification?: InvoiceVerificationResult;
  fault?: FaultAgentResult;
  warranty?: WarrantyAgentResult;
}

export interface Claim {
  claimId: string;
  customer: Customer;
  product: Product;
  complaint: string;
  files: ClaimFiles;
  status: ClaimStatus;
  submittedAt: string;
  agentResults?: ClaimAgentResults;
  validation?: ValidatorResult;
  recommendation?: DecisionAgentResult;
  managerDecision?: ManagerDecision;
  resolution?: Resolution;
  updatedAt?: string;
}

export * from "./auth";
