'use client';

import { useState } from 'react';
import { MetricsCard } from './metrics-card';
import { ChartSection } from './chart-section';
import { DatasetOverview } from './dataset-overview';
import { PredictionGrid } from './prediction-grid';
import { UploadPanel } from './upload-panel';
import {
  dummyMetrics,
  dummyTrainingData,
  dummyDataset,
  dummyPredictions,
  UploadResponse,
} from '@/lib/ml-types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export function MLDashboard() {
  const [metrics] = useState(dummyMetrics);
  const [trainingData] = useState(dummyTrainingData);
  const [dataset] = useState(dummyDataset);
  const [predictions] = useState(dummyPredictions);

  // Check model performance on initialization
  const performanceAlert = dummyMetrics.loss > 0.1
    ? 'Training loss is higher than optimal. Consider adjusting learning rate.'
    : null;

  // Mock API handler for image upload
  const handleImageUpload = async (file: File): Promise<UploadResponse> => {
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        resolve({
          success: true,
          predictions: [
            { class: 'Pothole', confidence: 0.92, bbox: [50, 60, 80, 100] },
            { class: 'Normal', confidence: 0.85, bbox: [200, 100, 100, 60] },
          ],
          imageUrl: URL.createObjectURL(file),
          processingTime: Math.random() * 50 + 30,
        });
      }, 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-black to-black/95 text-zinc-100">
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-2">
                ML Model Dashboard
              </h1>
              <p className="text-sm sm:text-base text-zinc-400">
                Monitor training progress and run real-time inference on your YOLO detector and CNN classifier
              </p>
            </div>
            <Badge variant="secondary" className="w-fit bg-emerald-500/20 text-emerald-300 border-emerald-500/30 h-fit">
              ✓ Production Ready
            </Badge>
          </div>
        </div>

        {/* Performance Alert */}
        {performanceAlert && (
          <Card className="mb-6 border-yellow-500/30 bg-yellow-500/10 text-yellow-200 animate-fade-in">
            <div className="flex items-start gap-3 p-4">
              <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">⚠️ Performance Alert</p>
                <p className="text-sm mt-1">{performanceAlert}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Metrics */}
          <MetricsCard metrics={metrics} />

          {/* Training Charts */}
          <ChartSection trainingData={trainingData} />

          {/* Dataset Overview */}
          <DatasetOverview dataset={dataset} />

          {/* Predictions Grid */}
          <PredictionGrid predictions={predictions} />

          {/* Upload & Inference */}
          <UploadPanel onUpload={handleImageUpload} />

          {/* Footer Info */}
          <Card className="border-white/10 bg-black/40 text-zinc-100 animate-fade-in [animation-delay:800ms]">
            <div className="p-6 space-y-3">
              <h3 className="font-semibold text-white text-lg">API Integration Guide</h3>
              <div className="space-y-2 text-sm text-zinc-400">
                <p>
                  <span className="font-mono bg-white/10 px-2 py-1 rounded text-xs">GET /api/metrics</span> - Fetch current model metrics
                </p>
                <p>
                  <span className="font-mono bg-white/10 px-2 py-1 rounded text-xs">GET /api/training</span> - Get training history
                </p>
                <p>
                  <span className="font-mono bg-white/10 px-2 py-1 rounded text-xs">GET /api/dataset</span> - Dataset statistics
                </p>
                <p>
                  <span className="font-mono bg-white/10 px-2 py-1 rounded text-xs">POST /api/predict</span> - Run inference on image
                </p>
              </div>
              <p className="text-xs text-zinc-500 pt-2 border-t border-white/10">
                Replace dummy data with API calls to integrate your backend (Flask/FastAPI)
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
