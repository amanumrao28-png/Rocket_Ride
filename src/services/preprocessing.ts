/**
 * Evidence Preprocessing Service
 *
 * Invokes RocketRide (https://github.com/rocketride-org/rocketride-server) built-in pipeline nodes:
 * - OCR / Document Parsing Node
 * - PII Anonymization Node
 * - Image Normalization & Vision Ingestion Node
 * - Video Keyframe Extraction Node
 *
 * In environments where a live RocketRide C++ runtime daemon is unavailable, this service executes
 * local mock fallbacks behind identical signatures, clearly flagging `mock: true` and never claiming
 * that live AI inference or OCR was executed.
 */

import { rocketride } from "@/services/rocketride/client";

export interface FileInputPayload {
  url?: string;
  filename?: string;
  content?: string;
  dataUrl?: string;
  fileSizeBytes?: number;
}

export interface ExtractedPdfTextResult {
  text: string;
  pageCount: number;
  extractedFields: {
    invoiceNumber?: string;
    purchaseDate?: string;
    seller?: string;
    totalAmount?: string;
  };
  mock: boolean;
  executionMode: "ROCKETRIDE_RUNTIME" | "MOCK_FALLBACK";
}

export interface OcrResult {
  text: string;
  confidence: number;
  detectedBlocks: Array<{
    text: string;
    boundingBox?: [number, number, number, number];
    confidence: number;
  }>;
  mock: boolean;
  executionMode: "ROCKETRIDE_RUNTIME" | "MOCK_FALLBACK";
}

export interface PiiRedactionResult {
  redactedText: string;
  redactedEntities: Array<{
    entityType: "SSN" | "CREDIT_CARD" | "PHONE" | "EMAIL" | "ADDRESS";
    originalSliceLength: number;
    placeholder: string;
  }>;
  mock: boolean;
  executionMode: "ROCKETRIDE_RUNTIME" | "MOCK_FALLBACK";
}

export interface PreparedVisionImageResult {
  normalizedUrl: string;
  dimensions: { width: number; height: number };
  aspectRatio: string;
  colorSpace: string;
  targetVisionModelNode: string;
  mock: boolean;
  executionMode: "ROCKETRIDE_RUNTIME" | "MOCK_FALLBACK";
}

export interface VideoKeyframesResult {
  keyframes: Array<{
    timestampSeconds: number;
    frameUrl: string;
    description: string;
  }>;
  totalDurationSeconds: number;
  mock: boolean;
  executionMode: "MOCK_VIDEO_EXTRACTOR";
}

/**
 * 1. extractPdfText: Calls RocketRide document-parsing/OCR node against an invoice or report PDF.
 * Production: Executes RocketRide node `document_parser_v1` on C++ runtime.
 * Fallback: MOCK DEMO logic extracting structured placeholder invoice text.
 */
export async function extractPdfText(
  file: string | FileInputPayload
): Promise<ExtractedPdfTextResult> {
  const fileUrl = typeof file === "string" ? file : file.url || "mock_invoice.pdf";
  const fileName = typeof file === "string" ? file : file.filename || "invoice.pdf";

  const mode = rocketride.getMode();

  if (mode === "ROCKETRIDE_RUNTIME") {
    // In production, execute RocketRide document-parsing node
    const res = await rocketride.executePipeline<{
      text: string;
      pageCount: number;
      extractedFields: Record<string, string>;
    }>("document_parser_v1", {
      inputPayload: { fileUrl, fileName, task: "invoice_extraction" },
    });

    return {
      text: res.output.text,
      pageCount: res.output.pageCount,
      extractedFields: res.output.extractedFields,
      mock: false,
      executionMode: "ROCKETRIDE_RUNTIME",
    };
  }

  // MOCK FALLBACK: Simulated document parsing node output
  await new Promise((resolve) => setTimeout(resolve, 350));

  return {
    text: `INVOICE / PROOF OF PURCHASE\nOrder: INV-1024\nSeller: ABC Electronics\nItem: Dell Inspiron 15 3520 (SN: DL123456)\nDate: 2026-01-12\nAmount: $749.99 USD\nStatus: PAID`,
    pageCount: 1,
    extractedFields: {
      invoiceNumber: "INV-1024",
      purchaseDate: "2026-01-12",
      seller: "ABC Electronics",
      totalAmount: "$749.99",
    },
    mock: true,
    executionMode: "MOCK_FALLBACK",
  };
}

/**
 * 2. ocrImageOrPdf: Calls RocketRide OCR node for receipt/photo optical character recognition.
 * Production: Executes RocketRide node `tesseract_ocr_v2` or `cloud_ocr_v1`.
 * Fallback: MOCK DEMO logic simulating OCR block detection.
 */
export async function ocrImageOrPdf(
  file: string | FileInputPayload
): Promise<OcrResult> {
  const fileUrl = typeof file === "string" ? file : file.url || "mock_image.jpg";
  const mode = rocketride.getMode();

  if (mode === "ROCKETRIDE_RUNTIME") {
    const res = await rocketride.executePipeline<{
      text: string;
      confidence: number;
      detectedBlocks: Array<{ text: string; confidence: number }>;
    }>("ocr_node_v1", {
      inputPayload: { fileUrl, lang: "eng" },
    });

    return {
      text: res.output.text,
      confidence: res.output.confidence,
      detectedBlocks: res.output.detectedBlocks,
      mock: false,
      executionMode: "ROCKETRIDE_RUNTIME",
    };
  }

  // MOCK FALLBACK: Clearly labeled mock OCR output
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    text: "DELL INSPIRON 15 - S/N: DL123456 - ASSEMBLED IN TX - 19.5V 3.34A",
    confidence: 0.96,
    detectedBlocks: [
      { text: "DELL INSPIRON 15", confidence: 0.98 },
      { text: "S/N: DL123456", confidence: 0.99 },
      { text: "ASSEMBLED IN TX", confidence: 0.94 },
    ],
    mock: true,
    executionMode: "MOCK_FALLBACK",
  };
}

/**
 * 3. runPiiRedaction: Calls RocketRide PII-anonymization node before sensitive text is stored or displayed.
 * Production: Executes RocketRide node `pii_redaction_ner_v1` using multilingual NER.
 * Fallback: MOCK DEMO regex-based placeholder anonymization.
 */
export async function runPiiRedaction(text: string): Promise<PiiRedactionResult> {
  const mode = rocketride.getMode();

  if (mode === "ROCKETRIDE_RUNTIME") {
    const res = await rocketride.executePipeline<{
      redactedText: string;
      redactedEntities: PiiRedactionResult["redactedEntities"];
    }>("pii_redaction_ner_v1", {
      inputPayload: { rawText: text },
    });

    return {
      redactedText: res.output.redactedText,
      redactedEntities: res.output.redactedEntities,
      mock: false,
      executionMode: "ROCKETRIDE_RUNTIME",
    };
  }

  // MOCK FALLBACK: Regex-based PII redaction for phone, email, card numbers
  await new Promise((resolve) => setTimeout(resolve, 200));

  const phoneRegex = /\b\+?[1-9]\d{0,2}[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g;
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const cardRegex = /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g;

  const redactedEntities: PiiRedactionResult["redactedEntities"] = [];

  let redactedText = text
    .replace(emailRegex, (match) => {
      redactedEntities.push({
        entityType: "EMAIL",
        originalSliceLength: match.length,
        placeholder: "[REDACTED_EMAIL]",
      });
      return "[REDACTED_EMAIL]";
    })
    .replace(phoneRegex, (match) => {
      redactedEntities.push({
        entityType: "PHONE",
        originalSliceLength: match.length,
        placeholder: "[REDACTED_PHONE]",
      });
      return "[REDACTED_PHONE]";
    })
    .replace(cardRegex, (match) => {
      redactedEntities.push({
        entityType: "CREDIT_CARD",
        originalSliceLength: match.length,
        placeholder: "[REDACTED_CARD]",
      });
      return "[REDACTED_CARD]";
    });

  return {
    redactedText,
    redactedEntities,
    mock: true,
    executionMode: "MOCK_FALLBACK",
  };
}

/**
 * 4. prepareImageForVision: Normalizes image resolution/color and structures metadata for Vision Agent.
 * Production: Executes RocketRide node `image_preprocessor_v1` and pipelines to `gemini-1.5-flash-vision`.
 * Fallback: MOCK DEMO image normalization envelope.
 */
export async function prepareImageForVision(
  file: string | FileInputPayload
): Promise<PreparedVisionImageResult> {
  const fileUrl = typeof file === "string" ? file : file.url || "/mock/evidence/sample.jpg";
  const mode = rocketride.getMode();

  if (mode === "ROCKETRIDE_RUNTIME") {
    const res = await rocketride.executePipeline<{
      normalizedUrl: string;
      dimensions: { width: number; height: number };
      aspectRatio: string;
      colorSpace: string;
      targetVisionModelNode: string;
    }>("image_preprocessor_v1", {
      inputPayload: { imageUrl: fileUrl, maxDimension: 1920 },
    });

    return {
      ...res.output,
      mock: false,
      executionMode: "ROCKETRIDE_RUNTIME",
    };
  }

  // MOCK FALLBACK: Normalized image descriptor
  await new Promise((resolve) => setTimeout(resolve, 250));

  return {
    normalizedUrl: fileUrl,
    dimensions: { width: 1920, height: 1080 },
    aspectRatio: "16:9",
    colorSpace: "sRGB",
    targetVisionModelNode: "rocketride.nodes.vision.gemini_vision",
    mock: true,
    executionMode: "MOCK_FALLBACK",
  };
}

/**
 * 5. extractVideoKeyframes: Mock keyframe extraction for video evidence claims.
 * NOTE: Explicitly labeled as MOCK extraction in all environments since video decoding
 * runs locally in mock mode.
 */
export async function extractVideoKeyframes(
  file: string | FileInputPayload
): Promise<VideoKeyframesResult> {
  const fileUrl = typeof file === "string" ? file : file.url || "/mock/evidence/product_video.mp4";

  // Simulated keyframe extraction delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    keyframes: [
      {
        timestampSeconds: 1.2,
        frameUrl: `${fileUrl}#t=1.2`,
        description: "Front display overview under natural ambient lighting",
      },
      {
        timestampSeconds: 4.8,
        frameUrl: `${fileUrl}#t=4.8`,
        description: "Close-up of hinge mechanism and lower bezel assembly",
      },
      {
        timestampSeconds: 8.5,
        frameUrl: `${fileUrl}#t=8.5`,
        description: "Power toggle attempted; screen remains unlit",
      },
    ],
    totalDurationSeconds: 12.4,
    mock: true,
    executionMode: "MOCK_VIDEO_EXTRACTOR",
  };
}
