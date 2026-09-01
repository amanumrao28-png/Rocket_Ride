import { ManagerAccount, Session } from "@/types";

export interface AuthState {
  authenticated: boolean;
  session: Session | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: "CUSTOMER" | "MANAGER";
    status?: string;
  } | null;
}

export interface ManagerRegistrationResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: "MANAGER";
    status: "PENDING";
    requestedAt: string;
  };
}

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

async function parseResponse(res: Response) {
  let data: any = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(
      data?.detail ||
      data?.error ||
      `Request failed with status ${res.status}`
    );
  }

  return data;
}

function buildCustomerAuthState(data: any): AuthState {
  const session = data.session || {
    token: data.access_token,
    userId: data.user.id,
    role: "CUSTOMER",
    name: data.user.name,
    email: data.user.email,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };

  return {
    authenticated: true,
    session,
    user: {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: "CUSTOMER",
    },
  };
}

function buildManagerAuthState(data: any): AuthState {
  const session = data.session || {
    token: data.access_token,
    userId: data.user.id,
    role: "MANAGER",
    name: data.user.name,
    email: data.user.email,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };

  return {
    authenticated: true,
    session,
    user: {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: "MANAGER",
      status: data.user.status,
    },
  };
}

export const authApi = {
  // =========================================================
  // CUSTOMER REGISTRATION & SIGNUP
  // =========================================================

  async signUpCustomer(
    name: string,
    email: string,
    password: string
  ): Promise<AuthState> {
    const url = BACKEND_BASE
      ? `${BACKEND_BASE}/auth/customer/register/complete`
      : `/api/auth/customer/signup`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await parseResponse(res);
    return buildCustomerAuthState(data);
  },

  async startCustomerRegistration(
    email: string
  ): Promise<{ message: string }> {
    const url = BACKEND_BASE
      ? `${BACKEND_BASE}/auth/customer/register/start`
      : `/api/auth/customer/signup`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email }),
    });

    return parseResponse(res);
  },

  async verifyCustomerOtp(
    email: string,
    otp: string
  ): Promise<{
    verified_token: string;
    message: string;
  }> {
    const url = BACKEND_BASE
      ? `${BACKEND_BASE}/auth/customer/register/verify-otp`
      : `/api/auth/customer/signup`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        otp,
      }),
    });

    return parseResponse(res);
  },

  async completeCustomerRegistration(
    email: string,
    verified_token: string,
    name: string,
    password: string,
    confirm_password: string
  ): Promise<AuthState> {
    const url = BACKEND_BASE
      ? `${BACKEND_BASE}/auth/customer/register/complete`
      : `/api/auth/customer/signup`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        verified_token,
        name,
        password,
        confirm_password,
      }),
    });

    const data = await parseResponse(res);

    return buildCustomerAuthState(data);
  },

  // =========================================================
  // MANAGER REGISTRATION
  // =========================================================

  async startManagerRegistration(
    email: string,
    reason?: string
  ): Promise<{ message: string }> {
    const url = BACKEND_BASE
      ? `${BACKEND_BASE}/auth/manager/register/start`
      : `/api/auth/manager/signup`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        reason,
      }),
    });

    return parseResponse(res);
  },

  async verifyManagerOtp(
    email: string,
    otp: string
  ): Promise<{
    verified_token: string;
    message: string;
  }> {
    const url = BACKEND_BASE
      ? `${BACKEND_BASE}/auth/manager/register/verify-otp`
      : `/api/auth/manager/signup`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        otp,
      }),
    });

    return parseResponse(res);
  },

  async completeManagerRegistration(
    email: string,
    verified_token: string,
    name: string,
    password: string,
    confirm_password: string
  ): Promise<ManagerRegistrationResponse> {
    const url = BACKEND_BASE
      ? `${BACKEND_BASE}/auth/manager/register/complete`
      : `/api/auth/manager/signup`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        verified_token,
        name,
        password,
        confirm_password,
      }),
    });

    return parseResponse(res);
  },

  // =========================================================
  // LOGIN
  // =========================================================

  async loginCustomer(
    email: string,
    password: string
  ): Promise<AuthState> {
    const url = BACKEND_BASE
      ? `${BACKEND_BASE}/auth/customer/login`
      : `/api/auth/customer/login`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await parseResponse(res);

    return buildCustomerAuthState(data);
  },

  async loginManager(
    email: string,
    password: string
  ): Promise<AuthState> {
    const url = BACKEND_BASE
      ? `${BACKEND_BASE}/auth/manager/login`
      : `/api/auth/manager/login`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!res.ok) {
      let data: any = {};

      try {
        data = await res.json();
      } catch {}

      const err = new Error(
        data?.detail ||
          data?.error ||
          "Invalid manager credentials"
      ) as Error & {
        status?: string | null;
        rejectionReason?: string;
      };

      err.status =
        data?.status ||
        (res.status === 403
          ? data?.detail?.includes("awaiting approval")
            ? "PENDING"
            : "REJECTED"
          : null);

      err.rejectionReason = data?.rejectionReason;

      throw err;
    }

    const data = await res.json();

    return buildManagerAuthState(data);
  },

  // =========================================================
  // SESSION
  // =========================================================

  async getSession(token?: string): Promise<AuthState> {
    try {
      const url = BACKEND_BASE
        ? `${BACKEND_BASE}/auth/me`
        : `/api/auth/session`;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        method: "GET",
        headers,
        credentials: "include",
        cache: "no-store",
      });

      let data: any = null;

      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok || !data) {
        return {
          authenticated: false,
          session: null,
          user: null,
        };
      }

      if (data.authenticated !== undefined) {
        return data as AuthState;
      }

      return {
        authenticated: true,
        session: {
          token: token || "",
          userId: data.id,
          role: data.role,
          name: data.name,
          email: data.email,
          expiresAt: "",
        },
        user: {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.status,
        },
      };
    } catch (error) {
      console.error("getSession failed:", error);

      return {
        authenticated: false,
        session: null,
        user: null,
      };
    }
  },

  // =========================================================
  // LOGOUT
  // =========================================================

  async logout(): Promise<void> {
    try {
      const url = BACKEND_BASE
        ? `${BACKEND_BASE}/auth/logout`
        : `/api/auth/logout`;

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    }
  },

  // =========================================================
  // MANAGER HELPERS
  // =========================================================

  async listManagers(): Promise<ManagerAccount[]> {
    const url = BACKEND_BASE
      ? `${BACKEND_BASE}/manager/list`
      : `/api/auth/manager/list`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    const data = await parseResponse(res);

    return data?.managers || data || [];
  },

  async approveManager(
    targetId: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const url = BACKEND_BASE
      ? `${BACKEND_BASE}/manager/approvals/${encodeURIComponent(targetId)}/approve`
      : `/api/auth/manager/${encodeURIComponent(targetId)}/approve`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await parseResponse(res);

    return {
      success: true,
      message: `Manager ${data.name || "account"} approved successfully.`,
    };
  },

  async rejectManager(
    targetId: string,
    reason: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const url = BACKEND_BASE
      ? `${BACKEND_BASE}/manager/approvals/${encodeURIComponent(targetId)}/reject`
      : `/api/auth/manager/${encodeURIComponent(targetId)}/reject`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ reason }),
    });

    const data = await parseResponse(res);

    return {
      success: true,
      message: `Manager ${data.name || "account"} request rejected.`,
    };
  },
};