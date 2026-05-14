"use client";

import * as React from "react";
import { Brain, Link as LinkIcon, Upload, AlertTriangle } from "lucide-react";
import { UploadBox } from "@/components/upload-box";
import { ResultCard } from "@/components/result-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { SeverityGauge } from "@/components/severity-gauge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useSentryStore } from "@/lib/store";
import { formatProcessingTime, getConfidenceColor } from "@/lib/api";

const recommendationBySeverity: Record<string, string> = {
  low: "Monitor regularly. No urgent action required.",
  moderate: "Schedule maintenance within the next inspection cycle.",
  high: "Prioritize repair in the next maintenance window.",
  severe: "Immediate repair recommended to prevent incidents.",
};

export default function ClassifyPage() {
  const {
    isLoading,
    error,
    lastClassificationResult,
    currentImageUrl,
    classifyFromFile,
    classifyFromURL,
    clearResults,
  } = useSentryStore();

  const [urlInput, setUrlInput] = React.useState("");

  const result = lastClassificationResult;
  const primaryDetection = result?.detections[0];
  const confidence = primaryDetection?.confidence ?? 0;
  const confidencePct = Math.round(confidence * 100);

  const rawSeverity = (result as { severity?: string } | null)?.severity;
  const derivedSeverity = confidencePct >= 85 ? "high" : confidencePct >= 65 ? "moderate" : "low";
  const severity = (rawSeverity || derivedSeverity).toLowerCase();

  const gaugeTone = severity === "severe" ? "critical" : severity === "high" ? "high" : severity === "moderate" ? "medium" : "low";
  const recommendation = recommendationBySeverity[severity] || recommendationBySeverity.low;

  const handleUrlSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!urlInput.trim()) return;
    await classifyFromURL(urlInput.trim());
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs text-orange-200">CNN Classification</p>
          <h1 className="text-3xl font-semibold text-white">Road Condition Analysis</h1>
          <p className="text-sm text-zinc-400">
            Classify road damage severity and generate maintenance recommendations.
          </p>
        </div>
        <Button
          variant="outline"
          className="border-white/10 bg-white/5 text-white"
          onClick={clearResults}
          disabled={!result}
        >
          Reset Analysis
        </Button>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
        <div className="space-y-6">
          <ResultCard title="Upload Image" subtitle="Analyze road condition using CNN classification.">
            <div className="space-y-4">
              <UploadBox
                title="Drop an image to classify"
                description="PNG, JPG, or WebP up to 10MB"
                disabled={isLoading}
                onFileSelect={classifyFromFile}
              />
              <form onSubmit={handleUrlSubmit} className="space-y-2">
                <Label htmlFor="classify-url" className="text-xs text-zinc-400">
                  Analyze by URL
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      id="classify-url"
                      value={urlInput}
                      onChange={(event) => setUrlInput(event.target.value)}
                      placeholder="https://example.com/road.jpg"
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" className="bg-white/10 text-white hover:bg-white/20" disabled={isLoading}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </form>
              {isLoading ? <LoadingSpinner label="Classifying image..." /> : null}
            </div>
          </ResultCard>

          <ResultCard title="Model Overview" subtitle="ResNet-based CNN for severity estimation.">
            <div className="grid gap-4 text-xs text-zinc-400 sm:grid-cols-2">
              <div>
                <p className="text-zinc-500">Architecture</p>
                <p className="text-sm text-white">ResNet18</p>
              </div>
              <div>
                <p className="text-zinc-500">Input Size</p>
                <p className="text-sm text-white">224 x 224</p>
              </div>
              <div>
                <p className="text-zinc-500">Avg Inference</p>
                <p className="text-sm text-white">5 ms</p>
              </div>
              <div>
                <p className="text-zinc-500">Validation</p>
                <p className="text-sm text-white">78.3% accuracy</p>
              </div>
            </div>
          </ResultCard>
        </div>

        <div className="space-y-6">
          <ResultCard title="Classification Result" subtitle="CNN predicted condition and risk profile.">
            {result ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-zinc-400">Predicted class</p>
                    <p className="text-2xl font-semibold text-white capitalize">
                      {primaryDetection?.class_name || "unknown"}
                    </p>
                    <p className="text-xs text-zinc-500">Model: {result.model_used}</p>
                  </div>
                  <Badge className="border border-orange-500/30 bg-orange-500/10 text-orange-200">
                    {severity}
                  </Badge>
                </div>

                <Separator className="bg-white/10" />

                <div className="grid gap-6 sm:grid-cols-2">
                  <SeverityGauge value={confidencePct} label="Risk level" tone={gaugeTone} />
                  <div className="space-y-3">
                    <p className="text-sm text-white">Confidence Score</p>
                    <div className="flex items-center gap-2">
                      <Progress value={confidencePct} className="h-3" />
                      <span className={`text-xs ${getConfidenceColor(confidence)}`}>{confidencePct}%</span>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-zinc-400">
                      Recommendation: <span className="text-zinc-200">{recommendation}</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                    <p className="text-xs text-zinc-500">Processing</p>
                    <p className="text-sm text-white">{formatProcessingTime(result.processing_time_ms)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                    <p className="text-xs text-zinc-500">Image Size</p>
                    <p className="text-sm text-white">
                      {result.image_size.width} x {result.image_size.height}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                    <p className="text-xs text-zinc-500">Timestamp</p>
                    <p className="text-xs text-white">{new Date(result.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500">Upload an image to begin classification.</p>
            )}
          </ResultCard>

          <ResultCard title="Image Preview" subtitle="Input image used for CNN inference.">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
              {currentImageUrl ? (
                <img src={currentImageUrl} alt="Input" className="h-56 w-full object-cover" />
              ) : (
                <div className="flex h-56 items-center justify-center text-xs text-zinc-500">
                  No image uploaded
                </div>
              )}
            </div>
          </ResultCard>
        </div>
      </div>
    </div>
  );
}
