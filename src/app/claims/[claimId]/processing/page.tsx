"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Clock,
  ArrowRight,
  Sparkles,
  UserCheck,
  FileCheck2,
  Camera,
  Cpu,
  Shield,
  Layers,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { claimsApi } from "@/services/api/claimsApi";
import { Claim } from "@/types";

interface ProcessingStage {
  id: string;
  label: string;
  publicMessage: string;
  status: "pending" | "running" | "completed" | "failed";
}

const INITIAL_STAGES: ProcessingStage[] = [
  {
    id: "received",
    label: "Claim Received",
    publicMessage: "Claim registration logged in arbiter core system",
    status: "completed",
  },
  {
    id: "files",
    label: "Files Uploaded",
    publicMessage: "Media, proof-of-purchase, and diagnostic attachments validated",
    status: "completed",
  },
  {
    id: "preprocessing",
    label: "Preprocessing",
    publicMessage: "Preprocessing and anonymizing claim attachments",
    status: "pending",
  },
  {
    id: "vision",
    label: "Vision Agent",
    publicMessage: "Analyzing product image for physical damage and serial barcodes",
    status: "pending",
  },
  {
    id: "document",
    label: "Document Agent",
    publicMessage: "Extracting invoice information and purchase timestamps",
    status: "pending",
  },
  {
    id: "fault",
    label: "Fault Agent",
    publicMessage: "Checking diagnostic evidence and failure classifications",
    status: "pending",
  },
  {
    id: "warranty",
    label: "Warranty Agent",
    publicMessage: "Verifying warranty eligibility and policy exclusions",
    status: "pending",
  },
  {
    id: "decision",
    label: "Decision Agent",
    publicMessage: "Synthesizing evidence to generate structured recommendation",
    status: "pending",
  },
  {
    id: "validator",
    label: "Consistency Validator",
    publicMessage: "Validating evidence integrity and conflict checks",
    status: "pending",
  },
  {
    id: "manager_queue",
    label: "Manager Review Ready",
    publicMessage: "Claim routed to Warranty Manager for final decision authority",
    status: "pending",
  },
];

export default function ClaimProcessingPage({ params }: { params: { claimId: string } }) {
  const router = useRouter();
  const claimId = decodeURIComponent(params.claimId);

  const [stages, setStages] = useState<ProcessingStage[]>(INITIAL_STAGES);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(2); // Starts at preprocessing
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const [claim, setClaim] = useState<Claim | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function executeAndAnimatePipeline() {
      try {
        // Step 1: Preprocessing (index 2)
        if (!isMounted) return;
        setStages((prev) =>
          prev.map((s, i) => (i === 2 ? { ...s, status: "running" } : s))
        );
        setActiveStageIndex(2);
        await new Promise((r) => setTimeout(r, 700));

        // Step 2: Parallel Vision (3), Document (4), Fault (5)
        if (!isMounted) return;
        setStages((prev) =>
          prev.map((s, i) =>
            i === 2
              ? { ...s, status: "completed" }
              : i >= 3 && i <= 5
              ? { ...s, status: "running" }
              : s
          )
        );
        setActiveStageIndex(3);
        await new Promise((r) => setTimeout(r, 1100));

        // Mark Vision/Doc/Fault as complete
        if (!isMounted) return;
        setStages((prev) =>
          prev.map((s, i) =>
            i >= 3 && i <= 5
              ? { ...s, status: "completed" }
              : i === 6
              ? { ...s, status: "running" }
              : s
          )
        );
        setActiveStageIndex(6); // Warranty

        // Step 3: Warranty Agent (6)
        await new Promise((r) => setTimeout(r, 900));
        if (!isMounted) return;
        setStages((prev) =>
          prev.map((s, i) =>
            i === 6
              ? { ...s, status: "completed" }
              : i === 7
              ? { ...s, status: "running" }
              : s
          )
        );
        setActiveStageIndex(7); // Decision

        // Step 4: Decision Agent (7)
        await new Promise((r) => setTimeout(r, 900));
        if (!isMounted) return;
        setStages((prev) =>
          prev.map((s, i) =>
            i === 7
              ? { ...s, status: "completed" }
              : i === 8
              ? { ...s, status: "running" }
              : s
          )
        );
        setActiveStageIndex(8); // Validator

        // Step 5: Execute actual backend route handler
        const result = await claimsApi.processClaim(claimId);
        if (!isMounted) return;
        setClaim(result.claim);

        // Step 6: Validator (8) & Manager Queue (9)
        await new Promise((r) => setTimeout(r, 800));
        if (!isMounted) return;
        setStages((prev) =>
          prev.map((s, i) =>
            i <= 8
              ? { ...s, status: "completed" }
              : i === 9
              ? { ...s, status: "completed" }
              : s
          )
        );
        setActiveStageIndex(9);
        setIsCompleted(true);
      } catch (err) {
        if (!isMounted) return;
        setStages((prev) =>
          prev.map((s, i) => (s.status === "running" ? { ...s, status: "failed" } : s))
        );
        setHasError(err instanceof Error ? err.message : "Pipeline execution failed");
      }
    }

    executeAndAnimatePipeline();

    return () => {
      isMounted = false;
    };
  }, [claimId]);

  return (
    <div className="min-h-screen bg-slate-50 text-navy-950 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-subtle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <span className="font-bold text-sm text-navy-950 block">
                RocketRide Pipeline Orchestrator
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Claim #{claimId}
              </span>
            </div>
          </div>

          <Link
            href={`/customer/track?id=${encodeURIComponent(claimId)}`}
            className="text-xs font-semibold text-navy-800 hover:text-navy-950 inline-flex items-center gap-1 border border-slate-200 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition"
          >
            Skip to Tracker <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl w-full mx-auto px-4 py-10 flex-1 flex flex-col justify-center">
        {/* Banner / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-100 border border-navy-200 text-navy-900 text-xs font-semibold mb-3">
            <Cpu className="w-3.5 h-3.5 text-navy-700 animate-pulse" />
            <span>AI Claim Analysis Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            {isCompleted ? "Analysis Complete & Verified" : "Orchestrating Multi-Agent Analysis"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto">
            Executing parallel vision, document OCR, policy evaluation, and consistency validation.
          </p>
        </div>

        {hasError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{hasError}</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-sm font-semibold transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Pipeline
            </button>
          </div>
        )}

        {/* Animated Vertical Stage List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8">
          <div className="space-y-6 relative">
            {/* Vertical Track Line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200 z-0" />

            {stages.map((stage, idx) => {
              const isDone = stage.status === "completed";
              const isRunning = stage.status === "running";
              const isPending = stage.status === "pending";

              return (
                <div key={stage.id} className="relative z-10 flex items-start gap-4">
                  {/* Status Indicator Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      stage.status === "failed"
                        ? "bg-rose-500 text-white shadow-sm ring-4 ring-rose-100"
                        : isDone
                        ? "bg-emerald-500 text-white shadow-sm"
                        : isRunning
                        ? "bg-navy-900 text-white ring-4 ring-navy-100 animate-pulse"
                        : "bg-white border border-slate-300 text-slate-300"
                    }`}
                  >
                    {stage.status === "failed" ? (
                      <AlertCircle className="w-5 h-5 stroke-[2.5]" />
                    ) : isDone ? (
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    ) : isRunning ? (
                      <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300" />
                    )}
                  </div>

                  {/* Stage Details */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-sm font-bold tracking-tight ${
                          isDone
                            ? "text-navy-950"
                            : isRunning
                            ? "text-navy-900 font-extrabold"
                            : "text-slate-400"
                        }`}
                      >
                        {stage.label}
                      </h4>
                      {isRunning && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 animate-pulse">
                          Running
                        </span>
                      )}
                      {isDone && (
                        <span className="text-[10px] font-medium text-emerald-600">
                          Complete
                        </span>
                      )}
                    </div>

                    {/* Public-Safe Message beneath stage */}
                    {(isRunning || (isDone && idx === activeStageIndex) || isCompleted) && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed animate-in fade-in">
                        {stage.publicMessage}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action CTA on Completion */}
          {isCompleted && (
            <div className="mt-8 pt-6 border-t border-slate-200 text-center animate-in fade-in slide-in-from-bottom-2">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 mb-5">
                <p className="text-xs text-emerald-800 font-medium">
                  ✓ Multi-agent evidence synthesis finished. AI resolution recommendation generated and routed to Warranty Review queue.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={`/customer/track?id=${encodeURIComponent(claimId)}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold uppercase tracking-wider shadow-card transition transform active:scale-95"
                >
                  View Claim Status &amp; Evidence <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/manager"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-navy-900 text-xs font-bold uppercase tracking-wider transition"
                >
                  <UserCheck className="w-4 h-4 text-navy-700" /> Manager View
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Governance Disclaimer */}
        <div className="mt-6 p-3.5 rounded-xl bg-navy-50/60 border border-navy-100 text-center text-[11px] text-slate-600">
          <Shield className="w-3.5 h-3.5 text-navy-700 inline-block mr-1.5 -mt-0.5" />
          <span>
            <strong>Human Authority Gate:</strong> AI agents evaluate evidence and prepare recommendations only. The human Warranty Manager retains final decision authority.
          </span>
        </div>
      </main>
    </div>
  );
}
