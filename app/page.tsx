"use client";

import { useEffect } from "react";
import { Header } from "@/components/header";
import { Dashboard } from "@/components/dashboard";
import { Detection } from "@/components/detection";
import { Classification } from "@/components/classification";
import { Compare } from "@/components/compare";
import { Settings } from "@/components/settings";
import { useSentryStore } from "@/lib/store";

export default function Page() {
  const { activeTab, fetchHealth, fetchModels, fetchClasses } = useSentryStore();

  // Fetch initial data on mount
  useEffect(() => {
    fetchHealth();
    fetchModels();
    fetchClasses();
  }, [fetchHealth, fetchModels, fetchClasses]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
      case "home":
        return <Dashboard />;
      case "detect":
        return <Detection />;
      case "classify":
        return <Classification />;
      case "compare":
        return <Compare />;
      case "settings":
        return <Settings />;
      default:
        return <Detection />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {renderContent()}
      </main>
      
      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Sentry</span>
              <span>•</span>
              <span>Road Damage Detection System</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Final Year Project</span>
              <span>•</span>
              <span>Built with Next.js & FastAPI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}