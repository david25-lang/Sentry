"use client";

import * as React from "react";
import { useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Shield01Icon,
  Home01Icon,
  Camera01Icon,
  AiBrain01Icon,
  GitCompareIcon,
  Settings01Icon,
  Menu01Icon,
  RefreshIcon,
  CheckmarkCircle01Icon,
  CancelCircleIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useSentryStore } from "@/lib/store";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navItems: NavItem[] = [
  {
    id: "home",
    label: "Dashboard",
    icon: () => <HugeiconsIcon icon={Home01Icon} strokeWidth={2} />,
    description: "Overview and quick actions",
  },
  {
    id: "detect",
    label: "Detection",
    icon: () => <HugeiconsIcon icon={Camera01Icon} strokeWidth={2} />,
    description: "YOLO object detection",
  },
  {
    id: "classify",
    label: "CNN",
    icon: () => <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={2} />,
    description: "CNN image classification",
  },
  {
    id: "compare",
    label: "Compare",
    icon: () => <HugeiconsIcon icon={GitCompareIcon} strokeWidth={2} />,
    description: "YOLO vs CNN benchmark comparison",
  },
  {
    id: "settings",
    label: "Settings",
    icon: () => <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />,
    description: "Configure analysis settings",
  },
];

export function Header() {
  const { 
    activeTab, 
    setActiveTab, 
    health, 
    fetchHealth,
    isLoading 
  } = useSentryStore();

  useEffect(() => {
    fetchHealth();
    // Refresh health every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const isConnected = health?.status === "healthy";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
            <HugeiconsIcon icon={Shield01Icon} strokeWidth={2} className="w-6 h-6" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold tracking-tight">Sentry</h1>
            <p className="text-xs text-muted-foreground">Road Damage Detection</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <TooltipProvider>
            {navItems.map((item) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeTab === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(item.id)}
                    className="gap-2"
                  >
                    <item.icon />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>

        {/* Status & Actions */}
        <div className="flex items-center gap-3">
          {/* API Status Badge */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant={isConnected ? "default" : "destructive"}
                  className="gap-1.5 cursor-pointer"
                  onClick={() => fetchHealth()}
                >
                  <HugeiconsIcon 
                    icon={isConnected ? CheckmarkCircle01Icon : CancelCircleIcon} 
                    strokeWidth={2}
                    className="w-3.5 h-3.5" 
                  />
                  <span className="hidden sm:inline">
                    {isLoading ? "Checking..." : isConnected ? "Connected" : "Disconnected"}
                  </span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-medium">API Status</p>
                  {health ? (
                    <>
                      <p className="text-xs">Version: {health.version}</p>
                      <p className="text-xs">Device: {health.device}</p>
                      <p className="text-xs">Model: {health.model_loaded ? "✅ Loaded" : "❌ Not loaded"}</p>
                      <p className="text-xs">Classes: {health.model_classes.join(", ")}</p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Click to refresh</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Refresh Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => fetchHealth()}
                  disabled={isLoading}
                >
                  <HugeiconsIcon 
                    icon={RefreshIcon} 
                    strokeWidth={2}
                    className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} 
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh connection</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={Shield01Icon} strokeWidth={2} className="w-5 h-5 text-primary" />
                  Sentry Navigation
                </SheetTitle>
              </SheetHeader>
              <Separator className="my-4" />
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className="justify-start gap-3"
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon />
                    <div className="text-left">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </Button>
                ))}
              </nav>
              <Separator className="my-4" />
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">API Info</span>
                </div>
                {health ? (
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p>Status: {health.status}</p>
                    <p>Version: {health.version}</p>
                    <p>Model: {health.model_loaded ? "Loaded" : "Not loaded"}</p>
                    <p>Device: {health.device}</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Not connected</p>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
