# ML Model Dashboard Components

A production-ready, modular React dashboard system for YOLO and CNN road-damage projects with full TypeScript support, dark mode theme, and responsive design.

## 📁 Component Architecture

```
components/ml-dashboard/
├── index.tsx                 # Main dashboard orchestrator
├── metrics-card.tsx          # Key metrics display (mAP, Precision, Recall, Loss)
├── chart-section.tsx         # Training visualization charts
├── dataset-overview.tsx      # Dataset statistics and class distribution
├── prediction-grid.tsx       # Sample predictions with bounding boxes
└── upload-panel.tsx          # Image upload and inference interface

lib/
└── ml-types.ts              # TypeScript types and dummy data
```

## 🚀 Quick Start

### Import the Dashboard

```typescript
import { MLDashboard } from '@/components/ml-dashboard';

export default function Page() {
  return <MLDashboard />;
}
```

### Use Individual Components

```typescript
import { MetricsCard } from '@/components/ml-dashboard/metrics-card';
import { ChartSection } from '@/components/ml-dashboard/chart-section';
import { dummyMetrics, dummyTrainingData } from '@/lib/ml-types';

export function MyDashboard() {
  return (
    <>
      <MetricsCard metrics={dummyMetrics} />
      <ChartSection trainingData={dummyTrainingData} />
    </>
  );
}
```

## 📊 Component Details

### MetricsCard
Displays current model performance metrics with status indicators.

**Props:**
- `metrics: ModelMetrics` - Contains mAP, precision, recall, loss, training status, etc.

**Features:**
- Real-time metrics display
- Training status badges (completed, training, paused, failed)
- Performance indicators
- Last trained timestamp

### ChartSection
Visualizes training progress with interactive Recharts.

**Props:**
- `trainingData: TrainingData` - Historical loss, mAP, precision, and recall data

**Visualizations:**
- Loss vs Epoch (line chart)
- mAP vs Epoch (line chart)
- Precision vs Recall (dual line chart)

### DatasetOverview
Shows dataset statistics and class distribution.

**Props:**
- `dataset: DatasetInfo` - Total images, classes, distribution, train/test split

**Features:**
- Dataset summary (total images, number of classes)
- Class distribution bar chart
- Train/validation/test split visualization

### PredictionGrid
Displays sample inference results with bounding box overlays.

**Props:**
- `predictions: PredictionSample[]` - Array of prediction results with detected objects

**Features:**
- Image preview with bounding box visualization
- Confidence score display
- Processing time indicator
- Multiple detection display per image

### UploadPanel
Image upload interface with inference capability.

**Props:**
- `onUpload?: (file: File) => Promise<UploadResponse>` - Custom handler for image processing

**Features:**
- Drag-and-drop ready upload area
- Local image preview
- Detection result display
- Processing time tracking
- Error handling and loading states

## 🔌 Backend Integration

### TypeScript Interfaces

```typescript
interface ModelMetrics {
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

interface TrainingData {
  lossHistory: MetricValue[];
  mAPHistory: MetricValue[];
  precisionHistory: MetricValue[];
  recallHistory: MetricValue[];
}

interface DatasetInfo {
  totalImages: number;
  numClasses: number;
  classDistribution: { name: string; count: number }[];
  trainTestSplit: { train: number; test: number; val: number };
}

interface PredictionSample {
  id: string;
  imageUrl: string;
  detections: DetectionResult[];
  processingTime: number;
}

interface UploadResponse {
  success: boolean;
  predictions: DetectionResult[];
  imageUrl: string;
  processingTime: number;
  error?: string;
}
```

### FastAPI Backend Example

```python
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Detection(BaseModel):
    class: str
    confidence: float
    bbox: tuple[float, float, float, float]

@app.get("/api/metrics")
async def get_metrics():
    return {
        "mAP": 0.856,
        "precision": 0.891,
        "recall": 0.823,
        "loss": 0.0342,
        "modelName": "YOLOv8-Custom",
        "trainingStatus": "completed",
        "lastTrained": "2024-04-28T10:30:00",
        "totalEpochs": 100,
        "currentEpoch": 100
    }

@app.get("/api/training")
async def get_training_data():
    # Return historical training data
    return {
        "lossHistory": [...],
        "mAPHistory": [...],
        "precisionHistory": [...],
        "recallHistory": [...]
    }

@app.get("/api/dataset")
async def get_dataset_info():
    return {
        "totalImages": 2347,
        "numClasses": 3,
        "classDistribution": [
          {"name": "Pothole", "count": 645},
          {"name": "Crack", "count": 523},
          {"name": "Normal", "count": 1179}
        ],
        "trainTestSplit": {"train": 70, "test": 15, "val": 15}
    }

@app.post("/api/predict")
async def predict(file: UploadFile):
    # Process image and return predictions
    return {
        "success": True,
        "predictions": [
            {"class": "Pothole", "confidence": 0.92, "bbox": [50, 60, 80, 100]},
            {"class": "Normal", "confidence": 0.85, "bbox": [200, 100, 100, 60]},
        ],
        "imageUrl": "processed_image_url",
        "processingTime": 45
    }
```

### React Integration Example

```typescript
'use client';

import { useState, useEffect } from 'react';
import { MLDashboard } from '@/components/ml-dashboard';
import { MetricsCard } from '@/components/ml-dashboard/metrics-card';
import { ModelMetrics, TrainingData, DatasetInfo } from '@/lib/ml-types';

export function DashboardWithAPI() {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [trainingData, setTrainingData] = useState<TrainingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, trainingRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/metrics`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/training`),
        ]);

        if (!metricsRes.ok || !trainingRes.ok) throw new Error('API Error');

        const metricsData = await metricsRes.json();
        const trainingDataContent = await trainingRes.json();

        setMetrics(metricsData);
        setTrainingData(trainingDataContent);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!metrics || !trainingData) return <div>No data</div>;

  return <MetricsCard metrics={metrics} />;
}
```

## 🎨 Customization

### Styling
Components use Tailwind CSS with a dark theme. Customize by modifying:
- `bg-black/40` - Background opacity
- `border-white/10` - Border opacity
- `text-orange-500` - Primary accent color

### Color Palette
- **Primary**: Orange (`#f97316`)
- **Success**: Emerald (`#10b981`)
- **Info**: Blue (`#3b82f6`)
- **Warning**: Yellow (`#f59e0b`)
- **Error**: Red (`#ef4444`)

### Add Custom Metrics
Extend `ModelMetrics` interface in `ml-types.ts`:

```typescript
export interface ModelMetrics {
  mAP: number;
  precision: number;
  recall: number;
  loss: number;
  // Add your custom fields
  f1Score?: number;
  avgInferenceTime?: number;
  gpuUtilization?: number;
  // ...
}
```

## 📱 Responsive Design

All components are fully responsive:
- **Mobile** (xs-sm): Single column, stacked cards
- **Tablet** (md-lg): Two-column grid layouts
- **Desktop** (xl): Full multi-column displays

Breakpoints:
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px

## 🔄 Real-Time Updates

Implement auto-refresh with Zustand or React hooks:

```typescript
import { useEffect } from 'react';

export function AutoRefreshDashboard() {
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  useEffect(() => {
    const timer = setInterval(async () => {
      // Fetch latest data
      const response = await fetch('/api/metrics');
      // Update state
    }, refreshInterval);

    return () => clearInterval(timer);
  }, [refreshInterval]);

  return <MLDashboard />;
}
```

## 📝 Features

✅ Production-ready component structure
✅ TypeScript support with full type safety
✅ Dark theme with orange accent colors
✅ Responsive grid layouts
✅ Animated transitions and fade-ins
✅ Loading states and error handling
✅ Real-time data visualization with Recharts
✅ Image upload with bounding box overlay
✅ Class distribution visualization
✅ Training progress tracking
✅ Performance alerts and monitoring
✅ Mobile-optimized UI

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Next.js 16** - Framework
- **Tailwind CSS 4** - Styling
- **Recharts 2** - Data visualization
- **shadcn/ui** - UI components
- **Hugeicons** - Icon library

## 📦 Dependencies

All required dependencies are already installed in the project:
- `recharts` - Chart visualization
- `next` - Next.js framework
- `react` - React library
- `tailwindcss` - CSS framework

## 🎯 Use Cases

- YOLO model training monitoring dashboard
- Object detection performance tracking
- Dataset statistics and analysis
- Real-time inference testing
- Model comparison and evaluation
- Training progress visualization
- Performance alerting system

## 🔐 Security Considerations

- Validate file uploads on the backend
- Implement API authentication (JWT, OAuth)
- Add rate limiting for inference requests
- Sanitize image data before display
- Use HTTPS in production
- Implement CORS properly

## 📚 Related Docs

- [Recharts Documentation](https://recharts.org)
- [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)

---

**Ready for Production**: This dashboard is structured for immediate integration with your backend API while maintaining flexibility for customization.
