"use client";

import * as React from "react";
import {
  Camera,
  Link as LinkIcon,
  Upload,
  Download,
  RotateCcw,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { UploadBox } from "@/components/upload-box";
import { DetectionCard } from "@/components/detection-card";
import { ResultCard } from "@/components/result-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useSentryStore } from "@/lib/store";
import { formatProcessingTime, getConfidenceColor } from "@/lib/api";

export default function DetectPage() {
  const {
    isLoading,
    error,
    settings,
    updateSettings,
    lastDetectionResult,
    currentImageUrl,
    detectFromFile,
    detectFromURL,
    clearResults,
    detectionHistory,
  } = useSentryStore();

  const [urlInput, setUrlInput] = React.useState("");
  const [cameraActive, setCameraActive] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  const detections = lastDetectionResult?.detections ?? [];
  const potholeCount = detections.filter((d) => d.class_name === "pothole").length;
  const crackCount = detections.filter((d) => d.class_name === "crack").length;

  const processedImageUrl = lastDetectionResult?.image_url || currentImageUrl;

  const handleUrlSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!urlInput.trim()) return;
    await detectFromURL(urlInput.trim());
  };

  const handleCameraToggle = async (enabled: boolean) => {
    setCameraActive(enabled);
    if (!enabled) {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access failed", err);
      setCameraActive(false);
    }
  };

  const captureAndDetect = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((value) => resolve(value), "image/jpeg", 0.9)
    );
    if (!blob) return;
    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
    await detectFromFile(file);
  };

  const downloadAnnotatedImage = () => {
    if (!lastDetectionResult || !currentImageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentImageUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      const colorMap: Record<string, string> = {
        pothole: "#ef4444",
        crack: "#f59e0b",
        normal: "#22c55e",
      };

      lastDetectionResult.detections.forEach((detection, index) => {
        if (!detection.bounding_box) return;
        const box = detection.bounding_box;
        const color = colorMap[detection.class_name] || "#94a3b8";
        ctx.lineWidth = Math.max(2, Math.round(Math.min(canvas.width, canvas.height) * 0.002));
        ctx.strokeStyle = color;
        ctx.fillStyle = `${color}55`;
        ctx.fillRect(box.x1, box.y1, box.width, box.height);
        ctx.strokeRect(box.x1, box.y1, box.width, box.height);

        const label = `${index + 1} ${detection.class_name} ${(detection.confidence * 100).toFixed(0)}%`;
        ctx.font = `${Math.max(12, Math.round(canvas.width * 0.02))}px sans-serif`;
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = color;
        ctx.fillRect(box.x1, Math.max(0, box.y1 - 24), textWidth + 10, 22);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, box.x1 + 5, Math.max(14, box.y1 - 8));
      });

      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `sentry_detection_${Date.now()}.png`;
      link.click();
    };
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs text-orange-200">YOLOv8 Object Detection</p>
          <h1 className="text-3xl font-semibold text-white">Road Damage Detection</h1>
          <p className="text-sm text-zinc-400">
            Detect potholes and cracks with bounding boxes, confidence, and processing time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="border-white/10 bg-white/5 text-white"
            onClick={clearResults}
            disabled={!lastDetectionResult}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            className="bg-orange-500 text-black hover:bg-orange-400"
            onClick={downloadAnnotatedImage}
            disabled={!lastDetectionResult}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Result
          </Button>
        </div>
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
          <ResultCard title="Upload Road Image" subtitle="Drag, drop, or capture live camera frames.">
            <div className="space-y-4">
              <UploadBox
                title="Drop an image to analyze"
                description="PNG, JPG, or WebP up to 10MB"
                disabled={isLoading}
                onFileSelect={detectFromFile}
              />
              <form onSubmit={handleUrlSubmit} className="space-y-2">
                <Label htmlFor="detect-url" className="text-xs text-zinc-400">
                  Analyze by URL
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input
                      id="detect-url"
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
              <Separator className="bg-white/10" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Live Camera Mode</p>
                    <p className="text-xs text-zinc-500">Capture live frames for detection.</p>
                  </div>
                  <Switch
                    checked={cameraActive}
                    onCheckedChange={handleCameraToggle}
                  />
                </div>
                {cameraActive ? (
                  <div className="space-y-3">
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                      <video ref={videoRef} className="w-full" playsInline muted />
                    </div>
                    <Button
                      type="button"
                      onClick={captureAndDetect}
                      className="w-full bg-orange-500 text-black hover:bg-orange-400"
                      disabled={isLoading}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Capture & Detect
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </ResultCard>

          <ResultCard title="Detection Controls" subtitle="Tune detection settings and legend.">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Pothole-only mode</p>
                  <p className="text-xs text-zinc-500">Focus on pothole detections only.</p>
                </div>
                <Switch
                  checked={settings.potholeOnly}
                  onCheckedChange={(value) => updateSettings({ potholeOnly: value })}
                />
              </div>
              <Separator className="bg-white/10" />
              <div className="flex flex-wrap gap-3 text-xs text-zinc-400">
                <Badge className="border border-red-500/30 bg-red-500/10 text-red-200">Pothole</Badge>
                <Badge className="border border-amber-400/30 bg-amber-400/10 text-amber-200">Crack</Badge>
              </div>
              {lastDetectionResult?.applied_confidence_threshold != null ? (
                <p className="text-xs text-zinc-500">
                  Auto confidence threshold: {(lastDetectionResult.applied_confidence_threshold * 100).toFixed(0)}%
                </p>
              ) : null}
            </div>
          </ResultCard>
        </div>

        <div className="space-y-6">
          <ResultCard title="Detection Output" subtitle="Original and processed images.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs text-zinc-400">Input</p>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
                  {currentImageUrl ? (
                    <img src={currentImageUrl} alt="Input" className="h-44 w-full object-cover" />
                  ) : (
                    <div className="flex h-44 items-center justify-center text-xs text-zinc-500">
                      No image uploaded
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-zinc-400">Processed</p>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
                  {processedImageUrl ? (
                    <img src={processedImageUrl} alt="Processed" className="h-44 w-full object-cover" />
                  ) : (
                    <div className="flex h-44 items-center justify-center text-xs text-zinc-500">
                      Awaiting detection
                    </div>
                  )}
                </div>
              </div>
            </div>
            {isLoading ? <LoadingSpinner label="Running inference..." className="mt-4" /> : null}
          </ResultCard>

          <div className="grid gap-4 sm:grid-cols-2">
            <DetectionCard label="Potholes" value={potholeCount} tone="red" icon={Activity} />
            <DetectionCard label="Cracks" value={crackCount} tone="orange" icon={Activity} />
            <DetectionCard
              label="Processing Time"
              value={lastDetectionResult ? formatProcessingTime(lastDetectionResult.processing_time_ms) : "-"}
              tone="cyan"
            />
            <DetectionCard
              label="Total Detections"
              value={lastDetectionResult ? lastDetectionResult.total_detections : "-"}
              tone="emerald"
            />
          </div>

          <ResultCard title="Detection Results" subtitle="Confidence scores and bounding metadata.">
            {detections.length ? (
              <ScrollArea className="h-64 pr-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detections.map((detection, index) => (
                      <TableRow key={`${detection.class_name}-${index}`}>
                        <TableCell className="capitalize text-zinc-200">
                          {detection.class_name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={detection.confidence * 100} className="h-2 w-20" />
                            <span className={`text-xs ${getConfidenceColor(detection.confidence)}`}>
                              {(detection.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-zinc-500">
                          {detection.bounding_box
                            ? `${Math.round(detection.bounding_box.x1)}, ${Math.round(detection.bounding_box.y1)}`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            ) : (
              <p className="text-xs text-zinc-500">No detections available yet.</p>
            )}
          </ResultCard>

          <ResultCard title="Detection History" subtitle="Recent inference sessions.">
            <div className="space-y-3">
              {detectionHistory.length ? (
                detectionHistory.slice(0, 5).map((item, index) => (
                  <div key={`${item.timestamp}-${index}`} className="flex items-center justify-between text-xs">
                    <div>
                      <p className="text-zinc-200 capitalize">{item.primary_class || "unknown"}</p>
                      <p className="text-zinc-500">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                    <Badge className="border border-white/10 bg-white/5 text-zinc-200">
                      {item.total_detections} detections
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500">No detections recorded yet.</p>
              )}
            </div>
          </ResultCard>
        </div>
      </div>
    </div>
  );
}
