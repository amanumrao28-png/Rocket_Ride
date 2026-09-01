"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart3,
  Settings,
  Search,
  ArrowRight,
  Filter,
  RefreshCw,
  ExternalLink,
  Shield,
  FileText,
  User,
  SlidersHorizontal,
  ChevronRight,
  Zap,
  TrendingUp,
  Play,
  LogOut,
  UserCheck,
} from "lucide-react";
import { claimsApi } from "@/services/api/claimsApi";
import { authApi } from "@/services/api/auth";
import { Claim, ClaimStatus } from "@/types";
import { useAuth } from "@/context/AuthContext";

type SidebarTab =
  | "overview"
  | "all"
  | "pending"
  | "approved"
  | "rejected"
  | "needs_evidence"
  | "analytics"
  | "settings";

export default function ManagerDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<SidebarTab>("pending");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pendingManagerCount, setPendingManagerCount] = useState<number>(0);

  const [selectedDemoClaim, setSelectedDemoClaim] = useState<string>("CLM-1024");
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const handleRunDemo = async () => {
    if (!selectedDemoClaim) return;
    setIsResetting(true);
    try {
      await claimsApi.resetDemoClaim(selectedDemoClaim);
      router.push(`/claims/${selectedDemoClaim}/processing`);
    } catch (err) {
      alert("Failed to reset demo claim. " + (err instanceof Error ? err.message : ""));
      setIsResetting(false);
    }
  };

  const loadClaims = async () => {
    setIsLoading(true);
    try {
      const data = await claimsApi.listClaims();
      setClaims(data);
      // Fetch manager requests count
      try {
        const mgrs = await authApi.listManagers();
        setPendingManagerCount(mgrs.filter((m) => m.status === "PENDING").length);
      } catch {
        // ignore if not authorized
      }
    } catch (err) {
      console.error("Failed to load claims", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, []);

  // Compute live top stat cards
  const stats = useMemo(() => {
    const total = claims.length;
    const pending = claims.filter(
      (c) => c.status === "UNDER_REVIEW" || c.status === "SUBMITTED" || c.status === "ANALYZING"
    ).length;
    const approved = claims.filter((c) => c.status === "APPROVED").length;
    const rejected = claims.filter((c) => c.status === "REJECTED").length;
    const needsEvidence = claims.filter(
      (c) => c.status === "NEEDS_MORE_EVIDENCE" || c.validation?.evidence_conflict
    ).length;

    return { total, pending, approved, rejected, needsEvidence };
  }, [claims]);

  // Filter claims based on selected sidebar tab and search query
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      // Tab filter
      if (
        activeTab === "pending" &&
        !(claim.status === "UNDER_REVIEW" || claim.status === "SUBMITTED" || claim.status === "ANALYZING")
      ) {
        return false;
      }
      if (activeTab === "approved" && claim.status !== "APPROVED") return false;
      if (activeTab === "rejected" && claim.status !== "REJECTED") return false;
      if (
        activeTab === "needs_evidence" &&
        claim.status !== "NEEDS_MORE_EVIDENCE" &&
        !claim.validation?.evidence_conflict
      ) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = claim.claimId.toLowerCase().includes(q);
        const matchCust = claim.customer.name.toLowerCase().includes(q);
        const matchProd = `${claim.product.brand} ${claim.product.model}`.toLowerCase().includes(q);
        const matchSerial = claim.product.serialNumber.toLowerCase().includes(q);
        return matchId || matchCust || matchProd || matchSerial;
      }

      return true;
    });
  }, [claims, activeTab, searchQuery]);

  // Badge helpers
  const renderValidationBadge = (claim: Claim) => {
    const val = claim.validation;
    if (!val) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          UNVERIFIED
        </span>
      );
    }
    if (val.evidence_conflict || val.validation_status === "FAILED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          CONFLICT / FAIL
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        PASSED
      </span>
    );
  };

  const renderRecommendationBadge = (claim: Claim) => {
    const rec = claim.recommendation?.recommendation;
    if (!rec) {
      return <span className="text-xs text-slate-400 font-medium">Pending Analysis</span>;
    }
    if (rec === "REPLACE" || rec === "REPAIR" || rec === "REFUND") {
      return (
        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          {rec}
        </span>
      );
    }
    if (rec === "DENY") {
      return (
        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
          DENY
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
        REQUEST INFO
      </span>
    );
  };

  const renderStatusBadge = (status: ClaimStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            APPROVED
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
            REJECTED
          </span>
        );
      case "NEEDS_MORE_EVIDENCE":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            NEEDS EVIDENCE
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-300 animate-pulse">
            PENDING REVIEW
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-navy-950 flex flex-col md:flex-row font-sans selection:bg-navy-900 selection:text-white">
      {/* ========================================================================= */}
      {/* PERSISTENT SIDEBAR */}
      {/* ========================================================================= */}
      <aside className="w-full md:w-64 bg-navy-950 text-white flex flex-col shrink-0 border-r border-navy-900">
        {/* Brand */}
        <div className="p-6 border-b border-navy-900 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-tight block">
                Warranty Arbiter
              </span>
              <span className="text-[10px] text-slate-400 tracking-wide uppercase font-medium">
                Manager Workspace
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Categories */}
        <nav className="p-4 space-y-1.5 flex-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Decision Queue
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "overview"
                ? "bg-white/15 text-white shadow-sm"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 text-sky-400" />
              <span>Overview</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "pending"
                ? "bg-white/15 text-white shadow-sm"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Pending Review</span>
            </div>
            {stats.pending > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {stats.pending}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "all"
                ? "bg-white/15 text-white shadow-sm"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="w-4 h-4 text-slate-300" />
              <span>All Claims</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{stats.total}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("approved")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "approved"
                ? "bg-white/15 text-white shadow-sm"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Approved</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{stats.approved}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rejected")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "rejected"
                ? "bg-white/15 text-white shadow-sm"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Rejected</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{stats.rejected}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("needs_evidence")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "needs_evidence"
                ? "bg-white/15 text-white shadow-sm"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span>Needs More Evidence</span>
            </div>
            {stats.needsEvidence > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {stats.needsEvidence}
              </span>
            )}
          </button>

          <div className="pt-4 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            System &amp; Insights
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "analytics"
                ? "bg-white/15 text-white shadow-sm"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>Analytics &amp; SLA</span>
          </button>

          <Link
            href="/manager/approvals"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition"
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-sky-400" />
              <span>Manager Approvals</span>
            </div>
            {pendingManagerCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendingManagerCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "settings"
                ? "bg-white/15 text-white shadow-sm"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Policy Rules &amp; Models</span>
          </button>
        </nav>

        {/* User / Mode Footer */}
        <div className="p-4 border-t border-navy-900/80 bg-navy-900/40">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center text-slate-200 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || "Marcus Vance"}</p>
                <p className="text-[10px] text-slate-400 truncate">Senior Warranty Manager</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 pt-3 border-t border-navy-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Orchestrator:</span>
            <span className="text-sky-300 font-mono font-medium">RocketRide v2.0</span>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN DASHBOARD CONTENT AREA */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 shadow-subtle">
          <div>
            <h1 className="text-xl font-bold text-navy-950 capitalize tracking-tight">
              {activeTab.replace("_", " ")} Workspace
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              AI Recommendations pending Human Manager adjudication
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadClaims}
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
            <Link
              href="/customer/submit-claim"
              className="px-3.5 py-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
            >
              + New Test Claim
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* ========================================================================= */}
          {/* DEMO MODE LAUNCHER */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-5 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-sky-300">
                <Zap className="w-4 h-4" /> Interactive Pipeline Demo
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Select a seeded scenario to reset its state and watch the multi-agent AI pipeline analyze evidence live. Re-running resets the claim to its initial seed without corrupting demo data.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select 
                className="bg-navy-950 border border-navy-700 text-white text-xs font-semibold rounded-lg px-3 py-2.5 flex-1 md:w-64 focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={selectedDemoClaim}
                onChange={(e) => setSelectedDemoClaim(e.target.value)}
              >
                <option value="CLM-1024">CLM-1024 (Dell / Hardware Defect)</option>
                <option value="CLM-1025">CLM-1025 (HP / Physical Damage)</option>
                <option value="CLM-1026">CLM-1026 (Lenovo / Expired Warranty)</option>
                <option value="CLM-1027">CLM-1027 (Asus / Evidence Conflict)</option>
                <option value="CLM-1028">CLM-1028 (Missing Evidence / Low Conf)</option>
                <option value="CLM-1029">CLM-1029 (Pipeline Agent Failure)</option>
              </select>
              <button
                onClick={handleRunDemo}
                disabled={isResetting}
                className="bg-sky-500 hover:bg-sky-400 text-navy-950 font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm transition flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
              >
                {isResetting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-navy-950" />}
                Run Analysis
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TOP 5 STAT CARDS (Computed Live) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-subtle flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Claims
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-mono">
                  {stats.total}
                </span>
                <Inbox className="w-5 h-5 text-slate-400" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-subtle flex flex-col justify-between">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Pending Review
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-900 font-mono">
                  {stats.pending}
                </span>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-subtle flex flex-col justify-between">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Approved
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-900 font-mono">
                  {stats.approved}
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-subtle flex flex-col justify-between">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                Rejected
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-rose-900 font-mono">
                  {stats.rejected}
                </span>
                <XCircle className="w-5 h-5 text-rose-500" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-yellow-200 shadow-subtle flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="text-xs font-bold text-yellow-800 uppercase tracking-wider">
                Needs Evidence
              </span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-yellow-950 font-mono">
                  {stats.needsEvidence}
                </span>
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* OVERVIEW / ANALYTICS EXTRA PANELS */}
          {/* ========================================================================= */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-slate-200 shadow-subtle">
                <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-navy-700" /> Decision Distribution &amp; Turnaround
                </h3>
                <div className="grid grid-cols-3 gap-4 pt-2 text-center">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-500">Average AI Confidence</span>
                    <p className="text-xl font-bold text-navy-950 font-mono mt-1">94.2%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-500">Conflict Detection Rate</span>
                    <p className="text-xl font-bold text-rose-700 font-mono mt-1">25.0%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs text-slate-500">Manager Turnaround</span>
                    <p className="text-xl font-bold text-emerald-700 font-mono mt-1">4.2 min</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-subtle flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-navy-950 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-sky-600" /> Governance Invariant
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Automated approvals are locked. All claims require manual review with structured reasoning before RMA issuance.
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                  Active Security Policy: SEC-WAR-2026.08
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CLAIMS WORKBENCH TABLE */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
            {/* Table Filter & Search Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by customer, model, serial, or claim ID..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs text-navy-950 focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Showing {filteredClaims.length} of {claims.length} claims</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="py-3.5 px-4">Claim ID</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Product</th>
                    <th className="py-3.5 px-4">Submitted</th>
                    <th className="py-3.5 px-4">AI Recommendation</th>
                    <th className="py-3.5 px-4">Confidence</th>
                    <th className="py-3.5 px-4">Validation</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    // Loading Skeletons
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={`skel-${i}`} className="animate-pulse">
                        <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                        <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-32 mb-1.5"></div><div className="h-3 bg-slate-100 rounded w-24"></div></td>
                        <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-36 mb-1.5"></div><div className="h-3 bg-slate-100 rounded w-20"></div></td>
                        <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                        <td className="py-4 px-4"><div className="h-5 bg-slate-200 rounded w-16"></div></td>
                        <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                        <td className="py-4 px-4"><div className="h-5 bg-slate-200 rounded w-20"></div></td>
                        <td className="py-4 px-4"><div className="h-5 bg-slate-200 rounded w-24"></div></td>
                        <td className="py-4 px-4 text-right"><div className="h-6 bg-slate-200 rounded w-16 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : filteredClaims.length === 0 ? (
                    // Empty State
                    <tr>
                      <td colSpan={9} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <Inbox className="w-10 h-10 mb-3 text-slate-300" />
                          <p className="text-sm font-bold text-slate-500">No Claims Found</p>
                          <p className="text-xs mt-1">There are no claims matching your current filters.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map((claim) => {
                      const recConfidence = claim.recommendation?.confidence
                        ? Math.round(claim.recommendation.confidence * 100)
                        : null;

                      return (
                        <tr
                          key={claim.claimId}
                          onClick={() => router.push(`/claims/${encodeURIComponent(claim.claimId)}`)}
                          className="hover:bg-slate-50/80 cursor-pointer transition group"
                        >
                          {/* Claim ID */}
                          <td className="py-4 px-4 font-mono font-bold text-navy-950 group-hover:text-navy-700">
                            {claim.claimId}
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-4">
                            <span className="font-semibold text-navy-950 block">
                              {claim.customer.name}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate block max-w-[150px]">
                              {claim.customer.email}
                            </span>
                          </td>

                          {/* Product */}
                          <td className="py-4 px-4">
                            <span className="font-medium text-navy-950 block truncate max-w-[180px]">
                              {claim.product.brand} {claim.product.model}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              SN: {claim.product.serialNumber}
                            </span>
                          </td>

                          {/* Submitted */}
                          <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                            {new Date(claim.submittedAt).toLocaleDateString()}
                          </td>

                          {/* AI Recommendation */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {renderRecommendationBadge(claim)}
                          </td>

                          {/* Confidence Score */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {recConfidence !== null ? (
                              <div className="flex items-center gap-2">
                                <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      recConfidence >= 90
                                        ? "bg-emerald-600"
                                        : recConfidence >= 75
                                        ? "bg-amber-500"
                                        : "bg-rose-500"
                                    }`}
                                    style={{ width: `${recConfidence}%` }}
                                  />
                                </div>
                                <span className="font-mono font-semibold text-[11px] text-navy-900">
                                  {recConfidence}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </td>

                          {/* Validation */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {renderValidationBadge(claim)}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {renderStatusBadge(claim.status)}
                          </td>

                          {/* Action */}
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <Link
                              href={`/claims/${encodeURIComponent(claim.claimId)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white font-semibold text-[11px] shadow-sm transition"
                            >
                              Review <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
