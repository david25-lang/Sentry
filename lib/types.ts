// Types for Sentry Road Damage Detection API
// ============================================

// Damage class types — 3-class road damage model
export type DamageClass = "pothole" | "crack" | "normal";

// Bounding box for YOLO detection
export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
}

// Single detection result
export interface Detection {
  class_id: number;
  class_name: DamageClass;
  confidence: number;
  bounding_box: BoundingBox | null;
}

// Image analysis result
export interface ImageAnalysisResult {
  success: boolean;
  model_used: string;
  image_url: string | null;
  filename: string | null;
  processing_time_ms: number;
  image_size: {
    width: number;
    height: number;
  };
  detections: Detection[];
  primary_class: DamageClass | null;
  total_detections: number;
  applied_confidence_threshold?: number | null;
  timestamp: string;
}

// URL request for detection
export interface URLRequest {
  url: string;
  confidence_threshold?: number;
  pothole_only?: boolean;
}

// Model information
export interface ModelInfo {
  name: string;
  type: string;
  classes: string[];
  input_size: string;
  description: string;
  accuracy?: number;
  metric?: string;
}

// Model benchmark metadata used for comparison views
export interface ModelBenchmark {
  model: "yolo" | "cnn";
  accuracy: number;
  metric: string;
}

// YOLO vs CNN comparison response used in frontend state
export interface ModelComparisonResult {
  success: boolean;
  yolo_result: ImageAnalysisResult;
  cnn_result: ImageAnalysisResult;
  agreement: boolean;
  accuracy_winner: "yolo" | "cnn" | "tie";
  benchmarks: ModelBenchmark[];
  timestamp: string;
}

// Health check response (matches new backend)
export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
  model_loaded: boolean;
  model_classes: string[];
  device: string;
}

// Damage class info
export interface DamageClassInfo {
  id: number;
  name: string;
  description: string;
}

// Classes response
export interface ClassesResponse {
  classes: DamageClassInfo[];
  total_classes: number;
}

// Error response
export interface ErrorResponse {
  success: false;
  error: string;
  detail?: string;
  timestamp: string;
  status_code?: number;
}

// Analysis settings
export interface AnalysisSettings {
  showBoundingBoxes: boolean;
  potholeOnly: boolean;
  autoSaveResults: boolean;
  enableNotifications: boolean;
  theme: "light" | "dark" | "system";
}
