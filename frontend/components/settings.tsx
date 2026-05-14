"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Settings01Icon,
  RefreshIcon,
  CheckmarkCircle01Icon,
  InformationCircleIcon,
  Target01Icon,
  PaintBrushIcon,
  DatabaseIcon,
  Delete01Icon,
  Download01Icon,
  Upload01Icon,
  SecurityCheckIcon,
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { API_BASE_URL } from "@/lib/api";
import { useSentryStore } from "@/lib/store";

export function Settings() {
  const {
    settings,
    updateSettings,
    detectionHistory,
    clearHistory,
    health,
    fetchHealth,
    fetchModels,
  } = useSentryStore();

  const [clearDialogOpen, setClearDialogOpen] = React.useState(false);

  const handleThemeChange = (value: string) => {
    updateSettings({ theme: value as "light" | "dark" | "system" });
    // Apply theme to document
    if (value === "dark") {
      document.documentElement.classList.add("dark");
    } else if (value === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // System preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    setClearDialogOpen(false);
  };

  const exportSettings = () => {
    const data = {
      settings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sentry-settings-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportHistory = () => {
    const data = {
      history: detectionHistory,
      exportedAt: new Date().toISOString(),
      totalItems: detectionHistory.length,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sentry-history-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} className="w-5 h-5" />
            </div>
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure detection parameters and application preferences
          </p>
        </div>
        <Button onClick={() => { fetchHealth(); fetchModels(); }} variant="outline" className="gap-2">
          <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} className="w-4 h-4" />
          Refresh Status
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Detection Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Target01Icon} strokeWidth={2} className="w-5 h-5 text-blue-500" />
              Detection Settings
            </CardTitle>
            <CardDescription>Configure how the Assistant analyzes road images</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Confidence Threshold */}
            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">Confidence Threshold</Label>
                <Badge variant="secondary">Auto</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                YOLO now chooses threshold automatically for each image and reports per-detection confidence so you can see how sure it is.
              </p>
            </div>

            <Separator />

            {/* Auto Save */}
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save" className="flex flex-col gap-1">
                <span>Auto-save Results</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Automatically save detection results to history
                </span>
              </Label>
              <Switch
                id="auto-save"
                checked={settings.autoSaveResults}
                onCheckedChange={(checked) => updateSettings({ autoSaveResults: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="flex flex-col gap-1">
                <span>Enable Notifications</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Show desktop notifications for completed analyses
                </span>
              </Label>
              <Switch
                id="notifications"
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => updateSettings({ enableNotifications: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={PaintBrushIcon} strokeWidth={2} className="w-5 h-5 text-pink-500" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Selection */}
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={settings.theme} onValueChange={handleThemeChange}>
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Color Preview */}
            <div className="space-y-3">
              <Label>Damage Class Colors</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <div className="w-4 h-4 rounded-full bg-red-500" />
                  <span className="text-sm">Pothole</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <div className="w-4 h-4 rounded-full bg-orange-500" />
                  <span className="text-sm">Crack</span>
                </div>
                
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={DatabaseIcon} strokeWidth={2} className="w-5 h-5 text-green-500" />
              Data Management
            </CardTitle>
            <CardDescription>Manage your detection history and export data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* History Stats */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Detection History</p>
                <p className="text-sm text-muted-foreground">
                  {detectionHistory.length} saved {detectionHistory.length === 1 ? "result" : "results"}
                </p>
              </div>
              <Badge variant="outline">{detectionHistory.length}</Badge>
            </div>

            <div className="grid gap-2">
              <Button variant="outline" onClick={exportHistory} className="gap-2 justify-start">
                <HugeiconsIcon icon={Download01Icon} strokeWidth={2} className="w-4 h-4" />
                Export History (JSON)
              </Button>
              <Button variant="outline" onClick={exportSettings} className="gap-2 justify-start">
                <HugeiconsIcon icon={Upload01Icon} strokeWidth={2} className="w-4 h-4" />
                Export Settings (JSON)
              </Button>
              <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="gap-2 justify-start text-destructive hover:text-destructive"
                    disabled={detectionHistory.length === 0}
                  >
                    <HugeiconsIcon icon={Delete01Icon} strokeWidth={2} className="w-4 h-4" />
                    Clear History
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Clear Detection History?</DialogTitle>
                    <DialogDescription>
                      This will permanently delete all {detectionHistory.length} saved detection results.
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleClearHistory}>
                      Clear All
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* API Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={SecurityCheckIcon} strokeWidth={2} className="w-5 h-5 text-emerald-500" />
              API Status
            </CardTitle>
            <CardDescription>Connection status and model information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${health?.status === "healthy" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                <div>
                  <p className="font-medium">API Connection</p>
                  <p className="text-sm text-muted-foreground">{API_BASE_URL}</p>
                </div>
              </div>
              <Badge variant={health?.status === "healthy" ? "default" : "destructive"}>
                {health?.status || "Unknown"}
              </Badge>
            </div>

            {/* Models Status */}
            {health && (
              <div className="space-y-2">
                <Label>Model</Label>
                <div className="grid grid-cols-1 gap-3">
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${health.model_loaded ? "bg-blue-500/10" : "bg-muted"}`}>
                    <HugeiconsIcon 
                      icon={health.model_loaded ? CheckmarkCircle01Icon : InformationCircleIcon} 
                      strokeWidth={2} 
                      className={`w-4 h-4 ${health.model_loaded ? "text-blue-500" : "text-muted-foreground"}`} 
                    />
                    <span className="text-sm">YOLOv8 — {health.model_classes.join(", ")}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Device */}
            {health && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Device</span>
                <span className="font-medium uppercase">{health.device}</span>
              </div>
            )}

            {health && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">API Version</span>
                <span className="font-medium">{health.version}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>About Sentry</CardTitle>
          <CardDescription>Road Damage Detection System</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sentry is an AI-powered road damage detection system that uses YOLOv8 computer vision 
            to identify and classify road surface damage including potholes and cracks.
            Built with a YOLOv8 model trained on a custom road damage dataset.
          </p>
          
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-blue-500">YOLOv8</p>
              <p className="text-sm text-muted-foreground">Object Detection</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-green-500">2</p>
              <p className="text-sm text-muted-foreground">Damage Classes</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-orange-500">FastAPI</p>
              <p className="text-sm text-muted-foreground">Backend</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Final Year Project • Built with Next.js, FastAPI, PyTorch, and Ultralytics
        </CardFooter>
      </Card>
    </div>
  );
}
