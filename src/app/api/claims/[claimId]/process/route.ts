import { NextRequest, NextResponse } from "next/server";
import { getClaimById, runClaimPipeline } from "@/services/rocketride/runClaimPipeline";

/**
 * POST /api/claims/[claimId]/process
 * Kicks off the RocketRide multi-agent claim analysis pipeline.
 */
export async function POST(
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

  try {
    // Run the pipeline (synchronously executes and updates the claim store)
    const updatedClaim = await runClaimPipeline(claim);

    return NextResponse.json({
      success: true,
      message: "Pipeline completed successfully. Claim routed to Manager Review queue.",
      claimId: updatedClaim.claimId,
      status: updatedClaim.status,
      recommendation: updatedClaim.recommendation,
      validation: updatedClaim.validation,
      claim: updatedClaim,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Pipeline execution failed" },
      { status: 500 }
    );
  }
}
