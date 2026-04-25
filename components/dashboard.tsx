"use client";

import * as React from "react";
import { useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Camera01Icon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  TimeScheduleIcon,
  ArrowRight01Icon,
  SparklesIcon,
  Target01Icon,
  Rocket01Icon,
  ZapIcon,
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useSentryStore } from "@/lib/store";
import { formatProcessingTime, getDamageClassIcon } from "@/lib/api";

const features = [
  {
    icon: Camera01Icon,
    title: "YOLOv8 Detection",
    description: "Real-time object detection with bounding boxes for potholes and cracks",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
];

const damageClasses = [
  {
    id: 0,
    name: "Pothole",
    icon: "🕳️",
    description: "Holes or depressions in road surface",
    color: "bg-red-500",
    severity: "High",
  },
  {
    id: 1,
    name: "Crack",
    icon: "⚡",
    description: "Linear fractures in pavement",
    color: "bg-orange-500",
    severity: "Medium",
  },
];

export function Dashboard() {
  const {
    health,
    models,
    classes,
    detectionHistory,
    setActiveTab,
    fetchModels,
    fetchClasses,
  } = useSentryStore();

  useEffect(() => {
    fetchModels();
    fetchClasses();
  }, [fetchModels, fetchClasses]);

  const totalDetections = detectionHistory.length;
  const successfulDetections = detectionHistory.filter(d => d.success).length;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-8 md:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 max-w-3xl">
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="w-3.5 h-3.5" />
            AI-Powered Detection
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Road Damage Detection
            <span className="text-primary"> System</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
            Leverage our YOLOv8 deep learning model to automatically detect and 
            classify road damage — including potholes and cracks — with precise bounding boxes.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button size="lg" onClick={() => setActiveTab("detect")} className="gap-2">
              <HugeiconsIcon icon={Camera01Icon} strokeWidth={2} />
              Start Detection
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Status</CardTitle>
            <HugeiconsIcon 
              icon={health?.status === "healthy" ? CheckmarkCircle01Icon : AlertCircleIcon} 
              strokeWidth={2}
              className={`w-4 h-4 ${health?.status === "healthy" ? "text-green-500" : "text-red-500"}`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {health?.status || "Unknown"}
            </div>
            <p className="text-xs text-muted-foreground">
              Version {health?.version || "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Status</CardTitle>
            <HugeiconsIcon icon={Camera01Icon} strokeWidth={2} className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {health?.model_loaded ? "Active" : "Offline"}
            </div>
            <div className="flex gap-2 mt-1">
              <Badge variant={health?.model_loaded ? "default" : "outline"} className="text-xs">
                YOLOv8
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
            <HugeiconsIcon icon={Target01Icon} strokeWidth={2} className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDetections}</div>
            <p className="text-xs text-muted-foreground">
              {successfulDetections} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Device</CardTitle>
            <HugeiconsIcon icon={TimeScheduleIcon} strokeWidth={2} className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold uppercase">
              {health?.device || "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              Inference device
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features Carousel */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Detection Models</h2>
            <p className="text-muted-foreground">Choose the right model for your needs</p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-1 max-w-lg">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
              onClick={() => setActiveTab("detect")}
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <HugeiconsIcon icon={feature.icon} strokeWidth={2} className={`w-6 h-6 ${feature.color}`} />
                </div>
                <CardTitle className="flex items-center justify-between">
                  {feature.title}
                </CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="ghost" className="gap-2 group-hover:text-primary">
                  Try now
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Damage Classes */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Damage Classes</h2>
            <p className="text-muted-foreground">Types of road damage we can detect</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {damageClasses.map((damage) => (
            <Card key={damage.id} className="overflow-hidden">
              <div className={`h-2 ${damage.color}`} />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{damage.icon}</span>
                  <div>
                    <CardTitle>{damage.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">{damage.severity}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{damage.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent History */}
      {detectionHistory.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Recent Analyses</h2>
              <p className="text-muted-foreground">Your latest detection results</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveTab("detect")}>
              New Detection
            </Button>
          </div>

          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {detectionHistory.slice(0, 10).map((result, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.model_used}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatProcessingTime(result.processing_time_ms)}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {result.primary_class ? getDamageClassIcon(result.primary_class) : "❓"}
                        </span>
                        <div>
                          <p className="font-medium capitalize">
                            {result.primary_class || "No damage"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {result.total_detections} detection{result.total_detections !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      {result.detections[0] && (
                        <Progress 
                          value={result.detections[0].confidence * 100} 
                          className="h-2"
                        />
                      )}
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <HugeiconsIcon icon={Rocket01Icon} strokeWidth={2} className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Ready to analyze your roads?</h3>
                <p className="text-muted-foreground">Upload an image or enter a URL to get started</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setActiveTab("detect")} className="gap-2">
                <HugeiconsIcon icon={ZapIcon} strokeWidth={2} />
                Quick Detect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
