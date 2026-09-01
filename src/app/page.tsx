"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileCheck2,
  Cpu,
  UserCheck,
  Zap,
  CheckCircle2,
  FileText,
  Search,
  Eye,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  Lock,
  RotateCcw,
  User,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const { user, logout, isLoading } = useAuth();

  const isCustomer = user?.role === "CUSTOMER";
  const isManager = user?.role === "MANAGER";

  const submitClaimHref = isCustomer
    ? "/customer/submit-claim"
    : "/customer/login?returnTo=%2Fcustomer%2Fsubmit-claim";

  const trackClaimHref = isCustomer
    ? "/customer/track"
    : "/customer/login?returnTo=%2Fcustomer%2Ftrack";

  const steps = [
    {
      num: "01",
      title: "Upload Evidence",
      desc: "Customer submits claim details, damage photos, video keyframes, and invoice receipts.",
      icon: FileText,
    },
    {
      num: "02",
      title: "AI Multi-Agent Analysis",
      desc: "RocketRide orchestrates Vision, OCR, Fault, and Warranty agents to verify authenticity and coverage.",
      icon: Cpu,
    },
    {
      num: "03",
      title: "Human Review",
      desc: "Warranty Manager inspects agent findings, confidence scores, and conflict flags with full authority.",
      icon: UserCheck,
    },
    {
      num: "04",
      title: "Resolution & RMA",
      desc: "Immediate customer notification with replacement, repair dispatch, or structured explanation.",
      icon: CheckCircle2,
    },
  ];

  const features = [
    {
      title: "Multi-Agent AI",
      desc: "Orchestrates parallel Vision, Document, Fault, and Warranty models to conduct holistic claim assessments.",
      icon: Layers,
    },
    {
      title: "Evidence Verification",
      desc: "Deep optical inspection detects physical impact fractures, liquid ingress indicators, and serial number matches.",
      icon: Eye,
    },
    {
      title: "Invoice Validation",
      desc: "Cross-checks receipt numbers and dates against authorized retailer databases to prevent fraudulent claims.",
      icon: FileCheck2,
    },
    {
      title: "Warranty Analysis",
      desc: "Evaluates exact policy durations, statutory windows, covered components, and Section 4.1 exclusions.",
      icon: ShieldCheck,
    },
    {
      title: "Human-in-the-Loop",
      desc: "Strict enterprise governance—AI generates structured recommendations only, preserving human final authority.",
      icon: Lock,
    },
    {
      title: "Faster Claim Processing",
      desc: "Instant multi-source telemetry and synthesis reduces warranty claim resolution time from weeks to minutes.",
      icon: Zap,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-navy-950 flex flex-col font-sans selection:bg-navy-900 selection:text-white">
      {/* ========================================================================= */}
      {/* HEADER NAV */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-navy-900 flex items-center justify-center text-white shadow-sm group-hover:bg-navy-800 transition">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-navy-950 block leading-tight">
                Warranty Arbiter
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                AI Resolution Platform
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/" className="text-navy-900 hover:text-navy-950 transition">
              Home
            </Link>
            <a href="#how-it-works" className="hover:text-navy-900 transition">
              How It Works
            </a>

            {isCustomer ? (
              <>
                <Link
                  href="/customer/my-claims"
                  className="text-slate-700 hover:text-navy-950 transition font-medium"
                >
                  My Claims
                </Link>
                <Link
                  href="/customer/track"
                  className="text-slate-700 hover:text-navy-950 transition font-medium"
                >
                  Track Claim
                </Link>
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-navy-900">
                    <User className="w-3.5 h-3.5 text-navy-600" />
                    <span>{user?.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : isManager ? (
              <>
                <Link
                  href="/manager"
                  className="text-slate-700 hover:text-navy-950 transition font-medium"
                >
                  Queue
                </Link>
                <Link
                  href="/manager/analytics"
                  className="text-slate-700 hover:text-navy-950 transition font-medium"
                >
                  Analytics
                </Link>
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <Link
                    href="/manager"
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-50 border border-sky-200 text-xs font-semibold text-navy-900"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                    <span>{user?.name} (Manager)</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/customer/login"
                  className="text-slate-700 hover:text-navy-950 transition font-medium"
                >
                  Customer Login
                </Link>
                <Link
                  href="/manager/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-sm transition"
                >
                  <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                  Manager Login
                </Link>
              </>
            )}
          </nav>

          <div className="flex md:hidden items-center gap-2">
            {isCustomer ? (
              <Link
                href="/customer/my-claims"
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 text-navy-900"
              >
                My Claims
              </Link>
            ) : isManager ? (
              <Link
                href="/manager"
                className="px-3 py-1.5 rounded-md text-xs font-medium bg-navy-900 text-white"
              >
                Workbench
              </Link>
            ) : (
              <>
                <Link
                  href="/customer/login"
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-100 text-navy-900"
                >
                  Customer
                </Link>
                <Link
                  href="/manager/login"
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-navy-900 text-white"
                >
                  Manager
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-50 border border-navy-200/80 text-navy-800 text-xs sm:text-sm font-semibold mb-8 shadow-subtle">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Human-in-the-Loop AI Claim Processing</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-navy-950 leading-[1.1] max-w-4xl mx-auto">
            AI-Powered Warranty Claim Resolution
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Analyze evidence. Verify warranty eligibility. Recommend the right resolution.{" "}
            <span className="font-semibold text-navy-900">Keep humans in control.</span>
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              href={submitClaimHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-base font-semibold shadow-card hover:shadow-elevated transition transform active:scale-[0.98]"
            >
              <FileText className="w-5 h-5 text-sky-400" />
              Submit Warranty Claim
            </Link>
            <Link
              href={trackClaimHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-navy-950 border border-slate-300 text-base font-semibold shadow-subtle transition transform active:scale-[0.98]"
            >
              <Search className="w-5 h-5 text-slate-500" />
              Track Existing Claim
            </Link>
          </div>

          {/* Quick Reviewer Callout */}
          <div className="mt-8 pt-6 border-t border-slate-200/60 flex items-center justify-center gap-2 text-xs text-slate-500">
            <span>Evaluating as an adjudicator?</span>
            <Link
              href="/manager"
              className="text-navy-900 font-semibold underline hover:text-navy-700 inline-flex items-center gap-1"
            >
              Open Warranty Manager Dashboard <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4-STEP VISUAL WORKFLOW */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest font-bold text-navy-600 mb-2">
              Transparent Workflow
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-navy-950 tracking-tight">
              From Claim to Resolution in 4 Clear Steps
            </h3>
            <p className="text-slate-600 mt-3 text-base">
              Every step is architecturally visible and subject to strict governance checks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="relative flex flex-col p-6 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-subtle hover:shadow-card hover:border-navy-300 transition group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black tracking-tight text-navy-300 group-hover:text-navy-800 transition">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-navy-800 shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-navy-950 mb-2">{step.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>

                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12 p-4 rounded-xl bg-navy-50/70 border border-navy-200/60 max-w-2xl mx-auto flex items-center justify-center gap-3 text-xs text-navy-900">
            <Shield className="w-4 h-4 text-navy-700 shrink-0" />
            <span>
              <strong>Guaranteed Oversight:</strong> The AI never has final authority—it synthesizes findings to recommend; the Warranty Manager makes the final decision.
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6 FEATURE CARDS */}
      {/* ========================================================================= */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest font-bold text-navy-600 mb-2">
              Enterprise Capabilities
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-navy-950 tracking-tight">
              Engineered for Accuracy, Integrity &amp; Speed
            </h3>
            <p className="text-slate-600 mt-3 text-base">
              Modular pipeline architecture powered by RocketRide orchestration and verifiable cross-checks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-subtle hover:shadow-card hover:border-navy-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-navy-50 border border-navy-100 flex items-center justify-center text-navy-800 mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-bold text-navy-950 mb-2">{feat.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-white py-12 border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-navy-900" />
            <span className="font-bold text-navy-950 text-sm">Warranty &amp; Returns Arbiter</span>
          </div>
          <p className="text-xs text-slate-500 text-center sm:text-right">
            Production-style AI warranty processing demo with strict Human-in-the-Loop authority.
          </p>
        </div>
      </footer>
    </div>
  );
}
