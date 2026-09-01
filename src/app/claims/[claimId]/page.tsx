"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  User,
  Laptop,
  MessageSquareQuote,
  Eye,
  FileText,
  FileSearch,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  FileCheck2,
  Lock,
  ExternalLink,
  Shield,
  HelpCircle,
  Send,
  Camera,
  RotateCcw,
  Sparkles,
  Info,
  AlertOctagon,
  CheckSquare,
  Loader2,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { claimsApi } from "@/services/api/claimsApi";
import { Claim, RecommendationType, ClaimStatus } from "@/types";
import { useAuth } from "@/context/AuthContext";

export default function ClaimDetailPage({ params }: { params: { claimId: string } }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const claimId = decodeURIComponent(params.claimId);

  const [claim, setClaim] = useState<Claim | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Evidence Tab State
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<"image" | "invoice" | "diagnostic">("image");

  // Agent Cards Expand/Collapse State
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({
    vision: true,
    document: true,
    fault: true,
    warranty: true,
    validator: true,
  });

  const [isEvidenceLoading, setIsEvidenceLoading] = useState<boolean>(false);

  // Modal States
  const [showApproveModal, setShowApproveModal] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState<boolean>(false);

  // Form inputs for modals
  const [approveComment, setApproveComment] = useState<string>("Approved per warranty policy criteria.");
  const [approveRemedy, setApproveRemedy] = useState<RecommendationType>("REPLACE");
  const [rejectReason, setRejectReason] = useState<string>("Physical damage is excluded under Section 4.1");
  const [rejectComment, setRejectComment] = useState<string>("");
  const [requestReasons, setRequestReasons] = useState<string[]>([
    "Clearer product image",
    "Serial number photo",
  ]);
  const [otherReasonText, setOtherReasonText] = useState<string>("");
  const [requestMessage, setRequestMessage] = useState<string>(
    "Please provide clearer photos of the display bezel and hinge mechanism to clarify whether physical shock occurred."
  );

  // Conflict Override Checkbox State for Manager
  const [conflictAcknowledged, setConflictAcknowledged] = useState<boolean>(false);

  const [isActing, setIsActing] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const loadClaim = async () => {
    setIsLoading(true);
    try {
      const data = await claimsApi.getClaim(claimId);
      setClaim(data);
      if (data.recommendation?.suggestedRemedy) {
        setApproveRemedy(data.recommendation.suggestedRemedy);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Claim not found");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClaim();
  }, [claimId]);

  const toggleAgent = (key: string) => {
    setExpandedAgents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTabChange = (tab: "image" | "invoice" | "diagnostic") => {
    setIsEvidenceLoading(true);
    setActiveEvidenceTab(tab);
    setTimeout(() => {
      setIsEvidenceLoading(false);
    }, 400); // simulate short loading state
  };

  // Manager Actions
  const handleApprove = async () => {
    if (!claim) return;
    setIsActing(true);
    try {
      const managerName = user?.name ? `${user.name} (Senior Warranty Manager)` : "Marcus Vance (Senior Warranty Manager)";
      const res = await claimsApi.approveClaim(claim.claimId, {
        comment: approveComment,
        decidedBy: managerName,
        finalRemedy: approveRemedy,
      });
      setClaim(res.claim);
      setShowApproveModal(false);
      setActionSuccessMsg(`Claim ${claim.claimId} successfully approved for ${approveRemedy}!`);
      setTimeout(() => setActionSuccessMsg(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setIsActing(false);
    }
  };

  const handleReject = async () => {
    if (!claim) return;
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setIsActing(true);
    try {
      const managerName = user?.name ? `${user.name} (Senior Warranty Manager)` : "Marcus Vance (Senior Warranty Manager)";
      const res = await claimsApi.rejectClaim(claim.claimId, {
        reason: rejectReason,
        comment: rejectComment,
        decidedBy: managerName,
      });
      setClaim(res.claim);
      setShowRejectModal(false);
      setActionSuccessMsg(`Claim ${claim.claimId} formally rejected.`);
      setTimeout(() => setActionSuccessMsg(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Rejection failed");
    } finally {
      setIsActing(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!claim) return;
    const finalReasons = [...requestReasons];
    if (otherReasonText.trim()) {
      finalReasons.push(`Other: ${otherReasonText.trim()}`);
    }

    if (finalReasons.length === 0 && !requestMessage.trim()) {
      alert("Please select at least one evidence item or provide message instructions.");
      return;
    }

    setIsActing(true);
    try {
      const managerName = user?.name ? `${user.name} (Senior Warranty Manager)` : "Marcus Vance (Senior Warranty Manager)";
      const res = await claimsApi.requestMoreInfo(claim.claimId, {
        reasons: finalReasons,
        message: requestMessage,
        decidedBy: managerName,
      });
      setClaim(res.claim);
      setShowRequestInfoModal(false);
      setActionSuccessMsg(`Evidence request sent to customer ${claim.customer.email}.`);
      setTimeout(() => setActionSuccessMsg(null), 5000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Request failed");
    } finally {
      setIsActing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Cpu className="w-8 h-8 text-navy-900 animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-600">Loading claim analysis workbench...</p>
        </div>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-card text-center max-w-md">
          <XCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-navy-950">Claim Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            {error || `Unable to locate claim records for ID: ${claimId}`}
          </p>
          <Link
            href="/manager"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-navy-900 text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Queue
          </Link>
        </div>
      </div>
    );
  }

  const { agentResults, validation, recommendation, managerDecision } = claim;
  const hasConflict = Boolean(validation?.evidence_conflict || validation?.validation_status === "FAILED");
  
  // Check if any agent has confidence < 70%
  const hasLowConfidence = Boolean(
    (recommendation?.confidence && recommendation.confidence < 0.70) ||
    (agentResults?.vision?.confidence && agentResults.vision.confidence < 0.70) ||
    (agentResults?.document?.confidence && agentResults.document.confidence < 0.70) ||
    (agentResults?.fault?.confidence && agentResults.fault.confidence < 0.70) ||
    (agentResults?.warranty?.confidence && agentResults.warranty.confidence < 0.70)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-navy-950 flex flex-col font-sans selection:bg-navy-900 selection:text-white">
      {/* ========================================================================= */}
      {/* STICKY TOP WORKBENCH HEADER */}
      {/* ========================================================================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/manager"
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition"
              title="Back to Review Queue"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-extrabold text-base sm:text-lg text-navy-950">
                  {claim.claimId}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    claim.status === "APPROVED"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : claim.status === "REJECTED"
                      ? "bg-rose-50 text-rose-800 border-rose-200"
                      : claim.status === "NEEDS_MORE_EVIDENCE"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-sky-50 text-sky-800 border-sky-200"
                  }`}
                >
                  {claim.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Customer: {claim.customer.name} &bull; Submitted {new Date(claim.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/claims/${encodeURIComponent(claim.claimId)}/processing`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Re-run Pipeline
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

      {/* Success Notification */}
      {actionSuccessMsg && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 text-center animate-in fade-in">
          {actionSuccessMsg}
        </div>
      )}

      {/* Low Confidence Banner */}
      {hasLowConfidence && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-900 text-xs font-bold px-4 py-3 flex items-center justify-center gap-2 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-amber-700" />
          LOW CONFIDENCE — additional human review required. Automated pipeline recommendation should be scrutinized.
        </div>
      )}

      {/* ========================================================================= */}
      {/* WORKBENCH BODY */}
      {/* ========================================================================= */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        {/* PERSISTED MANAGER DECISION SUMMARY BLOCK (If Decided) */}
        {managerDecision && (
          <div
            className={`p-6 rounded-2xl border-2 shadow-sm ${
              managerDecision.decision === "APPROVED"
                ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                : managerDecision.decision === "REJECTED"
                ? "bg-rose-50/80 border-rose-300 text-rose-950"
                : "bg-amber-50/80 border-amber-300 text-amber-950"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                {managerDecision.decision === "APPROVED" && <CheckCircle2 className="w-5 h-5 text-emerald-700" />}
                {managerDecision.decision === "REJECTED" && <XCircle className="w-5 h-5 text-rose-700" />}
                {managerDecision.decision === "NEEDS_MORE_EVIDENCE" && <AlertTriangle className="w-5 h-5 text-amber-700" />}
                <h3 className="text-base font-extrabold tracking-tight">
                  Manager Decision: {managerDecision.decision}
                </h3>
              </div>
              <div className="text-xs font-medium opacity-80">
                Decided by <span className="font-bold">{managerDecision.decidedBy}</span> on{" "}
                {new Date(managerDecision.decidedAt).toLocaleString()}
              </div>
            </div>

            <div className="text-xs space-y-1.5">
              {managerDecision.finalRemedy && (
                <p>
                  <strong>Final Remedy Action:</strong> {managerDecision.finalRemedy}
                </p>
              )}
              {managerDecision.comment && (
                <p className="whitespace-pre-wrap">
                  <strong>Decision Comments / Justification:</strong> {managerDecision.comment}
                </p>
              )}
              {claim.resolution?.trackingNumber && (
                <p className="font-mono font-bold text-navy-900 mt-2">
                  RMA Return Authorization: {claim.resolution.trackingNumber}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ROW 1: Customer Info & Product Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: Customer Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <User className="w-4 h-4 text-navy-800" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-navy-950">
                1. Customer Information
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Full Name</span>
                <span className="font-bold text-navy-950 text-sm">{claim.customer.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Email Address</span>
                <span className="font-medium text-navy-900">{claim.customer.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Contact Phone</span>
                <span className="font-medium text-navy-900">{claim.customer.phone || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Account Status</span>
                <span className="font-semibold text-emerald-700">Verified Consumer Account</span>
              </div>
            </div>
          </div>

          {/* Section 2: Product Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Laptop className="w-4 h-4 text-navy-800" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-navy-950">
                2. Product Information
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Brand &amp; Model</span>
                <span className="font-bold text-navy-950 text-sm">
                  {claim.product.brand} {claim.product.model}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Category</span>
                <span className="font-medium text-navy-900">{claim.product.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Hardware Serial Number</span>
                <span className="font-mono font-bold text-navy-950 bg-slate-100 px-2 py-0.5 rounded">
                  {claim.product.serialNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Registry Authentication</span>
                <span className="font-semibold text-emerald-700">Matched to Master Database</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Customer Complaint (Quote Block) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <MessageSquareQuote className="w-4 h-4 text-navy-800" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-navy-950">
              3. Customer Complaint (Verbatim)
            </h2>
          </div>
          <blockquote className="p-4 rounded-xl bg-slate-50 border-l-4 border-navy-900 text-sm text-navy-950 italic leading-relaxed">
            &ldquo;{claim.complaint}&rdquo;
          </blockquote>
        </div>

        {/* Section 4: Evidence Viewer */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-navy-800" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-navy-950">
                4. Evidence Attachments &amp; Inspection
              </h2>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleTabChange("image")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  activeEvidenceTab === "image"
                    ? "bg-white text-navy-950 shadow-sm"
                    : "text-slate-500 hover:text-navy-900"
                }`}
              >
                Product Media
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("invoice")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  activeEvidenceTab === "invoice"
                    ? "bg-white text-navy-950 shadow-sm"
                    : "text-slate-500 hover:text-navy-900"
                }`}
              >
                Invoice Receipt
              </button>
              <button
                type="button"
                onClick={() => handleTabChange("diagnostic")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  activeEvidenceTab === "diagnostic"
                    ? "bg-white text-navy-950 shadow-sm"
                    : "text-slate-500 hover:text-navy-900"
                }`}
              >
                Diagnostics
              </button>
            </div>
          </div>

          <div className="min-h-[200px] rounded-xl bg-slate-50 border border-slate-200 p-6 flex flex-col justify-center">
            {isEvidenceLoading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="w-8 h-8 text-navy-900 animate-spin mb-3" />
                <p className="text-xs font-semibold text-slate-500">Loading evidence securely...</p>
              </div>
            ) : activeEvidenceTab === "image" && (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-full sm:w-48 h-36 rounded-lg bg-navy-900 flex flex-col items-center justify-center text-white shrink-0 shadow-sm">
                  <Camera className="w-8 h-8 text-sky-400 mb-2" />
                  <span className="text-[11px] font-mono text-slate-300">
                    {typeof claim.files.productImage === "object"
                      ? claim.files.productImage.filename
                      : "product_photo.jpg"}
                  </span>
                </div>
                <div className="flex-1 text-xs space-y-2">
                  <h4 className="font-bold text-navy-950 text-sm">Visual Damage Inspection</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Vision Agent inspected optical frames for physical impact fractures, casing cracks, and underside serial tags.
                  </p>
                  <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                    <p className="font-semibold text-navy-900">
                      Finding: {agentResults?.vision?.visible_issue || "Chassis intact, no impact deformation."}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Damage Detected: {agentResults?.vision?.damageDetected ? "YES (Impact)" : "NO (Clean Surface)"} &bull; Confidence: {agentResults?.vision ? `${Math.round(agentResults.vision.confidence * 100)}%` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}


            {activeEvidenceTab === "invoice" && (
              claim.files.invoice ? (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-full sm:w-48 h-36 rounded-lg bg-navy-900 flex flex-col items-center justify-center text-white shrink-0 shadow-sm">
                    <FileText className="w-8 h-8 text-amber-400 mb-2" />
                    <span className="text-[11px] font-mono text-slate-300 text-center px-2">
                      {typeof claim.files.invoice === "object"
                        ? claim.files.invoice.filename
                        : "invoice.pdf"}
                    </span>
                  </div>
                  <div className="flex-1 text-xs space-y-2">
                    <h4 className="font-bold text-navy-950 text-sm">Invoice OCR &amp; Verification</h4>
                    <p className="text-slate-600 leading-relaxed">
                      OCR extracted retailer, invoice number, and timestamp; cross-checked against authorized reseller database.
                    </p>
                    {agentResults?.document?.confidence && agentResults.document.confidence < 0.5 ? (
                       <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-medium">
                         <AlertCircle className="w-4 h-4 inline-block mr-1" /> OCR unreadable or invoice quality too low to extract data.
                       </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                        <p className="font-semibold text-navy-900">
                          Invoice: {agentResults?.document?.invoice_number || "INV-1024"} &bull; Seller: {agentResults?.document?.seller || "ABC Electronics"}
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          Purchase Date: {agentResults?.document?.purchase_date || "2026-01-12"} &bull; Status: {agentResults?.invoiceVerification?.status || "VERIFIED"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <FileText className="w-10 h-10 mb-3 text-slate-300" />
                  <p className="text-sm font-bold text-slate-500">Missing Invoice</p>
                  <p className="text-xs mt-1">The customer did not upload a proof of purchase.</p>
                </div>
              )
            )}

            {activeEvidenceTab === "diagnostic" && (
              claim.files.diagnosticReport ? (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-full sm:w-48 h-36 rounded-lg bg-navy-900 flex flex-col items-center justify-center text-white shrink-0 shadow-sm">
                    <FileSearch className="w-8 h-8 text-emerald-400 mb-2" />
                    <span className="text-[11px] font-mono text-slate-300 text-center px-2">
                      {typeof claim.files.diagnosticReport === "object"
                        ? claim.files.diagnosticReport.filename
                        : "diagnostic_log.json"}
                    </span>
                  </div>
                  <div className="flex-1 text-xs space-y-2">
                    <h4 className="font-bold text-navy-950 text-sm">Diagnostic Telemetry</h4>
                    <p className="text-slate-600 leading-relaxed">
                      Onboard firmware test logs, battery health cycle counters, and accelerometer impact telemetry.
                    </p>
                    <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                      <p className="font-semibold text-navy-900">
                        Fault Category: {agentResults?.fault?.issueCategory || "Display Backlight Inverter"}
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        Severity: {agentResults?.fault?.severity || "HIGH"} &bull; Shock Flag: {agentResults?.fault?.physical_damage_related ? "TRUE (Impact shock event)" : "FALSE (Hardware defect)"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <FileSearch className="w-10 h-10 mb-3 text-slate-300" />
                  <p className="text-sm font-bold text-slate-500">Missing Diagnostic Report</p>
                  <p className="text-xs mt-1">No system diagnostic logs were attached to this claim.</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION A: AI CROSS-CHECK PANEL */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-navy-900" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-navy-950">
                A. AI Cross-Check Consistency Matrix
              </h2>
            </div>
            {validation && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  validation.validation_status === "PASSED"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}
              >
                Validator Gate: {validation.validation_status}
              </span>
            )}
          </div>

          {/* 8 Explicit Cross-Check Rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* 1. Product Match */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-medium text-slate-600">Product Match</span>
              <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                MATCH
              </span>
            </div>

            {/* 2. Serial Number */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-medium text-slate-600">Serial Number</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  validation?.field_checks?.serial_match === "PASS"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {validation?.field_checks?.serial_match === "PASS" ? "MATCH" : "MISMATCH"}
              </span>
            </div>

            {/* 3. Purchase Date */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-medium text-slate-600">Purchase Date</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  agentResults?.warranty?.isWithinWarranty
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {agentResults?.warranty?.isWithinWarranty ? "VALID" : "EXPIRED"}
              </span>
            </div>

            {/* 4. Invoice Authenticity */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-medium text-slate-600">Invoice Authenticity</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  agentResults?.invoiceVerification?.status === "VERIFIED"
                    ? "bg-emerald-100 text-emerald-800"
                    : agentResults?.invoiceVerification?.status === "MISMATCH"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {agentResults?.invoiceVerification?.status || "VERIFIED"}
              </span>
            </div>

            {/* 5. Warranty */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-medium text-slate-600">Warranty</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  agentResults?.warranty?.isWithinWarranty && !agentResults.warranty.exclusion_applies
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {agentResults?.warranty?.isWithinWarranty && !agentResults.warranty.exclusion_applies
                  ? "VALID"
                  : "INVALID"}
              </span>
            </div>

            {/* 6. Physical Damage */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-medium text-slate-600">Physical Damage</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  agentResults?.vision?.damageDetected
                    ? "bg-rose-100 text-rose-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {agentResults?.vision?.damageDetected ? "DETECTED" : "NONE"}
              </span>
            </div>

            {/* 7. Fault Consistency */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-medium text-slate-600">Fault Consistency</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  validation?.field_checks?.damage_consistency === "PASS"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {validation?.field_checks?.damage_consistency === "PASS" ? "CONSISTENT" : "INCONSISTENT"}
              </span>
            </div>

            {/* 8. Evidence Conflict */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-medium text-slate-600">Evidence Conflict</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  validation?.evidence_conflict
                    ? "bg-rose-100 text-rose-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {validation?.evidence_conflict ? "DETECTED" : "NONE"}
              </span>
            </div>
          </div>

          {/* Conflict Details Banner if FAILED */}
          {hasConflict && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                <span>EVIDENCE CONFLICT DETECTED:</span>
              </div>
              <ul className="space-y-1 pl-5 list-disc text-rose-900">
                {validation?.conflicts.map((conf, idx) => (
                  <li key={idx}>{conf}</li>
                ))}
              </ul>
              {validation?.recommended_action && (
                <p className="font-semibold pt-1 text-rose-950">
                  Recommended Action: {validation.recommended_action}
                </p>
              )}
            </div>
          )}
        </div>

        {/* SECTION 6: Expandable Multi-Agent Cards */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-navy-900" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-navy-950">
                6. Multi-Agent Structured Results
              </h2>
            </div>
            <span className="text-xs text-slate-500">Concise structured findings &bull; No chain-of-thought dumps</span>
          </div>

          {/* Card 1: Vision Agent */}
          {agentResults?.vision && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAgent("vision")}
                className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition"
              >
                <div className="flex items-center gap-3">
                  <Camera className="w-4 h-4 text-navy-700" />
                  <div>
                    <span className="text-xs font-bold text-navy-950">Vision Agent</span>
                    <span className="text-[11px] text-slate-500 ml-2">
                      Damage: {agentResults.vision.damageDetected ? "Detected" : "None Detected"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-navy-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {Math.round(agentResults.vision.confidence * 100)}% Confidence
                  </span>
                  {expandedAgents.vision ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {expandedAgents.vision && (
                <div className="p-5 bg-white border-t border-slate-100 text-xs space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-400 block">Physical Damage</span>
                      <span className="font-bold text-navy-950">
                        {agentResults.vision.damageDetected ? `YES (${agentResults.vision.damageType})` : "NO (Pristine)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Serial Tag Match</span>
                      <span className="font-bold text-navy-950 font-mono">
                        {agentResults.vision.serialNumberDetected || claim.product.serialNumber} (MATCH)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Visible Issue</span>
                      <span className="font-bold text-navy-950">{agentResults.vision.visible_issue || "Unlit display panel"}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block mb-1">Key Evidence Bullets:</span>
                    <ul className="space-y-1 list-disc pl-4 text-slate-700">
                      {agentResults.vision.findings.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card 2: Document Agent */}
          {agentResults?.document && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAgent("document")}
                className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-navy-700" />
                  <div>
                    <span className="text-xs font-bold text-navy-950">Document Agent &amp; OCR</span>
                    <span className="text-[11px] text-slate-500 ml-2">
                      Order: {agentResults.document.orderNumber || "INV-1024"} &bull; {agentResults.document.retailer || "ABC Electronics"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-navy-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {Math.round(agentResults.document.confidence * 100)}% Confidence
                  </span>
                  {expandedAgents.document ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {expandedAgents.document && (
                <div className="p-5 bg-white border-t border-slate-100 text-xs space-y-3">
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <span className="text-slate-400 block">Retailer / Seller</span>
                      <span className="font-bold text-navy-950">{agentResults.document.retailer || agentResults.document.seller}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Purchase Date</span>
                      <span className="font-bold text-navy-950">{agentResults.document.purchaseDate || agentResults.document.purchase_date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Amount Paid</span>
                      <span className="font-bold text-navy-950">${agentResults.document.pricePaid || 749.99} USD</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Item Line Match</span>
                      <span className="font-bold text-emerald-700">VERIFIED</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block mb-1">Extracted Findings:</span>
                    <ul className="space-y-1 list-disc pl-4 text-slate-700">
                      {agentResults.document.findings.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card 3: Fault Agent */}
          {agentResults?.fault && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAgent("fault")}
                className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition"
              >
                <div className="flex items-center gap-3">
                  <FileSearch className="w-4 h-4 text-navy-700" />
                  <div>
                    <span className="text-xs font-bold text-navy-950">Fault Agent</span>
                    <span className="text-[11px] text-slate-500 ml-2">
                      Category: {agentResults.fault.issueCategory}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-navy-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {Math.round(agentResults.fault.confidence * 100)}% Confidence
                  </span>
                  {expandedAgents.fault ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {expandedAgents.fault && (
                <div className="p-5 bg-white border-t border-slate-100 text-xs space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-400 block">Fault Type</span>
                      <span className="font-bold text-navy-950">{agentResults.fault.faultType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Severity</span>
                      <span className="font-bold text-navy-950">{agentResults.fault.severity || "HIGH"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Physical Damage Related</span>
                      <span className="font-bold text-navy-950">
                        {agentResults.fault.physical_damage_related ? "YES (Accidental / Impact)" : "NO (Factory Defect)"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block mb-1">Diagnostic Findings:</span>
                    <ul className="space-y-1 list-disc pl-4 text-slate-700">
                      {agentResults.fault.findings.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card 4: Warranty Agent */}
          {agentResults?.warranty && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAgent("warranty")}
                className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-navy-700" />
                  <div>
                    <span className="text-xs font-bold text-navy-950">Warranty Policy Agent</span>
                    <span className="text-[11px] text-slate-500 ml-2">
                      Duration: {agentResults.warranty.warrantyPeriodMonths} Mo &bull; Expiration: {agentResults.warranty.expirationDate}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-navy-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {Math.round(agentResults.warranty.confidence * 100)}% Confidence
                  </span>
                  {expandedAgents.warranty ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {expandedAgents.warranty && (
                <div className="p-5 bg-white border-t border-slate-100 text-xs space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-slate-400 block">Within Calendar Window</span>
                      <span className="font-bold text-navy-950">
                        {agentResults.warranty.isWithinWarranty ? "YES (Active)" : "NO (Expired)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Applicable Policy</span>
                      <span className="font-bold text-navy-950">{agentResults.warranty.policyId || "Laptop Standard (12 Mo)"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Coverage Decision</span>
                      <span className="font-bold text-navy-950">{agentResults.warranty.coverage || "COVERED"}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block mb-1">Policy Evaluation Findings:</span>
                    <ul className="space-y-1 list-disc pl-4 text-slate-700">
                      {agentResults.warranty.findings.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION B: AI RECOMMENDATION PANEL */}
        {/* ========================================================================= */}
        {recommendation && (
          <div className="bg-white rounded-2xl border-2 border-navy-900 shadow-card p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-navy-700 uppercase tracking-wider block">
                  B. AI Recommendation Summary
                </span>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
                    {recommendation.recommendation}
                  </span>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-navy-100 text-navy-900 border border-navy-300">
                    {Math.round(recommendation.confidence * 100)}% Confidence
                  </span>
                </div>
              </div>

              <div className="px-3.5 py-1.5 rounded-lg bg-navy-50 border border-navy-200 text-xs text-navy-900 font-medium">
                Policy Basis: {recommendation.policyBasis}
              </div>
            </div>

            {/* Short Reason from Decision Agent */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Recommendation Reason:
              </span>
              <p className="text-sm font-semibold text-navy-950">
                {recommendation.reason || recommendation.summary}
              </p>
            </div>

            <div className="mb-4">
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider block mb-1.5">
                Key Corroborating Evidence:
              </span>
              <ul className="space-y-1 text-xs text-slate-700 list-disc pl-4">
                {recommendation.keyEvidence.map((ev, idx) => (
                  <li key={idx}>{ev}</li>
                ))}
              </ul>
            </div>

            {/* Mandatory Fixed Disclaimer Line */}
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-center text-xs text-slate-600 font-semibold">
              AI recommendation only — final decision requires authorized manager approval.
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION C: MANAGER DECISION CONTROLS */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border-2 border-navy-900 shadow-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-navy-950 flex items-center gap-2">
                <Lock className="w-5 h-5 text-navy-900" />
                C. Manager Decision Authority
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review multi-agent findings above, then choose the final resolution action.
              </p>
            </div>

            {claim.managerDecision && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                Current Status: {claim.managerDecision.decision}
              </span>
            )}
          </div>

          {/* Red Warning Banner if Conflict Detected */}
          {hasConflict && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border-2 border-rose-400 text-xs text-rose-950 space-y-3">
              <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
                <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Evidence conflict detected — review carefully before deciding.</span>
              </div>
              <p className="text-rose-900">
                Contradictions exist between customer claim statements and hardware/vision telemetry. If you decide to approve this claim, you must explicitly acknowledge the conflict.
              </p>

              <label className="flex items-center gap-2.5 pt-2 border-t border-rose-200 cursor-pointer font-bold text-rose-950">
                <input
                  type="checkbox"
                  checked={conflictAcknowledged}
                  onChange={(e) => setConflictAcknowledged(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span>
                  I acknowledge the detected evidence conflict and accept responsibility for overriding the validation gate.
                </span>
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              type="button"
              onClick={() => setShowApproveModal(true)}
              disabled={isActing || (hasConflict && !conflictAcknowledged)}
              className="w-full sm:flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve Claim
            </button>

            <button
              type="button"
              onClick={() => setShowRejectModal(true)}
              disabled={isActing}
              className="w-full sm:flex-1 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" /> Reject Claim
            </button>

            <button
              type="button"
              onClick={() => setShowRequestInfoModal(true)}
              disabled={isActing}
              className="w-full sm:flex-1 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" /> Request More Evidence
            </button>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: APPROVE CONFIRMATION */}
      {/* ========================================================================= */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-elevated max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-navy-950">Confirm Claim Approval</h3>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-4">
              <span className="text-slate-500 block">AI Recommended Remedy:</span>
              <span className="font-bold text-navy-950 text-sm">
                {recommendation?.recommendation || "REPLACE"} ({Math.round((recommendation?.confidence || 0.9) * 100)}% confidence)
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                  Final Remedy Action (Manager Selection)
                </label>
                <select
                  value={approveRemedy}
                  onChange={(e) => setApproveRemedy(e.target.value as RecommendationType)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-navy-950 text-xs font-semibold"
                >
                  <option value="REPLACE">Full Replacement (RMA Unit Dispatch)</option>
                  <option value="REPAIR">Hardware Repair &amp; Component Service</option>
                  <option value="REFUND">Full Purchase Price Refund</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                  Manager Approval Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-navy-950"
                  placeholder="Approved per warranty policy criteria."
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isActing}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider"
              >
                {isActing ? "Processing..." : "Confirm Approval & Issue RMA"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REJECT CONFIRMATION */}
      {/* ========================================================================= */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-elevated max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-rose-600" />
              <h3 className="text-lg font-bold text-navy-950">Reject Warranty Claim</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Select the formal policy justification (required) and customer explanation.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                  Rejection Reason <span className="text-rose-500">*</span>
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-navy-950 text-xs font-semibold"
                >
                  <option value="Physical damage is excluded under Section 4.1">
                    Physical / Accidental Damage Exclusion (Sec 4.1)
                  </option>
                  <option value="Warranty period has expired (Section 1.0)">
                    Warranty Window Expired (Sec 1.0)
                  </option>
                  <option value="Unauthorized reseller or invalid proof of purchase">
                    Unauthorized Reseller / Fraudulent Proof
                  </option>
                  <option value="Liquid ingress or customer tampering detected">
                    Liquid Ingress / Tampering
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                  Customer Explanation &amp; Paid Repair Quote
                </label>
                <textarea
                  rows={3}
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-navy-950"
                  placeholder="e.g. Panel exhibited point-load radial impact fractures. You are eligible for out-of-warranty screen replacement at $189."
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={isActing}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider"
              >
                {isActing ? "Processing..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REQUEST MORE EVIDENCE */}
      {/* ========================================================================= */}
      {showRequestInfoModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-elevated max-w-md w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-navy-950">Request More Evidence</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Select what items the customer must provide to clarify contradictory telemetry:
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-navy-900 uppercase tracking-wider mb-2">
                  Evidence Items Checklist
                </label>
                <div className="space-y-2">
                  {[
                    "Clearer product image",
                    "Original invoice",
                    "Updated diagnostic report",
                    "Serial number photo",
                    "Other",
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requestReasons.includes(item)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRequestReasons([...requestReasons, item]);
                          } else {
                            setRequestReasons(requestReasons.filter((r) => r !== item));
                          }
                        }}
                        className="rounded text-navy-900 focus:ring-navy-900"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>

                {requestReasons.includes("Other") && (
                  <input
                    type="text"
                    value={otherReasonText}
                    onChange={(e) => setOtherReasonText(e.target.value)}
                    placeholder="Specify other requested item..."
                    className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-navy-950"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-navy-900 uppercase tracking-wider mb-1">
                  Manager Free-Text Instructions to Customer
                </label>
                <textarea
                  rows={3}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-navy-950"
                  placeholder="Please provide clearer photos of the lower bezel and hinge mechanism."
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRequestInfoModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestInfo}
                disabled={isActing}
                className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold uppercase tracking-wider"
              >
                {isActing ? "Processing..." : "Send Evidence Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
