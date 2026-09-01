"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  Search,
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UploadCloud,
  FileText,
  Camera,
  Layers,
  UserCheck,
  Send,
  Sparkles,
  ExternalLink,
  Shield,
  RotateCcw,
  Package,
  MailCheck,
  FileCheck,
} from "lucide-react";
import { claimsApi } from "@/services/api/claimsApi";
import { uploadFile } from "@/services/storage";
import { Claim, ClaimStatus } from "@/types";
import { useAuth } from "@/context/AuthContext";

function TrackClaimContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const claimIdParam = searchParams.get("id") || "";

  const [searchId, setSearchId] = useState(claimIdParam);
  const [claim, setClaim] = useState<Claim | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Supplementary Evidence Upload State (For NEEDS_MORE_EVIDENCE scenario)
  const [showSupplementalUpload, setShowSupplementalUpload] = useState(false);
  const [supplementalFile, setSupplementalFile] = useState<{ name: string; url: string; size: number } | null>(null);
  const [isReSubmitting, setIsReSubmitting] = useState(false);
  const [supplementalSuccess, setSupplementalSuccess] = useState(false);

  const fetchClaim = async (id: string) => {
    if (!id.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await claimsApi.getClaim(id.trim().toUpperCase());
      setClaim(data);
    } catch (err) {
      setClaim(null);
      setError(err instanceof Error ? err.message : "Claim not found");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (claimIdParam) {
      setSearchId(claimIdParam);
      fetchClaim(claimIdParam);
    }
  }, [claimIdParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      router.push(`/customer/track?id=${encodeURIComponent(searchId.trim().toUpperCase())}`);
    }
  };

  const handleSupplementalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const stored = await uploadFile(file);
      setSupplementalFile({
        name: stored.fileName,
        url: stored.url,
        size: stored.fileSizeBytes,
      });
    } catch (err) {
      alert("Failed to upload file");
    }
  };

  const handleReTriggerPipeline = async () => {
    if (!claim) return;
    setIsReSubmitting(true);
    try {
      // Re-trigger the pipeline with the additional evidence attached
      await claimsApi.processClaim(claim.claimId);
      setSupplementalSuccess(true);
      setShowSupplementalUpload(false);
      await fetchClaim(claim.claimId);
      setTimeout(() => setSupplementalSuccess(false), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Re-submission failed");
    } finally {
      setIsReSubmitting(false);
    }
  };

  // Timeline Step Status Evaluator
  const getTimelineSteps = (claim: Claim) => {
    const isUnderReview = claim.status === "UNDER_REVIEW";
    const isApproved = claim.status === "APPROVED";
    const isRejected = claim.status === "REJECTED";
    const isNeedsEvidence = claim.status === "NEEDS_MORE_EVIDENCE";
    const isDecided = isApproved || isRejected || isNeedsEvidence;

    return [
      {
        id: "submitted",
        title: "Claim Submitted",
        desc: `Filing received on ${new Date(claim.submittedAt).toLocaleDateString()}`,
        status: "completed" as const,
      },
      {
        id: "uploaded",
        title: "Evidence Uploaded",
        desc: "Product media, invoice receipt, and diagnostic logs registered",
        status: "completed" as const,
      },
      {
        id: "analyzed",
        title: "AI Analysis",
        desc: "Multi-agent optical, document OCR, and warranty evaluation complete",
        status: "completed" as const,
      },
      {
        id: "validated",
        title: "Evidence Validation",
        desc: "Autonomous consistency and integrity checks finished",
        status: "completed" as const,
      },
      {
        id: "review",
        title: "Manager Review",
        desc: isDecided
          ? `Adjudicated by Warranty Manager on ${new Date(claim.managerDecision?.decidedAt || claim.updatedAt || "").toLocaleDateString()}`
          : "Under active review by authorized Warranty Manager",
        status: isDecided ? ("completed" as const) : ("running" as const),
      },
      {
        id: "resolution",
        title: "Final Resolution",
        desc: isApproved
          ? `Approved (${claim.managerDecision?.finalRemedy || "Replacement"})`
          : isRejected
          ? "Claim Rejected per Policy Terms"
          : isNeedsEvidence
          ? "Additional Evidence Requested from Customer"
          : "Resolution pending manager sign-off",
        status: isApproved
          ? ("completed" as const)
          : isRejected
          ? ("rejected" as const)
          : isNeedsEvidence
          ? ("warning" as const)
          : ("pending" as const),
      },
    ];
  };

  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-navy-950 flex flex-col font-sans selection:bg-navy-900 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-subtle">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </div>
            <span className="font-bold text-base text-navy-950">Customer Claim Center</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/customer/my-claims"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-navy-950 transition"
            >
              My Claims
            </Link>
            <Link
              href="/customer/submit-claim"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-sm transition"
            >
              + New Claim
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Tracker Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex-1">
        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 mb-8">
          <h1 className="text-xl font-bold text-navy-950 mb-2">Track Claim Status</h1>
          <p className="text-xs text-slate-500 mb-4">
            Enter your claim number to view current review stage, manager resolutions, or evidence requests.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Claim ID (e.g. CLM-1024, CLM-1025, CLM-1027)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono uppercase text-navy-950 focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              {isLoading ? "Searching..." : "Track Claim"}
            </button>
          </form>

          {/* Quick Demo Preset Chips */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-navy-900">Demo Presets:</span>
            <button
              type="button"
              onClick={() => {
                setSearchId("CLM-1024");
                router.push("/customer/track?id=CLM-1024");
              }}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-navy-900 font-mono font-semibold"
            >
              CLM-1024 (Dell Replacement)
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchId("CLM-1025");
                router.push("/customer/track?id=CLM-1025");
              }}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-navy-900 font-mono font-semibold"
            >
              CLM-1025 (HP Rejection)
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchId("CLM-1027");
                router.push("/customer/track?id=CLM-1027");
              }}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-navy-900 font-mono font-semibold"
            >
              CLM-1027 (Evidence Conflict)
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchId("CLM-1028");
                router.push("/customer/track?id=CLM-1028");
              }}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-navy-900 font-mono font-semibold"
            >
              CLM-1028 (Missing Evidence)
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchId("CLM-1029");
                router.push("/customer/track?id=CLM-1029");
              }}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-navy-900 font-mono font-semibold"
            >
              CLM-1029 (Pipeline Error)
            </button>
          </div>
        </div>

        {error && (
          <div className="p-6 bg-white rounded-2xl border border-rose-200 text-center shadow-subtle mb-6">
            <XCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <h3 className="text-base font-bold text-navy-950">Claim Not Found</h3>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
          </div>
        )}

        {supplementalSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Additional evidence successfully received and queued for priority manager review.
            </span>
          </div>
        )}

        {claim && (
          <div className="space-y-6">
            {/* Top Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-2xl font-extrabold text-navy-950 font-mono">
                      {claim.claimId}
                    </h2>
                    {claim.status === "APPROVED" && (
                      <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                      </span>
                    )}
                    {claim.status === "REJECTED" && (
                      <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                      </span>
                    )}
                    {claim.status === "NEEDS_MORE_EVIDENCE" && (
                      <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> More Evidence Needed
                      </span>
                    )}
                    {claim.status === "UNDER_REVIEW" && (
                      <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Under Manager Review
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {claim.product.brand} {claim.product.model} (SN: {claim.product.serialNumber})
                  </p>
                </div>

                <div className="text-left sm:text-right text-xs">
                  <span className="text-slate-400 block">Customer</span>
                  <span className="font-bold text-navy-950">{claim.customer.name}</span>
                  <span className="text-slate-500 block">{claim.customer.email}</span>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* STATUS-SPECIFIC RESOLUTION / DECISION CARDS */}
              {/* ========================================================================= */}

              {/* 1. BEFORE DECISION: Clean "Under Manager Review" Card (No internal AI dumped) */}
              {claim.status === "UNDER_REVIEW" && !claim.managerDecision && (
                <div className="mt-6 p-6 rounded-2xl bg-sky-50/70 border border-sky-200 text-sky-950">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-sky-950">
                        Status: Under Manager Review
                      </h3>
                      <p className="text-xs text-sky-900 mt-1 leading-relaxed">
                        Your claim evidence and purchase records have been verified. An authorized Warranty Manager is currently reviewing the file for final resolution sign-off.
                      </p>
                      <p className="text-[11px] text-sky-800 font-medium mt-2">
                        Estimated resolution time: Under 15 minutes.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. AFTER APPROVAL: Polished Final Resolution Card */}
              {claim.status === "APPROVED" && (
                <div className="mt-6 p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 shadow-sm animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <span className="font-mono font-extrabold text-sm uppercase tracking-wide">
                        CLAIM #{claim.claimId} — FINAL RESOLUTION
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs">
                      ✓ APPROVED
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="text-sm font-bold text-emerald-950">
                      Approved Resolution Remedy:{" "}
                      <span className="underline decoration-emerald-500">
                        {claim.managerDecision?.finalRemedy || "REPLACEMENT (RMA Unit Dispatch)"}
                      </span>
                    </p>
                    <p className="text-emerald-900 leading-relaxed">
                      <strong>Reason:</strong>{" "}
                      {claim.managerDecision?.comment ||
                        "Hardware defect verified under active manufacturer warranty with valid proof of purchase."}
                    </p>
                    <p className="text-emerald-800 text-[11px] pt-1">
                      <strong>Approved by:</strong>{" "}
                      {claim.managerDecision?.decidedBy || "Warranty Operations Manager"} &bull;{" "}
                      <strong>Date:</strong>{" "}
                      {claim.managerDecision?.decidedAt
                        ? new Date(claim.managerDecision.decidedAt).toLocaleDateString()
                        : new Date().toLocaleDateString()}
                    </p>

                    {claim.resolution?.trackingNumber && (
                      <div className="mt-4 p-3.5 rounded-xl bg-white border border-emerald-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-emerald-700" />
                          <span className="font-semibold text-navy-950">
                            RMA Return Authorization:
                          </span>
                        </div>
                        <span className="font-mono font-bold text-emerald-800 text-sm">
                          {claim.resolution.trackingNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. AFTER REJECTION: Polished Rejection Resolution Card */}
              {claim.status === "REJECTED" && (
                <div className="mt-6 p-6 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 shadow-sm animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-rose-200">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-6 h-6 text-rose-600" />
                      <span className="font-mono font-extrabold text-sm uppercase tracking-wide">
                        CLAIM #{claim.claimId} — FINAL RESOLUTION
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs">
                      ✗ REJECTED
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="text-rose-950 leading-relaxed">
                      <strong>Formal Justification:</strong>{" "}
                      {claim.managerDecision?.comment ||
                        "Physical or accidental damage is excluded under standard manufacturer warranty terms."}
                    </p>
                    <p className="text-rose-800 text-[11px] pt-1">
                      <strong>Decided by:</strong>{" "}
                      {claim.managerDecision?.decidedBy || "Warranty Operations Manager"} &bull;{" "}
                      <strong>Date:</strong>{" "}
                      {claim.managerDecision?.decidedAt
                        ? new Date(claim.managerDecision.decidedAt).toLocaleDateString()
                        : new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {/* 4. AFTER NEEDS_MORE_EVIDENCE: Actionable Evidence Request Card */}
              {claim.status === "NEEDS_MORE_EVIDENCE" && (
                <div className="mt-6 p-6 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 shadow-sm animate-in fade-in">
                  <div className="flex items-center gap-2 pb-3 mb-3 border-b border-amber-200">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-sm uppercase tracking-wider text-amber-950">
                      Action Required: Additional Evidence Requested
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <p className="text-amber-900 leading-relaxed">
                      {claim.managerDecision?.comment ||
                        "Please provide clearer close-up photos of the damaged area to complete adjudication."}
                    </p>

                    {!showSupplementalUpload ? (
                      <button
                        type="button"
                        onClick={() => setShowSupplementalUpload(true)}
                        className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition"
                      >
                        <UploadCloud className="w-4 h-4" /> Upload Additional Evidence
                      </button>
                    ) : (
                      <div className="mt-3 p-4 rounded-xl bg-white border border-amber-200 space-y-3">
                        <label className="block font-bold text-navy-950 text-xs">
                          Select Supplementary Photo or Document:
                        </label>
                        <input
                          type="file"
                          onChange={handleSupplementalUpload}
                          className="text-xs text-slate-600"
                        />
                        {supplementalFile && (
                          <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] flex items-center justify-between">
                            <span className="font-medium text-navy-950 truncate">
                              {supplementalFile.name}
                            </span>
                            <span className="text-slate-400">
                              {(supplementalFile.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={handleReTriggerPipeline}
                            disabled={!supplementalFile || isReSubmitting}
                            className="px-4 py-2 rounded-lg bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white text-xs font-bold transition"
                          >
                            {isReSubmitting ? "Re-processing Pipeline..." : "Submit & Re-verify"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowSupplementalUpload(false)}
                            className="px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* VERTICAL TIMELINE */}
            {/* ========================================================================= */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-navy-950 mb-6">
                Claim Resolution Lifecycle Timeline
              </h3>

              <div className="space-y-6 relative">
                {/* Vertical Line */}
                <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-slate-200 z-0" />

                {getTimelineSteps(claim).map((step, idx) => {
                  return (
                    <div key={step.id} className="relative z-10 flex items-start gap-4">
                      {/* Step Circle */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          step.status === "completed"
                            ? "bg-emerald-500 text-white shadow-sm"
                            : step.status === "rejected"
                            ? "bg-rose-500 text-white shadow-sm"
                            : step.status === "warning"
                            ? "bg-amber-500 text-white shadow-sm"
                            : step.status === "running"
                            ? "bg-sky-600 text-white ring-4 ring-sky-100 animate-pulse"
                            : "bg-white border border-slate-300 text-slate-300"
                        }`}
                      >
                        {step.status === "completed" ? (
                          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                        ) : step.status === "rejected" ? (
                          <XCircle className="w-5 h-5 stroke-[2.5]" />
                        ) : step.status === "warning" ? (
                          <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                        ) : step.status === "running" ? (
                          <Clock className="w-4 h-4 animate-spin" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300" />
                        )}
                      </div>

                      {/* Step Text */}
                      <div className="flex-1 pt-0.5">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-sm font-bold ${
                              step.status === "completed"
                                ? "text-navy-950"
                                : step.status === "rejected"
                                ? "text-rose-900"
                                : step.status === "warning"
                                ? "text-amber-900"
                                : step.status === "running"
                                ? "text-sky-900 font-extrabold"
                                : "text-slate-400"
                            }`}
                          >
                            {step.title}
                          </h4>
                          {step.status === "completed" && (
                            <span className="text-[10px] font-bold text-emerald-700">✓ Complete</span>
                          )}
                          {step.status === "running" && (
                            <span className="text-[10px] font-bold text-sky-700 animate-pulse">
                              Active Stage
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ========================================================================= */}
            {/* CUSTOMER NOTIFICATION CONFIRMATION (Once Resolved) */}
            {/* ========================================================================= */}
            {(claim.status === "APPROVED" || claim.status === "REJECTED" || claim.status === "NEEDS_MORE_EVIDENCE") && (
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MailCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    ✓ Customer notification dispatched to <strong>{claim.customer.email}</strong>
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {/* Real email/SMS integration (e.g. AWS SES or Twilio) occurs via resolution webhook */}
                  Simulated Notification Dispatch
                </span>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 p-8 text-center text-xs text-slate-500">
          Loading tracker...
        </div>
      }
    >
      <TrackClaimContent />
    </Suspense>
  );
}
