"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  UserPlus,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Mail,
  KeyRound,
  Lock,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { authApi } from "@/services/api/auth";

function CustomerSignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/customer/submit-claim";

  // Step state: 1 (Email), 2 (OTP), 3 (Profile & Password)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verifiedToken, setVerifiedToken] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Cooldown & Loading states
  const [cooldown, setCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cooldown timer tick
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // STEP A: Send OTP
  const handleStartRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await authApi.startCustomerRegistration(email.trim());
      setSuccessMessage(res.message || "Verification code sent to your email.");
      setStep(2);
      setCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send verification code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP B: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await authApi.verifyCustomerOtp(email.trim(), otp.trim());
      setVerifiedToken(res.verified_token);
      setSuccessMessage("Email verified! Complete your profile details below.");
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await authApi.startCustomerRegistration(email.trim());
      setSuccessMessage(res.message || "A new 6-digit verification code has been sent.");
      setCooldown(60);
      setOtp("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP C: Complete Registration
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await authApi.completeCustomerRegistration(
        email.trim(),
        verifiedToken,
        name.trim(),
        password,
        confirmPassword
      );
      router.push(returnTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete registration.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-navy-50 border border-navy-100 flex items-center justify-center text-navy-900 mx-auto mb-3 shadow-subtle">
            {step === 1 && <Mail className="w-6 h-6" />}
            {step === 2 && <KeyRound className="w-6 h-6" />}
            {step === 3 && <UserPlus className="w-6 h-6" />}
          </div>
          <h1 className="text-2xl font-bold text-navy-950 tracking-tight">
            Customer Sign Up
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Step {step} of 3:{" "}
            {step === 1 && "Email Verification Check"}
            {step === 2 && "Enter 6-Digit Verification Code"}
            {step === 3 && "Create Password & Complete Account"}
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className={`w-2.5 h-2.5 rounded-full ${step >= 1 ? "bg-navy-900" : "bg-slate-200"}`} />
            <span className={`w-8 h-0.5 ${step >= 2 ? "bg-navy-900" : "bg-slate-200"}`} />
            <span className={`w-2.5 h-2.5 rounded-full ${step >= 2 ? "bg-navy-900" : "bg-slate-200"}`} />
            <span className={`w-8 h-0.5 ${step >= 3 ? "bg-navy-900" : "bg-slate-200"}`} />
            <span className={`w-2.5 h-2.5 rounded-full ${step >= 3 ? "bg-navy-900" : "bg-slate-200"}`} />
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* SCREEN 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleStartRegistration} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1.5">
                Email Address <span className="text-rose-600">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sarah.jenkins@example.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-navy-950 focus:outline-none focus:ring-2 focus:ring-navy-900 placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                We will send a 6-digit OTP code to verify your inbox before registration.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  Sending Code...
                </>
              ) : (
                <>
                  Send Verification Code <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* SCREEN 2: Enter 6-Digit OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 mb-2">
              Verification code sent to: <span className="font-bold font-mono text-navy-950">{email}</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1.5">
                6-Digit Verification Code <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                required
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-center font-mono text-xl font-bold tracking-widest text-navy-950 focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.length !== 6}
              className="w-full py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  Verifying Code...
                </>
              ) : (
                <>
                  Verify Code &amp; Continue <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs">
              {cooldown > 0 ? (
                <span className="text-slate-500 font-mono">
                  Resend code in {cooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isSubmitting}
                  className="font-bold text-navy-900 hover:underline inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Resend Code
                </button>
              )}
            </div>
          </form>
        )}

        {/* SCREEN 3: Password & Name */}
        {step === 3 && (
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Email <strong className="font-mono">{email}</strong> verified!</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1.5">
                Full Legal Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-navy-950 focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1.5">
                Password <span className="text-rose-600">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, 1 letter &amp; 1 number"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-navy-950 focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy-900 mb-1.5">
                Confirm Password <span className="text-rose-600">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
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
                  Creating Account...
                </>
              ) : (
                <>
                  Complete Registration <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-slate-600">
          Already have an account?{" "}
          <Link
            href={`/customer/login?returnTo=${encodeURIComponent(returnTo)}`}
            className="font-bold text-navy-900 hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CustomerSignUpPage() {
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
                Customer Registration
              </span>
            </div>
          </Link>

          <Link
            href="/customer/login"
            className="text-xs font-semibold text-slate-600 hover:text-navy-900 inline-flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>
      </header>

      {/* Main SignUp Form with Suspense */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12">
        <Suspense
          fallback={
            <div className="text-center p-8">
              <Loader2 className="w-8 h-8 text-navy-900 animate-spin mx-auto" />
            </div>
          }
        >
          <CustomerSignUpForm />
        </Suspense>
      </main>
    </div>
  );
}
