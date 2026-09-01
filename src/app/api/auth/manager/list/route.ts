import { NextRequest, NextResponse } from "next/server";
import { requireManagerSession, listManagers } from "@/services/auth/serverAuth";

export async function GET(req: NextRequest) {
  try {
    requireManagerSession(req);
    const managers = await listManagers();

    // Sanitize response (omit password hashes)
    const sanitized = managers.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      role: m.role,
      status: m.status,
      requestedAt: m.requestedAt,
      requestedRoleNote: m.requestedRoleNote,
      approvedBy: m.approvedBy,
      approvedAt: m.approvedAt,
      rejectedBy: m.rejectedBy,
      rejectedAt: m.rejectedAt,
      rejectionReason: m.rejectionReason,
      createdAt: m.createdAt,
    }));

    return NextResponse.json({
      success: true,
      count: sanitized.length,
      managers: sanitized,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unauthorized" },
      { status: 401 }
    );
  }
}
