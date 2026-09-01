"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  FileText,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Laptop,
  LogOut,
  User,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { claimsApi } from "@/services/api/claimsApi";
import { Claim } from "@/types";

export default function MyClaimsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUserClaims() {
      try {
        const data = await claimsApi.getClaims();
        setClaims(data.claims || []);
      } catch (err) {
        console.error("Failed to load customer claims", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserClaims();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-navy-950 flex flex-col font-sans selection:bg-navy-900 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <span className="font-bold text-sm text-navy-950 block leading-tight">
                Warranty Arbiter
              </span>
              <span className="text-[10px] text-slate-500 font-medium uppercase">
                Customer Claim Center
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs text-navy-900">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold">{user?.name || "Customer Account"}</span>
            </div>

            <Link
              href="/customer/submit-claim"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" /> File New Claim
            </Link>

            <button
              type="button"
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
              My Warranty Claims
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Active filings and resolution history for {user?.email}
            </p>
          </div>

          <Link
            href="/customer/track"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-900 hover:underline"
          >
            <Search className="w-3.5 h-3.5" /> Search specific claim ID
          </Link>
        </div>

        {isLoading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-card">
            <div className="w-8 h-8 rounded-full border-2 border-navy-900 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Loading your warranty claims...</p>
          </div>
        ) : claims.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-card">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-navy-950">No Claims Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-6">
              You haven&apos;t submitted any warranty claims with this account yet.
            </p>
            <Link
              href="/customer/submit-claim"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Submit Your First Claim
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {claims.map((c) => (
              <div
                key={c.claimId}
                className="bg-white rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card hover:border-navy-300 transition p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-bold text-sm text-navy-950">
                      {c.claimId}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        c.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : c.status === "REJECTED"
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : c.status === "NEEDS_MORE_EVIDENCE"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-sky-50 text-sky-800 border-sky-200"
                      }`}
                    >
                      {c.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center text-navy-800 shrink-0">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-navy-950 truncate">
                        {c.product.brand} {c.product.model}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        SN: {c.product.serialNumber}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4">
                    &ldquo;{c.complaint}&rdquo;
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {new Date(c.submittedAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/customer/track?id=${encodeURIComponent(c.claimId)}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-navy-900 hover:text-navy-700"
                  >
                    Track Live <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
