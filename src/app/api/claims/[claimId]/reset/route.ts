import { NextRequest, NextResponse } from "next/server";
import { resetClaimToSeed } from "@/services/rocketride/runClaimPipeline";

/**
 * POST /api/claims/[claimId]/reset
 *
 * DEMO MODE ONLY: Resets a seeded demo claim back to its original
 * SAMPLE_CLAIMS state so the pipeline animation can be re-played
 * without corrupting demo data.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { claimId: string } }
) {
  const { claimId } = params;
  const claim = resetClaimToSeed(claimId);

  if (!claim) {
    return NextResponse.json(
      { error: "Claim not found or not a seeded demo claim" },
      { status: 404 }
    );
  }

  return NextResponse.json({ claim, message: `Demo claim ${claimId} reset to seed state.` });
}
