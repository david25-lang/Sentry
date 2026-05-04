/**
 * ML Dashboard Usage Examples
 */

'use client';

import { useEffect, useState } from 'react';
import { MLDashboard } from '@/components/ml-dashboard';
import { MetricsCard } from '@/components/ml-dashboard/metrics-card';
import { ChartSection } from '@/components/ml-dashboard/chart-section';
import { DatasetOverview } from '@/components/ml-dashboard/dataset-overview';
import { PredictionGrid } from '@/components/ml-dashboard/prediction-grid';
import { UploadPanel } from '@/components/ml-dashboard/upload-panel';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  dummyMetrics,
  dummyTrainingData,
  dummyDataset,
  dummyPredictions,
  ModelMetrics,
  TrainingData,
  DatasetInfo,
  UploadResponse,
} from '@/lib/ml-types';
import { create } from 'zustand';

// Example 1: Full Dashboard
export function FullDashboardExample() {
  return <MLDashboard />;
}

// Example 2: Custom Layout
export function CustomLayoutExample() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-4xl font-bold">Custom ML Dashboard</h1>
      <MetricsCard metrics={dummyMetrics} />
      <ChartSection trainingData={dummyTrainingData} />
      <DatasetOverview dataset={dummyDataset} />
    </div>
  );
}

// Example 3: Minimal Dashboard
export function MinimalDashboard() {
  return (
    <div className="space-y-4">
      <MetricsCard metrics={dummyMetrics} />
      <PredictionGrid predictions={dummyPredictions} />
    </div>
  );
}

// Example 4: Tabbed Dashboard
export function TabbedDashboard() {
  const [activeTab, setActiveTab] = useState<'metrics' | 'training' | 'inference'>('metrics');

  return (
    <div className="space-y-6 p-6">
      <div className="flex gap-4 border-b border-white/10 pb-4">
        <Button
          variant={activeTab === 'metrics' ? 'default' : 'outline'}
          onClick={() => setActiveTab('metrics')}
        >
          Metrics
        </Button>
        <Button
          variant={activeTab === 'training' ? 'default' : 'outline'}
          onClick={() => setActiveTab('training')}
        >
          Training
        </Button>
        <Button
          variant={activeTab === 'inference' ? 'default' : 'outline'}
          onClick={() => setActiveTab('inference')}
        >
          Inference
        </Button>
      </div>

      {activeTab === 'metrics' && <MetricsCard metrics={dummyMetrics} />}
      {activeTab === 'training' && <ChartSection trainingData={dummyTrainingData} />}
      {activeTab === 'inference' && <UploadPanel />}
    </div>
  );
}

