"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  User,
  Laptop,
  MessageSquareWarning,
  UploadCloud,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileText,
  Trash2,
  Check,
  Sparkles,
  AlertCircle,
  Clock,
  Camera,
  FileSearch,
} from "lucide-react";
import { claimsApi } from "@/services/api/claimsApi";
import { uploadFile } from "@/services/storage";
import { ClaimFiles, Customer, Product } from "@/types";

import { useAuth } from "@/context/AuthContext";

type WizardStep = 1 | 2 | 3 | 4 | 5;

interface UploadedFileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  status: "uploading" | "completed" | "error";
  progress: number;
}

export default function SubmitClaimPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdClaimId, setCreatedClaimId] = useState<string | null>(null);

  // Form State
  const [customer, setCustomer] = useState<Customer>({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });

  const [product, setProduct] = useState<Product>({
    category: "Laptop",
    brand: "",
    model: "",
    serialNumber: "",
  });

  const [complaint, setComplaint] = useState<string>("");

  // Uploaded Files State
  const [productMedia, setProductMedia] = useState<UploadedFileItem | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<UploadedFileItem | null>(null);
  const [diagnosticFile, setDiagnosticFile] = useState<UploadedFileItem | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Steps definition for persistent progress indicator
  const steps = [
    { num: 1, title: "Customer", icon: User },
    { num: 2, title: "Product", icon: Laptop },
    { num: 3, title: "Complaint", icon: MessageSquareWarning },
    { num: 4, title: "Evidence", icon: UploadCloud },
    { num: 5, title: "Review", icon: CheckCircle2 },
  ];

  // ==========================================
  // DEMO PRE-FILL HELPERS
  // ==========================================
  const loadScenario = (scenario: "dell" | "hp" | "asus") => {
    if (scenario === "dell") {
      setCustomer({
        name: "Sarah Jenkins",
        email: "sarah.jenkins@example.com",
        phone: "+1 (555) 345-6789",
      });
      setProduct({
        category: "Laptop",
        brand: "Dell",
        model: "Inspiron 15 3520",
        serialNumber: "DL123456",
      });
      setComplaint(
        "Display backlight completely failed during normal usage. Screen stays dark while external HDMI monitor works properly. No drops, spills, or physical impacts."
      );
      setProductMedia({
        id: "f-1",
        name: "dell_front_bezel.jpg",
        type: "image/jpeg",
        size: 2150000,
        url: "/mock/evidence/dell_screen_clean.jpg",
        status: "completed",
        progress: 100,
      });
      setInvoiceFile({
        id: "f-2",
        name: "invoice_INV-1024_ABC_Electronics.pdf",
        type: "application/pdf",
        size: 345000,
        url: "/mock/evidence/invoice_inv1024.pdf",
        status: "completed",
        progress: 100,
      });
      setDiagnosticFile({
        id: "f-3",
        name: "dell_epsa_diagnostic_log.json",
        type: "application/json",
        size: 58000,
        url: "/mock/evidence/dell_hardware_diagnostics.json",
        status: "completed",
        progress: 100,
      });
    } else if (scenario === "hp") {
      setCustomer({
        name: "Robert Chen",
        email: "robert.chen@example.com",
        phone: "+1 (555) 789-0123",
      });
      setProduct({
        category: "Laptop",
        brand: "HP",
        model: "Pavilion 14-dv2000",
        serialNumber: "HP789012",
      });
      setComplaint(
        "Opened laptop after a business trip and the display shows spiderweb glass cracks with black ink pools on the right side."
      );
      setProductMedia({
        id: "f-4",
        name: "hp_screen_damage.jpg",
        type: "image/jpeg",
        size: 3200000,
        url: "/mock/evidence/hp_cracked_screen.jpg",
        status: "completed",
        progress: 100,
      });
      setInvoiceFile({
        id: "f-5",
        name: "invoice_INV-1025_BestBuy.pdf",
        type: "application/pdf",
        size: 290000,
        url: "/mock/evidence/invoice_inv1025.pdf",
        status: "completed",
        progress: 100,
      });
      setDiagnosticFile(null);
    } else if (scenario === "asus") {
      setCustomer({
        name: "Priya Patel",
        email: "priya.patel@example.com",
        phone: "+1 (555) 901-2345",
      });
      setProduct({
        category: "Laptop",
        brand: "Asus",
        model: "ZenBook 14 OLED",
        serialNumber: "AS901234",
      });
      setComplaint(
        "Screen is flickering and showing artifacts. Device has never been dropped, knocked, or physically damaged in any way. Purely an internal motherboard issue."
      );
      setProductMedia({
        id: "f-6",
        name: "asus_zenbook_hinge_corner.jpg",
        type: "image/jpeg",
        size: 2800000,
        url: "/mock/evidence/asus_screen_hinge_dent.jpg",
        status: "completed",
        progress: 100,
      });
      setInvoiceFile({
        id: "f-7",
        name: "invoice_INV-1027-X_MicroCenter.pdf",
        type: "application/pdf",
        size: 320000,
        url: "/mock/evidence/invoice_inv1027x.pdf",
        status: "completed",
        progress: 100,
      });
      setDiagnosticFile({
        id: "f-8",
        name: "asus_onboard_sensor_log.json",
        type: "application/json",
        size: 62000,
        url: "/mock/evidence/asus_sensor_log.json",
        status: "completed",
        progress: 100,
      });
    }
    setErrors({});
  };

  // ==========================================
  // STEP VALIDATION
  // ==========================================
  const validateStep = (step: WizardStep): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!customer.name.trim()) newErrors.name = "Full name is required";
      if (!customer.email.trim()) {
        newErrors.email = "Email address is required";
      } else if (!/\S+@\S+\.\S+/.test(customer.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    } else if (step === 2) {
      if (!product.category) newErrors.category = "Category is required";
      if (!product.brand.trim()) newErrors.brand = "Brand is required";
      if (!product.model.trim()) newErrors.model = "Model is required";
      if (!product.serialNumber.trim()) newErrors.serialNumber = "Serial number is required";
    } else if (step === 3) {
      if (!complaint.trim()) {
        newErrors.complaint = "Please describe the problem with your device";
      } else if (complaint.trim().length < 10) {
        newErrors.complaint = "Please provide at least 10 characters describing the fault";
      }
    } else if (step === 4) {
      if (!invoiceFile) {
        newErrors.invoice = "Please upload proof of purchase or invoice";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep((prev) => (prev + 1) as WizardStep);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ==========================================
  // FILE UPLOAD SIMULATOR (WITH STORAGE SERVICE)
  // ==========================================
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "media" | "invoice" | "diagnostic"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validMediaTypes = ["image/jpeg", "image/png", "video/mp4", "video/quicktime"];
    const validInvoiceTypes = ["application/pdf", "image/jpeg", "image/png"];
    const validDiagTypes = ["application/json", "text/html", "application/pdf", "text/plain"];

    let isValid = false;
    let errorMsg = "";

    if (type === "media") {
      isValid = validMediaTypes.includes(file.type);
      if (!isValid) errorMsg = "Unsupported file type. Please upload a JPG, PNG, or MP4.";
    } else if (type === "invoice") {
      isValid = validInvoiceTypes.includes(file.type);
      if (!isValid) errorMsg = "Unsupported file type. Please upload a PDF, JPG, or PNG.";
    } else if (type === "diagnostic") {
      isValid = validDiagTypes.includes(file.type);
      // fallback for json file without mime type sometimes
      if (file.name.endsWith(".json")) isValid = true;
      if (!isValid) errorMsg = "Unsupported file type. Please upload JSON, HTML, PDF, or TXT.";
    }

    if (!isValid) {
      alert(errorMsg);
      return;
    }

    const tempId = `up-${Date.now()}`;
    const initialItem: UploadedFileItem = {
      id: tempId,
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      url: "",
      status: "uploading",
      progress: 30,
    };

    if (type === "media") setProductMedia(initialItem);
    if (type === "invoice") setInvoiceFile(initialItem);
    if (type === "diagnostic") setDiagnosticFile(initialItem);

    // Call real mock storage service abstraction
    try {
      const stored = await uploadFile(file);

      const completedItem: UploadedFileItem = {
        id: tempId,
        name: stored.fileName,
        type: stored.fileType,
        size: stored.fileSizeBytes,
        url: stored.url,
        status: "completed",
        progress: 100,
      };

      if (type === "media") setProductMedia(completedItem);
      if (type === "invoice") {
        setInvoiceFile(completedItem);
        setErrors((prev) => ({ ...prev, invoice: "" }));
      }
      if (type === "diagnostic") setDiagnosticFile(completedItem);
    } catch {
      const errorItem: UploadedFileItem = {
        ...initialItem,
        status: "error",
        progress: 0,
      };
      if (type === "media") setProductMedia(errorItem);
      if (type === "invoice") setInvoiceFile(errorItem);
      if (type === "diagnostic") setDiagnosticFile(errorItem);
    }
  };

  // ==========================================
  // FINAL SUBMISSION
  // ==========================================
  const handleSubmitClaim = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const filesPayload: ClaimFiles = {};
    if (productMedia) {
      filesPayload.productImage = {
        url: productMedia.url,
        filename: productMedia.name,
        fileSize: productMedia.size,
        mimeType: productMedia.type,
      };
    }
    if (invoiceFile) {
      filesPayload.invoice = {
        url: invoiceFile.url,
        filename: invoiceFile.name,
        fileSize: invoiceFile.size,
        mimeType: invoiceFile.type,
      };
    }
    if (diagnosticFile) {
      filesPayload.diagnosticReport = {
        url: diagnosticFile.url,
        filename: diagnosticFile.name,
        fileSize: diagnosticFile.size,
        mimeType: diagnosticFile.type,
      };
    }

    try {
      const response = await claimsApi.createClaim({
        customer,
        product,
        complaint,
        files: filesPayload,
      });

      const claimId = response.claim_id || response.claimId;
      setCreatedClaimId(claimId);

      // Route directly to tracking / live analysis page
      setTimeout(() => {
        router.push(`/customer/track?id=${encodeURIComponent(claimId)}`);
      }, 1200);
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(err instanceof Error ? err.message : "Submission failed. Please retry.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-navy-950 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-subtle">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </div>
            <span className="font-bold text-base text-navy-950">Warranty Arbiter</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/customer/my-claims"
              className="text-xs font-semibold text-slate-700 hover:text-navy-950 transition"
            >
              My Claims
            </Link>
            <Link
              href="/customer/track"
              className="text-xs font-semibold text-slate-700 hover:text-navy-950 transition"
            >
              Tracker
            </Link>
            <button
              type="button"
              onClick={() => logout()}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex-1">
        {/* Pre-fill Scenario Chips for Evaluator Convenience */}
        <div className="mb-6 p-4 rounded-xl bg-navy-50/70 border border-navy-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-subtle">
          <div className="flex items-center gap-2 text-xs font-semibold text-navy-900">
            <Sparkles className="w-4 h-4 text-navy-700 shrink-0" />
            <span>Fast Test Presets:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadScenario("dell")}
              className="px-3 py-1 rounded-md text-xs font-medium bg-white hover:bg-slate-100 text-navy-900 border border-slate-300 shadow-sm transition"
            >
              Dell (Valid Display)
            </button>
            <button
              type="button"
              onClick={() => loadScenario("hp")}
              className="px-3 py-1 rounded-md text-xs font-medium bg-white hover:bg-slate-100 text-navy-900 border border-slate-300 shadow-sm transition"
            >
              HP (Cracked Screen)
            </button>
            <button
              type="button"
              onClick={() => loadScenario("asus")}
              className="px-3 py-1 rounded-md text-xs font-medium bg-white hover:bg-slate-100 text-navy-900 border border-slate-300 shadow-sm transition"
            >
              Asus (Conflict Test)
            </button>
          </div>
        </div>

        {/* Progress Tracker Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle p-6 mb-8">
          <div className="flex items-center justify-between relative">
            {/* Connecting Bar */}
            <div className="absolute left-6 right-6 top-5 h-0.5 bg-slate-200 z-0" />
            <div
              className="absolute left-6 top-5 h-0.5 bg-navy-900 z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 90}%` }}
            />

            {steps.map((s) => {
              const isCompleted = currentStep > s.num;
              const isActive = currentStep === s.num;
              const Icon = s.icon;

              return (
                <div key={s.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-navy-900 text-white shadow-sm"
                        : isActive
                        ? "bg-white border-2 border-navy-900 text-navy-950 font-bold shadow-card ring-4 ring-navy-50"
                        : "bg-slate-100 border border-slate-300 text-slate-400"
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`mt-2 text-xs font-semibold tracking-tight ${
                      isActive ? "text-navy-950" : isCompleted ? "text-navy-700" : "text-slate-400"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Success Modal / Banner on Submission */}
        {createdClaimId && (
          <div className="mb-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center animate-in fade-in">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-emerald-950">
              Claim Created Successfully: {createdClaimId}
            </h3>
            <p className="text-xs text-emerald-700 mt-1">
              Routing to RocketRide live analysis &amp; tracker...
            </p>
          </div>
        )}

        {/* Wizard Step Forms */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8">
          {/* ========================================================================= */}
          {/* STEP 1: CUSTOMER INFO */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-navy-950">Customer Contact Information</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Enter your details so we can verify proof of purchase and dispatch claim updates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm text-navy-950 focus:outline-none focus:ring-2 focus:ring-navy-900 ${
                      errors.name ? "border-rose-500 bg-rose-50/20" : "border-slate-300"
                    }`}
                  />
                  {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="sarah.jenkins@example.com"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm text-navy-950 focus:outline-none focus:ring-2 focus:ring-navy-900 ${
                      errors.email ? "border-rose-500 bg-rose-50/20" : "border-slate-300"
                    }`}
                  />
                  {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={customer.phone || ""}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="+1 (555) 345-6789"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-navy-950 focus:outline-none focus:ring-2 focus:ring-navy-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: PRODUCT INFO */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-navy-950">Product Details</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Specify the exact category, brand, and hardware serial number of your item.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                    Product Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={product.category}
                    onChange={(e) => setProduct({ ...product, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-navy-950 bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                  >
                    <option value="Laptop">Laptop / Notebook</option>
                    <option value="Displays">Monitor / Display</option>
                    <option value="Audio">Audio / Headphones</option>
                    <option value="Wearables">Smartwatch / Wearable</option>
                    <option value="Smartphones">Smartphone</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                    Brand <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={product.brand}
                    onChange={(e) => setProduct({ ...product, brand: e.target.value })}
                    placeholder="e.g. Dell, HP, Asus, Apple"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm text-navy-950 focus:outline-none focus:ring-2 focus:ring-navy-900 ${
                      errors.brand ? "border-rose-500 bg-rose-50/20" : "border-slate-300"
                    }`}
                  />
                  {errors.brand && <p className="text-xs text-rose-600 mt-1">{errors.brand}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                    Model Name / Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={product.model}
                    onChange={(e) => setProduct({ ...product, model: e.target.value })}
                    placeholder="e.g. Inspiron 15 3520"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm text-navy-950 focus:outline-none focus:ring-2 focus:ring-navy-900 ${
                      errors.model ? "border-rose-500 bg-rose-50/20" : "border-slate-300"
                    }`}
                  />
                  {errors.model && <p className="text-xs text-rose-600 mt-1">{errors.model}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                    Serial Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={product.serialNumber}
                    onChange={(e) => setProduct({ ...product, serialNumber: e.target.value })}
                    placeholder="e.g. DL123456"
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm font-mono text-navy-950 focus:outline-none focus:ring-2 focus:ring-navy-900 ${
                      errors.serialNumber ? "border-rose-500 bg-rose-50/20" : "border-slate-300"
                    }`}
                  />
                  {errors.serialNumber && (
                    <p className="text-xs text-rose-600 mt-1">{errors.serialNumber}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: COMPLAINT */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-navy-950">Describe the Issue</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Explain what occurred, how the device is behaving, and whether any physical drops or water contact occurred.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                  Detailed Complaint <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={6}
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  placeholder="My laptop screen suddenly stopped working. The backlight is dark but I can see faint images when shining a light."
                  className={`w-full px-4 py-3 rounded-xl border text-sm text-navy-950 focus:outline-none focus:ring-2 focus:ring-navy-900 leading-relaxed ${
                    errors.complaint ? "border-rose-500 bg-rose-50/20" : "border-slate-300"
                  }`}
                />
                {errors.complaint && (
                  <p className="text-xs text-rose-600 mt-1.5">{errors.complaint}</p>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  Tip: Accurate details help the Fault and Warranty AI agents categorize your failure correctly.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: UPLOAD EVIDENCE */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-navy-950">Upload Evidence Attachments</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Provide photos/video of your product, the original purchase invoice, and any diagnostic logs.
                </p>
              </div>

              {errors.invoice && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.invoice}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                {/* 1. Product Photo / Video */}
                <div className="border border-dashed border-slate-300 hover:border-navy-400 rounded-xl p-4 flex flex-col justify-between bg-slate-50/50 transition">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Camera className="w-4 h-4 text-navy-700" />
                      <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider">
                        Product Photo / Video
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                      Clear photos showing front screen, serial label, or damage.
                    </p>

                    {productMedia ? (
                      <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-subtle flex items-center justify-between">
                        <div className="truncate mr-2">
                          <p className="text-xs font-semibold text-navy-900 truncate">
                            {productMedia.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {(productMedia.size / 1024 / 1024).toFixed(2)} MB &bull; {productMedia.type}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setProductMedia(null)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block border border-slate-200 bg-white hover:bg-slate-50 rounded-lg p-4 text-center text-xs font-medium text-navy-900 transition">
                        <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <span>Choose JPG, PNG, MP4</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={(e) => handleFileUpload(e, "media")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* 2. Invoice / Receipt (Required) */}
                <div className="border border-dashed border-slate-300 hover:border-navy-400 rounded-xl p-4 flex flex-col justify-between bg-slate-50/50 transition">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-navy-700" />
                      <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider">
                        Purchase Invoice <span className="text-rose-500">*</span>
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                      PDF receipt or photo of bill showing date, retailer &amp; serial.
                    </p>

                    {invoiceFile ? (
                      <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-subtle flex items-center justify-between">
                        <div className="truncate mr-2">
                          <p className="text-xs font-semibold text-navy-900 truncate">
                            {invoiceFile.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {(invoiceFile.size / 1024).toFixed(1)} KB &bull; {invoiceFile.type}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setInvoiceFile(null)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block border border-slate-200 bg-white hover:bg-slate-50 rounded-lg p-4 text-center text-xs font-medium text-navy-900 transition">
                        <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <span>Choose PDF or Receipt</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => handleFileUpload(e, "invoice")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* 3. Diagnostic Report */}
                <div className="border border-dashed border-slate-300 hover:border-navy-400 rounded-xl p-4 flex flex-col justify-between bg-slate-50/50 transition">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileSearch className="w-4 h-4 text-navy-700" />
                      <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider">
                        Diagnostic Report
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">
                      Hardware test report, sensor log, or battery dump (optional).
                    </p>

                    {diagnosticFile ? (
                      <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-subtle flex items-center justify-between">
                        <div className="truncate mr-2">
                          <p className="text-xs font-semibold text-navy-900 truncate">
                            {diagnosticFile.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {(diagnosticFile.size / 1024).toFixed(1)} KB &bull; {diagnosticFile.type}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDiagnosticFile(null)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block border border-slate-200 bg-white hover:bg-slate-50 rounded-lg p-4 text-center text-xs font-medium text-navy-900 transition">
                        <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <span>Choose JSON / HTML / PDF</span>
                        <input
                          type="file"
                          accept=".json,.html,.pdf,.txt"
                          onChange={(e) => handleFileUpload(e, "diagnostic")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: REVIEW & SUBMIT */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-navy-950">Review Claim Summary</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Confirm your claim information before launching the multi-agent AI verification pipeline.
                </p>
              </div>

              {submitError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="space-y-4 pt-2">
                {/* Customer Section */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-navy-900">
                      Customer
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-navy-700 font-medium hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">Name</span>
                      <span className="font-semibold text-navy-950">{customer.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Email</span>
                      <span className="font-semibold text-navy-950">{customer.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Phone</span>
                      <span className="font-semibold text-navy-950">{customer.phone || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Product Section */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-navy-900">
                      Product
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-navy-700 font-medium hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block">Category</span>
                      <span className="font-semibold text-navy-950">{product.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Brand</span>
                      <span className="font-semibold text-navy-950">{product.brand}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Model</span>
                      <span className="font-semibold text-navy-950">{product.model}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Serial Number</span>
                      <span className="font-semibold text-navy-950 font-mono">
                        {product.serialNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Complaint Section */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-navy-900">
                      Reported Problem
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs text-navy-700 font-medium hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {complaint}
                  </p>
                </div>

                {/* Uploads Section */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-navy-900">
                      Attached Files
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="text-xs text-navy-700 font-medium hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <Camera className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500">Visual Evidence:</span>
                      <span className="font-medium text-navy-950">
                        {productMedia ? productMedia.name : "None attached"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500">Invoice:</span>
                      <span className="font-medium text-navy-950">
                        {invoiceFile ? invoiceFile.name : "None attached"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileSearch className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500">Diagnostics:</span>
                      <span className="font-medium text-navy-950">
                        {diagnosticFile ? diagnosticFile.name : "None attached"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-sm transition"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitClaim}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold shadow-card transition transform active:scale-95 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" /> Submitting Claim...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Submit Claim
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
