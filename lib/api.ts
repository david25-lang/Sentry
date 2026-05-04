// API Service for Sentry Road Damage Detection
// =============================================

import type {
  BoundingBox,
  DamageClass,
  Detection,
  ImageAnalysisResult,
  ModelComparisonResult,
  ModelBenchmark,
  ModelInfo,
  HealthResponse,
  ClassesResponse,
} from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://sentry-backend-cucr.onrender.com";

const DEFAULT_MODEL_INFO: ModelInfo[] = [
  {
    name: "YOLOv8",
    type: "detection",
    classes: ["pothole", "crack", "normal"],
    input_size: "640x640",
    description: "Road damage detection model",
  },
  {
    name: "CNN",
    type: "classification",
    classes: ["pothole", "crack", "normal"],
    input_size: "224x224",
    description: "Road damage classification model",
  },
];

const DEFAULT_CLASS_INFO: ClassesResponse = {
  classes: [
    { id: 0, name: "Pothole", description: "Holes or depressions in road surface" },
    { id: 1, name: "Crack", description: "Linear fractures in pavement" },
    { id: 2, name: "Normal", description: "No visible road damage" },
  ],
  total_classes: 3,
};

const DEFAULT_HEALTH: HealthResponse = {
  status: "healthy",
  version: "1.0.0",
  timestamp: new Date().toISOString(),
  model_loaded: true,
  model_classes: ["pothole", "crack", "normal"],
  device: "cpu",
};

export const MODEL_BENCHMARKS: ModelBenchmark[] = [
  { model: "yolo", accuracy: 0.8119, metric: "mAP@50" },
  { model: "cnn", accuracy: 0.7830, metric: "micro-F1" },
];

function buildClientSideComparison(
  yolo_result: ImageAnalysisResult,
  cnn_result: ImageAnalysisResult
): ModelComparisonResult {
  return {
    success: true,
    yolo_result,
    cnn_result,
    agreement:
      (yolo_result.primary_class ?? null) !== null &&
      yolo_result.primary_class === cnn_result.primary_class,
    accuracy_winner: getAccuracyWinner(MODEL_BENCHMARKS),
    benchmarks: MODEL_BENCHMARKS,
    timestamp: new Date().toISOString(),
  };
}

function normalizeClassName(value: unknown): string {
  if (typeof value !== "string") return "unknown";
  return value.trim().toLowerCase();
}

function normalizeBBox(input: unknown): BoundingBox | null {
  if (!input) return null;
  if (
    typeof input === "object" &&
    input !== null &&
    "x1" in input &&
    "y1" in input &&
    "x2" in input &&
    "y2" in input
  ) {
    const box = input as BoundingBox;
    return {
      x1: box.x1,
      y1: box.y1,
      x2: box.x2,
      y2: box.y2,
      width: box.width ?? Math.max(0, box.x2 - box.x1),
      height: box.height ?? Math.max(0, box.y2 - box.y1),
    };
  }

  if (Array.isArray(input) && input.length >= 4) {
    const [a, b, c, d] = input.map((v) => Number(v));
    if ([a, b, c, d].some((v) => Number.isNaN(v))) return null;
    const width = c >= a ? c - a : c;
    const height = d >= b ? d - b : d;
    return {
      x1: a,
      y1: b,
      x2: c >= a ? c : a + c,
      y2: d >= b ? d : b + d,
      width,
      height,
    };
  }

  return null;
}

function normalizePredictResponse(
  raw: Record<string, unknown>,
  context: { filename?: string; imageUrl?: string } = {}
): ImageAnalysisResult {
  const detectionsRaw =
    (raw.detections as unknown[]) ||
    (raw.predictions as unknown[]) ||
    (raw.results as unknown[]) ||
    [];

  const detections: Detection[] = detectionsRaw
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const className = normalizeClassName(
        record.class_name ?? record.class ?? record.label
      );
      const confidence = Number(record.confidence ?? record.score ?? 0);
      return {
        class_id: Number(record.class_id ?? record.classId ?? index),
        class_name: (className || "unknown") as DamageClass,
        confidence: Number.isNaN(confidence) ? 0 : confidence,
        bounding_box: normalizeBBox(
          record.bounding_box ?? record.bbox ?? record.box
        ),
      };
    })
    .filter((item): item is Detection => item !== null);

  const primaryClass =
    (raw.primary_class as string | undefined) ||
    detections[0]?.class_name ||
    null;

  const imageUrl =
    (raw.image_url as string | undefined) ||
    (raw.imageUrl as string | undefined) ||
    context.imageUrl ||
    null;

  const filename =
    (raw.filename as string | undefined) ||
    context.filename ||
    null;

  const processingTime = Number(
    raw.processing_time_ms ?? raw.processingTime ?? 0
  );

  return {
    success: raw.success !== undefined ? Boolean(raw.success) : true,
    model_used: (raw.model_used as string) || (raw.model as string) || "yolo",
    image_url: imageUrl,
    filename,
    processing_time_ms: Number.isNaN(processingTime) ? 0 : processingTime,
    image_size:
      (raw.image_size as ImageAnalysisResult["image_size"]) ||
      ({ width: 0, height: 0 } as ImageAnalysisResult["image_size"]),
    detections,
    primary_class: (primaryClass ? primaryClass.toLowerCase() : null) as
      | DamageClass
      | null,
    total_detections:
      (raw.total_detections as number | undefined) ?? detections.length,
    applied_confidence_threshold:
      (raw.applied_confidence_threshold as number | null | undefined) ?? null,
    timestamp: (raw.timestamp as string | undefined) || new Date().toISOString(),
  };
}

async function predictFromUpload(
  file: File,
  context: { imageUrl?: string } = {}
): Promise<ImageAnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${API_BASE_URL}/predict`;
  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.error || errorData.detail || `API Error: ${response.status}`;
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  const raw = (await response.json()) as Record<string, unknown>;
  return normalizePredictResponse(raw, {
    filename: file.name,
    imageUrl: context.imageUrl,
  });
}

async function fileFromUrl(url: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image URL: ${response.status}`);
  }
  const blob = await response.blob();
  const urlParts = url.split("/");
  const name = urlParts[urlParts.length - 1] || `image_${Date.now()}`;
  return new File([blob], name, { type: blob.type || "image/jpeg" });
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.error || errorData.detail || `API Error: ${response.status}`;
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return response.json();
}

// ===== Health =====

export async function getHealth(): Promise<HealthResponse> {
  const response = await apiCall<Partial<HealthResponse>>("/health");
  return {
    ...DEFAULT_HEALTH,
    ...response,
    status: (response.status || DEFAULT_HEALTH.status).toLowerCase() === "ok"
      ? "healthy"
      : (response.status || DEFAULT_HEALTH.status),
    model_classes: response.model_classes?.length ? response.model_classes : DEFAULT_HEALTH.model_classes,
    model_loaded: response.model_loaded ?? DEFAULT_HEALTH.model_loaded,
    device: response.device || DEFAULT_HEALTH.device,
    version: response.version || DEFAULT_HEALTH.version,
    timestamp: response.timestamp || DEFAULT_HEALTH.timestamp,
  };
}

// ===== Detection Endpoints (YOLO) =====

export async function detectFromURL(
  url: string,
  potholeOnly: boolean = false
): Promise<ImageAnalysisResult> {
  const file = await fileFromUrl(url);
  return predictFromUpload(file, { imageUrl: url });
}

export async function detectFromUpload(
  file: File,
  potholeOnly: boolean = false
): Promise<ImageAnalysisResult> {
  return predictFromUpload(file);
}

// ===== Classification Endpoints (CNN) =====

export async function classifyFromURL(
  url: string,
  confidenceThreshold: number = 0.5
): Promise<ImageAnalysisResult> {
  const file = await fileFromUrl(url);
  return predictFromUpload(file, { imageUrl: url });
}

export async function classifyFromUpload(
  file: File,
  confidenceThreshold: number = 0.5
): Promise<ImageAnalysisResult> {
  return predictFromUpload(file);
}

// ===== Comparison Helpers =====

function getAccuracyWinner(benchmarks: ModelBenchmark[]): "yolo" | "cnn" | "tie" {
  const yolo = benchmarks.find((b) => b.model === "yolo")?.accuracy ?? 0;
  const cnn = benchmarks.find((b) => b.model === "cnn")?.accuracy ?? 0;
  if (yolo > cnn) return "yolo";
  if (cnn > yolo) return "cnn";
  return "tie";
}

export async function compareFromURL(
  url: string,
  potholeOnly: boolean = false
): Promise<ModelComparisonResult> {
  const request = {
    url,
    pothole_only: potholeOnly,
  };

  try {
    return await apiCall<ModelComparisonResult>("/api/v1/compare/url", {
      method: "POST",
      body: JSON.stringify(request),
    });
  } catch (error) {
    // Backward-compatible fallback when compare endpoint is not available.
    if (
      (error as Error & { status?: number }).status === 404 ||
      (error instanceof Error && error.message.includes("Not Found"))
    ) {
      const [yolo_result, cnn_result] = await Promise.all([
        detectFromURL(url, potholeOnly),
        classifyFromURL(url, 0.5),
      ]);
      return buildClientSideComparison(yolo_result, cnn_result);
    }
    throw error;
  }
}

export async function compareFromUpload(
  file: File,
  potholeOnly: boolean = false
): Promise<ModelComparisonResult> {
  const formData = new FormData();
  formData.append("file", file);

  const endpoint = `${API_BASE_URL}/api/v1/compare/upload?pothole_only=${potholeOnly}`;
  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    return response.json();
  }

  const errorData = await response.json().catch(() => ({}));
  const errorMessage =
    errorData.error || errorData.detail || `API Error: ${response.status}`;

  // Backward-compatible fallback when compare endpoint is not available.
  if (response.status === 404) {
    const [yolo_result, cnn_result] = await Promise.all([
      detectFromUpload(file, potholeOnly),
      classifyFromUpload(file, 0.5),
    ]);
    return buildClientSideComparison(yolo_result, cnn_result);
  }

  throw new Error(errorMessage);
}

// ===== Model Information =====

export async function getModels(): Promise<ModelInfo[]> {
  try {
    return await apiCall<ModelInfo[]>("/api/v1/models");
  } catch (error) {
    if (
      (error as Error & { status?: number }).status === 404 ||
      (error instanceof Error && error.message.includes("Not Found"))
    ) {
      return DEFAULT_MODEL_INFO;
    }
    throw error;
  }
}

export async function getClasses(): Promise<ClassesResponse> {
  try {
    return await apiCall<ClassesResponse>("/api/v1/classes");
  } catch (error) {
    if (
      (error as Error & { status?: number }).status === 404 ||
      (error instanceof Error && error.message.includes("Not Found"))
    ) {
      return DEFAULT_CLASS_INFO;
    }
    throw error;
  }
}

// ===== Utility Functions =====

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return "text-green-500";
  if (confidence >= 0.6) return "text-yellow-500";
  if (confidence >= 0.4) return "text-orange-500";
  return "text-red-500";
}

export function getConfidenceBadgeVariant(confidence: number): "default" | "secondary" | "destructive" | "outline" {
  if (confidence >= 0.7) return "default";
  if (confidence >= 0.5) return "secondary";
  return "destructive";
}

export function getDamageClassColor(className: string): string {
  switch (className) {
    case "pothole":
      return "bg-red-500";
    case "crack":
      return "bg-orange-500";
    case "normal":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
}

export function getDamageClassBorder(className: string): string {
  switch (className) {
    case "pothole":
      return "border-red-500";
    case "crack":
      return "border-orange-500";
    case "normal":
      return "border-green-500";
    default:
      return "border-gray-500";
  }
}

export function getDamageClassIcon(className: string): string {
  switch (className) {
    case "pothole":
      return "🕳️";
    case "crack":
      return "⚡";
    case "normal":
      return "✅";
    default:
      return "❓";
  }
}

export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

export function formatProcessingTime(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}
