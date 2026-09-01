"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Clock,
  CheckCircle2,
  RefreshCw,
  Shield,
} from "lucide-react";
import { authApi } from "@/services/api/auth";

function ManagerSignUpForm() {
  const router = useRouter();

  // Step state: 1 (Email & Role Note), 2 (OTP), 3 (Name & Password)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [email, setEmail] = useState("");
  const [requestedRoleNote, setRequestedRoleNote] = useState("");
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
  const [isSuccessComplete, setIsSuccessComplete] = useState(false);

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
      setError("Please enter your corporate email address.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await authApi.startManagerRegistration(email.trim(), requestedRoleNote.trim());
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
      const res = await authApi.verifyManagerOtp(email.trim(), otp.trim());
      setVerifiedToken(res.verified_token);
      setSuccessMessage("Email verified! Enter your details to submit your request.");
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await authApi.startManagerRegistration(email.trim(), requestedRoleNote.trim());
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
      await authApi.completeManagerRegistration(
        email.trim(),
        verifiedToken,
        name.trim(),
        password,
        confirmPassword
      );
      setIsSuccessComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit manager registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccessComplete) {
    return (
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-8 text-center animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
          <Clock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Manager Access Request Submitted
        </h2>
        <div className="mt-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed text-left space-y-2">
          <p className="font-semibold text-amber-300 flex items-center gap-1.5">
            <Shield className="w-4 h-4" /> Email Verified &amp; Pending Manager Clearance
          </p>
          <p>
            Your email <span className="font-mono text-white">{email}</span> has been verified. Your application status is now <span className="font-bold text-amber-400">PENDING</span>.
          </p>
          <p>
            An existing, already-approved warranty manager must review and approve your account before you can log in to the adjudication workbench.
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/manager/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition"
          >
            Return to Manager Login <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
          >
            Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 mx-auto mb-3 shadow-inner">
            {step === 1 && <Mail className="w-6 h-6" />}
            {step === 2 && <KeyRound className="w-6 h-6" />}
            {step === 3 && <UserPlus className="w-6 h-6" />}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Request Manager Access
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Step {step} of 3:{" "}
            {step === 1 && "Email Deliverability & Verification"}
            {step === 2 && "Enter 6-Digit Security Code"}
            {step === 3 && "Legal Credentials & Submit Application"}
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className={`w-2.5 h-2.5 rounded-full ${step >= 1 ? "bg-sky-400" : "bg-slate-800"}`} />
            <span className={`w-8 h-0.5 ${step >= 2 ? "bg-sky-400" : "bg-slate-800"}`} />
            <span className={`w-2.5 h-2.5 rounded-full ${step >= 2 ? "bg-sky-400" : "bg-slate-800"}`} />
            <span className={`w-8 h-0.5 ${step >= 3 ? "bg-sky-400" : "bg-slate-800"}`} />
            <span className={`w-2.5 h-2.5 rounded-full ${step >= 3 ? "bg-sky-400" : "bg-slate-800"}`} />
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* SCREEN 1: Enter Corporate Email */}
        {step === 1 && (
          <form onSubmit={handleStartRegistration} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Corporate Email Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan.mitchell@warrantyarbiter.demo"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Department / Role Note (Optional)
              </label>
              <input
                type="text"
                value={requestedRoleNote}
                onChange={(e) => setRequestedRoleNote(e.target.value)}
                placeholder="e.g. Regional Claims Manager - North America"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  Dispatching Security Code...
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
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 mb-2">
              Verification code sent to: <span className="font-bold font-mono text-white">{email}</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                6-Digit Security Code <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                required
                className="w-full px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono text-xl font-bold tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.length !== 6}
              className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
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
                  className="font-bold text-sky-400 hover:underline inline-flex items-center gap-1"
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
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Email <strong className="font-mono">{email}</strong> verified!</span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Legal Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Mitchell"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, 1 letter &amp; 1 number"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Confirm Password <span className="text-rose-400">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
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
                  Submitting Application...
                </>
              ) : (
                <>
                  Submit Manager Request <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Already approved?{" "}
          <Link href="/manager/login" className="font-bold text-sky-400 hover:underline">
            Manager Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ManagerSignUpPage() {
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
                Manager Onboarding
              </span>
            </div>
          </Link>

          <Link
            href="/manager/login"
            className="text-xs font-semibold text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12">
        <Suspense
          fallback={
            <div className="text-center p-8">
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
            </div>
          }
        >
          <ManagerSignUpForm />
        </Suspense>
      </main>
    </div>
  );
}
