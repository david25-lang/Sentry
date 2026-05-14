"use client";

import * as React from "react";
import { useState, useRef, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GitCompareIcon,
  Upload01Icon,
  LinkIcon,
  ImageIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Award02Icon,
  RefreshIcon,
  Copy01Icon,
  Maximize01Icon,
  Target01Icon,
  AiBrain01Icon,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSentryStore } from "@/lib/store";
import { formatProcessingTime, getDamageClassIcon, getDamageClassColor } from "@/lib/api";

export function Compare() {
  const {
    isLoading,
    error,
    lastComparisonResult,
    currentImageUrl,
    compareModels,
    compareModelsFromFile,
    clearResults,
  } = useSentryStore();

  const [urlInput, setUrlInput] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [inputMode, setInputMode] = useState<"url" | "upload">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      await compareModels(urlInput.trim());
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await compareModelsFromFile(file);
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
      await compareModelsFromFile(e.dataTransfer.files[0]);
    }
  }, [compareModelsFromFile]);

  const copyResults = () => {
    if (lastComparisonResult) {
      navigator.clipboard.writeText(JSON.stringify(lastComparisonResult, null, 2));
    }
  };

  const result = lastComparisonResult;
  const yoloResult = result?.yolo_result;
  const cnnResult = result?.cnn_result;

  const getModelAccuracy = (model: "yolo" | "cnn") => {
    return result?.benchmarks.find((b) => b.model === model)?.accuracy;
  };

  const yoloAccuracy = getModelAccuracy("yolo") ?? 0.8119;
  const cnnAccuracy = getModelAccuracy("cnn") ?? 0.7830;

  const getSpeedWinner = () => {
    if (!yoloResult || !cnnResult) return "tie";
    if (yoloResult.processing_time_ms < cnnResult.processing_time_ms) return "yolo";
    if (cnnResult.processing_time_ms < yoloResult.processing_time_ms) return "cnn";
    return "tie";
  };

  const getTotalProcessingTime = () => {
    return (yoloResult?.processing_time_ms || 0) + (cnnResult?.processing_time_ms || 0);
  };

  const getTimestamp = () => {
    return yoloResult?.timestamp || cnnResult?.timestamp || new Date().toISOString();
  };

  const getWinnerBadge = (winner: string) => {
    if (winner === "yolo") {
      return <Badge className="bg-blue-500 hover:bg-blue-600">YOLO Wins</Badge>;
    } else if (winner === "cnn") {
      return <Badge className="bg-purple-500 hover:bg-purple-600">CNN Wins</Badge>;
    }
    return <Badge variant="secondary">Tie</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
              <HugeiconsIcon icon={GitCompareIcon} strokeWidth={2} className="w-5 h-5 text-blue-500" />
            </div>
            Model Comparison
          </h1>
          <p className="text-muted-foreground mt-1">
            Compare YOLO and CNN performance side by side on the same image
          </p>
        </div>
        <div className="flex gap-2">
          {lastComparisonResult && (
            <Button variant="outline" onClick={clearResults} className="gap-2">
              <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} className="w-4 h-4" />
              New Comparison
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

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Compare Models</CardTitle>
          <CardDescription>Run both YOLO and CNN on the same image to compare results</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "url" | "upload") }>
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
                    <div className="relative flex-1">
                      <HugeiconsIcon
                        icon={LinkIcon}
                        strokeWidth={2}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
                      />
                      <Input
                        id="image-url"
                        type="url"
                        placeholder="https://example.com/road-image.jpg"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        disabled={isLoading}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || !urlInput.trim()}
                      className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      {isLoading ? (
                        <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} className="w-4 h-4 animate-spin" />
                      ) : (
                        <HugeiconsIcon icon={GitCompareIcon} strokeWidth={2} className="w-4 h-4" />
                      )}
                      Compare
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Both models will analyze the image and results will be compared automatically
                  </p>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="w-full aspect-video rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="w-full aspect-video rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <>
          {/* Image Preview */}
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Analyzed Image</CardTitle>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <HugeiconsIcon icon={Maximize01Icon} strokeWidth={2} className="w-4 h-4" />
                        Full Size
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Full Image</DialogTitle>
                      </DialogHeader>
                      <img 
                        src={currentImageUrl || ""} 
                        alt="Comparison preview" 
                        className="w-full rounded-lg"
                      />
                    </DialogContent>
                  </Dialog>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" onClick={copyResults} className="gap-2">
                          <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} className="w-4 h-4" />
                          Copy JSON
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy full results</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-w-xl mx-auto">
                <img 
                  src={currentImageUrl || ""} 
                  alt="Road image" 
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="border-2 border-gradient-to-r from-blue-500/20 to-purple-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={Award02Icon} strokeWidth={2} className="w-5 h-5 text-yellow-500" />
                Comparison Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-background shadow-sm">
                  <p className="text-sm text-muted-foreground mb-1">Accuracy Winner</p>
                  {getWinnerBadge(result?.accuracy_winner || "tie")}
                </div>
                <div className="text-center p-4 rounded-lg bg-background shadow-sm">
                  <p className="text-sm text-muted-foreground mb-1">Speed Winner</p>
                  {getWinnerBadge(getSpeedWinner())}
                </div>
                <div className="text-center p-4 rounded-lg bg-background shadow-sm">
                  <p className="text-sm text-muted-foreground mb-1">Detections Match</p>
                  <Badge variant={result?.agreement ? "default" : "secondary"}>
                    {result?.agreement ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="text-center p-4 rounded-lg bg-background shadow-sm">
                  <p className="text-sm text-muted-foreground mb-1">Total Time</p>
                  <Badge variant="outline">
                    {formatProcessingTime(getTotalProcessingTime())}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Side by Side Results */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* YOLO Result */}
            <Card className="border-blue-500/30">
              <CardHeader className="bg-blue-500/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <HugeiconsIcon icon={Target01Icon} strokeWidth={2} className="w-5 h-5 text-blue-500" />
                    YOLO Detection
                  </CardTitle>
                  <Badge variant="outline" className="border-blue-500/50 text-blue-500">
                    {(yoloAccuracy * 100).toFixed(2)}% accuracy
                  </Badge>
                </div>
                <CardDescription>Object detection with localization</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-blue-500">{yoloResult?.detections.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Detections</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">
                      {yoloResult?.detections[0] 
                        ? `${(yoloResult.detections[0].confidence * 100).toFixed(0)}%`
                        : "-"
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">Top Confidence</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{formatProcessingTime(yoloResult?.processing_time_ms || 0)}</p>
                    <p className="text-xs text-muted-foreground">Time</p>
                  </div>
                </div>

                <Separator />

                {/* Detections List */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Detections</h4>
                  {yoloResult && yoloResult.detections.length > 0 ? (
                    <div className="space-y-2">
                      {yoloResult.detections.map((detection, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-muted"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getDamageClassIcon(detection.class_name)}</span>
                            <div>
                              <p className="font-medium capitalize">{detection.class_name.replace("_", " ")}</p>
                              <p className="text-xs text-muted-foreground">
                                Bounding box: {detection.bounding_box ? 
                                  `${Math.round(detection.bounding_box.x1)},${Math.round(detection.bounding_box.y1)} - ${Math.round(detection.bounding_box.x2)},${Math.round(detection.bounding_box.y2)}`
                                  : "N/A"
                                }
                              </p>
                            </div>
                          </div>
                          <Badge className={getDamageClassColor(detection.class_name)}>
                            {(detection.confidence * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p>No damage detected</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CNN Result */}
            <Card className="border-purple-500/30">
              <CardHeader className="bg-purple-500/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={2} className="w-5 h-5 text-purple-500" />
                    CNN Classification
                  </CardTitle>
                  <Badge variant="outline" className="border-purple-500/50 text-purple-500">
                    {(cnnAccuracy * 100).toFixed(2)}% accuracy
                  </Badge>
                </div>
                <CardDescription>Whole-image classification</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold text-purple-500">{cnnResult?.detections.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Classifications</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">
                      {cnnResult?.detections[0] 
                        ? `${(cnnResult.detections[0].confidence * 100).toFixed(0)}%`
                        : "-"
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-bold">{formatProcessingTime(cnnResult?.processing_time_ms || 0)}</p>
                    <p className="text-xs text-muted-foreground">Time</p>
                  </div>
                </div>

                <Separator />

                {/* Classification Result */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Classification</h4>
                  {cnnResult && cnnResult.detections.length > 0 ? (
                    <div className="space-y-2">
                      {cnnResult.detections.map((detection, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-muted"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getDamageClassIcon(detection.class_name)}</span>
                            <div>
                              <p className="font-medium capitalize">{detection.class_name.replace("_", " ")}</p>
                              <p className="text-xs text-muted-foreground">Whole-image classification</p>
                            </div>
                          </div>
                          <Badge className={getDamageClassColor(detection.class_name)}>
                            {(detection.confidence * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p>No damage detected</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Metrics</CardTitle>
              <CardDescription>Side-by-side comparison of model performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-center">YOLO</TableHead>
                    <TableHead className="text-center">CNN</TableHead>
                    <TableHead className="text-center">Difference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Processing Time</TableCell>
                    <TableCell className="text-center">{formatProcessingTime(yoloResult?.processing_time_ms || 0)}</TableCell>
                    <TableCell className="text-center">{formatProcessingTime(cnnResult?.processing_time_ms || 0)}</TableCell>
                    <TableCell className="text-center">
                      {yoloResult && cnnResult && (
                        <Badge variant={yoloResult.processing_time_ms > cnnResult.processing_time_ms ? "secondary" : "default"}>
                          {Math.abs(yoloResult.processing_time_ms - cnnResult.processing_time_ms).toFixed(1)}ms
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Detection Count</TableCell>
                    <TableCell className="text-center">{yoloResult?.detections.length || 0}</TableCell>
                    <TableCell className="text-center">{cnnResult?.detections.length || 0}</TableCell>
                    <TableCell className="text-center">
                      {yoloResult && cnnResult && (
                        <Badge variant="outline">
                          {Math.abs((yoloResult.detections.length || 0) - (cnnResult.detections.length || 0))}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Top Confidence</TableCell>
                    <TableCell className="text-center">
                      {yoloResult?.detections[0]?.confidence 
                        ? `${(yoloResult.detections[0].confidence * 100).toFixed(1)}%`
                        : "-"
                      }
                    </TableCell>
                    <TableCell className="text-center">
                      {cnnResult?.detections[0]?.confidence 
                        ? `${(cnnResult.detections[0].confidence * 100).toFixed(1)}%`
                        : "-"
                      }
                    </TableCell>
                    <TableCell className="text-center">
                      {yoloResult?.detections[0] && cnnResult?.detections[0] && (
                        <Badge variant="outline">
                          {Math.abs(
                            (yoloResult.detections[0].confidence - cnnResult.detections[0].confidence) * 100
                          ).toFixed(1)}%
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Primary Class</TableCell>
                    <TableCell className="text-center capitalize">
                      {yoloResult?.detections[0]?.class_name?.replace("_", " ") || "-"}
                    </TableCell>
                    <TableCell className="text-center capitalize">
                      {cnnResult?.detections[0]?.class_name?.replace("_", " ") || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={result?.agreement ? "default" : "secondary"}>
                        {result?.agreement ? "Match" : "Mismatch"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Localization</TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-blue-500">Yes</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">No</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">YOLO only</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Comparison completed at {new Date(getTimestamp()).toLocaleString()} • 
              Total processing time: {formatProcessingTime(getTotalProcessingTime())}
            </CardFooter>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!result && !isLoading && (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-4">
                <HugeiconsIcon icon={GitCompareIcon} strokeWidth={2} className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ready to Compare</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Enter an image URL above to run both YOLO and CNN models simultaneously 
                and see a detailed side-by-side comparison of their results.
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>YOLO: {(yoloAccuracy * 100).toFixed(2)}% accuracy</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>CNN: {(cnnAccuracy * 100).toFixed(2)}% accuracy</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
