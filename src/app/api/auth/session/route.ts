import { NextRequest, NextResponse } from "next/server";
import { getSession, SESSION_COOKIE_NAME } from "@/services/auth/serverAuth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = getSession(token);

  if (!session) {
    return NextResponse.json({
      authenticated: false,
      session: null,
      user: null,
    });
  }

  return NextResponse.json({
    authenticated: true,
    session,
    user: {
      id: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
    },
  });
}
