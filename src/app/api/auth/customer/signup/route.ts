import { NextRequest, NextResponse } from "next/server";
import { signUpCustomer, SESSION_COOKIE_NAME } from "@/services/auth/serverAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    const { user, session } = await signUpCustomer(name, email, password);

    const response = NextResponse.json({
      success: true,
      message: "Customer account created successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: "CUSTOMER",
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
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to create account",
      },
      { status: 400 }
    );
  }
}
