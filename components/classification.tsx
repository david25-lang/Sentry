"use client";

import * as React from "react";
import { useState, useRef, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiBrain01Icon,
  Upload01Icon,
  LinkIcon,
  ImageIcon,
  ZapIcon,
  TimeScheduleIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Delete01Icon,
  Copy01Icon,
  RefreshIcon,
  Maximize01Icon,
  InformationCircleIcon,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useSentryStore } from "@/lib/store";
import { formatProcessingTime, getDamageClassIcon, getConfidenceColor } from "@/lib/api";

export function Classification() {
  const {
    isLoading,
    error,
    lastClassificationResult,
    currentImageUrl,
    classifyFromURL,
    classifyFromFile,
    clearResults,
  } = useSentryStore();

  const [urlInput, setUrlInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [inputMode, setInputMode] = useState<"url" | "upload">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      await classifyFromURL(urlInput.trim());
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await classifyFromFile(file);
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
      await classifyFromFile(e.dataTransfer.files[0]);
    }
  }, [classifyFromFile]);

  const copyResults = () => {
    if (lastClassificationResult) {
      navigator.clipboard.writeText(JSON.stringify(lastClassificationResult, null, 2));
    }
  };

  const result = lastClassificationResult;
  const primaryDetection = result?.detections[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={2} className="w-5 h-5 text-purple-500" />
            </div>
            CNN Classification
          </h1>
          <p className="text-muted-foreground mt-1">
            Deep learning image classification • 78.30% accuracy • ~5ms inference
          </p>
        </div>
        <div className="flex gap-2">
          {lastClassificationResult && (
            <Button variant="outline" onClick={clearResults} className="gap-2">
              <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} className="w-4 h-4" />
              New Classification
            </Button>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <Alert>
        <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="h-4 w-4" />
        <AlertTitle>About CNN Classification</AlertTitle>
        <AlertDescription>
          CNN classification analyzes the entire image and assigns a single damage class. 
          Unlike YOLO detection, it doesn&apos;t provide bounding boxes but is faster (~5ms vs ~27ms).
        </AlertDescription>
      </Alert>

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
              <CardDescription>Upload an image or enter a URL to classify</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "url" | "upload")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="gap-2">
                    <HugeiconsIcon icon={Upload01Icon} strokeWidth={2} className="w-4 h-4" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="url" className="gap-2">
                    <HugeiconsIcon icon={LinkIcon} strokeWidth={2} className="w-4 h-4" />
                    URL
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-4">
                  <div
                    className={`
                      border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                      ${dragActive ? "border-purple-500 bg-purple-500/5" : "border-muted-foreground/25 hover:border-purple-500/50"}
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
                    <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                      <HugeiconsIcon 
                        icon={AiBrain01Icon} 
                        strokeWidth={2} 
                        className="w-8 h-8 text-purple-500" 
                      />
                    </div>
                    <p className="text-lg font-medium mb-1">
                      {dragActive ? "Drop image here" : "Drag & drop an image"}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse • JPEG, PNG, WebP supported
                    </p>
                    <Button variant="outline" disabled={isLoading} className="gap-2">
                      <HugeiconsIcon icon={Upload01Icon} strokeWidth={2} className="w-4 h-4" />
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
                        <Button type="submit" disabled={isLoading || !urlInput.trim()} className="bg-purple-500 hover:bg-purple-600">
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
              </Tabs>
            </CardContent>
          </Card>

          {/* Model Info Card */}
          <Card className="border-purple-500/20 bg-purple-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={2} className="w-4 h-4 text-purple-500" />
                ResNet18 CNN Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Architecture</p>
                  <p className="font-medium">ResNet18</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Input Size</p>
                  <p className="font-medium">224×224</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Accuracy</p>
                  <p className="font-medium text-purple-500">78.30%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Inference</p>
                  <p className="font-medium">~5ms</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CNN vs YOLO comparison */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">CNN vs YOLO</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Speed</span>
                  <Badge variant="default" className="bg-purple-500">CNN wins (5x faster)</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Accuracy</span>
                  <Badge variant="secondary">YOLO wins (81.19% vs 78.30%)</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Localization</span>
                  <Badge variant="secondary">YOLO only</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Image Preview Card */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Image Preview</span>
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
                        <img 
                          src={currentImageUrl} 
                          alt="Classification preview" 
                          className="w-full rounded-lg"
                        />
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
                <img 
                  src={currentImageUrl} 
                  alt="Road image" 
                  className="w-full rounded-lg"
                />
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

          {/* Classification Result Card */}
          {result && (
            <Card className="border-purple-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={2} className="w-5 h-5 text-purple-500" />
                    Classification Result
                  </CardTitle>
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
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Main Result */}
                {primaryDetection ? (
                  <div className="text-center py-6">
                    <div className="text-6xl mb-4">
                      {getDamageClassIcon(primaryDetection.class_name)}
                    </div>
                    <h2 className="text-2xl font-bold capitalize mb-2">
                      {primaryDetection.class_name.replace("_", " ")}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {primaryDetection.class_name === "pothole" && "A hole or depression in the road surface"}
                      {primaryDetection.class_name === "crack" && "Linear fractures or breaks in the pavement"}
                      {primaryDetection.class_name === "manhole" && "Utility access cover detected in the roadway"}
                    </p>
                    
                    {/* Confidence Meter */}
                    <div className="max-w-xs mx-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Confidence</span>
                        <span className={`font-bold ${getConfidenceColor(primaryDetection.confidence)}`}>
                          {(primaryDetection.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={primaryDetection.confidence * 100} 
                        className="h-3"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="w-16 h-16 mx-auto mb-4 text-green-500" />
                    <h2 className="text-2xl font-bold mb-2">No Damage Detected</h2>
                    <p className="text-muted-foreground">The road appears to be in good condition</p>
                  </div>
                )}

                <Separator />

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{result.model_used}</p>
                    <p className="text-xs text-muted-foreground">Model</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{formatProcessingTime(result.processing_time_ms)}</p>
                    <p className="text-xs text-muted-foreground">Processing</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{result.image_size.width}×{result.image_size.height}</p>
                    <p className="text-xs text-muted-foreground">Size</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Analyzed at {new Date(result.timestamp).toLocaleString()}
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
