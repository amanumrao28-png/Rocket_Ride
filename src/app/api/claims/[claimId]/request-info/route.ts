import { NextRequest, NextResponse } from "next/server";
import { getClaimById, saveClaim } from "@/services/rocketride/runClaimPipeline";
import { requireManagerSession } from "@/services/auth/serverAuth";

/**
 * POST /api/claims/[claimId]/request-info
 * Human Warranty Manager requests additional photographic, diagnostic, or invoice evidence from customer.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { claimId: string } }
) {
  try {
    requireManagerSession(req);
  } catch (err) {
    return NextResponse.json(
      { error: "Unauthorized: Active Manager session required to request evidence." },
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
      reasons = [],
      message,
      decidedBy = "Warranty Operations Manager",
    }: {
      reasons: string[];
      message: string;
      decidedBy?: string;
    } = body;

    if (!message && reasons.length === 0) {
      return NextResponse.json(
        { error: "At least one clarification reason or customer message must be provided" },
        { status: 400 }
      );
    }

    const compiledNotes = [
      reasons.length > 0 ? `Requested items: ${reasons.join(", ")}` : "",
      message ? `Manager note: ${message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const updatedClaim = {
      ...claim,
      status: "NEEDS_MORE_EVIDENCE" as const,
      managerDecision: {
        decidedBy,
        decision: "NEEDS_MORE_EVIDENCE" as const,
        comment: compiledNotes,
        decidedAt: new Date().toISOString(),
        finalRemedy: "REQUEST_MORE_INFORMATION" as const,
      },
      resolution: {
        resolutionType: "REQUEST_MORE_INFORMATION" as const,
        customerNotificationSent: true,
        notificationTimestamp: new Date().toISOString(),
        resolutionNotes: `Clarification request sent to ${claim.customer.email}.`,
      },
      updatedAt: new Date().toISOString(),
    };

    saveClaim(updatedClaim);

    return NextResponse.json({
      success: true,
      message: "Additional evidence request dispatched to customer.",
      claimId: updatedClaim.claimId,
      status: updatedClaim.status,
      managerDecision: updatedClaim.managerDecision,
      resolution: updatedClaim.resolution,
      claim: updatedClaim,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to request additional info" },
      { status: 500 }
    );
  }
}
