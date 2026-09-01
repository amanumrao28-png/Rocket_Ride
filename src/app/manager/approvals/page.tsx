"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Search,
  UserPlus,
  RefreshCw,
  LogOut,
  ShieldAlert,
  Loader2,
  Send,
} from "lucide-react";
import { authApi } from "@/services/api/auth";
import { useAuth } from "@/context/AuthContext";
import { ManagerAccount } from "@/types";

export default function ManagerApprovalsPage() {
  const { user, logout } = useAuth();
  const [managers, setManagers] = useState<ManagerAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal States
  const [selectedManager, setSelectedManager] = useState<ManagerAccount | null>(null);
  const [modalType, setModalType] = useState<"APPROVE" | "REJECT" | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const loadManagers = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const data = await authApi.listManagers();
      setManagers(data);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to load manager accounts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadManagers();
  }, []);

  const handleOpenModal = (manager: ManagerAccount, type: "APPROVE" | "REJECT") => {
    setSelectedManager(manager);
    setModalType(type);
    setRejectReason(type === "REJECT" ? "Does not meet departmental clearance requirements." : "");
  };

  const handleCloseModal = () => {
    setSelectedManager(null);
    setModalType(null);
    setRejectReason("");
  };

  const handleConfirmApprove = async () => {
    if (!selectedManager) return;
    setIsProcessing(true);
    setActionError(null);
    try {
      await authApi.approveManager(selectedManager.id);
      setActionSuccess(`Manager access for ${selectedManager.name} (${selectedManager.email}) approved!`);
      handleCloseModal();
      await loadManagers();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to approve manager");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedManager) return;
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejecting manager access.");
      return;
    }
    setIsProcessing(true);
    setActionError(null);
    try {
      await authApi.rejectManager(selectedManager.id, rejectReason.trim());
      setActionSuccess(`Manager access request for ${selectedManager.name} rejected.`);
      handleCloseModal();
      await loadManagers();
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reject manager");
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingManagers = managers.filter((m) => m.status === "PENDING");
  const processedManagers = managers.filter((m) => m.status !== "PENDING");

  return (
    <div className="min-h-screen bg-slate-50 text-navy-950 flex flex-col font-sans selection:bg-navy-900 selection:text-white">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/manager"
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition"
              title="Back to Manager Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-navy-900" />
                <h1 className="font-bold text-base sm:text-lg text-navy-950">
                  Manager Authorization &amp; Access Control
                </h1>
              </div>
              <p className="text-[11px] text-slate-500">
                Two-Party Human Approval Queue for Manager Clearance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadManagers}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {actionSuccess && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 text-center animate-in fade-in">
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="bg-rose-600 text-white text-xs font-semibold px-4 py-2.5 text-center animate-in fade-in">
          {actionError}
        </div>
      )}

      {/* Main Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        {/* Banner */}
        <div className="p-5 rounded-2xl bg-navy-900 text-white shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-bold uppercase tracking-wider mb-2 border border-sky-400/30">
              <ShieldAlert className="w-3.5 h-3.5" /> Human Governance Protocol
            </div>
            <h2 className="text-lg font-bold">Manager Onboarding Gate</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              In accordance with enterprise authorization standards, new managers cannot self-activate. An existing approved manager must review each applicant and grant explicit sign-off before dashboard access is permitted.
            </p>
          </div>

          <div className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-center shrink-0">
            <span className="text-2xl font-mono font-bold text-sky-400 block leading-tight">
              {pendingManagers.length}
            </span>
            <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
              Pending Requests
            </span>
          </div>
        </div>

        {/* Section 1: Pending Approval Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-950">
                Pending Manager Applications ({pendingManagers.length})
              </h3>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 text-navy-900 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-semibold">Loading authorization requests...</p>
            </div>
          ) : pendingManagers.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-navy-950 text-sm">No Pending Approvals</p>
              <p className="mt-1">All manager access requests have been adjudicated.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                    <th className="pb-3 pr-4">Applicant</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Role / Justification</th>
                    <th className="pb-3 pr-4">Requested Date</th>
                    <th className="pb-3 text-right">Adjudication Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingManagers.map((m) => {
                    const isSelf = user?.id === m.id;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 pr-4 font-bold text-navy-950">{m.name}</td>
                        <td className="py-4 pr-4 font-mono text-slate-600">{m.email}</td>
                        <td className="py-4 pr-4 text-slate-700 italic max-w-xs">
                          {m.requestedRoleNote || "Regional Manager Application"}
                        </td>
                        <td className="py-4 pr-4 text-slate-500">
                          {new Date(m.requestedAt || m.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 text-right">
                          {isSelf ? (
                            <span className="text-[11px] text-slate-400 italic font-semibold">
                              (Self — Cannot Approve)
                            </span>
                          ) : (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenModal(m, "APPROVE")}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenModal(m, "REJECT")}
                                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: Historical Manager Roster */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-navy-900" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-950">
                Authorized &amp; Historical Manager Accounts ({processedManagers.length})
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                  <th className="pb-3 pr-4">Manager Name</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Approved / Rejected By</th>
                  <th className="pb-3">Decision Date / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedManagers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 pr-4 font-bold text-navy-950">{m.name}</td>
                    <td className="py-3.5 pr-4 font-mono text-slate-600">{m.email}</td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          m.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 font-semibold text-slate-700">
                      {m.approvedBy || m.rejectedBy || "System Bootstrap"}
                    </td>
                    <td className="py-3.5 text-slate-500">
                      {m.approvedAt
                        ? new Date(m.approvedAt).toLocaleDateString()
                        : m.rejectedAt
                        ? `Rejected: ${m.rejectionReason || "Compliance Failure"}`
                        : "Initial Deployment"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Approve Confirmation Modal */}
      {modalType === "APPROVE" && selectedManager && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-navy-950">Approve Manager Clearance</h3>
                <p className="text-xs text-slate-500">Authorize dashboard adjudication access</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 mb-5">
              <p>
                <span className="font-semibold text-slate-500">Applicant:</span>{" "}
                <span className="font-bold text-navy-950">{selectedManager.name}</span>
              </p>
              <p>
                <span className="font-semibold text-slate-500">Email:</span>{" "}
                <span className="font-mono text-navy-900">{selectedManager.email}</span>
              </p>
              <p>
                <span className="font-semibold text-slate-500">Role Note:</span>{" "}
                <span className="italic text-slate-700">{selectedManager.requestedRoleNote || "Standard Warranty Manager"}</span>
              </p>
              <p className="pt-2 border-t border-slate-200 text-[11px] text-emerald-800 font-medium">
                Signing approval as: <span className="font-bold">{user?.name || "Marcus Vance"}</span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmApprove}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Authorizing...
                  </>
                ) : (
                  "Confirm Approval"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {modalType === "REJECT" && selectedManager && (
        <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-navy-950">Reject Manager Application</h3>
                <p className="text-xs text-slate-500">Deny manager access clearance</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-4">
              <p>
                Rejecting access for: <span className="font-bold text-navy-950">{selectedManager.name}</span> ({selectedManager.email})
              </p>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1.5">
                Rejection Justification <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="State the governance or policy reason for rejecting this manager account..."
                required
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-navy-950 focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmReject}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Rejecting...
                  </>
                ) : (
                  "Confirm Rejection"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
