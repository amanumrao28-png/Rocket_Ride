/**
 * Authentication Data Models for Customer and Manager Auth
 */

export type ManagerAccountStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface CustomerAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface ManagerAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "MANAGER";
  status: ManagerAccountStatus;
  requestedAt: string;
  requestedRoleNote?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface Session {
  userId: string;
  role: "CUSTOMER" | "MANAGER";
  token: string;
  name: string;
  email: string;
  expiresAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  status?: ManagerAccountStatus;
  rejectionReason?: string;
  session?: Session;
  user?: {
    id: string;
    name: string;
    email: string;
    role: "CUSTOMER" | "MANAGER";
    status?: ManagerAccountStatus;
  };
}
