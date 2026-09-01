import { NextRequest, NextResponse } from "next/server";
import { requireManagerSession, approveManager } from "@/services/auth/serverAuth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = requireManagerSession(req);
    const targetId = params.id;

    const updated = await approveManager(
      targetId,
      session.userId,
      session.name || "Authorized Manager"
    );

    return NextResponse.json({
      success: true,
      message: `Manager ${updated.name} (${updated.email}) approved successfully.`,
      manager: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        status: updated.status,
        approvedBy: updated.approvedBy,
        approvedAt: updated.approvedAt,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to approve manager" },
      { status: 400 }
    );
  }
}
