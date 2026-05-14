// ML Model and Training Data Types
export interface MetricValue {
  epoch: number;
  value: number;
  timestamp: Date;
}

export interface ModelMetrics {
  mAP: number;
  precision: number;
  recall: number;
  loss: number;
  modelName: string;
  trainingStatus: 'training' | 'completed' | 'paused' | 'failed';
  lastTrained: Date;
  totalEpochs: number;
  currentEpoch: number;
}

export interface TrainingData {
  lossHistory: MetricValue[];
  mAPHistory: MetricValue[];
  precisionHistory: MetricValue[];
  recallHistory: MetricValue[];
}

export interface DatasetInfo {
  totalImages: number;
  numClasses: number;
  classDistribution: { name: string; count: number }[];
  trainTestSplit: { train: number; test: number; val: number };
}

export interface DetectionResult {
  class: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

export interface PredictionSample {
  id: string;
  imageUrl: string;
  detections: DetectionResult[];
  processingTime: number;
}

export interface UploadResponse {
  success: boolean;
  predictions: DetectionResult[];
  imageUrl: string;
  processingTime: number;
  error?: string;
}

// Dummy Data
export const dummyMetrics: ModelMetrics = {
  mAP: 0.856,
  precision: 0.891,
  recall: 0.823,
  loss: 0.0342,
  modelName: 'ResNet18 CNN Road Damage Classifier',
  trainingStatus: 'completed',
  lastTrained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  totalEpochs: 100,
  currentEpoch: 100,
};

export const dummyTrainingData: TrainingData = {
  lossHistory: Array.from({ length: 100 }, (_, i) => ({
    epoch: i + 1,
    value: Math.max(0.05, 2.5 * Math.exp(-i / 15) + Math.random() * 0.1),
    timestamp: new Date(Date.now() - (100 - i) * 24 * 60 * 60 * 1000),
  })),
  mAPHistory: Array.from({ length: 100 }, (_, i) => ({
    epoch: i + 1,
    value: Math.min(0.9, 0.5 + 0.4 * (1 - Math.exp(-i / 20)) + (Math.random() - 0.5) * 0.05),
    timestamp: new Date(Date.now() - (100 - i) * 24 * 60 * 60 * 1000),
  })),
  precisionHistory: Array.from({ length: 100 }, (_, i) => ({
    epoch: i + 1,
    value: Math.min(0.95, 0.6 + 0.35 * (1 - Math.exp(-i / 18)) + (Math.random() - 0.5) * 0.04),
    timestamp: new Date(Date.now() - (100 - i) * 24 * 60 * 60 * 1000),
  })),
  recallHistory: Array.from({ length: 100 }, (_, i) => ({
    epoch: i + 1,
    value: Math.min(0.9, 0.5 + 0.4 * (1 - Math.exp(-i / 22)) + (Math.random() - 0.5) * 0.05),
    timestamp: new Date(Date.now() - (100 - i) * 24 * 60 * 60 * 1000),
  })),
};

export const dummyDataset: DatasetInfo = {
  totalImages: 2347,
  numClasses: 3,
  classDistribution: [
    { name: 'Pothole', count: 645 },
    { name: 'Crack', count: 523 },
    { name: 'Normal', count: 1179 },
  ],
  trainTestSplit: { train: 70, test: 15, val: 15 },
};

export const dummyPredictions: PredictionSample[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695c952952?w=400&h=400&fit=crop',
    detections: [
      { class: 'Pothole', confidence: 0.94, bbox: [120, 150, 80, 100] },
      { class: 'Normal', confidence: 0.87, bbox: [280, 200, 60, 120] },
    ],
    processingTime: 45,
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695c952953?w=400&h=400&fit=crop',
    detections: [
      { class: 'Rut', confidence: 0.91, bbox: [100, 180, 100, 90] },
    ],
    processingTime: 38,
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695c952954?w=400&h=400&fit=crop',
    detections: [
      { class: 'Crack', confidence: 0.88, bbox: [150, 100, 120, 80] },
      { class: 'Normal', confidence: 0.83, bbox: [320, 250, 50, 70] },
    ],
    processingTime: 42,
  },
];
