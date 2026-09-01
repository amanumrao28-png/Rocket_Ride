import { NextRequest, NextResponse } from "next/server";
import {
  loginManager,
  SESSION_COOKIE_NAME,
  ManagerAccountPendingError,
  ManagerAccountRejectedError,
} from "@/services/auth/serverAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const { user, session } = await loginManager(email, password);

    const response = NextResponse.json({
      success: true,
      message: "Manager authenticated successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: "MANAGER",
        status: user.status,
      },
      session,
    });

    // Set secure httpOnly session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: session.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err) {
    if (err instanceof ManagerAccountPendingError) {
      return NextResponse.json(
        {
          success: false,
          status: "PENDING",
          error:
            "Your manager account is awaiting approval from an existing manager. You'll be notified once approved.",
        },
        { status: 403 }
      );
    }

    if (err instanceof ManagerAccountRejectedError) {
      return NextResponse.json(
        {
          success: false,
          status: "REJECTED",
          rejectionReason: err.rejectionReason,
          error: err.message,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unauthorized manager credentials",
      },
      { status: 401 }
    );
  }
}
