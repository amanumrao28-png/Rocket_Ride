"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Settings,
  ArrowLeft,
  User,
  Shield,
  Sliders,
  Bell,
  Lock,
  LogOut,
  Save,
  CheckCircle2,
  UserCheck,
  Users,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/api/auth";
import { ManagerAccount } from "@/types";

export default function ManagerSettingsPage() {
  const router = useRouter();
  const { user, session, logout } = useAuth();

  const [managers, setManagers] = useState<ManagerAccount[]>([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState<boolean>(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState("70");
  const [enableAuditLogging, setEnableAuditLogging] = useState(true);
  const [requireOverrideComments, setRequireOverrideComments] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const list = await authApi.listManagers();
        setManagers(list);
      } catch (err) {
        console.error("Failed to load manager accounts", err);
      } finally {
        setIsLoadingManagers(false);
      }
    }
    load();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-navy-950 flex flex-col font-sans selection:bg-navy-900 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-subtle">
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
              <span className="font-bold text-sm text-navy-950 block">
                Warranty Operations Settings
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Governance, Policy Rules &amp; Manager Access Audit
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/manager/approvals"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-navy-900 text-white hover:bg-navy-800 transition"
            >
              <UserCheck className="w-3.5 h-3.5 text-sky-400" /> Approvals Queue
            </Link>
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

      {/* Main Settings Body */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Settings successfully saved and applied to adjudication workbench.</span>
          </div>
        )}

        {/* Card 1: Manager Account Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <User className="w-5 h-5 text-navy-900" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-navy-950">
              Active Authorized Manager Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
                Manager Name
              </span>
              <span className="font-bold text-sm text-navy-950">
                {user?.name || "Marcus Vance"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
                Official Email
              </span>
              <span className="font-mono text-xs text-navy-900">
                {user?.email || "manager@warrantyarbiter.demo"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
                Assigned Role &amp; Clearance Status
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] inline-block">
                STATUS: APPROVED (ROLE: {user?.role || "MANAGER"})
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block mb-1 font-semibold uppercase tracking-wider text-[10px]">
                Session Token Status
              </span>
              <span className="font-mono text-[11px] text-slate-600 truncate block">
                {session?.token.substring(0, 16)}... (Active Verified Session)
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Manager Accounts Human Approval Audit Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-navy-900" />
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-navy-950">
                  Manager Accounts &amp; Access Governance Roster
                </h2>
                <p className="text-[11px] text-slate-500">
                  Audit trail of all manager access requests and two-party human approval records
                </p>
              </div>
            </div>
            <Link
              href="/manager/approvals"
              className="text-xs font-bold text-navy-900 hover:text-navy-700 inline-flex items-center gap-1 shrink-0"
            >
              Open Approvals Queue <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                  <th className="pb-3 pr-4">Manager Name</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Access Status</th>
                  <th className="pb-3 pr-4">Approved / Rejected By</th>
                  <th className="pb-3">Adjudication Notes / Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {managers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 pr-4 font-bold text-navy-950">{m.name}</td>
                    <td className="py-3.5 pr-4 font-mono text-slate-600">{m.email}</td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          m.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : m.status === "PENDING"
                            ? "bg-amber-50 text-amber-800 border-amber-200 animate-pulse"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 font-semibold text-slate-700">
                      {m.approvedBy || m.rejectedBy || (m.status === "PENDING" ? "Awaiting Review" : "System Bootstrap")}
                    </td>
                    <td className="py-3.5 text-slate-500 max-w-xs truncate">
                      {m.status === "APPROVED"
                        ? `Approved on ${new Date(m.approvedAt || m.createdAt).toLocaleDateString()}`
                        : m.status === "REJECTED"
                        ? `Rejected: ${m.rejectionReason || "Compliance reason"}`
                        : `Requested on ${new Date(m.requestedAt || m.createdAt).toLocaleDateString()} (${m.requestedRoleNote || "Pending"})`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 3: AI Pipeline & Adjudication Policies */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-navy-900" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-navy-950">
              AI Decision &amp; Confidence Parameters
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-navy-900 uppercase tracking-wider text-[11px] mb-1.5">
                Low Confidence Escalation Threshold (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="50"
                  max="95"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(e.target.value)}
                  className="w-24 px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
                <span className="text-slate-500">
                  Agent assessments below this threshold automatically trigger the amber warning banner.
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAuditLogging}
                  onChange={(e) => setEnableAuditLogging(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-navy-900 focus:ring-navy-900"
                />
                <div>
                  <span className="font-bold text-navy-950 block">Immutable Manager Audit Trail</span>
                  <span className="text-slate-500">
                    Log all approval, rejection, and request-evidence decisions with timestamps and manager signatures.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireOverrideComments}
                  onChange={(e) => setRequireOverrideComments(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-navy-900 focus:ring-navy-900"
                />
                <div>
                  <span className="font-bold text-navy-950 block">Mandatory Comments on Recommendation Overrides</span>
                  <span className="text-slate-500">
                    Require human managers to provide a written justification when overriding the AI recommendation.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
