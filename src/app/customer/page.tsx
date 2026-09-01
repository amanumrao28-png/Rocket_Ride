"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  FilePlus,
  Search,
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
} from "lucide-react";

export default function CustomerPortalPage() {
  const router = useRouter();
  const [trackClaimId, setTrackClaimId] = useState("");
  const [trackError, setTrackError] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackClaimId.trim()) {
      setTrackError("Please enter a valid claim number (e.g. CLM-1024)");
      return;
    }
    router.push(`/customer/track?id=${encodeURIComponent(trackClaimId.trim().toUpperCase())}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-navy-950 flex flex-col font-sans">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-subtle">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </div>
            <span className="font-bold text-base text-navy-950">Customer Claim Center</span>
          </Link>
          <Link
            href="/"
            className="text-xs sm:text-sm font-medium text-slate-600 hover:text-navy-900 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 tracking-tight">
            Warranty &amp; Returns Portal
          </h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Submit a new warranty claim with photos and proof of purchase, or track the live status of an existing claim.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Submit Claim */}
          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-card flex flex-col justify-between hover:border-navy-400 transition group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center text-navy-800 mb-5 group-hover:bg-navy-900 group-hover:text-white transition">
                <FilePlus className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-navy-950 mb-2">Submit a New Claim</h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Fast 5-step submission wizard. Attach photos, diagnostic logs, and your purchase invoice for multi-agent AI verification.
              </p>
            </div>

            <Link
              href="/customer/submit-claim"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              Start Claim Wizard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Track Existing Claim */}
          <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-card flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-5">
                <Search className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-navy-950 mb-2">Track Existing Claim</h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Check real-time agent verification progress, validation flags, or manager resolution notes.
              </p>

              <form onSubmit={handleTrack} className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={trackClaimId}
                    onChange={(e) => {
                      setTrackClaimId(e.target.value);
                      setTrackError("");
                    }}
                    placeholder="e.g. CLM-1024 or CLM-1027"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-mono uppercase text-navy-950 focus:outline-none focus:ring-2 focus:ring-navy-900"
                  />
                  {trackError && <p className="text-xs text-rose-600 mt-1">{trackError}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-navy-900 text-xs font-bold uppercase tracking-wider transition"
                >
                  Lookup Claim
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-500">
              <span>Try sample IDs: </span>
              <button
                type="button"
                onClick={() => router.push("/customer/track?id=CLM-1024")}
                className="font-mono text-navy-900 underline font-semibold mr-1.5"
              >
                CLM-1024
              </button>
              <button
                type="button"
                onClick={() => router.push("/customer/track?id=CLM-1027")}
                className="font-mono text-navy-900 underline font-semibold"
              >
                CLM-1027
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
