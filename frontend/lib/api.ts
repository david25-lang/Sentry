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
import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://sentry-backend-cucr.onrender.com";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
});

const API_CONNECTION_MESSAGE = `Could not reach the Sentry API at ${API_BASE_URL}. Make sure the backend is running and NEXT_PUBLIC_API_URL is correct.`;

export const DEFAULT_MODEL_INFO: ModelInfo[] = [
  {
    name: "YOLOv8",
    type: "detection",
    classes: ["pothole", "crack", "manhole"],
    input_size: "640x640",
    description: "Road damage detection model",
  },
  {
    name: "CNN",
    type: "classification",
    classes: ["pothole", "crack", "manhole"],
    input_size: "224x224",
    description: "Road damage classification model",
  },
];

export const DEFAULT_CLASS_INFO: ClassesResponse = {
  classes: [
    { id: 0, name: "Pothole", description: "Holes or depressions in road surface" },
    { id: 1, name: "Crack", description: "Linear fractures in pavement" },
    { id: 2, name: "Manhole", description: "Utility access covers embedded in the road surface" },
  ],
  total_classes: 3,
};

export const DEFAULT_HEALTH: HealthResponse = {
  status: "healthy",
  version: "1.0.0",
  timestamp: new Date().toISOString(),
  model_loaded: true,
  model_classes: ["pothole", "crack", "manhole"],
  device: "cpu",
};

function isNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError ||
    (error instanceof Error &&
      /failed to fetch|load failed|networkerror|network request failed/i.test(
        error.message
      ))
  );
}

function getAxiosStatus(error: unknown): number | null {
  if (!axios.isAxiosError(error)) return null;
  return error.response?.status ?? null;
}

function getAxiosErrorData(error: unknown): unknown | null {
  if (!axios.isAxiosError(error)) return null;
  return error.response?.data ?? null;
}

function shouldFallbackAxios(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return isNetworkError(error);
  const status = error.response?.status;
  return !status || status === 404 || status === 405;
}

function createApiConnectionError(error: unknown): Error {
  const apiError = new Error(API_CONNECTION_MESSAGE);
  if (error instanceof Error) {
    apiError.stack = error.stack;
  }
  return apiError;
}

function extractErrorMessage(errorData: unknown, fallback: string): string {
  if (!errorData) return fallback;

  if (typeof errorData === "string") return errorData;

  if (Array.isArray(errorData)) {
    const first = errorData[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") {
      const record = first as Record<string, unknown>;
      if (typeof record.msg === "string") return record.msg;
      if (typeof record.message === "string") return record.message;
    }
    return JSON.stringify(errorData);
  }

  if (typeof errorData === "object") {
    const record = errorData as Record<string, unknown>;
    const error = record.error;
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
      const errorRecord = error as Record<string, unknown>;
      if (typeof errorRecord.message === "string") return errorRecord.message;
      if (typeof errorRecord.detail === "string") return errorRecord.detail;
    }

    const detail = record.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const first = detail[0];
      if (typeof first === "string") return first;
      if (first && typeof first === "object") {
        const detailRecord = first as Record<string, unknown>;
        if (typeof detailRecord.msg === "string") return detailRecord.msg;
        if (typeof detailRecord.message === "string") return detailRecord.message;
      }
    }

    if (typeof record.message === "string") return record.message;

    try {
      return JSON.stringify(errorData);
    } catch {
      return fallback;
    }
  }

  return fallback;
}

function extractMissingField(errorData: unknown): string | null {
  if (!errorData || typeof errorData !== "object") return null;
  const detail = (errorData as Record<string, unknown>).detail;
  if (!Array.isArray(detail)) return null;
  for (const item of detail) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const loc = record.loc;
    const msg = record.msg;
    if (!Array.isArray(loc) || typeof msg !== "string") continue;
    if (!msg.toLowerCase().includes("field required")) continue;
    const field = loc[loc.length - 1];
    if (typeof field === "string") return field;
  }
  return null;
}

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
  const payload =
    raw.data && typeof raw.data === "object"
      ? (raw.data as Record<string, unknown>)
      : raw;

  const detectionsRaw =
    (payload.detections as unknown[]) ||
    (payload.predictions as unknown[]) ||
    (payload.results as unknown[]) ||
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

  const predictedClass =
    (payload.predicted_class as string | undefined) ||
    (payload.predictedClass as string | undefined) ||
    (payload.class as string | undefined) ||
    (payload.label as string | undefined) ||
    (raw.predicted_class as string | undefined) ||
    (raw.predictedClass as string | undefined) ||
    (raw.class as string | undefined) ||
    (raw.label as string | undefined);

  const primaryClass =
    (payload.primary_class as string | undefined) ||
    (raw.primary_class as string | undefined) ||
    predictedClass ||
    detections[0]?.class_name ||
    null;

  const imageUrl =
    (payload.image_url as string | undefined) ||
    (payload.imageUrl as string | undefined) ||
    (payload.output_image_url as string | undefined) ||
    (payload.processed_image as string | undefined) ||
    (payload.processedImage as string | undefined) ||
    (raw.image_url as string | undefined) ||
    (raw.imageUrl as string | undefined) ||
    (raw.output_image_url as string | undefined) ||
    (raw.processed_image as string | undefined) ||
    (raw.processedImage as string | undefined) ||
    context.imageUrl ||
    null;

  const filename =
    (payload.filename as string | undefined) ||
    (raw.filename as string | undefined) ||
    context.filename ||
    null;

  const processingTime = Number(
    payload.processing_time_ms ??
      payload.processingTime ??
      raw.processing_time_ms ??
      raw.processingTime ??
      0
  );

  const appliedConfidenceThreshold =
    (payload.applied_confidence_threshold as number | null | undefined) ??
    (raw.applied_confidence_threshold as number | null | undefined) ??
    (payload.confidence_threshold as number | null | undefined) ??
    (raw.confidence_threshold as number | null | undefined) ??
    null;

  const severity =
    (payload.severity as string | undefined) ||
    (raw.severity as string | undefined) ||
    null;

  const riskLevel =
    (payload.risk_level as string | undefined) ||
    (payload.riskLevel as string | undefined) ||
    (raw.risk_level as string | undefined) ||
    (raw.riskLevel as string | undefined) ||
    null;

  const recommendation =
    (payload.recommendation as string | undefined) ||
    (raw.recommendation as string | undefined) ||
    null;

  const totalDetections =
    (payload.total_detections as number | undefined) ??
    (raw.total_detections as number | undefined) ??
    (payload.num_detections as number | undefined) ??
    (raw.num_detections as number | undefined) ??
    detections.length;

  const modelUsed =
    (payload.model_used as string | undefined) ||
    (payload.model as string | undefined) ||
    (raw.model_used as string | undefined) ||
    (raw.model as string | undefined) ||
    (predictedClass ? "cnn" : "yolo");

  return {
    success:
      raw.success !== undefined
        ? Boolean(raw.success)
        : payload.success !== undefined
          ? Boolean(payload.success)
          : true,
    model_used: modelUsed,
    image_url: imageUrl,
    filename,
    processing_time_ms: Number.isNaN(processingTime) ? 0 : processingTime,
    image_size:
      (payload.image_size as ImageAnalysisResult["image_size"]) ||
      (raw.image_size as ImageAnalysisResult["image_size"]) ||
      ({ width: 0, height: 0 } as ImageAnalysisResult["image_size"]),
    detections,
    primary_class: (primaryClass ? primaryClass.toLowerCase() : null) as
      | DamageClass
      | null,
    total_detections: totalDetections,
    applied_confidence_threshold: appliedConfidenceThreshold,
    severity,
    risk_level: riskLevel,
    recommendation,
    timestamp:
      (payload.timestamp as string | undefined) ||
      (raw.timestamp as string | undefined) ||
      new Date().toISOString(),
  };
}

type UploadAttempt =
  | { ok: true; status: number; data: Record<string, unknown> }
  | { ok: false; status: number; errorData: unknown };

async function postFormData(url: string, formData: FormData): Promise<UploadAttempt> {
  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    throw createApiConnectionError(error);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return { ok: false, status: response.status, errorData: payload };
  }

  return { ok: true, status: response.status, data: payload as Record<string, unknown> };
}

async function uploadImage(
  endpoint: string,
  file: File,
  query: Record<string, string | number | boolean | null | undefined> = {},
  context: { imageUrl?: string } = {},
  options: {
    fieldName?: string;
    fallback?: { endpoint: string; fieldName: string }[];
  } = {}
): Promise<ImageAnalysisResult> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      params.set(key, String(value));
    }
  });

  const buildUrl = (targetEndpoint: string) =>
    `${API_BASE_URL}${targetEndpoint}${params.size ? `?${params.toString()}` : ""}`;

  const attempts = [
    { endpoint, fieldName: options.fieldName ?? "file" },
    ...(options.fallback ?? []),
  ];

  let lastError: { status: number; errorData: unknown } | null = null;

  for (let index = 0; index < attempts.length; index += 1) {
    const attempt = attempts[index];
    const formData = new FormData();
    formData.append(attempt.fieldName, file);

    const result = await postFormData(buildUrl(attempt.endpoint), formData);
    if (result.ok) {
      return normalizePredictResponse(result.data, {
        filename: file.name,
        imageUrl: context.imageUrl,
      });
    }

    lastError = { status: result.status, errorData: result.errorData };

    const remaining = attempts.slice(index + 1);
    if (!remaining.length) break;

    const missingField = extractMissingField(result.errorData);
    const hasFieldFallback =
      missingField !== null &&
      remaining.some((item) => item.fieldName === missingField);

    const hasEndpointFallback =
      result.status === 404 || result.status === 405;

    if (!hasFieldFallback && !hasEndpointFallback) break;
  }

  const message = extractErrorMessage(
    lastError?.errorData,
    `API Error: ${lastError?.status ?? "unknown"}`
  );
  const error = new Error(message) as Error & { status?: number };
  error.status = lastError?.status;
  throw error;
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (error) {
    throw createApiConnectionError(error);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = extractErrorMessage(
      errorData,
      `API Error: ${response.status}`
    );
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return response.json();
}

// ===== Health =====

export async function getHealth(): Promise<HealthResponse> {
  let response: Partial<HealthResponse>;

  try {
    response = await apiCall<Partial<HealthResponse>>("/health");
  } catch (error) {
    if (isNetworkError(error) || error instanceof Error) {
      return {
        ...DEFAULT_HEALTH,
        status: "offline",
        model_loaded: false,
        timestamp: new Date().toISOString(),
      };
    }
    throw error;
  }

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
  try {
    const response = await axiosClient.post("/detect", {
      url,
      pothole_only: potholeOnly,
    });
    return normalizePredictResponse(response.data as Record<string, unknown>, { imageUrl: url });
  } catch (error) {
    if (shouldFallbackAxios(error)) {
      const raw = await apiCall<Record<string, unknown>>("/api/v1/detect/url", {
        method: "POST",
        body: JSON.stringify({
          url,
          pothole_only: potholeOnly,
        }),
      });
      return normalizePredictResponse(raw, { imageUrl: url });
    }

    const message = extractErrorMessage(
      getAxiosErrorData(error),
      "Detection failed"
    );
    throw new Error(message);
  }
}

export async function detectFromUpload(
  file: File,
  potholeOnly: boolean = false
): Promise<ImageAnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("pothole_only", String(potholeOnly));

  try {
    const response = await axiosClient.post("/detect", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return normalizePredictResponse(response.data as Record<string, unknown>, {
      filename: file.name,
    });
  } catch (error) {
    const missingField = extractMissingField(getAxiosErrorData(error));
    if (missingField === "image") {
      const retryForm = new FormData();
      retryForm.append("image", file);
      retryForm.append("pothole_only", String(potholeOnly));
      try {
        const response = await axiosClient.post("/detect", retryForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return normalizePredictResponse(response.data as Record<string, unknown>, {
          filename: file.name,
        });
      } catch (retryError) {
        if (!shouldFallbackAxios(retryError)) {
          const message = extractErrorMessage(
            getAxiosErrorData(retryError),
            "Detection failed"
          );
          throw new Error(message);
        }
      }
    }

    if (shouldFallbackAxios(error)) {
      return uploadImage(
        "/api/v1/detect/upload",
        file,
        { pothole_only: potholeOnly },
        {},
        {
          fieldName: "file",
          fallback: [
            { endpoint: "/api/v1/detect/upload", fieldName: "image" },
            { endpoint: "/api/v1/detect", fieldName: "image" },
          ],
        }
      );
    }

    const message = extractErrorMessage(
      getAxiosErrorData(error),
      "Detection failed"
    );
    throw new Error(message);
  }
}

// ===== Classification Endpoints (CNN) =====

export async function classifyFromURL(
  url: string,
  confidenceThreshold: number = 0.5
): Promise<ImageAnalysisResult> {
  try {
    const response = await axiosClient.post("/classify", {
      url,
      confidence_threshold: confidenceThreshold,
    });
    return normalizePredictResponse(response.data as Record<string, unknown>, { imageUrl: url });
  } catch (error) {
    if (shouldFallbackAxios(error)) {
      const raw = await apiCall<Record<string, unknown>>("/api/v1/classify/url", {
        method: "POST",
        body: JSON.stringify({
          url,
          confidence_threshold: confidenceThreshold,
        }),
      });
      return normalizePredictResponse(raw, { imageUrl: url });
    }

    const message = extractErrorMessage(
      getAxiosErrorData(error),
      "Classification failed"
    );
    throw new Error(message);
  }
}

export async function classifyFromUpload(
  file: File,
  confidenceThreshold: number = 0.5
): Promise<ImageAnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("confidence_threshold", String(confidenceThreshold));

  try {
    const response = await axiosClient.post("/classify", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return normalizePredictResponse(response.data as Record<string, unknown>, {
      filename: file.name,
    });
  } catch (error) {
    const missingField = extractMissingField(getAxiosErrorData(error));
    if (missingField === "image") {
      const retryForm = new FormData();
      retryForm.append("image", file);
      retryForm.append("confidence_threshold", String(confidenceThreshold));
      try {
        const response = await axiosClient.post("/classify", retryForm, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return normalizePredictResponse(response.data as Record<string, unknown>, {
          filename: file.name,
        });
      } catch (retryError) {
        if (!shouldFallbackAxios(retryError)) {
          const message = extractErrorMessage(
            getAxiosErrorData(retryError),
            "Classification failed"
          );
          throw new Error(message);
        }
      }
    }

    if (shouldFallbackAxios(error)) {
      return uploadImage(
        "/api/v1/classify/upload",
        file,
        { confidence_threshold: confidenceThreshold },
        {},
        {
          fieldName: "file",
          fallback: [
            { endpoint: "/api/v1/classify/upload", fieldName: "image" },
            { endpoint: "/api/v1/classify", fieldName: "image" },
          ],
        }
      );
    }

    const message = extractErrorMessage(
      getAxiosErrorData(error),
      "Classification failed"
    );
    throw new Error(message);
  }
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
    const raw = await apiCall<Record<string, unknown>>("/api/v1/compare/url", {
      method: "POST",
      body: JSON.stringify(request),
    });
    return normalizeCompareResponse(raw);
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
  const endpoint = `${API_BASE_URL}/api/v1/compare/upload?pothole_only=${potholeOnly}`;
  const formData = new FormData();
  formData.append("file", file);

  const initial = await postFormData(endpoint, formData);
  if (initial.ok) {
    return normalizeCompareResponse(initial.data);
  }

  let errorData = initial.errorData;
  let status = initial.status;

  if (status === 422 && extractMissingField(errorData) === "image") {
    const retryForm = new FormData();
    retryForm.append("image", file);
    const retry = await postFormData(endpoint, retryForm);
    if (retry.ok) {
      return normalizeCompareResponse(retry.data);
    }
    errorData = retry.errorData;
    status = retry.status;
  }

  const errorMessage = extractErrorMessage(
    errorData,
    `API Error: ${status}`
  );

  // Backward-compatible fallback when compare endpoint is not available.
  if (status === 404) {
    const [yolo_result, cnn_result] = await Promise.all([
      detectFromUpload(file, potholeOnly),
      classifyFromUpload(file, 0.5),
    ]);
    return buildClientSideComparison(yolo_result, cnn_result);
  }

  throw new Error(errorMessage);
}

function normalizeCompareResponse(
  raw: Record<string, unknown>
): ModelComparisonResult {
  if ("yolo_result" in raw && "cnn_result" in raw) {
    return raw as unknown as ModelComparisonResult;
  }

  const payload =
    raw.data && typeof raw.data === "object"
      ? (raw.data as Record<string, unknown>)
      : raw;

  if ("yolo" in payload && "cnn" in payload) {
    const yolo = payload.yolo as Record<string, unknown> | undefined;
    const cnn = payload.cnn as Record<string, unknown> | undefined;

    return {
      success: raw.success !== undefined ? Boolean(raw.success) : true,
      yolo_result: normalizePredictResponse({
        ...(yolo ?? {}),
        model_used: "yolo",
      }),
      cnn_result: normalizePredictResponse({
        ...(cnn ?? {}),
        model_used: "cnn",
      }),
      agreement: Boolean(payload.agreement ?? raw.agreement ?? false),
      accuracy_winner: getAccuracyWinner(MODEL_BENCHMARKS),
      benchmarks: MODEL_BENCHMARKS,
      timestamp:
        (raw.timestamp as string | undefined) || new Date().toISOString(),
    };
  }

  return raw as unknown as ModelComparisonResult;
}

// ===== Model Information =====

export async function getModels(): Promise<ModelInfo[]> {
  try {
    return await apiCall<ModelInfo[]>("/api/v1/models");
  } catch (error) {
    if (
      (error as Error & { status?: number }).status === 404 ||
      (error instanceof Error && error.message.includes("Not Found")) ||
      isNetworkError(error) ||
      error instanceof Error
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
      (error instanceof Error && error.message.includes("Not Found")) ||
      isNetworkError(error) ||
      error instanceof Error
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
    case "normal":
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
    case "normal":
      return "✅";
    case "manhole":
      return "M";
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
