"use client";

import * as React from "react";
import { useState, useRef, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Camera01Icon,
  Upload01Icon,
  LinkIcon,
  ImageIcon,
  ZapIcon,
  Target01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Delete01Icon,
  Copy01Icon,
  Download01Icon,
  Maximize01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useSentryStore } from "@/lib/store";
import { formatProcessingTime, getDamageClassIcon, getConfidenceColor } from "@/lib/api";
import { Switch } from "@/components/ui/switch";

export function Detection() {
  const {
    isLoading,
    error,
    settings,
    updateSettings,
    lastDetectionResult,
    currentImageUrl,
    detectFromURL,
    detectFromFile,
    clearResults,
  } = useSentryStore();

  const [urlInput, setUrlInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [inputMode, setInputMode] = useState<"url" | "upload" | "camera">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      await detectFromURL(urlInput.trim());
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const captureAndDetect = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9));
    if (!blob) return;
    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
    await detectFromFile(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await detectFromFile(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await detectFromFile(e.dataTransfer.files[0]);
    }
  }, [detectFromFile]);

  React.useEffect(() => {
    if (inputMode === 'camera') {
      // auto-start camera when user opens camera tab
      startCamera();
    } else {
      // stop camera when leaving camera tab
      stopCamera();
    }
    // cleanup on unmount
    return () => stopCamera();
  }, [inputMode]);

  const copyResults = () => {
    if (lastDetectionResult) {
      navigator.clipboard.writeText(JSON.stringify(lastDetectionResult, null, 2));
    }
  };

  const downloadAnnotatedImage = () => {
    if (!lastDetectionResult || !currentImageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      // color map
      const colorMap: Record<string, string> = {
        pothole: '#ef4444',
        crack: '#f97316',
        normal: '#22c55e',
      };

      lastDetectionResult.detections.forEach((d, i) => {
        if (!d.bounding_box) return;
        const x = d.bounding_box.x1;
        const y = d.bounding_box.y1;
        const w = d.bounding_box.width;
        const h = d.bounding_box.height;
        const color = colorMap[d.class_name] || '#6b7280';

        ctx.lineWidth = Math.max(2, Math.round(Math.min(canvas.width, canvas.height) * 0.002));
        ctx.strokeStyle = color;
        ctx.fillStyle = color + '88';
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);

        const label = `${i + 1} ${d.class_name} ${(d.confidence * 100).toFixed(0)}%`;
        ctx.font = `${Math.max(12, Math.round(canvas.width * 0.02))}px sans-serif`;
        const textW = ctx.measureText(label).width;
        ctx.fillStyle = color;
        ctx.fillRect(x, Math.max(0, y - 22), textW + 8, 20);
        ctx.fillStyle = '#fff';
        ctx.fillText(label, x + 4, Math.max(12, y - 8));
      });

      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `detection_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    };
    img.onerror = (e) => console.error('Failed to load image for annotation', e);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <HugeiconsIcon icon={Camera01Icon} strokeWidth={2} className="w-5 h-5 text-blue-500" />
            </div>
            YOLO Detection
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time pothole and crack detection with bounding boxes
          </p>
        </div>
        <div className="flex gap-2">
          {lastDetectionResult && (
            <Button variant="outline" onClick={clearResults} className="gap-2">
              <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} className="w-4 h-4" />
              New Detection
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Input Card */}
          <Card>
            <CardHeader>
              <CardTitle>Image Input</CardTitle>
              <CardDescription>Upload an image or enter a URL to analyze</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "url" | "upload" | "camera")}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upload" className="gap-2">
                    <HugeiconsIcon icon={Upload01Icon} strokeWidth={2} className="w-4 h-4" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="url" className="gap-2">
                    <HugeiconsIcon icon={LinkIcon} strokeWidth={2} className="w-4 h-4" />
                    URL
                  </TabsTrigger>
                  <TabsTrigger value="camera" className="gap-2">
                    <HugeiconsIcon icon={Camera01Icon} strokeWidth={2} className="w-4 h-4" />
                    Camera
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-4">
                  <div
                    className={`
                      border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                      ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
                      ${isLoading ? "opacity-50 pointer-events-none" : ""}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                      <HugeiconsIcon 
                        icon={ImageIcon} 
                        strokeWidth={2} 
                        className="w-8 h-8 text-muted-foreground" 
                      />
                    </div>
                    <p className="text-lg font-medium mb-1">
                      {dragActive ? "Drop image here" : "Drag & drop an image"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse • JPEG, PNG, WebP supported
                    </p>
                    <Button variant="outline" disabled={isLoading}>
                      <HugeiconsIcon icon={Upload01Icon} strokeWidth={2} className="w-4 h-4 mr-2" />
                      Select File
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="url" className="mt-4">
                  <form onSubmit={handleUrlSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="image-url">Image URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="image-url"
                          type="url"
                          placeholder="https://example.com/road-image.jpg"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          disabled={isLoading}
                          className="flex-1"
                        />
                        <Button type="submit" disabled={isLoading || !urlInput.trim()}>
                          {isLoading ? (
                            <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} className="w-4 h-4 animate-spin" />
                          ) : (
                            <HugeiconsIcon icon={ZapIcon} strokeWidth={2} className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="camera" className="mt-4">
                  <div className="space-y-4">
                    <div className="relative border rounded overflow-hidden bg-black">
                      <video ref={videoRef} className="w-full h-auto" playsInline muted />
                      {!cameraActive && (
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <Button onClick={startCamera}>
                            <HugeiconsIcon icon={Camera01Icon} strokeWidth={2} className="w-4 h-4 mr-2" />
                            Start Camera
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={captureAndDetect} disabled={!cameraActive || isLoading}>
                        Capture & Detect
                      </Button>
                      <Button variant="outline" onClick={stopCamera} disabled={!cameraActive}>
                        Stop Camera
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Use your device camera to capture a road image. The model will detect potholes and cracks.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Detection Settings</CardTitle>
              <CardDescription>Adjust detection parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Label>Confidence Threshold</Label>
                    <Badge variant="secondary">
                      {lastDetectionResult?.applied_confidence_threshold != null
                        ? `${(lastDetectionResult.applied_confidence_threshold * 100).toFixed(0)}% auto`
                        : "Auto"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    The system chooses this automatically per image using YOLO confidence distribution.
                    Each box still shows its own confidence score.
                  </p>
                </div>
              <div className="flex items-center justify-between mt-4">
                <Label className="mb-0">Pothole only</Label>
                <Switch
                  id="pothole-only"
                  checked={settings.potholeOnly}
                  onCheckedChange={(val) => updateSettings({ potholeOnly: !!val })}
                />
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-red-500" />
                  <span className="text-xs">Pothole</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-orange-500" />
                  <span className="text-xs">Crack</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-green-500" />
                    <span className="text-xs">Normal</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">💡 Quick Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Use high-resolution images for better accuracy</li>
                <li>• Ensure road surface is clearly visible</li>
                <li>• Good lighting improves detection quality</li>
                <li>• Multiple damages in one image are supported</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Image Preview Card */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Detection Preview</span>
                {currentImageUrl && (
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <HugeiconsIcon icon={Maximize01Icon} strokeWidth={2} className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Full Image</DialogTitle>
                        </DialogHeader>
                        <div className="relative">
                          <img 
                            src={currentImageUrl} 
                            alt="Detection preview" 
                            className="w-full rounded-lg"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={clearResults}>
                            <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Clear</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={downloadAnnotatedImage}>
                            <HugeiconsIcon icon={Download01Icon} strokeWidth={2} className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download Annotated</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="w-full aspect-video rounded-lg" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ) : currentImageUrl ? (
                <div className="relative">
                  <img 
                    src={currentImageUrl} 
                    alt="Road image" 
                    className="w-full rounded-lg"
                  />
                  {/* Bounding boxes overlay */}
                  {lastDetectionResult?.detections.map((detection, idx) => {
                    if (!detection.bounding_box) return null;
                    const colorHex: Record<string, string> = {
                      pothole: '#ef4444',
                      crack: '#f97316',
                      normal: '#22c55e',
                    };
                    const borderColor = colorHex[detection.class_name] || '#6b7280';
                    return (
                      <div
                        key={idx}
                        className="absolute"
                        style={{
                          left: `${(detection.bounding_box.x1 / lastDetectionResult.image_size.width) * 100}%`,
                          top: `${(detection.bounding_box.y1 / lastDetectionResult.image_size.height) * 100}%`,
                          width: `${(detection.bounding_box.width / lastDetectionResult.image_size.width) * 100}%`,
                          height: `${(detection.bounding_box.height / lastDetectionResult.image_size.height) * 100}%`,
                          border: `2px solid ${borderColor}`,
                          backgroundColor: `${borderColor}20`,
                        }}
                      >
                        <span
                          className="absolute -top-6 left-0 text-xs text-white px-1.5 py-0.5 rounded whitespace-nowrap"
                          style={{ backgroundColor: borderColor }}
                        >
                          {detection.class_name} {(detection.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <HugeiconsIcon icon={ImageIcon} strokeWidth={2} className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No image selected</p>
                    <p className="text-sm">Upload or enter a URL to start</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Card */}
          {lastDetectionResult && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <HugeiconsIcon icon={Target01Icon} strokeWidth={2} className="w-5 h-5 text-primary" />
                    Detection Results
                  </CardTitle>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={copyResults}>
                            <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy JSON</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">{lastDetectionResult.total_detections}</p>
                    <p className="text-xs text-muted-foreground">Detections</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">{lastDetectionResult.primary_class ? getDamageClassIcon(lastDetectionResult.primary_class) : "—"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{lastDetectionResult.primary_class || "None"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">{formatProcessingTime(lastDetectionResult.processing_time_ms)}</p>
                    <p className="text-xs text-muted-foreground">Processing</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">{lastDetectionResult.image_size.width}×{lastDetectionResult.image_size.height}</p>
                    <p className="text-xs text-muted-foreground">Image Size</p>
                  </div>
                </div>

                <Separator />

                {/* Detections Table */}
                {lastDetectionResult.detections.length > 0 ? (
                  <ScrollArea className="h-64">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Confidence</TableHead>
                          <TableHead>Location</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lastDetectionResult.detections.map((detection, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{idx + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span>{getDamageClassIcon(detection.class_name)}</span>
                                <span className="capitalize">{detection.class_name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={detection.confidence * 100} className="w-16 h-2" />
                                <span className={`text-sm ${getConfidenceColor(detection.confidence)}`}>
                                  {(detection.confidence * 100).toFixed(1)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {detection.bounding_box ? (
                                <div>
                                  <div>{`${Math.round(detection.bounding_box.x1)}, ${Math.round(detection.bounding_box.y1)}`}</div>
                                  <div className="text-xs text-muted-foreground">{`${Math.round(detection.bounding_box.width)}×${Math.round(detection.bounding_box.height)} px`}</div>
                                  <div className="text-xs text-muted-foreground">{`${((detection.bounding_box.width * detection.bounding_box.height) / (lastDetectionResult.image_size.width * lastDetectionResult.image_size.height) * 100).toFixed(1)}% area`}</div>
                                </div>
                              ) : (
                                "N/A"
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p className="font-medium">No damage detected</p>
                    <p className="text-sm">The road appears to be in good condition</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Model: {lastDetectionResult.model_used} • Analyzed at {new Date(lastDetectionResult.timestamp).toLocaleString()}
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
