import { NextRequest, NextResponse } from "next/server";
import { getClaimById, saveClaim } from "@/services/rocketride/runClaimPipeline";
import { requireManagerSession } from "@/services/auth/serverAuth";
import { RecommendationType } from "@/types";

/**
 * POST /api/claims/[claimId]/approve
 * Human Warranty Manager grants final approval for the claim resolution.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { claimId: string } }
) {
  let session;
  try {
    session = requireManagerSession(req);
  } catch (err) {
    return NextResponse.json(
      { error: "Unauthorized: Active Manager session required to approve claims." },
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
    const body = await req.json().catch(() => ({}));
    const {
      comment = "Approved per warranty policy criteria.",
      decidedBy = "Warranty Operations Manager",
      finalRemedy = claim.recommendation?.suggestedRemedy || "REPLACE",
    }: {
      comment?: string;
      decidedBy?: string;
      finalRemedy?: RecommendationType;
    } = body;

    const updatedClaim = {
      ...claim,
      status: "APPROVED" as const,
      managerDecision: {
        decidedBy,
        decision: "APPROVED" as const,
        comment,
        decidedAt: new Date().toISOString(),
        finalRemedy,
      },
      resolution: {
        resolutionType: finalRemedy,
        customerNotificationSent: true,
        notificationTimestamp: new Date().toISOString(),
        resolutionNotes: `Claim approved for ${finalRemedy}. Customer notified at ${claim.customer.email}.`,
        trackingNumber: `RMA-${Math.floor(100000 + Math.random() * 900000)}`,
      },
      updatedAt: new Date().toISOString(),
    };

    saveClaim(updatedClaim);

    return NextResponse.json({
      success: true,
      message: "Claim successfully approved by Warranty Manager.",
      claimId: updatedClaim.claimId,
      status: updatedClaim.status,
      managerDecision: updatedClaim.managerDecision,
      resolution: updatedClaim.resolution,
      claim: updatedClaim,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to approve claim" },
      { status: 500 }
    );
  }
}
