import { NextRequest, NextResponse } from "next/server";
import { getClaimById } from "@/services/rocketride/runClaimPipeline";

/**
 * GET /api/claims/[claimId]
 * Returns the full claim detail including multi-agent analysis and validation state.
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
    claim,
  });
}
