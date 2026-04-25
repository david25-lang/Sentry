// API Service for Sentry Road Damage Detection
// =============================================

import type {
  ImageAnalysisResult,
  ModelComparisonResult,
  ModelBenchmark,
  URLRequest,
  ModelInfo,
  HealthResponse,
  ClassesResponse,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
    throw new Error(errorData.error || errorData.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// ===== Health =====

export async function getHealth(): Promise<HealthResponse> {
  return apiCall<HealthResponse>("/health");
}

// ===== Detection Endpoints (YOLO) =====

export async function detectFromURL(
  url: string,
  confidenceThreshold: number = 0.25,
  potholeOnly: boolean = false
): Promise<ImageAnalysisResult> {
  const request: URLRequest = {
    url,
    confidence_threshold: confidenceThreshold,
    pothole_only: potholeOnly,
  };

  return apiCall<ImageAnalysisResult>("/api/v1/detect/url", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function detectFromUpload(
  file: File,
  confidenceThreshold: number = 0.25,
  potholeOnly: boolean = false
): Promise<ImageAnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${API_BASE_URL}/api/v1/detect/upload?confidence_threshold=${confidenceThreshold}&pothole_only=${potholeOnly}`;

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// ===== Classification Endpoints (CNN) =====

export async function classifyFromURL(
  url: string,
  confidenceThreshold: number = 0.5
): Promise<ImageAnalysisResult> {
  const request: URLRequest = {
    url,
    confidence_threshold: confidenceThreshold,
  };

  return apiCall<ImageAnalysisResult>("/api/v1/classify/url", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function classifyFromUpload(
  file: File,
  confidenceThreshold: number = 0.5
): Promise<ImageAnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);

  const url = `${API_BASE_URL}/api/v1/classify/upload?confidence_threshold=${confidenceThreshold}`;

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || `API Error: ${response.status}`);
  }

  return response.json();
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
  confidenceThreshold: number = 0.25,
  potholeOnly: boolean = false
): Promise<ModelComparisonResult> {
  const request: URLRequest = {
    url,
    confidence_threshold: confidenceThreshold,
    pothole_only: potholeOnly,
  };

  try {
    return await apiCall<ModelComparisonResult>("/api/v1/compare/url", {
      method: "POST",
      body: JSON.stringify(request),
    });
  } catch (error) {
    // Backward-compatible fallback when compare endpoint is not available.
    if (error instanceof Error && error.message.includes("404")) {
      const [yolo_result, cnn_result] = await Promise.all([
        detectFromURL(url, confidenceThreshold, potholeOnly),
        classifyFromURL(url, 0.5),
      ]);
      return buildClientSideComparison(yolo_result, cnn_result);
    }
    throw error;
  }
}

export async function compareFromUpload(
  file: File,
  confidenceThreshold: number = 0.25,
  potholeOnly: boolean = false
): Promise<ModelComparisonResult> {
  const formData = new FormData();
  formData.append("file", file);

  const endpoint = `${API_BASE_URL}/api/v1/compare/upload?confidence_threshold=${confidenceThreshold}&pothole_only=${potholeOnly}`;
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
      detectFromUpload(file, confidenceThreshold, potholeOnly),
      classifyFromUpload(file, 0.5),
    ]);
    return buildClientSideComparison(yolo_result, cnn_result);
  }

  throw new Error(errorMessage);
}

// ===== Model Information =====

export async function getModels(): Promise<ModelInfo[]> {
  return apiCall<ModelInfo[]>("/api/v1/models");
}

export async function getClasses(): Promise<ClassesResponse> {
  return apiCall<ClassesResponse>("/api/v1/classes");
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
    case "manhole":
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
    case "manhole":
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
    case "manhole":
      return "🔵";
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
