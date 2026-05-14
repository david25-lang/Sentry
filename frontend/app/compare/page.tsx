"use client";

import * as React from "react";
import { Link as LinkIcon, Upload, AlertTriangle } from "lucide-react";
import { UploadBox } from "@/components/upload-box";
import { ResultCard } from "@/components/result-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { SeverityGauge } from "@/components/severity-gauge";
import { ComparisonTable } from "@/components/comparison-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSentryStore } from "@/lib/store";
import { formatProcessingTime, getConfidenceColor } from "@/lib/api";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

export default function ComparePage() {
  const {
    isLoading,
    error,
    lastComparisonResult,
    currentImageUrl,
    compareModels,
    compareModelsFromFile,
    clearResults,
  } = useSentryStore();

  const [urlInput, setUrlInput] = React.useState("");

  const yoloResult = lastComparisonResult?.yolo_result;
  const cnnResult = lastComparisonResult?.cnn_result;

  const yoloDetections = yoloResult?.detections ?? [];
  const cnnDetection = cnnResult?.detections[0];
  const cnnConfidence = cnnDetection?.confidence ?? 0;
  const cnnConfidencePct = Math.round(cnnConfidence * 100);

  const handleUrlSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!urlInput.trim()) return;
    await compareModels(urlInput.trim());
  };

  const accuracyData = [
    { model: "YOLOv8", accuracy: 72.4 },
    { model: "CNN", accuracy: 75.1 },
  ];

  const speedData = [
    { model: "YOLOv8", ms: yoloResult?.processing_time_ms ?? 28 },
    { model: "CNN", ms: cnnResult?.processing_time_ms ?? 5 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs text-orange-200">YOLO vs CNN</p>
          <h1 className="text-3xl font-semibold text-white">Model Comparison</h1>
          <p className="text-sm text-zinc-400">
            Upload one image to compare detection localization and classification insights.
          </p>
        </div>
        <Button
          variant="outline"
          className="border-white/10 bg-white/5 text-white"
          onClick={clearResults}
          disabled={!lastComparisonResult}
        >
          Reset Comparison
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

      <ResultCard title="Upload Comparison Image" subtitle="Send one image to both models.">
        <div className="space-y-4">
          <UploadBox
            title="Drop an image to compare"
            description="PNG, JPG, or WebP up to 10MB"
            disabled={isLoading}
            onFileSelect={compareModelsFromFile}
          />
          <form onSubmit={handleUrlSubmit} className="space-y-2">
            <Label htmlFor="compare-url" className="text-xs text-zinc-400">
              Compare by URL
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  id="compare-url"
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
          {isLoading ? <LoadingSpinner label="Running both models..." /> : null}
        </div>
      </ResultCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <ResultCard title="YOLOv8 Detection" subtitle="Bounding boxes and localization.">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
              {yoloResult?.image_url || currentImageUrl ? (
                <img src={yoloResult?.image_url || currentImageUrl || ""} alt="YOLO" className="h-48 w-full object-cover" />
              ) : (
                <div className="flex h-48 items-center justify-center text-xs text-zinc-500">No output yet</div>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                <p className="text-xs text-zinc-500">Detections</p>
                <p className="text-sm text-white">{yoloResult?.total_detections ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                <p className="text-xs text-zinc-500">Processing</p>
                <p className="text-sm text-white">
                  {yoloResult ? formatProcessingTime(yoloResult.processing_time_ms) : "-"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                <p className="text-xs text-zinc-500">Primary</p>
                <p className="text-sm text-white capitalize">{yoloResult?.primary_class || "-"}</p>
              </div>
            </div>
            <Separator className="bg-white/10" />
            {yoloDetections.length ? (
              <ScrollArea className="h-44 pr-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {yoloDetections.map((det, index) => (
                      <TableRow key={`${det.class_name}-${index}`}>
                        <TableCell className="capitalize">{det.class_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={det.confidence * 100} className="h-2 w-20" />
                            <span className={`text-xs ${getConfidenceColor(det.confidence)}`}>
                              {(det.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <p className="text-xs text-zinc-500">No detections yet.</p>
            )}
          </div>
        </ResultCard>

        <ResultCard title="CNN Classification" subtitle="Condition severity and risk score.">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
              {currentImageUrl ? (
                <img src={currentImageUrl} alt="CNN" className="h-48 w-full object-cover" />
              ) : (
                <div className="flex h-48 items-center justify-center text-xs text-zinc-500">No output yet</div>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-zinc-500">Predicted class</p>
                <p className="text-xl text-white capitalize">{cnnDetection?.class_name || "-"}</p>
              </div>
              <Badge className="border border-orange-500/30 bg-orange-500/10 text-orange-200">
                {cnnResult?.model_used || "cnn"}
              </Badge>
            </div>
            <Separator className="bg-white/10" />
            <div className="grid gap-4 sm:grid-cols-2">
              <SeverityGauge value={cnnConfidencePct} label="Risk score" tone={cnnConfidencePct >= 85 ? "high" : "medium"} />
              <div className="space-y-3">
                <p className="text-sm text-white">Confidence</p>
                <div className="flex items-center gap-2">
                  <Progress value={cnnConfidencePct} className="h-3" />
                  <span className={`text-xs ${getConfidenceColor(cnnConfidence)}`}>{cnnConfidencePct}%</span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-zinc-400">
                  Processing time: {cnnResult ? formatProcessingTime(cnnResult.processing_time_ms) : "-"}
                </div>
              </div>
            </div>
          </div>
        </ResultCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <ResultCard title="Comparison Table" subtitle="Where each model excels.">
          <ComparisonTable />
        </ResultCard>

        <ResultCard title="Model Performance" subtitle="Accuracy and inference timing.">
          <div className="space-y-4">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="model" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(6,10,20,0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                    }}
                    formatter={(value) => `${value}%`}
                  />
                  <Bar dataKey="accuracy" fill="#f97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={speedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="model" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(6,10,20,0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                    }}
                    formatter={(value) => `${value} ms`}
                  />
                  <Line type="monotone" dataKey="ms" stroke="#22d3ee" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ResultCard>
      </div>
    </div>
  );
}
