import { NextRequest, NextResponse } from "next/server";
import { requireManagerSession, rejectManager } from "@/services/auth/serverAuth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireManagerSession(req);
    const targetId = params.id;
    const body = await req.json().catch(() => ({}));
    const { reason = "Access request rejected by compliance policy." } = body;

    if (!reason.trim()) {
      return NextResponse.json(
        { error: "A rejection reason must be provided." },
        { status: 400 }
      );
    }

    const updated = await rejectManager(
      targetId,
      session.userId,
      session.name || "Authorized Manager",
      reason.trim()
    );

    return NextResponse.json({
      success: true,
      message: `Manager ${updated.name} (${updated.email}) request rejected.`,
      manager: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        status: updated.status,
        rejectedBy: updated.rejectedBy,
        rejectedAt: updated.rejectedAt,
        rejectionReason: updated.rejectionReason,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reject manager" },
      { status: 400 }
    );
  }
}
