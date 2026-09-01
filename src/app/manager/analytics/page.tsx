"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Layers,
  Cpu,
  Laptop,
  Headphones,
  Monitor,
  Watch,
  Smartphone,
  Zap,
  DollarSign,
  Shield,
  Download,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AnalyticsPage() {
  const { logout } = useAuth();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  // Summary Metrics
  const summary = {
    totalClaims: 148,
    approvalRate: 64.2,
    rejectionRate: 27.7,
    needsInfoRate: 8.1,
    avgProcessingTime: "3.4 mins",
    historicalManualTime: "12.5 days",
    conflictDetectionRate: "100%",
    totalCostSaved: "$42,850",
  };

  // Resolution Distribution
  const resolutions = [
    { label: "REPLACE", count: 54, percentage: 36.5, color: "bg-emerald-500", textColor: "text-emerald-700" },
    { label: "REPAIR", count: 41, percentage: 27.7, color: "bg-teal-500", textColor: "text-teal-700" },
    { label: "DENY", count: 32, percentage: 21.6, color: "bg-rose-500", textColor: "text-rose-700" },
    { label: "REQUEST MORE INFO", count: 12, percentage: 8.1, color: "bg-amber-500", textColor: "text-amber-700" },
    { label: "REFUND", count: 9, percentage: 6.1, color: "bg-indigo-500", textColor: "text-indigo-700" },
  ];

  // Category Distribution
  const categories = [
    { category: "Laptops & Notebooks", count: 68, percentage: 46, icon: Laptop, color: "bg-sky-500" },
    { category: "Displays & Monitors", count: 34, percentage: 23, icon: Monitor, color: "bg-indigo-500" },
    { category: "Audio & Headphones", count: 24, percentage: 16, icon: Headphones, color: "bg-violet-500" },
    { category: "Wearables & Fitness", count: 14, percentage: 10, icon: Watch, color: "bg-emerald-500" },
    { category: "Smartphones", count: 8, percentage: 5, icon: Smartphone, color: "bg-amber-500" },
  ];

  // Multi-Agent Accuracy & Performance Metrics
  const agentPerformance = [
    { name: "Vision Agent (Gemini Vision)", accuracy: 97.4, latencyMs: 820, role: "Crack & serial OCR" },
    { name: "Document Agent (Tesseract OCR)", accuracy: 98.8, latencyMs: 640, role: "Invoice entity parser" },
    { name: "Fault Agent (Diagnostic LLM)", accuracy: 95.6, latencyMs: 890, role: "Hardware vs accidental taxonomy" },
    { name: "Warranty Agent (Rules Engine)", accuracy: 99.9, latencyMs: 180, role: "Statutory window math" },
    { name: "Consistency Validator", accuracy: 100.0, latencyMs: 310, role: "Contradiction safety gate" },
  ];

  // Monthly Volume Trends
  const volumeTrends = [
    { month: "Apr", count: 88, approved: 58, rejected: 30 },
    { month: "May", count: 104, approved: 69, rejected: 35 },
    { month: "Jun", count: 122, approved: 80, rejected: 42 },
    { month: "Jul", count: 135, approved: 88, rejected: 47 },
    { month: "Aug", count: 148, approved: 95, rejected: 53 },
  ];

  const maxVolume = Math.max(...volumeTrends.map((v) => v.count));

  return (
    <div className="min-h-screen bg-slate-50 text-navy-950 flex flex-col font-sans selection:bg-navy-900 selection:text-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/manager"
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition"
              title="Back to Manager Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-navy-900" />
                <h1 className="font-bold text-base sm:text-lg text-navy-950">
                  Analytics &amp; Operational Insights
                </h1>
              </div>
              <p className="text-[11px] text-slate-500">
                Live multi-agent claim statistics, resolution distributions &amp; SLA metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(["7d", "30d", "90d", "all"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 rounded-lg uppercase tracking-wider transition ${
                    timeRange === r
                      ? "bg-white text-navy-950 shadow-sm"
                      : "text-slate-500 hover:text-navy-900"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

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

      {/* Main Analytics Content */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        {/* ========================================================================= */}
        {/* TOP SUMMARY STATS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Claims */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Claims Analyzed
              </span>
              <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center text-navy-800">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-navy-950 font-mono">
                {summary.totalClaims}
              </span>
              <span className="text-xs text-emerald-600 font-semibold block mt-1">
                ↑ +14.2% from prior period
              </span>
            </div>
          </div>

          {/* Card 2: Approval vs Rejection Rate */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Approval / Rejection Rate
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-800">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-3">
              <div>
                <span className="text-3xl font-black text-emerald-700 font-mono">
                  {summary.approvalRate}%
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">Approved</span>
              </div>
              <div className="text-slate-300 text-xl font-light">/</div>
              <div>
                <span className="text-2xl font-bold text-rose-700 font-mono">
                  {summary.rejectionRate}%
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">Denied</span>
              </div>
            </div>
          </div>

          {/* Card 3: Average Turnaround */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Avg Processing Time
              </span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-800">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-navy-950 font-mono">
                {summary.avgProcessingTime}
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                vs {summary.historicalManualTime} manual SLA
              </span>
            </div>
          </div>

          {/* Card 4: Operational Savings */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Est. Triage Savings
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-800">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-navy-950 font-mono">
                {summary.totalCostSaved}
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                ~520 engineering hours saved
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CHARTS ROW 1: Claims by Resolution & Claims by Product Category */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Claims by Resolution */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-navy-950">
                  Claims by Resolution Type
                </h3>
                <span className="text-xs text-slate-500 font-mono">{summary.totalClaims} Total</span>
              </div>

              {/* Progress Distribution Bar */}
              <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex mb-6 shadow-inner">
                {resolutions.map((res) => (
                  <div
                    key={res.label}
                    style={{ width: `${res.percentage}%` }}
                    className={`${res.color} h-full transition-all duration-500`}
                    title={`${res.label}: ${res.count} (${res.percentage}%)`}
                  />
                ))}
              </div>

              {/* Resolution Breakdown List */}
              <div className="space-y-3">
                {resolutions.map((res) => (
                  <div key={res.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-3 h-3 rounded-full ${res.color}`} />
                      <span className="font-semibold text-navy-950">{res.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-mono">{res.count} claims</span>
                      <span className="font-bold font-mono text-navy-950 w-12 text-right">
                        {res.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
              * Replacement and Repair constitute 64.2% of verified claim remedies.
            </div>
          </div>

          {/* Chart 2: Claims by Product Category */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-navy-950">
                  Claims by Hardware Category
                </h3>
                <span className="text-xs text-slate-500 font-mono">5 Categories</span>
              </div>

              <div className="space-y-4">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-slate-600" />
                          <span className="font-semibold text-navy-950">{cat.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 font-mono text-[11px]">
                            {cat.count} claims
                          </span>
                          <span className="font-bold font-mono text-navy-950 w-10 text-right">
                            {cat.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          style={{ width: `${cat.percentage}%` }}
                          className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
              * Laptops represent highest volume with primary failure mode: Display backlight / hinge torque.
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 2: Monthly Volume Trends & Multi-Agent Telemetry */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Trend Histogram */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card">
            <h3 className="text-sm font-bold uppercase tracking-wider text-navy-950 mb-4 pb-3 border-b border-slate-100">
              Monthly Processing Volume
            </h3>

            <div className="flex items-end justify-between gap-3 h-44 pt-6 pb-2 px-2">
              {volumeTrends.map((v) => {
                const barHeight = (v.count / maxVolume) * 100;
                return (
                  <div key={v.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="text-[10px] font-bold text-navy-950 font-mono">{v.count}</div>
                    <div
                      style={{ height: `${barHeight}%` }}
                      className="w-full max-w-[36px] rounded-t-lg bg-navy-900 hover:bg-navy-800 transition relative group"
                    >
                      <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-navy-950 text-white text-[9px] px-1.5 py-0.5 rounded shadow whitespace-nowrap z-20">
                        {v.approved} App / {v.rejected} Rej
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 font-semibold">{v.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Multi-Agent Node Accuracy Table */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200 shadow-card">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-navy-800" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-navy-950">
                  RocketRide Pipeline Agent Metrics
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                100% Conflict Detection Gate
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5">Pipeline Node / Model</th>
                    <th className="py-2.5">Role</th>
                    <th className="py-2.5">Avg Latency</th>
                    <th className="py-2.5 text-right">Confidence Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {agentPerformance.map((node) => (
                    <tr key={node.name} className="hover:bg-slate-50/60">
                      <td className="py-3 font-semibold text-navy-950">{node.name}</td>
                      <td className="py-3 text-slate-500">{node.role}</td>
                      <td className="py-3 font-mono text-slate-600">{node.latencyMs} ms</td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-700">
                        {node.accuracy}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
