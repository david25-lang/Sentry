'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PredictionSample } from '@/lib/ml-types';
import Image from 'next/image';

interface PredictionGridProps {
  predictions: PredictionSample[];
}

export function PredictionGrid({ predictions }: PredictionGridProps) {
  return (
    <Card className="border-white/10 bg-black/40 text-zinc-100 animate-fade-in [animation-delay:600ms]">
      <CardHeader>
        <CardTitle className="text-white text-lg sm:text-xl">Model Predictions</CardTitle>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">Sample inference results with bounding boxes</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictions.map((pred) => (
            <div
              key={pred.id}
              className="group rounded-lg border border-white/10 bg-white/5 overflow-hidden hover:border-orange-500/30 transition-all duration-300 cursor-pointer"
            >
              {/* Image Container with Canvas Overlay */}
              <div className="relative aspect-square bg-black/50 overflow-hidden">
                <img
                  src={pred.imageUrl}
                  alt="Prediction"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Bounding Boxes Overlay */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox={`0 0 400 400`}
                  preserveAspectRatio="xMidYMid slice"
                >
                  {pred.detections.map((detection, idx) => {
                    const [x, y, w, h] = detection.bbox;
                    const colors = ['#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
                    const color = colors[idx % colors.length];

                    return (
                      <g key={idx}>
                        {/* Rectangle */}
                        <rect
                          x={x}
                          y={y}
                          width={w}
                          height={h}
                          fill="none"
                          stroke={color}
                          strokeWidth="2"
                        />
                        {/* Label Background */}
                        <rect
                          x={x}
                          y={y - 20}
                          width={w}
                          height={20}
                          fill={color}
                          opacity="0.8"
                        />
                        {/* Label Text */}
                        <text
                          x={x + 4}
                          y={y - 5}
                          fontSize="12"
                          fontWeight="bold"
                          fill="white"
                          fontFamily="monospace"
                        >
                          {detection.class} {Math.round(detection.confidence * 100)}%
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Processing Time Badge */}
                <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-zinc-300">
                  {pred.processingTime}ms
                </div>
              </div>

              {/* Detections List */}
              <div className="p-3 space-y-2">
                <p className="text-xs font-semibold text-zinc-300">Detections</p>
                <div className="space-y-1">
                  {pred.detections.map((detection, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">{detection.class}</span>
                      <Badge
                        variant="outline"
                        className="border-white/10 bg-white/5 text-xs font-mono"
                      >
                        {Math.round(detection.confidence * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {predictions.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/15 bg-white/5 p-8 text-center text-zinc-400">
            No predictions yet. Run inference to see results.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
