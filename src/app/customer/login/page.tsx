"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/customer/track";

  const { loginCustomer } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!email.trim() || !password.trim()) {
    setError(
      "Please enter both your email address and password."
    );
    return;
  }

  setIsSubmitting(true);
  setError(null);

  try {
    const authUser = await loginCustomer(email.trim(), password);

    let targetDestination = returnTo;
    if (authUser?.role === "MANAGER") {
      targetDestination = "/manager";
    } else if (!returnTo || returnTo === "/customer/login") {
      targetDestination = "/customer/track";
    }

    window.location.href = targetDestination;
  } catch (err) {
    console.error("Customer login failed:", err);

    setError(
      err instanceof Error
        ? err.message
        : "Failed to log in"
    );
    setIsSubmitting(false);
  }
};

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("demo1234");
    setError(null);
  };

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-navy-50 border border-navy-100 flex items-center justify-center text-navy-900 mx-auto mb-3 shadow-subtle">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-navy-950 tracking-tight">
            Customer Sign In
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your warranty claims, upload evidence, and track adjudication live.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sarah.jenkins@example.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-navy-950 focus:outline-none focus:ring-2 focus:ring-navy-900 placeholder:text-slate-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-900">
                Password
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-navy-950 focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                Signing In...
              </>
            ) : (
              <>
                Sign In to Portal <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Pre-fill */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-sky-600" /> Demo Customers:
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill("sarah.jenkins@example.com")}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left truncate transition"
            >
              <span className="font-semibold text-navy-900 block truncate">Sarah Jenkins</span>
              <span className="text-[10px] text-slate-500">Dell Claim (CLM-1024)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("robert.chen@example.com")}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left truncate transition"
            >
              <span className="font-semibold text-navy-900 block truncate">Robert Chen</span>
              <span className="text-[10px] text-slate-500">HP Claim (CLM-1025)</span>
            </button>
          </div>
        </div>

        {/* Sign Up Footer Link */}
        <div className="mt-6 text-center text-xs text-slate-600">
          Don&apos;t have a customer account?{" "}
          <Link
            href={`/customer/signup?returnTo=${encodeURIComponent(returnTo)}`}
            className="font-bold text-navy-900 hover:underline"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-navy-950 flex flex-col font-sans selection:bg-navy-900 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-subtle">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <span className="font-bold text-sm text-navy-950 block leading-tight">
                Warranty Arbiter
              </span>
              <span className="text-[10px] text-slate-500 font-medium uppercase">
                Customer Portal
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-slate-600 hover:text-navy-900 inline-flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Main Login Form with Suspense boundary */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12">
        <Suspense
          fallback={
            <div className="text-center p-8">
              <Loader2 className="w-8 h-8 text-navy-900 animate-spin mx-auto" />
            </div>
          }
        >
          <CustomerLoginForm />
        </Suspense>
      </main>
    </div>
  );
}
