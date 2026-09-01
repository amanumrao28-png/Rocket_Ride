"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  UserCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Loader2,
  Clock,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function ManagerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/manager";

  const { loginManager } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [accountStatus, setAccountStatus] = useState<"PENDING" | "REJECTED" | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter your manager email and password.");
      setAccountStatus(null);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setAccountStatus(null);
    setRejectionReason(null);

    try {
      const authUser = await loginManager(email.trim(), password);

      let targetDestination = returnTo;
      if (authUser?.role === "CUSTOMER") {
        targetDestination = "/customer/track";
      } else if (!returnTo || returnTo === "/manager/login") {
        targetDestination = "/manager";
      }

      window.location.href = targetDestination;
    } catch (err: unknown) {
      // @ts-expect-error read status if attached
      const status = err?.status;
      // @ts-expect-error read rejectionReason if attached
      const reason = err?.rejectionReason;

      if (status === "PENDING") {
        setAccountStatus("PENDING");
        setError(
          "Your manager account is awaiting approval from an existing manager. You'll be notified once approved."
        );
      } else if (status === "REJECTED") {
        setAccountStatus("REJECTED");
        setRejectionReason(reason);
        setError(err instanceof Error ? err.message : "Your manager account request was not approved.");
      } else {
        setError(err instanceof Error ? err.message : "Invalid manager credentials");
      }
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("demo1234");
    setError(null);
    setAccountStatus(null);
    setRejectionReason(null);
  };

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 mx-auto mb-3 shadow-inner">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Manager Authentication
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authorized company adjudicators only. Human sign-off terminal.
          </p>
        </div>

        {/* Status Callouts */}
        {accountStatus === "PENDING" && (
          <div className="mb-5 p-4 rounded-xl bg-amber-950/60 border border-amber-800 text-xs text-amber-200 flex items-start gap-2.5">
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-300">Account Awaiting Human Approval</span>
              <span className="mt-0.5 block leading-relaxed">{error}</span>
            </div>
          </div>
        )}

        {accountStatus === "REJECTED" && (
          <div className="mb-5 p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex items-start gap-2.5">
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-rose-300">Manager Access Not Approved</span>
              <span className="mt-0.5 block leading-relaxed">{error}</span>
            </div>
          </div>
        )}

        {!accountStatus && error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Manager Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="manager@warrantyarbiter.demo"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                Authenticating Manager...
              </>
            ) : (
              <>
                Sign In to Workbench <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials & Test Statuses */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 bg-slate-900/60 p-4 rounded-xl border space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Demo Test Accounts
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            {/* 1. Approved */}
            <button
              type="button"
              onClick={() => handleQuickFill("manager@warrantyarbiter.demo")}
              className="w-full p-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-left transition flex items-center justify-between"
            >
              <div className="truncate mr-2">
                <span className="font-semibold text-slate-200 block truncate">Marcus Vance (Approved)</span>
                <span className="text-[10px] text-slate-400 font-mono">manager@warrantyarbiter.demo</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                APPROVED
              </span>
            </button>

            {/* 2. Pending */}
            <button
              type="button"
              onClick={() => handleQuickFill("elena.rostova@warrantyarbiter.demo")}
              className="w-full p-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-left transition flex items-center justify-between"
            >
              <div className="truncate mr-2">
                <span className="font-semibold text-slate-200 block truncate">Elena Rostova (Pending)</span>
                <span className="text-[10px] text-slate-400 font-mono">elena.rostova@warrantyarbiter.demo</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                PENDING
              </span>
            </button>

            {/* 3. Rejected */}
            <button
              type="button"
              onClick={() => handleQuickFill("david.sterling@external-contractor.com")}
              className="w-full p-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-left transition flex items-center justify-between"
            >
              <div className="truncate mr-2">
                <span className="font-semibold text-slate-200 block truncate">David Sterling (Rejected)</span>
                <span className="text-[10px] text-slate-400 font-mono">david.sterling@external-contractor.com</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 whitespace-nowrap">
                REJECTED
              </span>
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="mt-5 text-center text-xs text-slate-500">
          New manager joining the team?{" "}
          <Link href="/manager/signup" className="font-bold text-sky-400 hover:underline">
            Request Manager Access
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ManagerLoginPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <span className="font-bold text-sm text-white block leading-tight">
                Warranty Arbiter
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Manager Operations
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Login Card with Suspense */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12">
        <Suspense
          fallback={
            <div className="text-center p-8">
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
            </div>
          }
        >
          <ManagerLoginForm />
        </Suspense>
      </main>
    </div>
  );
}
