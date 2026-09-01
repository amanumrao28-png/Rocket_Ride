/**
 * Typed Frontend API Client for Claims & Manager Actions
 *
 * All UI components interact exclusively through this typed client wrapper.
 * Components NEVER call raw `fetch()` directly, ensuring seamless swappability
 * when transitioning between local Next.js Route Handlers and external FastAPI services.
 */

import {
  Claim,
  ClaimFiles,
  ClaimStatus,
  Customer,
  Product,
  RecommendationType,
} from "@/types";

export interface CreateClaimPayload {
  customer: Customer;
  product: Product;
  complaint: string;
  files: ClaimFiles;
}

export interface CreateClaimResponse {
  success: boolean;
  claim_id: string;
  claimId: string;
  status: ClaimStatus;
  claim: Claim;
}

export interface ClaimStatusResponse {
  success: boolean;
  claimId: string;
  status: ClaimStatus;
  hasAgentResults: boolean;
  validationStatus: string;
  hasConflict: boolean;
  recommendation: string | null;
  managerDecision: Claim["managerDecision"] | null;
  updatedAt: string;
}

export interface ProcessClaimResponse {
  success: boolean;
  message: string;
  claimId: string;
  status: ClaimStatus;
  recommendation?: Claim["recommendation"];
  validation?: Claim["validation"];
  claim: Claim;
}

export interface ManagerActionResponse {
  success: boolean;
  message: string;
  claimId: string;
  status: ClaimStatus;
  managerDecision: Claim["managerDecision"];
  resolution: Claim["resolution"];
  claim: Claim;
}

class ClaimsApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "/api";
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        errorBody.error || `HTTP ${response.status}: Failed request to ${endpoint}`
      );
    }

    return response.json();
  }

  /**
   * POST /claims - Create a new claim
   */
  public async createClaim(payload: CreateClaimPayload): Promise<CreateClaimResponse> {
    return this.request<CreateClaimResponse>("/claims", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  /**
   * GET /claims - List all claims for manager queue
   */
  public async listClaims(): Promise<Claim[]> {
    const res = await this.request<{ success: boolean; claims: Claim[] }>("/claims");
    return res.claims || [];
  }

  /**
   * Alias for listClaims returning full response
   */
  public async getClaims(): Promise<{ success: boolean; claims: Claim[] }> {
    const res = await this.request<{ success: boolean; claims: Claim[] }>("/claims");
    return res;
  }

  /**
   * GET /claims/{claim_id} - Fetch full claim detail
   */
  public async getClaim(claimId: string): Promise<Claim> {
    const res = await this.request<{ success: boolean; claim: Claim }>(
      `/claims/${encodeURIComponent(claimId)}`
    );
    return res.claim;
  }

  /**
   * POST /claims/{claim_id}/process - Execute the RocketRide pipeline
   */
  public async processClaim(claimId: string): Promise<ProcessClaimResponse> {
    return this.request<ProcessClaimResponse>(
      `/claims/${encodeURIComponent(claimId)}/process`,
      {
        method: "POST",
      }
    );
  }

  /**
   * GET /claims/{claim_id}/status - Poll claim pipeline status
   */
  public async getClaimStatus(claimId: string): Promise<ClaimStatusResponse> {
    return this.request<ClaimStatusResponse>(
      `/claims/${encodeURIComponent(claimId)}/status`
    );
  }

  /**
   * POST /claims/{claim_id}/approve - Manager grants approval
   */
  public async approveClaim(
    claimId: string,
    data?: {
      comment?: string;
      decidedBy?: string;
      finalRemedy?: RecommendationType;
    }
  ): Promise<ManagerActionResponse> {
    return this.request<ManagerActionResponse>(
      `/claims/${encodeURIComponent(claimId)}/approve`,
      {
        method: "POST",
        body: JSON.stringify(data || {}),
      }
    );
  }

  /**
   * POST /claims/{claim_id}/reject - Manager rejects claim
   */
  public async rejectClaim(
    claimId: string,
    data: {
      reason: string;
      comment?: string;
      decidedBy?: string;
    }
  ): Promise<ManagerActionResponse> {
    return this.request<ManagerActionResponse>(
      `/claims/${encodeURIComponent(claimId)}/reject`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  /**
   * POST /claims/{claim_id}/request-info - Manager requests additional evidence
   */
  public async requestMoreInfo(
    claimId: string,
    data: {
      reasons: string[];
      message: string;
      decidedBy?: string;
    }
  ): Promise<ManagerActionResponse> {
    return this.request<ManagerActionResponse>(
      `/claims/${encodeURIComponent(claimId)}/request-info`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }
  /**
   * POST /claims/{claim_id}/reset - DEMO MODE: reset claim to seed state
   */
  public async resetDemoClaim(
    claimId: string
  ): Promise<{ claim: Claim; message: string }> {
    return this.request<{ claim: Claim; message: string }>(
      `/claims/${encodeURIComponent(claimId)}/reset`,
      { method: "POST" }
    );
  }
}

export const claimsApi = new ClaimsApiClient();
