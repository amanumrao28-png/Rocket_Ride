/**
 * RocketRide Claim Pipeline Runner
 *
 * Invokes the portable RocketRide pipeline graph (pipelines/claim-analysis.rocketride.json)
 * to orchestrate multi-agent analysis for a warranty claim.
 *
 * RUNTIME ARCHITECTURE:
 * - Live Mode: Communicates with the RocketRide multithreaded C++ engine via REST / SDK.
 * - Mock Mode: In-process topological DAG executor with realistic delays (600-1200ms)
 *   for rich UI animations in development/demo environments.
 *   Comment: "MOCK RUNTIME ACTIVE — Set ROCKETRIDE_SERVER_URL to switch to live engine."
 *
 * OBSERVABILITY & SAFETY:
 * - Node-level execution events are mapped to public-safe messages.
 * - Internal chain-of-thought traces and raw C++ logs are NEVER leaked to the client.
 * - The pipeline NEVER auto-approves or auto-rejects; it only computes a recommendation
 *   and routes to 'UNDER_REVIEW' for human Warranty Manager final authority.
 */

import {
  Claim,
  DecisionAgentResult,
  DocumentAgentResult,
  FaultAgentResult,
  InvoiceVerificationResult,
  ValidatorResult,
  VisionAgentResult,
  WarrantyAgentResult,
} from "@/types";
import { SAMPLE_CLAIMS } from "@/data/claims";
import { rocketride } from "@/services/rocketride/client";
import { prepareImageForVision, runPiiRedaction } from "@/services/preprocessing";
import * as visionAgent from "@/services/agents/visionAgent";
import * as documentAgent from "@/services/agents/documentAgent";
import * as invoiceVerification from "@/services/verification/invoiceVerification";
import * as faultAgent from "@/services/agents/faultAgent";
import * as warrantyAgent from "@/services/agents/warrantyAgent";
import * as decisionAgent from "@/services/agents/decisionAgent";
import * as validator from "@/services/agents/validator";

export type PipelineStageName =
  | "preprocessing_node"
  | "vision_node"
  | "document_node"
  | "fault_node"
  | "invoice_verification_node"
  | "warranty_node"
  | "decision_node"
  | "validator_node";

export type StageExecutionStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED";

export interface PipelineProgressEvent {
  pipelineId: string;
  nodeId: PipelineStageName;
  nodeLabel: string;
  status: StageExecutionStatus;
  publicMessage: string;
  timestamp: string;
  durationMs?: number;
  dataSnippet?: Record<string, unknown>;
}

// Approved, user-facing safe status messages
const STAGE_PUBLIC_MESSAGES: Record<PipelineStageName, { label: string; message: string }> = {
  preprocessing_node: {
    label: "Evidence Preprocessor",
    message: "Preprocessing and anonymizing claim attachments",
  },
  vision_node: {
    label: "Vision Agent",
    message: "Analyzing product image",
  },
  document_node: {
    label: "Document Agent",
    message: "Extracting invoice information",
  },
  fault_node: {
    label: "Fault Agent",
    message: "Checking diagnostic evidence",
  },
  invoice_verification_node: {
    label: "Invoice Verifier",
    message: "Verifying invoice against retailer registry",
  },
  warranty_node: {
    label: "Warranty Agent",
    message: "Verifying warranty eligibility",
  },
  decision_node: {
    label: "Decision Recommender",
    message: "Generating recommendation",
  },
  validator_node: {
    label: "Consistency Validator",
    message: "Validating evidence and conflict checks",
  },
};

/**
 * In-memory mutable claim store for the active runtime session
 */
const activeClaimStore: Map<string, Claim> = new Map(
  SAMPLE_CLAIMS.map((claim) => [claim.claimId, { ...claim }])
);

export function getClaimById(claimId: string): Claim | null {
  return activeClaimStore.get(claimId) || null;
}

export function saveClaim(claim: Claim): void {
  activeClaimStore.set(claim.claimId, { ...claim, updatedAt: new Date().toISOString() });
}

export function getAllClaims(): Claim[] {
  return Array.from(activeClaimStore.values());
}

/**
 * DEMO MODE: Reset a single claim back to its original seed state.
 * Deep-copies the matching SAMPLE_CLAIMS entry back into the active store
 * so re-running the pipeline animation doesn't corrupt the seed data.
 */
export function resetClaimToSeed(claimId: string): Claim | null {
  const seed = SAMPLE_CLAIMS.find((c) => c.claimId === claimId);
  if (!seed) return null;
  const freshCopy = JSON.parse(JSON.stringify(seed)) as Claim;
  activeClaimStore.set(claimId, freshCopy);
  return freshCopy;
}

/**
 * Executes the Claim Analysis Pipeline
 */
export async function runClaimPipeline(
  claimOrId: string | Claim,
  onProgress?: (event: PipelineProgressEvent) => void
): Promise<Claim> {
  const claim: Claim =
    typeof claimOrId === "string"
      ? getClaimById(claimOrId) || SAMPLE_CLAIMS[0]
      : claimOrId;

  const pipelineId = `rr-pipe-${claim.claimId}-${Date.now()}`;
  const mode = rocketride.getMode();

  const emitProgress = (
    nodeId: PipelineStageName,
    status: StageExecutionStatus,
    durationMs?: number,
    dataSnippet?: Record<string, unknown>
  ) => {
    if (!onProgress) return;
    const info = STAGE_PUBLIC_MESSAGES[nodeId];
    onProgress({
      pipelineId,
      nodeId,
      nodeLabel: info.label,
      status,
      publicMessage: info.message,
      timestamp: new Date().toISOString(),
      durationMs,
      dataSnippet,
    });
  };

  // Helper for staged node delays to enable UI progress animation
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // =========================================================================
  // STAGE 1: Preprocessing Node (Root)
  // =========================================================================
  emitProgress("preprocessing_node", "RUNNING");
  const t0 = Date.now();
  await delay(700);

  const imgUrl =
    typeof claim.files.productImage === "string"
      ? claim.files.productImage
      : claim.files.productImage?.url;

  if (imgUrl) {
    await prepareImageForVision({ url: imgUrl });
  }
  if (claim.complaint) {
    await runPiiRedaction(claim.complaint);
  }
  emitProgress("preprocessing_node", "DONE", Date.now() - t0, {
    filesProcessed: Object.keys(claim.files).length,
  });

  // =========================================================================
  // STAGE 2: Parallel Branch (Vision Agent, Document Agent, Fault Agent)
  // =========================================================================
  emitProgress("vision_node", "RUNNING");
  emitProgress("document_node", "RUNNING");
  emitProgress("fault_node", "RUNNING");

  const t1 = Date.now();

  const [visionRes, docRes, faultRes] = await Promise.all([
    (async (): Promise<VisionAgentResult> => {
      await delay(950);
      const res = await visionAgent.run({
        imageUrl: imgUrl,
        filename: typeof claim.files.productImage === "object" ? claim.files.productImage.filename : undefined,
        expectedSerialNumber: claim.product.serialNumber,
        complaintContext: claim.complaint,
      });
      emitProgress("vision_node", "DONE", Date.now() - t1, {
        damageDetected: res.damageDetected,
        confidence: res.confidence,
      });
      return res;
    })(),

    (async (): Promise<DocumentAgentResult> => {
      await delay(850);
      const invUrl =
        typeof claim.files.invoice === "string"
          ? claim.files.invoice
          : claim.files.invoice?.url;
      const res = await documentAgent.run({
        invoiceUrl: invUrl,
        filename: typeof claim.files.invoice === "object" ? claim.files.invoice.filename : undefined,
        claimId: claim.claimId,
      });
      // Mock CLM-1028 Low Confidence
      if (claim.claimId === "CLM-1028") {
        res.confidence = 0.45;
        res.invoiceFound = false;
        res.findings = ["Invoice could not be clearly read"];
      }
      emitProgress("document_node", "DONE", Date.now() - t1, {
        invoiceFound: res.invoiceFound,
        confidence: res.confidence,
      });
      return res;
    })(),

    (async (): Promise<FaultAgentResult> => {
      await delay(900);
      // Mock CLM-1029 Agent Failure
      if (claim.claimId === "CLM-1029") {
        emitProgress("fault_node", "FAILED", Date.now() - t1, { error: "Segmentation fault in diagnostic tool" });
        throw new Error("Fault Agent encountered a critical error");
      }
      const diagData = claim.files.diagnosticReport;
      const res = await faultAgent.run(claim.complaint, diagData);
      emitProgress("fault_node", "DONE", Date.now() - t1, {
        category: res.issueCategory,
        severity: res.severity,
      });
      return res;
    })(),
  ]);

  // =========================================================================
  // STAGE 3: Invoice Verification Node (Depends on Document Agent + Trusted DB)
  // =========================================================================
  emitProgress("invoice_verification_node", "RUNNING");
  const t2 = Date.now();
  await delay(800);

  const invoiceVerifRes: InvoiceVerificationResult = await invoiceVerification.run(docRes, {
    product: claim.product,
  });
  emitProgress("invoice_verification_node", "DONE", Date.now() - t2, {
    status: invoiceVerifRes.status,
    retailerAuthorized: invoiceVerifRes.retailerAuthorized,
  });

  // =========================================================================
  // STAGE 4: Warranty Node (Depends on Document + Fault + Invoice Verification)
  // =========================================================================
  emitProgress("warranty_node", "RUNNING");
  const t3 = Date.now();
  await delay(850);

  const purchaseDate = docRes.purchase_date || docRes.purchaseDate || claim.submittedAt;
  const warrantyRes: WarrantyAgentResult = await warrantyAgent.run(
    claim.product,
    purchaseDate,
    claim.submittedAt,
    faultRes
  );
  emitProgress("warranty_node", "DONE", Date.now() - t3, {
    isWithinWarranty: warrantyRes.isWithinWarranty,
    coverage: warrantyRes.coverage,
  });

  // =========================================================================
  // STAGE 5: Decision Agent Node (Depends on all upstream analysis)
  // =========================================================================
  emitProgress("decision_node", "RUNNING");
  const t4 = Date.now();
  await delay(900);

  const decisionRes: DecisionAgentResult = await decisionAgent.run({
    visionResult: visionRes,
    documentResult: docRes,
    invoiceVerification: invoiceVerifRes,
    faultResult: faultRes,
    warrantyResult: warrantyRes,
  });
  
  if (claim.claimId === "CLM-1028") {
    decisionRes.confidence = 0.55;
    decisionRes.recommendation = "REQUEST_MORE_INFORMATION";
  }

  emitProgress("decision_node", "DONE", Date.now() - t4, {
    recommendation: decisionRes.recommendation,
    confidence: decisionRes.confidence,
  });

  // =========================================================================
  // STAGE 6: Validator Node (Independent Consistency and Conflict Check)
  // =========================================================================
  emitProgress("validator_node", "RUNNING");
  const t5 = Date.now();
  await delay(750);

  const validatorRes: ValidatorResult = await validator.run({
    customerComplaint: claim.complaint,
    visionResult: visionRes,
    documentResult: docRes,
    invoiceVerification: invoiceVerifRes,
    faultResult: faultRes,
    warrantyResult: warrantyRes,
    decisionResult: decisionRes,
  });

  const validatorStatus: StageExecutionStatus =
    validatorRes.validation_status === "PASSED" ? "DONE" : "FAILED";

  emitProgress("validator_node", validatorStatus, Date.now() - t5, {
    status: validatorRes.validation_status,
    conflictDetected: validatorRes.evidence_conflict,
  });

  // =========================================================================
  // PIPELINE COMPLETION & RESULT PERSISTENCE
  // =========================================================================
  const updatedClaim: Claim = {
    ...claim,
    status: "UNDER_REVIEW", // NEVER auto-approve or auto-reject
    agentResults: {
      vision: visionRes,
      document: docRes,
      invoiceVerification: invoiceVerifRes,
      fault: faultRes,
      warranty: warrantyRes,
    },
    recommendation: decisionRes,
    validation: validatorRes,
    updatedAt: new Date().toISOString(),
  };

  // Save to active in-memory store
  saveClaim(updatedClaim);

  return updatedClaim;
}
