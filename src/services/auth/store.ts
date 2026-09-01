import { CustomerAccount, ManagerAccount, Session } from "@/types";
import { hashPassword } from "./crypto";

// =========================================================================
// IN-MEMORY SEPARATE COLLECTIONS (DEMO/PROTOTYPE STORE)
// Kept separate: Customer accounts and Manager accounts are stored distinctly.
// =========================================================================

// Global singletons to persist across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __CUSTOMER_ACCOUNTS__: Map<string, CustomerAccount> | undefined;
  // eslint-disable-next-line no-var
  var __MANAGER_ACCOUNTS__: Map<string, ManagerAccount> | undefined;
  // eslint-disable-next-line no-var
  var __AUTH_SESSIONS__: Map<string, Session> | undefined;
  // eslint-disable-next-line no-var
  var __AUTH_INITIALIZED__: boolean | undefined;
}

if (!global.__CUSTOMER_ACCOUNTS__) {
  global.__CUSTOMER_ACCOUNTS__ = new Map<string, CustomerAccount>();
}
if (!global.__MANAGER_ACCOUNTS__) {
  global.__MANAGER_ACCOUNTS__ = new Map<string, ManagerAccount>();
}
if (!global.__AUTH_SESSIONS__) {
  global.__AUTH_SESSIONS__ = new Map<string, Session>();
}

export const customerAccounts = global.__CUSTOMER_ACCOUNTS__;
export const managerAccounts = global.__MANAGER_ACCOUNTS__;
export const authSessions = global.__AUTH_SESSIONS__;

/**
 * Initialize pre-seeded demo accounts with cryptographically hashed passwords.
 */
export async function initializeSeedAccounts() {
  if (global.__AUTH_INITIALIZED__) return;

  const defaultPasswordHash = await hashPassword("demo1234");

  // 1. Seed Bootstrap Manager Account (Approved & Authorized)
  const defaultManager: ManagerAccount = {
    id: "mgr_1",
    name: "Marcus Vance",
    email: "manager@warrantyarbiter.demo",
    passwordHash: defaultPasswordHash,
    role: "MANAGER",
    status: "APPROVED",
    requestedAt: "2026-01-01T00:00:00.000Z",
    requestedRoleNote: "Head of Warranty Operations & Adjudication",
    approvedBy: "System Bootstrap",
    approvedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
  };
  managerAccounts.set(defaultManager.email.toLowerCase(), defaultManager);

  // 1b. Seed User Manager Account (Aman Umrao - Approved)
  const userManager: ManagerAccount = {
    id: "mgr_aman",
    name: "Aman Umrao",
    email: "amanumrao63@gmail.com",
    passwordHash: defaultPasswordHash,
    role: "MANAGER",
    status: "APPROVED",
    requestedAt: "2026-01-01T00:00:00.000Z",
    requestedRoleNote: "Warranty Operations & Adjudication",
    approvedBy: "System Bootstrap",
    approvedAt: "2026-01-01T00:00:00.000Z",
    createdAt: "2026-01-01T00:00:00.000Z",
  };
  managerAccounts.set(userManager.email.toLowerCase(), userManager);

  // 2. Seed Pending Manager Account (Awaiting Approval from Marcus Vance)
  const pendingManager: ManagerAccount = {
    id: "mgr_2",
    name: "Elena Rostova",
    email: "elena.rostova@warrantyarbiter.demo",
    passwordHash: defaultPasswordHash,
    role: "MANAGER",
    status: "PENDING",
    requestedAt: "2026-08-28T14:30:00.000Z",
    requestedRoleNote: "Regional Warranty Lead - Central EU & Nordics",
    createdAt: "2026-08-28T14:30:00.000Z",
  };
  managerAccounts.set(pendingManager.email.toLowerCase(), pendingManager);

  // 3. Seed Rejected Manager Account (For audit log & rejection login testing)
  const rejectedManager: ManagerAccount = {
    id: "mgr_3",
    name: "David Sterling",
    email: "david.sterling@external-contractor.com",
    passwordHash: defaultPasswordHash,
    role: "MANAGER",
    status: "REJECTED",
    requestedAt: "2026-08-20T09:15:00.000Z",
    requestedRoleNote: "External 3rd-Party Repair Auditor",
    rejectedBy: "Marcus Vance",
    rejectedAt: "2026-08-21T11:00:00.000Z",
    rejectionReason: "External contractors cannot hold managerial adjudication authority under Section 4 ISO governance.",
    createdAt: "2026-08-20T09:15:00.000Z",
  };
  managerAccounts.set(rejectedManager.email.toLowerCase(), rejectedManager);

  // 4. Seed Customer Accounts (e.g. Sarah Jenkins, Robert Chen, Priya Patel, Aman Umrao)
  const seedCustomers: CustomerAccount[] = [
    {
      id: "cust_1",
      name: "Sarah Jenkins",
      email: "sarah.jenkins@example.com",
      passwordHash: defaultPasswordHash,
      createdAt: "2026-08-01T10:00:00.000Z",
    },
    {
      id: "cust_2",
      name: "Robert Chen",
      email: "robert.chen@example.com",
      passwordHash: defaultPasswordHash,
      createdAt: "2026-08-05T12:00:00.000Z",
    },
    {
      id: "cust_3",
      name: "Priya Patel",
      email: "priya.patel@example.com",
      passwordHash: defaultPasswordHash,
      createdAt: "2026-08-10T15:00:00.000Z",
    },
    {
      id: "cust_aman",
      name: "Aman Umrao",
      email: "amanumrao63@gmail.com",
      passwordHash: defaultPasswordHash,
      createdAt: "2026-08-15T10:00:00.000Z",
    },
  ];

  for (const c of seedCustomers) {
    customerAccounts.set(c.email.toLowerCase(), c);
  }

  global.__AUTH_INITIALIZED__ = true;
}

// Auto-seed on load
initializeSeedAccounts().catch((err) => {
  console.error("Failed to seed auth accounts:", err);
});
