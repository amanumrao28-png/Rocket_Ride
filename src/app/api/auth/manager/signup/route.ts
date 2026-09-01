import { NextRequest, NextResponse } from "next/server";
import { signUpManager } from "@/services/auth/serverAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, requestedRoleNote } = body;

    const { user } = await signUpManager(name, email, password, requestedRoleNote);

    return NextResponse.json({
      success: true,
      message:
        "Your manager account request has been submitted. An existing warranty manager must approve your access before you can log in.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        requestedAt: user.requestedAt,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to submit manager registration request",
      },
      { status: 400 }
    );
  }
}
