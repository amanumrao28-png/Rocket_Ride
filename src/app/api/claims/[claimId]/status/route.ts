import { NextRequest, NextResponse } from "next/server";
import { getClaimById } from "@/services/rocketride/runClaimPipeline";

/**
 * GET /api/claims/[claimId]/status
 * Polls the current lifecycle status and validation state of a claim.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { claimId: string } }
) {
  const claim = getClaimById(params.claimId);

  if (!claim) {
    return NextResponse.json(
      { error: `Claim with ID '${params.claimId}' not found` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    claimId: claim.claimId,
    status: claim.status,
    hasAgentResults: Boolean(claim.agentResults),
    validationStatus: claim.validation?.validation_status || "PENDING",
    hasConflict: claim.validation?.evidence_conflict || false,
    recommendation: claim.recommendation?.recommendation || null,
    managerDecision: claim.managerDecision || null,
    updatedAt: claim.updatedAt || claim.submittedAt,
  });
}
