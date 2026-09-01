import { NextRequest, NextResponse } from "next/server";
import { Claim, ClaimFiles, Customer, Product } from "@/types";
import { getAllClaims, saveClaim } from "@/services/rocketride/runClaimPipeline";
import { getSession, SESSION_COOKIE_NAME } from "@/services/auth/serverAuth";

/**
 * GET /api/claims
 * Returns claims. If Manager -> all claims. If Customer -> only their claims.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = getSession(token);

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Active session required to view claims." },
      { status: 401 }
    );
  }

  const allClaims = getAllClaims();

  if (session.role === "MANAGER") {
    return NextResponse.json({
      success: true,
      count: allClaims.length,
      claims: allClaims,
    });
  }

  // Filter to customer's own claims
  const customerClaims = allClaims.filter(
    (c) => c.customer.email.toLowerCase() === session.email.toLowerCase()
  );

  return NextResponse.json({
    success: true,
    count: customerClaims.length,
    claims: customerClaims,
  });
}

/**
 * POST /api/claims
 * Customer creates a new warranty/return claim with metadata and uploaded evidence files.
 */
export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = getSession(token);

  if (!session || session.role !== "CUSTOMER") {
    return NextResponse.json(
      { error: "Unauthorized: Customer session required to submit claims." },
      { status: 401 }
    );
  }
  try {
    const body = await req.json();

    const {
      customer,
      product,
      complaint,
      files = {},
    }: {
      customer: Customer;
      product: Product;
      complaint: string;
      files: ClaimFiles;
    } = body;

    if (!customer?.name || !customer?.email || !product?.model || !complaint) {
      return NextResponse.json(
        {
          error: "Missing required fields: customer (name, email), product (model), complaint",
        },
        { status: 400 }
      );
    }

    const claimId = `CLM-${Math.floor(1000 + Math.random() * 9000)}`;

    const newClaim: Claim = {
      claimId,
      customer,
      product: {
        ...product,
        serialNumber: product.serialNumber || `SN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      },
      complaint,
      files,
      status: "SUBMITTED",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveClaim(newClaim);

    return NextResponse.json(
      {
        success: true,
        claim_id: claimId,
        claimId,
        status: newClaim.status,
        claim: newClaim,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create claim" },
      { status: 500 }
    );
  }
}
