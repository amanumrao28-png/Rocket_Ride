import { NextRequest, NextResponse } from "next/server";
import { getClaimById, saveClaim } from "@/services/rocketride/runClaimPipeline";
import { requireManagerSession } from "@/services/auth/serverAuth";

/**
 * POST /api/claims/[claimId]/reject
 * Human Warranty Manager formally rejects the claim with structured reason and explanation.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { claimId: string } }
) {
  try {
    requireManagerSession(req);
  } catch (err) {
    return NextResponse.json(
      { error: "Unauthorized: Active Manager session required to reject claims." },
      { status: 401 }
    );
  }

  const claim = getClaimById(params.claimId);

  if (!claim) {
    return NextResponse.json(
      { error: `Claim with ID '${params.claimId}' not found` },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();
    const {
      reason,
      comment = "",
      decidedBy = "Warranty Operations Manager",
    }: {
      reason: string;
      comment?: string;
      decidedBy?: string;
    } = body;

    if (!reason) {
      return NextResponse.json(
        { error: "A rejection reason must be provided" },
        { status: 400 }
      );
    }

    const updatedClaim = {
      ...claim,
      status: "REJECTED" as const,
      managerDecision: {
        decidedBy,
        decision: "REJECTED" as const,
        comment: comment ? `${reason}: ${comment}` : reason,
        decidedAt: new Date().toISOString(),
        finalRemedy: "DENY" as const,
      },
      resolution: {
        resolutionType: "DENY" as const,
        customerNotificationSent: true,
        notificationTimestamp: new Date().toISOString(),
        resolutionNotes: `Claim denied: ${reason}. Explanation sent to ${claim.customer.email}.`,
      },
      updatedAt: new Date().toISOString(),
    };

    saveClaim(updatedClaim);

    return NextResponse.json({
      success: true,
      message: "Claim formally rejected by Warranty Manager.",
      claimId: updatedClaim.claimId,
      status: updatedClaim.status,
      managerDecision: updatedClaim.managerDecision,
      resolution: updatedClaim.resolution,
      claim: updatedClaim,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to reject claim" },
      { status: 500 }
    );
  }
}
